import { useQuery } from "@tanstack/react-query";
import { consentClient } from "@/lib/api/services";

interface ConsentRecord {
  id?: string;
  controller_id?: string;
  processor_id?: string;
  lead_id?: string;
  consent_version_id?: string;
  source?: string;
  action?: "grant" | "revoke";
  created_at?: string;
  updated_at?: string;
}

interface UseUserConsentReturn {
  data?: ConsentRecord | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
  isRefetching: boolean;
}

export const useUserConsent = ({
  sessionId,
  enabled = true,
}: {
  sessionId?: string;
  enabled?: boolean;
} = {}): UseUserConsentReturn => {
  const queryKey = ["user-consent", sessionId] as const;

  const { data, isLoading, error, refetch, isRefetching } = useQuery({
    queryKey,
    queryFn: async () => {
      // Step 1: Check current status with action=GRANT
      const result = await consentClient.GET("/consent" as any, {
        params: {
          query: {
            session_id: sessionId,
            action: "grant",
          },
        },
      });

      // Return the first consent record if available
      // The API returns { consents: [...], pagination: ... }
      const consents = (result.data as any)?.consents;
      return Array.isArray(consents) && consents.length > 0
        ? consents[0]
        : null;
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
