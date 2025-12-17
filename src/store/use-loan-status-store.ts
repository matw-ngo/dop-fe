/**
 * Secure Loan Status Tracking Store
 * Zustand store with enhanced security for loan application status tracking
 * Implements Vietnamese compliance (Decree 13/2023) for sensitive data protection
 */

import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { useTokenStore } from "@/lib/auth/secure-tokens";
import type {
  DocumentTypeConfig,
  DocumentVerificationStatus,
  LoanApplicationStatus,
  StatusConfig,
} from "@/lib/loan-status/vietnamese-status-config";
import {
  calculateEstimatedCompletionTime,
  getNextAllowedStatuses,
  getStatusConfig,
} from "@/lib/loan-status/vietnamese-status-config";
import {
  AuditEventType,
  AuditSeverity,
  auditLogger,
} from "@/lib/security/audit-logging";
import {
  conflictResolutionManager,
  type DataVersion,
} from "@/lib/security/conflict-resolution";
import { loanStatusRateLimiter } from "@/lib/security/status-rate-limiting";

/**
 * Timeline milestone interface
 */
export interface TimelineMilestone {
  id: string;
  status: LoanApplicationStatus;
  title: string;
  description: string;
  timestamp: string;
  completed: boolean;
  current: boolean;
  estimatedDate?: string;
  officer?: {
    name: string;
    position: string;
  };
  notes?: string;
  attachments?: Array<{
    id: string;
    name: string;
    url: string;
  }>;
}

/**
 * Document status interface (SECURE - no sensitive personal data)
 */
export interface DocumentStatus {
  id: string;
  type: string;
  // Removed: name (may contain personal info)
  status: DocumentVerificationStatus;
  uploadDate?: string;
  verificationDate?: string;
  rejectionReason?: string; // Sanitized, no personal info
  expiryDate?: string;
  // Removed: fileUrl, fileName, fileSize (sensitive file metadata)
  // Replaced with secure reference
  fileReference?: string; // Secure server-side reference only
  uploadedByInitials?: string; // Only initials
  verifiedByInitials?: string; // Only initials
  comments?: string; // Sanitized comments
  securityMetadata: {
    lastScanned: string;
    scanResult: "clean" | "suspicious" | "malicious";
    dataClassification: "public" | "restricted" | "confidential";
    retentionExpires?: string;
  };
}

/**
 * Communication entry interface (SECURE - no sensitive personal data)
 */
export interface CommunicationEntry {
  id: string;
  type: "sms" | "email" | "in_app" | "zalo" | "phone_call";
  title: string;
  content: string; // Sanitized content, no personal identifiers
  sentAt: string;
  readAt?: string;
  sender: {
    id: string;
    initials: string; // Only initials, not full name
    role: string;
    department?: string;
    // Removed: avatar (may contain biometric data)
  };
  // Removed: recipient personal information
  recipientMasked?: {
    id: string;
    channel: string; // Only communication channel
    // Removed: name, phone, email (personal data)
  };
  hasAttachments: boolean;
  // Removed: detailed attachment metadata
  attachments?: Array<{
    id: string;
    type: string; // Only file type, not name or size
    secureReference: string; // Secure server-side reference
  }>;
  priority: "low" | "normal" | "high" | "urgent";
  status: "sent" | "delivered" | "read" | "failed";
  metadata?: Record<string, any>;
  securityMetadata: {
    dataClassification: "public" | "restricted" | "confidential";
    retentionExpires?: string;
    lastAudit: string;
    complianceFlags: string[];
  };
}

/**
 * Application status data interface (SECURE - no sensitive personal data)
 */
export interface ApplicationStatusData {
  id: string;
  status: LoanApplicationStatus;
  loanType: string;
  // Removed: requestedAmount (sensitive financial data)
  applicationDate: string;
  lastUpdated: string;
  estimatedCompletionDate?: string;
  progressPercentage: number;
  // Removed: assignedOfficer personal contact info
  assignedOfficer?: {
    initials: string; // Only initials, not full name
    position?: string;
    department?: string;
  };
  nextActions?: string[];
  slaInfo?: {
    currentSla: number; // hours
    maxSla: number; // hours
    isOverdue: boolean;
  };
  // Security fields
  dataVersion?: DataVersion;
  securityLevel: "public" | "restricted" | "confidential";
  lastSecurityCheck: string;
  complianceFlags: string[];
}

/**
 * Notification preferences interface
 */
export interface NotificationPreferences {
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
}

/**
 * Loan Status Tracking Store State
 */
interface LoanStatusTrackingStoreState {
  /** Current application status data */
  applicationStatus: ApplicationStatusData | null;

  /** Timeline milestones */
  milestones: TimelineMilestone[];

  /** Documents status */
  documents: DocumentStatus[];

  /** Communication history */
  communications: CommunicationEntry[];

  /** Notification preferences */
  notificationPreferences: NotificationPreferences | null;

  /** Real-time connection status */
  connectionStatus: "disconnected" | "connecting" | "connected" | "error";

  /** Loading states */
  isLoading: boolean;
  isLoadingTimeline: boolean;
  isLoadingDocuments: boolean;
  isLoadingCommunications: boolean;

  /** Error states */
  error: string | null;
  timelineError: string | null;
  documentsError: string | null;
  communicationsError: string | null;

  /** Auto-refresh settings */
  autoRefresh: boolean;
  refreshInterval: number; // seconds
  lastRefresh: Date | null;

  /** Offline mode */
  isOffline: boolean;
  offlineQueue: Array<{
    type: string;
    data: any;
    timestamp: string;
  }>;

  /** Real-time subscriptions */
  wsConnection: WebSocket | null;
  sseConnection: EventSource | null;
}

/**
 * Loan Status Tracking Store Actions
 */
interface LoanStatusTrackingStoreActions {
  // Application status actions
  /** Set application status data */
  setApplicationStatus: (status: ApplicationStatusData | null) => void;

  /** Update application status */
  updateApplicationStatus: (
    status: LoanApplicationStatus,
    metadata?: Record<string, any>,
  ) => void;

  /** Refresh application status */
  refreshApplicationStatus: (applicationId: string) => Promise<void>;

  // Timeline actions
  /** Set timeline milestones */
  setMilestones: (milestones: TimelineMilestone[]) => void;

  /** Add milestone */
  addMilestone: (milestone: TimelineMilestone) => void;

  /** Update milestone */
  updateMilestone: (
    milestoneId: string,
    updates: Partial<TimelineMilestone>,
  ) => void;

  /** Refresh timeline */
  refreshTimeline: (applicationId: string) => Promise<void>;

  // Document actions
  /** Set documents status */
  setDocuments: (documents: DocumentStatus[]) => void;

  /** Update document status */
  updateDocumentStatus: (
    documentId: string,
    status: DocumentVerificationStatus,
    metadata?: Record<string, any>,
  ) => void;

  /** Add document */
  addDocument: (document: DocumentStatus) => void;

  /** Remove document */
  removeDocument: (documentId: string) => void;

  /** Refresh documents */
  refreshDocuments: (applicationId: string) => Promise<void>;

  // Communication actions
  /** Set communications */
  setCommunications: (communications: CommunicationEntry[]) => void;

  /** Add communication */
  addCommunication: (communication: CommunicationEntry) => void;

  /** Mark communication as read */
  markCommunicationAsRead: (communicationId: string) => void;

  /** Send message */
  sendMessage: (
    applicationId: string,
    message: {
      type: CommunicationEntry["type"];
      title: string;
      content: string;
      priority?: CommunicationEntry["priority"];
    },
  ) => Promise<void>;

  /** Refresh communications */
  refreshCommunications: (applicationId: string) => Promise<void>;

  // Notification preferences actions
  /** Set notification preferences */
  setNotificationPreferences: (
    preferences: NotificationPreferences | null,
  ) => void;

  /** Update notification preferences */
  updateNotificationPreferences: (
    updates: Partial<NotificationPreferences>,
  ) => Promise<void>;

  // Real-time connection actions
  /** Connect to real-time updates */
  connectRealTime: (applicationId: string) => void;

  /** Disconnect from real-time updates */
  disconnectRealTime: () => void;

  /** Set connection status */
  setConnectionStatus: (
    status: LoanStatusTrackingStoreState["connectionStatus"],
  ) => void;

  // Auto-refresh actions
  /** Enable/disable auto-refresh */
  setAutoRefresh: (enabled: boolean, interval?: number) => void;

  /** Manual refresh */
  refreshAll: (applicationId: string) => Promise<void>;

  // Offline mode actions
  /** Set offline mode */
  setOfflineMode: (isOffline: boolean) => void;

  /** Add to offline queue */
  addToOfflineQueue: (type: string, data: any) => void;

  /** Process offline queue */
  processOfflineQueue: () => Promise<void>;

  // Error handling actions
  /** Set error */
  setError: (error: string | null) => void;

  /** Clear all errors */
  clearErrors: () => void;

  // Utility actions
  /** Get status configuration */
  getStatusConfig: () => StatusConfig | null;

  /** Get estimated completion time */
  getEstimatedCompletionTime: () => {
    hours: number;
    businessDays: number;
  } | null;

  /** Get next allowed statuses */
  getNextAllowedStatuses: () => LoanApplicationStatus[];

  /** Get documents requiring action */
  getDocumentsRequiringAction: () => DocumentStatus[];

  /** Get unread communications count */
  getUnreadCommunicationsCount: () => number;

  /** Reset store */
  reset: () => void;
}

/**
 * Combined Loan Status Tracking Store Type
 */
type LoanStatusTrackingStore = LoanStatusTrackingStoreState &
  LoanStatusTrackingStoreActions;

/**
 * Loan Status Tracking Store Implementation
 */
export const useLoanStatusTrackingStore = create<LoanStatusTrackingStore>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state (SECURE - no sensitive data persisted)
        applicationStatus: null,
        milestones: [],
        documents: [],
        communications: [],
        notificationPreferences: null,
        connectionStatus: "disconnected",
        isLoading: false,
        isLoadingTimeline: false,
        isLoadingDocuments: false,
        isLoadingCommunications: false,
        error: null,
        timelineError: null,
        documentsError: null,
        communicationsError: null,
        autoRefresh: true,
        refreshInterval: 30,
        lastRefresh: null,
        isOffline: false,
        offlineQueue: [],
        wsConnection: null,
        sseConnection: null,

        // Security state (never persisted)
        currentUserId: null,
        sessionStartTime: null,
        securityLevel: "public",
        dataVersions: new Map(),
        lastSecurityValidation: null,

        // Application status actions
        setApplicationStatus: (status) => {
          set({ applicationStatus: status }, false, "setApplicationStatus");
        },

        updateApplicationStatus: (status, metadata = {}) => {
          set(
            (state) => ({
              applicationStatus: state.applicationStatus
                ? {
                    ...state.applicationStatus,
                    status,
                    lastUpdated: new Date().toISOString(),
                    ...metadata,
                  }
                : null,
            }),
            false,
            "updateApplicationStatus",
          );
        },

        refreshApplicationStatus: async (applicationId) => {
          set(
            { isLoading: true, error: null },
            false,
            "refreshApplicationStatus",
          );

          try {
            // This would call the actual API
            // const response = await loanApi.getDetailedApplicationStatus(applicationId);
            // set({ applicationStatus: response });

            set({ lastRefresh: new Date() }, false, "refreshApplicationStatus");
          } catch (error) {
            set(
              {
                error:
                  error instanceof Error
                    ? error.message
                    : "Failed to refresh application status",
              },
              false,
              "refreshApplicationStatus",
            );
          } finally {
            set({ isLoading: false }, false, "refreshApplicationStatus");
          }
        },

        // Timeline actions
        setMilestones: (milestones) => {
          set({ milestones }, false, "setMilestones");
        },

        addMilestone: (milestone) => {
          set(
            (state) => ({
              milestones: [...state.milestones, milestone],
            }),
            false,
            "addMilestone",
          );
        },

        updateMilestone: (milestoneId, updates) => {
          set(
            (state) => ({
              milestones: state.milestones.map((milestone) =>
                milestone.id === milestoneId
                  ? { ...milestone, ...updates }
                  : milestone,
              ),
            }),
            false,
            "updateMilestone",
          );
        },

        refreshTimeline: async (applicationId) => {
          set(
            { isLoadingTimeline: true, timelineError: null },
            false,
            "refreshTimeline",
          );

          try {
            // This would call the actual API
            // const response = await loanApi.getApplicationMilestones(applicationId);
            // set({ milestones: response });
          } catch (error) {
            set(
              {
                timelineError:
                  error instanceof Error
                    ? error.message
                    : "Failed to refresh timeline",
              },
              false,
              "refreshTimeline",
            );
          } finally {
            set({ isLoadingTimeline: false }, false, "refreshTimeline");
          }
        },

        // Document actions
        setDocuments: (documents) => {
          set({ documents }, false, "setDocuments");
        },

        updateDocumentStatus: (documentId, status, metadata = {}) => {
          set(
            (state) => ({
              documents: state.documents.map((doc) =>
                doc.id === documentId
                  ? {
                      ...doc,
                      status,
                      verificationDate:
                        status === "da_xac_nhan"
                          ? new Date().toISOString()
                          : doc.verificationDate,
                      ...metadata,
                    }
                  : doc,
              ),
            }),
            false,
            "updateDocumentStatus",
          );
        },

        addDocument: (document) => {
          set(
            (state) => ({
              documents: [...state.documents, document],
            }),
            false,
            "addDocument",
          );
        },

        removeDocument: (documentId) => {
          set(
            (state) => ({
              documents: state.documents.filter((doc) => doc.id !== documentId),
            }),
            false,
            "removeDocument",
          );
        },

        refreshDocuments: async (applicationId) => {
          set(
            { isLoadingDocuments: true, documentsError: null },
            false,
            "refreshDocuments",
          );

          try {
            // This would call the actual API
            // const response = await loanApi.getApplicationDocumentsStatus(applicationId);
            // set({ documents: response });
          } catch (error) {
            set(
              {
                documentsError:
                  error instanceof Error
                    ? error.message
                    : "Failed to refresh documents",
              },
              false,
              "refreshDocuments",
            );
          } finally {
            set({ isLoadingDocuments: false }, false, "refreshDocuments");
          }
        },

        // Communication actions
        setCommunications: (communications) => {
          set({ communications }, false, "setCommunications");
        },

        addCommunication: (communication) => {
          set(
            (state) => ({
              communications: [communication, ...state.communications],
            }),
            false,
            "addCommunication",
          );
        },

        markCommunicationAsRead: (communicationId) => {
          set(
            (state) => ({
              communications: state.communications.map((comm) =>
                comm.id === communicationId
                  ? { ...comm, readAt: new Date().toISOString() }
                  : comm,
              ),
            }),
            false,
            "markCommunicationAsRead",
          );
        },

        sendMessage: async (applicationId, message) => {
          try {
            // This would call the actual API
            // await loanApi.sendApplicationMessage(applicationId, message);

            // Add the sent message to local state
            const newCommunication: CommunicationEntry = {
              id: Date.now().toString(),
              type: message.type,
              title: message.title,
              content: message.content,
              sentAt: new Date().toISOString(),
              sender: {
                id: "current-user",
                name: "Bạn",
                role: "customer",
              },
              hasAttachments: false,
              priority: message.priority || "normal",
              status: "sent",
            };

            get().addCommunication(newCommunication);
          } catch (error) {
            // Add to offline queue if offline
            if (get().isOffline) {
              get().addToOfflineQueue("send_message", {
                applicationId,
                message,
              });
            } else {
              throw error;
            }
          }
        },

        refreshCommunications: async (applicationId) => {
          set(
            { isLoadingCommunications: true, communicationsError: null },
            false,
            "refreshCommunications",
          );

          try {
            // This would call the actual API
            // const response = await loanApi.getApplicationCommunications(applicationId);
            // set({ communications: response });
          } catch (error) {
            set(
              {
                communicationsError:
                  error instanceof Error
                    ? error.message
                    : "Failed to refresh communications",
              },
              false,
              "refreshCommunications",
            );
          } finally {
            set(
              { isLoadingCommunications: false },
              false,
              "refreshCommunications",
            );
          }
        },

        // Notification preferences actions
        setNotificationPreferences: (preferences) => {
          set(
            { notificationPreferences: preferences },
            false,
            "setNotificationPreferences",
          );
        },

        updateNotificationPreferences: async (updates) => {
          try {
            const current = get().notificationPreferences;
            const updated = {
              ...current,
              ...updates,
            } as NotificationPreferences;

            // This would call the actual API
            // await loanApi.updateNotificationPreferences(updated);

            set(
              { notificationPreferences: updated },
              false,
              "updateNotificationPreferences",
            );
          } catch (error) {
            console.error("Failed to update notification preferences:", error);
            throw error;
          }
        },

        // Real-time connection actions
        connectRealTime: (applicationId) => {
          const state = get();

          // Close existing connections
          state.disconnectRealTime();

          set({ connectionStatus: "connecting" }, false, "connectRealTime");

          try {
            // Try WebSocket first
            if (typeof window !== "undefined" && "WebSocket" in window) {
              const wsUrl = `${process.env.NEXT_PUBLIC_WS_URL}/loans/applications/${applicationId}/status`;
              const ws = new WebSocket(wsUrl);

              ws.onopen = () => {
                set(
                  { connectionStatus: "connected", wsConnection: ws },
                  false,
                  "connectRealTime",
                );
              };

              ws.onmessage = (event) => {
                try {
                  const data = JSON.parse(event.data);

                  // Handle different types of real-time updates
                  switch (data.type) {
                    case "status_update":
                      state.updateApplicationStatus(data.status, data.metadata);
                      break;
                    case "milestone_added":
                      state.addMilestone(data.milestone);
                      break;
                    case "document_update":
                      state.updateDocumentStatus(
                        data.documentId,
                        data.status,
                        data.metadata,
                      );
                      break;
                    case "communication_added":
                      state.addCommunication(data.communication);
                      break;
                  }
                } catch (error) {
                  console.error("Failed to parse WebSocket message:", error);
                }
              };

              ws.onerror = (error) => {
                console.error("WebSocket error:", error);
                set({ connectionStatus: "error" }, false, "connectRealTime");

                // Fallback to SSE
                state.connectSSE(applicationId);
              };

              ws.onclose = () => {
                set(
                  { connectionStatus: "disconnected", wsConnection: null },
                  false,
                  "connectRealTime",
                );
              };

              set({ wsConnection: ws }, false, "connectRealTime");
            } else {
              // Fallback to SSE
              state.connectSSE(applicationId);
            }
          } catch (error) {
            console.error("Failed to connect real-time updates:", error);
            set({ connectionStatus: "error" }, false, "connectRealTime");
          }
        },

        connectSSE: (applicationId) => {
          try {
            const eventSource = new EventSource(
              `/api/v1/loans/applications/${applicationId}/status-stream`,
            );

            eventSource.onopen = () => {
              set(
                { connectionStatus: "connected", sseConnection: eventSource },
                false,
                "connectSSE",
              );
            };

            eventSource.onmessage = (event) => {
              try {
                const data = JSON.parse(event.data);
                const state = get();

                // Handle different types of real-time updates
                switch (data.type) {
                  case "status_update":
                    state.updateApplicationStatus(data.status, data.metadata);
                    break;
                  case "milestone_added":
                    state.addMilestone(data.milestone);
                    break;
                  case "document_update":
                    state.updateDocumentStatus(
                      data.documentId,
                      data.status,
                      data.metadata,
                    );
                    break;
                  case "communication_added":
                    state.addCommunication(data.communication);
                    break;
                }
              } catch (error) {
                console.error("Failed to parse SSE message:", error);
              }
            };

            eventSource.onerror = (error) => {
              console.error("SSE error:", error);
              set({ connectionStatus: "error" }, false, "connectSSE");
            };

            set({ sseConnection: eventSource }, false, "connectSSE");
          } catch (error) {
            console.error("Failed to connect SSE:", error);
            set({ connectionStatus: "error" }, false, "connectSSE");
          }
        },

        disconnectRealTime: () => {
          const { wsConnection, sseConnection } = get();

          if (wsConnection) {
            wsConnection.close();
            set({ wsConnection: null }, false, "disconnectRealTime");
          }

          if (sseConnection) {
            sseConnection.close();
            set({ sseConnection: null }, false, "disconnectRealTime");
          }

          set(
            { connectionStatus: "disconnected" },
            false,
            "disconnectRealTime",
          );
        },

        setConnectionStatus: (status) => {
          set({ connectionStatus: status }, false, "setConnectionStatus");
        },

        // Auto-refresh actions
        setAutoRefresh: (enabled, interval) => {
          set(
            {
              autoRefresh: enabled,
              ...(interval && { refreshInterval: interval }),
            },
            false,
            "setAutoRefresh",
          );
        },

        refreshAll: async (applicationId) => {
          const state = get();
          await Promise.all([
            state.refreshApplicationStatus(applicationId),
            state.refreshTimeline(applicationId),
            state.refreshDocuments(applicationId),
            state.refreshCommunications(applicationId),
          ]);
        },

        // Offline mode actions
        setOfflineMode: (isOffline) => {
          set({ isOffline }, false, "setOfflineMode");
        },

        addToOfflineQueue: (type, data) => {
          set(
            (state) => ({
              offlineQueue: [
                ...state.offlineQueue,
                {
                  type,
                  data,
                  timestamp: new Date().toISOString(),
                },
              ],
            }),
            false,
            "addToOfflineQueue",
          );
        },

        processOfflineQueue: async () => {
          const { offlineQueue, isOffline } = get();

          if (isOffline || offlineQueue.length === 0) {
            return;
          }

          try {
            // Process each item in the queue
            for (const item of offlineQueue) {
              switch (item.type) {
                case "send_message":
                  // await loanApi.sendApplicationMessage(item.data.applicationId, item.data.message);
                  break;
                // Add other offline actions as needed
              }
            }

            // Clear the queue after processing
            set({ offlineQueue: [] }, false, "processOfflineQueue");
          } catch (error) {
            console.error("Failed to process offline queue:", error);
          }
        },

        // Error handling actions
        setError: (error) => {
          set({ error }, false, "setError");
        },

        clearErrors: () => {
          set(
            {
              error: null,
              timelineError: null,
              documentsError: null,
              communicationsError: null,
            },
            false,
            "clearErrors",
          );
        },

        // Utility actions
        getStatusConfig: () => {
          const { applicationStatus } = get();
          return applicationStatus
            ? getStatusConfig(applicationStatus.status)
            : null;
        },

        getEstimatedCompletionTime: () => {
          const { applicationStatus } = get();
          if (!applicationStatus) return null;

          return calculateEstimatedCompletionTime(
            applicationStatus.status,
            applicationStatus.loanType as any,
          );
        },

        getNextAllowedStatuses: () => {
          const { applicationStatus } = get();
          if (!applicationStatus) return [];

          return getNextAllowedStatuses(applicationStatus.status, "customer");
        },

        getDocumentsRequiringAction: () => {
          const { documents } = get();
          return documents.filter((doc) =>
            ["cho_tai_len", "bi_tu_choi", "het_han"].includes(doc.status),
          );
        },

        getUnreadCommunicationsCount: () => {
          const { communications } = get();
          return communications.filter((comm) => !comm.readAt).length;
        },

        // Security actions
        validateStoredData: (data: any) => {
          // Validate and sanitize data before storage
          const allowedFields = [
            "notificationPreferences",
            "autoRefresh",
            "refreshInterval",
          ];
          const sanitized: any = {};

          for (const field of allowedFields) {
            if (Object.hasOwn(data, field)) {
              // Validate field types and values
              switch (field) {
                case "autoRefresh":
                  sanitized[field] =
                    typeof data[field] === "boolean" ? data[field] : false;
                  break;
                case "refreshInterval":
                  sanitized[field] =
                    typeof data[field] === "number" && data[field] > 0
                      ? data[field]
                      : 30;
                  break;
                case "notificationPreferences":
                  if (data[field] && typeof data[field] === "object") {
                    sanitized[field] = {
                      channels: data[field]?.channels || {},
                      frequency: data[field]?.frequency || "real_time",
                      urgentOnly:
                        typeof data[field]?.urgentOnly === "boolean"
                          ? data[field].urgentOnly
                          : false,
                    };
                  }
                  break;
                default:
                  sanitized[field] = data[field];
              }
            }
          }

          return sanitized;
        },

        secureDataCleanup: () => {
          // Clean up sensitive data that should not be in memory
          set(
            {
              applicationStatus: null,
              documents: [],
              communications: [],
              wsConnection: null,
              sseConnection: null,
              error: null,
              timelineError: null,
              documentsError: null,
              communicationsError: null,
            },
            false,
            "secureDataCleanup",
          );

          // Log cleanup for audit
          auditLogger.logSecurityEvent(
            AuditEventType.SYSTEM_ERROR,
            AuditSeverity.LOW,
            {
              action: "secure_data_cleanup",
              timestamp: new Date().toISOString(),
            },
          );
        },

        reset: () => {
          set(
            {
              applicationStatus: null,
              milestones: [],
              documents: [],
              communications: [],
              notificationPreferences: null,
              connectionStatus: "disconnected",
              isLoading: false,
              isLoadingTimeline: false,
              isLoadingDocuments: false,
              isLoadingCommunications: false,
              error: null,
              timelineError: null,
              documentsError: null,
              communicationsError: null,
              lastRefresh: null,
              isOffline: false,
              offlineQueue: [],
              wsConnection: null,
              sseConnection: null,
            },
            false,
            "reset",
          );
        },
      }),
      {
        name: "loan-status-tracking-storage",
        // STRICT SECURITY: Only persist non-sensitive configuration data
        partialize: (state) => ({
          // Only safe configuration data
          notificationPreferences: state.notificationPreferences,
          autoRefresh: state.autoRefresh,
          refreshInterval: state.refreshInterval,

          // NEVER persist: applicationStatus, documents, communications
          // NEVER persist: personal data, financial data, contact info
          // NEVER persist: security state, session data, error details
        }),
        // Secure storage configuration
        storage: {
          getItem: (name) => {
            try {
              const item = sessionStorage.getItem(name);
              if (!item) return null;

              // Validate stored data for security
              const parsed = JSON.parse(item);
              return validateStoredDataForStorage(parsed);
            } catch (error) {
              console.error("Secure storage read error:", error);
              return null;
            }
          },
          setItem: (name, value) => {
            try {
              // Validate data before storage
              const validated = validateStoredDataForStorage(value);
              sessionStorage.setItem(name, JSON.stringify(validated));
            } catch (error) {
              console.error("Secure storage write error:", error);
            }
          },
          removeItem: (name) => {
            try {
              sessionStorage.removeItem(name);
            } catch (error) {
              console.error("Secure storage remove error:", error);
            }
          },
        },
      },
    ),
    {
      name: "LoanStatusTrackingStore",
    },
  ),
);

/**
 * Selectors for common use cases
 */
export const useApplicationStatus = () =>
  useLoanStatusTrackingStore((state) => state.applicationStatus);
export const useMilestones = () =>
  useLoanStatusTrackingStore((state) => state.milestones);
export const useDocuments = () =>
  useLoanStatusTrackingStore((state) => state.documents);
export const useCommunications = () =>
  useLoanStatusTrackingStore((state) => state.communications);
export const useConnectionStatus = () =>
  useLoanStatusTrackingStore((state) => state.connectionStatus);
export const useLoadingStates = () =>
  useLoanStatusTrackingStore((state) => ({
    isLoading: state.isLoading,
    isLoadingTimeline: state.isLoadingTimeline,
    isLoadingDocuments: state.isLoadingDocuments,
    isLoadingCommunications: state.isLoadingCommunications,
  }));
export const useErrors = () =>
  useLoanStatusTrackingStore((state) => ({
    error: state.error,
    timelineError: state.timelineError,
    documentsError: state.documentsError,
    communicationsError: state.communicationsError,
  }));

/**
 * Hook for loan status tracking store hydration
 */
export const useLoanStatusTrackingHydrated = () => {
  const [hydrated, setHydrated] = React.useState(false);

  React.useEffect(() => {
    setHydrated(true);
  }, []);

  return hydrated;
};

// Import React for the hydration hook
import React from "react";

/**
 * Security validation function for stored data
 * Validates and sanitizes data before persistence
 */
function validateStoredDataForStorage(data: any): any {
  // Validate and sanitize data before storage
  const allowedFields = [
    "notificationPreferences",
    "autoRefresh",
    "refreshInterval",
  ];
  const sanitized: any = {};

  for (const field of allowedFields) {
    if (Object.hasOwn(data, field)) {
      // Validate field types and values
      switch (field) {
        case "autoRefresh":
          sanitized[field] =
            typeof data[field] === "boolean" ? data[field] : false;
          break;
        case "refreshInterval":
          sanitized[field] =
            typeof data[field] === "number" && data[field] > 0
              ? data[field]
              : 30;
          break;
        case "notificationPreferences":
          if (data[field] && typeof data[field] === "object") {
            sanitized[field] = {
              channels: data[field]?.channels || {},
              frequency: data[field]?.frequency || "real_time",
              urgentOnly:
                typeof data[field]?.urgentOnly === "boolean"
                  ? data[field].urgentOnly
                  : false,
            };
          }
          break;
        default:
          sanitized[field] = data[field];
      }
    }
  }

  return sanitized;
}
