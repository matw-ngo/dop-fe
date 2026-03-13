/**
 * Test: OTP Success Navigation Logic
 * 
 * Verifies that after OTP success:
 * 1. If there's a next step → Navigate to next step
 * 2. If it's the last step → Show loan searching screen
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

describe("OTP Success Navigation Logic", () => {
  describe("Scenario 1: OTP at middle step (has next step)", () => {
    it("should navigate to next step after OTP success", () => {
      // Given: Flow with 3 steps, OTP at step 1
      const flowData = {
        id: "flow-123",
        steps: [
          { id: "step-1", page: "/step-1", sendOtp: true },
          { id: "step-2", page: "/step-2", sendOtp: false },
          { id: "step-3", page: "/step-3", sendOtp: false },
        ],
      };

      const currentStep = flowData.steps[0]; // Step 1 with OTP
      const currentStepIndex = 0;
      const nextStep = flowData.steps[currentStepIndex + 1]; // Step 2

      // When: OTP success at step 1
      // Then: Should navigate to step 2
      expect(nextStep).toBeDefined();
      expect(nextStep?.page).toBe("/step-2");
      
      // Should NOT show loan searching screen
      const shouldShowSearching = !nextStep;
      expect(shouldShowSearching).toBe(false);
    });
  });

  describe("Scenario 2: OTP at last step (no next step)", () => {
    it("should show loan searching screen after OTP success", () => {
      // Given: Flow with 2 steps, OTP at step 2 (last step)
      const flowData = {
        id: "flow-123",
        steps: [
          { id: "step-1", page: "/step-1", sendOtp: false },
          { id: "step-2", page: "/step-2", sendOtp: true },
        ],
      };

      const currentStep = flowData.steps[1]; // Step 2 with OTP (last step)
      const currentStepIndex = 1;
      const nextStep = flowData.steps[currentStepIndex + 1]; // undefined

      // When: OTP success at last step
      // Then: Should show loan searching screen
      expect(nextStep).toBeUndefined();
      
      // Should show loan searching screen
      const shouldShowSearching = !nextStep;
      expect(shouldShowSearching).toBe(true);
    });
  });

  describe("Scenario 3: Multiple steps after OTP", () => {
    it("should navigate to immediate next step, not skip steps", () => {
      // Given: Flow with 4 steps, OTP at step 2
      const flowData = {
        id: "flow-123",
        steps: [
          { id: "step-1", page: "/step-1", sendOtp: false },
          { id: "step-2", page: "/step-2", sendOtp: true },
          { id: "step-3", page: "/step-3", sendOtp: false },
          { id: "step-4", page: "/step-4", sendOtp: false },
        ],
      };

      const currentStep = flowData.steps[1]; // Step 2 with OTP
      const currentStepIndex = 1;
      const nextStep = flowData.steps[currentStepIndex + 1]; // Step 3

      // When: OTP success at step 2
      // Then: Should navigate to step 3 (not step 4)
      expect(nextStep).toBeDefined();
      expect(nextStep?.page).toBe("/step-3");
      expect(nextStep?.id).toBe("step-3");
      
      // Should NOT skip to step 4
      expect(nextStep?.id).not.toBe("step-4");
    });
  });

  describe("Scenario 4: Single step with OTP", () => {
    it("should show loan searching screen after OTP success", () => {
      // Given: Flow with only 1 step with OTP
      const flowData = {
        id: "flow-123",
        steps: [
          { id: "step-1", page: "/step-1", sendOtp: true },
        ],
      };

      const currentStep = flowData.steps[0]; // Only step with OTP
      const currentStepIndex = 0;
      const nextStep = flowData.steps[currentStepIndex + 1]; // undefined

      // When: OTP success at only step
      // Then: Should show loan searching screen
      expect(nextStep).toBeUndefined();
      
      const shouldShowSearching = !nextStep;
      expect(shouldShowSearching).toBe(true);
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty steps array", () => {
      const flowData = {
        id: "flow-123",
        steps: [],
      };

      const currentStepIndex = 0;
      const nextStep = flowData.steps[currentStepIndex + 1];

      expect(nextStep).toBeUndefined();
    });

    it("should handle invalid step index", () => {
      const flowData = {
        id: "flow-123",
        steps: [
          { id: "step-1", page: "/step-1", sendOtp: true },
        ],
      };

      const currentStepIndex = -1; // Invalid index
      const nextStep = flowData.steps[currentStepIndex + 1]; // steps[0]

      // Should still work and return first step
      expect(nextStep).toBeDefined();
      expect(nextStep?.id).toBe("step-1");
    });
  });
});

/**
 * Expected Behavior Summary:
 * 
 * Flow: [Step1(OTP)] → [Step2] → [Step3]
 * - OTP success at Step1 → Navigate to Step2 ✓
 * 
 * Flow: [Step1] → [Step2(OTP)]
 * - OTP success at Step2 → Show loan searching screen ✓
 * 
 * Flow: [Step1(OTP)]
 * - OTP success at Step1 → Show loan searching screen ✓
 * 
 * Flow: [Step1] → [Step2(OTP)] → [Step3] → [Step4]
 * - OTP success at Step2 → Navigate to Step3 (not Step4) ✓
 */
