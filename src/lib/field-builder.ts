// Type-safe field builder for Data-Driven UI
// Use these helpers to create field configurations with full TypeScript support

import type {
  TypedFieldConfig,
  ComponentPropsMap,
  InputProps,
  TextareaProps,
  SelectProps,
  RadioGroupProps,
  CheckboxProps,
  SwitchProps,
  SliderProps,
  DatePickerProps,
  DateRangePickerProps,
  ToggleGroupProps,
  InputOTPProps,
  BadgeProps,
  SeparatorProps,
  EkycProps,
} from "@/types/component-props";
import type { RawFieldConfig, FieldCondition } from "@/types/data-driven-ui";

/**
 * Generic field builder with type safety
 */
export function createField<TComponent extends keyof ComponentPropsMap>(
  fieldName: string,
  component: TComponent,
  props: ComponentPropsMap[TComponent],
  condition?: FieldCondition,
): RawFieldConfig {
  const config: RawFieldConfig = {
    fieldName,
    component,
    props,
  };

  if (condition) {
    config.condition = condition;
  }

  return config;
}

/**
 * Create an Input field with type-safe props
 */
export function createInputField(
  fieldName: string,
  props: InputProps,
  condition?: FieldCondition,
): RawFieldConfig {
  return createField(fieldName, "Input", props, condition);
}

/**
 * Create a Textarea field with type-safe props
 */
export function createTextareaField(
  fieldName: string,
  props: TextareaProps,
  condition?: FieldCondition,
): RawFieldConfig {
  return createField(fieldName, "Textarea", props, condition);
}

/**
 * Create a Select field with type-safe props
 */
export function createSelectField(
  fieldName: string,
  props: SelectProps,
  condition?: FieldCondition,
): RawFieldConfig {
  return createField(fieldName, "Select", props, condition);
}

/**
 * Create a RadioGroup field with type-safe props
 */
export function createRadioGroupField(
  fieldName: string,
  props: RadioGroupProps,
  condition?: FieldCondition,
): RawFieldConfig {
  return createField(fieldName, "RadioGroup", props, condition);
}

/**
 * Create a Checkbox field with type-safe props
 */
export function createCheckboxField(
  fieldName: string,
  props: CheckboxProps,
  condition?: FieldCondition,
): RawFieldConfig {
  return createField(fieldName, "Checkbox", props, condition);
}

/**
 * Create a Switch field with type-safe props
 */
export function createSwitchField(
  fieldName: string,
  props: SwitchProps,
  condition?: FieldCondition,
): RawFieldConfig {
  return createField(fieldName, "Switch", props, condition);
}

/**
 * Create a Slider field with type-safe props
 */
export function createSliderField(
  fieldName: string,
  props: SliderProps,
  condition?: FieldCondition,
): RawFieldConfig {
  return createField(fieldName, "Slider", props, condition);
}

/**
 * Create a DatePicker field with type-safe props
 */
export function createDatePickerField(
  fieldName: string,
  props: DatePickerProps,
  condition?: FieldCondition,
): RawFieldConfig {
  return createField(fieldName, "DatePicker", props, condition);
}

/**
 * Create a DateRangePicker field with type-safe props
 */
export function createDateRangePickerField(
  fieldName: string,
  props: DateRangePickerProps,
  condition?: FieldCondition,
): RawFieldConfig {
  return createField(fieldName, "DateRangePicker", props, condition);
}

/**
 * Create a ToggleGroup field with type-safe props
 */
export function createToggleGroupField(
  fieldName: string,
  props: ToggleGroupProps,
  condition?: FieldCondition,
): RawFieldConfig {
  return createField(fieldName, "ToggleGroup", props, condition);
}

/**
 * Create an InputOTP field with type-safe props
 */
export function createInputOTPField(
  fieldName: string,
  props: InputOTPProps,
  condition?: FieldCondition,
): RawFieldConfig {
  return createField(fieldName, "InputOTP", props, condition);
}

/**
 * Create a Badge field with type-safe props
 */
export function createBadgeField(
  fieldName: string,
  props: BadgeProps,
  condition?: FieldCondition,
): RawFieldConfig {
  return createField(fieldName, "Badge", props, condition);
}

/**
 * Create a Separator field with type-safe props
 */
export function createSeparatorField(
  fieldName: string,
  props: SeparatorProps,
  condition?: FieldCondition,
): RawFieldConfig {
  return createField(fieldName, "Separator", props, condition);
}

/**
 * Create an Ekyc field with type-safe props
 */
export function createEkycField(
  fieldName: string,
  props: EkycProps,
  condition?: FieldCondition,
): RawFieldConfig {
  return createField(fieldName, "Ekyc", props, condition);
}

/**
 * Create a Confirmation field (read-only review step)
 */
export function createConfirmationField(
  fieldName: string,
  props?: Partial<import("@/types/component-props").ConfirmationProps>,
  condition?: FieldCondition,
): RawFieldConfig {
  return createField(fieldName, "Confirmation", props || {}, condition);
}

/**
 * Field mapper: Map backend field types to frontend components
 * Use this to transform backend responses
 */
export interface BackendField {
  name: string;
  type:
    | "text"
    | "email"
    | "number"
    | "select"
    | "radio"
    | "checkbox"
    | "textarea";
  label?: string;
  required?: boolean;
  options?: Array<{ value: string; label: string }>;
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
  // Add more backend-specific fields as needed
}

/**
 * Map backend field to frontend component configuration
 */
export function mapBackendFieldToComponent(
  backendField: BackendField,
): RawFieldConfig {
  const {
    name,
    type,
    label,
    required,
    options,
    min,
    max,
    minLength,
    maxLength,
  } = backendField;

  // Build validation rules
  const validations: any[] = [];
  if (required) {
    validations.push({ type: "required", messageKey: "form.error.required" });
  }

  // Map field type to component
  switch (type) {
    case "text":
      return createInputField(name, {
        label,
        type: "text",
        validations: [
          ...validations,
          ...(minLength
            ? [
                {
                  type: "minLength",
                  value: minLength,
                  messageKey: "form.error.minLength",
                },
              ]
            : []),
          ...(maxLength
            ? [
                {
                  type: "maxLength",
                  value: maxLength,
                  messageKey: "form.error.maxLength",
                },
              ]
            : []),
        ],
      });

    case "email":
      return createInputField(name, {
        label,
        type: "email",
        validations: [
          ...validations,
          { type: "email", messageKey: "form.error.email.invalid" },
        ],
      });

    case "number":
      return createInputField(name, {
        label,
        type: "number",
        validations: [
          ...validations,
          ...(min !== undefined
            ? [{ type: "min", value: min, messageKey: "form.error.min" }]
            : []),
          ...(max !== undefined
            ? [{ type: "max", value: max, messageKey: "form.error.max" }]
            : []),
        ],
      });

    case "select":
      return createSelectField(name, {
        label,
        options: options || [],
        validations,
      });

    case "radio":
      return createRadioGroupField(name, {
        label,
        options: options || [],
        validations,
      });

    case "checkbox":
      return createCheckboxField(name, {
        label,
        validations,
      });

    case "textarea":
      return createTextareaField(name, {
        label,
        rows: 4,
        validations: [
          ...validations,
          ...(minLength
            ? [
                {
                  type: "minLength",
                  value: minLength,
                  messageKey: "form.error.minLength",
                },
              ]
            : []),
          ...(maxLength
            ? [
                {
                  type: "maxLength",
                  value: maxLength,
                  messageKey: "form.error.maxLength",
                },
              ]
            : []),
        ],
      });

    default:
      // Fallback to text input
      return createInputField(name, {
        label,
        type: "text",
        validations,
      });
  }
}

/**
 * Batch map multiple backend fields
 */
export function mapBackendFields(
  backendFields: BackendField[],
): RawFieldConfig[] {
  return backendFields.map(mapBackendFieldToComponent);
}
