import { useTranslations } from "next-intl";
import type { PhoneValidationResult } from "@/lib/utils/phone-validation";
import { useLocalizedTelcos } from "./use-localized-telcos";

/**
 * Hook to get localized phone validation messages
 * Translates error messages based on the validation result
 */
export const usePhoneValidationMessages = () => {
  const t = useTranslations("phoneValidation");
  const { getTelcoName } = useLocalizedTelcos();

  const translateValidationResult = (
    result: PhoneValidationResult,
  ): PhoneValidationResult => {
    if (!result.valid && result.errorMessage) {
      // Map error codes to translations
      if (result.errorMessage === "INVALID_PHONE") {
        return {
          ...result,
          errorMessage: t("invalid"),
        };
      }
      if (result.errorMessage === "UNSUPPORTED_TELCO") {
        const localizedTelcoName = getTelcoName(result.telcoCode);
        return {
          ...result,
          errorMessage: t("telcoNotSupported", { telco: localizedTelcoName }),
        };
      }
    }

    return result;
  };

  const getLocalizedErrorMessage = (telcoCode: string): string => {
    const localizedTelcoName = getTelcoName(telcoCode);
    return t("telcoNotSupported", { telco: localizedTelcoName });
  };

  const getInvalidPhoneMessage = (): string => {
    return t("invalid");
  };

  const getTelcoList = (): string => {
    const allowedTelcos = ["Viettel", "Mobifone", "Vinaphone"] as const;
    return allowedTelcos.map((name) => getTelcoName(name)).join(", ");
  };

  return {
    translateValidationResult,
    getLocalizedErrorMessage,
    getInvalidPhoneMessage,
    getTelcoList,
  };
};
