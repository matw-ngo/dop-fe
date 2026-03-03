/**
 * Form Generation Library
 *
 * A comprehensive, type-safe system for generating dynamic forms from backend configuration.
 *
 * @example
 * ```typescript
 * import { DynamicForm, FormConfigMapper } from '@/components/form-generation';
 *
 * // Transform API response
 * const config = FormConfigMapper.mapApiToFormConfig(apiResponse);
 *
 * // Render form
 * <DynamicForm
 *   config={config}
 *   onSubmit={(data) => console.log(data)}
 * />
 * ```
 */

// ============================================================================
// Main Components
// ============================================================================

export { FieldErrorBoundary } from "./components/FieldErrorBoundary";
export type { FieldWrapperProps } from "./components/FieldWrapper";
export { FieldWrapper } from "./components/FieldWrapper";
export type { DynamicFormProps } from "./DynamicForm";
export { DynamicForm } from "./DynamicForm";
export type { FieldFactoryProps } from "./factory/FieldFactory";
export { FieldFactory } from "./factory/FieldFactory";
export type { StepWizardProps } from "./wizard";
// Wizard Components
export {
  DotsIndicator,
  NumberedStepper,
  ProgressBar,
  ReviewStep,
  SidebarNav,
  StepContent,
  StepErrors,
  StepWizard,
  WizardNavigation,
  WizardProgress,
} from "./wizard";

// ============================================================================
// Field Components
// ============================================================================

export { CheckboxField } from "./fields/CheckboxField";
export { DateField } from "./fields/DateField";
export { FileField } from "./fields/FileField";
export { NumberField } from "./fields/NumberField";
export { RadioField } from "./fields/RadioField";
export { SelectField } from "./fields/SelectField";
export { SwitchField } from "./fields/SwitchField";
export { TextAreaField } from "./fields/TextAreaField";
export { TextField } from "./fields/TextField";

// ============================================================================
// Layouts
// ============================================================================

export type { FormSectionProps } from "./layouts/FormSection";
export { FormSection } from "./layouts/FormSection";
export type {
  DynamicLayoutProps,
  FlexLayoutProps,
  GridLayoutProps,
  InlineLayoutProps,
  StackLayoutProps,
} from "./layouts/LayoutEngine";
export {
  DynamicLayout,
  FlexLayout,
  GridLayout,
  InlineLayout,
  StackLayout,
} from "./layouts/LayoutEngine";

// ============================================================================
// Mapper
// ============================================================================

export type {
  ApiField,
  ApiFormConfig,
  ApiSection,
  ApiValidation,
} from "./mappers/FormConfigMapper";
export { FormConfigMapper } from "./mappers/FormConfigMapper";

// ============================================================================
// Component Registry
// ============================================================================

export {
  ComponentRegistry,
  getComponent,
  getRegistry,
  registerComponent,
} from "./registry/ComponentRegistry";

// ============================================================================
// Validation
// ============================================================================

export type { ValidationResult } from "./validation/ValidationEngine";
export {
  createValidator,
  ValidationEngine,
  Validators,
} from "./validation/ValidationEngine";

// ============================================================================
// i18n
// ============================================================================

export {
  generateTranslationStructure,
  TranslationKeys,
  useFormTranslations,
} from "./i18n/useFormTranslations";

// ============================================================================
// Constants & Security
// ============================================================================

export {
  ALLOWED_CUSTOM_COMPONENTS,
  allowCustomComponent,
  clearAllowedCustomComponents,
  DEFAULT_MAX_FILE_SIZE,
  disallowCustomComponent,
  isCustomComponentAllowed,
  VALIDATION_DEBOUNCE_MS,
  VALIDATION_TIMEOUT_MS,
} from "./constants";

export {
  cn,
  debounce,
  deepClone,
  deepMerge,
  evaluateCondition,
  evaluateConditions,
  formatCurrency,
  formatFileSize,
  generateFieldId,
  getNestedValue,
  groupBy,
  isEmpty,
  isNumber,
  isValidDate,
  isValidEmail,
  isValidPhone,
  isValidUrl,
  parseCurrency,
  sanitizeFieldId,
  setNestedValue,
  sortBy,
  throttle,
  unique,
} from "./utils/helpers";

// ============================================================================
// Styles / Variants
// ============================================================================

export type {
  ErrorVariantsProps,
  FieldWrapperVariantsProps,
  FlexLayoutVariantsProps,
  FormSectionVariantsProps,
  GridLayoutVariantsProps,
  HelpTextVariantsProps,
  InputVariantsProps,
  LabelVariantsProps,
  SubmitButtonVariantsProps,
} from "./styles/variants";
export {
  errorVariants,
  fieldWrapperVariants,
  flexLayoutVariants,
  formSectionVariants,
  gridLayoutVariants,
  helpTextVariants,
  inputVariants,
  labelVariants,
  submitButtonVariants,
} from "./styles/variants";

// ============================================================================
// Types
// ============================================================================

export type {
  AnyValidationRule,
  BaseFieldConfig,
  CheckboxFieldConfig,
  CustomFieldConfig,
  CustomRule,
  DateFieldConfig,
  DynamicFormConfig,
  FieldComponent,
  // Component Props
  FieldComponentProps,
  // Conditional Logic
  FieldCondition,
  FieldDependency,
  // i18n
  FieldI18nConfig,
  // Layout
  FieldLayoutConfig,
  FileFieldConfig,
  // Field Types
  FormField,
  FormI18nConfig,
  FormLayoutConfig,
  // Configuration
  FormSection as FormSectionConfig,
  // Multi-Step Wizard
  FormStep,
  LengthRule,
  NavigationButtonConfig,
  NumberFieldConfig,
  PatternRule,
  ProgressIndicatorType,
  RadioFieldConfig,
  RangeRule,
  RequiredRule,
  SelectFieldConfig,
  // Options
  SelectOption,
  SliderFieldConfig,
  StepCompletionStatus,
  StepCondition,
  StepValidation,
  StepValidationStatus,
  SubmitButtonConfig,
  TextAreaFieldConfig,
  TextFieldConfig,
  // Validation
  ValidationRule,
  WizardNavigationConfig,
} from "./types";
export {
  ConditionOperator,
  FieldType,
  LayoutType,
  ValidationRuleType,
} from "./types";

// ============================================================================
// Theme System
// ============================================================================

export type { FormTheme } from "./themes";
export {
  defaultTheme,
  FormThemeProvider,
  /**
   * @deprecated Use TenantThemeProvider for automatic tenant-aware theming
   */
  legacyLoanTheme,
  useFormTheme,
} from "./themes";
