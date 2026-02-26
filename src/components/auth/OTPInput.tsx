/**
 * OTP Input Component
 * Handles 4-digit and 6-digit OTP input with auto-focus, paste support, and validation
 */

"use client";

import {
  AlertCircle,
  Clock,
  Eye,
  EyeOff,
  RefreshCw,
  Shield,
} from "lucide-react";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export interface OTPInputProps {
  length?: 4 | 6;
  value?: string;
  onChange?: (value: string, isComplete: boolean) => void;
  onComplete?: (value: string) => void;
  onPaste?: (value: string) => void;
  disabled?: boolean;
  error?: string;
  label?: string;
  placeholder?: string;
  autoFocus?: boolean;
  showTimer?: boolean;
  timerDuration?: number; // seconds
  timerRemaining?: number; // seconds
  onTimerExpire?: () => void;
  showSecureToggle?: boolean;
  secureMode?: boolean;
  allowAutoSubmit?: boolean;
  className?: string;
  inputClassName?: string;
  containerClassName?: string;
  description?: string;
  helpText?: string;
  maxLength?: number; // Additional validation
  pattern?: RegExp; // Custom validation pattern
}

export const OTPInput = React.forwardRef<HTMLDivElement, OTPInputProps>(
  (
    {
      length = 6,
      value = "",
      onChange,
      onComplete,
      onPaste,
      disabled = false,
      error,
      label = "Mã OTP",
      placeholder = "•",
      autoFocus = true,
      showTimer = false,
      timerDuration = 300,
      timerRemaining = timerDuration,
      onTimerExpire,
      showSecureToggle = true,
      secureMode = false,
      allowAutoSubmit = true,
      className,
      inputClassName,
      containerClassName,
      description,
      helpText,
      maxLength,
      pattern,
      ...props
    },
    ref,
  ) => {
    const [otpValues, setOtpValues] = useState<string[]>(
      Array(length).fill(""),
    );
    const [isSecure, setIsSecure] = useState(secureMode);
    const [isFocused, setIsFocused] = useState(false);
    const [showError, setShowError] = useState(false);
    const [pastedValue, setPastedValue] = useState("");
    const [timerProgress, setTimerProgress] = useState(100);

    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
    const containerRef = useRef<HTMLDivElement>(null);

    // Initialize OTP values from prop
    useEffect(() => {
      if (value && value !== otpValues.join("")) {
        const newValue = value.split("").slice(0, length);
        while (newValue.length < length) {
          newValue.push("");
        }
        setOtpValues(newValue);
      }
    }, [value, length, otpValues.join]);

    // Handle timer progress
    useEffect(() => {
      if (showTimer && timerRemaining > 0 && timerDuration > 0) {
        const progress = (timerRemaining / timerDuration) * 100;
        setTimerProgress(progress);
      } else {
        setTimerProgress(0);
      }
    }, [timerRemaining, timerDuration, showTimer]);

    // Auto-focus first input
    useEffect(() => {
      if (autoFocus && inputRefs.current[0] && !disabled) {
        inputRefs.current[0].focus();
      }
    }, [autoFocus, disabled]);

    // Handle input change
    const handleInputChange = useCallback(
      (index: number, inputValue: string) => {
        // Only allow digits
        const digit = inputValue.replace(/\D/g, "").slice(-1);

        const newOtpValues = [...otpValues];
        newOtpValues[index] = digit;
        setOtpValues(newOtpValues);

        const newOtpString = newOtpValues.join("");
        onChange?.(newOtpString, newOtpString.length === length);

        // Auto-focus next input
        if (digit && index < length - 1) {
          inputRefs.current[index + 1]?.focus();
        }

        // Auto-submit if complete
        if (
          digit &&
          newOtpString.length === length &&
          allowAutoSubmit &&
          onComplete
        ) {
          setTimeout(() => onComplete(newOtpString), 100);
        }

        // Clear error when user starts typing
        if (error) {
          setShowError(false);
        }
      },
      [otpValues, length, onChange, onComplete, allowAutoSubmit, error],
    );

    // Handle paste
    const handlePaste = useCallback(async () => {
      try {
        const clipboardText = await navigator.clipboard.readText();
        const digits = clipboardText.replace(/\D/g, "").slice(0, length);

        if (digits.length > 0) {
          setPastedValue(digits);
          onPaste?.(digits);

          // Distribute digits across inputs
          const newOtpValues = Array(length).fill("");
          for (let i = 0; i < Math.min(digits.length, length); i++) {
            newOtpValues[i] = digits[i];
          }
          setOtpValues(newOtpValues);

          const newOtpString = newOtpValues.join("");
          onChange?.(newOtpString, newOtpString.length === length);

          // Focus appropriate input
          const nextIndex = Math.min(digits.length, length - 1);
          inputRefs.current[nextIndex]?.focus();

          // Auto-submit if complete
          if (newOtpString.length === length && allowAutoSubmit && onComplete) {
            setTimeout(() => onComplete(newOtpString), 100);
          }
        }
      } catch (err) {
        console.warn("Failed to read clipboard:", err);
      }
    }, [length, onPaste, onChange, allowAutoSubmit, onComplete]);

    // Handle key press
    const handleKeyDown = useCallback(
      (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        // Handle backspace
        if (e.key === "Backspace") {
          if (otpValues[index] === "" && index > 0) {
            // Move to previous input if current is empty
            inputRefs.current[index - 1]?.focus();
          } else {
            // Clear current input
            const newOtpValues = [...otpValues];
            newOtpValues[index] = "";
            setOtpValues(newOtpValues);
            onChange?.(newOtpValues.join(""), false);
          }
        }

        // Handle arrow keys
        if (e.key === "ArrowLeft" && index > 0) {
          e.preventDefault();
          inputRefs.current[index - 1]?.focus();
        }
        if (e.key === "ArrowRight" && index < length - 1) {
          e.preventDefault();
          inputRefs.current[index + 1]?.focus();
        }

        // Handle paste
        if ((e.ctrlKey || e.metaKey) && e.key === "v") {
          e.preventDefault();
          handlePaste();
        }

        // Handle Enter
        if (
          e.key === "Enter" &&
          otpValues.join("").length === length &&
          onComplete
        ) {
          onComplete(otpValues.join(""));
        }
      },
      [otpValues, length, onChange, onComplete, handlePaste],
    );

    // Handle focus
    const handleFocus = useCallback(() => {
      setIsFocused(true);
    }, []);

    // Handle blur
    const handleBlur = useCallback(
      (_index: number) => {
        // Check if any input is still focused
        const anyFocused = inputRefs.current.some(
          (ref) => ref === document.activeElement,
        );
        if (!anyFocused) {
          setIsFocused(false);
        }

        // Validate on blur if complete
        const otpString = otpValues.join("");
        if (otpString.length === length) {
          if (maxLength && otpString.length > maxLength) {
            setShowError(true);
          } else if (pattern && !pattern.test(otpString)) {
            setShowError(true);
          }
        }
      },
      [otpValues, length, maxLength, pattern],
    );

    // Handle container click (focus first empty input)
    const handleContainerClick = useCallback(() => {
      const firstEmptyIndex = otpValues.indexOf("");
      const targetIndex = firstEmptyIndex === -1 ? length - 1 : firstEmptyIndex;
      inputRefs.current[targetIndex]?.focus();
    }, [otpValues, length]);

    // Clear all inputs
    const clearAll = useCallback(() => {
      setOtpValues(Array(length).fill(""));
      onChange?.("", false);
      inputRefs.current[0]?.focus();
      setShowError(false);
    }, [length, onChange]);

    // Toggle secure mode
    const toggleSecureMode = useCallback(() => {
      setIsSecure(!isSecure);
    }, [isSecure]);

    // Get display value
    const getDisplayValue = (value: string) => {
      if (isSecure && value) {
        return "•";
      }
      return value;
    };

    // Validate current OTP
    const isComplete = otpValues.every((val) => val !== "");
    const isValid = isComplete && !showError && !error;
    const hasError = error || showError;

    return (
      <div ref={containerRef} className={cn("space-y-4", className)} {...props}>
        {/* Label and Actions */}
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium flex items-center gap-2">
            <Shield className="h-4 w-4" />
            {label}
          </Label>

          <div className="flex items-center gap-2">
            {/* Clear button */}
            {isComplete && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={clearAll}
                      disabled={disabled}
                    >
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">Xóa tất cả</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}

            {/* Secure mode toggle */}
            {showSecureToggle && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={toggleSecureMode}
                      disabled={disabled}
                    >
                      {isSecure ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">{isSecure ? "Hiện mã" : "Ẩn mã"}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        </div>

        {/* OTP Input Fields */}
        <div
          ref={ref}
          className={cn(
            "flex items-center gap-2 justify-center",
            "w-full max-w-sm mx-auto",
            containerClassName,
          )}
          onClick={handleContainerClick}
        >
          {otpValues.map((value, index) => (
            <div key={index} className="relative">
              <Input
                ref={(el: HTMLInputElement | null) => {
                  inputRefs.current[index] = el;
                }}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={1}
                value={getDisplayValue(value)}
                onChange={(e) => handleInputChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onFocus={handleFocus}
                onBlur={() => handleBlur(index)}
                onPaste={(e) => {
                  e.preventDefault();
                  handlePaste();
                }}
                placeholder={placeholder}
                disabled={disabled}
                autoComplete={index === 0 ? "one-time-code" : "off"}
                className={cn(
                  "w-12 h-12 text-center text-lg font-semibold",
                  "transition-all duration-200",
                  "focus:ring-2 focus:ring-primary focus:ring-offset-2",
                  isFocused && value && "border-primary",
                  hasError && "border-destructive focus:ring-destructive",
                  isValid && !disabled && "border-green-500",
                  disabled && "opacity-50 cursor-not-allowed",
                  inputClassName,
                )}
              />

              {/* Focus indicator */}
              {isFocused &&
                document.activeElement === inputRefs.current[index] && (
                  <div className="absolute inset-0 rounded-md ring-2 ring-primary ring-offset-2 pointer-events-none" />
                )}

              {/* Success indicator */}
              {isValid && value && (
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full" />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Timer Progress */}
        {showTimer && timerDuration > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>Thời gian còn lại</span>
              </div>
              <span className="font-mono">
                {Math.floor(timerRemaining / 60)}:
                {(timerRemaining % 60).toString().padStart(2, "0")}
              </span>
            </div>
            <div className="relative">
              <Progress value={timerProgress} className="h-2" />
              <div
                className={cn(
                  "absolute top-0 left-0 h-full transition-all",
                  timerProgress < 20 && "bg-destructive",
                  timerProgress < 50 && timerProgress >= 20 && "bg-yellow-500",
                  timerProgress >= 50 && "bg-primary",
                )}
                style={{ width: `${timerProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Description */}
        {description && (
          <p className="text-sm text-muted-foreground text-center">
            {description}
          </p>
        )}

        {/* Help Text */}
        {helpText && (
          <div className="text-xs text-muted-foreground space-y-1">
            <p>• Nhập {length} chữ số mã OTP</p>
            <p>• Mã OTP được gửi đến số điện thoại của bạn</p>
            <p>• Mã có hiệu lực trong {Math.floor(timerDuration / 60)} phút</p>
          </div>
        )}

        {/* Error Message */}
        {(error || showError) && (
          <Alert variant="destructive" className="text-sm">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error || "Mã OTP không hợp lệ. Vui lòng kiểm tra lại."}
            </AlertDescription>
          </Alert>
        )}

        {/* Success Message */}
        {isValid && !disabled && (
          <div className="text-sm text-green-600 text-center flex items-center justify-center gap-2">
            <Shield className="h-4 w-4" />
            <span>Mã OTP hợp lệ</span>
          </div>
        )}

        {/* Paste Notification */}
        {pastedValue && (
          <div className="text-xs text-muted-foreground text-center">
            Đã dán {pastedValue.length} chữ số
          </div>
        )}
      </div>
    );
  },
);

OTPInput.displayName = "OTPInput";

export default OTPInput;
