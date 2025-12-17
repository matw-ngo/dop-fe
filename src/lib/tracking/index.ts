/**
 * Main tracking module for financial tools
 * Provides privacy-compliant user tracking capabilities
 */

// Export configuration
export {
  DEFAULT_TRACKING_CONFIG,
  STORAGE_KEYS,
  TRACKING_ENDPOINTS,
} from "./config";
// Export event tracking
export {
  trackEvent,
  trackGeneric,
  trackLoanCalculator,
  trackSalaryCalculator,
  trackSavingsCalculator,
} from "./events";
// Export privacy utilities
export {
  clearTrackingData,
  filterSensitiveData,
  getPrivacySafeSessionId,
  hasUserConsent,
  isDNTEnabled,
  isEventAllowed,
  setUserConsent,
  shouldEnableTracking,
} from "./privacy";
// Export session management
export {
  endSession,
  generateDeviceFingerprint,
  generateSessionId,
  getDeviceId,
  getSessionId,
  incrementPageViews,
  initializeSession,
  isSessionValid,
  updateLastActivity,
} from "./session";
// Export types
export type {
  DeviceInfo,
  TrackingConfig,
  TrackingEvent,
  TrackingSession,
} from "./types";
export { EventType } from "./types";

/**
 * Initialize tracking system
 * Call this once when the application starts
 */
export const initializeTracking = async (): Promise<void> => {
  // Only run in browser
  if (typeof window === "undefined") return;

  // Initialize session
  await initializeSession();

  // Set up activity tracking
  let activityTimeout: NodeJS.Timeout;

  const handleActivity = () => {
    updateLastActivity();

    // Clear existing timeout
    if (activityTimeout) {
      clearTimeout(activityTimeout);
    }

    // Set new timeout to end session after inactivity
    activityTimeout = setTimeout(
      async () => {
        await endSession();
      },
      30 * 60 * 1000,
    ); // 30 minutes
  };

  // Track various user activities
  const events = ["mousedown", "keydown", "scroll", "touchstart", "mousemove"];
  events.forEach((event) => {
    document.addEventListener(event, handleActivity, { passive: true });
  });

  // Handle page visibility changes
  document.addEventListener("visibilitychange", async () => {
    if (document.hidden) {
      // Page is hidden, update activity
      updateLastActivity();
    } else {
      // Page is visible, check if session is still valid
      if (!isSessionValid()) {
        await initializeSession();
      }
    }
  });

  // Handle page unload
  window.addEventListener("beforeunload", async () => {
    await endSession();
  });

  // Initial activity
  handleActivity();
};

/**
 * React hook for tracking
 * Provides easy integration with React components
 */
export const useTracking = () => {
  return {
    trackEvent,
    trackSavingsCalculator,
    trackLoanCalculator,
    trackSalaryCalculator,
    trackGeneric,
    setUserConsent,
    hasUserConsent: hasUserConsent(),
    isTrackingEnabled: hasUserConsent() && !isDNTEnabled(),
  };
};
