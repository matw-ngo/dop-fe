/**
 * API Module - Main Export
 *
 * This file provides backward compatibility and easy imports for the API module.
 */

// Re-export everything from services
export * from "./services";

// Re-export existing client for backward compatibility
export { default as apiClient, withRetry } from "./client";
