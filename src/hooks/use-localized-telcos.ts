import { useTranslations } from "next-intl";

/**
 * Hook to get localized telco names
 */
export const useLocalizedTelcos = () => {
  const t = useTranslations("components.otp.telcos");

  const telcos = {
    vietel: t("viettel"),
    mobifone: t("mobifone"),
    vinaphone: t("vinaphone"),
    // Keep uppercase versions for backward compatibility
    Viettel: t("viettel"),
    Mobifone: t("mobifone"),
    Vinaphone: t("vinaphone"),
  };

  /**
   * Get localized telco name by code
   */
  const getTelcoName = (code: string): string => {
    return telcos[code.toLowerCase() as keyof typeof telcos] || code;
  };

  return {
    ...telcos,
    getTelcoName,
  };
};

/**
 * Hook to get localized company names
 */
export const useLocalizedCompanies = () => {
  const t = useTranslations("components.otp.companies");

  return {
    finzone: t("finzone"),
    dataNest: t("dataNest"),
  };
};

/**
 * Hook to get localized OTP type names
 */
export const useLocalizedOtpTypes = () => {
  const t = useTranslations("components.otp.otpTypes");

  return {
    call: t("call"),
    sms: t("sms"),
  };
};
