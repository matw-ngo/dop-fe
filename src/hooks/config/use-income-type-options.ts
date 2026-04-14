import { useQuery } from "@tanstack/react-query";
import { useTranslatedOptions } from "./utils/with-i18n";

/**
 * Income type keys for translation
 * TODO: Replace with API call when backend endpoint is available
 * Expected endpoint: GET /config/income-types
 */
const INCOME_TYPE_KEYS = ["transfer", "cash"] as const;

async function getIncomeTypeKeys() {
  return Promise.resolve(INCOME_TYPE_KEYS);
}

/**
 * Hook to get income type options with i18n support
 * Uses next-intl translations from messages/common/form-options.json
 */
export function useIncomeTypeOptions() {
  const query = useQuery<readonly string[], Error>({
    queryKey: ["config", "income-type-options"],
    queryFn: getIncomeTypeKeys,
    staleTime: 30 * 60 * 1000,
    retry: 2,
  });

  const translatedData = useTranslatedOptions(
    query.data,
    "common.formOptions.incomeType",
  );

  return {
    ...query,
    data: translatedData,
  };
}
