import type { Middleware } from "openapi-fetch";
import { toast } from "sonner";
import { createTimeoutController } from "../timeouts/abort-timeout";
import { resolveTimeout } from "../timeouts/resolver";
import { useTimeoutStore } from "../timeouts/timeout-store";

/**
 * Timeout middleware for openapi-fetch
 * Handles per-endpoint timeout configuration
 */
export const createTimeoutMiddleware = (): Middleware => {
  return {
    async onRequest(req) {
      const url = new URL(req.request.url, window.location.origin);
      const endpoint = url.pathname;
      const config = useTimeoutStore.getState().config;

      // Resolve timeout for this endpoint
      const resolution = resolveTimeout(endpoint, config);

      // Create timeout controller
      const { signal: timeoutSignal } = createTimeoutController(
        resolution.timeout,
      );

      // Merge timeout signal with existing signal if present
      let finalSignal = timeoutSignal;

      if (req.request.signal) {
        // Create a combined abort controller
        const combinedController = new AbortController();

        // Handler for timeout abort
        const handleTimeoutAbort = () => {
          combinedController.abort();
          if (req.request.signal) {
            req.request.signal.removeEventListener(
              "abort",
              handleOriginalAbort,
            );
          }
        };

        // Handler for original signal abort
        const handleOriginalAbort = () => {
          combinedController.abort();
          timeoutSignal.removeEventListener("abort", handleTimeoutAbort);
        };

        // Listen to both signals
        timeoutSignal.addEventListener("abort", handleTimeoutAbort, {
          once: true,
        });
        req.request.signal.addEventListener("abort", handleOriginalAbort, {
          once: true,
        });

        finalSignal = combinedController.signal;
      }

      // Create a new Request with the combined signal
      const modifiedRequest = new Request(req.request, {
        signal: finalSignal,
      });

      return modifiedRequest;
    },
  };
};

/**
 * Response middleware for timeout error handling
 */
export const createTimeoutResponseMiddleware = (): Middleware => {
  return {
    async onResponse(res) {
      if (res.request.signal?.aborted) {
        const url = new URL(res.request.url, window.location.origin);
        const endpoint = url.pathname;
        const config = useTimeoutStore.getState().config;
        const resolution = resolveTimeout(endpoint, config);

        const timeoutError = new Error(
          `Request to ${endpoint} timed out after ${resolution.timeout}ms`,
        ) as Error & {
          name: string;
          code: string;
          endpoint: string;
          timeout: number;
        };

        timeoutError.name = "TimeoutError";
        timeoutError.code = "TIMEOUT";
        timeoutError.endpoint = endpoint;
        timeoutError.timeout = resolution.timeout;

        // Show user-friendly error toast
        toast.error("Request timeout", {
          description: `The request took too long to complete. Please try again.`,
        });

        throw timeoutError;
      }

      return res.response;
    },
  };
};
