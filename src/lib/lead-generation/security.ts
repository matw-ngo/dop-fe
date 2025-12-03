/**
 * Lead Generation Security Utilities
 * Comprehensive security controls for lead generation with Vietnamese compliance
 */

import crypto from 'crypto';
import { LeadDataEncryptionManager } from './data-encryption';
import { VietnameseComplianceManager } from './vietnamese-compliance';
import { securityUtils } from '@/lib/auth/secure-tokens';

// Security configuration
interface SecurityConfig {
  maxLoginAttempts: number;
  sessionTimeout: number;
  auditLogRetention: number;
  dataRetentionPeriod: number;
  enableEncryption: boolean;
  enableAuditLogging: boolean;
  enableRateLimiting: boolean;
  vietnameseComplianceEnabled: boolean;
}

// Audit log entry interface
interface SecurityAuditLog {
  id: string;
  timestamp: string;
  event: SecurityEvent;
  userId?: string;
  leadId?: string;
  ipAddress: string;
  userAgent: string;
  details: Record<string, any>;
  severity: 'low' | 'medium' | 'high' | 'critical';
  success: boolean;
  actionTaken?: string;
}

// Security event types
enum SecurityEvent {
  LEAD_ACCESS = 'lead_access',
  LEAD_CREATION = 'lead_creation',
  LEAD_MODIFICATION = 'lead_modification',
  LEAD_DELETION = 'lead_deletion',
  DATA_EXPORT = 'data_export',
  CONSENT_GRANTED = 'consent_granted',
  CONSENT_WITHDRAWN = 'consent_withdrawn',
  UNAUTHORIZED_ACCESS = 'unauthorized_access',
  SUSPICIOUS_ACTIVITY = 'suspicious_activity',
  SECURITY_BREACH = 'security_breach',
  RATE_LIMIT_EXCEEDED = 'rate_limit_exceeded',
  ENCRYPTION_FAILURE = 'encryption_failure',
  DATA_CORRUPTION = 'data_corruption',
  COMPLIANCE_VIOLATION = 'compliance_violation',
  TOKEN_EXPIRY = 'token_expiry',
  INVALID_TOKEN = 'invalid_token',
  IP_BLOCKED = 'ip_blocked',
  MALICIOUS_REQUEST = 'malicious_request',
}

// Vietnamese compliance breach types
enum ComplianceBreachType {
  UNAUTHORIZED_DATA_PROCESSING = 'unauthorized_data_processing',
  MISSING_CONSENT = 'missing_consent',
  DATA_RETENTION_VIOLATION = 'data_retention_violation',
  CONSENT_WITHDRAWAL_NOT_PROCESSED = 'consent_withdrawal_not_processed',
  INTERNATIONAL_TRANSFER_WITHOUT_CONSENT = 'international_transfer_without_consent',
  INSUFFICIENT_DATA_PROTECTION = 'insufficient_data_protection',
  BREACH_NOTIFICATION_DELAY = 'breach_notification_delay',
  PRIVACY_POLICY_VIOLATION = 'privacy_policy_violation',
}

// Access control roles
enum AccessRole {
  ADMIN = 'admin',
  MANAGER = 'manager',
  AGENT = 'agent',
  VIEWER = 'viewer',
  COMPLIANCE_OFFICER = 'compliance_officer',
  AUDITOR = 'auditor',
}

// Permission sets for roles
const ROLE_PERMISSIONS: Record<AccessRole, string[]> = {
  [AccessRole.ADMIN]: [
    'lead:create', 'lead:read', 'lead:update', 'lead:delete',
    'lead:export', 'lead:bulk_operations',
    'user:create', 'user:read', 'user:update', 'user:delete',
    'system:configure', 'system:audit', 'compliance:manage',
    'encryption:manage', 'security:monitor',
  ],
  [AccessRole.MANAGER]: [
    'lead:create', 'lead:read', 'lead:update',
    'lead:export', 'lead:bulk_operations',
    'user:read', 'user:update',
    'compliance:read', 'security:monitor',
  ],
  [AccessRole.AGENT]: [
    'lead:create', 'lead:read', 'lead:update',
    'lead:export:limited',
  ],
  [AccessRole.VIEWER]: [
    'lead:read', 'lead:export:limited',
  ],
  [AccessRole.COMPLIANCE_OFFICER]: [
    'lead:read', 'lead:audit', 'compliance:manage',
    'system:audit', 'security:monitor',
  ],
  [AccessRole.AUDITOR]: [
    'lead:read', 'lead:audit', 'system:audit',
    'compliance:read', 'security:read',
  ],
};

/**
 * Lead Generation Security Manager
 */
export class LeadGenerationSecurityManager {
  private config: SecurityConfig;
  private encryptionManager: LeadDataEncryptionManager | null = null;
  private complianceManager: VietnameseComplianceManager | null = null;
  private auditLogs: SecurityAuditLog[] = [];
  private blockedIPs: Set<string> = new Set();
  private suspiciousActivities: Map<string, number> = new Map();
  private userSessions: Map<string, { timestamp: number; role: AccessRole }> = new Map();

  constructor(config: Partial<SecurityConfig> = {}) {
    this.config = {
      maxLoginAttempts: 5,
      sessionTimeout: 30 * 60 * 1000, // 30 minutes
      auditLogRetention: 365 * 24 * 60 * 60 * 1000, // 1 year
      dataRetentionPeriod: 2555 * 24 * 60 * 60 * 1000, // 7 years (Vietnamese compliance)
      enableEncryption: true,
      enableAuditLogging: true,
      enableRateLimiting: true,
      vietnameseComplianceEnabled: true,
      ...config,
    };
  }

  /**
   * Initialize security components
   */
  public initialize(
    encryptionManager?: LeadDataEncryptionManager,
    complianceManager?: VietnameseComplianceManager
  ): void {
    this.encryptionManager = encryptionManager || null;
    this.complianceManager = complianceManager || null;

    this.logSecurityEvent(
      SecurityEvent.LEAD_ACCESS,
      'system',
      {
        action: 'security_initialization',
        encryptionEnabled: !!this.encryptionManager,
        complianceEnabled: !!this.complianceManager,
        config: this.config,
      },
      'low'
    );
  }

  /**
   * Authenticate and authorize user session
   */
  public authenticateSession(
    sessionId: string,
    userId: string,
    role: AccessRole,
    ipAddress: string
  ): { success: boolean; reason?: string } {
    // Check if IP is blocked
    if (this.blockedIPs.has(ipAddress)) {
      this.logSecurityEvent(
        SecurityEvent.IP_BLOCKED,
        userId,
        { sessionId, ipAddress, reason: 'IP address is blocked' },
        'high'
      );
      return { success: false, reason: 'IP address is blocked' };
    }

    // Check rate limiting
    if (this.config.enableRateLimiting) {
      const activityKey = `${ipAddress}:auth_attempts`;
      const attempts = this.suspiciousActivities.get(activityKey) || 0;

      if (attempts >= this.config.maxLoginAttempts) {
        this.logSecurityEvent(
          SecurityEvent.RATE_LIMIT_EXCEEDED,
          userId,
          { sessionId, ipAddress, attempts },
          'medium'
        );
        return { success: false, reason: 'Too many authentication attempts' };
      }

      this.suspiciousActivities.set(activityKey, attempts + 1);
    }

    // Create session
    this.userSessions.set(sessionId, {
      timestamp: Date.now(),
      role,
    });

    this.logSecurityEvent(
      SecurityEvent.LEAD_ACCESS,
      userId,
      { sessionId, ipAddress, role, action: 'session_created' },
      'low'
    );

    return { success: true };
  }

  /**
   * Validate session and check permissions
   */
  public validateSession(
    sessionId: string,
    userId: string,
    requiredPermission: string,
    ipAddress: string
  ): { valid: boolean; reason?: string } {
    const session = this.userSessions.get(sessionId);

    if (!session) {
      this.logSecurityEvent(
        SecurityEvent.UNAUTHORIZED_ACCESS,
        userId,
        { sessionId, ipAddress, requiredPermission, reason: 'session_not_found' },
        'high'
      );
      return { valid: false, reason: 'Session not found' };
    }

    // Check session timeout
    if (Date.now() - session.timestamp > this.config.sessionTimeout) {
      this.userSessions.delete(sessionId);
      this.logSecurityEvent(
        SecurityEvent.TOKEN_EXPIRY,
        userId,
        { sessionId, ipAddress, reason: 'session_expired' },
        'medium'
      );
      return { valid: false, reason: 'Session expired' };
    }

    // Check permissions
    const userPermissions = ROLE_PERMISSIONS[session.role] || [];
    if (!userPermissions.includes(requiredPermission)) {
      this.logSecurityEvent(
        SecurityEvent.UNAUTHORIZED_ACCESS,
        userId,
        { sessionId, ipAddress, role: session.role, requiredPermission },
        'high'
      );
      return { valid: false, reason: 'Insufficient permissions' };
    }

    // Update session timestamp
    session.timestamp = Date.now();

    return { valid: true };
  }

  /**
   * Secure lead data processing with Vietnamese compliance
   */
  public secureLeadProcessing(
    leadData: any,
    leadId: string,
    userId: string,
    ipAddress: string,
    operation: 'create' | 'read' | 'update' | 'delete'
  ): { success: boolean; data?: any; error?: string } {
    try {
      // Vietnamese compliance check
      if (this.config.vietnameseComplianceEnabled && this.complianceManager) {
        const complianceResult = this.complianceManager.canProcessData(
          leadId,
          'loan_processing',
          'personal_data'
        );

        if (!complianceResult.allowed) {
          this.logComplianceViolation(
            userId,
            leadId,
            ComplianceBreachType.UNAUTHORIZED_DATA_PROCESSING,
            { reason: complianceResult.reason, operation }
          );
          return { success: false, error: 'Compliance check failed' };
        }
      }

      // Encrypt sensitive data
      let processedData = leadData;
      if (this.config.enableEncryption && this.encryptionManager) {
        if (operation === 'create' || operation === 'update') {
          processedData = this.encryptionManager.encryptLeadData(leadData, leadId);
        } else if (operation === 'read') {
          processedData = this.encryptionManager.decryptLeadData(leadData, leadId);
        }
      }

      // Log successful operation
      this.logSecurityEvent(
        SecurityEvent[`LEAD_${operation.toUpperCase()}` as SecurityEvent],
        userId,
        { leadId, operation, ipAddress, encrypted: this.config.enableEncryption },
        'low'
      );

      return { success: true, data: processedData };
    } catch (error) {
      this.logSecurityEvent(
        SecurityEvent.ENCRYPTION_FAILURE,
        userId,
        { leadId, operation, error: error.message },
        'high'
      );
      return { success: false, error: error.message };
    }
  }

  /**
   * Validate and process consent with Vietnamese compliance
   */
  public processConsent(
    leadId: string,
    consentType: string,
    consentGiven: boolean,
    userId: string,
    ipAddress: string,
    method: string = 'checkbox'
  ): { success: boolean; error?: string } {
    try {
      if (!this.complianceManager) {
        return { success: false, error: 'Compliance manager not initialized' };
      }

      // Create consent record
      const consentRecord = this.complianceManager.createConsentRecord(leadId, {
        type: consentType as any,
        consentGiven,
        ipAddress,
        userAgent: 'system',
        language: 'vi',
        method: method as any,
      });

      // Log consent action
      this.logSecurityEvent(
        consentGiven ? SecurityEvent.CONSENT_GRANTED : SecurityEvent.CONSENT_WITHDRAWN,
        userId,
        { leadId, consentType, method, consentId: consentRecord.id },
        'low'
      );

      return { success: true };
    } catch (error) {
      this.logComplianceViolation(
        userId,
        leadId,
        ComplianceBreachType.MISSING_CONSENT,
        { consentType, error: error.message }
      );
      return { success: false, error: error.message };
    }
  }

  /**
   * Handle consent withdrawal with data deletion
   */
  public handleConsentWithdrawal(
    leadId: string,
    consentId: string,
    userId: string,
    reason?: string
  ): { success: boolean; message?: string } {
    try {
      if (!this.complianceManager) {
        return { success: false, message: 'Compliance manager not initialized' };
      }

      const withdrawalSuccess = this.complianceManager.withdrawConsent(consentId, reason);

      if (withdrawalSuccess) {
        // Trigger data deletion process (30-day rule for Vietnamese compliance)
        this.scheduleDataDeletion(leadId, userId, 'consent_withdrawn');

        this.logSecurityEvent(
          SecurityEvent.CONSENT_WITHDRAWN,
          userId,
          { leadId, consentId, reason, dataDeletionScheduled: true },
          'medium'
        );

        return { success: true, message: 'Consent withdrawn and data deletion scheduled' };
      }

      return { success: false, message: 'Consent withdrawal failed' };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  /**
   * Schedule data deletion with Vietnamese compliance
   */
  private scheduleDataDeletion(leadId: string, userId: string, reason: string): void {
    // Schedule deletion in 30 days (Vietnamese compliance requirement)
    const deletionDate = new Date();
    deletionDate.setDate(deletionDate.getDate() + 30);

    this.logSecurityEvent(
      SecurityEvent.LEAD_DELETION,
      userId,
      {
        leadId,
        reason,
        scheduledDeletionDate: deletionDate.toISOString(),
        complianceFramework: 'Vietnamese Decree 13/2023',
      },
      'medium'
    );

    // In a real implementation, this would schedule a background job
    console.log(`Data deletion scheduled for lead ${leadId} on ${deletionDate.toISOString()}`);
  }

  /**
   * Detect and prevent suspicious activities
   */
  public detectSuspiciousActivity(
    userId: string,
    ipAddress: string,
    userAgent: string,
    action: string
  ): { isSuspicious: boolean; riskScore: number; action?: string } {
    let riskScore = 0;
    const reasons: string[] = [];

    // Check for rapid requests
    const activityKey = `${ipAddress}:${action}`;
    const recentActivities = this.suspiciousActivities.get(activityKey) || 0;

    if (recentActivities > 100) { // More than 100 actions in time window
      riskScore += 30;
      reasons.push('high_frequency_requests');
    }

    // Check for unusual user agent
    if (!userAgent || userAgent.length < 10) {
      riskScore += 20;
      reasons.push('suspicious_user_agent');
    }

    // Check for known malicious patterns
    if (this.containsMaliciousPatterns(userAgent)) {
      riskScore += 50;
      reasons.push('malicious_patterns_detected');
    }

    // Check for IP reputation (placeholder)
    if (this.isSuspiciousIP(ipAddress)) {
      riskScore += 40;
      reasons.push('suspicious_ip_address');
    }

    const isSuspicious = riskScore > 60;
    let actionTaken: string | undefined;

    if (isSuspicious) {
      if (riskScore > 80) {
        // Block IP
        this.blockedIPs.add(ipAddress);
        actionTaken = 'ip_blocked';
      } else {
        // Monitor closely
        actionTaken = 'increased_monitoring';
      }

      this.logSecurityEvent(
        SecurityEvent.SUSPICIOUS_ACTIVITY,
        userId,
        {
          ipAddress,
          userAgent,
          action,
          riskScore,
          reasons,
          actionTaken,
        },
        'high'
      );
    }

    // Update activity tracking
    this.suspiciousActivities.set(activityKey, recentActivities + 1);

    return { isSuspicious, riskScore, action: actionTaken };
  }

  /**
   * Check for malicious patterns in user agent or input
   */
  private containsMaliciousPatterns(input: string): boolean {
    const maliciousPatterns = [
      /sql/i,
      /union.*select/i,
      /javascript:/i,
      /<script/i,
      /onload=/i,
      /onerror=/i,
      /eval\(/i,
      /document\.cookie/i,
      /etc\/passwd/i,
      /\/proc\//i,
    ];

    return maliciousPatterns.some(pattern => pattern.test(input));
  }

  /**
   * Check if IP is suspicious (placeholder implementation)
   */
  private isSuspiciousIP(ipAddress: string): boolean {
    // In a real implementation, this would check against:
    // - Known malicious IP databases
    // - VPN/proxy detection
    // - Geolocation anomalies
    // - Request patterns

    // Simple check for localhost and private networks
    const privateIPRanges = [
      /^10\./,
      /^192\.168\./,
      /^172\.(1[6-9]|2[0-9]|3[0-1])\./,
      /^127\./,
    ];

    return !privateIPRanges.some(range => range.test(ipAddress));
  }

  /**
   * Log security event
   */
  private logSecurityEvent(
    event: SecurityEvent,
    userId?: string,
    details: Record<string, any> = {},
    severity: 'low' | 'medium' | 'high' | 'critical' = 'medium'
  ): void {
    if (!this.config.enableAuditLogging) return;

    const auditLog: SecurityAuditLog = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      event,
      userId,
      leadId: details.leadId,
      ipAddress: details.ipAddress || '0.0.0.0',
      userAgent: details.userAgent || 'System',
      details,
      severity,
      success: details.success !== false,
      actionTaken: details.actionTaken,
    };

    this.auditLogs.push(auditLog);
    this.cleanupOldAuditLogs();

    // In a real implementation, this would also send to external monitoring
    if (severity === 'critical' || severity === 'high') {
      console.warn('Security Alert:', auditLog);
    }
  }

  /**
   * Log compliance violation
   */
  private logComplianceViolation(
    userId: string,
    leadId: string,
    breachType: ComplianceBreachType,
    details: Record<string, any>
  ): void {
    this.logSecurityEvent(
      SecurityEvent.COMPLIANCE_VIOLATION,
      userId,
      {
        leadId,
        breachType,
        framework: 'Vietnamese Decree 13/2023',
        ...details,
      },
      'critical'
    );

    // In a real implementation, this would trigger compliance workflows
    console.error('Compliance Violation Detected:', {
      userId,
      leadId,
      breachType,
      details,
    });
  }

  /**
   * Clean up old audit logs based on retention policy
   */
  private cleanupOldAuditLogs(): void {
    const cutoffDate = new Date();
    cutoffDate.setTime(cutoffDate.getTime() - this.config.auditLogRetention);

    this.auditLogs = this.auditLogs.filter(
      log => new Date(log.timestamp) > cutoffDate
    );
  }

  /**
   * Get security dashboard data
   */
  public getSecurityDashboard(): {
    totalAuditLogs: number;
    securityEvents: Record<SecurityEvent, number>;
    blockedIPs: number;
    activeSessions: number;
    recentViolations: SecurityAuditLog[];
    encryptionStatus: boolean;
    complianceStatus: boolean;
  } {
    const securityEvents: Record<string, number> = {};

    this.auditLogs.forEach(log => {
      securityEvents[log.event] = (securityEvents[log.event] || 0) + 1;
    });

    const recentViolations = this.auditLogs
      .filter(log =>
        log.event === SecurityEvent.COMPLIANCE_VIOLATION ||
        log.event === SecurityEvent.SECURITY_BREACH ||
        log.severity === 'critical'
      )
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 10);

    return {
      totalAuditLogs: this.auditLogs.length,
      securityEvents: securityEvents as Record<SecurityEvent, number>,
      blockedIPs: this.blockedIPs.size,
      activeSessions: this.userSessions.size,
      recentViolations,
      encryptionStatus: this.config.enableEncryption && !!this.encryptionManager,
      complianceStatus: this.config.vietnameseComplianceEnabled && !!this.complianceManager,
    };
  }

  /**
   * Export audit logs for compliance reporting
   */
  public exportAuditLogs(
    startDate?: Date,
    endDate?: Date,
    eventTypes?: SecurityEvent[]
  ): SecurityAuditLog[] {
    let filteredLogs = [...this.auditLogs];

    if (startDate) {
      filteredLogs = filteredLogs.filter(
        log => new Date(log.timestamp) >= startDate
      );
    }

    if (endDate) {
      filteredLogs = filteredLogs.filter(
        log => new Date(log.timestamp) <= endDate
      );
    }

    if (eventTypes && eventTypes.length > 0) {
      filteredLogs = filteredLogs.filter(
        log => eventTypes.includes(log.event)
      );
    }

    return filteredLogs.sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }

  /**
   * Validate Vietnamese compliance requirements
   */
  public validateVietnameseCompliance(
    leadData: any,
    leadId: string
  ): { compliant: boolean; violations: string[] } {
    const violations: string[] = [];

    if (!this.complianceManager) {
      violations.push('Compliance manager not initialized');
      return { compliant: false, violations };
    }

    // Check for required consent
    const requiredConsents = ['data_processing', 'credit_check'];
    for (const consentType of requiredConsents) {
      if (!this.complianceManager.checkConsentValidity(leadId, consentType as any)) {
        violations.push(`Missing required consent: ${consentType}`);
      }
    }

    // Check data retention compliance
    const retentionResult = this.complianceManager.applyDataRetention(leadId);
    if (retentionResult.dataDeleted.length > 0) {
      // Log data deletion for compliance
      this.logSecurityEvent(
        SecurityEvent.LEAD_DELETION,
        'system',
        {
          leadId,
          reason: 'data_retention_policy',
          deletedDataTypes: retentionResult.dataDeleted,
        },
        'medium'
      );
    }

    // Check encryption requirements
    if (this.config.enableEncryption && !this.encryptionManager) {
      violations.push('Encryption required but not available');
    }

    return {
      compliant: violations.length === 0,
      violations,
    };
  }
}

// Default security manager instance
export const defaultSecurityManager = new LeadGenerationSecurityManager();

// Convenience functions
export const initializeSecurity = (
  encryptionManager?: LeadDataEncryptionManager,
  complianceManager?: VietnameseComplianceManager
): void => {
  defaultSecurityManager.initialize(encryptionManager, complianceManager);
};

export const authenticateLeadGenerationSession = (
  sessionId: string,
  userId: string,
  role: AccessRole,
  ipAddress: string
) => {
  return defaultSecurityManager.authenticateSession(sessionId, userId, role, ipAddress);
};

export const validateLeadGenerationPermission = (
  sessionId: string,
  userId: string,
  requiredPermission: string,
  ipAddress: string
) => {
  return defaultSecurityManager.validateSession(sessionId, userId, requiredPermission, ipAddress);
};

export default LeadGenerationSecurityManager;