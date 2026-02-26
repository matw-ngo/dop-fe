/**
 * useTimeoutError Hook
 *
 * React hook for managing timeout errors in components.
 * Provides error state, retry functionality, and user-friendly messages.
 *
 * @feature 002-configurable-api-timeout
 * @module use-timeout-error
 */

import { useCallback, useState } from "react";
import {
  formatErrorDetails,
  getUserFriendlyMessage,
  isRetryableTimeoutError,
  isTimeoutError,
} from "@/lib/api/timeouts/error-handler";
import type { TimeoutError } from "@/lib/api/timeouts/types";

export interface UseTimeoutErrorOptions {
  /** Locale for error messages ('en' or 'vi') */
  locale?: "en" | "vi";

  /** Callback when retry is triggered */
  onRetry?: () => void | Promise<void>;

  /** Callback when error is dismissed */
  onDismiss?: () => void;

  /** Maximum number of retry attempts */
  maxRetries?: number;
}

export interface UseTimeoutErrorReturn {
  /** Current timeout error */
  error: TimeoutError | null;

  /** Whether there is an error */
  hasError: boolean;

  /** Whether the error is retryable */
  canRetry: boolean;

  /** Current retry attempt count */
  retryCount: number;

  /** User-friendly error message */
  message: string;

  /** Formatted error details */
  details: ReturnType<typeof formatErrorDetails> | null;

  /** Set a timeout error */
  setError: (error: Error | unknown) => void;

  /** Clear the current error */
  clearError: () => void;

  /** Retry the failed operation */
  retry: () => Promise<void>;

  /** Check if an error is a timeout error */
  isTimeoutError: (error: unknown) => error is TimeoutError;
}

/**
 * Hook for managing timeout errors
 *
 * Provides state management and utilities for handling timeout errors
 * in React components.
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { error, canRetry, retry, clearError, setError } = useTimeoutError({
 *     locale: 'en',
 *     maxRetries: 3,
 *     onRetry: async () => {
 *       await fetchData();
 *     }
 *   });
 *
 *   const handleSubmit = async () => {
 *     try {
 *       clearError();
 *       await submitData();
 *     } catch (err) {
 *       setError(err);
 *     }
 *   };
 *
 *   return (
 *     <div>
 *       {error && (
 *         <TimeoutErrorMessage
 *           error={error}
 *           onRetry={canRetry ? retry : undefined}
 *           onDismiss={clearError}
 *         />
 *       )}
 *       <button onClick={handleSubmit}>Submit</button>
 *     </div>
 *   );
 * }
 * ```
 */
export function useTimeoutError(
  options: UseTimeoutErrorOptions = {},
): UseTimeoutErrorReturn {
  const { locale = "en", onRetry, onDismiss, maxRetries = 3 } = options;

  const [error, setErrorState] = useState<TimeoutError | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  /**
   * Sets an error if it's a timeout error
   */
  const setError = useCallback((err: Error | unknown) => {
    if (isTimeoutError(err)) {
      setErrorState(err);
      setRetryCount(0); // Reset retry count for new error
    } else if (err instanceof Error && err.name === "AbortError") {
      // Convert AbortError to TimeoutError
      const timeoutError: TimeoutError = {
        name: "TimeoutError",
        type: "API_TIMEOUT",
        endpoint: "unknown",
        timeoutDuration: 0,
        elapsedTime: 0,
        retryCount: 0,
        method: "UNKNOWN",
        message: err.message,
        timestamp: new Date().toISOString(),
      };
      setErrorState(timeoutError);
    }
  }, []);

  /**
   * Clears the current error
   */
  const clearError = useCallback(() => {
    setErrorState(null);
    setRetryCount(0);

    if (onDismiss) {
      onDismiss();
    }
  }, [onDismiss]);

  /**
   * Checks if error is retryable based on retry count
   */
  const canRetryWithCount = useCallback(
    (count: number, max: number): boolean => {
      if (!error) {
        return false;
      }

      if (!isRetryableTimeoutError(error)) {
        return false;
      }

      return count < max;
    },
    [error],
  );

  /**
   * Retries the failed operation
   */
  const retry = useCallback(async () => {
    if (!error || !canRetryWithCount(retryCount, maxRetries)) {
      return;
    }

    const newRetryCount = retryCount + 1;
    setRetryCount(newRetryCount);

    try {
      if (onRetry) {
        await onRetry();
      }

      // Clear error on successful retry
      setErrorState(null);
      setRetryCount(0);
    } catch (err) {
      // Update error with new retry count
      setError(err);
    }
  }, [error, retryCount, maxRetries, onRetry, canRetryWithCount, setError]);

  const canRetry = error ? canRetryWithCount(retryCount, maxRetries) : false;
  const hasError = error !== null;
  const message = error ? getUserFriendlyMessage(error, locale) : "";
  const details = error ? formatErrorDetails(error, locale) : null;

  return {
    error,
    hasError,
    canRetry,
    retryCount,
    message,
    details,
    setError,
    clearError,
    retry,
    isTimeoutError,
  };
}

/**
 * Hook variant for managing multiple timeout errors
 *
 * Useful when dealing with multiple concurrent requests that may timeout.
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { errors, addError, removeError, clearAll } = useTimeoutErrors();
 *
 *   return (
 *     <div>
 *       {errors.map(([key, error]) => (
 *         <TimeoutErrorMessage
 *           key={key}
 *           error={error}
 *           onDismiss={() => removeError(key)}
 *         />
 *       ))}
 *     </div>
 *   );
 * }
 * ```
 */
export function useTimeoutErrors(_options: UseTimeoutErrorOptions = {}) {
  const [errors, setErrors] = useState<Map<string, TimeoutError>>(new Map());

  const addError = useCallback((key: string, err: Error | unknown) => {
    if (isTimeoutError(err)) {
      setErrors((prev) => new Map(prev).set(key, err));
    }
  }, []);

  const removeError = useCallback((key: string) => {
    setErrors((prev) => {
      const next = new Map(prev);
      next.delete(key);
      return next;
    });
  }, []);

  const clearAll = useCallback(() => {
    setErrors(new Map());
  }, []);

  const hasErrors = errors.size > 0;
  const errorArray = Array.from(errors.entries());

  return {
    errors,
    errorArray,
    hasErrors,
    count: errors.size,
    addError,
    removeError,
    clearAll,
  };
}

/**
 * Hook for managing loading state with timeout awareness
 *
 * Combines loading state with timeout error handling for common patterns.
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { loading, error, execute, clearError } = useTimeoutState();
 *
 *   const handleClick = async () => {
 *     await execute(async () => {
 *       await submitData();
 *     });
 *   };
 *
 *   return (
 *     <div>
 *       {error && <TimeoutErrorMessage error={error} onDismiss={clearError} />}
 *       <button onClick={handleClick} disabled={loading}>
 *         {loading ? 'Loading...' : 'Submit'}
 *       </button>
 *     </div>
 *   );
 * }
 * ```
 */
export function useTimeoutState(options: UseTimeoutErrorOptions = {}) {
  const [loading, setLoading] = useState(false);
  const timeoutError = useTimeoutError(options);

  /**
   * Executes an async function with loading and error state management
   */
  const execute = useCallback(
    async <T>(fn: () => Promise<T>): Promise<T | null> => {
      setLoading(true);
      timeoutError.clearError();

      try {
        const result = await fn();
        return result;
      } catch (err) {
        timeoutError.setError(err);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [timeoutError],
  );

  return {
    loading,
    error: timeoutError.error,
    hasError: timeoutError.hasError,
    canRetry: timeoutError.canRetry,
    retry: timeoutError.retry,
    execute,
    clearError: timeoutError.clearError,
  };
}

export default useTimeoutError;
