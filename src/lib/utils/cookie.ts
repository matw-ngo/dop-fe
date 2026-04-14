/**
 * Cookie utility functions for consent storage
 *
 * Provides type-safe cookie operations with SSR compatibility.
 * All functions include automatic URL encoding/decoding and error handling.
 *
 * @module cookie
 * @see {@link setCookie} - Set a cookie with options
 * @see {@link getCookie} - Retrieve a cookie value
 * @see {@link deleteCookie} - Remove a cookie
 */

/**
 * Configuration options for cookie operations
 *
 * @interface CookieOptions
 * @property {number} [maxAge] - Cookie lifetime in seconds (default: 2592000 = 30 days)
 * @property {boolean} [secure] - Require HTTPS transmission (default: true)
 * @property {'Strict' | 'Lax' | 'None'} [sameSite] - CSRF protection level (default: 'Lax')
 * @property {string} [path] - Cookie path scope (default: '/')
 */
export interface CookieOptions {
  maxAge?: number; // seconds
  secure?: boolean;
  sameSite?: "Strict" | "Lax" | "None";
  path?: string;
}

/**
 * Set a cookie with specified options
 *
 * Automatically URL-encodes the cookie name and value for safe storage.
 * Returns false in SSR environments or when cookie write fails.
 *
 * @param {string} name - Cookie name (will be URL-encoded)
 * @param {string} value - Cookie value (will be URL-encoded)
 * @param {CookieOptions} [options={}] - Cookie configuration options
 * @param {number} [options.maxAge=2592000] - Cookie lifetime in seconds (default: 30 days)
 * @param {boolean} [options.secure=true] - Require HTTPS transmission
 * @param {'Strict' | 'Lax' | 'None'} [options.sameSite='Lax'] - CSRF protection level
 * @param {string} [options.path='/'] - Cookie path scope
 *
 * @returns {boolean} True if cookie was set successfully, false otherwise
 *
 * @example
 * ```typescript
 * // Set a session ID cookie with default options (30 days, secure, Lax)
 * const success = setCookie('session_id', 'abc123');
 *
 * // Set a short-lived cookie (1 hour)
 * setCookie('temp_token', 'xyz789', { maxAge: 3600 });
 *
 * // Set a strict same-site cookie
 * setCookie('csrf_token', 'token123', { sameSite: 'Strict' });
 * ```
 *
 * @see {@link getCookie} - Retrieve cookie value
 * @see {@link deleteCookie} - Remove cookie
 */
export function setCookie(
  name: string,
  value: string,
  options: CookieOptions = {},
): boolean {
  // SSR compatibility check
  if (typeof document === "undefined") {
    console.warn("[Cookie Utils] Cannot set cookie in SSR environment");
    return false;
  }

  try {
    const {
      maxAge = 2592000, // 30 days default
      secure = true,
      sameSite = "Lax",
      path = "/",
    } = options;

    let cookieString = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;
    cookieString += `; max-age=${maxAge}`;
    cookieString += `; path=${path}`;
    cookieString += `; samesite=${sameSite}`;

    if (secure) {
      cookieString += "; secure";
    }

    document.cookie = cookieString;

    // Log successful cookie write with size and timestamp
    const sizeInBytes = new Blob([value]).size;
    console.info(
      `[Cookie Utils] Successfully set cookie "${name}" (${sizeInBytes} bytes, expires in ${maxAge}s)`,
      { timestamp: new Date().toISOString() },
    );

    return true;
  } catch (error) {
    console.error(`[Cookie Utils] Failed to set cookie "${name}":`, error, {
      timestamp: new Date().toISOString(),
      valueLength: value.length,
    });
    return false;
  }
}

/**
 * Get a cookie value by name
 *
 * Automatically URL-decodes the cookie value.
 * Returns null in SSR environments, when cookie doesn't exist, or on read errors.
 *
 * @param {string} name - Cookie name to retrieve
 * @returns {string | null} Cookie value (URL-decoded) or null if not found
 *
 * @example
 * ```typescript
 * // Retrieve a session ID
 * const sessionId = getCookie('session_id');
 * if (sessionId) {
 *   console.log('Session found:', sessionId);
 * }
 *
 * // Check for consent status
 * const consentState = getCookie('dop_consent_state');
 * const consent = consentState ? JSON.parse(consentState) : null;
 * ```
 *
 * @see {@link setCookie} - Set cookie value
 * @see {@link deleteCookie} - Remove cookie
 */
export function getCookie(name: string): string | null {
  // SSR compatibility check
  if (typeof document === "undefined") {
    return null;
  }

  try {
    const nameEQ = `${encodeURIComponent(name)}=`;
    const cookies = document.cookie.split(";");

    for (let cookie of cookies) {
      cookie = cookie.trim();
      if (cookie.startsWith(nameEQ)) {
        const value = decodeURIComponent(cookie.substring(nameEQ.length));
        return value;
      }
    }
    return null;
  } catch (error) {
    console.error(`[Cookie Utils] Failed to get cookie "${name}":`, error, {
      timestamp: new Date().toISOString(),
    });
    return null;
  }
}

/**
 * Delete a cookie by name
 *
 * Sets the cookie's max-age to 0, causing immediate expiration.
 * The path parameter must match the path used when setting the cookie.
 *
 * @param {string} name - Cookie name to delete
 * @param {string} [path='/'] - Cookie path (must match the path used when setting the cookie)
 *
 * @example
 * ```typescript
 * // Delete a session cookie
 * deleteCookie('session_id');
 *
 * // Delete a cookie with specific path
 * deleteCookie('user_pref', '/dashboard');
 *
 * // GDPR data deletion
 * deleteCookie('consent_session_id');
 * deleteCookie('dop_consent_state');
 * ```
 *
 * @see {@link setCookie} - Set cookie value
 * @see {@link getCookie} - Retrieve cookie value
 */
export function deleteCookie(name: string, path: string = "/"): void {
  // SSR compatibility check
  if (typeof document === "undefined") {
    return;
  }

  try {
    document.cookie = `${encodeURIComponent(name)}=; max-age=0; path=${path}`;
    console.info(`[Cookie Utils] Successfully deleted cookie "${name}"`, {
      timestamp: new Date().toISOString(),
      path,
    });
  } catch (error) {
    console.error(`[Cookie Utils] Failed to delete cookie "${name}":`, error, {
      timestamp: new Date().toISOString(),
      path,
    });
  }
}
