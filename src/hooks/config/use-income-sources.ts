import { useQuery } from "@tanstack/react-query";
import { useTranslatedOptions } from "./utils/with-i18n";

/**
 * Income source keys for translation
 * TODO: Replace with API call when backend endpoint is available
 * Expected endpoint: GET /config/income-sources
 */
const INCOME_SOURCE_KEYS = [
  "salary",
  "business",
  "investment",
  "other",
] as const;

async function getIncomeSourceKeys() {
  return Promise.resolve(INCOME_SOURCE_KEYS);
}

/**
 * Hook to get income source options with i18n support
 * Uses next-intl translations from messages/common/form-options.json
 */
export function useIncomeSources() {
  const query = useQuery<readonly string[], Error>({
    queryKey: ["config", "income-sources"],
    queryFn: getIncomeSourceKeys,
    staleTime: 30 * 60 * 1000,
    retry: 2,
  });

  const translatedData = useTranslatedOptions(
    query.data,
    "common.formOptions.incomeSources",
  );

  return {
    ...query,
    data: translatedData,
  };
}
