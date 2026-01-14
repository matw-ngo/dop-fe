/**
 * Configurable API Timeout Error Handler
 *
 * This file handles timeout error detection, classification, and logging.
 * Provides utilities for creating and managing timeout errors.
 *
 * @feature 002-configurable-api-timeout
 * @module error-handler
 */

import type { TimeoutError, TimeoutLogEntry } from "./types";
import { ERROR_TYPES } from "./constants";
import { createTimeoutError, getTimestamp, sanitizeLogContext } from "./utils";

/**
 * Checks if an error is a timeout error
 *
 * Determines if the given error is a timeout error (either automatic
 * timeout or user cancellation).
 *
 * @param error - Error to check
 * @returns True if error is a timeout error
 *
 * @example
 * ```typescript
 * if (isTimeoutError(error)) {
 *   console.log('Timeout detected:', error.endpoint);
 * }
 * ```
 */
export function isTimeoutError(error: unknown): error is TimeoutError {
  return (
    error instanceof Error &&
    "type" in error &&
    (error.type === "API_TIMEOUT" || error.type === "USER_CANCEL") &&
    "endpoint" in error &&
    "timeoutDuration" in error
  );
}

/**
 * Checks if an error is an abort error
 *
 * Determines if the error is an AbortError, which indicates
 * a timeout or cancellation occurred.
 *
 * @param error - Error to check
 * @returns True if error is an abort error
 *
 * @example
 * ```typescript
 * try {
 *   await fetchWithTimeout(url);
 * } catch (error) {
 *   if (isAbortError(error)) {
 *     console.log('Request was aborted');
 *   }
 * }
 * ```
 */
export function isAbortError(error: unknown): boolean {
  return error instanceof Error && error.name === "AbortError";
}

/**
 * Classifies an error as automatic timeout or user cancellation
 *
 * Determines if the error was caused by an automatic timeout
 * or was initiated by the user.
 *
 * @param error - Error to classify
 * @returns Error type ('API_TIMEOUT' or 'USER_CANCEL')
 *
 * @example
 * ```typescript
 * const type = classifyTimeoutError(error);
 * if (type === 'API_TIMEOUT') {
 *   // Show retry button
 * } else {
 *   // Show cancelled message
 * }
 * ```
 */
export function classifyTimeoutError(
  error: unknown,
): "API_TIMEOUT" | "USER_CANCEL" {
  if (!isTimeoutError(error)) {
    return ERROR_TYPES.API_TIMEOUT;
  }

  return error.type;
}

/**
 * Creates a timeout error from context
 *
 * Factory function for creating properly structured TimeoutError instances
 * with all required properties.
 *
 * @param endpoint - The endpoint that timed out
 * @param timeoutDuration - Configured timeout duration
 * @param elapsedTime - Actual elapsed time
 * @param method - HTTP method
 * @param userCancelled - Whether user cancelled the request
 * @param retryCount - Number of retry attempts (default: 0)
 * @returns A TimeoutError instance
 *
 * @example
 * ```typescript
 * const error = createAndLogTimeoutError(
 *   '/leads/123/submit-otp',
 *   10000,
 *   10001,
 *   'POST',
 *   false
 * );
 * ```
 */
export function createAndLogTimeoutError(
  endpoint: string,
  timeoutDuration: number,
  elapsedTime: number,
  method: string,
  userCancelled = false,
  retryCount = 0,
): TimeoutError {
  const type = userCancelled
    ? ERROR_TYPES.USER_CANCEL
    : ERROR_TYPES.API_TIMEOUT;

  return createTimeoutError(
    endpoint,
    timeoutDuration,
    elapsedTime,
    retryCount,
    method,
    type,
  );
}

/**
 * Creates a log entry from a timeout error
 *
 * Converts a TimeoutError into a structured log entry for
 * monitoring and analytics.
 *
 * @param error - The timeout error
 * @param userAgent - User agent string (optional)
 * @param sessionId - Session ID (optional)
 * @returns Log entry object
 *
 * @example
 * ```typescript
 * const logEntry = createLogEntryFromError(timeoutError, navigator.userAgent);
 * sendToMonitoringService(logEntry);
 * ```
 */
export function createLogEntryFromError(
  error: TimeoutError,
  userAgent?: string,
  sessionId?: string,
): TimeoutLogEntry {
  return {
    type: error.type,
    level: error.type === ERROR_TYPES.USER_CANCEL ? "info" : "error",
    endpoint: error.endpoint,
    timeoutDuration: error.timeoutDuration,
    elapsedTime: error.elapsedTime,
    retryCount: error.retryCount,
    method: error.method,
    requestId: error.requestId || "unknown",
    sessionId,
    userAgent,
    timestamp: error.timestamp,
  };
}

/**
 * Logs a timeout error to console
 *
 * Outputs structured timeout information to console for debugging.
 * In production, this should send to a monitoring service.
 *
 * @param error - The timeout error
 * @param includeContext - Whether to include additional context (default: true)
 *
 * @example
 * ```typescript
 * try {
 *   await fetchWithTimeout(url);
 * } catch (error) {
 *   if (isTimeoutError(error)) {
 *     logTimeoutError(error);
 *   }
 * }
 * ```
 */
export function logTimeoutError(
  error: TimeoutError,
  includeContext = true,
): void {
  const logEntry = createLogEntryFromError(error);

  const logData: Record<string, unknown> = {
    endpoint: logEntry.endpoint,
    timeout: logEntry.timeoutDuration,
    elapsed: logEntry.elapsedTime,
    method: logEntry.method,
    timestamp: logEntry.timestamp,
  };

  if (includeContext) {
    logData.requestId = logEntry.requestId;
    logData.sessionId = logEntry.sessionId;
    logData.userAgent = logEntry.userAgent;
  }

  // Sanitize sensitive data
  const sanitizedLog = sanitizeLogContext(logData);

  if (logEntry.level === "error") {
    console.error("[API Timeout]", sanitizedLog);
  } else {
    console.info("[User Cancelled]", sanitizedLog);
  }
}

/**
 * Handles timeout error with cleanup
 *
 * Performs error handling, logging, and any necessary cleanup
 * when a timeout occurs.
 *
 * @param error - The error that occurred
 * @param cleanupFn - Optional cleanup function to execute
 * @returns Processed error or re-throws
 *
 * @example
 * ```typescript
 * try {
 *   await fetchWithTimeout(url);
 * } catch (error) {
 *   handleTimeoutError(error, () => {
 *     setLoading(false);
 *   });
 *   throw error;
 * }
 * ```
 */
export function handleTimeoutError(
  error: unknown,
  cleanupFn?: () => void,
): TimeoutError | null {
  if (cleanupFn) {
    try {
      cleanupFn();
    } catch (cleanupError) {
      console.error("Cleanup failed:", cleanupError);
    }
  }

  if (isTimeoutError(error)) {
    logTimeoutError(error);
    return error;
  }

  if (isAbortError(error)) {
    // Convert AbortError to TimeoutError
    const timeoutError = createAndLogTimeoutError(
      "unknown",
      0,
      0,
      "UNKNOWN",
      false,
    );
    return timeoutError;
  }

  return null;
}

/**
 * Gets a user-friendly error message
 *
 * Returns a localized, user-friendly message for the timeout error.
 *
 * @param error - The timeout error
 * @param locale - Locale for message ('en' or 'vi', default: 'en')
 * @returns User-friendly error message
 *
 * @example
 * ```typescript
 * const message = getUserFriendlyMessage(timeoutError, 'en');
 * // Returns: "The request took too long to complete. Please try again."
 * ```
 */
export function getUserFriendlyMessage(
  error: TimeoutError,
  locale = "en",
): string {
  const messages =
    locale === "vi"
      ? {
          TIMEOUT: "Yêu cầu mất quá nhiều thời gian. Vui lòng thử lại.",
          CANCELLED: "Yêu cầu đã bị hủy.",
        }
      : {
          TIMEOUT: "The request took too long to complete. Please try again.",
          CANCELLED: "Request was cancelled.",
        };

  if (error.type === ERROR_TYPES.USER_CANCEL) {
    return messages.CANCELLED;
  }

  return messages.TIMEOUT;
}

/**
 * Checks if an error is retryable
 *
 * Determines if a timeout error should trigger a retry attempt.
 * Only automatic timeouts are retryable, not user cancellations.
 *
 * @param error - Error to check
 * @returns True if error is retryable
 *
 * @example
 * ```typescript
 * if (isRetryableTimeoutError(error)) {
 *   // Retry the request
 * }
 * ```
 */
export function isRetryableTimeoutError(error: unknown): boolean {
  if (!isTimeoutError(error)) {
    return false;
  }

  // Only retry automatic timeouts, not user cancellations
  return error.type === ERROR_TYPES.API_TIMEOUT;
}

/**
 * Formats error details for display
 *
 * Creates a formatted object with error details suitable for
 * displaying in UI components.
 *
 * @param error - The timeout error
 * @param locale - Locale for messages (default: 'en')
 * @returns Formatted error details
 *
 * @example
 * ```typescript
 * const details = formatErrorDetails(timeoutError);
 * // Returns: {
 * //   title: "Request Timeout",
 * //   message: "The request took too long...",
 * //   canRetry: true,
 * //   endpoint: "/leads/123/submit-otp"
 * // }
 * ```
 */
export function formatErrorDetails(
  error: TimeoutError,
  locale = "en",
): {
  title: string;
  message: string;
  canRetry: boolean;
  endpoint: string;
  timeoutDuration: number;
  elapsedTime: number;
} {
  const isRetryable = isRetryableTimeoutError(error);
  const message = getUserFriendlyMessage(error, locale);

  const titles =
    locale === "vi"
      ? {
          TIMEOUT: "Yêu cầu hết thời gian",
          CANCELLED: "Yêu cầu đã hủy",
        }
      : {
          TIMEOUT: "Request Timeout",
          CANCELLED: "Request Cancelled",
        };

  return {
    title:
      error.type === ERROR_TYPES.USER_CANCEL
        ? titles.CANCELLED
        : titles.TIMEOUT,
    message,
    canRetry: isRetryable,
    endpoint: error.endpoint,
    timeoutDuration: error.timeoutDuration,
    elapsedTime: error.elapsedTime,
  };
}

/**
 * Creates a timeout error from an AbortError
 *
 * Converts an AbortError into a TimeoutError with appropriate context.
 *
 * @param abortError - The AbortError
 * @param endpoint - The endpoint that was being requested
 * @param timeoutDuration - Configured timeout duration
 * @param method - HTTP method
 * @returns A TimeoutError instance
 *
 * @example
 * ```typescript
 * try {
 *   await fetchWithTimeout(url);
 * } catch (error) {
 *   if (error.name === 'AbortError') {
 *     const timeoutError = convertAbortToTimeoutError(error, '/api/endpoint', 30000, 'GET');
 *     throw timeoutError;
 *   }
 * }
 * ```
 */
export function convertAbortToTimeoutError(
  abortError: Error & { name: string },
  endpoint: string,
  timeoutDuration: number,
  method: string,
): TimeoutError {
  return createAndLogTimeoutError(
    endpoint,
    timeoutDuration,
    timeoutDuration, // Assume timeout was reached
    method,
    false, // Assume automatic timeout, not user cancellation
    0,
  );
}

/**
 * Batch processes multiple timeout errors
 *
 * Handles an array of timeout errors efficiently, logging them
 * and returning summary statistics.
 *
 * @param errors - Array of timeout errors
 * @returns Summary of processed errors
 *
 * @example
 * ```typescript
 * const summary = batchProcessTimeoutErrors([error1, error2, error3]);
 * // Returns: { total: 3, timeounts: 2, cancellations: 1, endpoints: [...] }
 * ```
 */
export function batchProcessTimeoutErrors(errors: TimeoutError[]): {
  total: number;
  timeouts: number;
  cancellations: number;
  endpoints: string[];
} {
  const timeouts = errors.filter((e) => e.type === ERROR_TYPES.API_TIMEOUT);
  const cancellations = errors.filter(
    (e) => e.type === ERROR_TYPES.USER_CANCEL,
  );
  const endpoints = Array.from(new Set(errors.map((e) => e.endpoint)));

  // Log all errors
  errors.forEach((error) => logTimeoutError(error, false));

  return {
    total: errors.length,
    timeouts: timeouts.length,
    cancellations: cancellations.length,
    endpoints,
  };
}
