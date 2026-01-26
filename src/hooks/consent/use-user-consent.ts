import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/api/client";

interface UseUserConsentOptions {
  leadId?: string;
  enabled?: boolean;
}

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
  data?: ConsentRecord;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
  isRefetching: boolean;
}

export const useUserConsent = ({
  leadId,
  enabled = true,
}: UseUserConsentOptions = {}): UseUserConsentReturn => {
  const queryKey = ["user-consent", leadId] as const;

  const { data, isLoading, error, refetch, isRefetching } = useQuery({
    queryKey,
    queryFn: async () => {
      const result = await apiClient.GET("/consent" as any, {
        params: {
          query: {
            lead_id: leadId,
          },
        },
      });

      return result.data;
    },
    enabled: enabled && !!leadId,
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
