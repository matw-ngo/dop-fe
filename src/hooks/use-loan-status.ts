/**
 * SECURE Loan Status Tracking Hooks
 * Custom hooks for loan application status tracking with comprehensive security
 * Vietnamese compliance integrated
 */

import { useCallback, useEffect, useRef } from "react";
import { loanApi } from "@/lib/api/endpoints/loans";
import type {
  DocumentVerificationStatus,
  LoanApplicationStatus,
} from "@/lib/loan-status/vietnamese-status-config";
import type {
  NotificationChannel,
  NotificationMessage,
  NotificationPriority,
} from "@/lib/notifications/loan-notifications";
import { loanNotificationManager } from "@/lib/notifications/loan-notifications";
import { useAuditLogging } from "@/lib/security/audit-logging";
import { useConflictResolution } from "@/lib/security/conflict-resolution";
import { useIntegratedSecurity } from "@/lib/security/integrated-security";
import { useLoanStatusRateLimiting } from "@/lib/security/status-rate-limiting";
import { createSecureLoanStatusWebSocket } from "@/lib/security/websocket-security";
import type {
  ApplicationStatusData,
  CommunicationEntry,
  DocumentStatus,
  NotificationPreferences,
  TimelineMilestone,
} from "@/store/use-loan-status-store";
import { useLoanStatusTrackingStore } from "@/store/use-loan-status-store";

/**
 * Hook for SECURE loan application status tracking
 */
export function useLoanStatus(
  applicationId: string,
  options?: {
    autoRefresh?: boolean;
    refreshInterval?: number;
    realTime?: boolean;
    securityEnabled?: boolean;
  },
) {
  const securityEnabled = options?.securityEnabled ?? true;

  // Security hooks
  const {
    initializeSecurityContext,
    secureStatusUpdate,
    createSecureWebSocket,
  } = useIntegratedSecurity();
  const { logApplicationEvent, logSecurityEvent } = useAuditLogging();
  const { checkStatusRefresh, checkAutoRefresh } = useLoanStatusRateLimiting(
    applicationId,
    "user",
  );
  const { getCurrentVersion } = useConflictResolution();

  // Store hooks
  const {
    applicationStatus,
    isLoading,
    error,
    connectionStatus,
    autoRefresh: storeAutoRefresh,
    refreshInterval: storeRefreshInterval,
    lastRefresh,

    // Actions
    setApplicationStatus,
    refreshApplicationStatus,
    connectRealTime,
    disconnectRealTime,
    setAutoRefresh,
    setError,

    // Utilities
    getStatusConfig,
    getEstimatedCompletionTime,
    getNextAllowedStatuses,
  } = useLoanStatusTrackingStore();

  const refreshIntervalRef = useRef<NodeJS.Timeout>(null);
  const securityContextRef = useRef<any>(null);
  const wsConnectionRef = useRef<any>(null);

  // Initialize security context
  useEffect(() => {
    if (securityEnabled && applicationId) {
      initializeSecurityContext().then((context) => {
        securityContextRef.current = context;
        logApplicationEvent(
          "APPLICATION_VIEWED" as any,
          applicationId,
          context.userId || "anonymous",
          "success",
          { securityLevel: context.securityLevel },
        );
      });
    }
  }, [applicationId, securityEnabled]);

  // SECURE Initialize auto-refresh with rate limiting
  useEffect(() => {
    if (applicationId && securityContextRef.current) {
      const initializeSecureRefresh = async () => {
        try {
          // Check rate limiting for initial load
          const rateLimitResult = await checkStatusRefresh();
          if (!rateLimitResult.allowed) {
            setError(`Rate limit exceeded: ${rateLimitResult.reason}`);
            logSecurityEvent("RATE_LIMIT_EXCEEDED" as any, "MEDIUM" as any, {
              reason: rateLimitResult.reason,
              applicationId,
            });
            return;
          }

          // Initial load with security validation
          await refreshApplicationStatus(applicationId);

          // Set up auto-refresh if enabled with security checks
          const autoRefreshEnabled = options?.autoRefresh ?? storeAutoRefresh;
          const interval = options?.refreshInterval ?? storeRefreshInterval;

          if (autoRefreshEnabled && interval > 0) {
            // Validate auto-refresh settings
            const autoRefreshCheck = checkAutoRefresh(interval * 1000);
            if (!autoRefreshCheck.allowed) {
              console.warn(
                "Auto-refresh settings adjusted for security:",
                autoRefreshCheck.reason,
              );
              const recommendedInterval =
                autoRefreshCheck.recommendedInterval || 30000;
              refreshIntervalRef.current = setInterval(() => {
                secureAutoRefresh();
              }, recommendedInterval);
            } else {
              refreshIntervalRef.current = setInterval(() => {
                secureAutoRefresh();
              }, interval * 1000);
            }
          }

          // Set up SECURE real-time connection if enabled
          if (options?.realTime ?? true) {
            wsConnectionRef.current = createSecureWebSocket(
              applicationId,
              securityContextRef.current,
            );

            // Set up message handlers
            if (wsConnectionRef.current) {
              wsConnectionRef.current.onMessage(
                "status_update",
                (message: any) => {
                  handleSecureStatusUpdate(message);
                },
              );
            }
          }
        } catch (error) {
          logSecurityEvent("SYSTEM_ERROR" as any, "HIGH" as any, {
            error: error instanceof Error ? error.message : "Unknown error",
            applicationId,
          });
          setError("Security initialization failed");
        }
      };

      initializeSecureRefresh();
    }

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
      if (wsConnectionRef.current) {
        wsConnectionRef.current.disconnect();
      }
      disconnectRealTime();
      if (securityEnabled) {
        // secureDataCleanup();
      }
    };
  }, [
    applicationId,
    options?.autoRefresh,
    options?.refreshInterval,
    options?.realTime,
    securityEnabled,
  ]);

  // Secure auto-refresh function
  const secureAutoRefresh = useCallback(async () => {
    if (!securityContextRef.current || !securityEnabled) {
      refreshApplicationStatus(applicationId);
      return;
    }

    try {
      // Check rate limiting
      const rateLimitResult = await checkStatusRefresh();
      if (!rateLimitResult.allowed) {
        logSecurityEvent("RATE_LIMIT_EXCEEDED" as any, "MEDIUM" as any, {
          reason: rateLimitResult.reason,
          applicationId,
        });
        return;
      }

      // Get current version for conflict resolution
      const currentVersion = await getCurrentVersion(applicationId);

      // Perform secure status update
      const updateResult = await secureStatusUpdate(
        securityContextRef.current,
        applicationId,
        { lastRefresh: new Date().toISOString() },
        currentVersion,
      );

      if (updateResult.success) {
        refreshApplicationStatus(applicationId);
        logApplicationEvent(
          "STATUS_REFRESH" as any,
          applicationId,
          securityContextRef.current.userId || "system",
          "success",
          { securityScore: updateResult.metadata?.riskScore },
        );
      } else {
        logSecurityEvent("SECURITY_VIOLATION" as any, "HIGH" as any, {
          violations: updateResult.securityViolations,
          applicationId,
        });
      }
    } catch (error) {
      logSecurityEvent("SYSTEM_ERROR" as any, "HIGH" as any, {
        error: error instanceof Error ? error.message : "Unknown error",
        applicationId,
      });
    }
  }, [
    applicationId,
    securityEnabled,
    checkStatusRefresh,
    getCurrentVersion,
    secureStatusUpdate,
  ]);

  // Handle secure status updates from WebSocket
  const handleSecureStatusUpdate = useCallback(
    (message: any) => {
      if (!securityContextRef.current || !securityEnabled) {
        // Fallback to non-secure handling
        setApplicationStatus(message.payload);
        return;
      }

      // Validate message integrity and security
      try {
        // Log real-time update
        logApplicationEvent(
          "WEBSOCKET_MESSAGE_RECEIVED" as any,
          applicationId,
          securityContextRef.current.userId || "system",
          "success",
          { messageType: "status_update" },
        );

        // Apply update with security validation
        setApplicationStatus(message.payload);
      } catch (error) {
        logSecurityEvent("SECURITY_VIOLATION" as any, "MEDIUM" as any, {
          error:
            error instanceof Error
              ? error.message
              : "Invalid WebSocket message",
          applicationId,
        });
      }
    },
    [applicationId, securityEnabled],
  );

  // Manual refresh function
  const refresh = useCallback(() => {
    if (applicationId) {
      return refreshApplicationStatus(applicationId);
    }
  }, [applicationId, refreshApplicationStatus]);

  // Toggle auto-refresh
  const toggleAutoRefresh = useCallback(
    (enabled?: boolean) => {
      const newAutoRefresh = enabled ?? !storeAutoRefresh;
      setAutoRefresh(newAutoRefresh);

      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }

      if (newAutoRefresh && applicationId) {
        const interval = options?.refreshInterval ?? storeRefreshInterval;
        if (interval > 0) {
          refreshIntervalRef.current = setInterval(() => {
            refreshApplicationStatus(applicationId);
          }, interval * 1000);
        }
      }
    },
    [
      applicationId,
      storeAutoRefresh,
      storeRefreshInterval,
      options?.refreshInterval,
      setAutoRefresh,
      refreshApplicationStatus,
    ],
  );

  return {
    // State
    applicationStatus,
    isLoading,
    error,
    connectionStatus,
    lastRefresh,
    autoRefresh: storeAutoRefresh,
    refreshInterval: storeRefreshInterval,

    // Actions
    refresh,
    toggleAutoRefresh,
    retry: () => {
      setError(null);
      refreshApplicationStatus(applicationId);
    },

    // Computed values
    statusConfig: getStatusConfig(),
    estimatedCompletion: getEstimatedCompletionTime(),
    nextAllowedStatuses: getNextAllowedStatuses(),
    isConnected: connectionStatus === "connected",
  };
}

/**
 * Hook for loan application timeline management
 */
export function useLoanTimeline(
  applicationId: string,
  options?: {
    autoLoad?: boolean;
    realTime?: boolean;
  },
) {
  const {
    milestones,
    isLoadingTimeline,
    timelineError,

    // Actions
    setMilestones,
    refreshTimeline,
    addMilestone,
    updateMilestone,
  } = useLoanStatusTrackingStore();

  // Initialize timeline
  useEffect(() => {
    if (applicationId && options?.autoLoad !== false) {
      refreshTimeline(applicationId);
    }
  }, [applicationId, options?.autoLoad, refreshTimeline]);

  // Get timeline statistics
  const getTimelineStats = useCallback(() => {
    const total = milestones.length;
    const completed = milestones.filter((m) => m.completed).length;
    const current = milestones.find((m) => m.current);

    return {
      total,
      completed,
      percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
      currentMilestone: current,
      nextMilestone: current
        ? milestones.find(
            (m) => !m.completed && m.timestamp > current.timestamp,
          )
        : null,
    };
  }, [milestones]);

  // Get milestones by category
  const getMilestonesByCategory = useCallback(() => {
    const categories = milestones.reduce(
      (acc, milestone) => {
        const category = milestone.status.split("_")[0]; // Simple categorization
        if (!acc[category]) {
          acc[category] = [];
        }
        acc[category].push(milestone);
        return acc;
      },
      {} as Record<string, TimelineMilestone[]>,
    );

    return categories;
  }, [milestones]);

  return {
    // State
    milestones,
    isLoading: isLoadingTimeline,
    error: timelineError,

    // Actions
    refresh: () => refreshTimeline(applicationId),
    addMilestone: (milestone: TimelineMilestone) => addMilestone(milestone),
    updateMilestone: (
      milestoneId: string,
      updates: Partial<TimelineMilestone>,
    ) => updateMilestone(milestoneId, updates),

    // Computed values
    stats: getTimelineStats(),
    categories: getMilestonesByCategory(),
  };
}

/**
 * Hook for document status tracking
 */
export function useLoanDocuments(
  applicationId: string,
  options?: {
    autoLoad?: boolean;
  },
) {
  const {
    documents,
    isLoadingDocuments,
    documentsError,

    // Actions
    setDocuments,
    refreshDocuments,
    updateDocumentStatus,
    addDocument,
    removeDocument,
  } = useLoanStatusTrackingStore();

  // Initialize documents
  useEffect(() => {
    if (applicationId && options?.autoLoad !== false) {
      refreshDocuments(applicationId);
    }
  }, [applicationId, options?.autoLoad, refreshDocuments]);

  // Get document statistics
  const getDocumentStats = useCallback(() => {
    const total = documents.length;
    const verified = documents.filter((d) => d.status === "da_xac_nhan").length;
    const pending = documents.filter((d) =>
      ["cho_tai_len", "dang_tai_len", "da_tai_len", "dang_kiem_tra"].includes(
        d.status,
      ),
    ).length;
    const rejected = documents.filter((d) => d.status === "bi_tu_choi").length;
    const expired = documents.filter((d) => d.status === "het_han").length;

    return {
      total,
      verified,
      pending,
      rejected,
      expired,
      percentage: total > 0 ? Math.round((verified / total) * 100) : 0,
    };
  }, [documents]);

  // Get documents requiring action
  const getDocumentsRequiringAction = useCallback(() => {
    return documents.filter((doc) =>
      ["cho_tai_len", "bi_tu_choi", "het_han"].includes(doc.status),
    );
  }, [documents]);

  // Get documents by status
  const getDocumentsByStatus = useCallback(
    (status: DocumentVerificationStatus) => {
      return documents.filter((doc) => doc.status === status);
    },
    [documents],
  );

  // Get documents by type
  const getDocumentsByType = useCallback(() => {
    return documents.reduce(
      (acc, doc) => {
        if (!acc[doc.type]) {
          acc[doc.type] = [];
        }
        acc[doc.type].push(doc);
        return acc;
      },
      {} as Record<string, DocumentStatus[]>,
    );
  }, [documents]);

  // Check if all required documents are uploaded
  const areRequiredDocumentsUploaded = useCallback(() => {
    const requiredDocuments = documents.filter((doc) => {
      // This would need to be implemented based on document type requirements
      // For now, assume all documents are required
      return true;
    });

    return requiredDocuments.every((doc) => doc.status !== "cho_tai_len");
  }, [documents]);

  return {
    // State
    documents,
    isLoading: isLoadingDocuments,
    error: documentsError,

    // Actions
    refresh: () => refreshDocuments(applicationId),
    updateStatus: (
      documentId: string,
      status: DocumentVerificationStatus,
      metadata?: Record<string, any>,
    ) => updateDocumentStatus(documentId, status, metadata),
    add: (document: DocumentStatus) => addDocument(document),
    remove: (documentId: string) => removeDocument(documentId),

    // Computed values
    stats: getDocumentStats(),
    requiringAction: getDocumentsRequiringAction(),
    byStatus: getDocumentsByStatus,
    byType: getDocumentsByType(),
    areRequiredUploaded: areRequiredDocumentsUploaded(),
  };
}

/**
 * Hook for communication management
 */
export function useLoanCommunications(
  applicationId: string,
  options?: {
    autoLoad?: boolean;
  },
) {
  const {
    communications,
    isLoadingCommunications,
    communicationsError,

    // Actions
    setCommunications,
    refreshCommunications,
    addCommunication,
    markCommunicationAsRead,
    sendMessage,
  } = useLoanStatusTrackingStore();

  // Initialize communications
  useEffect(() => {
    if (applicationId && options?.autoLoad !== false) {
      refreshCommunications(applicationId);
    }
  }, [applicationId, options?.autoLoad, refreshCommunications]);

  // Get unread count
  const getUnreadCount = useCallback(() => {
    return communications.filter((comm) => !comm.readAt).length;
  }, [communications]);

  // Get communications by type
  const getCommunicationsByType = useCallback(
    (type: CommunicationEntry["type"]) => {
      return communications.filter((comm) => comm.type === type);
    },
    [communications],
  );

  // Get communications by priority
  const getCommunicationsByPriority = useCallback(
    (priority: CommunicationEntry["priority"]) => {
      return communications.filter((comm) => comm.priority === priority);
    },
    [communications],
  );

  // Send message helper
  const sendMessageWithType = useCallback(
    (
      type: CommunicationEntry["type"],
      title: string,
      content: string,
      priority?: NotificationPriority,
    ) => {
      return sendMessage(applicationId, {
        type,
        title,
        content,
        priority: priority || "normal",
      });
    },
    [applicationId, sendMessage],
  );

  // Mark multiple as read
  const markMultipleAsRead = useCallback(
    (communicationIds: string[]) => {
      communicationIds.forEach((id) => markCommunicationAsRead(id));
    },
    [markCommunicationAsRead],
  );

  // Mark all as read
  const markAllAsRead = useCallback(() => {
    const unreadIds = communications
      .filter((comm) => !comm.readAt)
      .map((comm) => comm.id);
    markMultipleAsRead(unreadIds);
  }, [communications, markMultipleAsRead]);

  return {
    // State
    communications,
    isLoading: isLoadingCommunications,
    error: communicationsError,

    // Actions
    refresh: () => refreshCommunications(applicationId),
    send: sendMessageWithType,
    markAsRead: markCommunicationAsRead,
    markMultipleAsRead,
    markAllAsRead,

    // Computed values
    unreadCount: getUnreadCount(),
    byType: getCommunicationsByType,
    byPriority: getCommunicationsByPriority,
  };
}

/**
 * Hook for notification management
 */
export function useLoanNotifications(applicationId?: string) {
  const {
    notificationPreferences,

    // Actions
    setNotificationPreferences,
    updateNotificationPreferences,
  } = useLoanStatusTrackingStore();

  // Send notification helper
  const sendNotification = useCallback(
    async (
      templateId: string,
      channel: NotificationChannel,
      recipient: {
        name: string;
        phone?: string;
        email?: string;
        zaloId?: string;
      },
      variables: Record<string, any>,
      options?: {
        priority?: NotificationPriority;
        scheduledAt?: string;
      },
    ) => {
      if (!applicationId) {
        throw new Error("Application ID is required for sending notifications");
      }

      const message = loanNotificationManager.scheduleNotification(
        applicationId,
        templateId,
        channel,
        recipient,
        variables,
        options,
      );

      // Validate message
      const validation = loanNotificationManager.validateMessage(message);
      if (!validation.isValid) {
        throw new Error(
          `Invalid notification: ${validation.errors.join(", ")}`,
        );
      }

      // Check preferences if available
      if (notificationPreferences) {
        const shouldSend = loanNotificationManager.shouldSendNotification(
          message,
          notificationPreferences,
        );
        if (!shouldSend) {
          return {
            message: "Notification skipped based on preferences",
            skipped: true,
          };
        }
      }

      // Send the notification (this would integrate with the actual notification service)
      try {
        // const result = await loanApi.sendNotification(message);
        return { message: "Notification sent successfully", result: message };
      } catch (error) {
        throw new Error(
          `Failed to send notification: ${error instanceof Error ? error.message : "Unknown error"}`,
        );
      }
    },
    [applicationId, notificationPreferences],
  );

  // Update notification preferences
  const updatePreferences = useCallback(
    async (updates: Partial<NotificationPreferences>) => {
      if (applicationId) {
        updates.applicationId = applicationId;
      }
      return updateNotificationPreferences(updates);
    },
    [applicationId, updateNotificationPreferences],
  );

  return {
    // State
    preferences: notificationPreferences,

    // Actions
    send: sendNotification,
    updatePreferences,
    setPreferences: setNotificationPreferences,

    // Utilities
    manager: loanNotificationManager,
  };
}

/**
 * Hook for real-time connection management
 */
export function useRealTimeConnection(
  applicationId: string,
  options?: {
    autoConnect?: boolean;
    reconnectInterval?: number;
    maxReconnectAttempts?: number;
  },
) {
  const {
    connectionStatus,
    wsConnection,
    sseConnection,

    // Actions
    connectRealTime,
    disconnectRealTime,
    setConnectionStatus,
  } = useLoanStatusTrackingStore();

  const reconnectAttemptsRef = useRef(0);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>(null);

  // Connect with reconnection logic
  const connectWithRetry = useCallback(() => {
    const maxAttempts = options?.maxReconnectAttempts || 5;
    const interval = options?.reconnectInterval || 5000;

    const attemptConnection = () => {
      if (reconnectAttemptsRef.current >= maxAttempts) {
        setConnectionStatus("error");
        return;
      }

      reconnectAttemptsRef.current++;
      connectRealTime(applicationId);
    };

    attemptConnection();

    // Set up retry logic
    reconnectTimeoutRef.current = setInterval(() => {
      if (connectionStatus === "disconnected" || connectionStatus === "error") {
        attemptConnection();
      }
    }, interval);
  }, [
    applicationId,
    connectionStatus,
    connectRealTime,
    setConnectionStatus,
    options?.maxReconnectAttempts,
    options?.reconnectInterval,
  ]);

  // Initialize connection
  useEffect(() => {
    if (applicationId && options?.autoConnect !== false) {
      connectWithRetry();
    }

    return () => {
      if (reconnectTimeoutRef.current) {
        clearInterval(reconnectTimeoutRef.current);
      }
      disconnectRealTime();
    };
  }, [
    applicationId,
    options?.autoConnect,
    connectWithRetry,
    disconnectRealTime,
  ]);

  // Manual reconnect
  const reconnect = useCallback(() => {
    reconnectAttemptsRef.current = 0;
    if (reconnectTimeoutRef.current) {
      clearInterval(reconnectTimeoutRef.current);
    }
    connectWithRetry();
  }, [connectWithRetry]);

  return {
    // State
    status: connectionStatus,
    isConnected: connectionStatus === "connected",
    isConnecting: connectionStatus === "connecting",
    hasError: connectionStatus === "error",
    reconnectAttempts: reconnectAttemptsRef.current,

    // Actions
    connect: connectWithRetry,
    disconnect: disconnectRealTime,
    reconnect,
  };
}

/**
 * Hook for offline mode management
 */
export function useOfflineMode() {
  const {
    isOffline,
    offlineQueue,

    // Actions
    setOfflineMode,
    addToOfflineQueue,
    processOfflineQueue,
  } = useLoanStatusTrackingStore();

  // Go offline
  const goOffline = useCallback(() => {
    setOfflineMode(true);
  }, [setOfflineMode]);

  // Go online
  const goOnline = useCallback(async () => {
    setOfflineMode(false);
    await processOfflineQueue();
  }, [setOfflineMode, processOfflineQueue]);

  // Add action to queue
  const queueAction = useCallback(
    (type: string, data: any) => {
      addToOfflineQueue(type, data);
    },
    [addToOfflineQueue],
  );

  // Get queue size
  const getQueueSize = useCallback(() => {
    return offlineQueue.length;
  }, [offlineQueue]);

  return {
    // State
    isOffline,
    queueSize: getQueueSize(),
    queue: offlineQueue,

    // Actions
    goOffline,
    goOnline,
    queue: queueAction,
    processQueue: processOfflineQueue,
  };
}

/**
 * Hook for comprehensive loan status tracking
 * Combines all status tracking functionality into a single hook
 */
export function useLoanStatusTracking(
  applicationId: string,
  options?: {
    autoRefresh?: boolean;
    refreshInterval?: number;
    realTime?: boolean;
    autoLoadTimeline?: boolean;
    autoLoadDocuments?: boolean;
    autoLoadCommunications?: boolean;
  },
) {
  const status = useLoanStatus(applicationId, options);
  const timeline = useLoanTimeline(applicationId, {
    autoLoad: options?.autoLoadTimeline,
    realTime: options?.realTime,
  });
  const documents = useLoanDocuments(applicationId, {
    autoLoad: options?.autoLoadDocuments,
  });
  const communications = useLoanCommunications(applicationId, {
    autoLoad: options?.autoLoadCommunications,
  });
  const notifications = useLoanNotifications(applicationId);
  const realTime = useRealTimeConnection(applicationId, options);
  const offline = useOfflineMode();

  // Refresh all data
  const refreshAll = useCallback(async () => {
    await Promise.all([
      status.refresh(),
      timeline.refresh(),
      documents.refresh(),
      communications.refresh(),
    ]);
  }, [status, timeline, documents, communications]);

  // Get overall status
  const getOverallStatus = useCallback(() => {
    const hasErrors = !!(
      status.error ||
      timeline.error ||
      documents.error ||
      communications.error
    );
    const isLoading =
      status.isLoading ||
      timeline.isLoading ||
      documents.isLoading ||
      communications.isLoading;
    const isActionRequired =
      documents.requiringAction.length > 0 || communications.unreadCount > 0;

    return {
      hasErrors,
      isLoading,
      isActionRequired,
      overallConnectionStatus: status.connectionStatus,
      lastRefresh: status.lastRefresh,
    };
  }, [status, timeline, documents, communications]);

  return {
    // Individual hooks
    status,
    timeline,
    documents,
    communications,
    notifications,
    realTime,
    offline,

    // Combined actions
    refreshAll,
    getOverallStatus,

    // Combined computed values
    hasError:
      !!status.error ||
      !!timeline.error ||
      !!documents.error ||
      !!communications.error,
    isLoading:
      status.isLoading ||
      timeline.isLoading ||
      documents.isLoading ||
      communications.isLoading,
    needsAction:
      documents.requiringAction.length > 0 || communications.unreadCount > 0,
  };
}

/**
 * Hook for status transition management
 */
export function useStatusTransitions(currentStatus?: LoanApplicationStatus) {
  const { applicationStatus, updateApplicationStatus } =
    useLoanStatusTrackingStore();

  const status = currentStatus || applicationStatus?.status;

  // Check if transition is allowed
  const canTransitionTo = useCallback(
    (targetStatus: LoanApplicationStatus): boolean => {
      if (!status) return false;

      // This would integrate with the status transition rules
      // For now, allow any transition as a placeholder
      return true;
    },
    [status],
  );

  // Execute status transition
  const transitionTo = useCallback(
    async (
      targetStatus: LoanApplicationStatus,
      metadata?: Record<string, any>,
    ) => {
      if (!status || !canTransitionTo(targetStatus)) {
        throw new Error("Invalid status transition");
      }

      try {
        // Update local state optimistically
        updateApplicationStatus(targetStatus, metadata);

        // Call API to update status on server
        // await loanApi.updateApplicationStatus(applicationId, targetStatus, metadata);

        return { success: true, newStatus: targetStatus };
      } catch (error) {
        // Revert local state if API call fails
        updateApplicationStatus(status);
        throw error;
      }
    },
    [status, canTransitionTo, updateApplicationStatus],
  );

  return {
    currentStatus: status,
    canTransitionTo,
    transitionTo,
    isTransitioning: false, // This would be managed by the hook state
  };
}
