import type { Middleware } from "openapi-fetch";
import { toast } from "sonner";
import { securityUtils, useTokenStore } from "@/lib/auth/secure-tokens";
import { shouldSkipAuth } from "../config";

/**
 * Auth middleware for openapi-fetch
 * Handles token injection, CSRF protection, and token refresh
 */
export const createAuthMiddleware = (): Middleware => {
  return {
    async onRequest(req) {
      const { getAccessToken, isTokenExpired, refreshTokens } =
        useTokenStore.getState();
      let token = getAccessToken();

      // Check if token needs refresh
      if (token && isTokenExpired()) {
        const refreshed = await refreshTokens();
        token = getAccessToken();

        if (!refreshed || !token) {
          if (typeof window !== "undefined") {
            window.location.href = "/login";
          }
          throw new Error("Authentication failed");
        }
      }

      if (token) {
        req.request.headers.set("Authorization", `Bearer ${token}`);

        // Add CSRF protection for state-changing requests
        if (["POST", "PUT", "DELETE", "PATCH"].includes(req.request.method)) {
          const csrfToken = securityUtils.generateCSRFToken();
          req.request.headers.set("X-CSRF-Token", csrfToken);
        }
      }

      return req.request;
    },
  };
};

/**
 * Response middleware for auth handling
 */
export const createAuthResponseMiddleware = (): Middleware => {
  return {
    async onResponse(res) {
      const skipAuth = shouldSkipAuth(res.request.url);

      // Auth token refresh for non-skip endpoints
      if (
        res.response.status === 401 &&
        !skipAuth &&
        !res.request.url.includes("/refresh")
      ) {
        const { refreshTokens, clearTokens } = useTokenStore.getState();

        try {
          const refreshed = await refreshTokens();
          if (!refreshed) {
            throw new Error("Token refresh failed");
          }
        } catch (error) {
          console.error("Token refresh failed, logging out.", error);
          clearTokens();

          if (typeof window !== "undefined") {
            window.location.href = "/login";
          }
          throw new Error("Authentication failed");
        }
      }

      // For skip-auth endpoints, log warning but don't redirect
      if (res.response.status === 401 && skipAuth) {
        console.warn(
          `Endpoint ${res.request.url} returned 401. This may indicate an expired or invalid token.`,
        );
      }

      return res.response;
    },
  };
};
