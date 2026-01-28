// @ts-nocheck
/**
 * Loan Status Update Rate Limiting
 * Comprehensive rate limiting with exponential backoff and abuse detection for loan status updates
 */

import { createRateLimiter } from "./rate-limiting";

// Rate limiting configuration for status updates
export interface StatusRateLimitConfig {
  // General status refresh limits
  statusRefresh: {
    windowMs: number;
    maxRequests: number;
    blockDurationMs: number;
  };

  // Auto-refresh specific limits
  autoRefresh: {
    minIntervalMs: number;
    maxIntervalMs: number;
    maxConcurrentAutoRefresh: number;
  };

  // WebSocket connection limits
  webSocket: {
    maxConnectionsPerMinute: number;
    maxReconnectionAttempts: number;
    connectionCooldownMs: number;
  };

  // Document upload limits
  documentUpload: {
    maxUploadsPerHour: number;
    maxFileSizeBytes: number;
    maxConcurrentUploads: number;
  };

  // Communication limits
  communications: {
    maxMessagesPerHour: number;
    maxRecipientsPerMessage: number;
    cooldownBetweenMessagesMs: number;
  };

  // Abuse detection thresholds
  abuseDetection: {
    violationThreshold: number;
    suspiciousPatternThreshold: number;
    blockDurationMs: number;
  };
}

// User activity tracking
export interface UserActivityTracker {
  userId: string;
  applicationId?: string;
  activities: Array<{
    type:
      | "status_refresh"
      | "auto_refresh"
      | "ws_connect"
      | "doc_upload"
      | "message_send";
    timestamp: number;
    metadata?: any;
  }>;
  violationCount: number;
  blockedUntil?: number;
  lastActivity: number;
  riskScore: number; // 0-100
}

// Exponential backoff configuration
export interface ExponentialBackoffConfig {
  initialDelayMs: number;
  maxDelayMs: number;
  multiplier: number;
  jitter: boolean;
  maxRetries: number;
}

// Default configuration optimized for Vietnamese loan market compliance
const DEFAULT_STATUS_RATE_LIMIT_CONFIG: StatusRateLimitConfig = {
  statusRefresh: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 30, // 30 status refreshes per minute
    blockDurationMs: 5 * 60 * 1000, // 5 minutes block
  },

  autoRefresh: {
    minIntervalMs: 30 * 1000, // Minimum 30 seconds
    maxIntervalMs: 5 * 60 * 1000, // Maximum 5 minutes
    maxConcurrentAutoRefresh: 3, // Max 3 concurrent auto-refresh
  },

  webSocket: {
    maxConnectionsPerMinute: 10, // 10 connections per minute
    maxReconnectionAttempts: 5,
    connectionCooldownMs: 30 * 1000, // 30 seconds cooldown
  },

  documentUpload: {
    maxUploadsPerHour: 20, // 20 uploads per hour
    maxFileSizeBytes: 10 * 1024 * 1024, // 10MB
    maxConcurrentUploads: 3, // Max 3 concurrent uploads
  },

  communications: {
    maxMessagesPerHour: 50, // 50 messages per hour
    maxRecipientsPerMessage: 5, // Max 5 recipients per message
    cooldownBetweenMessagesMs: 5 * 1000, // 5 seconds between messages
  },

  abuseDetection: {
    violationThreshold: 5, // Block after 5 violations
    suspiciousPatternThreshold: 10, // Flag after 10 suspicious activities
    blockDurationMs: 30 * 60 * 1000, // 30 minutes block
  },
};

const DEFAULT_BACKOFF_CONFIG: ExponentialBackoffConfig = {
  initialDelayMs: 1000,
  maxDelayMs: 30000,
  multiplier: 2,
  jitter: true,
  maxRetries: 5,
};

/**
 * Loan Status Rate Limiter
 */
export class LoanStatusRateLimiter {
  private config: StatusRateLimitConfig;
  private backoffConfig: ExponentialBackoffConfig;
  private userTrackers: Map<string, UserActivityTracker> = new Map();
  private globalTrackers: Map<string, number[]> = new Map();
  private rateLimiters: Map<string, any> = new Map();

  constructor(
    config: Partial<StatusRateLimitConfig> = {},
    backoffConfig: Partial<ExponentialBackoffConfig> = {},
  ) {
    this.config = { ...DEFAULT_STATUS_RATE_LIMIT_CONFIG, ...config };
    this.backoffConfig = { ...DEFAULT_BACKOFF_CONFIG, ...backoffConfig };
    this.initializeRateLimiters();
  }

  /**
   * Check if status refresh is allowed
   */
  async checkStatusRefresh(
    userId: string,
    applicationId: string,
  ): Promise<{
    allowed: boolean;
    retryAfter?: number;
    reason?: string;
    backoffDelay?: number;
  }> {
    const tracker = this.getOrCreateTracker(userId, applicationId);

    // Check if user is blocked
    if (this.isUserBlocked(userId)) {
      return {
        allowed: false,
        retryAfter: tracker.blockedUntil! - Date.now(),
        reason: "User temporarily blocked due to violations",
      };
    }

    // Check rate limit
    const rateLimitResult = await this.checkGlobalRateLimit(
      "status_refresh",
      userId,
    );
    if (!rateLimitResult.allowed) {
      return {
        allowed: false,
        retryAfter: rateLimitResult.retryAfter,
        reason: "Rate limit exceeded for status refresh",
        backoffDelay: this.calculateBackoffDelay(
          tracker.activities.filter((a) => a.type === "status_refresh").length,
        ),
      };
    }

    // Check user-specific limits
    const recentStatusRefreshes = tracker.activities.filter(
      (activity) =>
        activity.type === "status_refresh" &&
        Date.now() - activity.timestamp < this.config.statusRefresh.windowMs,
    );

    if (recentStatusRefreshes.length >= this.config.statusRefresh.maxRequests) {
      this.recordViolation(userId);
      return {
        allowed: false,
        retryAfter: this.config.statusRefresh.blockDurationMs,
        reason: "User status refresh limit exceeded",
        backoffDelay: this.calculateBackoffDelay(recentStatusRefreshes.length),
      };
    }

    // Check for suspicious patterns
    if (this.detectSuspiciousPattern(tracker)) {
      this.recordViolation(userId);
      return {
        allowed: false,
        retryAfter: this.config.abuseDetection.blockDurationMs,
        reason: "Suspicious activity pattern detected",
      };
    }

    // Record activity
    this.recordActivity(userId, applicationId, "status_refresh");

    return { allowed: true };
  }

  /**
   * Check if auto-refresh is allowed
   */
  checkAutoRefresh(
    userId: string,
    applicationId: string,
    intervalMs: number,
  ): {
    allowed: boolean;
    reason?: string;
    recommendedInterval?: number;
  } {
    const tracker = this.getOrCreateTracker(userId, applicationId);

    // Check interval bounds
    if (intervalMs < this.config.autoRefresh.minIntervalMs) {
      return {
        allowed: false,
        reason: "Auto-refresh interval too frequent",
        recommendedInterval: this.config.autoRefresh.minIntervalMs,
      };
    }

    if (intervalMs > this.config.autoRefresh.maxIntervalMs) {
      return {
        allowed: false,
        reason: "Auto-refresh interval too long",
        recommendedInterval: this.config.autoRefresh.maxIntervalMs,
      };
    }

    // Check concurrent auto-refresh limit
    const activeAutoRefresh = tracker.activities.filter(
      (activity) =>
        activity.type === "auto_refresh" &&
        Date.now() - activity.timestamp < this.config.autoRefresh.maxIntervalMs,
    );

    if (
      activeAutoRefresh.length >=
      this.config.autoRefresh.maxConcurrentAutoRefresh
    ) {
      return {
        allowed: false,
        reason: "Maximum concurrent auto-refresh limit reached",
      };
    }

    return { allowed: true };
  }

  /**
   * Check if WebSocket connection is allowed
   */
  checkWebSocketConnection(
    userId: string,
    applicationId: string,
  ): {
    allowed: boolean;
    retryAfter?: number;
    reason?: string;
  } {
    const tracker = this.getOrCreateTracker(userId, applicationId);

    // Check connection rate limit
    const recentConnections = tracker.activities.filter(
      (activity) =>
        activity.type === "ws_connect" &&
        Date.now() - activity.timestamp < 60 * 1000, // 1 minute
    );

    if (
      recentConnections.length >= this.config.webSocket.maxConnectionsPerMinute
    ) {
      return {
        allowed: false,
        retryAfter: this.config.webSocket.connectionCooldownMs,
        reason: "WebSocket connection rate limit exceeded",
      };
    }

    // Check connection cooldown
    const lastConnection = tracker.activities
      .filter((activity) => activity.type === "ws_connect")
      .sort((a, b) => b.timestamp - a.timestamp)[0];

    if (
      lastConnection &&
      Date.now() - lastConnection.timestamp <
        this.config.webSocket.connectionCooldownMs
    ) {
      return {
        allowed: false,
        retryAfter:
          this.config.webSocket.connectionCooldownMs -
          (Date.now() - lastConnection.timestamp),
        reason: "WebSocket connection cooldown active",
      };
    }

    this.recordActivity(userId, applicationId, "ws_connect");
    return { allowed: true };
  }

  /**
   * Check if document upload is allowed
   */
  checkDocumentUpload(
    userId: string,
    applicationId: string,
    fileSizeBytes: number,
  ): {
    allowed: boolean;
    retryAfter?: number;
    reason?: string;
  } {
    const tracker = this.getOrCreateTracker(userId, applicationId);

    // Check file size
    if (fileSizeBytes > this.config.documentUpload.maxFileSizeBytes) {
      return {
        allowed: false,
        reason: `File size ${(fileSizeBytes / 1024 / 1024).toFixed(1)}MB exceeds maximum allowed size of ${(this.config.documentUpload.maxFileSizeBytes / 1024 / 1024).toFixed(1)}MB`,
      };
    }

    // Check hourly upload limit
    const recentUploads = tracker.activities.filter(
      (activity) =>
        activity.type === "doc_upload" &&
        Date.now() - activity.timestamp < 60 * 60 * 1000, // 1 hour
    );

    if (recentUploads.length >= this.config.documentUpload.maxUploadsPerHour) {
      return {
        allowed: false,
        retryAfter: 60 * 60 * 1000, // 1 hour
        reason: "Document upload hourly limit exceeded",
      };
    }

    // Check concurrent uploads
    const activeUploads = tracker.activities.filter(
      (activity) =>
        activity.type === "doc_upload" &&
        Date.now() - activity.timestamp < 5 * 60 * 1000, // 5 minutes (considered active)
    );

    if (
      activeUploads.length >= this.config.documentUpload.maxConcurrentUploads
    ) {
      return {
        allowed: false,
        reason: "Maximum concurrent uploads reached",
      };
    }

    this.recordActivity(userId, applicationId, "doc_upload", {
      fileSize: fileSizeBytes,
    });
    return { allowed: true };
  }

  /**
   * Check if communication message is allowed
   */
  checkCommunication(
    userId: string,
    applicationId: string,
    recipientCount: number,
  ): {
    allowed: boolean;
    retryAfter?: number;
    reason?: string;
  } {
    const tracker = this.getOrCreateTracker(userId, applicationId);

    // Check recipient limit
    if (recipientCount > this.config.communications.maxRecipientsPerMessage) {
      return {
        allowed: false,
        reason: `Recipient count ${recipientCount} exceeds maximum allowed ${this.config.communications.maxRecipientsPerMessage}`,
      };
    }

    // Check hourly message limit
    const recentMessages = tracker.activities.filter(
      (activity) =>
        activity.type === "message_send" &&
        Date.now() - activity.timestamp < 60 * 60 * 1000, // 1 hour
    );

    if (
      recentMessages.length >= this.config.communications.maxMessagesPerHour
    ) {
      return {
        allowed: false,
        retryAfter: 60 * 60 * 1000, // 1 hour
        reason: "Communication hourly limit exceeded",
      };
    }

    // Check message cooldown
    const lastMessage = tracker.activities
      .filter((activity) => activity.type === "message_send")
      .sort((a, b) => b.timestamp - a.timestamp)[0];

    if (
      lastMessage &&
      Date.now() - lastMessage.timestamp <
        this.config.communications.cooldownBetweenMessagesMs
    ) {
      return {
        allowed: false,
        retryAfter:
          this.config.communications.cooldownBetweenMessagesMs -
          (Date.now() - lastMessage.timestamp),
        reason: "Message cooldown active",
      };
    }

    this.recordActivity(userId, applicationId, "message_send", {
      recipientCount,
    });
    return { allowed: true };
  }

  /**
   * Get user activity statistics
   */
  getUserStats(
    userId: string,
    _applicationId?: string,
  ): {
    totalActivities: number;
    activitiesByType: Record<string, number>;
    violationCount: number;
    riskScore: number;
    isBlocked: boolean;
    blockedUntil?: number;
  } {
    const tracker = this.userTrackers.get(userId);
    if (!tracker) {
      return {
        totalActivities: 0,
        activitiesByType: {},
        violationCount: 0,
        riskScore: 0,
        isBlocked: false,
      };
    }

    const activitiesByType = tracker.activities.reduce(
      (acc, activity) => {
        acc[activity.type] = (acc[activity.type] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    return {
      totalActivities: tracker.activities.length,
      activitiesByType,
      violationCount: tracker.violationCount,
      riskScore: tracker.riskScore,
      isBlocked: this.isUserBlocked(userId),
      blockedUntil: tracker.blockedUntil,
    };
  }

  /**
   * Get compliance report for Vietnamese regulations
   */
  getVietnameseComplianceReport(): {
    totalUsers: number;
    blockedUsers: number;
    averageRiskScore: number;
    violationRate: number;
    complianceScore: number;
    recommendations: string[];
  } {
    const users = Array.from(this.userTrackers.values());
    const blockedUsers = users.filter((user) =>
      this.isUserBlocked(user.userId),
    ).length;
    const averageRiskScore =
      users.reduce((sum, user) => sum + user.riskScore, 0) / users.length || 0;
    const totalViolations = users.reduce(
      (sum, user) => sum + user.violationCount,
      0,
    );
    const violationRate = users.length > 0 ? totalViolations / users.length : 0;

    // Calculate compliance score (0-100)
    let complianceScore = 100;
    complianceScore -= blockedUsers * 10; // Penalize blocked users
    complianceScore -= averageRiskScore * 0.5; // Penalize high risk scores
    complianceScore -= violationRate * 20; // Penalize violations
    complianceScore = Math.max(0, complianceScore);

    const recommendations: string[] = [];
    if (blockedUsers > 0)
      recommendations.push("Review and optimize blocking policies");
    if (averageRiskScore > 50)
      recommendations.push("Implement additional security measures");
    if (violationRate > 0.1)
      recommendations.push("Enhance user education on proper usage");
    if (complianceScore < 80)
      recommendations.push("Review rate limiting configuration");

    return {
      totalUsers: users.length,
      blockedUsers,
      averageRiskScore,
      violationRate,
      complianceScore,
      recommendations,
    };
  }

  /**
   * Clear user activity data
   */
  clearUserData(userId: string): void {
    this.userTrackers.delete(userId);
    // Clean up global trackers
    for (const [key, _timestamps] of this.globalTrackers.entries()) {
      if (key.includes(userId)) {
        this.globalTrackers.delete(key);
      }
    }
  }

  // Private methods

  private initializeRateLimiters(): void {
    this.rateLimiters.set(
      "status_refresh",
      createRateLimiter({
        windowMs: this.config.statusRefresh.windowMs,
        maxAttempts: this.config.statusRefresh.maxRequests,
        message: "Vượt quá giới hạn làm mới trạng thái. Vui lòng thử lại sau.",
        statusCode: 429,
        headers: true,
      }),
    );
  }

  private getOrCreateTracker(
    userId: string,
    applicationId: string,
  ): UserActivityTracker {
    if (!this.userTrackers.has(userId)) {
      this.userTrackers.set(userId, {
        userId,
        applicationId,
        activities: [],
        violationCount: 0,
        lastActivity: 0,
        riskScore: 0,
      });
    }
    return this.userTrackers.get(userId)!;
  }

  private recordActivity(
    userId: string,
    applicationId: string,
    type: UserActivityTracker["activities"][0]["type"],
    metadata?: any,
  ): void {
    const tracker = this.getOrCreateTracker(userId, applicationId);

    tracker.activities.push({
      type,
      timestamp: Date.now(),
      metadata,
    });

    tracker.lastActivity = Date.now();

    // Update risk score
    this.updateRiskScore(tracker);

    // Cleanup old activities (keep last 24 hours)
    const cutoff = Date.now() - 24 * 60 * 60 * 1000;
    tracker.activities = tracker.activities.filter(
      (activity) => activity.timestamp > cutoff,
    );
  }

  private recordViolation(userId: string): void {
    const tracker = this.userTrackers.get(userId);
    if (!tracker) return;

    tracker.violationCount++;

    // Block user if threshold exceeded
    if (
      tracker.violationCount >= this.config.abuseDetection.violationThreshold
    ) {
      tracker.blockedUntil =
        Date.now() + this.config.abuseDetection.blockDurationMs;
    }
  }

  private isUserBlocked(userId: string): boolean {
    const tracker = this.userTrackers.get(userId);
    return !!(tracker?.blockedUntil && tracker.blockedUntil > Date.now());
  }

  private detectSuspiciousPattern(tracker: UserActivityTracker): boolean {
    const recentActivities = tracker.activities.filter(
      (activity) => Date.now() - activity.timestamp < 5 * 60 * 1000, // Last 5 minutes
    );

    // Check for rapid status refresh pattern
    const statusRefreshes = recentActivities.filter(
      (a) => a.type === "status_refresh",
    );
    if (statusRefreshes.length > 20) return true; // More than 20 status refreshes in 5 minutes

    // Check for connection spam
    const connections = recentActivities.filter((a) => a.type === "ws_connect");
    if (connections.length > 10) return true; // More than 10 connections in 5 minutes

    // Check for upload spam
    const uploads = recentActivities.filter((a) => a.type === "doc_upload");
    if (uploads.length > 5) return true; // More than 5 uploads in 5 minutes

    // Check for automated behavior (consistent intervals)
    if (statusRefreshes.length >= 3) {
      const intervals = [];
      for (let i = 1; i < statusRefreshes.length; i++) {
        intervals.push(
          statusRefreshes[i].timestamp - statusRefreshes[i - 1].timestamp,
        );
      }

      // If all intervals are very similar (within 10% variance), likely automated
      const avgInterval =
        intervals.reduce((sum, interval) => sum + interval, 0) /
        intervals.length;
      const variance =
        intervals.reduce(
          (sum, interval) => sum + (interval - avgInterval) ** 2,
          0,
        ) / intervals.length;
      const coefficientOfVariation = Math.sqrt(variance) / avgInterval;

      if (coefficientOfVariation < 0.1) return true;
    }

    return false;
  }

  private updateRiskScore(tracker: UserActivityTracker): void {
    let score = 0;

    // Base risk from activity frequency
    const recentActivities = tracker.activities.filter(
      (activity) => Date.now() - activity.timestamp < 60 * 60 * 1000, // Last hour
    );
    score += Math.min(recentActivities.length * 2, 40);

    // Risk from violations
    score += tracker.violationCount * 15;

    // Risk from suspicious patterns
    if (this.detectSuspiciousPattern(tracker)) {
      score += 25;
    }

    // Risk from high-frequency operations
    const statusRefreshes = recentActivities.filter(
      (a) => a.type === "status_refresh",
    ).length;
    const connections = recentActivities.filter(
      (a) => a.type === "ws_connect",
    ).length;
    score += Math.min(statusRefreshes, 10) * 3;
    score += Math.min(connections, 5) * 5;

    tracker.riskScore = Math.min(100, score);
  }

  private async checkGlobalRateLimit(
    type: string,
    _userId: string,
  ): Promise<{
    allowed: boolean;
    retryAfter?: number;
  }> {
    const rateLimiter = this.rateLimiters.get(type);
    if (!rateLimiter) return { allowed: true };

    // This would integrate with the actual rate limiting middleware
    // For now, return a simple implementation
    return { allowed: true };
  }

  private calculateBackoffDelay(attemptCount: number): number {
    let delay =
      this.backoffConfig.initialDelayMs *
      this.backoffConfig.multiplier ** (attemptCount - 1);
    delay = Math.min(delay, this.backoffConfig.maxDelayMs);

    // Add jitter if enabled
    if (this.backoffConfig.jitter) {
      delay = delay * (0.5 + Math.random() * 0.5);
    }

    return Math.floor(delay);
  }
}

// Singleton instance
export const loanStatusRateLimiter = new LoanStatusRateLimiter();

/**
 * Hook for client-side rate limiting
 */
export function useLoanStatusRateLimiting(
  userId: string,
  applicationId: string,
) {
  const checkStatusRefresh = async () => {
    return await loanStatusRateLimiter.checkStatusRefresh(
      userId,
      applicationId,
    );
  };

  const checkAutoRefresh = (intervalMs: number) => {
    return loanStatusRateLimiter.checkAutoRefresh(
      userId,
      applicationId,
      intervalMs,
    );
  };

  const checkWebSocketConnection = () => {
    return loanStatusRateLimiter.checkWebSocketConnection(
      userId,
      applicationId,
    );
  };

  const checkDocumentUpload = (fileSizeBytes: number) => {
    return loanStatusRateLimiter.checkDocumentUpload(
      userId,
      applicationId,
      fileSizeBytes,
    );
  };

  const checkCommunication = (recipientCount: number) => {
    return loanStatusRateLimiter.checkCommunication(
      userId,
      applicationId,
      recipientCount,
    );
  };

  const getUserStats = () => {
    return loanStatusRateLimiter.getUserStats(userId, applicationId);
  };

  return {
    checkStatusRefresh,
    checkAutoRefresh,
    checkWebSocketConnection,
    checkDocumentUpload,
    checkCommunication,
    getUserStats,
  };
}
