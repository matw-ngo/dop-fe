/**
 * Comprehensive Audit Logging System
 * Provides detailed logging for Vietnamese compliance and security monitoring
 */

// Audit event types
export enum AuditEventType {
  // Authentication events
  LOGIN_SUCCESS = 'login_success',
  LOGIN_FAILED = 'login_failed',
  LOGOUT = 'logout',
  TOKEN_REFRESH = 'token_refresh',
  PASSWORD_CHANGE = 'password_change',

  // Loan application events
  APPLICATION_CREATED = 'application_created',
  APPLICATION_UPDATED = 'application_updated',
  APPLICATION_VIEWED = 'application_viewed',
  STATUS_CHANGE = 'status_change',
  DOCUMENT_UPLOADED = 'document_uploaded',
  DOCUMENT_VIEWED = 'document_viewed',
  DOCUMENT_DELETED = 'document_deleted',

  // Real-time connection events
  WEBSOCKET_CONNECTED = 'websocket_connected',
  WEBSOCKET_DISCONNECTED = 'websocket_disconnected',
  WEBSOCKET_MESSAGE_SENT = 'websocket_message_sent',
  WEBSOCKET_MESSAGE_RECEIVED = 'websocket_message_received',
  SSE_CONNECTION_ESTABLISHED = 'sse_connection_establishished',

  // Status tracking events
  STATUS_REFRESH = 'status_refresh',
  AUTO_REFRESH_ENABLED = 'auto_refresh_enabled',
  AUTO_REFRESH_DISABLED = 'auto_refresh_disabled',
  TIMELINE_VIEWED = 'timeline_viewed',
  MILESTONE_REACHED = 'milestone_reached',

  // Communication events
  MESSAGE_SENT = 'message_sent',
  MESSAGE_RECEIVED = 'message_received',
  NOTIFICATION_SENT = 'notification_sent',
  NOTIFICATION_VIEWED = 'notification_viewed',
  CALLBACK_REQUESTED = 'callback_requested',

  // Security events
  SECURITY_VIOLATION = 'security_violation',
  RATE_LIMIT_EXCEEDED = 'rate_limit_exceeded',
  SUSPICIOUS_ACTIVITY = 'suspicious_activity',
  FILE_SCAN_FAILED = 'file_scan_failed',
  UNAUTHORIZED_ACCESS = 'unauthorized_access',

  // System events
  SYSTEM_ERROR = 'system_error',
  PERFORMANCE_ISSUE = 'performance_issue',
  MAINTENANCE_MODE = 'maintenance_mode',
  BACKUP_COMPLETED = 'backup_completed',
}

// Audit event severity levels
export enum AuditSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

// Vietnamese compliance categories
export enum VietnameseComplianceCategory {
  DATA_PROTECTION = 'data_protection', // Decree 13/2023
  CONSUMER_PROTECTION = 'consumer_protection', // State Bank regulations
  FINANCIAL_REGULATION = 'financial_regulation', // SBV requirements
  PRIVACY = 'privacy', // Personal data protection
  SECURITY = 'security', // Security standards
  AUDIT = 'audit', // Audit trail requirements
}

// Audit event interface
export interface AuditEvent {
  id: string;
  timestamp: string;
  eventType: AuditEventType;
  severity: AuditSeverity;
  category: VietnameseComplianceCategory;
  userId?: string;
  applicationId?: string;
  sessionId?: string;
  ipAddress?: string;
  userAgent?: string;
  action: string;
  resource: string;
  outcome: 'success' | 'failure' | 'warning';
  details: Record<string, any>;
  metadata: {
    duration?: number;
    dataSize?: number;
    errorCode?: string;
    retryCount?: number;
    [key: string]: any;
  };
  vietnameseContext?: {
    regulation?: string;
    complianceStatus: 'compliant' | 'non_compliant' | 'partial';
    retentionDays: number;
    reportingRequired: boolean;
  };
}

// Audit logging configuration
export interface AuditLoggingConfig {
  enableConsoleLogging: boolean;
  enableRemoteLogging: boolean;
  remoteEndpoint?: string;
  batchSize: number;
  batchIntervalMs: number;
  retentionDays: number;
  enableEncryption: boolean;
  vietnameseCompliance: {
    requireDataProtection: boolean;
    requireConsumerProtection: boolean;
    requireFinancialRegulation: boolean;
    auditRetentionDays: number;
    reportingEnabled: boolean;
    stateBankReporting: boolean;
  };
}

// Default configuration optimized for Vietnamese compliance
const DEFAULT_AUDIT_CONFIG: AuditLoggingConfig = {
  enableConsoleLogging: true,
  enableRemoteLogging: true,
  remoteEndpoint: '/api/v1/audit/log',
  batchSize: 50,
  batchIntervalMs: 30000, // 30 seconds
  retentionDays: 2555, // 7 years (Vietnamese requirement)
  enableEncryption: true,
  vietnameseCompliance: {
    requireDataProtection: true,
    requireConsumerProtection: true,
    requireFinancialRegulation: true,
    auditRetentionDays: 2555,
    reportingEnabled: true,
    stateBankReporting: true,
  },
};

/**
 * Comprehensive Audit Logger
 */
export class AuditLogger {
  private config: AuditLoggingConfig;
  private eventQueue: AuditEvent[] = [];
  private batchTimer: NodeJS.Timeout | null = null;
  private sessionId: string;

  constructor(config: Partial<AuditLoggingConfig> = {}) {
    this.config = { ...DEFAULT_AUDIT_CONFIG, ...config };
    this.sessionId = this.generateSessionId();
    this.startBatchProcessor();
  }

  /**
   * Log an audit event
   */
  async logEvent(event: Partial<AuditEvent>): Promise<void> {
    const auditEvent: AuditEvent = {
      id: this.generateEventId(),
      timestamp: new Date().toISOString(),
      eventType: event.eventType || AuditEventType.SYSTEM_ERROR,
      severity: event.severity || AuditSeverity.LOW,
      category: event.category || VietnameseComplianceCategory.AUDIT,
      userId: this.getCurrentUserId(),
      sessionId: this.sessionId,
      ipAddress: await this.getClientIP(),
      userAgent: this.getUserAgent(),
      action: event.action || 'unknown_action',
      resource: event.resource || 'unknown_resource',
      outcome: event.outcome || 'success',
      details: event.details || {},
      metadata: event.metadata || {},
      vietnameseContext: {
        regulation: this.getVietnameseRegulation(event.eventType),
        complianceStatus: this.assessComplianceStatus(event),
        retentionDays: this.config.vietnameseCompliance.auditRetentionDays,
        reportingRequired: this.isReportingRequired(event.eventType),
      },
      ...event,
    };

    // Add to queue
    this.eventQueue.push(auditEvent);

    // Log to console if enabled
    if (this.config.enableConsoleLogging) {
      this.logToConsole(auditEvent);
    }

    // Process batch if queue is full
    if (this.eventQueue.length >= this.config.batchSize) {
      await this.processBatch();
    }
  }

  /**
   * Log authentication event
   */
  async logAuthEvent(
    eventType: AuditEventType,
    userId: string,
    outcome: 'success' | 'failure',
    details: Record<string, any> = {}
  ): Promise<void> {
    await this.logEvent({
      eventType,
      userId,
      outcome,
      category: VietnameseComplianceCategory.SECURITY,
      action: `authentication_${eventType}`,
      resource: 'user_session',
      severity: outcome === 'success' ? AuditSeverity.LOW : AuditSeverity.MEDIUM,
      details: {
        authenticationMethod: details.method || 'password',
        ...details,
      },
      vietnameseContext: {
        regulation: 'Circular 39/2014/TT-NHNN',
        complianceStatus: outcome === 'success' ? 'compliant' : 'non_compliant',
        retentionDays: this.config.vietnameseCompliance.auditRetentionDays,
        reportingRequired: false,
      },
    });
  }

  /**
   * Log loan application event
   */
  async logApplicationEvent(
    eventType: AuditEventType,
    applicationId: string,
    userId: string,
    outcome: 'success' | 'failure',
    details: Record<string, any> = {}
  ): Promise<void> {
    await this.logEvent({
      eventType,
      applicationId,
      userId,
      outcome,
      category: VietnameseComplianceCategory.FINANCIAL_REGULATION,
      action: `application_${eventType}`,
      resource: `loan_application:${applicationId}`,
      severity: this.getSeverityForEventType(eventType),
      details: {
        loanType: details.loanType,
        amount: details.amount,
        status: details.status,
        ...details,
      },
      vietnameseContext: {
        regulation: 'Decree 39/2016/NĐ-CP',
        complianceStatus: 'compliant',
        retentionDays: this.config.vietnameseCompliance.auditRetentionDays,
        reportingRequired: true,
      },
    });
  }

  /**
   * Log security event
   */
  async logSecurityEvent(
    eventType: AuditEventType,
    severity: AuditSeverity,
    details: Record<string, any> = {}
  ): Promise<void> {
    await this.logEvent({
      eventType,
      severity,
      category: VietnameseComplianceCategory.SECURITY,
      action: `security_${eventType}`,
      resource: 'system_security',
      outcome: 'warning',
      details: {
        securityLevel: severity,
        threatType: details.threatType,
        mitigation: details.mitigation,
        ...details,
      },
      vietnameseContext: {
        regulation: 'Circular 18/2020/TT-NHNN',
        complianceStatus: severity === AuditSeverity.CRITICAL ? 'non_compliant' : 'compliant',
        retentionDays: this.config.vietnameseCompliance.auditRetentionDays,
        reportingRequired: severity !== AuditSeverity.LOW,
      },
    });
  }

  /**
   * Log real-time communication event
   */
  async logRealTimeEvent(
    eventType: AuditEventType,
    applicationId: string,
    details: Record<string, any> = {}
  ): Promise<void> {
    await this.logEvent({
      eventType,
      applicationId,
      category: VietnameseComplianceCategory.DATA_PROTECTION,
      action: `realtime_${eventType}`,
      resource: `websocket:${applicationId}`,
      severity: AuditSeverity.LOW,
      outcome: 'success',
      details: {
        connectionType: details.connectionType,
        messageCount: details.messageCount,
        duration: details.duration,
        ...details,
      },
      vietnameseContext: {
        regulation: 'Decree 13/2023/NĐ-CP',
        complianceStatus: 'compliant',
        retentionDays: this.config.vietnameseCompliance.auditRetentionDays,
        reportingRequired: false,
      },
    });
  }

  /**
   * Get compliance report
   */
  getComplianceReport(timeRange: { start: Date; end: Date }): {
    totalEvents: number;
    eventsByCategory: Record<VietnameseComplianceCategory, number>;
    eventsBySeverity: Record<AuditSeverity, number>;
    complianceScore: number;
    violations: number;
    recommendations: string[];
  } {
    const eventsInRange = this.eventQueue.filter(event => {
      const eventDate = new Date(event.timestamp);
      return eventDate >= timeRange.start && eventDate <= timeRange.end;
    });

    const eventsByCategory = eventsInRange.reduce((acc, event) => {
      acc[event.category] = (acc[event.category] || 0) + 1;
      return acc;
    }, {} as Record<VietnameseComplianceCategory, number>);

    const eventsBySeverity = eventsInRange.reduce((acc, event) => {
      acc[event.severity] = (acc[event.severity] || 0) + 1;
      return acc;
    }, {} as Record<AuditSeverity, number>);

    const violations = eventsInRange.filter(event =>
      event.outcome === 'failure' || event.severity === AuditSeverity.CRITICAL
    ).length;

    // Calculate compliance score
    let complianceScore = 100;
    complianceScore -= (violations / Math.max(eventsInRange.length, 1)) * 50;
    complianceScore -= (eventsBySeverity[AuditSeverity.HIGH] || 0) * 5;
    complianceScore -= (eventsBySeverity[AuditSeverity.MEDIUM] || 0) * 2;

    const recommendations: string[] = [];
    if (violations > 0) recommendations.push('Address security violations immediately');
    if ((eventsBySeverity[AuditSeverity.HIGH] || 0) > 5) recommendations.push('Review high-severity events');
    if ((eventsByCategory[VietnameseComplianceCategory.SECURITY] || 0) > 50) recommendations.push('Monitor security events closely');
    if (complianceScore < 80) recommendations.push('Improve compliance measures');

    return {
      totalEvents: eventsInRange.length,
      eventsByCategory,
      eventsBySeverity,
      complianceScore: Math.max(0, complianceScore),
      violations,
      recommendations,
    };
  }

  /**
   * Export audit logs for Vietnamese regulatory reporting
   */
  async exportForRegulatoryReporting(timeRange: { start: Date; end: Date }): Promise<{
    exportData: any[];
    metadata: {
      exportDate: string;
      timeRange: { start: string; end: string };
      recordCount: number;
      complianceStatus: string;
      regulations: string[];
    };
  }> {
    const eventsInRange = this.eventQueue.filter(event => {
      const eventDate = new Date(event.timestamp);
      return eventDate >= timeRange.start && eventDate <= timeRange.end;
    });

    const exportData = eventsInRange.map(event => ({
      id: event.id,
      timestamp: event.timestamp,
      eventType: event.eventType,
      category: event.category,
      userId: event.userId,
      applicationId: event.applicationId,
      action: event.action,
      resource: event.resource,
      outcome: event.outcome,
      ipAddress: event.ipAddress,
      regulation: event.vietnameseContext?.regulation,
      complianceStatus: event.vietnameseContext?.complianceStatus,
    }));

    return {
      exportData,
      metadata: {
        exportDate: new Date().toISOString(),
        timeRange: {
          start: timeRange.start.toISOString(),
          end: timeRange.end.toISOString(),
        },
        recordCount: eventsInRange.length,
        complianceStatus: 'compliant',
        regulations: [
          'Decree 13/2023/NĐ-CP',
          'Decree 39/2016/NĐ-CP',
          'Circular 39/2014/TT-NHNN',
          'Circular 18/2020/TT-NHNN',
        ],
      },
    };
  }

  /**
   * Clear old events based on retention policy
   */
  clearOldEvents(): void {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - this.config.retentionDays);

    this.eventQueue = this.eventQueue.filter(event =>
      new Date(event.timestamp) >= cutoffDate
    );
  }

  /**
   * Flush pending events
   */
  async flush(): Promise<void> {
    if (this.eventQueue.length > 0) {
      await this.processBatch();
    }
  }

  // Private methods

  private generateEventId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateSessionId(): string {
    return `session_${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private getCurrentUserId(): string | undefined {
    try {
      const tokenStore = require('@/lib/auth/secure-tokens').useTokenStore.getState();
      const token = tokenStore.getAccessToken();
      if (token) {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.sub;
      }
    } catch {
      // Ignore errors
    }
    return undefined;
  }

  private async getClientIP(): Promise<string | undefined> {
    // In browser environment, IP is not directly available
    // This would be populated by server-side logging
    return undefined;
  }

  private getUserAgent(): string | undefined {
    return typeof window !== 'undefined' ? window.navigator.userAgent : undefined;
  }

  private getSeverityForEventType(eventType: AuditEventType): AuditSeverity {
    switch (eventType) {
      case AuditEventType.SECURITY_VIOLATION:
      case AuditEventType.UNAUTHORIZED_ACCESS:
        return AuditSeverity.CRITICAL;
      case AuditEventType.LOGIN_FAILED:
      case AuditEventType.RATE_LIMIT_EXCEEDED:
        return AuditSeverity.HIGH;
      case AuditEventType.STATUS_CHANGE:
      case AuditEventType.DOCUMENT_UPLOADED:
        return AuditSeverity.MEDIUM;
      default:
        return AuditSeverity.LOW;
    }
  }

  private getVietnameseRegulation(eventType: AuditEventType): string {
    const regulationMap: Record<AuditEventType, string> = {
      [AuditEventType.LOGIN_SUCCESS]: 'Circular 39/2014/TT-NHNN',
      [AuditEventType.LOGIN_FAILED]: 'Circular 39/2014/TT-NHNN',
      [AuditEventType.APPLICATION_CREATED]: 'Decree 39/2016/NĐ-CP',
      [AuditEventType.APPLICATION_UPDATED]: 'Decree 39/2016/NĐ-CP',
      [AuditEventType.DOCUMENT_UPLOADED]: 'Decree 13/2023/NĐ-CP',
      [AuditEventType.SECURITY_VIOLATION]: 'Circular 18/2020/TT-NHNN',
      [AuditEventType.UNAUTHORIZED_ACCESS]: 'Circular 18/2020/TT-NHNN',
    };

    return regulationMap[eventType] || 'General Banking Regulations';
  }

  private assessComplianceStatus(event: Partial<AuditEvent>): 'compliant' | 'non_compliant' | 'partial' {
    if (event.outcome === 'failure' || event.severity === AuditSeverity.CRITICAL) {
      return 'non_compliant';
    }
    if (event.severity === AuditSeverity.HIGH) {
      return 'partial';
    }
    return 'compliant';
  }

  private isReportingRequired(eventType: AuditEventType): boolean {
    const reportingRequiredEvents = [
      AuditEventType.APPLICATION_CREATED,
      AuditEventType.STATUS_CHANGE,
      AuditEventType.SECURITY_VIOLATION,
      AuditEventType.UNAUTHORIZED_ACCESS,
    ];

    return reportingRequiredEvents.includes(eventType);
  }

  private logToConsole(event: AuditEvent): void {
    const logMethod = event.severity === AuditSeverity.CRITICAL ? 'error' :
                     event.severity === AuditSeverity.HIGH ? 'warn' :
                     event.severity === AuditSeverity.MEDIUM ? 'warn' : 'log';

    console[logMethod](`[AUDIT] ${event.eventType}:`, {
      id: event.id,
      timestamp: event.timestamp,
      userId: event.userId,
      applicationId: event.applicationId,
      action: event.action,
      outcome: event.outcome,
      severity: event.severity,
      category: event.category,
    });
  }

  private startBatchProcessor(): void {
    this.batchTimer = setInterval(() => {
      if (this.eventQueue.length > 0) {
        this.processBatch();
      }
    }, this.config.batchIntervalMs);
  }

  private async processBatch(): Promise<void> {
    if (!this.config.enableRemoteLogging || !this.config.remoteEndpoint) {
      return;
    }

    const batch = this.eventQueue.splice(0, this.config.batchSize);

    try {
      const response = await fetch(this.config.remoteEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Session-ID': this.sessionId,
        },
        body: JSON.stringify({
          events: batch,
          metadata: {
            sessionId: this.sessionId,
            timestamp: new Date().toISOString(),
            batchSize: batch.length,
          },
        }),
      });

      if (!response.ok) {
        // Re-add events to queue if failed
        this.eventQueue.unshift(...batch);
        console.error('Failed to send audit logs to remote endpoint');
      }
    } catch (error) {
      // Re-add events to queue if failed
      this.eventQueue.unshift(...batch);
      console.error('Error sending audit logs:', error);
    }
  }
}

// Singleton instance
export const auditLogger = new AuditLogger();

/**
 * Hook for easy audit logging
 */
export function useAuditLogging() {
  const logAuthEvent = (eventType: AuditEventType, userId: string, outcome: 'success' | 'failure', details?: Record<string, any>) => {
    return auditLogger.logAuthEvent(eventType, userId, outcome, details);
  };

  const logApplicationEvent = (eventType: AuditEventType, applicationId: string, userId: string, outcome: 'success' | 'failure', details?: Record<string, any>) => {
    return auditLogger.logApplicationEvent(eventType, applicationId, userId, outcome, details);
  };

  const logSecurityEvent = (eventType: AuditEventType, severity: AuditSeverity, details?: Record<string, any>) => {
    return auditLogger.logSecurityEvent(eventType, severity, details);
  };

  const logRealTimeEvent = (eventType: AuditEventType, applicationId: string, details?: Record<string, any>) => {
    return auditLogger.logRealTimeEvent(eventType, applicationId, details);
  };

  const getComplianceReport = (timeRange: { start: Date; end: Date }) => {
    return auditLogger.getComplianceReport(timeRange);
  };

  return {
    logAuthEvent,
    logApplicationEvent,
    logSecurityEvent,
    logRealTimeEvent,
    getComplianceReport,
  };
}