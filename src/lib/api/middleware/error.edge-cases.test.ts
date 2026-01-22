/**
 * Error Response Edge Cases Tests
 *
 * Comprehensive tests for error handling edge cases:
 * - 500/501/502/503/504 server errors
 * - 429 rate limiting with/without Retry-After
 * - Security header validation (missing in dev)
 * - Network errors and malformed responses
 * - Concurrent error handling
 * - Toast notification edge cases
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Setup mocks at module level
vi.mock("sonner", () => ({
  toast: {
    error: vi.fn(),
    info: vi.fn(),
    success: vi.fn(),
    warning: vi.fn(),
  },
}));

// Import after mocking
const { createErrorMiddleware } = await import("@/lib/api/middleware/error");

describe("Error Response Edge Cases", () => {
  describe("Server Error Handling (5xx)", () => {
    beforeEach(() => {
      vi.clearAllMocks();
      vi.stubEnv("NODE_ENV", "development");
    });

    afterEach(() => {
      vi.unstubAllEnvs();
    });

    it("should handle 500 Internal Server Error", async () => {
      const { toast } = await import("sonner");

      const middleware = createErrorMiddleware();

      const mockResponse = new Response(
        JSON.stringify({ error: "Internal error" }),
        {
          status: 500,
        },
      );

      const mockRequest = {
        request: new Request("https://api.example.com/v1/resource"),
        url: "https://api.example.com/v1/resource",
        response: mockResponse,
      } as any;

      const result = await middleware.onResponse?.(mockRequest);

      expect(toast.error).toHaveBeenCalledWith(
        "A server error occurred",
        expect.objectContaining({
          description: expect.stringContaining("contact support"),
        }),
      );

      expect(result).toBe(mockResponse);
    });

    it("should handle 501 Not Implemented", async () => {
      const { toast } = await import("sonner");

      const middleware = createErrorMiddleware();

      const mockResponse = new Response(
        JSON.stringify({ error: "Not implemented" }),
        {
          status: 501,
        },
      );

      const mockRequest = {
        request: new Request("https://api.example.com/v1/resource"),
        url: "https://api.example.com/v1/resource",
        response: mockResponse,
      } as any;

      const result = await middleware.onResponse?.(mockRequest);

      expect(toast.error).toHaveBeenCalledWith(
        "A server error occurred",
        expect.any(Object),
      );
    });

    it("should handle 501 Not Implemented", async () => {
      const { toast } = await import("sonner");

      const middleware = createErrorMiddleware();

      const mockResponse = new Response(
        JSON.stringify({ error: "Not implemented" }),
        {
          status: 501,
        },
      );

      const mockRequest = {
        request: new Request("https://api.example.com/v1/resource"),
        url: "https://api.example.com/v1/resource",
        response: mockResponse,
      } as any;

      await middleware.onResponse?.(mockRequest);

      expect(toast.error).toHaveBeenCalledWith(
        "A server error occurred",
        expect.any(Object),
      );
    });

    it("should handle 502 Bad Gateway", async () => {
      const { toast } = await import("sonner");

      const middleware = createErrorMiddleware();

      const mockResponse = new Response(null, {
        status: 502,
      });

      const mockRequest = {
        request: new Request("https://api.example.com/v1/resource"),
        url: "https://api.example.com/v1/resource",
        response: mockResponse,
      } as any;

      await middleware.onResponse?.(mockRequest);

      expect(toast.error).toHaveBeenCalled();
    });

    it("should handle 503 Service Unavailable", async () => {
      const { toast } = await import("sonner");

      const middleware = createErrorMiddleware();

      const mockResponse = new Response(
        JSON.stringify({ error: "Service down" }),
        {
          status: 503,
        },
      );

      const mockRequest = {
        request: new Request("https://api.example.com/v1/resource"),
        url: "https://api.example.com/v1/resource",
        response: mockResponse,
      } as any;

      await middleware.onResponse?.(mockRequest);

      expect(toast.error).toHaveBeenCalledWith(
        "A server error occurred",
        expect.any(Object),
      );
    });

    it("should handle 504 Gateway Timeout", async () => {
      const { toast } = await import("sonner");

      const middleware = createErrorMiddleware();

      const mockResponse = new Response(
        JSON.stringify({ error: "Gateway timeout" }),
        {
          status: 504,
        },
      );

      const mockRequest = {
        request: new Request("https://api.example.com/v1/resource"),
        url: "https://api.example.com/v1/resource",
        response: mockResponse,
      } as any;

      await middleware.onResponse?.(mockRequest);

      expect(toast.error).toHaveBeenCalled();
    });

    it("should log 5xx errors in production", async () => {
      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      vi.stubEnv("NODE_ENV", "production");

      const middleware = createErrorMiddleware();

      const mockResponse = new Response(
        JSON.stringify({ error: "Server error" }),
        {
          status: 500,
        },
      );

      const mockRequest = {
        request: new Request("https://api.example.com/v1/resource"),
        url: "https://api.example.com/v1/resource",
        response: mockResponse,
      } as any;

      await middleware.onResponse?.(mockRequest);

      expect(consoleSpy).toHaveBeenCalledWith(
        "Server error",
        expect.objectContaining({
          status: 500,
          url: expect.any(String),
          timestamp: expect.any(String),
        }),
      );

      consoleSpy.mockRestore();
      vi.unstubAllEnvs();
    });
  });

  describe("Rate Limiting (429)", () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it("should handle 429 with Retry-After header", async () => {
      const { toast } = await import("sonner");

      const middleware = createErrorMiddleware();

      const mockResponse = new Response(
        JSON.stringify({ error: "Too many requests" }),
        {
          status: 429,
          headers: {
            "Retry-After": "30",
          },
        },
      );

      const mockRequest = {
        request: new Request("https://api.example.com/v1/resource"),
        url: "https://api.example.com/v1/resource",
        response: mockResponse,
      } as any;

      await expect(middleware.onResponse?.(mockRequest)).rejects.toThrow(
        "Rate limited. Retry after 30000ms",
      );

      expect(toast.error).toHaveBeenCalledWith(
        "Rate limit exceeded",
        expect.objectContaining({
          description: expect.stringContaining("30 seconds"),
        }),
      );
    });

    it("should handle 429 without Retry-After header", async () => {
      const { toast } = await import("sonner");

      const middleware = createErrorMiddleware();

      const mockResponse = new Response(
        JSON.stringify({ error: "Too many requests" }),
        {
          status: 429,
        },
      );

      const mockRequest = {
        request: new Request("https://api.example.com/v1/resource"),
        url: "https://api.example.com/v1/resource",
        response: mockResponse,
      } as any;

      await expect(middleware.onResponse?.(mockRequest)).rejects.toThrow(
        "Rate limited. Retry after 60000ms",
      );

      expect(toast.error).toHaveBeenCalledWith(
        "Rate limit exceeded",
        expect.objectContaining({
          description: expect.stringContaining("60 seconds"),
        }),
      );
    });

    it("should handle 429 with invalid Retry-After", async () => {
      const { toast } = await import("sonner");

      const middleware = createErrorMiddleware();

      const mockResponse = new Response(
        JSON.stringify({ error: "Too many requests" }),
        {
          status: 429,
          headers: {
            "Retry-After": "invalid",
          },
        },
      );

      const mockRequest = {
        request: new Request("https://api.example.com/v1/resource"),
        url: "https://api.example.com/v1/resource",
        response: mockResponse,
      } as any;

      await expect(middleware.onResponse?.(mockRequest)).rejects.toThrow();

      expect(toast.error).toHaveBeenCalled();
    });

    it("should handle 429 with zero Retry-After", async () => {
      const { toast } = await import("sonner");

      const middleware = createErrorMiddleware();

      const mockResponse = new Response(
        JSON.stringify({ error: "Too many requests" }),
        {
          status: 429,
          headers: {
            "Retry-After": "0",
          },
        },
      );

      const mockRequest = {
        request: new Request("https://api.example.com/v1/resource"),
        url: "https://api.example.com/v1/resource",
        response: mockResponse,
      } as any;

      await expect(middleware.onResponse?.(mockRequest)).rejects.toThrow(
        "Rate limited. Retry after 0ms",
      );

      expect(toast.error).toHaveBeenCalledWith(
        "Rate limit exceeded",
        expect.objectContaining({
          description: expect.stringContaining("0 seconds"),
        }),
      );
    });

    it("should handle 429 with very large Retry-After", async () => {
      const { toast } = await import("sonner");

      const middleware = createErrorMiddleware();

      const mockResponse = new Response(
        JSON.stringify({ error: "Too many requests" }),
        {
          status: 429,
          headers: {
            "Retry-After": "3600", // 1 hour
          },
        },
      );

      const mockRequest = {
        request: new Request("https://api.example.com/v1/resource"),
        url: "https://api.example.com/v1/resource",
        response: mockResponse,
      } as any;

      await expect(middleware.onResponse?.(mockRequest)).rejects.toThrow(
        "Rate limited. Retry after 3600000ms",
      );

      expect(toast.error).toHaveBeenCalledWith(
        "Rate limit exceeded",
        expect.objectContaining({
          description: expect.stringContaining("3600 seconds"),
        }),
      );
    });
  });

  describe("Security Headers Validation", () => {
    beforeEach(() => {
      vi.clearAllMocks();
      vi.stubEnv("NODE_ENV", "development");
    });

    afterEach(() => {
      vi.unstubAllEnvs();
    });

    it("should warn about missing security headers in dev", async () => {
      const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      const middleware = createErrorMiddleware();

      // Response without security headers
      const mockResponse = new Response(JSON.stringify({ data: "test" }), {
        status: 200,
      });

      const mockRequest = {
        request: new Request("https://api.example.com/v1/resource"),
        url: "https://api.example.com/v1/resource",
        response: mockResponse,
      } as any;

      await middleware.onResponse?.(mockRequest);

      expect(consoleSpy).toHaveBeenCalledWith(
        "Missing security headers",
        expect.arrayContaining([
          "x-content-type-options",
          "x-frame-options",
          "x-xss-protection",
          "strict-transport-security",
        ]),
      );

      consoleSpy.mockRestore();
    });

    it("should not warn about missing headers in production", async () => {
      const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      vi.stubEnv("NODE_ENV", "production");

      const middleware = createErrorMiddleware();

      const mockResponse = new Response(JSON.stringify({ data: "test" }), {
        status: 200,
      });

      const mockRequest = {
        request: new Request("https://api.example.com/v1/resource"),
        url: "https://api.example.com/v1/resource",
        response: mockResponse,
      } as any;

      await middleware.onResponse?.(mockRequest);

      expect(consoleSpy).not.toHaveBeenCalledWith(
        "Missing security headers",
        expect.any(Array),
      );

      consoleSpy.mockRestore();
      vi.unstubAllEnvs();
    });

    it("should not warn when all security headers present", async () => {
      const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      const middleware = createErrorMiddleware();

      const mockResponse = new Response(JSON.stringify({ data: "test" }), {
        status: 200,
        headers: {
          "x-content-type-options": "nosniff",
          "x-frame-options": "DENY",
          "x-xss-protection": "1; mode=block",
          "strict-transport-security": "max-age=31536000",
        },
      });

      const mockRequest = {
        request: new Request("https://api.example.com/v1/resource"),
        url: "https://api.example.com/v1/resource",
        response: mockResponse,
      } as any;

      await middleware.onResponse?.(mockRequest);

      expect(consoleSpy).not.toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    it("should only warn about missing security headers", async () => {
      const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      const middleware = createErrorMiddleware();

      // Response with only some security headers
      const mockResponse = new Response(JSON.stringify({ data: "test" }), {
        status: 200,
        headers: {
          "x-content-type-options": "nosniff",
          // Missing: x-frame-options, x-xss-protection, strict-transport-security
        },
      });

      const mockRequest = {
        request: new Request("https://api.example.com/v1/resource"),
        url: "https://api.example.com/v1/resource",
        response: mockResponse,
      } as any;

      await middleware.onResponse?.(mockRequest);

      expect(consoleSpy).toHaveBeenCalledWith(
        "Missing security headers",
        expect.arrayContaining([
          "x-frame-options",
          "x-xss-protection",
          "strict-transport-security",
        ]),
      );

      expect(consoleSpy).not.toHaveBeenCalledWith(
        "Missing security headers",
        expect.arrayContaining(["x-content-type-options"]),
      );

      consoleSpy.mockRestore();
    });
  });

  describe("Success Responses (2xx)", () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it("should pass through 200 OK responses", async () => {
      const { toast } = await import("sonner");
      const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      const middleware = createErrorMiddleware();

      const mockResponse = new Response(JSON.stringify({ data: "success" }), {
        status: 200,
      });

      const mockRequest = {
        request: new Request("https://api.example.com/v1/resource"),
        url: "https://api.example.com/v1/resource",
        response: mockResponse,
      } as any;

      const result = await middleware.onResponse?.(mockRequest);

      expect(result).toBe(mockResponse);
      expect(toast.error).not.toHaveBeenCalled();
      expect(consoleSpy).toHaveBeenCalled(); // Security headers warning

      consoleSpy.mockRestore();
    });

    it("should pass through 201 Created responses", async () => {
      const middleware = createErrorMiddleware();

      const mockResponse = new Response(JSON.stringify({ id: "123" }), {
        status: 201,
      });

      const mockRequest = {
        request: new Request("https://api.example.com/v1/resource", {
          method: "POST",
        }),
        url: "https://api.example.com/v1/resource",
        response: mockResponse,
      } as any;

      const result = await middleware.onResponse?.(mockRequest);

      expect(result).toBe(mockResponse);
    });

    it("should pass through 204 No Content responses", async () => {
      const middleware = createErrorMiddleware();

      const mockResponse = new Response(null, {
        status: 204,
      });

      const mockRequest = {
        request: new Request("https://api.example.com/v1/resource", {
          method: "DELETE",
        }),
        url: "https://api.example.com/v1/resource",
        response: mockResponse,
      } as any;

      const result = await middleware.onResponse?.(mockRequest);

      expect(result).toBe(mockResponse);
    });
  });

  describe("Client Error Responses (4xx)", () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it("should pass through 400 Bad Request without toast", async () => {
      const { toast } = await import("sonner");

      const middleware = createErrorMiddleware();

      const mockResponse = new Response(
        JSON.stringify({ error: "Bad request" }),
        {
          status: 400,
        },
      );

      const mockRequest = {
        request: new Request("https://api.example.com/v1/resource"),
        url: "https://api.example.com/v1/resource",
        response: mockResponse,
      } as any;

      const result = await middleware.onResponse?.(mockRequest);

      expect(result).toBe(mockResponse);
      expect(toast.error).not.toHaveBeenCalled();
    });

    it("should pass through 403 Forbidden without toast", async () => {
      const { toast } = await import("sonner");

      const middleware = createErrorMiddleware();

      const mockResponse = new Response(
        JSON.stringify({ error: "Forbidden" }),
        {
          status: 403,
        },
      );

      const mockRequest = {
        request: new Request("https://api.example.com/v1/resource"),
        url: "https://api.example.com/v1/resource",
        response: mockResponse,
      } as any;

      const result = await middleware.onResponse?.(mockRequest);

      expect(result).toBe(mockResponse);
      expect(toast.error).not.toHaveBeenCalled();
    });

    it("should pass through 404 Not Found without toast", async () => {
      const { toast } = await import("sonner");

      const middleware = createErrorMiddleware();

      const mockResponse = new Response(
        JSON.stringify({ error: "Not found" }),
        {
          status: 404,
        },
      );

      const mockRequest = {
        request: new Request("https://api.example.com/v1/resource"),
        url: "https://api.example.com/v1/resource",
        response: mockResponse,
      } as any;

      const result = await middleware.onResponse?.(mockRequest);

      expect(result).toBe(mockResponse);
      expect(toast.error).not.toHaveBeenCalled();
    });
  });

  describe("Concurrent Error Handling", () => {
    beforeEach(() => {
      vi.clearAllMocks();
      vi.stubEnv("NODE_ENV", "development");
    });

    afterEach(() => {
      vi.unstubAllEnvs();
    });

    it("should handle multiple concurrent 5xx errors", async () => {
      const { toast } = await import("sonner");

      const middleware = createErrorMiddleware();

      const createMockRequest = (status: number, url: string) => {
        const mockResponse = new Response(
          JSON.stringify({ error: "Server error" }),
          {
            status,
          },
        );

        return {
          request: new Request(url),
          url,
          response: mockResponse,
        } as any;
      };

      const mockRequests = [
        createMockRequest(500, "https://api.example.com/v1/users"),
        createMockRequest(503, "https://api.example.com/v1/products"),
        createMockRequest(502, "https://api.example.com/v1/orders"),
      ];

      const results = await Promise.all(
        mockRequests.map((req) => middleware.onResponse?.(req)),
      );

      // All responses should pass through
      expect(results).toHaveLength(3);

      // Toast should be called for each 5xx
      expect(toast.error).toHaveBeenCalledTimes(3);
    });

    it("should handle mixed error and success responses", async () => {
      const { toast } = await import("sonner");

      const middleware = createErrorMiddleware();

      const createMockRequest = (status: number, url: string) => {
        const mockResponse = new Response(
          status >= 300
            ? JSON.stringify({ error: "Error" })
            : JSON.stringify({ data: "ok" }),
          { status },
        );

        return {
          request: new Request(url),
          url,
          response: mockResponse,
        } as any;
      };

      const mockRequests = [
        createMockRequest(200, "https://api.example.com/v1/users"),
        createMockRequest(500, "https://api.example.com/v1/products"),
        createMockRequest(201, "https://api.example.com/v1/orders"),
        createMockRequest(503, "https://api.example.com/v1/settings"),
      ];

      const results = await Promise.all(
        mockRequests.map((req) => middleware.onResponse?.(req)),
      );

      expect(results).toHaveLength(4);

      // Only 5xx should trigger toast
      expect(toast.error).toHaveBeenCalledTimes(2);
    });
  });

  describe("Edge Cases", () => {
    beforeEach(() => {
      vi.clearAllMocks();
      vi.stubEnv("NODE_ENV", "development");
    });

    afterEach(() => {
      vi.unstubAllEnvs();
    });

    it("should handle response without body", async () => {
      const middleware = createErrorMiddleware();

      const mockResponse = new Response(null, {
        status: 500,
      });

      const mockRequest = {
        request: new Request("https://api.example.com/v1/resource"),
        url: "https://api.example.com/v1/resource",
        response: mockResponse,
      } as any;

      const result = await middleware.onResponse?.(mockRequest);

      expect(result).toBe(mockResponse);
    });

    it("should handle malformed JSON in error response", async () => {
      const { toast } = await import("sonner");

      const middleware = createErrorMiddleware();

      const mockResponse = new Response("not valid json", {
        status: 500,
      });

      const mockRequest = {
        request: new Request("https://api.example.com/v1/resource"),
        url: "https://api.example.com/v1/resource",
        response: mockResponse,
      } as any;

      const result = await middleware.onResponse?.(mockRequest);

      expect(result).toBe(mockResponse);
      expect(toast.error).toHaveBeenCalled();
    });

    it("should handle very long error messages", async () => {
      const { toast } = await import("sonner");

      const middleware = createErrorMiddleware();

      const longErrorMessage = "A".repeat(10000);
      const mockResponse = new Response(
        JSON.stringify({ error: longErrorMessage }),
        {
          status: 500,
        },
      );

      const mockRequest = {
        request: new Request("https://api.example.com/v1/resource"),
        url: "https://api.example.com/v1/resource",
        response: mockResponse,
      } as any;

      const result = await middleware.onResponse?.(mockRequest);

      expect(result).toBe(mockResponse);
    });

    it("should handle empty URL in request", async () => {
      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      vi.stubEnv("NODE_ENV", "production");

      const middleware = createErrorMiddleware();

      const mockResponse = new Response(
        JSON.stringify({ error: "Server error" }),
        {
          status: 500,
        },
      );

      // Use a valid placeholder URL to avoid Request constructor error
      const mockRequest = {
        request: new Request("https://placeholder.invalid/"),
        url: "", // Empty URL in request object
        response: mockResponse,
      } as any;

      await middleware.onResponse?.(mockRequest);

      expect(consoleSpy).toHaveBeenCalledWith(
        "Server error",
        expect.objectContaining({
          url: "", // Empty URL in request object
        }),
      );

      consoleSpy.mockRestore();
      vi.unstubAllEnvs();
    });
  });
});
