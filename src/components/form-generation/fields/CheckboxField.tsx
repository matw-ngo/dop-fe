"use client";

import type { FieldComponentProps, CheckboxFieldConfig } from "../types";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

export function CheckboxField({
  field,
  value,
  onChange,
  onBlur,
  error,
  disabled,
  className,
}: FieldComponentProps<boolean | string[]>) {
  const checkboxField = field as CheckboxFieldConfig;
  const options = checkboxField.options || {};
  const isGroup = field.type === "checkbox-group";
  const isDisabled = disabled || field.disabled;

  if (isGroup && options.choices) {
    // Checkbox Group
    const selectedValues = Array.isArray(value) ? value : [];

    const handleGroupChange = (choiceValue: string, checked: boolean) => {
      if (checked) {
        onChange([...selectedValues, choiceValue]);
      } else {
        onChange(selectedValues.filter((v) => v !== choiceValue));
      }
    };

    return (
      <div className={`space-y-3 ${className}`}>
        {options.choices.map((choice) => {
          const isChecked = selectedValues.includes(choice.value);
          const choiceId = `${field.id}-${choice.value}`;

          return (
            <div key={choice.value} className="flex items-center gap-2">
              <Checkbox
                id={choiceId}
                checked={isChecked}
                onCheckedChange={(checked) =>
                  handleGroupChange(choice.value, checked as boolean)
                }
                disabled={isDisabled || choice.disabled}
                aria-invalid={!!error}
                aria-describedby={error ? `${field.id}-error` : undefined}
              />
              <Label
                htmlFor={choiceId}
                className={`cursor-pointer ${isDisabled || choice.disabled ? "opacity-70 cursor-not-allowed" : ""}`}
              >
                {choice.label}
              </Label>
            </div>
          );
        })}
      </div>
    );
  }

  // Single Checkbox
  const isChecked = !!value;

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Checkbox
        id={field.id}
        name={field.name}
        checked={isChecked}
        onCheckedChange={(checked) => onChange(checked as boolean)}
        onBlur={onBlur}
        disabled={isDisabled}
        aria-invalid={!!error}
        aria-describedby={error ? `${field.id}-error` : undefined}
      />
      {(field.label || options.checkboxLabel) && (
        <Label
          htmlFor={field.id}
          className={`cursor-pointer ${isDisabled ? "opacity-70 cursor-not-allowed" : ""}`}
        >
          {options.checkboxLabel || field.label}
        </Label>
      )}
    </div>
  );
}

CheckboxField.displayName = "CheckboxField";
