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

// AbortController integration
export {
  createTimeoutController,
  createTimeoutSignal,
  createTimeoutSignalWithCallback,
  getAbortReason,
  getTimeoutImplementation,
  hasNativeTimeoutSupport,
  isAborted,
  withTimeout,
} from "./abort-timeout";
// Client integration
export {
  cancelAllRequests,
  cancelRequest,
  createRequestContext,
  getActiveRequestCount,
  isRequestActive,
  timeoutFetch,
} from "./client-integration";
// Configuration parsing
export {
  getEndpointTimeout,
  getGlobalTimeout,
  getServiceTimeout,
  getTimeoutEnvVars,
  hasTimeoutConfig,
  parseTimeoutConfig,
  parseTimeoutValue,
} from "./config-parser";
// Configuration validation
export {
  formatValidationErrors,
  getValidationErrors,
  isRetryCountValid,
  isRetryDelayValid,
  isTimeoutConfigValid,
  isTimeoutValueValid,
  validateTimeoutConfig,
  validateTimeoutConfigOrThrow,
} from "./config-validator";
// Constants
export {
  DEFAULT_CONFIG,
  DEFAULT_RETRY,
  DEFAULT_TIMEOUTS,
  ENV_PREFIXES,
  ERROR_MESSAGES_EN,
  ERROR_MESSAGES_VI,
  ERROR_TYPES,
  FEATURE_FLAGS,
  KNOWN_SERVICES,
  LOGGING_CONFIG,
  PERFORMANCE_TARGETS,
  SPECIAL_ENDPOINT_TIMEOUTS,
  SPECIAL_ENDPOINTS,
  TIMEOUT_SOURCE,
  VALIDATION_ERRORS,
  VALIDATION_RANGES,
} from "./constants";
// Endpoint configuration
export {
  combineDefaultsWithRuntime,
  getConfiguredEndpoints,
  getConfiguredServices,
  getDefaultEndpointConfig,
  getEndpointDefaultTimeout,
  getServiceDefaultTimeout,
  getSpecialEndpointTimeout,
  getSpecialEndpointType,
  hasEndpointDefault,
  hasServiceDefault,
} from "./endpoint-config";
// Error handling
export {
  batchProcessTimeoutErrors,
  classifyTimeoutError,
  convertAbortToTimeoutError,
  createAndLogTimeoutError,
  createLogEntryFromError,
  formatErrorDetails,
  getUserFriendlyMessage,
  handleTimeoutError,
  isAbortError,
  isRetryableTimeoutError,
  isTimeoutError as isTimeoutErrorHandler,
  logTimeoutError,
} from "./error-handler";
// Timeout resolution
export {
  compareResolutions,
  createResolution,
  describeResolution,
  getResolutionKey,
  getSourcePriority,
  isExplicitResolution,
  resolveTimeout,
  resolveTimeoutsBatch,
  resolveTimeoutWithOverride,
} from "./resolver";
// Retry execution
export {
  calculateTotalRetryTime,
  createRetryStrategy,
  executeBatchWithRetry,
  executeSequentialWithRetry,
  executeWithRetry,
  getDefaultRetryOptions,
  validateRetryOptions,
  withRetry,
} from "./retry-executor";
// Store
export {
  getActiveRequestIds,
  getEndpointTimeout as getStoreEndpointTimeout,
  resetTimeoutConfig,
  updateTimeoutConfig,
  useActiveRequestCount,
  useIsRequestActive,
  useTimeoutConfig,
  useTimeoutStore,
} from "./timeout-store";
// Type definitions
export type {
  NormalizedEndpointPath,
  RetryStrategy,
  ServiceName,
  TimeoutConfig,
  TimeoutContext,
  TimeoutError,
  TimeoutErrorHandler,
  TimeoutErrorHandlers,
  TimeoutLogEntry,
  TimeoutMutationOptions,
  TimeoutQueryOptions,
  TimeoutResolution,
  ValidationError,
  ValidationResult,
} from "./types";
// Utility functions
export {
  calculateBackoffDelay,
  createTimeoutError,
  extractServiceName,
  formatDuration,
  generateRequestId,
  getTimestamp,
  isRetryableError,
  isSpecialEndpoint,
  isTimeoutError,
  isValidRetryCount,
  isValidTimeout,
  normalizeEndpointPath,
  parseEnvNumber,
  sanitizeLogContext,
} from "./utils";
