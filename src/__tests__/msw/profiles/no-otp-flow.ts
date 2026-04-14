/**
 * No OTP Flow Profile
 *
 * Flow without any OTP verification steps
 * Tests navigation behavior when no OTP step exists
 */

import type { TestProfile } from "./types";
import {
  createBaseFlow,
  createPersonalInfoStep,
  createConsentStep,
  createFinancialInfoStep,
} from "./factory";

export const noOtpFlowProfile: TestProfile = {
  name: "no-otp-flow",
  description: "Flow without any OTP verification (no navigation blocking)",
  flowConfig: createBaseFlow({
    name: "No OTP Flow",
    description: "Standard flow without OTP verification step",
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
      }),
      createPersonalInfoStep(5, {
        page: "/submit",
        have_credit_status: true,
        required_credit_status: true,
      }),
    ],
  }),
};
