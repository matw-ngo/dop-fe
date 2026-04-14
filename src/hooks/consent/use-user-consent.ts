import { useQuery } from "@tanstack/react-query";
import { consentClient } from "@/lib/api/services";
import type { ConsentRecord } from "./types";

export interface UseUserConsentParams {
  sessionId?: string;
  enabled?: boolean;
}

export interface UseUserConsentReturn {
  data?: ConsentRecord | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
  isRefetching: boolean;
}

export const useUserConsent = ({
  sessionId,
  enabled = true,
}: UseUserConsentParams = {}): UseUserConsentReturn => {
  const queryKey = ["user-consent", sessionId] as const;

  const { data, isLoading, error, refetch, isRefetching } = useQuery({
    queryKey,
    queryFn: async () => {
      const result = await consentClient.GET("/consent", {
        params: {
          query: {
            session_id: sessionId,
            action: "grant",
          },
        },
      });

      return result.data?.consents?.[0] ?? null;
    },
    enabled: enabled && !!sessionId,
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

export default useUserConsent;
