// TypeScript definitions for Data-Driven UI system
// Based on the API Reference documentation

import type { FieldCondition } from "./field-conditions";

// Re-export for convenience
export type { FieldCondition };

/**
 * Validation rule definition for form fields
 */
export interface ValidationRule {
  /** Type of validation rule, corresponds to Zod methods (e.g., "required", "minLength", "email") */
  type: string;

  /** Value for the rule (if applicable), e.g., 8 for minLength */
  value?: any;

  /** i18n key for error message */
  messageKey: string;
}

/**
 * Properties that can be passed to form field components
 */
export interface FieldProps {
  /** (Optional) i18n key for field label */
  labelKey?: string;

  /** (Optional) i18n key for field placeholder */
  placeholderKey?: string;

  /** (Optional) i18n key for field description/help text */
  descriptionKey?: string;

  /** (Optional) Array of validation rules for the field */
  validations?: ValidationRule[];

  /** (Optional) Async options configuration for dynamic select/dropdown fields */
  optionsFetcher?: {
    /** Function to fetch options from API */
    fetcher: (params?: any) => Promise<any[]>;
    /** Transform function to convert API response to options format */
    transform?: (
      data: any[],
    ) => Array<{ value: string; label: string; disabled?: boolean }>;
    /** Cache key for caching fetched options */
    cacheKey?: string;
    /** Cache duration in milliseconds */
    cacheDuration?: number;
    /** Field names this fetcher depends on (for cascading selects) */
    dependsOn?: string[];
  };

  /** Any other props will be passed directly to the component */
  [key: string]: any;
}

// FieldCondition types are now in field-conditions.ts for better organization and complex logic support

/**
 * Complete configuration for a form field after merging with defaults
 */
export interface FieldConfig {
  /** Unique identifier for the field, used by react-hook-form */
  fieldName: string;

  /** Name of registered component to render */
  component: string;

  /** Props to pass to the component */
  props: FieldProps;

  /** (Optional) Condition for rendering this field */
  condition?: FieldCondition;
}

/**
 * Configuration for a form step containing multiple fields
 */
export interface StepConfig {
  /** Unique identifier for the step */
  stepName: string;

  /** Display order of the step */
  order: number;

  /** Array of field configurations for this step */
  fields: FieldConfig[];

  /** (Optional) i18n key for step title */
  titleKey?: string;

  /** (Optional) i18n key for step description */
  descriptionKey?: string;
}

/**
 * Raw field configuration from backend (before merging with defaults)
 */
export interface RawFieldConfig {
  fieldName: string;
  component: string;
  props?: Partial<FieldProps>;
  condition?: FieldCondition;
}

/**
 * Raw step configuration from backend (before processing)
 */
export interface RawStepConfig {
  stepName: string;
  order: number;
  fields: RawFieldConfig[];
  titleKey?: string;
  descriptionKey?: string;
}

/**
 * Multi-step form state for Zustand store
 */
export interface MultiStepFormState {
  currentStep: number;
  formData: Record<string, any>;
  setCurrentStep: (step: number) => void;
  updateFormData: (data: Record<string, any>) => void;
  resetForm: () => void;
}
