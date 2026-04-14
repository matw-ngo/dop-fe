import { useQuery } from "@tanstack/react-query";
import { useTranslatedOptions } from "./utils/with-i18n";

/**
 * Having loan keys - using API values directly
 * API Schema: no_loan | one_loan | two_loans | three_loans | more_than_three_loans
 */
const HAVING_LOAN_KEYS = [
  "no_loan",
  "one_loan",
  "two_loans",
  "three_loans",
  "more_than_three_loans",
] as const;

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
    "common.formOptions.havingLoan", // Keys: no_loan, one_loan, two_loans, three_loans, more_than_three_loans
  );

  return {
    ...query,
    data: translatedData,
  };
}
