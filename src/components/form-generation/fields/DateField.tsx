/**
 * Form Generation Library - Date Field Component
 *
 * Date/DateTime/Time input field with calendar icon
 */

"use client";

import type { FieldComponentProps, DateFieldConfig } from "../types";
import { cn } from "../utils/helpers";
import { inputVariants } from "../styles/variants";
import { Calendar } from "lucide-react";

export function DateField({
  field,
  value,
  onChange,
  onBlur,
  error,
  disabled,
  readOnly,
  className,
}: FieldComponentProps<Date | string>) {
  const dateField = field as DateFieldConfig;
  const options = dateField.options || {};

  // Determine input type based on field type
  const inputType =
    field.type === "datetime"
      ? "datetime-local"
      : field.type === "time"
        ? "time"
        : "date";

  // Format value for input
  const formatValue = (val: Date | string | undefined | null): string => {
    if (!val) return "";

    try {
      const date = val instanceof Date ? val : new Date(val);

      if (isNaN(date.getTime())) return "";

      if (inputType === "datetime-local") {
        // Format: YYYY-MM-DDTHH:mm
        return date.toISOString().slice(0, 16);
      } else if (inputType === "time") {
        // Format: HH:mm
        return date.toTimeString().slice(0, 5);
      } else {
        // Format: YYYY-MM-DD
        return date.toISOString().slice(0, 10);
      }
    } catch {
      return "";
    }
  };

  // Format min/max dates
  const formatMinMax = (
    date: Date | string | undefined,
  ): string | undefined => {
    if (!date) return undefined;

    try {
      const d = date instanceof Date ? date : new Date(date);
      if (isNaN(d.getTime())) return undefined;

      if (inputType === "date") {
        return d.toISOString().slice(0, 10);
      } else if (inputType === "datetime-local") {
        return d.toISOString().slice(0, 16);
      }
      return undefined;
    } catch {
      return undefined;
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;

    if (!newValue) {
      onChange(undefined);
      return;
    }

    // Convert to Date object or keep as string based on preference
    try {
      const date = new Date(newValue);
      onChange(date);
    } catch {
      onChange(newValue);
    }
  };

  return (
    <div className="relative w-full">
      <input
        id={field.id}
        name={field.name}
        type={inputType}
        value={formatValue(value)}
        onChange={handleChange}
        onBlur={onBlur}
        min={formatMinMax(options.minDate)}
        max={formatMinMax(options.maxDate)}
        disabled={disabled || field.disabled}
        readOnly={readOnly || field.readOnly}
        aria-invalid={!!error}
        aria-describedby={error ? `${field.id}-error` : undefined}
        className={cn(
          inputVariants({ state: error ? "error" : "default" }),
          "pr-10", // Space for icon
          className,
        )}
      />
      <Calendar
        className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none"
        aria-hidden="true"
      />
    </div>
  );
}

DateField.displayName = "DateField";
