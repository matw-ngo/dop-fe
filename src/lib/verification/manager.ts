/**
 * Verification Manager - Central orchestrator for all eKYC providers
 *
 * This class manages multiple verification providers, handles provider
 * registration, and provides a unified interface for verification operations.
 */

import type {
  ProviderConfig,
  ProviderRegistration,
  VerificationOptions,
  VerificationProvider,
  VerificationResult,
  VerificationSession,
  VerificationStats,
  VerificationStatus,
} from "./types";

// ============================================================================
// Verification Manager
// ============================================================================

export class VerificationManager {
  private static instance: VerificationManager | null = null;
  private providers = new Map<string, ProviderRegistration>();
  private sessions = new Map<string, VerificationSession>();
  private stats: VerificationStats = {
    totalAttempts: 0,
    successfulVerifications: 0,
    failedVerifications: 0,
    averageProcessingTime: 0,
    successRateByDocument: {},
    commonErrors: [],
    providerPerformance: {},
  };

  private constructor() {
    // Private constructor for singleton pattern
  }

  /**
   * Get singleton instance
   */
  static getInstance(): VerificationManager {
    if (!VerificationManager.instance) {
      VerificationManager.instance = new VerificationManager();
    }
    return VerificationManager.instance;
  }

  /**
   * Register a new verification provider
   */
  async registerProvider(
    name: string,
    provider: VerificationProvider,
    config?: ProviderConfig,
    isDefault = false,
  ): Promise<void> {
    try {
      // Initialize provider if config provided
      if (config) {
        await provider.initialize(config);
      }

      // Register the provider
      this.providers.set(name, {
        provider,
        registeredAt: new Date().toISOString(),
        isDefault,
      });

      console.log(`Verification provider "${name}" registered successfully`);
    } catch (error) {
      console.error(`Failed to register provider "${name}":`, error);
      throw new Error(
        `Provider registration failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  /**
   * Unregister a provider
   */
  async unregisterProvider(name: string): Promise<void> {
    const registration = this.providers.get(name);
    if (!registration) {
      throw new Error(`Provider "${name}" not found`);
    }

    try {
      // Cleanup provider resources
      await registration.provider.cleanup();

      // Remove provider
      this.providers.delete(name);

      // Cancel all active sessions for this provider
      for (const [sessionId, session] of Array.from(this.sessions.entries())) {
        if (session.provider === name) {
          try {
            await registration.provider.cancel(sessionId);
          } catch (error) {
            console.warn(`Failed to cancel session ${sessionId}:`, error);
          }
          this.sessions.delete(sessionId);
        }
      }

      console.log(`Verification provider "${name}" unregistered successfully`);
    } catch (error) {
      console.error(`Failed to unregister provider "${name}":`, error);
      throw error;
    }
  }

  /**
   * Get a registered provider
   */
  getProvider(name: string): VerificationProvider | undefined {
    return this.providers.get(name)?.provider;
  }

  /**
   * Get all registered providers
   */
  getRegisteredProviders(): Map<string, ProviderRegistration> {
    return new Map(this.providers);
  }

  /**
   * Get default provider
   */
  getDefaultProvider(): VerificationProvider | undefined {
    for (const [name, registration] of Array.from(this.providers.entries())) {
      if (registration.isDefault) {
        return registration.provider;
      }
    }

    // Fallback to first provider if no default set
    if (this.providers.size > 0) {
      const firstRegistration = this.providers.values().next().value;
      return firstRegistration?.provider;
    }

    return undefined;
  }

  /**
   * Start a new verification session
   */
  async verify(
    providerName: string,
    options: VerificationOptions,
  ): Promise<VerificationSession> {
    const startTime = Date.now();
    this.stats.totalAttempts++;

    const registration = this.providers.get(providerName);
    if (!registration) {
      const error = new Error(`Provider "${providerName}" not found`);
      this.stats.failedVerifications++;
      throw error;
    }

    try {
      // Start verification
      const session = await registration.provider.startVerification(options);

      // Store session
      this.sessions.set(session.id, session);

      // Track provider performance
      if (!this.stats.providerPerformance[providerName]) {
        this.stats.providerPerformance[providerName] = {
          averageTime: 0,
          successRate: 0,
          errorRate: 0,
        };
      }

      console.log(
        `Verification session started: ${session.id} with provider: ${providerName}`,
      );
      return session;
    } catch (error) {
      this.stats.failedVerifications++;
      this.trackError(error instanceof Error ? error.message : "Unknown error");
      throw error;
    }
  }

  /**
   * Get verification status
   */
  async getStatus(sessionId: string): Promise<VerificationStatus> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error(`Session "${sessionId}" not found`);
    }

    const provider = this.getProvider(session.provider);
    if (!provider) {
      throw new Error(`Provider "${session.provider}" not found`);
    }

    try {
      const status = await provider.getStatus(sessionId);

      // Update session status
      session.status = status;
      this.sessions.set(sessionId, session);

      return status;
    } catch (error) {
      console.error(`Failed to get status for session ${sessionId}:`, error);
      throw error;
    }
  }

  /**
   * Get verification result
   */
  async getResult(sessionId: string): Promise<VerificationResult> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error(`Session "${sessionId}" not found`);
    }

    const provider = this.getProvider(session.provider);
    if (!provider) {
      throw new Error(`Provider "${session.provider}" not found`);
    }

    try {
      const result = await provider.getResult(sessionId);

      // Update statistics
      this.updateStats(result, session.provider);

      // Clean up session after getting result
      this.sessions.delete(sessionId);

      return result;
    } catch (error) {
      console.error(`Failed to get result for session ${sessionId}:`, error);

      // Update error stats
      this.stats.failedVerifications++;
      this.trackError(error instanceof Error ? error.message : "Unknown error");

      throw error;
    }
  }

  /**
   * Cancel a verification session
   */
  async cancel(sessionId: string): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error(`Session "${sessionId}" not found`);
    }

    const provider = this.getProvider(session.provider);
    if (!provider) {
      throw new Error(`Provider "${session.provider}" not found`);
    }

    try {
      await provider.cancel(sessionId);
      this.sessions.delete(sessionId);
      console.log(`Verification session cancelled: ${sessionId}`);
    } catch (error) {
      console.error(`Failed to cancel session ${sessionId}:`, error);
      throw error;
    }
  }

  /**
   * Get all active sessions
   */
  getActiveSessions(): Map<string, VerificationSession> {
    return new Map(this.sessions);
  }

  /**
   * Clean up expired sessions
   */
  cleanupExpiredSessions(): void {
    const now = Date.now();
    const expiredSessions: string[] = [];

    for (const [sessionId, session] of Array.from(this.sessions.entries())) {
      if (session.expiresAt && new Date(session.expiresAt).getTime() < now) {
        expiredSessions.push(sessionId);
      }
    }

    for (const sessionId of expiredSessions) {
      const session = this.sessions.get(sessionId);
      if (session) {
        this.cancel(sessionId).catch((error) => {
          console.warn(`Failed to cancel expired session ${sessionId}:`, error);
        });
      }
    }

    if (expiredSessions.length > 0) {
      console.log(`Cleaned up ${expiredSessions.length} expired sessions`);
    }
  }

  /**
   * Perform health check on all providers
   */
  async healthCheck(): Promise<Record<string, boolean>> {
    const results: Record<string, boolean> = {};

    for (const [name, registration] of Array.from(this.providers.entries())) {
      try {
        if (registration.provider.healthCheck) {
          results[name] = await registration.provider.healthCheck();
        } else {
          // If no health check method, assume healthy
          results[name] = true;
        }
      } catch (error) {
        console.warn(`Health check failed for provider ${name}:`, error);
        results[name] = false;
      }
    }

    return results;
  }

  /**
   * Get verification statistics
   */
  getStats(): VerificationStats {
    // Calculate success rate
    if (this.stats.totalAttempts > 0) {
      const successRate =
        (this.stats.successfulVerifications / this.stats.totalAttempts) * 100;

      // Update provider success rates
      for (const [name, perf] of Object.entries(
        this.stats.providerPerformance,
      )) {
        perf.successRate = successRate;
        perf.errorRate = 100 - successRate;
      }
    }

    return { ...this.stats };
  }

  /**
   * Reset statistics
   */
  resetStats(): void {
    this.stats = {
      totalAttempts: 0,
      successfulVerifications: 0,
      failedVerifications: 0,
      averageProcessingTime: 0,
      successRateByDocument: {},
      commonErrors: [],
      providerPerformance: {},
    };
  }

  /**
   * Clean up all providers and sessions
   */
  async cleanup(): Promise<void> {
    // Cancel all active sessions
    const cancelPromises: Promise<void>[] = [];
    for (const [sessionId, session] of Array.from(this.sessions.entries())) {
      const provider = this.getProvider(session.provider);
      if (provider) {
        cancelPromises.push(
          provider.cancel(sessionId).catch((error) => {
            console.warn(`Failed to cancel session ${sessionId}:`, error);
          }),
        );
      }
    }

    await Promise.all(cancelPromises);
    this.sessions.clear();

    // Cleanup all providers
    const cleanupPromises: Promise<void>[] = [];
    for (const [name, registration] of Array.from(this.providers.entries())) {
      cleanupPromises.push(
        registration.provider.cleanup().catch((error) => {
          console.warn(`Failed to cleanup provider ${name}:`, error);
        }),
      );
    }

    await Promise.all(cleanupPromises);
    this.providers.clear();

    console.log("Verification manager cleanup completed");
  }

  // ============================================================================
  // Private Methods
  // ============================================================================

  /**
   * Update verification statistics
   */
  private updateStats(result: VerificationResult, providerName: string): void {
    if (result.success) {
      this.stats.successfulVerifications++;

      // Update success rate by document type
      const docType = result.personalData.documentType || "unknown";
      const currentRate = this.stats.successRateByDocument[docType] || 0;
      const totalCount = this.stats.totalAttempts;

      // Calculate new success rate as percentage
      this.stats.successRateByDocument[docType] =
        (currentRate * (totalCount - 1) + 100) / totalCount;

      // Update processing time
      const duration = result.processing.totalDuration;
      const totalProcessed = this.stats.successfulVerifications;
      this.stats.averageProcessingTime =
        (this.stats.averageProcessingTime * (totalProcessed - 1) + duration) /
        totalProcessed;

      // Update provider performance
      if (!this.stats.providerPerformance[providerName]) {
        this.stats.providerPerformance[providerName] = {
          averageTime: 0,
          successRate: 0,
          errorRate: 0,
        };
      }
      const providerPerf = this.stats.providerPerformance[providerName];
      // Simple count of attempts for this provider
      const providerAttempts =
        this.stats.successfulVerifications + this.stats.failedVerifications;
      if (providerAttempts > 0) {
        providerPerf.averageTime =
          (providerPerf.averageTime * (providerAttempts - 1) + duration) /
          providerAttempts;
      }
    } else {
      this.stats.failedVerifications++;

      // Track error if provided
      if (result.error) {
        this.trackError(result.error.message);
      }
    }
  }

  /**
   * Track errors for statistics
   */
  private trackError(errorMessage: string): void {
    // Find existing error
    const existingError = this.stats.commonErrors.find(
      (e) => e.error === errorMessage,
    );

    if (existingError) {
      existingError.count++;
    } else {
      this.stats.commonErrors.push({
        error: errorMessage,
        count: 1,
        percentage: 0,
      });
    }

    // Update percentages
    const totalErrors = this.stats.commonErrors.reduce(
      (sum, e) => sum + e.count,
      0,
    );
    this.stats.commonErrors.forEach((e) => {
      e.percentage = (e.count / totalErrors) * 100;
    });

    // Keep only top 10 errors
    this.stats.commonErrors.sort((a, b) => b.count - a.count);
    this.stats.commonErrors = this.stats.commonErrors.slice(0, 10);
  }
}

// ============================================================================
// Export singleton instance
// ============================================================================

export const verificationManager = VerificationManager.getInstance();
