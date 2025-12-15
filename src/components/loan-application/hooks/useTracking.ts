import { useCallback } from "react";
import { trackLoanApplication } from "@/lib/tracking/events";
import type {
  LoanApplicationFormData,
  LoanApplicationTrackingEvents,
} from "../types";

export function useTracking(): LoanApplicationTrackingEvents {
  // Track expected amount change
  const inputExpectedAmount = useCallback((amount: number) => {
    trackLoanApplication.inputExpectedAmount(amount);
  }, []);

  // Track period change
  const inputPeriod = useCallback((period: number) => {
    trackLoanApplication.inputPeriod?.(period);
  }, []);

  // Track purpose change
  const inputPurpose = useCallback((purpose: string) => {
    trackLoanApplication.inputPurpose?.(purpose);
  }, []);

  // Track phone number input
  const inputPhoneNumber = useCallback((phone: string) => {
    trackLoanApplication.inputPhoneNumber?.(phone);
  }, []);

  // Track successful phone validation
  const phoneNumberValid = useCallback((phone: string, telco: string) => {
    trackLoanApplication.phoneNumberValid?.(phone, telco);
  }, []);

  // Track form submission
  const submitApplication = useCallback((data: LoanApplicationFormData) => {
    trackLoanApplication.submitApplication?.(data);
  }, []);

  // Track OTP verification success
  const otpVerified = useCallback(() => {
    trackLoanApplication.otpVerified?.();
  }, []);

  // Track OTP verification failure
  const otpFailed = useCallback((error: string) => {
    trackLoanApplication.otpFailed?.(error);
  }, []);

  return {
    inputExpectedAmount,
    inputPeriod,
    inputPurpose,
    inputPhoneNumber,
    phoneNumberValid,
    submitApplication,
    otpVerified,
    otpFailed,
  };
}
