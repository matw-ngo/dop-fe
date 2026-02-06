import type { components } from "@/lib/api/v1/dop";

type SubmitLeadInfoRequestBody =
  components["schemas"]["SubmitLeadInfoRequestBody"];
type CareerStatus = components["schemas"]["CareerStatus"];
type HavingLoan = components["schemas"]["HavingLoan"];
type Gender = components["schemas"]["Gender"];
type CreditStatus = components["schemas"]["CreditStatus"];

/**
 * Maps the dynamic form data to the SubmitLeadInfoRequestBody structure.
 *
 * @param formData - The raw key-value data from the form
 * @param flowId - The ID of the current flow
 * @param stepId - The ID of the current step
 */
export function mapFormDataToLeadInfo(
  formData: Record<string, any>,
  flowId: string,
  stepId: string,
): SubmitLeadInfoRequestBody {
  // Helper to parse income string "5-10m" to number or average
  // This logic mimics what might be needed if the API expects a number but the form has ranges
  const parseIncome = (incomeStr?: string): number | undefined => {
    if (!incomeStr) return undefined;
    if (incomeStr === "<5m") return 4000000;
    if (incomeStr === "5-10m") return 7500000;
    if (incomeStr === "10-20m") return 15000000;
    if (incomeStr === ">20m") return 25000000;

    // If it's already a number or numeric string
    const num = Number(incomeStr);
    return isNaN(num) ? undefined : num;
  };

  const formatDate = (date?: Date | string): string | undefined => {
    if (!date) return undefined;
    const dateObj = date instanceof Date ? date : new Date(date);
    return !isNaN(dateObj.getTime())
      ? dateObj.toISOString().split("T")[0]
      : undefined;
  };

  return {
    flow_id: flowId,
    step_id: stepId,
    purpose: formData.loan_purpose,

    // Personal Info
    full_name: formData.fullName,
    national_id: formData.nationalId || formData.idCard,
    phone_number: formData.phone_number || formData.phoneNumber,
    gender: formData.gender as Gender,
    birthday: formatDate(formData.birthday || formData.dateOfBirth),

    // Loan Info
    loan_amount: formData.expected_amount || formData.loanAmount,
    loan_period: formData.loan_period || formData.loanPeriod,

    // Location
    // FIXME: Server requires valid UUID for location.
    // Currently using mock UUIDs from loan-form-config-builder.ts
    location: formData.location || formData.city,

    // Income Info
    career_status: (formData.jobStatus ||
      formData.careerStatus) as CareerStatus,
    career_type:
      formData.businessType || formData.companyName || formData.careerType,
    income_type: formData.incomeType,

    // Income
    income: parseIncome(formData.monthlyIncome || formData.income),

    // Financial Info
    having_loan: (formData.havingLoan || formData.having_loan) as HavingLoan,
    credit_status: (formData.creditStatus ||
      formData.credit_status) as CreditStatus,
  };
}
