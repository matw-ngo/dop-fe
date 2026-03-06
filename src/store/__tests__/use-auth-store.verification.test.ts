/**
 * Unit tests for Auth Store verification session management
 *
 * Tests cover:
 * - Session creation with config
 * - Session lock validation
 * - canNavigateBack() logic
 * - Session timeout calculation
 * - Session persistence
 * - Session restoration
 * - Session clearing
 */

import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { useAuthStore } from "../use-auth-store";
import type { NavigationConfig } from "@/contexts/NavigationConfigContext";
import {
  persistVerificationSession,
  restoreVerificationSession,
  clearVerificationSession,
} from "@/lib/utils/session-storage";

// Mock session storage utilities
vi.mock("@/lib/utils/session-storage", () => ({
  persistVerificationSession: vi.fn(),
  restoreVerificationSession: vi.fn(),
  clearVerificationSession: vi.fn(),
}));

// Mock crypto utilities
vi.mock("@/lib/utils/crypto", () => ({
  generateCryptoRandomId: vi.fn(() => "test-session-id-123"),
  encryptSessionData: vi.fn((data) => btoa(JSON.stringify(data))),
  decryptSessionData: vi.fn((encrypted) => JSON.parse(atob(encrypted))),
}));

describe("Auth Store - Verification Session Management", () => {
  beforeEach(() => {
    // Reset store state before each test
    useAuthStore.setState({
      verificationSession: null,
    });

    // Clear all mocks
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("Session Creation", () => {
    it("should create verification session with all required fields", () => {
      const config: NavigationConfig = {
        enableSessionTimeout: false,
        sessionTimeoutMinutes: 15,
        enableBackNavigationBlock: true,
        enableUserNotifications: true,
        enableServerValidation: false,
      };

      const otpStepIndex = 3;

      useAuthStore.getState().createVerificationSession(otpStepIndex, config);

      const session = useAuthStore.getState().verificationSession;

      expect(session).toBeDefined();
      expect(session?.sessionId).toBe("test-session-id-123");
      expect(session?.isLocked).toBe(true);
      expect(session?.otpStepIndex).toBe(3);
      expect(session?.verifiedAt).toBeInstanceOf(Date);
      expect(session?.lastActivity).toBeInstanceOf(Date);
    });

    it("should create session without expiration when timeout disabled", () => {
      const config: NavigationConfig = {
        enableSessionTimeout: false,
        sessionTimeoutMinutes: 15,
        enableBackNavigationBlock: true,
        enableUserNotifications: true,
        enableServerValidation: false,
      };

      useAuthStore.getState().createVerificationSession(2, config);

      const session = useAuthStore.getState().verificationSession;

      expect(session?.expiresAt).toBeNull();
    });

    it("should create session with expiration when timeout enabled", () => {
      const config: NavigationConfig = {
        enableSessionTimeout: true,
        sessionTimeoutMinutes: 15,
        enableBackNavigationBlock: true,
        enableUserNotifications: true,
        enableServerValidation: false,
      };

      const beforeCreate = Date.now();
      useAuthStore.getState().createVerificationSession(2, config);
      const afterCreate = Date.now();

      const session = useAuthStore.getState().verificationSession;

      expect(session?.expiresAt).toBeInstanceOf(Date);

      const expiresAt = session?.expiresAt?.getTime() || 0;
      const expectedMin = beforeCreate + 15 * 60 * 1000;
      const expectedMax = afterCreate + 15 * 60 * 1000;

      expect(expiresAt).toBeGreaterThanOrEqual(expectedMin);
      expect(expiresAt).toBeLessThanOrEqual(expectedMax);
    });

    it("should persist session to storage after creation", () => {
      const config: NavigationConfig = {
        enableSessionTimeout: false,
        sessionTimeoutMinutes: 15,
        enableBackNavigationBlock: true,
        enableUserNotifications: true,
        enableServerValidation: false,
      };

      useAuthStore.getState().createVerificationSession(1, config);

      expect(persistVerificationSession).toHaveBeenCalledTimes(1);
      expect(persistVerificationSession).toHaveBeenCalledWith(
        expect.objectContaining({
          sessionId: "test-session-id-123",
          isLocked: true,
          otpStepIndex: 1,
        }),
      );
    });
  });

  describe("Session Lock Validation", () => {
    it("should return true for session lock when session exists", () => {
      const config: NavigationConfig = {
        enableSessionTimeout: false,
        sessionTimeoutMinutes: 15,
        enableBackNavigationBlock: true,
        enableUserNotifications: true,
        enableServerValidation: false,
      };

      useAuthStore.getState().createVerificationSession(2, config);

      const isLocked = useAuthStore.getState().getSessionLock();

      expect(isLocked).toBe(true);
    });

    it("should return false for session lock when no session exists", () => {
      const isLocked = useAuthStore.getState().getSessionLock();

      expect(isLocked).toBe(false);
    });

    it("should return false for session lock when session is not locked", () => {
      useAuthStore.setState({
        verificationSession: {
          sessionId: "test-id",
          isLocked: false,
          otpStepIndex: 2,
          verifiedAt: new Date(),
          expiresAt: null,
          lastActivity: new Date(),
        },
      });

      const isLocked = useAuthStore.getState().getSessionLock();

      expect(isLocked).toBe(false);
    });
  });

  describe("canNavigateBack() Logic", () => {
    beforeEach(() => {
      const config: NavigationConfig = {
        enableSessionTimeout: false,
        sessionTimeoutMinutes: 15,
        enableBackNavigationBlock: true,
        enableUserNotifications: true,
        enableServerValidation: false,
      };

      // Create session with OTP at step 3
      useAuthStore.getState().createVerificationSession(3, config);
    });

    it("should allow navigation to steps after OTP step", () => {
      // OTP at step 3, trying to navigate to step 4
      const canNavigate = useAuthStore.getState().canNavigateBack(4);
      expect(canNavigate).toBe(true);

      // OTP at step 3, trying to navigate to step 5
      const canNavigate2 = useAuthStore.getState().canNavigateBack(5);
      expect(canNavigate2).toBe(true);
    });

    it("should block navigation to steps before OTP step", () => {
      // OTP at step 3, trying to navigate to step 0
      const canNavigate = useAuthStore.getState().canNavigateBack(0);
      expect(canNavigate).toBe(false);

      // OTP at step 3, trying to navigate to step 2
      const canNavigate2 = useAuthStore.getState().canNavigateBack(2);
      expect(canNavigate2).toBe(false);
    });

    it("should block navigation to OTP step itself", () => {
      // OTP at step 3, trying to navigate back to step 3
      const canNavigate = useAuthStore.getState().canNavigateBack(3);
      expect(canNavigate).toBe(false);
    });

    it("should allow all navigation when no session exists", () => {
      useAuthStore.setState({ verificationSession: null });

      const canNavigate0 = useAuthStore.getState().canNavigateBack(0);
      const canNavigate3 = useAuthStore.getState().canNavigateBack(3);
      const canNavigate5 = useAuthStore.getState().canNavigateBack(5);

      expect(canNavigate0).toBe(true);
      expect(canNavigate3).toBe(true);
      expect(canNavigate5).toBe(true);
    });

    it("should allow all navigation when session is not locked", () => {
      useAuthStore.setState({
        verificationSession: {
          sessionId: "test-id",
          isLocked: false,
          otpStepIndex: 3,
          verifiedAt: new Date(),
          expiresAt: null,
          lastActivity: new Date(),
        },
      });

      const canNavigate0 = useAuthStore.getState().canNavigateBack(0);
      const canNavigate3 = useAuthStore.getState().canNavigateBack(3);

      expect(canNavigate0).toBe(true);
      expect(canNavigate3).toBe(true);
    });
  });

  describe("Session Timeout Calculation", () => {
    it("should calculate correct expiration time", () => {
      const config: NavigationConfig = {
        enableSessionTimeout: true,
        sessionTimeoutMinutes: 30,
        enableBackNavigationBlock: true,
        enableUserNotifications: true,
        enableServerValidation: false,
      };

      const beforeCreate = Date.now();
      useAuthStore.getState().createVerificationSession(1, config);
      const afterCreate = Date.now();

      const session = useAuthStore.getState().verificationSession;
      const expiresAt = session?.expiresAt?.getTime() || 0;

      const expectedMin = beforeCreate + 30 * 60 * 1000;
      const expectedMax = afterCreate + 30 * 60 * 1000;

      expect(expiresAt).toBeGreaterThanOrEqual(expectedMin);
      expect(expiresAt).toBeLessThanOrEqual(expectedMax);
    });

    it("should validate session is not expired when within timeout", () => {
      const config: NavigationConfig = {
        enableSessionTimeout: true,
        sessionTimeoutMinutes: 15,
        enableBackNavigationBlock: true,
        enableUserNotifications: true,
        enableServerValidation: false,
      };

      useAuthStore.getState().createVerificationSession(1, config);

      const isExpired = useAuthStore.getState().isSessionExpired();

      expect(isExpired).toBe(false);
    });

    it("should validate session is expired when past timeout", () => {
      const pastDate = new Date(Date.now() - 1000); // 1 second ago

      useAuthStore.setState({
        verificationSession: {
          sessionId: "test-id",
          isLocked: true,
          otpStepIndex: 1,
          verifiedAt: new Date(),
          expiresAt: pastDate,
          lastActivity: new Date(),
        },
      });

      const isExpired = useAuthStore.getState().isSessionExpired();

      expect(isExpired).toBe(true);
    });

    it("should validate session is valid when no expiration set", () => {
      useAuthStore.setState({
        verificationSession: {
          sessionId: "test-id",
          isLocked: true,
          otpStepIndex: 1,
          verifiedAt: new Date(),
          expiresAt: null,
          lastActivity: new Date(),
        },
      });

      const isValid = useAuthStore.getState().isSessionValid();

      expect(isValid).toBe(true);
    });
  });

  describe("Session Activity Updates", () => {
    it("should update last activity timestamp", () => {
      const config: NavigationConfig = {
        enableSessionTimeout: true,
        sessionTimeoutMinutes: 15,
        enableBackNavigationBlock: true,
        enableUserNotifications: true,
        enableServerValidation: false,
      };

      useAuthStore.getState().createVerificationSession(1, config);

      const initialActivity =
        useAuthStore.getState().verificationSession?.lastActivity;

      // Wait a bit
      vi.useFakeTimers();
      vi.advanceTimersByTime(1000);

      useAuthStore.getState().updateSessionActivity();

      const updatedActivity =
        useAuthStore.getState().verificationSession?.lastActivity;

      expect(updatedActivity).not.toEqual(initialActivity);
      expect(updatedActivity!.getTime()).toBeGreaterThan(
        initialActivity!.getTime(),
      );

      vi.useRealTimers();
    });

    it("should extend expiration time when activity updated", () => {
      const config: NavigationConfig = {
        enableSessionTimeout: true,
        sessionTimeoutMinutes: 15,
        enableBackNavigationBlock: true,
        enableUserNotifications: true,
        enableServerValidation: false,
      };

      useAuthStore.getState().createVerificationSession(1, config);

      const initialExpiration =
        useAuthStore.getState().verificationSession?.expiresAt;

      // Wait a bit
      vi.useFakeTimers();
      vi.advanceTimersByTime(5000);

      useAuthStore.getState().updateSessionActivity();

      const updatedExpiration =
        useAuthStore.getState().verificationSession?.expiresAt;

      expect(updatedExpiration!.getTime()).toBeGreaterThan(
        initialExpiration!.getTime(),
      );

      vi.useRealTimers();
    });

    it("should persist session after activity update", () => {
      const config: NavigationConfig = {
        enableSessionTimeout: true,
        sessionTimeoutMinutes: 15,
        enableBackNavigationBlock: true,
        enableUserNotifications: true,
        enableServerValidation: false,
      };

      useAuthStore.getState().createVerificationSession(1, config);

      vi.clearAllMocks();

      useAuthStore.getState().updateSessionActivity();

      expect(persistVerificationSession).toHaveBeenCalledTimes(1);
    });
  });

  describe("Session Restoration", () => {
    it("should restore session from storage on hydration", () => {
      const mockSession = {
        sessionId: "restored-session-id",
        isLocked: true,
        otpStepIndex: 2,
        verifiedAt: new Date("2024-01-01T10:00:00Z"),
        expiresAt: new Date("2024-01-01T10:15:00Z"),
        lastActivity: new Date("2024-01-01T10:00:00Z"),
      };

      vi.mocked(restoreVerificationSession).mockReturnValue(mockSession);

      // Simulate hydration
      useAuthStore.getState().restoreVerificationSession();

      const session = useAuthStore.getState().verificationSession;

      expect(session).toEqual(mockSession);
      expect(restoreVerificationSession).toHaveBeenCalledTimes(1);
    });

    it("should handle missing session in storage", () => {
      vi.mocked(restoreVerificationSession).mockReturnValue(null);

      useAuthStore.getState().restoreVerificationSession();

      const session = useAuthStore.getState().verificationSession;

      expect(session).toBeNull();
    });

    it("should clear expired session on restoration", () => {
      const expiredSession = {
        sessionId: "expired-session-id",
        isLocked: true,
        otpStepIndex: 2,
        verifiedAt: new Date("2024-01-01T10:00:00Z"),
        expiresAt: new Date("2024-01-01T10:15:00Z"), // Past date
        lastActivity: new Date("2024-01-01T10:00:00Z"),
      };

      vi.mocked(restoreVerificationSession).mockReturnValue(expiredSession);

      useAuthStore.getState().restoreVerificationSession();

      // Should clear expired session
      const session = useAuthStore.getState().verificationSession;

      expect(session).toBeNull();
      expect(clearVerificationSession).toHaveBeenCalledTimes(1);
    });
  });

  describe("Session Clearing", () => {
    it("should clear verification session from state", () => {
      const config: NavigationConfig = {
        enableSessionTimeout: false,
        sessionTimeoutMinutes: 15,
        enableBackNavigationBlock: true,
        enableUserNotifications: true,
        enableServerValidation: false,
      };

      useAuthStore.getState().createVerificationSession(1, config);

      expect(useAuthStore.getState().verificationSession).not.toBeNull();

      useAuthStore.getState().clearVerificationSession();

      expect(useAuthStore.getState().verificationSession).toBeNull();
    });

    it("should clear session from storage", () => {
      const config: NavigationConfig = {
        enableSessionTimeout: false,
        sessionTimeoutMinutes: 15,
        enableBackNavigationBlock: true,
        enableUserNotifications: true,
        enableServerValidation: false,
      };

      useAuthStore.getState().createVerificationSession(1, config);

      vi.clearAllMocks();

      useAuthStore.getState().clearVerificationSession();

      expect(clearVerificationSession).toHaveBeenCalledTimes(1);
    });

    it("should handle clearing when no session exists", () => {
      useAuthStore.setState({ verificationSession: null });

      expect(() => {
        useAuthStore.getState().clearVerificationSession();
      }).not.toThrow();

      expect(clearVerificationSession).toHaveBeenCalledTimes(1);
    });
  });

  describe("Edge Cases", () => {
    it("should handle OTP step at index 0", () => {
      const config: NavigationConfig = {
        enableSessionTimeout: false,
        sessionTimeoutMinutes: 15,
        enableBackNavigationBlock: true,
        enableUserNotifications: true,
        enableServerValidation: false,
      };

      useAuthStore.getState().createVerificationSession(0, config);

      const session = useAuthStore.getState().verificationSession;

      expect(session?.otpStepIndex).toBe(0);

      // Should block navigation to step 0 (OTP step itself)
      expect(useAuthStore.getState().canNavigateBack(0)).toBe(false);

      // Should allow navigation to step 1 and beyond
      expect(useAuthStore.getState().canNavigateBack(1)).toBe(true);
      expect(useAuthStore.getState().canNavigateBack(2)).toBe(true);
    });

    it("should handle very short timeout duration", () => {
      const config: NavigationConfig = {
        enableSessionTimeout: true,
        sessionTimeoutMinutes: 1, // 1 minute
        enableBackNavigationBlock: true,
        enableUserNotifications: true,
        enableServerValidation: false,
      };

      const beforeCreate = Date.now();
      useAuthStore.getState().createVerificationSession(1, config);

      const session = useAuthStore.getState().verificationSession;
      const expiresAt = session?.expiresAt?.getTime() || 0;

      const expectedExpiration = beforeCreate + 1 * 60 * 1000;

      expect(expiresAt).toBeGreaterThanOrEqual(expectedExpiration);
      expect(expiresAt).toBeLessThanOrEqual(expectedExpiration + 100); // Allow 100ms tolerance
    });

    it("should handle very long timeout duration", () => {
      const config: NavigationConfig = {
        enableSessionTimeout: true,
        sessionTimeoutMinutes: 120, // 2 hours
        enableBackNavigationBlock: true,
        enableUserNotifications: true,
        enableServerValidation: false,
      };

      const beforeCreate = Date.now();
      useAuthStore.getState().createVerificationSession(1, config);

      const session = useAuthStore.getState().verificationSession;
      const expiresAt = session?.expiresAt?.getTime() || 0;

      const expectedExpiration = beforeCreate + 120 * 60 * 1000;

      expect(expiresAt).toBeGreaterThanOrEqual(expectedExpiration);
      expect(expiresAt).toBeLessThanOrEqual(expectedExpiration + 100);
    });
  });
});
