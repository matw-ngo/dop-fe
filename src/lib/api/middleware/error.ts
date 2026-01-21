import type { Middleware } from "openapi-fetch";
import { toast } from "sonner";

/**
 * Error handling middleware for openapi-fetch
 * Handles server errors, rate limiting, and security headers
 */
export const createErrorMiddleware = (): Middleware => {
  return {
    async onResponse(res) {
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

      return res.response;
    },
  };
};
