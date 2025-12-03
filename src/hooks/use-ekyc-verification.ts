/**
 * eKYC Verification Hook
 * Main hook for managing the complete eKYC verification flow
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useEkycStore } from "@/store/use-ekyc-store";
import { VietnameseDocumentType } from "@/lib/ekyc/document-types";
import {
  initializeEkycSession,
  uploadAndVerifyDocument,
  performFaceVerification,
  compareFaces,
  finalizeEkycProcess,
  retryEkycProcess,
  getEkycStatus,
  validateDocumentImage,
  type EkycSession,
  type DocumentVerificationResponse,
  type FaceVerificationResponse,
  type FaceComparisonResponse,
} from "@/lib/api/endpoints/ekyc";

export interface UseEkycVerificationOptions {
  documentType: VietnameseDocumentType;
  flowType: "DOCUMENT_TO_FACE" | "FACE_TO_DOCUMENT" | "DOCUMENT" | "FACE";
  language: "vi" | "en";
  userId?: string;
  loanApplicationId?: string;
  authToken?: string;
  onSessionInitialized?: (session: EkycSession) => void;
  onDocumentVerified?: (result: DocumentVerificationResponse) => void;
  onFaceVerified?: (result: FaceVerificationResponse) => void;
  onFaceCompared?: (result: FaceComparisonResponse) => void;
  onCompleted?: (result: any) => void;
  onError?: (error: string) => void;
  onProgress?: (progress: number, step: string) => void;
  autoStart?: boolean;
  enableRetries?: boolean;
  maxRetries?: number;
}

export interface UseEkycVerificationReturn {
  // State
  isInitialized: boolean;
  isProcessing: boolean;
  isCompleted: boolean;
  currentStep: string;
  progress: number;
  error?: string;
  errors: string[];
  warnings: string[];

  // Session data
  session?: EkycSession;

  // Actions
  initializeSession: () => Promise<void>;
  startVerification: () => Promise<void>;
  captureDocument: (file: File, side: "front" | "back") => Promise<void>;
  captureFace: (file: File, challengeType?: string) => Promise<void>;
  retryCurrentStep: () => Promise<void>;
  completeVerification: () => Promise<void>;
  reset: () => void;

  // Utilities
  validateImage: (file: File) => Promise<boolean>;
  getRetryCount: (step: string) => number;
  canRetry: (step: string) => boolean;
}

export const useEkycVerification = (
  options: UseEkycVerificationOptions
): UseEkycVerificationReturn => {
  const {
    documentType,
    flowType,
    language,
    userId,
    loanApplicationId,
    authToken,
    onSessionInitialized,
    onDocumentVerified,
    onFaceVerified,
    onFaceCompared,
    onCompleted,
    onError,
    onProgress,
    autoStart = true,
    enableRetries = true,
    maxRetries = 3,
  } = options;

  const store = useEkycStore();
  const [isInitialized, setIsInitialized] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize eKYC session
  const initializeSession = useCallback(async () => {
    try {
      setIsProcessing(true);
      store.processing();

      const session = await initializeEkycSession({
        documentType,
        flowType,
        language,
        userId,
        loanApplicationId,
      });

      store.initializeSession(session, {
        documentType,
        flowType,
        language,
        userId,
        loanApplicationId,
        consentGiven: true,
        consentTimestamp: new Date().toISOString(),
      });

      setIsInitialized(true);
      setIsProcessing(false);
      store.start();

      onSessionInitialized?.(session);
      onProgress?.(0, "session_initialized");

      toast.success("eKYC session initialized", {
        description: "Please follow the instructions to complete verification",
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to initialize eKYC session";
      store.setError(errorMessage);
      setIsProcessing(false);
      onError?.(errorMessage);

      toast.error("Initialization failed", {
        description: errorMessage,
      });
    }
  }, [documentType, flowType, language, userId, loanApplicationId, store, onSessionInitialized, onError, onProgress]);

  // Start verification process
  const startVerification = useCallback(async () => {
    if (!isInitialized) {
      await initializeSession();
      return;
    }

    try {
      setIsProcessing(true);

      // Start with the appropriate step based on flow type
      const firstStep = flowType === "FACE_TO_DOCUMENT" ? "face_capture" : "document_front";
      store.setCurrentStep(firstStep);

      onProgress?.(10, "verification_started");

      toast.success("Verification started", {
        description: "Please follow the on-screen instructions",
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to start verification";
      store.setError(errorMessage);
      onError?.(errorMessage);

      toast.error("Start failed", {
        description: errorMessage,
      });
    } finally {
      setIsProcessing(false);
    }
  }, [isInitialized, flowType, initializeSession, store, onError, onProgress]);

  // Capture and verify document
  const captureDocument = useCallback(async (file: File, side: "front" | "back") => {
    if (!store.session) {
      throw new Error("No active eKYC session");
    }

    try {
      setIsProcessing(true);
      store.processing();

      const stepId = side === "front" ? "document_front" : "document_back";
      store.setCurrentStep(stepId);
      store.updateStep(stepId, { progress: 25 });

      // Validate image before upload
      const isValid = await validateImage(file);
      if (!isValid) {
        throw new Error("Image quality is too low. Please ensure proper lighting and focus.");
      }

      store.updateStep(stepId, { progress: 50 });

      // Upload and verify document
      const result = await uploadAndVerifyDocument({
        sessionId: store.session.sessionId,
        documentType,
        frontImage: side === "front" ? file : undefined,
        backImage: side === "back" ? file : undefined,
        side,
      });

      store.updateStep(stepId, { progress: 75 });

      if (result.success) {
        store.setDocumentOcrData(result.ocrData, result);
        store.completeStep(stepId);

        // Store encrypted biometric data
        const dataId = `${side}_${Date.now()}`;
        await store.storeEncryptedData(dataId, file, side === "front" ? "document_front" : "document_back");

        // Update document reference in store
        if (side === "front") {
          store.setDocumentData({ frontImageId: dataId });
        } else {
          store.setDocumentData({ backImageId: dataId });
        }

        onDocumentVerified?.(result);
        onProgress?.(store.getProgress(), stepId);

        toast.success(`Document ${side} verified`, {
          description: `Successfully captured and verified ${side} side`,
        });
      } else {
        throw new Error(result.errors?.join(", ") || "Document verification failed");
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Document capture failed";
      const stepId = side === "front" ? "document_front" : "document_back";
      store.failStep(stepId, [errorMessage]);
      onError?.(errorMessage);

      toast.error("Document verification failed", {
        description: errorMessage,
      });

      throw error;
    } finally {
      setIsProcessing(false);
    }
  }, [store.session, documentType, store, onDocumentVerified, onError, onProgress]);

  // Capture and verify face
  const captureFace = useCallback(async (file: File, challengeType?: string) => {
    if (!store.session) {
      throw new Error("No active eKYC session");
    }

    try {
      setIsProcessing(true);
      store.processing();

      const stepId = challengeType ? "liveness_check" : "face_capture";
      store.setCurrentStep(stepId);
      store.updateStep(stepId, { progress: 25 });

      // Validate face image
      const isValid = await validateImage(file);
      if (!isValid) {
        throw new Error("Face image quality is too low. Please ensure proper lighting and positioning.");
      }

      store.updateStep(stepId, { progress: 50 });

      // Upload and verify face
      const result = await performFaceVerification({
        sessionId: store.session.sessionId,
        faceImage: file,
        challengeType: (challengeType as any) || "blink",
      });

      store.updateStep(stepId, { progress: 75 });

      if (result.success) {
        store.setFaceLivenessData(result.livenessData, result);

        // Store encrypted face data
        const dataId = `face_${Date.now()}`;
        await store.storeEncryptedData(dataId, file, "face");
        store.setFaceData({ faceImageId: dataId });

        if (challengeType) {
          // Add to completed challenges
          const currentChallenges = store.face.challengesCompleted || [];
          store.setFaceData({ challengesCompleted: [...currentChallenges, challengeType] });
        }

        store.completeStep(stepId);
        onFaceVerified?.(result);
        onProgress?.(store.getProgress(), stepId);

        toast.success("Face verified", {
          description: challengeType ? "Liveness check passed" : "Face captured successfully",
        });
      } else {
        throw new Error(result.errors?.join(", ") || "Face verification failed");
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Face capture failed";
      const stepId = challengeType ? "liveness_check" : "face_capture";
      store.failStep(stepId, [errorMessage]);
      onError?.(errorMessage);

      toast.error("Face verification failed", {
        description: errorMessage,
      });

      throw error;
    } finally {
      setIsProcessing(false);
    }
  }, [store.session, store, onFaceVerified, onError, onProgress]);

  // Compare faces
  const performFaceComparison = useCallback(async () => {
    if (!store.session || !store.document.ocrData || !store.face.faceImage) {
      throw new Error("Missing required data for face comparison");
    }

    try {
      setIsProcessing(true);
      store.processing();

      store.setCurrentStep("face_comparison");
      store.updateStep("face_comparison", { progress: 25 });

      // Get document face image from OCR data
      const documentFaceImage = ""; // This would come from the OCR result
      const liveFaceImage = store.face.faceImage;

      store.updateStep("face_comparison", { progress: 50 });

      const result = await compareFaces({
        sessionId: store.session.sessionId,
        documentFaceImage,
        liveFaceImage,
      });

      store.updateStep("face_comparison", { progress: 75 });

      if (result.success) {
        store.setFaceCompareData(result.compareData, result);
        store.completeStep("face_comparison");
        onFaceCompared?.(result);
        onProgress?.(store.getProgress(), "face_comparison");

        toast.success("Face comparison completed", {
          description: `Similarity: ${result.similarity.toFixed(1)}%`,
        });
      } else {
        throw new Error(result.errors?.join(", ") || "Face comparison failed");
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Face comparison failed";
      store.failStep("face_comparison", [errorMessage]);
      onError?.(errorMessage);

      toast.error("Face comparison failed", {
        description: errorMessage,
      });

      throw error;
    } finally {
      setIsProcessing(false);
    }
  }, [store.session, store.document.ocrData, store.face.faceImage, store, onFaceCompared, onError, onProgress]);

  // Complete verification process
  const completeVerification = useCallback(async () => {
    if (!store.session) {
      throw new Error("No active eKYC session");
    }

    try {
      setIsProcessing(true);
      store.processing();

      store.setCurrentStep("finalization");
      store.updateStep("finalization", { progress: 25 });

      // Perform face comparison if not already done
      if (store.comparison.similarity === 0 && flowType !== "DOCUMENT") {
        await performFaceComparison();
      }

      store.updateStep("finalization", { progress: 50 });

      // Finalize the process
      const result = await finalizeEkycProcess({
        sessionId: store.session.sessionId,
        allStepsCompleted: {
          documentFront: !!store.document.ocrData,
          documentBack: documentType.validation.idLength === 9 ? false : !!store.document.ocrData, // Old CMND doesn't have back
          faceVerification: !!store.face.livenessData,
          faceComparison: flowType === "DOCUMENT" ? true : store.comparison.isMatch,
        },
        userConsent: true,
        consentTimestamp: new Date().toISOString(),
      });

      store.updateStep("finalization", { progress: 75 });

      if (result.success) {
        store.completeStep("finalization");
        store.complete(result.result);

        onCompleted?.(result.result);
        onProgress?.(100, "completed");

        toast.success("eKYC verification completed", {
          description: "Identity verification successful",
        });

        // Start polling for final status
        startStatusPolling(result.ekycId);
      } else {
        throw new Error("Failed to finalize eKYC process");
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Completion failed";
      store.failStep("finalization", [errorMessage]);
      onError?.(errorMessage);

      toast.error("Verification completion failed", {
        description: errorMessage,
      });
    } finally {
      setIsProcessing(false);
    }
  }, [store.session, store.document.ocrData, store.face.livenessData, store.comparison, documentType, flowType, performFaceComparison, store, onCompleted, onError, onProgress]);

  // Retry current step
  const retryCurrentStep = useCallback(async () => {
    if (!enableRetries) {
      return;
    }

    const currentStep = store.getCurrentStep();
    if (!currentStep || currentStep.retryCount >= maxRetries) {
      return;
    }

    try {
      setIsProcessing(true);
      store.retryStep(currentStep.id);
      onProgress?.(store.getProgress(), currentStep.id);

      toast.info("Retrying step", {
        description: `Retrying ${currentStep.nameVi} (${currentStep.retryCount}/${maxRetries})`,
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Retry failed";
      onError?.(errorMessage);

      toast.error("Retry failed", {
        description: errorMessage,
      });
    } finally {
      setIsProcessing(false);
    }
  }, [enableRetries, maxRetries, store, onError, onProgress]);

  // Validate image quality
  const validateImage = useCallback(async (file: File): Promise<boolean> => {
    try {
      const result = await validateDocumentImage(file, documentType);
      return result.valid && result.score >= documentType.ocrConfig.qualityThreshold;
    } catch (error) {
      console.error("Image validation failed:", error);
      return false;
    }
  }, [documentType]);

  // Get retry count for a step
  const getRetryCount = useCallback((step: string): number => {
    const stepData = store.steps.find(s => s.id === step);
    return stepData?.retryCount || 0;
  }, [store.steps]);

  // Check if step can be retried
  const canRetry = useCallback((step: string): boolean => {
    const stepData = store.steps.find(s => s.id === step);
    return enableRetries && stepData ? stepData.retryCount < stepData.maxRetries : false;
  }, [enableRetries, store.steps]);

  // Reset entire process
  const reset = useCallback(() => {
    store.reset();
    setIsInitialized(false);
    setIsProcessing(false);
    setIsCompleted(false);

    // Clear any polling
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
  }, [store]);

  // Poll for verification status
  const startStatusPolling = useCallback((ekycId: string) => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }

    pollingIntervalRef.current = setInterval(async () => {
      try {
        const status = await getEkycStatus(ekycId);
        if (status.status === "completed" || status.status === "failed") {
          clearInterval(pollingIntervalRef.current!);
          pollingIntervalRef.current = null;
        }
      } catch (error) {
        console.error("Status polling failed:", error);
        clearInterval(pollingIntervalRef.current!);
        pollingIntervalRef.current = null;
      }
    }, 5000); // Poll every 5 seconds
  }, []);

  // Auto-start when mounted
  useEffect(() => {
    if (autoStart && !isInitialized && !isProcessing) {
      initializeSession();
    }

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [autoStart, isInitialized, isProcessing, initializeSession]);

  // Listen to store events
  useEffect(() => {
    const handleEkycCompleted = (event: CustomEvent) => {
      setIsCompleted(true);
      onCompleted?.(event.detail.result);
    };

    const handleEkycError = (event: CustomEvent) => {
      onError?.(event.detail.error);
    };

    if (typeof window !== "undefined") {
      window.addEventListener("ekyc:completed", handleEkycCompleted as any);
      window.addEventListener("ekyc:error", handleEkycError as any);
    }

    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("ekyc:completed", handleEkycCompleted as any);
        window.removeEventListener("ekyc:error", handleEkycError as any);
      }
    };
  }, [onCompleted, onError]);

  return {
    // State
    isInitialized,
    isProcessing,
    isCompleted: store.status === "success",
    currentStep: store.currentStep,
    progress: store.progress,
    error: store.error,
    errors: store.errors,
    warnings: store.warnings,
    session: store.session,

    // Actions
    initializeSession,
    startVerification,
    captureDocument,
    captureFace,
    retryCurrentStep,
    completeVerification,
    reset,

    // Utilities
    validateImage,
    getRetryCount,
    canRetry,
  };
};

// Utility function to convert file to base64
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result);
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
};

export default useEkycVerification;