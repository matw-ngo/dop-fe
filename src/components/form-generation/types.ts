/**
 * Form Generation Library - Core Types
 *
 * Type-safe configuration schema for dynamic form generation.
 * All types are designed to work with backend API responses.
 */

import type { ReactNode } from "react";

// ============================================================================
// Field Types
// ============================================================================

/**
 * Supported field types for form generation
 */
export enum FieldType {
  // Text inputs
  TEXT = "text",
  EMAIL = "email",
  PASSWORD = "password",
  URL = "url",
  TEL = "tel",

  // Rich text
  TEXTAREA = "textarea",
  RICH_TEXT = "rich-text",

  // Numeric
  NUMBER = "number",
  CURRENCY = "currency",

  // Date/Time
  DATE = "date",
  DATETIME = "datetime",
  TIME = "time",
  DATE_RANGE = "date-range",

  // Selection
  SELECT = "select",
  MULTI_SELECT = "multi-select",
  RADIO = "radio",
  CHECKBOX = "checkbox",
  CHECKBOX_GROUP = "checkbox-group",

  // Toggle
  SWITCH = "switch",

  // File
  FILE = "file",
  FILE_UPLOAD = "file-upload",
  IMAGE_UPLOAD = "image-upload",

  // Advanced
  SLIDER = "slider",
  RATING = "rating",
  COLOR = "color",

  // Custom
  CUSTOM = "custom",
}

/**
 * Layout types for form sections and fields
 */
export enum LayoutType {
  GRID = "grid",
  FLEX = "flex",
  INLINE = "inline",
  STACK = "stack",
}

// ============================================================================
// Value Types
// ============================================================================

/**
 * Possible field values
 */
export type FieldValue =
  | string
  | number
  | boolean
  | string[]
  | File
  | File[]
  | Date
  | null
  | undefined;

/**
 * Validation rule value types
 */
export type ValidationValue =
  | string
  | number
  | Date
  | RegExp
  | string[]
  | undefined;

// ============================================================================
// Validation
// ============================================================================

/**
 * Validation rule types
 */
export enum ValidationRuleType {
  REQUIRED = "required",
  MIN_LENGTH = "minLength",
  MAX_LENGTH = "maxLength",
  MIN = "min",
  MAX = "max",
  PATTERN = "pattern",
  EMAIL = "email",
  URL = "url",
  PHONE = "phone",
  MIN_DATE = "minDate",
  MAX_DATE = "maxDate",
  CUSTOM = "custom",
}

/**
 * Base validation rule interface
 */
export interface ValidationRule {
  type: ValidationRuleType;
  value?: ValidationValue;
  message?: string;
}

/**
 * Required field validation
 */
export interface RequiredRule extends ValidationRule {
  type: ValidationRuleType.REQUIRED;
  message?: string;
}

/**
 * Min/Max length validation
 */
export interface LengthRule extends ValidationRule {
  type: ValidationRuleType.MIN_LENGTH | ValidationRuleType.MAX_LENGTH;
  value: number;
  message?: string;
}

/**
 * Min/Max value validation
 */
export interface RangeRule extends ValidationRule {
  type: ValidationRuleType.MIN | ValidationRuleType.MAX;
  value: number;
  message?: string;
}

/**
 * Pattern (regex) validation
 */
export interface PatternRule extends ValidationRule {
  type: ValidationRuleType.PATTERN;
  value: string | RegExp;
  message?: string;
}

/**
 * Custom validation function
 */
export interface CustomRule extends ValidationRule {
  type: ValidationRuleType.CUSTOM;
  validator: (value: FieldValue) => boolean | Promise<boolean>;
  message?: string;
}

/**
 * Union of all validation rule types
 */
export type AnyValidationRule =
  | RequiredRule
  | LengthRule
  | RangeRule
  | PatternRule
  | CustomRule
  | ValidationRule;

// ============================================================================
// Conditional Logic
// ============================================================================

/**
 * Condition operators for field dependencies
 */
export enum ConditionOperator {
  EQUALS = "equals",
  NOT_EQUALS = "notEquals",
  CONTAINS = "contains",
  GREATER_THAN = "greaterThan",
  LESS_THAN = "lessThan",
  IN = "in",
  NOT_IN = "notIn",
}

/**
 * Field dependency condition
 */
export interface FieldCondition {
  fieldId: string;
  operator: ConditionOperator;
  value: any;
}

/**
 * Field dependency configuration
 */
export interface FieldDependency {
  conditions: FieldCondition[];
  action: "show" | "hide" | "enable" | "disable" | "require";
  // AND/OR logic for multiple conditions
  logic?: "and" | "or";
}

// ============================================================================
// i18n Configuration
// ============================================================================

/**
 * Translation configuration for a field
 */
export interface FieldI18nConfig {
  /**
   * Custom translation key for label
   * Default: forms.{namespace}.{fieldId}.label
   */
  labelKey?: string;

  /**
   * Custom translation key for placeholder
   * Default: forms.{namespace}.{fieldId}.placeholder
   */
  placeholderKey?: string;

  /**
   * Custom translation key for help text
   * Default: forms.{namespace}.{fieldId}.help
   */
  helpKey?: string;

  /**
   * Override default namespace for this field
   */
  namespace?: string;

  /**
   * Enable/disable auto-translation
   * @default true
   */
  enabled?: boolean;
}

// ============================================================================
// Layout Configuration
// ============================================================================

/**
 * Layout configuration for a field
 */
export interface FieldLayoutConfig {
  /**
   * Column span (for grid layouts)
   * @default 1
   */
  colSpan?: number;

  /**
   * Row span (for grid layouts)
   * @default 1
   */
  rowSpan?: number;

  /**
   * Field order
   */
  order?: number;

  /**
   * Custom width
   */
  width?: string | number;

  /**
   * Breakpoint-specific visibility
   */
  hidden?: {
    xs?: boolean;
    sm?: boolean;
    md?: boolean;
    lg?: boolean;
    xl?: boolean;
  };
}

// ============================================================================
// Field Configuration
// ============================================================================

/**
 * Base field configuration
 */
export interface BaseFieldConfig {
  /**
   * Unique field identifier
   */
  id: string;

  /**
   * Field name for form data
   */
  name: string;

  /**
   * Field type
   */
  type: FieldType;

  /**
   * Field label
   */
  label?: string;

  /**
   * Placeholder text
   */
  placeholder?: string;

  /**
   * Help text
   */
  help?: string;

  /**
   * Default value
   */
  defaultValue?: any;

  /**
   * Disabled state
   */
  disabled?: boolean;

  /**
   * Read-only state
   */
  readOnly?: boolean;

  /**
   * Validation rules
   */
  validation?: AnyValidationRule[];

  /**
   * Field dependencies
   */
  dependencies?: FieldDependency[];

  /**
   * Layout configuration
   */
  layout?: FieldLayoutConfig;

  /**
   * i18n configuration
   */
  i18n?: FieldI18nConfig;

  /**
   * Custom CSS classes
   */
  className?: string;

  /**
   * Inline styles
   */
  style?: React.CSSProperties;

  /**
   * Field-specific options
   */
  options?: Record<string, unknown>;
}

/**
 * Text field configuration
 */
export interface TextFieldConfig extends BaseFieldConfig {
  type:
    | FieldType.TEXT
    | FieldType.EMAIL
    | FieldType.PASSWORD
    | FieldType.URL
    | FieldType.TEL;
  options?: {
    maxLength?: number;
    minLength?: number;
    autoComplete?: string;
    prefix?: ReactNode;
    suffix?: ReactNode;
  };
}

/**
 * Text area field configuration
 */
export interface TextAreaFieldConfig extends BaseFieldConfig {
  type: FieldType.TEXTAREA;
  options?: {
    rows?: number;
    maxLength?: number;
    autoResize?: boolean;
    showCount?: boolean;
  };
}

/**
 * Number field configuration
 */
export interface NumberFieldConfig extends BaseFieldConfig {
  type: FieldType.NUMBER | FieldType.CURRENCY;
  options?: {
    min?: number;
    max?: number;
    step?: number;
    currency?: "VND" | "USD" | "EUR";
    showSymbol?: boolean;
    allowNegative?: boolean;
    decimalPlaces?: number;
  };
}

/**
 * Select field configuration
 */
export interface SelectOption {
  label: string;
  value: any;
  disabled?: boolean;
  group?: string;
}

export interface SelectFieldConfig extends BaseFieldConfig {
  type: FieldType.SELECT | FieldType.MULTI_SELECT;
  options?: {
    choices?: SelectOption[];
    searchable?: boolean;
    clearable?: boolean;
    placeholder?: string;
    maxSelections?: number; // for multi-select
  };
}

/**
 * Radio field configuration
 */
export interface RadioFieldConfig extends BaseFieldConfig {
  type: FieldType.RADIO;
  options?: {
    choices?: SelectOption[];
    layout?: "horizontal" | "vertical";
  };
}

/**
 * Checkbox field configuration
 */
export interface CheckboxFieldConfig extends BaseFieldConfig {
  type: FieldType.CHECKBOX | FieldType.CHECKBOX_GROUP;
  options?: {
    choices?: SelectOption[]; // for checkbox-group
    checkboxLabel?: string; // for single checkbox
  };
}

/**
 * Date field configuration
 */
export interface DateFieldConfig extends BaseFieldConfig {
  type:
    | FieldType.DATE
    | FieldType.DATETIME
    | FieldType.TIME
    | FieldType.DATE_RANGE;
  options?: {
    minDate?: Date | string;
    maxDate?: Date | string;
    format?: string;
    showTime?: boolean;
    disabledDates?: Date[] | string[];
  };
}

/**
 * File upload field configuration
 */
export interface FileFieldConfig extends BaseFieldConfig {
  type: FieldType.FILE | FieldType.FILE_UPLOAD | FieldType.IMAGE_UPLOAD;
  options?: {
    accept?: string;
    maxSize?: number; // in bytes
    multiple?: boolean;
    showPreview?: boolean;
    uploadUrl?: string;
  };
}

/**
 * Slider field configuration
 */
export interface SliderFieldConfig extends BaseFieldConfig {
  type: FieldType.SLIDER;
  options?: {
    min?: number;
    max?: number;
    step?: number;
    marks?: Record<number, string>;
    showTooltip?: boolean;
  };
}

/**
 * Custom field configuration
 */
export interface CustomFieldConfig extends BaseFieldConfig {
  type: FieldType.CUSTOM;
  options?: {
    componentName: string;
    componentProps?: Record<string, any>;
  };
}

/**
 * Union of all field configurations
 */
export type FormField =
  | TextFieldConfig
  | TextAreaFieldConfig
  | NumberFieldConfig
  | SelectFieldConfig
  | RadioFieldConfig
  | CheckboxFieldConfig
  | DateFieldConfig
  | FileFieldConfig
  | SliderFieldConfig
  | CustomFieldConfig
  | BaseFieldConfig;

// ============================================================================
// Form Section
// ============================================================================

/**
 * Form section configuration
 */
export interface FormSection {
  /**
   * Section ID
   */
  id: string;

  /**
   * Section title
   */
  title?: string;

  /**
   * Section description
   */
  description?: string;

  /**
   * Fields in this section
   */
  fields: FormField[];

  /**
   * Layout type
   */
  layout?: LayoutType;

  /**
   * Grid columns (for grid layout)
   */
  columns?: number;

  /**
   * Gap between fields
   */
  gap?: string | number;

  /**
   * Collapsible section
   */
  collapsible?: boolean;

  /**
   * Default collapsed state
   */
  defaultCollapsed?: boolean;

  /**
   * Section dependencies
   */
  dependencies?: FieldDependency[];

  /**
   * Custom CSS classes
   */
  className?: string;
}

// ============================================================================
// Form Configuration
// ============================================================================

/**
 * Form-level i18n configuration
 */
export interface FormI18nConfig {
  /**
   * Default namespace for all fields
   */
  namespace: string;

  /**
   * Form locale
   */
  locale?: string;
}

/**
 * Form layout configuration
 */
export interface FormLayoutConfig {
  /**
   * Layout type
   */
  type?: LayoutType;

  /**
   * Grid columns (for grid layout)
   */
  columns?: number;

  /**
   * Gap between fields
   */
  gap?: string | number;

  /**
   * Responsive breakpoints
   */
  breakpoints?: {
    xs?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
}

/**
 * Submit button configuration
 */
export interface SubmitButtonConfig {
  label?: string;
  loading?: boolean;
  disabled?: boolean;
  className?: string;
  position?: "left" | "center" | "right";
}

/**
 * Complete dynamic form configuration
 */
export interface DynamicFormConfig {
  /**
   * Form ID
   */
  id?: string;

  /**
   * Form fields (flat structure - single page)
   */
  fields?: FormField[];

  /**
   * Form sections (grouped structure)
   */
  sections?: FormSection[];

  /**
   * Multi-step wizard configuration
   */
  steps?: FormStep[];

  /**
   * Wizard navigation config (only for multi-step)
   */
  navigation?: WizardNavigationConfig;

  /**
   * Auto-save configuration
   */
  autoSave?: {
    enabled?: boolean;
    interval?: number; // ms
    storageKey?: string;
  };

  /**
   * Layout configuration
   */
  layout?: FormLayoutConfig;

  /**
   * i18n configuration
   */
  i18n?: FormI18nConfig;

  /**
   * Submit button configuration
   */
  submitButton?: SubmitButtonConfig;

  /**
   * Form submission handler
   */
  onSubmit?: (data: Record<string, any>) => void | Promise<void>;

  /**
   * Field change handler
   */
  onChange?: (fieldName: string, value: any) => void;

  /**
   * Step change handler (multi-step only)
   */
  onStepChange?: (step: number, data: Record<string, any>) => void;

  /**
   * Step validation handler (multi-step only)
   */
  onStepValidation?: (step: number, isValid: boolean) => void;

  /**
   * Wizard completion handler (multi-step only)
   */
  onComplete?: (data: Record<string, any>) => void | Promise<void>;

  /**
   * Validation mode
   */
  validationMode?: "onChange" | "onBlur" | "onSubmit";
}

// ============================================================================
// Multi-Step Wizard Types
// ============================================================================

/**
 * Step validation status
 */
export type StepValidationStatus =
  | "idle" // Not validated yet
  | "validating" // Validation in progress
  | "valid" // Passed validation
  | "invalid" // Failed validation
  | "skipped"; // Skipped (optional step)

/**
 * Step completion status
 */
export type StepCompletionStatus =
  | "pending" // Not started
  | "current" // Currently active
  | "complete" // Completed
  | "locked" // Cannot access (previous steps incomplete)
  | "error"; // Has errors

/**
 * Progress indicator type
 */
export type ProgressIndicatorType =
  | "bar" // Linear progress bar
  | "dots" // Dot indicators
  | "numbers" // Numbered circles
  | "stepper" // Material-style stepper
  | "tabs" // Tab-like navigation
  | "sidebar"; // Sidebar navigation

/**
 * Step condition for conditional visibility
 */
export interface StepCondition {
  /** Field to check */
  field: string;
  /** Comparison operator */
  operator: ConditionOperator;
  /** Value to compare against */
  value: FieldValue;
  /** Logic for multiple conditions */
  logic?: "and" | "or";
}

/**
 * Step validation configuration
 */
export interface StepValidation {
  /** Validate on next button click (default: true) */
  validateOnNext?: boolean;
  /** Allow skipping this step */
  allowSkip?: boolean;
  /** Show validation errors immediately */
  showErrorsImmediately?: boolean;
  /** Custom validation function */
  customValidator?: (
    stepData: Record<string, any>,
    allData: Record<string, any>,
  ) => Promise<boolean | string> | boolean | string;
}

/**
 * Form step configuration for multi-step wizards
 */
export interface FormStep {
  /** Unique step ID */
  id: string;

  /** Step title */
  title: string;

  /** Step description/subtitle */
  description?: string;

  /** Step icon (optional) */
  icon?: ReactNode | string;

  /** Fields in this step */
  fields: FormField[];

  /** Validation configuration */
  validation?: StepValidation;

  /** Conditional visibility */
  condition?: StepCondition[];

  /** Optional step flag */
  optional?: boolean;

  /** Lock step until previous completed */
  locked?: boolean;

  /** Custom layout for this step */
  layout?: FormLayoutConfig;

  /** Help text or instructions */
  helpText?: string;

  /** Step type (default: form) */
  type?: "form" | "review" | "custom";

  /** Step-specific CSS class */
  className?: string;
}

/**
 * Navigation button configuration
 */
export interface NavigationButtonConfig {
  /** Button label */
  label?: string;

  /** Show/hide button */
  show?: boolean;

  /** Custom icon */
  icon?: ReactNode;

  /** Loading state label */
  loadingLabel?: string;

  /** CSS class */
  className?: string;

  /** Button variant */
  variant?: "default" | "outline" | "ghost" | "link" | "destructive";
}

/**
 * Wizard navigation configuration
 */
export interface WizardNavigationConfig {
  /** Show progress indicator */
  showProgress?: boolean;

  /** Progress indicator type */
  progressType?: ProgressIndicatorType;

  /** Show step titles in progress */
  showStepTitles?: boolean;

  /** Allow clicking on completed steps */
  allowStepClick?: boolean;

  /** Back button config */
  backButton?: NavigationButtonConfig;

  /** Next button config */
  nextButton?: NavigationButtonConfig;

  /** Submit button config (last step) */
  submitButton?: NavigationButtonConfig;

  /** Show step numbers */
  showStepNumbers?: boolean;

  /** Sticky navigation */
  stickyNavigation?: boolean;
}

// ============================================================================
// Component Props
// ============================================================================

/**
 * Props for field components
 */
export interface FieldComponentProps<T = any> {
  /**
   * Field configuration
   */
  field: FormField;

  /**
   * Current field value
   */
  value: T;

  /**
   * Change handler
   */
  onChange: (value: T) => void;

  /**
   * Blur handler
   */
  onBlur?: () => void;

  /**
   * Validation error message
   */
  error?: string;

  /**
   * Disabled state
   */
  disabled?: boolean;

  /**
   * Read-only state
   */
  readOnly?: boolean;

  /**
   * Custom CSS classes
   */
  className?: string;
}

/**
 * Field component type
 */
export type FieldComponent<T = any> = React.ComponentType<
  FieldComponentProps<T>
>;
