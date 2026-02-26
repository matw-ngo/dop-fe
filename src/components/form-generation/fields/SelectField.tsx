"use client";

import type { CSSProperties } from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useFormTheme } from "../themes/ThemeProvider";
import {
  type FieldComponentProps,
  type SelectFieldConfig,
  ValidationRuleType,
} from "../types";
import { cn } from "../utils/helpers";

/**
 * SelectField component that handles most styling directly
 * Uses theme only for truly customizable properties
 */
export function SelectField({
  field,
  value,
  onChange,
  onBlur,
  error,
  disabled,
  className,
}: FieldComponentProps<string>) {
  const { theme } = useFormTheme();
  const selectField = field as SelectFieldConfig;
  const options = selectField.options || {};
  const choices = options.choices || [];
  const isDisabled = disabled || field.disabled;
  const internalLabel = theme.fieldOptions?.internalLabel;
  const isRequired = field.validation?.some(
    (rule) => rule.type === ValidationRuleType.REQUIRED,
  );
  const textPrimary = theme.colors.textPrimary || "#3F4350";
  const textSecondary = theme.colors.textSecondary || "#4d7e70";
  const placeholderColor = theme.colors.placeholder || "#A3A3A3";

  // Base trigger styles that are consistent across themes
  const baseTriggerStyles = [
    "w-full",
    "border",
    "transition-all",
    "duration-200",
    "text-sm",
    // Override shadcn SelectTrigger focus styles with !important
    "!focus-visible:ring-0",
    "!focus-visible:ring-offset-0",
    "!focus-visible:border-transparent",
    // Focus styles with customizable ring
    "focus-visible:outline-none",
    "focus-visible:ring-2",
    theme.focusRing
      ? `focus-visible:ring-[${theme.focusRing.color}]/${theme.focusRing.opacity}`
      : `focus-visible:ring-[${theme.colors.primary}]/20`,
    `focus-visible:border-[${theme.colors.borderFocus}]`,
    // Disabled state
    "disabled:cursor-not-allowed",
    "disabled:opacity-60",
    // Error state
    error && `border-[${theme.colors.error}]`,
    error && `focus:ring-[${theme.colors.error}]/20`,
  ];

  // Theme-specific styles
  const themeStyles = [
    // Border and background
    `bg-[${theme.colors.background}]`,
    `border-[${theme.colors.border}]`,
    "rounded-[8px]",
    // Size - adjust for internal label
    internalLabel ? "min-h-[60px] py-3" : "h-[60px]",
    "px-4",
  ];

  // Group choices if they have a `group` property
  const hasGroups = choices.some((choice) => choice.group);
  const selectContentStyles = {
    backgroundColor: theme.colors.background,
    color: textPrimary,
    borderColor: theme.colors.border,
    "--color-popover": theme.colors.background,
    "--color-popover-foreground": textPrimary,
    "--color-accent": theme.colors.readOnly,
    "--color-accent-foreground": textPrimary,
    "--color-primary": theme.colors.primary,
    "--color-ring": theme.colors.borderFocus || theme.colors.primary,
    "--select-item-hover": theme.colors.readOnly,
    "--select-item-text": textPrimary,
    "--select-item-muted": textSecondary,
    "--select-item-placeholder": placeholderColor,
  } as CSSProperties;

  const renderSelectContent = () => (
    <SelectContent
      className={cn("shadow-md", options.contentClassName)}
      style={selectContentStyles}
    >
      {hasGroups
        ? Object.entries(
            choices.reduce<Record<string, typeof choices>>((acc, choice) => {
              const groupName = choice.group || "Other";
              if (!acc[groupName]) {
                acc[groupName] = [];
              }
              acc[groupName].push(choice);
              return acc;
            }, {}),
          ).map(([groupName, groupChoices], idx) => (
            <SelectGroup key={groupName}>
              {idx > 0 && <SelectSeparator />}
              <SelectLabel className="text-[var(--select-item-muted)]">
                {groupName}
              </SelectLabel>
              {groupChoices.map((choice) => (
                <SelectItem
                  key={choice.value}
                  value={choice.value}
                  disabled={choice.disabled}
                  className="text-[var(--select-item-text)] data-[highlighted]:bg-[var(--select-item-hover)] data-[highlighted]:text-[var(--select-item-text)] focus:bg-[var(--select-item-hover)] focus:text-[var(--select-item-text)]"
                >
                  {choice.label}
                </SelectItem>
              ))}
            </SelectGroup>
          ))
        : choices.map((choice) => (
            <SelectItem
              key={choice.value}
              value={choice.value}
              disabled={choice.disabled}
              className="text-[var(--select-item-text)] data-[highlighted]:bg-[var(--select-item-hover)] data-[highlighted]:text-[var(--select-item-text)] focus:bg-[var(--select-item-hover)] focus:text-[var(--select-item-text)]"
            >
              {choice.label}
            </SelectItem>
          ))}
    </SelectContent>
  );

  return (
    <Select value={value || ""} onValueChange={onChange} disabled={isDisabled}>
      <SelectTrigger
        id={field.id}
        icon={options.icon}
        className={cn(
          ...baseTriggerStyles,
          ...themeStyles,
          "relative",
          "flex",
          "items-center",
          className,
        )}
        aria-invalid={!!error}
        aria-describedby={error ? `${field.id}-error` : undefined}
        onBlur={onBlur}
        style={
          {
            "--form-text": textPrimary,
            "--select-item-placeholder": placeholderColor,
          } as CSSProperties
        }
      >
        <div className="flex flex-col items-start justify-center flex-1 w-full text-left">
          {internalLabel && field.label && (
            <span
              className={cn(
                "text-xs font-medium mb-0.5",
                `text-[${theme.colors.primary}]`,
              )}
            >
              {field.label}
              {isRequired && <span className="text-red-500 ml-0.5">*</span>}
            </span>
          )}
          <SelectValue
            placeholder={field.placeholder || "Select..."}
            className={cn(
              "text-sm",
              // Placeholder styling - simpler approach
              "data-[placeholder]:text-[var(--select-item-placeholder)]",
              "data-[placeholder]:font-medium",
            )}
          />
        </div>
      </SelectTrigger>
      {renderSelectContent()}
    </Select>
  );
}

SelectField.displayName = "SelectField";
