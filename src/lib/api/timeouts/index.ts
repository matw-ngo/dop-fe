/**
 * Configurable API Timeout System
 *
 * Comprehensive timeout configuration system for API requests.
 * Supports global, service-specific, and endpoint-specific timeouts
 * with automatic retry logic and user-friendly error handling.
 *
 * @feature 002-configurable-api-timeout
 * @module timeouts
 */

// Type definitions
export type {
  TimeoutConfig,
  TimeoutError,
  TimeoutContext,
  RetryStrategy,
  TimeoutResolution,
  ValidationResult,
  ValidationError,
  TimeoutLogEntry,
  TimeoutErrorHandler,
  TimeoutErrorHandlers,
  TimeoutQueryOptions,
  TimeoutMutationOptions,
  ServiceName,
  NormalizedEndpointPath,
} from "./types";

// Constants
export {
  DEFAULT_TIMEOUTS,
  DEFAULT_RETRY,
  ERROR_TYPES,
  TIMEOUT_SOURCE,
  VALIDATION_RANGES,
  ENV_PREFIXES,
  KNOWN_SERVICES,
  SPECIAL_ENDPOINTS,
  SPECIAL_ENDPOINT_TIMEOUTS,
  VALIDATION_ERRORS,
  ERROR_MESSAGES_EN,
  ERROR_MESSAGES_VI,
  DEFAULT_CONFIG,
  PERFORMANCE_TARGETS,
  LOGGING_CONFIG,
  FEATURE_FLAGS,
} from "./constants";

// Utility functions
export {
  normalizeEndpointPath,
  isTimeoutError,
  isRetryableError,
  generateRequestId,
  extractServiceName,
  isSpecialEndpoint,
  isValidTimeout,
  isValidRetryCount,
  calculateBackoffDelay,
  formatDuration,
  getTimestamp,
  parseEnvNumber,
  sanitizeLogContext,
  createTimeoutError,
} from "./utils";

// Configuration parsing
export {
  parseTimeoutConfig,
  getEndpointTimeout,
  getServiceTimeout,
  getGlobalTimeout,
  parseTimeoutValue,
  getTimeoutEnvVars,
  hasTimeoutConfig,
} from "./config-parser";

// Configuration validation
export {
  validateTimeoutConfig,
  validateTimeoutConfigOrThrow,
  formatValidationErrors,
  isTimeoutConfigValid,
  getValidationErrors,
  isTimeoutValueValid,
  isRetryCountValid,
  isRetryDelayValid,
} from "./config-validator";

// Store
export {
  useTimeoutStore,
  useTimeoutConfig,
  useActiveRequestCount,
  useIsRequestActive,
  updateTimeoutConfig,
  resetTimeoutConfig,
  getActiveRequestIds,
  getEndpointTimeout as getStoreEndpointTimeout,
} from "./timeout-store";

// Timeout resolution
export {
  resolveTimeout,
  resolveTimeoutWithOverride,
  getSourcePriority,
  compareResolutions,
  describeResolution,
  isExplicitResolution,
  getResolutionKey,
  resolveTimeoutsBatch,
  createResolution,
} from "./resolver";

// AbortController integration
export {
  createTimeoutSignal,
  createTimeoutController,
  withTimeout,
  hasNativeTimeoutSupport,
  getTimeoutImplementation,
  createTimeoutSignalWithCallback,
  isAborted,
  getAbortReason,
} from "./abort-timeout";

// Client integration
export {
  timeoutFetch,
  createRequestContext,
  cancelRequest,
  cancelAllRequests,
  getActiveRequestCount,
  isRequestActive,
} from "./client-integration";

// Endpoint configuration
export {
  getDefaultEndpointConfig,
  getServiceDefaultTimeout,
  getEndpointDefaultTimeout,
  getSpecialEndpointType,
  getSpecialEndpointTimeout,
  combineDefaultsWithRuntime,
  getConfiguredServices,
  getConfiguredEndpoints,
  hasServiceDefault,
  hasEndpointDefault,
} from "./endpoint-config";

// Error handling
export {
  isTimeoutError as isTimeoutErrorHandler,
  isAbortError,
  classifyTimeoutError,
  createAndLogTimeoutError,
  createLogEntryFromError,
  logTimeoutError,
  handleTimeoutError,
  getUserFriendlyMessage,
  isRetryableTimeoutError,
  formatErrorDetails,
  convertAbortToTimeoutError,
  batchProcessTimeoutErrors,
} from "./error-handler";

// Retry execution
export {
  executeWithRetry,
  withRetry,
  executeBatchWithRetry,
  executeSequentialWithRetry,
  createRetryStrategy,
  calculateTotalRetryTime,
  validateRetryOptions,
  getDefaultRetryOptions,
} from "./retry-executor";

// Types for re-export
import type {
  TimeoutConfig,
  TimeoutError,
  TimeoutContext,
  RetryStrategy,
} from "./types";
