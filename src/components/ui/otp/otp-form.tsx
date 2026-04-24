import React, { useEffect, useRef } from "react";
import { useFormTheme } from "@/components/form-generation/themes";
import { useOtpFormTranslations } from "@/hooks/otp/use-form-translations";
import { useLocalizedOtpTypes } from "@/hooks/phone/use-localized-telcos";
import { cn } from "@/lib/utils";
import { Button } from "../button";

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface OtpFormProps {
  // Configuration
  size: number;
  otpType: 1 | 2; // 1 = call, 2 = SMS
  phoneNumber: string;
  telcoName: string;

  // State
  otpStatus:
    | "waiting"
    | "success"
    | "failed"
    | "submitting"
    | "expired"
    | "force_refresh";
  timeRemaining: number; // in seconds
  otpCount: number;
  otpAttempts: number;
  maxRefresh: number;
  maxAttempts: number;
  isSubmitting: boolean;

  // Callbacks
  onSubmit: (otp: string) => void;
  onResend: () => void;
  onInput?: (otp: string) => void;
  onExpired?: () => void;

  // Optional styling
  className?: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

export const OtpForm: React.FC<OtpFormProps> = ({
  size,
  otpType,
  phoneNumber,
  telcoName,
  otpStatus,
  timeRemaining,
  otpCount,
  otpAttempts,
  maxRefresh,
  maxAttempts,
  isSubmitting,
  onSubmit,
  onResend,
  onInput,
  onExpired,
  className = "",
}) => {
  // ============================================================================
  // HOOKS
  // ============================================================================

  const t = useOtpFormTranslations();
  const _otpTypes = useLocalizedOtpTypes();
  const { theme } = useFormTheme();

  const primaryColor = theme.colors.primary;
  const textPrimary = theme.colors.textPrimary || "#073126";
  const _textSecondary = theme.colors.textSecondary || "#4d7e70";
  const borderColor = theme.colors.border || "#bfd1cc";
  const errorColor = theme.colors.error || "#ff7474";

  // ============================================================================
  // REFS
  // ============================================================================

  const otpInputRefs = useRef<React.RefObject<HTMLInputElement | null>[]>(
    Array.from({ length: size }, () => React.createRef()),
  );

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const isShowOtpInput = [
    "waiting",
    "failed",
    "submitting",
    "success",
  ].includes(otpStatus);

  const isEndOfAction = ["force_refresh", "expired", "success"].includes(
    otpStatus,
  );

  const canResend = timeRemaining <= 0 || timeRemaining <= 295; // 300 - 5

  const showResendLink = canResend && otpCount < maxRefresh && !isEndOfAction;

  // ============================================================================
  // HELPER FUNCTIONS
  // ============================================================================

  const getFullOtp = (): string => {
    return otpInputRefs.current.map((ref) => ref.current?.value || "").join("");
  };

  const isOtpComplete = (): boolean => {
    return getFullOtp().length === size;
  };

  const resetOtpInput = (): void => {
    otpInputRefs.current.forEach((ref) => {
      if (ref.current) ref.current.value = "";
    });
    otpInputRefs.current[0].current?.focus();
  };

  const focusInput = (index: number): void => {
    if (index >= 0 && index < size) {
      otpInputRefs.current[index].current?.focus();
    }
  };

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  const handleSubmit = (): void => {
    const otp = getFullOtp();
    if (otp.length === size) {
      onSubmit(otp);
    }
  };

  const handleResend = (): void => {
    onResend();
    resetOtpInput();
  };

  const handleInput = (
    index: number,
    e: React.ChangeEvent<HTMLInputElement>,
  ): void => {
    const value = e.target.value;

    // Handle paste or multi-character input
    if (value.length > 1) {
      let remaining = value;
      let currentIndex = index;

      while (remaining.length > 0 && currentIndex < size) {
        const ref = otpInputRefs.current[currentIndex].current;
        if (ref) {
          ref.value = remaining[0];
          remaining = remaining.slice(1);
        }
        currentIndex++;
      }

      if (currentIndex < size) {
        focusInput(currentIndex);
      } else {
        focusInput(size - 1);
      }
    } else if (value.length === 1) {
      // Move to next input
      if (index < size - 1) {
        focusInput(index + 1);
      }
    }

    // Trigger onInput callback
    const currentOtp = getFullOtp();
    onInput?.(currentOtp);
  };

  const handleKeyUp = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ): void => {
    const currentRef = otpInputRefs.current[index].current;

    if (e.key === "Backspace" && index > 0 && !currentRef?.value) {
      focusInput(index - 1);
    } else if (e.key === "ArrowLeft" && index > 0) {
      focusInput(index - 1);
    } else if (e.key === "ArrowRight" && index < size - 1) {
      focusInput(index + 1);
    } else if (e.key === "Enter") {
      handleSubmit();
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ): void => {
    // Clear current input when typing new character
    if (e.key.length === 1 && /[0-9]/.test(e.key)) {
      const ref = otpInputRefs.current[index].current;
      if (ref) ref.value = "";
    }
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>): void => {
    // Move cursor to end
    e.currentTarget.setSelectionRange(
      e.currentTarget.value.length,
      e.currentTarget.value.length,
    );
  };

  // ============================================================================
  // EFFECTS
  // ============================================================================

  // Auto-focus first input on mount
  useEffect(() => {
    otpInputRefs.current[0].current?.focus();
  }, []);

  // Reset inputs when status changes to failed or expired
  useEffect(() => {
    if (isShowOtpInput && (otpStatus === "failed" || otpStatus === "expired")) {
      resetOtpInput();
    }
  }, [otpStatus, isShowOtpInput, resetOtpInput]);

  // Handle expiration
  useEffect(() => {
    if (timeRemaining === 0 && otpStatus === "waiting") {
      onExpired?.();
    }
  }, [timeRemaining, otpStatus, onExpired]);

  // ============================================================================
  // FORMATTING HELPERS
  // ============================================================================

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const secs = (seconds % 60).toString().padStart(2, "0");
    return `${mins}:${secs}s`;
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className={cn("text-center p-[13px]", className)}>
      {/* Title */}
      <h2
        className="text-center text-2xl font-bold leading-8 mb-3"
        style={{ color: textPrimary }}
      >
        {t.title}
      </h2>

      {/* Caption for Call OTP */}
      {isShowOtpInput && otpType === 1 && (
        <div
          className="text-center max-w-[430px] mx-auto mb-4"
          style={{ color: textPrimary }}
        >
          {t.getCallOtpText(phoneNumber)}
        </div>
      )}

      {/* Caption for SMS OTP with consent */}
      {isShowOtpInput && otpType === 2 && (
        <div
          className="text-center max-w-full mx-auto mb-4"
          style={{ color: textPrimary }}
        >
          {t.getSMSCaption(telcoName)}{" "}
          <a
            className="font-semibold underline"
            style={{ color: primaryColor }}
            href="/dieu-khoan-su-dung"
            target="_blank"
            rel="noopener noreferrer"
          >
            {t.termsLinkText}
          </a>
        </div>
      )}

      {/* OTP Input Form */}
      {isShowOtpInput && (
        <div className="mt-4">
          {/* OTP Input Boxes */}
          <div className="inline-flex justify-center items-center gap-2 sm:gap-4 w-full">
            {Array.from({ length: size }).map((_, index) => (
              <input
                key={index}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={1}
                className={cn(
                  "text-center outline-none font-bold text-2xl sm:text-[32px] rounded-lg w-[40px] h-[50px] sm:w-[60px] sm:h-[60px] border transition-colors",
                  "focus:ring-2",
                  isSubmitting && "opacity-50 cursor-not-allowed bg-gray-50",
                )}
                style={
                  {
                    color: textPrimary,
                    borderColor: borderColor,
                    "--tw-ring-color": primaryColor,
                  } as React.CSSProperties
                }
                onChange={(e) => handleInput(index, e)}
                onKeyUp={(e) => handleKeyUp(index, e)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onFocus={handleFocus}
                ref={otpInputRefs.current[index]}
                disabled={isSubmitting}
                aria-label={t.getInputPlaceholder(index)}
              />
            ))}
          </div>

          {/* Error Message with aria-live for screen readers */}
          {otpStatus === "failed" && (
            <div
              className="mt-2 text-center text-sm font-medium"
              style={{ color: errorColor }}
              role="alert"
              aria-live="assertive"
            >
              {t.errorMessage}
            </div>
          )}

          {/* Success Message with aria-live */}
          {otpStatus === "success" && (
            <div
              className="mt-4 text-center text-green-700 text-sm font-semibold"
              role="status"
              aria-live="polite"
            >
              {t.successMessage}
            </div>
          )}

          {/* Resend Link & Timer */}
          {!isEndOfAction && (
            <div className="mt-4 space-y-2">
              {/* Resend OTP Link */}
              {showResendLink && (
                <p
                  className="text-center text-sm font-normal leading-5"
                  style={{ color: textPrimary }}
                >
                  {t.resendText}{" "}
                  {isSubmitting ? (
                    <span
                      className="inline-block h-4 w-4 animate-spin"
                      style={{
                        borderLeftColor: primaryColor,
                        borderStyle: "solid",
                        borderWidth: "2px",
                        borderRadius: "50%",
                      }}
                    ></span>
                  ) : (
                    <button
                      type="button"
                      className="font-semibold underline cursor-pointer"
                      style={{ color: primaryColor }}
                      onClick={handleResend}
                    >
                      {t.resendButton}
                    </button>
                  )}
                </p>
              )}

              {/* Countdown Timer with aria-live for screen readers */}
              {timeRemaining > 0 && (
                <div
                  className="text-sm flex gap-1 items-center justify-center"
                  style={{ color: textPrimary }}
                  aria-live="polite"
                  aria-atomic="true"
                >
                  <span>{t.timeRemaining}</span>
                  <strong
                    className="font-semibold"
                    style={{ color: primaryColor }}
                  >
                    {formatTime(timeRemaining)}
                  </strong>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* OTP Expired State with aria-live */}
      {otpStatus === "expired" && (
        <div className="mt-4" role="alert" aria-live="assertive">
          <p className="text-sm mb-3" style={{ color: errorColor }}>
            {t.expiredMessage}
          </p>
          {isSubmitting ? (
            <span
              className="inline-block h-4 w-4 animate-spin"
              style={{
                borderLeftColor: primaryColor,
                borderStyle: "solid",
                borderWidth: "2px",
                borderRadius: "50%",
              }}
            ></span>
          ) : (
            <button
              type="button"
              className="font-semibold cursor-pointer"
              style={{ color: primaryColor }}
              onClick={handleResend}
            >
              {t.resendButton}
            </button>
          )}
        </div>
      )}

      {/* Force Refresh OTP State with aria-live */}
      {otpStatus === "force_refresh" && (
        <div className="mt-4" role="alert" aria-live="assertive">
          <p className="text-sm mb-3" style={{ color: errorColor }}>
            {t.forceRefreshMessage}
          </p>
          <button
            type="button"
            className="font-semibold cursor-pointer"
            style={{ color: primaryColor }}
            onClick={handleResend}
          >
            {t.resendButton}
          </button>
        </div>
      )}

      {/* Submit Button */}
      {!isEndOfAction && (
        <div className="mt-5">
          <Button
            type="button"
            loading={isSubmitting}
            disabled={
              !isOtpComplete() || isSubmitting || otpStatus === "force_refresh"
            }
            className="rounded-lg w-full h-12 text-white font-semibold text-base transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: primaryColor }}
            onClick={handleSubmit}
          >
            {t.submitButtonText}
          </Button>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// EXAMPLE USAGE WITH CONTAINER COMPONENT
// ============================================================================

export const OtpFormContainer: React.FC = () => {
  const [otpStatus, setOtpStatus] = React.useState<
    | "waiting"
    | "success"
    | "failed"
    | "submitting"
    | "expired"
    | "force_refresh"
  >("waiting");
  const [timeRemaining, setTimeRemaining] = React.useState(300);
  const [otpCount, setOtpCount] = React.useState(0);
  const [otpAttempts, setOtpAttempts] = React.useState(0);

  // Countdown timer
  React.useEffect(() => {
    if (timeRemaining > 0 && otpStatus === "waiting") {
      const timer = setTimeout(() => {
        setTimeRemaining(timeRemaining - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [timeRemaining, otpStatus]);

  const handleSubmit = async (otp: string) => {
    setOtpStatus("submitting");

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Simulate validation
    if (otp === "123456") {
      setOtpStatus("success");
    } else {
      setOtpStatus("failed");
      setOtpAttempts((prev) => prev + 1);
    }
  };

  const handleResend = () => {
    setOtpCount((prev) => prev + 1);
    setTimeRemaining(300);
    setOtpStatus("waiting");
  };

  const handleExpired = () => {
    setOtpStatus("expired");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
        <OtpForm
          size={6}
          otpType={1}
          phoneNumber="0901234567"
          telcoName="Viettel"
          otpStatus={otpStatus}
          timeRemaining={timeRemaining}
          otpCount={otpCount}
          otpAttempts={otpAttempts}
          maxRefresh={3}
          maxAttempts={5}
          isSubmitting={otpStatus === "submitting"}
          onSubmit={handleSubmit}
          onResend={handleResend}
          onInput={(_otp) => {}}
          onExpired={handleExpired}
        />
      </div>
    </div>
  );
};
