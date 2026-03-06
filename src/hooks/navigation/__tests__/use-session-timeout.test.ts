/**
 * Unit tests for useSessionTimeout hook
 *
 * Tests cover:
 * - Session timeout with activity tracking
 * - Timeout checking intervals
 * - Activity debouncing
 * - Session expiration handling
 */

import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useSessionTimeout } from "../use-session-timeout";
import { useNavigationConfig } from "@/contexts/NavigationConfigContext";
import { useAuthStore } from "@/store/use-auth-store";
import { useFormWizardStore } from "@/components/form-generation/store/use-form-wizard-store";
import { toast } from "sonner";

// Mock dependencies
vi.mock("@/contexts/NavigationConfigContext");
vi.mock("@/store/use-auth-store");
vi.mock("@/components/form-generation/store/use-form-wizard-store");
vi.mock("sonner");
vi.mock("next-intl", () => ({
  useTranslations: () => (key: string, params?: any) =>
    params ? `${key} ${JSON.stringify(params)}` : key,
}));

describe("useSessionTimeout", () => {
  const mockConfig = {
    enableSessionTimeout: true,
    sessionTimeoutMinutes: 15,
    enableBackNavigationBlock: true,
    enableUserNotifications: true,
    enableServerValidation: false,
  };

  const mockAuthStore = {
    verificationSession: null,
    updateSessionActivity: vi.fn(),
    clearVerificationSession: vi.fn(),
  };

  const mockWizardStore = {
    goToStep: vi.fn(),
  };

  beforeEach(() => {
    vi.useFakeTimers();

    vi.mocked(useNavigationConfig).mockReturnValue({
      config: mockConfig,
      updateConfig: vi.fn(),
    });

    vi.mocked(useAuthStore).mockReturnValue(mockAuthStore as any);
    vi.mocked(useFormWizardStore).mockReturnValue(mockWizardStore as any);

    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  describe("Initialization", () => {
    it("should return null timeRemaining when timeout disabled", () => {
      vi.mocked(useNavigationConfig).mockReturnValue({
        config: { ...mockConfig, enableSessionTimeout: false },
        updateConfig: vi.fn(),
      });

      const { result } = renderHook(() => useSessionTimeout());

      expect(result.current.timeRemaining).toBeNull();
      expect(result.current.isExpired).toBe(false);
    });

    it("should return null timeRemaining when no session exists", () => {
      vi.mocked(useAuthStore).mockReturnValue({
        ...mockAuthStore,
        verificationSession: null,
      } as any);

      const { result } = renderHook(() => useSessionTimeout());

      expect(result.current.timeRemaining).toBeNull();
    });

    it("should calculate initial timeRemaining from session", () => {
      const expiresAt = new Date(Date.now() + 900000); // 15 minutes from now

      vi.mocked(useAuthStore).mockReturnValue({
        ...mockAuthStore,
        verificationSession: {
          sessionId: "test-id",
          isLocked: true,
          otpStepIndex: 2,
          verifiedAt: new Date(),
          expiresAt,
          lastActivity: new Date(),
        },
      } as any);

      const { result } = renderHook(() => useSessionTimeout());

      expect(result.current.timeRemaining).toBeGreaterThan(890);
      expect(result.current.timeRemaining).toBeLessThanOrEqual(900);
    });
  });

  describe("Timeout Checking", () => {
    it("should check timeout at specified interval", () => {
      const expiresAt = new Date(Date.now() + 900000);

      vi.mocked(useAuthStore).mockReturnValue({
        ...mockAuthStore,
        verificationSession: {
          sessionId: "test-id",
          isLocked: true,
          otpStepIndex: 2,
          verifiedAt: new Date(),
          expiresAt,
          lastActivity: new Date(),
        },
      } as any);

      const { result } = renderHook(() =>
        useSessionTimeout({ checkInterval: 5000 }),
      );

      const initialTime = result.current.timeRemaining;

      // Advance time by 5 seconds
      act(() => {
        vi.advanceTimersByTime(5000);
      });

      // Time remaining should decrease
      expect(result.current.timeRemaining).toBeLessThan(initialTime!);
    });

    it("should use default check interval of 10 seconds", () => {
      const expiresAt = new Date(Date.now() + 900000);

      vi.mocked(useAuthStore).mockReturnValue({
        ...mockAuthStore,
        verificationSession: {
          sessionId: "test-id",
          isLocked: true,
          otpStepIndex: 2,
          verifiedAt: new Date(),
          expiresAt,
          lastActivity: new Date(),
        },
      } as any);

      const { result } = renderHook(() => useSessionTimeout());

      const initialTime = result.current.timeRemaining;

      // Advance time by 10 seconds
      act(() => {
        vi.advanceTimersByTime(10000);
      });

      expect(result.current.timeRemaining).toBeLessThan(initialTime!);
    });

    it("should clear interval on unmount", () => {
      const expiresAt = new Date(Date.now() + 900000);

      vi.mocked(useAuthStore).mockReturnValue({
        ...mockAuthStore,
        verificationSession: {
          sessionId: "test-id",
          isLocked: true,
          otpStepIndex: 2,
          verifiedAt: new Date(),
          expiresAt,
          lastActivity: new Date(),
        },
      } as any);

      const { unmount } = renderHook(() => useSessionTimeout());

      const clearIntervalSpy = vi.spyOn(global, "clearInterval");

      unmount();

      expect(clearIntervalSpy).toHaveBeenCalled();
    });
  });

  describe("Session Expiration", () => {
    it("should detect expired session", () => {
      const expiresAt = new Date(Date.now() - 1000); // Expired 1 second ago

      vi.mocked(useAuthStore).mockReturnValue({
        ...mockAuthStore,
        verificationSession: {
          sessionId: "test-id",
          isLocked: true,
          otpStepIndex: 2,
          verifiedAt: new Date(),
          expiresAt,
          lastActivity: new Date(),
        },
      } as any);

      const { result } = renderHook(() => useSessionTimeout());

      // Advance time to trigger check
      act(() => {
        vi.advanceTimersByTime(10000);
      });

      expect(result.current.timeRemaining).toBe(0);
      expect(result.current.isExpired).toBe(true);
    });

    it("should clear session when expired", () => {
      const expiresAt = new Date(Date.now() + 5000); // Expires in 5 seconds

      vi.mocked(useAuthStore).mockReturnValue({
        ...mockAuthStore,
        verificationSession: {
          sessionId: "test-id",
          isLocked: true,
          otpStepIndex: 2,
          verifiedAt: new Date(),
          expiresAt,
          lastActivity: new Date(),
        },
      } as any);

      renderHook(() => useSessionTimeout());

      // Advance time past expiration
      act(() => {
        vi.advanceTimersByTime(15000);
      });

      expect(mockAuthStore.clearVerificationSession).toHaveBeenCalled();
    });

    it("should redirect to step 0 when expired", () => {
      const expiresAt = new Date(Date.now() + 5000);

      vi.mocked(useAuthStore).mockReturnValue({
        ...mockAuthStore,
        verificationSession: {
          sessionId: "test-id",
          isLocked: true,
          otpStepIndex: 2,
          verifiedAt: new Date(),
          expiresAt,
          lastActivity: new Date(),
        },
      } as any);

      renderHook(() => useSessionTimeout());

      // Advance time past expiration
      act(() => {
        vi.advanceTimersByTime(15000);
      });

      expect(mockWizardStore.goToStep).toHaveBeenCalledWith(0);
    });

    it("should show toast notification when expired", () => {
      const expiresAt = new Date(Date.now() + 5000);

      vi.mocked(useAuthStore).mockReturnValue({
        ...mockAuthStore,
        verificationSession: {
          sessionId: "test-id",
          isLocked: true,
          otpStepIndex: 2,
          verifiedAt: new Date(),
          expiresAt,
          lastActivity: new Date(),
        },
      } as any);

      renderHook(() => useSessionTimeout());

      // Advance time past expiration
      act(() => {
        vi.advanceTimersByTime(15000);
      });

      expect(toast).toHaveBeenCalled();
    });

    it("should not show toast when notifications disabled", () => {
      vi.mocked(useNavigationConfig).mockReturnValue({
        config: { ...mockConfig, enableUserNotifications: false },
        updateConfig: vi.fn(),
      });

      const expiresAt = new Date(Date.now() + 5000);

      vi.mocked(useAuthStore).mockReturnValue({
        ...mockAuthStore,
        verificationSession: {
          sessionId: "test-id",
          isLocked: true,
          otpStepIndex: 2,
          verifiedAt: new Date(),
          expiresAt,
          lastActivity: new Date(),
        },
      } as any);

      renderHook(() => useSessionTimeout());

      // Advance time past expiration
      act(() => {
        vi.advanceTimersByTime(15000);
      });

      expect(toast).not.toHaveBeenCalled();
    });
  });

  describe("Activity Tracking", () => {
    it("should track user activity events", () => {
      const expiresAt = new Date(Date.now() + 900000);

      vi.mocked(useAuthStore).mockReturnValue({
        ...mockAuthStore,
        verificationSession: {
          sessionId: "test-id",
          isLocked: true,
          otpStepIndex: 2,
          verifiedAt: new Date(),
          expiresAt,
          lastActivity: new Date(),
        },
      } as any);

      renderHook(() => useSessionTimeout());

      // Simulate user activity
      act(() => {
        window.dispatchEvent(new Event("click"));
      });

      // Wait for debounce
      act(() => {
        vi.advanceTimersByTime(1000);
      });

      expect(mockAuthStore.updateSessionActivity).toHaveBeenCalled();
    });

    it("should debounce activity updates", () => {
      const expiresAt = new Date(Date.now() + 900000);

      vi.mocked(useAuthStore).mockReturnValue({
        ...mockAuthStore,
        verificationSession: {
          sessionId: "test-id",
          isLocked: true,
          otpStepIndex: 2,
          verifiedAt: new Date(),
          expiresAt,
          lastActivity: new Date(),
        },
      } as any);

      renderHook(() => useSessionTimeout({ activityDebounce: 2000 }));

      // Simulate multiple rapid clicks
      act(() => {
        window.dispatchEvent(new Event("click"));
        window.dispatchEvent(new Event("click"));
        window.dispatchEvent(new Event("click"));
      });

      // Wait less than debounce time
      act(() => {
        vi.advanceTimersByTime(1000);
      });

      // Should not have updated yet
      expect(mockAuthStore.updateSessionActivity).not.toHaveBeenCalled();

      // Wait for full debounce time
      act(() => {
        vi.advanceTimersByTime(1000);
      });

      // Should update only once
      expect(mockAuthStore.updateSessionActivity).toHaveBeenCalledTimes(1);
    });

    it("should track multiple event types", () => {
      const expiresAt = new Date(Date.now() + 900000);

      vi.mocked(useAuthStore).mockReturnValue({
        ...mockAuthStore,
        verificationSession: {
          sessionId: "test-id",
          isLocked: true,
          otpStepIndex: 2,
          verifiedAt: new Date(),
          expiresAt,
          lastActivity: new Date(),
        },
      } as any);

      renderHook(() => useSessionTimeout());

      // Simulate different activity types
      act(() => {
        window.dispatchEvent(new Event("click"));
        vi.advanceTimersByTime(1000);
      });

      act(() => {
        window.dispatchEvent(new KeyboardEvent("keydown"));
        vi.advanceTimersByTime(1000);
      });

      act(() => {
        window.dispatchEvent(new Event("scroll"));
        vi.advanceTimersByTime(1000);
      });

      expect(mockAuthStore.updateSessionActivity).toHaveBeenCalledTimes(3);
    });

    it("should cleanup event listeners on unmount", () => {
      const expiresAt = new Date(Date.now() + 900000);

      vi.mocked(useAuthStore).mockReturnValue({
        ...mockAuthStore,
        verificationSession: {
          sessionId: "test-id",
          isLocked: true,
          otpStepIndex: 2,
          verifiedAt: new Date(),
          expiresAt,
          lastActivity: new Date(),
        },
      } as any);

      const { unmount } = renderHook(() => useSessionTimeout());

      const removeEventListenerSpy = vi.spyOn(window, "removeEventListener");

      unmount();

      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        "click",
        expect.any(Function),
      );
      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        "keydown",
        expect.any(Function),
      );
      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        "scroll",
        expect.any(Function),
      );
    });
  });

  describe("Manual Reset", () => {
    it("should provide resetTimeout function", () => {
      const expiresAt = new Date(Date.now() + 900000);

      vi.mocked(useAuthStore).mockReturnValue({
        ...mockAuthStore,
        verificationSession: {
          sessionId: "test-id",
          isLocked: true,
          otpStepIndex: 2,
          verifiedAt: new Date(),
          expiresAt,
          lastActivity: new Date(),
        },
      } as any);

      const { result } = renderHook(() => useSessionTimeout());

      expect(result.current.resetTimeout).toBeDefined();
      expect(typeof result.current.resetTimeout).toBe("function");
    });

    it("should update activity when resetTimeout called", () => {
      const expiresAt = new Date(Date.now() + 900000);

      vi.mocked(useAuthStore).mockReturnValue({
        ...mockAuthStore,
        verificationSession: {
          sessionId: "test-id",
          isLocked: true,
          otpStepIndex: 2,
          verifiedAt: new Date(),
          expiresAt,
          lastActivity: new Date(),
        },
      } as any);

      const { result } = renderHook(() => useSessionTimeout());

      act(() => {
        result.current.resetTimeout();
      });

      expect(mockAuthStore.updateSessionActivity).toHaveBeenCalled();
    });

    it("should not update activity when timeout disabled", () => {
      vi.mocked(useNavigationConfig).mockReturnValue({
        config: { ...mockConfig, enableSessionTimeout: false },
        updateConfig: vi.fn(),
      });

      const { result } = renderHook(() => useSessionTimeout());

      act(() => {
        result.current.resetTimeout();
      });

      expect(mockAuthStore.updateSessionActivity).not.toHaveBeenCalled();
    });
  });

  describe("Edge Cases", () => {
    it("should handle session without expiration", () => {
      vi.mocked(useAuthStore).mockReturnValue({
        ...mockAuthStore,
        verificationSession: {
          sessionId: "test-id",
          isLocked: true,
          otpStepIndex: 2,
          verifiedAt: new Date(),
          expiresAt: null,
          lastActivity: new Date(),
        },
      } as any);

      const { result } = renderHook(() => useSessionTimeout());

      expect(result.current.timeRemaining).toBeNull();
      expect(result.current.isExpired).toBe(false);
    });

    it("should handle very short timeout", () => {
      const expiresAt = new Date(Date.now() + 1000); // 1 second

      vi.mocked(useAuthStore).mockReturnValue({
        ...mockAuthStore,
        verificationSession: {
          sessionId: "test-id",
          isLocked: true,
          otpStepIndex: 2,
          verifiedAt: new Date(),
          expiresAt,
          lastActivity: new Date(),
        },
      } as any);

      const { result } = renderHook(() => useSessionTimeout());

      expect(result.current.timeRemaining).toBeLessThanOrEqual(1);
    });

    it("should handle session that expires during render", () => {
      const expiresAt = new Date(Date.now() + 100); // 100ms

      vi.mocked(useAuthStore).mockReturnValue({
        ...mockAuthStore,
        verificationSession: {
          sessionId: "test-id",
          isLocked: true,
          otpStepIndex: 2,
          verifiedAt: new Date(),
          expiresAt,
          lastActivity: new Date(),
        },
      } as any);

      renderHook(() => useSessionTimeout());

      // Advance time past expiration
      act(() => {
        vi.advanceTimersByTime(10000);
      });

      expect(mockAuthStore.clearVerificationSession).toHaveBeenCalled();
    });

    it("should not trigger expiration multiple times", () => {
      const expiresAt = new Date(Date.now() + 5000);

      vi.mocked(useAuthStore).mockReturnValue({
        ...mockAuthStore,
        verificationSession: {
          sessionId: "test-id",
          isLocked: true,
          otpStepIndex: 2,
          verifiedAt: new Date(),
          expiresAt,
          lastActivity: new Date(),
        },
      } as any);

      renderHook(() => useSessionTimeout());

      // Advance time past expiration multiple times
      act(() => {
        vi.advanceTimersByTime(10000);
      });

      act(() => {
        vi.advanceTimersByTime(10000);
      });

      // Should only clear once
      expect(mockAuthStore.clearVerificationSession).toHaveBeenCalledTimes(1);
    });
  });
});
