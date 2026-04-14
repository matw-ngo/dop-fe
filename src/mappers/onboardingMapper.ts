import type { components } from "@/lib/api/v1/dop";

type SubmitLeadInfoRequestBody =
  components["schemas"]["SubmitLeadInfoRequestBody"];
type CreateLeadRequestBody = components["schemas"]["CreateLeadRequestBody"];

/**
 * Maps form data from ConfirmationStep to API request format
 * @param formData - Form data from onboarding steps
 * @param flowId - Current flow ID
 * @param stepId - Current step ID
 * @returns Formatted request body for submit-info endpoint
 */
export function mapFormToApi(
  formData: Record<string, any>,
  flowId: string,
  stepId: string,
): SubmitLeadInfoRequestBody {
  // Format date to YYYY-MM-DD if present
  const formatDate = (dateValue: any): string | undefined => {
    if (!dateValue) return undefined;
    const date =
      typeof dateValue === "string" ? new Date(dateValue) : dateValue;
    return date.toISOString().split("T")[0]; // Returns YYYY-MM-DD
  };

  // Map gender to API enum values
  const mapGender = (
    value: string,
  ): components["schemas"]["Gender"] | undefined => {
    const genderMap: Record<string, components["schemas"]["Gender"]> = {
      male: "male",
      female: "female",
      other: "other",
    };
    return genderMap[value];
  };

  // Map having loan to API enum values
  const mapHavingLoan = (
    value: string,
  ): components["schemas"]["HavingLoan"] | undefined => {
    const loanMap: Record<string, components["schemas"]["HavingLoan"]> = {
      no_loan: "no_loan",
      one_loan: "one_loan",
      two_loans: "two_loans",
      three_loans: "three_loans",
      more_than_three_loans: "more_than_three_loans",
    };
    return loanMap[value];
  };

  // Map career status to API enum values
  const mapCareerStatus = (
    value: string,
  ): components["schemas"]["CareerStatus"] | undefined => {
    const careerMap: Record<string, components["schemas"]["CareerStatus"]> = {
      employed: "employed",
      self_employed: "self_employed",
      unemployed: "unemployed",
      housewife: "housewife",
      retired: "retired",
    };
    return careerMap[value];
  };

  // Map credit status to API enum values
  const mapCreditStatus = (
    value: string,
  ): components["schemas"]["CreditStatus"] | undefined => {
    const creditMap: Record<string, components["schemas"]["CreditStatus"]> = {
      no_bad_debt: "no_bad_debt",
      bad_debt: "bad_debt",
      bad_debt_last3_year: "bad_debt_last3_year",
    };
    return creditMap[value];
  };

  return {
    flow_id: flowId,
    step_id: stepId,
    phone_number: formData.phoneNumber,
    email: formData.email,
    purpose: formData.purpose,
    loan_amount: formData.loanAmount
      ? parseInt(formData.loanAmount, 10)
      : undefined,
    loan_period: formData.loanPeriod
      ? parseInt(formData.loanPeriod, 10)
      : undefined,
    otp_type: "sms", // Default to SMS OTP
    full_name: formData.fullName,
    national_id: formData.nationalId,
    gender: formData.gender ? mapGender(formData.gender) : undefined,
    location: formData.location,
    birthday: formData.dateOfBirth
      ? formatDate(formData.dateOfBirth)
      : undefined,
    income_type: formData.incomeType,
    income: formData.income ? parseInt(formData.income, 10) : undefined,
    having_loan: formData.havingLoan
      ? mapHavingLoan(formData.havingLoan)
      : undefined,
    career_status: formData.careerStatus
      ? mapCareerStatus(formData.careerStatus)
      : undefined,
    career_type: formData.careerType,
    credit_status: formData.creditStatus
      ? mapCreditStatus(formData.creditStatus)
      : undefined,
  };
}

/**
 * Wraps the form data into a CreateLeadRequestBody for POST /leads endpoint
 * @param formData - Form data from onboarding steps
 * @param flowId - Current flow ID
 * @param stepId - Current step ID
 * @param domain - Domain for the lead
 * @returns Formatted request body for create-lead endpoint
 */
export function toCreateLeadRequest(
  formData: Record<string, any>,
  flowId: string,
  stepId: string,
  domain: string,
): CreateLeadRequestBody {
  return {
    flow_id: flowId,
    consent_id: flowId as any,
    tenant: domain as any,
    deviece_info: {}, // Empty object as per requirements
    tracking_params: {}, // Empty object as per requirements
    info: mapFormToApi(formData, flowId, stepId),
  };
}
