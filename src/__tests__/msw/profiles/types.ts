/**
 * MSW Profile Types
 *
 * Type definitions for test profiles that define different flow configurations
 */

export interface FlowStepConfig {
  id: string;
  title?: string;
  description?: string;
  use_ekyc: boolean;
  send_otp: boolean;
  page: string;
  consent_purpose_id?: string;
  have_purpose?: boolean;
  required_purpose?: boolean;
  have_phone_number?: boolean;
  required_phone_number?: boolean;
  have_email?: boolean;
  required_email?: boolean;
  have_full_name?: boolean;
  required_full_name?: boolean;
  have_national_id?: boolean;
  required_national_id?: boolean;
  have_second_national_id?: boolean;
  required_second_national_id?: boolean;
  have_gender?: boolean;
  required_gender?: boolean;
  have_location?: boolean;
  required_location?: boolean;
  have_birthday?: boolean;
  required_birthday?: boolean;
  have_income_type?: boolean;
  required_income_type?: boolean;
  have_income?: boolean;
  required_income?: boolean;
  have_having_loan?: boolean;
  required_having_loan?: boolean;
  have_career_status?: boolean;
  required_career_status?: boolean;
  have_career_type?: boolean;
  required_career_type?: boolean;
  have_credit_status?: boolean;
  required_credit_status?: boolean;
  created_at: string;
  updated_at: string;
}

export interface FlowDetailConfig {
  id: string;
  name: string;
  description: string;
  flow_status: "active" | "inactive";
  steps: FlowStepConfig[];
  created_at: string;
  updated_at: string;
}

export interface TestProfile {
  name: string;
  description: string;
  flowConfig: FlowDetailConfig;
}

export type ProfileName =
  | "default"
  | "otp-at-step-1"
  | "otp-at-step-3"
  | "otp-at-last-step"
  | "no-otp-flow"
  | "multi-otp-flow"
  | "with-ekyc";
