"use client";

import type { FieldComponentProps, NumberFieldConfig } from "../types";
import { Input } from "@/components/ui/input";
import { formatCurrency, parseCurrency } from "../utils/helpers";

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
  const numberField = field as NumberFieldConfig;
  const options = numberField.options || {};
  const isCurrency = field.type === "currency";

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

  return (
    <Input
      id={field.id}
      name={field.name}
      type={isCurrency ? "text" : "number"}
      value={displayValue}
      onChange={handleChange}
      onBlur={onBlur}
      placeholder={field.placeholder}
      disabled={disabled || field.disabled}
      readOnly={readOnly || field.readOnly}
      min={options.min}
      max={options.max}
      step={options.step}
      aria-invalid={!!error}
      aria-describedby={error ? `${field.id}-error` : undefined}
      className={className}
    />
  );
}

NumberField.displayName = "NumberField";
