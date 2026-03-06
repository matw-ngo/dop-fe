/**
 * Navigation Events System
 *
 * Event-based system for navigation notifications outside React tree.
 * Allows axios interceptors and other non-React code to trigger UI notifications.
 */

// ============================================================================
// Event Constants
// ============================================================================

export const NavigationEvents = {
  SESSION_INVALID: "navigation:session-invalid",
  OTP_REQUIRED: "navigation:otp-required",
} as const;

// ============================================================================
// Event Types
// ============================================================================

export interface NavigationEventDetail {
  timestamp: number;
  message?: string;
}

// ============================================================================
// Event Emitters
// ============================================================================

/**
 * Emit session invalid event
 *
 * Used when server returns 401 unauthenticated error for verification session.
 * React components can listen to this event and show appropriate toast notifications.
 *
 * @param message - Optional error message from server
 *
 * @example
 * ```typescript
 * // In axios interceptor
 * if (error.response?.status === 401) {
 *   emitSessionInvalid(error.response?.data?.message);
 * }
 * ```
 */
export function emitSessionInvalid(message?: string): void {
  if (typeof window === "undefined") return;

  window.dispatchEvent(
    new CustomEvent<NavigationEventDetail>(NavigationEvents.SESSION_INVALID, {
      detail: { timestamp: Date.now(), message },
    }),
  );
}

/**
 * Emit OTP required event
 *
 * Used when server returns 403 permission_denied error indicating OTP verification needed.
 * React components can listen to this event and show appropriate toast notifications.
 *
 * @param message - Optional error message from server
 *
 * @example
 * ```typescript
 * // In axios interceptor
 * if (error.response?.status === 403) {
 *   emitOTPRequired(error.response?.data?.message);
 * }
 * ```
 */
export function emitOTPRequired(message?: string): void {
  if (typeof window === "undefined") return;

  window.dispatchEvent(
    new CustomEvent<NavigationEventDetail>(NavigationEvents.OTP_REQUIRED, {
      detail: { timestamp: Date.now(), message },
    }),
  );
}

// ============================================================================
// Type Guards
// ============================================================================

/**
 * Type guard to check if event is a NavigationEvent
 */
export function isNavigationEvent(
  event: Event,
): event is CustomEvent<NavigationEventDetail> {
  return (
    event instanceof CustomEvent &&
    "detail" in event &&
    typeof event.detail === "object" &&
    event.detail !== null &&
    "timestamp" in event.detail
  );
}
