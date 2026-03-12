import type { MappedFlow } from "@/mappers/flowMapper";

/**
 * Type for Auth Store state
 * Extracted to avoid importing from store (which can have side effects)
 */
type VerificationSession = {
  sessionId: string;
  otpStepIndex: number;
  isLocked: boolean;
  verifiedAt: Date;
  expiresAt: Date;
  lastActivity: Date;
};

type AuthState = {
  verificationSession: VerificationSession | null;
  canNavigateBack: (targetIndex: number) => boolean;
};

/**
 * Type for Form Wizard Store state
 * Extracted from useFormWizardStore to avoid circular dependencies
 */
type WizardStoreState = {
  formData: Record<string, any>;
  currentStep: number;
};

/**
 * Normalize page identifier to canonical format
 * - Ensures path starts with /
 * - Treats /index and / as equivalent
 *
 * @param page - The page identifier to normalize
 * @returns Normalized page identifier
 *
 * @example
 * normalizePageIdentifier("consent") // => "/consent"
 * normalizePageIdentifier("/index") // => "/"
 * normalizePageIdentifier("/consent") // => "/consent"
 */
export function normalizePageIdentifier(page: string): string {
  const normalized = page.startsWith("/") ? page : `/${page}`;
  return normalized === "/index" ? "/" : normalized;
}

/**
 * Check authentication guard
 * Validates session integrity and detects corruption
 *
 * IMPORTANT: Does NOT mutate state - returns shouldClearSession flag instead
 * The caller is responsible for clearing the session if needed
 *
 * Session corruption indicators:
 * - Missing required fields (sessionId, createdAt, otpStepIndex)
 * - Invalid timestamp format
 * - sessionId that fails cryptographic validation
 *
 * @param authStore - The authentication store state
 * @returns Validation result with shouldClearSession flag
 *
 * @example
 * const result = checkAuthGuard(authStore);
 * if (!result.isValid && result.shouldClearSession) {
 *   authStore.clearVerificationSession();
 * }
 */
export function checkAuthGuard(authStore: AuthState): {
  isValid: boolean;
  message?: string;
  shouldClearSession?: boolean;
} {
  const session = authStore.verificationSession;

  // Check for session corruption
  if (session) {
    const hasRequiredFields =
      session.sessionId &&
      session.verifiedAt &&
      session.otpStepIndex !== undefined;

    const hasValidTimestamp =
      session.verifiedAt &&
      typeof new Date(session.verifiedAt).getTime() === "number" &&
      !Number.isNaN(new Date(session.verifiedAt).getTime());

    if (!hasRequiredFields || !hasValidTimestamp) {
      console.warn("[Auth Guard] Session corruption detected", session);
      return {
        isValid: false,
        message: "Session corrupted. Please start over.",
        shouldClearSession: true,
      };
    }
  }

  return { isValid: true };
}

/**
 * Validate step exists and user has completed prerequisites
 *
 * Checks:
 * 1. Step exists in flow configuration
 * 2. User has active form data (for non-first steps)
 * 3. User has completed all previous steps
 *
 * NOTE: Returns translation keys instead of translated messages
 * The caller is responsible for translating using next-intl
 *
 * @param page - The page identifier to validate
 * @param flowData - The flow configuration data
 * @param wizardStore - The form wizard store state
 * @returns Validation result with translation key
 *
 * @example
 * const result = validateStep("/consent", flowData, wizardStore);
 * if (!result.isValid) {
 *   router.push(result.redirectTo);
 *   toast.error(t(result.messageKey));
 * }
 */
export function validateStep(
  page: string,
  flowData: MappedFlow,
  wizardStore: WizardStoreState,
): {
  isValid: boolean;
  redirectTo?: string;
  messageKey?: string;
} {
  const normalizedPage = normalizePageIdentifier(page);

  // Find step in flow configuration
  const stepIndex = flowData.steps.findIndex(
    (step) => normalizePageIdentifier(step.page) === normalizedPage,
  );

  if (stepIndex === -1) {
    console.warn(`[Step Validator] Step not found for page: ${page}`);
    return {
      isValid: false,
      redirectTo: "/",
      messageKey: "errors.invalidStep",
    };
  }

  // Check if user has form data (active session)
  const hasFormData = Object.keys(wizardStore.formData || {}).length > 0;
  if (!hasFormData && stepIndex > 0) {
    console.warn("[Step Validator] No form data, redirecting to start");
    return {
      isValid: false,
      redirectTo: "/",
      messageKey: "sharedLink.noSession",
    };
  }

  // Check if user has completed previous steps
  const currentStepIndex = wizardStore.currentStep || 0;
  if (stepIndex > currentStepIndex + 1) {
    console.warn(
      `[Step Validator] User at step ${currentStepIndex}, trying to access step ${stepIndex}`,
    );
    const nextStep = flowData.steps[currentStepIndex + 1];
    return {
      isValid: false,
      redirectTo: nextStep?.page || "/",
      messageKey: "sharedLink.prerequisitesNotMet",
    };
  }

  return { isValid: true };
}

/**
 * Check navigation security (post-OTP restrictions)
 * Uses Auth_Store.canNavigateBack() per Req 6.2
 *
 * When a user has a verification session (created after OTP verification),
 * this function checks if they can navigate back to the requested step.
 * The canNavigateBack() method respects NavigationConfig settings.
 *
 * @param page - The page identifier to check
 * @param flowData - The flow configuration data
 * @param authStore - The authentication store state
 * @param wizardStore - The form wizard store state
 * @returns Validation result with redirect information
 *
 * @example
 * const result = checkNavigationSecurity("/consent", flowData, authStore, wizardStore);
 * if (!result.isValid) {
 *   router.push(result.redirectTo);
 *   toast.error(result.message);
 * }
 */
export function checkNavigationSecurity(
  page: string,
  flowData: MappedFlow,
  authStore: AuthState,
  wizardStore: WizardStoreState,
): {
  isValid: boolean;
  redirectTo?: string;
  message?: string;
} {
  const session = authStore.verificationSession;
  if (!session) {
    return { isValid: true }; // No restrictions without verification session
  }

  const normalizedPage = normalizePageIdentifier(page);
  const requestedStepIndex = flowData.steps.findIndex(
    (step) => normalizePageIdentifier(step.page) === normalizedPage,
  );

  if (requestedStepIndex === -1) {
    return { isValid: true }; // Step not found, will be handled by validateStep
  }

  // Use canNavigateBack() method per Req 6.2
  // This respects NavigationConfig settings per Req 6.6
  const canNavigate = authStore.canNavigateBack(requestedStepIndex);

  if (!canNavigate) {
    console.warn(
      `[Navigation Security] Blocked navigation to step ${requestedStepIndex} (OTP step: ${session.otpStepIndex})`,
    );

    const currentStep = flowData.steps[wizardStore.currentStep || 0];
    return {
      isValid: false,
      redirectTo: currentStep?.page || "/",
      message: "Cannot navigate back after verification.",
    };
  }

  return { isValid: true };
}

/**
 * Handle redirect loop detection
 * Breaks after 3 redirects within 5 seconds per Req 12.3
 *
 * Uses sessionStorage with key "dop_redirect_counter" containing:
 * - count: Number of consecutive redirects
 * - timestamp: Time of first redirect in the sequence
 *
 * Logic:
 * - Counter increments AFTER this check (in the component)
 * - Threshold is count >= 2 (breaks on 3rd redirect attempt)
 * - Counter resets after 5 seconds of inactivity
 * - Counter is removed (not incremented) when loop is broken
 *
 * @param page - The page identifier being accessed
 * @returns Object indicating if loop should be broken
 *
 * @example
 * const result = handleRedirectLoop("/consent");
 * if (result.shouldBreak) {
 *   // Clear state and redirect to start
 *   authStore.clearSession();
 *   wizardStore.reset();
 *   router.push("/");
 * }
 */
export function handleRedirectLoop(page: string): {
  shouldBreak: boolean;
} {
  const counterKey = "dop_redirect_counter";

  let counterData;
  try {
    counterData = JSON.parse(
      sessionStorage.getItem(counterKey) || '{"count":0,"timestamp":0}',
    );
  } catch {
    // Handle invalid JSON gracefully - reset counter
    console.warn("[Redirect Loop] Invalid counter data, resetting");
    sessionStorage.removeItem(counterKey);
    return { shouldBreak: false };
  }

  const now = Date.now();
  const timeDiff = now - counterData.timestamp;

  // Reset counter if older than 5 seconds
  if (timeDiff > 5000) {
    sessionStorage.setItem(
      counterKey,
      JSON.stringify({ count: 0, timestamp: now }),
    );
    return { shouldBreak: false };
  }

  // Check if threshold reached (>= 2 means break on 3rd redirect)
  // Counter increments AFTER this check, so:
  // - 1st redirect: count=0, check passes, increment to 1
  // - 2nd redirect: count=1, check passes, increment to 2
  // - 3rd redirect: count=2, check BREAKS
  if (counterData.count >= 2) {
    console.error(
      `[Redirect Loop] Breaking loop after ${counterData.count + 1} redirects`,
      { page, timeDiff },
    );
    sessionStorage.removeItem(counterKey);
    return { shouldBreak: true };
  }

  return { shouldBreak: false };
}
