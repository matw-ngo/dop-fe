// Loan Application Store
// Zustand store for managing loan application state and persistence

import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import type {
  DocumentUploadData,
  EmploymentInfoData,
  FinancialInfoData,
  LoanApplicationData,
  LoanDetailsData,
  PersonalInfoData,
} from "@/types/forms/loan-form";

/**
 * Application Summary interface
 */
interface ApplicationSummary {
  personalInfo: {
    fullName?: string;
    phoneNumber?: string;
    email?: string;
  };
  loanDetails: {
    requestedAmount?: number;
    loanTerm?: number;
    loanPurpose?: string;
  };
  completionPercentage: number;
  isReadyForSubmission: boolean;
}

/**
 * Loan Application Store State
 */
interface LoanApplicationStoreState {
  /** Current application data */
  applicationData: Partial<LoanApplicationData>;

  /** Current step in the multi-step form */
  currentStep: number;

  /** Total number of steps */
  totalSteps: number;

  /** Form completion status for each step */
  stepCompletion: Record<number, boolean>;

  /** Form validation status for each step */
  stepValidation: Record<number, boolean>;

  /** Whether the form is currently submitting */
  isSubmitting: boolean;

  /** Application submission status */
  submissionStatus: "idle" | "submitting" | "success" | "error";

  /** Last submission error */
  submissionError?: string;

  /** Whether the form data is being loaded from persistence */
  isLoading: boolean;

  /** Whether the form has been initialized */
  isInitialized: boolean;

  /** Field-level validation errors */
  fieldErrors: Record<string, string>;

  /** Document upload status */
  documentUploadStatus: {
    [key: string]: "pending" | "uploading" | "completed" | "failed";
  };
}

/**
 * Loan Application Store Actions
 */
interface LoanApplicationStoreActions {
  // Navigation actions
  /** Set current step */
  setCurrentStep: (step: number) => void;

  /** Go to next step */
  nextStep: () => void;

  /** Go to previous step */
  previousStep: () => void;

  /** Reset to first step */
  resetToFirstStep: () => void;

  // Step management
  /** Set total number of steps */
  setTotalSteps: (total: number) => void;

  /** Mark step as completed */
  markStepCompleted: (step: number) => void;

  /** Mark step validation status */
  markStepValidation: (step: number, isValid: boolean) => void;

  /** Check if current step is the first */
  isFirstStep: () => boolean;

  /** Check if current step is the last */
  isLastStep: () => boolean;

  /** Check if step is completed */
  isStepCompleted: (step: number) => boolean;

  /** Check if step is valid */
  isStepValid: (step: number) => boolean;

  // Data management actions
  /** Update personal information */
  updatePersonalInfo: (data: Partial<PersonalInfoData>) => void;

  /** Update financial information */
  updateFinancialInfo: (data: Partial<FinancialInfoData>) => void;

  /** Update employment information */
  updateEmploymentInfo: (data: Partial<EmploymentInfoData>) => void;

  /** Update document upload data */
  updateDocuments: (data: Partial<DocumentUploadData>) => void;

  /** Update loan details */
  updateLoanDetails: (data: Partial<LoanDetailsData>) => void;

  /** Update application metadata */
  updateMetadata: (data: Partial<LoanApplicationData["metadata"]>) => void;

  /** Update entire application data */
  updateApplicationData: (data: Partial<LoanApplicationData>) => void;

  /** Get field value */
  getFieldValue: <T = unknown>(fieldName: string) => T | undefined;

  /** Set field value */
  setFieldValue: <T = unknown>(fieldName: string, value: T) => void;

  // Validation actions
  /** Set field error */
  setFieldError: (fieldName: string, error: string) => void;

  /** Clear field error */
  clearFieldError: (fieldName: string) => void;

  /** Clear all field errors */
  clearAllFieldErrors: () => void;

  /** Validate current step */
  validateCurrentStep: () => boolean;

  /** Validate all steps */
  validateAllSteps: () => boolean;

  // Document upload actions
  /** Set document upload status */
  setDocumentUploadStatus: (
    documentKey: string,
    status: "pending" | "uploading" | "completed" | "failed",
  ) => void;

  /** Check if all documents are uploaded */
  areAllDocumentsUploaded: () => boolean;

  // Submission actions
  /** Start submission */
  startSubmission: () => void;

  /** Set submission success */
  setSubmissionSuccess: () => void;

  /** Set submission error */
  setSubmissionError: (error: string) => void;

  /** Reset submission status */
  resetSubmissionStatus: () => void;

  // Form lifecycle actions
  /** Initialize form */
  initializeForm: () => void;

  /** Reset entire form */
  resetForm: () => void;

  /** Save form to persistence */
  saveToPersistence: () => void;

  /** Load form from persistence */
  loadFromPersistence: () => void;

  /** Clear persisted data */
  clearPersistedData: () => void;

  // Utility actions
  /** Get form completion percentage */
  getCompletionPercentage: () => number;

  /** Get required fields for current step */
  getRequiredFields: (step: number) => string[];

  /** Check if form is ready for submission */
  isReadyForSubmission: () => boolean;

  /** Generate application summary */
  generateSummary: () => ApplicationSummary;
}

/**
 * Combined Loan Application Store Type
 */
type LoanApplicationStore = LoanApplicationStoreState &
  LoanApplicationStoreActions;

/**
 * Loan Application Store Implementation
 */
export const useLoanApplicationStore = create<LoanApplicationStore>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        applicationData: {
          metadata: {
            applicationDate: new Date().toISOString(),
            status: "draft",
            sourceChannel: "web",
            marketingConsent: false,
          },
        },
        currentStep: 0,
        totalSteps: 5,
        stepCompletion: {},
        stepValidation: {},
        isSubmitting: false,
        submissionStatus: "idle",
        isLoading: false,
        isInitialized: false,
        fieldErrors: {},
        documentUploadStatus: {},

        // Navigation actions
        setCurrentStep: (step: number) => {
          const { totalSteps } = get();
          if (step >= 0 && step < totalSteps) {
            set({ currentStep: step }, false, "setCurrentStep");
          }
        },

        nextStep: () => {
          const { currentStep, totalSteps } = get();
          if (currentStep < totalSteps - 1) {
            set({ currentStep: currentStep + 1 }, false, "nextStep");
          }
        },

        previousStep: () => {
          const { currentStep } = get();
          if (currentStep > 0) {
            set({ currentStep: currentStep - 1 }, false, "previousStep");
          }
        },

        resetToFirstStep: () => {
          set({ currentStep: 0 }, false, "resetToFirstStep");
        },

        // Step management
        setTotalSteps: (total: number) => {
          if (total > 0) {
            set({ totalSteps: total }, false, "setTotalSteps");
          }
        },

        markStepCompleted: (step: number) => {
          set(
            (state) => ({
              stepCompletion: { ...state.stepCompletion, [step]: true },
            }),
            false,
            "markStepCompleted",
          );
        },

        markStepValidation: (step: number, isValid: boolean) => {
          set(
            (state) => ({
              stepValidation: { ...state.stepValidation, [step]: isValid },
            }),
            false,
            "markStepValidation",
          );
        },

        isFirstStep: () => {
          return get().currentStep === 0;
        },

        isLastStep: () => {
          const { currentStep, totalSteps } = get();
          return currentStep === totalSteps - 1;
        },

        isStepCompleted: (step: number) => {
          return get().stepCompletion[step] || false;
        },

        isStepValid: (step: number) => {
          return get().stepValidation[step] || false;
        },

        // Data management actions
        updatePersonalInfo: (data: Partial<PersonalInfoData>) => {
          set(
            (state) => ({
              applicationData: {
                ...state.applicationData,
                personalInfo: {
                  ...state.applicationData.personalInfo,
                  ...data,
                },
              },
            }),
            false,
            "updatePersonalInfo",
          );
        },

        updateFinancialInfo: (data: Partial<FinancialInfoData>) => {
          set(
            (state) => ({
              applicationData: {
                ...state.applicationData,
                financialInfo: {
                  ...state.applicationData.financialInfo,
                  ...data,
                },
              },
            }),
            false,
            "updateFinancialInfo",
          );
        },

        updateEmploymentInfo: (data: Partial<EmploymentInfoData>) => {
          set(
            (state) => ({
              applicationData: {
                ...state.applicationData,
                employmentInfo: {
                  ...state.applicationData.employmentInfo,
                  ...data,
                },
              },
            }),
            false,
            "updateEmploymentInfo",
          );
        },

        updateDocuments: (data: Partial<DocumentUploadData>) => {
          set(
            (state) => ({
              applicationData: {
                ...state.applicationData,
                documents: {
                  ...state.applicationData.documents,
                  ...data,
                },
              },
            }),
            false,
            "updateDocuments",
          );
        },

        updateLoanDetails: (data: Partial<LoanDetailsData>) => {
          set(
            (state) => ({
              applicationData: {
                ...state.applicationData,
                loanDetails: {
                  ...state.applicationData.loanDetails,
                  ...data,
                },
              },
            }),
            false,
            "updateLoanDetails",
          );
        },

        updateMetadata: (data: Partial<LoanApplicationData["metadata"]>) => {
          set(
            (state) => ({
              ...state,
              applicationData: {
                ...state.applicationData,
                metadata: {
                  ...state.applicationData.metadata,
                  ...data,
                },
              },
            }),
            false,
            "updateMetadata",
          );
        },

        updateApplicationData: (data: Partial<LoanApplicationData>) => {
          set(
            (state) => ({
              ...state,
              applicationData: {
                ...state.applicationData,
                ...data,
              },
            }),
            false,
            "updateApplicationData",
          );
        },

        getFieldValue: <T = unknown>(fieldName: string): T | undefined => {
          const { applicationData } = get();
          // Navigate through the nested object to find the field
          const fieldPath = fieldName.split(".");
          let value: unknown = applicationData;

          for (const path of fieldPath) {
            if (value && typeof value === "object" && path in value) {
              value = (value as Record<string, unknown>)[path];
            } else {
              return undefined;
            }
          }

          return value as T | undefined;
        },

        setFieldValue: <T = unknown>(fieldName: string, value: T) => {
          const fieldPath = fieldName.split(".");
          const { applicationData } = get();
          const newData = { ...applicationData };

          // Navigate to the parent object and set the value
          let current: Record<string, unknown> = newData;
          for (let i = 0; i < fieldPath.length - 1; i++) {
            const path = fieldPath[i];
            if (!current[path] || typeof current[path] !== "object") {
              current[path] = {};
            }
            current = current[path] as Record<string, unknown>;
          }

          current[fieldPath[fieldPath.length - 1]] = value;

          set({ applicationData: newData }, false, "setFieldValue");
        },

        // Validation actions
        setFieldError: (fieldName: string, error: string) => {
          set(
            (state) => ({
              fieldErrors: { ...state.fieldErrors, [fieldName]: error },
            }),
            false,
            "setFieldError",
          );
        },

        clearFieldError: (fieldName: string) => {
          set(
            (state) => {
              const newErrors = { ...state.fieldErrors };
              delete newErrors[fieldName];
              return { fieldErrors: newErrors };
            },
            false,
            "clearFieldError",
          );
        },

        clearAllFieldErrors: () => {
          set({ fieldErrors: {} }, false, "clearAllFieldErrors");
        },

        validateCurrentStep: () => {
          // This would be implemented with actual validation logic
          // For now, return true as a placeholder
          return true;
        },

        validateAllSteps: () => {
          const { totalSteps, stepValidation } = get();
          for (let i = 0; i < totalSteps; i++) {
            if (!stepValidation[i]) {
              return false;
            }
          }
          return true;
        },

        // Document upload actions
        setDocumentUploadStatus: (
          documentKey: string,
          status: "pending" | "uploading" | "completed" | "failed",
        ) => {
          set(
            (state) => ({
              documentUploadStatus: {
                ...state.documentUploadStatus,
                [documentKey]: status,
              },
            }),
            false,
            "setDocumentUploadStatus",
          );
        },

        areAllDocumentsUploaded: () => {
          const { documentUploadStatus } = get();
          return Object.values(documentUploadStatus).every(
            (status) => status === "completed",
          );
        },

        // Submission actions
        startSubmission: () => {
          set(
            {
              isSubmitting: true,
              submissionStatus: "submitting",
              submissionError: undefined,
            },
            false,
            "startSubmission",
          );
        },

        setSubmissionSuccess: () => {
          set(
            {
              isSubmitting: false,
              submissionStatus: "success",
              submissionError: undefined,
            },
            false,
            "setSubmissionSuccess",
          );
        },

        setSubmissionError: (error: string) => {
          set(
            {
              isSubmitting: false,
              submissionStatus: "error",
              submissionError: error,
            },
            false,
            "setSubmissionError",
          );
        },

        resetSubmissionStatus: () => {
          set(
            {
              isSubmitting: false,
              submissionStatus: "idle",
              submissionError: undefined,
            },
            false,
            "resetSubmissionStatus",
          );
        },

        // Form lifecycle actions
        initializeForm: () => {
          const state = get();
          if (!state.isInitialized) {
            set(
              {
                isInitialized: true,
                isLoading: false,
              },
              false,
              "initializeForm",
            );
          }
        },

        resetForm: () => {
          set(
            {
              applicationData: {
                metadata: {
                  applicationDate: new Date().toISOString(),
                  status: "draft",
                  sourceChannel: "web",
                  marketingConsent: false,
                },
              },
              currentStep: 0,
              stepCompletion: {},
              stepValidation: {},
              fieldErrors: {},
              documentUploadStatus: {},
              submissionStatus: "idle",
              submissionError: undefined,
            },
            false,
            "resetForm",
          );
        },

        saveToPersistence: () => {
          // Persistence is handled automatically by zustand persist middleware
        },

        loadFromPersistence: () => {
          // Loading is handled automatically by zustand persist middleware
        },

        clearPersistedData: () => {
          // Clear localStorage
          if (typeof window !== "undefined") {
            localStorage.removeItem("loan-application-storage");
          }
        },

        // Utility actions
        getCompletionPercentage: () => {
          const { totalSteps, stepCompletion } = get();
          const completedSteps = Object.keys(stepCompletion).length;
          return Math.round((completedSteps / totalSteps) * 100);
        },

        getRequiredFields: (_step: number) => {
          // This would return the required fields for a specific step
          // Implementation would depend on the step configuration
          return [];
        },

        isReadyForSubmission: () => {
          const { validateAllSteps, areAllDocumentsUploaded } = get();
          return validateAllSteps() && areAllDocumentsUploaded();
        },

        generateSummary: () => {
          const { applicationData } = get();
          return {
            personalInfo: {
              fullName: applicationData.personalInfo?.fullName,
              phoneNumber: applicationData.personalInfo?.phoneNumber,
              email: applicationData.personalInfo?.email,
            },
            loanDetails: {
              requestedAmount: applicationData.loanDetails?.requestedAmount,
              loanTerm: applicationData.loanDetails?.loanTerm,
              loanPurpose: applicationData.loanDetails?.loanPurpose,
            },
            completionPercentage: get().getCompletionPercentage(),
            isReadyForSubmission: get().isReadyForSubmission(),
          };
        },
      }),
      {
        name: "loan-application-storage",
        // Only persist specific fields to avoid bloating storage
        partialize: (state) => ({
          applicationData: state.applicationData,
          currentStep: state.currentStep,
          totalSteps: state.totalSteps,
          stepCompletion: state.stepCompletion,
          stepValidation: state.stepValidation,
          documentUploadStatus: state.documentUploadStatus,
        }),
      },
    ),
    {
      name: "LoanApplicationStore",
    },
  ),
);

/**
 * Selectors for common use cases
 */
export const useCurrentStep = () =>
  useLoanApplicationStore((state) => state.currentStep);
export const useApplicationData = () =>
  useLoanApplicationStore((state) => state.applicationData);
export const usePersonalInfo = () =>
  useLoanApplicationStore((state) => state.applicationData.personalInfo);
export const useFinancialInfo = () =>
  useLoanApplicationStore((state) => state.applicationData.financialInfo);
export const useEmploymentInfo = () =>
  useLoanApplicationStore((state) => state.applicationData.employmentInfo);
export const useLoanDetails = () =>
  useLoanApplicationStore((state) => state.applicationData.loanDetails);
export const useDocuments = () =>
  useLoanApplicationStore((state) => state.applicationData.documents);
export const useSubmissionStatus = () =>
  useLoanApplicationStore((state) => state.submissionStatus);
export const useIsSubmitting = () =>
  useLoanApplicationStore((state) => state.isSubmitting);
export const useFieldErrors = () =>
  useLoanApplicationStore((state) => state.fieldErrors);
export const useDocumentUploadStatus = () =>
  useLoanApplicationStore((state) => state.documentUploadStatus);

/**
 * Hook for loan application form hydration
 */
export const useLoanApplicationHydrated = () => {
  const [hydrated, setHydrated] = React.useState(false);
  const { initializeForm } = useLoanApplicationStore();

  React.useEffect(() => {
    initializeForm();
    setHydrated(true);
  }, [initializeForm]);

  return hydrated;
};

// Import React for the hook
import React from "react";
