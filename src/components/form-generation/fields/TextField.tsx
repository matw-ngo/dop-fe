"use client";

import { Input } from "@/components/ui/input";
import { useFormTheme } from "../themes/ThemeProvider";
import type { FieldComponentProps, TextFieldConfig } from "../types";
import { cn } from "../utils/helpers";

/**
 * TextField component that handles most styling directly
 * Uses theme only for truly customizable properties
 */
export function TextField({
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
  const textField = field as TextFieldConfig;
  const options = textField.options || {};
  const internalLabel = theme.fieldOptions?.internalLabel;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  // Determine if we need a wrapper for adornments or internal label
  const hasAdornments =
    options.prefix ||
    options.suffix ||
    options.startAdornment ||
    options.endAdornment;
  const needsWrapper = internalLabel || hasAdornments;

  // Base input styles that are consistent across themes
  const baseInputStyles = [
    "w-full",
    "border",
    "transition-all",
    "duration-200",
    "text-sm",
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
    "rounded-[8px]", // This could be extracted from theme if needed
    // Border color
    "border-[#bfd1cc]",
    // Default background (important!)
    "bg-white",
    // Focus state
    "focus:border-[#017848]",
    "focus:ring-2",
    "focus:ring-[#017848]/20",
    // Error state
    error && "border-red-500",
    error && "focus:ring-red-500/20",
    // Override background for special states
    (disabled || field.disabled) && "!bg-gray-100",
    (readOnly || field.readOnly) && "!bg-gray-50",
  ].filter(Boolean);

  // Size styles
  const sizeStyles = {
    sm: "h-12 px-3",
    md: "h-[60px] px-4",
    lg: "h-16 px-4 text-lg",
  };

  if (needsWrapper) {
    return (
      <div
        className={cn(
          // Wrapper styles
          ...baseInputStyles,
          ...themeStyles,
          "flex",
          "items-center",
          "relative",
          "gap-2",
          // Size handling for wrapper
          sizeStyles.md,
          internalLabel && "pt-5 pb-1",
        )}
      >
        {/* Internal Label */}
        {internalLabel && field.label && (
          <label
            htmlFor={field.id}
            className="absolute top-2 left-4 text-xs font-medium text-[#017848] pointer-events-none"
          >
            {field.label}
          </label>
        )}

        {/* Start Adornments */}
        {(options.prefix || options.startAdornment) && (
          <div className="flex items-center shrink-0 text-gray-500 ml-1">
            {options.prefix || options.startAdornment}
          </div>
        )}

        {/* Input - reset styles to be transparent inside wrapper */}
        <Input
          id={field.id}
          name={field.name}
          type={field.type}
          value={value || ""}
          onChange={handleChange}
          onBlur={onBlur}
          placeholder={field.placeholder}
          disabled={disabled || field.disabled}
          readOnly={readOnly || field.readOnly}
          maxLength={options.maxLength}
          autoComplete={options.autoComplete}
          aria-invalid={!!error}
          aria-describedby={error ? `${field.id}-error` : undefined}
          className={cn(
            // Reset native input styles
            "border-none",
            "shadow-none",
            "focus-visible:ring-0",
            "px-0",
            "h-6",
            "py-0",
            "bg-transparent",
            "w-full",
            "text-sm",
            // Adjust position for internal label
            internalLabel && "mt-1",
            // Keep placeholder styling
            "placeholder:text-gray-400",
            "placeholder:font-medium",
          )}
        />

        {/* End Adornments */}
        {(options.suffix || options.endAdornment) && (
          <div className="flex items-center shrink-0 text-gray-500 mr-1">
            {options.suffix || options.endAdornment}
          </div>
        )}
      </div>
    );
  }

  return (
    <Input
      id={field.id}
      name={field.name}
      type={field.type}
      value={value || ""}
      onChange={handleChange}
      onBlur={onBlur}
      placeholder={field.placeholder}
      disabled={disabled || field.disabled}
      readOnly={readOnly || field.readOnly}
      maxLength={options.maxLength}
      autoComplete={options.autoComplete}
      aria-invalid={!!error}
      aria-describedby={error ? `${field.id}-error` : undefined}
      className={cn(
        ...baseInputStyles,
        ...themeStyles,
        sizeStyles.md,
        className,
      )}
    />
  );
}

TextField.displayName = "TextField";
