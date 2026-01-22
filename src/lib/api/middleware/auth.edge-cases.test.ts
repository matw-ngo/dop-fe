/**
 * Token Edge Cases Tests
 *
 * Comprehensive tests for token-related edge cases:
 * - Token refresh race conditions
 * - Multiple concurrent requests during token expiration
 * - Request queue handling
 * - Refresh token also expired
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Setup mocks at module level
vi.mock("@/lib/auth/secure-tokens", () => ({
  securityUtils: {
    generateCSRFToken: vi.fn(() => "mock-csrf-token"),
  },
  useTokenStore: {
    getState: vi.fn(),
  },
}));

vi.mock("@/lib/api/config", () => ({
  shouldSkipAuth: vi.fn((url: string) => {
    return url.includes("/leads/") || url.includes("/flows/");
  }),
}));

vi.mock("sonner", () => ({
  toast: {
    error: vi.fn(),
    info: vi.fn(),
  },
}));

// Import after mocking
const { createAuthMiddleware, createAuthResponseMiddleware } = await import(
  "@/lib/api/middleware/auth"
);

describe("Token Edge Cases", () => {
  describe("Token Refresh Race Conditions", () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it("should handle multiple concurrent requests during token expiration", async () => {
      const { useTokenStore } = await import("@/lib/auth/secure-tokens");

      // Track refresh calls
      let refreshCallCount = 0;
      let currentAccessToken = "expired-token";

      vi.mocked(useTokenStore.getState).mockReturnValue({
        getAccessToken: vi.fn(() => currentAccessToken),
        isTokenExpired: vi.fn(() => true),
        refreshTokens: vi.fn(() => {
          refreshCallCount++;
          return new Promise<boolean>((resolve) => {
            setTimeout(() => {
              currentAccessToken = "new-expired-token";
              resolve(true);
            }, 50);
          });
        }),
        clearTokens: vi.fn(),
        getRefreshToken: vi.fn(() => "refresh-token"),
        setTokens: vi.fn(),
        isAuthenticated: vi.fn(() => false) as any,
        tokens: null,
        isLoading: false,
      });

      const middleware = createAuthMiddleware();

      // Create multiple mock requests
      const mockRequests = Array.from(
        { length: 5 },
        () =>
          ({
            request: new Request("https://api.example.com/v1/protected"),
            url: "https://api.example.com/v1/protected",
            headers: new Headers(),
          }) as any,
      );

      const promises = mockRequests.map((mockReq) =>
        middleware.onRequest?.(mockReq),
      );

      // Wait for all requests to complete
      await Promise.all(promises);

      // Should only call refresh once (not 5 times)
      expect(refreshCallCount).toBe(1);

      // All requests should have valid tokens
      mockRequests.forEach((mockReq) => {
        expect(mockReq.request.headers.get("Authorization")).toBe(
          "Bearer new-expired-token",
        );
      });
    });

    it("should queue pending requests during token refresh", async () => {
      const { useTokenStore } = await import("@/lib/auth/secure-tokens");

      let currentAccessToken = "expired-token";
      let refreshCallCount = 0;

      vi.mocked(useTokenStore.getState).mockReturnValue({
        getAccessToken: vi.fn(() => currentAccessToken),
        isTokenExpired: vi.fn(() => true),
        refreshTokens: vi.fn(() => {
          refreshCallCount++;
          return new Promise<boolean>((resolve) => {
            setTimeout(() => {
              currentAccessToken = "new-expired-token";
              resolve(true);
            }, 30);
          });
        }),
        clearTokens: vi.fn(),
        getRefreshToken: vi.fn(() => "refresh-token"),
        setTokens: vi.fn(),
        isAuthenticated: vi.fn(() => false) as any,
        tokens: null,
        isLoading: false,
      });

      const middleware = createAuthMiddleware();
      const mockRequest1 = {
        request: new Request("https://api.example.com/v1/protected"),
        url: "https://api.example.com/v1/protected",
        headers: new Headers(),
      } as any;

      const mockRequest2 = {
        request: new Request("https://api.example.com/v1/another"),
        url: "https://api.example.com/v1/another",
        headers: new Headers(),
      } as any;

      // Start both requests
      const firstRequest = middleware.onRequest?.(mockRequest1);
      const secondRequest = middleware.onRequest?.(mockRequest2);

      // Both should complete after refresh
      await Promise.all([firstRequest, secondRequest]);

      // Both requests should have valid tokens after refresh
      expect(mockRequest1.request.headers.get("Authorization")).toBe(
        "Bearer new-expired-token",
      );
      expect(mockRequest2.request.headers.get("Authorization")).toBe(
        "Bearer new-expired-token",
      );
    });

    it("should handle refresh token also expired", async () => {
      const { useTokenStore } = await import("@/lib/auth/secure-tokens");

      vi.mocked(useTokenStore.getState).mockReturnValue({
        getAccessToken: vi.fn(() => "expired-token"),
        isTokenExpired: vi.fn(() => true),
        refreshTokens: vi.fn(() => Promise.resolve(false)),
        clearTokens: vi.fn(),
        getRefreshToken: vi.fn(() => null) as any,
        setTokens: vi.fn(),
        isAuthenticated: vi.fn(() => false) as any,
        tokens: null,
        isLoading: false,
      });

      const middleware = createAuthMiddleware();
      const mockRequest = {
        request: new Request("https://api.example.com/v1/protected"),
        url: "https://api.example.com/v1/protected",
        headers: new Headers(),
      } as any;

      await expect(middleware.onRequest?.(mockRequest)).rejects.toThrow(
        "Authentication failed",
      );
      expect(
        vi.mocked(useTokenStore.getState).mock.results[0].value.clearTokens,
      ).toHaveBeenCalled();
    });

    it("should handle refresh that fails after retry", async () => {
      const { useTokenStore } = await import("@/lib/auth/secure-tokens");

      let refreshAttempts = 0;

      vi.mocked(useTokenStore.getState).mockReturnValue({
        getAccessToken: vi.fn(() => {
          refreshAttempts++;
          return refreshAttempts > 2 ? "new-token" : "expired-token";
        }),
        isTokenExpired: vi.fn(() => refreshAttempts <= 1),
        refreshTokens: vi.fn(() => {
          if (refreshAttempts <= 2) {
            return Promise.resolve(false);
          }
          return Promise.resolve(true);
        }),
        clearTokens: vi.fn(),
        getRefreshToken: vi.fn(() => "refresh-token"),
        setTokens: vi.fn(),
        isAuthenticated: vi.fn(() => false) as any,
        tokens: null,
        isLoading: false,
      });

      const middleware = createAuthMiddleware();
      const mockRequest = {
        request: new Request("https://api.example.com/v1/protected"),
        url: "https://api.example.com/v1/protected",
        headers: new Headers(),
      } as any;

      await expect(middleware.onRequest?.(mockRequest)).rejects.toThrow();
      expect(
        vi.mocked(useTokenStore.getState).mock.results[0].value.clearTokens,
      ).toHaveBeenCalled();
    });
  });

  describe("Token Storage Edge Cases", () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it("should handle undefined token", async () => {
      const { useTokenStore } = await import("@/lib/auth/secure-tokens");

      vi.mocked(useTokenStore.getState).mockReturnValue({
        getAccessToken: vi.fn(() => undefined as any),
        isTokenExpired: vi.fn(() => false),
        refreshTokens: vi.fn(() => Promise.resolve(true)) as any,
        clearTokens: vi.fn(),
        getRefreshToken: vi.fn(() => null) as any,
        setTokens: vi.fn(),
        isAuthenticated: vi.fn(() => false) as any,
        tokens: null,
        isLoading: false,
      });

      const middleware = createAuthMiddleware();
      const mockRequest = {
        request: new Request("https://api.example.com/v1/protected"),
        url: "https://api.example.com/v1/protected",
        headers: new Headers(),
      } as any;

      await middleware.onRequest?.(mockRequest);

      expect(mockRequest.request.headers.get("Authorization")).toBeNull();
    });

    it("should handle empty string token", async () => {
      const { useTokenStore } = await import("@/lib/auth/secure-tokens");

      vi.mocked(useTokenStore.getState).mockReturnValue({
        getAccessToken: vi.fn(() => ""),
        isTokenExpired: vi.fn(() => false),
        refreshTokens: vi.fn() as any,
        clearTokens: vi.fn(),
        getRefreshToken: vi.fn(() => null) as any,
        setTokens: vi.fn(),
        isAuthenticated: vi.fn(() => false) as any,
        tokens: null,
        isLoading: false,
      });

      const middleware = createAuthMiddleware();
      const mockRequest = {
        request: new Request("https://api.example.com/v1/protected"),
        url: "https://api.example.com/v1/protected",
        headers: new Headers(),
      } as any;

      await middleware.onRequest?.(mockRequest);

      expect(mockRequest.request.headers.get("Authorization")).toBeNull();
    });

    it("should handle token with special characters", async () => {
      const { useTokenStore } = await import("@/lib/auth/secure-tokens");

      const specialToken = "token=abc&secret=123";

      vi.mocked(useTokenStore.getState).mockReturnValue({
        getAccessToken: vi.fn(() => specialToken),
        isTokenExpired: vi.fn(() => false),
        refreshTokens: vi.fn(),
        clearTokens: vi.fn(),
        getRefreshToken: vi.fn(() => "refresh-token"),
        setTokens: vi.fn(),
        isAuthenticated: vi.fn(() => false) as any,
        tokens: null,
        isLoading: false,
      });

      const middleware = createAuthMiddleware();
      const mockRequest = {
        request: new Request("https://api.example.com/v1/protected"),
        url: "https://api.example.com/v1/protected",
        headers: new Headers(),
      } as any;

      await middleware.onRequest?.(mockRequest);

      const authHeader = mockRequest.request.headers.get("Authorization");
      expect(authHeader).toContain("Bearer");
      expect(authHeader).toContain(specialToken);
    });
  });

  describe("CSRF Token Edge Cases", () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it("should handle missing CSRF generation", async () => {
      const { useTokenStore, securityUtils } = await import(
        "@/lib/auth/secure-tokens"
      );

      vi.mocked(useTokenStore.getState).mockReturnValue({
        getAccessToken: vi.fn(() => "valid-token"),
        isTokenExpired: vi.fn(() => false),
        refreshTokens: vi.fn(),
        clearTokens: vi.fn(),
        getRefreshToken: vi.fn(() => "refresh-token"),
        setTokens: vi.fn(),
        isAuthenticated: vi.fn(() => false) as any,
        tokens: null,
        isLoading: false,
      });

      vi.mocked(securityUtils.generateCSRFToken).mockImplementation(() => {
        throw new Error("CSRF generation failed");
      });

      const middleware = createAuthMiddleware();
      const mockRequest = {
        request: new Request("https://api.example.com/v1/leads", {
          method: "POST",
        }),
        url: "https://api.example.com/v1/leads",
        headers: new Headers(),
      } as any;

      await middleware.onRequest?.(mockRequest);

      expect(mockRequest.request.headers.get("Authorization")).toBe(
        "Bearer valid-token",
      );
    });

    it("should only add CSRF for state-changing methods", async () => {
      const { useTokenStore, securityUtils } = await import(
        "@/lib/auth/secure-tokens"
      );

      vi.mocked(useTokenStore.getState).mockReturnValue({
        getAccessToken: vi.fn(() => "valid-token"),
        isTokenExpired: vi.fn(() => false),
        refreshTokens: vi.fn(),
        clearTokens: vi.fn(),
        getRefreshToken: vi.fn(() => "refresh-token"),
        setTokens: vi.fn(),
        isAuthenticated: vi.fn(() => false) as any,
        tokens: null,
        isLoading: false,
      });

      vi.mocked(securityUtils.generateCSRFToken).mockReturnValue(
        "generated-csrf",
      );

      const middleware = createAuthMiddleware();

      // Test GET - should NOT have CSRF
      const getRequest = {
        request: new Request("https://api.example.com/v1/resource"),
        url: "https://api.example.com/v1/resource",
        headers: new Headers(),
      } as any;
      await middleware.onRequest?.(getRequest);
      expect(getRequest.request.headers.get("X-CSRF-Token")).toBeNull();

      // Test POST - should have CSRF
      const postRequest = {
        request: new Request("https://api.example.com/v1/resource", {
          method: "POST",
        }),
        url: "https://api.example.com/v1/resource",
        headers: new Headers(),
      } as any;
      await middleware.onRequest?.(postRequest);
      expect(postRequest.request.headers.get("X-CSRF-Token")).toBe(
        "generated-csrf",
      );

      // Test PUT - should have CSRF
      const putRequest = {
        request: new Request("https://api.example.com/v1/resource", {
          method: "PUT",
        }),
        url: "https://api.example.com/v1/resource",
        headers: new Headers(),
      } as any;
      await middleware.onRequest?.(putRequest);
      expect(putRequest.request.headers.get("X-CSRF-Token")).toBe(
        "generated-csrf",
      );

      // Test DELETE - should have CSRF
      const deleteRequest = {
        request: new Request("https://api.example.com/v1/resource", {
          method: "DELETE",
        }),
        url: "https://api.example.com/v1/resource",
        headers: new Headers(),
      } as any;
      await middleware.onRequest?.(deleteRequest);
      expect(deleteRequest.request.headers.get("X-CSRF-Token")).toBe(
        "generated-csrf",
      );

      // Test PATCH - should have CSRF
      const patchRequest = {
        request: new Request("https://api.example.com/v1/resource", {
          method: "PATCH",
        }),
        url: "https://api.example.com/v1/resource",
        headers: new Headers(),
      } as any;
      await middleware.onRequest?.(patchRequest);
      expect(patchRequest.request.headers.get("X-CSRF-Token")).toBe(
        "generated-csrf",
      );
    });
  });
});
