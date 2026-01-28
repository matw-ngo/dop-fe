import createClient from "openapi-fetch";
import {
  createAuthMiddleware,
  createAuthResponseMiddleware,
} from "../middleware/auth";
import { createErrorMiddleware } from "../middleware/error";
import {
  createTimeoutMiddleware,
  createTimeoutResponseMiddleware,
} from "../middleware/timeout";
import type { paths as DopPaths } from "../v1/dop";

/**
 * Get base URL for DOP service based on environment
 */
const getBaseUrl = (): string => {
  const environment =
    process.env.NEXT_PUBLIC_API_ENVIRONMENT ||
    process.env.NODE_ENV ||
    "development";

  const customUrl = process.env.NEXT_PUBLIC_API_URL;

  switch (environment) {
    case "production":
      return customUrl || "https://dop.datanest.vn/";
    case "staging":
      return customUrl || "https://dop-stg.datanest.vn/";
    default:
      return customUrl || "http://localhost:3001/api";
  }
};

/**
 * DOP API Client
 * Handles all DOP service endpoints with proper base URL configuration
 */
export const dopClient = createClient<DopPaths>({
  // baseUrl: `${getBaseUrl()}v1`,
  baseUrl: `${getBaseUrl()}`,
});

// Apply middleware stack
dopClient.use(createAuthMiddleware());
dopClient.use(createAuthResponseMiddleware());
dopClient.use(createTimeoutMiddleware());
dopClient.use(createTimeoutResponseMiddleware());
dopClient.use(createErrorMiddleware());

export type { DopPaths };
