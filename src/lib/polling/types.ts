// ============================================================
// src/lib/polling/types.ts
// Core type definitions for the polling module.
// Intentionally free of any business logic so it can be reused
// across ekyc, payment, document-processing, and any future flow.
// ============================================================

export type PollingStatus =
  | "idle"
  | "polling"
  | "success"
  | "error"
  | "timeout";

export type BackoffStrategy = "fixed" | "linear" | "exponential";

export interface PollingConfig<T> {
  /** Async function that fetches the current state from the API. */
  fetcher: () => Promise<T>;

  /**
   * Return `true` to stop polling and transition to 'success'.
   * Called after every successful fetch.
   */
  predicate: (data: T) => boolean;

  /** Base interval in milliseconds between polls. */
  interval: number;

  /**
   * Maximum number of poll attempts before transitioning to 'timeout'.
   * Undefined means no retry limit (rely on `timeout` instead).
   */
  maxRetries?: number;

  /**
   * Hard wall-clock timeout in milliseconds.
   * When elapsed the controller transitions to 'timeout' regardless of retries.
   */
  timeout?: number;

  /**
   * Backoff strategy applied to the interval after each attempt.
   *   - fixed       : interval never changes
   *   - linear      : interval += interval * multiplier each attempt
   *   - exponential : interval *= multiplier each attempt
   * @default 'fixed'
   */
  backoff?: BackoffStrategy;

  /**
   * Multiplier used by linear / exponential backoff.
   * @default 1.5
   */
  backoffMultiplier?: number;

  /** Called once when predicate returns true. */
  onSuccess?: (data: T) => void;

  /** Called once when a fetch throws an unrecoverable error. */
  onError?: (error: Error) => void;

  /**
   * Called when polling ends for any reason (success, error, timeout, stop).
   * Receives the last fetched data (or null when there is none).
   */
  onComplete?: (data: T | null) => void;
}

export interface PollingState<T> {
  data: T | null;
  status: PollingStatus;
  error: Error | null;
  /** Number of fetch attempts made so far (1-based when first call completes). */
  attempt: number;
}
