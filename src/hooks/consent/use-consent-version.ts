import { useQuery } from "@tanstack/react-query";
import { consentClient } from "@/lib/api/services";

interface UseConsentVersionOptions {
  consentPurposeId?: string;
  search?: string;
  page?: number;
  pageSize?: number;
  enabled?: boolean;
}

interface ConsentVersion {
  id?: string;
  consent_purpose_id?: string;
  version?: number;
  content?: string;
  document_url?: string;
  effective_date?: string;
  created_at?: string;
  updated_at?: string;
}

interface Pagination {
  page?: number;
  page_size?: number;
  total_count?: number;
}

interface ConsentVersionListResponse {
  consent_versions?: ConsentVersion[];
  pagination?: Pagination;
}

interface UseConsentVersionReturn {
  data?: ConsentVersionListResponse;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
  isRefetching: boolean;
}

export const useConsentVersion = ({
  consentPurposeId,
  search,
  page = 1,
  pageSize = 10,
  enabled = true,
}: UseConsentVersionOptions = {}): UseConsentVersionReturn => {
  const queryKey = [
    "consent-versions",
    consentPurposeId,
    search,
    page,
    pageSize,
  ] as const;

  const { data, isLoading, error, refetch, isRefetching } = useQuery({
    queryKey,
    queryFn: async () => {
      const result = await consentClient.GET("/consent-version" as any, {
        params: {
          query: {
            consent_purpose_id: consentPurposeId,
            search,
            page,
            page_size: pageSize,
          },
        },
      });

      return result.data;
    },
    enabled,
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

export default useConsentVersion;
