"use client";

import type { FieldComponentProps, TextAreaFieldConfig } from "../types";
import { Textarea } from "@/components/ui/textarea";

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
  const textAreaField = field as TextAreaFieldConfig;
  const options = textAreaField.options || {};

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
  };

  const currentLength = value?.length || 0;
  const maxLength = options.maxLength;
  const showCount = options.showCount && maxLength;

  return (
    <div className="relative w-full">
      <Textarea
        id={field.id}
        name={field.name}
        value={value || ""}
        onChange={handleChange}
        onBlur={onBlur}
        placeholder={field.placeholder}
        disabled={disabled || field.disabled}
        readOnly={readOnly || field.readOnly}
        rows={options.rows}
        maxLength={maxLength}
        aria-invalid={!!error}
        aria-describedby={error ? `${field.id}-error` : undefined}
        className={className}
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
