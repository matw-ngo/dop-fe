/**
 * Configurable API Timeout Configuration Parser
 *
 * This file handles parsing of timeout configuration from environment variables.
 * It supports global, service-specific, and endpoint-specific timeout configuration.
 *
 * @feature 002-configurable-api-timeout
 * @module config-parser
 */

import type { TimeoutConfig } from "./types";
import { DEFAULT_CONFIG, ENV_PREFIXES, VALIDATION_RANGES } from "./constants";
import { normalizeEndpointPath } from "./utils";

/**
 * Parses timeout configuration from environment variables
 *
 * Reads environment variables and constructs a TimeoutConfig object.
 * Supports global, service-specific, and endpoint-specific timeouts.
 *
 * @returns Parsed timeout configuration
 *
 * @example
 * ```typescript
 * // With environment variables:
 * // NEXT_PUBLIC_API_TIMEOUT_GLOBAL=30000
 * // NEXT_PUBLIC_API_TIMEOUT_SERVICE_EKYC=60000
 * // NEXT_PUBLIC_API_TIMEOUT_ENDPOINT_LEADS_SUBMIT_OTP=10000
 *
 * const config = parseTimeoutConfig();
 * // Returns:
 * // {
 * //   global: 30000,
 * //   services: { EKYC: 60000 },
 * //   endpoints: { LEADS_SUBMIT_OTP: 10000 },
 * //   maxRetries: 3,
 * //   retryDelay: 1000
 * // }
 * ```
 */
export function parseTimeoutConfig(): TimeoutConfig {
  const config: TimeoutConfig = {
    global: parseGlobalTimeout(),
    services: parseServiceTimeouts(),
    endpoints: parseEndpointTimeouts(),
    maxRetries: parseRetryCount(),
    retryDelay: parseRetryDelay(),
  };

  return config;
}

/**
 * Parses global timeout from environment variable
 *
 * @returns Global timeout in milliseconds, or default if not set
 */
function parseGlobalTimeout(): number {
  const envValue = process.env[ENV_PREFIXES.GLOBAL];

  if (envValue === undefined || envValue === "") {
    return DEFAULT_CONFIG.global;
  }

  const parsed = parseInt(envValue, 10);

  if (isNaN(parsed)) {
    return DEFAULT_CONFIG.global;
  }

  return parsed;
}

/**
 * Parses service-specific timeouts from environment variables
 *
 * Scans all environment variables for service timeout configuration
 * and returns a record of service name to timeout mapping.
 *
 * @returns Record of service timeouts
 */
function parseServiceTimeouts(): Record<string, number> | undefined {
  const services: Record<string, number> = {};

  for (const [key, value] of Object.entries(process.env)) {
    // Check if this is a service timeout variable
    if (key.startsWith(ENV_PREFIXES.SERVICE) && value) {
      // Extract service name from variable name
      // Format: NEXT_PUBLIC_API_TIMEOUT_SERVICE_<SERVICE_NAME>
      const serviceName = key.replace(ENV_PREFIXES.SERVICE, "");

      if (serviceName) {
        const parsed = parseInt(value, 10);
        if (!isNaN(parsed)) {
          services[serviceName] = parsed;
        }
      }
    }
  }

  return Object.keys(services).length > 0 ? services : undefined;
}

/**
 * Parses endpoint-specific timeouts from environment variables
 *
 * Scans all environment variables for endpoint timeout configuration
 * and returns a record of normalized endpoint path to timeout mapping.
 *
 * @returns Record of endpoint timeouts
 */
function parseEndpointTimeouts(): Record<string, number> | undefined {
  const endpoints: Record<string, number> = {};

  for (const [key, value] of Object.entries(process.env)) {
    // Check if this is an endpoint timeout variable
    if (key.startsWith(ENV_PREFIXES.ENDPOINT) && value) {
      // Extract endpoint path from variable name
      // Format: NEXT_PUBLIC_API_TIMEOUT_ENDPOINT_<NORMALIZED_PATH>
      const endpointPath = key.replace(ENV_PREFIXES.ENDPOINT, "");

      if (endpointPath) {
        const parsed = parseInt(value, 10);
        if (!isNaN(parsed)) {
          endpoints[endpointPath] = parsed;
        }
      }
    }
  }

  return Object.keys(endpoints).length > 0 ? endpoints : undefined;
}

/**
 * Parses max retry count from environment variable
 *
 * @returns Maximum retry count, or default if not set
 */
function parseRetryCount(): number {
  const envValue = process.env[ENV_PREFIXES.MAX_RETRIES];

  if (envValue === undefined || envValue === "") {
    return DEFAULT_CONFIG.maxRetries;
  }

  const parsed = parseInt(envValue, 10);

  if (isNaN(parsed)) {
    return DEFAULT_CONFIG.maxRetries;
  }

  return parsed;
}

/**
 * Parses retry delay from environment variable
 *
 * @returns Retry delay in milliseconds, or default if not set
 */
function parseRetryDelay(): number {
  const envValue = process.env[ENV_PREFIXES.RETRY_DELAY];

  if (envValue === undefined || envValue === "") {
    return DEFAULT_CONFIG.retryDelay;
  }

  const parsed = parseInt(envValue, 10);

  if (isNaN(parsed)) {
    return DEFAULT_CONFIG.retryDelay;
  }

  return parsed;
}

/**
 * Gets timeout for a specific endpoint from environment
 *
 * Direct lookup for a specific endpoint's timeout configuration.
 * This is useful for runtime timeout resolution.
 *
 * @param endpoint - The endpoint path to look up
 * @returns Timeout in milliseconds, or undefined if not configured
 *
 * @example
 * ```typescript
 * // With NEXT_PUBLIC_API_TIMEOUT_ENDPOINT_LEADS_SUBMIT_OTP=10000
 * getEndpointTimeout('/leads/123/submit-otp') // 10000
 * getEndpointTimeout('/unknown/path') // undefined
 * ```
 */
export function getEndpointTimeout(endpoint: string): number | undefined {
  const normalizedPath = normalizeEndpointPath(endpoint);
  const envVar = `${ENV_PREFIXES.ENDPOINT}${normalizedPath}`;
  const envValue = process.env[envVar];

  if (envValue === undefined || envValue === "") {
    return undefined;
  }

  const parsed = parseInt(envValue, 10);

  if (isNaN(parsed)) {
    return undefined;
  }

  return parsed;
}

/**
 * Gets timeout for a specific service from environment
 *
 * Direct lookup for a specific service's timeout configuration.
 * This is useful for runtime timeout resolution.
 *
 * @param service - The service name to look up
 * @returns Timeout in milliseconds, or undefined if not configured
 *
 * @example
 * ```typescript
 * // With NEXT_PUBLIC_API_TIMEOUT_SERVICE_EKYC=60000
 * getServiceTimeout('EKYC') // 60000
 * getServiceTimeout('UNKNOWN') // undefined
 * ```
 */
export function getServiceTimeout(service: string): number | undefined {
  const envVar = `${ENV_PREFIXES.SERVICE}${service.toUpperCase()}`;
  const envValue = process.env[envVar];

  if (envValue === undefined || envValue === "") {
    return undefined;
  }

  const parsed = parseInt(envValue, 10);

  if (isNaN(parsed)) {
    return undefined;
  }

  return parsed;
}

/**
 * Gets global timeout from environment
 *
 * @returns Global timeout in milliseconds, or default if not configured
 */
export function getGlobalTimeout(): number {
  const envValue = process.env[ENV_PREFIXES.GLOBAL];

  if (envValue === undefined || envValue === "") {
    return DEFAULT_CONFIG.global;
  }

  const parsed = parseInt(envValue, 10);

  if (isNaN(parsed)) {
    return DEFAULT_CONFIG.global;
  }

  return parsed;
}

/**
 * Parses a single timeout value with validation
 *
 * Parses and validates a timeout value from a string.
 * Returns undefined if the value is invalid.
 *
 * @param value - The string value to parse
 * @param allowDefault - Whether to allow default fallback (default: true)
 * @returns Parsed timeout or undefined/default
 */
export function parseTimeoutValue(
  value: string | undefined,
  allowDefault = true,
): number | undefined {
  if (value === undefined || value === "") {
    return allowDefault ? DEFAULT_CONFIG.global : undefined;
  }

  const parsed = parseInt(value, 10);

  if (isNaN(parsed)) {
    return allowDefault ? DEFAULT_CONFIG.global : undefined;
  }

  return parsed;
}

/**
 * Gets all configured timeout environment variables
 *
 * Returns a list of all environment variables that are currently
 * set for timeout configuration.
 *
 * @returns Array of environment variable names
 *
 * @example
 * ```typescript
 * const configuredVars = getTimeoutEnvVars();
 * // Returns: [
 * //   'NEXT_PUBLIC_API_TIMEOUT_GLOBAL',
 * //   'NEXT_PUBLIC_API_TIMEOUT_SERVICE_EKYC',
 * //   'NEXT_PUBLIC_API_TIMEOUT_ENDPOINT_LEADS_SUBMIT_OTP'
 * // ]
 * ```
 */
export function getTimeoutEnvVars(): string[] {
  const vars: string[] = [];

  // Check global timeout
  if (process.env[ENV_PREFIXES.GLOBAL]) {
    vars.push(ENV_PREFIXES.GLOBAL);
  }

  // Check retry configuration
  if (process.env[ENV_PREFIXES.MAX_RETRIES]) {
    vars.push(ENV_PREFIXES.MAX_RETRIES);
  }

  if (process.env[ENV_PREFIXES.RETRY_DELAY]) {
    vars.push(ENV_PREFIXES.RETRY_DELAY);
  }

  // Check service timeouts
  for (const key of Object.keys(process.env)) {
    if (key.startsWith(ENV_PREFIXES.SERVICE) && key !== ENV_PREFIXES.SERVICE) {
      vars.push(key);
    }
  }

  // Check endpoint timeouts
  for (const key of Object.keys(process.env)) {
    if (
      key.startsWith(ENV_PREFIXES.ENDPOINT) &&
      key !== ENV_PREFIXES.ENDPOINT
    ) {
      vars.push(key);
    }
  }

  return vars.sort();
}

/**
 * Checks if any timeout configuration is present
 *
 * @returns True if at least one timeout environment variable is set
 */
export function hasTimeoutConfig(): boolean {
  return getTimeoutEnvVars().length > 0;
}
