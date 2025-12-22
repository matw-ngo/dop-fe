import { useTranslations } from "next-intl";
import type React from "react";
import { useEffect, useState } from "react";
import { useLocalizedTelcos } from "@/hooks/use-localized-telcos";
import { getLocalizableTelcoByPhoneNumber } from "@/lib/telcos/localizable-telcos";
import { useSubmitOTP } from "@/hooks/use-submit-otp";
import { useResendOTP } from "@/hooks/use-resend-otp";
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
    console.log("Submitting OTP:", otp);
    setOtpStatus("submitting");

    // If leadId and token are provided, use V1 API
    if (leadId && token) {
      submitOTP(
        { leadId, token, otp },
        {
          onSuccess: () => {
            setOtpStatus("success");
            onSuccess?.(otp);
            console.log("OTP verified successfully");
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
      // Fallback to mock logic for testing
      try {
        await new Promise((resolve) => setTimeout(resolve, 1500));

        if (
          otp === (process.env.NODE_ENV === "development" ? "0000" : "1234")
        ) {
          setOtpStatus("success");
          onSuccess?.(otp);
          console.log("OTP verified successfully");
        } else {
          setOtpStatus("failed");
          const newAttempts = otpAttempts + 1;
          setOtpAttempts(newAttempts);

          if (newAttempts >= maxAttempts) {
            setOtpStatus("force_refresh");
            onFailure?.(t("forceRefreshMessage"));
          } else {
            const attemptsLeft = maxAttempts - newAttempts;
            onFailure?.(t("errorMessage") + ` Còn ${attemptsLeft} lần thử.`);
          }
        }
      } catch (error) {
        setOtpStatus("failed");
        onFailure?.(t("errorMessage") + ". " + t("genericError"));
      }
    }
  };

  const handleResend = () => {
    console.log("Resending OTP to:", phoneNumber);

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
            console.log("OTP resent successfully");
          },
          onError: (error) => {
            onFailure?.(error.message || "Failed to resend OTP");
          },
        },
      );
    } else {
      // Fallback to mock logic
      setOtpCount((prev) => prev + 1);
      setTimeRemaining(300);
      setOtpStatus("waiting");
      setOtpAttempts(0);
      console.log(
        `Resending ${otpType === 1 ? "call" : "SMS"} OTP to ${phoneNumber}`,
      );
    }
  };

  const handleExpired = () => {
    setOtpStatus("expired");
    onExpired?.();
  };

  const handleInput = (otp: string) => {
    console.log("Current OTP:", otp);
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
