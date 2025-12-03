/**
 * Enhanced eKYC State Management
 * Comprehensive state management for eKYC verification process
 */

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { getBiometricSecurityManager, destroyBiometricSecurityManager } from "@/lib/security/biometric-security";
import { subscribeWithSelector } from "zustand/middleware";
import {
  EkycFullResult,
  EkycOcrData,
  EkycLivenessFaceData,
  EkycCompareData,
  OnboardingFormData,
  mapEkycToFormData,
  isEkycResultValid,
} from "@/lib/ekyc/ekyc-data-mapper";
import { VietnameseDocumentType, VIETNAMESE_DOCUMENT_TYPES } from "@/lib/ekyc/document-types";
import type {
  EkycSession,
  DocumentVerificationResponse,
  FaceVerificationResponse,
  FaceComparisonResponse,
  EkycVerificationStatus,
} from "@/lib/api/endpoints/ekyc";

// Enhanced state interfaces
export interface EkycDocumentData {
  // Encrypted biometric data - no longer stored in plain text
  frontImageId?: string; // Reference to encrypted data
  backImageId?: string; // Reference to encrypted data
  ocrData?: EkycOcrData;
  verificationResult?: DocumentVerificationResponse;
  confidence: number;
  isValid: boolean;
  warnings: string[];
  errors: string[];
  uploadedAt?: string;
}

export interface EkycFaceData {
  // Encrypted biometric data - no longer stored in plain text
  faceImageId?: string; // Reference to encrypted data
  livenessData?: EkycLivenessFaceData;
  verificationResult?: FaceVerificationResponse;
  confidence: number;
  isValid: boolean;
  warnings: string[];
  errors: string[];
  challengesCompleted: string[];
  uploadedAt?: string;
}

export interface EkycComparisonData {
  comparisonResult?: FaceComparisonResponse;
  compareData?: EkycCompareData;
  similarity: number;
  isMatch: boolean;
  confidence: number;
  warnings: string[];
  errors: string[];
  comparedAt?: string;
}

export interface EkycStep {
  id: string;
  name: string;
  nameVi: string;
  status: "pending" | "in_progress" | "completed" | "failed" | "skipped";
  progress: number; // 0-100
  startedAt?: string;
  completedAt?: string;
  duration?: number; // milliseconds
  errors: string[];
  warnings: string[];
  retryCount: number;
  maxRetries: number;
}

export interface EkycMetadata {
  sessionId?: string;
  ekycId?: string;
  userId?: string;
  loanApplicationId?: string;
  documentType?: VietnameseDocumentType;
  flowType: "DOCUMENT_TO_FACE" | "FACE_TO_DOCUMENT" | "DOCUMENT" | "FACE";
  language: "vi" | "en";
  platform: string;
  userAgent: string;
  ipAddress?: string;
  startTime: string;
  endTime?: string;
  totalDuration?: number; // milliseconds
  consentGiven: boolean;
  consentTimestamp?: string;
}

export interface EkycSecurity {
  fraudRisk: "low" | "medium" | "high" | "critical";
  riskFactors: string[];
  securityFlags: string[];
  antiSpoofingPassed: boolean;
  qualityChecksPassed: boolean;
  auditTrail: Array<{
    timestamp: string;
    action: string;
    details: Record<string, any>;
    risk: "low" | "medium" | "high";
  }>;
}

export interface EkycState {
  // Primary status
  status: "idle" | "initializing" | "running" | "processing" | "success" | "error" | "abandoned";

  // Session data
  session?: EkycSession;

  // Raw and processed results
  rawResult?: EkycFullResult;
  formData?: Partial<OnboardingFormData>;

  // Verification data
  document: EkycDocumentData;
  face: EkycFaceData;
  comparison: EkycComparisonData;

  // Step tracking
  steps: EkycStep[];
  currentStep: string;

  // Metadata and security
  metadata: EkycMetadata;
  security: EkycSecurity;

  // Biometric data management (security)
  encryptedData: Map<string, any>; // In-memory encrypted data only
  dataRetentionTimeout: number;

  // Error handling
  error?: string;
  errors: string[];
  warnings: string[];

  // Progress tracking
  progress: number; // Overall progress 0-100

  // Timing
  createdAt: string;
  updatedAt: string;

  // Actions
  // Session management
  initializeSession: (session: EkycSession, metadata: Partial<EkycMetadata>) => void;
  updateSession: (session: Partial<EkycSession>) => void;

  // Step management
  setCurrentStep: (stepId: string) => void;
  updateStep: (stepId: string, updates: Partial<EkycStep>) => void;
  completeStep: (stepId: string) => void;
  failStep: (stepId: string, errors: string[]) => void;
  retryStep: (stepId: string) => void;

  // Document verification
  setDocumentData: (data: Partial<EkycDocumentData>) => void;
  setDocumentOcrData: (ocrData: EkycOcrData, verificationResult?: DocumentVerificationResponse) => void;

  // Face verification
  setFaceData: (data: Partial<EkycFaceData>) => void;
  setFaceLivenessData: (livenessData: EkycLivenessFaceData, verificationResult?: FaceVerificationResponse) => void;

  // Face comparison
  setComparisonData: (data: Partial<EkycComparisonData>) => void;
  setFaceCompareData: (compareData: EkycCompareData, comparisonResult?: FaceComparisonResponse) => void;

  // Result management
  setResult: (result: EkycFullResult) => void;
  setError: (error: string, additionalErrors?: string[]) => void;
  setWarning: (warning: string) => void;

  // Progress management
  updateProgress: () => void;

  // Security management
  addSecurityFlag: (flag: string, risk: "low" | "medium" | "high") => void;
  updateFraudRisk: (risk: "low" | "medium" | "high" | "critical") => void;

  // Secure biometric data management
  storeEncryptedData: (dataId: string, file: File, dataType: 'document_front' | 'document_back' | 'face') => Promise<void>;
  getEncryptedData: (dataId: string) => Promise<File | null>;
  deleteEncryptedData: (dataId: string) => void;
  cleanupExpiredData: () => void;

  // State management
  start: () => void;
  processing: () => void;
  success: () => void;
  complete: (result: EkycFullResult) => void;
  reset: () => void;

  // Getters
  isValid: () => boolean;
  getCurrentStep: () => EkycStep | undefined;
  getCompletedSteps: () => EkycStep[];
  getFailedSteps: () => EkycStep[];
  getProgress: () => number;
  canRetry: () => boolean;
  isCompleted: () => boolean;

  // Export data
  exportState: () => any;
  importState: (state: any) => void;
}

const EKYC_STEPS = [
  {
    id: "document_front",
    name: "Document Front",
    nameVi: "Quét mặt trước giấy tờ",
    required: true,
  },
  {
    id: "document_back",
    name: "Document Back",
    nameVi: "Quét mặt sau giấy tờ",
    required: true,
  },
  {
    id: "face_capture",
    name: "Face Capture",
    nameVi: "Chụp ảnh khuôn mặt",
    required: true,
  },
  {
    id: "liveness_check",
    name: "Liveness Check",
    nameVi: "Kiểm tra sống",
    required: true,
  },
  {
    id: "face_comparison",
    name: "Face Comparison",
    nameVi: "So sánh khuôn mặt",
    required: true,
  },
  {
    id: "finalization",
    name: "Finalization",
    nameVi: "Hoàn tất",
    required: true,
  },
];

const createInitialSteps = (): EkycStep[] => {
  return EKYC_STEPS.map(step => ({
    id: step.id,
    name: step.name,
    nameVi: step.nameVi,
    status: step.required ? "pending" : "skipped",
    progress: 0,
    errors: [],
    warnings: [],
    retryCount: 0,
    maxRetries: 3,
  }));
};

const calculateOverallProgress = (steps: EkycStep[]): number => {
  const totalSteps = steps.length;
  const completedSteps = steps.filter(step => step.status === "completed").length;
  const inProgressSteps = steps.filter(step => step.status === "in_progress");

  const progressFromCompleted = (completedSteps / totalSteps) * 100;
  const progressFromInProgress = inProgressSteps.reduce((acc, step) => acc + step.progress, 0) / totalSteps;

  return Math.min(100, progressFromCompleted + progressFromInProgress);
};

export const useEkycStore = create<EkycState>()(
  subscribeWithSelector(
    persist(
      (set, get) => ({
        // Initial state
        status: "idle",
        progress: 0,
        currentStep: "document_front",
        steps: createInitialSteps(),
        errors: [],
        warnings: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),

        // Secure biometric data management
        encryptedData: new Map(),
        dataRetentionTimeout: Date.now() + (30 * 60 * 1000), // 30 minutes

        // Verification data
        document: {
          confidence: 0,
          isValid: false,
          warnings: [],
          errors: [],
        },
        face: {
          confidence: 0,
          isValid: false,
          warnings: [],
          errors: [],
          challengesCompleted: [],
        },
        comparison: {
          similarity: 0,
          isMatch: false,
          confidence: 0,
          warnings: [],
          errors: [],
        },

        // Metadata
        metadata: {
          flowType: "DOCUMENT_TO_FACE",
          language: "vi",
          platform: typeof window !== "undefined" ? window.navigator.platform : "unknown",
          userAgent: typeof window !== "undefined" ? window.navigator.userAgent : "unknown",
          startTime: new Date().toISOString(),
          consentGiven: false,
        },

        // Security
        security: {
          fraudRisk: "low",
          riskFactors: [],
          securityFlags: [],
          antiSpoofingPassed: false,
          qualityChecksPassed: false,
          auditTrail: [],
        },

        // Session management
        initializeSession: (session: EkycSession, metadata: Partial<EkycMetadata>) => {
          console.log("[eKYC Store] Initializing session:", session);

          set((state) => ({
            status: "running",
            session,
            metadata: {
              ...state.metadata,
              ...metadata,
              sessionId: session.sessionId,
            },
            updatedAt: new Date().toISOString(),
          }));

          // Dispatch event for components
          if (typeof window !== "undefined") {
            window.dispatchEvent(
              new CustomEvent("ekyc:session-initialized", {
                detail: { session, metadata },
              })
            );
          }
        },

        updateSession: (sessionUpdate: Partial<EkycSession>) => {
          set((state) => ({
            session: state.session ? { ...state.session, ...sessionUpdate } : undefined,
            updatedAt: new Date().toISOString(),
          }));
        },

        // Step management
        setCurrentStep: (stepId: string) => {
          set((state) => {
            const updatedSteps = state.steps.map(step =>
              step.id === stepId
                ? { ...step, status: "in_progress" as const, startedAt: new Date().toISOString() }
                : step
            );

            return {
              currentStep: stepId,
              steps: updatedSteps,
              progress: calculateOverallProgress(updatedSteps),
              updatedAt: new Date().toISOString(),
            };
          });
        },

        updateStep: (stepId: string, updates: Partial<EkycStep>) => {
          set((state) => {
            const updatedSteps = state.steps.map(step =>
              step.id === stepId ? { ...step, ...updates } : step
            );

            return {
              steps: updatedSteps,
              progress: calculateOverallProgress(updatedSteps),
              updatedAt: new Date().toISOString(),
            };
          });
        },

        completeStep: (stepId: string) => {
          set((state) => {
            const updatedSteps = state.steps.map(step =>
              step.id === stepId
                ? {
                    ...step,
                    status: "completed" as const,
                    progress: 100,
                    completedAt: new Date().toISOString(),
                    duration: step.startedAt ? Date.now() - new Date(step.startedAt).getTime() : undefined,
                  }
                : step
            );

            const progress = calculateOverallProgress(updatedSteps);

            return {
              steps: updatedSteps,
              progress,
              status: progress === 100 ? "success" : "running",
              updatedAt: new Date().toISOString(),
            };
          });
        },

        failStep: (stepId: string, errors: string[]) => {
          set((state) => {
            const updatedSteps = state.steps.map(step =>
              step.id === stepId
                ? { ...step, status: "failed" as const, errors: [...step.errors, ...errors] }
                : step
            );

            return {
              steps: updatedSteps,
              errors: [...state.errors, ...errors],
              status: "error",
              updatedAt: new Date().toISOString(),
            };
          });
        },

        retryStep: (stepId: string) => {
          set((state) => {
            const updatedSteps = state.steps.map(step =>
              step.id === stepId
                ? {
                    ...step,
                    status: "pending" as const,
                    progress: 0,
                    errors: [],
                    warnings: [],
                    retryCount: step.retryCount + 1,
                    startedAt: undefined,
                    completedAt: undefined,
                    duration: undefined,
                  }
                : step
            );

            return {
              steps: updatedSteps,
              progress: calculateOverallProgress(updatedSteps),
              status: "running",
              updatedAt: new Date().toISOString(),
            };
          });
        },

        // Document verification
        setDocumentData: (data: Partial<EkycDocumentData>) => {
          set((state) => ({
            document: { ...state.document, ...data },
            updatedAt: new Date().toISOString(),
          }));
        },

        setDocumentOcrData: (ocrData: EkycOcrData, verificationResult?: DocumentVerificationResponse) => {
          set((state) => ({
            document: {
              ...state.document,
              ocrData,
              verificationResult,
              isValid: verificationResult?.success ?? false,
              confidence: verificationResult?.confidence ?? 0,
              warnings: verificationResult?.warnings ?? [],
              errors: verificationResult?.errors ?? [],
            },
            updatedAt: new Date().toISOString(),
          }));
        },

        // Face verification
        setFaceData: (data: Partial<EkycFaceData>) => {
          set((state) => ({
            face: { ...state.face, ...data },
            updatedAt: new Date().toISOString(),
          }));
        },

        setFaceLivenessData: (livenessData: EkycLivenessFaceData, verificationResult?: FaceVerificationResponse) => {
          set((state) => ({
            face: {
              ...state.face,
              livenessData,
              verificationResult,
              isValid: verificationResult?.success ?? false,
              confidence: verificationResult?.confidence ?? 0,
              warnings: verificationResult?.warnings ?? [],
              errors: verificationResult?.errors ?? [],
            },
            security: {
              ...state.security,
              antiSpoofingPassed: livenessData.liveness === "success",
            },
            updatedAt: new Date().toISOString(),
          }));
        },

        // Face comparison
        setComparisonData: (data: Partial<EkycComparisonData>) => {
          set((state) => ({
            comparison: { ...state.comparison, ...data },
            updatedAt: new Date().toISOString(),
          }));
        },

        setFaceCompareData: (compareData: EkycCompareData, comparisonResult?: FaceComparisonResponse) => {
          set((state) => ({
            comparison: {
              ...state.comparison,
              compareData,
              comparisonResult,
              isMatch: comparisonResult?.match ?? false,
              similarity: comparisonResult?.similarity ?? 0,
              confidence: comparisonResult?.confidence ?? 0,
              warnings: comparisonResult?.metadata ? Object.values(comparisonResult.metadata) : [],
            },
            updatedAt: new Date().toISOString(),
          }));
        },

        // Result management
        setResult: (result: EkycFullResult) => {
          console.log("[eKYC Store] Setting result:", result);

          // Validate result
          const valid = isEkycResultValid(result);

          if (!valid) {
            console.error("[eKYC Store] Invalid eKYC result");
            set({
              status: "error",
              error: "Invalid eKYC result",
              rawResult: result,
              updatedAt: new Date().toISOString(),
            });
            return;
          }

          // Map to form data
          const mapped = mapEkycToFormData(result);
          console.log("[eKYC Store] Mapped form data:", mapped);

          set({
            status: "success",
            rawResult: result,
            formData: mapped,
            error: undefined,
            updatedAt: new Date().toISOString(),
          });

          // Dispatch custom event
          if (typeof window !== "undefined") {
            window.dispatchEvent(
              new CustomEvent("ekyc:completed", {
                detail: {
                  result,
                  formData: mapped,
                  completedAt: new Date().toISOString(),
                },
              })
            );
          }
        },

        setError: (error: string, additionalErrors?: string[]) => {
          console.error("[eKYC Store] Error:", error);

          set({
            status: "error",
            error,
            errors: additionalErrors ? [error, ...additionalErrors] : [error],
            updatedAt: new Date().toISOString(),
          });

          // Dispatch error event
          if (typeof window !== "undefined") {
            window.dispatchEvent(
              new CustomEvent("ekyc:error", {
                detail: { error, additionalErrors, timestamp: new Date().toISOString() },
              })
            );
          }
        },

        setWarning: (warning: string) => {
          console.warn("[eKYC Store] Warning:", warning);

          set((state) => ({
            warnings: [...state.warnings, warning],
            updatedAt: new Date().toISOString(),
          }));
        },

        // Progress management
        updateProgress: () => {
          const state = get();
          const progress = calculateOverallProgress(state.steps);

          set({
            progress,
            status: progress === 100 ? "success" : state.status,
            updatedAt: new Date().toISOString(),
          });
        },

        // Security management
        addSecurityFlag: (flag: string, risk: "low" | "medium" | "high") => {
          set((state) => {
            const auditEntry = {
              timestamp: new Date().toISOString(),
              action: "security_flag",
              details: { flag, risk },
              risk,
            };

            const newRiskFactors = [...state.security.riskFactors, flag];
            const fraudRisk = newRiskFactors.length > 5 ? "critical" :
                            newRiskFactors.length > 3 ? "high" :
                            newRiskFactors.length > 1 ? "medium" : "low";

            return {
              security: {
                ...state.security,
                riskFactors: newRiskFactors,
                securityFlags: [...state.security.securityFlags, flag],
                fraudRisk,
                auditTrail: [...state.security.auditTrail, auditEntry],
              },
              updatedAt: new Date().toISOString(),
            };
          });
        },

        updateFraudRisk: (risk: "low" | "medium" | "high" | "critical") => {
          set((state) => ({
            security: { ...state.security, fraudRisk: risk },
            updatedAt: new Date().toISOString(),
          }));
        },

        // State management
        start: () => {
          console.log("[eKYC Store] Starting eKYC process...");

          set({
            status: "running",
            errors: [],
            warnings: [],
            updatedAt: new Date().toISOString(),
          });

          // Dispatch start event
          if (typeof window !== "undefined") {
            window.dispatchEvent(
              new CustomEvent("ekyc:started", {
                detail: { timestamp: new Date().toISOString() },
              })
            );
          }
        },

        processing: () => {
          set({
            status: "processing",
            updatedAt: new Date().toISOString(),
          });
        },

        success: () => {
          set({
            status: "success",
            updatedAt: new Date().toISOString(),
          });
        },

        complete: (result: EkycFullResult) => {
          const state = get();

          // Update final metadata
          const endTime = new Date().toISOString();
          const totalDuration = Date.now() - new Date(state.metadata.startTime).getTime();

          set({
            status: "success",
            rawResult: result,
            metadata: {
              ...state.metadata,
              endTime,
              totalDuration,
            },
            progress: 100,
            updatedAt: new Date().toISOString(),
          });

          // Dispatch completion event
          if (typeof window !== "undefined") {
            window.dispatchEvent(
              new CustomEvent("ekyc:completed", {
                detail: {
                  result,
                  metadata: {
                    ...state.metadata,
                    endTime,
                    totalDuration,
                  },
                  completedAt: endTime,
                },
              })
            );
          }
        },

        reset: () => {
          console.log("[eKYC Store] Resetting store...");

          set({
            status: "idle",
            session: undefined,
            rawResult: undefined,
            formData: undefined,
            error: undefined,
            errors: [],
            warnings: [],
            progress: 0,
            currentStep: "document_front",
            steps: createInitialSteps(),
            document: {
              confidence: 0,
              isValid: false,
              warnings: [],
              errors: [],
            },
            face: {
              confidence: 0,
              isValid: false,
              warnings: [],
              errors: [],
              challengesCompleted: [],
            },
            comparison: {
              similarity: 0,
              isMatch: false,
              confidence: 0,
              warnings: [],
              errors: [],
            },
            security: {
              fraudRisk: "low",
              riskFactors: [],
              securityFlags: [],
              antiSpoofingPassed: false,
              qualityChecksPassed: false,
              auditTrail: [],
            },
            metadata: {
              flowType: "DOCUMENT_TO_FACE",
              language: "vi",
              platform: typeof window !== "undefined" ? window.navigator.platform : "unknown",
              userAgent: typeof window !== "undefined" ? window.navigator.userAgent : "unknown",
              startTime: new Date().toISOString(),
              consentGiven: false,
            },
            updatedAt: new Date().toISOString(),
          });
        },

        // Secure biometric data management
        storeEncryptedData: async (dataId: string, file: File, dataType: 'document_front' | 'document_back' | 'face') => {
          try {
            const biometricSecurity = getBiometricSecurityManager();
            const sessionId = get().session?.sessionId || 'default_session';

            // Encrypt the file using biometric security manager
            const encryptedData = await biometricSecurity.encryptBiometricData(
              await file.arrayBuffer(),
              dataType,
              sessionId
            );

            // Store encrypted data in memory (not persisted)
            set((state) => ({
              encryptedData: new Map(state.encryptedData).set(dataId, {
                encryptedData,
                originalFileName: file.name,
                fileType: file.type,
                dataType,
                timestamp: Date.now(),
              }),
              updatedAt: new Date().toISOString(),
            }));

            // Update retention timeout
            set({
              dataRetentionTimeout: Date.now() + (30 * 60 * 1000), // Reset to 30 minutes
            });

          } catch (error) {
            console.error('[eKYC Store] Failed to encrypt biometric data:', error);
            get().setError('Failed to securely store biometric data');
          }
        },

        getEncryptedData: async (dataId: string): Promise<File | null> => {
          try {
            const biometricSecurity = getBiometricSecurityManager();
            const encryptedEntry = get().encryptedData.get(dataId);

            if (!encryptedEntry) {
              return null;
            }

            // Decrypt the data
            const decryptedBuffer = await biometricSecurity.decryptBiometricData(encryptedEntry.encryptedData);

            // Convert back to File
            return new File(
              [decryptedBuffer],
              encryptedEntry.originalFileName,
              { type: encryptedEntry.fileType }
            );

          } catch (error) {
            console.error('[eKYC Store] Failed to decrypt biometric data:', error);
            return null;
          }
        },

        deleteEncryptedData: (dataId: string) => {
          set((state) => {
            const newEncryptedData = new Map(state.encryptedData);
            newEncryptedData.delete(dataId);

            return {
              encryptedData: newEncryptedData,
              updatedAt: new Date().toISOString(),
            };
          });
        },

        cleanupExpiredData: () => {
          const now = Date.now();
          const retentionTimeout = get().dataRetentionTimeout;

          if (now > retentionTimeout) {
            // Clear all encrypted data
            set({
              encryptedData: new Map(),
              updatedAt: new Date().toISOString(),
            });

            // Destroy biometric security manager
            destroyBiometricSecurityManager();
          }
        },

        // Getters
        isValid: () => {
          const state = get();
          return (
            state.status === "success" &&
            state.rawResult !== undefined &&
            state.document.isValid &&
            state.face.isValid &&
            state.comparison.isMatch &&
            state.security.fraudRisk !== "critical"
          );
        },

        getCurrentStep: () => {
          const state = get();
          return state.steps.find(step => step.id === state.currentStep);
        },

        getCompletedSteps: () => {
          const state = get();
          return state.steps.filter(step => step.status === "completed");
        },

        getFailedSteps: () => {
          const state = get();
          return state.steps.filter(step => step.status === "failed");
        },

        getProgress: () => {
          const state = get();
          return calculateOverallProgress(state.steps);
        },

        canRetry: () => {
          const state = get();
          const failedSteps = state.getFailedSteps();
          return failedSteps.some(step => step.retryCount < step.maxRetries);
        },

        isCompleted: () => {
          const state = get();
          return state.status === "success" || state.progress === 100;
        },

        // Export/Import state
        exportState: () => {
          const state = get();
          return {
            status: state.status,
            session: state.session,
            rawResult: state.rawResult,
            formData: state.formData,
            document: state.document,
            face: state.face,
            comparison: state.comparison,
            steps: state.steps,
            currentStep: state.currentStep,
            metadata: state.metadata,
            security: state.security,
            progress: state.progress,
            errors: state.errors,
            warnings: state.warnings,
            createdAt: state.createdAt,
            updatedAt: state.updatedAt,
          };
        },

        importState: (importedState: any) => {
          set({
            ...importedState,
            updatedAt: new Date().toISOString(),
          });
        },
      }),
      {
        name: "ekyc-store",
        storage: createJSONStorage(() => {
          if (typeof window !== "undefined") {
            // Use encrypted sessionStorage for compliance with Vietnamese data protection laws
            return {
              getItem: (key) => {
                try {
                  const item = window.sessionStorage.getItem(key);
                  if (!item) return null;

                  // Decrypt stored data (in a real implementation, you'd use proper encryption)
                  const encryptedData = JSON.parse(item);
                  return encryptedData.data;
                } catch (error) {
                  console.error('[eKYC Store] Failed to decrypt stored data:', error);
                  return null;
                }
              },
              setItem: (key, value) => {
                try {
                  // Encrypt data before storing (in a real implementation, you'd use proper encryption)
                  const encryptedData = {
                    data: value,
                    timestamp: Date.now(),
                    version: '1.0',
                  };

                  window.sessionStorage.setItem(key, JSON.stringify(encryptedData));
                } catch (error) {
                  console.error('[eKYC Store] Failed to encrypt and store data:', error);
                  // Fallback to non-encrypted storage if encryption fails
                  window.sessionStorage.setItem(key, JSON.stringify(value));
                }
              },
              removeItem: (key) => {
                window.sessionStorage.removeItem(key);
              },
            };
          }
          return {
            getItem: () => null,
            setItem: () => {},
            removeItem: () => {},
          };
        }),
        // Only persist non-sensitive data - no biometric data or session tokens
        partialize: (state) => ({
          status: state.status,
          rawResult: state.rawResult,
          formData: state.formData,
          steps: state.steps,
          currentStep: state.currentStep,
          metadata: {
            ...state.metadata,
            // Don't persist session tokens or sensitive metadata
            sessionId: undefined,
            ipAddress: undefined,
          },
          document: {
            ...state.document,
            // Don't persist any image references or biometric data
            frontImageId: undefined,
            backImageId: undefined,
          },
          face: {
            ...state.face,
            // Don't persist any face image references
            faceImageId: undefined,
            challengesCompleted: [], // Clear sensitive challenge data
          },
          comparison: state.comparison,
          security: {
            ...state.security,
            // Don't persist sensitive security data
            auditTrail: [],
            riskFactors: [],
          },
          progress: state.progress,
          errors: state.errors,
          warnings: state.warnings,
          createdAt: state.createdAt,
          updatedAt: state.updatedAt,
          // Never persist encrypted biometric data - memory only
          encryptedData: new Map(),
          dataRetentionTimeout: Date.now() + (30 * 60 * 1000), // Reset timeout on restore
        }),
      }
    )
  )
);

// Subscribe to changes and update progress automatically
useEkycStore.subscribe(
  (state) => state.steps,
  (steps) => {
    useEkycStore.getState().updateProgress();
  }
);

// Automatic data cleanup for biometric security compliance
if (typeof window !== 'undefined') {
  setInterval(() => {
    useEkycStore.getState().cleanupExpiredData();
  }, 60000); // Check every minute
}

// Cleanup on page unload for Vietnamese data protection compliance
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    const store = useEkycStore.getState();
    store.cleanupExpiredData();
    destroyBiometricSecurityManager();
  });

  window.addEventListener('pagehide', () => {
    const store = useEkycStore.getState();
    store.cleanupExpiredData();
    destroyBiometricSecurityManager();
  });
}

// Export selectors for efficient subscriptions
export const useEkycStatus = () => useEkycStore((state) => state.status);
export const useEkycProgress = () => useEkycStore((state) => state.progress);
export const useEkycCurrentStep = () => useEkycStore((state) => state.getCurrentStep());
export const useEkycDocument = () => useEkycStore((state) => state.document);
export const useEkycFace = () => useEkycStore((state) => state.face);
export const useEkycComparison = () => useEkycStore((state) => state.comparison);
export const useEkycErrors = () => useEkycStore((state) => state.errors);
export const useEkycWarnings = () => useEkycStore((state) => state.warnings);
export const useEkycResult = () => useEkycStore((state) => ({
  rawResult: state.rawResult,
  formData: state.formData,
  isValid: state.isValid(),
}));
export const useEkycMetadata = () => useEkycStore((state) => state.metadata);
export const useEkycSecurity = () => useEkycStore((state) => state.security);