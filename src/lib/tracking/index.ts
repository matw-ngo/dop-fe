/**
 * Main tracking module for financial tools
 * Provides privacy-compliant user tracking capabilities
 */

// Export types
export type {
  TrackingEvent,
  TrackingSession,
  TrackingConfig,
  DeviceInfo,
} from "./types";

export { EventType } from "./types";

// Export configuration
export {
  DEFAULT_TRACKING_CONFIG,
  TRACKING_ENDPOINTS,
  STORAGE_KEYS,
} from "./config";

// Export privacy utilities
export {
  isDNTEnabled,
  hasUserConsent,
  setUserConsent,
  isEventAllowed,
  filterSensitiveData,
  shouldEnableTracking,
  getPrivacySafeSessionId,
  clearTrackingData,
} from "./privacy";

// Export session management
export {
  generateDeviceFingerprint,
  getDeviceId,
  generateSessionId,
  initializeSession,
  getSessionId,
  updateLastActivity,
  isSessionValid,
  endSession,
  incrementPageViews,
} from "./session";

// Export event tracking
export {
  trackEvent,
  trackSavingsCalculator,
  trackLoanCalculator,
  trackSalaryCalculator,
  trackGeneric,
} from "./events";

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
