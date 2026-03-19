import { useQuery } from "@tanstack/react-query";
import { dopClient } from "@/lib/api/services/dop";
import type { components } from "@/lib/api/v1/dop";

type LeadStatusResponse = components["schemas"]["LeadStatusResponse"];

/**
 * Fetches the current distribution/forward status of a lead
 */
async function getLeadStatus(leadId: string): Promise<LeadStatusResponse> {
  const { data, error, response } = await dopClient.GET("/leads/{id}", {
    params: {
      path: { id: leadId },
    },
  });

  if (error) {
    throw new Error(
      `Failed to get lead status: ${response.status} ${response.statusText}`,
    );
  }

  if (!data) {
    throw new Error("No data returned from API");
  }

  return data;
}

/**
 * Hook to get lead distribution/forward status
 *
 * @remarks
 * This hook automatically polls every 5 seconds to check for status updates.
 * Use this to monitor:
 * - Distribution status (pending, evaluating, distributed, failed, no_match)
 * - Whether the lead has been forwarded to a partner
 * - Partner information if forwarded
 *
 * @example
 * ```tsx
 * const { data, isLoading } = useLeadStatus(leadId);
 *
 * if (data?.distribution_status === 'distributed') {
 *   console.log('Lead distributed to:', data.partner_name);
 * }
 * ```
 */
export function useLeadStatus(leadId: string, enabled = true) {
  return useQuery<LeadStatusResponse, Error>({
    queryKey: ["lead-status", leadId],
    queryFn: () => getLeadStatus(leadId),
    enabled: !!leadId && enabled,
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 5 * 1000, // Poll every 5 seconds for status updates
    retry: 2,
  });
}
