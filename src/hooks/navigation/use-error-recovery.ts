/**
 * Error Recovery Hook
 *
 * Handles error recovery for corrupted sessions and inconsistent state.
 * Provides automatic recovery mechanisms and manual reset options.
 */

import { useState, useEffect, useCallback } from "react";
import { useAuthStore } from "@/store/use-auth-store";
import { useFormWizardStore } from "@/components/form-generation/store/use-form-wizard-store";
import { useToast } from "@/hooks/ui/use-toast";
import { useTranslations } from "next-intl";

// ============================================================================
// Types
// ============================================================================

export interface NavigationError {
  type: "session_corrupt" | "history_inconsistent" | "step_invalid";
  message: string;
  recoveryAction: "reset" | "reconstruct" | "redirect";
}

export interface UseErrorRecoveryOptions {
  /** Callback invoked when an error is detected */
  onError?: (error: NavigationError) => void;
}

export interface UseErrorRecoveryReturn {
  /** Whether an error has been detected */
  hasError: boolean;
  /** The current error, if any */
  error: NavigationError | null;
  /** Manually trigger recovery */
  recover: () => void;
  /** Whether to show the manual reset button */
  showResetButton: boolean;
}

// ============================================================================
// Hook Implementation
// ============================================================================

export function useErrorRecovery(
  options: UseErrorRecoveryOptions = {},
): UseErrorRecoveryReturn {
  const authStore = useAuthStore();
  const wizardStore = useFormWizardStore();
  const { toast } = useToast();
  const t = useTranslations("features.loan-application.navigation");

  const [hasError, setHasError] = useState(false);
  const [error, setError] = useState<NavigationError | null>(null);

  // Check for corrupted verification session
  const checkSessionIntegrity = useCallback(() => {
    const session = authStore.verificationSession;

    if (!session) {
      return true; // No session, no corruption
    }

    // Validate session structure
    if (
      !session.sessionId ||
      !session.verifiedAt ||
      session.otpStepIndex === undefined
    ) {
      const error: NavigationError = {
        type: "session_corrupt",
        message: "Verification session is corrupted",
        recoveryAction: "reset",
      };

      setHasError(true);
      setError(error);
      options.onError?.(error);

      // Auto-recover: clear session and redirect
      authStore.clearVerificationSession();
      wizardStore.goToStep(0);

      toast({
        title: t("error.sessionCorrupt.title"),
        description: t("error.sessionCorrupt.message"),
        variant: "destructive",
      });

      return false;
    }

    return true;
  }, [authStore, wizardStore, toast, t, options]);

  // Check for inconsistent browser history state
  const checkHistoryIntegrity = useCallback(() => {
    const historyState = window.history.state;
    const currentStep = wizardStore.currentStep;

    if (historyState?.step !== undefined && historyState.step !== currentStep) {
      const error: NavigationError = {
        type: "history_inconsistent",
        message: "Browser history state is inconsistent with wizard state",
        recoveryAction: "reconstruct",
      };

      setHasError(true);
      setError(error);
      options.onError?.(error);

      // Auto-recover: reconstruct history from wizard state
      window.history.replaceState(
        { step: currentStep },
        "",
        window.location.href,
      );

      setHasError(false);
      setError(null);

      return false;
    }

    return true;
  }, [wizardStore, options]);

  // Validate current step
  const checkStepValidity = useCallback(() => {
    const currentStep = wizardStore.currentStep;
    const steps = wizardStore.steps;

    if (currentStep < 0 || currentStep >= steps.length) {
      const error: NavigationError = {
        type: "step_invalid",
        message: `Invalid step index: ${currentStep}`,
        recoveryAction: "reset",
      };

      setHasError(true);
      setError(error);
      options.onError?.(error);

      // Auto-recover: reset to first step
      wizardStore.goToStep(0);

      return false;
    }

    return true;
  }, [wizardStore, options]);

  // Run integrity checks
  useEffect(() => {
    checkSessionIntegrity();
    checkHistoryIntegrity();
    checkStepValidity();
  }, [checkSessionIntegrity, checkHistoryIntegrity, checkStepValidity]);

  // Manual recovery function
  const recover = useCallback(() => {
    if (!error) return;

    switch (error.recoveryAction) {
      case "reset":
        authStore.clearVerificationSession();
        wizardStore.resetWizard();
        wizardStore.goToStep(0);
        break;

      case "reconstruct":
        window.history.replaceState(
          { step: wizardStore.currentStep },
          "",
          window.location.href,
        );
        break;

      case "redirect":
        wizardStore.goToStep(0);
        break;
    }

    setHasError(false);
    setError(null);
  }, [error, authStore, wizardStore]);

  return {
    hasError,
    error,
    recover,
    showResetButton: hasError && error?.recoveryAction === "reset",
  };
}
