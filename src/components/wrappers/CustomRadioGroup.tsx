"use client";

// CustomRadioGroup wrapper component for Data-Driven UI system
// Simplifies the shadcn/ui RadioGroup component API for backend configuration

import React from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

export interface RadioOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface CustomRadioGroupProps {
  /** Array of radio options to display */
  options: RadioOption[];

  /** Current selected value */
  value?: string;

  /** Callback when value changes */
  onValueChange?: (value: string) => void;

  /** Is the radio group disabled */
  disabled?: boolean;

  /** Optional name attribute */
  name?: string;

  /** Optional className */
  className?: string;

  /** Layout direction */
  direction?: "vertical" | "horizontal";
}

export const CustomRadioGroup = React.forwardRef<
  HTMLDivElement,
  CustomRadioGroupProps
>(
  (
    {
      options = [],
      value,
      onValueChange,
      disabled,
      name,
      className,
      direction = "vertical",
    },
    ref,
  ) => {
    const layoutClass =
      direction === "horizontal"
        ? "flex flex-row flex-wrap gap-4"
        : "flex flex-col space-y-2";

    return (
      <RadioGroup
        ref={ref}
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
        name={name}
        className={`${layoutClass} ${className || ""}`}
      >
        {options.map((option) => (
          <div key={option.value} className="flex items-center space-x-2">
            <RadioGroupItem
              value={option.value}
              id={`${name}-${option.value}`}
              disabled={disabled || option.disabled}
            />
            <Label
              htmlFor={`${name}-${option.value}`}
              className={
                disabled || option.disabled
                  ? "cursor-not-allowed opacity-50"
                  : "cursor-pointer"
              }
            >
              {option.label}
            </Label>
          </div>
        ))}
      </RadioGroup>
    );
  },
);

CustomRadioGroup.displayName = "CustomRadioGroup";

export default CustomRadioGroup;
