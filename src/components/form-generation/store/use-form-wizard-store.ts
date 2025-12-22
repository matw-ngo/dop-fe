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

  /** Wizard ID (for multi-wizard support) */
  wizardId: string;

  /** Loading states */
  isValidating: boolean;
  isSubmitting: boolean;
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
  ) => void;
  resetWizard: () => void;

  // Navigation
  goToStep: (stepIndex: number) => void;
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
        wizardId: "",
        isValidating: false,
        isSubmitting: false,

        // Initialize wizard
        initWizard: (wizardId, steps, initialData = {}) => {
          set((state) => {
            state.wizardId = wizardId;
            state.steps = steps;
            state.formData = initialData;
            state.currentStep = 0;
            state.visitedSteps = [0];
            state.completedSteps = [];

            // Initialize step metadata
            steps.forEach((step) => {
              state.stepMeta[step.id] = {
                id: step.id,
                validationStatus: "idle",
                completionStatus: "pending",
                visited: false,
                errors: {},
                touched: false,
              };
              state.stepData[step.id] = {};
            });

            // Mark first step as current
            if (steps[0]) {
              state.stepMeta[steps[0].id].completionStatus = "current";
              state.stepMeta[steps[0].id].visited = true;
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
          });
        },

        // Navigate to step by index
        goToStep: (stepIndex) => {
          const { steps, canGoToStep } = get();
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

          // Validate current step
          const isValid = await validateStep(currentStep);

          if (!isValid) {
            return false;
          }

          // Mark current step as complete
          markStepComplete(currentStep);

          // Move to next step
          if (currentStep < steps.length - 1) {
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

          if (!step) return false;

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
          const { steps, completedSteps, visitedSteps } = get();
          const step = steps[stepIndex];

          if (!step) return false;

          // Always allow going to visited steps
          if (visitedSteps.includes(stepIndex)) {
            return true;
          }

          // If step is locked, previous steps must be complete
          if (step.locked) {
            for (let i = 0; i < stepIndex; i++) {
              if (!completedSteps.includes(i)) {
                return false;
              }
            }
          }

          return true;
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
            const fieldValue = formData[cond.field];
            return evaluateConditions([cond], formData);
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
