/**
 * Session Reset Hook
 *
 * Manages automatic session reset on form completion, navigation away, and logout.
 * Ensures verification sessions are properly cleaned up when no longer needed.
 */

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/store/use-auth-store";
import { useFormWizardStore } from "@/components/form-generation/store/use-form-wizard-store";

// ============================================================================
// Types
// ============================================================================

export interface UseSessionResetOptions {
  /** Callback invoked when session is reset */
  onReset?: () => void;
}

export interface UseSessionResetReturn {
  /** Manually reset the session */
  resetSession: () => void;
}

// ============================================================================
// Hook Implementation
// ============================================================================

export function useSessionReset(
  options: UseSessionResetOptions = {},
): UseSessionResetReturn {
  const pathname = usePathname();
  const authStore = useAuthStore();
  const wizardStore = useFormWizardStore();

  // Track route changes to detect navigation away
  const prevPathnameRef = useRef<string>(pathname);

  // Track route changes
  useEffect(() => {
    const prevPathname = prevPathnameRef.current;

    // Only trigger on actual route change, not initial mount
    if (prevPathname !== pathname) {
      // Check if navigating away from loan application
      const wasInLoanApp =
        prevPathname.includes("/user-onboarding") ||
        prevPathname.includes("/loan-application");
      const isInLoanApp =
        pathname.includes("/user-onboarding") ||
        pathname.includes("/loan-application");

      if (wasInLoanApp && !isInLoanApp) {
        // User navigated away from loan application
        authStore.clearVerificationSession();
        wizardStore.resetWizard();
        options.onReset?.();
      }
    }

    // Update ref for next comparison
    prevPathnameRef.current = pathname;
  }, [pathname, authStore, wizardStore, options]);

  // Listen to logout events
  useEffect(() => {
    let prevIsAuthenticated = authStore.isAuthenticated;

    // Subscribe to auth state changes
    const unsubscribe = useAuthStore.subscribe((state) => {
      const isAuthenticated = state.isAuthenticated;

      // User logged out
      if (prevIsAuthenticated && !isAuthenticated) {
        authStore.clearVerificationSession();
        wizardStore.resetWizard();
        options.onReset?.();
      }

      prevIsAuthenticated = isAuthenticated;
    });

    return unsubscribe;
  }, [authStore, wizardStore, options]);

  // Provide manual reset function
  const resetSession = () => {
    authStore.clearVerificationSession();
    wizardStore.resetWizard();
    options.onReset?.();
  };

  return { resetSession };
}
