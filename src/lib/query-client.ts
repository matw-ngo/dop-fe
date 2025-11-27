import { QueryClient } from "@tanstack/react-query";

// Create a client with optimized configuration
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // With SSR, we usually want to set some default staleTime
      // above 0 to avoid refetching immediately on the client
      staleTime: 5 * 60 * 1000, // 5 minutes - increased for better performance
      gcTime: 10 * 60 * 1000, // 10 minutes - garbage collection time
      retry: (failureCount, error) => {
        // Don't retry on 4xx errors except 408, 429
        if (error && typeof error === "object" && "status" in error) {
          const status = error.status as number;
          if (
            status >= 400 &&
            status < 500 &&
            status !== 408 &&
            status !== 429
          ) {
            return false;
          }
        }
        // Retry up to 3 times for other errors
        return failureCount < 3;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      refetchOnMount: false, // Prevent unnecessary refetches
    },
    mutations: {
      retry: (failureCount, error) => {
        // Don't retry on 4xx errors except 408, 429
        if (error && typeof error === "object" && "status" in error) {
          const status = error.status as number;
          if (
            status >= 400 &&
            status < 500 &&
            status !== 408 &&
            status !== 429
          ) {
            return false;
          }
        }
        // Retry up to 2 times for mutations
        return failureCount < 2;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
    },
  },
});

// Helper functions for cache management
export const invalidateQueries = (queryKey: readonly string[]) => {
  return queryClient.invalidateQueries({ queryKey });
};

export const setQueryData = <T>(queryKey: readonly string[], data: T) => {
  return queryClient.setQueryData(queryKey, data);
};

export const getQueryData = <T>(queryKey: readonly string[]): T | undefined => {
  return queryClient.getQueryData<T>(queryKey);
};

export const prefetchQuery = <T>(
  queryKey: readonly string[],
  queryFn: () => Promise<T>,
) => {
  return queryClient.prefetchQuery({
    queryKey,
    queryFn,
    staleTime: 5 * 60 * 1000,
  });
};

// Optimistic update helpers
export const optimisticallyUpdateQuery = <T>(
  queryKey: readonly string[],
  updateFn: (oldData: T | undefined) => T,
  rollbackFn?: (oldData: T | undefined) => void,
) => {
  const previousData = queryClient.getQueryData<T>(queryKey);

  queryClient.setQueryData(queryKey, updateFn);

  return () => {
    if (rollbackFn) {
      rollbackFn(previousData);
    } else {
      queryClient.setQueryData(queryKey, previousData);
    }
  };
};
