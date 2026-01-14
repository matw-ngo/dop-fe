/**
 * Configurable API Timeout Store
 *
 * This file contains the Zustand store for managing timeout configuration
 * and tracking active requests with their timeout contexts.
 *
 * @feature 002-configurable-api-timeout
 * @module timeout-store
 */

import { create } from "zustand";
import type { TimeoutConfig, TimeoutContext } from "./types";
import { DEFAULT_CONFIG } from "./constants";

/**
 * Timeout store interface
 *
 * Manages timeout configuration and active request tracking.
 */
export interface TimeoutStore {
  /**
   * Current timeout configuration
   */
  config: TimeoutConfig;

  /**
   * Active timeout contexts keyed by request ID
   */
  activeRequests: Map<string, TimeoutContext>;

  /**
   * Update timeout configuration
   *
   * @param config - New configuration to set
   */
  setConfig: (config: TimeoutConfig) => void;

  /**
   * Add an active request context
   *
   * @param context - Request context to track
   */
  addRequest: (context: TimeoutContext) => void;

  /**
   * Remove an active request context
   *
   * @param requestId - Request ID to remove
   */
  removeRequest: (requestId: string) => void;

  /**
   * Get a specific request context
   *
   * @param requestId - Request ID to retrieve
   * @returns Request context or undefined
   */
  getRequest: (requestId: string) => TimeoutContext | undefined;

  /**
   * Cancel a specific request
   *
   * @param requestId - Request ID to cancel
   * @param reason - Reason for cancellation
   */
  cancelRequest: (
    requestId: string,
    reason: "USER_CANCEL" | "API_TIMEOUT",
  ) => void;

  /**
   * Cancel all active requests
   */
  cancelAllRequests: () => void;

  /**
   * Get count of active requests
   *
   * @returns Number of active requests
   */
  getActiveRequestCount: () => number;

  /**
   * Check if a request is active
   *
   * @param requestId - Request ID to check
   * @returns True if request is active
   */
  isRequestActive: (requestId: string) => boolean;
}

/**
 * Create the timeout store
 *
 * Initializes the Zustand store with default configuration
 * and action handlers for managing timeout state.
 */
export const useTimeoutStore = create<TimeoutStore>((set, get) => ({
  // Initial state
  config: DEFAULT_CONFIG,
  activeRequests: new Map<string, TimeoutContext>(),

  // Actions
  setConfig: (config) => {
    set({ config });
  },

  addRequest: (context) => {
    set((state) => {
      const newMap = new Map(state.activeRequests);
      newMap.set(context.id, context);
      return { activeRequests: newMap };
    });
  },

  removeRequest: (requestId) => {
    set((state) => {
      const newMap = new Map(state.activeRequests);
      newMap.delete(requestId);
      return { activeRequests: newMap };
    });
  },

  getRequest: (requestId) => {
    return get().activeRequests.get(requestId);
  },

  cancelRequest: (requestId, reason) => {
    const state = get();
    const context = state.activeRequests.get(requestId);

    if (context) {
      // Abort the request
      context.controller.abort();

      // Update context if it's a user cancellation
      if (reason === "USER_CANCEL") {
        context.userCancelled = true;
      }

      // Remove from active requests
      set((state) => {
        const newMap = new Map(state.activeRequests);
        newMap.delete(requestId);
        return { activeRequests: newMap };
      });
    }
  },

  cancelAllRequests: () => {
    const state = get();

    // Abort all active requests
    state.activeRequests.forEach((context) => {
      context.controller.abort();
    });

    // Clear the map
    set({ activeRequests: new Map() });
  },

  getActiveRequestCount: () => {
    return get().activeRequests.size;
  },

  isRequestActive: (requestId) => {
    return get().activeRequests.has(requestId);
  },
}));

/**
 * Hook to get current timeout configuration
 *
 * @returns Current timeout configuration
 */
export function useTimeoutConfig() {
  return useTimeoutStore((state) => state.config);
}

/**
 * Hook to get active requests count
 *
 * @returns Number of active requests
 */
export function useActiveRequestCount() {
  return useTimeoutStore((state) => state.getActiveRequestCount());
}

/**
 * Hook to check if a specific request is active
 *
 * @param requestId - Request ID to check
 * @returns True if request is active
 */
export function useIsRequestActive(requestId: string) {
  return useTimeoutStore((state) => state.isRequestActive(requestId));
}

/**
 * Action to update configuration with partial values
 *
 * Allows updating specific configuration values without replacing
 * the entire configuration object.
 *
 * @param partialConfig - Partial configuration to merge
 */
export function updateTimeoutConfig(partialConfig: Partial<TimeoutConfig>) {
  const currentConfig = useTimeoutStore.getState().config;

  useTimeoutStore.getState().setConfig({
    ...currentConfig,
    ...partialConfig,
  });
}

/**
 * Action to reset configuration to defaults
 */
export function resetTimeoutConfig() {
  useTimeoutStore.getState().setConfig(DEFAULT_CONFIG);
}

/**
 * Get all active request IDs
 *
 * @returns Array of active request IDs
 */
export function getActiveRequestIds(): string[] {
  return Array.from(useTimeoutStore.getState().activeRequests.keys());
}

/**
 * Get timeout for a specific endpoint
 *
 * Resolves timeout using cascade: endpoint -> service -> global
 *
 * @param endpoint - The endpoint path
 * @param service - The service name (optional, will be extracted if not provided)
 * @returns Resolved timeout in milliseconds
 */
export function getEndpointTimeout(endpoint: string, service?: string): number {
  const config = useTimeoutStore.getState().config;
  const { normalizeEndpointPath, extractServiceName } = require("./utils");

  // Normalize endpoint path for lookup
  const normalizedEndpoint = normalizeEndpointPath(endpoint);

  // Check endpoint-specific timeout
  if (config.endpoints && config.endpoints[normalizedEndpoint]) {
    return config.endpoints[normalizedEndpoint];
  }

  // Extract service name if not provided
  const serviceName = service || extractServiceName(endpoint);

  // Check service-specific timeout
  if (config.services && config.services[serviceName]) {
    return config.services[serviceName];
  }

  // Return global timeout
  return config.global;
}
