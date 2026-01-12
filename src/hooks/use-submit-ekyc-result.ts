import { useMutation } from "@tanstack/react-query";
import apiClient from "@/lib/api/client";
import type { components } from "@/lib/api/v1.d.ts";
import {
  logSubmitStart,
  logSubmitSuccess,
  logSubmitError,
  logSubmitRetry,
  logValidationError,
} from "@/lib/ekyc/audit-logger";

type VnptEkycRequestBody = components["schemas"]["VnptEkycRequestBody"];

interface SubmitEkycParams {
  leadId: string;
  sessionId?: string;
  ekycData: VnptEkycRequestBody;
}

async function submitEkycResult({ leadId, sessionId, ekycData }: SubmitEkycParams) {
  const startTime = performance.now();
  logSubmitStart(leadId, sessionId || "unknown");

  const { data, error } = await apiClient.POST("/leads/{id}/ekyc/vnpt", {
    params: { path: { id: leadId } },
    body: ekycData,
  });

  const duration = performance.now() - startTime;

  if (error) {
    const errorMessage = typeof error === "object" && error !== null && "message" in error
      ? (error as { message?: string }).message || "Failed to submit eKYC result"
      : "Failed to submit eKYC result";
    logSubmitError(leadId, sessionId || "unknown", errorMessage);
    throw new Error(errorMessage);
  }

  if (!data) {
    const errorMsg = "No data returned from submit eKYC result API";
    logSubmitError(leadId, sessionId || "unknown", errorMsg);
    throw new Error(errorMsg);
  }

  logSubmitSuccess(leadId, sessionId || "unknown", duration);
  return data;
}

/**
 * Exponential backoff delay for retries
 * Delays increase exponentially: 1s, 2s, 4s, 8s, etc.
 */
function exponentialBackoff(attempt: number): number {
  // Calculate delay: 2^attempt * 1000ms, capped at 10 seconds
  const delay = Math.min(Math.pow(2, attempt) * 1000, 10000);
  // Add some jitter to avoid thundering herd
  return delay + Math.random() * 500;
}

export function useSubmitEkycResult() {
  return useMutation({
    mutationFn: submitEkycResult,
    retry: (failureCount, error) => {
      // Retry up to 3 times for network errors or 5xx errors
      if (failureCount >= 3) return false;
      
      // Check if error is retryable
      const errorMessage = error instanceof Error ? error.message : String(error);
      const isRetryable =
        errorMessage.includes("Network Error") ||
        errorMessage.includes("timeout") ||
        errorMessage.includes("503") ||
        errorMessage.includes("502") ||
        errorMessage.includes("500");
      
      return isRetryable;
    },
    retryDelay: exponentialBackoff,
    onMutate: ({ leadId, sessionId }) => {
      logSubmitStart(leadId, sessionId || "unknown");
    },
    onError: (error, { leadId, sessionId }, context) => {
      const failureCount = (context as any)?.failureCount || 0;
      if (failureCount > 0) {
        logSubmitRetry(leadId, sessionId || "unknown", failureCount + 1);
      }
    },
  });
}
