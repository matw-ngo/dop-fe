/**
 * MSW Profile Factory
 *
 * Factory functions for creating test flow configurations
 */

import type { FlowStepConfig, FlowDetailConfig } from "./types";

/**
 * Create a base flow step with common defaults
 */
export const createBaseStep = (
  overrides: Partial<FlowStepConfig> = {},
): FlowStepConfig => {
  const timestamp = new Date().toISOString();

  return {
    id: `step-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    use_ekyc: false,
    send_otp: false,
    page: "/step",
    have_purpose: false,
    required_purpose: false,
    have_phone_number: false,
    required_phone_number: false,
    have_email: false,
    required_email: false,
    have_full_name: false,
    required_full_name: false,
    have_national_id: false,
    required_national_id: false,
    have_second_national_id: false,
    required_second_national_id: false,
    have_gender: false,
    required_gender: false,
    have_location: false,
    required_location: false,
    have_birthday: false,
    required_birthday: false,
    have_income_type: false,
    required_income_type: false,
    have_income: false,
    required_income: false,
    have_having_loan: false,
    required_having_loan: false,
    have_career_status: false,
    required_career_status: false,
    have_career_type: false,
    required_career_type: false,
    have_credit_status: false,
    required_credit_status: false,
    created_at: timestamp,
    updated_at: timestamp,
    ...overrides,
  };
};

/**
 * Create a base flow configuration
 */
export const createBaseFlow = (
  overrides: Partial<FlowDetailConfig> = {},
): FlowDetailConfig => {
  const timestamp = new Date().toISOString();

  return {
    id: "110e8400-e29b-41d4-a716-446655440001",
    name: "Test Flow",
    description: "Test flow configuration",
    flow_status: "active",
    steps: [],
    created_at: timestamp,
    updated_at: timestamp,
    ...overrides,
  };
};

/**
 * Create an OTP step
 *
 * NOTE: OTP steps should always require phone number for verification.
 * If you need OTP without phone requirement, this may indicate a configuration issue.
 *
 * POTENTIAL ENHANCEMENT: Add server-side validation to ensure phone number
 * is properly validated before OTP is sent.
 */
export const createOTPStep = (
  stepNumber: number,
  overrides: Partial<FlowStepConfig> = {},
): FlowStepConfig => {
  const step = createBaseStep({
    id: `otp-step-${stepNumber}`,
    send_otp: true,
    page: `/otp-${stepNumber}`,
    have_phone_number: true,
    required_phone_number: true,
    ...overrides,
  });

  // Validate configuration
  if (step.send_otp && !step.required_phone_number) {
    console.warn(
      `[Profile Validation] OTP step ${stepNumber} has send_otp: true but required_phone_number: false.`,
      "This may cause issues in the OTP flow. Phone number should be required for OTP verification.",
    );
  }

  return step;
};

/**
 * Create an eKYC step
 */
export const createEKYCStep = (
  stepNumber: number,
  overrides: Partial<FlowStepConfig> = {},
): FlowStepConfig => {
  return createBaseStep({
    id: `ekyc-step-${stepNumber}`,
    use_ekyc: true,
    page: `/ekyc-${stepNumber}`,
    have_national_id: true,
    required_national_id: true,
    ...overrides,
  });
};

/**
 * Create a personal info step
 */
export const createPersonalInfoStep = (
  stepNumber: number,
  overrides: Partial<FlowStepConfig> = {},
): FlowStepConfig => {
  return createBaseStep({
    id: `personal-info-step-${stepNumber}`,
    page: `/personal-info-${stepNumber}`,
    have_full_name: true,
    required_full_name: true,
    have_email: true,
    required_email: true,
    have_birthday: true,
    required_birthday: true,
    ...overrides,
  });
};

/**
 * Create a financial info step
 */
export const createFinancialInfoStep = (
  stepNumber: number,
  overrides: Partial<FlowStepConfig> = {},
): FlowStepConfig => {
  return createBaseStep({
    id: `financial-info-step-${stepNumber}`,
    page: `/financial-info-${stepNumber}`,
    have_income: true,
    required_income: true,
    have_income_type: true,
    required_income_type: true,
    have_career_status: true,
    required_career_status: true,
    ...overrides,
  });
};

/**
 * Create a consent step
 */
export const createConsentStep = (
  stepNumber: number,
  overrides: Partial<FlowStepConfig> = {},
): FlowStepConfig => {
  return createBaseStep({
    id: `consent-step-${stepNumber}`,
    page: `/consent-${stepNumber}`,
    consent_purpose_id: "660e8400-e29b-41d4-a716-446655440006",
    have_purpose: true,
    required_purpose: true,
    ...overrides,
  });
};

/**
 * Create a loan info step (step 1 - loan request details)
 *
 * Shows loan amount, period, and purpose fields.
 * Typically the first step in the onboarding flow.
 */
export const createLoanInfoStep = (
  stepNumber: number,
  overrides: Partial<FlowStepConfig> = {},
): FlowStepConfig => {
  return createBaseStep({
    id: `loan-info-step-${stepNumber}`,
    page: `/loan-info-${stepNumber}`,
    have_purpose: true,
    required_purpose: true,
    have_phone_number: true,
    required_phone_number: true,
    consent_purpose_id: "660e8400-e29b-41d4-a716-446655440006",
    ...overrides,
  });
};
