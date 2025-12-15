"use client";

import { Input } from "@/components/ui/input";
import { useFormTheme } from "../themes/ThemeProvider";
import type { FieldComponentProps, NumberFieldConfig } from "../types";
import { cn, formatCurrency, parseCurrency } from "../utils/helpers";

export function NumberField({
  field,
  value,
  onChange,
  onBlur,
  error,
  disabled,
  readOnly,
  className,
}: FieldComponentProps<number>) {
  const { theme } = useFormTheme();
  const numberField = field as NumberFieldConfig;
  const options = numberField.options || {};
  const isCurrency = field.type === "currency";
  const isDisabled = disabled || field.disabled;
  const isReadOnly = readOnly || field.readOnly;

  // Display value (formatted for currency)
  const displayValue =
    isCurrency && value != null
      ? formatCurrency(value, options.currency)
      : value?.toString() || "";

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;

    if (isCurrency) {
      const numValue = parseCurrency(inputValue);
      onChange(numValue);
    } else {
      const numValue = inputValue === "" ? undefined : Number(inputValue);
      onChange(numValue as number);
    }
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
    isDisabled && theme.control.states.disabled,
    isReadOnly && theme.control.states.readOnly,

    // User override (highest priority)
    className,
  );

  return (
    <Input
      id={field.id}
      name={field.name}
      type={isCurrency ? "text" : "number"}
      value={displayValue}
      onChange={handleChange}
      onBlur={onBlur}
      placeholder={field.placeholder}
      disabled={isDisabled}
      readOnly={isReadOnly}
      min={options.min}
      max={options.max}
      step={options.step}
      aria-invalid={!!error}
      aria-describedby={error ? `${field.id}-error` : undefined}
      className={inputClassName}
    />
  );
}

NumberField.displayName = "NumberField";
