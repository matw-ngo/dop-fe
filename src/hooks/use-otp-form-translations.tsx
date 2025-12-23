import React from "react";
import { useTranslations } from "next-intl";
import {
  useLocalizedCompanies,
  useLocalizedOtpTypes,
} from "./use-localized-telcos";

/**
 * Hook to get all localized OTP form translations
 */
export const useOtpFormTranslations = () => {
  const t = useTranslations("components.otp.form");
  const { finzone, dataNest } = useLocalizedCompanies();
  const otpTypes = useLocalizedOtpTypes();

  return {
    // Title
    title: t("title"),

    // OTP type messages
    getCallOtpText: (phoneNumber: string) =>
      t.rich("callOtpText", {
        otpType: otpTypes.call,
        companyName: finzone,
        phoneNumber,
        strong: (chunks: React.ReactNode) => (
          <strong className="font-bold">{chunks}</strong>
        ),
      }),

    getSMSCaption: (telcoName: string) => (
      <>
        {t.rich("smsOtpConsent", {
          companyName: finzone,
          telcoName,
          dataProcessor: dataNest,
          strong: (chunks: React.ReactNode) => (
            <strong className="font-bold">{chunks}</strong>
          ),
        })}{" "}
        {t("smsOtpPurpose")}
      </>
    ),

    // Input
    getInputPlaceholder: (index: number) =>
      t("inputPlaceholder", { index: index + 1 }),

    // Messages
    errorMessage: t("errorMessage"),
    successMessage: t("successMessage"),

    // Resend
    resendText: t("resendText"),
    resendButton: t("resendButton"),
    timeRemaining: t("timeRemaining"),

    // Error states
    expiredMessage: t("expiredMessage"),
    forceRefreshMessage: t("forceRefreshMessage"),

    // Submit
    submitButtonText: t("submitButtonText"),

    // Links
    termsLinkText: t("termsLinkText"),
  };
};
