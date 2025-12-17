import * as LabelPrimitive from "@radix-ui/react-label";
import React from "react";
import { cn } from "@/lib/utils";

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
      theme = "light",
      containerClassName,
      labelClassName,
      id,
      ...props
    },
    ref,
  ) => {
    const inputId = id || `input-${React.useId()}`;

    return (
      <div className={cn("space-y-2", containerClassName)}>
        {label && (
          <LabelPrimitive.Root
            htmlFor={inputId}
            className={cn(
              "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
              theme === "light" ? "text-[#4d7e70]" : "text-gray-300",
              labelClassName,
            )}
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
              "flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm ring-offset-background",
              "file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              "disabled:cursor-not-allowed disabled:opacity-50",

              // Custom theme styles matching ApplyLoanForm
              "bg-white border-[#bfd1cc] text-[#3F4350]",
              "focus:outline-none focus:ring-2 focus:ring-[#017848] focus:border-[#017848]",
              "transition-colors",

              // Error state
              error && "border-red-500 focus:border-red-500 focus:ring-red-500",

              // Left icon padding
              leftIcon && "pl-10",

              // Right icon padding
              rightIcon && "pr-10",

              // Height override for ApplyLoanForm compatibility
              "[&]:h-[60px]",

              className,
            )}
            ref={ref}
            {...props}
          />

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
              theme === "light" ? "text-gray-500" : "text-gray-400",
            )}
          >
            {description}
          </p>
        )}

        {error && errorMessage && (
          <p className="text-xs text-red-500" role="alert">
            {errorMessage}
          </p>
        )}
      </div>
    );
  },
);

TextInput.displayName = "TextInput";

export { TextInput };
