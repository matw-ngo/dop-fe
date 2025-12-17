"use client";

import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useFormTheme } from "../themes/ThemeProvider";
import type { FieldComponentProps, RadioFieldConfig } from "../types";
import { cn } from "../utils/helpers";

export function RadioField({
  field,
  value,
  onChange,
  onBlur,
  error,
  disabled,
  className,
}: FieldComponentProps<string>) {
  const { theme } = useFormTheme();
  const radioField = field as RadioFieldConfig;
  const options = radioField.options || {};
  const isDisabled = disabled || field.disabled;
  const layout = options.layout || "vertical";

  if (!options.choices || options.choices.length === 0) {
    return null;
  }

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
              className={cn(
                error && "border-destructive focus-visible:ring-destructive",
              )}
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
    </RadioGroup>
  );
}

RadioField.displayName = "RadioField";
