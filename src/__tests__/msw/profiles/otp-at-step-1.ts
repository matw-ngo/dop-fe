/**
 * OTP at Step 1 Profile
 *
 * Flow with OTP verification at the very first step
 * Tests early verification scenario
 */

import type { TestProfile } from "./types";
import {
  createBaseFlow,
  createOTPStep,
  createPersonalInfoStep,
  createFinancialInfoStep,
} from "./factory";

export const otpAtStep1Profile: TestProfile = {
  name: "otp-at-step-1",
  description: "Flow with OTP at the first step (early verification)",
  flowConfig: createBaseFlow({
    name: "Early OTP Verification Flow",
    description: "OTP verification happens at the very first step",
    steps: [
      createOTPStep(1, {
        page: "/verify-phone",
      }),
      createPersonalInfoStep(2, {
        page: "/personal-info",
      }),
      createFinancialInfoStep(3, {
        page: "/financial-info",
      }),
      createPersonalInfoStep(4, {
        page: "/additional-info",
        have_location: true,
        required_location: true,
      }),
      createPersonalInfoStep(5, {
        page: "/submit",
        have_credit_status: true,
        required_credit_status: true,
      }),
    ],
  }),
};
