import { useQuery } from "@tanstack/react-query";
import { useTranslatedOptions } from "./utils/with-i18n";

/**
 * Career status keys for translation
 * TODO: Replace with API call when backend endpoint is available
 * Expected endpoint: GET /config/career-status
 */
const CAREER_STATUS_KEYS = [
  "officer",
  "freelancer",
  "worker",
  "other",
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
    "common.formOptions.careerStatus",
  );

  return {
    ...query,
    data: translatedData,
  };
}
