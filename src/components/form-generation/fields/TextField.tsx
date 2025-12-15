"use client";

import type { FieldComponentProps, TextFieldConfig } from "../types";
import { Input } from "@/components/ui/input";
import { useFormTheme } from "../themes/ThemeProvider";
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
