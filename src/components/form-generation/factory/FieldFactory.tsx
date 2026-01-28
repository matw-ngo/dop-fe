/**
 * Form Generation Library - Field Factory
 *
 * Factory component for rendering appropriate field components based on type
 */

"use client";

import { useTranslations } from "next-intl";
import { useCallback, useMemo } from "react";
import { FieldErrorBoundary } from "../components/FieldErrorBoundary";
import { FieldWrapper } from "../components/FieldWrapper";
import { isCustomComponentAllowed } from "../constants";
// Import built-in field components (memoized for performance)
import {
  CheckboxField,
  DateField,
  EkycField,
  FileField,
  NumberField,
  RadioField,
  SelectField,
  SwitchField,
  TextAreaField,
  TextField,
} from "../fields";
import { useFormTranslations } from "../i18n/useFormTranslations";
import { ComponentRegistry } from "../registry/ComponentRegistry";
import { useFormTheme } from "../themes/ThemeProvider";
import { useFieldTracking } from "../tracking/useFieldTracking";
import type { FieldComponentProps, FormField } from "../types";
import { FieldType } from "../types";
import { cn } from "../utils/helpers";
import { ValidationEngine } from "../validation/ValidationEngine";

// Register built-in components
const registry = ComponentRegistry.getInstance();

// Only register if not already registered (for HMR)
if (!registry.has(FieldType.TEXT)) {
  registry.registerBatch({
    // Text fields
    [FieldType.TEXT]: TextField,
    [FieldType.EMAIL]: TextField,
    [FieldType.PASSWORD]: TextField,
    [FieldType.URL]: TextField,
    [FieldType.TEL]: TextField,
    [FieldType.TEXTAREA]: TextAreaField,
    // Number fields
    [FieldType.NUMBER]: NumberField,
    [FieldType.CURRENCY]: NumberField,
    // Selection fields
    [FieldType.SELECT]: SelectField,
    [FieldType.MULTI_SELECT]: SelectField,
    [FieldType.CHECKBOX]: CheckboxField,
    [FieldType.CHECKBOX_GROUP]: CheckboxField,
    [FieldType.RADIO]: RadioField,
    // Date/Time fields
    [FieldType.DATE]: DateField,
    [FieldType.DATETIME]: DateField,
    [FieldType.TIME]: DateField,
    // Toggle field
    [FieldType.SWITCH]: SwitchField,
    // File fields
    [FieldType.FILE]: FileField,
    [FieldType.FILE_UPLOAD]: FileField,
    [FieldType.IMAGE_UPLOAD]: FileField,
    // Verification fields
    [FieldType.EKYC]: EkycField,
  });
}

// ============================================================================
// Field Factory Props
// ============================================================================

export interface FieldFactoryProps {
  /**
   * Field configuration
   */
  field: FormField;

  /**
   * Current field value
   */
  value: any;

  /**
   * Change handler
   */
  onChange: (value: any) => void;

  /**
   * Blur handler
   */
  onBlur?: () => void;

  /**
   * Form namespace for i18n
   */
  namespace?: string;

  /**
   * Custom validation error
   */
  error?: string;

  /**
   * Show wrapper (label, error, help)
   */
  showWrapper?: boolean;

  /**
   * Disabled state
   */
  disabled?: boolean;

  /**
   * Read-only state
   */
  readOnly?: boolean;
}

// ============================================================================
// Field Factory Component
// ============================================================================

export function FieldFactory({
  field,
  value,
  onChange,
  onBlur,
  namespace = "common",
  error: externalError,
  showWrapper = true,
  disabled,
  readOnly,
}: FieldFactoryProps) {
  const { getLabel, getPlaceholder, getHelp } = useFormTranslations(namespace);
  const translateError = useValidationErrorTranslation();
  const translatedError = translateError(externalError);

  // Initialize tracking
  const { trackInput, trackValidation, trackBlur, trackSelection, trackFocus } =
    useFieldTracking({
      fieldId: field.id,
      fieldName: field.name,
      trackingConfig: field.tracking,
    });

  // Extract styling config with backward compatibility
  const styling = field.styling || {};
  const controlClassName = styling.control || field.className;

  // Get component from registry
  const FieldComponent = useMemo(() => {
    // Check if custom component is specified
    if (field.type === FieldType.CUSTOM && field.options?.componentName) {
      const componentName = String(field.options.componentName);

      // SECURITY: Check component allowlist
      if (!isCustomComponentAllowed(componentName)) {
        console.error(
          `[Security] Unauthorized custom component blocked: "${componentName}". ` +
            `Add to allowlist using: allowCustomComponent("${componentName}")`,
        );
        return null;
      }

      const customComponent = registry.get(componentName);
      if (customComponent) {
        return customComponent;
      }

      console.warn(`Custom component "${componentName}" not found in registry`);
      return null;
    }

    // Get by field type
    const component = registry.get(field.type);

    if (!component) {
      console.warn(`No component registered for field type: ${field.type}`);
      return null;
    }

    return component;
  }, [field.type, field.options]);

  // Check if field is required
  const isRequired = useMemo(
    () => ValidationEngine.isFieldRequired(field.validation || []),
    [field.validation],
  );

  // Get translated label, placeholder, help
  const label = useMemo(() => {
    if (field.i18n?.enabled === false) {
      return field.label;
    }
    if (field.i18n?.labelKey) {
      return getLabel(field.i18n.labelKey, field.label);
    }
    return getLabel(field.id, field.label);
  }, [field, getLabel]);

  const placeholder = useMemo(() => {
    if (field.i18n?.enabled === false) {
      return field.placeholder;
    }
    if (field.i18n?.placeholderKey) {
      return getPlaceholder(field.i18n.placeholderKey, field.placeholder);
    }
    return getPlaceholder(field.id, field.placeholder);
  }, [field, getPlaceholder]);

  const help = useMemo(() => {
    if (field.i18n?.enabled === false) {
      return field.help;
    }
    if (field.i18n?.helpKey) {
      return getHelp(field.i18n.helpKey, field.help);
    }
    return getHelp(field.id, field.help);
  }, [field, getHelp]);

  // Wrap onChange with tracking
  const handleChange = useCallback(
    (newValue: any) => {
      // Track input if configured
      trackInput(newValue);

      // Call original onChange
      onChange(newValue);
    },
    [onChange, trackInput],
  );

  // For select/radio/checkbox fields, track selection
  const handleSelectionChange = useCallback(
    (newValue: any) => {
      trackSelection(newValue);
      onChange(newValue);
    },
    [onChange, trackSelection],
  );

  // Handle blur with validation and tracking
  const handleBlur = useCallback(async () => {
    // Track blur if configured
    trackBlur(value);

    // Call original onBlur
    onBlur?.();

    // Validate and track validation success
    if (field.validation) {
      const result = await ValidationEngine.validateField(
        value,
        field.validation,
      );
      if (result.valid) {
        trackValidation(value, true);
      }
    }
  }, [onBlur, value, trackBlur, trackValidation, field.validation]);

  // Handle focus tracking
  const handleFocus = useCallback(() => {
    trackFocus(value);
  }, [trackFocus, value]);

  // Determine which onChange handler to use
  const isSelectionField = [
    FieldType.SELECT,
    FieldType.MULTI_SELECT,
    FieldType.RADIO,
    FieldType.CHECKBOX,
    FieldType.CHECKBOX_GROUP,
  ].includes(field.type);
  const fieldOnChange = isSelectionField ? handleSelectionChange : handleChange;

  // Props for field component - ONLY control className
  const fieldProps: FieldComponentProps = {
    field: {
      ...field,
      label,
      placeholder,
      help,
    },
    value,
    onChange: fieldOnChange,
    onBlur: handleBlur,
    onFocus: handleFocus,
    error: translatedError,
    disabled: disabled || field.disabled,
    readOnly: readOnly || field.readOnly,
    className: controlClassName, // Only control className
  };

  // If no component found, render error message
  if (!FieldComponent) {
    return (
      <div className="text-sm text-destructive p-2 border border-destructive rounded">
        Field type "{field.type}" not supported. Please register a component for
        this type.
      </div>
    );
  }

  const { theme } = useFormTheme();

  // Render with or without wrapper
  const fieldContent = showWrapper ? (
    <FieldWrapper
      id={field.id}
      label={label}
      required={isRequired}
      error={translatedError}
      help={help}
      disabled={disabled || field.disabled}
      // Granular styling - separate classNames
      wrapperClassName={styling.wrapper}
      labelClassName={cn(theme.label?.base, styling.label)} // Merge theme style with field override
      errorClassName={cn(theme.error?.base, styling.error)}
      helpClassName={cn(theme.help?.base, styling.help)}
    >
      <FieldComponent {...fieldProps} />
    </FieldWrapper>
  ) : (
    <FieldComponent {...fieldProps} />
  );

  return (
    <FieldErrorBoundary fieldId={field.id}>{fieldContent}</FieldErrorBoundary>
  );
}

// Helper to translate validation errors
function useValidationErrorTranslation() {
  const t = useTranslations();

  return useCallback(
    (error?: string) => {
      if (!error) return undefined;

      // Check if error is a translation key (contains | or starts with pages.form.errors)
      // Simple check: if it has a pipe, parse it.
      // If not but looks like a key, translate it.
      // If regular string, return as is (fallback).

      if (error.includes("|")) {
        const [key, paramsStr] = error.split("|");
        try {
          const params = JSON.parse(paramsStr);
          return t(key, params);
        } catch (_e) {
          return error;
        }
      }

      if (error.startsWith("pages.form.errors.")) {
        return t(error);
      }

      return error;
    },
    [t],
  );
}

FieldFactory.displayName = "FieldFactory";
