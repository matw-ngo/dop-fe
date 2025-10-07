"use client";

// Hook for managing asynchronous field options
// Uses React Query for data fetching, caching, and state management

import { useQuery, useQueries } from "@tanstack/react-query";
import { useMemo } from "react";

interface AsyncOptionsConfig<T = any> {
  /** Function to fetch options */
  fetcher: (params?: any) => Promise<T[]>;

  /** Initial options (optional) - already transformed */
  initialOptions?: Array<{ value: string; label: string; disabled?: boolean }>;

  /** Dependencies that trigger re-fetch */
  dependencies?: any[];

  /** Cache key for storing fetched options */
  cacheKey?: string;

  /** Cache duration in milliseconds (default: 5 minutes) */
  cacheDuration?: number;

  /** Whether to fetch on mount (default: true) */
  fetchOnMount?: boolean;

  /** Transform function to convert fetched data to options format */
  transform?: (
    data: T[],
  ) => Array<{ value: string; label: string; disabled?: boolean }>;

  /** Error handler */
  onError?: (error: Error) => void;

  /** Success handler */
  onSuccess?: (data: T[]) => void;

  /** Whether the query is enabled */
  enabled?: boolean;
}

interface AsyncOptionsState<T = any> {
  options: Array<{ value: string; label: string; disabled?: boolean }>;
  rawData: T[];
  isLoading: boolean;
  error: Error | null;
  isCached: boolean;
  refetch: () => void;
}

/**
 * Hook for fetching and managing async options using React Query
 */
export function useAsyncOptions<T = any>(
  config: AsyncOptionsConfig<T>,
): AsyncOptionsState<T> {
  const {
    fetcher,
    initialOptions = [],
    dependencies = [],
    cacheKey = "async-options",
    cacheDuration = 5 * 60 * 1000, // 5 minutes
    fetchOnMount = true,
    transform,
    onError,
    onSuccess,
    enabled = true,
  } = config;

  // Create unique query key based on cache key and dependencies
  const queryKey = useMemo(
    () => [cacheKey, ...dependencies],
    [cacheKey, ...dependencies], // eslint-disable-line react-hooks/exhaustive-deps
  );

  // Default transform function
  const transformData = useMemo(() => {
    if (transform) return transform;

    return (
      data: T[],
    ): Array<{ value: string; label: string; disabled?: boolean }> => {
      return data.map((item: any) => ({
        value: item.value || item.id || String(item),
        label: item.label || item.name || String(item),
        disabled: item.disabled || false,
      }));
    };
  }, [transform]);

  // Use React Query for data fetching
  const {
    data: rawData,
    isLoading,
    error,
    refetch,
    isFetched,
  } = useQuery<T[], Error>({
    queryKey,
    queryFn: async () => {
      const result = await fetcher();
      onSuccess?.(result);
      return result;
    },
    enabled: enabled && fetchOnMount,
    staleTime: cacheDuration,
    gcTime: cacheDuration, // Previously cacheTime
    retry: 1,
    refetchOnWindowFocus: false,
  });

  // Transform raw data to options format
  const options = useMemo(() => {
    if (!rawData) return initialOptions;
    return transformData(rawData);
  }, [rawData, transformData, initialOptions]);

  // Handle errors
  useMemo(() => {
    if (error) {
      onError?.(error);
    }
  }, [error, onError]);

  return {
    options,
    rawData: rawData || [],
    isLoading,
    error: error || null,
    isCached: isFetched && !isLoading,
    refetch: () => {
      refetch();
    },
  };
}

/**
 * Hook for managing dependent options (e.g., City depends on Country)
 */
export function useDependentOptions<T = any>(
  config: AsyncOptionsConfig<T> & {
    /** The field value this depends on */
    dependsOn: any;

    /** Whether to fetch when dependency is falsy */
    fetchWhenEmpty?: boolean;
  },
) {
  const { dependsOn, fetchWhenEmpty = false, ...restConfig } = config;

  const shouldFetch = fetchWhenEmpty || Boolean(dependsOn);

  return useAsyncOptions<T>({
    ...restConfig,
    enabled: shouldFetch,
    dependencies: [dependsOn],
  });
}

/**
 * Batch hook for managing multiple async options using React Query
 */
export function useMultipleAsyncOptions(
  configs: Record<string, AsyncOptionsConfig>,
): Record<string, AsyncOptionsState> {
  // Create queries array for useQueries
  const queriesConfig = useMemo(() => {
    return Object.entries(configs).map(([fieldName, config]) => {
      const {
        fetcher,
        cacheKey = fieldName,
        dependencies = [],
        cacheDuration = 5 * 60 * 1000,
        fetchOnMount = true,
        onSuccess,
        enabled = true,
      } = config;

      return {
        queryKey: [cacheKey, ...dependencies],
        queryFn: async () => {
          const result = await fetcher();
          onSuccess?.(result);
          return result;
        },
        enabled: enabled && fetchOnMount,
        staleTime: cacheDuration,
        gcTime: cacheDuration,
        retry: 1,
        refetchOnWindowFocus: false,
        meta: { fieldName, config },
      };
    });
  }, [configs]);

  // Use React Query's useQueries for parallel fetching
  const queries = useQueries({
    queries: queriesConfig,
  });

  // Transform results into the expected format
  return useMemo(() => {
    const results: Record<string, AsyncOptionsState> = {};

    Object.entries(configs).forEach(([fieldName, config], index) => {
      const query = queries[index];
      const { transform } = config;

      // Default transform
      const transformData =
        transform ||
        ((data: any[]) => {
          return data.map((item: any) => ({
            value: item.value || item.id || String(item),
            label: item.label || item.name || String(item),
            disabled: item.disabled || false,
          }));
        });

      const rawData = query.data || [];
      const options = rawData.length > 0 ? transformData(rawData) : [];

      results[fieldName] = {
        options,
        rawData,
        isLoading: query.isLoading,
        error: query.error || null,
        isCached: query.isFetched && !query.isLoading,
        refetch: () => query.refetch(),
      };
    });

    return results;
  }, [configs, queries]);
}

/**
 * Hook for prefetching options (useful for optimistic UI)
 */
export function usePrefetchOptions<T = any>(config: AsyncOptionsConfig<T>) {
  const { fetcher, cacheKey = "prefetch", dependencies = [] } = config;

  // This will prefetch the data without subscribing to updates
  useQuery<T[], Error>({
    queryKey: [cacheKey, ...dependencies],
    queryFn: fetcher,
    staleTime: config.cacheDuration || 5 * 60 * 1000,
    enabled: false, // Don't fetch automatically
  });
}
