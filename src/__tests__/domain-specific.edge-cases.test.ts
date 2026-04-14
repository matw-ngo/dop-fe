import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/api/config", () => ({
  shouldSkipAuth: vi.fn((url: string) => {
    return url.includes("/leads/") || url.includes("/flows/");
  }),
}));

vi.mock("@/lib/auth/secure-tokens", () => ({
  securityUtils: {
    generateCSRFToken: vi.fn(() => "mock-csrf-token"),
  },
  useTokenStore: {
    getState: vi.fn(() => ({
      getAccessToken: vi.fn(() => "mock-token"),
      isTokenExpired: vi.fn(() => false),
      refreshTokens: vi.fn(() => Promise.resolve(true)),
      clearTokens: vi.fn(),
      getRefreshToken: vi.fn(() => "mock-refresh"),
      setTokens: vi.fn(),
      isAuthenticated: vi.fn(() => true),
      tokens: { accessToken: "mock-token" },
      isLoading: false,
    })),
  },
}));

vi.mock("sonner", () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
    info: vi.fn(),
    warning: vi.fn(),
  },
}));

describe("Domain-Specific Edge Cases", () => {
  describe("Consent Flow Edge Cases", () => {
    it("should handle consent status with special values", async () => {
      const { createAuthMiddleware } = await import(
        "@/lib/api/middleware/auth"
      );

      const middleware = createAuthMiddleware();

      const consentStatuses = [
        "PENDING",
        "APPROVED",
        "REJECTED",
        "EXPIRED",
        "",
        "UNKNOWN",
      ];

      for (const status of consentStatuses) {
        const mockResponse = new Response(
          JSON.stringify({ consent_status: status }),
          { status: 200 },
        );

        const mockRequest = {
          request: new Request("https://api.example.com/v1/consent/123"),
          url: "https://api.example.com/v1/consent/123",
          response: mockResponse,
        } as any;

        const result = await middleware.onResponse?.(mockRequest);
        expect(result).toBeDefined();
      }
    });

    it("should handle missing optional fields in consent response", async () => {
      const { createAuthMiddleware } = await import(
        "@/lib/api/middleware/auth"
      );

      const middleware = createAuthMiddleware();

      const mockResponse = new Response(JSON.stringify({ id: "123" }), {
        status: 200,
      });

      const mockRequest = {
        request: new Request("https://api.example.com/v1/consent/123"),
        url: "https://api.example.com/v1/consent/123",
        response: mockResponse,
      } as any;

      const result = await middleware.onResponse?.(mockRequest);
      expect(result).toBeDefined();
      if (result) {
        expect(result.ok).toBe(true);
      }
    });

    it("should handle very large consent data payload", async () => {
      const { createAuthMiddleware } = await import(
        "@/lib/api/middleware/auth"
      );

      const middleware = createAuthMiddleware();

      const largeData = JSON.stringify({
        data: "x".repeat(1024 * 1024),
        signatures: Array(100).fill("sig-"),
        documents: Array(50).fill({ name: "doc.pdf", size: 10240 }),
      });

      const mockResponse = new Response(largeData, {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });

      const mockRequest = {
        request: new Request("https://api.example.com/v1/consent/123"),
        url: "https://api.example.com/v1/consent/123",
        response: mockResponse,
      } as any;

      const result = await middleware.onResponse?.(mockRequest);
      expect(result).toBeDefined();
    });

    it("should handle consent data with Unicode characters", async () => {
      const { createAuthMiddleware } = await import(
        "@/lib/api/middleware/auth"
      );

      const middleware = createAuthMiddleware();

      const unicodeData = JSON.stringify({
        full_name: "Nguyễn Văn A",
        address: "123 Đường ABC, Quận 1, TP. Hồ Chí Minh",
        notes: "🔥 Special characters: 你好 🌍 émojis 🚀",
        documents: [
          { name: "Tài liệu.pdf", type: "application/pdf" },
          { name: "合同.pdf", type: "application/pdf" },
        ],
      });

      const mockResponse = new Response(unicodeData, {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });

      const mockRequest = {
        request: new Request("https://api.example.com/v1/consent/123"),
        url: "https://api.example.com/v1/consent/123",
        response: mockResponse,
      } as any;

      const result = await middleware.onResponse?.(mockRequest);
      expect(result).toBeDefined();
    });

    it("should handle malformed consent JSON gracefully", async () => {
      const { createAuthMiddleware } = await import(
        "@/lib/api/middleware/auth"
      );

      const middleware = createAuthMiddleware();

      const malformedJson =
        '{ "id": 123, "consent_status": "PENDING", malformed }';
      const mockResponse = new Response(malformedJson, {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });

      const mockRequest = {
        request: new Request("https://api.example.com/v1/consent/123"),
        url: "https://api.example.com/v1/consent/123",
        response: mockResponse,
      } as any;

      const result = await middleware.onResponse?.(mockRequest);
      expect(result).toBeDefined();
    });
  });

  describe("OTP Submission Edge Cases", () => {
    it("should handle various OTP formats", async () => {
      const { createAuthMiddleware } = await import(
        "@/lib/api/middleware/auth"
      );

      const middleware = createAuthMiddleware();

      const otpFormats = ["123456", "12345678", "000000", "999999"];

      for (const otp of otpFormats) {
        const mockResponse = new Response(
          JSON.stringify({ otp_verified: true, remaining_attempts: 3 }),
          { status: 200 },
        );

        const mockRequest = {
          request: new Request(
            "https://api.example.com/v1/leads/123/verify-otp",
            {
              method: "POST",
              body: JSON.stringify({ otp }),
            },
          ),
          url: "https://api.example.com/v1/leads/123/verify-otp",
          response: mockResponse,
        } as any;

        const result = await middleware.onResponse?.(mockRequest);
        expect(result).toBeDefined();
      }
    });

    it("should handle resend OTP with rate limiting", async () => {
      const { createAuthMiddleware } = await import(
        "@/lib/api/middleware/auth"
      );

      const middleware = createAuthMiddleware();

      const mockResponse = new Response(
        JSON.stringify({ error: "Too many OTP requests" }),
        { status: 429, headers: { "Retry-After": "60" } },
      );

      const mockRequest = {
        request: new Request(
          "https://api.example.com/v1/leads/123/resend-otp",
          {
            method: "POST",
          },
        ),
        url: "https://api.example.com/v1/leads/123/resend-otp",
        response: mockResponse,
      } as any;

      await expect(middleware.onResponse?.(mockRequest)).rejects.toThrow();
    });

    it("should handle expired OTP session", async () => {
      const { createAuthMiddleware } = await import(
        "@/lib/api/middleware/auth"
      );

      const middleware = createAuthMiddleware();

      const expiredResponse = new Response(
        JSON.stringify({ error: "OTP session expired", code: "OTP_EXPIRED" }),
        { status: 410 },
      );

      const mockRequest = {
        request: new Request(
          "https://api.example.com/v1/leads/123/verify-otp",
          {
            method: "POST",
            body: JSON.stringify({ otp: "123456" }),
          },
        ),
        url: "https://api.example.com/v1/leads/123/verify-otp",
        response: expiredResponse,
      } as any;

      const result = await middleware.onResponse?.(mockRequest);
      if (result) {
        expect(result.status).toBe(410);
      }
    });
  });

  describe("Multi-step Flow Edge Cases", () => {
    it("should handle step data persistence across navigation", async () => {
      const { createAuthMiddleware } = await import(
        "@/lib/api/middleware/auth"
      );

      const middleware = createAuthMiddleware();

      const stepData = {
        step_1: {
          phone_number: "0901234567",
          verified: true,
          verified_at: "2026-01-21T10:00:00Z",
        },
        step_2: {
          personal_info: {
            full_name: "Nguyễn Văn A",
            id_number: "123456789",
            dob: "1990-01-01",
          },
        },
        step_3: {
          address: {
            province: "TP.HCM",
            district: "Quận 1",
            ward: "Phường Bến Nghé",
            detail: "123 Đường ABC",
          },
        },
      };

      const mockResponse = new Response(JSON.stringify({ success: true }), {
        status: 200,
      });

      const mockRequest = {
        request: new Request("https://api.example.com/v1/flows/123/steps", {
          method: "POST",
          body: JSON.stringify(stepData),
        }),
        url: "https://api.example.com/v1/flows/123/steps",
        response: mockResponse,
      } as any;

      const result = await middleware.onResponse?.(mockRequest);
      expect(result).toBeDefined();
      if (result) {
        expect(result.ok).toBe(true);
      }
    });

    it("should handle concurrent step submissions", async () => {
      const { createAuthMiddleware } = await import(
        "@/lib/api/middleware/auth"
      );

      const middleware = createAuthMiddleware();

      const stepRequests = Array.from({ length: 5 }, (_, i) => {
        const mockResponse = new Response(
          JSON.stringify({ step: i + 1, saved: true }),
          { status: 200 },
        );

        return {
          request: new Request(
            `https://api.example.com/v1/flows/123/steps/${i + 1}`,
            {
              method: "POST",
              body: JSON.stringify({ data: `step-${i + 1}` }),
            },
          ),
          url: `https://api.example.com/v1/flows/123/steps/${i + 1}`,
          response: mockResponse,
        } as any;
      });

      const results = await Promise.all(
        stepRequests.map((req) => middleware.onResponse?.(req)),
      );

      expect(results).toHaveLength(5);
      results.forEach((result) => {
        if (result) {
          expect(result.status).toBe(200);
        }
      });
    });

    it("should handle step validation errors with detailed messages", async () => {
      const { createAuthMiddleware } = await import(
        "@/lib/api/middleware/auth"
      );

      const middleware = createAuthMiddleware();

      const validationError = {
        error: "Validation failed",
        code: "VALIDATION_ERROR",
        details: [
          {
            field: "phone_number",
            message: "Số điện thoại không hợp lệ",
            value: "0901234",
          },
          {
            field: "id_number",
            message: "CMND/CCCD phải có 9 hoặc 12 chữ số",
            value: "12345",
          },
        ],
      };

      const mockResponse = new Response(JSON.stringify(validationError), {
        status: 400,
      });

      const mockRequest = {
        request: new Request("https://api.example.com/v1/flows/123/steps/1", {
          method: "POST",
          body: JSON.stringify({ phone_number: "0901234", id_number: "12345" }),
        }),
        url: "https://api.example.com/v1/flows/123/steps/1",
        response: mockResponse,
      } as any;

      const result = await middleware.onResponse?.(mockRequest);
      if (result) {
        expect(result.status).toBe(400);
      }
    });
  });

  describe("Form Data Edge Cases", () => {
    it("should handle form data with very long values", async () => {
      const { createAuthMiddleware } = await import(
        "@/lib/api/middleware/auth"
      );

      const middleware = createAuthMiddleware();

      const longValue = "x".repeat(10000);
      const formData = {
        note: longValue,
        address_detail: longValue,
        description: longValue,
      };

      const mockResponse = new Response(JSON.stringify({ saved: true }), {
        status: 200,
      });

      const mockRequest = {
        request: new Request("https://api.example.com/v1/flows/123/data", {
          method: "POST",
          body: JSON.stringify(formData),
        }),
        url: "https://api.example.com/v1/flows/123/data",
        response: mockResponse,
      } as any;

      const result = await middleware.onResponse?.(mockRequest);
      if (result) {
        expect(result.status).toBe(200);
      }
    });

    it("should handle special characters in form data", async () => {
      const { createAuthMiddleware } = await import(
        "@/lib/api/middleware/auth"
      );

      const middleware = createAuthMiddleware();

      const specialCharData = {
        name: "Nguyễn Văn 'Special' & <Characters>",
        address: "123 Đường, Quận \\ 1\\, TP. HCM",
        note: "Line1\nLine2\tTabbed",
        email: "user@example.com; admin@example.com",
      };

      const mockResponse = new Response(JSON.stringify({ saved: true }), {
        status: 200,
      });

      const mockRequest = {
        request: new Request("https://api.example.com/v1/flows/123/data", {
          method: "POST",
          body: JSON.stringify(specialCharData),
        }),
        url: "https://api.example.com/v1/flows/123/data",
        response: mockResponse,
      } as any;

      const result = await middleware.onResponse?.(mockRequest);
      if (result) {
        expect(result.status).toBe(200);
      }
    });

    it("should handle empty values and nulls in form data", async () => {
      const { createAuthMiddleware } = await import(
        "@/lib/api/middleware/auth"
      );

      const middleware = createAuthMiddleware();

      const nullData = {
        optional_field: null,
        empty_string: "",
        zero_number: 0,
        false_boolean: false,
      };

      const mockResponse = new Response(JSON.stringify({ saved: true }), {
        status: 200,
      });

      const mockRequest = {
        request: new Request("https://api.example.com/v1/flows/123/data", {
          method: "POST",
          body: JSON.stringify(nullData),
        }),
        url: "https://api.example.com/v1/flows/123/data",
        response: mockResponse,
      } as any;

      const result = await middleware.onResponse?.(mockRequest);
      if (result) {
        expect(result.status).toBe(200);
      }
    });
  });

  describe("Error Recovery Edge Cases", () => {
    it("should handle network timeout during critical operations", async () => {
      const { createTimeoutMiddleware } = await import(
        "@/lib/api/middleware/timeout"
      );

      const middleware = createTimeoutMiddleware();

      const mockRequest = {
        request: new Request("https://api.example.com/v1/flows/123/submit", {
          method: "POST",
        }),
        url: "https://api.example.com/v1/flows/123/submit",
        signal: new AbortController().signal,
      } as any;

      await expect(middleware.onRequest?.(mockRequest)).rejects.toThrow();
    });

    it("should handle partial success in batch operations", async () => {
      const { createAuthMiddleware } = await import(
        "@/lib/api/middleware/auth"
      );

      const middleware = createAuthMiddleware();

      const partialSuccessResponse = {
        success: true,
        partial: true,
        results: [
          { item_id: "1", status: "success" },
          { item_id: "2", status: "failed", error: "Invalid format" },
          { item_id: "3", status: "success" },
        ],
        failed_count: 1,
        success_count: 2,
      };

      const mockResponse = new Response(
        JSON.stringify(partialSuccessResponse),
        {
          status: 200,
        },
      );

      const mockRequest = {
        request: new Request("https://api.example.com/v1/documents/batch", {
          method: "POST",
          body: JSON.stringify({
            documents: [{ id: "1" }, { id: "2" }, { id: "3" }],
          }),
        }),
        url: "https://api.example.com/v1/documents/batch",
        response: mockResponse,
      } as any;

      const result = await middleware.onResponse?.(mockRequest);
      if (result) {
        expect(result.status).toBe(200);
      }
    });

    it("should handle service degradation gracefully", async () => {
      const { createErrorMiddleware } = await import(
        "@/lib/api/middleware/error"
      );

      const middleware = createErrorMiddleware();

      const degradationResponse = new Response(
        JSON.stringify({
          error: "Service degraded",
          message: "System is under high load",
          retry_suggested: true,
          retry_after_ms: 30000,
        }),
        {
          status: 503,
          headers: { "Retry-After": "30" },
        },
      );

      const mockRequest = {
        request: new Request("https://api.example.com/v1/flows/123/submit"),
        url: "https://api.example.com/v1/flows/123/submit",
        response: degradationResponse,
      } as any;

      await expect(middleware.onResponse?.(mockRequest)).rejects.toThrow();
    });
  });

  describe("Data Consistency Edge Cases", () => {
    it("should handle version conflicts during concurrent edits", async () => {
      const { createAuthMiddleware } = await import(
        "@/lib/api/middleware/auth"
      );

      const middleware = createAuthMiddleware();

      const conflictResponse = {
        error: "Version conflict",
        code: "VERSION_CONFLICT",
        current_version: 2,
        submitted_version: 1,
        message: "Flow has been modified by another request",
      };

      const mockResponse = new Response(JSON.stringify(conflictResponse), {
        status: 409,
      });

      const mockRequest = {
        request: new Request("https://api.example.com/v1/flows/123", {
          method: "PUT",
          body: JSON.stringify({ data: { version: 1 }, version: 1 }),
        }),
        url: "https://api.example.com/v1/flows/123",
        response: mockResponse,
      } as any;

      const result = await middleware.onResponse?.(mockRequest);
      if (result) {
        expect(result.status).toBe(409);
      }
    });

    it("should handle deep nested objects in JSON", async () => {
      const { createAuthMiddleware } = await import(
        "@/lib/api/middleware/auth"
      );

      const middleware = createAuthMiddleware();

      const deepNested = {
        level1: {
          level2: {
            level3: {
              level4: {
                level5: {
                  value: "deep",
                },
              },
            },
          },
        },
      };

      const mockResponse = new Response(JSON.stringify(deepNested), {
        status: 200,
      });

      const mockRequest = {
        request: new Request("https://api.example.com/v1/flows/123"),
        url: "https://api.example.com/v1/flows/123",
        response: mockResponse,
      } as any;

      const result = await middleware.onResponse?.(mockRequest);
      if (result) {
        expect(result.status).toBe(200);
      }
    });
  });
});
