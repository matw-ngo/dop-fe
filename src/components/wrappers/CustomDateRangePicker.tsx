"use client";

// CustomDateRangePicker wrapper component for Data-Driven UI system
// Wraps Calendar component with Popover for date range selection

import React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import type { DateRange } from "react-day-picker";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface CustomDateRangePickerProps {
  /** Current selected date range */
  value?: DateRange;

  /** Callback when date range changes */
  onChange?: (range: DateRange | undefined) => void;

  /** Placeholder text */
  placeholder?: string;

  /** Is the picker disabled */
  disabled?: boolean;

  /** Optional name attribute */
  name?: string;

  /** Optional className */
  className?: string;

  /** Date format (default: 'LLL dd, y' - e.g., 'Apr 29, 2023') */
  dateFormat?: string;

  /** Number of months to display */
  numberOfMonths?: number;
}

export const CustomDateRangePicker = React.forwardRef<
  HTMLButtonElement,
  CustomDateRangePickerProps
>(
  (
    {
      value,
      onChange,
      placeholder = "Pick a date range",
      disabled,
      name,
      className,
      dateFormat = "LLL dd, y",
      numberOfMonths = 2,
    },
    ref,
  ) => {
    const [open, setOpen] = React.useState(false);

    // Normalize value to DateRange with Date objects (handle strings from localStorage)
    const dateRangeValue = React.useMemo((): DateRange | undefined => {
      if (!value) return undefined;

      const normalizeDate = (
        date: Date | string | undefined,
      ): Date | undefined => {
        if (!date) return undefined;
        if (date instanceof Date) return date;
        try {
          const parsed = new Date(date as string);
          return isNaN(parsed.getTime()) ? undefined : parsed;
        } catch {
          return undefined;
        }
      };

      return {
        from: normalizeDate(value.from),
        to: normalizeDate(value.to),
      };
    }, [value]);

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
            {dateRangeValue?.from ? (
              dateRangeValue.to ? (
                <>
                  {format(dateRangeValue.from, dateFormat)} -{" "}
                  {format(dateRangeValue.to, dateFormat)}
                </>
              ) : (
                format(dateRangeValue.from, dateFormat)
              )
            ) : (
              <span>{placeholder}</span>
            )}
            {/* Hidden inputs for form submission */}
            {name && dateRangeValue?.from && (
              <input
                type="hidden"
                name={`${name}_from`}
                value={dateRangeValue.from.toISOString()}
              />
            )}
            {name && dateRangeValue?.to && (
              <input
                type="hidden"
                name={`${name}_to`}
                value={dateRangeValue.to.toISOString()}
              />
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="range"
            selected={dateRangeValue}
            onSelect={onChange}
            numberOfMonths={numberOfMonths}
            initialFocus
            defaultMonth={dateRangeValue?.from}
          />
        </PopoverContent>
      </Popover>
    );
  },
);

CustomDateRangePicker.displayName = "CustomDateRangePicker";

export default CustomDateRangePicker;
