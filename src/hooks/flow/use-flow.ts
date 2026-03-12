import { useQuery } from "@tanstack/react-query";
import { dopClient } from "@/lib/api/services/dop";
import type { components } from "@/lib/api/v1/dop";
import type { MappedFlow } from "@/mappers/flowMapper";
import { mapApiFlowToFlow } from "@/mappers/flowMapper";

async function getFlowByTenant(tenant: string, signal?: AbortSignal) {
  const { data, error, response } = await dopClient.GET("/flows/{tenant}", {
    params: {
      path: { tenant },
    },
    signal, // Pass abort signal to fetch
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
    queryFn: async ({ signal }) => {
      // 10-second timeout per Requirement 4.6
      // Use AbortSignal.timeout() for clean timeout handling
      const timeoutSignal = AbortSignal.timeout(10000);

      // Combine signals: abort on either timeout or manual cancellation
      const combinedSignal = signal.aborted ? signal : timeoutSignal;

      try {
        return await getFlowByTenant(tenant, combinedSignal);
      } catch (error) {
        // Re-throw with timeout context if it was a timeout
        if (error instanceof Error && error.name === "AbortError") {
          throw new Error(
            "Flow configuration request timed out after 10 seconds",
          );
        }
        throw error;
      }
    },
    select: mapApiFlowToFlow,
    enabled: !!tenant,
    staleTime: 5 * 60 * 1000,
    retry: 1, // Single retry to stay within 10s timeout
    retryDelay: 1000, // 1s delay between retries
  });
}
