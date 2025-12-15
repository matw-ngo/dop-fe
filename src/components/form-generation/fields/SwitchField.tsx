"use client";

import type { FieldComponentProps } from "../types";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export function SwitchField({
  field,
  value,
  onChange,
  onBlur,
  error,
  disabled,
  className,
}: FieldComponentProps<boolean>) {
  const isChecked = !!value;
  const isDisabled = disabled || field.disabled;

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <Switch
        id={field.id}
        checked={isChecked}
        onCheckedChange={onChange}
        onBlur={onBlur}
        disabled={isDisabled}
        aria-invalid={!!error}
        aria-describedby={error ? `${field.id}-error` : undefined}
        aria-labelledby={field.label ? `${field.id}-label` : undefined}
      />
      {field.label && (
        <Label
          id={`${field.id}-label`}
          htmlFor={field.id}
          className={`cursor-pointer ${isDisabled ? "opacity-70 cursor-not-allowed" : ""}`}
        >
          {field.label}
        </Label>
      )}
    </div>
  );
}

SwitchField.displayName = "SwitchField";
