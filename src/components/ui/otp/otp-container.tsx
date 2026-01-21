import { useTranslations } from "next-intl";
import type React from "react";
import { useEffect, useState } from "react";
import { useResendOTP } from "@/hooks/otp/use-resend";
import { useSubmitOTP } from "@/hooks/otp/use-submit";
import { useLocalizedTelcos } from "@/hooks/phone/use-localized-telcos";
import { getLocalizableTelcoByPhoneNumber } from "@/lib/telcos/localizable-telcos";
import { OtpForm } from "./otp-form";

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface OtpContainerProps {
  // Configuration
  phoneNumber: string;
  leadId?: string; // Lead ID for API calls
  token?: string; // Auth token for OTP submission
  size?: number;
  otpType?: 1 | 2; // 1 = call, 2 = SMS
  maxRefresh?: number;
  maxAttempts?: number;

  // Events
  onSuccess?: (otp: string) => void;
  onFailure?: (error: string) => void;
  onExpired?: () => void;

  // Optional styling
  className?: string;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

// ============================================================================
// COMPONENT
// ============================================================================

export const OtpContainer: React.FC<OtpContainerProps> = ({
  phoneNumber,
  leadId,
  token,
  size = 4,
  otpType = 2, // Default to SMS
  maxRefresh = 3,
  maxAttempts = 5,
  onSuccess,
  onFailure,
  onExpired,
  className = "",
}) => {
  // ============================================================================
  // HOOKS
  // ============================================================================

  const t = useTranslations("components.otp.form");
  const { getTelcoName } = useLocalizedTelcos();

  // API hooks
  const { mutate: submitOTP, isPending: isSubmittingOTP } = useSubmitOTP();
  const { mutate: resendOTP, isPending: isResendingOTP } = useResendOTP();

  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================

  const [otpStatus, setOtpStatus] = useState<
    | "waiting"
    | "success"
    | "failed"
    | "submitting"
    | "expired"
    | "force_refresh"
  >("waiting");
  const [timeRemaining, setTimeRemaining] = useState(300); // 5 minutes
  const [otpCount, setOtpCount] = useState(0);
  const [otpAttempts, setOtpAttempts] = useState(0);

  // Get telco name from phone number using localizable telcos
  const getInitialTelcoName = () => {
    const telco = getLocalizableTelcoByPhoneNumber(phoneNumber);
    return telco ? getTelcoName(telco.code) : "Viettel";
  };

  const [telcoName, setTelcoName] = useState(getInitialTelcoName);

  // ============================================================================
  // EFFECTS
  // ============================================================================

  // Countdown timer
  useEffect(() => {
    if (timeRemaining > 0 && otpStatus === "waiting") {
      const timer = setTimeout(() => {
        setTimeRemaining(timeRemaining - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [timeRemaining, otpStatus]);

  // Update telco when phone number changes
  useEffect(() => {
    const telco = getLocalizableTelcoByPhoneNumber(phoneNumber);
    const newTelcoName = telco ? getTelcoName(telco.code) : "Viettel";
    setTelcoName(newTelcoName);
  }, [phoneNumber, getTelcoName]);

  // ============================================================================
  // OTP HANDLERS
  // ============================================================================

  const handleSubmit = async (otp: string) => {
    setOtpStatus("submitting");

    // If leadId and token are provided, use V1 API
    if (leadId && token) {
      submitOTP(
        { leadId, token, otp },
        {
          onSuccess: () => {
            setOtpStatus("success");
            onSuccess?.(otp);
          },
          onError: (error) => {
            setOtpStatus("failed");
            const newAttempts = otpAttempts + 1;
            setOtpAttempts(newAttempts);

            if (newAttempts >= maxAttempts) {
              setOtpStatus("force_refresh");
              onFailure?.(t("forceRefreshMessage"));
            } else {
              const attemptsLeft = maxAttempts - newAttempts;
              onFailure?.(
                error.message ||
                  t("errorMessage") + ` Còn ${attemptsLeft} lần thử.`,
              );
            }
          },
        },
      );
    } else {
      // No leadId/token provided - cannot submit OTP without API
      setOtpStatus("failed");
      onFailure?.(t("errorMessage") + ". Vui lòng thử lại.");
    }
  };

  const handleResend = () => {
    // If leadId is provided, use V1 API
    if (leadId) {
      resendOTP(
        { leadId, target: phoneNumber },
        {
          onSuccess: () => {
            setOtpCount((prev) => prev + 1);
            setTimeRemaining(300);
            setOtpStatus("waiting");
            setOtpAttempts(0);
          },
          onError: (error) => {
            onFailure?.(error.message || "Failed to resend OTP");
          },
        },
      );
    } else {
      // No leadId provided - cannot resend OTP without API
      onFailure?.("Không thể gửi lại mã OTP. Vui lòng thử lại.");
    }
  };

  const handleExpired = () => {
    setOtpStatus("expired");
    onExpired?.();
  };

  const handleInput = (otp: string) => {
    // Auto-submit when OTP is complete and status is waiting
    if (otp.length === size && otpStatus === "waiting") {
      handleSubmit(otp);
    }
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <OtpForm
      size={size}
      otpType={otpType}
      phoneNumber={phoneNumber}
      telcoName={telcoName}
      otpStatus={otpStatus}
      timeRemaining={timeRemaining}
      otpCount={otpCount}
      otpAttempts={otpAttempts}
      maxRefresh={maxRefresh}
      maxAttempts={maxAttempts}
      isSubmitting={otpStatus === "submitting"}
      onSubmit={handleSubmit}
      onResend={handleResend}
      onInput={handleInput}
      onExpired={handleExpired}
      className={className}
    />
  );
};
