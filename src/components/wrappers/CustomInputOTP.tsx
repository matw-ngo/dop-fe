"use client";

// CustomInputOTP wrapper component for Data-Driven UI system
// Provides a form-friendly OTP input with configurable length

import React from "react";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  InputOTPSeparator,
} from "@/components/ui/input-otp";

interface CustomInputOTPProps {
  /** Current OTP value */
  value?: string;

  /** Callback when OTP changes */
  onChange?: (value: string) => void;

  /** Number of OTP digits (default: 6) */
  maxLength?: number;

  /** Is the input disabled */
  disabled?: boolean;

  /** Optional name attribute */
  name?: string;

  /** Optional className */
  className?: string;

  /** Pattern to validate OTP characters (default: digits only) */
  pattern?: string;

  /** Group size for visual separation (e.g., 3 for "123-456") */
  groupSize?: number;
}

export const CustomInputOTP = React.forwardRef<
  HTMLInputElement,
  CustomInputOTPProps
>(
  (
    {
      value = "",
      onChange,
      maxLength = 6,
      disabled,
      name,
      className,
      pattern = "^[0-9]+$",
      groupSize,
    },
    ref,
  ) => {
    const handleChange = (newValue: string) => {
      onChange?.(newValue);
    };

    // Calculate groups if groupSize is provided
    const renderSlots = () => {
      const slots: React.ReactNode[] = [];

      if (groupSize && groupSize > 0) {
        const numGroups = Math.ceil(maxLength / groupSize);

        for (let groupIdx = 0; groupIdx < numGroups; groupIdx++) {
          const groupSlots: React.ReactNode[] = [];
          const startIdx = groupIdx * groupSize;
          const endIdx = Math.min(startIdx + groupSize, maxLength);

          for (let slotIdx = startIdx; slotIdx < endIdx; slotIdx++) {
            groupSlots.push(<InputOTPSlot key={slotIdx} index={slotIdx} />);
          }

          slots.push(
            <InputOTPGroup key={`group-${groupIdx}`}>
              {groupSlots}
            </InputOTPGroup>,
          );

          // Add separator between groups (but not after last group)
          if (groupIdx < numGroups - 1) {
            slots.push(<InputOTPSeparator key={`separator-${groupIdx}`} />);
          }
        }
      } else {
        // No grouping - render all slots in one group
        const allSlots: React.ReactNode[] = [];
        for (let i = 0; i < maxLength; i++) {
          allSlots.push(<InputOTPSlot key={i} index={i} />);
        }
        slots.push(
          <InputOTPGroup key="single-group">{allSlots}</InputOTPGroup>,
        );
      }

      return slots;
    };

    return (
      <>
        <InputOTP
          ref={ref as any}
          maxLength={maxLength}
          value={value}
          onChange={handleChange}
          disabled={disabled}
          pattern={pattern}
          className={className}
        >
          {renderSlots()}
        </InputOTP>
        {name && <input type="hidden" name={name} value={value} />}
      </>
    );
  },
);

CustomInputOTP.displayName = "CustomInputOTP";

export default CustomInputOTP;
