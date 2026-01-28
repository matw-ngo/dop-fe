// Financial Calculation Audit Logging
// Secure audit logging for Vietnamese loan calculations

import type {
  LoanCalculationParams,
  LoanCalculationResult,
} from "./interest-calculations";
import type { ComplianceCheckResult } from "./vietnamese-compliance";
import type { VietnameseLoanProduct } from "./vietnamese-loan-products";

/**
 * Audit log entry
 */
export interface AuditLogEntry {
  /** Unique ID for the log entry */
  id: string;
  /** Timestamp of the calculation */
  timestamp: string;
  /** User ID if available */
  userId?: string;
  /** Session ID */
  sessionId: string;
  /** Calculation type */
  calculationType:
    | "loan_calculation"
    | "eligibility_check"
    | "compliance_check"
    | "product_comparison";
  /** Input parameters (sanitized) */
  input: any;
  /** Output results */
  output?: any;
  /** Processing time in milliseconds */
  processingTime: number;
  /** Success status */
  success: boolean;
  /** Error message if failed */
  errorMessage?: string;
  /** Vietnamese compliance status */
  complianceStatus?: "compliant" | "non_compliant" | "warning";
  /** Risk level */
  riskLevel: "low" | "medium" | "high";
  /** IP address if available */
  ipAddress?: string;
  /** User agent if available */
  userAgent?: string;
  /** Additional metadata */
  metadata: Record<string, any>;
}

/**
 * Audit log configuration
 */
export interface AuditLogConfig {
  /** Enable audit logging */
  enabled: boolean;
  /** Log level */
  logLevel: "info" | "warn" | "error" | "debug";
  /** Maximum log entries to keep in memory */
  maxInMemoryLogs: number;
  /** Persist logs to storage */
  persistToStorage: boolean;
  /** Storage key for persistence */
  storageKey: string;
  /** Include sensitive data in logs (should be false in production) */
  includeSensitiveData: boolean;
  /** Anonymize user data */
  anonymizeUserData: boolean;
  /** Retention period in days */
  retentionPeriod: number;
}

/**
 * Vietnamese Financial Audit Logger
 */
export class VietnameseFinancialAuditLogger {
  private static instance: VietnameseFinancialAuditLogger;
  private config: AuditLogConfig;
  private logs: AuditLogEntry[] = [];
  private sessionId: string;

  private constructor(config: Partial<AuditLogConfig> = {}) {
    this.config = {
      enabled: process.env.NODE_ENV !== "test",
      logLevel: "info",
      maxInMemoryLogs: 1000,
      persistToStorage: true,
      storageKey: "vietnamese_loan_audit_logs",
      includeSensitiveData: false,
      anonymizeUserData: true,
      retentionPeriod: 90,
      ...config,
    };

    this.sessionId = this.generateSessionId();
    this.loadPersistedLogs();
  }

  /**
   * Get singleton instance
   */
  static getInstance(
    config?: Partial<AuditLogConfig>,
  ): VietnameseFinancialAuditLogger {
    if (!VietnameseFinancialAuditLogger.instance) {
      VietnameseFinancialAuditLogger.instance =
        new VietnameseFinancialAuditLogger(config);
    }
    return VietnameseFinancialAuditLogger.instance;
  }

  /**
   * Log loan calculation
   */
  logLoanCalculation(
    params: LoanCalculationParams,
    result: LoanCalculationResult | null,
    processingTime: number,
    error?: string,
    userId?: string,
  ): void {
    if (!this.config.enabled) return;

    const sanitizedInput = this.sanitizeInput(params);
    const riskLevel = this.assessRiskLevel(params, result);

    const logEntry: AuditLogEntry = {
      id: this.generateLogId(),
      timestamp: new Date().toISOString(),
      userId: this.config.anonymizeUserData ? this.hashValue(userId) : userId,
      sessionId: this.sessionId,
      calculationType: "loan_calculation",
      input: sanitizedInput,
      output: result ? this.sanitizeOutput(result) : undefined,
      processingTime,
      success: !error,
      errorMessage: error,
      riskLevel,
      metadata: {
        calculationMethod: params.rateType,
        loanType: "general",
        amountRange: this.categorizeAmount(params.principal),
        termRange: this.categorizeTerm(params.term),
      },
    };

    this.addLog(logEntry);
  }

  /**
   * Log compliance check
   */
  logComplianceCheck(
    product: VietnameseLoanProduct,
    complianceResult: ComplianceCheckResult,
    processingTime: number,
    userId?: string,
  ): void {
    if (!this.config.enabled) return;

    const sanitizedInput = this.sanitizeProductInput(product);

    const logEntry: AuditLogEntry = {
      id: this.generateLogId(),
      timestamp: new Date().toISOString(),
      userId: this.config.anonymizeUserData ? this.hashValue(userId) : userId,
      sessionId: this.sessionId,
      calculationType: "compliance_check",
      input: sanitizedInput,
      output: {
        compliant: complianceResult.compliant,
        score: complianceResult.score,
        failedChecksCount: complianceResult.failedChecks.length,
      },
      processingTime,
      success: true,
      complianceStatus: complianceResult.compliant
        ? "compliant"
        : complianceResult.score >= 60
          ? "warning"
          : "non_compliant",
      riskLevel: complianceResult.failedChecks.some(
        (c) => c.severity === "critical",
      )
        ? "high"
        : complianceResult.failedChecks.some((c) => c.severity === "major")
          ? "medium"
          : "low",
      metadata: {
        productId: product.id,
        bankCode: product.bank.code,
        loanType: product.loanType,
        regulatoryReferences: complianceResult.regulatoryReferences.map(
          (r) => r.regulation,
        ),
      },
    };

    this.addLog(logEntry);
  }

  /**
   * Get audit logs with optional filtering
   */
  getLogs(filter?: {
    userId?: string;
    calculationType?: string;
    dateFrom?: Date;
    dateTo?: Date;
    riskLevel?: string;
    limit?: number;
  }): AuditLogEntry[] {
    let filteredLogs = [...this.logs];

    if (filter?.userId) {
      const searchUserId = this.config.anonymizeUserData
        ? this.hashValue(filter.userId)
        : filter.userId;
      filteredLogs = filteredLogs.filter((log) => log.userId === searchUserId);
    }

    if (filter?.calculationType) {
      filteredLogs = filteredLogs.filter(
        (log) => log.calculationType === filter.calculationType,
      );
    }

    if (filter?.dateFrom) {
      filteredLogs = filteredLogs.filter(
        (log) => new Date(log.timestamp) >= filter.dateFrom!,
      );
    }

    if (filter?.dateTo) {
      filteredLogs = filteredLogs.filter(
        (log) => new Date(log.timestamp) <= filter.dateTo!,
      );
    }

    if (filter?.riskLevel) {
      filteredLogs = filteredLogs.filter(
        (log) => log.riskLevel === filter.riskLevel,
      );
    }

    if (filter?.limit) {
      filteredLogs = filteredLogs.slice(0, filter.limit);
    }

    return filteredLogs.sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    );
  }

  /**
   * Get compliance statistics
   */
  getComplianceStats(timeframe: number = 30): {
    totalCalculations: number;
    compliantCalculations: number;
    nonCompliantCalculations: number;
    warningCalculations: number;
    averageProcessingTime: number;
    riskDistribution: Record<string, number>;
    errorRate: number;
  } {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - timeframe);

    const recentLogs = this.logs.filter(
      (log) =>
        new Date(log.timestamp) >= cutoffDate &&
        log.calculationType === "loan_calculation",
    );

    const totalCalculations = recentLogs.length;
    const compliantCalculations = recentLogs.filter(
      (log) => log.complianceStatus === "compliant",
    ).length;
    const nonCompliantCalculations = recentLogs.filter(
      (log) => log.complianceStatus === "non_compliant",
    ).length;
    const warningCalculations = recentLogs.filter(
      (log) => log.complianceStatus === "warning",
    ).length;
    const failedCalculations = recentLogs.filter((log) => !log.success).length;

    const averageProcessingTime =
      totalCalculations > 0
        ? recentLogs.reduce((sum, log) => sum + log.processingTime, 0) /
          totalCalculations
        : 0;

    const riskDistribution = recentLogs.reduce(
      (acc, log) => {
        acc[log.riskLevel] = (acc[log.riskLevel] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    return {
      totalCalculations,
      compliantCalculations,
      nonCompliantCalculations,
      warningCalculations,
      averageProcessingTime: Math.round(averageProcessingTime),
      riskDistribution,
      errorRate:
        totalCalculations > 0
          ? (failedCalculations / totalCalculations) * 100
          : 0,
    };
  }

  /**
   * Export logs for compliance reporting
   */
  exportLogs(format: "json" | "csv" = "json"): string {
    const logsForExport = this.logs.map((log) => ({
      ...log,
      // Remove sensitive data for export
      userId: log.userId ? "***" : undefined,
      ipAddress: log.ipAddress ? "***" : undefined,
      userAgent: log.userAgent ? "***" : undefined,
    }));

    if (format === "json") {
      return JSON.stringify(logsForExport, null, 2);
    }

    // CSV format
    const headers = [
      "ID",
      "Timestamp",
      "Calculation Type",
      "Success",
      "Processing Time (ms)",
      "Risk Level",
      "Compliance Status",
      "Error Message",
    ];

    const rows = logsForExport.map((log) => [
      log.id,
      log.timestamp,
      log.calculationType,
      log.success,
      log.processingTime,
      log.riskLevel,
      log.complianceStatus || "",
      log.errorMessage || "",
    ]);

    return [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
  }

  /**
   * Clear old logs based on retention policy
   */
  clearOldLogs(): void {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - this.config.retentionPeriod);

    this.logs = this.logs.filter(
      (log) => new Date(log.timestamp) >= cutoffDate,
    );
    this.persistLogs();
  }

  /**
   * Generate unique log ID
   */
  private generateLogId(): string {
    return `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate session ID
   */
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Hash sensitive values for anonymity
   */
  private hashValue(value?: string): string | undefined {
    if (!value) return undefined;
    // Simple hash - in production, use a proper cryptographic hash
    let hash = 0;
    for (let i = 0; i < value.length; i++) {
      const char = value.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return `hash_${Math.abs(hash)}`;
  }

  /**
   * Sanitize input parameters
   */
  private sanitizeInput(params: LoanCalculationParams): any {
    if (this.config.includeSensitiveData) {
      return params;
    }

    return {
      principal: params.principal,
      term: params.term,
      annualRate: params.annualRate,
      rateType: params.rateType,
      calculationMethod: params.calculationMethod,
      hasPromotionalRate: !!params.promotionalRate,
      promotionalPeriod: params.promotionalPeriod,
      totalFees: (params.processingFee || 0) + (params.insuranceFee || 0),
      hasGracePeriod: !!params.gracePeriod,
    };
  }

  /**
   * Sanitize output results
   */
  private sanitizeOutput(result: LoanCalculationResult): any {
    if (this.config.includeSensitiveData) {
      return result;
    }

    return {
      monthlyPayment: result.monthlyPayment,
      totalInterest: result.totalInterest,
      totalFees: result.totalFees,
      totalPayable: result.totalPayable,
      effectiveAPR: result.effectiveAPR,
      term: result.summary.totalPayments,
      hasPromotionalSummary: !!result.promotionalSummary,
    };
  }

  /**
   * Sanitize product input for compliance checks
   */
  private sanitizeProductInput(product: VietnameseLoanProduct): any {
    return {
      productId: product.id,
      bankCode: product.bank.code,
      loanType: product.loanType,
      interestRate: product.interestRate.annual,
      maxAmount: product.amountLimits.max,
      minTerm: product.termOptions.min,
      maxTerm: product.termOptions.max,
      collateralRequired: product.eligibility.collateralRequired,
      sbvRegistrationNumber: product.regulatoryCompliance.sbvRegistrationNumber
        ? "registered"
        : "not_registered",
    };
  }

  /**
   * Assess risk level of calculation
   */
  private assessRiskLevel(
    params: LoanCalculationParams,
    _result: LoanCalculationResult | null,
  ): "low" | "medium" | "high" {
    // High risk indicators
    if (params.principal > 5000000000) return "high"; // > 5 tỷ VND
    if (params.annualRate > 20) return "high"; // > 20% interest
    if (params.term > 240) return "high"; // > 20 years

    // Medium risk indicators
    if (params.principal > 2000000000) return "medium"; // > 2 tỷ VND
    if (params.annualRate > 15) return "medium"; // > 15% interest
    if (params.term > 120) return "medium"; // > 10 years

    return "low";
  }

  /**
   * Categorize loan amount
   */
  private categorizeAmount(amount: number): string {
    if (amount <= 100000000) return "small"; // ≤ 100 triệu
    if (amount <= 1000000000) return "medium"; // ≤ 1 tỷ
    if (amount <= 5000000000) return "large"; // ≤ 5 tỷ
    return "enterprise"; // > 5 tỷ
  }

  /**
   * Categorize loan term
   */
  private categorizeTerm(term: number): string {
    if (term <= 12) return "short"; // ≤ 1 year
    if (term <= 60) return "medium"; // ≤ 5 years
    if (term <= 240) return "long"; // ≤ 20 years
    return "very_long"; // > 20 years
  }

  /**
   * Add log entry
   */
  private addLog(entry: AuditLogEntry): void {
    // Add client info if available
    if (typeof window !== "undefined") {
      entry.ipAddress = "client"; // In real implementation, get from request headers
      entry.userAgent = navigator.userAgent;
    }

    this.logs.unshift(entry);

    // Keep only the configured number of logs in memory
    if (this.logs.length > this.config.maxInMemoryLogs) {
      this.logs = this.logs.slice(0, this.config.maxInMemoryLogs);
    }

    this.persistLogs();
  }

  /**
   * Persist logs to storage
   */
  private persistLogs(): void {
    if (!this.config.persistToStorage || typeof window === "undefined") return;

    try {
      const logsToPersist = {
        logs: this.logs,
        sessionId: this.sessionId,
        lastUpdated: new Date().toISOString(),
      };

      localStorage.setItem(
        this.config.storageKey,
        JSON.stringify(logsToPersist),
      );
    } catch (error) {
      console.warn("Failed to persist audit logs:", error);
    }
  }

  /**
   * Load persisted logs from storage
   */
  private loadPersistedLogs(): void {
    if (!this.config.persistToStorage || typeof window === "undefined") return;

    try {
      const persisted = localStorage.getItem(this.config.storageKey);
      if (persisted) {
        const parsed = JSON.parse(persisted);
        if (parsed.logs && Array.isArray(parsed.logs)) {
          // Validate and filter logs
          this.logs = parsed.logs.filter(
            (log: any) => log?.id && log.timestamp && log.calculationType,
          );
        }
      }
    } catch (error) {
      console.warn("Failed to load persisted audit logs:", error);
    }
  }
}

export default VietnameseFinancialAuditLogger;
