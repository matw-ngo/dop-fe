/**
 * Auth Middleware Unit Tests
 *
 * Tests for token attachment, auth header format, token refresh on 401,
 * and skip-auth pattern for lead endpoints.
 */

import { describe, expect, it, vi } from "vitest";

interface MockAuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  tokenType: "Bearer";
}

interface MockTokenStoreState {
  tokens: MockAuthTokens | null;
  isAuthenticated: () => boolean;
  isLoading: boolean;
  setTokens: (tokens: MockAuthTokens) => void;
  clearTokens: () => void;
  getAccessToken: () => string | null;
  getRefreshToken: () => string | null;
  isTokenExpired: () => boolean;
  refreshTokens: () => Promise<boolean>;
}

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
      getRefreshToken: vi.fn(),
      setTokens: vi.fn(),
      isAuthenticated: vi.fn(),
      tokens: null,
      isLoading: false,
    })),
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

function createMockTokenState(
  overrides: Partial<MockTokenStoreState> = {},
): any {
  return {
    getAccessToken: () => null,
    isTokenExpired: () => false,
    refreshTokens: async () => false,
    clearTokens: vi.fn(),
    getRefreshToken: () => null,
    setTokens: vi.fn(),
    isAuthenticated: () => false,
    tokens: null,
    isLoading: false,
    ...overrides,
  };
}

describe("Auth Middleware", () => {
  describe("createAuthMiddleware", () => {
    it("should attach Bearer token to request headers when token exists", async () => {
      const { useTokenStore } = await import("@/lib/auth/secure-tokens");

      vi.mocked(useTokenStore.getState).mockReturnValueOnce(
        createMockTokenState({
          getAccessToken: () => "valid-access-token",
          isTokenExpired: () => false,
          tokens: {
            accessToken: "valid-access-token",
            refreshToken: "valid-refresh-token",
            expiresAt: Date.now() + 3600000,
            tokenType: "Bearer",
          },
          isAuthenticated: () => true,
        }) as any,
      );

      const middleware = createAuthMiddleware();
      const mockRequest = {
        request: new Request("https://api.example.com/v1/leads"),
        url: "https://api.example.com/v1/leads",
        headers: new Headers(),
      } as any;

      await middleware.onRequest?.(mockRequest);

      expect(mockRequest.request.headers.get("Authorization")).toBe(
        "Bearer valid-access-token",
      );
    });

    it("should not attach auth header when no token exists", async () => {
      const { useTokenStore } = await import("@/lib/auth/secure-tokens");

      vi.mocked(useTokenStore.getState).mockReturnValueOnce(
        createMockTokenState({
          getAccessToken: () => null,
          isAuthenticated: () => false,
        }) as any,
      );

      const middleware = createAuthMiddleware();
      const mockRequest = {
        request: new Request("https://api.example.com/v1/leads"),
        url: "https://api.example.com/v1/leads",
        headers: new Headers(),
      } as any;

      await middleware.onRequest?.(mockRequest);

      expect(mockRequest.request.headers.get("Authorization")).toBeNull();
    });

    it("should add CSRF token for POST requests", async () => {
      const { useTokenStore, securityUtils } = await import(
        "@/lib/auth/secure-tokens"
      );

      vi.mocked(useTokenStore.getState).mockReturnValueOnce(
        createMockTokenState({
          getAccessToken: () => "valid-token",
          isTokenExpired: () => false,
          tokens: {
            accessToken: "valid-token",
            refreshToken: "refresh-token",
            expiresAt: Date.now() + 3600000,
            tokenType: "Bearer",
          },
          isAuthenticated: () => true,
        }),
      );

      const middleware = createAuthMiddleware();
      const mockRequest = {
        request: new Request("https://api.example.com/v1/leads", {
          method: "POST",
        }),
        url: "https://api.example.com/v1/leads",
        headers: new Headers(),
      } as any;

      await middleware.onRequest?.(mockRequest);

      expect(mockRequest.request.headers.get("X-CSRF-Token")).toBe(
        "mock-csrf-token",
      );
      expect(securityUtils.generateCSRFToken).toHaveBeenCalled();
    });

    it("should not add CSRF token for GET requests", async () => {
      const { useTokenStore } = await import("@/lib/auth/secure-tokens");

      vi.mocked(useTokenStore.getState).mockReturnValueOnce(
        createMockTokenState({
          getAccessToken: () => "valid-token",
          isTokenExpired: () => false,
          tokens: {
            accessToken: "valid-token",
            refreshToken: "refresh-token",
            expiresAt: Date.now() + 3600000,
            tokenType: "Bearer",
          },
          isAuthenticated: () => true,
        }),
      );

      const middleware = createAuthMiddleware();
      const mockRequest = {
        request: new Request("https://api.example.com/v1/leads", {
          method: "GET",
        }),
        url: "https://api.example.com/v1/leads",
        headers: new Headers(),
      } as any;

      await middleware.onRequest?.(mockRequest);

      expect(mockRequest.request.headers.get("X-CSRF-Token")).toBeNull();
    });

    it("should refresh token when expired and retry request", async () => {
      const { useTokenStore } = await import("@/lib/auth/secure-tokens");

      let tokenCallCount = 0;
      vi.mocked(useTokenStore.getState).mockReturnValueOnce(
        createMockTokenState({
          getAccessToken: () => {
            tokenCallCount++;
            return tokenCallCount > 1 ? "refreshed-token" : null;
          },
          isTokenExpired: () => true,
          refreshTokens: async () => true,
          tokens: {
            accessToken: "refreshed-token",
            refreshToken: "refresh-token",
            expiresAt: Date.now() + 3600000,
            tokenType: "Bearer",
          },
          isAuthenticated: () => true,
        }),
      );

      const middleware = createAuthMiddleware();
      const mockRequest = {
        request: new Request("https://api.example.com/v1/protected"),
        url: "https://api.example.com/v1/protected",
        headers: new Headers(),
      } as any;

      await middleware.onRequest?.(mockRequest);

      expect(mockRequest.request.headers.get("Authorization")).toBe(
        "Bearer refreshed-token",
      );
    });

    it("should throw error when token refresh fails", async () => {
      const { useTokenStore } = await import("@/lib/auth/secure-tokens");

      vi.mocked(useTokenStore.getState).mockReturnValueOnce(
        createMockTokenState({
          getAccessToken: () => "expired-token",
          isTokenExpired: () => true,
          refreshTokens: async () => false,
          isAuthenticated: () => false,
        }),
      );

      const middleware = createAuthMiddleware();
      const mockRequest = {
        request: new Request("https://api.example.com/v1/protected"),
        url: "https://api.example.com/v1/protected",
        headers: new Headers(),
      } as any;

      await expect(middleware.onRequest?.(mockRequest)).rejects.toThrow(
        "Authentication failed",
      );
    });
  });

  describe("createAuthResponseMiddleware", () => {
    it("should not attempt refresh for skip-auth endpoints", async () => {
      const { useTokenStore } = await import("@/lib/auth/secure-tokens");

      const refreshTokens = vi.fn(async () => true);
      vi.mocked(useTokenStore.getState).mockReturnValueOnce(
        createMockTokenState({
          getAccessToken: () => "token",
          refreshTokens,
          tokens: {
            accessToken: "token",
            refreshToken: "refresh-token",
            expiresAt: Date.now() + 3600000,
            tokenType: "Bearer",
          },
          isAuthenticated: () => true,
        }),
      );

      const middleware = createAuthResponseMiddleware();
      const mockResponse = {
        response: new Response(null, { status: 401 }),
        request: {
          url: "https://api.example.com/v1/leads/123",
        },
      } as any;

      await middleware.onResponse?.(mockResponse);

      expect(refreshTokens).not.toHaveBeenCalled();
    });

    it("should trigger token refresh on 401 for non-skip-auth endpoints", async () => {
      const { useTokenStore } = await import("@/lib/auth/secure-tokens");

      const refreshTokens = vi.fn(async () => true);
      vi.mocked(useTokenStore.getState).mockReturnValueOnce(
        createMockTokenState({
          getAccessToken: () => "new-token",
          refreshTokens,
          tokens: {
            accessToken: "new-token",
            refreshToken: "refresh-token",
            expiresAt: Date.now() + 3600000,
            tokenType: "Bearer",
          },
          isAuthenticated: () => true,
        }),
      );

      const middleware = createAuthResponseMiddleware();
      const mockResponse = {
        response: new Response(null, { status: 401 }),
        request: {
          url: "https://api.example.com/v1/protected-endpoint",
        },
      } as any;

      await middleware.onResponse?.(mockResponse);

      expect(refreshTokens).toHaveBeenCalled();
    });

    it("should not redirect for skip-auth 401 responses", async () => {
      const { useTokenStore } = await import("@/lib/auth/secure-tokens");

      const clearTokens = vi.fn();
      const refreshTokens = vi.fn(async () => false);
      vi.mocked(useTokenStore.getState).mockReturnValueOnce(
        createMockTokenState({
          getAccessToken: () => "token",
          refreshTokens,
          clearTokens,
          isAuthenticated: () => false,
        }),
      );

      const middleware = createAuthResponseMiddleware();
      const mockResponse = {
        response: new Response(null, { status: 401 }),
        request: {
          url: "https://api.example.com/v1/leads/123/submit-info",
        },
      } as any;

      await middleware.onResponse?.(mockResponse);

      expect(clearTokens).not.toHaveBeenCalled();
    });

    it("should clear tokens and redirect on failed refresh for protected endpoints", async () => {
      const { useTokenStore } = await import("@/lib/auth/secure-tokens");

      const clearTokens = vi.fn();
      const refreshTokens = vi.fn(async () => false);
      vi.mocked(useTokenStore.getState).mockReturnValueOnce(
        createMockTokenState({
          getAccessToken: () => "token",
          refreshTokens,
          clearTokens,
          isAuthenticated: () => false,
        }),
      );

      const middleware = createAuthResponseMiddleware();
      const mockResponse = {
        response: new Response(null, { status: 401 }),
        request: {
          url: "https://api.example.com/v1/admin/settings",
        },
      } as any;

      await expect(middleware.onResponse?.(mockResponse)).rejects.toThrow(
        "Authentication failed",
      );
      expect(clearTokens).toHaveBeenCalled();
    });

    it("should not trigger refresh for 401 on /refresh endpoint itself", async () => {
      const { useTokenStore } = await import("@/lib/auth/secure-tokens");

      const refreshTokens = vi.fn();
      vi.mocked(useTokenStore.getState).mockReturnValueOnce(
        createMockTokenState({
          getAccessToken: () => "token",
          refreshTokens,
          tokens: {
            accessToken: "token",
            refreshToken: "refresh-token",
            expiresAt: Date.now() + 3600000,
            tokenType: "Bearer",
          },
          isAuthenticated: () => true,
        }),
      );

      const middleware = createAuthResponseMiddleware();
      const mockResponse = {
        response: new Response(null, { status: 401 }),
        request: {
          url: "https://api.example.com/v1/auth/refresh",
        },
      } as any;

      await middleware.onResponse?.(mockResponse);

      expect(refreshTokens).not.toHaveBeenCalled();
    });
  });
});
