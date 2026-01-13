import type { TrackingConfig } from "./types";

/**
 * Default tracking configuration
 * Can be overridden by environment variables
 */
export const DEFAULT_TRACKING_CONFIG: TrackingConfig = {
  apiBaseUrl: process.env.NEXT_PUBLIC_API_URL || "https://dop-stg.datanest.vn/",
  serviceName: "finzone",
  enabled: process.env.NODE_ENV === "production",
  privacy: {
    respectDNT: true,
    hasConsent: false,
    allowedEvents: [
      // Allow all tool-related events by default
      "tool_savings_page_view",
      "tool_savings_filter_change",
      "tool_savings_calculate",
      "tool_savings_sort_change",
      "tool_loan_page_view",
      "tool_loan_calculate",
      "tool_loan_form_submit",
      "tool_salary_page_view",
      "tool_salary_calculate",
      "page_view",
      "calculation_performed",
    ] as any[],
  },
};

/**
 * API endpoints for tracking
 */
export const TRACKING_ENDPOINTS = {
  EVENT: "/tracking/event",
  SESSION: "/tracking/session",
  DEVICE: "/tracking/device",
} as const;

/**
 * Storage keys for tracking data
 */
export const STORAGE_KEYS = {
  SESSION_ID: "tracking_session_id",
  DEVICE_ID: "tracking_device_id",
  SESSION_START: "tracking_session_start",
  USER_CONSENT: "tracking_user_consent",
  LAST_ACTIVITY: "tracking_last_activity",
} as const;
