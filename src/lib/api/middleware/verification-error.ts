/**
 * Verification Error Handler Middleware
 *
 * Handles verification-related errors (401 unauthenticated, 403 permission_denied)
 * and emits events for React components to display toast notifications.
 *
 * @module lib/api/middleware/verification-error
 */

import type { Middleware } from "openapi-fetch";
import { useFormWizardStore } from "@/components/form-generation/store/use-form-wizard-store";
import {
  emitOTPRequired,
  emitSessionInvalid,
} from "@/lib/events/navigation-events";
import { useAuthStore } from "@/store/use-auth-store";

/**
 * Create verification error handling middleware.
 * Handles 401 and 403 errors related to verification sessions.
 *
 * @returns Middleware that handles verification errors
 *
 * @example
 * ```typescript
 * import { createVerificationErrorMiddleware } from './middleware/verification-error';
 *
 * const errorMiddleware = createVerificationErrorMiddleware();
 * apiClient.use(errorMiddleware);
 * ```
 */
export function createVerificationErrorMiddleware(): Middleware {
  return {
    async onResponse(res) {
      const { response } = res;

      // Only handle error responses
      if (response.status < 400) {
        return response;
      }

      // Parse response body to check error code
      let errorData: { code?: string; message?: string } | null = null;

      try {
        // Clone response to avoid consuming the body
        const clonedResponse = response.clone();
        errorData = await clonedResponse.json();
      } catch (_e) {
        // Response body is not JSON or already consumed
        errorData = null;
      }

      // Handle 401 Unauthenticated - Session invalid or expired
      if (response.status === 401 && errorData?.code === "unauthenticated") {
        const authStore = useAuthStore.getState();
        const wizardStore = useFormWizardStore.getState();

        // Clear verification session
        authStore.clearVerificationSession();

        // Reset wizard to first step
        wizardStore.goToStep(0);

        // Emit event for React component to show toast
        emitSessionInvalid(errorData?.message);

        console.warn("Verification session invalid. Redirected to step 0.");
      }

      // Handle 403 Permission Denied - OTP not verified
      if (response.status === 403 && errorData?.code === "permission_denied") {
        const wizardStore = useFormWizardStore.getState();
        const otpStepIndex = wizardStore.otpStepIndex;

        // Redirect to OTP step if detected
        if (otpStepIndex !== null) {
          wizardStore.goToStep(otpStepIndex);
        }

        // Emit event for React component to show toast
        emitOTPRequired(errorData?.message);

        console.warn("OTP verification required. Redirected to OTP step.");
      }

      return response;
    },
  };
}
