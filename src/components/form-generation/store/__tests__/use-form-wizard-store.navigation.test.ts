/**
 * Unit tests for Form Wizard Store navigation and OTP detection
 *
 * Tests cover:
 * - OTP step detection
 * - beforeStepChange callback
 * - canNavigateToStep() with session lock
 * - Navigation history tracking
 * - Wizard reset clears OTP index
 */

import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { useFormWizardStore } from "../use-form-wizard-store";
import { useAuthStore } from "@/store/use-auth-store";
import type { FormStep } from "../../types";
import type { NavigationConfig } from "@/contexts/NavigationConfigContext";

// Mock auth store
vi.mock("@/store/use-auth-store", () => ({
  useAuthStore: {
    getState: vi.fn(),
    setState: vi.fn(),
    subscribe: vi.fn(),
  },
}));

describe("Form Wizard Store - Navigation & OTP Detection", () => {
  const mockSteps: FormStep[] = [
    {
      id: "step-1",
      title: "Personal Info",
      description: "Enter your personal information",
      fields: [],
    },
    {
      id: "step-2",
      title: "Contact Info",
      description: "Enter your contact information",
      fields: [],
    },
    {
      id: "step-3",
      title: "OTP Verification",
      description: "Verify your phone number",
      fields: [],
      sendOtp: true, // OTP step
    },
    {
      id: "step-4",
      title: "Additional Info",
      description: "Additional information",
      fields: [],
    },
    {
      id: "step-5",
      title: "Review",
      description: "Review your information",
      fields: [],
    },
  ];

  beforeEach(() => {
    // Reset wizard store
    useFormWizardStore.getState().resetWizard();

    // Mock auth store to return no session by default
    vi.mocked(useAuthStore.getState).mockReturnValue({
      verificationSession: null,
      canNavigateBack: () => true,
      getSessionLock: () => false,
    } as any);

    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("OTP Step Detection", () => {
    it("should detect OTP step from flow configuration", () => {
      useFormWizardStore.getState().initWizard("test-wizard", mockSteps);

      const otpStepIndex = useFormWizardStore.getState().detectOTPStep();

      expect(otpStepIndex).toBe(2); // Step 3 is at index 2
      expect(useFormWizardStore.getState().otpStepIndex).toBe(2);
    });

    it("should return null when no OTP step exists", () => {
      const stepsWithoutOTP: FormStep[] = [
        { id: "step-1", title: "Step 1", fields: [] },
        { id: "step-2", title: "Step 2", fields: [] },
      ];

      useFormWizardStore.getState().initWizard("test-wizard", stepsWithoutOTP);

      const otpStepIndex = useFormWizardStore.getState().detectOTPStep();

      expect(otpStepIndex).toBe(-1);
      expect(useFormWizardStore.getState().otpStepIndex).toBeNull();
    });

    it("should detect first OTP step when multiple exist", () => {
      const stepsWithMultipleOTP: FormStep[] = [
        { id: "step-1", title: "Step 1", fields: [] },
        { id: "step-2", title: "OTP 1", fields: [], sendOtp: true },
        { id: "step-3", title: "Step 3", fields: [] },
        { id: "step-4", title: "OTP 2", fields: [], sendOtp: true },
      ];

      useFormWizardStore
        .getState()
        .initWizard("test-wizard", stepsWithMultipleOTP);

      const otpStepIndex = useFormWizardStore.getState().detectOTPStep();

      expect(otpStepIndex).toBe(1); // First OTP step at index 1
    });

    it("should detect OTP step at first position", () => {
      const stepsWithOTPFirst: FormStep[] = [
        { id: "step-1", title: "OTP", fields: [], sendOtp: true },
        { id: "step-2", title: "Step 2", fields: [] },
      ];

      useFormWizardStore
        .getState()
        .initWizard("test-wizard", stepsWithOTPFirst);

      const otpStepIndex = useFormWizardStore.getState().detectOTPStep();

      expect(otpStepIndex).toBe(0);
    });

    it("should detect OTP step at last position", () => {
      const stepsWithOTPLast: FormStep[] = [
        { id: "step-1", title: "Step 1", fields: [] },
        { id: "step-2", title: "Step 2", fields: [] },
        { id: "step-3", title: "OTP", fields: [], sendOtp: true },
      ];

      useFormWizardStore.getState().initWizard("test-wizard", stepsWithOTPLast);

      const otpStepIndex = useFormWizardStore.getState().detectOTPStep();

      expect(otpStepIndex).toBe(2);
    });

    it("should handle empty steps array", () => {
      useFormWizardStore.getState().initWizard("test-wizard", []);

      const otpStepIndex = useFormWizardStore.getState().detectOTPStep();

      expect(otpStepIndex).toBe(-1);
      expect(useFormWizardStore.getState().otpStepIndex).toBeNull();
    });
  });

  describe("beforeStepChange Callback", () => {
    it("should register beforeStepChange callback", () => {
      const callback = vi.fn(() => true);

      useFormWizardStore.getState().registerBeforeStepChange(callback);

      expect(useFormWizardStore.getState().beforeStepChangeCallback).toBe(
        callback,
      );
    });

    it("should unregister beforeStepChange callback", () => {
      const callback = vi.fn(() => true);

      useFormWizardStore.getState().registerBeforeStepChange(callback);
      expect(useFormWizardStore.getState().beforeStepChangeCallback).toBe(
        callback,
      );

      useFormWizardStore.getState().unregisterBeforeStepChange();
      expect(useFormWizardStore.getState().beforeStepChangeCallback).toBeNull();
    });

    it("should call beforeStepChange callback when navigating", () => {
      const callback = vi.fn(() => true);

      useFormWizardStore.getState().initWizard("test-wizard", mockSteps);
      useFormWizardStore.getState().registerBeforeStepChange(callback);

      useFormWizardStore.getState().goToStep(1);

      expect(callback).toHaveBeenCalledWith(0, 1);
    });

    it("should block navigation when callback returns false", () => {
      const callback = vi.fn(() => false);

      useFormWizardStore.getState().initWizard("test-wizard", mockSteps);
      useFormWizardStore.getState().registerBeforeStepChange(callback);

      const initialStep = useFormWizardStore.getState().currentStep;
      useFormWizardStore.getState().goToStep(1);

      expect(callback).toHaveBeenCalledWith(0, 1);
      expect(useFormWizardStore.getState().currentStep).toBe(initialStep);
    });

    it("should allow navigation when callback returns true", () => {
      const callback = vi.fn(() => true);

      useFormWizardStore.getState().initWizard("test-wizard", mockSteps);
      useFormWizardStore.getState().registerBeforeStepChange(callback);

      useFormWizardStore.getState().goToStep(1);

      expect(callback).toHaveBeenCalledWith(0, 1);
      expect(useFormWizardStore.getState().currentStep).toBe(1);
    });

    it("should not call callback when navigating to same step", () => {
      const callback = vi.fn(() => true);

      useFormWizardStore.getState().initWizard("test-wizard", mockSteps);
      useFormWizardStore.getState().registerBeforeStepChange(callback);

      useFormWizardStore.getState().goToStep(0);

      expect(callback).not.toHaveBeenCalled();
    });
  });

  describe("canNavigateToStep() with Session Lock", () => {
    beforeEach(() => {
      useFormWizardStore.getState().initWizard("test-wizard", mockSteps);
      useFormWizardStore.getState().detectOTPStep();
    });

    it("should allow navigation when no session lock exists", () => {
      vi.mocked(useAuthStore.getState).mockReturnValue({
        verificationSession: null,
        canNavigateBack: () => true,
        getSessionLock: () => false,
      } as any);

      const canNavigate = useFormWizardStore.getState().canNavigateToStep(1);

      expect(canNavigate).toBe(true);
    });

    it("should block navigation to pre-OTP steps when session locked", () => {
      vi.mocked(useAuthStore.getState).mockReturnValue({
        verificationSession: {
          sessionId: "test-id",
          isLocked: true,
          otpStepIndex: 2,
        },
        canNavigateBack: (targetIndex: number) => targetIndex > 2,
        getSessionLock: () => true,
      } as any);

      // Try to navigate to step 0 (before OTP)
      const canNavigate0 = useFormWizardStore.getState().canNavigateToStep(0);
      expect(canNavigate0).toBe(false);

      // Try to navigate to step 1 (before OTP)
      const canNavigate1 = useFormWizardStore.getState().canNavigateToStep(1);
      expect(canNavigate1).toBe(false);

      // Try to navigate to step 2 (OTP step itself)
      const canNavigate2 = useFormWizardStore.getState().canNavigateToStep(2);
      expect(canNavigate2).toBe(false);
    });

    it("should allow navigation to post-OTP steps when session locked", () => {
      vi.mocked(useAuthStore.getState).mockReturnValue({
        verificationSession: {
          sessionId: "test-id",
          isLocked: true,
          otpStepIndex: 2,
        },
        canNavigateBack: (targetIndex: number) => targetIndex > 2,
        getSessionLock: () => true,
      } as any);

      // Try to navigate to step 3 (after OTP)
      const canNavigate3 = useFormWizardStore.getState().canNavigateToStep(3);
      expect(canNavigate3).toBe(true);

      // Try to navigate to step 4 (after OTP)
      const canNavigate4 = useFormWizardStore.getState().canNavigateToStep(4);
      expect(canNavigate4).toBe(true);
    });

    it("should respect beforeStepChange callback with session lock", () => {
      const callback = vi.fn(() => false);

      vi.mocked(useAuthStore.getState).mockReturnValue({
        verificationSession: null,
        canNavigateBack: () => true,
        getSessionLock: () => false,
      } as any);

      useFormWizardStore.getState().registerBeforeStepChange(callback);

      const canNavigate = useFormWizardStore.getState().canNavigateToStep(1);

      expect(canNavigate).toBe(false);
      expect(callback).toHaveBeenCalledWith(0, 1);
    });

    it("should check both callback and session lock", () => {
      const callback = vi.fn(() => true);

      vi.mocked(useAuthStore.getState).mockReturnValue({
        verificationSession: {
          sessionId: "test-id",
          isLocked: true,
          otpStepIndex: 2,
        },
        canNavigateBack: (targetIndex: number) => targetIndex > 2,
        getSessionLock: () => true,
      } as any);

      useFormWizardStore.getState().registerBeforeStepChange(callback);

      // Callback allows, but session lock blocks
      const canNavigate = useFormWizardStore.getState().canNavigateToStep(1);

      expect(callback).toHaveBeenCalledWith(0, 1);
      expect(canNavigate).toBe(false);
    });

    it("should allow navigation to visited steps", () => {
      useFormWizardStore.setState({
        visitedSteps: [0, 1, 2, 3],
      });

      vi.mocked(useAuthStore.getState).mockReturnValue({
        verificationSession: {
          sessionId: "test-id",
          isLocked: true,
          otpStepIndex: 2,
        },
        canNavigateBack: (targetIndex: number) => targetIndex > 2,
        getSessionLock: () => true,
      } as any);

      // Step 3 is visited and after OTP
      const canNavigate = useFormWizardStore.getState().canNavigateToStep(3);

      expect(canNavigate).toBe(true);
    });

    it("should block navigation to unvisited steps", () => {
      useFormWizardStore.setState({
        visitedSteps: [0, 1, 2],
        currentStep: 2,
      });

      vi.mocked(useAuthStore.getState).mockReturnValue({
        verificationSession: null,
        canNavigateBack: () => true,
        getSessionLock: () => false,
      } as any);

      // Step 4 is not visited
      const canNavigate = useFormWizardStore.getState().canNavigateToStep(4);

      expect(canNavigate).toBe(false);
    });
  });

  describe("Navigation History Tracking", () => {
    beforeEach(() => {
      useFormWizardStore.getState().initWizard("test-wizard", mockSteps);
    });

    it("should track navigation history", () => {
      useFormWizardStore.getState().addToNavigationHistory(0);
      useFormWizardStore.getState().addToNavigationHistory(1);
      useFormWizardStore.getState().addToNavigationHistory(2);

      const history = useFormWizardStore.getState().getNavigationHistory();

      expect(history).toEqual([0, 1, 2]);
    });

    it("should not add duplicate consecutive steps to history", () => {
      useFormWizardStore.getState().addToNavigationHistory(0);
      useFormWizardStore.getState().addToNavigationHistory(0);
      useFormWizardStore.getState().addToNavigationHistory(1);

      const history = useFormWizardStore.getState().getNavigationHistory();

      expect(history).toEqual([0, 1]);
    });

    it("should allow non-consecutive duplicates in history", () => {
      useFormWizardStore.getState().addToNavigationHistory(0);
      useFormWizardStore.getState().addToNavigationHistory(1);
      useFormWizardStore.getState().addToNavigationHistory(0);

      const history = useFormWizardStore.getState().getNavigationHistory();

      expect(history).toEqual([0, 1, 0]);
    });

    it("should clear navigation history", () => {
      useFormWizardStore.getState().addToNavigationHistory(0);
      useFormWizardStore.getState().addToNavigationHistory(1);

      useFormWizardStore.getState().clearNavigationHistory();

      const history = useFormWizardStore.getState().getNavigationHistory();

      expect(history).toEqual([]);
    });

    it("should add to history when navigating with goToStep", () => {
      useFormWizardStore.getState().goToStep(1);
      useFormWizardStore.getState().goToStep(2);

      const history = useFormWizardStore.getState().getNavigationHistory();

      expect(history).toContain(1);
      expect(history).toContain(2);
    });
  });

  describe("Wizard Reset", () => {
    it("should clear OTP step index on reset", () => {
      useFormWizardStore.getState().initWizard("test-wizard", mockSteps);
      useFormWizardStore.getState().detectOTPStep();

      expect(useFormWizardStore.getState().otpStepIndex).toBe(2);

      useFormWizardStore.getState().resetWizard();

      expect(useFormWizardStore.getState().otpStepIndex).toBeNull();
    });

    it("should clear beforeStepChange callback on reset", () => {
      const callback = vi.fn(() => true);

      useFormWizardStore.getState().registerBeforeStepChange(callback);
      expect(useFormWizardStore.getState().beforeStepChangeCallback).toBe(
        callback,
      );

      useFormWizardStore.getState().resetWizard();

      expect(useFormWizardStore.getState().beforeStepChangeCallback).toBeNull();
    });

    it("should clear navigation history on reset", () => {
      useFormWizardStore.getState().addToNavigationHistory(0);
      useFormWizardStore.getState().addToNavigationHistory(1);

      useFormWizardStore.getState().resetWizard();

      const history = useFormWizardStore.getState().getNavigationHistory();

      expect(history).toEqual([]);
    });

    it("should reset current step to 0", () => {
      useFormWizardStore.getState().initWizard("test-wizard", mockSteps);
      useFormWizardStore.getState().goToStep(3);

      expect(useFormWizardStore.getState().currentStep).toBe(3);

      useFormWizardStore.getState().resetWizard();

      expect(useFormWizardStore.getState().currentStep).toBe(0);
    });

    it("should clear all wizard state on reset", () => {
      useFormWizardStore.getState().initWizard("test-wizard", mockSteps);
      useFormWizardStore.getState().detectOTPStep();
      useFormWizardStore.getState().goToStep(2);

      useFormWizardStore.getState().resetWizard();

      const state = useFormWizardStore.getState();

      expect(state.wizardId).toBe("");
      expect(state.steps).toEqual([]);
      expect(state.currentStep).toBe(0);
      expect(state.otpStepIndex).toBeNull();
      expect(state.visitedSteps).toEqual([]);
      expect(state.completedSteps).toEqual([]);
    });
  });

  describe("Edge Cases", () => {
    it("should handle wizard with single step", () => {
      const singleStep: FormStep[] = [
        { id: "step-1", title: "Only Step", fields: [], sendOtp: true },
      ];

      useFormWizardStore.getState().initWizard("test-wizard", singleStep);

      const otpStepIndex = useFormWizardStore.getState().detectOTPStep();

      expect(otpStepIndex).toBe(0);
    });

    it("should handle navigation with locked steps", () => {
      const stepsWithLocked: FormStep[] = [
        { id: "step-1", title: "Step 1", fields: [] },
        { id: "step-2", title: "Step 2", fields: [], locked: true },
        { id: "step-3", title: "OTP", fields: [], sendOtp: true },
      ];

      useFormWizardStore.getState().initWizard("test-wizard", stepsWithLocked);
      useFormWizardStore.getState().detectOTPStep();

      // Locked step should still be navigable if visited
      useFormWizardStore.setState({ visitedSteps: [0, 1, 2] });

      const canNavigate = useFormWizardStore.getState().canNavigateToStep(1);

      expect(canNavigate).toBe(true);
    });

    it("should handle re-initialization with different steps", () => {
      useFormWizardStore.getState().initWizard("test-wizard", mockSteps);
      useFormWizardStore.getState().detectOTPStep();

      expect(useFormWizardStore.getState().otpStepIndex).toBe(2);

      const newSteps: FormStep[] = [
        { id: "new-1", title: "New Step 1", fields: [] },
        { id: "new-2", title: "New OTP", fields: [], sendOtp: true },
      ];

      useFormWizardStore.getState().initWizard("new-wizard", newSteps);
      useFormWizardStore.getState().detectOTPStep();

      expect(useFormWizardStore.getState().otpStepIndex).toBe(1);
    });

    it("should handle callback that throws error", () => {
      const callback = vi.fn(() => {
        throw new Error("Callback error");
      });

      useFormWizardStore.getState().initWizard("test-wizard", mockSteps);
      useFormWizardStore.getState().registerBeforeStepChange(callback);

      expect(() => {
        useFormWizardStore.getState().goToStep(1);
      }).toThrow("Callback error");
    });
  });
});
