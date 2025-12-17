import type {
  AnimationVariant,
  ComponentVariant,
} from "@/components/renderer/types/ui-theme";
import type { MappedStep } from "@/mappers/flowMapper";
import type { FieldCategory, FieldType } from "../constants/field-types";

/**
 * Field validation configuration
 */
export interface FieldValidation {
  type: "required" | "email" | "minLength" | "maxLength" | "pattern" | "custom";
  messageKey: string;
  value?: string | number; // For minLength, maxLength, pattern
}

/**
 * Field configuration base interface
 */
export interface BaseFieldConfig {
  /** Field identifier */
  name: string;
  /** Human-readable label */
  label: string;
  /** Placeholder text */
  placeholder?: string;
  /** Field icon component */
  leftIcon?: any;
  /** Right icon component */
  rightIcon?: any;
  /** UI variant configuration */
  variant: ComponentVariant;
  /** Animation configuration */
  animation: AnimationVariant;
  /** Layout configuration */
  layout: {
    display: "block" | "inline" | "flex";
    padding: string;
  };
  /** CSS class name */
  className: string;
  /** Field validation rules */
  validations?: FieldValidation[];
  /** Whether field is required */
  required?: boolean;
  /** Whether field is disabled */
  disabled?: boolean;
  /** Field help text */
  helpText?: string;
  /** Field error message */
  errorMessage?: string;
}

/**
 * Input field configuration
 */
export interface InputFieldConfig extends BaseFieldConfig {
  type: "text" | "email" | "tel" | "number" | "password";
  /** Minimum length */
  minLength?: number;
  /** Maximum length */
  maxLength?: number;
  /** Input pattern */
  pattern?: string;
  /** Auto-complete attribute */
  autoComplete?: string;
}

/**
 * Select field configuration
 */
export interface SelectFieldConfig extends BaseFieldConfig {
  type: "select";
  /** Select options */
  options: Array<{
    value: string | number;
    label: string;
    disabled?: boolean;
  }>;
  /** Placeholder option */
  placeholder?: string;
  /** Whether to allow clearing */
  clearable?: boolean;
  /** Search functionality */
  searchable?: boolean;
}

/**
 * Date picker field configuration
 */
export interface DatePickerFieldConfig extends BaseFieldConfig {
  type: "date";
  /** Minimum date */
  minDate?: Date;
  /** Maximum date */
  maxDate?: Date;
  /** Date format */
  dateFormat?: string;
  /** Whether to show time picker */
  showTime?: boolean;
}

/**
 * eKYC field configuration
 */
export interface EkycFieldConfig extends BaseFieldConfig {
  type: "ekyc";
  /** eKYC provider configuration */
  provider: string;
  /** Verification types */
  verificationTypes: string[];
  /** Callback after verification */
  onVerificationComplete?: (result: any) => void;
}

/**
 * Confirmation field configuration
 */
export interface ConfirmationFieldConfig extends BaseFieldConfig {
  type: "confirmation";
  /** Confirmation message */
  message: string;
  /** Confirmation type */
  confirmationType: "success" | "info" | "warning";
  /** Action button configuration */
  actionButton?: {
    text: string;
    onClick: () => void;
  };
}

/**
 * Union type for all field configurations
 */
export type FieldConfig =
  | InputFieldConfig
  | SelectFieldConfig
  | DatePickerFieldConfig
  | EkycFieldConfig
  | ConfirmationFieldConfig;

/**
 * Field builder function type
 */
export type FieldBuilderFunction<T extends FieldConfig = FieldConfig> = (
  config?: Partial<T>,
) => T;

/**
 * Field builder map type
 */
export type FieldBuilderMap = Record<string, FieldBuilderFunction>;

/**
 * Step metadata
 */
export interface StepMetadata {
  /** Step title */
  title: string;
  /** Step description */
  description?: string;
  /** Step icon */
  icon?: any;
  /** Step category */
  category: FieldCategory;
  /** Whether step is optional */
  optional?: boolean;
  /** Step progress weight (for progress bar) */
  weight?: number;
}

/**
 * Onboarding field configuration with metadata
 */
export interface OnboardingFieldConfig {
  /** Field configuration */
  field: FieldConfig;
  /** Field metadata */
  metadata: {
    type: FieldType;
    category: FieldCategory;
    step?: string;
    order?: number;
    dependencies?: string[]; // Other fields this field depends on
  };
}

/**
 * Form configuration metadata
 */
export interface FormMetadata {
  /** Form identifier */
  id: string;
  /** Form title */
  title: string;
  /** Form description */
  description?: string;
  /** Form variant */
  variant: "onboarding" | "application" | "verification";
  /** Storage key for persistence */
  storageKey?: string;
  /** Initial step index */
  initialStep?: number;
  /** Whether to persist form data */
  persistData?: boolean;
}

/**
 * Generated form step configuration
 */
export interface GeneratedStepConfig {
  /** Step identifier */
  id: string;
  /** Step title */
  title: string;
  /** Step description */
  description?: string;
  /** Step icon */
  icon?: any;
  /** Fields in this step */
  fields: FieldConfig[];
  /** Step validation */
  validation?: {
    /** Whether to validate all fields */
    validateAll?: boolean;
    /** Custom validation function */
    custom?: (data: Record<string, any>) => boolean | string;
  };
  /** Navigation configuration */
  navigation?: {
    /** Custom next button text */
    nextText?: string;
    /** Custom previous button text */
    previousText?: string;
    /** Whether to show skip button */
    showSkip?: boolean;
  };
}

/**
 * Form generation context
 */
export interface FormGenerationContext {
  /** Translation function */
  t: (key: string) => string;
  /** Field builder map */
  fieldBuilders: FieldBuilderMap;
  /** UI theme configuration */
  uiTheme?: {
    variant?: ComponentVariant;
    animation?: AnimationVariant;
  };
  /** Additional metadata */
  metadata?: Partial<FormMetadata>;
}

/**
 * Field dependency configuration
 */
export interface FieldDependency {
  /** Field name that depends */
  field: string;
  /** Depends on field name */
  dependsOn: string;
  /** Dependency condition */
  condition: (value: any) => boolean;
  /** Action when condition is met */
  action: "show" | "hide" | "enable" | "disable" | "require";
}
