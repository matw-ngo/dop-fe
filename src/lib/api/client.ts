import createClient from "openapi-fetch";
import { toast } from "sonner";
import { securityUtils, useTokenStore } from "@/lib/auth/secure-tokens";
import type { paths } from "./v1.d.ts";

// Timeout configuration imports
import { parseTimeoutConfig } from "./timeouts/config-parser";
import { resolveTimeout } from "./timeouts/resolver";
import { createTimeoutController } from "./timeouts/abort-timeout";
import { useTimeoutStore } from "./timeouts/timeout-store";

// API Configuration based on environment
const getApiConfig = () => {
  const nodeEnv = process.env.NODE_ENV || "development";

  // Note: Removed mock API dependencies for FE-only deployment

  const environment = process.env.NEXT_PUBLIC_API_ENVIRONMENT || nodeEnv;

  switch (environment) {
    case "production":
      return {
        baseUrl: "https://api.dop-fe.com/",
        mockMode: false,
      };
    case "staging":
      return {
        baseUrl:
          process.env.NEXT_PUBLIC_API_URL || "https://dop-stg.datanest.vn/",
        mockMode: false,
      };
    case "development":
    default:
      return {
        baseUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api",
        mockMode: false,
      };
  }
};

const apiConfig = getApiConfig();

// Initialize timeout configuration
const timeoutConfig = parseTimeoutConfig();
useTimeoutStore.getState().setConfig(timeoutConfig);

const apiClient = createClient<paths>({
  baseUrl: apiConfig.baseUrl,
  // Add headers for API versioning
  headers: {
    // "X-API-Version": "1.0",
    // "X-Client-Version": "1.0.0",
  },
});

// Add advanced interceptors for Auth, Token Refresh, Timeout, and Global Error Handling
apiClient.use({
  // Runs on every request
  async onRequest(req) {
    // Add secure authentication headers
    const { getAccessToken, isTokenExpired, refreshTokens } =
      useTokenStore.getState();
    let token = getAccessToken();

    // Check if token needs refresh
    if (token && isTokenExpired()) {
      const refreshed = await refreshTokens();
      token = getAccessToken();

      if (!refreshed || !token) {
        // Redirect to login if refresh fails
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

    // Add timeout support
    const url = new URL(req.request.url, window.location.origin);
    const endpoint = url.pathname;
    const config = useTimeoutStore.getState().config;

    // Resolve timeout for this endpoint
    const resolution = resolveTimeout(endpoint, config);

    // Create timeout controller
    const { signal, controller } = createTimeoutController(resolution.timeout);

    // Merge the timeout signal with existing signal if present
    let finalSignal = signal;

    if (req.request.signal) {
      // Create an abort controller that responds to either signal
      const combinedController = new AbortController();

      // Abort if either signal aborts
      const onTimeoutAbort = () => combinedController.abort();
      const onOriginalAbort = () => combinedController.abort();

      signal.addEventListener("abort", onTimeoutAbort, { once: true });
      req.request.signal.addEventListener("abort", onOriginalAbort, {
        once: true,
      });

      finalSignal = combinedController.signal;
    }

    // Create a new Request with the signal (openapi-fetch middleware returns Request)
    const modifiedRequest = new Request(req.request, { signal: finalSignal });

    return modifiedRequest;

    // Add request metadata
    // req.request.headers.set("X-Request-ID", crypto.randomUUID());
    // req.request.headers.set("X-Client-Timestamp", new Date().toISOString());
  },

  // Runs on every response
  async onResponse(res) {
    // --- Token Refresh Logic ---
    if (res.response.status === 401 && !res.request.url.includes("/refresh")) {
      const { refreshTokens, clearTokens } = useTokenStore.getState();

      try {
        const refreshed = await refreshTokens();
        if (!refreshed) {
          throw new Error("Token refresh failed");
        }

        // Note: In a real implementation, you would retry the original request
        // This requires more complex request cloning logic
      } catch (error) {
        console.error("Token refresh failed, logging out.", error);
        clearTokens();

        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
        throw new Error("Authentication failed");
      }
    }

    // --- Security Headers Validation ---
    const securityHeaders = [
      "x-content-type-options",
      "x-frame-options",
      "x-xss-protection",
      "strict-transport-security",
    ];

    const missingHeaders = securityHeaders.filter(
      (header) => !res.response.headers.get(header),
    );

    if (missingHeaders.length > 0 && process.env.NODE_ENV === "development") {
      console.warn("Missing security headers:", missingHeaders);
    }

    // --- Global Error Handling & Logging ---
    if (res.response.status >= 500) {
      const errorData = {
        status: res.response.status,
        url: res.request.url,
        timestamp: new Date().toISOString(),
        userAgent:
          typeof navigator !== "undefined" ? navigator.userAgent : "server",
      };

      // Log to monitoring service in production
      if (process.env.NODE_ENV === "production") {
        console.error("Server error:", errorData);
        // logErrorToMonitoringService(errorData);
      }

      toast.error("A server error occurred", {
        description: "Please try again later or contact support.",
      });
    }

    // --- Rate Limiting Detection ---
    if (res.response.status === 429) {
      const retryAfter = res.response.headers.get("Retry-After");
      const waitTime = retryAfter ? parseInt(retryAfter) * 1000 : 60000;

      toast.error("Rate limit exceeded", {
        description: `Please wait ${Math.ceil(waitTime / 1000)} seconds before trying again.`,
      });

      throw new Error(`Rate limited. Retry after ${waitTime}ms`);
    }

    // --- Timeout Error Detection ---
    // Check if response was aborted due to timeout
    if (res.request.signal?.aborted) {
      const url = new URL(res.request.url, window.location.origin);
      const endpoint = url.pathname;
      const config = useTimeoutStore.getState().config;
      const resolution = resolveTimeout(endpoint, config);

      const timeoutError = new Error(
        `Request to ${endpoint} timed out after ${resolution.timeout}ms`,
      ) as Error & {
        name: string;
        code: string;
        endpoint: string;
        timeout: number;
      };

      timeoutError.name = "TimeoutError";
      timeoutError.code = "TIMEOUT";
      timeoutError.endpoint = endpoint;
      timeoutError.timeout = resolution.timeout;

      throw timeoutError;
    }
  },
});

// Retry utility for API calls
export const withRetry = async <T>(
  apiCall: () => Promise<T>,
  maxRetries = 3,
  delay = 1000,
): Promise<T> => {
  let lastError: Error;

  for (let i = 0; i <= maxRetries; i++) {
    try {
      return await apiCall();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (i === maxRetries) {
        throw lastError;
      }

      // Exponential backoff
      const backoffDelay = delay * 2 ** i;
      await new Promise((resolve) => setTimeout(resolve, backoffDelay));
    }
  }

  throw lastError!;
};

export default apiClient;
