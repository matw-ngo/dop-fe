import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/api/client";
import type { components } from "@/lib/api/v1.d.ts";

type FlowDetail = components["schemas"]["FlowDetail"];

/**
 * Fetches the tenant's onboarding flow configuration.
 *
 * @remarks
 * This hook retrieves the flow configuration for a given tenant, which includes:
 * - Flow ID: Used to identify the specific onboarding flow
 * - Steps: Array of step configurations with step IDs
 *
 * The flow configuration is required when creating leads to ensure proper
 * flow and step tracking throughout the onboarding process.
 *
 * @param tenantUuid - The UUID of the tenant to fetch flow configuration for
 *
 * @returns Query result with flow configuration data
 *
 * @example
 * ```tsx
 * const { data: flowConfig, isLoading: isLoadingFlow } = useTenantFlow(tenant.uuid);
 *
 * if (isLoadingFlow) {
 *   return <LoadingSpinner />;
 * }
 *
 * const flowId = flowConfig?.id;
 * const stepId = flowConfig?.steps[0]?.id;
 * ```
 */
export function useTenantFlow(
  tenantUuid: string,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: ["tenant-flow", tenantUuid],
    queryFn: async (): Promise<FlowDetail> => {
      const { data, error } = await apiClient.GET("/flows/{tenant}", {
        params: {
          path: {
            tenant: tenantUuid,
          },
        },
      });

      if (error) {
        throw new Error(
          (error as any).message || "Failed to fetch tenant flow configuration",
        );
      }

      if (!data) {
        throw new Error("No flow configuration data returned");
      }

      return data;
    },
    enabled: options?.enabled ?? !!tenantUuid,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    retry: 1, // Only retry once on failure
  });
}
