import { useProvinces } from "@/hooks/locations";
import {
  useCareerStatusOptions,
  useCreditStatusOptions,
  useGenderOptions,
  useHavingLoanOptions,
  useIncomeRanges,
  useIncomeTypeOptions,
  useLoanPurposes,
} from "@/hooks/config";
import type { ISelectBoxOption } from "@/components/ui/select-group";

/**
 * Hook to provide all dynamic form options for loan application form
 * Combines API data with config options (some from API, some hard-coded)
 */
export function useFormOptions() {
  const { data: provinces, isLoading: isLoadingProvinces } = useProvinces();
  const { data: loanPurposes, isLoading: isLoadingLoanPurposes } =
    useLoanPurposes();
  const { data: genderOptions, isLoading: isLoadingGender } =
    useGenderOptions();
  const { data: incomeOptions, isLoading: isLoadingIncome } = useIncomeRanges();
  const { data: careerStatusOptions, isLoading: isLoadingCareerStatus } =
    useCareerStatusOptions();
  const { data: incomeTypeOptions, isLoading: isLoadingIncomeType } =
    useIncomeTypeOptions();
  const { data: havingLoanOptions, isLoading: isLoadingHavingLoan } =
    useHavingLoanOptions();
  const { data: creditStatusOptions, isLoading: isLoadingCreditStatus } =
    useCreditStatusOptions();

  // Transform provinces to select options
  const locationOptions: ISelectBoxOption[] = provinces
    ? provinces.map((province) => ({
        label: province.name,
        value: province.id,
      }))
    : [];

  const isLoading =
    isLoadingProvinces ||
    isLoadingLoanPurposes ||
    isLoadingGender ||
    isLoadingIncome ||
    isLoadingCareerStatus ||
    isLoadingIncomeType ||
    isLoadingHavingLoan ||
    isLoadingCreditStatus;

  return {
    locationOptions,
    loanPurposes: loanPurposes || [],
    genderOptions: genderOptions || [],
    incomeOptions: incomeOptions || [],
    careerStatusOptions: careerStatusOptions || [],
    incomeTypeOptions: incomeTypeOptions || [],
    havingLoanOptions: havingLoanOptions || [],
    creditStatusOptions: creditStatusOptions || [],
    isLoading,
  };
}
