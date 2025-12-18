"use client";

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
import type { FieldComponentProps, SelectFieldConfig } from "../types";
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

  const renderSelectContent = () => (
    <SelectContent className={options.contentClassName}>
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
              <SelectLabel>{groupName}</SelectLabel>
              {groupChoices.map((choice) => (
                <SelectItem
                  key={choice.value}
                  value={choice.value}
                  disabled={choice.disabled}
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
            </span>
          )}
          <SelectValue
            placeholder={field.placeholder || "Select..."}
            className={cn(
              "text-sm",
              // Placeholder styling - simpler approach
              "data-[placeholder]:text-gray-400",
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
