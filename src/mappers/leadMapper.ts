import type { components } from "@/lib/api/v1.d.ts";

type SubmitLeadInfoRequestBody =
  components["schemas"]["SubmitLeadInfoRequestBody"];
type CareerStatus = components["schemas"]["CareerStatus"];
type HavingLoan = components["schemas"]["HavingLoan"];

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
    return undefined;
  };

  return {
    flow_id: flowId,
    step_id: stepId,
    purpose: formData.loan_purpose,

    // Personal Info
    full_name: formData.fullName,
    national_id: formData.idCard,
    phone_number: formData.phone_number, // Form data uses phone_number

    // Loan Info
    loan_amount: formData.expected_amount,
    loan_period: formData.loan_period,

    // Location
    // location: formData.city, // API expects UUID, form might have string code like "hanoi"

    // Income Info
    career_status: formData.jobStatus as CareerStatus,
    career_type: formData.businessType || formData.companyName, // Mapping based on job status logic?

    // Income
    income: parseIncome(formData.monthlyIncome),

    // Financial Info
    // having_loan: formData.havingLoan as HavingLoan,
    // credit_status: formData.creditStatus,
  };
}
