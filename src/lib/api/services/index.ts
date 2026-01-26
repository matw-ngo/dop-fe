/**
 * API Services Registry
 *
 * Centralized exports for all service clients.
 * Each service has its own typed client with proper base URL configuration.
 */

import { consentClient } from "./consent";
import { dopClient } from "./dop";

export { dopClient } from "./dop";
export type { DopPaths } from "./dop";

export { consentClient } from "./consent";
export type { ConsentPaths } from "./consent";

/**
 * Service registry for dynamic service access
 */
export const apiServices = {
  dop: dopClient,
  consent: consentClient,
} as const;

export type ServiceName = keyof typeof apiServices;

/**
 * Get a service client by name
 * Useful for generic API service selection
 */
export const getService = (name: ServiceName) => {
  return apiServices[name];
};
