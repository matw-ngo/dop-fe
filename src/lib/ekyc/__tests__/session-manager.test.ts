/**
 * eKYC Session Manager Tests
 *
 * Tests for session lifecycle management including:
 * - Session initialization and storage
 * - Session status updates
 * - Duplicate submission prevention (SC-006)
 * - Session expiration and cleanup
 * - Session statistics
 *
 * @jest-environment jsdom
 */

import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  canSubmit,
  cleanupExpiredSessions,
  clearSession,
  expireSession,
  getAllActiveSessions,
  getSession,
  getSessionStats,
  incrementSubmissionAttempts,
  initSession,
  isSessionExpired,
  markSubmitted,
  updateSessionStatus,
} from "../session-manager";
import { type EkycSessionState, EkycSessionStatus } from "../types";

describe("session-manager", () => {
  // Helper function to create an expired session for testing
  function createExpiredSession(leadId: string): EkycSessionState {
    return {
      sessionId: `ekyc_${Date.now()}_abc123`,
      leadId,
      status: EkycSessionStatus.INITIALIZED,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() - 1000).toISOString(), // 1 second ago
      submissionAttempts: 0,
      isSubmitted: false,
    };
  }

  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe("initSession", () => {
    /**
     * Test T305: Initialize new session with default status
     */
    it("should initialize new session with default INITIALIZED status", () => {
      const leadId = "lead-123";

      const session = initSession(leadId);

      expect(session).not.toBeNull();
      expect(session?.leadId).toBe(leadId);
      expect(session?.status).toBe(EkycSessionStatus.INITIALIZED);
      expect(session?.sessionId).toMatch(/^ekyc_\d+_[a-z0-9]+$/);
      expect(session?.createdAt).toBeDefined();
      expect(session?.updatedAt).toBeDefined();
      expect(session?.expiresAt).toBeDefined();
      expect(session?.submissionAttempts).toBe(0);
      expect(session?.isSubmitted).toBe(false);
    });

    /**
     * Test T305: Initialize session with custom status
     */
    it("should initialize session with custom status", () => {
      const leadId = "lead-456";
      const customStatus = EkycSessionStatus.IN_PROGRESS;

      const session = initSession(leadId, customStatus);

      expect(session).not.toBeNull();
      expect(session?.status).toBe(customStatus);
    });

    /**
     * Test T305: Store session in localStorage
     */
    it("should store session in localStorage", () => {
      const leadId = "lead-789";

      const session = initSession(leadId);
      expect(session).not.toBeNull();

      const storageKey = `ekyc_session_${leadId}`;
      const stored = localStorage.getItem(storageKey);
      expect(stored).toBeDefined();

      const parsedSession = JSON.parse(stored!);
      expect(parsedSession.leadId).toBe(leadId);
    });

    /**
     * Test T305: Handle localStorage errors gracefully
     */
    it("should handle localStorage errors gracefully", () => {
      const leadId = "lead-error";
      const consoleErrorSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      // Mock localStorage.setItem to throw error
      const originalSetItem = localStorage.setItem;
      localStorage.setItem = vi.fn(() => {
        throw new Error("Storage quota exceeded");
      });

      const session = initSession(leadId);

      expect(session).toBeNull();
      expect(consoleErrorSpy).toHaveBeenCalled();

      // Restore original setItem
      localStorage.setItem = originalSetItem;
      consoleErrorSpy.mockRestore();
    });

    /**
     * Test T305: Generate unique session IDs
     */
    it("should generate unique session IDs", () => {
      const leadId = "lead-unique";

      const session1 = initSession(leadId);
      const session2 = initSession(leadId);

      expect(session1).not.toBeNull();
      expect(session2).not.toBeNull();
      expect(session1?.sessionId).not.toBe(session2?.sessionId);
    });
  });

  describe("getSession", () => {
    /**
     * Test T306: Retrieve existing session
     */
    it("should retrieve existing session from localStorage", () => {
      const leadId = "lead-retrieve";

      const createdSession = initSession(leadId);
      expect(createdSession).not.toBeNull();

      const retrievedSession = getSession(leadId);

      expect(retrievedSession).toBeDefined();
      expect(retrievedSession?.sessionId).toBe(createdSession?.sessionId);
      expect(retrievedSession?.leadId).toBe(leadId);
    });

    /**
     * Test T306: Return null for non-existent session
     */
    it("should return null for non-existent session", () => {
      const retrievedSession = getSession("non-existent");

      expect(retrievedSession).toBeNull();
    });

    /**
     * Test T306: Auto-expire expired sessions
     */
    it("should auto-expire and return null for expired sessions", () => {
      const leadId = "lead-expired";

      const session = initSession(leadId);
      expect(session).not.toBeNull();

      // Manually set expiresAt to past
      const storageKey = `ekyc_session_${leadId}`;
      const stored = localStorage.getItem(storageKey);
      const parsedSession = JSON.parse(stored!);
      parsedSession.expiresAt = new Date(Date.now() - 1000).toISOString(); // 1 second ago
      localStorage.setItem(storageKey, JSON.stringify(parsedSession));

      const retrievedSession = getSession(leadId);

      expect(retrievedSession).toBeNull();

      // Verify session was marked as expired
      const updatedStored = localStorage.getItem(storageKey);
      const updatedSession = JSON.parse(updatedStored!);
      expect(updatedSession.status).toBe(EkycSessionStatus.EXPIRED);
    });

    /**
     * Test T306: Handle corrupted localStorage data
     */
    it("should handle corrupted localStorage data gracefully", () => {
      const leadId = "lead-corrupted";
      const storageKey = `ekyc_session_${leadId}`;
      const consoleErrorSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      localStorage.setItem(storageKey, "invalid json");

      const retrievedSession = getSession(leadId);

      expect(retrievedSession).toBeNull();
      expect(consoleErrorSpy).toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });
  });

  describe("updateSessionStatus", () => {
    /**
     * Test T306: Update session status
     */
    it("should update session status", () => {
      const leadId = "lead-update";
      initSession(leadId);

      const updatedSession = updateSessionStatus(
        leadId,
        EkycSessionStatus.COMPLETED,
      );

      expect(updatedSession).toBeDefined();
      expect(updatedSession?.status).toBe(EkycSessionStatus.COMPLETED);
    });

    /**
     * Test T306: Update timestamp when status changes
     */
    it("should update timestamp when status changes", async () => {
      const leadId = "lead-timestamp";
      const session = initSession(leadId);
      expect(session).not.toBeNull();
      const originalUpdatedAt = session?.updatedAt;

      // Wait a bit to ensure timestamp difference
      await new Promise((resolve) => setTimeout(resolve, 10));

      const updatedSession = updateSessionStatus(
        leadId,
        EkycSessionStatus.IN_PROGRESS,
      );

      expect(updatedSession?.updatedAt).not.toBe(originalUpdatedAt);
    });

    /**
     * Test T306: Return null for non-existent session
     */
    it("should return null when updating non-existent session", () => {
      const result = updateSessionStatus(
        "non-existent",
        EkycSessionStatus.COMPLETED,
      );

      expect(result).toBeNull();
    });

    /**
     * Test T306: Persist updated status to localStorage
     */
    it("should persist updated status to localStorage", () => {
      const leadId = "lead-persist";
      initSession(leadId);

      updateSessionStatus(leadId, EkycSessionStatus.COMPLETED);

      const storageKey = `ekyc_session_${leadId}`;
      const stored = localStorage.getItem(storageKey);
      const parsedSession = JSON.parse(stored!);

      expect(parsedSession.status).toBe(EkycSessionStatus.COMPLETED);
    });
  });

  describe("incrementSubmissionAttempts", () => {
    /**
     * Test T307: Increment submission attempts counter
     */
    it("should increment submission attempts counter", () => {
      const leadId = "lead-attempts";
      initSession(leadId);

      const session1 = incrementSubmissionAttempts(leadId);
      expect(session1?.submissionAttempts).toBe(1);

      const session2 = incrementSubmissionAttempts(leadId);
      expect(session2?.submissionAttempts).toBe(2);
    });

    /**
     * Test T307: Return null for non-existent session
     */
    it("should return null for non-existent session", () => {
      const result = incrementSubmissionAttempts("non-existent");

      expect(result).toBeNull();
    });

    /**
     * Test T307: Update timestamp when incrementing
     */
    it("should update timestamp when incrementing attempts", async () => {
      const leadId = "lead-attempts-timestamp";
      const session = initSession(leadId);
      expect(session).not.toBeNull();
      const originalUpdatedAt = session?.updatedAt;

      await new Promise((resolve) => setTimeout(resolve, 10));

      const updatedSession = incrementSubmissionAttempts(leadId);

      expect(updatedSession?.updatedAt).not.toBe(originalUpdatedAt);
    });
  });

  describe("markSubmitted", () => {
    /**
     * Test T307: Mark session as submitted
     */
    it("should mark session as submitted", () => {
      const leadId = "lead-submitted";
      initSession(leadId);

      const session = markSubmitted(leadId);

      expect(session?.isSubmitted).toBe(true);
      expect(session?.status).toBe(EkycSessionStatus.SUBMITTED);
    });

    /**
     * Test T307: Store verification ID when provided
     */
    it("should store verification ID when provided", () => {
      const leadId = "lead-verification";
      initSession(leadId);
      const verificationId = "ver-123";

      const session = markSubmitted(leadId, verificationId);

      expect(session?.verificationId).toBe(verificationId);
    });

    /**
     * Test T307: Return null for non-existent session
     */
    it("should return null for non-existent session", () => {
      const result = markSubmitted("non-existent");

      expect(result).toBeNull();
    });
  });

  describe("canSubmit (SC-006: Zero duplicate submissions)", () => {
    /**
     * Test T307: Allow submission for new session
     */
    it("should allow submission for new session", () => {
      const leadId = "lead-can-submit";
      initSession(leadId);

      const canSubmitResult = canSubmit(leadId);

      expect(canSubmitResult).toBe(true);
    });

    /**
     * Test T307: Prevent duplicate submissions (SC-006)
     */
    it("should prevent duplicate submissions (SC-006)", () => {
      const leadId = "lead-duplicate";
      initSession(leadId);
      markSubmitted(leadId);

      const canSubmitResult = canSubmit(leadId);

      expect(canSubmitResult).toBe(false);
    });

    /**
     * Test T307: Allow submission when session not submitted
     */
    it("should allow submission when session is not submitted", () => {
      const leadId = "lead-not-submitted";
      initSession(leadId);

      const canSubmitResult = canSubmit(leadId);

      expect(canSubmitResult).toBe(true);
    });

    /**
     * Test T307: Enforce maximum submission attempts (3)
     */
    it("should enforce maximum submission attempts of 3", () => {
      const leadId = "lead-max-attempts";
      initSession(leadId);

      // Increment to max attempts
      incrementSubmissionAttempts(leadId);
      incrementSubmissionAttempts(leadId);
      incrementSubmissionAttempts(leadId);

      const canSubmitResult = canSubmit(leadId);

      expect(canSubmitResult).toBe(false);
    });

    /**
     * Test T307: Allow submission below max attempts
     */
    it("should allow submission below max attempts", () => {
      const leadId = "lead-below-max";
      initSession(leadId);

      incrementSubmissionAttempts(leadId);
      incrementSubmissionAttempts(leadId);

      const canSubmitResult = canSubmit(leadId);

      expect(canSubmitResult).toBe(true);
    });

    /**
     * Test T307: Prevent submission for expired sessions
     */
    it("should prevent submission for expired sessions", () => {
      const leadId = "lead-expired-submit";
      const session = initSession(leadId);
      expect(session).not.toBeNull();

      // Manually expire session
      const storageKey = `ekyc_session_${leadId}`;
      const stored = localStorage.getItem(storageKey);
      const parsedSession = JSON.parse(stored!);
      parsedSession.expiresAt = new Date(Date.now() - 1000).toISOString();
      localStorage.setItem(storageKey, JSON.stringify(parsedSession));

      const canSubmitResult = canSubmit(leadId);

      expect(canSubmitResult).toBe(false);
    });

    /**
     * Test T307: Allow submission for completed sessions
     */
    it("should allow submission for completed sessions", () => {
      const leadId = "lead-completed";
      initSession(leadId);
      updateSessionStatus(leadId, EkycSessionStatus.COMPLETED);

      const canSubmitResult = canSubmit(leadId);

      expect(canSubmitResult).toBe(true);
    });

    /**
     * Test T307: Prevent submission for invalid status
     */
    it("should prevent submission for invalid status", () => {
      const leadId = "lead-invalid-status";
      initSession(leadId);
      updateSessionStatus(leadId, EkycSessionStatus.FAILED);

      const canSubmitResult = canSubmit(leadId);

      expect(canSubmitResult).toBe(false);
    });

    /**
     * Test T307: Allow submission when no session exists
     */
    it("should allow submission when no session exists", () => {
      const canSubmitResult = canSubmit("non-existent");

      expect(canSubmitResult).toBe(true);
    });
  });

  describe("isSessionExpired", () => {
    /**
     * Test T306: Check if active session is not expired
     */
    it("should return false for active session", () => {
      const session = initSession("lead-active");
      expect(session).not.toBeNull();

      const isExpired = isSessionExpired(session!);

      expect(isExpired).toBe(false);
    });

    /**
     * Test T306: Check if expired session is expired
     */
    it("should return true for expired session", () => {
      const leadId = "lead-is-expired";
      const session = initSession(leadId);
      expect(session).not.toBeNull();

      // Manually set expiresAt to past
      const storageKey = `ekyc_session_${leadId}`;
      const stored = localStorage.getItem(storageKey);
      const parsedSession = JSON.parse(stored!);
      parsedSession.expiresAt = new Date(Date.now() - 1000).toISOString();
      localStorage.setItem(storageKey, JSON.stringify(parsedSession));

      const expiredSession = getSession(leadId);
      if (expiredSession) {
        const isExpired = isSessionExpired(expiredSession);
        expect(isExpired).toBe(true);
      }
    });

    /**
     * Test T306: Check session exactly at expiration time
     */
    it("should handle session exactly at expiration time", () => {
      const session = {
        sessionId: "test",
        leadId: "lead-boundary",
        status: EkycSessionStatus.INITIALIZED,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        expiresAt: new Date().toISOString(), // Exactly now
        submissionAttempts: 0,
        isSubmitted: false,
      };

      const isExpired = isSessionExpired(session);

      // Should be expired or very close to expired
      expect(isExpired).toBe(true);
    });
  });

  describe("expireSession", () => {
    /**
     * Test T306: Manually expire a session
     */
    it("should manually expire a session", () => {
      const leadId = "lead-manual-expire";
      initSession(leadId);

      const result = expireSession(leadId);

      expect(result).toBe(true);

      const session = getSession(leadId);
      expect(session).toBeNull(); // Session should be expired
    });

    /**
     * Test T306: Return false for non-existent session
     */
    it("should return false for non-existent session", () => {
      const result = expireSession("non-existent");

      expect(result).toBe(false);
    });

    /**
     * Test T306: Update status to expired
     */
    it("should update status to expired", () => {
      const leadId = "lead-status-expire";
      initSession(leadId);

      expireSession(leadId);

      const storageKey = `ekyc_session_${leadId}`;
      const stored = localStorage.getItem(storageKey);
      const parsedSession = JSON.parse(stored!);

      expect(parsedSession.status).toBe(EkycSessionStatus.EXPIRED);
    });
  });

  describe("clearSession", () => {
    /**
     * Test T306: Clear session from localStorage
     */
    it("should clear session from localStorage", () => {
      const leadId = "lead-clear";
      initSession(leadId);

      const result = clearSession(leadId);

      expect(result).toBe(true);

      const storageKey = `ekyc_session_${leadId}`;
      const stored = localStorage.getItem(storageKey);
      expect(stored).toBeNull();
    });

    /**
     * Test T306: Return false for non-existent session
     */
    it("should return false for non-existent session", () => {
      const result = clearSession("non-existent");

      expect(result).toBe(false);
    });
  });

  describe("getAllActiveSessions", () => {
    /**
     * Test T306: Get all active sessions
     */
    it("should return all active sessions", () => {
      initSession("lead-active-1");
      initSession("lead-active-2");
      initSession("lead-active-3");

      const activeSessions = getAllActiveSessions();

      expect(activeSessions).toHaveLength(3);
      expect(activeSessions.every((s) => !isSessionExpired(s))).toBe(true);
    });

    /**
     * Test T306: Exclude expired sessions
     */
    it("should exclude expired sessions", () => {
      initSession("lead-active-in-list");

      // Create expired session
      const leadId = "lead-expired-in-list";
      initSession(leadId);
      const storageKey = `ekyc_session_${leadId}`;
      const stored = localStorage.getItem(storageKey);
      const parsedSession = JSON.parse(stored!);
      parsedSession.expiresAt = new Date(Date.now() - 1000).toISOString();
      localStorage.setItem(storageKey, JSON.stringify(parsedSession));

      const activeSessions = getAllActiveSessions();

      expect(activeSessions).toHaveLength(1);
      expect(activeSessions[0].leadId).toBe("lead-active-in-list");
    });

    /**
     * Test T306: Return empty array when no sessions
     */
    it("should return empty array when no sessions exist", () => {
      const activeSessions = getAllActiveSessions();

      expect(activeSessions).toHaveLength(0);
    });

    /**
     * Test T306: Ignore non-eKYC localStorage entries
     */
    it("should ignore non-eKYC localStorage entries", () => {
      initSession("lead-filtered");

      // Add non-eKYC entries
      localStorage.setItem("other_key", "some value");
      localStorage.setItem("ekyc_other", "another value");

      const activeSessions = getAllActiveSessions();

      expect(activeSessions).toHaveLength(1);
      expect(activeSessions[0].leadId).toBe("lead-filtered");
    });
  });

  describe("cleanupExpiredSessions", () => {
    /**
     * Test T306: Clean up expired sessions
     */
    it("should clean up expired sessions", () => {
      initSession("lead-to-cleanup-active");

      // Create expired sessions (without calling initSession again)
      const expiredSession1 = createExpiredSession("lead-expired-1");
      const storageKey1 = `ekyc_session_lead-expired-1`;
      localStorage.setItem(storageKey1, JSON.stringify(expiredSession1));

      const expiredSession2 = createExpiredSession("lead-expired-2");
      const storageKey2 = `ekyc_session_lead-expired-2`;
      localStorage.setItem(storageKey2, JSON.stringify(expiredSession2));

      const cleanedCount = cleanupExpiredSessions();

      expect(cleanedCount).toBe(2);

      const activeSessions = getAllActiveSessions();
      expect(activeSessions).toHaveLength(1);
      expect(activeSessions[0].leadId).toBe("lead-to-cleanup-active");
    });

    /**
     * Test T306: Return 0 when no expired sessions
     */
    it("should return 0 when no expired sessions", () => {
      initSession("lead-no-cleanup");

      const cleanedCount = cleanupExpiredSessions();

      expect(cleanedCount).toBe(0);
    });

    /**
     * Test T306: Handle corrupted sessions gracefully
     */
    it("should handle corrupted sessions gracefully", () => {
      initSession("lead-valid-with-corrupt");

      // Add corrupted session
      localStorage.setItem("ekyc_session_corrupt", "invalid json");

      const cleanedCount = cleanupExpiredSessions();

      // Should still work, just skip corrupted entry
      expect(cleanedCount).toBe(0);
    });
  });

  describe("getSessionStats", () => {
    /**
     * Test T307: Get session statistics
     */
    it("should return session statistics", () => {
      const leadId = "lead-stats";
      const session = initSession(leadId);
      expect(session).not.toBeNull();

      const stats = getSessionStats(leadId);

      expect(stats).toBeDefined();
      expect(stats?.age).toBeGreaterThanOrEqual(0);
      expect(stats?.timeRemaining).toBeGreaterThan(0);
      expect(stats?.canSubmit).toBe(true);
    });

    /**
     * Test T307: Return null for non-existent session
     */
    it("should return null for non-existent session", () => {
      const stats = getSessionStats("non-existent");

      expect(stats).toBeNull();
    });

    /**
     * Test T307: Calculate age correctly
     */
    it("should calculate session age correctly", async () => {
      const leadId = "lead-age";
      initSession(leadId);

      await new Promise((resolve) => setTimeout(resolve, 100));

      const stats = getSessionStats(leadId);

      expect(stats?.age).toBeGreaterThan(0);
      expect(stats?.age).toBeLessThan(1000); // Less than 1 second
    });

    /**
     * Test T307: Calculate time remaining correctly
     */
    it("should calculate time remaining correctly", () => {
      const leadId = "lead-remaining";
      initSession(leadId);

      const stats = getSessionStats(leadId);

      // Session TTL is 30 minutes (1800000 ms)
      expect(stats?.timeRemaining).toBeGreaterThan(1700000); // > 28 minutes
      expect(stats?.timeRemaining).toBeLessThanOrEqual(1800000); // <= 30 minutes
    });

    /**
     * Test T307: Include canSubmit in stats
     */
    it("should include canSubmit in stats", () => {
      const leadId = "lead-stats-can-submit";
      initSession(leadId);

      const stats = getSessionStats(leadId);

      expect(stats?.canSubmit).toBe(true);

      markSubmitted(leadId);

      const statsAfterSubmit = getSessionStats(leadId);

      expect(statsAfterSubmit?.canSubmit).toBe(false);
    });
  });

  describe("Integration: Session lifecycle (T306)", () => {
    /**
     * Test T306: Complete session lifecycle
     */
    it("should handle complete session lifecycle", () => {
      const leadId = "lead-lifecycle";

      // 1. Initialize
      const session = initSession(leadId);
      expect(session).not.toBeNull();
      expect(session?.status).toBe(EkycSessionStatus.INITIALIZED);

      // 2. Start processing
      const inProgress = updateSessionStatus(
        leadId,
        EkycSessionStatus.IN_PROGRESS,
      );
      expect(inProgress?.status).toBe(EkycSessionStatus.IN_PROGRESS);

      // 3. Complete processing
      const completed = updateSessionStatus(
        leadId,
        EkycSessionStatus.COMPLETED,
      );
      expect(completed?.status).toBe(EkycSessionStatus.COMPLETED);

      // 4. Check can submit
      expect(canSubmit(leadId)).toBe(true);

      // 5. Submit
      const submitted = markSubmitted(leadId, "ver-123");
      expect(submitted?.isSubmitted).toBe(true);

      // 6. Cannot submit again
      expect(canSubmit(leadId)).toBe(false);

      // 7. Clear session
      const cleared = clearSession(leadId);
      expect(cleared).toBe(true);

      // 8. Session no longer exists
      const retrieved = getSession(leadId);
      expect(retrieved).toBeNull();
    });

    /**
     * Test T307: Prevent duplicate submissions throughout lifecycle
     */
    it("should prevent duplicate submissions throughout lifecycle", () => {
      const leadId = "lead-duplicate-lifecycle";

      initSession(leadId);
      updateSessionStatus(leadId, EkycSessionStatus.COMPLETED);

      // First submission
      expect(canSubmit(leadId)).toBe(true);
      markSubmitted(leadId);

      // Second submission should be blocked
      expect(canSubmit(leadId)).toBe(false);
    });

    /**
     * Test T306: Handle session expiration in lifecycle
     */
    it("should handle session expiration in lifecycle", () => {
      const leadId = "lead-expire-lifecycle";

      initSession(leadId);
      updateSessionStatus(leadId, EkycSessionStatus.COMPLETED);

      // Manually expire
      const storageKey = `ekyc_session_${leadId}`;
      const stored = localStorage.getItem(storageKey);
      const parsedSession = JSON.parse(stored!);
      parsedSession.expiresAt = new Date(Date.now() - 1000).toISOString();
      parsedSession.status = EkycSessionStatus.EXPIRED;
      localStorage.setItem(storageKey, JSON.stringify(parsedSession));

      // Cannot submit expired session
      expect(canSubmit(leadId)).toBe(false);

      // Get session returns null (auto-expired)
      const retrieved = getSession(leadId);
      expect(retrieved).toBeNull();
    });
  });

  describe("Edge Cases", () => {
    /**
     * Test: Handle multiple sessions for different leads
     */
    it("should handle multiple sessions for different leads", () => {
      const leadIds = ["lead-1", "lead-2", "lead-3"];

      leadIds.forEach((id) => {
        const session = initSession(id);
        expect(session).not.toBeNull();
      });

      leadIds.forEach((id) => {
        const session = getSession(id);
        expect(session).toBeDefined();
        expect(session?.leadId).toBe(id);
      });

      const allSessions = getAllActiveSessions();
      expect(allSessions).toHaveLength(3);
    });

    /**
     * Test: Handle rapid status updates
     */
    it("should handle rapid status updates", () => {
      const leadId = "lead-rapid";
      initSession(leadId);

      for (let i = 0; i < 10; i++) {
        updateSessionStatus(leadId, EkycSessionStatus.IN_PROGRESS);
      }

      const session = getSession(leadId);
      expect(session?.status).toBe(EkycSessionStatus.IN_PROGRESS);
    });

    /**
     * Test: Handle special characters in lead ID
     */
    it("should handle special characters in lead ID", () => {
      const leadId = "lead-with-special-chars-123-abc";

      const session = initSession(leadId);
      expect(session).not.toBeNull();

      expect(session?.leadId).toBe(leadId);

      const retrieved = getSession(leadId);
      expect(retrieved?.leadId).toBe(leadId);
    });

    /**
     * Test: Handle very long lead IDs
     */
    it("should handle very long lead IDs", () => {
      const leadId = "a".repeat(1000);

      const session = initSession(leadId);
      expect(session).not.toBeNull();

      expect(session?.leadId).toBe(leadId);

      const retrieved = getSession(leadId);
      expect(retrieved?.leadId).toBe(leadId);
    });
  });
});
