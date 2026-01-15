import { useTranslations } from "next-intl";
import type { ISelectBoxOption } from "@/components/ui/select-group";

/**
 * Hook to get localized loan purposes
 * Returns translated loan purposes as ISelectBoxOption array
 */
export const useLoanPurposes = (): ISelectBoxOption[] => {
  const t = useTranslations("loanPurposes");

  const purposes = [
    {
      label: t("cd_loan"),
      value: "cd_loan",
    },
    {
      label: t("consumer_loan"),
      value: "consumer_loan",
    },
    {
      label: t("student_loan"),
      value: "student_loan",
    },
    {
      label: t("travel_loan"),
      value: "travel_loan",
    },
    {
      label: t("improvement_loan"),
      value: "improvement_loan",
    },
    {
      label: t("motor_loan"),
      value: "motor_loan",
    },
    {
      label: t("healthcare_loan"),
      value: "healthcare_loan",
    },
    {
      label: t("other_loan"),
      value: "other_loan",
    },
  ];

  return purposes;
};

/**
 * Hook to get localized loan purpose description
 * @param purpose - The loan purpose value
 * @returns Localized description
 */
export const useLoanPurposeDescription = (purpose: string): string => {
  const t = useTranslations("common.loanPurposeDescriptions");
  return t(purpose) || t("defaultDescription");
};
