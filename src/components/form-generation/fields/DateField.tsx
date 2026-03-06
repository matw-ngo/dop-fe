"use client";

import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import * as React from "react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useFormTheme } from "../themes/ThemeProvider";
import {
  type DateFieldConfig,
  type FieldComponentProps,
  ValidationRuleType,
} from "../types";
import { cn } from "../utils/helpers";

/**
 * DateField component that handles date, datetime, and time inputs
 * Uses a professional DatePicker with Popover and Calendar
 * Includes year and month selectors for better UX (especially for birthdate)
 */
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
  const isRequired = field.validation?.some(
    (rule) => rule.type === ValidationRuleType.REQUIRED,
  );

  // Parse value to Date object
  const dateValue = React.useMemo(() => {
    if (!value) return undefined;
    if (value instanceof Date) return value;
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? undefined : date;
  }, [value]);

  // State for month/year navigation
  const [displayMonth, setDisplayMonth] = React.useState<Date>(() => {
    // Default to 25 years ago for birthdate fields, or current date
    const isBirthdate =
      field.id?.toLowerCase().includes("birth") ||
      field.label?.toLowerCase().includes("sinh") ||
      field.label?.toLowerCase().includes("birth");

    if (isBirthdate) {
      const defaultDate = new Date();
      defaultDate.setFullYear(defaultDate.getFullYear() - 25);
      return dateValue || defaultDate;
    }

    return dateValue || new Date();
  });

  const handleSelect = (date: Date | undefined) => {
    onChange(date);
    if (date) {
      setDisplayMonth(date);
    }
    // Explicitly call onBlur to trigger validation if needed
    if (onBlur) {
      onBlur();
    }
  };

  // Generate year options (100 years range)
  const currentYear = new Date().getFullYear();
  const yearOptions = React.useMemo(() => {
    const years: number[] = [];
    for (let i = currentYear; i >= currentYear - 100; i--) {
      years.push(i);
    }
    return years;
  }, [currentYear]);

  // Month options
  const monthOptions = React.useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => ({
      value: i,
      label: format(new Date(2000, i, 1), "MMMM", { locale: vi }),
    }));
  }, []);

  const handleYearChange = (year: string) => {
    const newDate = new Date(displayMonth);
    newDate.setFullYear(parseInt(year, 10));
    setDisplayMonth(newDate);
  };

  const handleMonthChange = (month: string) => {
    const newDate = new Date(displayMonth);
    newDate.setMonth(parseInt(month, 10));
    setDisplayMonth(newDate);
  };

  const handlePreviousMonth = () => {
    const newDate = new Date(displayMonth);
    newDate.setMonth(newDate.getMonth() - 1);
    setDisplayMonth(newDate);
  };

  const handleNextMonth = () => {
    const newDate = new Date(displayMonth);
    newDate.setMonth(newDate.getMonth() + 1);
    setDisplayMonth(newDate);
  };

  // Base input styles that are consistent across themes
  const baseButtonStyles = [
    "w-full",
    "flex",
    "items-center",
    "justify-between",
    "border",
    "transition-all",
    "duration-200",
    "text-sm",
    "font-normal",
    "text-left",
    "text-[var(--form-text)]",
    // Base focus styles
    "focus:outline-none",
    // Disabled and readonly states
    "disabled:cursor-not-allowed",
    "disabled:opacity-60",
    "aria-readonly:cursor-default",
  ];

  // Theme-specific styles
  const themeStyles = [
    // Border radius from theme
    "rounded-[8px]",
    // Border color
    "border-[var(--form-border)]",
    // Default background
    "!bg-[var(--form-bg)]",
    // Size
    "h-[60px]",
    "px-4",
    // Focus state
    "focus:border-[var(--form-primary)]",
    "focus:ring-2",
    "focus:ring-[var(--form-primary)]/20",
    // Error state
    error && "border-[var(--form-error)]",
    error && "focus:ring-[var(--form-error)]/20",
    // Override background for special states
    isDisabled && "!bg-[var(--form-disabled-bg)]",
    isReadOnly && "!bg-[var(--form-readonly-bg)]",
  ].filter(Boolean);

  const renderTrigger = () => {
    const displayValue = dateValue
      ? format(dateValue, "dd/MM/yyyy", { locale: vi })
      : field.placeholder || "Chọn ngày";

    return (
      <Button
        variant="outline"
        className={cn(
          ...baseButtonStyles,
          ...themeStyles,
          !dateValue && "text-[var(--form-placeholder)]",
          internalLabel && field.label && "pt-8",
          className,
        )}
        disabled={isDisabled}
        aria-readonly={isReadOnly}
        aria-invalid={!!error}
        aria-describedby={error ? `${field.id}-error` : undefined}
      >
        <span className="truncate">{displayValue}</span>
        <CalendarIcon
          className="h-4 w-4 text-[var(--form-text-secondary)] shrink-0 ml-2"
          aria-hidden="true"
        />
      </Button>
    );
  };

  const content = (
    <div className={cn("relative w-full", className)}>
      {internalLabel && field.label && (
        <label
          htmlFor={field.id}
          className="absolute top-2 left-4 text-xs font-medium text-[var(--form-primary)] pointer-events-none z-10"
        >
          {field.label}
          {isRequired && (
            <span className="text-[var(--form-error)] ml-0.5">*</span>
          )}
        </label>
      )}

      {isReadOnly || isDisabled ? (
        renderTrigger()
      ) : (
        <Popover>
          <PopoverTrigger asChild>{renderTrigger()}</PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            {/* Custom header with year and month selectors */}
            <div className="flex items-center justify-between gap-2 p-3 border-b">
              <Button
                variant="outline"
                size="icon"
                className="h-7 w-7 shrink-0"
                onClick={handlePreviousMonth}
                type="button"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              <div className="flex gap-2 flex-1 justify-center">
                <select
                  value={displayMonth.getMonth()}
                  onChange={(e) => handleMonthChange(e.target.value)}
                  className="h-8 px-2 text-sm border rounded-md bg-background"
                >
                  {monthOptions.map((month) => (
                    <option key={month.value} value={month.value}>
                      {month.label}
                    </option>
                  ))}
                </select>

                <select
                  value={displayMonth.getFullYear()}
                  onChange={(e) => handleYearChange(e.target.value)}
                  className="h-8 px-2 text-sm border rounded-md bg-background"
                >
                  {yearOptions.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>

              <Button
                variant="outline"
                size="icon"
                className="h-7 w-7 shrink-0"
                onClick={handleNextMonth}
                type="button"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            <Calendar
              mode="single"
              selected={dateValue}
              onSelect={handleSelect}
              month={displayMonth}
              onMonthChange={setDisplayMonth}
              locale={vi}
              disabled={(date) => {
                if (options.minDate) {
                  const min = new Date(options.minDate);
                  if (date < min) return true;
                }
                if (options.maxDate) {
                  const max = new Date(options.maxDate);
                  if (date > max) return true;
                }
                return false;
              }}
            />
          </PopoverContent>
        </Popover>
      )}
    </div>
  );

  return content;
}

DateField.displayName = "DateField";
