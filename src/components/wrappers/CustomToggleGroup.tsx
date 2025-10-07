"use client";

// CustomToggleGroup wrapper component for Data-Driven UI system
// Provides a form-friendly ToggleGroup with single/multiple selection

import React from "react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import type { VariantProps } from "class-variance-authority";
import { toggleVariants } from "@/components/ui/toggle";

interface Option {
  value: string;
  label: string;
  disabled?: boolean;
  icon?: React.ReactNode;
}

interface CustomToggleGroupProps extends VariantProps<typeof toggleVariants> {
  /** Current selected value(s) */
  value?: string | string[];

  /** Callback when selection changes */
  onChange?: (value: string | string[]) => void;

  /** Options to display */
  options: Option[];

  /** Selection type - single or multiple */
  type?: "single" | "multiple";

  /** Is the toggle group disabled */
  disabled?: boolean;

  /** Optional name attribute */
  name?: string;

  /** Optional className */
  className?: string;
}

export const CustomToggleGroup = React.forwardRef<
  HTMLDivElement,
  CustomToggleGroupProps
>(
  (
    {
      value,
      onChange,
      options,
      type = "single",
      disabled,
      name,
      className,
      variant = "default",
      size = "default",
    },
    ref,
  ) => {
    const handleValueChange = (newValue: string | string[]) => {
      if (type === "single" && typeof newValue === "string") {
        onChange?.(newValue);
      } else if (type === "multiple" && Array.isArray(newValue)) {
        onChange?.(newValue);
      }
    };

    return (
      <ToggleGroup
        ref={ref}
        type={type as any}
        value={value as any}
        onValueChange={handleValueChange}
        disabled={disabled}
        variant={variant}
        size={size}
        className={className}
      >
        {options.map((option) => (
          <ToggleGroupItem
            key={option.value}
            value={option.value}
            disabled={option.disabled}
            aria-label={option.label}
          >
            {option.icon && <span className="mr-2">{option.icon}</span>}
            {option.label}
          </ToggleGroupItem>
        ))}
        {name && (
          <input
            type="hidden"
            name={name}
            value={Array.isArray(value) ? value.join(",") : value || ""}
          />
        )}
      </ToggleGroup>
    );
  },
);

CustomToggleGroup.displayName = "CustomToggleGroup";

export default CustomToggleGroup;
