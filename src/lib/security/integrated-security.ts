/**
 * Integrated Security System for Loan Status Tracking
 * Comprehensive security management with Vietnamese compliance
 */

import { auditLogger, useAuditLogging, AuditEventType, AuditSeverity } from './audit-logging';
import { loanStatusRateLimiter, useLoanStatusRateLimiting } from './status-rate-limiting';
import { conflictResolutionManager, useConflictResolution, ResolutionStrategy } from './conflict-resolution';
import { SecureWebSocketManager, createSecureLoanStatusWebSocket, vietnameseComplianceMonitor } from './websocket-security';
import { secureFileValidator } from './file-validation';
import { useTokenStore, securityUtils } from '@/lib/auth/secure-tokens';

// Security manager configuration
export interface IntegratedSecurityConfig {
  enableAuditLogging: boolean;
  enableRateLimiting: boolean;
  enableConflictResolution: boolean;
  enableWebSocketSecurity: boolean;
  enableFileValidation: boolean;
  vietnameseCompliance: {
    requireDataProtection: boolean;
    requireConsumerProtection: boolean;
    requireFinancialRegulation: boolean;
    auditRetentionDays: number;
    reportingEnabled: boolean;
    stateBankReporting: boolean;
  };
}

// Security context for operations
export interface SecurityContext {
  userId?: string;
  applicationId?: string;
  sessionId: string;
  ipAddress?: string;
  userAgent?: string;
  permissions: string[];
  securityLevel: 'public' | 'restricted' | 'confidential';
  vietnameseCompliance: {
    dataSubjectId?: string;
    consentGiven: boolean;
    processingPurpose: string;
    retentionPeriod: number;
  };
}

// Security operation result
export interface SecurityResult {
  success: boolean;
  data?: any;
  error?: string;
  securityViolations: string[];
  auditLogId?: string;
  complianceStatus: 'compliant' | 'non_compliant' | 'partial';
  recommendations: string[];
  metadata: {
    duration?: number;
    riskScore: number;
    confidence: number;
    [key: string]: any;
  };
}

// Default configuration
const DEFAULT_INTEGRATED_SECURITY_CONFIG: IntegratedSecurityConfig = {
  enableAuditLogging: true,
  enableRateLimiting: true,
  enableConflictResolution: true,
  enableWebSocketSecurity: true,
  enableFileValidation: true,
  vietnameseCompliance: {
    requireDataProtection: true,
    requireConsumerProtection: true,
    requireFinancialRegulation: true,
    auditRetentionDays: 2555, // 7 years per Vietnamese regulations
    reportingEnabled: true,
    stateBankReporting: true,
  },
};

/**
 * Integrated Security Manager
 */
export class IntegratedSecurityManager {
  private config: IntegratedSecurityConfig;
  private auditLogger = auditLogger;
  private rateLimiter = loanStatusRateLimiter;
  private conflictResolver = conflictResolutionManager;
  private complianceMonitor = vietnameseComplianceMonitor;

  constructor(config: Partial<IntegratedSecurityConfig> = {}) {
    this.config = { ...DEFAULT_INTEGRATED_SECURITY_CONFIG, ...config };
  }

  /**
   * Initialize security context for user session
   */
  async initializeSecurityContext(userId?: string): Promise<SecurityContext> {
    const tokenStore = useTokenStore.getState();
    const token = tokenStore.getAccessToken();

    let userData = {};
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        userData = {
          userId: payload.sub || userId,
          roles: payload.roles || [],
          permissions: payload.permissions || [],
        };
      } catch (error) {
        console.error('Failed to parse token:', error);
      }
    }

    const context: SecurityContext = {
      sessionId: this.generateSessionId(),
      userId: userData['userId'] || userId,
      permissions: userData['permissions'] || [],
      securityLevel: this.determineSecurityLevel(userData['permissions']),
      ipAddress: await this.getClientIP(),
      userAgent: this.getUserAgent(),
      vietnameseCompliance: {
        consentGiven: true, // In production, verify consent
        processingPurpose: 'loan_status_tracking',
        retentionPeriod: this.config.vietnameseCompliance.auditRetentionDays,
      },
    };

    // Log session initialization
    if (this.config.enableAuditLogging) {
      await this.auditLogger.logAuthEvent(
        AuditEventType.LOGIN_SUCCESS,
        context.userId || 'anonymous',
        'success',
        {
          sessionId: context.sessionId,
          securityLevel: context.securityLevel,
        }
      );
    }

    return context;
  }

  /**
   * Secure status update with all security checks
   */
  async secureStatusUpdate(
    context: SecurityContext,
    applicationId: string,
    updateData: any,
    currentVersion?: any
  ): Promise<SecurityResult> {
    const startTime = Date.now();
    const violations: string[] = [];
    let complianceStatus: 'compliant' | 'non_compliant' | 'partial' = 'compliant';

    try {
      // Rate limiting check
      if (this.config.enableRateLimiting) {
        const rateLimitResult = await this.rateLimiter.checkStatusRefresh(
          context.userId || 'anonymous',
          applicationId
        );

        if (!rateLimitResult.allowed) {
          violations.push(`Rate limit exceeded: ${rateLimitResult.reason}`);
          complianceStatus = 'partial';

          if (this.config.enableAuditLogging) {
            await this.auditLogger.logSecurityEvent(
              AuditEventType.RATE_LIMIT_EXCEEDED,
              AuditSeverity.MEDIUM,
              {
                userId: context.userId,
                applicationId,
                reason: rateLimitResult.reason,
              }
            );
          }

          return {
            success: false,
            error: 'Rate limit exceeded',
            securityViolations: violations,
            complianceStatus,
            recommendations: ['Wait before retrying', 'Check rate limit settings'],
            metadata: {
              riskScore: 60,
              confidence: 0.9,
            },
          };
        }
      }

      // Conflict resolution check
      if (this.config.enableConflictResolution) {
        const conflictResult = await this.conflictResolver.updateWithConflictResolution(
          applicationId,
          'application_status',
          updateData,
          currentVersion,
          context.userId
        );

        if (!conflictResult.success) {
          violations.push('Data conflict detected');
          complianceStatus = 'partial';

          if (conflictResult.conflict) {
            return {
              success: false,
              error: 'Data conflict detected',
              securityViolations: violations,
              complianceStatus,
              recommendations: ['Resolve data conflict manually', 'Refresh and retry'],
              metadata: {
                conflictId: conflictResult.conflict.id,
                conflictType: conflictResult.conflict.type,
                riskScore: 50,
                confidence: 0.8,
              },
            };
          }
        }
      }

      // Validate update data for security
      const validationResult = this.validateUpdateData(updateData);
      if (!validationResult.valid) {
        violations.push(...validationResult.violations);
        complianceStatus = 'non_compliant';

        if (this.config.enableAuditLogging) {
          await this.auditLogger.logSecurityEvent(
            AuditEventType.SECURITY_VIOLATION,
            AuditSeverity.HIGH,
            {
              userId: context.userId,
              applicationId,
              violations: validationResult.violations,
            }
          );
        }

        return {
          success: false,
          error: 'Invalid update data',
          securityViolations: violations,
          complianceStatus,
          recommendations: ['Review update data format', 'Remove sensitive information'],
          metadata: {
            riskScore: 80,
            confidence: 0.95,
          },
        };
      }

      // Sanitize update data
      const sanitizedData = this.sanitizeUpdateData(updateData);

      // Log successful update
      if (this.config.enableAuditLogging) {
        await this.auditLogger.logApplicationEvent(
          AuditEventType.APPLICATION_UPDATED,
          applicationId,
          context.userId || 'system',
          'success',
          {
            updateType: 'status_update',
            securityLevel: context.securityLevel,
            vietnameseCompliance: context.vietnameseCompliance,
          }
        );
      }

      return {
        success: true,
        data: sanitizedData,
        securityViolations: [],
        complianceStatus,
        recommendations: [],
        metadata: {
          duration: Date.now() - startTime,
          riskScore: 5,
          confidence: 0.95,
        },
      };

    } catch (error) {
      violations.push(`System error: ${error instanceof Error ? error.message : 'Unknown error'}`);

      if (this.config.enableAuditLogging) {
        await this.auditLogger.logSecurityEvent(
          AuditEventType.SYSTEM_ERROR,
          AuditSeverity.HIGH,
          {
            userId: context.userId,
            applicationId,
            error: error instanceof Error ? error.message : 'Unknown error',
          }
        );
      }

      return {
        success: false,
        error: 'System error during security check',
        securityViolations: violations,
        complianceStatus: 'non_compliant',
        recommendations: ['Contact system administrator', 'Retry operation'],
        metadata: {
          duration: Date.now() - startTime,
          riskScore: 70,
          confidence: 0.8,
        },
      };
    }
  }

  /**
   * Create secure WebSocket connection
   */
  createSecureWebSocket(applicationId: string, context: SecurityContext): SecureWebSocketManager | null {
    if (!this.config.enableWebSocketSecurity) {
      return null;
    }

    const ws = createSecureLoanStatusWebSocket(applicationId);

    // Set up security violation logging
    ws.onSecurityViolation((violation: string, state: any) => {
      if (this.config.enableAuditLogging) {
        this.auditLogger.logSecurityEvent(
          AuditEventType.SECURITY_VIOLATION,
          AuditSeverity.MEDIUM,
          {
            userId: context.userId,
            applicationId,
            violation,
            connectionScore: state.connectionScore,
          }
        );
      }
    });

    // Log connection establishment
    if (this.config.enableAuditLogging) {
      this.auditLogger.logRealTimeEvent(
        AuditEventType.WEBSOCKET_CONNECTED,
        applicationId,
        {
          userId: context.userId,
          sessionId: context.sessionId,
        }
      );
    }

    return ws;
  }

  /**
   * Validate file upload with comprehensive security checks
   */
  async validateFileUpload(
    context: SecurityContext,
    applicationId: string,
    file: File,
    documentType?: string
  ): Promise<SecurityResult> {
    const startTime = Date.now();
    const violations: string[] = [];

    try {
      // Check rate limiting
      if (this.config.enableRateLimiting) {
        const rateLimitResult = this.rateLimiter.checkDocumentUpload(
          context.userId || 'anonymous',
          applicationId,
          file.size
        );

        if (!rateLimitResult.allowed) {
          violations.push(`File upload rate limit exceeded: ${rateLimitResult.reason}`);
          return {
            success: false,
            error: 'Upload rate limit exceeded',
            securityViolations: violations,
            complianceStatus: 'partial',
            recommendations: ['Wait before uploading', 'Check file size limits'],
            metadata: {
              duration: Date.now() - startTime,
              riskScore: 40,
              confidence: 0.9,
            },
          };
        }
      }

      // File validation
      if (this.config.enableFileValidation) {
        const validationResult = await secureFileValidator.validateFile(file);

        if (!validationResult.isValid) {
          violations.push(...validationResult.errors);
          return {
            success: false,
            error: 'File validation failed',
            securityViolations: violations,
            complianceStatus: 'non_compliant',
            recommendations: [
              'Check file format requirements',
              'Ensure file is not corrupted',
              'Verify file size is within limits',
            ],
            metadata: {
              duration: Date.now() - startTime,
              securityScore: validationResult.securityScore,
              riskScore: 100 - validationResult.securityScore,
              confidence: validationResult.confidence,
            },
          };
        }

        // Log successful validation
        if (this.config.enableAuditLogging) {
          await this.auditLogger.logApplicationEvent(
            AuditEventType.DOCUMENT_UPLOADED,
            applicationId,
            context.userId || 'anonymous',
            'success',
            {
              fileValidationScore: validationResult.securityScore,
              vietnameseCompliance: validationResult.vietnameseCompliance,
            }
          );
        }

        return {
          success: true,
          data: {
            validation: validationResult,
            secureReference: this.generateSecureReference(file, context),
          },
          securityViolations: [],
          complianceStatus: validationResult.vietnameseCompliance.locationDataStripped &&
                          validationResult.vietnameseCompliance.metadataSanitized ? 'compliant' : 'partial',
          recommendations: validationResult.warnings,
          metadata: {
            duration: Date.now() - startTime,
            securityScore: validationResult.securityScore,
            riskScore: 100 - validationResult.securityScore,
            confidence: validationResult.confidence,
          },
        };
      }

      return {
        success: true,
        data: { secureReference: this.generateSecureReference(file, context) },
        securityViolations: [],
        complianceStatus: 'compliant',
        recommendations: [],
        metadata: {
          duration: Date.now() - startTime,
          riskScore: 10,
          confidence: 0.8,
        },
      };

    } catch (error) {
      violations.push(`File validation error: ${error instanceof Error ? error.message : 'Unknown error'}`);

      return {
        success: false,
        error: 'File validation error',
        securityViolations: violations,
        complianceStatus: 'non_compliant',
        recommendations: ['Try uploading the file again', 'Contact support if issue persists'],
        metadata: {
          duration: Date.now() - startTime,
          riskScore: 60,
          confidence: 0.7,
        },
      };
    }
  }

  /**
   * Generate comprehensive security report
   */
  async generateSecurityReport(
    context: SecurityContext,
    timeRange: { start: Date; end: Date }
  ): Promise<{
    auditReport: any;
    rateLimitReport: any;
    conflictReport: any;
    complianceReport: any;
    overallSecurityScore: number;
    recommendations: string[];
    vietnameseCompliance: {
      dataProtectionStatus: 'compliant' | 'non_compliant' | 'partial';
      consumerProtectionStatus: 'compliant' | 'non_compliant' | 'partial';
      financialRegulationStatus: 'compliant' | 'non_compliant' | 'partial';
      reportingRequired: boolean;
    };
  }> {
    const reports = {
      auditReport: this.config.enableAuditLogging ?
        this.auditLogger.getComplianceReport(timeRange) : null,

      rateLimitReport: this.config.enableRateLimiting ?
        this.rateLimiter.getVietnameseComplianceReport() : null,

      conflictReport: this.config.enableConflictResolution ?
        this.conflictResolver.getConflictStatistics(timeRange) : null,

      complianceReport: this.config.enableAuditLogging ?
        this.complianceMonitor.getComplianceReport() : null,
    };

    // Calculate overall security score
    let overallScore = 100;

    if (reports.auditReport?.complianceScore !== undefined) {
      overallScore -= (100 - reports.auditReport.complianceScore) * 0.3;
    }

    if (reports.rateLimitReport?.complianceScore !== undefined) {
      overallScore -= (100 - reports.rateLimitReport.complianceScore) * 0.2;
    }

    if (reports.conflictReport?.vietnameseComplianceScore !== undefined) {
      overallScore -= (100 - reports.conflictReport.vietnameseComplianceScore) * 0.3;
    }

    // Generate recommendations
    const recommendations: string[] = [];

    if (reports.auditReport?.violations > 0) {
      recommendations.push('Address audit violations');
    }

    if (reports.rateLimitReport?.violationRate > 0.1) {
      recommendations.push('Review rate limiting policies');
    }

    if (reports.conflictReport?.resolutionRate < 0.9) {
      recommendations.push('Improve conflict resolution processes');
    }

    const vietnameseCompliance = {
      dataProtectionStatus: overallScore > 80 ? 'compliant' as const :
                            overallScore > 60 ? 'partial' as const : 'non_compliant' as const,
      consumerProtectionStatus: overallScore > 75 ? 'compliant' as const :
                                overallScore > 55 ? 'partial' as const : 'non_compliant' as const,
      financialRegulationStatus: overallScore > 85 ? 'compliant' as const :
                                  overallScore > 65 ? 'partial' as const : 'non_compliant' as const,
      reportingRequired: this.config.vietnameseCompliance.reportingEnabled,
    };

    return {
      ...reports,
      overallSecurityScore: Math.max(0, overallScore),
      recommendations,
      vietnameseCompliance,
    };
  }

  // Private helper methods

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private async getClientIP(): Promise<string | undefined> {
    // In browser environment, IP is not directly available
    // This would be populated by server-side logging
    return undefined;
  }

  private getUserAgent(): string | undefined {
    return typeof window !== 'undefined' ? window.navigator.userAgent : undefined;
  }

  private determineSecurityLevel(permissions: string[]): 'public' | 'restricted' | 'confidential' {
    if (permissions.includes('admin') || permissions.includes('super_admin')) {
      return 'confidential';
    }
    if (permissions.includes('loan_officer') || permissions.includes('reviewer')) {
      return 'restricted';
    }
    return 'public';
  }

  private validateUpdateData(data: any): { valid: boolean; violations: string[] } {
    const violations: string[] = [];

    // Check for sensitive data patterns
    const sensitivePatterns = [
      /password/i,
      /secret/i,
      /token/i,
      /key/i,
      /\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}/, // Credit card pattern
      /\d{9,12}/, // ID numbers
    ];

    const dataString = JSON.stringify(data);
    for (const pattern of sensitivePatterns) {
      if (pattern.test(dataString)) {
        violations.push(`Sensitive data pattern detected: ${pattern.source}`);
      }
    }

    // Check data size limits
    if (dataString.length > 1024 * 1024) { // 1MB
      violations.push('Update data size exceeds limit');
    }

    return {
      valid: violations.length === 0,
      violations,
    };
  }

  private sanitizeUpdateData(data: any): any {
    // Remove sensitive fields
    const sensitiveFields = [
      'password',
      'secret',
      'token',
      'key',
      'creditCard',
      'ssn',
      'nationalId',
    ];

    const sanitized = Array.isArray(data) ? [...data] : { ...data };

    const removeSensitiveFields = (obj: any, path: string = ''): void => {
      if (typeof obj !== 'object' || obj === null) return;

      for (const key in obj) {
        const currentPath = path ? `${path}.${key}` : key;

        if (sensitiveFields.includes(key.toLowerCase())) {
          delete obj[key];
        } else if (typeof obj[key] === 'object') {
          removeSensitiveFields(obj[key], currentPath);
        }
      }
    };

    removeSensitiveFields(sanitized);
    return sanitized;
  }

  private generateSecureReference(file: File, context: SecurityContext): string {
    const timestamp = Date.now();
    const hash = btoa(`${file.name}_${file.size}_${context.userId}_${timestamp}`);
    return `ref_${hash.substring(0, 16)}`;
  }
}

// Singleton instance
export const integratedSecurityManager = new IntegratedSecurityManager();

/**
 * Hook for integrated security
 */
export function useIntegratedSecurity() {
  const initializeSecurityContext = (userId?: string) => {
    return integratedSecurityManager.initializeSecurityContext(userId);
  };

  const secureStatusUpdate = (context: SecurityContext, applicationId: string, updateData: any, currentVersion?: any) => {
    return integratedSecurityManager.secureStatusUpdate(context, applicationId, updateData, currentVersion);
  };

  const createSecureWebSocket = (applicationId: string, context: SecurityContext) => {
    return integratedSecurityManager.createSecureWebSocket(applicationId, context);
  };

  const validateFileUpload = (context: SecurityContext, applicationId: string, file: File, documentType?: string) => {
    return integratedSecurityManager.validateFileUpload(context, applicationId, file, documentType);
  };

  const generateSecurityReport = (context: SecurityContext, timeRange: { start: Date; end: Date }) => {
    return integratedSecurityManager.generateSecurityReport(context, timeRange);
  };

  return {
    initializeSecurityContext,
    secureStatusUpdate,
    createSecureWebSocket,
    validateFileUpload,
    generateSecurityReport,
  };
}