/**
 * Default Test Profile
 *
 * Simple 2-step flow for testing loan searching + result:
 * - Step 1 (/index):         Loan info (amount, period, purpose) + consent
 * - Step 2 (/personal-info): Personal info → triggers loan searching + show results
 */

import type { TestProfile } from "./types";
import {
  createBaseFlow,
  createLoanInfoStep,
  createPersonalInfoStep,
} from "./factory";

export const defaultProfile: TestProfile = {
  name: "default",
  description: "2-step flow: loan info → personal info → searching → results",
  flowConfig: createBaseFlow({
    name: "Default Onboarding Flow",
    description: "Standard loan application flow",
    steps: [
      // Step 1: Loan request - amount, period, purpose + consent
      // Phone number is handled separately via PhoneVerificationModal
      createLoanInfoStep(1, {
        page: "/index",
        have_phone_number: false,
        required_phone_number: false,
      }),

      // Step 2: Personal info (final step - triggers lead creation + searching)
      // Only personal fields, no overlap with step 1
      createPersonalInfoStep(2, {
        page: "/personal-info",
        have_national_id: true,
        required_national_id: true,
        have_gender: true,
        required_gender: true,
        have_location: true,
        required_location: true,
      }),
    ],
  }),
};
