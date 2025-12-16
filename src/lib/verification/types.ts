/**
 * Verification Provider Types - Provider-Agnostic eKYC System
 *
 * This file defines the abstraction layer that allows swapping between
 * different eKYC providers (VNPT, CitizenID, AWS, etc.) without changing
 * the form configuration.
 */

// ============================================================================
// Core Types
// ============================================================================

/**
 * Verification status enum
 */
export enum VerificationStatus {
  IDLE = "idle",
  INITIALIZING = "initializing",
  PROCESSING = "processing",
  SUCCESS = "success",
  ERROR = "error",
  CANCELLED = "cancelled",
  TIMEOUT = "timeout",
}

/**
 * Verification session information
 */
export interface VerificationSession {
  /** Unique session identifier */
  id: string;

  /** Current status */
  status: VerificationStatus;

  /** Provider name */
  provider: string;

  /** Session start timestamp */
  startedAt: string;

  /** Optional expiry timestamp */
  expiresAt?: string;

  /** Session metadata */
  metadata?: Record<string, any>;
}

/**
 * Normalized verification result - consistent across all providers
 */
export interface VerificationResult {
  /** Overall success status */
  success: boolean;

  /** Session identifier */
  sessionId: string;

  /** Provider information */
  provider: {
    name: string;
    version: string;
  };

  // Normalized personal data
  personalData: {
    /** Full name in Vietnamese format */
    fullName?: string;

    /** Date of birth in ISO format (YYYY-MM-DD) */
    dateOfBirth?: string;

    /** Gender normalized to enum */
    gender?: "male" | "female" | "other";

    /** Nationality */
    nationality?: string;

    /** ID number */
    idNumber?: string;

    /** Structured address */
    address?: {
      fullAddress?: string;
      city?: string;
      district?: string;
      ward?: string;
      street?: string;
      houseNumber?: string;
    };

    /** Document information */
    documentType?: string;
    documentTypeName?: string;
    issuedDate?: string; // ISO format
    expiryDate?: string; // ISO format
    issuedBy?: string;

    /** Additional Vietnamese-specific fields */
    ethnicity?: string; // Dân tộc
    hometown?: string; // Nguyên quán
    religion?: string; // Tôn giáo
  };

  // Verification metadata and quality scores
  verificationData: {
    /** Overall confidence score (0-100) */
    confidence: number;

    /** Liveness detection score (0-100) */
    livenessScore?: number;

    /** Face comparison score (0-100) */
    faceMatchScore?: number;

    /** Document image quality (0-100) */
    documentQuality?: number;

    /** OCR confidence scores */
    ocrConfidence?: {
      idNumber?: number;
      name?: number;
      dateOfBirth?: number;
      address?: number;
    };

    /** Fraud detection results */
    fraudDetection?: {
      isAuthentic: boolean;
      riskScore: number; // 0-100, higher is riskier
      warnings: string[];
      checks: {
        photocopyDetection: boolean;
        screenDetection: boolean;
        digitalManipulation: boolean;
        faceSwapping: boolean;
      };
    };

    /** Image quality metrics */
    imageQuality?: {
      blurScore: number;
      brightnessScore: number;
      glareScore: number;
      sharpnessScore: number;
    };
  };

  // Processing information
  processing: {
    /** Total processing time in milliseconds */
    totalDuration: number;

    /** Step-wise timing */
    steps: {
      documentUpload?: number;
      ocrProcessing?: number;
      faceCapture?: number;
      livenessCheck?: number;
      faceComparison?: number;
    };

    /** Number of retries */
    retryCount: number;
  };

  // Raw provider data (for audit, debugging, and compliance)
  rawData?: {
    /** Original response from provider */
    response?: any;

    /** Raw OCR data */
    ocrData?: any;

    /** Raw face data */
    faceData?: any;

    /** Provider-specific metadata */
    metadata?: Record<string, any>;
  };

  // Timestamps
  startedAt: string; // ISO format
  completedAt: string; // ISO format

  // Error information (if failed)
  error?: {
    code?: string;
    message: string;
    details?: any;
    step?: string;
  };
}

// ============================================================================
// Provider Interface
// ============================================================================

/**
 * Generic provider configuration
 */
export interface ProviderConfig {
  /** API key or authentication token */
  apiKey?: string;

  /** API base URL */
  apiUrl?: string;

  /** Environment */
  environment: "development" | "staging" | "production";

  /** Language preference */
  language?: "vi" | "en";

  /** Provider-specific options */
  customOptions?: Record<string, any>;

  /** Timeout configuration (in seconds) */
  timeout?: number;

  /** Retry configuration */
  retryConfig?: {
    maxAttempts: number;
    backoffMs: number;
  };
}

/**
 * Verification options
 */
export interface VerificationOptions {
  /** Document type to verify */
  documentType?: string;

  /** Verification flow type */
  flowType?: "DOCUMENT_TO_FACE" | "FACE_TO_DOCUMENT" | "DOCUMENT" | "FACE";

  /** Enable liveness detection */
  enableLiveness?: boolean;

  /** Enable face comparison */
  enableFaceMatch?: boolean;

  /** Enable document authenticity check */
  enableAuthenticityCheck?: boolean;

  /** Custom metadata */
  metadata?: Record<string, any>;

  /** UI customization options */
  uiOptions?: {
    theme?: "light" | "dark";
    language?: string;
    showProgress?: boolean;
    allowRetry?: boolean;
  };
}

/**
 * Provider interface - all eKYC providers must implement this
 */
export interface VerificationProvider {
  /** Provider name */
  readonly name: string;

  /** Provider version */
  readonly version: string;

  /** Provider capabilities */
  readonly capabilities: {
    supportedDocuments: string[];
    supportedFlows: string[];
    hasLivenessDetection: boolean;
    hasFaceComparison: boolean;
    hasAuthenticityCheck: boolean;
  };

  /**
   * Initialize the provider with configuration
   */
  initialize(config: ProviderConfig): Promise<void>;

  /**
   * Start a new verification session
   */
  startVerification(options: VerificationOptions): Promise<VerificationSession>;

  /**
   * Get current status of a verification session
   */
  getStatus(sessionId: string): Promise<VerificationStatus>;

  /**
   * Get verification result
   */
  getResult(sessionId: string): Promise<VerificationResult>;

  /**
   * Cancel an ongoing verification
   */
  cancel(sessionId: string): Promise<void>;

  /**
   * Cleanup resources
   */
  cleanup(): Promise<void>;

  /**
   * Health check for the provider
   */
  healthCheck?(): Promise<boolean>;
}

// ============================================================================
// Form Integration Types
// ============================================================================

/**
 * Autofill mapping configuration
 * Maps verification result fields to form field IDs
 */
export interface AutofillMapping {
  /** Target field ID -> Source field path */
  [targetFieldId: string]: keyof VerificationResult["personalData"] | string;
}

/**
 * eKYC verification configuration for form fields
 */
export interface EkycVerificationConfig {
  /** Which provider to use */
  provider: "vnpt" | "citizenid" | "aws" | "custom";

  /** Provider-specific options */
  providerOptions?: VerificationOptions;

  /** Which fields to autofill after verification */
  autofillMapping: AutofillMapping;

  /** Callback when verification completes */
  onVerified?: (result: VerificationResult) => void;

  /** Callback when verification fails */
  onError?: (error: Error) => void;

  /** Custom verification button text */
  buttonText?: string;

  /** Require verification before form submission */
  required?: boolean;

  /** Minimum confidence threshold (0-100) */
  confidenceThreshold?: number;

  /** Show verification result preview */
  showResultPreview?: boolean;

  /** Allow manual override of verified data */
  allowManualOverride?: boolean;
}

/**
 * Rendering mode for eKYC field
 */
export type EkycRenderMode = "button" | "inline" | "modal" | "custom";

/**
 * Props for custom eKYC render function
 */
export interface EkycRenderProps {
  /** Start verification function */
  startVerification: () => Promise<void>;

  /** Current verification status */
  status: VerificationStatus;

  /** Verification result (if completed) */
  result: VerificationResult | null;

  /** Is verification in progress */
  isVerifying: boolean;

  /** Error message (if any) */
  error: string | null;

  /** Number of retry attempts */
  retryCount: number;

  /** Provider name */
  provider: string;

  /** Trigger autofill manually */
  triggerAutofill: () => void;
}

// ============================================================================
// Utility Types
// ============================================================================

/**
 * Provider registration information
 */
export interface ProviderRegistration {
  /** Provider instance */
  provider: VerificationProvider;

  /** Registration timestamp */
  registeredAt: string;

  /** Is this the default provider? */
  isDefault?: boolean;
}

/**
 * Verification statistics for monitoring
 */
export interface VerificationStats {
  /** Total verifications attempted */
  totalAttempts: number;

  /** Successful verifications */
  successfulVerifications: number;

  /** Failed verifications */
  failedVerifications: number;

  /** Average processing time (ms) */
  averageProcessingTime: number;

  /** Success rate by document type */
  successRateByDocument: Record<string, number>;

  /** Common errors */
  commonErrors: Array<{
    error: string;
    count: number;
    percentage: number;
  }>;

  /** Provider performance */
  providerPerformance: Record<
    string,
    {
      averageTime: number;
      successRate: number;
      errorRate: number;
    }
  >;
}
