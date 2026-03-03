"use client";

import * as SwitchPrimitive from "@radix-ui/react-switch";
import { Label } from "@/components/ui/label";
import { useFormTheme } from "../themes/ThemeProvider";
import { type FieldComponentProps, ValidationRuleType } from "../types";
import { cn } from "../utils/helpers";

/**
 * SwitchField component that handles toggle switches
 * Only the thumb (circle) can toggle the switch, not the entire track
 */
// TODO: Improve UI consistency and theme integration to match TextField/SelectField implementation
export function SwitchField({
  field,
  value,
  onChange,
  onBlur: _onBlur,
  error,
  disabled,
  className,
}: FieldComponentProps<boolean>) {
  const { theme } = useFormTheme();
  const isChecked = !!value;
  const isDisabled = disabled || field.disabled;
  const isRequired = field.validation?.some(
    (rule) => rule.type === ValidationRuleType.REQUIRED,
  );

  // CSS variables are already injected by FormThemeProvider parent

  // Base switch container styles
  const switchContainerStyles = cn(
    // Relative positioning for thumb overlay
    "relative",
    "inline-flex",
    // Size
    "h-6",
    "w-11",
    // Track styling
    "rounded-full",
    "border-2",
    "transition-colors",
    "duration-200",
    // Colors based on state
    isChecked
      ? "bg-[var(--form-primary)] border-[var(--form-primary)]"
      : "bg-[var(--form-muted-bg)] border-[var(--form-border)]",
    // Disabled state
    isDisabled && "opacity-50 cursor-not-allowed",
    // Focus ring for accessibility
    "focus-within:outline-none",
    "focus-within:ring-2",
    "focus-within:ring-[var(--form-primary)]/20",
    "focus-within:ring-offset-2",
    // Error state
    error && "focus-within:ring-red-500/20",
  );

  // Thumb button styles - this is the clickable element
  const thumbButtonStyles = cn(
    // Position and size
    "absolute",
    "top-[2px]",
    "left-[2px]",
    "h-5",
    "w-5",
    "rounded-full",
    // Colors and transitions
    "bg-[var(--form-bg)]",
    "shadow-md",
    "transition-transform",
    "duration-200",
    "border",
    "border-[var(--form-border)]",
    // Transform based on state
    isChecked ? "translate-x-5" : "translate-x-0",
    // Interactive states
    "hover:shadow-lg",
    "focus:outline-none",
    "focus:ring-2",
    "focus:ring-[var(--form-primary)]/20",
    "focus:ring-offset-1",
    // Disabled state
    isDisabled && "cursor-not-allowed opacity-60",
    // Prevent text selection
    "select-none",
  );

  // Base label styles
  const labelStyles = cn(
    "text-sm",
    "font-medium",
    "text-[var(--form-text)]",
    "select-none",
    // Remove cursor pointer since label shouldn't toggle
    isDisabled ? "opacity-60 cursor-not-allowed" : "cursor-default",
  );

  const handleThumbClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent the switch container from handling the click
    if (!isDisabled && onChange) {
      onChange(!isChecked);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (isDisabled) return;

    // Allow keyboard toggle with Space or Enter
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      if (onChange) {
        onChange(!isChecked);
      }
    }
  };

  return (
    <div className={cn("flex items-center gap-3", className)}>
      {/* Hidden Radix Switch for screen reader accessibility */}
      <SwitchPrimitive.Root
        id={field.id}
        checked={isChecked}
        onCheckedChange={onChange}
        disabled={isDisabled}
        aria-invalid={!!error}
        aria-describedby={error ? `${field.id}-error` : undefined}
        className="sr-only"
      />

      {/* Visual switch - only thumb is clickable */}
      <div
        className={switchContainerStyles}
        onKeyDown={handleKeyDown}
        role="switch"
        aria-checked={isChecked}
        aria-label={field.label}
        tabIndex={isDisabled ? -1 : 0}
      >
        <button
          type="button"
          className={thumbButtonStyles}
          onClick={handleThumbClick}
          disabled={isDisabled}
          aria-hidden="true"
          tabIndex={-1}
        />
      </div>

      {field.label && (
        <Label
          id={`${field.id}-label`}
          htmlFor={field.id}
          className={cn(labelStyles, isDisabled && "!cursor-not-allowed")}
        >
          {field.label}
          {isRequired && <span className="text-red-500 ml-0.5">*</span>}
        </Label>
      )}
    </div>
  );
}

SwitchField.displayName = "SwitchField";
