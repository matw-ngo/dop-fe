import { useQuery } from "@tanstack/react-query";
import { useTranslatedOptions } from "./utils/with-i18n";

/**
 * Career status keys - using API values directly
 * API Schema: employed | self_employed | unemployed | housewife | retired
 */
const CAREER_STATUS_KEYS = [
  "employed",
  "self_employed",
  "unemployed",
  "housewife",
  "retired",
] as const;

async function getCareerStatusKeys() {
  return Promise.resolve(CAREER_STATUS_KEYS);
}

/**
 * Hook to get career status options with i18n support
 * Uses next-intl translations from messages/common/form-options.json
 */
export function useCareerStatusOptions() {
  const query = useQuery<readonly string[], Error>({
    queryKey: ["config", "career-status-options"],
    queryFn: getCareerStatusKeys,
    staleTime: 30 * 60 * 1000,
    retry: 2,
  });

  const translatedData = useTranslatedOptions(
    query.data,
    "common.formOptions.careerStatus", // Keys: employed, self_employed, unemployed, housewife, retired
  );

  return {
    ...query,
    data: translatedData,
  };
}
