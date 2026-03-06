import { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { deleteCookie, getCookie, setCookie } from "@/lib/utils/cookie";

const COOKIE_NAME = "consent_session_id";
const COOKIE_MAX_AGE = 2592000; // 30 days in seconds

/**
 * Module-level cache for performance optimization
 * Reduces cookie reads on subsequent hook calls
 */
let cachedSessionId: string | null = null;

/**
 * Hook for managing consent session IDs with cookie-based storage
 *
 * **LAZY INITIALIZATION**: Session ID is only created when explicitly requested
 * via `createSession()`. This ensures GDPR compliance by not setting cookies
 * before user consent.
 *
 * **Features:**
 * - Lazy session creation (only when needed)
 * - Automatic 30-day expiry via cookie max-age (no manual timestamp checking)
 * - Secure flag for HTTPS-only transmission
 * - SameSite=Lax for CSRF protection while allowing external navigation
 * - Module-level caching for performance optimization
 * - Backward compatibility with localStorage migration
 * - Graceful fallback to in-memory storage when cookies are disabled
 *
 * **Cookie Configuration:**
 * - Name: `consent_session_id`
 * - Max-Age: 2592000 seconds (30 days)
 * - Secure: true (HTTPS only)
 * - SameSite: Lax
 * - HttpOnly: false (JavaScript access required)
 * - Path: / (available across entire application)
 *
 * **Migration Behavior:**
 * On first initialization, checks for legacy localStorage session ID.
 * If found and not expired (< 30 days old), migrates to cookie and cleans up localStorage.
 *
 * **Error Handling:**
 * - Cookie write failures → falls back to in-memory storage
 * - Cookie read failures → returns null
 * - Migration failures → logs error and returns null
 *
 * @returns {Object} Session management object
 * @returns {string | null} sessionId - Current session ID (UUID v4 format) or null if not yet created
 * @returns {function} createSession - Function to explicitly create a new session
 *
 * @example
 * ```typescript
 * function ConsentFlow() {
 *   const { sessionId, createSession } = useConsentSession();
 *
 *   const handleGrantConsent = async () => {
 *     // Create session only when user grants consent
 *     const newSessionId = createSession();
 *     await grantConsent({ sessionId: newSessionId });
 *   };
 *
 *   return <Button onClick={handleGrantConsent}>Accept</Button>;
 * }
 * ```
 *
 * @see {@link clearConsentSessionCookie} - Manually clear session cookie
 * @see {@link isCookieSupported} - Check cookie support
 */
export const useConsentSession = () => {
  const [sessionId, setSessionId] = useState<string | null>(cachedSessionId);

  useEffect(() => {
    // Use cached value if available
    if (cachedSessionId) {
      if (sessionId !== cachedSessionId) {
        setSessionId(cachedSessionId);
      }
      return;
    }

    // Check for existing session in cookie (from previous visit)
    const cookieSession = getCookie(COOKIE_NAME);

    if (cookieSession) {
      cachedSessionId = cookieSession;
      setSessionId(cookieSession);
      console.info("[Consent Session] Retrieved existing session from cookie", {
        sessionId: cookieSession,
        timestamp: new Date().toISOString(),
      });
      return;
    }

    // Backward compatibility: migrate from localStorage if exists
    const legacySession = migrateFromLocalStorage();
    if (legacySession) {
      cachedSessionId = legacySession;
      setSessionId(legacySession);
      return;
    }

    // DO NOT create session automatically - wait for explicit createSession() call
    console.info(
      "[Consent Session] No existing session found, waiting for explicit creation",
      {
        timestamp: new Date().toISOString(),
      },
    );
  }, [sessionId]);

  /**
   * Explicitly create a new session ID
   * Should be called only when user grants consent
   */
  const createSession = (): string => {
    // If session already exists, return it
    if (cachedSessionId) {
      console.info("[Consent Session] Reusing existing session ID", {
        sessionId: cachedSessionId,
        timestamp: new Date().toISOString(),
      });
      return cachedSessionId;
    }

    // Create new session
    const newSessionId = uuidv4();
    const success = setCookie(COOKIE_NAME, newSessionId, {
      maxAge: COOKIE_MAX_AGE,
      secure: true,
      sameSite: "Lax",
      path: "/",
    });

    if (success) {
      cachedSessionId = newSessionId;
      setSessionId(newSessionId);
      console.info("[Consent Session] Created new session ID", {
        sessionId: newSessionId,
        timestamp: new Date().toISOString(),
      });
    } else {
      // Fallback to in-memory storage if cookie write fails
      console.warn(
        "[Consent Session] Cookie write failed, using in-memory storage",
        {
          fallbackActive: true,
          timestamp: new Date().toISOString(),
        },
      );
      cachedSessionId = newSessionId;
      setSessionId(newSessionId);
    }

    return newSessionId;
  };

  return { sessionId, createSession };
};

/**
 * Migrate session ID from legacy localStorage to cookie storage
 *
 * Checks for existing localStorage session ID and timestamp, validates the
 * 30-day expiry, and migrates to cookie if still valid. Cleans up localStorage
 * after successful migration.
 *
 * **Migration Steps:**
 * 1. Check for localStorage entries (consent_session_id + timestamp)
 * 2. Validate timestamp is within 30-day window
 * 3. Write session ID to cookie with 30-day expiry
 * 4. Remove localStorage entries on success
 *
 * **Error Conditions:**
 * - No legacy data → returns null (no migration needed)
 * - Expired session (> 30 days) → cleans up localStorage, returns null
 * - Invalid timestamp → cleans up localStorage, returns null
 * - Cookie write fails → keeps localStorage as fallback, returns session ID
 * - Parse error → logs error, returns null
 *
 * @returns {string | null} Migrated session ID or null if no valid legacy data exists
 *
 * @private
 * @internal
 */
function migrateFromLocalStorage(): string | null {
  if (typeof localStorage === "undefined") {
    return null;
  }

  try {
    const legacySessionId = localStorage.getItem(COOKIE_NAME);
    const legacyTimestamp = localStorage.getItem(`${COOKIE_NAME}_timestamp`);

    if (!legacySessionId || !legacyTimestamp) {
      return null; // No migration needed
    }

    // Validate expiry (30 days)
    const now = Date.now();
    const sessionTime = parseInt(legacyTimestamp, 10);
    const daysDiff = (now - sessionTime) / (1000 * 60 * 60 * 24);

    if (isNaN(sessionTime) || daysDiff > 30) {
      console.warn("[Consent Session] Legacy session expired or invalid", {
        daysDiff: isNaN(sessionTime) ? "invalid" : daysDiff.toFixed(2),
        timestamp: new Date().toISOString(),
      });
      localStorage.removeItem(COOKIE_NAME);
      localStorage.removeItem(`${COOKIE_NAME}_timestamp`);
      return null;
    }

    // Migrate to cookie
    const success = setCookie(COOKIE_NAME, legacySessionId, {
      maxAge: COOKIE_MAX_AGE,
      secure: true,
      sameSite: "Lax",
      path: "/",
    });

    if (success) {
      console.info(
        "[Consent Session] Successfully migrated session ID from localStorage to cookie",
        {
          source: "localStorage",
          destination: "cookie",
          sessionId: legacySessionId,
          timestamp: new Date().toISOString(),
        },
      );
      localStorage.removeItem(COOKIE_NAME);
      localStorage.removeItem(`${COOKIE_NAME}_timestamp`);
      return legacySessionId;
    } else {
      console.error(
        "[Consent Session] Failed to write cookie during migration, keeping localStorage",
        {
          timestamp: new Date().toISOString(),
        },
      );
      return legacySessionId; // Use legacy storage as fallback
    }
  } catch (error) {
    console.error("[Consent Session] Migration failed:", error, {
      timestamp: new Date().toISOString(),
    });
    return null;
  }
}

/**
 * Utility function to manually clear the session ID cookie
 *
 * Removes the consent_session_id cookie and clears the module-level cache.
 * Used for testing, explicit session termination, or GDPR data deletion requests.
 *
 * **Use Cases:**
 * - User logout or session termination
 * - Testing and development
 * - GDPR "right to be forgotten" requests
 * - Debugging consent flow issues
 *
 * @example
 * ```typescript
 * // Clear session on logout
 * function handleLogout() {
 *   clearConsentSessionCookie();
 *   // ... other logout logic
 * }
 *
 * // Clear session in tests
 * beforeEach(() => {
 *   clearConsentSessionCookie();
 * });
 * ```
 *
 * @see {@link useConsentSession} - Session management hook
 * @see {@link clearAllConsentCookies} - Clear all consent-related cookies
 */
export function clearConsentSessionCookie(): void {
  deleteCookie(COOKIE_NAME);
  cachedSessionId = null;
  console.info("[Consent Session] Session cookie cleared", {
    timestamp: new Date().toISOString(),
  });
}

/**
 * Utility function to detect if cookies are supported
 *
 * Attempts to write and read a test cookie to verify browser cookie support.
 * Returns false in SSR environments or when cookies are disabled by user/browser.
 *
 * **Detection Method:**
 * 1. Writes a test cookie with 1-second expiry
 * 2. Reads document.cookie to verify write succeeded
 * 3. Cleans up test cookie immediately
 * 4. Returns true only if write and read both succeed
 *
 * **Returns false when:**
 * - Running in SSR/Node.js environment (document undefined)
 * - User has disabled cookies in browser settings
 * - Browser privacy mode blocks cookies
 * - Cookie quota exceeded
 * - Any error occurs during test
 *
 * @returns {boolean} True if cookies can be written and read, false otherwise
 *
 * @example
 * ```typescript
 * // Check cookie support before using consent features
 * if (!isCookieSupported()) {
 *   console.warn('Cookies disabled, using fallback storage');
 *   // Show user notification or use alternative storage
 * }
 *
 * // Conditional feature enablement
 * const useCookieStorage = isCookieSupported();
 * ```
 *
 * @see {@link useConsentSession} - Uses cookie detection for fallback logic
 */
export function isCookieSupported(): boolean {
  if (typeof document === "undefined") {
    return false; // SSR environment
  }

  try {
    const testKey = "__cookie_test__";
    const testValue = "1";
    document.cookie = `${testKey}=${testValue}; max-age=1`;
    const supported = document.cookie.indexOf(testKey) !== -1;
    document.cookie = `${testKey}=; max-age=0`; // Cleanup

    if (!supported) {
      console.warn("[Cookie Detection] Cookies are not supported or disabled", {
        timestamp: new Date().toISOString(),
      });
    }

    return supported;
  } catch (error) {
    console.error(
      "[Cookie Detection] Failed to detect cookie support:",
      error,
      {
        timestamp: new Date().toISOString(),
      },
    );
    return false;
  }
}
