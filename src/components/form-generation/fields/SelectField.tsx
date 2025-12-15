"use client";

import type { FieldComponentProps, SelectFieldConfig } from "../types";
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
import { cn } from "../utils/helpers";

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

  // Build className from theme + user overrides
  const triggerClassName = cn(
    // Base styles from theme
    theme.control.base,
    theme.control.variants.default,
    theme.control.sizes.md,

    // State styles
    theme.control.states.focus,
    error && theme.control.states.error,
    isDisabled && theme.control.states.disabled,

    // User override (highest priority)
    className,
  );

  // Group choices if they have a `group` property
  const hasGroups = choices.some((choice) => choice.group);

  if (hasGroups) {
    // Group choices by their group property
    const groupedChoices = choices.reduce<Record<string, typeof choices>>(
      (acc, choice) => {
        const groupName = choice.group || "Other";
        if (!acc[groupName]) {
          acc[groupName] = [];
        }
        acc[groupName].push(choice);
        return acc;
      },
      {},
    );

    return (
      <Select
        value={value || ""}
        onValueChange={onChange}
        disabled={isDisabled}
      >
        <SelectTrigger
          id={field.id}
          className={triggerClassName}
          aria-invalid={!!error}
          aria-describedby={error ? `${field.id}-error` : undefined}
          onBlur={onBlur}
        >
          <SelectValue placeholder={field.placeholder || "Select..."} />
        </SelectTrigger>
        <SelectContent>
          {Object.entries(groupedChoices).map(
            ([groupName, groupChoices], idx) => (
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
            ),
          )}
        </SelectContent>
      </Select>
    );
  }

  // Simple select without groups
  return (
    <Select value={value || ""} onValueChange={onChange} disabled={isDisabled}>
      <SelectTrigger
        id={field.id}
        className={triggerClassName}
        aria-invalid={!!error}
        aria-describedby={error ? `${field.id}-error` : undefined}
        onBlur={onBlur}
      >
        <SelectValue placeholder={field.placeholder || "Select..."} />
      </SelectTrigger>
      <SelectContent>
        {choices.map((choice) => (
          <SelectItem
            key={choice.value}
            value={choice.value}
            disabled={choice.disabled}
          >
            {choice.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

SelectField.displayName = "SelectField";
