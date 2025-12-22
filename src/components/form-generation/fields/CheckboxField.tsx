"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  type CheckboxFieldConfig,
  type FieldComponentProps,
  ValidationRuleType,
} from "../types";
import { cn } from "../utils/helpers";

/**
 * CheckboxField component that handles both single checkbox and checkbox group
 * Uses simplified inline styling for consistent appearance
 */
// TODO: Improve UI consistency and theme integration to match TextField/SelectField implementation
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
  const isRequired = field.validation?.some(
    (rule) => rule.type === ValidationRuleType.REQUIRED,
  );

  // Base checkbox styles for error state
  const checkboxStyles = cn(
    "data-[state=checked]:bg-[#017848]",
    "data-[state=checked]:border-[#017848]",
    "focus-visible:ring-[#017848]/20",
    error && "border-red-500",
    error && "data-[state=checked]:bg-red-500",
    error && "data-[state=checked]:border-red-500",
    error && "focus-visible:ring-red-500/20",
  );

  // Base label styles
  const labelStyles = cn(
    "text-sm",
    "font-medium",
    "text-gray-700",
    "select-none",
    "cursor-pointer",
    isDisabled && "opacity-60",
    isDisabled && "cursor-not-allowed",
  );

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
      <div
        className={cn("space-y-3", className)}
        role="group"
        aria-label={field.label}
      >
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
                className={checkboxStyles}
                aria-invalid={!!error}
                aria-describedby={error ? `${field.id}-error` : undefined}
              />
              <Label
                htmlFor={choiceId}
                className={cn(
                  labelStyles,
                  (isDisabled || choice.disabled) && "!cursor-not-allowed",
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
        className={checkboxStyles}
        aria-invalid={!!error}
        aria-describedby={error ? `${field.id}-error` : undefined}
      />
      {(field.label || options.checkboxLabel) && (
        <Label
          htmlFor={field.id}
          className={cn(labelStyles, isDisabled && "!cursor-not-allowed")}
        >
          {options.checkboxLabel || field.label}
          {isRequired && <span className="text-red-500 ml-0.5">*</span>}
        </Label>
      )}
    </div>
  );
}

CheckboxField.displayName = "CheckboxField";
