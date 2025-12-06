import type { TrackingSession, DeviceInfo } from "./types";
import { STORAGE_KEYS, DEFAULT_TRACKING_CONFIG } from "./config";
import { shouldEnableTracking, getPrivacySafeSessionId } from "./privacy";

/**
 * Session management for tracking
 */

/**
 * Generate a unique device fingerprint
 */
export const generateDeviceFingerprint = (): string => {
  if (typeof window === "undefined") return "server-device";

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  // Simple canvas fingerprint
  if (ctx) {
    ctx.textBaseline = "top";
    ctx.font = "14px Arial";
    ctx.fillText("Device fingerprint", 2, 2);
  }

  const fingerprint = [
    navigator.userAgent,
    navigator.language,
    screen.width + "x" + screen.height,
    new Date().getTimezoneOffset(),
    canvas.toDataURL(),
    navigator.hardwareConcurrency,
    navigator.deviceMemory || "unknown",
  ].join("|");

  // Simple hash (in production, use a proper crypto hash)
  let hash = 0;
  for (let i = 0; i < fingerprint.length; i++) {
    const char = fingerprint.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }

  return Math.abs(hash).toString(36);
};

/**
 * Get or create device ID
 */
export const getDeviceId = (): string => {
  if (typeof window === "undefined") return "server-device";

  let deviceId = localStorage.getItem(STORAGE_KEYS.DEVICE_ID);

  if (!deviceId) {
    deviceId = generateDeviceFingerprint();
    localStorage.setItem(STORAGE_KEYS.DEVICE_ID, deviceId);
  }

  return deviceId;
};

/**
 * Generate a new session ID
 */
export const generateSessionId = (): string => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2);
  return `${timestamp}-${random}`;
};

/**
 * Initialize a new tracking session
 */
export const initializeSession = async (): Promise<string | null> => {
  if (typeof window === "undefined") return null;

  // Check if tracking should be enabled
  if (
    !shouldEnableTracking(
      DEFAULT_TRACKING_CONFIG.privacy.respectDNT,
      DEFAULT_TRACKING_CONFIG.privacy.hasConsent,
    )
  ) {
    return null;
  }

  // Check if session already exists
  const existingSessionId = getPrivacySafeSessionId();
  if (existingSessionId) {
    updateLastActivity();
    return existingSessionId;
  }

  // Create new session
  const sessionId = generateSessionId();
  const deviceId = getDeviceId();
  const startTime = Date.now();

  // Store session data
  sessionStorage.setItem(STORAGE_KEYS.SESSION_ID, sessionId);
  sessionStorage.setItem(STORAGE_KEYS.SESSION_START, startTime.toString());
  localStorage.setItem(STORAGE_KEYS.LAST_ACTIVITY, startTime.toString());

  try {
    // Send session initialization to server
    const sessionData: TrackingSession = {
      sessionId,
      deviceId,
      startTime,
      activeTime: 0,
      source: document.referrer || "direct",
      pageViews: 0,
      service: DEFAULT_TRACKING_CONFIG.serviceName,
    };

    // Note: In a real implementation, you would send this to your tracking API
    // For now, we'll just log it for debugging
    if (process.env.NODE_ENV === "development") {
      console.log("Tracking session initialized:", sessionData);
    }

    return sessionId;
  } catch (error) {
    console.error("Failed to initialize tracking session:", error);
    return sessionId;
  }
};

/**
 * Get current session ID
 */
export const getSessionId = (): string | null => {
  return getPrivacySafeSessionId();
};

/**
 * Update last activity timestamp
 */
export const updateLastActivity = (): void => {
  if (typeof window === "undefined") return;

  const now = Date.now();
  sessionStorage.setItem(STORAGE_KEYS.LAST_ACTIVITY, now.toString());
  localStorage.setItem(STORAGE_KEYS.LAST_ACTIVITY, now.toString());
};

/**
 * Check if session is still valid (not expired)
 */
export const isSessionValid = (): boolean => {
  if (typeof window === "undefined") return false;

  const lastActivity = localStorage.getItem(STORAGE_KEYS.LAST_ACTIVITY);
  if (!lastActivity) return false;

  // Consider session expired after 30 minutes of inactivity
  const SESSION_TIMEOUT = 30 * 60 * 1000;
  const timeSinceActivity = Date.now() - parseInt(lastActivity);

  return timeSinceActivity < SESSION_TIMEOUT;
};

/**
 * End current session
 */
export const endSession = async (): Promise<void> => {
  if (typeof window === "undefined") return;

  const sessionId = getSessionId();
  if (!sessionId) return;

  const startTime = sessionStorage.getItem(STORAGE_KEYS.SESSION_START);
  if (!startTime) return;

  const endTime = Date.now();
  const activeTime = endTime - parseInt(startTime);

  try {
    // Send session end to server
    const sessionData: Partial<TrackingSession> = {
      sessionId,
      endTime,
      activeTime: Math.floor(activeTime / 1000), // Convert to seconds
    };

    // Note: In a real implementation, you would send this to your tracking API
    if (process.env.NODE_ENV === "development") {
      console.log("Tracking session ended:", sessionData);
    }
  } catch (error) {
    console.error("Failed to end tracking session:", error);
  } finally {
    // Clear session data
    sessionStorage.removeItem(STORAGE_KEYS.SESSION_ID);
    sessionStorage.removeItem(STORAGE_KEYS.SESSION_START);
    sessionStorage.removeItem(STORAGE_KEYS.LAST_ACTIVITY);
  }
};

/**
 * Increment page views for current session
 */
export const incrementPageViews = (): void => {
  if (typeof window === "undefined") return;

  const sessionId = getSessionId();
  if (!sessionId) return;

  try {
    // Note: This would typically be tracked on the server
    if (process.env.NODE_ENV === "development") {
      console.log("Page view incremented for session:", sessionId);
    }
  } catch (error) {
    console.error("Failed to increment page views:", error);
  }
};
