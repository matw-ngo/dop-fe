import { useQuery } from "@tanstack/react-query";
import { dopClient } from "@/lib/api/services/dop";
import type { components } from "@/lib/api/v1/dop";
import type { MappedFlow } from "@/mappers/flowMapper";
import { mapApiFlowToFlow } from "@/mappers/flowMapper";

async function getFlowByTenant(tenant: string) {
  const { data, error, response } = await dopClient.GET("/flows/{tenant}", {
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
