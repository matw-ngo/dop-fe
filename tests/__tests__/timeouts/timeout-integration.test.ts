/**
 * Configurable API Timeout Integration Tests
 *
 * Integration tests for the timeout configuration system.
 * Tests the full flow from configuration to API calls.
 *
 * @feature 002-configurable-api-timeout
 * @module timeout-integration-tests
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "@jest/globals";
import { createTimeoutController } from "@/lib/api/timeouts/abort-timeout";
import { parseTimeoutConfig } from "@/lib/api/timeouts/config-parser";
import { getDefaultEndpointConfig } from "@/lib/api/timeouts/endpoint-config";
import { resolveTimeout } from "@/lib/api/timeouts/resolver";
import { useTimeoutStore } from "@/lib/api/timeouts/timeout-store";
import {
  extractServiceName,
  normalizeEndpointPath,
} from "@/lib/api/timeouts/utils";

describe("Timeout Integration Tests", () => {
  beforeEach(() => {
    // Reset store before each test
    useTimeoutStore.getState().setConfig({
      global: 30000,
      maxRetries: 3,
      retryDelay: 1000,
    });

    // Clear all environment variables
    delete process.env.NEXT_PUBLIC_API_TIMEOUT_GLOBAL;
    delete process.env.NEXT_PUBLIC_API_TIMEOUT_SERVICE_DOP;
    delete process.env.NEXT_PUBLIC_API_TIMEOUT_SERVICE_EKYC;
    delete process.env.NEXT_PUBLIC_API_TIMEOUT_ENDPOINT_LEADS_SUBMIT_OTP;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("T038: Default Configuration", () => {
    it("should use default 30-second global timeout when no config is set", () => {
      const config = parseTimeoutConfig();
      expect(config.global).toBe(30000);
      expect(config.maxRetries).toBe(3);
      expect(config.retryDelay).toBe(1000);
    });

    it("should load default endpoint configuration", () => {
      const defaultConfig = getDefaultEndpointConfig();

      expect(defaultConfig.global).toBe(30000);
      expect(defaultConfig.services?.DOP).toBe(30000);
      expect(defaultConfig.services?.EKYC).toBe(60000);
      expect(defaultConfig.services?.CONSENT).toBe(20000);
      expect(defaultConfig.endpoints?.LEADS_SUBMIT_OTP).toBe(15000);
      expect(defaultConfig.endpoints?.EKYC_SUBMIT).toBe(120000);
    });

    it("should resolve to global timeout for unknown endpoints", () => {
      const config = useTimeoutStore.getState().config;
      const resolution = resolveTimeout("/unknown/endpoint", config);

      expect(resolution.timeout).toBe(30000);
      expect(resolution.source).toBe("global");
    });
  });

  describe("T039: Environment Variable Integration", () => {
    it("should parse global timeout from environment variable", () => {
      process.env.NEXT_PUBLIC_API_TIMEOUT_GLOBAL = "45000";

      const config = parseTimeoutConfig();
      expect(config.global).toBe(45000);
    });

    it("should parse service timeout from environment variable", () => {
      process.env.NEXT_PUBLIC_API_TIMEOUT_SERVICE_EKYC = "90000";

      const config = parseTimeoutConfig();
      expect(config.services?.EKYC).toBe(90000);
    });

    it("should parse endpoint timeout from environment variable", () => {
      process.env.NEXT_PUBLIC_API_TIMEOUT_ENDPOINT_LEADS_SUBMIT_OTP = "20000";

      const config = parseTimeoutConfig();
      expect(config.endpoints?.LEADS_SUBMIT_OTP).toBe(20000);
    });

    it("should parse retry configuration from environment variables", () => {
      process.env.NEXT_PUBLIC_API_MAX_RETRIES = "5";
      process.env.NEXT_PUBLIC_API_RETRY_DELAY_MS = "2000";

      const config = parseTimeoutConfig();
      expect(config.maxRetries).toBe(5);
      expect(config.retryDelay).toBe(2000);
    });
  });

  describe("Timeout Resolution Cascade", () => {
    it("should prioritize endpoint timeout over service and global", () => {
      const config = {
        global: 30000,
        services: { EKYC: 60000 },
        endpoints: { EKYC_CONFIG: 20000 },
        maxRetries: 3,
        retryDelay: 1000,
      };

      const resolution = resolveTimeout("/ekyc/config", config);
      expect(resolution.timeout).toBe(20000);
      expect(resolution.source).toBe("endpoint");
    });

    it("should prioritize service timeout over global", () => {
      const config = {
        global: 30000,
        services: { EKYC: 60000 },
        maxRetries: 3,
        retryDelay: 1000,
      };

      const resolution = resolveTimeout("/ekyc/unknown", config);
      expect(resolution.timeout).toBe(60000);
      expect(resolution.source).toBe("service");
    });

    it("should fallback to global timeout when no specific config", () => {
      const config = {
        global: 30000,
        services: { DOP: 25000 },
        maxRetries: 3,
        retryDelay: 1000,
      };

      const resolution = resolveTimeout("/unknown/path", config);
      expect(resolution.timeout).toBe(30000);
      expect(resolution.source).toBe("global");
    });
  });

  describe("AbortController Integration", () => {
    it("should create timeout controller that aborts after timeout", async () => {
      const timeout = 100; // 100ms
      const { signal, controller } = createTimeoutController(timeout);

      expect(signal.aborted).toBe(false);

      await new Promise((resolve) => setTimeout(resolve, 150));

      expect(signal.aborted).toBe(true);
    });

    it("should allow manual abort before timeout", () => {
      const timeout = 5000; // 5 seconds
      const { signal, controller } = createTimeoutController(timeout);

      expect(signal.aborted).toBe(false);

      controller.abort();

      expect(signal.aborted).toBe(true);
    });
  });

  describe("Store Integration", () => {
    it("should update config in store", () => {
      const newConfig = {
        global: 45000,
        services: { TEST: 10000 },
        maxRetries: 5,
        retryDelay: 2000,
      };

      useTimeoutStore.getState().setConfig(newConfig);

      const storeConfig = useTimeoutStore.getState().config;
      expect(storeConfig.global).toBe(45000);
      expect(storeConfig.maxRetries).toBe(5);
    });

    it("should track active requests", () => {
      const context = {
        id: "test-request-1",
        endpoint: "/test",
        timeout: 10000,
        controller: new AbortController(),
        startTime: Date.now(),
        attempt: 0,
        retryable: true,
        userCancelled: false,
      };

      useTimeoutStore.getState().addRequest(context);

      expect(useTimeoutStore.getState().getActiveRequestCount()).toBe(1);
      expect(useTimeoutStore.getState().isRequestActive("test-request-1")).toBe(
        true,
      );

      useTimeoutStore.getState().removeRequest("test-request-1");

      expect(useTimeoutStore.getState().getActiveRequestCount()).toBe(0);
    });

    it("should cancel request by ID", () => {
      const controller = new AbortController();
      const abortSpy = vi.spyOn(controller, "abort");

      const context = {
        id: "test-request-2",
        endpoint: "/test",
        timeout: 10000,
        controller,
        startTime: Date.now(),
        attempt: 0,
        retryable: true,
        userCancelled: false,
      };

      useTimeoutStore.getState().addRequest(context);
      useTimeoutStore.getState().cancelRequest("test-request-2", "USER_CANCEL");

      expect(abortSpy).toHaveBeenCalled();
      expect(useTimeoutStore.getState().getActiveRequestCount()).toBe(0);
    });
  });

  describe("Path Normalization", () => {
    it("should normalize endpoint paths correctly", () => {
      expect(normalizeEndpointPath("/leads")).toBe("LEADS");
      expect(normalizeEndpointPath("/leads/123/submit-otp")).toBe(
        "LEADS_SUBMIT_OTP",
      );
      expect(normalizeEndpointPath("/api/v1/users/:id/profile")).toBe(
        "API_V1_USERS_PROFILE",
      );
      expect(normalizeEndpointPath("/ekyc/config")).toBe("EKYC_CONFIG");
    });
  });

  describe("Service Extraction", () => {
    it("should extract service name from endpoint", () => {
      expect(extractServiceName("/leads/123")).toBe("LEADS");
      expect(extractServiceName("/ekyc/config")).toBe("EKYC");
      expect(extractServiceName("/consent/create")).toBe("CONSENT");
      expect(extractServiceName("/unknown/path")).toBe("UNKNOWN");
    });
  });

  describe("Service-Specific Timeouts", () => {
    beforeEach(() => {
      useTimeoutStore.getState().setConfig({
        global: 30000,
        services: {
          DOP: 30000,
          EKYC: 60000,
          CONSENT: 20000,
          PAYMENT: 45000,
        },
        maxRetries: 3,
        retryDelay: 1000,
      });
    });

    it("should use EKYC service timeout for eKYC endpoints", () => {
      const config = useTimeoutStore.getState().config;
      const resolution = resolveTimeout("/ekyc/unknown", config);

      expect(resolution.timeout).toBe(60000);
      expect(resolution.source).toBe("service");
      expect(resolution.serviceKey).toBe("EKYC");
    });

    it("should use Consent service timeout for consent endpoints", () => {
      const config = useTimeoutStore.getState().config;
      const resolution = resolveTimeout("/consent/create", config);

      expect(resolution.timeout).toBe(20000);
      expect(resolution.source).toBe("service");
    });

    it("should use Payment service timeout for payment endpoints", () => {
      const config = useTimeoutStore.getState().config;
      const resolution = resolveTimeout("/payment/create", config);

      expect(resolution.timeout).toBe(45000);
      expect(resolution.source).toBe("service");
    });
  });

  describe("Endpoint-Specific Timeouts", () => {
    beforeEach(() => {
      useTimeoutStore.getState().setConfig({
        global: 30000,
        services: { EKYC: 60000 },
        endpoints: {
          LEADS_SUBMIT_OTP: 15000,
          EKYC_SUBMIT: 120000,
          EKYC_CONFIG: 20000,
        },
        maxRetries: 3,
        retryDelay: 1000,
      });
    });

    it("should use endpoint-specific timeout for leads OTP submission", () => {
      const config = useTimeoutStore.getState().config;
      const resolution = resolveTimeout("/leads/123/submit-otp", config);

      expect(resolution.timeout).toBe(15000);
      expect(resolution.source).toBe("endpoint");
    });

    it("should use endpoint-specific timeout for eKYC submit", () => {
      const config = useTimeoutStore.getState().config;
      const resolution = resolveTimeout("/ekyc/submit", config);

      expect(resolution.timeout).toBe(120000);
      expect(resolution.source).toBe("endpoint");
    });

    it("should use endpoint-specific timeout over service timeout", () => {
      const config = useTimeoutStore.getState().config;
      const resolution = resolveTimeout("/ekyc/config", config);

      // EKYC_CONFIG (20000) should override EKYC service (60000)
      expect(resolution.timeout).toBe(20000);
      expect(resolution.source).toBe("endpoint");
    });
  });

  describe("Special Endpoint Types", () => {
    it("should identify file upload endpoints", () => {
      const {
        getSpecialEndpointType,
      } = require("@/lib/api/timeouts/endpoint-config");

      expect(getSpecialEndpointType("EKYC_SUBMIT")).toBe("FILE_UPLOAD");
      expect(getSpecialEndpointType("DOCUMENT_UPLOAD")).toBe("FILE_UPLOAD");
    });

    it("should identify streaming endpoints", () => {
      const {
        getSpecialEndpointType,
      } = require("@/lib/api/timeouts/endpoint-config");

      expect(getSpecialEndpointType("EKYC_STREAM")).toBe("STREAMING");
      expect(getSpecialEndpointType("REALTIME_UPDATES")).toBe("STREAMING");
    });

    it("should identify batch processing endpoints", () => {
      const {
        getSpecialEndpointType,
      } = require("@/lib/api/timeouts/endpoint-config");

      expect(getSpecialEndpointType("EXPORT_DATA")).toBe("BATCH");
      expect(getSpecialEndpointType("BATCH_PROCESS")).toBe("BATCH");
    });

    it("should return undefined for normal endpoints", () => {
      const {
        getSpecialEndpointType,
      } = require("@/lib/api/timeouts/endpoint-config");

      expect(getSpecialEndpointType("LEADS")).toBeUndefined();
      expect(getSpecialEndpointType("EKYC_CONFIG")).toBeUndefined();
    });
  });

  describe("Real-World Scenarios", () => {
    it("should handle lead submission with appropriate timeout", () => {
      const config = {
        global: 30000,
        services: { LEADS: 25000 },
        endpoints: { LEADS_CREATE: 20000 },
        maxRetries: 3,
        retryDelay: 1000,
      };

      const resolution = resolveTimeout("/leads/create", config);
      expect(resolution.timeout).toBe(20000);
    });

    it("should handle eKYC document upload with long timeout", () => {
      const config = {
        global: 30000,
        services: { EKYC: 60000 },
        endpoints: { EKYC_SUBMIT: 120000 },
        maxRetries: 2,
        retryDelay: 2000,
      };

      const resolution = resolveTimeout("/ekyc/submit", config);
      expect(resolution.timeout).toBe(120000); // 2 minutes for document upload
    });

    it("should handle payment processing with moderate timeout", () => {
      const config = {
        global: 30000,
        services: { PAYMENT: 45000 },
        maxRetries: 3,
        retryDelay: 1500,
      };

      const resolution = resolveTimeout("/payment/create", config);
      expect(resolution.timeout).toBe(45000); // 45 seconds for payment gateway
    });

    it("should handle authentication with short timeout", () => {
      const config = {
        global: 30000,
        services: { AUTH: 15000 },
        maxRetries: 2,
        retryDelay: 500,
      };

      const resolution = resolveTimeout("/auth/login", config);
      expect(resolution.timeout).toBe(15000); // 15 seconds for auth
    });
  });
});
