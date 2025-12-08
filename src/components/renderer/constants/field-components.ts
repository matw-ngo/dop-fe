/**
 * Constants for field component classification
 * Centralizes component type definitions for better maintainability
 */

/** Components that don't use FormField wrapper */
export const SPECIAL_COMPONENTS = [
  "Button",
  "Label",
  "Progress",
  "Badge",
  "Separator",
  "Confirmation",
] as const;

/** Components that don't work well inside FormControl */
export const FORM_CONTROL_EXCLUDED = [
  "Select",
  "RadioGroup",
  "DatePicker",
  "DateRangePicker",
  "ToggleGroup",
  "InputOTP",
] as const;

/** Components that require FormControl wrapper */
export const FORM_CONTROL_REQUIRED = [
  "Input",
  "Textarea",
  "Slider",
  "Checkbox",
  "Switch",
] as const;

/** Type definitions for component categories */
export type SpecialComponentType = (typeof SPECIAL_COMPONENTS)[number];
export type FormControlExcludedType = (typeof FORM_CONTROL_EXCLUDED)[number];
export type FormControlRequiredType = (typeof FORM_CONTROL_REQUIRED)[number];

/** Map component types to their event handler property names */
export const COMPONENT_EVENT_HANDLERS = {
  // Standard form components use onChange
  Input: "onChange",
  Textarea: "onChange",
  Slider: "onChange",
  Checkbox: "onChange",
  Switch: "onChange",

  // These components use onValueChange
  Select: "onValueChange",
  RadioGroup: "onValueChange",
  ToggleGroup: "onValueChange",

  // Date pickers use onChange with value transformation
  DatePicker: "onChange",
  DateRangePicker: "onChange",

  // Special components don't need form events
  Button: undefined,
  Label: undefined,
  Badge: undefined,
  Separator: undefined,
  Progress: undefined,
  Confirmation: undefined,
  InputOTP: "onChange",
} as const;
