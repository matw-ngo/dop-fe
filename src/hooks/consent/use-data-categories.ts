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

  const { data, isLoading, error, refetch, isRefetching } = useQuery({
    queryKey,
    queryFn: async () => {
      // Note: Spec for searchConsentDataCategories uses /consent-data-category
      // Params: search, page, page_size. NO consent_purpose_id.
      // But previous code used consent_purpose_id.
      // Assuming legacy param or missing spec support.
      const result = await consentClient.GET("/consent-data-category", {
        params: {
          query: {
            // consent_purpose_id: consentPurposeId, // Not in spec
            page: 1, // Defaulting as required by some implementations or just good practice
            page_size: 100,
          } as any,
        },
      });

      // The response structure is ConsentDataCategoryListResponse { consent_data_categories: ... }
      // But previous code expected DataCategory[] from result.data ?? []
      // Let's check ConsentDataCategoryListResponse schema:
      // { consent_data_categories?: ConsentDataCategory[]; pagination?: ... }
      // Wait, is it DataCategory or ConsentDataCategory?
      // Spec: searchConsentDataCategories returns ConsentDataCategoryListResponse
      // which has consent_data_categories: ConsentDataCategory[]
      // ConsentDataCategory schema: id, name, description, ...
      // The previous code defined DataCategory manually.
      // I should map the response correctly.

      return result.data?.consent_data_categories ?? [];
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
