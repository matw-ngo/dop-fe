import { useQuery } from "@tanstack/react-query";
import { useTranslatedOptions } from "./utils/with-i18n";

/**
 * Having loan keys for translation
 * TODO: Replace with API call when backend endpoint is available
 * Expected endpoint: GET /config/having-loan
 */
const HAVING_LOAN_KEYS = ["yes", "no"] as const;

async function getHavingLoanKeys() {
  return Promise.resolve(HAVING_LOAN_KEYS);
}

/**
 * Hook to get having loan options with i18n support
 * Uses next-intl translations from messages/common/form-options.json
 */
export function useHavingLoanOptions() {
  const query = useQuery<readonly string[], Error>({
    queryKey: ["config", "having-loan-options"],
    queryFn: getHavingLoanKeys,
    staleTime: 30 * 60 * 1000,
    retry: 2,
  });

  const translatedData = useTranslatedOptions(
    query.data,
    "common.formOptions.havingLoan",
  );

  return {
    ...query,
    data: translatedData,
  };
}
