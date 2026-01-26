import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/api/client";

interface UseConsentLogsOptions {
  leadId?: string;
  page?: number;
  pageSize?: number;
  enabled?: boolean;
}

interface ConsentLog {
  id?: string;
  consent_id?: string;
  action?: string;
  details?: string;
  created_at?: string;
}

interface Pagination {
  page?: number;
  page_size?: number;
  total_count?: number;
}

interface ConsentLogsListResponse {
  consent_logs?: ConsentLog[];
  pagination?: Pagination;
}

interface UseConsentLogsReturn {
  data?: ConsentLogsListResponse;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
  isRefetching: boolean;
}

export const useConsentLogs = ({
  leadId,
  page = 1,
  pageSize = 10,
  enabled = true,
}: UseConsentLogsOptions = {}): UseConsentLogsReturn => {
  const queryKey = ["consent-logs", leadId, page, pageSize] as const;

  const { data, isLoading, error, refetch, isRefetching } = useQuery({
    queryKey,
    queryFn: async () => {
      const result = await apiClient.GET("/consent-logs" as any, {
        params: {
          query: {
            lead_id: leadId,
            page,
            page_size: pageSize,
          },
        },
      });

      return result.data;
    },
    enabled: enabled && !!leadId,
    staleTime: 60000,
  });

  return {
    data,
    isLoading,
    error: error || null,
    refetch,
    isRefetching,
  };
};

export default useConsentLogs;
