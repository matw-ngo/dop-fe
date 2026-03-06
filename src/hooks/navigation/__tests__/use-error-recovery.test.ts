/**
 * Unit tests for useErrorRecovery hook
 *
 * Tests cover:
 * - Error detection and recovery
 * - Session integrity checks
 * - History integrity checks
 * - Step validity checks
 * - Manual recovery
 */

import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useErrorRecovery } from "../use-error-recovery";
import { useAuthStore } from "@/store/use-auth-store";
import { useFormWizardStore } from "@/components/form-generation/store/use-form-wizard-store";
import { toast } from "sonner";

// Mock dependencies
vi.mock("@/store/use-auth-store");
vi.mock("@/components/form-generation/store/use-form-wizard-store");
vi.mock("sonner");
vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

describe("useErrorRecovery", () => {
  const mockAuthStore = {
    verificationSession: null,
    clearVerificationSession: vi.fn(),
  };

  const mockWizardStore = {
    currentStep: 0,
    steps: [{}, {}, {}, {}, {}],
    goToStep: vi.fn(),
    resetWizard: vi.fn(),
  };

  beforeEach(() => {
    vi.mocked(useAuthStore).mockReturnValue(mockAuthStore as any);
    vi.mocked(useFormWizardStore).mockReturnValue(mockWizardStore as any);

    // Mock window.history
    Object.defineProperty(window, "history", {
      writable: true,
      value: {
        state: { step: 0 },
        replaceState: vi.fn(),
        pushState: vi.fn(),
      },
    });

    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("Initialization", () => {
    it("should return no error initially when state is valid", () => {
      const { result } = renderHook(() => useErrorRecovery());

      expect(result.current.hasError).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.showResetButton).toBe(false);
    });

    it("should provide recover function", () => {
      const { result } = renderHook(() => useErrorRecovery());

      expect(result.current.recover).toBeDefined();
      expect(typeof result.current.recover).toBe("function");
    });
  });

  describe("Session Integrity Checks", () => {
    it("should detect corrupted session missing sessionId", () => {
      vi.mocked(useAuthStore).mockReturnValue({
        ...mockAuthStore,
        verificationSession: {
          sessionId: "",
          isLocked: true,
          otpStepIndex: 2,
          verifiedAt: new Date(),
          expiresAt: null,
          lastActivity: new Date(),
        },
      } as any);

      const { result } = renderHook(() => useErrorRecovery());

      expect(result.current.hasError).toBe(true);
      expect(result.current.error?.type).toBe("session_corrupt");
      expect(result.current.showResetButton).toBe(true);
    });

    it("should detect corrupted session missing verifiedAt", () => {
      vi.mocked(useAuthStore).mockReturnValue({
        ...mockAuthStore,
        verificationSession: {
          sessionId: "test-id",
          isLocked: true,
          otpStepIndex: 2,
          verifiedAt: null,
          expiresAt: null,
          lastActivity: new Date(),
        },
      } as any);

      const { result } = renderHook(() => useErrorRecovery());

      expect(result.current.hasError).toBe(true);
      expect(result.current.error?.type).toBe("session_corrupt");
    });

    it("should detect corrupted session missing otpStepIndex", () => {
      vi.mocked(useAuthStore).mockReturnValue({
        ...mockAuthStore,
        verificationSession: {
          sessionId: "test-id",
          isLocked: true,
          otpStepIndex: undefined,
          verifiedAt: new Date(),
          expiresAt: null,
          lastActivity: new Date(),
        },
      } as any);

      const { result } = renderHook(() => useErrorRecovery());

      expect(result.current.hasError).toBe(true);
      expect(result.current.error?.type).toBe("session_corrupt");
    });

    it("should auto-recover from corrupted session", () => {
      vi.mocked(useAuthStore).mockReturnValue({
        ...mockAuthStore,
        verificationSession: {
          sessionId: "",
          isLocked: true,
          otpStepIndex: 2,
          verifiedAt: new Date(),
          expiresAt: null,
          lastActivity: new Date(),
        },
      } as any);

      renderHook(() => useErrorRecovery());

      expect(mockAuthStore.clearVerificationSession).toHaveBeenCalled();
      expect(mockWizardStore.goToStep).toHaveBeenCalledWith(0);
    });

    it("should show toast on session corruption", () => {
      vi.mocked(useAuthStore).mockReturnValue({
        ...mockAuthStore,
        verificationSession: {
          sessionId: "",
          isLocked: true,
          otpStepIndex: 2,
          verifiedAt: new Date(),
          expiresAt: null,
          lastActivity: new Date(),
        },
      } as any);

      renderHook(() => useErrorRecovery());

      expect(toast).toHaveBeenCalled();
    });

    it("should call onError callback when session corrupted", () => {
      const onError = vi.fn();

      vi.mocked(useAuthStore).mockReturnValue({
        ...mockAuthStore,
        verificationSession: {
          sessionId: "",
          isLocked: true,
          otpStepIndex: 2,
          verifiedAt: new Date(),
          expiresAt: null,
          lastActivity: new Date(),
        },
      } as any);

      renderHook(() => useErrorRecovery({ onError }));

      expect(onError).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "session_corrupt",
          recoveryAction: "reset",
        }),
      );
    });
  });

  describe("History Integrity Checks", () => {
    it("should detect inconsistent history state", () => {
      vi.mocked(useFormWizardStore).mockReturnValue({
        ...mockWizardStore,
        currentStep: 3,
      } as any);

      Object.defineProperty(window, "history", {
        writable: true,
        value: {
          state: { step: 1 }, // Different from currentStep
          replaceState: vi.fn(),
        },
      });

      const { result } = renderHook(() => useErrorRecovery());

      expect(result.current.hasError).toBe(true);
      expect(result.current.error?.type).toBe("history_inconsistent");
    });

    it("should auto-recover from history inconsistency", () => {
      vi.mocked(useFormWizardStore).mockReturnValue({
        ...mockWizardStore,
        currentStep: 3,
      } as any);

      Object.defineProperty(window, "history", {
        writable: true,
        value: {
          state: { step: 1 },
          replaceState: vi.fn(),
        },
      });

      renderHook(() => useErrorRecovery());

      expect(window.history.replaceState).toHaveBeenCalledWith(
        { step: 3 },
        "",
        window.location.href,
      );
    });

    it("should clear error after history recovery", () => {
      vi.mocked(useFormWizardStore).mockReturnValue({
        ...mockWizardStore,
        currentStep: 3,
      } as any);

      Object.defineProperty(window, "history", {
        writable: true,
        value: {
          state: { step: 1 },
          replaceState: vi.fn(),
        },
      });

      const { result } = renderHook(() => useErrorRecovery());

      // After auto-recovery, error should be cleared
      expect(result.current.hasError).toBe(false);
    });

    it("should handle missing history state", () => {
      Object.defineProperty(window, "history", {
        writable: true,
        value: {
          state: null,
          replaceState: vi.fn(),
        },
      });

      const { result } = renderHook(() => useErrorRecovery());

      expect(result.current.hasError).toBe(false);
    });
  });

  describe("Step Validity Checks", () => {
    it("should detect invalid step index (negative)", () => {
      vi.mocked(useFormWizardStore).mockReturnValue({
        ...mockWizardStore,
        currentStep: -1,
      } as any);

      const { result } = renderHook(() => useErrorRecovery());

      expect(result.current.hasError).toBe(true);
      expect(result.current.error?.type).toBe("step_invalid");
    });

    it("should detect invalid step index (beyond array)", () => {
      vi.mocked(useFormWizardStore).mockReturnValue({
        ...mockWizardStore,
        currentStep: 10,
        steps: [{}, {}, {}],
      } as any);

      const { result } = renderHook(() => useErrorRecovery());

      expect(result.current.hasError).toBe(true);
      expect(result.current.error?.type).toBe("step_invalid");
    });

    it("should auto-recover from invalid step", () => {
      vi.mocked(useFormWizardStore).mockReturnValue({
        ...mockWizardStore,
        currentStep: -1,
      } as any);

      renderHook(() => useErrorRecovery());

      expect(mockWizardStore.goToStep).toHaveBeenCalledWith(0);
    });

    it("should accept valid step indices", () => {
      vi.mocked(useFormWizardStore).mockReturnValue({
        ...mockWizardStore,
        currentStep: 2,
        steps: [{}, {}, {}, {}, {}],
      } as any);

      const { result } = renderHook(() => useErrorRecovery());

      expect(result.current.hasError).toBe(false);
    });
  });

  describe("Manual Recovery", () => {
    it("should execute reset recovery action", () => {
      vi.mocked(useAuthStore).mockReturnValue({
        ...mockAuthStore,
        verificationSession: {
          sessionId: "",
          isLocked: true,
          otpStepIndex: 2,
          verifiedAt: new Date(),
          expiresAt: null,
          lastActivity: new Date(),
        },
      } as any);

      const { result } = renderHook(() => useErrorRecovery());

      vi.clearAllMocks();

      act(() => {
        result.current.recover();
      });

      expect(mockAuthStore.clearVerificationSession).toHaveBeenCalled();
      expect(mockWizardStore.resetWizard).toHaveBeenCalled();
      expect(mockWizardStore.goToStep).toHaveBeenCalledWith(0);
    });

    it("should execute reconstruct recovery action", () => {
      vi.mocked(useFormWizardStore).mockReturnValue({
        ...mockWizardStore,
        currentStep: 3,
      } as any);

      Object.defineProperty(window, "history", {
        writable: true,
        value: {
          state: { step: 1 },
          replaceState: vi.fn(),
        },
      });

      const { result } = renderHook(() => useErrorRecovery());

      vi.clearAllMocks();

      act(() => {
        result.current.recover();
      });

      expect(window.history.replaceState).toHaveBeenCalledWith(
        { step: 3 },
        "",
        window.location.href,
      );
    });

    it("should execute redirect recovery action", () => {
      vi.mocked(useFormWizardStore).mockReturnValue({
        ...mockWizardStore,
        currentStep: -1,
      } as any);

      const { result } = renderHook(() => useErrorRecovery());

      vi.clearAllMocks();

      act(() => {
        result.current.recover();
      });

      expect(mockWizardStore.goToStep).toHaveBeenCalledWith(0);
    });

    it("should clear error after manual recovery", () => {
      vi.mocked(useAuthStore).mockReturnValue({
        ...mockAuthStore,
        verificationSession: {
          sessionId: "",
          isLocked: true,
          otpStepIndex: 2,
          verifiedAt: new Date(),
          expiresAt: null,
          lastActivity: new Date(),
        },
      } as any);

      const { result } = renderHook(() => useErrorRecovery());

      expect(result.current.hasError).toBe(true);

      act(() => {
        result.current.recover();
      });

      expect(result.current.hasError).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it("should not throw when recovering with no error", () => {
      const { result } = renderHook(() => useErrorRecovery());

      expect(() => {
        act(() => {
          result.current.recover();
        });
      }).not.toThrow();
    });
  });

  describe("Show Reset Button Logic", () => {
    it("should show reset button for session_corrupt error", () => {
      vi.mocked(useAuthStore).mockReturnValue({
        ...mockAuthStore,
        verificationSession: {
          sessionId: "",
          isLocked: true,
          otpStepIndex: 2,
          verifiedAt: new Date(),
          expiresAt: null,
          lastActivity: new Date(),
        },
      } as any);

      const { result } = renderHook(() => useErrorRecovery());

      expect(result.current.showResetButton).toBe(true);
    });

    it("should show reset button for step_invalid error", () => {
      vi.mocked(useFormWizardStore).mockReturnValue({
        ...mockWizardStore,
        currentStep: -1,
      } as any);

      const { result } = renderHook(() => useErrorRecovery());

      expect(result.current.showResetButton).toBe(true);
    });

    it("should not show reset button for history_inconsistent error", () => {
      vi.mocked(useFormWizardStore).mockReturnValue({
        ...mockWizardStore,
        currentStep: 3,
      } as any);

      Object.defineProperty(window, "history", {
        writable: true,
        value: {
          state: { step: 1 },
          replaceState: vi.fn(),
        },
      });

      const { result } = renderHook(() => useErrorRecovery());

      // History inconsistency auto-recovers, so no reset button
      expect(result.current.showResetButton).toBe(false);
    });

    it("should not show reset button when no error", () => {
      const { result } = renderHook(() => useErrorRecovery());

      expect(result.current.showResetButton).toBe(false);
    });
  });

  describe("Edge Cases", () => {
    it("should handle valid session with all fields", () => {
      vi.mocked(useAuthStore).mockReturnValue({
        ...mockAuthStore,
        verificationSession: {
          sessionId: "valid-id",
          isLocked: true,
          otpStepIndex: 2,
          verifiedAt: new Date(),
          expiresAt: new Date(Date.now() + 900000),
          lastActivity: new Date(),
        },
      } as any);

      const { result } = renderHook(() => useErrorRecovery());

      expect(result.current.hasError).toBe(false);
    });

    it("should handle null session", () => {
      vi.mocked(useAuthStore).mockReturnValue({
        ...mockAuthStore,
        verificationSession: null,
      } as any);

      const { result } = renderHook(() => useErrorRecovery());

      expect(result.current.hasError).toBe(false);
    });

    it("should handle empty steps array", () => {
      vi.mocked(useFormWizardStore).mockReturnValue({
        ...mockWizardStore,
        currentStep: 0,
        steps: [],
      } as any);

      const { result } = renderHook(() => useErrorRecovery());

      expect(result.current.hasError).toBe(true);
      expect(result.current.error?.type).toBe("step_invalid");
    });

    it("should handle multiple errors simultaneously", () => {
      // Both session corrupt and invalid step
      vi.mocked(useAuthStore).mockReturnValue({
        ...mockAuthStore,
        verificationSession: {
          sessionId: "",
          isLocked: true,
          otpStepIndex: 2,
          verifiedAt: new Date(),
          expiresAt: null,
          lastActivity: new Date(),
        },
      } as any);

      vi.mocked(useFormWizardStore).mockReturnValue({
        ...mockWizardStore,
        currentStep: -1,
      } as any);

      const { result } = renderHook(() => useErrorRecovery());

      // Should detect at least one error
      expect(result.current.hasError).toBe(true);
    });

    it("should handle callback that throws error", () => {
      const onError = vi.fn(() => {
        throw new Error("Callback error");
      });

      vi.mocked(useAuthStore).mockReturnValue({
        ...mockAuthStore,
        verificationSession: {
          sessionId: "",
          isLocked: true,
          otpStepIndex: 2,
          verifiedAt: new Date(),
          expiresAt: null,
          lastActivity: new Date(),
        },
      } as any);

      expect(() => {
        renderHook(() => useErrorRecovery({ onError }));
      }).toThrow("Callback error");
    });
  });
});
