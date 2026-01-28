/**
 * Configurable API Timeout Utilities
 *
 * This file contains utility functions for path normalization, type guards,
 * request ID generation, and other helper functions used throughout the
 * timeout configuration system.
 *
 * @feature 002-configurable-api-timeout
 * @module utils
 */

import { ERROR_TYPES } from "./constants";
import type { TimeoutError } from "./types";

/**
 * Normalizes endpoint paths for environment variable lookup
 *
 * Rules:
 * 1. Remove leading slash
 * 2. Replace slashes with underscores
 * 3. Remove dynamic segments (e.g., {id}, :id)
 * 4. Convert to uppercase
 *
 * @param path - The endpoint path to normalize
 * @returns Normalized path string for environment variable lookup
 *
 * @example
 * ```typescript
 * normalizeEndpointPath('/leads') // 'LEADS'
 * normalizeEndpointPath('/leads/{id}/submit-otp') // 'LEADS_SUBMIT_OTP'
 * normalizeEndpointPath('/ekyc/config') // 'EKYC_CONFIG'
 * normalizeEndpointPath('/api/v1/users/:id/profile') // 'API_V1_USERS_PROFILE'
 * ```
 */
export function normalizeEndpointPath(path: string): string {
  return path
    .replace(/^\//, "") // Remove leading slash
    .replace(/\/:?\w+/g, "") // Remove dynamic segments
    .replace(/\//g, "_") // Replace slashes with underscores
    .toUpperCase(); // Convert to uppercase
}

/**
 * Type guard for TimeoutError
 *
 * Checks if an unknown error is a TimeoutError by verifying the presence
 * of required properties and valid error types.
 *
 * @param error - The error to check
 * @returns True if the error is a TimeoutError
 *
 * @example
 * ```typescript
 * if (isTimeoutError(error)) {
 *   console.log(error.endpoint, error.timeoutDuration);
 * }
 * ```
 */
export function isTimeoutError(error: unknown): error is TimeoutError {
  return (
    error instanceof Error &&
    "type" in error &&
    (error.type === "API_TIMEOUT" || error.type === "USER_CANCEL") &&
    "endpoint" in error &&
    "timeoutDuration" in error &&
    "elapsedTime" in error
  );
}

/**
 * Type guard for retryable errors
 *
 * Determines if an error should trigger a retry attempt.
 * Only automatic timeouts (API_TIMEOUT) are retryable, not user cancellations.
 *
 * @param error - The error to check
 * @returns True if the error is retryable
 *
 * @example
 * ```typescript
 * if (isRetryableError(error)) {
 *   // Retry the request
 * }
 * ```
 */
export function isRetryableError(error: unknown): boolean {
  if (!isTimeoutError(error)) {
    return false;
  }

  // Only retry automatic timeouts, not user cancellations
  return error.type === ERROR_TYPES.API_TIMEOUT;
}

/**
 * Generates a unique request ID for tracking
 *
 * Creates a unique identifier for each request using a timestamp
 * and random component for collision avoidance.
 *
 * @returns A unique request ID string
 *
 * @example
 * ```typescript
 * const requestId = generateRequestId();
 * // Returns: 'req_1234567890_abc123'
 * ```
 */
export function generateRequestId(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `req_${timestamp}_${random}`;
}

/**
 * Extracts service name from endpoint path
 *
 * Parses the endpoint path to determine which service it belongs to.
 * Uses the first path segment as the service name.
 *
 * @param endpoint - The endpoint path
 * @returns The service name or 'default' if not found
 *
 * @example
 * ```typescript
 * extractServiceName('/leads/123/submit-otp') // 'LEADS'
 * extractServiceName('/ekyc/config') // 'EKYC'
 * extractServiceName('/unknown/path') // 'UNKNOWN'
 * ```
 */
export function extractServiceName(endpoint: string): string {
  // Remove leading slash and get first segment
  const segments = endpoint.replace(/^\//, "").split("/");
  const firstSegment = segments[0]?.toUpperCase();

  return firstSegment || "DEFAULT";
}

/**
 * Checks if an endpoint matches a special pattern
 *
 * Determines if an endpoint is a file upload, streaming, or batch
 * endpoint that requires special timeout handling.
 *
 * @param endpoint - The endpoint path (normalized)
 * @param patterns - Array of pattern strings to match against
 * @returns True if the endpoint matches any pattern
 *
 * @example
 * ```typescript
 * isSpecialEndpoint('EKYC_SUBMIT', ['EKYC_SUBMIT', 'DOCUMENT_UPLOAD']) // true
 * isSpecialEndpoint('LEADS', ['EKYC_SUBMIT']) // false
 * ```
 */
export function isSpecialEndpoint(
  endpoint: string,
  patterns: string[],
): boolean {
  return patterns.some((pattern) => endpoint.includes(pattern));
}

/**
 * Validates a timeout value
 *
 * Checks if a timeout value is within the acceptable range.
 *
 * @param value - The timeout value to validate
 * @param min - Minimum allowed value (default: 1000)
 * @param max - Maximum allowed value (default: 600000)
 * @returns True if the value is valid
 *
 * @example
 * ```typescript
 * isValidTimeout(30000) // true
 * isValidTimeout(0) // false
 * isValidTimeout(1000000) // false
 * ```
 */
export function isValidTimeout(
  value: number,
  min = 1000,
  max = 600000,
): boolean {
  return (
    typeof value === "number" &&
    !Number.isNaN(value) &&
    Number.isInteger(value) &&
    value >= min &&
    value <= max
  );
}

/**
 * Validates a retry count
 *
 * Checks if a retry count is within the acceptable range.
 *
 * @param value - The retry count to validate
 * @returns True if the value is valid
 *
 * @example
 * ```typescript
 * isValidRetryCount(3) // true
 * isValidRetryCount(-1) // false
 * isValidRetryCount(15) // false
 * ```
 */
export function isValidRetryCount(value: number): boolean {
  return (
    typeof value === "number" &&
    !Number.isNaN(value) &&
    Number.isInteger(value) &&
    value >= 0 &&
    value <= 10
  );
}

/**
 * Calculates exponential backoff delay
 *
 * Computes the delay for a given retry attempt using exponential backoff.
 *
 * @param attempt - The current attempt number (0-based)
 * @param initialDelay - Initial delay in milliseconds
 * @param multiplier - Backoff multiplier
 * @param maxDelay - Maximum delay cap (optional)
 * @returns Delay in milliseconds
 *
 * @example
 * ```typescript
 * calculateBackoffDelay(0, 1000, 2) // 1000
 * calculateBackoffDelay(1, 1000, 2) // 2000
 * calculateBackoffDelay(2, 1000, 2, 5000) // 4000
 * calculateBackoffDelay(3, 1000, 2, 5000) // 5000 (capped)
 * ```
 */
export function calculateBackoffDelay(
  attempt: number,
  initialDelay: number,
  multiplier: number,
  maxDelay?: number,
): number {
  const delay = initialDelay * multiplier ** attempt;

  if (maxDelay !== undefined) {
    return Math.min(delay, maxDelay);
  }

  return delay;
}

/**
 * Formats milliseconds to human-readable duration
 *
 * Converts a millisecond value to a readable string like "30s" or "5m 30s".
 *
 * @param ms - Duration in milliseconds
 * @returns Formatted duration string
 *
 * @example
 * ```typescript
 * formatDuration(30000) // '30s'
 * formatDuration(90000) // '1m 30s'
 * formatDuration(3661000) // '1h 1m 1s'
 * ```
 */
export function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  const parts: string[] = [];

  if (hours > 0) {
    parts.push(`${hours}h`);
  }

  if (minutes > 0) {
    parts.push(`${minutes % 60}m`);
  }

  if (seconds % 60 > 0 || parts.length === 0) {
    parts.push(`${seconds % 60}s`);
  }

  return parts.join(" ");
}

/**
 * Gets current timestamp in ISO 8601 format
 *
 * @returns Current timestamp as ISO string
 */
export function getTimestamp(): string {
  return new Date().toISOString();
}

/**
 * Parses an environment variable as a number
 *
 * Safely parses a string environment variable to a number,
 * returning undefined if parsing fails.
 *
 * @param value - The environment variable value
 * @returns Parsed number or undefined
 *
 * @example
 * ```typescript
 * parseEnvNumber('30000') // 30000
 * parseEnvNumber('invalid') // undefined
 * parseEnvNumber('') // undefined
 * ```
 */
export function parseEnvNumber(value: string | undefined): number | undefined {
  if (value === undefined || value === "") {
    return undefined;
  }

  const parsed = parseInt(value, 10);

  if (Number.isNaN(parsed)) {
    return undefined;
  }

  return parsed;
}

/**
 * Sanitizes error context for logging
 *
 * Removes sensitive information (tokens, passwords, etc.) from
 * objects before logging.
 *
 * @param context - The context object to sanitize
 * @returns Sanitized context object
 *
 * @example
 * ```typescript
 * sanitizeLogContext({ token: 'abc123', userId: '123' })
 * // Returns: { token: '[REDACTED]', userId: '123' }
 * ```
 */
export function sanitizeLogContext(
  context: Record<string, unknown>,
): Record<string, unknown> {
  const sensitiveKeys = [
    "token",
    "password",
    "secret",
    "apiKey",
    "authorization",
    "cookie",
    "session",
  ];

  const sanitized: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(context)) {
    const lowerKey = key.toLowerCase();

    if (sensitiveKeys.some((sensitive) => lowerKey.includes(sensitive))) {
      sanitized[key] = "[REDACTED]";
    } else if (typeof value === "object" && value !== null) {
      sanitized[key] = sanitizeLogContext(value as Record<string, unknown>);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}

/**
 * Creates a TimeoutError object
 *
 * Factory function for creating properly structured TimeoutError instances.
 *
 * @param endpoint - The endpoint that timed out
 * @param timeoutDuration - Configured timeout duration
 * @param elapsedTime - Actual elapsed time
 * @param retryCount - Number of retry attempts
 * @param method - HTTP method
 * @param type - Error type (default: 'API_TIMEOUT')
 * @param requestId - Request ID (optional)
 * @param sessionId - Session ID (optional)
 * @returns A TimeoutError instance
 *
 * @example
 * ```typescript
 * const error = createTimeoutError(
 *   '/leads/123/submit-otp',
 *   10000,
 *   10001,
 *   3,
 *   'POST'
 * );
 * ```
 */
export function createTimeoutError(
  endpoint: string,
  timeoutDuration: number,
  elapsedTime: number,
  retryCount: number,
  method: string,
  type: "API_TIMEOUT" | "USER_CANCEL" = "API_TIMEOUT",
  requestId?: string,
  sessionId?: string,
): TimeoutError {
  const error = new Error(
    `Request to ${endpoint} timed out after ${formatDuration(timeoutDuration)}`,
  ) as TimeoutError;

  error.name = "TimeoutError";
  error.type = type;
  error.endpoint = endpoint;
  error.timeoutDuration = timeoutDuration;
  error.elapsedTime = elapsedTime;
  error.retryCount = retryCount;
  error.method = method;
  error.requestId = requestId;
  error.sessionId = sessionId;
  error.timestamp = getTimestamp();

  return error;
}
