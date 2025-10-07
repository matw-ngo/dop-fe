// Default Field Configurations for Data-Driven UI system
// Provides default props and settings for each registered component

import type { RegisteredComponent } from "@/components/renderer/ComponentRegistry";
import type { FieldProps } from "@/types/data-driven-ui";

/**
 * Default configuration for a field
 */
interface DefaultFieldConfig {
  component: RegisteredComponent;
  props: FieldProps;
}

/**
 * Default configurations for each registered component
 * These provide sensible defaults that Backend can override
 */
export const DefaultFieldConfigs: Partial<
  Record<RegisteredComponent, DefaultFieldConfig>
> = {
  Input: {
    component: "Input",
    props: {
      type: "text",
      labelKey: "form.field.default.label",
      placeholderKey: "form.field.default.placeholder",
    },
  },

  Textarea: {
    component: "Textarea",
    props: {
      labelKey: "form.field.textarea.label",
      placeholderKey: "form.field.textarea.placeholder",
      rows: 4,
    },
  },

  Checkbox: {
    component: "Checkbox",
    props: {
      labelKey: "form.field.checkbox.label",
    },
  },

  Switch: {
    component: "Switch",
    props: {
      labelKey: "form.field.switch.label",
    },
  },

  Slider: {
    component: "Slider",
    props: {
      labelKey: "form.field.slider.label",
      min: 0,
      max: 100,
      step: 1,
      defaultValue: [50],
    },
  },

  Select: {
    component: "Select",
    props: {
      labelKey: "form.field.select.label",
      placeholderKey: "form.field.select.placeholder",
      // options should be provided by Backend
      options: [],
    },
  },

  RadioGroup: {
    component: "RadioGroup",
    props: {
      labelKey: "form.field.radiogroup.label",
      // options should be provided by Backend
      options: [],
      direction: "vertical",
    },
  },

  DatePicker: {
    component: "DatePicker",
    props: {
      labelKey: "form.field.datepicker.label",
      placeholderKey: "form.field.datepicker.placeholder",
      dateFormat: "PPP",
    },
  },

  DateRangePicker: {
    component: "DateRangePicker",
    props: {
      labelKey: "form.field.daterangepicker.label",
      placeholderKey: "form.field.daterangepicker.placeholder",
      dateFormat: "LLL dd, y",
      numberOfMonths: 2,
    },
  },

  ToggleGroup: {
    component: "ToggleGroup",
    props: {
      labelKey: "form.field.togglegroup.label",
      options: [],
      type: "single",
      variant: "default",
      size: "default",
    },
  },

  InputOTP: {
    component: "InputOTP",
    props: {
      labelKey: "form.field.inputotp.label",
      maxLength: 6,
      pattern: "^[0-9]+$",
    },
  },

  Badge: {
    component: "Badge",
    props: {
      labelKey: "form.badge.default.label",
      variant: "default",
    },
  },

  Separator: {
    component: "Separator",
    props: {
      orientation: "horizontal",
      decorative: true,
    },
  },

  Button: {
    component: "Button",
    props: {
      type: "button",
      variant: "default",
      size: "default",
      labelKey: "form.button.default.label",
    },
  },

  Label: {
    component: "Label",
    props: {
      labelKey: "form.label.default.text",
    },
  },

  Progress: {
    component: "Progress",
    props: {
      value: 0,
      max: 100,
      labelKey: "form.progress.default.label",
    },
  },
};

/**
 * Get default configuration for a component
 */
export function getDefaultFieldConfig(
  componentName: RegisteredComponent,
): DefaultFieldConfig | null {
  return DefaultFieldConfigs[componentName] || null;
}

/**
 * Merge backend field configuration with default configuration
 */
export function mergeWithDefaults(
  componentName: RegisteredComponent,
  backendProps: Partial<FieldProps> = {},
): FieldProps {
  const defaultConfig = getDefaultFieldConfig(componentName);

  if (!defaultConfig) {
    console.warn(
      `No default configuration found for component: ${componentName}`,
    );
    return backendProps as FieldProps;
  }

  // Deep merge props, with backend props taking precedence
  return {
    ...defaultConfig.props,
    ...backendProps,
    // Special handling for arrays (like validations) - concatenate instead of override
    validations: [
      ...(defaultConfig.props.validations || []),
      ...(backendProps.validations || []),
    ],
  };
}
