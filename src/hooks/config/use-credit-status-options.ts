import { useQuery } from "@tanstack/react-query";
import { useTranslatedOptions } from "./utils/with-i18n";

/**
 * Credit status keys - using API values directly
 * API Schema: no_bad_debt | bad_debt | bad_debt_last3_year
 */
const CREDIT_STATUS_KEYS = [
  "no_bad_debt",
  "bad_debt_last3_year",
  "bad_debt",
] as const;

async function getCreditStatusKeys() {
  return Promise.resolve(CREDIT_STATUS_KEYS);
}

/**
 * Hook to get credit status options with i18n support
 * Uses next-intl translations from messages/common/form-options.json
 */
export function useCreditStatusOptions() {
  const query = useQuery<readonly string[], Error>({
    queryKey: ["config", "credit-status-options"],
    queryFn: getCreditStatusKeys,
    staleTime: 30 * 60 * 1000,
    retry: 2,
  });

  const translatedData = useTranslatedOptions(
    query.data,
    "common.formOptions.creditStatus", // Keys: no_bad_debt, bad_debt_last3_year, bad_debt
  );

  return {
    ...query,
    data: translatedData,
  };
}
