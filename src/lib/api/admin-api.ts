import { toast } from "sonner";
import type {
  AdminApiError,
  AdminFieldDetail,
  AdminFlowDetail,
  AdminFlowListItem,
  AdminFlowListResponse,
  AdminFlowQueryOptions,
  AdminStepDetail,
  AdminStepListItem,
  AdminStepListResponse,
  BulkUpdateFieldsRequest,
  BulkUpdateFieldsResponse,
  UpdateFieldRequest,
  UpdateFlowRequest,
  UpdateStepRequest,
} from "./admin-types";

const baseUrl =
  process.env.NEXT_PUBLIC_API_URL || "https://dop-stg.datanest.vn/";

// Helper function to get auth token
const getAuthToken = (): string | null => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("accessToken");
  }
  return null;
};

// Helper function to handle API errors
const handleApiError = async (response: Response): Promise<never> => {
  let errorMessage = "An unknown error occurred";

  try {
    const errorData: AdminApiError = await response.json();
    errorMessage = errorData.message || errorMessage;
  } catch {
    // If we can't parse the error, use the status text
    errorMessage = response.statusText || `HTTP ${response.status}`;
  }

  throw new Error(errorMessage);
};

// Generic API request function
const apiRequest = async <T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> => {
  const token = getAuthToken();
  const url = `${baseUrl}${endpoint}`;

  const config: RequestInit = {
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);

    if (!response.ok) {
      await handleApiError(response);
    }

    // Handle empty responses
    if (response.status === 204) {
      return {} as T;
    }

    return response.json();
  } catch (error) {
    // Log error for debugging but don't redirect
    console.error("API request failed:", error);

    // Re-throw the error for the caller to handle
    if (error instanceof Error) {
      throw error;
    } else {
      throw new Error("An unexpected error occurred");
    }
  }
};

// Retry utility for API calls
export const withRetry = async <T>(
  apiCall: () => Promise<T>,
  maxRetries = 3,
  delay = 1000,
): Promise<T> => {
  let lastError: Error;

  for (let i = 0; i <= maxRetries; i++) {
    try {
      return await apiCall();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // Don't retry on 4xx errors (client errors)
      if (
        lastError.message.includes("401") ||
        lastError.message.includes("403") ||
        lastError.message.includes("404")
      ) {
        throw lastError;
      }

      if (i === maxRetries) {
        throw lastError;
      }

      // Exponential backoff
      const backoffDelay = delay * 2 ** i;
      await new Promise((resolve) => setTimeout(resolve, backoffDelay));
    }
  }

  throw lastError!;
};

// Admin API service
export const adminApi = {
  // Flow management
  getFlows: async (
    options?: AdminFlowQueryOptions,
  ): Promise<AdminFlowListResponse> => {
    const queryParams = new URLSearchParams();
    if (options?.page) queryParams.append("page", options.page.toString());
    if (options?.limit) queryParams.append("limit", options.limit.toString());
    if (options?.status) queryParams.append("status", options.status);

    const query = queryParams.toString();
    const endpoint = query ? `/admin/flows?${query}` : "/admin/flows";

    return withRetry(() => apiRequest<AdminFlowListResponse>(endpoint));
  },

  getFlow: async (id: string): Promise<AdminFlowDetail> => {
    return withRetry(() => apiRequest<AdminFlowDetail>(`/admin/flows/${id}`));
  },

  updateFlow: async (
    id: string,
    updates: UpdateFlowRequest,
  ): Promise<AdminFlowDetail> => {
    return withRetry(() =>
      apiRequest<AdminFlowDetail>(`/admin/flows/${id}`, {
        method: "PATCH",
        body: JSON.stringify(updates),
      }),
    );
  },

  // Step management
  getFlowSteps: async (flowId: string): Promise<AdminStepListResponse> => {
    return withRetry(() =>
      apiRequest<AdminStepListResponse>(`/admin/flows/${flowId}/steps`),
    );
  },

  getStep: async (id: string): Promise<AdminStepDetail> => {
    return withRetry(() => apiRequest<AdminStepDetail>(`/admin/steps/${id}`));
  },

  updateStep: async (
    id: string,
    updates: UpdateStepRequest,
  ): Promise<AdminStepDetail> => {
    return withRetry(() =>
      apiRequest<AdminStepDetail>(`/admin/steps/${id}`, {
        method: "PATCH",
        body: JSON.stringify(updates),
      }),
    );
  },

  // Field management
  updateField: async (
    stepId: string,
    fieldId: string,
    updates: UpdateFieldRequest,
  ): Promise<AdminFieldDetail> => {
    return withRetry(() =>
      apiRequest<AdminFieldDetail>(`/admin/steps/${stepId}/fields/${fieldId}`, {
        method: "PATCH",
        body: JSON.stringify(updates),
      }),
    );
  },

  // Bulk operations
  bulkUpdateFields: async (
    stepId: string,
    updates: BulkUpdateFieldsRequest,
  ): Promise<BulkUpdateFieldsResponse> => {
    return withRetry(() =>
      apiRequest<BulkUpdateFieldsResponse>(
        `/admin/steps/${stepId}/fields/bulk`,
        {
          method: "POST",
          body: JSON.stringify(updates),
        },
      ),
    );
  },
};

// Export types for use in components
export type {
  AdminFlowListItem,
  AdminFlowDetail,
  AdminStepListItem,
  AdminStepDetail,
  AdminFieldDetail,
  UpdateFlowRequest,
  UpdateStepRequest,
  UpdateFieldRequest,
  BulkUpdateFieldsRequest,
  BulkUpdateFieldsResponse,
  AdminFlowQueryOptions,
};
