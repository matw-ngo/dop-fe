import { useQuery } from "@tanstack/react-query";
import { mapApiFlowToFlow } from "@/mappers/flowMapper";
import type { components } from "@/lib/api/v1.d.ts";
import type { MappedFlow } from "@/mappers/flowMapper";
import apiClient from "@/lib/api/client";

async function getFlowByDomain(domain: string) {
  const { data, error, response } = await apiClient.GET("/flows/{domain}", {
    params: {
      path: { domain },
    },
  });

  if (error) {
    throw new Error(
      `API request failed: ${response.status} ${response.statusText}`,
    );
  }

  return data;
}

export function useFlow(domain: string) {
  const queryFn = async () => {
    const data = await getFlowByDomain(domain);
    if (!data) {
      throw new Error("No data returned from API");
    }
    return data;
  };

  return useQuery<components["schemas"]["FlowDetail"], Error, MappedFlow>({
    queryKey: ["flow", domain],
    queryFn: queryFn,
    select: mapApiFlowToFlow,
    enabled: !!domain,
  });
}
