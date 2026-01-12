/**
 * eKYC Session Manager
 *
 * Manages eKYC session state using localStorage for persistence.
 * Handles session lifecycle: init, update, expire, and cleanup.
 *
 * @module session-manager
 */

import { EkycSessionStatus } from "./types";
import type { EkycSessionState } from "./types";
import {
  logSessionInit,
  logSessionUpdate,
  logSessionExpire,
  logSessionClear,
  logDuplicatePrevented,
} from "./audit-logger";

/**
 * Session TTL in milliseconds (30 minutes)
 */
const SESSION_TTL_MS = 30 * 60 * 1000;

/**
 * Maximum submission attempts allowed
 */
const MAX_SUBMISSION_ATTEMPTS = 3;

/**
 * LocalStorage key prefix for eKYC sessions
 */
const STORAGE_KEY_PREFIX = "ekyc_session_";

/**
 * Gets the localStorage key for a given lead ID
 */
function getStorageKey(leadId: string): string {
  return `${STORAGE_KEY_PREFIX}${leadId}`;
}

/**
 * Generates a unique session ID
 */
function generateSessionId(): string {
  return `ekyc_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
}

/**
 * Calculates expiration timestamp from current time
 */
function calculateExpirationTime(): string {
  return new Date(Date.now() + SESSION_TTL_MS).toISOString();
}

/**
 * Creates a new session state object
 */
function createSessionState(leadId: string, initialStatus: EkycSessionStatus): EkycSessionState {
  const now = new Date().toISOString();
  return {
    sessionId: generateSessionId(),
    leadId,
    status: initialStatus,
    createdAt: now,
    updatedAt: now,
    expiresAt: calculateExpirationTime(),
    submissionAttempts: 0,
    isSubmitted: false,
  };
}

/**
 * Initializes a new eKYC session for a lead
 *
 * @param leadId - The lead ID to create a session for
 * @param initialStatus - The initial session status (default: INITIALIZED)
 * @returns The created session state
 *
 * @example
 * ```ts
 * const session = initSession("lead-123");
 * console.log(session.sessionId); // "ekyc_1234567890_abc123"
 * ```
 */
export function initSession(
  leadId: string,
  initialStatus: EkycSessionStatus = EkycSessionStatus.INITIALIZED,
): EkycSessionState {
  const session = createSessionState(leadId, initialStatus);
  
  // Store in localStorage
  try {
    localStorage.setItem(getStorageKey(leadId), JSON.stringify(session));
  } catch (error) {
    console.error("[Session] Failed to store session:", error);
  }

  logSessionInit(leadId, session.sessionId);
  return session;
}

/**
 * Retrieves an existing session for a lead
 *
 * @param leadId - The lead ID to get session for
 * @returns The session state, or null if not found or expired
 */
export function getSession(leadId: string): EkycSessionState | null {
  try {
    const stored = localStorage.getItem(getStorageKey(leadId));
    if (!stored) return null;

    const session = JSON.parse(stored) as EkycSessionState;

    // Check if session is expired
    if (isSessionExpired(session)) {
      // Auto-expire session
      expireSession(leadId);
      return null;
    }

    return session;
  } catch (error) {
    console.error("[Session] Failed to retrieve session:", error);
    return null;
  }
}

/**
 * Updates the session status
 *
 * @param leadId - The lead ID to update session for
 * @param newStatus - The new status to set
 * @returns The updated session state, or null if session not found
 */
export function updateSessionStatus(
  leadId: string,
  newStatus: EkycSessionStatus,
): EkycSessionState | null {
  const session = getSession(leadId);
  if (!session) return null;

  session.status = newStatus;
  session.updatedAt = new Date().toISOString();

  // Store updated session
  try {
    localStorage.setItem(getStorageKey(leadId), JSON.stringify(session));
  } catch (error) {
    console.error("[Session] Failed to update session:", error);
    return null;
  }

  logSessionUpdate(leadId, session.sessionId, newStatus);
  return session;
}

/**
 * Increments the submission attempt counter
 *
 * @param leadId - The lead ID to increment attempts for
 * @returns The updated session state, or null if session not found
 */
export function incrementSubmissionAttempts(leadId: string): EkycSessionState | null {
  const session = getSession(leadId);
  if (!session) return null;

  session.submissionAttempts += 1;
  session.updatedAt = new Date().toISOString();

  // Store updated session
  try {
    localStorage.setItem(getStorageKey(leadId), JSON.stringify(session));
  } catch (error) {
    console.error("[Session] Failed to update submission attempts:", error);
    return null;
  }

  return session;
}

/**
 * Marks the session as submitted
 *
 * @param leadId - The lead ID to mark as submitted
 * @param verificationId - Optional verification ID from backend
 * @returns The updated session state, or null if session not found
 */
export function markSubmitted(leadId: string, verificationId?: string): EkycSessionState | null {
  const session = getSession(leadId);
  if (!session) return null;

  session.isSubmitted = true;
  session.status = EkycSessionStatus.SUBMITTED;
  session.updatedAt = new Date().toISOString();
  if (verificationId) {
    session.verificationId = verificationId;
  }

  // Store updated session
  try {
    localStorage.setItem(getStorageKey(leadId), JSON.stringify(session));
  } catch (error) {
    console.error("[Session] Failed to mark session as submitted:", error);
    return null;
  }

  logSessionUpdate(leadId, session.sessionId, EkycSessionStatus.SUBMITTED);
  return session;
}

/**
 * Checks if a session can submit (prevents duplicate submissions)
 *
 * @param leadId - The lead ID to check
 * @returns true if submission is allowed, false otherwise
 */
export function canSubmit(leadId: string): boolean {
  const session = getSession(leadId);
  if (!session) return true; // No session exists, allow submission

  // Check if already submitted
  if (session.isSubmitted) {
    logDuplicatePrevented(leadId, session.sessionId);
    return false;
  }

  // Check submission attempt limit
  if (session.submissionAttempts >= MAX_SUBMISSION_ATTEMPTS) {
    return false;
  }

  // Check if session is expired
  if (isSessionExpired(session)) {
    return false;
  }

  // Check if session is in a valid state for submission
  const validStatuses: EkycSessionStatus[] = [
    EkycSessionStatus.COMPLETED,
    EkycSessionStatus.INITIALIZED,
  ];
  if (!validStatuses.includes(session.status)) {
    return false;
  }

  return true;
}

/**
 * Checks if a session is expired
 *
 * @param session - The session to check
 * @returns true if session is expired
 */
export function isSessionExpired(session: EkycSessionState): boolean {
  const now = new Date();
  const expiresAt = new Date(session.expiresAt);
  return now > expiresAt;
}

/**
 * Manually expires a session
 *
 * @param leadId - The lead ID to expire session for
 * @returns true if session was expired, false if not found
 */
export function expireSession(leadId: string): boolean {
  const session = getSession(leadId);
  if (!session) return false;

  // Update session status to expired
  session.status = EkycSessionStatus.EXPIRED;
  session.updatedAt = new Date().toISOString();

  try {
    localStorage.setItem(getStorageKey(leadId), JSON.stringify(session));
  } catch (error) {
    console.error("[Session] Failed to expire session:", error);
    return false;
  }

  logSessionExpire(leadId, session.sessionId);
  return true;
}

/**
 * Clears a session from storage
 *
 * @param leadId - The lead ID to clear session for
 * @returns true if session was cleared, false if not found
 */
export function clearSession(leadId: string): boolean {
  const session = getSession(leadId);
  if (!session) return false;

  try {
    localStorage.removeItem(getStorageKey(leadId));
    logSessionClear(leadId, session.sessionId);
    return true;
  } catch (error) {
    console.error("[Session] Failed to clear session:", error);
    return false;
  }
}

/**
 * Gets all active (non-expired) sessions
 * Useful for cleanup operations
 *
 * @returns Array of active session states
 */
export function getAllActiveSessions(): EkycSessionState[] {
  const sessions: EkycSessionState[] = [];

  // Iterate through all localStorage keys
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key?.startsWith(STORAGE_KEY_PREFIX)) continue;

    try {
      const stored = localStorage.getItem(key);
      if (!stored) continue;

      const session = JSON.parse(stored) as EkycSessionState;
      
      // Only include non-expired sessions
      if (!isSessionExpired(session)) {
        sessions.push(session);
      }
    } catch (error) {
      console.error("[Session] Failed to parse session:", error);
    }
  }

  return sessions;
}

/**
 * Cleans up all expired sessions from localStorage
 * Should be called periodically to prevent storage bloat
 *
 * @returns Number of sessions cleaned up
 */
export function cleanupExpiredSessions(): number {
  let cleanedCount = 0;

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key?.startsWith(STORAGE_KEY_PREFIX)) continue;

    try {
      const stored = localStorage.getItem(key);
      if (!stored) continue;

      const session = JSON.parse(stored) as EkycSessionState;
      
      // Remove expired sessions
      if (isSessionExpired(session)) {
        localStorage.removeItem(key);
        cleanedCount++;
      }
    } catch (error) {
      console.error("[Session] Failed to cleanup session:", error);
    }
  }

  return cleanedCount;
}

/**
 * Gets session statistics
 *
 * @param leadId - The lead ID to get stats for
 * @returns Session statistics or null if session not found
 */
export function getSessionStats(leadId: string): {
  age: number;
  timeRemaining: number;
  canSubmit: boolean;
} | null {
  const session = getSession(leadId);
  if (!session) return null;

  const now = new Date();
  const created = new Date(session.createdAt);
  const expires = new Date(session.expiresAt);

  return {
    age: now.getTime() - created.getTime(),
    timeRemaining: expires.getTime() - now.getTime(),
    canSubmit: canSubmit(leadId),
  };
}
