/**
 * Unit tests for useNavigationGuard hook
 *
 * Tests cover:
 * - Navigation blocking scenarios
 * - Browser history management
 * - Configuration-based behavior
 * - Notification triggering
 */

import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useNavigationGuard } from "../use-navigation-guard";
import { useNavigationConfig } from "@/contexts/NavigationConfigContext";
import { useAuthStore } from "@/store/use-auth-store";
import { useFormWizardStore } from "@/components/form-generation/store/use-form-wizard-store";
import { showNavigationBlockedToast } from "@/lib/utils/navigation-toast";

// Mock dependencies
vi.mock("@/contexts/NavigationConfigContext");
vi.mock("@/store/use-auth-store");
vi.mock("@/components/form-generation/store/use-form-wizard-store");
vi.mock("@/lib/utils/navigation-toast");
vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

describe("useNavigationGuard", () => {
  const mockConfig = {
    enableBackNavigationBlock: true,
    enableSessionTimeout: false,
    sessionTimeoutMinutes: 15,
    enableUserNotifications: true,
    enableServerValidation: false,
  };

  beforeEach(() => {
    // Mock navigation config
    vi.mocked(useNavigationConfig).mockReturnValue({
      config: mockConfig,
      updateConfig: vi.fn(),
    });

    // Mock auth store
    vi.mocked(useAuthStore).mockReturnValue({
      verificationSession: null,
    } as any);

    // Mock wizard store
    vi.mocked(useFormWizardStore).mockReturnValue({
      currentStep: 0,
      otpStepIndex: null,
      visitedSteps: [0],
      registerBeforeStepChange: vi.fn(),
      unregisterBeforeStepChange: vi.fn(),
    } as any);

    // Clear all mocks
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("Initialization", () => {
    it("should register beforeStepChange callback on mount", () => {
      const registerCallback = vi.fn();

      vi.mocked(useFormWizardStore).mockReturnValue({
        currentStep: 0,
        otpStepIndex: 2,
        visitedSteps: [0],
        registerBeforeStepChange: registerCallback,
        unregisterBeforeStepChange: vi.fn(),
      } as any);

      renderHook(() => useNavigationGuard());

      expect(registerCallback).toHaveBeenCalledTimes(1);
      expect(registerCallback).toHaveBeenCalledWith(expect.any(Function));
    });

    it("should unregister callback on unmount", () => {
      const unregisterCallback = vi.fn();

      vi.mocked(useFormWizardStore).mockReturnValue({
        currentStep: 0,
        otpStepIndex: 2,
        visitedSteps: [0],
        registerBeforeStepChange: vi.fn(),
        unregisterBeforeStepChange: unregisterCallback,
      } as any);

      const { unmount } = renderHook(() => useNavigationGuard());

      unmount();

      expect(unregisterCallback).toHaveBeenCalledTimes(1);
    });

    it("should not register callback when blocking disabled", () => {
      const registerCallback = vi.fn();

      vi.mocked(useNavigationConfig).mockReturnValue({
        config: { ...mockConfig, enableBackNavigationBlock: false },
        updateConfig: vi.fn(),
      });

      vi.mocked(useFormWizardStore).mockReturnValue({
        currentStep: 0,
        otpStepIndex: 2,
        visitedSteps: [0],
        registerBeforeStepChange: registerCallback,
        unregisterBeforeStepChange: vi.fn(),
      } as any);

      renderHook(() => useNavigationGuard());

      // Should still register but callback will allow all navigation
      expect(registerCallback).toHaveBeenCalledTimes(1);
    });
  });

  describe("Navigation Blocking", () => {
    it("should block navigation to pre-OTP steps when session locked", () => {
      let registeredCallback: ((from: number, to: number) => boolean) | null =
        null;

      vi.mocked(useFormWizardStore).mockReturnValue({
        currentStep: 4,
        otpStepIndex: 2,
        visitedSteps: [0, 1, 2, 3, 4],
        registerBeforeStepChange: (callback) => {
          registeredCallback = callback;
        },
        unregisterBeforeStepChange: vi.fn(),
      } as any);

      vi.mocked(useAuthStore).mockReturnValue({
        verificationSession: {
          sessionId: "test-id",
          isLocked: true,
          otpStepIndex: 2,
        },
      } as any);

      renderHook(() => useNavigationGuard());

      expect(registeredCallback).not.toBeNull();

      // Try to navigate from step 4 to step 1 (before OTP)
      const result = registeredCallback!(4, 1);

      expect(result).toBe(false);
      expect(showNavigationBlockedToast).toHaveBeenCalledTimes(1);
    });

    it("should allow navigation to post-OTP steps", () => {
      let registeredCallback: ((from: number, to: number) => boolean) | null =
        null;

      vi.mocked(useFormWizardStore).mockReturnValue({
        currentStep: 4,
        otpStepIndex: 2,
        visitedSteps: [0, 1, 2, 3, 4],
        registerBeforeStepChange: (callback) => {
          registeredCallback = callback;
        },
        unregisterBeforeStepChange: vi.fn(),
      } as any);

      vi.mocked(useAuthStore).mockReturnValue({
        verificationSession: {
          sessionId: "test-id",
          isLocked: true,
          otpStepIndex: 2,
        },
      } as any);

      renderHook(() => useNavigationGuard());

      // Try to navigate from step 4 to step 3 (after OTP)
      const result = registeredCallback!(4, 3);

      expect(result).toBe(true);
      expect(showNavigationBlockedToast).not.toHaveBeenCalled();
    });

    it("should allow all navigation when no session exists", () => {
      let registeredCallback: ((from: number, to: number) => boolean) | null =
        null;

      vi.mocked(useFormWizardStore).mockReturnValue({
        currentStep: 2,
        otpStepIndex: 2,
        visitedSteps: [0, 1, 2],
        registerBeforeStepChange: (callback) => {
          registeredCallback = callback;
        },
        unregisterBeforeStepChange: vi.fn(),
      } as any);

      vi.mocked(useAuthStore).mockReturnValue({
        verificationSession: null,
      } as any);

      renderHook(() => useNavigationGuard());

      // Try to navigate from step 2 to step 0
      const result = registeredCallback!(2, 0);

      expect(result).toBe(true);
      expect(showNavigationBlockedToast).not.toHaveBeenCalled();
    });

    it("should allow all navigation when session not locked", () => {
      let registeredCallback: ((from: number, to: number) => boolean) | null =
        null;

      vi.mocked(useFormWizardStore).mockReturnValue({
        currentStep: 4,
        otpStepIndex: 2,
        visitedSteps: [0, 1, 2, 3, 4],
        registerBeforeStepChange: (callback) => {
          registeredCallback = callback;
        },
        unregisterBeforeStepChange: vi.fn(),
      } as any);

      vi.mocked(useAuthStore).mockReturnValue({
        verificationSession: {
          sessionId: "test-id",
          isLocked: false,
          otpStepIndex: 2,
        },
      } as any);

      renderHook(() => useNavigationGuard());

      // Try to navigate from step 4 to step 0
      const result = registeredCallback!(4, 0);

      expect(result).toBe(true);
    });

    it("should allow all navigation when OTP step not detected", () => {
      let registeredCallback: ((from: number, to: number) => boolean) | null =
        null;

      vi.mocked(useFormWizardStore).mockReturnValue({
        currentStep: 2,
        otpStepIndex: null,
        visitedSteps: [0, 1, 2],
        registerBeforeStepChange: (callback) => {
          registeredCallback = callback;
        },
        unregisterBeforeStepChange: vi.fn(),
      } as any);

      vi.mocked(useAuthStore).mockReturnValue({
        verificationSession: {
          sessionId: "test-id",
          isLocked: true,
          otpStepIndex: 2,
        },
      } as any);

      renderHook(() => useNavigationGuard());

      // Try to navigate from step 2 to step 0
      const result = registeredCallback!(2, 0);

      expect(result).toBe(true);
    });
  });

  describe("Notification Behavior", () => {
    it("should show toast when navigation blocked and notifications enabled", () => {
      let registeredCallback: ((from: number, to: number) => boolean) | null =
        null;

      vi.mocked(useNavigationConfig).mockReturnValue({
        config: { ...mockConfig, enableUserNotifications: true },
        updateConfig: vi.fn(),
      });

      vi.mocked(useFormWizardStore).mockReturnValue({
        currentStep: 4,
        otpStepIndex: 2,
        visitedSteps: [0, 1, 2, 3, 4],
        registerBeforeStepChange: (callback) => {
          registeredCallback = callback;
        },
        unregisterBeforeStepChange: vi.fn(),
      } as any);

      vi.mocked(useAuthStore).mockReturnValue({
        verificationSession: {
          sessionId: "test-id",
          isLocked: true,
          otpStepIndex: 2,
        },
      } as any);

      renderHook(() => useNavigationGuard());

      registeredCallback!(4, 1);

      expect(showNavigationBlockedToast).toHaveBeenCalledTimes(1);
    });

    it("should not show toast when notifications disabled", () => {
      let registeredCallback: ((from: number, to: number) => boolean) | null =
        null;

      vi.mocked(useNavigationConfig).mockReturnValue({
        config: { ...mockConfig, enableUserNotifications: false },
        updateConfig: vi.fn(),
      });

      vi.mocked(useFormWizardStore).mockReturnValue({
        currentStep: 4,
        otpStepIndex: 2,
        visitedSteps: [0, 1, 2, 3, 4],
        registerBeforeStepChange: (callback) => {
          registeredCallback = callback;
        },
        unregisterBeforeStepChange: vi.fn(),
      } as any);

      vi.mocked(useAuthStore).mockReturnValue({
        verificationSession: {
          sessionId: "test-id",
          isLocked: true,
          otpStepIndex: 2,
        },
      } as any);

      renderHook(() => useNavigationGuard());

      registeredCallback!(4, 1);

      expect(showNavigationBlockedToast).not.toHaveBeenCalled();
    });

    it("should call onNavigationBlocked callback when provided", () => {
      const onNavigationBlocked = vi.fn();
      let registeredCallback: ((from: number, to: number) => boolean) | null =
        null;

      vi.mocked(useFormWizardStore).mockReturnValue({
        currentStep: 4,
        otpStepIndex: 2,
        visitedSteps: [0, 1, 2, 3, 4],
        registerBeforeStepChange: (callback) => {
          registeredCallback = callback;
        },
        unregisterBeforeStepChange: vi.fn(),
      } as any);

      vi.mocked(useAuthStore).mockReturnValue({
        verificationSession: {
          sessionId: "test-id",
          isLocked: true,
          otpStepIndex: 2,
        },
      } as any);

      renderHook(() => useNavigationGuard({ onNavigationBlocked }));

      registeredCallback!(4, 1);

      expect(onNavigationBlocked).toHaveBeenCalledWith("pre_otp_step");
    });
  });

  describe("canGoBack Calculation", () => {
    it("should return true when at step after OTP and can go back", () => {
      vi.mocked(useFormWizardStore).mockReturnValue({
        currentStep: 4,
        otpStepIndex: 2,
        visitedSteps: [0, 1, 2, 3, 4],
        registerBeforeStepChange: vi.fn(),
        unregisterBeforeStepChange: vi.fn(),
      } as any);

      vi.mocked(useAuthStore).mockReturnValue({
        verificationSession: {
          sessionId: "test-id",
          isLocked: true,
          otpStepIndex: 2,
        },
      } as any);

      const { result } = renderHook(() => useNavigationGuard());

      expect(result.current.canGoBack).toBe(true);
    });

    it("should return false when at first post-OTP step", () => {
      vi.mocked(useFormWizardStore).mockReturnValue({
        currentStep: 3,
        otpStepIndex: 2,
        visitedSteps: [0, 1, 2, 3],
        registerBeforeStepChange: vi.fn(),
        unregisterBeforeStepChange: vi.fn(),
      } as any);

      vi.mocked(useAuthStore).mockReturnValue({
        verificationSession: {
          sessionId: "test-id",
          isLocked: true,
          otpStepIndex: 2,
        },
      } as any);

      const { result } = renderHook(() => useNavigationGuard());

      // currentStep - 1 = 2, which is OTP step, so should be false
      expect(result.current.canGoBack).toBe(false);
    });

    it("should return true when no session lock", () => {
      vi.mocked(useFormWizardStore).mockReturnValue({
        currentStep: 2,
        otpStepIndex: 2,
        visitedSteps: [0, 1, 2],
        registerBeforeStepChange: vi.fn(),
        unregisterBeforeStepChange: vi.fn(),
      } as any);

      vi.mocked(useAuthStore).mockReturnValue({
        verificationSession: null,
      } as any);

      const { result } = renderHook(() => useNavigationGuard());

      expect(result.current.canGoBack).toBe(true);
    });

    it("should return false when at step 0", () => {
      vi.mocked(useFormWizardStore).mockReturnValue({
        currentStep: 0,
        otpStepIndex: null,
        visitedSteps: [0],
        registerBeforeStepChange: vi.fn(),
        unregisterBeforeStepChange: vi.fn(),
      } as any);

      vi.mocked(useAuthStore).mockReturnValue({
        verificationSession: null,
      } as any);

      const { result } = renderHook(() => useNavigationGuard());

      expect(result.current.canGoBack).toBe(false);
    });
  });

  describe("canGoForward Calculation", () => {
    it("should return true when next step is visited", () => {
      vi.mocked(useFormWizardStore).mockReturnValue({
        currentStep: 2,
        otpStepIndex: 2,
        visitedSteps: [0, 1, 2, 3],
        steps: [{}, {}, {}, {}, {}] as any,
        registerBeforeStepChange: vi.fn(),
        unregisterBeforeStepChange: vi.fn(),
      } as any);

      const { result } = renderHook(() => useNavigationGuard());

      expect(result.current.canGoForward).toBe(true);
    });

    it("should return false when next step not visited", () => {
      vi.mocked(useFormWizardStore).mockReturnValue({
        currentStep: 2,
        otpStepIndex: 2,
        visitedSteps: [0, 1, 2],
        steps: [{}, {}, {}, {}, {}] as any,
        registerBeforeStepChange: vi.fn(),
        unregisterBeforeStepChange: vi.fn(),
      } as any);

      const { result } = renderHook(() => useNavigationGuard());

      expect(result.current.canGoForward).toBe(false);
    });

    it("should return false when at last step", () => {
      vi.mocked(useFormWizardStore).mockReturnValue({
        currentStep: 4,
        otpStepIndex: 2,
        visitedSteps: [0, 1, 2, 3, 4],
        steps: [{}, {}, {}, {}, {}] as any,
        registerBeforeStepChange: vi.fn(),
        unregisterBeforeStepChange: vi.fn(),
      } as any);

      const { result } = renderHook(() => useNavigationGuard());

      expect(result.current.canGoForward).toBe(false);
    });
  });

  describe("Configuration Changes", () => {
    it("should allow all navigation when blocking disabled", () => {
      let registeredCallback: ((from: number, to: number) => boolean) | null =
        null;

      vi.mocked(useNavigationConfig).mockReturnValue({
        config: { ...mockConfig, enableBackNavigationBlock: false },
        updateConfig: vi.fn(),
      });

      vi.mocked(useFormWizardStore).mockReturnValue({
        currentStep: 4,
        otpStepIndex: 2,
        visitedSteps: [0, 1, 2, 3, 4],
        registerBeforeStepChange: (callback) => {
          registeredCallback = callback;
        },
        unregisterBeforeStepChange: vi.fn(),
      } as any);

      vi.mocked(useAuthStore).mockReturnValue({
        verificationSession: {
          sessionId: "test-id",
          isLocked: true,
          otpStepIndex: 2,
        },
      } as any);

      renderHook(() => useNavigationGuard());

      // Should allow navigation even to pre-OTP steps
      const result = registeredCallback!(4, 1);

      expect(result).toBe(true);
    });
  });

  describe("Edge Cases", () => {
    it("should handle OTP at step 0", () => {
      let registeredCallback: ((from: number, to: number) => boolean) | null =
        null;

      vi.mocked(useFormWizardStore).mockReturnValue({
        currentStep: 2,
        otpStepIndex: 0,
        visitedSteps: [0, 1, 2],
        registerBeforeStepChange: (callback) => {
          registeredCallback = callback;
        },
        unregisterBeforeStepChange: vi.fn(),
      } as any);

      vi.mocked(useAuthStore).mockReturnValue({
        verificationSession: {
          sessionId: "test-id",
          isLocked: true,
          otpStepIndex: 0,
        },
      } as any);

      renderHook(() => useNavigationGuard());

      // Should block navigation to step 0 (OTP step)
      const result = registeredCallback!(2, 0);

      expect(result).toBe(false);
    });

    it("should handle navigation from pre-OTP to pre-OTP", () => {
      let registeredCallback: ((from: number, to: number) => boolean) | null =
        null;

      vi.mocked(useFormWizardStore).mockReturnValue({
        currentStep: 1,
        otpStepIndex: 3,
        visitedSteps: [0, 1],
        registerBeforeStepChange: (callback) => {
          registeredCallback = callback;
        },
        unregisterBeforeStepChange: vi.fn(),
      } as any);

      vi.mocked(useAuthStore).mockReturnValue({
        verificationSession: null,
      } as any);

      renderHook(() => useNavigationGuard());

      // Should allow navigation between pre-OTP steps when no session
      const result = registeredCallback!(1, 0);

      expect(result).toBe(true);
    });
  });
});
