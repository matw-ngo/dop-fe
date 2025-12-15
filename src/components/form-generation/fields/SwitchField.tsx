/**
 * Form Generation Library - Switch Field Component
 *
 * Toggle switch for boolean values
 */

"use client";

import type { FieldComponentProps } from "../types";
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
  const isChecked = !!value;
  const isDisabled = disabled || field.disabled;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.checked);
  };

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <button
        type="button"
        role="switch"
        aria-checked={isChecked}
        aria-labelledby={`${field.id}-label`}
        aria-describedby={error ? `${field.id}-error` : undefined}
        disabled={isDisabled}
        onClick={() => !isDisabled && onChange(!isChecked)}
        onBlur={onBlur}
        className={cn(
          "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full",
          "border-2 border-transparent transition-colors duration-200",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          "disabled:cursor-not-allowed disabled:opacity-50",
          isChecked ? "bg-primary" : "bg-input",
          error && "ring-2 ring-destructive",
        )}
      >
        <span
          aria-hidden="true"
          className={cn(
            "pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-lg",
            "ring-0 transition-transform duration-200",
            isChecked ? "translate-x-5" : "translate-x-0",
          )}
        />
      </button>
      <input
        id={field.id}
        name={field.name}
        type="checkbox"
        checked={isChecked}
        onChange={handleChange}
        disabled={isDisabled}
        className="sr-only"
        aria-hidden="true"
        tabIndex={-1}
      />
      {field.label && (
        <label
          id={`${field.id}-label`}
          htmlFor={field.id}
          className={cn(
            "text-sm font-medium leading-none cursor-pointer",
            "peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
            isDisabled && "opacity-70 cursor-not-allowed",
          )}
          onClick={() => !isDisabled && onChange(!isChecked)}
        >
          {field.label}
        </label>
      )}
    </div>
  );
}

SwitchField.displayName = "SwitchField";
