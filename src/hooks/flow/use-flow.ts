import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/api/client";
import type { components } from "@/lib/api/v1.d.ts";
import type { MappedFlow } from "@/mappers/flowMapper";
import { mapApiFlowToFlow } from "@/mappers/flowMapper";

async function getFlowByTenant(tenant: string) {
  const { data, error, response } = await apiClient.GET("/flows/{tenant}", {
    params: {
      path: { tenant },
    },
  });

  if (error) {
    throw new Error(
      `API request failed: ${response.status} ${response.statusText}`,
    );
  }

  if (!data) {
    throw new Error("No data returned from API");
  }

  return data;
}

export function useFlow(tenant: string) {
  return useQuery<components["schemas"]["FlowDetail"], Error, MappedFlow>({
    queryKey: ["flow", tenant],
    queryFn: () => getFlowByTenant(tenant),
    select: mapApiFlowToFlow,
    enabled: !!tenant,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
}
