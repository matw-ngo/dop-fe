/**
 * With eKYC Profile
 *
 * Flow with eKYC verification step
 * Tests navigation with identity verification
 */

import type { TestProfile } from "./types";
import {
  createBaseFlow,
  createPersonalInfoStep,
  createOTPStep,
  createEKYCStep,
  createFinancialInfoStep,
} from "./factory";

export const withEkycProfile: TestProfile = {
  name: "with-ekyc",
  description: "Flow with eKYC verification step",
  flowConfig: createBaseFlow({
    name: "eKYC Verification Flow",
    description: "Flow with eKYC identity verification",
    steps: [
      createPersonalInfoStep(1, {
        page: "/personal-info",
      }),
      createOTPStep(2, {
        page: "/verify-phone",
      }),
      createEKYCStep(3, {
        page: "/ekyc-verification",
      }),
      createFinancialInfoStep(4, {
        page: "/financial-info",
      }),
      createPersonalInfoStep(5, {
        page: "/submit",
        have_location: true,
        required_location: true,
        have_credit_status: true,
        required_credit_status: true,
      }),
    ],
  }),
};
