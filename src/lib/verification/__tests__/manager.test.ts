/**
 * Verification Manager Unit Tests
 *
 * This test suite covers the verification manager including:
 * - Provider registration and retrieval
 * - Verification flow orchestration
 * - Error handling for missing providers
 * - Singleton pattern behavior
 * - Concurrent verification handling
 * - Statistics tracking
 * - Session management
 * - Health checks
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { VerificationManager } from "../manager";
import type {
  ProviderConfig,
  VerificationOptions,
  VerificationProvider,
  VerificationResult,
  VerificationSession,
} from "../types";
import { VerificationStatus } from "../types";

// Test timeout for async operations
const TEST_TIMEOUT = 10000;

// Mock provider implementation for testing
class MockVerificationProvider implements VerificationProvider {
  readonly name: string;
  readonly version: string;
  readonly capabilities = {
    supportedDocuments: ["CCCD", "PASSPORT"],
    supportedFlows: ["DOCUMENT_TO_FACE"],
    hasLivenessDetection: true,
    hasFaceComparison: true,
    hasAuthenticityCheck: true,
  };

  private shouldFail = false;
  private delay = 0;

  constructor(
    name: string,
    options: { shouldFail?: boolean; delay?: number } = {},
  ) {
    this.name = name;
    this.version = "1.0.0";
    this.shouldFail = options.shouldFail || false;
    this.delay = options.delay || 0;
  }

  async initialize(_config: ProviderConfig): Promise<void> {
    if (this.delay) {
      await new Promise((resolve) => setTimeout(resolve, this.delay));
    }
    if (this.shouldFail) {
      throw new Error(`Mock provider ${this.name} failed to initialize`);
    }
  }

  async startVerification(
    options: VerificationOptions,
  ): Promise<VerificationSession> {
    if (this.delay) {
      await new Promise((resolve) => setTimeout(resolve, this.delay));
    }
    if (this.shouldFail) {
      throw new Error(
        `Mock provider ${this.name} failed to start verification`,
      );
    }

    return {
      id: `${this.name}-session-${Date.now()}`,
      status: "processing" as VerificationStatus,
      provider: this.name,
      startedAt: new Date().toISOString(),
      metadata: options,
    };
  }

  async getStatus(_sessionId: string): Promise<VerificationStatus> {
    if (this.shouldFail) {
      throw new Error(`Mock provider ${this.name} failed to get status`);
    }
    return VerificationStatus.PROCESSING;
  }

  async getResult(sessionId: string): Promise<VerificationResult> {
    if (this.delay) {
      await new Promise((resolve) => setTimeout(resolve, this.delay));
    }
    if (this.shouldFail) {
      throw new Error(`Mock provider ${this.name} failed to get result`);
    }

    return {
      success: true,
      sessionId,
      provider: {
        name: this.name,
        version: this.version,
      },
      personalData: {
        fullName: "Mock User",
        idNumber: "123456789",
      },
      verificationData: {
        confidence: 95,
      },
      processing: {
        totalDuration: 1000,
        steps: {},
        retryCount: 0,
      },
      startedAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
    };
  }

  async cancel(_sessionId: string): Promise<void> {
    if (this.shouldFail) {
      throw new Error(`Mock provider ${this.name} failed to cancel`);
    }
  }

  async cleanup(): Promise<void> {
    if (this.shouldFail) {
      throw new Error(`Mock provider ${this.name} failed to cleanup`);
    }
  }

  async healthCheck(): Promise<boolean> {
    return !this.shouldFail;
  }

  // Helper methods for testing
  setShouldFail(shouldFail: boolean): void {
    this.shouldFail = shouldFail;
  }

  setDelay(delay: number): void {
    this.delay = delay;
  }
}

describe(
  "VerificationManager",
  () => {
    let manager: VerificationManager;
    let mockProvider1: MockVerificationProvider;
    let mockProvider2: MockVerificationProvider;
    let testConfig: ProviderConfig;

    beforeEach(() => {
      // Get singleton instance
      manager = VerificationManager.getInstance();

      // Clear any existing state
      manager.resetStats();

      // Create mock providers
      mockProvider1 = new MockVerificationProvider("provider1");
      mockProvider2 = new MockVerificationProvider("provider2");

      testConfig = {
        apiKey: "test-api-key",
        environment: "development" as const,
        language: "en",
      };
    });

    afterEach(async () => {
      // Cleanup manager and all providers
      await manager.cleanup();
    });

    describe("Singleton Pattern", () => {
      it("should return the same instance", () => {
        const instance1 = VerificationManager.getInstance();
        const instance2 = VerificationManager.getInstance();

        expect(instance1).toBe(instance2);
      });

      it("should maintain state across instance retrievals", async () => {
        const instance1 = VerificationManager.getInstance();
        await instance1.registerProvider("test", mockProvider1, testConfig);

        const instance2 = VerificationManager.getInstance();
        const retrievedProvider = instance2.getProvider("test");

        expect(retrievedProvider).toBe(mockProvider1);
      });
    });

    describe("Provider Registration", () => {
      it("should register provider successfully", async () => {
        await expect(
          manager.registerProvider("provider1", mockProvider1, testConfig),
        ).resolves.not.toThrow();

        const retrievedProvider = manager.getProvider("provider1");
        expect(retrievedProvider).toBe(mockProvider1);
      });

      it("should initialize provider with config during registration", async () => {
        const initializeSpy = vi.spyOn(mockProvider1, "initialize");

        await manager.registerProvider("provider1", mockProvider1, testConfig);

        expect(initializeSpy).toHaveBeenCalledWith(testConfig);
      });

      it("should register multiple providers", async () => {
        await manager.registerProvider("provider1", mockProvider1, testConfig);
        await manager.registerProvider("provider2", mockProvider2, testConfig);

        const providers = manager.getRegisteredProviders();
        expect(providers.size).toBe(2);
        expect(providers.has("provider1")).toBe(true);
        expect(providers.has("provider2")).toBe(true);
      });

      it("should set default provider flag", async () => {
        await manager.registerProvider(
          "provider1",
          mockProvider1,
          testConfig,
          false,
        );
        await manager.registerProvider(
          "provider2",
          mockProvider2,
          testConfig,
          true,
        );

        const defaultProvider = manager.getDefaultProvider();
        expect(defaultProvider).toBe(mockProvider2);
      });

      it("should handle provider initialization failure", async () => {
        const failingProvider = new MockVerificationProvider("failing", {
          shouldFail: true,
        });

        await expect(
          manager.registerProvider("failing", failingProvider, testConfig),
        ).rejects.toThrow("Provider registration failed");

        const retrievedProvider = manager.getProvider("failing");
        expect(retrievedProvider).toBeUndefined();
      });

      it("should register provider without config", async () => {
        const initializeSpy = vi.spyOn(mockProvider1, "initialize");

        await manager.registerProvider("provider1", mockProvider1);

        expect(initializeSpy).not.toHaveBeenCalled();
      });
    });

    describe("Provider Retrieval", () => {
      beforeEach(async () => {
        await manager.registerProvider("provider1", mockProvider1, testConfig);
      });

      it("should retrieve registered provider", () => {
        const provider = manager.getProvider("provider1");
        expect(provider).toBe(mockProvider1);
      });

      it("should return undefined for non-existent provider", () => {
        const provider = manager.getProvider("non-existent");
        expect(provider).toBeUndefined();
      });

      it("should get default provider", () => {
        const defaultProvider = manager.getDefaultProvider();
        expect(defaultProvider).toBe(mockProvider1);
      });

      it("should return first provider as default if no default set", async () => {
        await manager.registerProvider("provider2", mockProvider2, testConfig);

        const defaultProvider = manager.getDefaultProvider();
        expect([mockProvider1, mockProvider2]).toContain(defaultProvider);
      });

      it("should return undefined when no providers registered", async () => {
        await manager.cleanup();
        const defaultProvider = manager.getDefaultProvider();
        expect(defaultProvider).toBeUndefined();
      });
    });

    describe("Provider Unregistration", () => {
      beforeEach(async () => {
        await manager.registerProvider("provider1", mockProvider1, testConfig);
      });

      it("should unregister provider successfully", async () => {
        await manager.unregisterProvider("provider1");

        const provider = manager.getProvider("provider1");
        expect(provider).toBeUndefined();
      });

      it("should cleanup provider during unregistration", async () => {
        const cleanupSpy = vi.spyOn(mockProvider1, "cleanup");

        await manager.unregisterProvider("provider1");

        expect(cleanupSpy).toHaveBeenCalled();
      });

      it("should handle unregistration of non-existent provider", async () => {
        await expect(
          manager.unregisterProvider("non-existent"),
        ).rejects.toThrow('Provider "non-existent" not found');
      });

      it("should cancel active sessions during unregistration", async () => {
        // Start verification
        const options: VerificationOptions = { documentType: "CCCD" };
        await manager.verify("provider1", options);

        const cancelSpy = vi.spyOn(mockProvider1, "cancel");

        await manager.unregisterProvider("provider1");

        expect(cancelSpy).toHaveBeenCalled();
      });

      it("should handle cleanup errors during unregistration", async () => {
        mockProvider1.setShouldFail(true);

        // Should not throw error, but log warning
        await expect(manager.unregisterProvider("provider1")).rejects.toThrow();
      });
    });

    describe("Verification Flow", () => {
      beforeEach(async () => {
        await manager.registerProvider("provider1", mockProvider1, testConfig);
      });

      it("should start verification successfully", async () => {
        const options: VerificationOptions = {
          documentType: "CCCD",
          flowType: "DOCUMENT_TO_FACE",
        };

        const session = await manager.verify("provider1", options);

        expect(session).toMatchObject({
          id: expect.stringMatching(/^provider1-session-\d+$/),
          status: "processing",
          provider: "provider1",
          startedAt: expect.any(String),
        });
      });

      it("should handle missing provider error", async () => {
        const options: VerificationOptions = { documentType: "CCCD" };

        await expect(
          manager.verify("non-existent-provider", options),
        ).rejects.toThrow('Provider "non-existent-provider" not found');
      });

      it("should update statistics on verification start", async () => {
        const initialStats = manager.getStats();

        const options: VerificationOptions = { documentType: "CCCD" };
        await manager.verify("provider1", options);

        const updatedStats = manager.getStats();
        expect(updatedStats.totalAttempts).toBe(initialStats.totalAttempts + 1);
      });

      it("should track failed verifications in statistics", async () => {
        mockProvider1.setShouldFail(true);

        const options: VerificationOptions = { documentType: "CCCD" };

        await expect(manager.verify("provider1", options)).rejects.toThrow();

        const stats = manager.getStats();
        expect(stats.failedVerifications).toBe(1);
        expect(stats.totalAttempts).toBe(1);
      });

      it("should handle provider errors during verification", async () => {
        const failingProvider = new MockVerificationProvider("failing", {
          shouldFail: true,
        });
        await manager.registerProvider("failing", failingProvider, testConfig);

        const options: VerificationOptions = { documentType: "CCCD" };

        await expect(manager.verify("failing", options)).rejects.toThrow(
          "Mock provider failing failed to start verification",
        );
      });
    });

    describe("Session Management", () => {
      beforeEach(async () => {
        await manager.registerProvider("provider1", mockProvider1, testConfig);
      });

      it("should track active sessions", async () => {
        const options: VerificationOptions = { documentType: "CCCD" };

        // Start multiple sessions
        const session1 = await manager.verify("provider1", options);
        const session2 = await manager.verify("provider1", options);

        const activeSessions = manager.getActiveSessions();
        expect(activeSessions.size).toBe(2);
        expect(activeSessions.has(session1.id)).toBe(true);
        expect(activeSessions.has(session2.id)).toBe(true);
      });

      it("should get verification status", async () => {
        const options: VerificationOptions = { documentType: "CCCD" };
        const session = await manager.verify("provider1", options);

        const status = await manager.getStatus(session.id);
        expect(status).toBe("processing");
      });

      it("should handle status request for non-existent session", async () => {
        await expect(manager.getStatus("non-existent-session")).rejects.toThrow(
          'Session "non-existent-session" not found',
        );
      });

      it("should get verification result", async () => {
        const options: VerificationOptions = { documentType: "CCCD" };
        const session = await manager.verify("provider1", options);

        const result = await manager.getResult(session.id);

        expect(result).toMatchObject({
          success: true,
          sessionId: session.id,
          provider: {
            name: "provider1",
            version: "1.0.0",
          },
          personalData: {
            fullName: "Mock User",
            idNumber: "123456789",
          },
          verificationData: {
            confidence: 95,
          },
        });
      });

      it("should clean up session after getting result", async () => {
        const options: VerificationOptions = { documentType: "CCCD" };
        const session = await manager.verify("provider1", options);

        await manager.getResult(session.id);

        const activeSessions = manager.getActiveSessions();
        expect(activeSessions.has(session.id)).toBe(false);
      });

      it("should update statistics after getting result", async () => {
        const options: VerificationOptions = { documentType: "CCCD" };
        const session = await manager.verify("provider1", options);

        await manager.getResult(session.id);

        const stats = manager.getStats();
        expect(stats.successfulVerifications).toBe(1);
        expect(stats.failedVerifications).toBe(0);
        expect(stats.totalAttempts).toBe(1);
      });

      it("should cancel verification session", async () => {
        const options: VerificationOptions = { documentType: "CCCD" };
        const session = await manager.verify("provider1", options);

        await manager.cancel(session.id);

        const activeSessions = manager.getActiveSessions();
        expect(activeSessions.has(session.id)).toBe(false);
      });

      it("should handle cancel for non-existent session", async () => {
        await expect(manager.cancel("non-existent-session")).rejects.toThrow(
          'Session "non-existent-session" not found',
        );
      });

      it("should handle errors in getting result", async () => {
        mockProvider1.setShouldFail(true);

        const options: VerificationOptions = { documentType: "CCCD" };
        const session = await manager.verify("provider1", options);

        await expect(manager.getResult(session.id)).rejects.toThrow(
          "Mock provider provider1 failed to get result",
        );

        const stats = manager.getStats();
        expect(stats.failedVerifications).toBe(1);
      });
    });

    describe("Concurrent Operations", () => {
      beforeEach(async () => {
        await manager.registerProvider("provider1", mockProvider1, testConfig);
      });

      it("should handle concurrent verifications", async () => {
        const options: VerificationOptions = { documentType: "CCCD" };

        // Start multiple verifications concurrently
        const concurrentVerifications = Array.from({ length: 5 }, () =>
          manager.verify("provider1", options),
        );

        const sessions = await Promise.all(concurrentVerifications);

        expect(sessions).toHaveLength(5);
        expect(
          sessions.every(
            (s, index, self) =>
              self.findIndex((other) => other.id === s.id) === index,
          ),
        ).toBe(true);
      });

      it("should handle concurrent result retrieval", async () => {
        const options: VerificationOptions = { documentType: "CCCD" };

        // Start multiple verifications
        const sessions = await Promise.all(
          Array.from({ length: 3 }, () => manager.verify("provider1", options)),
        );

        // Get results concurrently
        const results = await Promise.all(
          sessions.map((session) => manager.getResult(session.id)),
        );

        expect(results).toHaveLength(3);
        expect(results.every((r) => r.success)).toBe(true);
      });

      it("should handle mixed concurrent operations", async () => {
        const options: VerificationOptions = { documentType: "CCCD" };

        const operations = [
          manager.verify("provider1", options),
          manager.verify("provider1", options),
        ];

        const [session1, session2] = await Promise.all(operations);

        const results = await Promise.all([
          manager.getResult(session1.id),
          manager.getResult(session2.id),
        ]);

        expect(results).toHaveLength(2);
        expect(results.every((r) => r.success)).toBe(true);
      });
    });

    describe("Statistics Tracking", () => {
      beforeEach(async () => {
        await manager.registerProvider("provider1", mockProvider1, testConfig);
      });

      it("should track successful verifications", async () => {
        const options: VerificationOptions = { documentType: "CCCD" };
        const session = await manager.verify("provider1", options);
        await manager.getResult(session.id);

        const stats = manager.getStats();
        expect(stats.successfulVerifications).toBe(1);
        expect(stats.totalAttempts).toBe(1);
      });

      it("should track failed verifications", async () => {
        mockProvider1.setShouldFail(true);

        const options: VerificationOptions = { documentType: "CCCD" };

        try {
          await manager.verify("provider1", options);
        } catch (_error) {
          // Expected to fail
        }

        const stats = manager.getStats();
        expect(stats.failedVerifications).toBe(1);
        expect(stats.totalAttempts).toBe(1);
      });

      it("should track success rate by document type", async () => {
        const options1: VerificationOptions = { documentType: "CCCD" };
        const _options2: VerificationOptions = { documentType: "PASSPORT" };

        // Successful verification
        const session1 = await manager.verify("provider1", options1);
        await manager.getResult(session1.id);

        const stats = manager.getStats();
        expect(stats.successRateByDocument.CCCD).toBe(100);
      });

      it("should track provider performance", async () => {
        const options: VerificationOptions = { documentType: "CCCD" };
        const session = await manager.verify("provider1", options);
        await manager.getResult(session.id);

        const stats = manager.getStats();
        expect(stats.providerPerformance.provider1).toEqual({
          averageTime: expect.any(Number),
          successRate: 100,
          errorRate: 0,
        });
      });

      it("should track common errors", async () => {
        mockProvider1.setShouldFail(true);

        const options: VerificationOptions = { documentType: "CCCD" };

        try {
          await manager.verify("provider1", options);
        } catch (_error) {
          // Expected to fail
        }

        const stats = manager.getStats();
        expect(stats.commonErrors).toHaveLength(1);
        expect(stats.commonErrors[0]).toMatchObject({
          error: "Mock provider provider1 failed to start verification",
          count: 1,
          percentage: 100,
        });
      });

      it("should reset statistics", async () => {
        // Generate some statistics
        const options: VerificationOptions = { documentType: "CCCD" };
        const session = await manager.verify("provider1", options);
        await manager.getResult(session.id);

        // Reset stats
        manager.resetStats();

        const resetStats = manager.getStats();
        expect(resetStats.totalAttempts).toBe(0);
        expect(resetStats.successfulVerifications).toBe(0);
        expect(resetStats.failedVerifications).toBe(0);
      });
    });

    describe("Health Checks", () => {
      beforeEach(async () => {
        await manager.registerProvider("provider1", mockProvider1, testConfig);
      });

      it("should perform health check on all providers", async () => {
        const healthResults = await manager.healthCheck();

        expect(healthResults).toEqual({
          provider1: true,
        });
      });

      it("should handle unhealthy providers", async () => {
        mockProvider1.setShouldFail(true);

        const healthResults = await manager.healthCheck();

        expect(healthResults).toEqual({
          provider1: false,
        });
      });

      it("should handle health check errors gracefully", async () => {
        const unhealthyProvider = new MockVerificationProvider("unhealthy", {
          shouldFail: true,
        });
        unhealthyProvider.healthCheck = vi
          .fn()
          .mockRejectedValue(new Error("Health check failed"));

        await manager.registerProvider(
          "unhealthy",
          unhealthyProvider,
          testConfig,
        );

        const healthResults = await manager.healthCheck();

        expect(healthResults.unhealthy).toBe(false);
      });

      it("should handle providers without health check", async () => {
        const noHealthCheckProvider = new MockVerificationProvider(
          "noHealthCheck",
        );
        // @ts-expect-error - intentionally removing healthCheck for testing
        (noHealthCheckProvider as any).healthCheck = undefined;

        await manager.registerProvider(
          "noHealthCheck",
          noHealthCheckProvider,
          testConfig,
        );

        const healthResults = await manager.healthCheck();

        expect(healthResults.noHealthCheck).toBe(true);
      });
    });

    describe("Session Cleanup", () => {
      beforeEach(async () => {
        await manager.registerProvider("provider1", mockProvider1, testConfig);
      });

      it("should clean up expired sessions", async () => {
        const options: VerificationOptions = { documentType: "CCCD" };

        // Create session with expiry
        const session = await manager.verify("provider1", options);

        // Manually set expiry in the past
        const activeSessions = manager.getActiveSessions();
        const sessionData = activeSessions.get(session.id);
        if (sessionData) {
          sessionData.expiresAt = new Date(Date.now() - 1000).toISOString();
        }

        // Cleanup expired sessions
        manager.cleanupExpiredSessions();

        // Session should be removed
        const remainingSessions = manager.getActiveSessions();
        expect(remainingSessions.has(session.id)).toBe(false);
      });

      it("should handle cleanup errors gracefully", async () => {
        const cancelSpy = vi
          .spyOn(mockProvider1, "cancel")
          .mockRejectedValue(new Error("Cancel failed"));

        const options: VerificationOptions = { documentType: "CCCD" };
        const session = await manager.verify("provider1", options);

        // Manually set expiry
        const activeSessions = manager.getActiveSessions();
        const sessionData = activeSessions.get(session.id);
        if (sessionData) {
          sessionData.expiresAt = new Date(Date.now() - 1000).toISOString();
        }

        // Should not throw error
        manager.cleanupExpiredSessions();

        expect(cancelSpy).toHaveBeenCalled();
      });
    });

    describe("Complete Cleanup", () => {
      it("should cleanup all resources", async () => {
        // Register multiple providers
        await manager.registerProvider("provider1", mockProvider1, testConfig);
        await manager.registerProvider("provider2", mockProvider2, testConfig);

        // Start some sessions
        const options: VerificationOptions = { documentType: "CCCD" };
        await manager.verify("provider1", options);
        await manager.verify("provider2", options);

        // Cleanup everything
        await manager.cleanup();

        // Verify everything is cleaned up
        const providers = manager.getRegisteredProviders();
        expect(providers.size).toBe(0);

        const activeSessions = manager.getActiveSessions();
        expect(activeSessions.size).toBe(0);
      });

      it("should handle cleanup errors gracefully", async () => {
        mockProvider1.setShouldFail(true);

        await manager.registerProvider("provider1", mockProvider1, testConfig);

        // Should not throw error
        await expect(manager.cleanup()).rejects.toThrow();
      });
    });
  },
  TEST_TIMEOUT,
);
