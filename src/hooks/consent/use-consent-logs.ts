import { useQuery } from "@tanstack/react-query";
import { consentClient } from "@/lib/api/services";
import type { components } from "@/lib/api/v1/consent";

interface UseConsentLogsOptions {
  consentId?: string;
  page?: number;
  pageSize?: number;
  enabled?: boolean;
}

type ConsentLogListResponse = components["schemas"]["ConsentLogListResponse"];

interface UseConsentLogsReturn {
  data?: ConsentLogListResponse;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
  isRefetching: boolean;
}

export const useConsentLogs = ({
  consentId,
  page = 1,
  pageSize = 10,
  enabled = true,
}: UseConsentLogsOptions = {}): UseConsentLogsReturn => {
  const queryKey = ["consent-logs", consentId, page, pageSize] as const;

  const { data, isLoading, error, refetch, isRefetching } = useQuery({
    queryKey,
    queryFn: async () => {
      const result = await consentClient.GET("/consent-log", {
        params: {
          query: {
            consent_id: consentId,
            page,
            page_size: pageSize,
          },
        },
      });

      return result.data ?? {};
    },
    enabled: enabled && !!consentId,
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
