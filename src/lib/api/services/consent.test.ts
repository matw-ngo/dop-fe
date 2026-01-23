/**
 * Consent Service Client Unit Tests
 *
 * Tests for consentClient including environment-based URL configuration,
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

describe("Consent Service Client", () => {
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

      const { consentClient } = await import("@/lib/api/services/consent");

      // In development, base URL should be localhost:3001/api/consent/v1
      expect(consentClient.BASE_URL).toContain("localhost:3001");
      expect(consentClient.BASE_URL).toContain("consent/v1");
    });

    it("should use custom URL when provided", async () => {
      process.env.NEXT_PUBLIC_API_ENVIRONMENT = "development";
      process.env.NEXT_PUBLIC_API_URL = "https://custom.api.example.com";

      vi.resetModules();
      const { consentClient } = await import("@/lib/api/services/consent");

      expect(consentClient.BASE_URL).toBe(
        "https://custom.api.example.com/consent/v1",
      );
    });

    it("should use staging URL in staging environment", async () => {
      process.env.NEXT_PUBLIC_API_ENVIRONMENT = "staging";
      process.env.NEXT_PUBLIC_API_URL = undefined;

      vi.resetModules();
      const { consentClient } = await import("@/lib/api/services/consent");

      expect(consentClient.BASE_URL).toContain("staging");
    });

    it("should use production URL in production environment", async () => {
      process.env.NEXT_PUBLIC_API_ENVIRONMENT = "production";
      process.env.NEXT_PUBLIC_API_URL = undefined;

      vi.resetModules();
      const { consentClient } = await import("@/lib/api/services/consent");

      expect(consentClient.BASE_URL).toContain("datanest.vn");
    });
  });

  describe("Middleware Stack", () => {
    it("should have auth middleware applied", async () => {
      const { consentClient } = await import("@/lib/api/services/consent");

      const authMiddleware = consentClient.middleware.find((m: Middleware) =>
        m.onRequest.toString().includes("auth"),
      );

      expect(authMiddleware).toBeDefined();
    });

    it("should have timeout middleware applied", async () => {
      const { consentClient } = await import("@/lib/api/services/consent");

      const timeoutMiddleware = consentClient.middleware.find((m: Middleware) =>
        m.onRequest.toString().includes("timeout"),
      );

      expect(timeoutMiddleware).toBeDefined();
    });

    it("should have error middleware applied", async () => {
      const { consentClient } = await import("@/lib/api/services/consent");

      const errorMiddleware = consentClient.middleware.find((m: Middleware) =>
        m.onResponse.toString().includes("error"),
      );

      expect(errorMiddleware).toBeDefined();
    });

    it("should have response middlewares for auth, timeout, and error", async () => {
      const { consentClient } = await import("@/lib/api/services/consent");

      // Count response middlewares
      const responseMiddlewares = consentClient.middleware.filter(
        (m: Middleware) => m.onResponse !== undefined,
      );

      expect(responseMiddlewares.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe("Service Export", () => {
    it("should be exported from services index", async () => {
      const { consentClient } = await import("@/lib/api/services/consent");
      const { apiServices } = await import("@/lib/api/services/index");

      expect(apiServices.consent).toBeDefined();
      expect(apiServices.consent.BASE_URL).toBe(consentClient.BASE_URL);
    });

    it("should be accessible via getService helper", async () => {
      const { getService } = await import("@/lib/api/services/index");
      const consentService = getService("consent");

      expect(consentService.BASE_URL).toContain("consent/v1");
    });
  });

  describe("Type Exports", () => {
    it("should export ConsentPaths type", async () => {
      const { ConsentPaths } = await import("@/lib/api/services/consent");

      expect(ConsentPaths).toBeDefined();
      expect(typeof ConsentPaths).toBe("object");
    });

    it("should have paths defined for consent endpoints", async () => {
      const { ConsentPaths } = await import("@/lib/api/services/consent");

      // Check for common consent endpoints
      const paths = Object.keys(ConsentPaths);

      // Should have at least some paths defined
      expect(paths.length).toBeGreaterThan(0);
    });
  });
});

describe("Consent Client API Calls", () => {
  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv, ...mockEnv };
  });

  it("should be able to make GET request to consent endpoint", async () => {
    const { consentClient } = await import("@/lib/api/services/consent");

    // Verify client has necessary methods
    expect(consentClient.GET).toBeDefined();
    expect(typeof consentClient.GET).toBe("function");
  });

  it("should be able to make POST request to consent endpoint", async () => {
    const { consentClient } = await import("@/lib/api/services/consent");

    expect(consentClient.POST).toBeDefined();
    expect(typeof consentClient.POST).toBe("function");
  });

  it("should be able to make PATCH request to consent endpoint", async () => {
    const { consentClient } = await import("@/lib/api/services/consent");

    expect(consentClient.PATCH).toBeDefined();
    expect(typeof consentClient.PATCH).toBe("function");
  });

  it("should be able to make DELETE request to consent endpoint", async () => {
    const { consentClient } = await import("@/lib/api/services/consent");

    expect(consentClient.DELETE).toBeDefined();
    expect(typeof consentClient.DELETE).toBe("function");
  });
});
