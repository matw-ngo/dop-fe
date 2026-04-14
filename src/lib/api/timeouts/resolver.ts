/**
 * Configurable API Timeout Resolver
 *
 * This file contains the timeout resolution engine that implements
 * the cascade logic for determining which timeout to apply:
 * endpoint → service → global → default
 *
 * @feature 002-configurable-api-timeout
 * @module resolver
 */

import { DEFAULT_TIMEOUTS, TIMEOUT_SOURCE } from "./constants";
import type { TimeoutConfig, TimeoutResolution } from "./types";
import { extractServiceName, normalizeEndpointPath } from "./utils";

/**
 * Resolves timeout for a specific endpoint using cascade logic
 *
 * The resolution cascade works in this order:
 * 1. Check endpoint-specific timeout
 * 2. Check service-specific timeout
 * 3. Check global timeout
 * 4. Apply hardcoded default (30000ms)
 *
 * @param endpoint - The endpoint path
 * @param config - The timeout configuration
 * @returns Timeout resolution with source information
 *
 * @example
 * ```typescript
 * const config = {
 *   global: 30000,
 *   services: { EKYC: 60000 },
 *   endpoints: { LEADS_SUBMIT_OTP: 10000 },
 *   maxRetries: 3,
 *   retryDelay: 1000
 * };
 *
 * const resolution = resolveTimeout('/leads/123/submit-otp', config);
 * // Returns: { timeout: 10000, source: 'endpoint', endpointKey: 'LEADS_SUBMIT_OTP', explicit: true }
 *
 * const resolution2 = resolveTimeout('/ekyc/config', config);
 * // Returns: { timeout: 60000, source: 'service', serviceKey: 'EKYC', explicit: true }
 *
 * const resolution3 = resolveTimeout('/unknown/path', config);
 * // Returns: { timeout: 30000, source: 'global', explicit: true }
 * ```
 */
export function resolveTimeout(
  endpoint: string,
  config: TimeoutConfig,
): TimeoutResolution {
  // Normalize endpoint path for lookup
  const normalizedEndpoint = normalizeEndpointPath(endpoint);

  // 1. Check endpoint-specific timeout
  if (config.endpoints?.[normalizedEndpoint]) {
    return {
      timeout: config.endpoints[normalizedEndpoint],
      source: TIMEOUT_SOURCE.ENDPOINT,
      endpointKey: normalizedEndpoint,
      explicit: true,
    };
  }

  // 2. Check service-specific timeout
  const serviceName = extractServiceName(endpoint);
  if (config.services?.[serviceName]) {
    return {
      timeout: config.services[serviceName],
      source: TIMEOUT_SOURCE.SERVICE,
      serviceKey: serviceName,
      explicit: true,
    };
  }

  // 3. Check global timeout
  if (config.global) {
    return {
      timeout: config.global,
      source: TIMEOUT_SOURCE.GLOBAL,
      explicit: true,
    };
  }

  // 4. Apply hardcoded default
  return {
    timeout: DEFAULT_TIMEOUTS.GLOBAL,
    source: TIMEOUT_SOURCE.DEFAULT,
    explicit: false,
  };
}

/**
 * Resolves timeout with override support
 *
 * Allows specifying an explicit timeout override that takes
 * precedence over all configuration-based timeouts.
 *
 * @param endpoint - The endpoint path
 * @param config - The timeout configuration
 * @param override - Optional timeout override in milliseconds
 * @returns Timeout resolution with source information
 *
 * @example
 * ```typescript
 * const resolution = resolveTimeoutWithOverride(
 *   '/leads/123/submit-otp',
 *   config,
 *   5000 // Override with 5 seconds
 * );
 * // Returns: { timeout: 5000, source: 'endpoint', explicit: true }
 * ```
 */
export function resolveTimeoutWithOverride(
  endpoint: string,
  config: TimeoutConfig,
  override?: number,
): TimeoutResolution {
  // If override is provided, use it
  if (override !== undefined && override > 0) {
    const normalizedEndpoint = normalizeEndpointPath(endpoint);

    return {
      timeout: override,
      source: TIMEOUT_SOURCE.ENDPOINT,
      endpointKey: normalizedEndpoint,
      explicit: true,
    };
  }

  // Otherwise, use standard resolution
  return resolveTimeout(endpoint, config);
}

/**
 * Gets the timeout source priority for debugging
 *
 * Returns a number representing the priority level of the timeout source.
 * Higher numbers mean higher priority (endpoint > service > global > default).
 *
 * @param source - The timeout source
 * @returns Priority number (4 = endpoint, 3 = service, 2 = global, 1 = default)
 *
 * @example
 * ```typescript
 * getSourcePriority('endpoint') // 4
 * getSourcePriority('service') // 3
 * getSourcePriority('global') // 2
 * getSourcePriority('default') // 1
 * ```
 */
export function getSourcePriority(
  source: "endpoint" | "service" | "global" | "default",
): number {
  const priorities: Record<typeof source, number> = {
    endpoint: 4,
    service: 3,
    global: 2,
    default: 1,
  };

  return priorities[source];
}

/**
 * Compares two timeout resolutions to determine which takes precedence
 *
 * @param resolution1 - First resolution
 * @param resolution2 - Second resolution
 * @returns 1 if first has priority, -1 if second has priority, 0 if equal
 *
 * @example
 * ```typescript
 * const r1 = resolveTimeout('/leads/123', config1);
 * const r2 = resolveTimeout('/leads/123', config2);
 * const priority = compareResolutions(r1, r2);
 * ```
 */
export function compareResolutions(
  resolution1: TimeoutResolution,
  resolution2: TimeoutResolution,
): number {
  const priority1 = getSourcePriority(resolution1.source);
  const priority2 = getSourcePriority(resolution2.source);

  if (priority1 > priority2) {
    return 1;
  }

  if (priority2 > priority1) {
    return -1;
  }

  // Same priority, compare explicit flag
  if (resolution1.explicit && !resolution2.explicit) {
    return 1;
  }

  if (resolution2.explicit && !resolution1.explicit) {
    return -1;
  }

  return 0;
}

/**
 * Gets a human-readable description of the timeout resolution
 *
 * @param resolution - The timeout resolution
 * @returns Human-readable description
 *
 * @example
 * ```typescript
 * const resolution = resolveTimeout('/leads/123/submit-otp', config);
 * const description = describeResolution(resolution);
 * // Returns: "Using endpoint-specific timeout of 10s for LEADS_SUBMIT_OTP"
 * ```
 */
export function describeResolution(resolution: TimeoutResolution): string {
  const { timeout, source } = resolution;
  const timeoutSeconds = Math.round(timeout / 1000);

  switch (source) {
    case TIMEOUT_SOURCE.ENDPOINT:
      return `Using endpoint-specific timeout of ${timeoutSeconds}s for ${resolution.endpointKey}`;

    case TIMEOUT_SOURCE.SERVICE:
      return `Using service-specific timeout of ${timeoutSeconds}s for ${resolution.serviceKey}`;

    case TIMEOUT_SOURCE.GLOBAL:
      return `Using global timeout of ${timeoutSeconds}s`;

    case TIMEOUT_SOURCE.DEFAULT:
      return `Using default timeout of ${timeoutSeconds}s`;

    default:
      return `Using timeout of ${timeoutSeconds}s`;
  }
}

/**
 * Checks if a resolution is using an explicitly configured timeout
 *
 * @param resolution - The timeout resolution
 * @returns True if the timeout was explicitly configured
 */
export function isExplicitResolution(resolution: TimeoutResolution): boolean {
  return resolution.explicit;
}

/**
 * Gets the configuration key used for the resolution
 *
 * Returns the environment variable name or configuration key
 * that provided the resolved timeout.
 *
 * @param resolution - The timeout resolution
 * @returns Configuration key or undefined
 *
 * @example
 * ```typescript
 * const resolution = resolveTimeout('/leads/123/submit-otp', config);
 * const key = getResolutionKey(resolution);
 * // Returns: 'NEXT_PUBLIC_API_TIMEOUT_ENDPOINT_LEADS_SUBMIT_OTP'
 * ```
 */
export function getResolutionKey(
  resolution: TimeoutResolution,
): string | undefined {
  const { source, endpointKey, serviceKey } = resolution;

  switch (source) {
    case TIMEOUT_SOURCE.ENDPOINT:
      return `NEXT_PUBLIC_API_TIMEOUT_ENDPOINT_${endpointKey}`;

    case TIMEOUT_SOURCE.SERVICE:
      return `NEXT_PUBLIC_API_TIMEOUT_SERVICE_${serviceKey}`;

    case TIMEOUT_SOURCE.GLOBAL:
      return "NEXT_PUBLIC_API_TIMEOUT_GLOBAL";

    case TIMEOUT_SOURCE.DEFAULT:
      return undefined;

    default:
      return undefined;
  }
}

/**
 * Resolves timeout for multiple endpoints efficiently
 *
 * Batch version of resolveTimeout for processing multiple endpoints.
 *
 * @param endpoints - Array of endpoint paths
 * @param config - The timeout configuration
 * @returns Map of endpoint path to timeout resolution
 *
 * @example
 * ```typescript
 * const endpoints = ['/leads/123', '/ekyc/config', '/unknown/path'];
 * const resolutions = resolveTimeoutsBatch(endpoints, config);
 * // Returns: Map {
 * //   '/leads/123' => { timeout: 30000, source: 'global', ... },
 * //   '/ekyc/config' => { timeout: 60000, source: 'service', ... },
 * //   '/unknown/path' => { timeout: 30000, source: 'global', ... }
 * // }
 * ```
 */
export function resolveTimeoutsBatch(
  endpoints: string[],
  config: TimeoutConfig,
): Map<string, TimeoutResolution> {
  const map = new Map<string, TimeoutResolution>();

  for (const endpoint of endpoints) {
    map.set(endpoint, resolveTimeout(endpoint, config));
  }

  return map;
}

/**
 * Creates a timeout resolution from a specific value
 *
 * Factory function for creating a resolution object when you
 * already know the timeout value and source.
 *
 * @param timeout - The timeout value in milliseconds
 * @param source - The timeout source
 * @param endpointKey - Optional endpoint key
 * @param serviceKey - Optional service key
 * @returns A timeout resolution object
 */
export function createResolution(
  timeout: number,
  source: "endpoint" | "service" | "global" | "default",
  endpointKey?: string,
  serviceKey?: string,
): TimeoutResolution {
  return {
    timeout,
    source,
    endpointKey,
    serviceKey,
    explicit: source !== TIMEOUT_SOURCE.DEFAULT,
  };
}
