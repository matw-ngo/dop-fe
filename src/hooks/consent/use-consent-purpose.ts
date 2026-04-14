import { type UseQueryResult, useQuery } from "@tanstack/react-query";
import { consentClient } from "@/lib/api/services";
import type { ConsentPurpose } from "./types";

export interface UseConsentPurposeParams {
  consentPurposeId?: string;
  enabled?: boolean;
}

export interface UseConsentPurposeReturn {
  data?: ConsentPurpose;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
  isRefetching: boolean;
}

export const useConsentPurpose = ({
  consentPurposeId,
  enabled = true,
}: UseConsentPurposeParams = {}): UseConsentPurposeReturn => {
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
