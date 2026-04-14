/**
 * MSW Profile Test Utilities
 *
 * Helper functions for testing with different profiles
 */

import type { ProfileName, TestProfile } from "./types";
import { getProfile } from "./index";

/**
 * Create a mock request with profile header
 */
export const createProfileRequest = (
  url: string,
  profileName: ProfileName = "default",
  options: RequestInit = {},
): Request => {
  const headers = new Headers(options.headers);
  headers.set("x-test-profile", profileName);

  return new Request(url, {
    ...options,
    headers,
  });
};

/**
 * Create a mock request with both profile and scenario headers
 */
export const createTestRequest = (
  url: string,
  profileName: ProfileName = "default",
  scenario: string = "success",
  options: RequestInit = {},
): Request => {
  const headers = new Headers(options.headers);
  headers.set("x-test-profile", profileName);
  headers.set("x-test-scenario", scenario);

  return new Request(url, {
    ...options,
    headers,
  });
};

/**
 * Get OTP step indices from a profile
 */
export const getOTPStepIndices = (profile: TestProfile): number[] => {
  return profile.flowConfig.steps
    .map((step, index) => (step.send_otp ? index : -1))
    .filter((index) => index !== -1);
};

/**
 * Get eKYC step indices from a profile
 */
export const getEKYCStepIndices = (profile: TestProfile): number[] => {
  return profile.flowConfig.steps
    .map((step, index) => (step.use_ekyc ? index : -1))
    .filter((index) => index !== -1);
};

/**
 * Check if a profile has OTP verification
 */
export const hasOTPVerification = (profileName: ProfileName): boolean => {
  const profile = getProfile(profileName);
  return getOTPStepIndices(profile).length > 0;
};

/**
 * Check if a profile has eKYC verification
 */
export const hasEKYCVerification = (profileName: ProfileName): boolean => {
  const profile = getProfile(profileName);
  return getEKYCStepIndices(profile).length > 0;
};

/**
 * Get the first OTP step index from a profile
 */
export const getFirstOTPStepIndex = (
  profileName: ProfileName,
): number | null => {
  const profile = getProfile(profileName);
  const indices = getOTPStepIndices(profile);
  return indices.length > 0 ? indices[0] : null;
};

/**
 * Get the last OTP step index from a profile
 */
export const getLastOTPStepIndex = (
  profileName: ProfileName,
): number | null => {
  const profile = getProfile(profileName);
  const indices = getOTPStepIndices(profile);
  return indices.length > 0 ? indices[indices.length - 1] : null;
};

/**
 * Get total number of steps in a profile
 */
export const getStepCount = (profileName: ProfileName): number => {
  const profile = getProfile(profileName);
  return profile.flowConfig.steps.length;
};

/**
 * Check if a step index is before OTP in a profile
 */
export const isBeforeOTP = (
  profileName: ProfileName,
  stepIndex: number,
): boolean => {
  const firstOTPIndex = getFirstOTPStepIndex(profileName);
  if (firstOTPIndex === null) return false;
  return stepIndex < firstOTPIndex;
};

/**
 * Check if a step index is after OTP in a profile
 */
export const isAfterOTP = (
  profileName: ProfileName,
  stepIndex: number,
): boolean => {
  const lastOTPIndex = getLastOTPStepIndex(profileName);
  if (lastOTPIndex === null) return false;
  return stepIndex > lastOTPIndex;
};

/**
 * Get steps that should be blocked after OTP verification
 */
export const getBlockedSteps = (profileName: ProfileName): number[] => {
  const firstOTPIndex = getFirstOTPStepIndex(profileName);
  if (firstOTPIndex === null) return [];

  const stepCount = getStepCount(profileName);
  const blocked: number[] = [];

  for (let i = 0; i <= firstOTPIndex; i++) {
    blocked.push(i);
  }

  return blocked;
};

/**
 * Get steps that should be accessible after OTP verification
 */
export const getAccessibleSteps = (profileName: ProfileName): number[] => {
  const firstOTPIndex = getFirstOTPStepIndex(profileName);
  if (firstOTPIndex === null) {
    // No OTP, all steps accessible
    const stepCount = getStepCount(profileName);
    return Array.from({ length: stepCount }, (_, i) => i);
  }

  const stepCount = getStepCount(profileName);
  const accessible: number[] = [];

  for (let i = firstOTPIndex + 1; i < stepCount; i++) {
    accessible.push(i);
  }

  return accessible;
};

/**
 * Create a test matrix for all profiles
 */
export const createProfileTestMatrix = (): Array<{
  profileName: ProfileName;
  description: string;
  hasOTP: boolean;
  hasEKYC: boolean;
  stepCount: number;
  otpStepIndices: number[];
  ekycStepIndices: number[];
}> => {
  const profileNames: ProfileName[] = [
    "default",
    "otp-at-step-1",
    "otp-at-step-3",
    "otp-at-last-step",
    "no-otp-flow",
    "multi-otp-flow",
    "with-ekyc",
  ];

  return profileNames.map((name) => {
    const profile = getProfile(name);
    return {
      profileName: name,
      description: profile.description,
      hasOTP: hasOTPVerification(name),
      hasEKYC: hasEKYCVerification(name),
      stepCount: getStepCount(name),
      otpStepIndices: getOTPStepIndices(profile),
      ekycStepIndices: getEKYCStepIndices(profile),
    };
  });
};
