import createClient from "openapi-fetch";
import type { paths as ConsentPaths } from "../v1/consent";
import {
  createAuthMiddleware,
  createAuthResponseMiddleware,
} from "../middleware/auth";
import {
  createTimeoutMiddleware,
  createTimeoutResponseMiddleware,
} from "../middleware/timeout";
import { createErrorMiddleware } from "../middleware/error";

/**
 * Get base URL for Consent service based on environment
 * Note: Consent service uses the same host but different base path prefix
 */
const getBaseUrl = (): string => {
  const environment =
    process.env.NEXT_PUBLIC_API_ENVIRONMENT ||
    process.env.NODE_ENV ||
    "development";

  const customUrl = process.env.NEXT_PUBLIC_API_URL;

  // Same host pattern as DOP but with /consent prefix
  switch (environment) {
    case "production":
      return customUrl || "https://consent.datanest.vn/";
    case "staging":
      // For staging, consent service is at dop-stg.datanest.vn/consent/
      return customUrl || "https://dop-stg.datanest.vn/";
    case "development":
    default:
      return customUrl || "http://localhost:3001/api";
  }
};

/**
 * Consent API Client
 * Handles all Consent service endpoints with proper base URL configuration
 */
export const consentClient = createClient<ConsentPaths>({
  baseUrl: `${getBaseUrl()}consent/`,
});

// Apply middleware stack
consentClient.use(createAuthMiddleware());
consentClient.use(createAuthResponseMiddleware());
consentClient.use(createTimeoutMiddleware());
consentClient.use(createTimeoutResponseMiddleware());
consentClient.use(createErrorMiddleware());

export type { ConsentPaths };
