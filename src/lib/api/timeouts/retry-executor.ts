/**
 * Configurable API Timeout Retry Executor
 *
 * This file handles automatic retry logic with exponential backoff
 * for failed requests. Integrates with React Query for seamless retry support.
 *
 * @feature 002-configurable-api-timeout
 * @module retry-executor
 */

import { DEFAULT_RETRY } from "./constants";
import { isRetryableTimeoutError } from "./error-handler";
import type { RetryStrategy } from "./types";
import { calculateBackoffDelay } from "./utils";

export interface RetryExecutorOptions {
  /** Maximum number of retry attempts */
  maxAttempts?: number;

  /** Initial delay before first retry (ms) */
  initialDelay?: number;

  /** Backoff multiplier for exponential delay */
  backoffMultiplier?: number;

  /** Maximum delay cap (ms) */
  maxDelay?: number;

  /** Whether to use jitter in retry delays */
  useJitter?: boolean;

  /** Custom retry condition function */
  shouldRetry?: (error: Error, attempt: number) => boolean;

  /** Callback before each retry attempt */
  onRetry?: (attempt: number, maxAttempts: number, delay: number) => void;

  /** Callback on final failure */
  onFinalFailure?: (error: Error, attempts: number) => void;
}

export interface RetryExecutorResult<T> {
  /** The result if successful */
  data?: T;

  /** The final error if all retries failed */
  error?: Error;

  /** Number of retry attempts made */
  attempts: number;

  /** Whether the operation succeeded */
  success: boolean;
}

/**
 * Executes a function with retry logic
 *
 * Retries the function on failure with exponential backoff delay.
 * Only retries retryable timeout errors.
 *
 * @param fn - Function to execute
 * @param options - Retry configuration options
 * @returns Promise with result or final error
 *
 * @example
 * ```typescript
 * const result = await executeWithRetry(
 *   () => fetch('/api/data').then(r => r.json()),
 *   { maxAttempts: 3, initialDelay: 1000 }
 * );
 *
 * if (result.success) {
 *   console.log(result.data);
 * } else {
 *   console.error('Failed after', result.attempts, 'attempts');
 * }
 * ```
 */
export async function executeWithRetry<T>(
  fn: () => Promise<T>,
  options: RetryExecutorOptions = {},
): Promise<RetryExecutorResult<T>> {
  const {
    maxAttempts = DEFAULT_RETRY.MAX_RETRIES,
    initialDelay = DEFAULT_RETRY.INITIAL_DELAY,
    backoffMultiplier = DEFAULT_RETRY.BACKOFF_MULTIPLIER,
    maxDelay = DEFAULT_RETRY.MAX_DELAY,
    useJitter = false,
    shouldRetry,
    onRetry,
    onFinalFailure,
  } = options;

  let lastError: Error | undefined;

  for (let attempt = 0; attempt <= maxAttempts; attempt++) {
    try {
      // Execute the function
      const data = await fn();

      return {
        data,
        attempts: attempt,
        success: true,
      };
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // Check if we should retry
      const canRetry =
        attempt < maxAttempts &&
        determineShouldRetry(lastError, attempt, shouldRetry);

      if (!canRetry) {
        break;
      }

      // Calculate delay for next retry
      let delay = calculateBackoffDelay(
        attempt,
        initialDelay,
        backoffMultiplier,
        maxDelay,
      );

      // Add jitter if enabled
      if (useJitter) {
        delay = addJitter(delay);
      }

      // Call retry callback
      if (onRetry) {
        onRetry(attempt + 1, maxAttempts, delay);
      }

      // Wait before retrying
      await sleep(delay);
    }
  }

  // All retries failed
  if (onFinalFailure && lastError) {
    onFinalFailure(lastError, maxAttempts);
  }

  return {
    error: lastError,
    attempts: maxAttempts,
    success: false,
  };
}

/**
 * Determines if an error should trigger a retry
 *
 * @param error - The error that occurred
 * @param attempt - Current attempt number
 * @param customCondition - Optional custom retry condition
 * @returns True if should retry
 */
function determineShouldRetry(
  error: Error,
  attempt: number,
  customCondition?: (error: Error, attempt: number) => boolean,
): boolean {
  // Use custom condition if provided
  if (customCondition) {
    return customCondition(error, attempt);
  }

  // Default: only retry timeout errors
  return isRetryableTimeoutError(error);
}

/**
 * Adds random jitter to a delay
 *
 * Adds a random +/- 25% variance to prevent thundering herd.
 *
 * @param delay - Base delay in milliseconds
 * @returns Delay with jitter applied
 */
function addJitter(delay: number): number {
  const jitter = delay * 0.25; // 25% variance
  const randomJitter = (Math.random() * 2 - 1) * jitter; // -jitter to +jitter
  return Math.max(0, Math.round(delay + randomJitter));
}

/**
 * Sleeps for a specified duration
 *
 * @param ms - Duration in milliseconds
 * @returns Promise that resolves after the delay
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Creates a retry strategy object from options
 *
 * Converts executor options to a RetryStrategy type.
 *
 * @param options - Executor options
 * @returns RetryStrategy object
 *
 * @example
 * ```typescript
 * const strategy = createRetryStrategy({
 *   maxAttempts: 5,
 *   initialDelay: 2000
 * });
 * // Returns: { maxAttempts: 5, initialDelay: 2000, ... }
 * ```
 */
export function createRetryStrategy(
  options: RetryExecutorOptions = {},
): RetryStrategy {
  return {
    maxAttempts: options.maxAttempts ?? DEFAULT_RETRY.MAX_RETRIES,
    initialDelay: options.initialDelay ?? DEFAULT_RETRY.INITIAL_DELAY,
    backoffMultiplier:
      options.backoffMultiplier ?? DEFAULT_RETRY.BACKOFF_MULTIPLIER,
    maxDelay: options.maxDelay ?? DEFAULT_RETRY.MAX_DELAY,
    retryableErrors: ["TimeoutError", "AbortError"],
    useJitter: options.useJitter ?? false,
  };
}

/**
 * Wraps a function with automatic retry logic
 *
 * Returns a new function that will retry on failure.
 *
 * @param fn - Function to wrap
 * @param options - Retry configuration
 * @returns Wrapped function with retry logic
 *
 * @example
 * ```typescript
 * const fetchWithRetry = withRetry(
 *   () => fetch('/api/data').then(r => r.json()),
 *   { maxAttempts: 3 }
 * );
 *
 * const data = await fetchWithRetry();
 * ```
 */
export function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryExecutorOptions = {},
): () => Promise<T> {
  return async () => {
    const result = await executeWithRetry(fn, options);

    if (result.success && result.data !== undefined) {
      return result.data;
    }

    throw result.error || new Error("Operation failed after retries");
  };
}

/**
 * Batch executes multiple functions with retry logic
 *
 * Executes an array of functions in parallel, each with its own retry logic.
 *
 * @param fns - Array of functions to execute
 * @param options - Retry configuration (applied to all functions)
 * @returns Array of results
 *
 * @example
 * ```typescript
 * const results = await executeBatchWithRetry(
 *   [fn1, fn2, fn3],
 *   { maxAttempts: 2 }
 * );
 * ```
 */
export async function executeBatchWithRetry<T>(
  fns: Array<() => Promise<T>>,
  options: RetryExecutorOptions = {},
): Promise<RetryExecutorResult<T>[]> {
  return Promise.all(fns.map((fn) => executeWithRetry(fn, options)));
}

/**
 * Sequentially executes functions with retry logic
 *
 * Executes functions one after another, stopping on first failure.
 *
 * @param fns - Array of functions to execute in sequence
 * @param options - Retry configuration
 * @returns Result of the last successful execution or final failure
 *
 * @example
 * ```typescript
 * const result = await executeSequentialWithRetry(
 *   [step1, step2, step3],
 *   { maxAttempts: 2 }
 * );
 * ```
 */
export async function executeSequentialWithRetry<T>(
  fns: Array<() => Promise<T>>,
  options: RetryExecutorOptions = {},
): Promise<RetryExecutorResult<T>> {
  const results: T[] = [];

  for (const fn of fns) {
    const result = await executeWithRetry(fn, options);

    if (!result.success) {
      return {
        error: result.error,
        attempts: result.attempts,
        success: false,
      };
    }

    if (result.data !== undefined) {
      results.push(result.data);
    }
  }

  return {
    data: results[results.length - 1],
    attempts: 0,
    success: true,
  };
}

/**
 * Calculates the total time for all retry attempts
 *
 * @param options - Retry configuration
 * @returns Total time in milliseconds
 *
 * @example
 * ```typescript
 * const totalTime = calculateTotalRetryTime({
 *   maxAttempts: 3,
 *   initialDelay: 1000,
 *   backoffMultiplier: 2
 * });
 * // Returns: 7000 (1000 + 2000 + 4000)
 * ```
 */
export function calculateTotalRetryTime(
  options: RetryExecutorOptions = {},
): number {
  const {
    maxAttempts = DEFAULT_RETRY.MAX_RETRIES,
    initialDelay = DEFAULT_RETRY.INITIAL_DELAY,
    backoffMultiplier = DEFAULT_RETRY.BACKOFF_MULTIPLIER,
    maxDelay = DEFAULT_RETRY.MAX_DELAY,
  } = options;

  let total = 0;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    total += calculateBackoffDelay(
      attempt,
      initialDelay,
      backoffMultiplier,
      maxDelay,
    );
  }

  return total;
}

/**
 * Validates retry configuration
 *
 * Checks if the retry options are valid.
 *
 * @param options - Options to validate
 * @returns True if valid
 *
 * @example
 * ```typescript
 * if (!validateRetryOptions({ maxAttempts: 5 })) {
 *   throw new Error('Invalid retry configuration');
 * }
 * ```
 */
export function validateRetryOptions(options: RetryExecutorOptions): boolean {
  const {
    maxAttempts = DEFAULT_RETRY.MAX_RETRIES,
    initialDelay = DEFAULT_RETRY.INITIAL_DELAY,
    backoffMultiplier = DEFAULT_RETRY.BACKOFF_MULTIPLIER,
    maxDelay,
  } = options;

  if (maxAttempts < 0 || maxAttempts > 10) {
    return false;
  }

  if (initialDelay < 100 || initialDelay > 30000) {
    return false;
  }

  if (backoffMultiplier < 1.0 || backoffMultiplier > 5.0) {
    return false;
  }

  if (maxDelay !== undefined && (maxDelay < 100 || maxDelay > 60000)) {
    return false;
  }

  return true;
}

/**
 * Gets default retry configuration
 *
 * @returns Default retry options
 */
export function getDefaultRetryOptions(): RetryExecutorOptions {
  return {
    maxAttempts: DEFAULT_RETRY.MAX_RETRIES,
    initialDelay: DEFAULT_RETRY.INITIAL_DELAY,
    backoffMultiplier: DEFAULT_RETRY.BACKOFF_MULTIPLIER,
    maxDelay: DEFAULT_RETRY.MAX_DELAY,
    useJitter: false,
  };
}
