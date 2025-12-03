/**
 * Enhanced eKYC API Endpoints
 * Integrates with VNPT eKYC SDK for comprehensive verification
 */

import apiClient from "../client";
import type { paths } from "../v1.d.ts";
import { withRetry } from "../client";
import { VietnameseDocumentType } from "@/lib/ekyc/document-types";
import { EkycFullResult, EkycOcrData, EkycLivenessFaceData, EkycCompareData } from "@/lib/ekyc/ekyc-data-mapper";

// Types for API requests and responses
export interface EkycSessionRequest {
  documentType: VietnameseDocumentType;
  flowType: "DOCUMENT_TO_FACE" | "FACE_TO_DOCUMENT" | "DOCUMENT" | "FACE";
  language: "vi" | "en";
  userId?: string;
  loanApplicationId?: string;
}

export interface EkycSession {
  sessionId: string;
  token: string;
  expiresAt: string;
  config: {
    documentType: number;
    flowType: string;
    language: string;
    useMethod: "BOTH" | "PHOTO" | "UPLOAD";
  };
  // VNPT configuration is now handled securely on backend only
  // No sensitive credentials exposed to frontend
}

export interface DocumentUploadRequest {
  sessionId: string;
  documentType: VietnameseDocumentType;
  frontImage: File | Blob;
  backImage?: File | Blob;
  side: "front" | "back";
}

export interface DocumentVerificationResponse {
  success: boolean;
  ocrData: EkycOcrData;
  confidence: number;
  warnings: string[];
  errors: string[];
  metadata: {
    processingTime: number;
    qualityScore: number;
    edgeDetection: boolean;
    documentMatch: boolean;
  };
}

export interface FaceVerificationRequest {
  sessionId: string;
  faceImage: File | Blob;
  challengeType: "blink" | "smile" | "turn_left" | "turn_right" | "nod";
  challengeResponse?: string;
}

export interface FaceVerificationResponse {
  success: boolean;
  livenessData: EkycLivenessFaceData;
  confidence: number;
  challengePassed: boolean;
  warnings: string[];
  errors: string[];
  metadata: {
    processingTime: number;
    faceQuality: number;
    livenessScore: number;
    antiSpoofingPassed: boolean;
  };
}

export interface FaceComparisonRequest {
  sessionId: string;
  documentFaceImage: string; // Base64 or URL from document OCR
  liveFaceImage: string; // Base64 from face verification
}

export interface FaceComparisonResponse {
  success: boolean;
  compareData: EkycCompareData;
  similarity: number;
  match: boolean;
  confidence: number;
  metadata: {
    processingTime: number;
    faceDetectionQuality: number;
    landmarkQuality: number;
  };
}

export interface EkycFinalizationRequest {
  sessionId: string;
  allStepsCompleted: {
    documentFront: boolean;
    documentBack: boolean;
    faceVerification: boolean;
    faceComparison: boolean;
  };
  userConsent: boolean;
  consentTimestamp?: string;
}

export interface EkycFinalizationResponse {
  success: boolean;
  ekycId: string;
  status: "completed" | "pending" | "failed";
  result: EkycFullResult;
  certificate: {
    id: string;
    issuedAt: string;
    expiresAt?: string;
    verificationUrl: string;
  };
  auditLog: {
    sessionId: string;
    userId?: string;
    timestamp: string;
    ipAddress: string;
    userAgent: string;
    stepsCompleted: string[];
    duration: number;
  };
}

export interface EkycVerificationStatus {
  ekycId: string;
  status: "pending" | "in_progress" | "completed" | "failed" | "rejected";
  progress: number; // 0-100
  currentStep: string;
  completedSteps: string[];
  estimatedTimeRemaining?: number;
  errors: string[];
  createdAt: string;
  updatedAt: string;
}

export interface EkycRetryRequest {
  ekycId: string;
  sessionId?: string;
  retryStep: "document" | "face" | "comparison" | "all";
  reason: string;
}

export interface EkycRetryResponse {
  success: boolean;
  newSessionId?: string;
  retryAllowed: boolean;
  retryCount: number;
  maxRetries: number;
  nextRetryAt?: string;
  message: string;
}

export interface EkycAuditLog {
  id: string;
  ekycId: string;
  sessionId: string;
  userId?: string;
  action: string;
  timestamp: string;
  ipAddress: string;
  userAgent: string;
  details: Record<string, any>;
  status: "success" | "failure" | "warning";
}

export interface EkycAnalytics {
  totalVerifications: number;
  successRate: number;
  averageProcessingTime: number;
  documentTypeBreakdown: Record<string, number>;
  commonErrors: Array<{
    error: string;
    count: number;
    percentage: number;
  }>;
  regionalBreakdown: Record<string, number>;
  timeOfDayBreakdown: Record<string, number>;
}

/**
 * Initialize eKYC Session
 */
export const initializeEkycSession = async (
  request: EkycSessionRequest
): Promise<EkycSession> => {
  const response = await withRetry(() =>
    apiClient.POST("/ekyc/session", {
      body: {
        documentType: request.documentType.code,
        flowType: request.flowType,
        language: request.language,
        userId: request.userId,
        loanApplicationId: request.loanApplicationId,
      },
    })
  );

  if (response.error) {
    throw new Error(response.error.message || "Failed to initialize eKYC session");
  }

  return response.data as EkycSession;
};

/**
 * Upload and Verify Document
 */
export const uploadAndVerifyDocument = async (
  request: DocumentUploadRequest
): Promise<DocumentVerificationResponse> => {
  const formData = new FormData();
  formData.append("sessionId", request.sessionId);
  formData.append("documentType", request.documentType.code);
  formData.append("side", request.side);

  if (request.frontImage) {
    formData.append("frontImage", request.frontImage);
  }

  if (request.backImage) {
    formData.append("backImage", request.backImage);
  }

  const response = await withRetry(() =>
    apiClient.POST("/ekyc/document/verify", {
      body: formData as any,
    })
  );

  if (response.error) {
    throw new Error(response.error.message || "Failed to verify document");
  }

  return response.data as DocumentVerificationResponse;
};

/**
 * Perform Face Verification with Liveness Check
 */
export const performFaceVerification = async (
  request: FaceVerificationRequest
): Promise<FaceVerificationResponse> => {
  const formData = new FormData();
  formData.append("sessionId", request.sessionId);
  formData.append("faceImage", request.faceImage);
  formData.append("challengeType", request.challengeType);

  if (request.challengeResponse) {
    formData.append("challengeResponse", request.challengeResponse);
  }

  const response = await withRetry(() =>
    apiClient.POST("/ekyc/face/verify", {
      body: formData as any,
    })
  );

  if (response.error) {
    throw new Error(response.error.message || "Failed to verify face");
  }

  return response.data as FaceVerificationResponse;
};

/**
 * Compare Face from Document with Live Face
 */
export const compareFaces = async (
  request: FaceComparisonRequest
): Promise<FaceComparisonResponse> => {
  const response = await withRetry(() =>
    apiClient.POST("/ekyc/face/compare", {
      body: request,
    })
  );

  if (response.error) {
    throw new Error(response.error.message || "Failed to compare faces");
  }

  return response.data as FaceComparisonResponse;
};

/**
 * Finalize eKYC Process
 */
export const finalizeEkycProcess = async (
  request: EkycFinalizationRequest
): Promise<EkycFinalizationResponse> => {
  const response = await withRetry(() =>
    apiClient.POST("/ekyc/finalize", {
      body: request,
    })
  );

  if (response.error) {
    throw new Error(response.error.message || "Failed to finalize eKYC process");
  }

  return response.data as EkycFinalizationResponse;
};

/**
 * Get eKYC Verification Status
 */
export const getEkycStatus = async (ekycId: string): Promise<EkycVerificationStatus> => {
  const response = await withRetry(() =>
    apiClient.GET("/ekyc/status/{ekycId}", {
      params: {
        path: { ekycId },
      },
    })
  );

  if (response.error) {
    throw new Error(response.error.message || "Failed to get eKYC status");
  }

  return response.data as EkycVerificationStatus;
};

/**
 * Retry eKYC Process
 */
export const retryEkycProcess = async (
  request: EkycRetryRequest
): Promise<EkycRetryResponse> => {
  const response = await withRetry(() =>
    apiClient.POST("/ekyc/retry", {
      body: request,
    })
  );

  if (response.error) {
    throw new Error(response.error.message || "Failed to retry eKYC process");
  }

  return response.data as EkycRetryResponse;
};

/**
 * Get eKYC Audit Log
 */
export const getEkycAuditLog = async (
  ekycId: string,
  limit: number = 50
): Promise<EkycAuditLog[]> => {
  const response = await withRetry(() =>
    apiClient.GET("/ekyc/audit/{ekycId}", {
      params: {
        path: { ekycId },
        query: { limit },
      },
    })
  );

  if (response.error) {
    throw new Error(response.error.message || "Failed to get eKYC audit log");
  }

  return response.data as EkycAuditLog[];
};

/**
 * Get eKYC Analytics (Admin only)
 */
export const getEkycAnalytics = async (
  startDate?: string,
  endDate?: string
): Promise<EkycAnalytics> => {
  const response = await withRetry(() =>
    apiClient.GET("/ekyc/analytics", {
      params: {
        query: { startDate, endDate },
      },
    })
  );

  if (response.error) {
    throw new Error(response.error.message || "Failed to get eKYC analytics");
  }

  return response.data as EkycAnalytics;
};

/**
 * Delete eKYC Data (GDPR compliance)
 */
export const deleteEkycData = async (ekycId: string, reason: string): Promise<{ success: boolean }> => {
  const response = await withRetry(() =>
    apiClient.DELETE("/ekyc/data/{ekycId}", {
      params: {
        path: { ekycId },
        query: { reason },
      },
    })
  );

  if (response.error) {
    throw new Error(response.error.message || "Failed to delete eKYC data");
  }

  return response.data as { success: boolean };
};

/**
 * Export eKYC Data
 */
export const exportEkycData = async (
  ekycId: string,
  format: "json" | "pdf" | "csv" = "json"
): Promise<{ downloadUrl: string; expiresAt: string }> => {
  const response = await withRetry(() =>
    apiClient.GET("/ekyc/export/{ekycId}", {
      params: {
        path: { ekycId },
        query: { format },
      },
    })
  );

  if (response.error) {
    throw new Error(response.error.message || "Failed to export eKYC data");
  }

  return response.data as { downloadUrl: string; expiresAt: string };
};

/**
 * Validate Document Image Quality
 */
export const validateDocumentImage = async (
  imageFile: File | Blob,
  documentType: VietnameseDocumentType
): Promise<{ valid: boolean; score: number; issues: string[] }> => {
  const formData = new FormData();
  formData.append("image", imageFile);
  formData.append("documentType", documentType.code);

  const response = await withRetry(() =>
    apiClient.POST("/ekyc/validate/image", {
      body: formData as any,
    })
  );

  if (response.error) {
    throw new Error(response.error.message || "Failed to validate image");
  }

  return response.data as { valid: boolean; score: number; issues: string[] };
};

/**
 * Get Supported Document Types
 */
export const getSupportedDocumentTypes = async (): Promise<VietnameseDocumentType[]> => {
  const response = await withRetry(() =>
    apiClient.GET("/ekyc/supported-documents")
  );

  if (response.error) {
    throw new Error(response.error.message || "Failed to get supported document types");
  }

  return response.data as VietnameseDocumentType[];
};

/**
 * VNPT SDK Secure Proxy Interface
 * All VNPT SDK interactions are now handled securely through backend APIs
 * No sensitive credentials are exposed to the frontend
 */

export interface VNPTSecureProxyConfig {
  endpoint: string;
  timeout: number;
  retries: number;
}

export interface VNPTSecureRequest {
  sessionId: string;
  action: 'ocr' | 'liveness' | 'compare';
  data: {
    imageBase64?: string;
    documentType?: number;
    faceImage1Base64?: string;
    faceImage2Base64?: string;
    challengeType?: string;
  };
  securityContext: {
    timestamp: number;
    nonce: string;
    signature?: string;
  };
}

export interface VNPTSecureResponse {
  success: boolean;
  data?: any;
  error?: string;
  securityContext: {
    timestamp: number;
    verified: boolean;
  };
  auditLog: {
    requestId: string;
    action: string;
    processingTime: number;
    riskAssessment: 'low' | 'medium' | 'high';
  };
}

/**
 * Secure VNPT Proxy Client
 * Handles all VNPT SDK interactions through secure backend endpoints
 */
export const vnptSecureProxy = {
  /**
   * Process OCR through secure backend proxy
   */
  processOcr: async (
    sessionId: string,
    imageBase64: string,
    documentType: VietnameseDocumentType
  ): Promise<VNPTSecureResponse> => {
    const request: VNPTSecureRequest = {
      sessionId,
      action: 'ocr',
      data: {
        imageBase64,
        documentType: documentType.id,
      },
      securityContext: {
        timestamp: Date.now(),
        nonce: crypto.randomUUID(),
      },
    };

    try {
      // All VNPT API calls now go through secure backend endpoints
      // No direct VNPT SDK interaction from frontend
      const response = await withRetry(() =>
        apiClient.POST("/ekyc/secure/vnpt/ocr", {
          body: request,
          headers: {
            'X-Session-ID': sessionId,
            'X-Request-Timestamp': request.securityContext.timestamp.toString(),
            'X-Request-Nonce': request.securityContext.nonce,
          },
        })
      );

      // Generic error handling since we don't have the exact response type
      if (!response.data) {
        throw new Error("Failed to process OCR through secure proxy");
      }

      return {
        success: true,
        data: response.data,
        securityContext: {
          timestamp: Date.now(),
          verified: true,
        },
        auditLog: {
          requestId: crypto.randomUUID(),
          action: 'ocr',
          processingTime: 0, // Would be measured in real implementation
          riskAssessment: 'low',
        },
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "OCR processing failed",
        securityContext: {
          timestamp: Date.now(),
          verified: false,
        },
        auditLog: {
          requestId: crypto.randomUUID(),
          action: 'ocr',
          processingTime: 0,
          riskAssessment: 'high',
        },
      };
    }
  },

  /**
   * Process Liveness Check through secure backend proxy
   */
  processLiveness: async (
    sessionId: string,
    imageBase64: string,
    challengeType: string
  ): Promise<VNPTSecureResponse> => {
    const request: VNPTSecureRequest = {
      sessionId,
      action: 'liveness',
      data: {
        imageBase64,
        challengeType,
      },
      securityContext: {
        timestamp: Date.now(),
        nonce: crypto.randomUUID(),
      },
    };

    try {
      const response = await withRetry(() =>
        apiClient.POST("/ekyc/secure/vnpt/liveness", {
          body: request,
          headers: {
            'X-Session-ID': sessionId,
            'X-Request-Timestamp': request.securityContext.timestamp.toString(),
            'X-Request-Nonce': request.securityContext.nonce,
          },
        })
      );

      if (!response.data) {
        throw new Error("Failed to process liveness through secure proxy");
      }

      return {
        success: true,
        data: response.data,
        securityContext: {
          timestamp: Date.now(),
          verified: true,
        },
        auditLog: {
          requestId: crypto.randomUUID(),
          action: 'liveness',
          processingTime: 0,
          riskAssessment: 'low',
        },
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Liveness processing failed",
        securityContext: {
          timestamp: Date.now(),
          verified: false,
        },
        auditLog: {
          requestId: crypto.randomUUID(),
          action: 'liveness',
          processingTime: 0,
          riskAssessment: 'high',
        },
      };
    }
  },

  /**
   * Compare Faces through secure backend proxy
   */
  compareFaces: async (
    sessionId: string,
    face1Base64: string,
    face2Base64: string
  ): Promise<VNPTSecureResponse> => {
    const request: VNPTSecureRequest = {
      sessionId,
      action: 'compare',
      data: {
        faceImage1Base64: face1Base64,
        faceImage2Base64: face2Base64,
      },
      securityContext: {
        timestamp: Date.now(),
        nonce: crypto.randomUUID(),
      },
    };

    try {
      const response = await withRetry(() =>
        apiClient.POST("/ekyc/secure/vnpt/compare", {
          body: request,
          headers: {
            'X-Session-ID': sessionId,
            'X-Request-Timestamp': request.securityContext.timestamp.toString(),
            'X-Request-Nonce': request.securityContext.nonce,
          },
        })
      );

      if (!response.data) {
        throw new Error("Failed to compare faces through secure proxy");
      }

      return {
        success: true,
        data: response.data,
        securityContext: {
          timestamp: Date.now(),
          verified: true,
        },
        auditLog: {
          requestId: crypto.randomUUID(),
          action: 'compare',
          processingTime: 0,
          riskAssessment: 'low',
        },
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Face comparison failed",
        securityContext: {
          timestamp: Date.now(),
          verified: false,
        },
        auditLog: {
          requestId: crypto.randomUUID(),
          action: 'compare',
          processingTime: 0,
          riskAssessment: 'high',
        },
      };
    }
  },
};