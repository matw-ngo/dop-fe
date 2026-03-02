"use client";

import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
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
  const fieldCssVars = {
    "--form-primary": theme.colors.primary,
    "--form-border": theme.colors.border,
    "--form-bg": theme.colors.background,
    "--form-text": theme.colors.textPrimary || "#073126",
    "--form-disabled-bg": theme.colors.disabled,
    "--form-readonly-bg": theme.colors.readOnly,
    "--form-placeholder": theme.colors.placeholder,
    "--form-text-secondary": theme.colors.textSecondary || "#4d7e70",
    "--form-error": theme.colors.error,
    "--primary": theme.colors.primary,
    "--primary-foreground": "#ffffff",
    "--ring": theme.colors.borderFocus || theme.colors.primary,
    "--border": theme.colors.border,
    "--input": theme.colors.border,
    "--background": theme.colors.background,
    "--foreground": theme.colors.textPrimary || "#0f172a",
    "--popover": theme.colors.background,
    "--popover-foreground": theme.colors.textPrimary || "#0f172a",
    "--accent": theme.colors.readOnly,
    "--accent-foreground": theme.colors.textPrimary || "#0f172a",
    "--muted": theme.colors.readOnly,
    "--muted-foreground": theme.colors.textSecondary || "#4d7e70",
    "--destructive": theme.colors.error,
    "--card": theme.colors.background,
    "--card-foreground": theme.colors.textPrimary || "#0f172a",
    "--color-primary": theme.colors.primary,
    "--color-primary-foreground": "#ffffff",
    "--color-ring": theme.colors.borderFocus || theme.colors.primary,
    "--color-border": theme.colors.border,
    "--color-input": theme.colors.border,
    "--color-background": theme.colors.background,
    "--color-foreground": theme.colors.textPrimary || "#0f172a",
    "--color-popover": theme.colors.background,
    "--color-popover-foreground": theme.colors.textPrimary || "#0f172a",
    "--color-accent": theme.colors.readOnly,
    "--color-accent-foreground": theme.colors.textPrimary || "#0f172a",
    "--color-muted": theme.colors.readOnly,
    "--color-muted-foreground": theme.colors.textSecondary || "#4d7e70",
    "--color-destructive": theme.colors.error,
    "--color-card": theme.colors.background,
    "--color-card-foreground": theme.colors.textPrimary || "#0f172a",
  } as React.CSSProperties;
  const popoverThemeVars = {
    backgroundColor: theme.colors.background,
    color: theme.colors.textPrimary || "#0f172a",
    borderColor: theme.colors.border,
    "--color-popover": theme.colors.background,
    "--color-popover-foreground": theme.colors.textPrimary || "#0f172a",
    "--color-background": theme.colors.background,
    "--color-foreground": theme.colors.textPrimary || "#0f172a",
    "--color-accent": theme.colors.readOnly,
    "--color-accent-foreground": theme.colors.textPrimary || "#0f172a",
    "--color-primary": theme.colors.primary,
    "--color-primary-foreground": "#ffffff",
    "--color-ring": theme.colors.borderFocus || theme.colors.primary,
    "--color-border": theme.colors.border,
    "--color-input": theme.colors.border,
    "--color-muted": theme.colors.readOnly,
    "--color-muted-foreground": theme.colors.textSecondary || "#4d7e70",
    "--primary": theme.colors.primary,
    "--primary-foreground": "#ffffff",
    "--ring": theme.colors.borderFocus || theme.colors.primary,
    "--border": theme.colors.border,
    "--input": theme.colors.border,
    "--background": theme.colors.background,
    "--foreground": theme.colors.textPrimary || "#0f172a",
    "--popover": theme.colors.background,
    "--popover-foreground": theme.colors.textPrimary || "#0f172a",
    "--accent": theme.colors.readOnly,
    "--accent-foreground": theme.colors.textPrimary || "#0f172a",
    "--muted": theme.colors.readOnly,
    "--muted-foreground": theme.colors.textSecondary || "#4d7e70",
    "--destructive": theme.colors.error,
    "--card": theme.colors.background,
    "--card-foreground": theme.colors.textPrimary || "#0f172a",
  } as React.CSSProperties;

  // Determine input type based on field type
  const _inputType = (field.type as "date" | "datetime" | "time") || "date";

  // Parse value to Date object
  const dateValue = React.useMemo(() => {
    if (!value) return undefined;
    if (value instanceof Date) return value;
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? undefined : date;
  }, [value]);

  const handleSelect = (date: Date | undefined) => {
    onChange(date);
    // Explicitly call onBlur to trigger validation if needed
    if (onBlur) {
      onBlur();
    }
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
    "bg-[var(--form-bg)]",
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
    <div className={cn("relative w-full", className)} style={fieldCssVars}>
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
          <PopoverContent
            className="w-auto p-0"
            align="start"
            style={popoverThemeVars}
          >
            <Calendar
              mode="single"
              selected={dateValue}
              onSelect={handleSelect}
              initialFocus
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
