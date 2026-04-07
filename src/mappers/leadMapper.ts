import type { components } from "@/lib/api/v1/dop";

type SubmitLeadInfoRequestBody =
  components["schemas"]["SubmitLeadInfoRequestBody"];
type CareerStatus = components["schemas"]["CareerStatus"];
type HavingLoan = components["schemas"]["HavingLoan"];
type Gender = components["schemas"]["Gender"];
type CreditStatus = components["schemas"]["CreditStatus"];

// Simple validators - form now uses API values directly
const normalizeCareerStatus = (value: unknown): CareerStatus | undefined => {
  const normalized = String(value ?? "").toLowerCase();
  const validValues: CareerStatus[] = [
    "employed",
    "self_employed",
    "unemployed",
    "housewife",
    "retired",
  ];
  return validValues.includes(normalized as CareerStatus)
    ? (normalized as CareerStatus)
    : undefined;
};

const normalizeHavingLoan = (value: unknown): HavingLoan | undefined => {
  const normalized = String(value ?? "").toLowerCase();
  const validValues: HavingLoan[] = [
    "no_loan",
    "one_loan",
    "two_loans",
    "three_loans",
    "more_than_three_loans",
  ];
  return validValues.includes(normalized as HavingLoan)
    ? (normalized as HavingLoan)
    : undefined;
};

const normalizeCreditStatus = (value: unknown): CreditStatus | undefined => {
  const normalized = String(value ?? "").toLowerCase();
  const validValues: CreditStatus[] = [
    "no_bad_debt",
    "bad_debt",
    "bad_debt_last3_year",
  ];
  return validValues.includes(normalized as CreditStatus)
    ? (normalized as CreditStatus)
    : undefined;
};

const toOptionalNumber = (value: unknown): number | undefined => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim().length > 0) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }
  return undefined;
};

export const getLeadPurpose = (formData: Record<string, any>): string => {
  return String(
    formData.loan_purpose || formData.loanPurpose || formData.purpose || "",
  ).trim();
};

export function mapFormDataToCreateLeadInfo(
  formData: Record<string, any>,
  flowId: string,
  stepId: string,
  phoneNumber: string,
): SubmitLeadInfoRequestBody {
  return {
    flow_id: flowId,
    step_id: stepId,
    phone_number: phoneNumber,
    purpose: getLeadPurpose(formData) || undefined,
    loan_amount: toOptionalNumber(
      formData.expected_amount || formData.loanAmount,
    ),
    loan_period: toOptionalNumber(formData.loan_period || formData.loanPeriod),
    location: formData.location || formData.city || undefined,
  };
}

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

  const careerStatus = normalizeCareerStatus(
    formData.jobStatus || formData.careerStatus || formData.career_status,
  );
  const havingLoan = normalizeHavingLoan(
    formData.havingLoan || formData.having_loan,
  );
  let creditStatus = normalizeCreditStatus(
    formData.creditStatus || formData.credit_status,
  );

  // Default to 'no_bad_debt' if credit_status is not provided
  // This handles the case where the form doesn't have a credit_status field
  // but the server requires it (mismatch between API spec and server implementation)
  if (!creditStatus) {
    creditStatus = "no_bad_debt";
  }

  return {
    flow_id: flowId,
    step_id: stepId,
    purpose: formData.loan_purpose || formData.loanPurpose || formData.purpose,

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
    career_status: careerStatus,
    career_type:
      formData.businessType || formData.companyName || formData.careerType,
    income_type: formData.incomeType,

    // Income
    income: parseIncome(formData.monthlyIncome || formData.income),

    // Financial Info
    having_loan: havingLoan,
    credit_status: creditStatus,
  };
}
