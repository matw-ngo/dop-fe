/**
 * OTP at Last Step Profile
 *
 * Flow with OTP verification at the final step
 * Tests late verification scenario where all info is collected first
 */

import type { TestProfile } from "./types";
import {
  createBaseFlow,
  createPersonalInfoStep,
  createConsentStep,
  createFinancialInfoStep,
  createOTPStep,
} from "./factory";

export const otpAtLastStepProfile: TestProfile = {
  name: "otp-at-last-step",
  description: "Flow with OTP at the final step (late verification)",
  flowConfig: createBaseFlow({
    name: "Late OTP Verification Flow",
    description: "OTP verification happens at the very last step",
    steps: [
      createPersonalInfoStep(1, {
        page: "/personal-info",
      }),
      createConsentStep(2, {
        page: "/consent",
      }),
      createFinancialInfoStep(3, {
        page: "/financial-info",
      }),
      createPersonalInfoStep(4, {
        page: "/additional-info",
        have_location: true,
        required_location: true,
        have_credit_status: true,
        required_credit_status: true,
      }),
      createOTPStep(5, {
        page: "/verify-and-submit",
      }),
    ],
  }),
};
