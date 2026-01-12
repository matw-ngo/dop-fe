import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import apiClient from "@/lib/api/client";
import type { components } from "@/lib/api/v1.d.ts";
import {
  logConfigFetchStart,
  logConfigFetchSuccess,
  logConfigFetchError,
} from "@/lib/ekyc/audit-logger";

type EkycConfigResponseBody = components["schemas"]["EkycConfigResponseBody"];

async function getEkycConfig(leadId: string): Promise<EkycConfigResponseBody> {
  const startTime = performance.now();
  logConfigFetchStart(leadId);

  const { data, error } = await apiClient.GET("/leads/{id}/ekyc/config", {
    params: { path: { id: leadId } },
  });

  const duration = performance.now() - startTime;

  if (error) {
    const errorMessage = typeof error === "object" && error !== null && "message" in error
      ? (error as { message?: string }).message || "Unknown error"
      : "Unknown error";
    logConfigFetchError(leadId, errorMessage);
    throw new Error(errorMessage);
  }
  if (!data) {
    logConfigFetchError(leadId, "No eKYC config returned");
    throw new Error("No eKYC config returned");
  }

  logConfigFetchSuccess(leadId, duration);
  return data;
}

export function useEkycConfig(leadId: string) {
  const query = useQuery({
    queryKey: ["ekyc-config", leadId],
    queryFn: () => getEkycConfig(leadId),
    enabled: !!leadId,
    staleTime: 5 * 60 * 1000, // 5 minutes cache TTL
    gcTime: 10 * 60 * 1000, // 10 minutes garbage collection
  });

  // Log cache status using useEffect
  useEffect(() => {
    if (query.isSuccess && query.data) {
      // If data is fetched from cache (isFetching is false but we have data), it's a cache hit
      if (!query.isFetching && query.isFetched) {
        // Data was served from cache
      }
    }
  }, [query.isSuccess, query.data, query.isFetching, query.isFetched]);

  return query;
}

export default useEkycConfig;
