"use client";

import { Textarea } from "@/components/ui/textarea";
import { useFormTheme } from "../themes/ThemeProvider";
import {
  type FieldComponentProps,
  type TextAreaFieldConfig,
  ValidationRuleType,
} from "../types";
import { cn } from "../utils/helpers";

/**
 * TextAreaField component that handles most styling directly
 * Uses theme only for truly customizable properties
 */
// TODO: Improve UI consistency and theme integration to match TextField/SelectField implementation
export function TextAreaField({
  field,
  value,
  onChange,
  onBlur,
  error,
  disabled,
  readOnly,
  className,
}: FieldComponentProps<string>) {
  const { theme } = useFormTheme();
  const textAreaField = field as TextAreaFieldConfig;
  const options = textAreaField.options || {};
  const isDisabled = disabled || field.disabled;
  const isReadOnly = readOnly || field.readOnly;
  const internalLabel = theme.fieldOptions?.internalLabel;
  const isRequired = field.validation?.some(
    (rule) => rule.type === ValidationRuleType.REQUIRED,
  );
  const fieldCssVars = {
    "--form-primary": theme.colors.primary,
    "--form-border": theme.colors.border,
    "--form-bg": theme.colors.background,
    "--form-text": theme.colors.textPrimary || "#073126",
    "--form-placeholder": theme.colors.placeholder,
    "--form-selection-bg": theme.colors.primary,
    "--form-disabled-bg": theme.colors.disabled,
    "--form-readonly-bg": theme.colors.readOnly,
    "--form-text-secondary": theme.colors.textSecondary || "#4d7e70",
  } as React.CSSProperties;

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
  };

  const currentLength = value?.length || 0;
  const maxLength = options.maxLength;
  const showCount = options.showCount && maxLength;

  // Base textarea styles that are consistent across themes
  const baseTextareaStyles = [
    "w-full",
    "border",
    "transition-all",
    "duration-200",
    "text-sm",
    "resize-none", // Typically textarea doesn't resize in forms
    // Base focus styles
    "focus:outline-none",
    // Placeholder styles
    "placeholder:text-[var(--form-placeholder)]",
    "placeholder:font-medium",
    // Text and selection colors
    "text-[var(--form-text)]",
    "selection:bg-[var(--form-selection-bg)]",
    "selection:text-white",
    // Disabled and readonly states
    "disabled:cursor-not-allowed",
    "disabled:opacity-60",
    "read-only:cursor-default",
  ];

  // Theme-specific styles
  const themeStyles = [
    // Border radius from theme
    "rounded-[8px]",
    // Border color
    "border-[var(--form-border)]",
    // Default background
    "bg-[var(--form-bg)]",
    // Padding
    "px-4",
    "py-3",
    // Focus state
    "focus:border-[var(--form-primary)]",
    "focus:ring-2",
    "focus:ring-[var(--form-primary)]/20",
    // Error state
    error && "border-red-500",
    error && "focus:ring-red-500/20",
    // Override background for special states
    isDisabled && "!bg-[var(--form-disabled-bg)]",
    isReadOnly && "!bg-[var(--form-readonly-bg)]",
  ].filter(Boolean);

  // Minimum height based on rows option
  const minHeight = options.rows ? undefined : "min-h-[120px]";

  // If internal label is enabled, use wrapper with label
  if (internalLabel && field.label) {
    return (
      <div className="relative w-full" style={fieldCssVars}>
        <label
          htmlFor={field.id}
          className="absolute top-3 left-4 text-xs font-medium text-[var(--form-primary)] pointer-events-none z-10"
        >
          {field.label}
          {isRequired && <span className="text-red-500 ml-0.5">*</span>}
        </label>
        <Textarea
          id={field.id}
          name={field.name}
          value={value || ""}
          onChange={handleChange}
          onBlur={onBlur}
          placeholder={field.placeholder}
          disabled={isDisabled}
          readOnly={isReadOnly}
          rows={options.rows || 4}
          maxLength={maxLength}
          aria-invalid={!!error}
          aria-describedby={error ? `${field.id}-error` : undefined}
          className={cn(
            ...baseTextareaStyles,
            ...themeStyles,
            minHeight,
            "pt-8", // Extra padding for internal label
            className,
          )}
        />
        {showCount && (
          <div className="absolute bottom-3 right-3 text-xs text-[var(--form-text-secondary)] bg-[var(--form-bg)] px-1">
            {currentLength}/{maxLength}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative w-full" style={fieldCssVars}>
      <Textarea
        id={field.id}
        name={field.name}
        value={value || ""}
        onChange={handleChange}
        onBlur={onBlur}
        placeholder={field.placeholder}
        disabled={isDisabled}
        readOnly={isReadOnly}
        rows={options.rows || 4}
        maxLength={maxLength}
        aria-invalid={!!error}
        aria-describedby={error ? `${field.id}-error` : undefined}
        className={cn(
          ...baseTextareaStyles,
          ...themeStyles,
          minHeight,
          className,
        )}
      />
      {showCount && (
        <div className="absolute bottom-3 right-3 text-xs text-[var(--form-text-secondary)] bg-[var(--form-bg)] px-1">
          {currentLength}/{maxLength}
        </div>
      )}
    </div>
  );
}

TextAreaField.displayName = "TextAreaField";
