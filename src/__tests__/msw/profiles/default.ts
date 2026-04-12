/**
 * Default Test Profile
 *
 * Finzone default flow - 2 step loan onboarding:
 * - Step 1 (/index):         Loan info (phone, purpose) + OTP verification
 * - Step 2 (/submit-info):   Personal info → triggers loan searching + show results
 *
 * Based on real API data from dop-stg.datanest.vn
 * Flow ID: 2ff645ad-2f98-4299-95d2-8b890b24c1cf
 */

import type { TestProfile } from "./types";
import { createBaseFlow, createBaseStep } from "./factory";

export const defaultProfile: TestProfile = {
  name: "default",
  description:
    "Finzone 2-step flow: loan info (OTP) → personal info → searching → results",
  flowConfig: createBaseFlow({
    id: "2ff645ad-2f98-4299-95d2-8b890b24c1cf",
    name: "finzone default flow",
    description:
      "finzone default flow of finzone, only contain submit info steps",
    steps: [
      // Step 1: Loan info with phone and OTP
      createBaseStep({
        id: "d7ceabac-ad42-4253-abb4-6c60a0fd0a4f",
        page: "/index",
        have_phone_number: true,
        required_phone_number: true,
        have_purpose: true,
        required_purpose: true,
        send_otp: true,
        use_ekyc: false,
        created_at: "2026-01-08T08:00:22.245593Z",
        updated_at: "2026-01-08T08:00:22.245593Z",
      }),
      // Step 2: Personal info submission
      createBaseStep({
        id: "76ba90f3-abe5-4c74-bb49-350e7314a9e6",
        page: "/submit-info",
        have_full_name: true,
        required_full_name: true,
        have_national_id: true,
        required_national_id: true,
        have_gender: true,
        required_gender: true,
        have_birthday: true,
        required_birthday: true,
        have_location: true,
        required_location: true,
        have_career_status: true,
        required_career_status: true,
        have_career_type: true,
        required_career_type: true,
        have_income_type: true,
        required_income_type: true,
        have_income: true,
        required_income: true,
        have_having_loan: true,
        required_having_loan: true,
        have_credit_status: true,
        required_credit_status: true,
        send_otp: false,
        use_ekyc: false,
        created_at: "2026-01-08T08:00:36.39525Z",
        updated_at: "2026-01-08T08:00:36.39525Z",
      }),
    ],
    created_at: "2026-01-08T08:00:50.734678Z",
    updated_at: "2026-01-08T08:00:50.734678Z",
  }),
};
