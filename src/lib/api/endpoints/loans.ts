// @ts-nocheck

import { dopClient } from "@/lib/api/services/dop";
import { securityUtils, useTokenStore } from "@/lib/auth/secure-tokens";
import type { paths } from "../v1/dop";

/**
 * Loan Application API endpoints
 */
export const loanApi = {
  // Get loan products
  getLoanProducts: async (
    params?: paths["/loans"]["get"]["parameters"]["query"],
  ) => {
    const response = await dopClient.GET("/loans", {
      params: {
        query: params,
      },
    });
    return response.data;
  },

  // Get single loan product
  getLoanProduct: async (id: string) => {
    const response = await dopClient.GET("/loans/{id}", {
      params: {
        path: { id },
      },
    });
    return response.data;
  },

  // Submit loan application
  submitLoanApplication: async (
    application: paths["/loans/applications"]["post"]["requestBody"]["content"]["application/json"],
  ) => {
    const response = await dopClient.POST("/loans/applications", {
      body: application,
    });
    return response.data;
  },

  // Get loan application status
  getApplicationStatus: async (applicationId: string) => {
    const response = await dopClient.GET("/loans/applications/{id}/status", {
      params: {
        path: { id: applicationId },
      },
    });
    return response.data;
  },

  // Get user's loan applications
  getUserApplications: async (
    params?: paths["/loans/applications"]["get"]["parameters"]["query"],
  ) => {
    const response = await dopClient.GET("/loans/applications", {
      params: {
        query: params,
      },
    });
    return response.data;
  },

  // Get loan eligibility
  checkEligibility: async (
    criteria: paths["/loans/eligibility"]["post"]["requestBody"]["content"]["application/json"],
  ) => {
    const response = await dopClient.POST("/loans/eligibility", {
      body: criteria,
    });
    return response.data;
  },

  // Calculate loan payment
  calculatePayment: async (
    loanDetails: paths["/loans/calculator"]["post"]["requestBody"]["content"]["application/json"],
  ) => {
    const response = await dopClient.POST("/loans/calculator", {
      body: loanDetails,
    });
    return response.data;
  },

  // Compare loan products
  compareProducts: async (
    products: paths["/loans/compare"]["post"]["requestBody"]["content"]["application/json"],
  ) => {
    const response = await dopClient.POST("/loans/compare", {
      body: { products },
    });
    return response.data;
  },

  // Get loan providers
  getLoanProviders: async () => {
    const response = await dopClient.GET("/loans/providers");
    return response.data;
  },

  // Update application documents
  uploadDocuments: async (
    applicationId: string,
    documents: paths["/loans/applications/{id}/documents"]["post"]["requestBody"]["content"]["multipart/form-data"],
  ) => {
    const response = await dopClient.POST(
      "/loans/applications/{id}/documents",
      {
        params: {
          path: { id: applicationId },
        },
        body: documents,
        bodySerializer: "multipart",
      },
    );
    return response.data;
  },

  // Get application timeline
  getApplicationTimeline: async (applicationId: string) => {
    const response = await dopClient.GET("/loans/applications/{id}/timeline", {
      params: {
        path: { id: applicationId },
      },
    });
    return response.data;
  },

  // Enhanced status tracking APIs

  /**
   * Get real-time application status with detailed information
   */
  getDetailedApplicationStatus: async (applicationId: string) => {
    const response = await dopClient.GET(
      "/loans/applications/{id}/detailed-status" as any,
      {
        params: {
          path: { id: applicationId },
        },
      },
    );
    return response.data;
  },

  /**
   * Subscribe to real-time status updates using WebSocket
   */
  subscribeToStatusUpdates: (
    applicationId: string,
    onStatusUpdate: (data: any) => void,
  ) => {
    const wsUrl = `${process.env.NEXT_PUBLIC_WS_URL}/loans/applications/${applicationId}/status`;
    const tokenStore = useTokenStore.getState();
    const token = tokenStore.getAccessToken();

    const ws = new WebSocket(`${wsUrl}?token=${token}`);

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        onStatusUpdate(data);
      } catch (error) {
        console.error("Failed to parse WebSocket message:", error);
      }
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    ws.onclose = () => {
      console.log("WebSocket connection closed");
    };

    return ws;
  },

  /**
   * Subscribe to Server-Sent Events for status updates (fallback for WebSocket)
   */
  subscribeToStatusUpdatesSSE: (
    applicationId: string,
    onStatusUpdate: (data: any) => void,
  ) => {
    const token = useTokenStore.getState().getAccessToken();
    const eventSource = new EventSource(
      `/api/v1/loans/applications/${applicationId}/status-stream?token=${token}`,
    );

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        onStatusUpdate(data);
      } catch (error) {
        console.error("Failed to parse SSE message:", error);
      }
    };

    eventSource.onerror = (error) => {
      console.error("SSE error:", error);
    };

    return eventSource;
  },

  /**
   * Get application documents status
   */
  getApplicationDocumentsStatus: async (applicationId: string) => {
    const response = await dopClient.GET(
      "/api/v1/loans/applications/{id}/documents-status" as any,
      {
        params: {
          path: { id: applicationId },
        },
      },
    );
    return response.data;
  },

  /**
   * Get communication history for application
   */
  getApplicationCommunications: async (
    applicationId: string,
    params?: {
      type?: string;
      status?: string;
      limit?: number;
      offset?: number;
    },
  ) => {
    const response = await dopClient.GET(
      "/api/v1/loans/applications/{id}/communications" as any,
      {
        params: {
          path: { id: applicationId },
          query: params,
        },
      },
    );
    return response.data;
  },

  /**
   * Send communication message
   */
  sendApplicationMessage: async (
    applicationId: string,
    message: {
      type: "sms" | "email" | "in_app" | "zalo";
      title: string;
      content: string;
      priority?: "low" | "normal" | "high" | "urgent";
      attachments?: Array<{
        name: string;
        type: string;
        size: number;
        data: string; // base64 encoded
      }>;
    },
  ) => {
    const response = await dopClient.POST(
      "/api/v1/loans/applications/{id}/communications" as any,
      {
        params: {
          path: { id: applicationId },
        },
        body: message,
      },
    );
    return response.data;
  },

  /**
   * Mark communication as read
   */
  markCommunicationAsRead: async (communicationId: string) => {
    const response = await dopClient.PUT(
      "/api/v1/communications/{id}/read" as any,
      {
        params: {
          path: { id: communicationId },
        },
      },
    );
    return response.data;
  },

  /**
   * Get notification preferences
   */
  getNotificationPreferences: async (applicationId?: string) => {
    const url = applicationId
      ? `/api/v1/loans/applications/${applicationId}/notification-preferences`
      : "/api/v1/user/notification-preferences";

    const response = await dopClient.GET(url as any);
    return response.data;
  },

  /**
   * Update notification preferences
   */
  updateNotificationPreferences: async (preferences: {
    applicationId?: string;
    channels: {
      sms: boolean;
      email: boolean;
      in_app: boolean;
      zalo: boolean;
      phone_call: boolean;
    };
    frequency: "real_time" | "daily" | "weekly" | "never";
    doNotDisturb?: {
      enabled: boolean;
      startTime: string; // HH:MM
      endTime: string; // HH:MM
      timezone: string;
    };
    urgentOnly: boolean;
  }) => {
    const url = preferences.applicationId
      ? `/api/v1/loans/applications/${preferences.applicationId}/notification-preferences`
      : "/api/v1/user/notification-preferences";

    const response = await dopClient.PUT(url as any, {
      body: preferences,
    });
    return response.data;
  },

  /**
   * Get application milestones and estimated completion time
   */
  getApplicationMilestones: async (applicationId: string) => {
    const response = await dopClient.GET(
      "/api/v1/loans/applications/{id}/milestones" as any,
      {
        params: {
          path: { id: applicationId },
        },
      },
    );
    return response.data;
  },

  /**
   * Get status transition history
   */
  getStatusTransitionHistory: async (applicationId: string) => {
    const response = await dopClient.GET(
      "/api/v1/loans/applications/{id}/status-history" as any,
      {
        params: {
          path: { id: applicationId },
        },
      },
    );
    return response.data;
  },

  /**
   * Get SLA information for current status
   */
  getApplicationSLA: async (applicationId: string) => {
    const response = await dopClient.GET(
      "/api/v1/loans/applications/{id}/sla" as any,
      {
        params: {
          path: { id: applicationId },
        },
      },
    );
    return response.data;
  },

  /**
   * Request status update notification
   */
  requestStatusNotification: async (
    applicationId: string,
    channels: string[],
  ) => {
    const response = await dopClient.POST(
      "/api/v1/loans/applications/{id}/status-notification" as any,
      {
        params: {
          path: { id: applicationId },
        },
        body: { channels },
      },
    );
    return response.data;
  },

  /**
   * Get application activity log
   */
  getApplicationActivityLog: async (
    applicationId: string,
    params?: {
      limit?: number;
      offset?: number;
      type?: string;
      startDate?: string;
      endDate?: string;
    },
  ) => {
    const response = await dopClient.GET(
      "/api/v1/loans/applications/{id}/activity-log" as any,
      {
        params: {
          path: { id: applicationId },
          query: params,
        },
      },
    );
    return response.data;
  },

  /**
   * Get next required actions for current status
   */
  getRequiredActions: async (applicationId: string) => {
    const response = await dopClient.GET(
      "/api/v1/loans/applications/{id}/required-actions" as any,
      {
        params: {
          path: { id: applicationId },
        },
      },
    );
    return response.data;
  },

  /**
   * Upload document with progress tracking
   */
  uploadDocumentWithProgress: async (
    applicationId: string,
    documentType: string,
    file: File,
    onProgress?: (progress: number) => void,
  ) => {
    const formData = new FormData();
    formData.append("documentType", documentType);
    formData.append("file", file);

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      if (onProgress) {
        xhr.upload.addEventListener("progress", (event) => {
          if (event.lengthComputable) {
            const progress = Math.round((event.loaded / event.total) * 100);
            onProgress(progress);
          }
        });
      }

      xhr.addEventListener("load", () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response = JSON.parse(xhr.responseText);
            resolve(response);
          } catch (_error) {
            reject(new Error("Invalid response format"));
          }
        } else {
          reject(new Error(`Upload failed with status ${xhr.status}`));
        }
      });

      xhr.addEventListener("error", () => {
        reject(new Error("Network error during upload"));
      });

      const tokenStore = useTokenStore.getState();
      const token = tokenStore.getAccessToken();

      xhr.open(
        "POST",
        `/api/v1/loans/applications/${applicationId}/documents-with-progress`,
      );
      xhr.setRequestHeader("Authorization", `Bearer ${token}`);

      xhr.send(formData);
    });
  },

  /**
   * Get document verification status
   */
  getDocumentVerificationStatus: async (
    applicationId: string,
    documentId: string,
  ) => {
    const response = await dopClient.GET(
      "/api/v1/loans/applications/{id}/documents/{documentId}/verification" as any,
      {
        params: {
          path: { id: applicationId, documentId },
        },
      },
    );
    return response.data;
  },

  /**
   * Resubmit rejected document
   */
  resubmitDocument: async (
    applicationId: string,
    documentId: string,
    file: File,
  ) => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await dopClient.POST(
      "/api/v1/loans/applications/{id}/documents/{documentId}/resubmit" as any,
      {
        params: {
          path: { id: applicationId, documentId },
        },
        body: formData,
      },
    );
    return response.data;
  },

  /**
   * Get Vietnamese document types and requirements
   */
  getVietnameseDocumentTypes: async (loanType?: string) => {
    const response = await dopClient.GET(
      "/api/v1/loans/vietnamese-document-types" as any,
      {
        params: {
          query: { loanType },
        },
      },
    );
    return response.data;
  },

  /**
   * Get status configuration for Vietnamese market
   */
  getVietnameseStatusConfig: async () => {
    const response = await dopClient.GET(
      "/api/v1/loans/vietnamese-status-config" as any,
    );
    return response.data;
  },

  /**
   * Get processing time standards
   */
  getProcessingTimeStandards: async (loanType: string) => {
    const response = await dopClient.GET(
      "/api/v1/loans/processing-time-standards" as any,
      {
        params: {
          query: { loanType },
        },
      },
    );
    return response.data;
  },

  /**
   * Get communication templates
   */
  getCommunicationTemplates: async (category?: string) => {
    const response = await dopClient.GET(
      "/api/v1/loans/communication-templates" as any,
      {
        params: {
          query: { category },
        },
      },
    );
    return response.data;
  },

  /**
   * Send message using template
   */
  sendTemplatedMessage: async (
    applicationId: string,
    templateId: string,
    variables: Record<string, any>,
  ) => {
    const response = await dopClient.POST(
      "/api/v1/loans/applications/{id}/templated-message" as any,
      {
        params: {
          path: { id: applicationId },
        },
        body: { templateId, variables },
      },
    );
    return response.data;
  },

  /**
   * Get notification delivery status
   */
  getNotificationDeliveryStatus: async (notificationId: string) => {
    const response = await dopClient.GET(
      "/api/v1/notifications/{id}/delivery-status" as any,
      {
        params: {
          path: { id: notificationId },
        },
      },
    );
    return response.data;
  },

  /**
   * Escalate application for urgent processing
   */
  escalateApplication: async (
    applicationId: string,
    reason: string,
    priority: "high" | "urgent",
  ) => {
    const response = await dopClient.POST(
      "/api/v1/loans/applications/{id}/escalate" as any,
      {
        params: {
          path: { id: applicationId },
        },
        body: { reason, priority },
      },
    );
    return response.data;
  },

  /**
   * Request document extension
   */
  requestDocumentExtension: async (
    applicationId: string,
    documentId: string,
    reason: string,
    requestedDays: number,
  ) => {
    const response = await dopClient.POST(
      "/api/v1/loans/applications/{id}/documents/{documentId}/extension-request" as any,
      {
        params: {
          path: { id: applicationId, documentId },
        },
        body: { reason, requestedDays },
      },
    );
    return response.data;
  },

  /**
   * Get application audit trail
   */
  getApplicationAuditTrail: async (
    applicationId: string,
    params?: {
      limit?: number;
      offset?: number;
      action?: string;
      userId?: string;
    },
  ) => {
    const response = await dopClient.GET(
      "/api/v1/loans/applications/{id}/audit-trail" as any,
      {
        params: {
          path: { id: applicationId },
          query: params,
        },
      },
    );
    return response.data;
  },

  /**
   * Schedule callback request
   */
  scheduleCallback: async (
    applicationId: string,
    callback: {
      preferredDate: string;
      preferredTime: string;
      phoneNumber: string;
      reason: string;
      topic: string;
    },
  ) => {
    const response = await dopClient.POST(
      "/api/v1/loans/applications/{id}/schedule-callback" as any,
      {
        params: {
          path: { id: applicationId },
        },
        body: callback,
      },
    );
    return response.data;
  },

  /**
   * Get upcoming milestones and deadlines
   */
  getUpcomingMilestones: async (applicationId: string) => {
    const response = await dopClient.GET(
      "/api/v1/loans/applications/{id}/upcoming-milestones" as any,
      {
        params: {
          path: { id: applicationId },
        },
      },
    );
    return response.data;
  },

  /**
   * Set application reminder
   */
  setApplicationReminder: async (
    applicationId: string,
    reminder: {
      type: "document_upload" | "status_check" | "follow_up";
      scheduledDate: string;
      message: string;
      channels: string[];
    },
  ) => {
    const response = await dopClient.POST(
      "/api/v1/loans/applications/{id}/reminders" as any,
      {
        params: {
          path: { id: applicationId },
        },
        body: reminder,
      },
    );
    return response.data;
  },

  /**
   * Get estimated completion date based on current status and processing patterns
   */
  getEstimatedCompletionDate: async (applicationId: string) => {
    const response = await dopClient.GET(
      "/api/v1/loans/applications/{id}/estimated-completion" as any,
      {
        params: {
          path: { id: applicationId },
        },
      },
    );
    return response.data;
  },
};

/**
 * Loan Admin API endpoints (admin only)
 */
export const loanAdminApi = {
  // Get all applications (admin)
  getAllApplications: async (
    params?: paths["/admin/loans/applications"]["get"]["parameters"]["query"],
  ) => {
    const response = await dopClient.GET("/admin/loans/applications", {
      params: {
        query: params,
      },
    });
    return response.data;
  },

  // Update application status
  updateApplicationStatus: async (
    applicationId: string,
    status: paths["/admin/loans/applications/{id}/status"]["put"]["requestBody"]["content"]["application/json"],
  ) => {
    const response = await dopClient.PUT(
      "/admin/loans/applications/{id}/status",
      {
        params: {
          path: { id: applicationId },
        },
        body: status,
      },
    );
    return response.data;
  },

  // Forward application to partner
  forwardApplication: async (
    applicationId: string,
    partnerData: paths["/admin/loans/applications/{id}/forward"]["post"]["requestBody"]["content"]["application/json"],
  ) => {
    const response = await dopClient.POST(
      "/admin/loans/applications/{id}/forward",
      {
        params: {
          path: { id: applicationId },
        },
        body: partnerData,
      },
    );
    return response.data;
  },

  // Get partner performance
  getPartnerPerformance: async (
    params?: paths["/admin/loans/partners"]["get"]["parameters"]["query"],
  ) => {
    const response = await dopClient.GET("/admin/loans/partners", {
      params: {
        query: params,
      },
    });
    return response.data;
  },

  // Enhanced loan application form endpoints

  /**
   * Validate loan application form data
   */
  validateApplicationData: async (stepData: {
    step: string;
    data: Record<string, any>;
    loanType?: string;
  }) => {
    const response = await dopClient.POST("/loans/validate", {
      body: stepData,
    });
    return response.data;
  },

  /**
   * Get Vietnamese provinces/cities for address dropdowns
   */
  getProvinces: async () => {
    const response = await dopClient.GET("/location/provinces");
    return response.data;
  },

  /**
   * Get districts by province code
   */
  getDistricts: async (provinceCode: string) => {
    const response = await dopClient.GET("/location/districts", {
      params: {
        query: { provinceCode },
      },
    });
    return response.data;
  },

  /**
   * Get wards by district code
   */
  getWards: async (districtCode: string) => {
    const response = await dopClient.GET("/location/wards", {
      params: {
        query: { districtCode },
      },
    });
    return response.data;
  },

  /**
   * Get list of supported banks in Vietnam
   */
  getBanks: async () => {
    const response = await dopClient.GET("/banks");
    return response.data;
  },

  /**
   * Get income source options
   */
  getIncomeSources: async () => {
    const response = await dopClient.GET("/config/income-sources");
    return response.data;
  },

  /**
   * Get employment types
   */
  getEmploymentTypes: async () => {
    const response = await dopClient.GET("/config/employment-types");
    return response.data;
  },

  /**
   * Get loan purposes
   */
  getLoanPurposes: async () => {
    const response = await dopClient.GET("/config/loan-purposes");
    return response.data;
  },

  /**
   * Check loan eligibility
   */
  checkEligibility: async (criteria: {
    monthlyIncome?: number;
    age?: number;
    employmentType?: string;
    loanAmount?: number;
    loanTerm?: number;
    existingLoans?: number;
    creditScore?: number;
  }) => {
    const response = await dopClient.POST("/loans/eligibility-check", {
      body: criteria,
    });
    return response.data;
  },

  /**
   * Calculate loan payment schedule
   */
  calculatePaymentSchedule: async (loanDetails: {
    amount: number;
    term: number;
    interestRate: number;
    interestType: "reducing" | "flat" | "fixed";
    firstPaymentDate?: string;
  }) => {
    const response = await dopClient.POST("/loans/payment-schedule", {
      body: loanDetails,
    });
    return response.data;
  },

  /**
   * Upload document for loan application with secure authentication
   */
  uploadDocument: async (
    applicationId: string,
    documentType: string,
    file: File,
    onProgress?: (progress: number) => void,
  ) => {
    // Validate file type and size
    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "image/jpg",
    ];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!allowedTypes.includes(file.type)) {
      throw new Error(
        "Invalid file type. Only PDF, JPEG, and PNG files are allowed.",
      );
    }

    if (file.size > maxSize) {
      throw new Error("File size exceeds 10MB limit.");
    }

    // Sanitize inputs
    const sanitizedApplicationId = applicationId.replace(/[^a-zA-Z0-9-]/g, "");
    const sanitizedDocumentType = documentType.replace(/[^a-zA-Z0-9_-]/g, "");

    const formData = new FormData();
    formData.append("documentType", sanitizedDocumentType);
    formData.append("file", file);

    // Create XMLHttpRequest for progress tracking with secure authentication
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      // Track upload progress
      if (onProgress) {
        xhr.upload.addEventListener("progress", (event) => {
          if (event.lengthComputable) {
            const progress = Math.round((event.loaded / event.total) * 100);
            onProgress(progress);
          }
        });
      }

      xhr.addEventListener("load", () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response = JSON.parse(xhr.responseText);

            // Validate response structure
            if (!response || typeof response !== "object") {
              throw new Error("Invalid response format");
            }

            resolve(response);
          } catch (_error) {
            reject(new Error("Invalid response format"));
          }
        } else if (xhr.status === 401) {
          reject(new Error("Authentication failed. Please log in again."));
        } else if (xhr.status === 403) {
          reject(
            new Error(
              "Permission denied. You don't have access to upload documents.",
            ),
          );
        } else if (xhr.status === 413) {
          reject(new Error("File too large. Maximum size is 10MB."));
        } else {
          reject(new Error(`Upload failed with status ${xhr.status}`));
        }
      });

      xhr.addEventListener("error", () => {
        reject(new Error("Network error during upload"));
      });

      xhr.addEventListener("timeout", () => {
        reject(new Error("Upload timeout"));
      });

      // Configure request with security headers
      xhr.timeout = 300000; // 5 minutes timeout
      xhr.open(
        "POST",
        `/api/v1/loans/applications/${sanitizedApplicationId}/documents`,
      );

      // Add secure auth header
      const tokenStore = useTokenStore.getState();
      const token = tokenStore.getAccessToken();

      if (token) {
        xhr.setRequestHeader("Authorization", `Bearer ${token}`);
        // Add CSRF protection
        const csrfToken = securityUtils.generateCSRFToken();
        xhr.setRequestHeader("X-CSRF-Token", csrfToken);
      } else {
        reject(new Error("Authentication required"));
        return;
      }

      xhr.send(formData);
    });
  },

  /**
   * Delete uploaded document
   */
  deleteDocument: async (applicationId: string, documentId: string) => {
    const response = await dopClient.DELETE(
      "/loans/applications/{id}/documents/{documentId}",
      {
        params: {
          path: { id: applicationId, documentId },
        },
      },
    );
    return response.data;
  },

  /**
   * Get uploaded documents for application
   */
  getApplicationDocuments: async (applicationId: string) => {
    const response = await dopClient.GET("/loans/applications/{id}/documents", {
      params: {
        path: { id: applicationId },
      },
    });
    return response.data;
  },

  /**
   * Save draft application
   */
  saveDraftApplication: async (
    applicationData: Partial<LoanApplicationData>,
  ) => {
    const response = await dopClient.POST("/loans/applications/draft", {
      body: applicationData,
    });
    return response.data;
  },

  /**
   * Get draft application
   */
  getDraftApplication: async (draftId?: string) => {
    const url = draftId
      ? `/loans/applications/draft/${draftId}`
      : "/loans/applications/draft";
    const response = await dopClient.GET(url);
    return response.data;
  },

  /**
   * Submit final loan application
   */
  submitFinalApplication: async (applicationData: LoanApplicationData) => {
    const response = await dopClient.POST("/loans/applications/submit", {
      body: applicationData,
    });
    return response.data;
  },

  /**
   * Get application summary for review
   */
  getApplicationSummary: async (applicationId: string) => {
    const response = await dopClient.GET("/loans/applications/{id}/summary", {
      params: {
        path: { id: applicationId },
      },
    });
    return response.data;
  },

  /**
   * Cancel application
   */
  cancelApplication: async (applicationId: string, reason: string) => {
    const response = await dopClient.POST("/loans/applications/{id}/cancel", {
      params: {
        path: { id: applicationId },
      },
      body: { reason },
    });
    return response.data;
  },

  /**
   * Get loan comparison data
   */
  compareLoanProducts: async (criteria: {
    amount: number;
    term: number;
    purpose?: string;
    income?: number;
    employmentType?: string;
  }) => {
    const response = await dopClient.POST("/loans/compare", {
      body: criteria,
    });
    return response.data;
  },

  // Get application statistics

  /**
   * Get loan application statistics (for dashboard)
   */
  getApplicationStats: async () => {
    const response = await dopClient.GET("/loans/applications/stats");
    return response.data;
  },

  /**
   * Get loan form configuration
   */
  getFormConfiguration: async (loanType?: string) => {
    const response = await dopClient.GET("/loans/form-config", {
      params: {
        query: { loanType },
      },
    });
    return response.data;
  },

  /**
   * Generate application PDF
   */
  generateApplicationPDF: async (applicationId: string) => {
    const response = await dopClient.GET("/loans/applications/{id}/pdf", {
      params: {
        path: { id: applicationId },
      },
    });
    return response.data;
  },
};

/**
 * Vietnamese Loan Products API
 * Extended endpoints for loan product catalog, comparison, and matching
 */
export const loanProductApi = {
  /**
   * Get all available Vietnamese loan products
   */
  getVietnameseLoanProducts: async (params?: {
    loanType?: string;
    bankCode?: string;
    minAmount?: number;
    maxAmount?: number;
    minTerm?: number;
    maxTerm?: number;
    maxInterestRate?: number;
    collateralRequired?: boolean;
    featured?: boolean;
    active?: boolean;
    limit?: number;
    offset?: number;
    sortBy?: "popularity" | "interest_rate" | "processing_time" | "max_amount";
    sortOrder?: "asc" | "desc";
  }) => {
    const response = await dopClient.GET("/loans/vietnamese-products", {
      params: {
        query: params,
      },
    });
    return response.data;
  },

  /**
   * Get loan product by ID
   */
  getVietnameseLoanProduct: async (id: string) => {
    const response = await dopClient.GET("/loans/vietnamese-products/{id}", {
      params: {
        path: { id },
      },
    });
    return response.data;
  },

  /**
   * Search loan products by keywords
   */
  searchLoanProducts: async (params: {
    keywords: string;
    filters?: {
      loanTypes?: string[];
      bankCodes?: string[];
      minAmount?: number;
      maxAmount?: number;
      minTerm?: number;
      maxTerm?: number;
      maxInterestRate?: number;
    };
    limit?: number;
    offset?: number;
  }) => {
    const response = await dopClient.POST("/loans/vietnamese-products/search", {
      body: params,
    });
    return response.data;
  },

  /**
   * Get loan products by type
   */
  getLoanProductsByType: async (
    loanType: string,
    params?: {
      bankCodes?: string[];
      minAmount?: number;
      maxAmount?: number;
      featured?: boolean;
      limit?: number;
    },
  ) => {
    const response = await dopClient.GET(
      "/loans/vietnamese-products/type/{loanType}",
      {
        params: {
          path: { loanType },
          query: params,
        },
      },
    );
    return response.data;
  },

  /**
   * Get loan products by bank
   */
  getLoanProductsByBank: async (
    bankCode: string,
    params?: {
      loanTypes?: string[];
      minAmount?: number;
      maxAmount?: number;
      featured?: boolean;
      limit?: number;
    },
  ) => {
    const response = await dopClient.GET(
      "/loans/vietnamese-products/bank/{bankCode}",
      {
        params: {
          path: { bankCode },
          query: params,
        },
      },
    );
    return response.data;
  },

  /**
   * Get featured loan products
   */
  getFeaturedLoanProducts: async (params?: {
    loanType?: string;
    limit?: number;
  }) => {
    const response = await dopClient.GET(
      "/loans/vietnamese-products/featured",
      {
        params: {
          query: params,
        },
      },
    );
    return response.data;
  },

  /**
   * Compare multiple loan products
   */
  compareLoanProducts: async (params: {
    productIds: string[];
    loanAmount: number;
    loanTerm: number;
    includeFees?: boolean;
    includePromotions?: boolean;
  }) => {
    const response = await dopClient.POST(
      "/loans/vietnamese-products/compare",
      {
        body: params,
      },
    );
    return response.data;
  },

  /**
   * Get personalized loan product recommendations
   */
  getLoanRecommendations: async (params: {
    userProfile: {
      age: number;
      monthlyIncome: number;
      employmentType: string;
      employmentDurationMonths: number;
      creditScore?: number;
      existingDebt?: number;
      hasCollateral: boolean;
      collateralType?: string;
      collateralValue?: number;
      requestedAmount: number;
      requestedTerm: number;
      loanPurpose: string;
    };
    preferences?: {
      preferredBanks?: string[];
      maxInterestRate?: number;
      maxProcessingTime?: number;
      requiresOnlineApplication?: boolean;
      requiresFastApproval?: boolean;
    };
    limit?: number;
  }) => {
    const response = await dopClient.POST(
      "/loans/vietnamese-products/recommendations",
      {
        body: params,
      },
    );
    return response.data;
  },

  /**
   * Check loan eligibility for multiple products
   */
  checkEligibility: async (params: {
    productIds: string[];
    applicantProfile: {
      personalInfo: {
        fullName: string;
        dateOfBirth: string;
        gender: string;
        nationalId: string;
        phoneNumber: string;
        email: string;
        vietnameseCitizen: boolean;
      };
      residenceInfo: {
        currentAddress: {
          province: string;
          district: string;
          ward: string;
          street: string;
        };
        residenceStatus: string;
        durationMonths: number;
      };
      employmentInfo: {
        employmentType: string;
        employmentStatus: string;
        companyName?: string;
        jobTitle?: string;
        workDurationMonths: number;
        monthlyIncome: number;
        incomeSource: string;
        canProvideIncomeProof: boolean;
      };
      financialInfo: {
        existingMonthlyDebtPayments: number;
        hasBankAccount: boolean;
        creditScore?: number;
        previousLoanHistory?: {
          hasPreviousLoans: boolean;
          onTimePaymentsPercentage?: number;
        };
      };
      loanRequirements: {
        requestedAmount: number;
        requestedTerm: number;
        collateralAvailable: boolean;
        collateralType?: string;
        collateralValue?: number;
      };
    };
  }) => {
    const response = await dopClient.POST(
      "/loans/vietnamese-products/eligibility",
      {
        body: params,
      },
    );
    return response.data;
  },

  /**
   * Calculate loan payments for comparison
   */
  calculateLoanPayments: async (params: {
    productCalculations: Array<{
      productId: string;
      principal: number;
      term: number;
      includePromotionalRate?: boolean;
    }>;
  }) => {
    const response = await dopClient.POST(
      "/loans/vietnamese-products/calculate",
      {
        body: params,
      },
    );
    return response.data;
  },

  /**
   * Get real-time interest rates
   */
  getRealTimeInterestRates: async (params?: {
    bankCodes?: string[];
    loanTypes?: string[];
  }) => {
    const response = await dopClient.GET(
      "/loans/vietnamese-products/interest-rates",
      {
        params: {
          query: params,
        },
      },
    );
    return response.data;
  },

  /**
   * Get promotional offers
   */
  getPromotionalOffers: async (params?: {
    bankCodes?: string[];
    loanTypes?: string[];
    validOnly?: boolean;
    limit?: number;
  }) => {
    const response = await dopClient.GET(
      "/loans/vietnamese-products/promotions",
      {
        params: {
          query: params,
        },
      },
    );
    return response.data;
  },

  /**
   * Get bank information
   */
  getBanksInfo: async (params?: {
    includeInactive?: boolean;
    type?: "state" | "commercial" | "foreign" | "investment";
  }) => {
    const response = await dopClient.GET("/loans/vietnamese-products/banks", {
      params: {
        query: params,
      },
    });
    return response.data;
  },

  /**
   * Get loan product statistics
   */
  getProductStatistics: async (params?: {
    bankCode?: string;
    loanType?: string;
    period?: "week" | "month" | "quarter" | "year";
  }) => {
    const response = await dopClient.GET(
      "/loans/vietnamese-products/statistics",
      {
        params: {
          query: params,
        },
      },
    );
    return response.data;
  },

  /**
   * Save loan product comparison
   */
  saveComparison: async (params: {
    name: string;
    productIds: string[];
    loanAmount: number;
    loanTerm: number;
    notes?: string;
    isPublic?: boolean;
  }) => {
    const response = await dopClient.POST(
      "/loans/vietnamese-products/comparisons/save",
      {
        body: params,
      },
    );
    return response.data;
  },

  /**
   * Get saved comparisons
   */
  getSavedComparisons: async (params?: {
    limit?: number;
    offset?: number;
    includePublic?: boolean;
  }) => {
    const response = await dopClient.GET(
      "/loans/vietnamese-products/comparisons",
      {
        params: {
          query: params,
        },
      },
    );
    return response.data;
  },

  /**
   * Get saved comparison by ID
   */
  getSavedComparison: async (id: string) => {
    const response = await dopClient.GET(
      "/loans/vietnamese-products/comparisons/{id}",
      {
        params: {
          path: { id },
        },
      },
    );
    return response.data;
  },

  /**
   * Delete saved comparison
   */
  deleteSavedComparison: async (id: string) => {
    const response = await dopClient.DELETE(
      "/loans/vietnamese-products/comparisons/{id}",
      {
        params: {
          path: { id },
        },
      },
    );
    return response.data;
  },

  /**
   * Share comparison
   */
  shareComparison: async (
    id: string,
    params?: {
      expiresIn?: number; // hours
      allowEdit?: boolean;
    },
  ) => {
    const response = await dopClient.POST(
      "/loans/vietnamese-products/comparisons/{id}/share",
      {
        params: {
          path: { id },
          query: params,
        },
      },
    );
    return response.data;
  },

  /**
   * Get loan product analytics
   */
  getProductAnalytics: async (params: {
    productIds: string[];
    metrics: Array<"views" | "applications" | "approvals" | "clicks">;
    period?: "week" | "month" | "quarter" | "year";
    breakdown?: "bank" | "loan_type" | "region";
  }) => {
    const response = await dopClient.POST(
      "/loans/vietnamese-products/analytics",
      {
        body: params,
      },
    );
    return response.data;
  },
};

export default loanApi;
