/**
 * MSW Test Profiles Index
 *
 * Central registry for all test profiles
 * Provides profile selection and retrieval utilities
 */

import type { TestProfile, ProfileName } from "./types";
import { defaultProfile } from "./default";
import { otpAtStep1Profile } from "./otp-at-step-1";
import { otpAtStep3Profile } from "./otp-at-step-3";
import { otpAtLastStepProfile } from "./otp-at-last-step";
import { noOtpFlowProfile } from "./no-otp-flow";
import { multiOtpFlowProfile } from "./multi-otp-flow";
import { withEkycProfile } from "./with-ekyc";

/**
 * Profile registry
 */
const profiles: Record<ProfileName, TestProfile> = {
  default: defaultProfile,
  "otp-at-step-1": otpAtStep1Profile,
  "otp-at-step-3": otpAtStep3Profile,
  "otp-at-last-step": otpAtLastStepProfile,
  "no-otp-flow": noOtpFlowProfile,
  "multi-otp-flow": multiOtpFlowProfile,
  "with-ekyc": withEkycProfile,
};

/**
 * Get a test profile by name
 */
export const getProfile = (name: ProfileName = "default"): TestProfile => {
  return profiles[name] || profiles.default;
};

/**
 * Get all available profile names
 */
export const getAvailableProfiles = (): ProfileName[] => {
  return Object.keys(profiles) as ProfileName[];
};

/**
 * Get profile from request header
 * Looks for 'x-test-profile' header
 */
export const getProfileFromRequest = (request: Request): TestProfile => {
  const profileName = request.headers.get("x-test-profile") as ProfileName;
  return getProfile(profileName);
};

/**
 * List all profiles with descriptions
 */
export const listProfiles = (): Array<{
  name: string;
  description: string;
}> => {
  return Object.values(profiles).map((profile) => ({
    name: profile.name,
    description: profile.description,
  }));
};

// Re-export types and profiles
export type {
  TestProfile,
  ProfileName,
  FlowStepConfig,
  FlowDetailConfig,
} from "./types";
export {
  defaultProfile,
  otpAtStep1Profile,
  otpAtStep3Profile,
  otpAtLastStepProfile,
  noOtpFlowProfile,
  multiOtpFlowProfile,
  withEkycProfile,
};
