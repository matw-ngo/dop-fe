import { useQuery } from "@tanstack/react-query";
import { consentClient } from "@/lib/api/services";

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
    queryFn: async () => {
      const result = await consentClient.GET("/consent-purpose/{id}" as any, {
        params: {
          path: {
            id: consentPurposeId,
          },
        },
      });

      return result.data as any; // Type generic any for now
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
