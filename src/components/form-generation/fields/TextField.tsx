"use client";

import type { FieldComponentProps, TextFieldConfig } from "../types";
import { Input } from "@/components/ui/input";

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
  const textField = field as TextFieldConfig;
  const options = textField.options || {};

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

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
      className={className}
    />
  );
}

TextField.displayName = "TextField";
