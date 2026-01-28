/**
 * Configurable API Timeout Types
 *
 * This file contains all TypeScript type definitions for the timeout configuration system.
 * These types support global, service-specific, and endpoint-specific timeout configuration
 * with comprehensive error handling and retry logic.
 *
 * @feature 002-configurable-api-timeout
 * @module types
 */

/**
 * Main timeout configuration structure
 * Supports three levels of timeout configuration with cascade resolution
 */
export interface TimeoutConfig {
  /**
   * Global timeout in milliseconds (default: 30000)
   * Applied to all API calls when no more specific timeout is configured
   * Range: 1000 - 600000 (1 second to 10 minutes)
   */
  global: number;

  /**
   * Service-specific timeouts keyed by service name
   * Overrides global timeout for the specified service
   * Examples: 'DOP', 'EKYC', 'CONSENT', 'PAYMENT'
   */
  services?: Record<string, number>;

  /**
   * Endpoint-specific timeouts keyed by normalized path
   * Overrides both service and global timeouts
   * Example keys: 'LEADS_SUBMIT_OTP', 'EKYC_CONFIG', 'API_V1_USERS_PROFILE'
   */
  endpoints?: Record<string, number>;

  /**
   * Maximum number of retry attempts after timeout (default: 3)
   * Range: 0 - 10
   */
  maxRetries: number;

  /**
   * Initial retry delay in milliseconds (default: 1000)
   * Subsequent delays use exponential backoff: delay * 2^attempt
   * Range: 100 - 30000
   */
  retryDelay: number;
}

/**
 * Represents a timeout failure with full context for logging and error handling
 */
export interface TimeoutError extends Error {
  /**
   * Error type for distinguishing timeout from other errors
   */
  type: "API_TIMEOUT" | "USER_CANCEL";

  /**
   * The endpoint path that timed out
   */
  endpoint: string;

  /**
   * The configured timeout duration in milliseconds
   */
  timeoutDuration: number;

  /**
   * Actual elapsed time before timeout in milliseconds
   */
  elapsedTime: number;

  /**
   * Number of retry attempts before giving up
   */
  retryCount: number;

  /**
   * HTTP method of the request
   */
  method: string;

  /**
   * Request ID for tracking
   */
  requestId?: string;

  /**
   * Session ID for user-level analysis
   */
  sessionId?: string;

  /**
   * Timestamp when timeout occurred (ISO 8601 format)
   */
  timestamp: string;
}

/**
 * Tracks active requests with their timeout configurations and cancellation tokens
 */
export interface TimeoutContext {
  /**
   * Unique identifier for this request context
   */
  id: string;

  /**
   * The endpoint path for this request
   */
  endpoint: string;

  /**
   * Resolved timeout duration for this request
   * After applying cascade: endpoint -> service -> global
   */
  timeout: number;

  /**
   * AbortController for cancelling this request
   */
  controller: AbortController;

  /**
   * Request start timestamp (milliseconds since epoch)
   */
  startTime: number;

  /**
   * Current retry attempt (0-based)
   */
  attempt: number;

  /**
   * Whether this request can be retried
   */
  retryable: boolean;

  /**
   * User-initiated cancellation flag
   */
  userCancelled: boolean;
}

/**
 * Defines retry behavior for failed requests
 */
export interface RetryStrategy {
  /**
   * Maximum number of retry attempts
   * Range: 0 - 10
   */
  maxAttempts: number;

  /**
   * Initial delay before first retry in milliseconds
   * Range: 100 - 30000
   */
  initialDelay: number;

  /**
   * Backoff multiplier for exponential delay
   * Range: 1.0 - 5.0
   */
  backoffMultiplier: number;

  /**
   * Maximum delay cap in milliseconds (optional)
   * Range: 100 - 60000
   */
  maxDelay?: number;

  /**
   * Error types that should trigger retry
   */
  retryableErrors: string[];

  /**
   * Whether jitter should be added to delays
   */
  useJitter: boolean;
}

/**
 * Result of timeout resolution process (cascade logic)
 */
export interface TimeoutResolution {
  /**
   * Final timeout value to apply (milliseconds)
   */
  timeout: number;

  /**
   * Source of the timeout value
   */
  source: "endpoint" | "service" | "global" | "default";

  /**
   * The specific endpoint key that was matched (if endpoint source)
   */
  endpointKey?: string;

  /**
   * The specific service key that was matched (if service source)
   */
  serviceKey?: string;

  /**
   * Whether the timeout was explicitly configured or defaulted
   */
  explicit: boolean;
}

/**
 * Validation result for timeout configuration
 */
export interface ValidationResult {
  /**
   * Whether validation passed
   */
  valid: boolean;

  /**
   * Array of validation errors
   */
  errors: ValidationError[];

  /**
   * Parsed and validated configuration (if valid)
   */
  config?: TimeoutConfig;
}

/**
 * Single validation error detail
 */
export interface ValidationError {
  /**
   * Environment variable name
   */
  variable: string;

  /**
   * Error message
   */
  message: string;

  /**
   * Invalid value that caused the error
   */
  value: string;

  /**
   * Expected format
   */
  expected: string;
}

/**
 * Log entry for timeout events
 */
export interface TimeoutLogEntry {
  /**
   * Log entry type
   */
  type: "API_TIMEOUT" | "USER_CANCEL";

  /**
   * Log severity
   */
  level: "error" | "warn" | "info";

  /**
   * Endpoint path
   */
  endpoint: string;

  /**
   * Configured timeout duration (milliseconds)
   */
  timeoutDuration: number;

  /**
   * Actual elapsed time (milliseconds)
   */
  elapsedTime: number;

  /**
   * Number of retries attempted
   */
  retryCount: number;

  /**
   * HTTP method
   */
  method: string;

  /**
   * Request ID
   */
  requestId: string;

  /**
   * Session ID (if available)
   */
  sessionId?: string;

  /**
   * User agent
   */
  userAgent?: string;

  /**
   * Timestamp (ISO 8601 format)
   */
  timestamp: string;

  /**
   * Additional context
   */
  context?: Record<string, unknown>;
}

/**
 * Timeout error handler function type
 */
export type TimeoutErrorHandler = (error: TimeoutError) => void;

/**
 * Collection of timeout error handlers
 */
export interface TimeoutErrorHandlers {
  /**
   * Handler for automatic timeout errors
   */
  onTimeout: TimeoutErrorHandler;

  /**
   * Handler for user cancellation errors
   */
  onCancel: TimeoutErrorHandler;

  /**
   * Handler for retry attempt
   */
  onRetry: (attempt: number, maxAttempts: number) => void;

  /**
   * Handler for final failure after all retries
   */
  onFinalFailure: TimeoutErrorHandler;
}

/**
 * React Query timeout options for queries
 */
export interface TimeoutQueryOptions<_TData, _TError> {
  /**
   * Override timeout for this specific query (milliseconds)
   * Range: 1000 - 600000
   */
  timeout?: number;

  /**
   * Disable retry for this query
   */
  disableRetry?: boolean;

  /**
   * Custom retry strategy overrides
   */
  retryStrategy?: Partial<RetryStrategy>;
}

/**
 * React Query timeout options for mutations
 */
export interface TimeoutMutationOptions<_TData, _TError, _TVariables> {
  /**
   * Override timeout for this specific mutation (milliseconds)
   * Range: 1000 - 600000
   */
  timeout?: number;

  /**
   * Disable retry for this mutation
   */
  disableRetry?: boolean;

  /**
   * Custom retry strategy overrides
   */
  retryStrategy?: Partial<RetryStrategy>;
}

/**
 * Service names for timeout configuration
 */
export type ServiceName =
  | "DOP"
  | "EKYC"
  | "CONSENT"
  | "PAYMENT"
  | "AUTH"
  | "LEADS"
  | string;

/**
 * Normalized endpoint path for configuration lookup
 */
export type NormalizedEndpointPath = string;
