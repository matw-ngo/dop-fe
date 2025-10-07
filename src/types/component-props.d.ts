// Component-specific prop types for Data-Driven UI
// This provides type safety when mapping backend fields to frontend components

import type { ValidationRule } from "./data-driven-ui";

/**
 * Base props that all components share
 */
interface BaseComponentProps {
  labelKey?: string;
  label?: string;
  placeholderKey?: string;
  placeholder?: string;
  descriptionKey?: string;
  description?: string;
  validations?: ValidationRule[];
  disabled?: boolean;
  className?: string;

  /** Async options configuration for dynamic fields */
  optionsFetcher?: {
    fetcher: (params?: any) => Promise<any[]>;
    transform?: (
      data: any[],
    ) => Array<{ value: string; label: string; disabled?: boolean }>;
    cacheKey?: string;
    cacheDuration?: number;
    dependsOn?: string[];
  };
}

/**
 * Props for Input component
 */
export interface InputProps extends BaseComponentProps {
  type?: "text" | "email" | "password" | "number" | "tel" | "url" | "search";
  autoComplete?: string;
  maxLength?: number;
  minLength?: number;
  pattern?: string;
  readOnly?: boolean;
}

/**
 * Props for Textarea component
 */
export interface TextareaProps extends BaseComponentProps {
  rows?: number;
  cols?: number;
  maxLength?: number;
  minLength?: number;
  readOnly?: boolean;
  resize?: "none" | "both" | "horizontal" | "vertical";
}

/**
 * Props for Select component
 */
export interface SelectProps extends BaseComponentProps {
  options: Array<{
    value: string;
    label: string;
    disabled?: boolean;
  }>;
}

/**
 * Props for RadioGroup component
 */
export interface RadioGroupProps extends BaseComponentProps {
  options: Array<{
    value: string;
    label: string;
    disabled?: boolean;
  }>;
  direction?: "vertical" | "horizontal";
}

/**
 * Props for Checkbox component
 */
export interface CheckboxProps extends BaseComponentProps {
  defaultChecked?: boolean;
}

/**
 * Props for Switch component
 */
export interface SwitchProps extends BaseComponentProps {
  defaultChecked?: boolean;
}

/**
 * Props for Slider component
 */
export interface SliderProps extends BaseComponentProps {
  min?: number;
  max?: number;
  step?: number;
  defaultValue?: number[];
}

/**
 * Props for Button component
 */
export interface ButtonProps extends BaseComponentProps {
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
  size?: "default" | "sm" | "lg" | "icon";
  type?: "button" | "submit" | "reset";
}

/**
 * Props for Label component
 */
export interface LabelProps extends BaseComponentProps {
  htmlFor?: string;
}

/**
 * Props for Progress component
 */
export interface ProgressProps extends BaseComponentProps {
  value?: number;
  max?: number;
}

/**
 * Props for DatePicker component
 */
export interface DatePickerProps extends BaseComponentProps {
  dateFormat?: string;
}

/**
 * Props for DateRangePicker component
 */
export interface DateRangePickerProps extends BaseComponentProps {
  dateFormat?: string;
  numberOfMonths?: number;
}

/**
 * Props for ToggleGroup component
 */
export interface ToggleGroupProps extends BaseComponentProps {
  options: Array<{
    value: string;
    label: string;
    disabled?: boolean;
    icon?: React.ReactNode;
  }>;
  type?: "single" | "multiple";
  variant?: "default" | "outline";
  size?: "default" | "sm" | "lg";
}

/**
 * Props for InputOTP component
 */
export interface InputOTPProps extends BaseComponentProps {
  maxLength?: number;
  pattern?: string;
  groupSize?: number;
}

/**
 * Props for Badge component
 */
export interface BadgeProps extends BaseComponentProps {
  variant?: "default" | "secondary" | "destructive" | "outline";
}

/**
 * Props for Separator component
 */
export interface SeparatorProps extends BaseComponentProps {
  orientation?: "horizontal" | "vertical";
  decorative?: boolean;
}

/**
 * Mapping of component names to their prop types
 */
export interface ComponentPropsMap {
  Input: InputProps;
  Textarea: TextareaProps;
  Select: SelectProps;
  RadioGroup: RadioGroupProps;
  Checkbox: CheckboxProps;
  Switch: SwitchProps;
  Slider: SliderProps;
  Button: ButtonProps;
  Label: LabelProps;
  Progress: ProgressProps;
  DatePicker: DatePickerProps;
  DateRangePicker: DateRangePickerProps;
  ToggleGroup: ToggleGroupProps;
  InputOTP: InputOTPProps;
  Badge: BadgeProps;
  Separator: SeparatorProps;
}

/**
 * Helper type to get props for a specific component
 */
export type PropsForComponent<T extends keyof ComponentPropsMap> =
  ComponentPropsMap[T];

/**
 * Type-safe field config builder
 */
export type TypedFieldConfig<TComponent extends keyof ComponentPropsMap> = {
  fieldName: string;
  component: TComponent;
  props: ComponentPropsMap[TComponent];
  condition?: {
    fieldName: string;
    operator: "equals" | "notEquals" | "contains" | "greaterThan" | "lessThan";
    value: any;
  };
};
