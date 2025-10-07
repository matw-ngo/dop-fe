// Multi-step form types for Data-Driven UI system
// Supports step-by-step forms with progress tracking and state management

import type { RawFieldConfig } from "./data-driven-ui";

/**
 * Configuration for a single step in a multi-step form
 */
export interface StepConfig {
  /** Unique identifier for this step */
  id: string;

  /** Display title for this step */
  title: string;

  /** Optional description for this step */
  description?: string;

  /** Fields to render in this step */
  fields: RawFieldConfig[];

  /** Optional validation that applies to the entire step */
  stepValidation?: {
    /** Custom validation function that runs before proceeding to next step */
    validate?: (data: Record<string, any>) => Promise<boolean | string>;
  };

  /** Whether this step can be skipped */
  optional?: boolean;

  /** Icon for this step (optional) */
  icon?: React.ReactNode;
}

/**
 * Configuration for the entire multi-step form
 */
export interface MultiStepFormConfig {
  /** Array of step configurations */
  steps: StepConfig[];

  /** Initial step index (default: 0) */
  initialStep?: number;

  /** Whether to allow navigation to previous steps */
  allowBackNavigation?: boolean;

  /** Whether to show progress indicator */
  showProgress?: boolean;

  /** Progress display style */
  progressStyle?: "steps" | "bar" | "dots";

  /** Whether to persist form data (e.g., localStorage) */
  persistData?: boolean;

  /** Key for localStorage if persistData is true */
  persistKey?: string;

  /** Callback when a step is completed */
  onStepComplete?: (
    stepId: string,
    stepData: Record<string, any>,
  ) => void | Promise<void>;

  /** Callback when form is fully completed */
  onComplete?: (allData: Record<string, any>) => void | Promise<void>;

  /** Callback when navigation occurs */
  onStepChange?: (fromStep: number, toStep: number) => void;
}

/**
 * State for managing multi-step form
 */
export interface MultiStepFormState {
  /** Current active step index */
  currentStep: number;

  /** Data collected from all steps */
  formData: Record<string, any>;

  /** Validation status for each step */
  stepValidation: Record<string, boolean>;

  /** Completion status for each step */
  completedSteps: Set<number>;

  /** Whether the form is currently submitting */
  isSubmitting: boolean;
}

/**
 * Actions for multi-step form state management
 */
export interface MultiStepFormActions {
  /** Navigate to next step */
  goToNextStep: () => Promise<boolean>;

  /** Navigate to previous step */
  goToPreviousStep: () => void;

  /** Jump to a specific step */
  goToStep: (stepIndex: number) => void;

  /** Update data for current step */
  updateStepData: (data: Record<string, any>) => void;

  /** Mark current step as complete */
  completeCurrentStep: () => void;

  /** Reset the entire form */
  resetForm: () => void;

  /** Save form data to persistence layer */
  saveFormData: () => void;

  /** Load form data from persistence layer */
  loadFormData: () => void;
}

/**
 * Props for MultiStepFormRenderer component
 */
export interface MultiStepFormRendererProps {
  /** Configuration for the multi-step form */
  config: MultiStepFormConfig;

  /** Optional className for the container */
  className?: string;

  /** Optional namespace for translations */
  translationNamespace?: string;

  /** Custom navigation buttons renderer */
  renderNavigation?: (
    state: MultiStepFormState,
    actions: MultiStepFormActions,
  ) => React.ReactNode;

  /** Custom progress indicator renderer */
  renderProgress?: (
    state: MultiStepFormState,
    config: MultiStepFormConfig,
  ) => React.ReactNode;
}
