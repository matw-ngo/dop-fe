/**
 * Lead Generation API Endpoints
 * Comprehensive lead forwarding and management API with Vietnamese compliance
 */

import apiClient from '../client';
import { useTokenStore, securityUtils } from '@/lib/auth/secure-tokens';
import { sanitizeApplicationData, sanitizeVietnamesePhone, sanitizeEmail, sanitizeVietnameseID } from '@/lib/utils/sanitization';
import { encryptLeadData, decryptLeadData, isVietnamesePersonalDataField } from '@/lib/lead-generation/data-encryption';
import { LeadGenerationSecurityManager, AccessRole, authenticateLeadGenerationSession, validateLeadGenerationPermission } from '@/lib/lead-generation/security';
import { defaultComplianceManager } from '@/lib/lead-generation/vietnamese-compliance';
import type { LeadData, LeadScore } from '@/lib/lead-generation/lead-scoring';
import type { MatchingResult } from '@/lib/lead-generation/partner-matching';
import type { ConsentRecord } from '@/lib/lead-generation/vietnamese-compliance';
import type { VietnameseFinancialPartner } from '@/lib/lead-generation/vietnamese-partners';

// Types
export interface LeadCreationRequest {
  leadData: LeadData;
  leadScore?: LeadScore;
  partnerMatching?: MatchingResult;
  consentRecords: ConsentRecord[];
  source: {
    source: string;
    medium?: string;
    campaign?: string;
    content?: string;
    keyword?: string;
  };
  metadata?: {
    userAgent?: string;
    ipAddress?: string;
    sessionId?: string;
    deviceType?: string;
    referrer?: string;
    landingPage?: string;
  };
}

export interface LeadCreationResponse {
  success: boolean;
  leadId: string;
  message: string;
  timestamp: string;
  partnerAssignments: Array<{
    partnerId: string;
    partnerName: string;
    status: 'assigned' | 'pending' | 'rejected';
    assignmentId: string;
    estimatedResponseTime: number;
    confidence: number;
  }>;
  nextSteps: string[];
  estimatedProcessingTime: number;
}

export interface LeadStatus {
  leadId: string;
  status: 'new' | 'in_review' | 'partner_assigned' | 'forwarded' | 'accepted' | 'rejected' | 'completed' | 'cancelled';
  stage: string;
  progress: number;
  assignedPartners: Array<{
    partnerId: string;
    partnerName: string;
    status: string;
    responseDate?: string;
    responseMessage?: string;
    nextSteps: string[];
  }>;
  timeline: Array<{
    timestamp: string;
    action: string;
    description: string;
    actor: string;
  }>;
  lastUpdated: string;
  estimatedCompletion?: string;
}

export interface LeadForwardingRequest {
  leadId: string;
  partnerIds: string[];
  priority: 'low' | 'normal' | 'high' | 'urgent';
  message?: string;
  documents?: Array<{
    type: string;
    name: string;
    url: string;
    size: number;
    uploadedAt: string;
  }>;
  customFields?: Record<string, any>;
  deadline?: string;
}

export interface LeadForwardingResponse {
  success: boolean;
  forwardingId: string;
  partnerAssignments: Array<{
    partnerId: string;
    partnerName: string;
    status: 'sent' | 'acknowledged' | 'rejected' | 'error';
    messageId?: string;
    responseTime?: number;
    errorMessage?: string;
  }>;
  summary: {
    totalSent: number;
    successful: number;
    failed: number;
    averageResponseTime: number;
  };
  nextSteps: string[];
  estimatedResponses: Array<{
    partnerId: string;
    estimatedResponseTime: number;
    probability: number;
  }>;
}

export interface LeadAnalytics {
  leadId: string;
  metrics: {
    views: number;
    applications: number;
    approvals: number;
    rejections: number;
    conversions: number;
    averageResponseTime: number;
    totalProcessingTime: number;
  };
  partnerPerformance: Array<{
    partnerId: string;
    partnerName: string;
    responseTime: number;
    conversionRate: number;
    status: string;
    lastInteraction: string;
  }>;
  funnels: Array<{
    stage: string;
    count: number;
    conversionRate: number;
    averageTime: number;
  }>;
  trends: {
    daily: Array<{
      date: string;
      applications: number;
      approvals: number;
      conversions: number;
    }>;
    monthly: Array<{
      month: string;
      applications: number;
      approvals: number;
      conversions: number;
    }>;
  };
  generatedAt: string;
}

export interface BulkLeadOperation {
  operationId: string;
  type: 'forward' | 'update_status' | 'delete' | 'export';
  leadIds: string[];
  parameters?: Record<string, any>;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  results?: Array<{
    leadId: string;
    success: boolean;
    message?: string;
    data?: any;
  }>;
  errors?: string[];
  createdAt: string;
  completedAt?: string;
}

export interface PartnerWebhook {
  webhookId: string;
  partnerId: string;
  url: string;
  events: Array<'lead_created' | 'lead_updated' | 'lead_status_changed' | 'partner_assigned'>;
  secret: string;
  active: boolean;
  lastTriggered?: string;
  deliveryLogs: Array<{
    timestamp: string;
    event: string;
    payload: any;
    responseStatus: number;
    responseTime: number;
    success: boolean;
    errorMessage?: string;
  }>;
}

/**
 * Lead Generation API
 */
export const leadGenerationApi = {
  /**
   * Create a new lead
   */
  createLead: async (request: LeadCreationRequest): Promise<LeadCreationResponse> => {
    const securityManager = new LeadGenerationSecurityManager();
    const requestId = crypto.randomUUID();
    const timestamp = new Date().toISOString();

    try {
      // Authentication and authorization
      const tokenStore = useTokenStore.getState();
      const token = tokenStore.getAccessToken();

      if (!token) {
        throw new Error('Authentication required');
      }

      // Validate token format and claims
      if (!securityUtils.validateTokenFormat(token)) {
        throw new Error('Invalid token format');
      }

      if (!securityUtils.validateTokenClaims(token)) {
        throw new Error('Invalid token claims');
      }

      // Extract and validate IP address
      const ipAddress = request.metadata?.ipAddress || '0.0.0.0';
      const sanitizedIpAddress = validateAndSanitizeIP(ipAddress);

      // Detect suspicious activity
      const suspiciousActivityCheck = securityManager.detectSuspiciousActivity(
        'system', // Would be actual user ID in production
        sanitizedIpAddress,
        request.metadata?.userAgent || '',
        'create_lead'
      );

      if (suspiciousActivityCheck.isSuspicious) {
        throw new Error(`Suspicious activity detected: ${suspiciousActivityCheck.action}`);
      }

      // Comprehensive input sanitization
      const sanitizedLeadData = sanitizeLeadData(request.leadData);
      const sanitizedConsentRecords = request.consentRecords.map(consent => ({
        ...consent,
        ipAddress: sanitizedIpAddress,
        userAgent: securityUtils.sanitizeInput(request.metadata?.userAgent || ''),
      }));

      // Vietnamese compliance validation
      const complianceValidation = defaultComplianceManager.canProcessData(
        'temp_lead_id', // Would be actual lead ID
        'loan_application_processing',
        'personal_data'
      );

      if (!complianceValidation.allowed) {
        throw new Error(`Compliance validation failed: ${complianceValidation.reason}`);
      }

      // Encrypt sensitive Vietnamese personal data
      const encryptedLeadData = encryptLeadData(sanitizedLeadData, requestId);

      // Create secure request payload
      const secureRequest = {
        ...request,
        leadData: encryptedLeadData,
        consentRecords: sanitizedConsentRecords,
        metadata: {
          ...request.metadata,
          ipAddress: sanitizedIpAddress,
          userAgent: securityUtils.sanitizeInput(request.metadata?.userAgent || '').substring(0, 500),
          requestId,
          timestamp,
          complianceValidated: true,
          dataEncrypted: true,
        },
      };

      // Add comprehensive security headers
      const securityHeaders = {
        'Authorization': `Bearer ${token}`,
        'X-CSRF-Token': securityUtils.generateCSRFToken(),
        'X-Request-ID': requestId,
        'X-Client-Timestamp': timestamp,
        'X-Security-Context': JSON.stringify({
          encryptionEnabled: true,
          complianceValidated: true,
          suspiciousActivityChecked: true,
          dataSanitized: true,
        }),
        'Content-Security-Policy': "default-src 'self'",
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
      };

      const response = await apiClient.POST('/leads', {
        body: secureRequest,
        headers: securityHeaders,
      });

      if (response.error) {
        // Log security incident
        securityManager['logSecurityEvent'](
          'SECURITY_BREACH' as any,
          'system',
          {
            requestId,
            error: response.error.message,
            action: 'lead_creation_failed',
            ipAddress: sanitizedIpAddress,
          },
          'high'
        );

        throw new Error(`Lead creation failed: ${response.error.message}`);
      }

      // Log successful creation
      securityManager['logSecurityEvent'](
        'LEAD_CREATION' as any,
        'system',
        {
          requestId,
          leadId: response.data.leadId,
          action: 'lead_created_successfully',
          ipAddress: sanitizedIpAddress,
          consentRecordsCount: sanitizedConsentRecords.length,
        },
        'low'
      );

      return response.data;

    } catch (error) {
      // Log security error
      console.error('Security error in createLead:', error);

      // Don't expose sensitive error details
      if (error.message.includes('suspicious') || error.message.includes('token') || error.message.includes('compliance')) {
        throw new Error('Request cannot be processed due to security validation failure');
      }

      throw error;
    }
  },

  /**
   * Get lead status and details
   */
  getLeadStatus: async (leadId: string): Promise<LeadStatus> => {
    const response = await apiClient.GET(`/leads/{leadId}/status`, {
      params: {
        path: { leadId },
      },
    });

    if (response.error) {
      throw new Error(`Failed to get lead status: ${response.error.message}`);
    }

    return response.data;
  },

  /**
   * Update lead status
   */
  updateLeadStatus: async (
    leadId: string,
    status: string,
    reason?: string,
    notes?: string
  ): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.PUT(`/leads/{leadId}/status`, {
      params: {
        path: { leadId },
      },
      body: {
        status,
        reason,
        notes,
        timestamp: new Date().toISOString(),
      },
    });

    if (response.error) {
      throw new Error(`Failed to update lead status: ${response.error.message}`);
    }

    return response.data;
  },

  /**
   * Forward lead to partners
   */
  forwardLeadToPartners: async (request: LeadForwardingRequest): Promise<LeadForwardingResponse> => {
    const response = await apiClient.POST(`/leads/{leadId}/forward`, {
      params: {
        path: { leadId: request.leadId },
      },
      body: {
        partnerIds: request.partnerIds,
        priority: request.priority,
        message: request.message,
        documents: request.documents,
        customFields: request.customFields,
        deadline: request.deadline,
        forwardingTimestamp: new Date().toISOString(),
      },
    });

    if (response.error) {
      throw new Error(`Lead forwarding failed: ${response.error.message}`);
    }

    return response.data;
  },

  /**
   * Get lead analytics
   */
  getLeadAnalytics: async (
    leadId: string,
    period?: 'week' | 'month' | 'quarter' | 'year'
  ): Promise<LeadAnalytics> => {
    const response = await apiClient.GET(`/leads/{leadId}/analytics`, {
      params: {
        path: { leadId },
        query: { period },
      },
    });

    if (response.error) {
      throw new Error(`Failed to get lead analytics: ${response.error.message}`);
    }

    return response.data;
  },

  /**
   * Get multiple leads
   */
  getLeads: async (params?: {
    page?: number;
    limit?: number;
    status?: string[];
    partnerId?: string;
    dateFrom?: string;
    dateTo?: string;
    searchTerm?: string;
    sortBy?: 'created_at' | 'updated_at' | 'status' | 'score';
    sortOrder?: 'asc' | 'desc';
  }): Promise<{
    leads: Array<{
      id: string;
      fullName: string;
      email?: string;
      phoneNumber: string;
      status: string;
      score?: number;
      loanType: string;
      loanAmount: number;
      assignedPartners: number;
      createdAt: string;
      lastUpdated: string;
    }>;
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> => {
    const response = await apiClient.GET('/leads', {
      params: {
        query: params,
      },
    });

    if (response.error) {
      throw new Error(`Failed to get leads: ${response.error.message}`);
    }

    return response.data;
  },

  /**
   * Bulk lead operations
   */
  bulkOperation: async (operation: Omit<BulkLeadOperation, 'operationId' | 'status' | 'progress' | 'createdAt'>): Promise<BulkLeadOperation> => {
    const response = await apiClient.POST('/leads/bulk', {
      body: {
        type: operation.type,
        leadIds: operation.leadIds,
        parameters: operation.parameters,
        initiatedAt: new Date().toISOString(),
      },
    });

    if (response.error) {
      throw new Error(`Bulk operation failed: ${response.error.message}`);
    }

    return response.data;
  },

  /**
   * Get bulk operation status
   */
  getBulkOperationStatus: async (operationId: string): Promise<BulkLeadOperation> => {
    const response = await apiClient.GET('/leads/bulk/{operationId}', {
      params: {
        path: { operationId },
      },
    });

    if (response.error) {
      throw new Error(`Failed to get operation status: ${response.error.message}`);
    }

    return response.data;
  },

  /**
   * Export leads
   */
  exportLeads: async (params: {
    format: 'csv' | 'excel' | 'pdf';
    filters?: any;
    fields?: string[];
    dateFrom?: string;
    dateTo?: string;
  }): Promise<{
    exportId: string;
    downloadUrl: string;
    expiresAt: string;
    estimatedSize: number;
    recordCount: number;
  }> => {
    const response = await apiClient.POST('/leads/export', {
      body: {
        format: params.format,
        filters: params.filters,
        fields: params.fields,
        dateFrom: params.dateFrom,
        dateTo: params.dateTo,
        requestedAt: new Date().toISOString(),
      },
    });

    if (response.error) {
      throw new Error(`Export failed: ${response.error.message}`);
    }

    return response.data;
  },

  /**
   * Get export status
   */
  getExportStatus: async (exportId: string): Promise<{
    exportId: string;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    progress: number;
    downloadUrl?: string;
    expiresAt?: string;
    errorMessage?: string;
    completedAt?: string;
  }> => {
    const response = await apiClient.GET('/leads/export/{exportId}', {
      params: {
        path: { exportId },
      },
    });

    if (response.error) {
      throw new Error(`Failed to get export status: ${response.error.message}`);
    }

    return response.data;
  },

  /**
   * Search leads
   */
  searchLeads: async (query: {
    term: string;
    filters?: {
      status?: string[];
      dateFrom?: string;
      dateTo?: string;
      loanType?: string[];
      minAmount?: number;
      maxAmount?: number;
      partnerId?: string[];
    };
    page?: number;
    limit?: number;
  }): Promise<{
    leads: any[];
    pagination: any;
    searchTime: number;
    totalResults: number;
  }> => {
    const response = await apiClient.POST('/leads/search', {
      body: {
        query: query.term,
        filters: query.filters,
        page: query.page || 1,
        limit: query.limit || 20,
        searchedAt: new Date().toISOString(),
      },
    });

    if (response.error) {
      throw new Error(`Search failed: ${response.error.message}`);
    }

    return response.data;
  },

  /**
   * Get lead statistics
   */
  getLeadStatistics: async (period?: 'today' | 'week' | 'month' | 'quarter' | 'year'): Promise<{
    totalLeads: number;
    qualifiedLeads: number;
    forwardedLeads: number;
    acceptedLeads: number;
    rejectedLeads: number;
    conversionRate: number;
    averageResponseTime: number;
    topPartners: Array<{
      partnerId: string;
      partnerName: string;
      leadsAssigned: number;
      conversionRate: number;
      averageResponseTime: number;
    }>;
    trends: {
      daily: Array<{ date: string; count: number }>;
      weekly: Array<{ week: string; count: number }>;
    };
    period: string;
    generatedAt: string;
  }> => {
    const response = await apiClient.GET('/leads/statistics', {
      params: {
        query: { period },
      },
    });

    if (response.error) {
      throw new Error(`Failed to get statistics: ${response.error.message}`);
    }

    return response.data;
  },

  /**
   * Validate lead data
   */
  validateLeadData: async (leadData: Partial<LeadData>): Promise<{
    valid: boolean;
    errors: Array<{
      field: string;
      message: string;
      severity: 'error' | 'warning';
    }>;
    score?: number;
    recommendations: string[];
  }> => {
    const response = await apiClient.POST('/leads/validate', {
      body: {
        leadData,
        validatedAt: new Date().toISOString(),
      },
    });

    if (response.error) {
      throw new Error(`Validation failed: ${response.error.message}`);
    }

    return response.data;
  },

  /**
   * Upload lead documents
   */
  uploadLeadDocuments: async (
    leadId: string,
    documents: Array<{
      type: string;
      file: File;
      description?: string;
    }>
  ): Promise<Array<{
    documentId: string;
    type: string;
    name: string;
    url: string;
    size: number;
    uploadedAt: string;
  }>> => {
    const formData = new FormData();

    documents.forEach((doc, index) => {
      formData.append(`documents[${index}].file`, doc.file);
      formData.append(`documents[${index}].type`, doc.type);
      if (doc.description) {
        formData.append(`documents[${index}].description`, doc.description);
      }
    });

    formData.append('leadId', leadId);
    formData.append('uploadedAt', new Date().toISOString());

    const response = await apiClient.POST(`/leads/{leadId}/documents`, {
      params: {
        path: { leadId },
      },
      body: formData as any,
      bodySerializer: 'multipart',
    });

    if (response.error) {
      throw new Error(`Document upload failed: ${response.error.message}`);
    }

    return response.data;
  },

  /**
   * Get lead documents
   */
  getLeadDocuments: async (leadId: string): Promise<Array<{
    documentId: string;
    type: string;
    name: string;
    url: string;
    size: number;
    uploadedAt: string;
    description?: string;
  }>> => {
    const response = await apiClient.GET(`/leads/{leadId}/documents`, {
      params: {
        path: { leadId },
      },
    });

    if (response.error) {
      throw new Error(`Failed to get documents: ${response.error.message}`);
    }

    return response.data;
  },

  /**
   * Delete lead document
   */
  deleteLeadDocument: async (leadId: string, documentId: string): Promise<{ success: boolean }> => {
    const response = await apiClient.DELETE(`/leads/{leadId}/documents/{documentId}`, {
      params: {
        path: { leadId, documentId },
      },
    });

    if (response.error) {
      throw new Error(`Failed to delete document: ${response.error.message}`);
    }

    return response.data;
  },

  /**
   * Register partner webhook
   */
  registerPartnerWebhook: async (webhook: Omit<PartnerWebhook, 'webhookId' | 'lastTriggered' | 'deliveryLogs'>): Promise<PartnerWebhook> => {
    const response = await apiClient.POST('/partners/webhooks', {
      body: {
        ...webhook,
        registeredAt: new Date().toISOString(),
      },
    });

    if (response.error) {
      throw new Error(`Webhook registration failed: ${response.error.message}`);
    }

    return response.data;
  },

  /**
   * Get partner webhooks
   */
  getPartnerWebhooks: async (partnerId: string): Promise<PartnerWebhook[]> => {
    const response = await apiClient.GET('/partners/{partnerId}/webhooks', {
      params: {
        path: { partnerId },
      },
    });

    if (response.error) {
      throw new Error(`Failed to get webhooks: ${response.error.message}`);
    }

    return response.data;
  },

  /**
   * Test partner webhook
   */
  testPartnerWebhook: async (webhookId: string): Promise<{
    success: boolean;
    responseTime: number;
    statusCode: number;
    responseBody?: string;
    errorMessage?: string;
  }> => {
    const response = await apiClient.POST('/partners/webhooks/{webhookId}/test', {
      params: {
        path: { webhookId },
      },
      body: {
        testPayload: {
          event: 'test',
          timestamp: new Date().toISOString(),
          data: { test: true },
        },
      },
    });

    if (response.error) {
      throw new Error(`Webhook test failed: ${response.error.message}`);
    }

    return response.data;
  },
};

// Helper functions for the API
/**
 * Validate and sanitize IP address
 */
function validateAndSanitizeIP(ipAddress: string): string {
  // Remove invalid characters
  const sanitized = ipAddress.replace(/[^0-9.]/g, '');

  // Validate IP format
  const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
  if (!ipRegex.test(sanitized)) {
    return '0.0.0.0'; // Default fallback
  }

  // Validate each octet is between 0-255
  const octets = sanitized.split('.');
  for (const octet of octets) {
    const num = parseInt(octet, 10);
    if (num < 0 || num > 255) {
      return '0.0.0.0';
    }
  }

  return sanitized;
}

/**
 * Sanitize lead data with field-specific validation
 */
function sanitizeLeadData(leadData: LeadData): LeadData {
  try {
    // Use comprehensive sanitization
    const sanitized = sanitizeApplicationData(leadData);

    // Additional Vietnamese-specific validations
    if (sanitized.phoneNumber) {
      sanitized.phoneNumber = sanitizeVietnamesePhone(sanitized.phoneNumber);
    }

    if (sanitized.email) {
      sanitized.email = sanitizeEmail(sanitized.email);
    }

    if (sanitized.nationalId) {
      sanitized.nationalId = sanitizeVietnameseID(sanitized.nationalId);
    }

    // Sanitize address fields
    if (sanitized.currentAddress?.street) {
      sanitized.currentAddress.street = securityUtils.sanitizeInput(sanitized.currentAddress.street);
    }

    if (sanitized.permanentAddress?.street) {
      sanitized.permanentAddress.street = securityUtils.sanitizeInput(sanitized.permanentAddress.street);
    }

    // Sanitize employment data
    if (sanitized.employment?.companyName) {
      sanitized.employment.companyName = securityUtils.sanitizeInput(sanitized.employment.companyName);
    }

    if (sanitized.employment?.jobTitle) {
      sanitized.employment.jobTitle = securityUtils.sanitizeInput(sanitized.employment.jobTitle);
    }

    // Sanitize loan purpose
    if (sanitized.loanRequirements?.loanPurpose) {
      sanitized.loanRequirements.loanPurpose = securityUtils.sanitizeInput(sanitized.loanRequirements.loanPurpose);
    }

    return sanitized;
  } catch (error) {
    throw new Error(`Data sanitization failed: ${error.message}`);
  }
}

/**
 * Calculate age from date of birth
 */
function calculateAge(dateOfBirth: string): number {
  const birthDate = new Date(dateOfBirth);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDifference = today.getMonth() - birthDate.getMonth();

  if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  return age;
}

export default leadGenerationApi;