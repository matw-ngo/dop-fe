import { useQuery } from "@tanstack/react-query";
import { useTranslatedOptions } from "./utils/with-i18n";

/**
 * Employment type keys for translation
 * TODO: Replace with API call when backend endpoint is available
 * Expected endpoint: GET /config/employment-types
 */
const EMPLOYMENT_TYPE_KEYS = [
  "full_time",
  "part_time",
  "contract",
  "freelance",
] as const;

async function getEmploymentTypeKeys() {
  return Promise.resolve(EMPLOYMENT_TYPE_KEYS);
}

/**
 * Hook to get employment type options with i18n support
 * Uses next-intl translations from messages/common/form-options.json
 */
export function useEmploymentTypes() {
  const query = useQuery<readonly string[], Error>({
    queryKey: ["config", "employment-types"],
    queryFn: getEmploymentTypeKeys,
    staleTime: 30 * 60 * 1000,
    retry: 2,
  });

  const translatedData = useTranslatedOptions(
    query.data,
    "common.formOptions.employmentTypes",
  );

  return {
    ...query,
    data: translatedData,
  };
}
