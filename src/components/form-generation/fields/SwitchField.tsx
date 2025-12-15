"use client";

import type { FieldComponentProps } from "../types";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useFormTheme } from "../themes/ThemeProvider";
import { cn } from "../utils/helpers";

export function SwitchField({
  field,
  value,
  onChange,
  onBlur,
  error,
  disabled,
  className,
}: FieldComponentProps<boolean>) {
  const { theme } = useFormTheme();
  const isChecked = !!value;
  const isDisabled = disabled || field.disabled;

  // Build className for the container
  const containerClassName = cn("flex items-center gap-3", className);

  // Build className for the switch
  const switchClassName = cn(
    // Base styles from theme
    theme.control.base,
    theme.control.variants.default,
    theme.control.sizes.md,

    // State styles
    theme.control.states.focus,
    error && theme.control.states.error,
    isDisabled && theme.control.states.disabled,
  );

  // Build className for the label
  const labelClassName = cn(
    theme.label.base,
    isDisabled && theme.label.disabled,
    "cursor-pointer",
  );

  return (
    <div className={containerClassName}>
      <Switch
        id={field.id}
        checked={isChecked}
        onCheckedChange={onChange}
        onBlur={onBlur}
        disabled={isDisabled}
        aria-invalid={!!error}
        aria-describedby={error ? `${field.id}-error` : undefined}
        aria-labelledby={field.label ? `${field.id}-label` : undefined}
        className={switchClassName}
      />
      {field.label && (
        <Label
          id={`${field.id}-label`}
          htmlFor={field.id}
          className={labelClassName}
        >
          {field.label}
        </Label>
      )}
    </div>
  );
}

SwitchField.displayName = "SwitchField";
