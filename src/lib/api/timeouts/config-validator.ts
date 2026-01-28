/**
 * Configurable API Timeout Configuration Validator
 *
 * This file handles validation of timeout configuration from environment variables.
 * It performs startup validation with clear error messages for invalid configuration.
 *
 * @feature 002-configurable-api-timeout
 * @module config-validator
 */

import {
  DEFAULT_CONFIG,
  ENV_PREFIXES,
  VALIDATION_ERRORS,
  VALIDATION_RANGES,
} from "./constants";
import type { ValidationError, ValidationResult } from "./types";

/**
 * Validates timeout configuration and returns detailed results
 *
 * Performs comprehensive validation of all timeout environment variables
 * and returns a ValidationResult with either valid config or list of errors.
 *
 * @returns Validation result with config or errors
 *
 * @example
 * ```typescript
 * const result = validateTimeoutConfig();
 * if (result.valid) {
 *   // Use result.config
 * } else {
 *   // Display result.errors to user
 *   console.error('Invalid configuration:');
 *   result.errors.forEach(err => console.error(`- ${err.message}`));
 * }
 * ```
 */
export function validateTimeoutConfig(): ValidationResult {
  const errors: ValidationError[] = [];

  // Validate global timeout
  validateGlobalTimeout(errors);

  // Validate service timeouts
  validateServiceTimeouts(errors);

  // Validate endpoint timeouts
  validateEndpointTimeouts(errors);

  // Validate retry configuration
  validateRetryConfig(errors);

  // Return result
  if (errors.length > 0) {
    return { valid: false, errors };
  }

  // Config is valid, return default config
  return {
    valid: true,
    errors: [],
    config: DEFAULT_CONFIG,
  };
}

/**
 * Validates global timeout configuration
 *
 * @param errors - Array to collect validation errors
 */
function validateGlobalTimeout(errors: ValidationError[]): void {
  const envVar = ENV_PREFIXES.GLOBAL;
  const value = process.env[envVar];

  if (value === undefined || value === "") {
    return; // Not set is valid (will use default)
  }

  const parsed = parseInt(value, 10);

  if (Number.isNaN(parsed)) {
    errors.push({
      variable: envVar,
      message: VALIDATION_ERRORS.INVALID_TIMEOUT(envVar, value),
      value,
      expected: `Integer between ${VALIDATION_RANGES.TIMEOUT_MIN} and ${VALIDATION_RANGES.TIMEOUT_MAX}`,
    });
    return;
  }

  if (
    parsed < VALIDATION_RANGES.TIMEOUT_MIN ||
    parsed > VALIDATION_RANGES.TIMEOUT_MAX
  ) {
    errors.push({
      variable: envVar,
      message: VALIDATION_ERRORS.INVALID_TIMEOUT(envVar, value),
      value,
      expected: `Integer between ${VALIDATION_RANGES.TIMEOUT_MIN} and ${VALIDATION_RANGES.TIMEOUT_MAX}`,
    });
  }
}

/**
 * Validates service-specific timeout configuration
 *
 * @param errors - Array to collect validation errors
 */
function validateServiceTimeouts(errors: ValidationError[]): void {
  for (const [key, value] of Object.entries(process.env)) {
    if (!key.startsWith(ENV_PREFIXES.SERVICE) || key === ENV_PREFIXES.SERVICE) {
      continue;
    }

    if (!value) {
      continue;
    }

    const parsed = parseInt(value, 10);

    if (Number.isNaN(parsed)) {
      errors.push({
        variable: key,
        message: VALIDATION_ERRORS.INVALID_TIMEOUT(key, value),
        value,
        expected: `Integer between ${VALIDATION_RANGES.TIMEOUT_MIN} and ${VALIDATION_RANGES.TIMEOUT_MAX}`,
      });
      continue;
    }

    if (
      parsed < VALIDATION_RANGES.TIMEOUT_MIN ||
      parsed > VALIDATION_RANGES.TIMEOUT_MAX
    ) {
      errors.push({
        variable: key,
        message: VALIDATION_ERRORS.INVALID_TIMEOUT(key, value),
        value,
        expected: `Integer between ${VALIDATION_RANGES.TIMEOUT_MIN} and ${VALIDATION_RANGES.TIMEOUT_MAX}`,
      });
    }
  }
}

/**
 * Validates endpoint-specific timeout configuration
 *
 * @param errors - Array to collect validation errors
 */
function validateEndpointTimeouts(errors: ValidationError[]): void {
  for (const [key, value] of Object.entries(process.env)) {
    if (
      !key.startsWith(ENV_PREFIXES.ENDPOINT) ||
      key === ENV_PREFIXES.ENDPOINT
    ) {
      continue;
    }

    if (!value) {
      continue;
    }

    const parsed = parseInt(value, 10);

    if (Number.isNaN(parsed)) {
      errors.push({
        variable: key,
        message: VALIDATION_ERRORS.INVALID_TIMEOUT(key, value),
        value,
        expected: `Integer between ${VALIDATION_RANGES.TIMEOUT_MIN} and ${VALIDATION_RANGES.TIMEOUT_MAX}`,
      });
      continue;
    }

    if (
      parsed < VALIDATION_RANGES.TIMEOUT_MIN ||
      parsed > VALIDATION_RANGES.TIMEOUT_MAX
    ) {
      errors.push({
        variable: key,
        message: VALIDATION_ERRORS.INVALID_TIMEOUT(key, value),
        value,
        expected: `Integer between ${VALIDATION_RANGES.TIMEOUT_MIN} and ${VALIDATION_RANGES.TIMEOUT_MAX}`,
      });
    }
  }
}

/**
 * Validates retry configuration
 *
 * @param errors - Array to collect validation errors
 */
function validateRetryConfig(errors: ValidationError[]): void {
  // Validate max retries
  const maxRetriesVar = ENV_PREFIXES.MAX_RETRIES;
  const maxRetriesValue = process.env[maxRetriesVar];

  if (maxRetriesValue !== undefined && maxRetriesValue !== "") {
    const parsed = parseInt(maxRetriesValue, 10);

    if (Number.isNaN(parsed)) {
      errors.push({
        variable: maxRetriesVar,
        message: VALIDATION_ERRORS.INVALID_RETRIES(
          maxRetriesVar,
          maxRetriesValue,
        ),
        value: maxRetriesValue,
        expected: `Integer between ${VALIDATION_RANGES.RETRY_MIN} and ${VALIDATION_RANGES.RETRY_MAX}`,
      });
    } else if (
      parsed < VALIDATION_RANGES.RETRY_MIN ||
      parsed > VALIDATION_RANGES.RETRY_MAX
    ) {
      errors.push({
        variable: maxRetriesVar,
        message: VALIDATION_ERRORS.INVALID_RETRIES(
          maxRetriesVar,
          maxRetriesValue,
        ),
        value: maxRetriesValue,
        expected: `Integer between ${VALIDATION_RANGES.RETRY_MIN} and ${VALIDATION_RANGES.RETRY_MAX}`,
      });
    }
  }

  // Validate retry delay
  const retryDelayVar = ENV_PREFIXES.RETRY_DELAY;
  const retryDelayValue = process.env[retryDelayVar];

  if (retryDelayValue !== undefined && retryDelayValue !== "") {
    const parsed = parseInt(retryDelayValue, 10);

    if (Number.isNaN(parsed)) {
      errors.push({
        variable: retryDelayVar,
        message: VALIDATION_ERRORS.INVALID_RETRY_DELAY(
          retryDelayVar,
          retryDelayValue,
        ),
        value: retryDelayValue,
        expected: `Integer between ${VALIDATION_RANGES.RETRY_DELAY_MIN} and ${VALIDATION_RANGES.RETRY_DELAY_MAX}`,
      });
    } else if (
      parsed < VALIDATION_RANGES.RETRY_DELAY_MIN ||
      parsed > VALIDATION_RANGES.RETRY_DELAY_MAX
    ) {
      errors.push({
        variable: retryDelayVar,
        message: VALIDATION_ERRORS.INVALID_RETRY_DELAY(
          retryDelayVar,
          retryDelayValue,
        ),
        value: retryDelayValue,
        expected: `Integer between ${VALIDATION_RANGES.RETRY_DELAY_MIN} and ${VALIDATION_RANGES.RETRY_DELAY_MAX}`,
      });
    }
  }
}

/**
 * Performs startup validation and throws error if invalid
 *
 * This function should be called during application startup to ensure
 * timeout configuration is valid before the app initializes.
 *
 * @throws Error with detailed validation messages if configuration is invalid
 *
 * @example
 * ```typescript
 * // In app initialization
 * try {
 *   validateTimeoutConfigOrThrow();
 *   console.log('Timeout configuration is valid');
 * } catch (error) {
 *   console.error('Startup failed:', error.message);
 *   process.exit(1);
 * }
 * ```
 */
export function validateTimeoutConfigOrThrow(): void {
  const result = validateTimeoutConfig();

  if (!result.valid) {
    const errorMessage = formatValidationErrors(result.errors);
    throw new Error(errorMessage);
  }
}

/**
 * Formats validation errors into a readable error message
 *
 * @param errors - Array of validation errors
 * @returns Formatted error message
 *
 * @example
 * ```typescript
 * const errors = [
 *   { variable: 'NEXT_PUBLIC_API_TIMEOUT_GLOBAL', message: 'Invalid value', value: 'abc' }
 * ];
 * const message = formatValidationErrors(errors);
 * // Returns:
 * // "Invalid timeout configuration:
 * // - NEXT_PUBLIC_API_TIMEOUT_GLOBAL: Invalid value (got: 'abc')"
 * ```
 */
export function formatValidationErrors(errors: ValidationError[]): string {
  const lines = ["Invalid timeout configuration:"];

  for (const error of errors) {
    lines.push(`- ${error.variable}: ${error.message}`);
  }

  lines.push("");
  lines.push(
    "Please fix the environment variables and restart the application.",
  );

  return lines.join("\n");
}

/**
 * Checks if timeout configuration is valid without throwing
 *
 * @returns True if configuration is valid
 *
 * @example
 * ```typescript
 * if (isTimeoutConfigValid()) {
 *   // Proceed with application startup
 * } else {
 *   // Show error to user
 * }
 * ```
 */
export function isTimeoutConfigValid(): boolean {
  const result = validateTimeoutConfig();
  return result.valid;
}

/**
 * Gets validation errors without throwing
 *
 * @returns Array of validation errors (empty if valid)
 *
 * @example
 * ```typescript
 * const errors = getValidationErrors();
 * if (errors.length > 0) {
 *   errors.forEach(err => console.error(err.message));
 * }
 * ```
 */
export function getValidationErrors(): ValidationError[] {
  const result = validateTimeoutConfig();
  return result.errors;
}

/**
 * Validates a single timeout value
 *
 * @param value - The timeout value to validate
 * @returns True if the value is valid
 *
 * @example
 * ```typescript
 * isTimeoutValueValid(30000) // true
 * isTimeoutValueValid(0) // false
 * isTimeoutValueValid(1000000) // false
 * ```
 */
export function isTimeoutValueValid(value: number): boolean {
  return (
    typeof value === "number" &&
    !Number.isNaN(value) &&
    Number.isInteger(value) &&
    value >= VALIDATION_RANGES.TIMEOUT_MIN &&
    value <= VALIDATION_RANGES.TIMEOUT_MAX
  );
}

/**
 * Validates a single retry count value
 *
 * @param value - The retry count to validate
 * @returns True if the value is valid
 *
 * @example
 * ```typescript
 * isRetryCountValid(3) // true
 * isRetryCountValid(-1) // false
 * isRetryCountValid(15) // false
 * ```
 */
export function isRetryCountValid(value: number): boolean {
  return (
    typeof value === "number" &&
    !Number.isNaN(value) &&
    Number.isInteger(value) &&
    value >= VALIDATION_RANGES.RETRY_MIN &&
    value <= VALIDATION_RANGES.RETRY_MAX
  );
}

/**
 * Validates a single retry delay value
 *
 * @param value - The retry delay to validate
 * @returns True if the value is valid
 *
 * @example
 * ```typescript
 * isRetryDelayValid(1000) // true
 * isRetryDelayValid(0) // false
 * isRetryDelayValid(50000) // false
 * ```
 */
export function isRetryDelayValid(value: number): boolean {
  return (
    typeof value === "number" &&
    !Number.isNaN(value) &&
    Number.isInteger(value) &&
    value >= VALIDATION_RANGES.RETRY_DELAY_MIN &&
    value <= VALIDATION_RANGES.RETRY_DELAY_MAX
  );
}
