"use client";

import { Input } from "@/components/ui/input";
import { useFormTheme } from "../themes/ThemeProvider";
import {
  type FieldComponentProps,
  type NumberFieldConfig,
  ValidationRuleType,
} from "../types";
import { cn, formatCurrency, parseCurrency } from "../utils/helpers";

/**
 * NumberField component that handles most styling directly
 * Supports both numeric and currency input with formatting
 */
// TODO: Improve UI consistency and theme integration to match TextField/SelectField implementation
export function NumberField({
  field,
  value,
  onChange,
  onBlur,
  error,
  disabled,
  readOnly,
  className,
}: FieldComponentProps<number>) {
  const { theme } = useFormTheme();
  const numberField = field as NumberFieldConfig;
  const options = numberField.options || {};
  const isCurrency = field.type === "currency";
  const isDisabled = disabled || field.disabled;
  const isReadOnly = readOnly || field.readOnly;
  const internalLabel = theme.fieldOptions?.internalLabel;
  const isRequired = field.validation?.some(
    (rule) => rule.type === ValidationRuleType.REQUIRED,
  );
  const fieldCssVars = {
    "--form-primary": theme.colors.primary,
  } as React.CSSProperties;

  // Display value (formatted for currency)
  const displayValue =
    isCurrency && value != null
      ? formatCurrency(value, options.currency)
      : value?.toString() || "";

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;

    if (isCurrency) {
      const numValue = parseCurrency(inputValue);
      onChange(numValue);
    } else {
      const numValue = inputValue === "" ? undefined : Number(inputValue);
      onChange(numValue as number);
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
    "focus:border-[var(--form-primary)]",
    "focus:ring-2",
    "focus:ring-[var(--form-primary)]/20",
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
      <div className="relative w-full" style={fieldCssVars}>
        <label
          htmlFor={field.id}
          className="absolute top-2 left-4 text-xs font-medium text-[var(--form-primary)] pointer-events-none z-10"
        >
          {field.label}
          {isRequired && <span className="text-red-500 ml-0.5">*</span>}
        </label>
        <Input
          id={field.id}
          name={field.name}
          type="text" // Always use text to avoid browser limitations on number inputs
          value={displayValue}
          onChange={handleChange}
          onBlur={onBlur}
          placeholder={field.placeholder}
          disabled={isDisabled}
          readOnly={isReadOnly}
          min={options.min}
          max={options.max}
          step={options.step}
          inputMode={isCurrency ? "decimal" : "numeric"} // Better mobile keyboard
          aria-invalid={!!error}
          aria-describedby={error ? `${field.id}-error` : undefined}
          className={cn(
            ...baseInputStyles,
            ...themeStyles,
            "pt-8", // Extra padding for internal label
            className,
          )}
        />
      </div>
    );
  }

  return (
    <Input
      id={field.id}
      name={field.name}
      type="text" // Always use text to avoid browser limitations on number inputs
      value={displayValue}
      onChange={handleChange}
      onBlur={onBlur}
      placeholder={field.placeholder}
      disabled={isDisabled}
      readOnly={isReadOnly}
      min={options.min}
      max={options.max}
      step={options.step}
      inputMode={isCurrency ? "decimal" : "numeric"} // Better mobile keyboard
      aria-invalid={!!error}
      aria-describedby={error ? `${field.id}-error` : undefined}
      style={fieldCssVars}
      className={cn(...baseInputStyles, ...themeStyles, className)}
    />
  );
}

NumberField.displayName = "NumberField";
