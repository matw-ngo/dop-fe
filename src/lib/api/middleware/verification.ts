/**
 * Verification Session Interceptor
 *
 * Injects verification session headers into API requests for post-OTP steps.
 * Uses factory pattern to avoid React Hook violations.
 *
 * @module lib/api/middleware/verification
 */

import type { Middleware } from "openapi-fetch";
import { useFormWizardStore } from "@/components/form-generation/store/use-form-wizard-store";
import type { NavigationConfig } from "@/contexts/NavigationConfigContext";
import { useAuthStore } from "@/store/use-auth-store";

/**
 * Create verification headers interceptor with config dependency.
 * This avoids React Hook violations by passing config as parameter.
 *
 * @param getConfig - Function that returns current navigation config
 * @returns Middleware that adds verification headers
 *
 * @example
 * ```typescript
 * import { createVerificationInterceptor } from './middleware/verification';
 * import { getNavigationConfig } from '@/contexts/NavigationConfigContext';
 *
 * const middleware = createVerificationInterceptor(() => getNavigationConfig());
 * apiClient.use(middleware);
 * ```
 */
export function createVerificationInterceptor(
  getConfig: () => NavigationConfig,
): Middleware {
  return {
    async onRequest(req) {
      // Get current navigation config (lazy evaluation)
      let navConfig: NavigationConfig;
      try {
        navConfig = getConfig();
      } catch (_error) {
        // If config is not available (e.g., provider not mounted yet),
        // skip verification headers
        console.warn(
          "[Verification Middleware] Navigation config not available, skipping verification headers",
        );
        return req.request;
      }

      // Only add headers if server validation is enabled
      if (!navConfig.enableServerValidation) {
        return req.request;
      }

      // Get current auth and wizard state
      const authStore = useAuthStore.getState();
      const wizardStore = useFormWizardStore.getState();

      const session = authStore.verificationSession;
      const currentStep = wizardStore.currentStep;
      const otpStepIndex = wizardStore.otpStepIndex;

      // Only add headers for post-OTP steps
      if (session && otpStepIndex !== null && currentStep > otpStepIndex) {
        // Add verification headers
        req.request.headers.set("X-Verification-Session-Id", session.sessionId);
        req.request.headers.set("X-Verification-Step", currentStep.toString());
        req.request.headers.set("X-OTP-Step", otpStepIndex.toString());
      }

      return req.request;
    },
  };
}

/**
 * Type guard to check if error is a verification error
 */
export function isVerificationError(error: unknown): error is {
  response: {
    status: number;
    data?: {
      code?: string;
      message?: string;
    };
  };
} {
  if (typeof error !== "object" || error === null) {
    return false;
  }

  if (!("response" in error)) {
    return false;
  }

  const errorWithResponse = error as { response: unknown };

  if (
    typeof errorWithResponse.response !== "object" ||
    errorWithResponse.response === null
  ) {
    return false;
  }

  return "status" in errorWithResponse.response;
}
