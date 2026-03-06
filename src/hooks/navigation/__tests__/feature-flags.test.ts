/**
 * Feature Flag Implementation Tests
 *
 * Verifies that all navigation security features respect configuration flags
 * and can be enabled/disabled independently.
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useNavigationGuard } from "../use-navigation-guard";
import { useSessionTimeout } from "../use-session-timeout";
import { useAuthStore } from "@/store/use-auth-store";
import { useFormWizardStore } from "@/components/form-generation/store/use-form-wizard-store";
import type { NavigationConfig } from "@/contexts/NavigationConfigContext";

// Mock dependencies
vi.mock("@/contexts/NavigationConfigContext", () => ({
  getNavigationConfig: vi.fn(),
  useNavigationConfig: vi.fn(),
}));

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

vi.mock("@/hooks/ui/use-toast", () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

vi.mock("@/lib/utils/navigation-toast", () => ({
  showNavigationBlockedToast: vi.fn(),
}));

// Import mocked functions
import {
  getNavigationConfig,
  useNavigationConfig,
} from "@/contexts/NavigationConfigContext";
import { showNavigationBlockedToast } from "@/lib/utils/navigation-toast";

describe("Feature Flag Implementation", () => {
  beforeEach(() => {
    // Reset all stores
    useAuthStore.setState({
      verificationSession: null,
      isAuthenticated: false,
    });

    useFormWizardStore.setState({
      currentStep: 0,
      steps: [],
      otpStepIndex: null,
      visitedSteps: [],
      completedSteps: [],
    });

    // Clear all mocks
    vi.clearAllMocks();
  });

  describe("Configuration Flag: enableBackNavigationBlock", () => {
    it("should allow all navigation when enableBackNavigationBlock is false", () => {
      const config: NavigationConfig = {
        enableBackNavigationBlock: false,
        enableSessionTimeout: false,
        enableUserNotifications: false,
        enableServerValidation: false,
        sessionTimeoutMinutes: 15,
      };

      vi.mocked(getNavigationConfig).mockReturnValue(config);

      // Setup: Create verification session and OTP step
      useAuthStore.setState({
        verificationSession: {
          sessionId: "test-session",
          isLocked: true,
          otpStepIndex: 2,
          verifiedAt: new Date(),
          expiresAt: null,
          lastActivity: new Date(),
        },
      });

      useFormWizardStore.setState({
        currentStep: 3,
        otpStepIndex: 2,
        steps: [{}, {}, {}, {}] as any,
        visitedSteps: [0, 1, 2, 3],
      });

      const { result } = renderHook(() => useNavigationGuard());

      // Should allow back navigation even to pre-OTP steps
      expect(result.current.canGoBack).toBe(true);
      expect(result.current.isNavigationBlocked).toBe(false);
    });

    it("should block navigation when enableBackNavigationBlock is true", () => {
      const config: NavigationConfig = {
        enableBackNavigationBlock: true,
        enableSessionTimeout: false,
        enableUserNotifications: false,
        enableServerValidation: false,
        sessionTimeoutMinutes: 15,
      };

      vi.mocked(getNavigationConfig).mockReturnValue(config);

      // Setup: Create verification session and OTP step
      useAuthStore.setState({
        verificationSession: {
          sessionId: "test-session",
          isLocked: true,
          otpStepIndex: 2,
          verifiedAt: new Date(),
          expiresAt: null,
          lastActivity: new Date(),
        },
      });

      useFormWizardStore.setState({
        currentStep: 3,
        otpStepIndex: 2,
        steps: [{}, {}, {}, {}] as any,
        visitedSteps: [0, 1, 2, 3],
      });

      const { result } = renderHook(() => useNavigationGuard());

      // Should block back navigation to pre-OTP steps
      expect(result.current.canGoBack).toBe(false);
    });
  });

  describe("Configuration Flag: enableUserNotifications", () => {
    it("should not show toast when enableUserNotifications is false", () => {
      const config: NavigationConfig = {
        enableBackNavigationBlock: true,
        enableSessionTimeout: false,
        enableUserNotifications: false,
        enableServerValidation: false,
        sessionTimeoutMinutes: 15,
      };

      vi.mocked(getNavigationConfig).mockReturnValue(config);

      // Setup verification session
      useAuthStore.setState({
        verificationSession: {
          sessionId: "test-session",
          isLocked: true,
          otpStepIndex: 2,
          verifiedAt: new Date(),
          expiresAt: null,
          lastActivity: new Date(),
        },
      });

      useFormWizardStore.setState({
        currentStep: 3,
        otpStepIndex: 2,
        steps: [{}, {}, {}, {}] as any,
        visitedSteps: [0, 1, 2, 3],
      });

      // Register callback
      const registerCallback = vi.fn();
      useFormWizardStore.setState({
        registerBeforeStepChange: registerCallback,
      } as any);

      renderHook(() => useNavigationGuard());

      // Get the registered callback
      const callback = registerCallback.mock.calls[0]?.[0];

      if (callback) {
        // Try to navigate to pre-OTP step
        const allowed = callback(3, 1);
        expect(allowed).toBe(false);
      }

      // Toast should not be called
      expect(showNavigationBlockedToast).not.toHaveBeenCalled();
    });

    it("should show toast when enableUserNotifications is true", () => {
      const config: NavigationConfig = {
        enableBackNavigationBlock: true,
        enableSessionTimeout: false,
        enableUserNotifications: true,
        enableServerValidation: false,
        sessionTimeoutMinutes: 15,
      };

      vi.mocked(getNavigationConfig).mockReturnValue(config);

      // Setup verification session
      useAuthStore.setState({
        verificationSession: {
          sessionId: "test-session",
          isLocked: true,
          otpStepIndex: 2,
          verifiedAt: new Date(),
          expiresAt: null,
          lastActivity: new Date(),
        },
      });

      useFormWizardStore.setState({
        currentStep: 3,
        otpStepIndex: 2,
        steps: [{}, {}, {}, {}] as any,
        visitedSteps: [0, 1, 2, 3],
      });

      // Register callback
      const registerCallback = vi.fn();
      useFormWizardStore.setState({
        registerBeforeStepChange: registerCallback,
      } as any);

      renderHook(() => useNavigationGuard());

      // Get the registered callback
      const callback = registerCallback.mock.calls[0]?.[0];

      if (callback) {
        // Try to navigate to pre-OTP step
        const allowed = callback(3, 1);
        expect(allowed).toBe(false);
      }

      // Toast should be called
      expect(showNavigationBlockedToast).toHaveBeenCalled();
    });
  });

  describe("Configuration Flag: enableSessionTimeout", () => {
    it("should not track timeout when enableSessionTimeout is false", () => {
      const config: NavigationConfig = {
        enableBackNavigationBlock: true,
        enableSessionTimeout: false,
        enableUserNotifications: true,
        enableServerValidation: false,
        sessionTimeoutMinutes: 15,
      };

      vi.mocked(useNavigationConfig).mockReturnValue({
        config,
        updateConfig: vi.fn(),
      });

      // Setup verification session with expiration
      useAuthStore.setState({
        verificationSession: {
          sessionId: "test-session",
          isLocked: true,
          otpStepIndex: 2,
          verifiedAt: new Date(),
          expiresAt: new Date(Date.now() + 60000), // 1 minute from now
          lastActivity: new Date(),
        },
      });

      const { result } = renderHook(() => useSessionTimeout());

      // Should not track time remaining
      expect(result.current.timeRemaining).toBe(null);
      expect(result.current.isExpired).toBe(false);
    });

    it("should track timeout when enableSessionTimeout is true", () => {
      const config: NavigationConfig = {
        enableBackNavigationBlock: true,
        enableSessionTimeout: true,
        enableUserNotifications: true,
        enableServerValidation: false,
        sessionTimeoutMinutes: 15,
      };

      vi.mocked(useNavigationConfig).mockReturnValue({
        config,
        updateConfig: vi.fn(),
      });

      // Setup verification session with expiration
      const expiresAt = new Date(Date.now() + 60000); // 1 minute from now
      useAuthStore.setState({
        verificationSession: {
          sessionId: "test-session",
          isLocked: true,
          otpStepIndex: 2,
          verifiedAt: new Date(),
          expiresAt,
          lastActivity: new Date(),
        },
      });

      const { result } = renderHook(() => useSessionTimeout());

      // Should track time remaining
      expect(result.current.timeRemaining).toBeGreaterThan(0);
      expect(result.current.timeRemaining).toBeLessThanOrEqual(60);
    });
  });

  describe("Gradual Rollout Scenarios", () => {
    it("should work with only back navigation blocking enabled", () => {
      const config: NavigationConfig = {
        enableBackNavigationBlock: true,
        enableSessionTimeout: false,
        enableUserNotifications: false,
        enableServerValidation: false,
        sessionTimeoutMinutes: 15,
      };

      vi.mocked(getNavigationConfig).mockReturnValue(config);

      useAuthStore.setState({
        verificationSession: {
          sessionId: "test-session",
          isLocked: true,
          otpStepIndex: 2,
          verifiedAt: new Date(),
          expiresAt: null,
          lastActivity: new Date(),
        },
      });

      useFormWizardStore.setState({
        currentStep: 3,
        otpStepIndex: 2,
        steps: [{}, {}, {}, {}] as any,
        visitedSteps: [0, 1, 2, 3],
      });

      const { result } = renderHook(() => useNavigationGuard());

      // Navigation blocking works
      expect(result.current.canGoBack).toBe(false);

      // No notifications
      expect(showNavigationBlockedToast).not.toHaveBeenCalled();
    });

    it("should work with all features enabled", () => {
      const config: NavigationConfig = {
        enableBackNavigationBlock: true,
        enableSessionTimeout: true,
        enableUserNotifications: true,
        enableServerValidation: true,
        sessionTimeoutMinutes: 15,
      };

      vi.mocked(getNavigationConfig).mockReturnValue(config);
      vi.mocked(useNavigationConfig).mockReturnValue({
        config,
        updateConfig: vi.fn(),
      });

      const expiresAt = new Date(Date.now() + 60000);
      useAuthStore.setState({
        verificationSession: {
          sessionId: "test-session",
          isLocked: true,
          otpStepIndex: 2,
          verifiedAt: new Date(),
          expiresAt,
          lastActivity: new Date(),
        },
      });

      useFormWizardStore.setState({
        currentStep: 3,
        otpStepIndex: 2,
        steps: [{}, {}, {}, {}] as any,
        visitedSteps: [0, 1, 2, 3],
      });

      const guardResult = renderHook(() => useNavigationGuard());
      const timeoutResult = renderHook(() => useSessionTimeout());

      // All features work
      expect(guardResult.result.current.canGoBack).toBe(false);
      expect(timeoutResult.result.current.timeRemaining).toBeGreaterThan(0);
    });

    it("should work with all features disabled", () => {
      const config: NavigationConfig = {
        enableBackNavigationBlock: false,
        enableSessionTimeout: false,
        enableUserNotifications: false,
        enableServerValidation: false,
        sessionTimeoutMinutes: 15,
      };

      vi.mocked(getNavigationConfig).mockReturnValue(config);
      vi.mocked(useNavigationConfig).mockReturnValue({
        config,
        updateConfig: vi.fn(),
      });

      useAuthStore.setState({
        verificationSession: {
          sessionId: "test-session",
          isLocked: true,
          otpStepIndex: 2,
          verifiedAt: new Date(),
          expiresAt: null,
          lastActivity: new Date(),
        },
      });

      useFormWizardStore.setState({
        currentStep: 3,
        otpStepIndex: 2,
        steps: [{}, {}, {}, {}] as any,
        visitedSteps: [0, 1, 2, 3],
      });

      const guardResult = renderHook(() => useNavigationGuard());
      const timeoutResult = renderHook(() => useSessionTimeout());

      // All features disabled
      expect(guardResult.result.current.canGoBack).toBe(true);
      expect(timeoutResult.result.current.timeRemaining).toBe(null);
      expect(showNavigationBlockedToast).not.toHaveBeenCalled();
    });
  });

  describe("No Errors When Features Disabled", () => {
    it("should not throw errors when navigation guard is disabled", () => {
      const config: NavigationConfig = {
        enableBackNavigationBlock: false,
        enableSessionTimeout: false,
        enableUserNotifications: false,
        enableServerValidation: false,
        sessionTimeoutMinutes: 15,
      };

      vi.mocked(getNavigationConfig).mockReturnValue(config);

      expect(() => {
        renderHook(() => useNavigationGuard());
      }).not.toThrow();
    });

    it("should not throw errors when session timeout is disabled", () => {
      const config: NavigationConfig = {
        enableBackNavigationBlock: false,
        enableSessionTimeout: false,
        enableUserNotifications: false,
        enableServerValidation: false,
        sessionTimeoutMinutes: 15,
      };

      vi.mocked(useNavigationConfig).mockReturnValue({
        config,
        updateConfig: vi.fn(),
      });

      expect(() => {
        renderHook(() => useSessionTimeout());
      }).not.toThrow();
    });

    it("should handle missing verification session gracefully", () => {
      const config: NavigationConfig = {
        enableBackNavigationBlock: true,
        enableSessionTimeout: true,
        enableUserNotifications: true,
        enableServerValidation: false,
        sessionTimeoutMinutes: 15,
      };

      vi.mocked(getNavigationConfig).mockReturnValue(config);
      vi.mocked(useNavigationConfig).mockReturnValue({
        config,
        updateConfig: vi.fn(),
      });

      // No verification session
      useAuthStore.setState({
        verificationSession: null,
      });

      useFormWizardStore.setState({
        currentStep: 3,
        otpStepIndex: 2,
        steps: [{}, {}, {}, {}] as any,
        visitedSteps: [0, 1, 2, 3],
      });

      const guardResult = renderHook(() => useNavigationGuard());
      const timeoutResult = renderHook(() => useSessionTimeout());

      // Should not throw and should allow navigation
      expect(guardResult.result.current.canGoBack).toBe(true);
      expect(timeoutResult.result.current.timeRemaining).toBe(null);
    });
  });
});
