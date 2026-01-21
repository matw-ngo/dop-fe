/**
 * Auth Middleware Unit Tests
 *
 * Tests for token attachment, auth header format, token refresh on 401,
 * and skip-auth pattern for lead endpoints.
 */

import type { Middleware } from "openapi-fetch";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Mock the token store and security utilities before importing
vi.mock("@/lib/auth/secure-tokens", () => ({
  securityUtils: {
    generateCSRFToken: vi.fn(() => "mock-csrf-token"),
  },
  useTokenStore: {
    getState: vi.fn(() => ({
      getAccessToken: vi.fn(),
      isTokenExpired: vi.fn(),
      refreshTokens: vi.fn(),
      clearTokens: vi.fn(),
    })),
  },
}));

vi.mock("@/lib/api/config", () => ({
  shouldSkipAuth: vi.fn((url: string) => {
    // Skip auth for lead endpoints
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

describe("Auth Middleware", () => {
  describe("createAuthMiddleware", () => {
    it("should attach Bearer token to request headers when token exists", async () => {
      const { useTokenStore } = await import("@/lib/auth/secure-tokens");

      // Setup mock state
      vi.mocked(useTokenStore.getState).mockReturnValue({
        getAccessToken: vi.fn(() => "valid-access-token"),
        isTokenExpired: vi.fn(() => false),
        refreshTokens: vi.fn(),
        clearTokens: vi.fn(),
      });

      const middleware = createAuthMiddleware();
      const mockRequest = {
        request: new Request("https://api.example.com/v1/leads"),
        url: "https://api.example.com/v1/leads",
        headers: new Headers(),
      } as any;

      await middleware.onRequest(mockRequest);

      expect(mockRequest.request.headers.get("Authorization")).toBe(
        "Bearer valid-access-token",
      );
    });

    it("should not attach auth header when no token exists", async () => {
      const { useTokenStore } = await import("@/lib/auth/secure-tokens");

      vi.mocked(useTokenStore.getState).mockReturnValue({
        getAccessToken: vi.fn(() => null),
        isTokenExpired: vi.fn(() => false),
        refreshTokens: vi.fn(),
        clearTokens: vi.fn(),
      });

      const middleware = createAuthMiddleware();
      const mockRequest = {
        request: new Request("https://api.example.com/v1/leads"),
        url: "https://api.example.com/v1/leads",
        headers: new Headers(),
      } as any;

      await middleware.onRequest(mockRequest);

      expect(mockRequest.request.headers.get("Authorization")).toBeNull();
    });

    it("should add CSRF token for POST requests", async () => {
      const { useTokenStore, securityUtils } = await import(
        "@/lib/auth/secure-tokens"
      );

      vi.mocked(useTokenStore.getState).mockReturnValue({
        getAccessToken: vi.fn(() => "valid-token"),
        isTokenExpired: vi.fn(() => false),
        refreshTokens: vi.fn(),
        clearTokens: vi.fn(),
      });

      const middleware = createAuthMiddleware();
      const mockRequest = {
        request: new Request("https://api.example.com/v1/leads", {
          method: "POST",
        }),
        url: "https://api.example.com/v1/leads",
        headers: new Headers(),
      } as any;

      await middleware.onRequest(mockRequest);

      expect(mockRequest.request.headers.get("X-CSRF-Token")).toBe(
        "mock-csrf-token",
      );
      expect(securityUtils.generateCSRFToken).toHaveBeenCalled();
    });

    it("should not add CSRF token for GET requests", async () => {
      const { useTokenStore } = await import("@/lib/auth/secure-tokens");

      vi.mocked(useTokenStore.getState).mockReturnValue({
        getAccessToken: vi.fn(() => "valid-token"),
        isTokenExpired: vi.fn(() => false),
        refreshTokens: vi.fn(),
        clearTokens: vi.fn(),
      });

      const middleware = createAuthMiddleware();
      const mockRequest = {
        request: new Request("https://api.example.com/v1/leads", {
          method: "GET",
        }),
        url: "https://api.example.com/v1/leads",
        headers: new Headers(),
      } as any;

      await middleware.onRequest(mockRequest);

      expect(mockRequest.request.headers.get("X-CSRF-Token")).toBeNull();
    });

    it("should refresh token when expired and retry request", async () => {
      const { useTokenStore } = await import("@/lib/auth/secure-tokens");

      let tokenCallCount = 0;
      vi.mocked(useTokenStore.getState).mockReturnValue({
        getAccessToken: vi.fn(() => {
          tokenCallCount++;
          // Return null on first call (expired), token on second call (after refresh)
          return tokenCallCount > 1 ? "refreshed-token" : null;
        }),
        isTokenExpired: vi.fn(() => true),
        refreshTokens: vi.fn(() => Promise.resolve(true)),
        clearTokens: vi.fn(),
      });

      const middleware = createAuthMiddleware();
      const mockRequest = {
        request: new Request("https://api.example.com/v1/protected"),
        url: "https://api.example.com/v1/protected",
        headers: new Headers(),
      } as any;

      await middleware.onRequest(mockRequest);

      expect(mockRequest.request.headers.get("Authorization")).toBe(
        "Bearer refreshed-token",
      );
    });

    it("should throw error when token refresh fails", async () => {
      const { useTokenStore } = await import("@/lib/auth/secure-tokens");

      vi.mocked(useTokenStore.getState).mockReturnValue({
        getAccessToken: vi.fn(() => "expired-token"),
        isTokenExpired: vi.fn(() => true),
        refreshTokens: vi.fn(() => Promise.resolve(false)),
        clearTokens: vi.fn(),
      });

      const middleware = createAuthMiddleware();
      const mockRequest = {
        request: new Request("https://api.example.com/v1/protected"),
        url: "https://api.example.com/v1/protected",
        headers: new Headers(),
      } as any;

      await expect(middleware.onRequest(mockRequest)).rejects.toThrow(
        "Authentication failed",
      );
    });
  });

  describe("createAuthResponseMiddleware", () => {
    it("should not attempt refresh for skip-auth endpoints", async () => {
      const { useTokenStore } = await import("@/lib/auth/secure-tokens");

      const refreshTokens = vi.fn();
      vi.mocked(useTokenStore.getState).mockReturnValue({
        getAccessToken: vi.fn(),
        isTokenExpired: vi.fn(),
        refreshTokens,
        clearTokens: vi.fn(),
      });

      const middleware = createAuthResponseMiddleware();
      const mockResponse = {
        response: new Response(null, { status: 401 }),
        request: {
          url: "https://api.example.com/v1/leads/123",
        },
      } as any;

      await middleware.onResponse(mockResponse);

      expect(refreshTokens).not.toHaveBeenCalled();
    });

    it("should trigger token refresh on 401 for non-skip-auth endpoints", async () => {
      const { useTokenStore } = await import("@/lib/auth/secure-tokens");

      const refreshTokens = vi.fn(() => Promise.resolve(true));
      vi.mocked(useTokenStore.getState).mockReturnValue({
        getAccessToken: vi.fn(() => "new-token"),
        isTokenExpired: vi.fn(),
        refreshTokens,
        clearTokens: vi.fn(),
      });

      const middleware = createAuthResponseMiddleware();
      const mockResponse = {
        response: new Response(null, { status: 401 }),
        request: {
          url: "https://api.example.com/v1/protected-endpoint",
        },
      } as any;

      await middleware.onResponse(mockResponse);

      expect(refreshTokens).toHaveBeenCalled();
    });

    it("should not redirect for skip-auth 401 responses", async () => {
      const { useTokenStore } = await import("@/lib/auth/secure-tokens");

      const clearTokens = vi.fn();
      const refreshTokens = vi.fn(() => Promise.resolve(false));
      vi.mocked(useTokenStore.getState).mockReturnValue({
        getAccessToken: vi.fn(),
        isTokenExpired: vi.fn(),
        refreshTokens,
        clearTokens,
      });

      const middleware = createAuthResponseMiddleware();
      const mockResponse = {
        response: new Response(null, { status: 401 }),
        request: {
          url: "https://api.example.com/v1/leads/123/submit-info",
        },
      } as any;

      await middleware.onResponse(mockResponse);

      // Should not clear tokens or throw for skip-auth endpoints
      expect(clearTokens).not.toHaveBeenCalled();
    });

    it("should clear tokens and redirect on failed refresh for protected endpoints", async () => {
      const { useTokenStore } = await import("@/lib/auth/secure-tokens");

      const clearTokens = vi.fn();
      const refreshTokens = vi.fn(() => Promise.resolve(false));
      vi.mocked(useTokenStore.getState).mockReturnValue({
        getAccessToken: vi.fn(),
        isTokenExpired: vi.fn(),
        refreshTokens,
        clearTokens,
      });

      const middleware = createAuthResponseMiddleware();
      const mockResponse = {
        response: new Response(null, { status: 401 }),
        request: {
          url: "https://api.example.com/v1/admin/settings",
        },
      } as any;

      await expect(middleware.onResponse(mockResponse)).rejects.toThrow(
        "Authentication failed",
      );
      expect(clearTokens).toHaveBeenCalled();
    });

    it("should not trigger refresh for 401 on /refresh endpoint itself", async () => {
      const { useTokenStore } = await import("@/lib/auth/secure-tokens");

      const refreshTokens = vi.fn();
      vi.mocked(useTokenStore.getState).mockReturnValue({
        getAccessToken: vi.fn(),
        isTokenExpired: vi.fn(),
        refreshTokens,
        clearTokens: vi.fn(),
      });

      const middleware = createAuthResponseMiddleware();
      const mockResponse = {
        response: new Response(null, { status: 401 }),
        request: {
          url: "https://api.example.com/v1/auth/refresh",
        },
      } as any;

      await middleware.onResponse(mockResponse);

      expect(refreshTokens).not.toHaveBeenCalled();
    });
  });
});
