/**
 * Configurable API Timeout Constants
 *
 * This file contains all constant values used throughout the timeout configuration system.
 * These include default timeout values, retry configuration, and error type constants.
 *
 * @feature 002-configurable-api-timeout
 * @module constants
 */

/**
 * Default timeout values in milliseconds
 */
export const DEFAULT_TIMEOUTS = {
  /** Global default timeout: 30 seconds */
  GLOBAL: 30000,

  /** Minimum allowed timeout: 1 second */
  MINIMUM: 3000,

  /** Maximum allowed timeout: 10 minutes */
  MAXIMUM: 600000,

  /** Timeout for streaming endpoints: 10 minutes */
  STREAMING: 600000,
} as const;

/**
 * Default retry configuration
 */
export const DEFAULT_RETRY = {
  /** Maximum number of retry attempts */
  MAX_RETRIES: 3,

  /** Initial delay before first retry: 3 seconds */
  INITIAL_DELAY: 3000,

  /** Exponential backoff multiplier */
  BACKOFF_MULTIPLIER: 2,

  /** Maximum delay cap: 10 seconds */
  MAX_DELAY: 10000,
} as const;

/**
 * Error type constants
 */
export const ERROR_TYPES = {
  /** Automatic timeout after configured duration */
  API_TIMEOUT: "API_TIMEOUT",

  /** User-initiated cancellation */
  USER_CANCEL: "USER_CANCEL",
} as const;

/**
 * Timeout source constants for tracking where timeout values come from
 */
export const TIMEOUT_SOURCE = {
  /** Endpoint-specific timeout */
  ENDPOINT: "endpoint",

  /** Service-specific timeout */
  SERVICE: "service",

  /** Global timeout */
  GLOBAL: "global",

  /** Hardcoded default fallback */
  DEFAULT: "default",
} as const;

/**
 * Validation ranges for timeout configuration
 */
export const VALIDATION_RANGES = {
  /** Minimum timeout value (milliseconds) */
  TIMEOUT_MIN: 1000,

  /** Maximum timeout value (milliseconds) */
  TIMEOUT_MAX: 600000,

  /** Minimum retry count */
  RETRY_MIN: 0,

  /** Maximum retry count */
  RETRY_MAX: 10,

  /** Minimum retry delay (milliseconds) */
  RETRY_DELAY_MIN: 100,

  /** Maximum retry delay (milliseconds) */
  RETRY_DELAY_MAX: 30000,

  /** Minimum backoff multiplier */
  BACKOFF_MIN: 1.0,

  /** Maximum backoff multiplier */
  BACKOFF_MAX: 5.0,
} as const;

/**
 * Environment variable prefixes
 */
export const ENV_PREFIXES = {
  /** Global timeout variable prefix */
  GLOBAL: "NEXT_PUBLIC_API_TIMEOUT_GLOBAL",

  /** Service timeout variable prefix */
  SERVICE: "NEXT_PUBLIC_API_TIMEOUT_SERVICE_",

  /** Endpoint timeout variable prefix */
  ENDPOINT: "NEXT_PUBLIC_API_TIMEOUT_ENDPOINT_",

  /** Max retries variable */
  MAX_RETRIES: "NEXT_PUBLIC_API_MAX_RETRIES",

  /** Retry delay variable */
  RETRY_DELAY: "NEXT_PUBLIC_API_RETRY_DELAY_MS",
} as const;

/**
 * Known service names for timeout configuration
 */
export const KNOWN_SERVICES = [
  "DOP",
  "EKYC",
  "CONSENT",
  "PAYMENT",
  "AUTH",
  "LEADS",
] as const;

/**
 * Special endpoint patterns that require longer timeouts
 */
export const SPECIAL_ENDPOINTS = {
  /** File upload endpoints */
  FILE_UPLOAD: ["EKYC_SUBMIT", "DOCUMENT_UPLOAD", "FILE_UPLOAD"],

  /** Streaming endpoints */
  STREAMING: ["EKYC_STREAM", "REALTIME", "WEBSOCKET"],

  /** Batch processing endpoints */
  BATCH: ["BATCH", "BULK", "EXPORT"],
} as const;

/**
 * Default timeout overrides for special endpoint patterns
 */
export const SPECIAL_ENDPOINT_TIMEOUTS = {
  /** File upload timeout: 2 minutes */
  FILE_UPLOAD: 120000,

  /** Streaming timeout: 10 minutes */
  STREAMING: 600000,

  /** Batch processing timeout: 5 minutes */
  BATCH: 300000,
} as const;

/**
 * Timeout configuration validation error messages
 */
export const VALIDATION_ERRORS = {
  /** Invalid timeout value error */
  INVALID_TIMEOUT: (variable: string, value: string) =>
    `${variable}: Invalid timeout value "${value}". Must be a positive integer between ${VALIDATION_RANGES.TIMEOUT_MIN} and ${VALIDATION_RANGES.TIMEOUT_MAX} milliseconds.`,

  /** Invalid retry count error */
  INVALID_RETRIES: (variable: string, value: string) =>
    `${variable}: Invalid retry count "${value}". Must be an integer between ${VALIDATION_RANGES.RETRY_MIN} and ${VALIDATION_RANGES.RETRY_MAX}.`,

  /** Invalid retry delay error */
  INVALID_RETRY_DELAY: (variable: string, value: string) =>
    `${variable}: Invalid retry delay "${value}". Must be a positive integer between ${VALIDATION_RANGES.RETRY_DELAY_MIN} and ${VALIDATION_RANGES.RETRY_DELAY_MAX} milliseconds.`,
} as const;

/**
 * User-facing error messages (English)
 */
export const ERROR_MESSAGES_EN = {
  /** Generic timeout error message */
  TIMEOUT: "The request took too long to complete. Please try again.",

  /** User cancellation message */
  CANCELLED: "Request was cancelled.",

  /** Retry message */
  RETRY: (attempt: number, max: number) => `Retrying... (${attempt}/${max})`,

  /** Final failure message */
  FINAL_FAILURE:
    "Request failed after multiple attempts. Please try again later.",
} as const;

/**
 * User-facing error messages (Vietnamese)
 */
export const ERROR_MESSAGES_VI = {
  /** Generic timeout error message */
  TIMEOUT: "Yêu cầu mất quá nhiều thời gian. Vui lòng thử lại.",

  /** User cancellation message */
  CANCELLED: "Yêu cầu đã bị hủy.",

  /** Retry message */
  RETRY: (attempt: number, max: number) =>
    `Đang thử lại... (${attempt}/${max})`,

  /** Final failure message */
  FINAL_FAILURE: "Yêu cầu thất bại sau nhiều lần thử. Vui lòng thử lại sau.",
} as const;

/**
 * Default timeout configuration
 * This is the fallback configuration when no environment variables are set
 */
export const DEFAULT_CONFIG = {
  global: DEFAULT_TIMEOUTS.GLOBAL,
  maxRetries: DEFAULT_RETRY.MAX_RETRIES,
  retryDelay: DEFAULT_RETRY.INITIAL_DELAY,
} as const;

/**
 * Performance targets for timeout operations
 */
export const PERFORMANCE_TARGETS = {
  /** Maximum overhead per request (milliseconds) */
  OVERHEAD_MAX: 1,

  /** Maximum configuration parsing time (milliseconds) */
  PARSING_MAX: 10,

  /** Maximum timeout resolution time (milliseconds) */
  RESOLUTION_MAX: 1,
} as const;

/**
 * Logging configuration
 */
export const LOGGING_CONFIG = {
  /** Whether to log all timeout events */
  LOG_ALL_TIMEOUTS: true,

  /** Whether to log user cancellations */
  LOG_USER_CANCELS: true,

  /** Whether to include request details in logs */
  INCLUDE_REQUEST_DETAILS: true,

  /** Whether to sanitize sensitive data from logs */
  SANITIZE_LOGS: true,
} as const;

/**
 * Feature flags for timeout functionality
 */
export const FEATURE_FLAGS = {
  /** Enable retry logic */
  RETRY_ENABLED: true,

  /** Enable exponential backoff */
  BACKOFF_ENABLED: true,

  /** Enable jitter in retry delays */
  JITTER_ENABLED: false,

  /** Enable timeout event logging */
  LOGGING_ENABLED: true,

  /** Enable startup validation */
  VALIDATION_ENABLED: true,
} as const;
