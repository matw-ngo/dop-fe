"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useFormTheme } from "../themes/ThemeProvider";
import type { CheckboxFieldConfig, FieldComponentProps } from "../types";
import { cn } from "../utils/helpers";

export function CheckboxField({
  field,
  value,
  onChange,
  onBlur,
  error,
  disabled,
  className,
}: FieldComponentProps<boolean | string[]>) {
  const { theme } = useFormTheme();
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
      <div className={cn("space-y-3", className)}>
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
                className={cn(
                  error && "border-destructive focus-visible:ring-destructive",
                )}
                aria-invalid={!!error}
                aria-describedby={error ? `${field.id}-error` : undefined}
              />
              <Label
                htmlFor={choiceId}
                className={cn(
                  theme.label.base,
                  "cursor-pointer",
                  (isDisabled || choice.disabled) &&
                    (theme.label.disabled || "opacity-70 cursor-not-allowed"),
                )}
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
    <div className={cn("flex items-center gap-2", className)}>
      <Checkbox
        id={field.id}
        name={field.name}
        checked={isChecked}
        onCheckedChange={(checked) => onChange(checked as boolean)}
        onBlur={onBlur}
        disabled={isDisabled}
        className={cn(
          error && "border-destructive focus-visible:ring-destructive",
        )}
        aria-invalid={!!error}
        aria-describedby={error ? `${field.id}-error` : undefined}
      />
      {(field.label || options.checkboxLabel) && (
        <Label
          htmlFor={field.id}
          className={cn(
            theme.label.base,
            "cursor-pointer",
            isDisabled &&
              (theme.label.disabled || "opacity-70 cursor-not-allowed"),
          )}
        >
          {options.checkboxLabel || field.label}
        </Label>
      )}
    </div>
  );
}

CheckboxField.displayName = "CheckboxField";
