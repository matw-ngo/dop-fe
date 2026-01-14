/**
 * Configurable API Timeout Endpoint Configuration
 *
 * This file contains default timeout configurations for services and endpoints.
 * These defaults are used when no environment variables are configured.
 *
 * @feature 002-configurable-api-timeout
 * @module endpoint-config
 */

import type { TimeoutConfig } from "./types";
import {
  DEFAULT_TIMEOUTS,
  SPECIAL_ENDPOINT_TIMEOUTS,
  SPECIAL_ENDPOINTS,
} from "./constants";

/**
 * Default service-specific timeout configurations
 *
 * These timeouts apply to all endpoints within a service unless overridden
 * by endpoint-specific configuration.
 */
export const SERVICE_DEFAULTS = {
  /** DOP (Digital Origin Platform) service - standard operations */
  DOP: 30000, // 30 seconds

  /** eKYC (Electronic KYC) service - includes document upload processing */
  EKYC: 60000, // 60 seconds (documents take longer)

  /** Consent management service */
  CONSENT: 20000, // 20 seconds

  /** Payment processing service */
  PAYMENT: 45000, // 45 seconds (payment gateway calls)

  /** Authentication service */
  AUTH: 15000, // 15 seconds (auth should be fast)

  /** Lead generation service */
  LEADS: 25000, // 25 seconds
} as const;

/**
 * Default endpoint-specific timeout configurations
 *
 * These timeouts override both global and service-level timeouts for
 * specific endpoints. Keys are normalized endpoint paths.
 */
export const ENDPOINT_DEFAULTS = {
  // Lead endpoints
  LEADS_SUBMIT_OTP: 15000, // 15 seconds - OTP submission should be quick
  LEADS_VERIFY_OTP: 15000, // 15 seconds - OTP verification should be quick
  LEADS_CREATE: 20000, // 20 seconds - lead creation

  // eKYC endpoints
  EKYC_CONFIG: 20000, // 20 seconds - config fetch
  EKYC_SUBMIT: 120000, // 2 minutes - document upload and processing
  EKYC_RESULT: 30000, // 30 seconds - result polling

  // Consent endpoints
  CONSENT_CREATE: 15000, // 15 seconds
  CONSENT_REVOKE: 15000, // 15 seconds

  // Payment endpoints
  PAYMENT_CREATE: 45000, // 45 seconds - payment gateway
  PAYMENT_STATUS: 20000, // 20 seconds - status check

  // Auth endpoints
  AUTH_LOGIN: 15000, // 15 seconds
  AUTH_REFRESH: 15000, // 15 seconds
  AUTH_LOGOUT: 10000, // 10 seconds

  // Streaming endpoints (longer timeouts)
  EKYC_STREAM: 600000, // 10 minutes - SSE/streaming
  REALTIME_UPDATES: 300000, // 5 minutes - WebSocket/streaming

  // Batch processing endpoints
  EXPORT_DATA: 300000, // 5 minutes - data export
  BATCH_PROCESS: 300000, // 5 minutes - batch operations
} as const;

/**
 * Gets default timeout configuration
 *
 * Returns a complete TimeoutConfig object with all service and
 * endpoint defaults populated.
 *
 * @returns Default timeout configuration
 *
 * @example
 * ```typescript
 * const config = getDefaultEndpointConfig();
 * // Returns: {
 * //   global: 30000,
 * //   services: { DOP: 30000, EKYC: 60000, ... },
 * //   endpoints: { LEADS_SUBMIT_OTP: 15000, ... },
 * //   maxRetries: 3,
 * //   retryDelay: 1000
 * // }
 * ```
 */
export function getDefaultEndpointConfig(): TimeoutConfig {
  return {
    global: DEFAULT_TIMEOUTS.GLOBAL,
    services: { ...SERVICE_DEFAULTS },
    endpoints: { ...ENDPOINT_DEFAULTS },
    maxRetries: 3,
    retryDelay: 1000,
  };
}

/**
 * Gets timeout for a specific service
 *
 * Returns the default timeout for a service, or undefined if not configured.
 *
 * @param service - Service name
 * @returns Timeout in milliseconds or undefined
 *
 * @example
 * ```typescript
 * getServiceTimeout('EKYC') // 60000
 * getServiceTimeout('UNKNOWN') // undefined
 * ```
 */
export function getServiceDefaultTimeout(service: string): number | undefined {
  return SERVICE_DEFAULTS[service as keyof typeof SERVICE_DEFAULTS];
}

/**
 * Gets timeout for a specific endpoint
 *
 * Returns the default timeout for an endpoint, or undefined if not configured.
 *
 * @param endpoint - Normalized endpoint path
 * @returns Timeout in milliseconds or undefined
 *
 * @example
 * ```typescript
 * getEndpointDefaultTimeout('LEADS_SUBMIT_OTP') // 15000
 * getEndpointDefaultTimeout('UNKNOWN') // undefined
 * ```
 */
export function getEndpointDefaultTimeout(
  endpoint: string,
): number | undefined {
  return ENDPOINT_DEFAULTS[endpoint as keyof typeof ENDPOINT_DEFAULTS];
}

/**
 * Checks if an endpoint is a special endpoint type
 *
 * Determines if an endpoint requires special timeout handling based on
 * its pattern (file upload, streaming, batch).
 *
 * @param endpoint - Normalized endpoint path
 * @returns Special endpoint type or undefined
 *
 * @example
 * ```typescript
 * getSpecialEndpointType('EKYC_SUBMIT') // 'FILE_UPLOAD'
 * getSpecialEndpointType('EKYC_STREAM') // 'STREAMING'
 * getSpecialEndpointType('EXPORT_DATA') // 'BATCH'
 * getSpecialEndpointType('LEADS') // undefined
 * ```
 */
export function getSpecialEndpointType(
  endpoint: string,
): "FILE_UPLOAD" | "STREAMING" | "BATCH" | undefined {
  if (
    SPECIAL_ENDPOINTS.FILE_UPLOAD.some((pattern) => endpoint.includes(pattern))
  ) {
    return "FILE_UPLOAD";
  }

  if (
    SPECIAL_ENDPOINTS.STREAMING.some((pattern) => endpoint.includes(pattern))
  ) {
    return "STREAMING";
  }

  if (SPECIAL_ENDPOINTS.BATCH.some((pattern) => endpoint.includes(pattern))) {
    return "BATCH";
  }

  return undefined;
}

/**
 * Gets timeout for a special endpoint type
 *
 * Returns the appropriate timeout for special endpoints that require
 * longer timeouts due to file upload, streaming, or batch processing.
 *
 * @param type - Special endpoint type
 * @returns Timeout in milliseconds
 *
 * @example
 * ```typescript
 * getSpecialEndpointTimeout('FILE_UPLOAD') // 120000 (2 minutes)
 * getSpecialEndpointTimeout('STREAMING') // 600000 (10 minutes)
 * getSpecialEndpointTimeout('BATCH') // 300000 (5 minutes)
 * ```
 */
export function getSpecialEndpointTimeout(
  type: "FILE_UPLOAD" | "STREAMING" | "BATCH",
): number {
  return SPECIAL_ENDPOINT_TIMEOUTS[type];
}

/**
 * Combines default config with runtime configuration
 *
 * Merges the default endpoint configuration with any runtime overrides
 * from environment variables or other sources.
 *
 * @param runtimeConfig - Runtime configuration to merge
 * @returns Combined timeout configuration
 *
 * @example
 * ```typescript
 * const combined = combineDefaultsWithRuntime({
 *   global: 60000,
 *   maxRetries: 5
 * });
 * // Returns default config with global and maxRetries overridden
 * ```
 */
export function combineDefaultsWithRuntime(
  runtimeConfig?: Partial<TimeoutConfig>,
): TimeoutConfig {
  const defaults = getDefaultEndpointConfig();

  if (!runtimeConfig) {
    return defaults;
  }

  return {
    global: runtimeConfig.global ?? defaults.global,
    services: {
      ...defaults.services,
      ...runtimeConfig.services,
    },
    endpoints: {
      ...defaults.endpoints,
      ...runtimeConfig.endpoints,
    },
    maxRetries: runtimeConfig.maxRetries ?? defaults.maxRetries,
    retryDelay: runtimeConfig.retryDelay ?? defaults.retryDelay,
  };
}

/**
 * Gets all configured service names
 *
 * @returns Array of service names with default timeouts
 */
export function getConfiguredServices(): string[] {
  return Object.keys(SERVICE_DEFAULTS);
}

/**
 * Gets all configured endpoint names
 *
 * @returns Array of normalized endpoint paths with default timeouts
 */
export function getConfiguredEndpoints(): string[] {
  return Object.keys(ENDPOINT_DEFAULTS);
}

/**
 * Checks if a service has a default timeout configured
 *
 * @param service - Service name
 * @returns True if service has default timeout
 */
export function hasServiceDefault(service: string): boolean {
  return service in SERVICE_DEFAULTS;
}

/**
 * Checks if an endpoint has a default timeout configured
 *
 * @param endpoint - Normalized endpoint path
 * @returns True if endpoint has default timeout
 */
export function hasEndpointDefault(endpoint: string): boolean {
  return endpoint in ENDPOINT_DEFAULTS;
}
