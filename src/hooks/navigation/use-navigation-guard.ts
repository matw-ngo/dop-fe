/**
 * Navigation Guard Hook
 *
 * Centralized navigation guard logic with browser history management.
 * Blocks back navigation to pre-OTP steps after verification.
 */

import { useTranslations } from "next-intl";
import { useEffect, useMemo, useRef, useState } from "react";
import { useFormWizardStore } from "@/components/form-generation/store/use-form-wizard-store";
import type { NavigationConfig } from "@/contexts/NavigationConfigContext";
import { getNavigationConfig } from "@/contexts/NavigationConfigContext";
import { showNavigationBlockedToast } from "@/lib/utils/navigation-toast";
import { useAuthStore } from "@/store/use-auth-store";

// ============================================================================
// Types
// ============================================================================

export interface UseNavigationGuardOptions {
  enabled?: boolean;
  onNavigationBlocked?: (reason: string) => void;
}

export interface UseNavigationGuardReturn {
  isNavigationBlocked: boolean;
  blockReason: string | null;
  canGoBack: boolean;
  canGoForward: boolean;
}

// ============================================================================
// Hook Implementation
// ============================================================================

// Default config when provider is not available
const DEFAULT_CONFIG: NavigationConfig = {
  enableBackNavigationBlock: false,
  enableServerValidation: false,
  enableUserNotifications: false,
  enableSessionTimeout: false,
  sessionTimeoutMinutes: 15,
};

export function useNavigationGuard(
  options: UseNavigationGuardOptions = {},
): UseNavigationGuardReturn {
  // Get config without requiring React context (graceful fallback)
  // Use ref to avoid re-renders and infinite loops
  const configRef = useRef<NavigationConfig | null>(null);

  // Initialize config once on first render
  if (configRef.current === null) {
    try {
      configRef.current = getNavigationConfig();
    } catch (_error) {
      // Provider not available, use default config
      configRef.current = DEFAULT_CONFIG;
    }
  }

  const config = configRef.current;

  const verificationSession = useAuthStore(
    (state) => state.verificationSession,
  );

  const currentStep = useFormWizardStore((state) => state.currentStep);
  const otpStepIndex = useFormWizardStore((state) => state.otpStepIndex);
  const visitedSteps = useFormWizardStore((state) => state.visitedSteps);
  const stepsLength = useFormWizardStore((state) => state.steps.length);
  const registerBeforeStepChange = useFormWizardStore(
    (state) => state.registerBeforeStepChange,
  );
  const unregisterBeforeStepChange = useFormWizardStore(
    (state) => state.unregisterBeforeStepChange,
  );
  const goToStep = useFormWizardStore((state) => state.goToStep);
  const t = useTranslations("features.loan-application");

  const [isNavigationBlocked, setIsNavigationBlocked] = useState(false);
  const [blockReason, setBlockReason] = useState<string | null>(null);

  // Stable reference to callback to avoid re-registering
  const onNavigationBlockedRef = useRef(options.onNavigationBlocked);

  // Update ref when callback changes (separate effect)
  useEffect(() => {
    onNavigationBlockedRef.current = options.onNavigationBlocked;
  }, [options.onNavigationBlocked]);

  // Register beforeStepChange callback
  useEffect(() => {
    if (!config) return;

    const callback = (from: number, to: number): boolean => {
      if (!config.enableBackNavigationBlock) {
        return true; // Allow all navigation
      }

      const session = verificationSession;
      if (!session || !session.isLocked) {
        return true; // No session lock
      }

      if (otpStepIndex === null) {
        return true; // No OTP step detected
      }

      // Block navigation to pre-OTP steps AND to OTP step itself
      // Allow only navigation to steps AFTER OTP (to > otpStepIndex)
      if (to <= otpStepIndex && from > otpStepIndex) {
        setIsNavigationBlocked(true);
        setBlockReason("navigation.blocked.afterVerification");

        if (config.enableUserNotifications) {
          showNavigationBlockedToast(t);
        }

        onNavigationBlockedRef.current?.("pre_otp_step");
        return false;
      }

      return true;
    };

    registerBeforeStepChange(callback);

    return () => {
      unregisterBeforeStepChange();
    };
  }, [
    config,
    otpStepIndex,
    registerBeforeStepChange,
    t,
    unregisterBeforeStepChange,
    verificationSession,
  ]);

  // Browser history management
  useEffect(() => {
    if (!config || !config.enableBackNavigationBlock) {
      return;
    }

    const handlePopState = (event: PopStateEvent) => {
      const session = verificationSession;

      if (otpStepIndex === null) {
        return; // No OTP step detected
      }

      const targetStep = event.state?.step;

      // Case 1: Block navigation to pre-OTP steps AND OTP step itself
      if (
        session?.isLocked &&
        targetStep !== undefined &&
        targetStep <= otpStepIndex
      ) {
        // Block navigation
        event.preventDefault();

        // Push current state back to maintain position
        window.history.pushState(
          { step: currentStep },
          "",
          window.location.href,
        );

        if (config.enableUserNotifications) {
          showNavigationBlockedToast(t);
        }

        return;
      }

      // Case 2: Allow navigation between post-OTP steps
      if (
        session?.isLocked &&
        targetStep !== undefined &&
        targetStep > otpStepIndex
      ) {
        // Check if target step was visited
        if (visitedSteps.includes(targetStep)) {
          // Allow navigation to visited post-OTP step
          goToStep(targetStep);
        } else {
          // Block navigation to unvisited step
          event.preventDefault();

          window.history.pushState(
            { step: currentStep },
            "",
            window.location.href,
          );
        }
      }
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [
    config,
    currentStep,
    goToStep,
    otpStepIndex,
    t,
    verificationSession,
    visitedSteps,
  ]);

  const canGoBack = useMemo(() => {
    if (!config) return false;

    const session = verificationSession;

    if (!config.enableBackNavigationBlock) {
      return currentStep > 0;
    }

    if (!session || !session.isLocked || otpStepIndex === null) {
      return currentStep > 0;
    }

    // Can go back if:
    // 1. Current step is after OTP step, AND
    // 2. Previous step (currentStep - 1) is > OTP step (not equal, to block OTP step)
    // This allows back navigation within post-OTP steps but NOT to OTP step
    return currentStep > 0 && currentStep - 1 > otpStepIndex;
  }, [config, currentStep, otpStepIndex, verificationSession]);

  const canGoForward = useMemo(() => {
    if (currentStep >= stepsLength - 1) {
      return false;
    }

    // Can go forward if next step was visited
    return visitedSteps.includes(currentStep + 1);
  }, [currentStep, stepsLength, visitedSteps]);

  return {
    isNavigationBlocked,
    blockReason,
    canGoBack,
    canGoForward,
  };
}
