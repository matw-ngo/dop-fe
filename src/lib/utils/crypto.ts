/**
 * Cryptographic utilities for secure session ID generation and data encryption
 *
 * This module provides cryptographically secure random ID generation with multiple
 * fallback levels to ensure compatibility across different environments (browser, Node.js).
 */

/**
 * Generate cryptographically secure random session ID with 128-bit entropy
 *
 * Fallback chain:
 * 1. Primary: window.crypto.getRandomValues() - Browser Web Crypto API (128-bit)
 * 2. Secondary: window.crypto.randomUUID() - Browser UUID API (128-bit)
 * 3. Tertiary: Node.js crypto.randomBytes() - Server-side crypto (128-bit)
 * 4. Last resort: Multiple Math.random() calls with warning (NOT cryptographically secure)
 *
 * @returns 128-bit random ID as hex string (32 characters)
 *
 * @example
 * ```typescript
 * const sessionId = generateCryptoRandomId();
 * console.log(sessionId); // "a1b2c3d4e5f6..."
 * ```
 */
export function generateCryptoRandomId(): string {
  // Primary: Browser environment with Web Crypto API
  if (typeof window !== "undefined" && window.crypto?.getRandomValues) {
    const array = new Uint8Array(16); // 128 bits = 16 bytes
    window.crypto.getRandomValues(array);
    return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join(
      "",
    );
  }

  // Secondary: Browser fallback with crypto.randomUUID (also 128-bit)
  if (typeof window !== "undefined" && window.crypto?.randomUUID) {
    return window.crypto.randomUUID().replace(/-/g, "");
  }

  // Tertiary: Server-side Node.js environment
  if (typeof require !== "undefined") {
    try {
      // Dynamic require to avoid bundler issues
      const crypto = require("crypto");
      return crypto.randomBytes(16).toString("hex"); // 128 bits = 16 bytes
    } catch (e) {
      console.error("crypto module not available:", e);
    }
  }

  // Last resort fallback - NOT cryptographically secure
  console.warn(
    "SECURITY WARNING: Using insecure random ID generation. " +
      "This should not happen in production. " +
      "Web Crypto API and Node.js crypto module are not available.",
  );

  // Generate multiple random values to increase entropy (still not secure)
  const parts: string[] = [];
  for (let i = 0; i < 4; i++) {
    parts.push(Math.random().toString(36).substring(2));
  }
  return parts.join("") + Date.now().toString(36);
}

/**
 * Encrypt session data for sessionStorage
 *
 * Currently uses base64 encoding. For production use with sensitive data,
 * consider implementing proper encryption using Web Crypto API's SubtleCrypto.
 *
 * @param data - Data to encrypt (will be JSON stringified)
 * @returns Base64 encoded string
 *
 * @example
 * ```typescript
 * const session = { sessionId: "abc123", userId: "user1" };
 * const encrypted = encryptSessionData(session);
 * sessionStorage.setItem("session", encrypted);
 * ```
 */
export function encryptSessionData(data: unknown): string {
  try {
    const jsonString = JSON.stringify(data);
    // Base64 encoding for now
    // TODO: Implement proper encryption with Web Crypto API if needed
    return btoa(jsonString);
  } catch (error) {
    console.error("Failed to encrypt session data:", error);
    throw new Error("Session data encryption failed");
  }
}

/**
 * Decrypt session data from sessionStorage
 *
 * Decodes base64 encoded data and parses JSON.
 *
 * @param encrypted - Base64 encoded string
 * @returns Decrypted data or null if decryption fails
 *
 * @example
 * ```typescript
 * const encrypted = sessionStorage.getItem("session");
 * if (encrypted) {
 *   const session = decryptSessionData(encrypted);
 *   console.log(session);
 * }
 * ```
 */
export function decryptSessionData(encrypted: string): unknown {
  try {
    const jsonString = atob(encrypted);
    return JSON.parse(jsonString);
  } catch (error) {
    console.error("Failed to decrypt session data:", error);
    return null;
  }
}

/**
 * Validate that a string is a valid session ID format
 *
 * @param sessionId - String to validate
 * @returns True if valid session ID format
 *
 * @example
 * ```typescript
 * const id = generateCryptoRandomId();
 * console.log(isValidSessionId(id)); // true
 * console.log(isValidSessionId("invalid")); // false
 * ```
 */
export function isValidSessionId(sessionId: string): boolean {
  // Session ID should be a hex string of at least 32 characters (128 bits)
  // Allow only hex characters (no extra characters)
  return /^[0-9a-f]{32}$/i.test(sessionId);
}
