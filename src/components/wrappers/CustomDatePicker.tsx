"use client";

// CustomDatePicker wrapper component for Data-Driven UI system
// Wraps Calendar component with Popover for a complete date picker

import React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface CustomDatePickerProps {
  /** Current selected date */
  value?: Date;

  /** Callback when date changes */
  onChange?: (date: Date | undefined) => void;

  /** Placeholder text */
  placeholder?: string;

  /** Is the picker disabled */
  disabled?: boolean;

  /** Optional name attribute */
  name?: string;

  /** Optional className */
  className?: string;

  /** Date format (default: 'PPP' - e.g., 'April 29, 2023') */
  dateFormat?: string;
}

export const CustomDatePicker = React.forwardRef<
  HTMLButtonElement,
  CustomDatePickerProps
>(
  (
    {
      value,
      onChange,
      placeholder = "Pick a date",
      disabled,
      name,
      className,
      dateFormat = "PPP",
    },
    ref,
  ) => {
    const [open, setOpen] = React.useState(false);

    // Normalize value to Date object (handle string from localStorage)
    const dateValue = React.useMemo(() => {
      if (!value) return undefined;
      if (value instanceof Date) return value;
      // Try to parse string as date
      try {
        const parsed = new Date(value as any);
        return isNaN(parsed.getTime()) ? undefined : parsed;
      } catch {
        return undefined;
      }
    }, [value]);

    const handleSelect = (date: Date | undefined) => {
      onChange?.(date);
      setOpen(false);
    };

    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            ref={ref}
            variant="outline"
            disabled={disabled}
            className={cn(
              "w-full justify-start text-left font-normal",
              !value && "text-muted-foreground",
              className,
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {dateValue ? (
              format(dateValue, dateFormat)
            ) : (
              <span>{placeholder}</span>
            )}
            {/* Hidden input for form submission */}
            {name && (
              <input
                type="hidden"
                name={name}
                value={dateValue instanceof Date ? dateValue.toISOString() : ""}
              />
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={dateValue}
            onSelect={handleSelect}
            initialFocus
          />
        </PopoverContent>
      </Popover>
    );
  },
);

CustomDatePicker.displayName = "CustomDatePicker";

export default CustomDatePicker;
