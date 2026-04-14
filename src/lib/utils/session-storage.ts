/**
 * Session storage utilities for verification session management
 *
 * This module provides utilities for persisting, restoring, and clearing
 * verification sessions in sessionStorage with encryption support.
 */

import { encryptSessionData, decryptSessionData } from "./crypto";

/**
 * Verification session interface
 */
export interface VerificationSession {
  sessionId: string;
  isLocked: boolean;
  otpStepIndex: number;
  verifiedAt: Date;
  expiresAt: Date | null;
  lastActivity: Date;
}

/**
 * Session storage key prefix to namespace verification sessions
 */
const SESSION_KEY_PREFIX = "dop_verification_";

/**
 * Persist verification session to sessionStorage with encryption
 *
 * Automatically clears all old verification sessions before persisting the new one
 * to prevent conflicts and ensure only one active session exists.
 *
 * @param session - Verification session to persist
 *
 * @example
 * ```typescript
 * const session: VerificationSession = {
 *   sessionId: "abc123",
 *   isLocked: true,
 *   otpStepIndex: 2,
 *   verifiedAt: new Date(),
 *   expiresAt: new Date(Date.now() + 15 * 60 * 1000),
 *   lastActivity: new Date(),
 * };
 *
 * persistVerificationSession(session);
 * ```
 */
export function persistVerificationSession(session: VerificationSession): void {
  try {
    // Clear all old verification sessions first to avoid conflicts
    clearVerificationSession();

    // Store new session with unique key
    const key = `${SESSION_KEY_PREFIX}${session.sessionId}`;
    const encrypted = encryptSessionData(session);
    sessionStorage.setItem(key, encrypted);
  } catch (error) {
    console.error("Failed to persist verification session:", error);
  }
}

/**
 * Restore verification session from sessionStorage
 *
 * If multiple sessions exist (shouldn't happen, but handled for robustness),
 * this function validates all sessions and returns the most recent one based
 * on the verifiedAt timestamp. Invalid sessions are automatically removed.
 *
 * @returns Restored verification session or null if none found
 *
 * @example
 * ```typescript
 * const session = restoreVerificationSession();
 * if (session) {
 *   console.log("Session restored:", session.sessionId);
 * }
 * ```
 */
export function restoreVerificationSession(): VerificationSession | null {
  try {
    const keys = Object.keys(sessionStorage).filter((k) =>
      k.startsWith(SESSION_KEY_PREFIX),
    );

    if (keys.length === 0) {
      return null;
    }

    // If multiple keys exist (shouldn't happen, but handle it), use the most recent
    let sessionToRestore: VerificationSession | null = null;
    let latestTimestamp = 0;

    for (const key of keys) {
      const encrypted = sessionStorage.getItem(key);
      if (!encrypted) continue;

      const session = decryptSessionData(encrypted) as VerificationSession;

      // Validate session structure
      if (!session || !session.sessionId || !session.verifiedAt) {
        // Invalid session, remove it
        sessionStorage.removeItem(key);
        continue;
      }

      const timestamp = new Date(session.verifiedAt).getTime();
      if (timestamp > latestTimestamp) {
        latestTimestamp = timestamp;
        sessionToRestore = session;
      }
    }

    return sessionToRestore;
  } catch (error) {
    console.error("Failed to restore verification session:", error);
    return null;
  }
}

/**
 * Clear all verification sessions from sessionStorage
 *
 * Removes all keys with the verification session prefix.
 *
 * @example
 * ```typescript
 * clearVerificationSession();
 * console.log("All verification sessions cleared");
 * ```
 */
export function clearVerificationSession(): void {
  try {
    const keys = Object.keys(sessionStorage).filter((k) =>
      k.startsWith(SESSION_KEY_PREFIX),
    );
    for (const key of keys) {
      sessionStorage.removeItem(key);
    }
  } catch (error) {
    console.error("Failed to clear verification session:", error);
  }
}

/**
 * Check if a verification session exists in sessionStorage
 *
 * @returns True if at least one verification session exists
 *
 * @example
 * ```typescript
 * if (hasVerificationSession()) {
 *   console.log("Session exists");
 * }
 * ```
 */
export function hasVerificationSession(): boolean {
  try {
    const keys = Object.keys(sessionStorage).filter((k) =>
      k.startsWith(SESSION_KEY_PREFIX),
    );
    return keys.length > 0;
  } catch (error) {
    console.error("Failed to check verification session:", error);
    return false;
  }
}
