"use client";

// CustomSelect wrapper component for Data-Driven UI system
// Simplifies the shadcn/ui Select component API for backend configuration

import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface CustomSelectProps {
  /** Array of options to display */
  options: SelectOption[];

  /** Placeholder text when no value selected */
  placeholder?: string;

  /** Current selected value */
  value?: string;

  /** Callback when value changes */
  onValueChange?: (value: string) => void;

  /** Is the select disabled */
  disabled?: boolean;

  /** Optional name attribute */
  name?: string;

  /** Optional className */
  className?: string;
}

export const CustomSelect = React.forwardRef<
  HTMLButtonElement,
  CustomSelectProps
>(
  (
    {
      options = [],
      placeholder,
      value,
      onValueChange,
      disabled,
      name,
      className,
    },
    ref,
  ) => {
    return (
      <Select
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
        name={name}
      >
        <SelectTrigger ref={ref} className={className}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem
              key={option.value}
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  },
);

CustomSelect.displayName = "CustomSelect";

export default CustomSelect;
