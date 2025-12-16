/**
 * VNPT Verification Provider
 *
 * This adapter wraps the existing VNPT eKYC SDK to work with the
 * new provider-agnostic verification system.
 */

import type {
  VerificationProvider,
  ProviderConfig,
  VerificationOptions,
  VerificationSession,
  VerificationResult,
} from "../types";
import { VerificationStatus } from "../types";

// import { EkycSdkManager } from "@/lib/ekyc/sdk-manager";
// import { BiometricSecurityManager } from "@/lib/security/biometric-security";
// import type { EkycFullResult } from "@/lib/ekyc/types";

// Temporary stubs for non-existent dependencies
type EkycFullResult = any;

class EkycSdkManager {
  private static instance: EkycSdkManager;

  static getInstance(): EkycSdkManager {
    if (!EkycSdkManager.instance) {
      EkycSdkManager.instance = new EkycSdkManager();
    }
    return EkycSdkManager.instance;
  }

  async initialize(config: any): Promise<void> {
    // Stub implementation
  }

  async startFlow(options: any): Promise<any> {
    // Stub implementation
    return { sessionId: "mock-session" };
  }

  async cleanup(): Promise<void> {
    // Stub implementation
  }
}

class BiometricSecurityManager {
  clearAll(): void {
    // Stub implementation
  }
}

// ============================================================================
// VNPT Provider Implementation
// ============================================================================

export class VNPTVerificationProvider implements VerificationProvider {
  readonly name = "vnpt";
  readonly version = "3.2.0";

  readonly capabilities = {
    supportedDocuments: [
      "CCCD_CHIP",
      "CCCD_NO_CHIP",
      "CMND_12",
      "CMND_9",
      "PASSPORT",
      "DRIVER_LICENSE",
      "MILITARY_ID",
      "HEALTH_INSURANCE",
    ],
    supportedFlows: [
      "DOCUMENT_TO_FACE",
      "FACE_TO_DOCUMENT",
      "DOCUMENT",
      "FACE",
    ],
    hasLivenessDetection: true,
    hasFaceComparison: true,
    hasAuthenticityCheck: true,
  };

  private sdkManager: EkycSdkManager | null = null;
  private securityManager: BiometricSecurityManager | null = null;
  private activeSessions = new Map<string, any>();
  private config: ProviderConfig | null = null;

  /**
   * Initialize the VNPT provider
   */
  async initialize(config: ProviderConfig): Promise<void> {
    try {
      this.config = config;

      // Initialize SDK Manager
      this.sdkManager = EkycSdkManager.getInstance();

      // Prepare VNPT-specific configuration
      const vnptConfig = {
        authToken: config.apiKey || process.env.NEXT_PUBLIC_EKYC_AUTH_TOKEN,
        backendUrl: config.apiUrl || process.env.NEXT_PUBLIC_EKYC_BACKEND_URL,
        tokenKey: process.env.NEXT_PUBLIC_EKYC_TOKEN_KEY,
        tokenId: process.env.NEXT_PUBLIC_EKYC_TOKEN_ID,
        environment: config.environment,
        language: config.language || "vi",
        ...config.customOptions,
      };

      await this.sdkManager.initialize(vnptConfig);

      // Initialize Biometric Security Manager
      this.securityManager = new BiometricSecurityManager();

      console.log("VNPT Verification Provider initialized successfully");
    } catch (error) {
      console.error("Failed to initialize VNPT provider:", error);
      throw new Error(
        `VNPT provider initialization failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  /**
   * Start verification with VNPT
   */
  async startVerification(
    options: VerificationOptions,
  ): Promise<VerificationSession> {
    if (!this.sdkManager) {
      throw new Error("VNPT provider not initialized");
    }

    try {
      // Generate session ID
      const sessionId = this.generateSessionId();

      // Convert generic options to VNPT-specific options
      const vnptOptions = this.mapOptionsToVNPT(options);

      // Store session info
      this.activeSessions.set(sessionId, {
        options: vnptOptions,
        startTime: Date.now(),
        status: "initializing",
      });

      // Start the verification flow
      const result = await this.sdkManager.startFlow(vnptOptions);

      // Update session
      this.activeSessions.set(sessionId, {
        ...this.activeSessions.get(sessionId),
        vnptResult: result,
        status: "processing",
      });

      return {
        id: sessionId,
        status: VerificationStatus.PROCESSING,
        provider: this.name,
        startedAt: new Date().toISOString(),
        metadata: {
          vnptSessionId: result.sessionId,
          documentType: options.documentType,
          flowType: options.flowType,
        },
      };
    } catch (error) {
      console.error("Failed to start VNPT verification:", error);
      throw new Error(
        `VNPT verification start failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  /**
   * Get verification status
   */
  async getStatus(sessionId: string): Promise<VerificationStatus> {
    const session = this.activeSessions.get(sessionId);
    if (!session) {
      throw new Error(`Session "${sessionId}" not found`);
    }

    // Map VNPT status to our status
    switch (session.status) {
      case "initializing":
        return VerificationStatus.INITIALIZING;
      case "processing":
        return VerificationStatus.PROCESSING;
      case "completed":
        return VerificationStatus.SUCCESS;
      case "error":
        return VerificationStatus.ERROR;
      case "cancelled":
        return VerificationStatus.CANCELLED;
      default:
        return VerificationStatus.IDLE;
    }
  }

  /**
   * Get verification result
   */
  async getResult(sessionId: string): Promise<VerificationResult> {
    const session = this.activeSessions.get(sessionId);
    if (!session) {
      throw new Error(`Session "${sessionId}" not found`);
    }

    try {
      // Get VNPT result from session
      const vnptResult: EkycFullResult = session.vnptResult;

      if (!vnptResult) {
        throw new Error("No VNPT result available");
      }

      // Normalize VNPT result to our format
      const normalizedResult = await this.normalizeVNPTResult(
        vnptResult,
        sessionId,
      );

      // Clean up session
      this.activeSessions.delete(sessionId);

      return normalizedResult;
    } catch (error) {
      console.error("Failed to get VNPT result:", error);
      throw new Error(
        `VNPT result retrieval failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  /**
   * Cancel verification
   */
  async cancel(sessionId: string): Promise<void> {
    const session = this.activeSessions.get(sessionId);
    if (!session) {
      throw new Error(`Session "${sessionId}" not found`);
    }

    try {
      // Update session status
      session.status = "cancelled";

      // If SDK supports cancellation, call it here
      // Currently, VNPT SDK doesn't seem to have explicit cancel method

      console.log(`VNPT verification session cancelled: ${sessionId}`);
    } catch (error) {
      console.error(`Failed to cancel VNPT session ${sessionId}:`, error);
      throw error;
    }
  }

  /**
   * Cleanup resources
   */
  async cleanup(): Promise<void> {
    try {
      // Cancel all active sessions
      const cancelPromises: Promise<void>[] = [];
      for (const sessionId of Array.from(this.activeSessions.keys())) {
        cancelPromises.push(
          this.cancel(sessionId).catch((error) => {
            console.warn(`Failed to cancel session ${sessionId}:`, error);
          }),
        );
      }

      await Promise.all(cancelPromises);
      this.activeSessions.clear();

      // Cleanup SDK manager
      if (this.sdkManager) {
        await this.sdkManager.cleanup();
        this.sdkManager = null;
      }

      // Cleanup security manager
      if (this.securityManager) {
        this.securityManager.clearAll();
        this.securityManager = null;
      }

      console.log("VNPT Verification Provider cleanup completed");
    } catch (error) {
      console.error("Failed to cleanup VNPT provider:", error);
      throw error;
    }
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<boolean> {
    try {
      // Check if SDK is loaded and responsive
      if (!this.sdkManager) {
        return false;
      }

      // Check if we can access VNPT API
      // This is a basic check - actual implementation might vary
      const testConfig = {
        authToken:
          this.config?.apiKey || process.env.NEXT_PUBLIC_EKYC_AUTH_TOKEN,
        backendUrl:
          this.config?.apiUrl || process.env.NEXT_PUBLIC_EKYC_BACKEND_URL,
      };

      return !!(testConfig.authToken && testConfig.backendUrl);
    } catch (error) {
      console.error("VNPT provider health check failed:", error);
      return false;
    }
  }

  // ============================================================================
  // Private Methods
  // ============================================================================

  /**
   * Generate unique session ID
   */
  private generateSessionId(): string {
    return `vnpt_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  }

  /**
   * Map generic options to VNPT-specific options
   */
  private mapOptionsToVNPT(options: VerificationOptions): any {
    const vnptOptions: any = {
      // Map document type
      documentType: this.mapDocumentType(options.documentType),
      flowType: options.flowType || "DOCUMENT_TO_FACE",
      enableLiveness: options.enableLiveness !== false,
      enableFaceMatch: options.enableFaceMatch !== false,
      language: options.uiOptions?.language || "vi",
    };

    // Add custom VNPT options if provided
    if (this.config?.customOptions) {
      Object.assign(vnptOptions, this.config.customOptions);
    }

    if (options.metadata) {
      vnptOptions.metadata = options.metadata;
    }

    return vnptOptions;
  }

  /**
   * Map document type string to VNPT enum
   */
  private mapDocumentType(type?: string): any {
    if (!type) return undefined;

    // Import DocumentType enum from eKYC types
    const { DocumentType } = require("@/lib/ekyc/types");

    switch (type.toUpperCase()) {
      case "CCCD_CHIP":
      case "CCCD":
        return DocumentType.CCCD;
      case "CMND_12":
      case "CMND":
        return DocumentType.CMND;
      case "PASSPORT":
        return DocumentType.HoChieu;
      case "DRIVER_LICENSE":
        return DocumentType.BangLaiXe;
      case "MILITARY_ID":
        return DocumentType.CMNDQuanDoi;
      default:
        return DocumentType.CCCD; // Default
    }
  }

  /**
   * Normalize VNPT result to our standard format
   */
  private async normalizeVNPTResult(
    vnptData: EkycFullResult,
    sessionId: string,
  ): Promise<VerificationResult> {
    const ocrData = vnptData.ocr?.object;
    const livenessData = vnptData.liveness_face?.object;
    const compareData = vnptData.compare?.object;

    // Calculate confidence scores
    const confidence = this.calculateOverallConfidence(vnptData);

    // Extract personal data
    const personalData = {
      fullName: ocrData?.name?.trim(),
      dateOfBirth: this.convertVietnameseDateToISO(ocrData?.birth_day),
      gender: this.normalizeGender(ocrData?.gender),
      nationality: ocrData?.nationality || "Việt Nam",
      idNumber: ocrData?.id?.trim(),
      address: {
        fullAddress: ocrData?.recent_location?.trim(),
        city: this.extractCity(ocrData),
        district: this.extractDistrict(ocrData),
        ward: this.extractWard(ocrData),
      },
      documentType: this.getDocumentTypeName(ocrData?.type_id),
      issuedDate: this.convertVietnameseDateToISO(ocrData?.issue_date),
      expiryDate: this.convertVietnameseDateToISO(ocrData?.valid_date),
      issuedBy: ocrData?.issue_by?.trim(),
      ethnicity: ocrData?.nation?.trim(),
      hometown: ocrData?.origin_location?.trim(),
    };

    // Verification metadata
    const verificationData = {
      confidence,
      livenessScore: this.extractLivenessScore(livenessData),
      faceMatchScore: this.extractFaceMatchScore(compareData),
      documentQuality: this.extractDocumentQuality(ocrData),
      ocrConfidence: {
        idNumber: this.extractConfidence(ocrData?.id_probs),
        name: ocrData?.name_prob || 0,
        dateOfBirth: ocrData?.birth_day_prob || 0,
        address: ocrData?.recent_location_prob || 0,
      },
      fraudDetection: {
        isAuthentic: this.checkAuthenticity(vnptData),
        riskScore: this.calculateRiskScore(vnptData),
        warnings: this.extractWarnings(vnptData),
        checks: {
          photocopyDetection:
            !ocrData?.checking_result_front?.recaptured_result?.includes(
              "PASS",
            ),
          screenDetection:
            !ocrData?.checking_result_front?.edited_result?.includes("PASS"),
          digitalManipulation: false, // VNPT doesn't provide this info
          faceSwapping: livenessData?.face_swapping === false,
        },
      },
      imageQuality: {
        blurScore: ocrData?.quality_front?.blur_score || 0,
        brightnessScore: ocrData?.quality_front?.luminance_score || 0,
        glareScore: ocrData?.quality_front?.glare_score || 0,
        sharpnessScore: ocrData?.quality_front?.sharpness_score || 0,
      },
    };

    // Processing information
    const session = this.activeSessions.get(sessionId);
    const totalDuration = session ? Date.now() - session.startTime : 0;

    const processing = {
      totalDuration,
      steps: {
        documentUpload: totalDuration * 0.3, // Estimate
        ocrProcessing: totalDuration * 0.3,
        faceCapture: totalDuration * 0.2,
        livenessCheck: totalDuration * 0.1,
        faceComparison: totalDuration * 0.1,
      },
      retryCount: 0, // VNPT SDK handles retries internally
    };

    return {
      success: vnptData.code === 200,
      sessionId,
      provider: {
        name: this.name,
        version: this.version,
      },
      personalData,
      verificationData,
      processing,
      rawData: {
        response: vnptData,
        ocrData,
        faceData: livenessData,
        metadata: {
          documentType: ocrData?.type_id,
          flowType: session?.options?.flowType,
        },
      },
      startedAt: session
        ? new Date(session.startTime).toISOString()
        : new Date().toISOString(),
      completedAt: new Date().toISOString(),
      error:
        vnptData.code !== 200
          ? {
              code: vnptData.code?.toString(),
              message: vnptData.message || "Verification failed",
            }
          : undefined,
    };
  }

  /**
   * Convert Vietnamese date format to ISO
   */
  private convertVietnameseDateToISO(dateStr?: string): string | undefined {
    if (!dateStr) return undefined;

    const parts = dateStr.split("/");
    if (parts.length !== 3) return undefined;

    const [day, month, year] = parts;
    const isoDate = `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;

    // Validate date
    const date = new Date(isoDate);
    return isNaN(date.getTime()) ? undefined : isoDate;
  }

  /**
   * Normalize gender
   */
  private normalizeGender(
    gender?: string,
  ): "male" | "female" | "other" | undefined {
    if (!gender) return undefined;

    const normalized = gender.toLowerCase().trim();
    if (normalized === "nam" || normalized === "male") return "male";
    if (normalized === "nữ" || normalized === "female") return "female";
    return "other";
  }

  /**
   * Extract city from OCR data
   */
  private extractCity(ocrData?: any): string | undefined {
    if (!ocrData?.post_code) return undefined;

    const cityPostCode = ocrData.post_code.find(
      (p: any) => p.type === "address",
    );
    return cityPostCode?.city?.[1]; // Name is at index 1
  }

  /**
   * Extract district from OCR data
   */
  private extractDistrict(ocrData?: any): string | undefined {
    if (!ocrData?.post_code) return undefined;

    const cityPostCode = ocrData.post_code.find(
      (p: any) => p.type === "address",
    );
    return cityPostCode?.district?.[1];
  }

  /**
   * Extract ward from OCR data
   */
  private extractWard(ocrData?: any): string | undefined {
    if (!ocrData?.post_code) return undefined;

    const cityPostCode = ocrData.post_code.find(
      (p: any) => p.type === "address",
    );
    return cityPostCode?.ward?.[1];
  }

  /**
   * Get document type name
   */
  private getDocumentTypeName(typeId?: number): string | undefined {
    switch (typeId) {
      case 0:
        return "CMND_CU";
      case 1:
        return "CMND_MOI_CCCD";
      case 2:
        return "HO_CHIEU";
      case 3:
        return "CMND_QUAN_DOI";
      case 4:
        return "BANG_LAI_XE";
      default:
        return undefined;
    }
  }

  /**
   * Calculate overall confidence score
   */
  private calculateOverallConfidence(vnptData: EkycFullResult): number {
    const ocrData = vnptData.ocr?.object;
    if (!ocrData) return 0;

    // Average of key field confidences
    const confidences = [
      ocrData.name_prob || 0,
      ocrData.birth_day_prob || 0,
      ocrData.recent_location_prob || 0,
    ];

    // Add confidence from ID probabilities
    if (ocrData.id_probs) {
      const idProbs = ocrData.id_probs
        .split(",")
        .map((p: string) => parseFloat(p));
      const avgIdProb =
        idProbs.reduce((sum: number, p: number) => sum + p, 0) / idProbs.length;
      confidences.push(avgIdProb);
    }

    return Math.round(
      confidences.reduce((sum, c) => sum + c, 0) / confidences.length,
    );
  }

  /**
   * Extract liveness score
   */
  private extractLivenessScore(livenessData?: any): number | undefined {
    if (!livenessData) return undefined;

    // VNPT liveness provides confidence in different format
    // This is a simplified extraction
    return livenessData.liveness === "success" ? 90 : 0;
  }

  /**
   * Extract face match score
   */
  private extractFaceMatchScore(compareData?: any): number | undefined {
    if (!compareData) return undefined;

    return compareData.similarity_score || 0;
  }

  /**
   * Extract document quality score
   */
  private extractDocumentQuality(ocrData?: any): number {
    if (!ocrData?.quality_front) return 0;

    const quality = ocrData.quality_front;
    return Math.round(
      ((quality.blur_score || 0) +
        (quality.luminance_score || 0) +
        (quality.glare_score || 0)) /
        3,
    );
  }

  /**
   * Extract confidence from probability string
   */
  private extractConfidence(probsStr?: string): number {
    if (!probsStr) return 0;

    const probs = probsStr.split(",").map((p: string) => parseFloat(p));
    return Math.round(probs.reduce((sum, p) => sum + p, 0) / probs.length);
  }

  /**
   * Check if document is authentic
   */
  private checkAuthenticity(vnptData: EkycFullResult): boolean {
    const ocrData = vnptData.ocr?.object;
    const livenessData = vnptData.liveness_face?.object;

    // Check OCR authenticity
    const isOcrAuthentic =
      !ocrData?.checking_result_front?.recaptured_result?.includes("FAIL") &&
      !ocrData?.checking_result_front?.edited_result?.includes("FAIL");

    // Check liveness
    const isLive =
      livenessData?.liveness === "success" && !livenessData?.fake_liveness;

    return Boolean(isOcrAuthentic && isLive);
  }

  /**
   * Calculate risk score
   */
  private calculateRiskScore(vnptData: EkycFullResult): number {
    let riskScore = 0;

    const ocrData = vnptData.ocr?.object;
    const livenessData = vnptData.liveness_face?.object;

    // Add risk for failed authenticity checks
    if (ocrData?.checking_result_front?.recaptured_result?.includes("FAIL"))
      riskScore += 30;
    if (ocrData?.checking_result_front?.edited_result?.includes("FAIL"))
      riskScore += 30;
    if (livenessData?.fake_liveness) riskScore += 40;
    if (livenessData?.face_swapping) riskScore += 50;

    return Math.min(riskScore, 100);
  }

  /**
   * Extract warnings from verification
   */
  private extractWarnings(vnptData: EkycFullResult): string[] {
    const warnings: string[] = [];

    const ocrData = vnptData.ocr?.object;
    const livenessData = vnptData.liveness_face?.object;

    if (ocrData?.checking_result_front?.recaptured_result?.includes("FAIL")) {
      warnings.push("Document may be recaptured/photocopied");
    }

    if (ocrData?.checking_result_front?.edited_result?.includes("FAIL")) {
      warnings.push("Document may be digitally edited");
    }

    if (livenessData?.fake_liveness) {
      warnings.push("Liveness check failed - possible spoofing");
    }

    if (livenessData?.face_swapping) {
      warnings.push("Face swapping detected");
    }

    return warnings;
  }
}
