import { useQuery } from "@tanstack/react-query";
import { useTranslatedOptions } from "./utils/with-i18n";

/**
 * Income range keys for translation
 * TODO: Replace with API call when backend endpoint is available
 * Expected endpoint: GET /config/income-ranges
 */
const INCOME_RANGE_KEYS = ["<5m", "5-10m", "10-20m", ">20m"] as const;

async function getIncomeRangeKeys() {
  return Promise.resolve(INCOME_RANGE_KEYS);
}

/**
 * Hook to get income range options with i18n support
 * Uses next-intl translations from messages/common/form-options.json
 */
export function useIncomeRanges() {
  const query = useQuery<readonly string[], Error>({
    queryKey: ["config", "income-ranges"],
    queryFn: getIncomeRangeKeys,
    staleTime: 30 * 60 * 1000,
    retry: 2,
  });

  const translatedData = useTranslatedOptions(
    query.data,
    "common.formOptions.incomeRanges",
  );

  return {
    ...query,
    data: translatedData,
  };
}
