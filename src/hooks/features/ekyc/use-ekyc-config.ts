import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import apiClient from "@/lib/api/client";
import type { components } from "@/lib/api/v1.d.ts";
import {
  logConfigFetchStart,
  logConfigFetchSuccess,
  logConfigFetchError,
  logConfigCacheHit,
  logConfigCacheMiss,
} from "@/lib/ekyc/audit-logger";

/**
 * Cache TTL in milliseconds (5 minutes)
 */
export const CACHE_TTL_MS = 5 * 60 * 1000;

/**
 * Cache garbage collection time in milliseconds (10 minutes)
 */
export const CACHE_GC_TIME_MS = 10 * 60 * 1000;

type EkycConfigResponseBody = components["schemas"]["EkycConfigResponseBody"];

async function getEkycConfig(leadId: string): Promise<EkycConfigResponseBody> {
  const startTime = performance.now();
  logConfigFetchStart(leadId);

  const { data, error } = await apiClient.GET("/leads/{id}/ekyc/config", {
    params: { path: { id: leadId } },
  });

  const duration = performance.now() - startTime;

  if (error) {
    const errorMessage =
      typeof error === "object" && error !== null && "message" in error
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
    staleTime: CACHE_TTL_MS,
    gcTime: CACHE_GC_TIME_MS,
  });

  // Log cache hit/miss using useEffect
  useEffect(() => {
    if (query.isSuccess && query.data) {
      // If data is fetched from cache (isFetching is false but we have data), it's a cache hit
      if (!query.isFetching && query.isFetched) {
        logConfigCacheHit(leadId);
      } else if (query.isFetching) {
        logConfigCacheMiss(leadId);
      }
    }
  }, [query.isSuccess, query.data, query.isFetching, query.isFetched, leadId]);

  return query;
}

export default useEkycConfig;
