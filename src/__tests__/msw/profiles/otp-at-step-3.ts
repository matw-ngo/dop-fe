/**
 * OTP at Step 3 Profile
 *
 * Flow with OTP verification at step 3 (middle position)
 * This is an alias for the default profile for explicit testing
 */

import type { TestProfile } from "./types";
import {
  createBaseFlow,
  createPersonalInfoStep,
  createConsentStep,
  createOTPStep,
  createFinancialInfoStep,
} from "./factory";

export const otpAtStep3Profile: TestProfile = {
  name: "otp-at-step-3",
  description: "Flow with OTP at step 3 (middle position)",
  flowConfig: createBaseFlow({
    name: "Mid-Flow OTP Verification",
    description: "OTP verification happens in the middle of the flow",
    steps: [
      createPersonalInfoStep(1, {
        page: "/basic-info",
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
        page: "/final-submit",
        have_location: true,
        required_location: true,
        have_credit_status: true,
        required_credit_status: true,
      }),
    ],
  }),
};
