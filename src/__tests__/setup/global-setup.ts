/**
 * Global Test Setup for eKYC Testing
 *
 * This file runs once before all test suites:
 * - Initialize test database
 * - Set up test servers
 * - Configure global test utilities
 */

import { http } from "msw";
import { setupServer } from "msw/node";
import { afterAll, afterEach, beforeAll, expect, vi } from "vitest";

// Mock server for API testing
export const server = setupServer(
  // Mock VNPT eKYC API endpoints
  http.post("https://test-api.ekyc.com/api/v1/verify", async ({ request }) => {
    // Handle verification requests
    const scenario = request.headers.get("x-test-scenario") || "success";

    switch (scenario) {
      case "success":
        return Response.json({
          success: true,
          sessionId: `test-session-${Date.now()}`,
          status: "processing",
        });

      case "timeout":
        return Response.json(
          {
            error: "Request timeout",
            code: "TIMEOUT",
          },
          { status: 408 },
        );

      case "low_quality":
        return Response.json(
          {
            error: "Document quality too low",
            code: "LOW_QUALITY",
          },
          { status: 400 },
        );

      case "server_error":
        return Response.json(
          {
            error: "Internal server error",
            code: "INTERNAL_ERROR",
          },
          { status: 500 },
        );

      default:
        return Response.json({
          success: true,
          sessionId: `test-session-${Date.now()}`,
        });
    }
  }),

  http.get(
    "https://test-api.ekyc.com/api/v1/verify/:sessionId/status",
    ({ params }) => {
      const sessionId = params.sessionId as string;

      return Response.json({
        sessionId,
        status: "processing",
        progress: Math.floor(Math.random() * 100),
      });
    },
  ),

  http.get(
    "https://test-api.ekyc.com/api/v1/verify/:sessionId/result",
    ({ params, request }) => {
      const sessionId = params.sessionId as string;
      const scenario = request.headers.get("x-test-scenario") || "success";

      switch (scenario) {
        case "success":
          return Response.json({
            success: true,
            sessionId,
            personalData: {
              fullName: "NGUYEN VAN A",
              dateOfBirth: "1990-01-15",
              gender: "male",
              idNumber: "001234567890",
              address: {
                fullAddress: "123 Đường Test, Quận 1, TP.HCM",
              },
            },
            verificationData: {
              confidence: 95,
              livenessScore: 98,
              faceMatchScore: 96,
            },
          });

        case "low_confidence":
          return Response.json({
            success: true,
            sessionId,
            personalData: {
              fullName: "TRAN THI B",
              dateOfBirth: "1985-05-20",
              gender: "female",
              idNumber: "098765432123",
            },
            verificationData: {
              confidence: 65,
              livenessScore: 70,
              faceMatchScore: 68,
            },
          });

        case "failure":
          return Response.json(
            {
              success: false,
              sessionId,
              error: "Verification failed",
              code: "VERIFICATION_FAILED",
            },
            { status: 400 },
          );

        default:
          return Response.json({
            success: true,
            sessionId,
            personalData: {
              fullName: "TEST USER",
            },
            verificationData: {
              confidence: 90,
            },
          });
      }
    },
  ),

  http.delete("https://test-api.ekyc.com/api/v1/verify/:sessionId", () => {
    return Response.json({
      success: true,
      message: "Verification cancelled",
    });
  }),

  // Mock health check endpoint
  http.get("https://test-api.ekyc.com/api/v1/health", () => {
    return Response.json({
      status: "healthy",
      services: {
        vnpt: "available",
        ocr: "available",
        liveness: "available",
      },
    });
  }),

  // Mock statistics endpoint
  http.get("https://test-api.ekyc.com/api/v1/stats", () => {
    return Response.json({
      totalVerifications: 1000,
      successfulVerifications: 950,
      failedVerifications: 50,
      averageProcessingTime: 2500,
    });
  }),
);

// Start server before all tests
beforeAll(() => {
  server.listen({
    onUnhandledRequest: "warn",
  });
});

// Close server after all tests
afterAll(() => {
  server.close();
});

// Reset handlers after each test
afterEach(() => {
  server.resetHandlers();
});

// Global test utilities setup
(global as any).testUtils = {
  // Helper to set test scenario for API calls
  setAPIScenario: (scenario: string) => {
    vi.stubGlobal("fetch", (input: RequestInfo | URL, init?: RequestInit) => {
      if (typeof input === "string" && input.includes("/api/v1/verify")) {
        const headers = new Headers(init?.headers);
        headers.set("x-test-scenario", scenario);
        return global.fetch(input, { ...init, headers });
      }
      return global.fetch(input, init);
    });
  },

  // Helper to create mock FormData
  createFormData: (data: Record<string, any>) => {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      formData.append(key, value);
    });
    return formData;
  },

  // Helper to wait for specified time
  wait: (ms: number) => new Promise((resolve) => setTimeout(resolve, ms)),

  // Helper to generate test file
  createTestFile: (name: string, type: string, size: number = 1024) => {
    const buffer = new ArrayBuffer(size);
    const view = new Uint8Array(buffer);
    for (let i = 0; i < size; i++) {
      view[i] = Math.floor(Math.random() * 256);
    }
    return new File([buffer], name, { type });
  },

  // Helper to mock browser APIs
  mockGeolocation: (latitude: number, longitude: number) => {
    Object.defineProperty(navigator, "geolocation", {
      value: {
        getCurrentPosition: (success: PositionCallback) => {
          success({
            coords: { latitude, longitude },
            timestamp: Date.now(),
          } as GeolocationPosition);
        },
        watchPosition: () => 1,
      },
      writable: true,
    });
  },

  // Helper to mock media devices
  mockMediaDevices: (devices: MediaDeviceInfo[]) => {
    Object.defineProperty(navigator, "mediaDevices", {
      value: {
        enumerateDevices: () => Promise.resolve(devices),
        getUserMedia: () =>
          Promise.resolve({
            getTracks: () => [{ stop: vi.fn() }],
            active: true,
            id: "mock-stream-id",
            onaddtrack: null,
            onremovetrack: null,
            onactive: null,
            oninactive: null,
          } as unknown as MediaStream),
      },
      writable: true,
    });
  },
};

// Global error handlers
process.on("unhandledRejection", (error) => {
  console.error("Unhandled Rejection:", error);
});

process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
});

// Add custom matchers for testing
expect.extend({
  toBeValidVerificationResult(received: any) {
    const pass =
      received &&
      typeof received === "object" &&
      typeof received.success === "boolean" &&
      typeof received.sessionId === "string" &&
      typeof received.provider === "object" &&
      typeof received.personalData === "object" &&
      typeof received.verificationData === "object";

    if (pass) {
      return {
        message: () =>
          `expected ${received} not to be a valid verification result`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be a valid verification result`,
        pass: false,
      };
    }
  },

  toBeSuccessfulVerification(received: any) {
    const pass =
      received &&
      received.success === true &&
      received.personalData &&
      Object.keys(received.personalData).length > 0;

    if (pass) {
      return {
        message: () =>
          `expected ${received} not to be a successful verification`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be a successful verification`,
        pass: false,
      };
    }
  },

  toHaveValidAutofillMapping(received: any) {
    const pass =
      received &&
      typeof received === "object" &&
      Object.keys(received).length > 0 &&
      Object.values(received).every((path) => typeof path === "string");

    if (pass) {
      return {
        message: () =>
          `expected ${received} not to have a valid autofill mapping`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to have a valid autofill mapping`,
        pass: false,
      };
    }
  },
});

// Server is already exported above
