import { useQuery } from "@tanstack/react-query";
import { consentClient } from "@/lib/api/services";
import type { components } from "@/lib/api/v1/consent";

interface UseDataCategoriesOptions {
  consentPurposeId?: string;
  enabled?: boolean;
}

type DataCategory = components["schemas"]["DataCategory"];

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

  const { data, isLoading, error, refetch, isRefetching } = useQuery<
    DataCategory[]
  >({
    queryKey,
    queryFn: async () => {
      const result = await consentClient.GET("/data-category", {
        params: {
          query: {
            page: 1,
            page_size: 100,
          },
        },
      });

      return result.data?.categories ?? [];
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

export default useDataCategories;
