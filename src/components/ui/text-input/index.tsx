import * as LabelPrimitive from "@radix-ui/react-label";
import React from "react";
import { cn } from "@/lib/utils";
import { useFormTheme } from "@/components/form-generation/themes";

export interface TextInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  description?: string;
  error?: boolean;
  errorMessage?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  theme?: "light" | "dark";
  containerClassName?: string;
  labelClassName?: string;
}

const TextInput = React.forwardRef<HTMLInputElement, TextInputProps>(
  (
    {
      className,
      type = "text",
      label,
      description,
      error,
      errorMessage,
      leftIcon,
      rightIcon,
      theme: contextTheme = "light",
      containerClassName,
      labelClassName,
      id,
      ...props
    },
    ref,
  ) => {
    const { theme } = useFormTheme();
    const inputId = id || `input-${React.useId()}`;

    const primaryColor = theme.colors.primary;
    const borderColor = theme.colors.border;
    const labelColor = theme.colors.textSecondary || "#4d7e70";
    const placeholderColor = theme.colors.placeholder || "#A3A3A3";
    const errorColor = theme.colors.error || "#ff7474";

    return (
      <div className={cn("space-y-2", containerClassName)}>
        {label && (
          <LabelPrimitive.Root
            htmlFor={inputId}
            className={cn(
              "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
              labelClassName,
            )}
            style={{ color: labelColor }}
          >
            {label}
          </LabelPrimitive.Root>
        )}

        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              {leftIcon}
            </div>
          )}

          <input
            type={type}
            id={inputId}
            className={cn(
              // Base styles
              "flex w-full rounded-md border bg-white px-3 py-2 text-sm transition-colors",
              "file:border-0 file:bg-transparent file:text-sm file:font-medium",
              "disabled:cursor-not-allowed disabled:opacity-50",

              // Focus state (only if no error)
              !error && "focus:outline-none focus:ring-2",

              // Error state
              error && "focus:outline-none focus:ring-2",

              // Left icon padding
              leftIcon && "pl-10",

              // Right icon padding
              rightIcon && "pr-10",

              className,
            )}
            style={
              {
                borderColor: error ? errorColor : borderColor,
                height: theme.sizes.md || "60px",
                color: theme.colors.textPrimary || "#3F4350",
                "--tw-ring-color": error ? errorColor : primaryColor,
                "--tw-placeholder-color": placeholderColor,
              } as React.CSSProperties
            }
            placeholder={props.placeholder}
            ref={ref}
            {...props}
          />

          <style jsx>{`
            input::placeholder {
              color: var(--tw-placeholder-color) !important;
              opacity: 1;
            }
          `}</style>

          {rightIcon && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              {rightIcon}
            </div>
          )}
        </div>

        {description && (
          <p
            className={cn(
              "text-xs",
              contextTheme === "light" ? "text-gray-500" : "text-gray-400",
            )}
          >
            {description}
          </p>
        )}

        {error && errorMessage && (
          <p
            className="text-xs mt-1"
            role="alert"
            style={{ color: errorColor }}
          >
            {errorMessage}
          </p>
        )}
      </div>
    );
  },
);

TextInput.displayName = "TextInput";

export { TextInput };
