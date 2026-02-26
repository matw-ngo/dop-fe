import { useQuery } from "@tanstack/react-query";
import { consentClient } from "@/lib/api/services";
import type { components } from "@/lib/api/v1/consent";

type ConsentPurpose = components["schemas"]["ConsentPurpose"];

export const useConsentPurpose = ({
  consentPurposeId,
  enabled = true,
}: {
  consentPurposeId?: string;
  enabled?: boolean;
} = {}) => {
  const queryKey = ["consent-purpose", consentPurposeId] as const;

  const { data, isLoading, error, refetch, isRefetching } = useQuery({
    queryKey,
    queryFn: async (): Promise<ConsentPurpose | undefined> => {
      if (!consentPurposeId) {
        return undefined;
      }

      const result = await consentClient.GET("/consent-purpose/{id}", {
        params: {
          path: {
            id: consentPurposeId,
          },
        },
      });

      return result.data;
    },
    enabled: enabled && !!consentPurposeId,
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

export default useConsentPurpose;
