import { useQuery } from "@tanstack/react-query";
import { consentClient } from "@/lib/api/services";

interface UseConfigIdsOptions {
  enabled?: boolean;
}

interface ConfigIds {
  controller_id?: string;
  processor_id?: string;
  consent_purpose_id?: string;
}

interface UseConfigIdsReturn {
  data?: ConfigIds;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
  isRefetching: boolean;
}

export const useConfigIds = ({
  enabled = true,
}: UseConfigIdsOptions = {}): UseConfigIdsReturn => {
  const queryKey = ["config-ids"] as const;

  const { data, isLoading, error, refetch, isRefetching } = useQuery({
    queryKey,
    queryFn: async () => {
      const result = await consentClient.GET("/config/ids" as any, {
        params: {},
      });

      return result.data;
    },
    enabled,
    staleTime: 300000, // 5 minutes - config doesn't change often
  });

  return {
    data,
    isLoading,
    error: error || null,
    refetch,
    isRefetching,
  };
};

export default useConfigIds;
