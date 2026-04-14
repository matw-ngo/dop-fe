/**
 * Multi-OTP Flow Profile
 *
 * Flow with multiple OTP verification steps
 * Tests navigation blocking with multiple verification points
 */

import type { TestProfile } from "./types";
import {
  createBaseFlow,
  createPersonalInfoStep,
  createOTPStep,
  createFinancialInfoStep,
} from "./factory";

export const multiOtpFlowProfile: TestProfile = {
  name: "multi-otp-flow",
  description:
    "Flow with multiple OTP steps (tests multiple verification points)",
  flowConfig: createBaseFlow({
    name: "Multi-OTP Verification Flow",
    description: "Flow with OTP verification at multiple steps",
    steps: [
      createPersonalInfoStep(1, {
        page: "/basic-info",
      }),
      createOTPStep(2, {
        page: "/verify-phone",
      }),
      createFinancialInfoStep(3, {
        page: "/financial-info",
      }),
      createOTPStep(4, {
        page: "/verify-email",
        have_email: true,
        required_email: true,
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
