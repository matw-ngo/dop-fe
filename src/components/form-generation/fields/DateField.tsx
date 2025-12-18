"use client";

import { CalendarIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useFormTheme } from "../themes/ThemeProvider";
import type { DateFieldConfig, FieldComponentProps } from "../types";
import { cn } from "../utils/helpers";

/**
 * DateField component that handles date, datetime, and time inputs
 * Uses simplified inline styling with calendar icon
 */
// TODO: Improve UI consistency and theme integration to match TextField/SelectField implementation
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
  const isDisabled = disabled || field.disabled;
  const isReadOnly = readOnly || field.readOnly;
  const internalLabel = theme.fieldOptions?.internalLabel;

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

  // Base input styles that are consistent across themes
  const baseInputStyles = [
    "w-full",
    "border",
    "transition-all",
    "duration-200",
    "text-sm",
    // Base focus styles
    "focus:outline-none",
    // Placeholder styles
    "placeholder:text-gray-400",
    "placeholder:font-medium",
    // Disabled and readonly states
    "disabled:cursor-not-allowed",
    "disabled:opacity-60",
    "read-only:cursor-default",
    // Add padding for icon
    "pr-12",
  ];

  // Theme-specific styles
  const themeStyles = [
    // Border radius from theme
    "rounded-[8px]",
    // Border color
    "border-[#bfd1cc]",
    // Default background
    "bg-white",
    // Size
    "h-[60px]",
    "px-4",
    // Focus state
    "focus:border-[#017848]",
    "focus:ring-2",
    "focus:ring-[#017848]/20",
    // Error state
    error && "border-red-500",
    error && "focus:ring-red-500/20",
    // Override background for special states
    isDisabled && "!bg-gray-100",
    isReadOnly && "!bg-gray-50",
  ].filter(Boolean);

  // If internal label is enabled, use wrapper with label
  if (internalLabel && field.label) {
    return (
      <div className={cn("relative w-full", className)}>
        <label
          htmlFor={field.id}
          className="absolute top-2 left-4 text-xs font-medium text-[#017848] pointer-events-none z-10"
        >
          {field.label}
        </label>
        <Input
          id={field.id}
          name={field.name}
          type="text" // Use text type to avoid browser date picker
          value={formatValue(value)}
          onChange={handleChange}
          onBlur={onBlur}
          placeholder={field.placeholder}
          disabled={isDisabled}
          readOnly={isReadOnly}
          min={formatDateForInput(options.minDate, field.type)}
          max={formatDateForInput(options.maxDate, field.type)}
          aria-invalid={!!error}
          aria-describedby={error ? `${field.id}-error` : undefined}
          inputMode={inputType === "time" ? "numeric" : "text"}
          className={cn(
            ...baseInputStyles,
            ...themeStyles,
            "pt-8", // Extra padding for internal label
          )}
        />
        <CalendarIcon
          className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none"
          aria-hidden="true"
        />
      </div>
    );
  }

  return (
    <div className={cn("relative w-full", className)}>
      <Input
        id={field.id}
        name={field.name}
        type="text" // Use text type to avoid browser date picker
        value={formatValue(value)}
        onChange={handleChange}
        onBlur={onBlur}
        placeholder={field.placeholder}
        disabled={isDisabled}
        readOnly={isReadOnly}
        min={formatDateForInput(options.minDate, field.type)}
        max={formatDateForInput(options.maxDate, field.type)}
        aria-invalid={!!error}
        aria-describedby={error ? `${field.id}-error` : undefined}
        inputMode={inputType === "time" ? "numeric" : "text"}
        className={cn(...baseInputStyles, ...themeStyles)}
      />
      <CalendarIcon
        className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none"
        aria-hidden="true"
      />
    </div>
  );
}

DateField.displayName = "DateField";
