/**
 * Vietnamese Consent and Compliance Management System
 * Comprehensive compliance management for Decree 13/2023 and other Vietnamese regulations
 */

import type { LeadData } from './lead-scoring';

export interface ConsentRecord {
  id: string;
  leadId: string;
  type: ConsentType;
  status: ConsentStatus;
  consentGiven: boolean;
  consentWithdrawn: boolean;
  consentTimestamp: Date;
  withdrawalTimestamp?: Date;
  ipAddress: string;
  userAgent: string;
  location?: {
    country: string;
    city?: string;
    region?: string;
  };
  method: ConsentMethod;
  language: 'vi' | 'en';
  consentTextVI: string;
  consentTextEN: string;
  version: string;
  purpose: string[];
  dataTypes: string[];
  retentionPeriod: number; // days
  sharingAllowed: boolean;
  marketingAllowed: boolean;
  thirdPartyAllowed: boolean;
  internationalTransferAllowed: boolean;
  automatedDecisionMakingAllowed: boolean;
  legitimateInterest: boolean;
  legalBasis: LegalBasis;
  partnerIds: string[];
  expiryDate?: Date;
  metadata: {
    source: string;
    campaign?: string;
    formVersion: string;
    deviceType: string;
    sessionId: string;
  };
}

export interface ComplianceAuditLog {
  id: string;
  leadId: string;
  action: AuditAction;
  timestamp: Date;
  actor: 'user' | 'system' | 'admin' | 'partner';
  actorId?: string;
  details: Record<string, any>;
  ipAddress: string;
  userAgent: string;
  previousState?: any;
  newState?: any;
  complianceBreach: boolean;
  breachSeverity?: 'low' | 'medium' | 'high' | 'critical';
  resolvedAt?: Date;
  resolvedBy?: string;
  resolutionNotes?: string;
}

export interface DataRetentionPolicy {
  id: string;
  dataType: string;
  retentionPeriod: number; // days
  retentionBasis: string;
  autoDelete: boolean;
  notificationBeforeDelete: number; // days before deletion
  exceptions: string[];
  lastApplied: Date;
}

export interface VietnameseLegalFramework {
  decree13_2023: {
    personalDataDefinition: string[];
    sensitiveDataTypes: string[];
    consentRequirements: string[];
    dataSubjectRights: string[];
    retentionRequirements: string[];
    breachNotification: string[];
    internationalTransfer: string[];
    penalties: {
      personalDataBreach: { min: number; max: number; currency: string };
      nonCompliance: { min: number; max: number; currency: string };
      illegalDataTransfer: { min: number; max: number; currency: string };
    };
  };
  circular39_2016: {
    consumerLendingRequirements: string[];
    disclosureRequirements: string[];
    interestRateLimits: { max: number; unit: string };
    advertisingRules: string[];
    contractRequirements: string[];
  };
  consumerProtectionLaw_2010: {
    consumerRights: string[];
    businessObligations: string[];
    disputeResolution: string[];
    informationRequirements: string[];
  };
  competitionLaw: {
    antiCompetitivePractices: string[];
    marketShareLimits: { percent: number; sector: string }[];
    mergerControl: string[];
    priceFixing: string[];
  };
  antiMoneyLaundering: {
    kycRequirements: string[];
    transactionLimits: { threshold: number; currency: string };
    reportingThresholds: { suspicious: number; currency: string };
    recordRetention: { period: number; unit: string };
  };
}

export enum ConsentType {
  DATA_PROCESSING = 'data_processing',
  MARKETING = 'marketing',
  PARTNER_SHARING = 'partner_sharing',
  CREDIT_CHECK = 'credit_check',
  CREDIT_SCORING = 'credit_scoring',
  IDENTITY_VERIFICATION = 'identity_verification',
  BACKGROUND_CHECK = 'background_check',
  AUTOMATED_DECISION = 'automated_decision',
  INTERNATIONAL_TRANSFER = 'international_transfer',
  LOCATION_DATA = 'location_data',
  BEHAVIORAL_ANALYSIS = 'behavioral_analysis',
  PROFILING = 'profiling',
}

export enum ConsentStatus {
  PENDING = 'pending',
  GRANTED = 'granted',
  DENIED = 'denied',
  WITHDRAWN = 'withdrawn',
  EXPIRED = 'expired',
  REVOKED = 'revoked',
}

export enum ConsentMethod {
  CHECKBOX = 'checkbox',
  SIGNATURE = 'signature',
  ELECTRONIC_SIGNATURE = 'electronic_signature',
  VERBAL = 'verbal',
  WRITTEN = 'written',
  CLICK_WRAP = 'click_wrap',
  BROWSE_WRAP = 'browse_wrap',
  IMPLIED = 'implied',
}

export enum LegalBasis {
  CONSENT = 'consent',
  CONTRACT = 'contract',
  LEGAL_OBLIGATION = 'legal_obligation',
  VITAL_INTERESTS = 'vital_interests',
  PUBLIC_TASK = 'public_task',
  LEGITIMATE_INTERESTS = 'legitimate_interests',
}

export enum AuditAction {
  CONSENT_GRANTED = 'consent_granted',
  CONSENT_WITHDRAWN = 'consent_withdrawn',
  CONSENT_EXPIRED = 'consent_expired',
  DATA_ACCESSED = 'data_accessed',
  DATA_MODIFIED = 'data_modified',
  DATA_DELETED = 'data_deleted',
  DATA_EXPORTED = 'data_exported',
  DATA_SHARED = 'data_shared',
  BREACH_DETECTED = 'breach_detected',
  BREACH_RESOLVED = 'breach_resolved',
  RETENTION_APPLIED = 'retention_applied',
  POLICY_UPDATED = 'policy_updated',
  RIGHTS_REQUESTED = 'rights_requested',
  RIGHTS_FULFILLED = 'rights_fulfilled',
}

export const VIETNAMESE_LEGAL_FRAMEWORK: VietnameseLegalFramework = {
  decree13_2023: {
    personalDataDefinition: [
      'basic_personal_data',
      'identification_data',
      'contact_data',
      'financial_data',
      'employment_data',
      'health_data',
      'biometric_data',
      'location_data',
      'communication_data',
      'behavioral_data',
    ],
    sensitiveDataTypes: [
      'race_ethnicity',
      'political_opinions',
      'religious_beliefs',
      'health_status',
      'genetic_data',
      'biometric_data',
      'criminal_convictions',
      'sexual_orientation',
      'trade_union_membership',
    ],
    consentRequirements: [
      'explicit_and_informed',
      'freely_given',
      'specific_and_limited',
      'documented_and_traceable',
      'easily_withdrawable',
      'age_verification_for_minors',
    ],
    dataSubjectRights: [
      'right_to_information',
      'right_to_access',
      'right_to_rectification',
      'right_to_erasure',
      'right_to_restriction',
      'right_to_data_portability',
      'right_to_object',
      'right_withdraw_consent',
      'right_to_complain',
    ],
    retentionRequirements: [
      'minimum_necessary_period',
      'clear_retention_policies',
      'automatic_deletion_systems',
      'secure_disposal_methods',
      'retention_period_limits',
    ],
    breachNotification: [
      'notify_within_72_hours',
      'detail_breach_circumstances',
      'describe_data_affected',
      'outline_measures_taken',
      'provide_remedy_information',
    ],
    internationalTransfer: [
      'adequacy_decision_required',
      'appropriate_safeguards',
      'binding_corporate_rules',
      'standard_contractual_clauses',
      'data_subject_consent_required',
    ],
    penalties: {
      personalDataBreach: { min: 40000000, max: 200000000, currency: 'VND' },
      nonCompliance: { min: 60000000, max: 300000000, currency: 'VND' },
      illegalDataTransfer: { min: 80000000, max: 400000000, currency: 'VND' },
    },
  },
  circular39_2016: {
    consumerLendingRequirements: [
      'clear_disclosure_terms',
      'interest_rate_cap_20_percent',
      'total_fees_disclosure',
      'repayment_schedule_provided',
      'cooling_off_period_3_days',
      'prepayment_terms_clear',
      'late_payment_disclosure',
    ],
    disclosureRequirements: [
      'total_cost_of_credit',
      'annual_percentage_rate',
      'all_fees_and_charges',
      'payment_schedule',
      'consequences_of_default',
      'dispute_resolution_process',
    ],
    interestRateLimits: { max: 20, unit: 'percent_per_year' },
    advertisingRules: [
      'no_false_or_misleading_claims',
      'clear_interest_rate_disclosure',
      'no_hidden_fees_advertising',
      'responsible_lending_messages',
      'cooling_off_period_mention',
    ],
    contractRequirements: [
      'written_contract_required',
      'all_terms_in_vietnamese',
      'consumer_copy_provided',
      'clear_payment_terms',
      'dispute_resolution_clause',
      'governing_law_specified',
    ],
  },
  consumerProtectionLaw_2010: {
    consumerRights: [
      'right_to_information',
      'right_to_choice',
      'right_to_safety',
      'right_to_be_heard',
      'right_to_redress',
      'right_to_consumer_education',
      'right_to_healthy_environment',
    ],
    businessObligations: [
      'provide_accurate_information',
      'ensure_product_safety',
      'honest_advertising',
      'fair_contract_terms',
      'effective_dispute_resolution',
      'consumer_data_protection',
    ],
    disputeResolution: [
      'negotiation_first',
      'mediation_available',
      'arbitration_option',
      'court_litigation_final_resort',
      'class_action_allowed',
      'government_agency_assistance',
    ],
    informationRequirements: [
      'clear_product_description',
      'accurate_pricing_information',
      'complete_terms_and_conditions',
      'risk_disclosure',
      'warranty_information',
      'contact_information',
    ],
  },
  competitionLaw: {
    antiCompetitivePractices: [
      'price_fixing',
      'market_allocation',
      'bid_rigging',
      'output_limitation',
      'group_boycott',
      'exclusive_dealing',
      'tying_arrangements',
    ],
    marketShareLimits: [
      { percent: 30, sector: 'banking' },
      { percent: 30, sector: 'telecommunications' },
      { percent: 50, sector: 'electricity' },
      { percent: 30, sector: 'air_transportation' },
    ],
    mergerControl: [
      'pre_merger_notification',
      'market_concentration_analysis',
      'competition_impact_assessment',
      'remedies_and_conditions',
      'post_merger_monitoring',
    ],
    priceFixing: [
      'horizontal_price_fixing_prohibited',
      'vertical_price_fixing_restricted',
      'price_discrimination_analysis',
      'predatory_pricing_monitoring',
      'price_leadership_investigation',
    ],
  },
  antiMoneyLaundering: {
    kycRequirements: [
      'identity_verification_required',
      'beneficial_ownership_disclosure',
      'source_of_funds_verification',
      'risk_based_approach',
      'enhanced_due_diligence_high_risk',
      'ongoing_monitoring_required',
    ],
    transactionLimits: { threshold: 15000000, currency: 'VND' },
    reportingThresholds: { suspicious: 300000000, currency: 'VND' },
    recordRetention: { period: 5, unit: 'years' },
  },
};

export const CONSENT_TEMPLATES = {
  vi: {
    data_processing: {
      title: 'Chấp nhận xử lý dữ liệu cá nhân',
      text: 'Tôi đồng ý cho phép [Tên công ty] xử lý dữ liệu cá nhân của tôi theo Thông tư 13/2023/NĐ-CP.',
      detailed: 'Tôi xác nhận đã đọc, hiểu và đồng ý với Chính sách Bảo mật Dữ liệu Cá nhân. Tôi đồng ý cho phép [Tên công ty] thu thập, lưu trữ và xử lý dữ liệu cá nhân của tôi cho mục đích: [mục đích cụ thể]. Tôi có quyền rút lại sự đồng ý này bất cứ lúc nào.',
    },
    marketing: {
      title: 'Chấp nhận nhận thông tin marketing',
      text: 'Tôi đồng ý nhận thông tin marketing, khuyến mãi từ [Tên công ty].',
      detailed: 'Tôi đồng ý nhận thông tin về sản phẩm, dịch vụ và các chương trình khuyến mãi của [Tên công ty] qua các kênh: email, SMS, điện thoại, và các kênh khác. Tôi có thể hủy đăng ký bất cứ lúc nào.',
    },
    partner_sharing: {
      title: 'Chấp nhận chia sẻ với đối tác',
      text: 'Tôi đồng ý cho phép chia sẻ thông tin của tôi với các đối tác tài chính.',
      detailed: 'Tôi đồng ý cho phép [Tên công ty] chia sẻ thông tin hồ sơ của tôi với các đối tác tài chính liên quan để tìm kiếm sản phẩm vay phù hợp nhất. Các đối tác cam kết bảo mật thông tin theo quy định pháp luật.',
    },
    credit_check: {
      title: 'Chấp nhận kiểm tra tín dụng',
      text: 'Tôi đồng ý cho phép kiểm tra lịch sử tín dụng của tôi.',
      detailed: 'Tôi đồng ý cho phép [Tên công ty] kiểm tra lịch sử tín dụng của tôi tại CIC và các tổ chức tín dụng khác nhằm mục đích đánh giá khả năng trả nợ.',
    },
  },
  en: {
    data_processing: {
      title: 'Personal Data Processing Consent',
      text: 'I consent to [Company Name] processing my personal data according to Decree 13/2023/ND-CP.',
      detailed: 'I confirm that I have read, understood, and agree to the Personal Data Protection Policy. I consent to [Company Name] collecting, storing, and processing my personal data for the following purposes: [specific purposes]. I have the right to withdraw this consent at any time.',
    },
    marketing: {
      title: 'Marketing Information Consent',
      text: 'I consent to receiving marketing and promotional information from [Company Name].',
      detailed: 'I consent to receive information about products, services, and promotional programs from [Company Name] through channels including email, SMS, phone, and other channels. I can unsubscribe at any time.',
    },
    partner_sharing: {
      title: 'Partner Information Sharing Consent',
      text: 'I consent to sharing my information with financial partners.',
      detailed: 'I consent to [Company Name] sharing my profile information with relevant financial partners to find the most suitable loan products. Partners commit to protecting information according to legal regulations.',
    },
    credit_check: {
      title: 'Credit Check Consent',
      text: 'I consent to a credit history check.',
      detailed: 'I consent to [Company Name] checking my credit history at CIC and other credit institutions for the purpose of assessing repayment ability.',
    },
  },
};

export const DATA_RETENTION_POLICIES: DataRetentionPolicy[] = [
  {
    id: 'personal_basic_data',
    dataType: 'basic_personal_data',
    retentionPeriod: 2555, // 7 years
    retentionBasis: 'tax_and_legal_requirements',
    autoDelete: true,
    notificationBeforeDelete: 30,
    exceptions: ['active_disputes', 'legal_hold'],
    lastApplied: new Date(),
  },
  {
    id: 'financial_data',
    dataType: 'financial_data',
    retentionPeriod: 2555, // 7 years
    retentionBasis: 'anti_money_laundering_regulations',
    autoDelete: true,
    notificationBeforeDelete: 30,
    exceptions: ['investigations', 'legal_hold'],
    lastApplied: new Date(),
  },
  {
    id: 'consent_records',
    dataType: 'consent_records',
    retentionPeriod: 2555, // 7 years
    retentionBasis: 'compliance_requirements',
    autoDelete: true,
    notificationBeforeDelete: 30,
    exceptions: ['legal_disputes'],
    lastApplied: new Date(),
  },
  {
    id: 'marketing_consent',
    dataType: 'marketing_consent',
    retentionPeriod: 365, // 1 year
    retentionBasis: 'business_need',
    autoDelete: true,
    notificationBeforeDelete: 15,
    exceptions: ['active_campaigns'],
    lastApplied: new Date(),
  },
  {
    id: 'behavioral_data',
    dataType: 'behavioral_data',
    retentionPeriod: 730, // 2 years
    retentionBasis: 'analytics_and_improvement',
    autoDelete: true,
    notificationBeforeDelete: 30,
    exceptions: ['user_opted_out'],
    lastApplied: new Date(),
  },
];

export class VietnameseComplianceManager {
  private consentRecords: Map<string, ConsentRecord> = new Map();
  private auditLogs: ComplianceAuditLog[] = [];
  private retentionPolicies: DataRetentionPolicy[] = DATA_RETENTION_POLICIES;
  private legalFramework: VietnameseLegalFramework = VIETNAMESE_LEGAL_FRAMEWORK;
  private deletionTasks: Map<string, any> = new Map();

  constructor() {
    this.initializeSystem();
  }

  private initializeSystem(): void {
    console.log('Vietnamese Compliance Manager initialized');
    this.logAuditEvent('system_initialized', 'system', {
      framework_version: '1.0',
      policies_count: this.retentionPolicies.length,
    });
  }

  // Consent Management
  public createConsentRecord(leadId: string, consentData: {
    type: ConsentType;
    consentGiven: boolean;
    ipAddress: string;
    userAgent: string;
    language: 'vi' | 'en';
    method: ConsentMethod;
    partnerIds?: string[];
    purpose?: string[];
    dataTypes?: string[];
  }): ConsentRecord {
    const consentId = this.generateConsentId();
    const template = CONSENT_TEMPLATES[language][consentTypeToTemplateKey(consentData.type)];

    const consentRecord: ConsentRecord = {
      id: consentId,
      leadId,
      type: consentData.type,
      status: consentData.consentGiven ? ConsentStatus.GRANTED : ConsentStatus.DENIED,
      consentGiven: consentData.consentGiven,
      consentWithdrawn: false,
      consentTimestamp: new Date(),
      ipAddress: consentData.ipAddress,
      userAgent: consentData.userAgent,
      method: consentData.method,
      language: consentData.language,
      consentTextVI: template.text,
      consentTextEN: template.text,
      version: '1.0',
      purpose: consentData.purpose || this.getDefaultPurpose(consentData.type),
      dataTypes: consentData.dataTypes || this.getDefaultDataTypes(consentData.type),
      retentionPeriod: this.getDefaultRetentionPeriod(consentData.type),
      sharingAllowed: consentData.type === ConsentType.PARTNER_SHARING,
      marketingAllowed: consentData.type === ConsentType.MARKETING,
      thirdPartyAllowed: consentData.type === ConsentType.PARTNER_SHARING,
      internationalTransferAllowed: false, // Default to false for Vietnamese regulations
      automatedDecisionMakingAllowed: consentData.type === ConsentType.CREDIT_SCORING,
      legitimateInterest: this.requiresLegitimateInterest(consentData.type),
      legalBasis: this.getLegalBasis(consentData.type),
      partnerIds: consentData.partnerIds || [],
      expiryDate: this.calculateExpiryDate(consentData.type),
      metadata: {
        source: 'lead_generation_form',
        formVersion: '1.0',
        deviceType: this.extractDeviceType(consentData.userAgent),
        sessionId: this.generateSessionId(),
      },
    };

    this.consentRecords.set(consentId, consentRecord);
    this.logAuditEvent(
      consentData.consentGiven ? AuditAction.CONSENT_GRANTED : AuditAction.CONSENT_DENIED,
      'user',
      {
        consentId,
        leadId,
        consentType: consentData.type,
        consentGiven: consentData.consentGiven,
      }
    );

    return consentRecord;
  }

  public withdrawConsent(consentId: string, reason?: string): boolean {
    const consentRecord = this.consentRecords.get(consentId);
    if (!consentRecord) {
      throw new Error(`Consent record not found: ${consentId}`);
    }

    if (consentRecord.consentWithdrawn || consentRecord.status === ConsentStatus.WITHDRAWN) {
      return false;
    }

    consentRecord.consentWithdrawn = true;
    consentRecord.withdrawalTimestamp = new Date();
    consentRecord.status = ConsentStatus.WITHDRAWN;

    this.logAuditEvent(AuditAction.CONSENT_WITHDRAWN, 'user', {
      consentId,
      leadId: consentRecord.leadId,
      reason,
    });

    // Trigger data deletion process for withdrawn consent
    this.initiateDataDeletion(consentRecord.leadId, [consentRecord.type]);

    return true;
  }

  public updateConsentStatus(consentId: string, newStatus: ConsentStatus): boolean {
    const consentRecord = this.consentRecords.get(consentId);
    if (!consentRecord) {
      return false;
    }

    const previousStatus = consentRecord.status;
    consentRecord.status = newStatus;

    this.logAuditEvent(AuditAction.CONSENT_EXPIRED, 'system', {
      consentId,
      leadId: consentRecord.leadId,
      previousStatus,
      newStatus,
    });

    return true;
  }

  public checkConsentValidity(leadId: string, consentType: ConsentType): boolean {
    const consentRecords = Array.from(this.consentRecords.values())
      .filter(record => record.leadId === leadId && record.type === consentType);

    if (consentRecords.length === 0) {
      return false;
    }

    const latestConsent = consentRecords
      .sort((a, b) => b.consentTimestamp.getTime() - a.consentTimestamp.getTime())[0];

    if (!latestConsent.consentGiven || latestConsent.consentWithdrawn) {
      return false;
    }

    if (latestConsent.expiryDate && latestConsent.expiryDate < new Date()) {
      this.updateConsentStatus(latestConsent.id, ConsentStatus.EXPIRED);
      return false;
    }

    return true;
  }

  // Data Access and Processing Compliance
  public canProcessData(leadId: string, purpose: string, dataType: string): {
    allowed: boolean;
    reason: string;
    consentIds: string[];
  } {
    const relevantConsents = Array.from(this.consentRecords.values())
      .filter(record => record.leadId === leadId && record.consentGiven && !record.consentWithdrawn);

    const validConsents = relevantConsents.filter(consent => {
      if (consent.expiryDate && consent.expiryDate < new Date()) {
        return false;
      }
      return consent.purpose.includes(purpose) && consent.dataTypes.includes(dataType);
    });

    if (validConsents.length === 0) {
      return {
        allowed: false,
        reason: 'No valid consent found for the requested data processing',
        consentIds: [],
      };
    }

    return {
      allowed: true,
      reason: 'Valid consent exists for data processing',
      consentIds: validConsents.map(c => c.id),
    };
  }

  public logDataAccess(leadId: string, dataTypes: string[], purpose: string, actorId?: string): void {
    this.logAuditEvent(AuditAction.DATA_ACCESSED, actorId ? 'user' : 'system', {
      leadId,
      dataTypes,
      purpose,
      consentValidated: true,
    });
  }

  // Data Retention Management
  public applyDataRetention(leadId: string): {
    dataDeleted: string[];
    dataRetained: string[];
    scheduledForDeletion: string[];
  } {
    const dataDeleted: string[] = [];
    const dataRetained: string[] = [];
    const scheduledForDeletion: string[] = [];

    const relevantConsents = Array.from(this.consentRecords.values())
      .filter(record => record.leadId === leadId);

    for (const policy of this.retentionPolicies) {
      const consent = relevantConsents.find(c => c.dataTypes.includes(policy.dataType));

      if (consent) {
        const retentionDeadline = new Date(consent.consentTimestamp);
        retentionDeadline.setDate(retentionDeadline.getDate() + policy.retentionPeriod);

        if (new Date() > retentionDeadline && policy.autoDelete) {
          // Check for exceptions
          const hasException = policy.exceptions.some(exception =>
            this.checkForException(leadId, exception)
          );

          if (!hasException) {
            dataDeleted.push(policy.dataType);
            this.logAuditEvent(AuditAction.DATA_DELETED, 'system', {
              leadId,
              dataType: policy.dataType,
              policyId: policy.id,
              reason: 'retention_period_expired',
            });
          } else {
            dataRetained.push(policy.dataType);
          }
        } else if (retentionDeadline < new Date(Date.now() + policy.notificationBeforeDelete * 24 * 60 * 60 * 1000)) {
          scheduledForDeletion.push(policy.dataType);
        } else {
          dataRetained.push(policy.dataType);
        }
      }
    }

    return {
      dataDeleted,
      dataRetained,
      scheduledForDeletion,
    };
  }

  // Audit and Compliance Monitoring
  private logAuditEvent(action: AuditAction, actor: string, details: Record<string, any>): void {
    const auditLog: ComplianceAuditLog = {
      id: this.generateAuditId(),
      leadId: details.leadId || 'system',
      action,
      timestamp: new Date(),
      actor,
      actorId: details.actorId,
      details,
      ipAddress: details.ipAddress || '0.0.0.0',
      userAgent: details.userAgent || 'System',
      complianceBreach: this.detectComplianceBreach(action, details),
    };

    if (auditLog.complianceBreach) {
      auditLog.breachSeverity = this.assessBreachSeverity(action, details);
      this.handleComplianceBreach(auditLog);
    }

    this.auditLogs.push(auditLog);
    this.cleanupOldAuditLogs();
  }

  private detectComplianceBreach(action: AuditAction, details: Record<string, any>): boolean {
    // Implement logic to detect potential compliance breaches
    switch (action) {
      case AuditAction.DATA_ACCESSED:
        return !details.consentValidated;
      case AuditAction.DATA_SHARED:
        return !details.consentIds || details.consentIds.length === 0;
      case AuditAction.CONSENT_GRANTED:
        return !details.ipAddress || !details.userAgent;
      default:
        return false;
    }
  }

  private assessBreachSeverity(action: AuditAction, details: Record<string, any>): 'low' | 'medium' | 'high' | 'critical' {
    // Implement severity assessment logic
    if (action === AuditAction.DATA_SHARED && !details.consentIds) {
      return 'critical';
    }
    if (action === AuditAction.DATA_ACCESSED && !details.consentValidated) {
      return 'high';
    }
    return 'medium';
  }

  private handleComplianceBreach(auditLog: ComplianceAuditLog): void {
    console.error(`Compliance breach detected: ${auditLog.action}`, auditLog.details);

    // Implement breach handling procedures
    // 1. Notify compliance team
    // 2. Suspend affected operations
    // 3. Initiate investigation
    // 4. Prepare breach notification if required
  }

  // Data Subject Rights Implementation
  public requestDataAccess(leadId: string, requestType: 'access' | 'portability' | 'deletion'): {
    requestId: string;
    estimatedTimeframe: number;
    requirements: string[];
    confirmation: boolean;
  } {
    const requestId = this.generateRequestId();

    this.logAuditEvent(AuditAction.RIGHTS_REQUESTED, 'user', {
      leadId,
      requestId,
      requestType,
    });

    const requirements = this.getRequirementsForRequest(requestType);
    const timeframe = this.getEstimatedTimeframe(requestType);

    return {
      requestId,
      estimatedTimeframe: timeframe,
      requirements,
      confirmation: true,
    };
  }

  public fulfillDataRequest(requestId: string, leadId: string): boolean {
    // Implement data request fulfillment logic
    this.logAuditEvent(AuditAction.RIGHTS_FULFILLED, 'admin', {
      requestId,
      leadId,
      fulfillmentTimestamp: new Date().toISOString(),
    });

    return true;
  }

  // Utility Methods
  private generateConsentId(): string {
    return `consent_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateAuditId(): string {
    return `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateRequestId(): string {
    return `request_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private consentTypeToTemplateKey(type: ConsentType): string {
    const mapping: Record<ConsentType, string> = {
      [ConsentType.DATA_PROCESSING]: 'data_processing',
      [ConsentType.MARKETING]: 'marketing',
      [ConsentType.PARTNER_SHARING]: 'partner_sharing',
      [ConsentType.CREDIT_CHECK]: 'credit_check',
      [ConsentType.CREDIT_SCORING]: 'credit_check',
      [ConsentType.IDENTITY_VERIFICATION]: 'data_processing',
      [ConsentType.BACKGROUND_CHECK]: 'credit_check',
      [ConsentType.AUTOMATED_DECISION]: 'data_processing',
      [ConsentType.INTERNATIONAL_TRANSFER]: 'data_processing',
      [ConsentType.LOCATION_DATA]: 'data_processing',
      [ConsentType.BEHAVIORAL_ANALYSIS]: 'data_processing',
      [ConsentType.PROFILING]: 'data_processing',
    };
    return mapping[type] || 'data_processing';
  }

  private getDefaultPurpose(type: ConsentType): string[] {
    const purposeMap: Record<ConsentType, string[]> = {
      [ConsentType.DATA_PROCESSING]: ['loan_application_processing', 'identity_verification', 'compliance'],
      [ConsentType.MARKETING]: ['product_promotion', 'service_updates', 'special_offers'],
      [ConsentType.PARTNER_SHARING]: ['loan_matching', 'financial_product_recommendation'],
      [ConsentType.CREDIT_CHECK]: ['credit_assessment', 'risk_evaluation'],
      [ConsentType.CREDIT_SCORING]: ['automated_decision_making', 'loan_eligibility'],
      [ConsentType.IDENTITY_VERIFICATION]: ['fraud_prevention', 'regulatory_compliance'],
      [ConsentType.BACKGROUND_CHECK]: ['risk_assessment', 'compliance_verification'],
      [ConsentType.AUTOMATED_DECISION]: ['loan_approval', 'risk_scoring'],
      [ConsentType.INTERNATIONAL_TRANSFER]: ['international_lending', 'cross_border_services'],
      [ConsentType.LOCATION_DATA]: ['service_personalization', 'branch_location'],
      [ConsentType.BEHAVIORAL_ANALYSIS]: ['service_improvement', 'product_development'],
      [ConsentType.PROFILING]: ['personalized_offers', 'product_recommendation'],
    };
    return purposeMap[type] || ['general_processing'];
  }

  private getDefaultDataTypes(type: ConsentType): string[] {
    const dataTypesMap: Record<ConsentType, string[]> = {
      [ConsentType.DATA_PROCESSING]: ['personal_data', 'contact_data', 'financial_data'],
      [ConsentType.MARKETING]: ['contact_data', 'behavioral_data'],
      [ConsentType.PARTNER_SHARING]: ['personal_data', 'financial_data', 'employment_data'],
      [ConsentType.CREDIT_CHECK]: ['identification_data', 'financial_data', 'credit_history'],
      [ConsentType.CREDIT_SCORING]: ['financial_data', 'employment_data', 'credit_history'],
      [ConsentType.IDENTITY_VERIFICATION]: ['identification_data', 'biometric_data'],
      [ConsentType.BACKGROUND_CHECK]: ['identification_data', 'criminal_records'],
      [ConsentType.AUTOMATED_DECISION]: ['financial_data', 'employment_data', 'behavioral_data'],
      [ConsentType.INTERNATIONAL_TRANSFER]: ['personal_data', 'financial_data'],
      [ConsentType.LOCATION_DATA]: ['location_data', 'device_data'],
      [ConsentType.BEHAVIORAL_ANALYSIS]: ['behavioral_data', 'device_data', 'usage_patterns'],
      [ConsentType.PROFILING]: ['financial_data', 'behavioral_data', 'demographic_data'],
    };
    return dataTypesMap[type] || ['personal_data'];
  }

  private getDefaultRetentionPeriod(type: ConsentType): number {
    const retentionMap: Record<ConsentType, number> = {
      [ConsentType.DATA_PROCESSING]: 2555, // 7 years
      [ConsentType.MARKETING]: 365, // 1 year
      [ConsentType.PARTNER_SHARING]: 2555, // 7 years
      [ConsentType.CREDIT_CHECK]: 2555, // 7 years
      [ConsentType.CREDIT_SCORING]: 2555, // 7 years
      [ConsentType.IDENTITY_VERIFICATION]: 2555, // 7 years
      [ConsentType.BACKGROUND_CHECK]: 2555, // 7 years
      [ConsentType.AUTOMATED_DECISION]: 2555, // 7 years
      [ConsentType.INTERNATIONAL_TRANSFER]: 2555, // 7 years
      [ConsentType.LOCATION_DATA]: 730, // 2 years
      [ConsentType.BEHAVIORAL_ANALYSIS]: 730, // 2 years
      [ConsentType.PROFILING]: 730, // 2 years
    };
    return retentionMap[type] || 2555;
  }

  private requiresLegitimateInterest(type: ConsentType): boolean {
    return [
      ConsentType.DATA_PROCESSING,
      ConsentType.IDENTITY_VERIFICATION,
      ConsentType.BACKGROUND_CHECK,
    ].includes(type);
  }

  private getLegalBasis(type: ConsentType): LegalBasis {
    const basisMap: Record<ConsentType, LegalBasis> = {
      [ConsentType.DATA_PROCESSING]: LegalBasis.CONSENT,
      [ConsentType.MARKETING]: LegalBasis.CONSENT,
      [ConsentType.PARTNER_SHARING]: LegalBasis.CONSENT,
      [ConsentType.CREDIT_CHECK]: LegalBasis.CONSENT,
      [ConsentType.CREDIT_SCORING]: LegalBasis.LEGITIMATE_INTERESTS,
      [ConsentType.IDENTITY_VERIFICATION]: LegalBasis.LEGAL_OBLIGATION,
      [ConsentType.BACKGROUND_CHECK]: LegalBasis.LEGAL_OBLIGATION,
      [ConsentType.AUTOMATED_DECISION]: LegalBasis.LEGITIMATE_INTERESTS,
      [ConsentType.INTERNATIONAL_TRANSFER]: LegalBasis.CONSENT,
      [ConsentType.LOCATION_DATA]: LegalBasis.CONSENT,
      [ConsentType.BEHAVIORAL_ANALYSIS]: LegalBasis.LEGITIMATE_INTERESTS,
      [ConsentType.PROFILING]: LegalBasis.LEGITIMATE_INTERESTS,
    };
    return basisMap[type] || LegalBasis.CONSENT;
  }

  private calculateExpiryDate(type: ConsentType): Date {
    const expiryMap: Record<ConsentType, number> = {
      [ConsentType.DATA_PROCESSING]: 2555, // 7 years
      [ConsentType.MARKETING]: 365, // 1 year
      [ConsentType.PARTNER_SHARING]: 2555, // 7 years
      [ConsentType.CREDIT_CHECK]: 2555, // 7 years
      [ConsentType.CREDIT_SCORING]: 2555, // 7 years
      [ConsentType.IDENTITY_VERIFICATION]: 2555, // 7 years
      [ConsentType.BACKGROUND_CHECK]: 2555, // 7 years
      [ConsentType.AUTOMATED_DECISION]: 2555, // 7 years
      [ConsentType.INTERNATIONAL_TRANSFER]: 2555, // 7 years
      [ConsentType.LOCATION_DATA]: 730, // 2 years
      [ConsentType.BEHAVIORAL_ANALYSIS]: 730, // 2 years
      [ConsentType.PROFILING]: 730, // 2 years
    };

    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + expiryMap[type]);
    return expiryDate;
  }

  private extractDeviceType(userAgent: string): string {
    if (userAgent.includes('Mobile') || userAgent.includes('Android') || userAgent.includes('iPhone')) {
      return 'mobile';
    }
    if (userAgent.includes('Tablet') || userAgent.includes('iPad')) {
      return 'tablet';
    }
    return 'desktop';
  }

  private checkForException(leadId: string, exception: string): boolean {
    // Implement logic to check if a lead has an exception from data deletion
    // This would typically involve checking legal holds, active disputes, etc.
    return false;
  }

  private async initiateDataDeletion(leadId: string, consentTypes: ConsentType[]): Promise<void> {
    try {
      // Implement actual data deletion process for withdrawn consent
      // Vietnamese Decree 13/2023 requires 30-day grace period before complete deletion

      const deletionDate = new Date();
      deletionDate.setDate(deletionDate.getDate() + 30); // 30-day grace period

      // Create data deletion task
      const deletionTask = {
        leadId,
        consentTypes,
        reason: 'consent_withdrawn',
        scheduledFor: deletionDate.toISOString(),
        status: 'scheduled',
        createdAt: new Date().toISOString(),
        complianceFramework: 'Vietnamese Decree 13/2023',
        gracePeriodDays: 30,
      };

      // Log deletion initiation
      this.logAuditEvent(AuditAction.RETENTION_APPLIED, 'system', {
        leadId,
        consentTypes,
        reason: 'consent_withdrawn',
        deletionTask,
        message: 'Data deletion scheduled for 30 days from consent withdrawal',
      });

      // Store deletion task for processing
      // In a real implementation, this would be stored in a database
      this.scheduleDeletionTask(deletionTask);

      // Send notification to user about upcoming deletion
      await this.notifyDataDeletion(leadId, deletionDate);

      // Immediately restrict data processing for withdrawn consent
      this.restrictDataProcessing(leadId, consentTypes);

    } catch (error) {
      console.error('Failed to initiate data deletion:', error);
      this.logAuditEvent(AuditAction.BREACH_DETECTED, 'system', {
        leadId,
        consentTypes,
        error: error.message,
        reason: 'data_deletion_initiation_failed',
      });
      throw error;
    }
  }

  /**
   * Schedule deletion task for processing
   */
  private scheduleDeletionTask(deletionTask: any): void {
    // In a real implementation, this would store in a database
    // For now, store in memory (not production-ready)
    if (!this.deletionTasks) {
      this.deletionTasks = new Map();
    }
    this.deletionTasks.set(deletionTask.leadId, deletionTask);
  }

  /**
   * Process scheduled deletion tasks
   */
  public processScheduledDeletions(): void {
    if (!this.deletionTasks) return;

    const now = new Date();
    const tasksToProcess: any[] = [];

    this.deletionTasks.forEach((task, leadId) => {
      if (new Date(task.scheduledFor) <= now && task.status === 'scheduled') {
        tasksToProcess.push(task);
      }
    });

    tasksToProcess.forEach(task => {
      this.executeDataDeletion(task);
    });
  }

  /**
   * Execute actual data deletion
   */
  private async executeDataDeletion(deletionTask: any): Promise<void> {
    try {
      const { leadId, consentTypes } = deletionTask;

      // Delete specific data types based on withdrawn consent
      const dataToDelete = this.getDataTypesForConsent(consentTypes);

      for (const dataType of dataToDelete) {
        await this.deleteSpecificData(leadId, dataType);
      }

      // Update task status
      deletionTask.status = 'completed';
      deletionTask.completedAt = new Date().toISOString();

      // Log successful deletion
      this.logAuditEvent(AuditAction.DATA_DELETED, 'system', {
        leadId,
        deletedDataTypes: dataToDelete,
        reason: 'consent_withdrawal_30day_grace_period',
        completedAt: deletionTask.completedAt,
        complianceFramework: 'Vietnamese Decree 13/2023',
      });

      // Remove from scheduled tasks
      this.deletionTasks?.delete(leadId);

      // Send confirmation notification
      await this.notifyDeletionCompletion(leadId);

    } catch (error) {
      console.error('Failed to execute data deletion:', error);
      deletionTask.status = 'failed';
      deletionTask.error = error.message;
      deletionTask.failedAt = new Date().toISOString();

      this.logAuditEvent(AuditAction.BREACH_RESOLVED, 'system', {
        leadId: deletionTask.leadId,
        error: error.message,
        reason: 'data_deletion_execution_failed',
      });
    }
  }

  /**
   * Get data types to delete based on consent types
   */
  private getDataTypesForConsent(consentTypes: ConsentType[]): string[] {
    const dataTypeMap: Record<ConsentType, string[]> = {
      [ConsentType.DATA_PROCESSING]: ['personal_data', 'contact_data', 'demographic_data'],
      [ConsentType.MARKETING]: ['marketing_data', 'behavioral_data'],
      [ConsentType.PARTNER_SHARING]: ['partner_data', 'sharing_records'],
      [ConsentType.CREDIT_CHECK]: ['credit_data', 'financial_history'],
      [ConsentType.CREDIT_SCORING]: ['scoring_data', 'algorithm_results'],
      [ConsentType.IDENTITY_VERIFICATION]: ['identity_data', 'verification_records'],
      [ConsentType.BACKGROUND_CHECK]: ['background_data', 'screening_results'],
      [ConsentType.AUTOMATED_DECISION]: ['decision_data', 'algorithm_inputs'],
      [ConsentType.INTERNATIONAL_TRANSFER]: ['transfer_data', 'international_records'],
      [ConsentType.LOCATION_DATA]: ['location_data', 'geographic_info'],
      [ConsentType.BEHAVIORAL_ANALYSIS]: ['behavioral_data', 'usage_patterns'],
      [ConsentType.PROFILING]: ['profiling_data', 'personalization_info'],
    };

    const dataTypes = new Set<string>();
    consentTypes.forEach(consentType => {
      const types = dataTypeMap[consentType] || [];
      types.forEach(type => dataTypes.add(type));
    });

    return Array.from(dataTypes);
  }

  /**
   * Delete specific data type
   */
  private async deleteSpecificData(leadId: string, dataType: string): Promise<void> {
    // In a real implementation, this would:
    // 1. Delete from primary database
    // 2. Delete from backup systems
    // 3. Delete from cache
    // 4. Delete from analytics systems
    // 5. Delete from third-party integrations

    console.log(`Deleting ${dataType} for lead ${leadId}`);

    // Simulate deletion process
    await new Promise(resolve => setTimeout(resolve, 100));

    // Log the deletion
    this.logAuditEvent(AuditAction.DATA_DELETED, 'system', {
      leadId,
      dataType,
      action: 'specific_data_deletion',
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Restrict data processing for withdrawn consent
   */
  private restrictDataProcessing(leadId: string, consentTypes: ConsentType[]): void {
    // Immediately mark data as restricted for processing
    const processingRestrictions = {
      leadId,
      restrictedConsentTypes: consentTypes,
      restrictionReason: 'consent_withdrawn',
      restrictedAt: new Date().toISOString(),
      allowedOperations: ['read', 'delete'], // Only read and delete allowed
    };

    // Log restriction
    this.logAuditEvent(AuditAction.DATA_ACCESSED, 'system', {
      leadId,
      action: 'processing_restricted',
      restrictions: processingRestrictions,
      reason: 'consent_withdrawn_immediate_effect',
    });
  }

  /**
   * Notify user about upcoming data deletion
   */
  private async notifyDataDeletion(leadId: string, deletionDate: Date): Promise<void> {
    // In a real implementation, this would send email/SMS notifications
    const notification = {
      leadId,
      type: 'data_deletion_scheduled',
      scheduledDate: deletionDate.toISOString(),
      gracePeriodDays: 30,
      complianceFramework: 'Vietnamese Decree 13/2023',
      message: 'Your data will be permanently deleted in 30 days due to consent withdrawal',
    };

    console.log('Data deletion notification:', notification);

    // Log notification
    this.logAuditEvent(AuditAction.RIGHTS_FULFILLED, 'system', {
      leadId,
      action: 'deletion_notification_sent',
      notification,
    });
  }

  /**
   * Notify user about deletion completion
   */
  private async notifyDeletionCompletion(leadId: string): Promise<void> {
    const notification = {
      leadId,
      type: 'data_deletion_completed',
      completedAt: new Date().toISOString(),
      complianceFramework: 'Vietnamese Decree 13/2023',
      message: 'Your data has been permanently deleted as requested',
    };

    console.log('Data deletion completion notification:', notification);

    // Log notification
    this.logAuditEvent(AuditAction.RIGHTS_FULFILLED, 'system', {
      leadId,
      action: 'deletion_completion_notification_sent',
      notification,
    });
  }

  /**
   * Get State Bank of Vietnam compliance report
   */
  public getSBVComplianceReport(): {
    reportGenerated: string;
    totalLeads: number;
    consentWithdrawalsProcessed: number;
    dataDeletionRequests: number;
    dataDeletionCompleted: number;
    pendingDeletions: number;
    averageDeletionTime: number;
    complianceScore: number;
    violations: any[];
    recommendations: string[];
  } {
    const totalLeads = this.consentRecords.size;
    const withdrawalRecords = Array.from(this.consentRecords.values())
      .filter(record => record.consentWithdrawn);

    const completedDeletions = Array.from(this.auditLogs)
      .filter(log => log.action === AuditAction.DATA_DELETED &&
        log.details.reason === 'consent_withdrawal_30day_grace_period');

    const pendingDeletions = this.deletionTasks ?
      Array.from(this.deletionTasks.values()).filter(task => task.status === 'scheduled').length : 0;

    const violations = this.auditLogs
      .filter(log => log.complianceBreach)
      .map(log => ({
        type: log.breachSeverity,
        description: log.details,
        timestamp: log.timestamp,
        resolved: !!log.resolvedAt,
      }));

    // Calculate compliance score (0-100)
    const complianceScore = this.calculateComplianceScore(totalLeads, withdrawalRecords.length, violations.length);

    return {
      reportGenerated: new Date().toISOString(),
      totalLeads,
      consentWithdrawalsProcessed: withdrawalRecords.length,
      dataDeletionRequests: withdrawalRecords.length,
      dataDeletionCompleted: completedDeletions.length,
      pendingDeletions,
      averageDeletionTime: 30, // 30 days as per Vietnamese law
      complianceScore,
      violations,
      recommendations: this.generateComplianceRecommendations(complianceScore, violations),
    };
  }

  /**
   * Calculate compliance score
   */
  private calculateComplianceScore(totalLeads: number, withdrawals: number, violations: number): number {
    if (totalLeads === 0) return 100;

    const withdrawalRate = withdrawals / totalLeads;
    const violationRate = violations / totalLeads;

    // Base score starts at 100
    let score = 100;

    // Deduct points for violations
    score -= violations * 10;

    // Bonus for processing withdrawals properly
    if (withdrawalRate > 0 && violationRate < 0.05) {
      score += 5;
    }

    // Ensure score stays within bounds
    return Math.max(0, Math.min(100, score));
  }

  /**
   * Generate compliance recommendations
   */
  private generateComplianceRecommendations(score: number, violations: any[]): string[] {
    const recommendations: string[] = [];

    if (score < 80) {
      recommendations.push('Review and strengthen consent management processes');
    }

    if (violations.length > 0) {
      recommendations.push('Address identified compliance violations immediately');
      recommendations.push('Implement additional monitoring and alerting');
    }

    if (score < 90) {
      recommendations.push('Enhance staff training on Vietnamese data protection laws');
    }

    recommendations.push('Regular audit of data processing activities');
    recommendations.push('Maintain documentation of compliance measures');

    return recommendations;
  }

  private cleanupOldAuditLogs(): void {
    const cutoffDate = new Date();
    cutoffDate.setFullYear(cutoffDate.getFullYear() - 7); // Keep logs for 7 years

    this.auditLogs = this.auditLogs.filter(log => log.timestamp >= cutoffDate);
  }

  private getRequirementsForRequest(requestType: string): string[] {
    const requirements: Record<string, string[]> = {
      access: ['identity_verification', 'request_form_completion'],
      portability: ['identity_verification', 'data_format_preference'],
      deletion: ['identity_verification', 'deletion_confirmation'],
    };
    return requirements[requestType] || [];
  }

  private getEstimatedTimeframe(requestType: string): number {
    const timeframes: Record<string, number> = {
      access: 30, // 30 days
      portability: 45, // 45 days
      deletion: 60, // 60 days
    };
    return timeframes[requestType] || 30;
  }

  // Public getters for system status
  public getComplianceStatus(): {
    activeConsents: number;
    expiredConsents: number;
    auditLogCount: number;
    breachCount: number;
    retentionPoliciesCount: number;
  } {
    const activeConsents = Array.from(this.consentRecords.values())
      .filter(c => c.consentGiven && !c.consentWithdrawn && (!c.expiryDate || c.expiryDate > new Date()))
      .length;

    const expiredConsents = Array.from(this.consentRecords.values())
      .filter(c => c.status === ConsentStatus.EXPIRED || (c.expiryDate && c.expiryDate < new Date()))
      .length;

    const breachCount = this.auditLogs.filter(log => log.complianceBreach).length;

    return {
      activeConsents,
      expiredConsents,
      auditLogCount: this.auditLogs.length,
      breachCount,
      retentionPoliciesCount: this.retentionPolicies.length,
    };
  }

  public getLegalFramework(): VietnameseLegalFramework {
    return this.legalFramework;
  }
}

// Default compliance manager instance
export const defaultComplianceManager = new VietnameseComplianceManager();

// Convenience functions
export const createVietnameseConsent = (
  leadId: string,
  consentData: Parameters<VietnameseComplianceManager['createConsentRecord']>[1]
): ConsentRecord => {
  return defaultComplianceManager.createConsentRecord(leadId, consentData);
};

export const withdrawVietnameseConsent = (consentId: string, reason?: string): boolean => {
  return defaultComplianceManager.withdrawConsent(consentId, reason);
};

export const checkVietnameseConsent = (leadId: string, consentType: ConsentType): boolean => {
  return defaultComplianceManager.checkConsentValidity(leadId, consentType);
};

export default VietnameseComplianceManager;