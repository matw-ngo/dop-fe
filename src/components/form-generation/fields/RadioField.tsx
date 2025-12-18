"use client";

import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import type { FieldComponentProps, RadioFieldConfig } from "../types";
import { cn } from "../utils/helpers";

/**
 * RadioField component that handles radio button groups
 * Uses simplified inline styling for consistent appearance
 */
// TODO: Improve UI consistency and theme integration to match TextField/SelectField implementation
export function RadioField({
  field,
  value,
  onChange,
  onBlur,
  error,
  disabled,
  className,
}: FieldComponentProps<string>) {
  const radioField = field as RadioFieldConfig;
  const options = radioField.options || {};
  const isDisabled = disabled || field.disabled;
  const layout = options.layout || "vertical";

  if (!options.choices || options.choices.length === 0) {
    return null;
  }

  // Base radio button styles for error state
  const radioStyles = cn(
    "text-[#017848]",
    "focus-visible:ring-[#017848]/20",
    error && "text-red-500",
    error && "border-red-500",
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

  return (
    <RadioGroup
      value={value || ""}
      onValueChange={onChange}
      onBlur={onBlur}
      disabled={isDisabled}
      className={cn(
        layout === "horizontal" ? "flex flex-wrap gap-4" : "space-y-3",
        className,
      )}
      aria-invalid={!!error}
      aria-describedby={error ? `${field.id}-error` : undefined}
    >
      {options.choices.map((choice) => {
        const choiceId = `${field.id}-${choice.value}`;

        return (
          <div key={choice.value} className="flex items-center gap-2">
            <RadioGroupItem
              id={choiceId}
              value={choice.value}
              disabled={isDisabled || choice.disabled}
              className={radioStyles}
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
    </RadioGroup>
  );
}

RadioField.displayName = "RadioField";
