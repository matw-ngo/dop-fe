import { useQuery } from "@tanstack/react-query";
import { consentClient } from "@/lib/api/services";

interface UseDataCategoriesOptions {
  consentPurposeId?: string;
  enabled?: boolean;
}

interface DataCategory {
  id?: string;
  name?: string;
  description?: string;
  consent_purpose_id?: string;
  created_at?: string;
  updated_at?: string;
}

interface UseDataCategoriesReturn {
  data?: DataCategory[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
  isRefetching: boolean;
}

export const useDataCategories = ({
  consentPurposeId,
  enabled = true,
}: UseDataCategoriesOptions = {}): UseDataCategoriesReturn => {
  const queryKey = ["data-categories", consentPurposeId] as const;

  const { data, isLoading, error, refetch, isRefetching } = useQuery({
    queryKey,
    queryFn: async () => {
      const result = await consentClient.GET("/data-categories" as any, {
        params: {
          query: {
            consent_purpose_id: consentPurposeId,
          },
        },
      });

      return result.data;
    },
    enabled,
    staleTime: 60000,
  });

  return {
    data: data as unknown as DataCategory[],
    isLoading,
    error: error || null,
    refetch,
    isRefetching,
  };
};

export default useDataCategories;
