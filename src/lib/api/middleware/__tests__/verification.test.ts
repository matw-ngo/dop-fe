/**
 * Unit tests for verification interceptor
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import type { NavigationConfig } from "@/contexts/NavigationConfigContext";

// Mock stores before importing
vi.mock("@/store/use-auth-store", () => ({
  useAuthStore: {
    getState: vi.fn(),
  },
}));

vi.mock("@/components/form-generation/store/use-form-wizard-store", () => ({
  useFormWizardStore: {
    getState: vi.fn(),
  },
}));

import { createVerificationInterceptor } from "../verification";
import { useAuthStore } from "@/store/use-auth-store";
import { useFormWizardStore } from "@/components/form-generation/store/use-form-wizard-store";

describe("createVerificationInterceptor", () => {
  let mockGetConfig: () => NavigationConfig;
  let mockAuthStore: any;
  let mockWizardStore: any;

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();

    // Default config with server validation enabled
    mockGetConfig = vi.fn(() => ({
      enableSessionTimeout: false,
      sessionTimeoutMinutes: 15,
      enableBackNavigationBlock: true,
      enableUserNotifications: true,
      enableServerValidation: true,
    }));

    // Mock auth store
    mockAuthStore = {
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
    };

    // Setup store mocks
    vi.mocked(useAuthStore.getState).mockReturnValue(mockAuthStore);
    vi.mocked(useFormWizardStore.getState).mockReturnValue(mockWizardStore);
  });

  it("should not add headers when server validation is disabled", async () => {
    // Config with server validation disabled
    mockGetConfig = vi.fn(() => ({
      enableSessionTimeout: false,
      sessionTimeoutMinutes: 15,
      enableBackNavigationBlock: true,
      enableUserNotifications: true,
      enableServerValidation: false, // Disabled
    }));

    const middleware = createVerificationInterceptor(mockGetConfig);

    const mockRequest = new Request("https://api.example.com/test");
    const req = { request: mockRequest };

    const result = await middleware.onRequest?.(req as any);

    expect(result).toBe(mockRequest);
    expect(mockRequest.headers.get("X-Verification-Session-Id")).toBeNull();
  });

  it("should not add headers when no verification session exists", async () => {
    // No session
    mockAuthStore.verificationSession = null;
    vi.mocked(useAuthStore.getState).mockReturnValue(mockAuthStore);

    const middleware = createVerificationInterceptor(mockGetConfig);

    const mockRequest = new Request("https://api.example.com/test");
    const req = { request: mockRequest };

    const result = await middleware.onRequest?.(req as any);

    expect(result).toBe(mockRequest);
    expect(mockRequest.headers.get("X-Verification-Session-Id")).toBeNull();
  });

  it("should not add headers when OTP step index is null", async () => {
    // No OTP step detected
    mockWizardStore.otpStepIndex = null;
    vi.mocked(useFormWizardStore.getState).mockReturnValue(mockWizardStore);

    const middleware = createVerificationInterceptor(mockGetConfig);

    const mockRequest = new Request("https://api.example.com/test");
    const req = { request: mockRequest };

    const result = await middleware.onRequest?.(req as any);

    expect(result).toBe(mockRequest);
    expect(mockRequest.headers.get("X-Verification-Session-Id")).toBeNull();
  });

  it("should not add headers for pre-OTP steps", async () => {
    // Current step is before OTP step
    mockWizardStore.currentStep = 1;
    mockWizardStore.otpStepIndex = 2;
    vi.mocked(useFormWizardStore.getState).mockReturnValue(mockWizardStore);

    const middleware = createVerificationInterceptor(mockGetConfig);

    const mockRequest = new Request("https://api.example.com/test");
    const req = { request: mockRequest };

    const result = await middleware.onRequest?.(req as any);

    expect(result).toBe(mockRequest);
    expect(mockRequest.headers.get("X-Verification-Session-Id")).toBeNull();
  });

  it("should not add headers for OTP step itself", async () => {
    // Current step is the OTP step
    mockWizardStore.currentStep = 2;
    mockWizardStore.otpStepIndex = 2;
    vi.mocked(useFormWizardStore.getState).mockReturnValue(mockWizardStore);

    const middleware = createVerificationInterceptor(mockGetConfig);

    const mockRequest = new Request("https://api.example.com/test");
    const req = { request: mockRequest };

    const result = await middleware.onRequest?.(req as any);

    expect(result).toBe(mockRequest);
    expect(mockRequest.headers.get("X-Verification-Session-Id")).toBeNull();
  });

  it("should add headers for post-OTP steps", async () => {
    // Current step is after OTP step
    mockWizardStore.currentStep = 3;
    mockWizardStore.otpStepIndex = 2;
    vi.mocked(useFormWizardStore.getState).mockReturnValue(mockWizardStore);

    const middleware = createVerificationInterceptor(mockGetConfig);

    const mockRequest = new Request("https://api.example.com/test");
    const req = { request: mockRequest };

    const result = await middleware.onRequest?.(req as any);

    expect(result).toBe(mockRequest);
    expect(mockRequest.headers.get("X-Verification-Session-Id")).toBe(
      "test-session-123",
    );
    expect(mockRequest.headers.get("X-Verification-Step")).toBe("3");
    expect(mockRequest.headers.get("X-OTP-Step")).toBe("2");
  });

  it("should handle config getter errors gracefully", async () => {
    // Config getter throws error
    mockGetConfig = vi.fn(() => {
      throw new Error("Config not available");
    });

    const consoleWarnSpy = vi
      .spyOn(console, "warn")
      .mockImplementation(() => {});

    const middleware = createVerificationInterceptor(mockGetConfig);

    const mockRequest = new Request("https://api.example.com/test");
    const req = { request: mockRequest };

    const result = await middleware.onRequest?.(req as any);

    expect(result).toBe(mockRequest);
    expect(mockRequest.headers.get("X-Verification-Session-Id")).toBeNull();
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      expect.stringContaining("Navigation config not available"),
    );

    consoleWarnSpy.mockRestore();
  });

  it("should work with existing interceptors", async () => {
    const middleware = createVerificationInterceptor(mockGetConfig);

    const mockRequest = new Request("https://api.example.com/test");
    // Add existing header
    mockRequest.headers.set("Authorization", "Bearer token");

    const req = { request: mockRequest };

    const result = await middleware.onRequest?.(req as any);

    expect(result).toBe(mockRequest);
    // Existing header should still be there
    expect(mockRequest.headers.get("Authorization")).toBe("Bearer token");
    // New headers should be added
    expect(mockRequest.headers.get("X-Verification-Session-Id")).toBe(
      "test-session-123",
    );
  });
});
