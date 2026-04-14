import { useTranslations } from "next-intl";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import type { ISelectBoxOption } from "@/components/ui/select-group";

/**
 * Base loan purpose values (keys for translation)
 */
const LOAN_PURPOSE_KEYS = [
  "consumer_loan",
  "motor_loan",
  "travel_loan",
  "student_loan",
  "improvement_loan",
  "healthcare_loan",
  "cd_loan",
  "other_loan",
] as const;

async function getLoanPurposeKeys() {
  return Promise.resolve(LOAN_PURPOSE_KEYS);
}

/**
 * Hook to get loan purpose options with i18n support
 * Uses next-intl translations from messages/common/loan-purposes.json
 */
export function useLoanPurposes() {
  const t = useTranslations("common.loanPurposes");

  const query = useQuery<readonly string[], Error>({
    queryKey: ["config", "loan-purposes"],
    queryFn: getLoanPurposeKeys,
    staleTime: 30 * 60 * 1000,
    retry: 2,
  });

  const translatedData = useMemo<ISelectBoxOption[] | undefined>(() => {
    if (!query.data) return undefined;

    return query.data.map((key) => ({
      label: t(key as any),
      value: key,
    }));
  }, [query.data, t]);

  return {
    ...query,
    data: translatedData,
  };
}
