"use client";

import { Input } from "@/components/ui/input";
import { useFormTheme } from "../themes/ThemeProvider";
import type { FieldComponentProps, TextFieldConfig } from "../types";
import { cn } from "../utils/helpers";

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  // Build className from theme + user overrides
  const inputClassName = cn(
    // Base styles from theme
    theme.control.base,
    theme.control.variants.default,
    theme.control.sizes.md,

    // State styles
    theme.control.states.focus,
    error && theme.control.states.error,
    disabled && theme.control.states.disabled,
    readOnly && theme.control.states.readOnly,

    // User override (highest priority)
    className,
  );

  const internalLabel = theme.fieldOptions?.internalLabel;

  // Determine if we need a wrapper for adornments or internal label
  const hasAdornments =
    options.prefix ||
    options.suffix ||
    options.startAdornment ||
    options.endAdornment;
  const needsWrapper = internalLabel || hasAdornments;

  if (needsWrapper) {
    return (
      <div
        className={cn(
          // Use control styles on the wrapper
          inputClassName,
          "flex items-center relative gap-2",
          internalLabel ? "pt-5 pb-1 h-[60px]" : "",
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
          <div className="flex items-center shrink-0 text-muted-foreground ml-1">
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
            "border-none shadow-none focus-visible:ring-0 px-0 h-auto py-0 bg-transparent w-full",
            internalLabel && "mt-1", // minimal adjustment to align with label
          )}
        />

        {/* End Adornments */}
        {(options.suffix || options.endAdornment) && (
          <div className="flex items-center shrink-0 text-muted-foreground mr-1">
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
      className={inputClassName}
    />
  );
}

TextField.displayName = "TextField";
