"use client";

import { Textarea } from "@/components/ui/textarea";
import { useFormTheme } from "../themes/ThemeProvider";
import type { FieldComponentProps, TextAreaFieldConfig } from "../types";
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
    "placeholder:text-gray-400",
    "placeholder:font-medium",
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
    "border-[#bfd1cc]",
    // Default background
    "bg-white",
    // Padding
    "px-4",
    "py-3",
    // Focus state
    "focus:border-[#017848]",
    "focus:ring-2",
    "focus:ring-[#017848]/20",
    // Error state
    error && "border-red-500",
    error && "focus:ring-red-500/20",
    // Override background for special states
    isDisabled && "!bg-gray-100",
    isReadOnly && "!bg-gray-50",
  ].filter(Boolean);

  // Minimum height based on rows option
  const minHeight = options.rows ? undefined : "min-h-[120px]";

  // If internal label is enabled, use wrapper with label
  if (internalLabel && field.label) {
    return (
      <div className="relative w-full">
        <label
          htmlFor={field.id}
          className="absolute top-3 left-4 text-xs font-medium text-[#017848] pointer-events-none z-10"
        >
          {field.label}
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
          <div className="absolute bottom-3 right-3 text-xs text-gray-500 bg-white px-1">
            {currentLength}/{maxLength}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative w-full">
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
        <div className="absolute bottom-3 right-3 text-xs text-gray-500 bg-white px-1">
          {currentLength}/{maxLength}
        </div>
      )}
    </div>
  );
}

TextAreaField.displayName = "TextAreaField";
