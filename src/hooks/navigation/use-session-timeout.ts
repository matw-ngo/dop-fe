/**
 * Session Timeout Hook
 *
 * Manages verification session timeout with activity tracking and debounced updates.
 * Monitors session expiration and triggers cleanup when timeout occurs.
 */

import { useEffect, useState, useCallback, useRef } from "react";
import { useNavigationConfig } from "@/contexts/NavigationConfigContext";
import { useAuthStore } from "@/store/use-auth-store";
import { useFormWizardStore } from "@/components/form-generation/store/use-form-wizard-store";
import { useToast } from "@/hooks/ui/use-toast";
import { useTranslations } from "next-intl";

// ============================================================================
// Types
// ============================================================================

export interface UseSessionTimeoutOptions {
  /** Interval for checking timeout in milliseconds (default: 10000ms = 10 seconds) */
  checkInterval?: number;
  /** Debounce delay for activity updates in milliseconds (default: 1000ms = 1 second) */
  activityDebounce?: number;
}

export interface UseSessionTimeoutReturn {
  /** Seconds remaining until session expires, null if no timeout */
  timeRemaining: number | null;
  /** Whether the session has expired */
  isExpired: boolean;
  /** Manually reset the timeout */
  resetTimeout: () => void;
}

// ============================================================================
// Hook Implementation
// ============================================================================

export function useSessionTimeout(
  options: UseSessionTimeoutOptions = {},
): UseSessionTimeoutReturn {
  const { checkInterval = 10000, activityDebounce = 1000 } = options;

  const config = useNavigationConfig();
  const authStore = useAuthStore();
  const wizardStore = useFormWizardStore();
  const { toast } = useToast();
  const t = useTranslations("features.loan-application.navigation");

  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const isExpiredRef = useRef(false); // Use ref to avoid dependency issues

  const activityTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const checkIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Debounced activity handler
  const handleActivity = useCallback(() => {
    if (!config.config.enableSessionTimeout) {
      return;
    }

    // Clear existing timeout
    if (activityTimeoutRef.current) {
      clearTimeout(activityTimeoutRef.current);
    }

    // Debounce: only update after user stops interacting for specified duration
    activityTimeoutRef.current = setTimeout(() => {
      authStore.updateSessionActivity();
    }, activityDebounce);
  }, [config.config.enableSessionTimeout, authStore, activityDebounce]);

  // Check session timeout
  const checkTimeout = useCallback(() => {
    if (!config.config.enableSessionTimeout) {
      return;
    }

    const session = authStore.verificationSession;
    if (!session || !session.expiresAt) {
      setTimeRemaining(null);
      isExpiredRef.current = false;
      return;
    }

    const now = Date.now();
    const expiresAt = new Date(session.expiresAt).getTime();
    const remaining = Math.max(0, Math.ceil((expiresAt - now) / 1000));

    setTimeRemaining(remaining);

    // Use ref to check expiration without causing re-renders
    if (remaining === 0 && !isExpiredRef.current) {
      // Session expired
      isExpiredRef.current = true;

      // Clear session
      authStore.clearVerificationSession();

      // Reset wizard to first step
      wizardStore.goToStep(0);

      // Show notification
      if (config.config.enableUserNotifications) {
        toast({
          title: t("sessionExpired.title"),
          description: t("sessionExpired.message"),
          variant: "destructive",
          duration: 5000,
        });
      }
    }
  }, [
    config.config.enableSessionTimeout,
    config.config.enableUserNotifications,
    authStore,
    wizardStore,
    toast,
    t,
  ]);

  // Reset timeout manually
  const resetTimeout = useCallback(() => {
    if (config.config.enableSessionTimeout) {
      authStore.updateSessionActivity();
      isExpiredRef.current = false;
    }
  }, [config.config.enableSessionTimeout, authStore]);

  // Setup timeout checker
  useEffect(() => {
    if (!config.config.enableSessionTimeout) {
      return;
    }

    // Initial check
    checkTimeout();

    // Check every interval
    checkIntervalRef.current = setInterval(checkTimeout, checkInterval);

    return () => {
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
      }
    };
  }, [config.config.enableSessionTimeout, checkTimeout, checkInterval]);

  // Setup activity tracking
  useEffect(() => {
    if (!config.config.enableSessionTimeout) {
      return;
    }

    // Activity event listeners
    const events = ["click", "keydown", "scroll", "mousemove", "touchstart"];

    events.forEach((event) => {
      window.addEventListener(event, handleActivity, { passive: true });
    });

    return () => {
      // Cleanup event listeners
      events.forEach((event) => {
        window.removeEventListener(event, handleActivity);
      });

      // Cleanup debounce timeout
      if (activityTimeoutRef.current) {
        clearTimeout(activityTimeoutRef.current);
      }
    };
  }, [config.config.enableSessionTimeout, handleActivity]);

  return {
    timeRemaining,
    isExpired: isExpiredRef.current,
    resetTimeout,
  };
}
