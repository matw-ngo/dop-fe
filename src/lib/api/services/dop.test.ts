/**
 * DOP Service Client Unit Tests
 *
 * Tests for dopClient including environment-based URL configuration,
 * middleware application, and API call patterns.
 */

import type { Middleware } from "openapi-fetch";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Mock environment
const originalEnv = process.env;

const mockEnv = {
  NEXT_PUBLIC_API_ENVIRONMENT: "development",
  NEXT_PUBLIC_API_URL: undefined,
};

describe("DOP Service Client", () => {
  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv, ...mockEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.resetAllMocks();
  });

  describe("Environment Configuration", () => {
    it("should use development base URL in development environment", async () => {
      process.env.NEXT_PUBLIC_API_ENVIRONMENT = "development";
      process.env.NEXT_PUBLIC_API_URL = undefined;

      const { dopClient } = await import("@/lib/api/services/dop");

      // In development, base URL should be localhost:3001/api/v1
      expect(dopClient.BASE_URL).toContain("localhost:3001");
      expect(dopClient.BASE_URL).toContain("/v1");
    });

    it("should use custom URL when provided", async () => {
      process.env.NEXT_PUBLIC_API_ENVIRONMENT = "development";
      process.env.NEXT_PUBLIC_API_URL = "https://custom.api.example.com";

      vi.resetModules();
      const { dopClient } = await import("@/lib/api/services/dop");

      expect(dopClient.BASE_URL).toBe("https://custom.api.example.com/v1");
    });

    it("should use staging URL in staging environment", async () => {
      process.env.NEXT_PUBLIC_API_ENVIRONMENT = "staging";
      process.env.NEXT_PUBLIC_API_URL = undefined;

      vi.resetModules();
      const { dopClient } = await import("@/lib/api/services/dop");

      expect(dopClient.BASE_URL).toContain("staging");
    });

    it("should use production URL in production environment", async () => {
      process.env.NEXT_PUBLIC_API_ENVIRONMENT = "production";
      process.env.NEXT_PUBLIC_API_URL = undefined;

      vi.resetModules();
      const { dopClient } = await import("@/lib/api/services/dop");

      expect(dopClient.BASE_URL).toContain("datanest.vn");
    });
  });

  describe("Middleware Stack", () => {
    it("should have auth middleware applied", async () => {
      const { dopClient } = await import("@/lib/api/services/dop");

      const authMiddleware = dopClient.middleware.find((m: Middleware) =>
        m.onRequest.toString().includes("auth"),
      );

      expect(authMiddleware).toBeDefined();
    });

    it("should have timeout middleware applied", async () => {
      const { dopClient } = await import("@/lib/api/services/dop");

      const timeoutMiddleware = dopClient.middleware.find((m: Middleware) =>
        m.onRequest.toString().includes("timeout"),
      );

      expect(timeoutMiddleware).toBeDefined();
    });

    it("should have error middleware applied", async () => {
      const { dopClient } = await import("@/lib/api/services/dop");

      const errorMiddleware = dopClient.middleware.find((m: Middleware) =>
        m.onResponse.toString().includes("error"),
      );

      expect(errorMiddleware).toBeDefined();
    });

    it("should have response middlewares for auth, timeout, and error", async () => {
      const { dopClient } = await import("@/lib/api/services/dop");

      // Count response middlewares
      const responseMiddlewares = dopClient.middleware.filter(
        (m: Middleware) => m.onResponse !== undefined,
      );

      expect(responseMiddlewares.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe("Service Export", () => {
    it("should be exported from services index", async () => {
      const { dopClient } = await import("@/lib/api/services/dop");
      const { apiServices } = await import("@/lib/api/services/index");

      expect(apiServices.dop).toBeDefined();
      expect(apiServices.dop.BASE_URL).toBe(dopClient.BASE_URL);
    });

    it("should be accessible via getService helper", async () => {
      const { getService } = await import("@/lib/api/services/index");
      const dopService = getService("dop");

      expect(dopService.BASE_URL).toContain("/v1");
    });
  });

  describe("Type Exports", () => {
    it("should export DopPaths type", async () => {
      const { DopPaths } = await import("@/lib/api/services/dop");

      expect(DopPaths).toBeDefined();
      expect(typeof DopPaths).toBe("object");
    });

    it("should have paths defined for DOP endpoints", async () => {
      const { DopPaths } = await import("@/lib/api/services/dop");

      // Check for common DOP endpoints
      const paths = Object.keys(DopPaths);

      // Should have at least some paths defined
      expect(paths.length).toBeGreaterThan(0);

      // Check for expected endpoints
      expect(paths).toContain("/v1/auth");
      expect(paths).toContain("/v1/leads");
    });
  });
});

describe("DOP Client API Calls", () => {
  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv, ...mockEnv };
  });

  it("should be able to make GET request to DOP endpoint", async () => {
    const { dopClient } = await import("@/lib/api/services/dop");

    expect(dopClient.GET).toBeDefined();
    expect(typeof dopClient.GET).toBe("function");
  });

  it("should be able to make POST request to DOP endpoint", async () => {
    const { dopClient } = await import("@/lib/api/services/dop");

    expect(dopClient.POST).toBeDefined();
    expect(typeof dopClient.POST).toBe("function");
  });

  it("should be able to make PATCH request to DOP endpoint", async () => {
    const { dopClient } = await import("@/lib/api/services/dop");

    expect(dopClient.PATCH).toBeDefined();
    expect(typeof dopClient.PATCH).toBe("function");
  });

  it("should be able to make DELETE request to DOP endpoint", async () => {
    const { dopClient } = await import("@/lib/api/services/dop");

    expect(dopClient.DELETE).toBeDefined();
    expect(typeof dopClient.DELETE).toBe("function");
  });
});

describe("DOP Client - Auth Endpoints", () => {
  it("should have auth-related endpoints", async () => {
    const { DopPaths } = await import("@/lib/api/services/dop");

    const paths = Object.keys(DopPaths);

    // Check for auth endpoints
    expect(paths.some((p) => p.includes("/auth"))).toBe(true);
  });

  it("should have leads-related endpoints", async () => {
    const { DopPaths } = await import("@/lib/api/services/dop");

    const paths = Object.keys(DopPaths);

    // Check for leads endpoints
    expect(paths.some((p) => p.includes("/leads"))).toBe(true);
  });

  it("should have OTP-related endpoints", async () => {
    const { DopPaths } = await import("@/lib/api/services/dop");

    const paths = Object.keys(DopPaths);

    // Check for OTP endpoints
    expect(paths.some((p) => p.includes("/otp"))).toBe(true);
  });
});
