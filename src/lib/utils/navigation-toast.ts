/**
 * Navigation Toast Utilities
 *
 * Utility functions for showing navigation-related toast notifications.
 * These functions provide consistent toast behavior across the application.
 */

import { toast } from "@/hooks/ui/use-toast";

/**
 * Show toast when navigation is blocked after OTP verification
 *
 * @param t - Translation function from useTranslations
 */
export function showNavigationBlockedToast(t: any) {
  toast({
    title: t("navigation.blocked.title"),
    description: t("navigation.blocked.afterVerification"),
    variant: "default",
    duration: 3000,
  });
}

/**
 * Show toast when verification session has expired
 *
 * @param t - Translation function from useTranslations
 */
export function showSessionExpiredToast(t: any) {
  toast({
    title: t("navigation.sessionExpired.title"),
    description: t("navigation.sessionExpired.message"),
    variant: "destructive",
    duration: 5000,
  });
}

/**
 * Show warning toast when session is about to expire
 *
 * @param t - Translation function from useTranslations
 * @param seconds - Seconds remaining until expiration
 */
export function showSessionTimeoutWarning(t: any, seconds: number) {
  toast({
    title: t("navigation.sessionTimeout.title"),
    description: t("navigation.sessionTimeout.warning", { seconds }),
    variant: "default",
    duration: 10000,
  });
}
