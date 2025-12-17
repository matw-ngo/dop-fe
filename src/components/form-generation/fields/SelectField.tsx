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

  // Internal label support
  const internalLabel = theme.fieldOptions?.internalLabel;

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

    // Internal label defaults (can be overridden by className)
    internalLabel && "min-h-[60px] py-3", // structural default for internal label

    // Placeholder color override - applied through theme
    // The theme already handles placeholder styling with higher specificity

    // User override (highest priority)
    className,
  );

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
        className={cn(triggerClassName, "relative")}
        aria-invalid={!!error}
        aria-describedby={error ? `${field.id}-error` : undefined}
        onBlur={onBlur}
      >
        <div className="flex flex-col items-start justify-center flex-1 w-full text-left">
          {internalLabel && field.label && (
            <span className="text-xs font-medium text-[#017848] mb-0.5">
              {field.label}
            </span>
          )}
          <SelectValue
            placeholder={field.placeholder || "Select..."}
            className="data-[placeholder]:text-gray-400 data-[placeholder]:font-medium"
          />
        </div>
      </SelectTrigger>
      {renderSelectContent()}
    </Select>
  );
}

SelectField.displayName = "SelectField";
