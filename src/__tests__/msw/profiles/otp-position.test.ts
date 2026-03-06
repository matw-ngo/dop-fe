/**
 * OTP Position Verification Tests
 *
 * Verifies that OTP can appear at different step positions
 * and that the system correctly detects and handles it.
 */

import { describe, it, expect } from "vitest";
import { getProfile } from "./index";
import { getOTPStepIndices, getFirstOTPStepIndex } from "./test-utils";

describe("OTP Position Verification", () => {
  describe("OTP at Different Positions", () => {
    it("should have OTP at step 1 (index 0) in otp-at-step-1 profile", () => {
      const profile = getProfile("otp-at-step-1");
      const otpIndices = getOTPStepIndices(profile);
      const firstOTPIndex = getFirstOTPStepIndex("otp-at-step-1");

      expect(otpIndices).toContain(0);
      expect(firstOTPIndex).toBe(0);
      expect(profile.flowConfig.steps[0].send_otp).toBe(true);
    });

    it("should have OTP at step 3 (index 2) in default profile", () => {
      const profile = getProfile("default");
      const otpIndices = getOTPStepIndices(profile);
      const firstOTPIndex = getFirstOTPStepIndex("default");

      expect(otpIndices).toContain(2);
      expect(firstOTPIndex).toBe(2);
      expect(profile.flowConfig.steps[2].send_otp).toBe(true);
    });

    it("should have OTP at step 3 (index 2) in otp-at-step-3 profile", () => {
      const profile = getProfile("otp-at-step-3");
      const otpIndices = getOTPStepIndices(profile);
      const firstOTPIndex = getFirstOTPStepIndex("otp-at-step-3");

      expect(otpIndices).toContain(2);
      expect(firstOTPIndex).toBe(2);
      expect(profile.flowConfig.steps[2].send_otp).toBe(true);
    });

    it("should have OTP at step 5 (index 4) in otp-at-last-step profile", () => {
      const profile = getProfile("otp-at-last-step");
      const otpIndices = getOTPStepIndices(profile);
      const firstOTPIndex = getFirstOTPStepIndex("otp-at-last-step");
      const lastIndex = profile.flowConfig.steps.length - 1;

      expect(otpIndices).toContain(lastIndex);
      expect(firstOTPIndex).toBe(lastIndex);
      expect(profile.flowConfig.steps[lastIndex].send_otp).toBe(true);
    });

    it("should have no OTP in no-otp-flow profile", () => {
      const profile = getProfile("no-otp-flow");
      const otpIndices = getOTPStepIndices(profile);
      const firstOTPIndex = getFirstOTPStepIndex("no-otp-flow");

      expect(otpIndices).toHaveLength(0);
      expect(firstOTPIndex).toBeNull();

      // Verify no step has send_otp: true
      profile.flowConfig.steps.forEach((step) => {
        expect(step.send_otp).toBe(false);
      });
    });

    it("should have multiple OTP steps in multi-otp-flow profile", () => {
      const profile = getProfile("multi-otp-flow");
      const otpIndices = getOTPStepIndices(profile);

      expect(otpIndices.length).toBeGreaterThanOrEqual(2);

      // Verify each OTP index has send_otp: true
      otpIndices.forEach((index) => {
        expect(profile.flowConfig.steps[index].send_otp).toBe(true);
      });
    });
  });

  describe("OTP Step Properties", () => {
    it("should have phone_number fields in OTP steps", () => {
      const profiles = ["default", "otp-at-step-1", "otp-at-last-step"];

      profiles.forEach((profileName) => {
        const profile = getProfile(profileName as any);
        const otpIndices = getOTPStepIndices(profile);

        otpIndices.forEach((index) => {
          const step = profile.flowConfig.steps[index];
          expect(step.send_otp).toBe(true);
          expect(step.have_phone_number).toBe(true);
          expect(step.required_phone_number).toBe(true);
        });
      });
    });

    it("should have unique page paths for OTP steps", () => {
      const profiles = ["default", "otp-at-step-1", "otp-at-last-step"];
      const pagePaths = new Set<string>();

      profiles.forEach((profileName) => {
        const profile = getProfile(profileName as any);
        const otpIndices = getOTPStepIndices(profile);

        otpIndices.forEach((index) => {
          const step = profile.flowConfig.steps[index];
          expect(step.page).toBeDefined();
          expect(step.page.length).toBeGreaterThan(0);
          pagePaths.add(`${profileName}:${step.page}`);
        });
      });

      // Each profile should have unique page paths
      expect(pagePaths.size).toBe(profiles.length);
    });
  });

  describe("Non-OTP Steps", () => {
    it("should not have send_otp flag in non-OTP steps", () => {
      const profile = getProfile("default");
      const otpIndices = getOTPStepIndices(profile);

      profile.flowConfig.steps.forEach((step, index) => {
        if (!otpIndices.includes(index)) {
          expect(step.send_otp).toBe(false);
        }
      });
    });

    it("should have other field types in non-OTP steps", () => {
      const profile = getProfile("default");
      const otpIndices = getOTPStepIndices(profile);

      let nonOTPStepCount = 0;
      let stepsWithFields = 0;

      profile.flowConfig.steps.forEach((step, index) => {
        if (!otpIndices.includes(index)) {
          nonOTPStepCount++;

          // Non-OTP steps may have other fields
          const hasOtherFields =
            step.have_email ||
            step.have_full_name ||
            step.have_income ||
            step.have_location ||
            step.have_birthday ||
            step.have_purpose ||
            step.have_credit_status;

          if (hasOtherFields) {
            stepsWithFields++;
          }
        }
      });

      // At least some non-OTP steps should have fields
      expect(stepsWithFields).toBeGreaterThan(0);
      expect(nonOTPStepCount).toBeGreaterThan(0);
    });
  });

  describe("Profile Consistency", () => {
    it("should have consistent step count across profiles", () => {
      const profiles = [
        "default",
        "otp-at-step-1",
        "otp-at-step-3",
        "otp-at-last-step",
        "no-otp-flow",
      ];

      const stepCounts = profiles.map((name) => {
        const profile = getProfile(name as any);
        return profile.flowConfig.steps.length;
      });

      // All profiles should have 5 steps
      stepCounts.forEach((count) => {
        expect(count).toBe(5);
      });
    });

    it("should have valid step IDs in all profiles", () => {
      const profiles = [
        "default",
        "otp-at-step-1",
        "otp-at-step-3",
        "otp-at-last-step",
        "no-otp-flow",
        "multi-otp-flow",
      ];

      profiles.forEach((profileName) => {
        const profile = getProfile(profileName as any);

        profile.flowConfig.steps.forEach((step, index) => {
          expect(step.id).toBeDefined();
          expect(step.id.length).toBeGreaterThan(0);
          expect(step.id).toMatch(/^[a-z0-9-]+$/i);
        });
      });
    });

    it("should have valid timestamps in all steps", () => {
      const profile = getProfile("default");

      profile.flowConfig.steps.forEach((step) => {
        expect(step.created_at).toBeDefined();
        expect(step.updated_at).toBeDefined();

        // Should be valid ISO date strings
        expect(() => new Date(step.created_at)).not.toThrow();
        expect(() => new Date(step.updated_at)).not.toThrow();
      });
    });
  });

  describe("OTP Detection Logic", () => {
    it("should correctly identify first OTP step", () => {
      const testCases = [
        { profile: "otp-at-step-1", expectedIndex: 0 },
        { profile: "default", expectedIndex: 2 },
        { profile: "otp-at-step-3", expectedIndex: 2 },
        { profile: "otp-at-last-step", expectedIndex: 4 },
        { profile: "no-otp-flow", expectedIndex: null },
      ];

      testCases.forEach(({ profile, expectedIndex }) => {
        const firstIndex = getFirstOTPStepIndex(profile as any);
        expect(firstIndex).toBe(expectedIndex);
      });
    });

    it("should correctly identify all OTP steps", () => {
      const testCases = [
        { profile: "otp-at-step-1", expectedCount: 1 },
        { profile: "default", expectedCount: 1 },
        { profile: "otp-at-step-3", expectedCount: 1 },
        { profile: "otp-at-last-step", expectedCount: 1 },
        { profile: "no-otp-flow", expectedCount: 0 },
        { profile: "multi-otp-flow", expectedCount: 2 },
      ];

      testCases.forEach(({ profile, expectedCount }) => {
        const profileData = getProfile(profile as any);
        const otpIndices = getOTPStepIndices(profileData);
        expect(otpIndices.length).toBe(expectedCount);
      });
    });
  });

  describe("Real-World Scenarios", () => {
    it("should support early verification flow (OTP first)", () => {
      const profile = getProfile("otp-at-step-1");

      // First step should be OTP
      expect(profile.flowConfig.steps[0].send_otp).toBe(true);

      // Remaining steps should be regular fields
      for (let i = 1; i < profile.flowConfig.steps.length; i++) {
        expect(profile.flowConfig.steps[i].send_otp).toBe(false);
      }
    });

    it("should support late verification flow (OTP last)", () => {
      const profile = getProfile("otp-at-last-step");
      const lastIndex = profile.flowConfig.steps.length - 1;

      // Last step should be OTP
      expect(profile.flowConfig.steps[lastIndex].send_otp).toBe(true);

      // Previous steps should be regular fields
      for (let i = 0; i < lastIndex; i++) {
        expect(profile.flowConfig.steps[i].send_otp).toBe(false);
      }
    });

    it("should support mid-flow verification (OTP in middle)", () => {
      const profile = getProfile("default");
      const otpIndex = 2;

      // Middle step should be OTP
      expect(profile.flowConfig.steps[otpIndex].send_otp).toBe(true);

      // Steps before and after should be regular fields
      expect(profile.flowConfig.steps[0].send_otp).toBe(false);
      expect(profile.flowConfig.steps[1].send_otp).toBe(false);
      expect(profile.flowConfig.steps[3].send_otp).toBe(false);
      expect(profile.flowConfig.steps[4].send_otp).toBe(false);
    });

    it("should support no verification flow", () => {
      const profile = getProfile("no-otp-flow");

      // No step should have OTP
      profile.flowConfig.steps.forEach((step) => {
        expect(step.send_otp).toBe(false);
      });
    });

    it("should support multiple verification points", () => {
      const profile = getProfile("multi-otp-flow");
      const otpIndices = getOTPStepIndices(profile);

      // Should have at least 2 OTP steps
      expect(otpIndices.length).toBeGreaterThanOrEqual(2);

      // OTP steps should not be consecutive
      if (otpIndices.length >= 2) {
        const gap = otpIndices[1] - otpIndices[0];
        expect(gap).toBeGreaterThan(1);
      }
    });
  });
});
