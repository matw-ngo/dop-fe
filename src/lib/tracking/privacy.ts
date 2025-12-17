import { STORAGE_KEYS } from "./config";
import type { EventType } from "./types";

/**
 * Privacy-aware utilities for tracking
 * Ensures compliance with privacy regulations and user preferences
 */

/**
 * Check if Do Not Track is enabled in the browser
 */
export const isDNTEnabled = (): boolean => {
  if (typeof window === "undefined") return false;
  return (
    navigator.doNotTrack === "1" ||
    window.doNotTrack === "1" ||
    navigator.msDoNotTrack === "1"
  );
};

/**
 * Check if user has given consent for tracking
 */
export const hasUserConsent = (): boolean => {
  if (typeof window === "undefined") return false;

  const consent = localStorage.getItem(STORAGE_KEYS.USER_CONSENT);
  return consent === "true";
};

/**
 * Set user consent for tracking
 */
export const setUserConsent = (consent: boolean): void => {
  if (typeof window === "undefined") return;

  localStorage.setItem(STORAGE_KEYS.USER_CONSENT, consent.toString());
};

/**
 * Check if an event type is allowed based on privacy settings
 */
export const isEventAllowed = (
  eventType: EventType,
  allowedEvents: EventType[],
): boolean => {
  return allowedEvents.includes(eventType);
};

/**
 * Filter sensitive data from tracking payload
 */
export const filterSensitiveData = (
  data: Record<string, any>,
): Record<string, any> => {
  const sensitiveKeys = [
    "password",
    "ssn",
    "socialSecurityNumber",
    "bankAccount",
    "creditCard",
    "phone",
    "email",
    "fullName",
    "address",
    "idNumber",
  ];

  const filtered: Record<string, any> = {};

  for (const [key, value] of Object.entries(data)) {
    // Check if key contains sensitive information
    const isSensitive = sensitiveKeys.some((sensitiveKey) =>
      key.toLowerCase().includes(sensitiveKey.toLowerCase()),
    );

    if (!isSensitive) {
      filtered[key] = value;
    } else {
      // Hash sensitive values instead of sending them raw
      if (value && typeof value === "string") {
        filtered[key] = hashValue(value);
      }
    }
  }

  return filtered;
};

/**
 * Simple hash function for sensitive data (client-side only)
 * In production, consider using a proper crypto library
 */
const hashValue = (value: string): string => {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    const char = value.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return hash.toString(16);
};

/**
 * Check if tracking should be enabled based on all privacy checks
 */
export const shouldEnableTracking = (
  respectDNT: boolean,
  hasConsent: boolean,
): boolean => {
  // If DNT is enabled and we respect it, disable tracking
  if (respectDNT && isDNTEnabled()) {
    return false;
  }

  // Require explicit consent
  return hasConsent;
};

/**
 * Get privacy-compliant session ID
 */
export const getPrivacySafeSessionId = (): string | null => {
  if (typeof window === "undefined") return null;

  const sessionId = sessionStorage.getItem(STORAGE_KEYS.SESSION_ID);
  return sessionId;
};

/**
 * Clear all tracking data from storage
 */
export const clearTrackingData = (): void => {
  if (typeof window === "undefined") return;

  const keys = Object.values(STORAGE_KEYS);
  keys.forEach((key) => {
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);
  });
};
