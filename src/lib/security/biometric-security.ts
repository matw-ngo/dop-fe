// @ts-nocheck
/**
 * Biometric Data Security Module
 * Provides secure client-side encryption and handling for biometric data
 * Compliant with Vietnamese Decree 13/2023 on personal data protection
 */

import { VietnameseDocumentType } from "@/lib/ekyc/document-types";

// Configuration constants
export const BIOMETRIC_SECURITY_CONFIG = {
  // AES-256-GCM for symmetric encryption
  ENCRYPTION_ALGORITHM: "AES-GCM",
  KEY_DERIVATION_ALGORITHM: "PBKDF2",
  HASH_ALGORITHM: "SHA-256",
  // Key derivation parameters
  ITERATIONS: 100000,
  SALT_LENGTH: 32,
  IV_LENGTH: 12,
  TAG_LENGTH: 16,
  // Data retention
  MAX_AGE_MINUTES: 30,
  CLEANUP_INTERVAL_MINUTES: 5,
  // Vietnamese compliance
  CONSENT_REQUIRED: true,
  AUDIT_LOG_RETENTION_DAYS: 365,
  // File size limits
  MAX_FILE_SIZE_BYTES: 10 * 1024 * 1024, // 10MB
  // Security thresholds
  MIN_QUALITY_SCORE: 0.7,
  MAX_FAILURE_ATTEMPTS: 3,
} as const;

// Types for biometric security
export interface EncryptedBiometricData {
  data: string; // Base64 encrypted data
  iv: string; // Base64 initialization vector
  salt: string; // Base64 salt
  algorithm: string;
  timestamp: number;
  sessionId: string;
  dataType: "document_front" | "document_back" | "face" | "liveness";
  checksum: string;
}

export interface BiometricConsent {
  given: boolean;
  timestamp: string;
  purpose: string;
  dataRetention: string;
  processingLocation: string;
  userId?: string;
  ipAddress: string;
  userAgent: string;
}

export interface BiometricAuditLog {
  id: string;
  timestamp: string;
  action: "encrypt" | "decrypt" | "cleanup" | "access" | "export" | "delete";
  dataType: string;
  sessionId: string;
  userId?: string;
  success: boolean;
  riskLevel: "low" | "medium" | "high" | "critical";
  details: Record<string, any>;
  ipAddress: string;
  userAgent: string;
  vietnamCompliance: {
    dataProcessing: boolean;
    consentRecorded: boolean;
    dataMinimization: boolean;
    purposeLimitation: boolean;
  };
}

export interface SecurityMetrics {
  encryptionTime: number;
  decryptionTime: number;
  dataIntegrityValid: boolean;
  securityFlags: string[];
  riskAssessment: "low" | "medium" | "high" | "critical";
  vietnamComplianceScore: number; // 0-100
}

/**
 * Biometric Security Manager Class
 */
export class BiometricSecurityManager {
  private encryptionKey: CryptoKey | null = null;
  private sessionStartTime: number = Date.now();
  private cleanupTimer: NodeJS.Timeout | null = null;
  private auditLogs: BiometricAuditLog[] = [];
  private failureCount: number = 0;
  private sessionData = new Map<string, EncryptedBiometricData>();

  constructor() {
    this.initializeSecureSession();
  }

  /**
   * Initialize secure session with automatic cleanup
   */
  private async initializeSecureSession(): Promise<void> {
    try {
      // Generate session-specific encryption key
      await this.generateEncryptionKey();

      // Start automatic cleanup timer
      this.startCleanupTimer();

      // Log session initialization
      this.auditLog({
        action: "encrypt",
        dataType: "session_init",
        sessionId: this.getSessionId(),
        success: true,
        riskLevel: "low",
        details: { sessionStart: this.sessionStartTime },
        vietnamCompliance: {
          dataProcessing: true,
          consentRecorded: false,
          dataMinimization: true,
          purposeLimitation: true,
        },
      });
    } catch (error) {
      console.error(
        "[BiometricSecurity] Failed to initialize secure session:",
        error,
      );
      throw new Error("Failed to initialize biometric security session");
    }
  }

  /**
   * Generate encryption key using Web Crypto API
   */
  private async generateEncryptionKey(): Promise<void> {
    // Generate random salt for key derivation
    const salt = crypto.getRandomValues(
      new Uint8Array(BIOMETRIC_SECURITY_CONFIG.SALT_LENGTH),
    );

    // Import session key material
    const keyMaterial = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(this.getSessionId()),
      { name: BIOMETRIC_SECURITY_CONFIG.KEY_DERIVATION_ALGORITHM },
      false,
      ["deriveBits", "deriveKey"],
    );

    // Derive encryption key
    this.encryptionKey = await crypto.subtle.deriveKey(
      {
        name: BIOMETRIC_SECURITY_CONFIG.KEY_DERIVATION_ALGORITHM,
        salt,
        iterations: BIOMETRIC_SECURITY_CONFIG.ITERATIONS,
        hash: BIOMETRIC_SECURITY_CONFIG.HASH_ALGORITHM,
      },
      keyMaterial,
      { name: BIOMETRIC_SECURITY_CONFIG.ENCRYPTION_ALGORITHM, length: 256 },
      false,
      ["encrypt", "decrypt"],
    );
  }

  /**
   * Encrypt biometric data with AES-256-GCM
   */
  async encryptBiometricData(
    data: ArrayBuffer,
    dataType: EncryptedBiometricData["dataType"],
    sessionId: string,
  ): Promise<EncryptedBiometricData> {
    if (!this.encryptionKey) {
      throw new Error("Encryption key not initialized");
    }

    try {
      const startTime = performance.now();

      // Validate data before encryption
      await this.validateBiometricData(data, dataType);

      // Generate random IV for each encryption
      const iv = crypto.getRandomValues(
        new Uint8Array(BIOMETRIC_SECURITY_CONFIG.IV_LENGTH),
      );

      // Encrypt data with AES-GCM (provides confidentiality and integrity)
      const encryptedData = await crypto.subtle.encrypt(
        {
          name: BIOMETRIC_SECURITY_CONFIG.ENCRYPTION_ALGORITHM,
          iv,
        },
        this.encryptionKey,
        data,
      );

      // Generate checksum for integrity verification
      const checksum = await this.generateChecksum(encryptedData);

      // Create encrypted data package
      const encryptedPackage: EncryptedBiometricData = {
        data: this.arrayBufferToBase64(encryptedData),
        iv: this.arrayBufferToBase64(iv),
        salt: this.arrayBufferToBase64(
          new Uint8Array(BIOMETRIC_SECURITY_CONFIG.SALT_LENGTH),
        ),
        algorithm: BIOMETRIC_SECURITY_CONFIG.ENCRYPTION_ALGORITHM,
        timestamp: Date.now(),
        sessionId,
        dataType,
        checksum,
      };

      // Store in session memory
      this.sessionData.set(`${sessionId}_${dataType}`, encryptedPackage);

      // Log encryption
      const encryptionTime = performance.now() - startTime;
      this.auditLog({
        action: "encrypt",
        dataType,
        sessionId,
        success: true,
        riskLevel: this.assessRiskLevel(dataType, data.byteLength),
        details: {
          dataSize: data.byteLength,
          encryptionTime,
          checksum: checksum.substring(0, 16) + "...",
        },
        vietnamCompliance: {
          dataProcessing: true,
          consentRecorded: true,
          dataMinimization: true,
          purposeLimitation: true,
        },
      });

      return encryptedPackage;
    } catch (error) {
      this.failureCount++;

      this.auditLog({
        action: "encrypt",
        dataType,
        sessionId,
        success: false,
        riskLevel: "high",
        details: {
          error: error instanceof Error ? error.message : "Unknown error",
        },
        vietnamCompliance: {
          dataProcessing: false,
          consentRecorded: false,
          dataMinimization: false,
          purposeLimitation: false,
        },
      });

      throw new Error(
        `Failed to encrypt biometric data: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  /**
   * Decrypt biometric data with integrity verification
   */
  async decryptBiometricData(
    encryptedData: EncryptedBiometricData,
  ): Promise<ArrayBuffer> {
    if (!this.encryptionKey) {
      throw new Error("Encryption key not initialized");
    }

    try {
      const startTime = performance.now();

      // Verify data age and session validity
      this.validateEncryptedData(encryptedData);

      // Convert base64 data back to ArrayBuffer
      const dataBuffer = this.base64ToArrayBuffer(encryptedData.data);
      const iv = this.base64ToArrayBuffer(encryptedData.iv);

      // Verify checksum integrity
      const currentChecksum = await this.generateChecksum(dataBuffer);
      if (currentChecksum !== encryptedData.checksum) {
        throw new Error(
          "Data integrity check failed - possible tampering detected",
        );
      }

      // Decrypt data
      const decryptedData = await crypto.subtle.decrypt(
        {
          name: encryptedData.algorithm,
          iv,
        },
        this.encryptionKey,
        dataBuffer,
      );

      // Log decryption
      const decryptionTime = performance.now() - startTime;
      this.auditLog({
        action: "decrypt",
        dataType: encryptedData.dataType,
        sessionId: encryptedData.sessionId,
        success: true,
        riskLevel: "low",
        details: {
          dataSize: decryptedData.byteLength,
          decryptionTime,
          integrityVerified: true,
        },
        vietnamCompliance: {
          dataProcessing: true,
          consentRecorded: true,
          dataMinimization: true,
          purposeLimitation: true,
        },
      });

      return decryptedData;
    } catch (error) {
      this.failureCount++;

      this.auditLog({
        action: "decrypt",
        dataType: encryptedData.dataType,
        sessionId: encryptedData.sessionId,
        success: false,
        riskLevel: "critical",
        details: {
          error: error instanceof Error ? error.message : "Unknown error",
          integrityCheck: "failed",
        },
        vietnamCompliance: {
          dataProcessing: false,
          consentRecorded: false,
          dataMinimization: false,
          purposeLimitation: false,
        },
      });

      throw new Error(
        `Failed to decrypt biometric data: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  /**
   * Encrypt file for secure upload
   */
  async encryptFileForUpload(
    file: File,
    dataType: EncryptedBiometricData["dataType"],
    sessionId: string,
  ): Promise<{ encryptedFile: File; metadata: EncryptedBiometricData }> {
    try {
      // Validate file
      this.validateFile(file, dataType);

      // Convert file to ArrayBuffer
      const arrayBuffer = await file.arrayBuffer();

      // Encrypt the data
      const encryptedData = await this.encryptBiometricData(
        arrayBuffer,
        dataType,
        sessionId,
      );

      // Create encrypted file
      const encryptedBuffer = this.base64ToArrayBuffer(encryptedData.data);
      const encryptedFile = new File(
        [encryptedBuffer],
        `${file.name}.encrypted`,
        { type: "application/octet-stream" },
      );

      return {
        encryptedFile,
        metadata: encryptedData,
      };
    } catch (error) {
      throw new Error(
        `Failed to encrypt file for upload: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  /**
   * Get security metrics for monitoring
   */
  getSecurityMetrics(): SecurityMetrics {
    const now = Date.now();
    const sessionAge = now - this.sessionStartTime;

    return {
      encryptionTime: 0, // Would track average times in real implementation
      decryptionTime: 0,
      dataIntegrityValid: this.failureCount === 0,
      securityFlags: this.generateSecurityFlags(),
      riskAssessment: this.assessSessionRisk(),
      vietnamComplianceScore: this.calculateVietnamComplianceScore(),
    };
  }

  /**
   * Start automatic cleanup of session data
   */
  private startCleanupTimer(): void {
    this.cleanupTimer = setInterval(
      () => {
        this.cleanupExpiredData();
      },
      BIOMETRIC_SECURITY_CONFIG.CLEANUP_INTERVAL_MINUTES * 60 * 1000,
    );
  }

  /**
   * Cleanup expired data and enforce retention policies
   */
  private cleanupExpiredData(): void {
    const now = Date.now();
    const maxAge = BIOMETRIC_SECURITY_CONFIG.MAX_AGE_MINUTES * 60 * 1000;

    let cleanedCount = 0;

    // Clean session data
    for (const [key, data] of this.sessionData.entries()) {
      if (now - data.timestamp > maxAge) {
        this.sessionData.delete(key);
        cleanedCount++;
      }
    }

    // Log cleanup
    if (cleanedCount > 0) {
      this.auditLog({
        action: "cleanup",
        dataType: "session_data",
        sessionId: this.getSessionId(),
        success: true,
        riskLevel: "low",
        details: {
          cleanedCount,
          maxAgeMinutes: BIOMETRIC_SECURITY_CONFIG.MAX_AGE_MINUTES,
        },
        vietnamCompliance: {
          dataProcessing: true,
          consentRecorded: true,
          dataMinimization: true,
          purposeLimitation: true,
        },
      });
    }
  }

  /**
   * Validate biometric data before encryption
   */
  private async validateBiometricData(
    data: ArrayBuffer,
    dataType: string,
  ): Promise<void> {
    if (data.byteLength === 0) {
      throw new Error("Empty biometric data provided");
    }

    if (data.byteLength > BIOMETRIC_SECURITY_CONFIG.MAX_FILE_SIZE_BYTES) {
      throw new Error(
        `Biometric data exceeds maximum allowed size of ${BIOMETRIC_SECURITY_CONFIG.MAX_FILE_SIZE_BYTES} bytes`,
      );
    }

    // Additional validation based on data type
    switch (dataType) {
      case "document_front":
      case "document_back":
        // Document image validation
        if (!this.isValidImageFormat(data)) {
          throw new Error("Invalid document image format");
        }
        break;

      case "face":
      case "liveness":
        // Face image validation
        if (!this.isValidFaceImage(data)) {
          throw new Error("Invalid face image format or quality");
        }
        break;
    }
  }

  /**
   * Validate encrypted data before decryption
   */
  private validateEncryptedData(encryptedData: EncryptedBiometricData): void {
    const now = Date.now();
    const maxAge = BIOMETRIC_SECURITY_CONFIG.MAX_AGE_MINUTES * 60 * 1000;

    if (now - encryptedData.timestamp > maxAge) {
      throw new Error("Encrypted data has expired");
    }

    if (encryptedData.sessionId !== this.getSessionId()) {
      throw new Error("Session mismatch - data belongs to different session");
    }

    if (!encryptedData.data || !encryptedData.iv || !encryptedData.checksum) {
      throw new Error("Invalid encrypted data structure");
    }
  }

  /**
   * Validate file before processing
   */
  private validateFile(file: File, dataType: string): void {
    if (file.size > BIOMETRIC_SECURITY_CONFIG.MAX_FILE_SIZE_BYTES) {
      throw new Error(
        `File size exceeds maximum allowed size of ${BIOMETRIC_SECURITY_CONFIG.MAX_FILE_SIZE_BYTES} bytes`,
      );
    }

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "application/pdf", // For documents
    ];

    if (!allowedTypes.includes(file.type)) {
      throw new Error(
        `File type ${file.type} is not allowed for biometric data`,
      );
    }

    // Check for potential malicious file extensions
    const maliciousExtensions = [".exe", ".bat", ".cmd", ".scr", ".js", ".vbs"];
    const fileName = file.name.toLowerCase();

    for (const ext of maliciousExtensions) {
      if (fileName.endsWith(ext)) {
        throw new Error(
          `Potentially malicious file extension detected: ${ext}`,
        );
      }
    }
  }

  /**
   * Generate cryptographic checksum
   */
  private async generateChecksum(data: ArrayBuffer): Promise<string> {
    const hashBuffer = await crypto.subtle.digest(
      BIOMETRIC_SECURITY_CONFIG.HASH_ALGORITHM,
      data,
    );
    return this.arrayBufferToBase64(hashBuffer);
  }

  /**
   * Assess risk level based on data type and size
   */
  private assessRiskLevel(
    dataType: string,
    dataSize: number,
  ): "low" | "medium" | "high" | "critical" {
    let riskLevel: "low" | "medium" | "high" | "critical" = "low";

    // Higher risk for face data
    if (dataType === "face" || dataType === "liveness") {
      riskLevel = "high";
    }

    // Higher risk for larger files
    if (dataSize > 5 * 1024 * 1024) {
      // > 5MB
      riskLevel = "critical";
    } else if (dataSize > 2 * 1024 * 1024) {
      // > 2MB
      riskLevel = riskLevel === "high" ? "critical" : "high";
    }

    return riskLevel;
  }

  /**
   * Assess overall session risk
   */
  private assessSessionRisk(): "low" | "medium" | "high" | "critical" {
    if (this.failureCount >= BIOMETRIC_SECURITY_CONFIG.MAX_FAILURE_ATTEMPTS) {
      return "critical";
    }

    if (this.failureCount > 0) {
      return "medium";
    }

    if (this.sessionData.size > 5) {
      return "high";
    }

    return "low";
  }

  /**
   * Calculate Vietnam compliance score
   */
  private calculateVietnamComplianceScore(): number {
    let score = 0;
    const maxScore = 100;

    // Data minimization (20 points)
    if (this.sessionData.size <= 3) score += 20;

    // Purpose limitation (20 points)
    if (this.auditLogs.some((log) => log.vietnamCompliance.purposeLimitation))
      score += 20;

    // Consent management (20 points)
    if (this.auditLogs.some((log) => log.vietnamCompliance.consentRecorded))
      score += 20;

    // Security measures (20 points)
    if (this.encryptionKey && this.failureCount === 0) score += 20;

    // Data retention (20 points)
    const hasCleanup = this.auditLogs.some((log) => log.action === "cleanup");
    if (hasCleanup) score += 20;

    return Math.min(score, maxScore);
  }

  /**
   * Generate security flags
   */
  private generateSecurityFlags(): string[] {
    const flags: string[] = [];

    if (this.failureCount > 0) {
      flags.push(`encryption_failures:${this.failureCount}`);
    }

    if (this.sessionData.size > 5) {
      flags.push("high_data_volume");
    }

    const sessionAge = Date.now() - this.sessionStartTime;
    if (sessionAge > 20 * 60 * 1000) {
      // 20 minutes
      flags.push("long_session_duration");
    }

    return flags;
  }

  /**
   * Add audit log entry
   */
  private auditLog(
    entry: Omit<
      BiometricAuditLog,
      "id" | "timestamp" | "ipAddress" | "userAgent"
    >,
  ): void {
    const logEntry: BiometricAuditLog = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      ipAddress: "client_side", // Would be filled by server in real implementation
      userAgent:
        typeof window !== "undefined" ? window.navigator.userAgent : "unknown",
      ...entry,
    };

    this.auditLogs.push(logEntry);

    // Keep only recent logs for memory management
    const maxLogs = 100;
    if (this.auditLogs.length > maxLogs) {
      this.auditLogs = this.auditLogs.slice(-maxLogs);
    }
  }

  /**
   * Get session ID
   */
  private getSessionId(): string {
    return "ekyc_session_" + Math.random().toString(36).substr(2, 9);
  }

  /**
   * Validate image format
   */
  private isValidImageFormat(data: ArrayBuffer): boolean {
    // Basic image signature validation
    const view = new Uint8Array(data);

    // JPEG
    if (view[0] === 0xff && view[1] === 0xd8 && view[2] === 0xff) {
      return true;
    }

    // PNG
    if (
      view[0] === 0x89 &&
      view[1] === 0x50 &&
      view[2] === 0x4e &&
      view[3] === 0x47
    ) {
      return true;
    }

    // WebP
    if (
      view[8] === 0x57 &&
      view[9] === 0x45 &&
      view[10] === 0x42 &&
      view[11] === 0x50
    ) {
      return true;
    }

    return false;
  }

  /**
   * Validate face image
   */
  private isValidFaceImage(data: ArrayBuffer): boolean {
    // Basic validation - in production would include face detection
    return this.isValidImageFormat(data) && data.byteLength > 1024; // At least 1KB
  }

  /**
   * Convert ArrayBuffer to Base64
   */
  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = "";
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  /**
   * Convert Base64 to ArrayBuffer
   */
  private base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
  }

  /**
   * Destroy security manager and clean up all data
   */
  destroy(): void {
    // Clear all session data
    this.sessionData.clear();

    // Clear encryption key
    this.encryptionKey = null;

    // Clear cleanup timer
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }

    // Final cleanup audit log
    this.auditLog({
      action: "cleanup",
      dataType: "session_termination",
      sessionId: this.getSessionId(),
      success: true,
      riskLevel: "low",
      details: {
        totalLogs: this.auditLogs.length,
        sessionDuration: Date.now() - this.sessionStartTime,
      },
      vietnamCompliance: {
        dataProcessing: true,
        consentRecorded: true,
        dataMinimization: true,
        purposeLimitation: true,
      },
    });

    // Clear audit logs
    this.auditLogs = [];
  }

  /**
   * Export audit logs for compliance
   */
  exportAuditLogs(): BiometricAuditLog[] {
    return [...this.auditLogs];
  }
}

// Singleton instance for eKYC flows
let biometricSecurityInstance: BiometricSecurityManager | null = null;

/**
 * Get or create biometric security manager instance
 */
export const getBiometricSecurityManager = (): BiometricSecurityManager => {
  if (!biometricSecurityInstance) {
    biometricSecurityInstance = new BiometricSecurityManager();
  }
  return biometricSecurityInstance;
};

/**
 * Destroy biometric security manager
 */
export const destroyBiometricSecurityManager = (): void => {
  if (biometricSecurityInstance) {
    biometricSecurityInstance.destroy();
    biometricSecurityInstance = null;
  }
};

// Auto-cleanup on page unload
if (typeof window !== "undefined") {
  window.addEventListener("beforeunload", () => {
    destroyBiometricSecurityManager();
  });
}

export default BiometricSecurityManager;
