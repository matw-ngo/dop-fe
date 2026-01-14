import createClient from "openapi-fetch";
import { toast } from "sonner";
import { securityUtils, useTokenStore } from "@/lib/auth/secure-tokens";
import type { paths } from "./v1.d.ts";

// Timeout configuration imports
import { parseTimeoutConfig } from "./timeouts/config-parser";
import { resolveTimeout } from "./timeouts/resolver";
import { createTimeoutController } from "./timeouts/abort-timeout";
import { useTimeoutStore } from "./timeouts/timeout-store";
import { DEFAULT_RETRY } from "./timeouts/constants";

// API Configuration based on environment
const getApiConfig = () => {
  const nodeEnv = process.env.NODE_ENV || "development";
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
    const { signal: timeoutSignal } = createTimeoutController(
      resolution.timeout,
    );

    // Merge timeout signal with existing signal if present
    let finalSignal = timeoutSignal;

    if (req.request.signal) {
      // Create a combined abort controller
      const combinedController = new AbortController();

      // Handler for timeout abort
      const handleTimeoutAbort = () => {
        combinedController.abort();
        // Clean up the other listener
        if (req.request.signal) {
          req.request.signal.removeEventListener("abort", handleOriginalAbort);
        }
      };

      // Handler for original signal abort
      const handleOriginalAbort = () => {
        combinedController.abort();
        // Clean up the other listener
        timeoutSignal.removeEventListener("abort", handleTimeoutAbort);
      };

      // Listen to both signals
      timeoutSignal.addEventListener("abort", handleTimeoutAbort, {
        once: true,
      });
      req.request.signal.addEventListener("abort", handleOriginalAbort, {
        once: true,
      });

      finalSignal = combinedController.signal;
    }

    // Create a new Request with the combined signal
    // This is necessary because Request.signal is read-only
    const modifiedRequest = new Request(req.request, {
      signal: finalSignal,
    });

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
    // Check if request was aborted (which includes timeout aborts)
    if (res.request.signal.aborted) {
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

      // Show user-friendly error toast
      toast.error("Request timeout", {
        description: `The request took too long to complete. Please try again.`,
      });

      throw timeoutError;
    }
  },
});

// Retry utility for API calls with exponential backoff
// Uses correct defaults from DEFAULT_RETRY constants
export const withRetry = async <T>(
  apiCall: () => Promise<T>,
  maxRetries = DEFAULT_RETRY.MAX_RETRIES,
  delay = DEFAULT_RETRY.INITIAL_DELAY,
): Promise<T> => {
  let lastError: Error;

  for (let i = 0; i <= maxRetries; i++) {
    try {
      return await apiCall();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // Don't retry on certain errors
      if (
        lastError.name === "TimeoutError" ||
        lastError.message.includes("Authentication failed")
      ) {
        throw lastError;
      }

      if (i === maxRetries) {
        throw lastError;
      }

      // Show retry notification to user
      toast.info(`Retrying... (${i + 1}/${maxRetries})`, {
        description: `Attempting again in ${Math.ceil(delay / 1000)}s`,
      });

      // Exponential backoff with max delay cap
      const backoffDelay = Math.min(
        delay * Math.pow(DEFAULT_RETRY.BACKOFF_MULTIPLIER, i),
        DEFAULT_RETRY.MAX_DELAY,
      );
      const jitter = Math.random() * 200; // Add 0-200ms jitter
      await new Promise((resolve) =>
        setTimeout(resolve, backoffDelay + jitter),
      );
    }
  }

  throw lastError!;
};

export default apiClient;
