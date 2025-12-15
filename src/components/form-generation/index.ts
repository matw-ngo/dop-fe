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

export { DynamicForm } from './DynamicForm';
export type { DynamicFormProps } from './DynamicForm';

export { FieldFactory } from './factory/FieldFactory';
export type { FieldFactoryProps } from './factory/FieldFactory';

export { FieldWrapper } from './components/FieldWrapper';
export type { FieldWrapperProps } from './components/FieldWrapper';

// ============================================================================
// Field Components
// ============================================================================

export { TextField } from './fields/TextField';
export { TextAreaField } from './fields/TextAreaField';
export { NumberField } from './fields/NumberField';
export { SelectField } from './fields/SelectField';
export { CheckboxField } from './fields/CheckboxField';
export { RadioField } from './fields/RadioField';

// ============================================================================
// Layouts
// ============================================================================

export {
    GridLayout,
    FlexLayout,
    StackLayout,
    InlineLayout,
    DynamicLayout,
} from './layouts/LayoutEngine';
export type {
    GridLayoutProps,
    FlexLayoutProps,
    StackLayoutProps,
    InlineLayoutProps,
    DynamicLayoutProps,
} from './layouts/LayoutEngine';

export { FormSection } from './layouts/FormSection';
export type { FormSectionProps } from './layouts/FormSection';

// ============================================================================
// Mapper
// ============================================================================

export { FormConfigMapper } from './mappers/FormConfigMapper';
export type {
    ApiField,
    ApiValidation,
    ApiSection,
    ApiFormConfig,
} from './mappers/FormConfigMapper';

// ============================================================================
// Component Registry
// ============================================================================

export {
    ComponentRegistry,
    getRegistry,
    registerComponent,
    getComponent,
} from './registry/ComponentRegistry';

// ============================================================================
// Validation
// ============================================================================

export {
    ValidationEngine,
    Validators,
    createValidator,
} from './validation/ValidationEngine';
export type { ValidationResult } from './validation/ValidationEngine';

// ============================================================================
// i18n
// ============================================================================

export {
    useFormTranslations,
    TranslationKeys,
    generateTranslationStructure,
} from './i18n/useFormTranslations';

// ============================================================================
// Utilities
// ============================================================================

export {
    cn,
    generateFieldId,
    sanitizeFieldId,
    deepClone,
    deepMerge,
    getNestedValue,
    setNestedValue,
    isEmpty,
    isValidDate,
    isNumber,
    evaluateCondition,
    evaluateConditions,
    formatCurrency,
    parseCurrency,
    formatFileSize,
    debounce,
    throttle,
    isValidEmail,
    isValidUrl,
    isValidPhone,
    unique,
    groupBy,
    sortBy,
} from './utils/helpers';

// ============================================================================
// Styles / Variants
// ============================================================================

export {
    fieldWrapperVariants,
    labelVariants,
    inputVariants,
    errorVariants,
    helpTextVariants,
    formSectionVariants,
    submitButtonVariants,
    gridLayoutVariants,
    flexLayoutVariants,
} from './styles/variants';
export type {
    FieldWrapperVariantsProps,
    LabelVariantsProps,
    InputVariantsProps,
    ErrorVariantsProps,
    HelpTextVariantsProps,
    FormSectionVariantsProps,
    SubmitButtonVariantsProps,
    GridLayoutVariantsProps,
    FlexLayoutVariantsProps,
} from './styles/variants';

// ============================================================================
// Types
// ============================================================================

export {
    FieldType,
    LayoutType,
    ValidationRuleType,
    ConditionOperator,
} from './types';
export type {
    // Field Types
    FormField,
    BaseFieldConfig,
    TextFieldConfig,
    TextAreaFieldConfig,
    NumberFieldConfig,
    SelectFieldConfig,
    RadioFieldConfig,
    CheckboxFieldConfig,
    DateFieldConfig,
    FileFieldConfig,
    SliderFieldConfig,
    CustomFieldConfig,
    // Validation
    ValidationRule,
    AnyValidationRule,
    RequiredRule,
    LengthRule,
    RangeRule,
    PatternRule,
    CustomRule,
    // Conditional Logic
    FieldCondition,
    FieldDependency,
    // i18n
    FieldI18nConfig,
    FormI18nConfig,
    // Layout
    FieldLayoutConfig,
    FormLayoutConfig,
    // Configuration
    FormSection as FormSectionConfig,
    DynamicFormConfig,
    SubmitButtonConfig,
    // Options
    SelectOption,
    // Component Props
    FieldComponentProps,
    FieldComponent,
} from './types';
