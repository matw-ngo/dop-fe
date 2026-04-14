/**
 * Configurable API Timeout Client Integration
 *
 * This file provides integration between the timeout system and the API client.
 * It extends the base API client with timeout support.
 *
 * @feature 002-configurable-api-timeout
 * @module client-integration
 */

import { createTimeoutController } from "./abort-timeout";
import { resolveTimeout } from "./resolver";
import { useTimeoutStore } from "./timeout-store";
import type { TimeoutConfig, TimeoutContext } from "./types";
import { generateRequestId } from "./utils";

/**
 * Timeout-aware fetch wrapper
 *
 * Wraps a fetch call with timeout functionality and tracking.
 *
 * @param input - Request URL or Request object
 * @param init - Request init options
 * @param config - Timeout configuration
 * @returns Fetch response with timeout applied
 *
 * @example
 * ```typescript
 * const response = await timeoutFetch(
 *   '/api/endpoint',
 *   { method: 'POST', body: JSON.stringify(data) },
 *   timeoutConfig
 * );
 * ```
 */
export async function timeoutFetch(
  input: RequestInfo | URL,
  init?: RequestInit,
  config?: TimeoutConfig,
): Promise<Response> {
  const store = useTimeoutStore.getState();
  const timeoutConfig = config || store.config;

  // Extract endpoint from input
  const endpoint = extractEndpointFromInput(input);

  // Resolve timeout for this endpoint
  const resolution = resolveTimeout(endpoint, timeoutConfig);

  // Create timeout controller
  const { signal, controller, timeoutId } = createTimeoutController(
    resolution.timeout,
  );

  // Create request context for tracking
  const context: TimeoutContext = {
    id: generateRequestId(),
    endpoint,
    timeout: resolution.timeout,
    controller,
    startTime: Date.now(),
    attempt: 0,
    retryable: true,
    userCancelled: false,
  };

  // Track the request
  store.addRequest(context);

  try {
    // Perform fetch with timeout signal
    const response = await fetch(input, {
      ...init,
      signal,
    });

    // Remove from tracking on success
    store.removeRequest(context.id);

    return response;
  } catch (error) {
    // Remove from tracking
    store.removeRequest(context.id);

    // Check if it was a timeout
    if (isAbortError(error)) {
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

      throw timeoutError;
    }

    throw error;
  } finally {
    // Clean up timeout
    clearTimeout(timeoutId);
  }
}

/**
 * Creates a timeout-aware request context
 *
 * Generates a TimeoutContext object for tracking a request.
 *
 * @param endpoint - The endpoint path
 * @param method - HTTP method
 * @param config - Timeout configuration
 * @returns Request context object
 */
export function createRequestContext(
  endpoint: string,
  _method: string,
  config?: TimeoutConfig,
): TimeoutContext {
  const store = useTimeoutStore.getState();
  const timeoutConfig = config || store.config;

  const resolution = resolveTimeout(endpoint, timeoutConfig);
  const controller = new AbortController();

  return {
    id: generateRequestId(),
    endpoint,
    timeout: resolution.timeout,
    controller,
    startTime: Date.now(),
    attempt: 0,
    retryable: true,
    userCancelled: false,
  };
}

/**
 * Extracts endpoint path from fetch input
 *
 * @param input - Request URL or Request object
 * @returns Endpoint path string
 */
function extractEndpointFromInput(input: RequestInfo | URL): string {
  if (typeof input === "string") {
    return new URL(input, window.location.origin).pathname;
  }

  if (input instanceof URL) {
    return input.pathname;
  }

  if (input instanceof Request) {
    return new URL(input.url, window.location.origin).pathname;
  }

  return "/unknown";
}

/**
 * Checks if an error is an abort error
 *
 * @param error - Error to check
 * @returns True if error is an abort error
 */
function isAbortError(error: unknown): boolean {
  if (error instanceof Error) {
    return error.name === "AbortError";
  }
  return false;
}

/**
 * Cancels a request by ID
 *
 * @param requestId - Request ID to cancel
 */
export function cancelRequest(requestId: string): void {
  useTimeoutStore.getState().cancelRequest(requestId, "USER_CANCEL");
}

/**
 * Cancels all active requests
 */
export function cancelAllRequests(): void {
  useTimeoutStore.getState().cancelAllRequests();
}

/**
 * Gets active request count
 *
 * @returns Number of active requests
 */
export function getActiveRequestCount(): number {
  return useTimeoutStore.getState().getActiveRequestCount();
}

/**
 * Checks if a request is active
 *
 * @param requestId - Request ID to check
 * @returns True if request is active
 */
export function isRequestActive(requestId: string): boolean {
  return useTimeoutStore.getState().isRequestActive(requestId);
}
