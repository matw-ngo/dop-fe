/**
 * Form Wizard Store - Multi-Step Form State Management
 *
 * Manages state for multi-step wizard forms with Zustand.
 * Follows project patterns: devtools + persist + immer middleware
 */

import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import type {
  FormStep,
  StepCompletionStatus,
  StepValidationStatus,
} from "@/components/form-generation/types";
import { evaluateConditions } from "../utils/helpers";

// ============================================================================
// Store Types
// ============================================================================

/**
 * Step metadata for tracking validation and completion status
 */
interface StepMeta {
  id: string;
  validationStatus: StepValidationStatus;
  completionStatus: StepCompletionStatus;
  visited: boolean;
  errors: Record<string, string>;
  touched: boolean;
}

/**
 * Wizard state
 */
interface FormWizardState {
  /** Current active step index */
  currentStep: number;

  /** All steps configuration */
  steps: FormStep[];

  /** Form data (all steps combined) */
  formData: Record<string, any>;

  /** Per-step data (isolated) */
  stepData: Record<string, Record<string, any>>;

  /** Step metadata */
  stepMeta: Record<string, StepMeta>;

  /** Visited step indices */
  visitedSteps: number[];

  /** Completed step indices */
  completedSteps: number[];

  /** Total steps in flow (may differ from steps.length for partial configs) */
  totalSteps: number;

  /** Current step index in the flow (for cross-page navigation tracking) */
  flowStepIndex: number;

  /** Wizard ID (for multi-wizard support) */
  wizardId: string;

  /** Loading states */
  isValidating: boolean;
  isSubmitting: boolean;

  /** OTP step index (detected from sendOtp flag) */
  otpStepIndex: number | null;

  /** Navigation history (step indices) */
  navigationHistory: number[];

  /** Before step change callback for navigation guards */
  beforeStepChangeCallback: ((from: number, to: number) => boolean) | null;
}

/**
 * Wizard actions
 */
interface FormWizardActions {
  // Initialization
  initWizard: (
    wizardId: string,
    steps: FormStep[],
    initialData?: Record<string, any>,
    totalSteps?: number,
    currentStepIndex?: number,
  ) => void;
  resetWizard: () => void;

  // Navigation
  goToStep: (stepIndex: number) => void;
  setCurrentStep: (stepIndex: number) => void;
  nextStep: () => Promise<boolean>;
  previousStep: () => void;
  goToStepById: (stepId: string) => void;

  // Data management
  updateStepData: (stepId: string, data: Record<string, any>) => void;
  updateFieldValue: (stepId: string, fieldName: string, value: any) => void;
  getStepData: (stepId: string) => Record<string, any>;
  getAllData: () => Record<string, any>;

  // Validation
  validateStep: (stepIndex: number) => Promise<boolean>;
  validateAllSteps: () => Promise<boolean>;
  setStepErrors: (stepId: string, errors: Record<string, string>) => void;
  clearStepErrors: (stepId: string) => void;
  clearFieldError: (stepId: string, fieldName: string) => void;

  // Step status
  markStepComplete: (stepIndex: number) => void;
  markStepVisited: (stepIndex: number) => void;
  setStepValidationStatus: (
    stepId: string,
    status: StepValidationStatus,
  ) => void;
  setStepCompletionStatus: (
    stepId: string,
    status: StepCompletionStatus,
  ) => void;

  // Utilities
  canGoToStep: (stepIndex: number) => boolean;
  isStepComplete: (stepIndex: number) => boolean;
  isStepValid: (stepIndex: number) => boolean;
  getProgress: () => { current: number; total: number; percentage: number };

  // Conditional steps
  getVisibleSteps: () => FormStep[];
  isStepVisible: (stepId: string) => boolean;

  // OTP step detection
  detectOTPStep: () => number | null;
  getOTPStepIndex: () => number | null;

  // Navigation guards
  registerBeforeStepChange: (
    callback: (from: number, to: number) => boolean,
  ) => void;
  unregisterBeforeStepChange: () => void;
  canNavigateToStep: (targetIndex: number) => boolean;

  // Navigation history
  addToNavigationHistory: (stepIndex: number) => void;
  getNavigationHistory: () => number[];
  clearNavigationHistory: () => void;
}

type FormWizardStore = FormWizardState & FormWizardActions;

// ============================================================================
// Store Implementation
// ============================================================================

export const useFormWizardStore = create<FormWizardStore>()(
  devtools(
    persist(
      immer((set, get) => ({
        // Initial state
        currentStep: 0,
        steps: [],
        formData: {},
        stepData: {},
        stepMeta: {},
        visitedSteps: [],
        completedSteps: [],
        totalSteps: 0,
        flowStepIndex: 0,
        wizardId: "",
        isValidating: false,
        isSubmitting: false,
        otpStepIndex: null,
        navigationHistory: [],
        beforeStepChangeCallback: null,

        // Initialize wizard
        initWizard: (
          wizardId,
          steps,
          initialData = {},
          totalSteps = 0,
          currentStepIndex,
        ) => {
          set((state) => {
            // Check if this is a re-initialization of the same wizard
            const isSameWizard = state.wizardId === wizardId && wizardId !== "";

            console.log("[initWizard] Called:", {
              wizardId,
              isSameWizard,
              currentStepIndex,
              existingCurrentStep: state.currentStep,
              totalSteps,
              stepsCount: steps.length,
            });

            // Merge with existing formData to preserve data across navigation
            const mergedFormData = { ...state.formData, ...initialData };

            state.wizardId = wizardId;
            state.steps = steps;
            state.formData = mergedFormData;

            // Set totalSteps from parameter if provided, otherwise use steps.length
            state.totalSteps = totalSteps > 0 ? totalSteps : steps.length;

            // Handle flowStepIndex for cross-page navigation tracking
            if (currentStepIndex !== undefined) {
              // Set flowStepIndex for global flow tracking
              console.log(
                "[initWizard] Setting flowStepIndex to:",
                currentStepIndex,
              );
              state.flowStepIndex = currentStepIndex;
            }

            // Handle currentStep initialization (for local steps array indexing)
            if (!isSameWizard && totalSteps === 0) {
              // Fresh start - reset to step 0
              console.log("[initWizard] Fresh start - resetting to step 0");
              state.currentStep = 0;
              state.flowStepIndex = 0;
              state.visitedSteps = [0];
              state.completedSteps = [];
              state.totalSteps = 0;
            } else if (state.currentStep >= steps.length) {
              // currentStep is out of bounds for the new steps config (cross-page navigation)
              // Each page has its own step config starting at index 0
              state.currentStep = 0;
            }
            // For cross-page navigation: currentStep stays 0 (single step form), flowStepIndex tracks position

            // Always ensure visitedSteps includes current step
            if (!state.visitedSteps.includes(state.currentStep)) {
              state.visitedSteps.push(state.currentStep);
            }

            // Initialize step data and meta
            state.stepData = {};
            state.stepMeta = {};

            steps.forEach((step) => {
              // Build step data from initial data
              const stepDataFromInitial: Record<string, unknown> = {};

              step.fields.forEach((field) => {
                if (initialData[field.name] !== undefined) {
                  stepDataFromInitial[field.name] = initialData[field.name];
                }
              });

              // Preserve existing step data if re-initializing same wizard
              const existingStepData = isSameWizard
                ? state.stepData[step.id]
                : {};

              state.stepData[step.id] = {
                ...stepDataFromInitial,
                ...existingStepData,
              };

              // Initialize step meta
              const existingMeta = isSameWizard
                ? state.stepMeta[step.id]
                : null;
              state.stepMeta[step.id] = existingMeta || {
                id: step.id,
                touched: false,
                visited: false,
                validationStatus: "idle",
                completionStatus: "pending",
                errors: {},
              };
            });

            // Mark current step as current in meta
            const currentStepId = steps[state.currentStep]?.id;
            if (currentStepId && state.stepMeta[currentStepId]) {
              state.stepMeta[currentStepId].completionStatus = "current";
              state.stepMeta[currentStepId].visited = true;
            }
          });
        },

        // Reset wizard
        resetWizard: () => {
          set({
            currentStep: 0,
            steps: [],
            formData: {},
            stepData: {},
            stepMeta: {},
            visitedSteps: [],
            completedSteps: [],
            wizardId: "",
            isValidating: false,
            isSubmitting: false,
            otpStepIndex: null,
            navigationHistory: [],
            beforeStepChangeCallback: null,
          });
        },

        // Navigate to step by index
        goToStep: (stepIndex) => {
          const { steps, canGoToStep, addToNavigationHistory, currentStep } =
            get();
          console.log("[goToStep] Called:", {
            fromStep: currentStep,
            toStep: stepIndex,
            totalSteps: steps.length,
          });

          if (
            stepIndex >= 0 &&
            stepIndex < steps.length &&
            canGoToStep(stepIndex)
          ) {
            set((state) => {
              // Update current step
              const prevStep = state.steps[state.currentStep];
              const nextStep = state.steps[stepIndex];

              if (prevStep) {
                state.stepMeta[prevStep.id].completionStatus =
                  state.completedSteps.includes(state.currentStep)
                    ? "complete"
                    : "pending";
              }

              if (nextStep) {
                state.stepMeta[nextStep.id].completionStatus = "current";
                state.stepMeta[nextStep.id].visited = true;
              }

              state.currentStep = stepIndex;

              if (!state.visitedSteps.includes(stepIndex)) {
                state.visitedSteps.push(stepIndex);
              }

              console.log("[goToStep] State updated:", {
                currentStep: state.currentStep,
                visitedSteps: state.visitedSteps,
                completedSteps: state.completedSteps,
              });
            });

            // Add to navigation history
            addToNavigationHistory(stepIndex);
          } else {
            console.warn("[goToStep] Blocked:", {
              stepIndex,
              canGo: canGoToStep(stepIndex),
            });
          }
        },

        // Go to next step (with validation)
        nextStep: async () => {
          const {
            currentStep,
            steps,
            validateStep,
            markStepComplete,
            goToStep,
          } = get();

          console.log("[nextStep] Called:", {
            currentStep,
            totalSteps: steps.length,
          });

          // Validate current step
          const isValid = await validateStep(currentStep);

          if (!isValid) {
            console.log("[nextStep] Validation failed:", { currentStep });
            return false;
          }

          // Mark current step as complete
          markStepComplete(currentStep);

          // Move to next step
          if (currentStep < steps.length - 1) {
            console.log("[nextStep] Moving to step:", currentStep + 1);
            goToStep(currentStep + 1);
          }

          return true;
        },

        // Go to previous step
        previousStep: () => {
          const { currentStep, goToStep } = get();
          if (currentStep > 0) {
            goToStep(currentStep - 1);
          }
        },

        // Set current step directly (for external navigation control)
        setCurrentStep: (stepIndex) => {
          set((state) => {
            state.currentStep = stepIndex;
            if (!state.visitedSteps.includes(stepIndex)) {
              state.visitedSteps.push(stepIndex);
            }
          });
        },

        // Go to step by ID
        goToStepById: (stepId) => {
          const { steps } = get();
          const stepIndex = steps.findIndex((s) => s.id === stepId);
          if (stepIndex !== -1) {
            get().goToStep(stepIndex);
          }
        },

        // Update step data
        updateStepData: (stepId, data) => {
          set((state) => {
            state.stepData[stepId] = { ...state.stepData[stepId], ...data };
            state.formData = { ...state.formData, ...data };
            state.stepMeta[stepId].touched = true;
          });
        },

        // Update single field value
        updateFieldValue: (stepId, fieldName, value) => {
          set((state) => {
            if (!state.stepData[stepId]) {
              state.stepData[stepId] = {};
            }
            state.stepData[stepId][fieldName] = value;
            state.formData[fieldName] = value;
            state.stepMeta[stepId].touched = true;
          });
        },

        // Get step data
        getStepData: (stepId) => {
          return get().stepData[stepId] || {};
        },

        // Get all data
        getAllData: () => {
          return get().formData;
        },

        // Validate step
        validateStep: async (stepIndex) => {
          const { steps, formData, stepData } = get();
          const step = steps[stepIndex];

          // If step not found in store, skip validation (for cross-page navigation)
          // This happens when StepWizard only has current step config, not all flow steps
          if (!step) {
            console.log(
              "[validateStep] Step not found in store, skipping validation:",
              { stepIndex, totalSteps: steps.length },
            );
            return true;
          }

          set((state) => {
            state.isValidating = true;
            state.stepMeta[step.id].validationStatus = "validating";
          });

          try {
            const errors: Record<string, string> = {};
            const currentStepData = stepData[step.id] || {};

            // Field-level validation using ValidationEngine
            for (const field of step.fields) {
              if (!field.validation || field.validation.length === 0) {
                continue;
              }

              // Check if field is visible/enabled based on dependencies
              let shouldValidate = true;
              if (field.dependencies && field.dependencies.length > 0) {
                const isVisible = field.dependencies.every((dep) => {
                  const conditionsMet = evaluateConditions(
                    dep.conditions,
                    formData,
                    dep.logic,
                  );

                  if (dep.action === "show") return conditionsMet;
                  if (dep.action === "hide") return !conditionsMet;
                  if (dep.action === "disable") return !conditionsMet; // Skip if disabled
                  if (dep.action === "enable") return conditionsMet; // Skip if not enabled

                  return true;
                });

                if (!isVisible) {
                  shouldValidate = false;
                }
              }

              // Also check static disabled state
              if (field.disabled) {
                shouldValidate = false;
              }

              if (!shouldValidate) {
                continue;
              }

              const fieldValue = currentStepData[field.name];

              // Import ValidationEngine dynamically
              const { ValidationEngine } = await import(
                "../validation/ValidationEngine"
              );

              // Validate each rule

              // Validate using engine
              const result = await ValidationEngine.validateField(
                fieldValue,
                field.validation,
              );

              if (!result.valid && result.error) {
                errors[field.name] = result.error;
              }
            }

            // Custom step-level validation
            if (step.validation?.customValidator) {
              const result = await step.validation.customValidator(
                currentStepData,
                formData,
              );

              if (typeof result === "string") {
                // Validation failed with message
                errors._step = result;
              } else if (!result) {
                // Validation failed without message
                errors._step = "Please fix the errors above";
              }
            }

            // Check if there are any errors
            const hasErrors = Object.keys(errors).length > 0;

            set((state) => {
              // Safety check: ensure step meta still exists (wizard might be reset)
              if (!state.stepMeta[step.id]) return;

              state.stepMeta[step.id].validationStatus = hasErrors
                ? "invalid"
                : "valid";
              state.stepMeta[step.id].errors = errors;
              state.isValidating = false;
            });

            return !hasErrors;
          } catch (error) {
            console.error("Step validation error:", error);
            set((state) => {
              // Safety check
              if (!state.stepMeta[step.id]) return;

              state.stepMeta[step.id].validationStatus = "invalid";
              state.stepMeta[step.id].errors = {
                _step: "Validation error occurred",
              };
              state.isValidating = false;
            });
            return false;
          }
        },

        // Validate all steps
        validateAllSteps: async () => {
          const { steps } = get();
          const results = await Promise.all(
            steps.map((_, index) => get().validateStep(index)),
          );
          return results.every((r) => r);
        },

        // Set step errors
        setStepErrors: (stepId, errors) => {
          set((state) => {
            state.stepMeta[stepId].errors = errors;
            state.stepMeta[stepId].validationStatus = "invalid";
          });
        },

        // Clear step errors
        clearStepErrors: (stepId) => {
          set((state) => {
            state.stepMeta[stepId].errors = {};
          });
        },

        // Clear single field error
        clearFieldError: (stepId, fieldName) => {
          set((state) => {
            if (state.stepMeta[stepId]?.errors) {
              delete state.stepMeta[stepId].errors[fieldName];

              // If no more errors, update validation status
              if (Object.keys(state.stepMeta[stepId].errors).length === 0) {
                state.stepMeta[stepId].validationStatus = "valid";
              }
            }
          });
        },

        // Mark step as complete
        markStepComplete: (stepIndex) => {
          const { steps } = get();
          const step = steps[stepIndex];

          if (step) {
            set((state) => {
              state.stepMeta[step.id].completionStatus = "complete";
              if (!state.completedSteps.includes(stepIndex)) {
                state.completedSteps.push(stepIndex);
              }
            });
          }
        },

        // Mark step as visited
        markStepVisited: (stepIndex) => {
          const { steps } = get();
          const step = steps[stepIndex];

          if (step) {
            set((state) => {
              state.stepMeta[step.id].visited = true;
              if (!state.visitedSteps.includes(stepIndex)) {
                state.visitedSteps.push(stepIndex);
              }
            });
          }
        },

        // Set validation status
        setStepValidationStatus: (stepId, status) => {
          set((state) => {
            state.stepMeta[stepId].validationStatus = status;
          });
        },

        // Set completion status
        setStepCompletionStatus: (stepId, status) => {
          set((state) => {
            state.stepMeta[stepId].completionStatus = status;
          });
        },

        // Can go to step
        canGoToStep: (stepIndex) => {
          // Delegate to canNavigateToStep for enhanced logic
          return get().canNavigateToStep(stepIndex);
        },

        // Is step complete
        isStepComplete: (stepIndex) => {
          return get().completedSteps.includes(stepIndex);
        },

        // Is step valid
        isStepValid: (stepIndex) => {
          const { steps } = get();
          const step = steps[stepIndex];
          return step
            ? get().stepMeta[step.id]?.validationStatus === "valid"
            : false;
        },

        // Get progress
        getProgress: () => {
          const { currentStep, steps } = get();
          return {
            current: currentStep + 1,
            total: steps.length,
            percentage: ((currentStep + 1) / steps.length) * 100,
          };
        },

        // Get visible steps (considering conditions)
        getVisibleSteps: () => {
          const { steps, isStepVisible } = get();
          return steps.filter((step) => isStepVisible(step.id));
        },

        // Check if step is visible
        isStepVisible: (stepId) => {
          const { steps, formData } = get();
          const step = steps.find((s) => s.id === stepId);

          if (!step || !step.condition || step.condition.length === 0) {
            return true; // No conditions, always visible
          }

          // Import condition evaluator
          const { evaluateConditions } = require("../utils/helpers");

          // Evaluate all conditions - all must pass
          return step.condition.every((cond) => {
            const _fieldValue = formData[cond.field];
            return evaluateConditions([cond], formData);
          });
        },

        // OTP step detection
        detectOTPStep: () => {
          const { steps } = get();

          // Find first step with sendOtp: true
          const otpStepIndex = steps.findIndex((step) => {
            return (step as any).sendOtp === true;
          });

          set((state) => {
            state.otpStepIndex = otpStepIndex !== -1 ? otpStepIndex : null;
          });

          return otpStepIndex !== -1 ? otpStepIndex : null;
        },

        // Get OTP step index
        getOTPStepIndex: () => {
          return get().otpStepIndex;
        },

        // Register before step change callback
        registerBeforeStepChange: (callback) => {
          set((state) => {
            state.beforeStepChangeCallback = callback;
          });
        },

        // Unregister before step change callback
        unregisterBeforeStepChange: () => {
          set((state) => {
            state.beforeStepChangeCallback = null;
          });
        },

        // Enhanced can navigate to step
        canNavigateToStep: (targetIndex) => {
          const {
            steps,
            completedSteps,
            visitedSteps,
            otpStepIndex,
            beforeStepChangeCallback,
            currentStep,
          } = get();

          const step = steps[targetIndex];
          if (!step) return false;

          // Call beforeStepChange callback if registered
          if (beforeStepChangeCallback) {
            const allowed = beforeStepChangeCallback(currentStep, targetIndex);
            if (!allowed) return false;
          }

          // Check verification session lock from auth store
          // Import dynamically to avoid circular dependency
          const { useAuthStore } = require("@/store/use-auth-store");
          const authStore = useAuthStore.getState();
          if (!authStore.canNavigateBack(targetIndex)) {
            return false;
          }

          // Allow navigation to visited steps
          if (visitedSteps.includes(targetIndex)) {
            return true;
          }

          // If step is locked, previous steps must be complete
          if (step.locked) {
            for (let i = 0; i < targetIndex; i++) {
              if (!completedSteps.includes(i)) {
                return false;
              }
            }
          }

          return true;
        },

        // Add to navigation history
        addToNavigationHistory: (stepIndex) => {
          set((state) => {
            state.navigationHistory.push(stepIndex);
          });
        },

        // Get navigation history
        getNavigationHistory: () => {
          return get().navigationHistory;
        },

        // Clear navigation history
        clearNavigationHistory: () => {
          set((state) => {
            state.navigationHistory = [];
          });
        },
      })),
      {
        name: "form-wizard-storage",
        partialize: (state) => ({
          wizardId: state.wizardId,
          formData: state.formData,
          stepData: state.stepData,
          currentStep: state.currentStep,
          visitedSteps: state.visitedSteps,
          completedSteps: state.completedSteps,
          totalSteps: state.totalSteps,
        }),
      },
    ),
    {
      name: "FormWizardStore",
    },
  ),
);

// ============================================================================
// Convenience Selectors
// ============================================================================

export const useCurrentStep = () =>
  useFormWizardStore((state) => state.currentStep);

export const useFormWizardData = () =>
  useFormWizardStore((state) => state.formData);

export const useWizardProgress = () =>
  useFormWizardStore((state) => state.getProgress());

export const useStepMeta = (stepId: string) =>
  useFormWizardStore((state) => state.stepMeta[stepId]);

export const useWizardSteps = () => useFormWizardStore((state) => state.steps);

export const useIsStepComplete = (stepIndex: number) =>
  useFormWizardStore((state) => state.isStepComplete(stepIndex));

export const useCanGoToStep = (stepIndex: number) =>
  useFormWizardStore((state) => state.canGoToStep(stepIndex));
