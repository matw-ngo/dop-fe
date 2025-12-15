"use client";

import type { FieldComponentProps, DateFieldConfig } from "../types";
import { Input } from "@/components/ui/input";
import { CalendarIcon } from "lucide-react";
import { useFormTheme } from "../themes/ThemeProvider";
import { cn } from "../utils/helpers";

export function DateField({
  field,
  value,
  onChange,
  onBlur,
  error,
  disabled,
  readOnly,
  className,
}: FieldComponentProps<string | Date | undefined>) {
  const { theme } = useFormTheme();
  const dateField = field as DateFieldConfig;
  const options = dateField.options || {};

  // Determine input type based on field type
  const inputTypeMapping = {
    date: "date",
    datetime: "datetime-local",
    time: "time",
  };

  const inputType =
    inputTypeMapping[field.type as keyof typeof inputTypeMapping] || "date";

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
  const formatDateForInput = (
    date: Date | string | undefined,
    type: string,
  ): string | undefined => {
    if (!date) return undefined;

    try {
      const d = date instanceof Date ? date : new Date(date);
      if (isNaN(d.getTime())) return undefined;

      if (type === "date") {
        return d.toISOString().slice(0, 10);
      } else if (type === "datetime") {
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

  // Build className for the container
  const containerClassName = cn("relative w-full", className);

  // Build className for the input
  const inputClassName = cn(
    // Base styles from theme
    theme.control.base,
    theme.control.variants.default,
    theme.control.sizes.md,

    // State styles
    theme.control.states.focus,
    error && theme.control.states.error,
    (disabled || field.disabled) && theme.control.states.disabled,
    (readOnly || field.readOnly) && theme.control.states.readOnly,
  );

  return (
    <div className={containerClassName}>
      <Input
        id={field.id}
        name={field.name}
        type={inputType}
        value={formatValue(value)}
        onChange={handleChange}
        onBlur={onBlur}
        placeholder={field.placeholder}
        disabled={disabled || field.disabled}
        readOnly={readOnly || field.readOnly}
        min={formatDateForInput(options.minDate, field.type)}
        max={formatDateForInput(options.maxDate, field.type)}
        aria-invalid={!!error}
        aria-describedby={error ? `${field.id}-error` : undefined}
        className={inputClassName}
      />
      <CalendarIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
    </div>
  );
}

DateField.displayName = "DateField";
