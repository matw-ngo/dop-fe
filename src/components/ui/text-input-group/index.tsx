import React from "react";
import { useFormTheme } from "@/components/form-generation/themes";
import { cn } from "@/lib/utils";

export interface TextInputGroupProps
  extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    "onChange" | "onBlur"
  > {
  label?: string;
  append?: string;
  error?: string;
  containerClassName?: string;
  onChange?: (value: string) => void;
  onBlur?: (value: string) => void;
}

export const TextInputGroup = React.forwardRef<
  HTMLInputElement,
  TextInputGroupProps
>(
  (
    {
      className,
      type = "text",
      label,
      append,
      error,
      containerClassName,
      onChange,
      onBlur,
      id,
      ...props
    },
    ref,
  ) => {
    const { theme } = useFormTheme();
    const inputId = id || `input-${React.useId()}`;

    const borderColor = theme.colors.border;
    const labelColor = theme.colors.textSecondary || "#4d7e70";
    const placeholderColor = theme.colors.placeholder || "#A3A3A3";
    const errorColor = theme.colors.error || "#ff7474";
    const primaryColor = theme.colors.primary;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (onChange) {
        onChange(e.target.value);
      }
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      if (onBlur) {
        onBlur(e.target.value);
      }
    };

    return (
      <div className={cn(containerClassName)}>
        <div
          className="rounded-lg border flex flex-col justify-between"
          style={{
            height: theme.sizes.md,
            padding: `${theme.spacing.sm} ${theme.spacing.base}`,
            borderRadius: theme.borderRadius.md,
            borderColor: error ? errorColor : borderColor,
            backgroundColor: "white",
          }}
        >
          {label && (
            <label
              htmlFor={inputId}
              className="block"
              style={{
                fontSize: theme.typography.fontSizes.xs,
                fontWeight: theme.typography.fontWeights.normal,
                lineHeight: theme.typography.lineHeights.tight,
                color: labelColor,
                marginBottom: 0,
              }}
            >
              {label}
            </label>
          )}

          <div className="relative flex items-center">
            <input
              type={type}
              id={inputId}
              className={cn(
                "flex-1 border-0 bg-transparent p-0",
                "focus:outline-none focus:ring-0",
                "disabled:cursor-not-allowed disabled:opacity-50",
                "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",
                className,
              )}
              style={
                {
                  height: theme.typography.lineHeights.normal,
                  fontSize: theme.typography.fontSizes.base,
                  fontWeight: theme.typography.fontWeights.normal,
                  lineHeight: theme.typography.lineHeights.normal,
                  color: theme.colors.textPrimary,
                  "--tw-placeholder-color": placeholderColor,
                } as React.CSSProperties
              }
              onChange={handleChange}
              onBlur={handleBlur}
              ref={ref}
              {...props}
            />

            <style jsx>{`
              input::placeholder {
                color: var(--tw-placeholder-color) !important;
                opacity: 1;
              }
            `}</style>

            {append && (
              <div
                className="pointer-events-none ml-2"
                style={{
                  fontSize: theme.typography.fontSizes.xs,
                  fontWeight: theme.typography.fontWeights.normal,
                  lineHeight: theme.typography.lineHeights.tight,
                  color: theme.colors.textSecondary,
                }}
              >
                {append}
              </div>
            )}
          </div>
        </div>

        {error && (
          <p
            className="text-xs mt-1"
            role="alert"
            style={{ color: errorColor }}
          >
            {error}
          </p>
        )}
      </div>
    );
  },
);

TextInputGroup.displayName = "TextInputGroup";
