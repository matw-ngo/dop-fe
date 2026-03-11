import { useQuery } from "@tanstack/react-query";
import { useTranslatedOptions } from "./utils/with-i18n";

const GENDER_KEYS = ["male", "female", "other"] as const;

async function getGenderKeys() {
  return Promise.resolve(GENDER_KEYS);
}

export function useGenderOptions() {
  const query = useQuery<readonly string[], Error>({
    queryKey: ["config", "gender-options"],
    queryFn: getGenderKeys,
    staleTime: 30 * 60 * 1000,
    retry: 2,
  });

  const translatedData = useTranslatedOptions(
    query.data,
    "common.formOptions.gender",
  );

  return {
    ...query,
    data: translatedData,
  };
}
