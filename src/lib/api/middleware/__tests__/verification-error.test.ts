/**
 * Unit tests for verification error handler middleware
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createVerificationErrorMiddleware } from "../verification-error";
import { useAuthStore } from "@/store/use-auth-store";
import { useFormWizardStore } from "@/components/form-generation/store/use-form-wizard-store";
import {
  emitSessionInvalid,
  emitOTPRequired,
} from "@/lib/events/navigation-events";

// Mock stores after importing
vi.mock("@/store/use-auth-store");
vi.mock("@/components/form-generation/store/use-form-wizard-store");
vi.mock("@/lib/events/navigation-events");

describe("createVerificationErrorMiddleware", () => {
  let mockAuthStore: any;
  let mockWizardStore: any;
  let consoleWarnSpy: any;

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();

    // Mock auth store
    mockAuthStore = {
      clearVerificationSession: vi.fn(),
      verificationSession: {
        sessionId: "test-session-123",
        isLocked: true,
        otpStepIndex: 2,
        verifiedAt: new Date(),
        expiresAt: null,
        lastActivity: new Date(),
      },
    };

    // Mock wizard store
    mockWizardStore = {
      currentStep: 3,
      otpStepIndex: 2,
      goToStep: vi.fn(),
    };

    // Setup store mocks with proper typing
    vi.mocked(useAuthStore).getState = vi.fn().mockReturnValue(mockAuthStore);
    vi.mocked(useFormWizardStore).getState = vi
      .fn()
      .mockReturnValue(mockWizardStore);

    // Spy on console.warn
    consoleWarnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
  });

  afterEach(() => {
    consoleWarnSpy.mockRestore();
  });

  describe("Non-error responses", () => {
    it("should pass through successful responses (2xx)", async () => {
      const middleware = createVerificationErrorMiddleware();

      const mockResponse = new Response(JSON.stringify({ data: "success" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });

      const res = {
        response: mockResponse,
        request: new Request("https://api.example.com/test"),
      };

      const result = await middleware.onResponse?.(res as any);

      expect(result).toBe(mockResponse);
      expect(mockAuthStore.clearVerificationSession).not.toHaveBeenCalled();
      expect(mockWizardStore.goToStep).not.toHaveBeenCalled();
      expect(emitSessionInvalid).not.toHaveBeenCalled();
      expect(emitOTPRequired).not.toHaveBeenCalled();
    });

    it("should pass through 3xx redirect responses", async () => {
      const middleware = createVerificationErrorMiddleware();

      const mockResponse = new Response(null, {
        status: 302,
        headers: { Location: "/redirect" },
      });

      const res = {
        response: mockResponse,
        request: new Request("https://api.example.com/test"),
      };

      const result = await middleware.onResponse?.(res as any);

      expect(result).toBe(mockResponse);
      expect(mockAuthStore.clearVerificationSession).not.toHaveBeenCalled();
    });
  });

  describe("401 Unauthenticated errors", () => {
    it("should handle 401 with unauthenticated code", async () => {
      const middleware = createVerificationErrorMiddleware();

      const errorBody = {
        code: "unauthenticated",
        message: "Session expired",
      };

      const mockResponse = new Response(JSON.stringify(errorBody), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });

      const res = {
        response: mockResponse,
        request: new Request("https://api.example.com/test"),
      };

      const result = await middleware.onResponse?.(res as any);

      expect(result).toBe(mockResponse);
      expect(mockAuthStore.clearVerificationSession).toHaveBeenCalledTimes(1);
      expect(mockWizardStore.goToStep).toHaveBeenCalledWith(0);
      expect(emitSessionInvalid).toHaveBeenCalledWith("Session expired");
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        "Verification session invalid. Redirected to step 0.",
      );
    });

    it("should handle 401 without message", async () => {
      const middleware = createVerificationErrorMiddleware();

      const errorBody = {
        code: "unauthenticated",
      };

      const mockResponse = new Response(JSON.stringify(errorBody), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });

      const res = {
        response: mockResponse,
        request: new Request("https://api.example.com/test"),
      };

      await middleware.onResponse?.(res as any);

      expect(mockAuthStore.clearVerificationSession).toHaveBeenCalledTimes(1);
      expect(mockWizardStore.goToStep).toHaveBeenCalledWith(0);
      expect(emitSessionInvalid).toHaveBeenCalledWith(undefined);
    });

    it("should not handle 401 with different error code", async () => {
      const middleware = createVerificationErrorMiddleware();

      const errorBody = {
        code: "invalid_credentials",
        message: "Wrong password",
      };

      const mockResponse = new Response(JSON.stringify(errorBody), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });

      const res = {
        response: mockResponse,
        request: new Request("https://api.example.com/test"),
      };

      await middleware.onResponse?.(res as any);

      expect(mockAuthStore.clearVerificationSession).not.toHaveBeenCalled();
      expect(mockWizardStore.goToStep).not.toHaveBeenCalled();
      expect(emitSessionInvalid).not.toHaveBeenCalled();
    });

    it("should handle 401 with non-JSON response body", async () => {
      const middleware = createVerificationErrorMiddleware();

      const mockResponse = new Response("Unauthorized", {
        status: 401,
        headers: { "Content-Type": "text/plain" },
      });

      const res = {
        response: mockResponse,
        request: new Request("https://api.example.com/test"),
      };

      await middleware.onResponse?.(res as any);

      // Should not crash, but also not handle as verification error
      expect(mockAuthStore.clearVerificationSession).not.toHaveBeenCalled();
    });
  });

  describe("403 Permission Denied errors", () => {
    it("should handle 403 with permission_denied code", async () => {
      const middleware = createVerificationErrorMiddleware();

      const errorBody = {
        code: "permission_denied",
        message: "OTP verification required",
      };

      const mockResponse = new Response(JSON.stringify(errorBody), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      });

      const res = {
        response: mockResponse,
        request: new Request("https://api.example.com/test"),
      };

      const result = await middleware.onResponse?.(res as any);

      expect(result).toBe(mockResponse);
      expect(mockWizardStore.goToStep).toHaveBeenCalledWith(2);
      expect(emitOTPRequired).toHaveBeenCalledWith("OTP verification required");
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        "OTP verification required. Redirected to OTP step.",
      );
    });

    it("should handle 403 when OTP step index is null", async () => {
      const middleware = createVerificationErrorMiddleware();

      // No OTP step detected
      mockWizardStore.otpStepIndex = null;
      vi.mocked(useFormWizardStore).getState = vi
        .fn()
        .mockReturnValue(mockWizardStore);

      const errorBody = {
        code: "permission_denied",
        message: "OTP verification required",
      };

      const mockResponse = new Response(JSON.stringify(errorBody), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      });

      const res = {
        response: mockResponse,
        request: new Request("https://api.example.com/test"),
      };

      await middleware.onResponse?.(res as any);

      // Should not redirect if OTP step is not detected
      expect(mockWizardStore.goToStep).not.toHaveBeenCalled();
      // But should still emit event
      expect(emitOTPRequired).toHaveBeenCalledWith("OTP verification required");
    });

    it("should handle 403 without message", async () => {
      const middleware = createVerificationErrorMiddleware();

      const errorBody = {
        code: "permission_denied",
      };

      const mockResponse = new Response(JSON.stringify(errorBody), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      });

      const res = {
        response: mockResponse,
        request: new Request("https://api.example.com/test"),
      };

      await middleware.onResponse?.(res as any);

      expect(mockWizardStore.goToStep).toHaveBeenCalledWith(2);
      expect(emitOTPRequired).toHaveBeenCalledWith(undefined);
    });

    it("should not handle 403 with different error code", async () => {
      const middleware = createVerificationErrorMiddleware();

      const errorBody = {
        code: "forbidden",
        message: "Access denied",
      };

      const mockResponse = new Response(JSON.stringify(errorBody), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      });

      const res = {
        response: mockResponse,
        request: new Request("https://api.example.com/test"),
      };

      await middleware.onResponse?.(res as any);

      expect(mockWizardStore.goToStep).not.toHaveBeenCalled();
      expect(emitOTPRequired).not.toHaveBeenCalled();
    });
  });

  describe("Other error responses", () => {
    it("should pass through 400 Bad Request", async () => {
      const middleware = createVerificationErrorMiddleware();

      const mockResponse = new Response(
        JSON.stringify({ code: "bad_request" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );

      const res = {
        response: mockResponse,
        request: new Request("https://api.example.com/test"),
      };

      const result = await middleware.onResponse?.(res as any);

      expect(result).toBe(mockResponse);
      expect(mockAuthStore.clearVerificationSession).not.toHaveBeenCalled();
      expect(mockWizardStore.goToStep).not.toHaveBeenCalled();
    });

    it("should pass through 404 Not Found", async () => {
      const middleware = createVerificationErrorMiddleware();

      const mockResponse = new Response(JSON.stringify({ code: "not_found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });

      const res = {
        response: mockResponse,
        request: new Request("https://api.example.com/test"),
      };

      const result = await middleware.onResponse?.(res as any);

      expect(result).toBe(mockResponse);
      expect(mockAuthStore.clearVerificationSession).not.toHaveBeenCalled();
    });

    it("should pass through 500 Server Error", async () => {
      const middleware = createVerificationErrorMiddleware();

      const mockResponse = new Response(
        JSON.stringify({ code: "internal_error" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        },
      );

      const res = {
        response: mockResponse,
        request: new Request("https://api.example.com/test"),
      };

      const result = await middleware.onResponse?.(res as any);

      expect(result).toBe(mockResponse);
      expect(mockAuthStore.clearVerificationSession).not.toHaveBeenCalled();
    });
  });

  describe("Edge cases", () => {
    it("should handle response with empty body", async () => {
      const middleware = createVerificationErrorMiddleware();

      const mockResponse = new Response(null, {
        status: 401,
      });

      const res = {
        response: mockResponse,
        request: new Request("https://api.example.com/test"),
      };

      await middleware.onResponse?.(res as any);

      // Should not crash
      expect(mockAuthStore.clearVerificationSession).not.toHaveBeenCalled();
    });

    it("should handle malformed JSON response", async () => {
      const middleware = createVerificationErrorMiddleware();

      const mockResponse = new Response("{ invalid json", {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });

      const res = {
        response: mockResponse,
        request: new Request("https://api.example.com/test"),
      };

      await middleware.onResponse?.(res as any);

      // Should not crash
      expect(mockAuthStore.clearVerificationSession).not.toHaveBeenCalled();
    });

    it("should handle response body that is already consumed", async () => {
      const middleware = createVerificationErrorMiddleware();

      const errorBody = {
        code: "unauthenticated",
        message: "Session expired",
      };

      const mockResponse = new Response(JSON.stringify(errorBody), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });

      // Consume the body
      await mockResponse.json();

      const res = {
        response: mockResponse,
        request: new Request("https://api.example.com/test"),
      };

      await middleware.onResponse?.(res as any);

      // Should not crash, but won't handle the error since body is consumed
      // This is why we use clone() in the implementation
      expect(mockAuthStore.clearVerificationSession).not.toHaveBeenCalled();
    });
  });

  describe("Integration with existing error handling", () => {
    it("should not interfere with other middleware", async () => {
      const middleware = createVerificationErrorMiddleware();

      const mockResponse = new Response(
        JSON.stringify({ code: "rate_limit" }),
        {
          status: 429,
          headers: { "Content-Type": "application/json" },
        },
      );

      const res = {
        response: mockResponse,
        request: new Request("https://api.example.com/test"),
      };

      const result = await middleware.onResponse?.(res as any);

      // Should pass through without modification
      expect(result).toBe(mockResponse);
      expect(mockAuthStore.clearVerificationSession).not.toHaveBeenCalled();
      expect(mockWizardStore.goToStep).not.toHaveBeenCalled();
    });

    it("should preserve response headers", async () => {
      const middleware = createVerificationErrorMiddleware();

      const errorBody = {
        code: "unauthenticated",
        message: "Session expired",
      };

      const mockResponse = new Response(JSON.stringify(errorBody), {
        status: 401,
        headers: {
          "Content-Type": "application/json",
          "X-Request-ID": "test-123",
          "X-Custom-Header": "custom-value",
        },
      });

      const res = {
        response: mockResponse,
        request: new Request("https://api.example.com/test"),
      };

      const result = await middleware.onResponse?.(res as any);

      // Headers should be preserved
      expect(result).toBeDefined();
      if (result) {
        expect(result.headers.get("X-Request-ID")).toBe("test-123");
        expect(result.headers.get("X-Custom-Header")).toBe("custom-value");
      }
    });
  });
});
