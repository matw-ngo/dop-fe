/**
 * Default Test Profile
 *
 * Standard flow with OTP at step 3 (middle position)
 * This is the default profile used when no specific profile is requested
 */

import type { TestProfile } from "./types";
import {
  createBaseFlow,
  createPersonalInfoStep,
  createOTPStep,
  createFinancialInfoStep,
  createConsentStep,
} from "./factory";

export const defaultProfile: TestProfile = {
  name: "default",
  description: "Standard flow with OTP at step 3 (middle position)",
  flowConfig: createBaseFlow({
    name: "Default Onboarding Flow",
    description: "Standard user onboarding flow with OTP verification",
    steps: [
      createPersonalInfoStep(1, {
        page: "/index", // Change to /index to match homepage lookup
        consent_purpose_id: "660e8400-e29b-41d4-a716-446655440006", // Add consent to first step
      }),
      createConsentStep(2, {
        page: "/consent",
      }),
      createOTPStep(3, {
        page: "/verify-otp",
      }),
      createFinancialInfoStep(4, {
        page: "/financial-info",
      }),
      createPersonalInfoStep(5, {
        page: "/submit",
        have_location: true,
        required_location: true,
      }),
    ],
  }),
};
