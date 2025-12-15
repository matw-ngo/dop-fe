"use client";

import { Textarea } from "@/components/ui/textarea";
import { useFormTheme } from "../themes/ThemeProvider";
import type { FieldComponentProps, TextAreaFieldConfig } from "../types";
import { cn } from "../utils/helpers";

export function TextAreaField({
  field,
  value,
  onChange,
  onBlur,
  error,
  disabled,
  readOnly,
  className,
}: FieldComponentProps<string>) {
  const { theme } = useFormTheme();
  const textAreaField = field as TextAreaFieldConfig;
  const options = textAreaField.options || {};
  const isDisabled = disabled || field.disabled;
  const isReadOnly = readOnly || field.readOnly;

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
  };

  const currentLength = value?.length || 0;
  const maxLength = options.maxLength;
  const showCount = options.showCount && maxLength;

  // Build className from theme + user overrides
  const textareaClassName = cn(
    // Base styles from theme
    theme.control.base,
    theme.control.variants.default,
    theme.control.sizes.md,

    // State styles
    theme.control.states.focus,
    error && theme.control.states.error,
    isDisabled && theme.control.states.disabled,
    isReadOnly && theme.control.states.readOnly,

    // User override (highest priority)
    className,
  );

  return (
    <div className="relative w-full">
      <Textarea
        id={field.id}
        name={field.name}
        value={value || ""}
        onChange={handleChange}
        onBlur={onBlur}
        placeholder={field.placeholder}
        disabled={isDisabled}
        readOnly={isReadOnly}
        rows={options.rows}
        maxLength={maxLength}
        aria-invalid={!!error}
        aria-describedby={error ? `${field.id}-error` : undefined}
        className={textareaClassName}
      />
      {showCount && (
        <div className="absolute bottom-2 right-2 text-xs text-muted-foreground">
          {currentLength}/{maxLength}
        </div>
      )}
    </div>
  );
}

TextAreaField.displayName = "TextAreaField";
