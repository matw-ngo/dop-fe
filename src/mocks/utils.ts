/**
 * MSW Development Utilities
 *
 * Utilities for managing MSW in development mode
 */

import { worker } from "./browser";

// Track MSW running state
let _isMSWRunning = false;

// MSW Control Functions
export const mswUtils = {
  /**
   * Check if MSW is running
   */
  isRunning: () => _isMSWRunning,

  /**
   * Start MSW worker (called automatically by MSWProvider)
   */
  start: () => {
    if (worker && !_isMSWRunning) {
      try {
        worker.start({
          onUnhandledRequest: "bypass",
          quiet: false,
        });
        _isMSWRunning = true;
        console.log("🚀 MSW started - API requests will be mocked");
      } catch (error) {
        console.error("Failed to start MSW:", error);
      }
    }
  },

  /**
   * Stop MSW worker
   */
  stop: () => {
    if (worker && _isMSWRunning) {
      try {
        worker.stop();
        _isMSWRunning = false;
        console.log("⏹️ MSW stopped - API requests will hit real backend");
      } catch (error) {
        console.error("Failed to stop MSW:", error);
      }
    }
  },

  /**
   * Toggle MSW on/off
   */
  toggle: () => {
    if (_isMSWRunning) {
      mswUtils.stop();
    } else {
      mswUtils.start();
    }
  },

  /**
   * Get MSW status
   */
  getStatus: () => ({
    isRunning: _isMSWRunning,
    status: _isMSWRunning ? "running" : "stopped",
  }),
};

// Development helpers
if (typeof window !== "undefined") {
  // Expose MSW utils globally in development
  if (process.env.NODE_ENV === "development") {
    (window as any).msw = mswUtils;
    console.log("💡 MSW utils available at window.msw");
    console.log("   - window.msw.isRunning()");
    console.log("   - window.msw.start()");
    console.log("   - window.msw.stop()");
    console.log("   - window.msw.toggle()");
    console.log("   - window.msw.getStatus()");
  }
}
