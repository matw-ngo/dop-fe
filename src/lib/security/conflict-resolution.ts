// @ts-nocheck
/**
 * Real-Time Data Conflict Resolution System
 * Provides version-based conflict resolution for loan status updates
 */

import { AuditEventType, AuditSeverity, auditLogger } from "./audit-logging";

// Conflict types
export enum ConflictType {
  VERSION_MISMATCH = "version_mismatch",
  SIMULTANEOUS_UPDATE = "simultaneous_update",
  DATA_INCONSISTENCY = "data_inconsistency",
  ORPHANED_UPDATE = "orphaned_update",
  CONCURRENT_MODIFICATION = "concurrent_modification",
}

// Resolution strategies
export enum ResolutionStrategy {
  LAST_WRITE_WINS = "last_write_wins",
  FIRST_WRITE_WINS = "first_write_wins",
  MANUAL_RESOLUTION = "manual_resolution",
  MERGE = "merge",
  REJECT = "reject",
  RETRY = "retry",
}

// Data version interface
export interface DataVersion {
  version: number;
  timestamp: string;
  userId: string;
  checksum: string;
  parentVersion?: number;
  conflictResolution?: ResolutionStrategy;
}

// Conflict event interface
export interface ConflictEvent {
  id: string;
  type: ConflictType;
  resourceId: string;
  resourceType:
    | "application_status"
    | "document"
    | "timeline"
    | "communication";
  localVersion: DataVersion;
  remoteVersion: DataVersion;
  proposedData: any;
  existingData: any;
  timestamp: string;
  userId: string;
  resolutionStrategy: ResolutionStrategy;
  resolved: boolean;
  resolutionData?: any;
  resolutionTimestamp?: string;
  resolutionUserId?: string;
  metadata: {
    conflictingFields: string[];
    severity: "low" | "medium" | "high" | "critical";
    autoResolvable: boolean;
    vietnameseCompliance: {
      requiresManualReview: boolean;
      notificationRequired: boolean;
      auditTrailRequired: boolean;
    };
  };
}

// Conflict resolution configuration
export interface ConflictResolutionConfig {
  enableAutomaticResolution: boolean;
  defaultStrategy: ResolutionStrategy;
  maxRetryAttempts: number;
  retryDelayMs: number;
  conflictRetentionDays: number;
  enableOptimisticLocking: boolean;
  enableVersionValidation: boolean;
  vietnameseCompliance: {
    requireManualReviewForStatus: boolean;
    requireAuditTrailForAllConflicts: boolean;
    enableConflictNotifications: boolean;
  };
}

// Default configuration
const DEFAULT_CONFLICT_CONFIG: ConflictResolutionConfig = {
  enableAutomaticResolution: true,
  defaultStrategy: ResolutionStrategy.LAST_WRITE_WINS,
  maxRetryAttempts: 3,
  retryDelayMs: 1000,
  conflictRetentionDays: 90,
  enableOptimisticLocking: true,
  enableVersionValidation: true,
  vietnameseCompliance: {
    requireManualReviewForStatus: true,
    requireAuditTrailForAllConflicts: true,
    enableConflictNotifications: true,
  },
};

/**
 * Conflict Resolution Manager
 */
export class ConflictResolutionManager {
  private config: ConflictResolutionConfig;
  private pendingConflicts: Map<string, ConflictEvent> = new Map();
  private versionCache: Map<string, DataVersion> = new Map();
  private retryAttempts: Map<string, number> = new Map();

  constructor(config: Partial<ConflictResolutionConfig> = {}) {
    this.config = { ...DEFAULT_CONFLICT_CONFIG, ...config };
  }

  /**
   * Update data with conflict resolution
   */
  async updateWithConflictResolution(
    resourceId: string,
    resourceType: ConflictEvent["resourceType"],
    proposedData: any,
    currentVersion?: DataVersion,
    userId?: string,
  ): Promise<{
    success: boolean;
    data?: any;
    version?: DataVersion;
    conflict?: ConflictEvent;
    requiresRetry?: boolean;
  }> {
    try {
      // Get latest version
      const latestVersion = await this.getLatestVersion(resourceId);

      // Validate version if provided
      if (currentVersion && this.config.enableVersionValidation) {
        const validationResult = this.validateVersion(
          currentVersion,
          latestVersion,
        );
        if (!validationResult.valid) {
          return this.handleVersionConflict(
            resourceId,
            resourceType,
            proposedData,
            currentVersion,
            latestVersion,
            userId,
          );
        }
      }

      // Calculate new version
      const newVersion = this.createNewVersion(
        proposedData,
        userId,
        latestVersion,
      );

      // Check for potential conflicts
      const conflict = await this.detectConflict(
        resourceId,
        resourceType,
        proposedData,
        latestVersion,
      );
      if (conflict) {
        return await this.resolveConflict(conflict, userId);
      }

      // Update is successful
      await this.updateVersionCache(resourceId, newVersion);

      await auditLogger.logApplicationEvent(
        AuditEventType.APPLICATION_UPDATED,
        resourceId,
        userId || "system",
        "success",
        {
          resourceType,
          newVersion: newVersion.version,
          conflictDetected: false,
        },
      );

      return {
        success: true,
        data: proposedData,
        version: newVersion,
      };
    } catch (error) {
      await auditLogger.logSecurityEvent(
        AuditEventType.SYSTEM_ERROR,
        AuditSeverity.MEDIUM,
        {
          error: error instanceof Error ? error.message : "Unknown error",
          resourceId,
          resourceType,
        },
      );

      return {
        success: false,
        requiresRetry: true,
      };
    }
  }

  /**
   * Get current version for resource
   */
  async getCurrentVersion(resourceId: string): Promise<DataVersion | null> {
    const cached = this.versionCache.get(resourceId);
    if (cached) {
      return cached;
    }

    // In a real implementation, this would fetch from the server
    return null;
  }

  /**
   * Get pending conflicts
   */
  getPendingConflicts(resourceId?: string): ConflictEvent[] {
    const conflicts = Array.from(this.pendingConflicts.values());

    if (resourceId) {
      return conflicts.filter((conflict) => conflict.resourceId === resourceId);
    }

    return conflicts.filter((conflict) => !conflict.resolved);
  }

  /**
   * Manually resolve conflict
   */
  async resolveConflictManually(
    conflictId: string,
    resolutionData: any,
    resolutionUserId: string,
  ): Promise<boolean> {
    const conflict = this.pendingConflicts.get(conflictId);
    if (!conflict) {
      return false;
    }

    try {
      // Apply resolution
      const resolvedVersion = this.createNewVersion(
        resolutionData,
        resolutionUserId,
        conflict.remoteVersion,
      );

      // Update conflict
      conflict.resolved = true;
      conflict.resolutionData = resolutionData;
      conflict.resolutionTimestamp = new Date().toISOString();
      conflict.resolutionUserId = resolutionUserId;

      // Update version cache
      await this.updateVersionCache(conflict.resourceId, resolvedVersion);

      // Log resolution
      await auditLogger.logApplicationEvent(
        AuditEventType.APPLICATION_UPDATED,
        conflict.resourceId,
        resolutionUserId,
        "success",
        {
          conflictType: conflict.type,
          resolutionStrategy: "manual",
          previousVersion: conflict.localVersion.version,
          newVersion: resolvedVersion.version,
        },
      );

      // Remove from pending conflicts
      this.pendingConflicts.delete(conflictId);

      return true;
    } catch (error) {
      await auditLogger.logSecurityEvent(
        AuditEventType.SYSTEM_ERROR,
        AuditSeverity.HIGH,
        {
          error: error instanceof Error ? error.message : "Unknown error",
          conflictId,
          action: "manual_conflict_resolution",
        },
      );

      return false;
    }
  }

  /**
   * Apply optimistic locking
   */
  applyOptimisticLocking(data: any, version: DataVersion): any {
    return {
      ...data,
      _version: version.version,
      _timestamp: version.timestamp,
      _checksum: version.checksum,
    };
  }

  /**
   * Validate optimistic lock
   */
  validateOptimisticLock(data: any, expectedVersion: DataVersion): boolean {
    return (
      data._version === expectedVersion.version &&
      data._timestamp === expectedVersion.timestamp &&
      data._checksum === expectedVersion.checksum
    );
  }

  /**
   * Get conflict statistics
   */
  getConflictStatistics(timeRange?: { start: Date; end: Date }): {
    totalConflicts: number;
    conflictsByType: Record<ConflictType, number>;
    conflictsByStrategy: Record<ResolutionStrategy, number>;
    resolutionRate: number;
    averageResolutionTime: number;
    vietnameseComplianceScore: number;
  } {
    const conflicts = Array.from(this.pendingConflicts.values());

    const filteredConflicts = timeRange
      ? conflicts.filter((conflict) => {
          const conflictDate = new Date(conflict.timestamp);
          return (
            conflictDate >= timeRange.start && conflictDate <= timeRange.end
          );
        })
      : conflicts;

    const conflictsByType = filteredConflicts.reduce(
      (acc, conflict) => {
        acc[conflict.type] = (acc[conflict.type] || 0) + 1;
        return acc;
      },
      {} as Record<ConflictType, number>,
    );

    const conflictsByStrategy = filteredConflicts.reduce(
      (acc, conflict) => {
        acc[conflict.resolutionStrategy] =
          (acc[conflict.resolutionStrategy] || 0) + 1;
        return acc;
      },
      {} as Record<ResolutionStrategy, number>,
    );

    const resolvedConflicts = filteredConflicts.filter(
      (conflict) => conflict.resolved,
    );
    const resolutionRate =
      filteredConflicts.length > 0
        ? resolvedConflicts.length / filteredConflicts.length
        : 0;

    const averageResolutionTime =
      resolvedConflicts.length > 0
        ? resolvedConflicts.reduce((sum, conflict) => {
            if (conflict.resolutionTimestamp) {
              const resolutionTime =
                new Date(conflict.resolutionTimestamp).getTime() -
                new Date(conflict.timestamp).getTime();
              return sum + resolutionTime;
            }
            return sum;
          }, 0) / resolvedConflicts.length
        : 0;

    // Vietnamese compliance score
    let complianceScore = 100;
    const _manualReviewRequired = filteredConflicts.filter(
      (c) => c.metadata.vietnameseCompliance.requiresManualReview,
    ).length;
    const auditTrailComplete = filteredConflicts.filter(
      (c) => c.metadata.vietnameseCompliance.auditTrailRequired,
    ).length;

    complianceScore -=
      (manualReviewResolved / Math.max(resolvedConflicts.length, 1)) * 20;
    complianceScore -=
      (auditTrailComplete / Math.max(filteredConflicts.length, 1)) * 10;
    complianceScore -= (1 - resolutionRate) * 30;

    const manualReviewResolved = resolvedConflicts.filter(
      (c) => c.metadata.vietnameseCompliance.requiresManualReview,
    ).length;

    return {
      totalConflicts: filteredConflicts.length,
      conflictsByType,
      conflictsByStrategy,
      resolutionRate,
      averageResolutionTime,
      vietnameseComplianceScore: Math.max(0, complianceScore),
    };
  }

  // Private methods

  private async getLatestVersion(
    resourceId: string,
  ): Promise<DataVersion | null> {
    return this.versionCache.get(resourceId) || null;
  }

  private validateVersion(
    localVersion: DataVersion,
    remoteVersion: DataVersion | null,
  ): {
    valid: boolean;
    conflictType?: ConflictType;
  } {
    if (!remoteVersion) {
      return { valid: true };
    }

    if (localVersion.version !== remoteVersion.version) {
      return {
        valid: false,
        conflictType: ConflictType.VERSION_MISMATCH,
      };
    }

    if (localVersion.checksum !== remoteVersion.checksum) {
      return {
        valid: false,
        conflictType: ConflictType.DATA_INCONSISTENCY,
      };
    }

    if (new Date(localVersion.timestamp) < new Date(remoteVersion.timestamp)) {
      return {
        valid: false,
        conflictType: ConflictType.SIMULTANEOUS_UPDATE,
      };
    }

    return { valid: true };
  }

  private async handleVersionConflict(
    resourceId: string,
    resourceType: ConflictEvent["resourceType"],
    proposedData: any,
    localVersion: DataVersion,
    remoteVersion: DataVersion,
    userId?: string,
  ): Promise<{
    success: boolean;
    data?: any;
    version?: DataVersion;
    conflict?: ConflictEvent;
    requiresRetry?: boolean;
  }> {
    const conflict: ConflictEvent = {
      id: this.generateConflictId(),
      type: ConflictType.VERSION_MISMATCH,
      resourceId,
      resourceType,
      localVersion,
      remoteVersion,
      proposedData,
      existingData: {}, // Would be populated with actual existing data
      timestamp: new Date().toISOString(),
      userId: userId || "system",
      resolutionStrategy: this.config.defaultStrategy,
      resolved: false,
      metadata: {
        conflictingFields: this.identifyConflictingFields(proposedData, {}),
        severity: this.assessConflictSeverity(proposedData, {}),
        autoResolvable: this.isConflictAutoResolvable(proposedData, {}),
        vietnameseCompliance: {
          requiresManualReview:
            this.config.vietnameseCompliance.requireManualReviewForStatus,
          notificationRequired:
            this.config.vietnameseCompliance.enableConflictNotifications,
          auditTrailRequired:
            this.config.vietnameseCompliance.requireAuditTrailForAllConflicts,
        },
      },
    };

    this.pendingConflicts.set(conflict.id, conflict);

    // Try automatic resolution if enabled
    if (
      this.config.enableAutomaticResolution &&
      conflict.metadata.autoResolvable
    ) {
      return await this.resolveConflict(conflict, userId);
    }

    return {
      success: false,
      conflict,
    };
  }

  private async detectConflict(
    resourceId: string,
    resourceType: ConflictEvent["resourceType"],
    proposedData: any,
    currentVersion: DataVersion | null,
  ): Promise<ConflictEvent | null> {
    // Check for pending conflicts
    const existingConflict = Array.from(this.pendingConflicts.values()).find(
      (conflict) => conflict.resourceId === resourceId && !conflict.resolved,
    );

    if (existingConflict) {
      return existingConflict;
    }

    // Check for concurrent modifications
    if (
      currentVersion &&
      this.isConcurrentModification(proposedData, currentVersion)
    ) {
      return this.createConflictEvent(
        resourceId,
        resourceType,
        ConflictType.CONCURRENT_MODIFICATION,
        proposedData,
        currentVersion,
      );
    }

    return null;
  }

  private async resolveConflict(
    conflict: ConflictEvent,
    userId?: string,
  ): Promise<{
    success: boolean;
    data?: any;
    version?: DataVersion;
    conflict?: ConflictEvent;
    requiresRetry?: boolean;
  }> {
    try {
      switch (conflict.resolutionStrategy) {
        case ResolutionStrategy.LAST_WRITE_WINS:
          return await this.resolveLastWriteWins(conflict, userId);

        case ResolutionStrategy.FIRST_WRITE_WINS:
          return await this.resolveFirstWriteWins(conflict, userId);

        case ResolutionStrategy.MERGE:
          return await this.resolveMerge(conflict, userId);

        case ResolutionStrategy.RETRY:
          return await this.resolveRetry(conflict, userId);

        case ResolutionStrategy.REJECT:
          return await this.resolveReject(conflict, userId);

        default:
          return {
            success: false,
            conflict,
          };
      }
    } catch (error) {
      await auditLogger.logSecurityEvent(
        AuditEventType.SYSTEM_ERROR,
        AuditSeverity.HIGH,
        {
          error: error instanceof Error ? error.message : "Unknown error",
          conflictId: conflict.id,
          strategy: conflict.resolutionStrategy,
        },
      );

      return {
        success: false,
        conflict,
        requiresRetry: true,
      };
    }
  }

  private async resolveLastWriteWins(
    conflict: ConflictEvent,
    userId?: string,
  ): Promise<{
    success: boolean;
    data?: any;
    version?: DataVersion;
  }> {
    const newVersion = this.createNewVersion(
      conflict.proposedData,
      userId,
      conflict.remoteVersion,
    );

    conflict.resolved = true;
    conflict.resolutionData = conflict.proposedData;
    conflict.resolutionTimestamp = new Date().toISOString();
    conflict.resolutionUserId = userId || "system";

    await this.updateVersionCache(conflict.resourceId, newVersion);
    this.pendingConflicts.delete(conflict.id);

    return {
      success: true,
      data: conflict.proposedData,
      version: newVersion,
    };
  }

  private async resolveFirstWriteWins(
    conflict: ConflictEvent,
    userId?: string,
  ): Promise<{
    success: boolean;
    data?: any;
    version?: DataVersion;
  }> {
    // Keep existing data, reject proposed data
    conflict.resolved = true;
    conflict.resolutionData = conflict.existingData;
    conflict.resolutionTimestamp = new Date().toISOString();
    conflict.resolutionUserId = userId || "system";

    this.pendingConflicts.delete(conflict.id);

    return {
      success: true,
      data: conflict.existingData,
      version: conflict.localVersion,
    };
  }

  private async resolveMerge(
    conflict: ConflictEvent,
    userId?: string,
  ): Promise<{
    success: boolean;
    data?: any;
    version?: DataVersion;
  }> {
    // Simple merge strategy - in production, implement sophisticated merging
    const mergedData = {
      ...conflict.existingData,
      ...conflict.proposedData,
      lastUpdated: new Date().toISOString(),
    };

    const newVersion = this.createNewVersion(
      mergedData,
      userId,
      conflict.remoteVersion,
    );

    conflict.resolved = true;
    conflict.resolutionData = mergedData;
    conflict.resolutionTimestamp = new Date().toISOString();
    conflict.resolutionUserId = userId || "system";

    await this.updateVersionCache(conflict.resourceId, newVersion);
    this.pendingConflicts.delete(conflict.id);

    return {
      success: true,
      data: mergedData,
      version: newVersion,
    };
  }

  private async resolveRetry(
    conflict: ConflictEvent,
    userId?: string,
  ): Promise<{
    success: boolean;
    requiresRetry?: boolean;
    conflict?: ConflictEvent;
  }> {
    const retryCount = this.retryAttempts.get(conflict.id) || 0;

    if (retryCount >= this.config.maxRetryAttempts) {
      // Convert to manual resolution
      conflict.resolutionStrategy = ResolutionStrategy.MANUAL_RESOLUTION;
      conflict.metadata.autoResolvable = false;

      return {
        success: false,
        conflict,
      };
    }

    this.retryAttempts.set(conflict.id, retryCount + 1);

    // Schedule retry
    setTimeout(
      async () => {
        await this.resolveConflict(conflict, userId);
      },
      this.config.retryDelayMs * 2 ** retryCount,
    );

    return {
      success: false,
      requiresRetry: true,
    };
  }

  private async resolveReject(
    conflict: ConflictEvent,
    userId?: string,
  ): Promise<{
    success: boolean;
    conflict?: ConflictEvent;
  }> {
    conflict.resolved = true;
    conflict.resolutionTimestamp = new Date().toISOString();
    conflict.resolutionUserId = userId || "system";

    this.pendingConflicts.delete(conflict.id);

    return {
      success: false,
    };
  }

  private createNewVersion(
    data: any,
    userId?: string,
    parentVersion?: DataVersion,
  ): DataVersion {
    const checksum = this.calculateChecksum(data);

    return {
      version: parentVersion ? parentVersion.version + 1 : 1,
      timestamp: new Date().toISOString(),
      userId: userId || "system",
      checksum,
      parentVersion: parentVersion?.version,
    };
  }

  private async updateVersionCache(
    resourceId: string,
    version: DataVersion,
  ): Promise<void> {
    this.versionCache.set(resourceId, version);
  }

  private calculateChecksum(data: any): string {
    // Simple checksum implementation - use SHA-256 in production
    const str = JSON.stringify(data);
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }
    return hash.toString(16);
  }

  private identifyConflictingFields(
    proposedData: any,
    existingData: any,
  ): string[] {
    const conflicts: string[] = [];

    for (const key in proposedData) {
      if (
        existingData[key] !== undefined &&
        proposedData[key] !== existingData[key]
      ) {
        conflicts.push(key);
      }
    }

    return conflicts;
  }

  private assessConflictSeverity(
    proposedData: any,
    existingData: any,
  ): "low" | "medium" | "high" | "critical" {
    const conflictingFields = this.identifyConflictingFields(
      proposedData,
      existingData,
    );

    if (
      conflictingFields.includes("status") ||
      conflictingFields.includes("amount")
    ) {
      return "critical";
    }

    if (conflictingFields.length > 5) {
      return "high";
    }

    if (conflictingFields.length > 2) {
      return "medium";
    }

    return "low";
  }

  private isConflictAutoResolvable(
    proposedData: any,
    existingData: any,
  ): boolean {
    const conflictingFields = this.identifyConflictingFields(
      proposedData,
      existingData,
    );

    // Auto-resolvable if conflicts are in non-critical fields
    const criticalFields = ["status", "amount", "applicationId", "userId"];
    const hasCriticalConflicts = conflictingFields.some((field) =>
      criticalFields.includes(field),
    );

    return !hasCriticalConflicts && conflictingFields.length <= 2;
  }

  private isConcurrentModification(
    _proposedData: any,
    currentVersion: DataVersion,
  ): boolean {
    const timeDiff = Date.now() - new Date(currentVersion.timestamp).getTime();
    return timeDiff < 5000; // Within 5 seconds
  }

  private createConflictEvent(
    resourceId: string,
    resourceType: ConflictEvent["resourceType"],
    type: ConflictType,
    proposedData: any,
    currentVersion: DataVersion,
  ): ConflictEvent {
    return {
      id: this.generateConflictId(),
      type,
      resourceId,
      resourceType,
      localVersion: currentVersion,
      remoteVersion: currentVersion,
      proposedData,
      existingData: {},
      timestamp: new Date().toISOString(),
      userId: "system",
      resolutionStrategy: this.config.defaultStrategy,
      resolved: false,
      metadata: {
        conflictingFields: [],
        severity: "medium",
        autoResolvable: true,
        vietnameseCompliance: {
          requiresManualReview:
            this.config.vietnameseCompliance.requireManualReviewForStatus,
          notificationRequired:
            this.config.vietnameseCompliance.enableConflictNotifications,
          auditTrailRequired:
            this.config.vietnameseCompliance.requireAuditTrailForAllConflicts,
        },
      },
    };
  }

  private generateConflictId(): string {
    return `conflict_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Singleton instance
export const conflictResolutionManager = new ConflictResolutionManager();

/**
 * Hook for conflict resolution
 */
export function useConflictResolution() {
  const updateWithResolution = (
    resourceId: string,
    resourceType: ConflictEvent["resourceType"],
    proposedData: any,
    currentVersion?: DataVersion,
    userId?: string,
  ) => {
    return conflictResolutionManager.updateWithConflictResolution(
      resourceId,
      resourceType,
      proposedData,
      currentVersion,
      userId,
    );
  };

  const getCurrentVersion = (resourceId: string) => {
    return conflictResolutionManager.getCurrentVersion(resourceId);
  };

  const getPendingConflicts = (resourceId?: string) => {
    return conflictResolutionManager.getPendingConflicts(resourceId);
  };

  const resolveManually = (
    conflictId: string,
    resolutionData: any,
    resolutionUserId: string,
  ) => {
    return conflictResolutionManager.resolveConflictManually(
      conflictId,
      resolutionData,
      resolutionUserId,
    );
  };

  const applyOptimisticLocking = (data: any, version: DataVersion) => {
    return conflictResolutionManager.applyOptimisticLocking(data, version);
  };

  const validateOptimisticLock = (data: any, expectedVersion: DataVersion) => {
    return conflictResolutionManager.validateOptimisticLock(
      data,
      expectedVersion,
    );
  };

  return {
    updateWithResolution,
    getCurrentVersion,
    getPendingConflicts,
    resolveManually,
    applyOptimisticLocking,
    validateOptimisticLock,
  };
}
