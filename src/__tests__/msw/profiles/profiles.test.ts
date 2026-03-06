/**
 * MSW Profile Tests
 *
 * Tests to verify profile configurations and utilities
 */

import { describe, it, expect } from "vitest";
import {
  getProfile,
  getAvailableProfiles,
  listProfiles,
  type ProfileName,
} from "./index";
import {
  getOTPStepIndices,
  getEKYCStepIndices,
  hasOTPVerification,
  hasEKYCVerification,
  getFirstOTPStepIndex,
  getLastOTPStepIndex,
  getStepCount,
  isBeforeOTP,
  isAfterOTP,
  getBlockedSteps,
  getAccessibleSteps,
  createProfileTestMatrix,
} from "./test-utils";

describe("MSW Profiles", () => {
  describe("Profile Registry", () => {
    it("should return default profile when no name provided", () => {
      const profile = getProfile();
      expect(profile.name).toBe("default");
    });

    it("should return correct profile by name", () => {
      const profile = getProfile("otp-at-step-1");
      expect(profile.name).toBe("otp-at-step-1");
      expect(profile.description).toContain("first step");
    });

    it("should return default profile for invalid name", () => {
      const profile = getProfile("invalid-profile" as ProfileName);
      expect(profile.name).toBe("default");
    });

    it("should list all available profiles", () => {
      const profiles = getAvailableProfiles();
      expect(profiles).toContain("default");
      expect(profiles).toContain("otp-at-step-1");
      expect(profiles).toContain("otp-at-step-3");
      expect(profiles).toContain("otp-at-last-step");
      expect(profiles).toContain("no-otp-flow");
      expect(profiles).toContain("multi-otp-flow");
      expect(profiles).toContain("with-ekyc");
    });

    it("should list profiles with descriptions", () => {
      const profiles = listProfiles();
      expect(profiles.length).toBeGreaterThan(0);
      expect(profiles[0]).toHaveProperty("name");
      expect(profiles[0]).toHaveProperty("description");
    });
  });

  describe("Profile Configurations", () => {
    it("default profile should have OTP at step 3", () => {
      const profile = getProfile("default");
      const otpIndices = getOTPStepIndices(profile);
      expect(otpIndices).toContain(2); // Step 3 = index 2
    });

    it("otp-at-step-1 profile should have OTP at step 1", () => {
      const profile = getProfile("otp-at-step-1");
      const otpIndices = getOTPStepIndices(profile);
      expect(otpIndices).toContain(0); // Step 1 = index 0
    });

    it("otp-at-last-step profile should have OTP at last step", () => {
      const profile = getProfile("otp-at-last-step");
      const otpIndices = getOTPStepIndices(profile);
      const stepCount = profile.flowConfig.steps.length;
      expect(otpIndices).toContain(stepCount - 1);
    });

    it("no-otp-flow profile should have no OTP steps", () => {
      const profile = getProfile("no-otp-flow");
      const otpIndices = getOTPStepIndices(profile);
      expect(otpIndices).toHaveLength(0);
    });

    it("multi-otp-flow profile should have multiple OTP steps", () => {
      const profile = getProfile("multi-otp-flow");
      const otpIndices = getOTPStepIndices(profile);
      expect(otpIndices.length).toBeGreaterThan(1);
    });

    it("with-ekyc profile should have eKYC step", () => {
      const profile = getProfile("with-ekyc");
      const ekycIndices = getEKYCStepIndices(profile);
      expect(ekycIndices.length).toBeGreaterThan(0);
    });

    it("all profiles should have at least 3 steps", () => {
      const profiles = getAvailableProfiles();
      profiles.forEach((name) => {
        const profile = getProfile(name);
        expect(profile.flowConfig.steps.length).toBeGreaterThanOrEqual(3);
      });
    });

    it("all profiles should have valid step IDs", () => {
      const profiles = getAvailableProfiles();
      profiles.forEach((name) => {
        const profile = getProfile(name);
        profile.flowConfig.steps.forEach((step) => {
          expect(step.id).toBeDefined();
          expect(step.id.length).toBeGreaterThan(0);
        });
      });
    });
  });

  describe("Profile Utilities", () => {
    it("should detect OTP verification correctly", () => {
      expect(hasOTPVerification("default")).toBe(true);
      expect(hasOTPVerification("otp-at-step-1")).toBe(true);
      expect(hasOTPVerification("no-otp-flow")).toBe(false);
    });

    it("should detect eKYC verification correctly", () => {
      expect(hasEKYCVerification("with-ekyc")).toBe(true);
      expect(hasEKYCVerification("default")).toBe(false);
    });

    it("should get first OTP step index correctly", () => {
      expect(getFirstOTPStepIndex("default")).toBe(2);
      expect(getFirstOTPStepIndex("otp-at-step-1")).toBe(0);
      expect(getFirstOTPStepIndex("no-otp-flow")).toBeNull();
    });

    it("should get last OTP step index correctly", () => {
      const profile = getProfile("otp-at-last-step");
      const lastIndex = profile.flowConfig.steps.length - 1;
      expect(getLastOTPStepIndex("otp-at-last-step")).toBe(lastIndex);
    });

    it("should get step count correctly", () => {
      expect(getStepCount("default")).toBe(5);
      expect(getStepCount("otp-at-step-1")).toBe(5);
    });

    it("should identify steps before OTP", () => {
      expect(isBeforeOTP("default", 0)).toBe(true);
      expect(isBeforeOTP("default", 1)).toBe(true);
      expect(isBeforeOTP("default", 2)).toBe(false); // OTP step itself
      expect(isBeforeOTP("default", 3)).toBe(false);
    });

    it("should identify steps after OTP", () => {
      expect(isAfterOTP("default", 0)).toBe(false);
      expect(isAfterOTP("default", 2)).toBe(false); // OTP step itself
      expect(isAfterOTP("default", 3)).toBe(true);
      expect(isAfterOTP("default", 4)).toBe(true);
    });

    it("should get blocked steps correctly", () => {
      const blocked = getBlockedSteps("default");
      expect(blocked).toContain(0);
      expect(blocked).toContain(1);
      expect(blocked).toContain(2); // OTP step
      expect(blocked).not.toContain(3);
      expect(blocked).not.toContain(4);
    });

    it("should get accessible steps correctly", () => {
      const accessible = getAccessibleSteps("default");
      expect(accessible).not.toContain(0);
      expect(accessible).not.toContain(1);
      expect(accessible).not.toContain(2); // OTP step
      expect(accessible).toContain(3);
      expect(accessible).toContain(4);
    });

    it("should handle no-otp-flow correctly", () => {
      const blocked = getBlockedSteps("no-otp-flow");
      const accessible = getAccessibleSteps("no-otp-flow");

      expect(blocked).toHaveLength(0);
      expect(accessible.length).toBe(getStepCount("no-otp-flow"));
    });
  });

  describe("Profile Test Matrix", () => {
    it("should create test matrix for all profiles", () => {
      const matrix = createProfileTestMatrix();

      expect(matrix.length).toBe(7); // 7 profiles
      expect(matrix[0]).toHaveProperty("profileName");
      expect(matrix[0]).toHaveProperty("description");
      expect(matrix[0]).toHaveProperty("hasOTP");
      expect(matrix[0]).toHaveProperty("hasEKYC");
      expect(matrix[0]).toHaveProperty("stepCount");
      expect(matrix[0]).toHaveProperty("otpStepIndices");
      expect(matrix[0]).toHaveProperty("ekycStepIndices");
    });

    it("should have correct OTP flags in matrix", () => {
      const matrix = createProfileTestMatrix();

      const noOtpProfile = matrix.find((p) => p.profileName === "no-otp-flow");
      expect(noOtpProfile?.hasOTP).toBe(false);

      const defaultProfile = matrix.find((p) => p.profileName === "default");
      expect(defaultProfile?.hasOTP).toBe(true);
    });

    it("should have correct eKYC flags in matrix", () => {
      const matrix = createProfileTestMatrix();

      const ekycProfile = matrix.find((p) => p.profileName === "with-ekyc");
      expect(ekycProfile?.hasEKYC).toBe(true);

      const defaultProfile = matrix.find((p) => p.profileName === "default");
      expect(defaultProfile?.hasEKYC).toBe(false);
    });
  });

  describe("Multi-OTP Profile", () => {
    it("should have multiple OTP steps", () => {
      const profile = getProfile("multi-otp-flow");
      const otpIndices = getOTPStepIndices(profile);

      expect(otpIndices.length).toBeGreaterThanOrEqual(2);
    });

    it("should block navigation to all steps up to first OTP", () => {
      const firstOTPIndex = getFirstOTPStepIndex("multi-otp-flow");
      const blocked = getBlockedSteps("multi-otp-flow");

      expect(blocked).toContain(0);
      expect(blocked).toContain(firstOTPIndex!);
    });
  });

  describe("Profile Step Configurations", () => {
    it("should have valid page paths", () => {
      const profiles = getAvailableProfiles();

      profiles.forEach((name) => {
        const profile = getProfile(name);
        profile.flowConfig.steps.forEach((step) => {
          expect(step.page).toBeDefined();
          expect(step.page).toMatch(/^\//); // Should start with /
        });
      });
    });

    it("should have consistent timestamps", () => {
      const profile = getProfile("default");

      expect(profile.flowConfig.created_at).toBeDefined();
      expect(profile.flowConfig.updated_at).toBeDefined();

      profile.flowConfig.steps.forEach((step) => {
        expect(step.created_at).toBeDefined();
        expect(step.updated_at).toBeDefined();
      });
    });

    it("OTP steps should have phone number fields", () => {
      const profile = getProfile("default");
      const otpIndices = getOTPStepIndices(profile);

      otpIndices.forEach((index) => {
        const step = profile.flowConfig.steps[index];
        expect(step.send_otp).toBe(true);
        expect(step.have_phone_number).toBe(true);
        expect(step.required_phone_number).toBe(true);
      });
    });

    it("eKYC steps should have national ID fields", () => {
      const profile = getProfile("with-ekyc");
      const ekycIndices = getEKYCStepIndices(profile);

      ekycIndices.forEach((index) => {
        const step = profile.flowConfig.steps[index];
        expect(step.use_ekyc).toBe(true);
        expect(step.have_national_id).toBe(true);
        expect(step.required_national_id).toBe(true);
      });
    });
  });
});
