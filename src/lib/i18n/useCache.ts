/**
 * React Hooks for Translation Cache
 *
 * Provides React hooks for interacting with the translation cache system.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { CacheStats } from "./cache";
import { cacheManager } from "./cache-integration";
import { translationMonitor } from "./monitor";

// Hook for getting cached translations
export function useTranslation(
  locale: string,
  namespace: string,
  key: string,
  fetcher: () => Promise<string>,
  options?: {
    strategy?: keyof typeof import("./cache-integration").CACHE_STRATEGIES;
    suspense?: boolean;
    revalidateOnMount?: boolean;
  },
) {
  const [translation, setTranslation] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const mountedRef = useRef(true);

  const loadTranslation = useCallback(async () => {
    if (!mountedRef.current) return;

    setLoading(true);
    setError(null);

    try {
      const result = await cacheManager.getTranslation(
        locale,
        namespace,
        key,
        fetcher,
        options?.strategy || "feature",
      );

      if (mountedRef.current) {
        setTranslation(result);
      }
    } catch (err) {
      if (mountedRef.current) {
        setError(
          err instanceof Error ? err : new Error("Translation fetch failed"),
        );
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [locale, namespace, key, fetcher, options?.strategy]);

  useEffect(() => {
    mountedRef.current = true;

    // Check if already in cache
    const cacheKey = `${locale}:${namespace}:${key}`;
    const cached = cacheManager["getCache"](options?.strategy || "feature").get(
      cacheKey,
    );

    if (cached !== null) {
      setTranslation(cached);
      if (options?.revalidateOnMount) {
        loadTranslation();
      }
    } else {
      loadTranslation();
    }

    return () => {
      mountedRef.current = false;
    };
  }, [
    loadTranslation,
    cacheKey,
    options?.revalidateOnMount,
    options?.strategy,
  ]);

  return {
    translation,
    loading,
    error,
    reload: loadTranslation,
  };
}

// Hook for getting multiple cached translations
export function useTranslations(
  locale: string,
  namespace: string,
  keys: string[],
  fetcher: (keys: string[]) => Promise<Record<string, string>>,
  options?: {
    strategy?: keyof typeof import("./cache-integration").CACHE_STRATEGIES;
    suspense?: boolean;
    revalidateOnMount?: boolean;
  },
) {
  const [translations, setTranslations] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const mountedRef = useRef(true);

  const loadTranslations = useCallback(async () => {
    if (!mountedRef.current) return;

    setLoading(true);
    setError(null);

    try {
      const result = await cacheManager.getTranslations(
        locale,
        namespace,
        keys,
        fetcher,
        options?.strategy || "feature",
      );

      if (mountedRef.current) {
        setTranslations(result);
      }
    } catch (err) {
      if (mountedRef.current) {
        setError(
          err instanceof Error ? err : new Error("Translations fetch failed"),
        );
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [locale, namespace, keys, fetcher, options?.strategy]);

  useEffect(() => {
    mountedRef.current = true;

    // Check which translations are already cached
    const cache = cacheManager["getCache"](options?.strategy || "feature");
    const cached: Record<string, string> = {};
    const uncached: string[] = [];

    for (const key of keys) {
      const cacheKey = `${locale}:${namespace}:${key}`;
      const value = cache.get(cacheKey);
      if (value !== null) {
        cached[key] = value;
      } else {
        uncached.push(key);
      }
    }

    setTranslations(cached);

    if (uncached.length > 0 || options?.revalidateOnMount) {
      loadTranslations();
    }

    return () => {
      mountedRef.current = false;
    };
  }, [loadTranslations, options?.revalidateOnMount, options?.strategy]);

  return {
    translations,
    loading,
    error,
    reload: loadTranslations,
  };
}

// Hook for cache statistics
export function useCacheStats(strategy?: string) {
  const [stats, setStats] = useState<CacheStats | Record<string, CacheStats>>(
    () => {
      return strategy
        ? cacheManager["getCache"](strategy as any).getStats()
        : cacheManager.getCacheStats();
    },
  );

  useEffect(() => {
    const interval = setInterval(() => {
      if (strategy) {
        setStats(cacheManager["getCache"](strategy as any).getStats());
      } else {
        setStats(cacheManager.getCacheStats());
      }
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, [strategy]);

  return stats;
}

// Hook for preloading translations
export function usePreloadTranslations(
  locale: string,
  namespaces: string[],
  keys: Record<string, string[]>,
  enabled: boolean = true,
) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    if (!enabled || !mountedRef.current) return;

    const preload = async () => {
      try {
        // Simulate preloading - in real implementation, this would use your translation service
        for (const namespace of namespaces) {
          const namespaceKeys = keys[namespace] || [];
          if (namespaceKeys.length > 0) {
            // This would call your actual fetcher
            console.log(
              `Preloading ${namespaceKeys.length} translations for ${locale}:${namespace}`,
            );
          }
        }

        if (mountedRef.current) {
          setLoaded(true);
        }
      } catch (err) {
        if (mountedRef.current) {
          setError(err instanceof Error ? err : new Error("Preload failed"));
        }
      }
    };

    preload();
  }, [locale, namespaces, keys, enabled]);

  return { loaded, error };
}

// Hook for cache warming
export function useCacheWarming(
  locale: string | null,
  enabled: boolean = true,
) {
  const [warming, setWarming] = useState(false);
  const [warmed, setWarmed] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    if (!locale || !enabled || !mountedRef.current) return;

    setWarming(true);
    setError(null);

    cacheManager
      .warmUpCache(locale)
      .then(() => {
        if (mountedRef.current) {
          setWarmed(true);
          setWarming(false);
        }
      })
      .catch((err) => {
        if (mountedRef.current) {
          setError(
            err instanceof Error ? err : new Error("Cache warming failed"),
          );
          setWarming(false);
        }
      });
  }, [locale, enabled]);

  return { warming, warmed, error };
}

// Hook for monitoring cache performance
export function useCachePerformance() {
  const [metrics, setMetrics] = useState(() => {
    return translationMonitor.getMetrics();
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(translationMonitor.getMetrics());
    }, 1000); // Update every second

    return () => clearInterval(interval);
  }, []);

  return metrics;
}

// Hook for cache invalidation
export function useCacheInvalidation() {
  const invalidate = useCallback((locale: string, namespace?: string) => {
    if (namespace) {
      cacheManager.invalidateNamespace(locale, namespace);
    } else {
      cacheManager.invalidateLocale(locale);
    }
  }, []);

  return { invalidate };
}

// Hook for optimistic cache updates
export function useOptimisticCache<T = any>(
  key: string,
  fetcher: () => Promise<T>,
  options?: {
    strategy?: keyof typeof import("./cache-integration").CACHE_STRATEGIES;
    optimisticUpdate?: (current: T) => T;
    rollback?: (previous: T) => void;
  },
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const previousDataRef = useRef<T | null>(null);

  const update = useCallback(
    async (optimisticValue?: T) => {
      if (!mountedRef.current) return;

      // Store previous data for rollback
      previousDataRef.current = data;

      // Apply optimistic update if provided
      if (optimisticValue !== undefined || options?.optimisticUpdate) {
        const newValue =
          optimisticValue !== undefined
            ? optimisticValue
            : options?.optimisticUpdate?.(data as T);

        if (newValue !== undefined) {
          setData(newValue);
        }
      }

      setLoading(true);
      setError(null);

      try {
        const result = await fetcher();

        if (mountedRef.current) {
          setData(result);

          // Update cache
          const cache = cacheManager["getCache"](
            options?.strategy || "feature",
          );
          cache.set(key, result, {
            ttl: 5 * 60 * 1000, // 5 minutes
            priority: "medium",
            namespace: "optimistic",
          });
        }
      } catch (err) {
        if (mountedRef.current) {
          setError(err instanceof Error ? err : new Error("Update failed"));

          // Rollback on error
          if (previousDataRef.current !== null) {
            setData(previousDataRef.current);
            options?.rollback?.(previousDataRef.current);
          }
        }
        throw err;
      } finally {
        if (mountedRef.current) {
          setLoading(false);
        }
      }
    },
    [data, fetcher, key, options],
  );

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  return {
    data,
    loading,
    error,
    update,
  };
}

// Utility hook for creating memoized cache keys
export function useCacheKey(
  locale: string,
  namespace: string,
  key: string,
  params?: Record<string, any>,
) {
  return useMemo(() => {
    const baseKey = `${locale}:${namespace}:${key}`;
    if (!params) return baseKey;

    const paramString = JSON.stringify(params, Object.keys(params).sort());
    return `${baseKey}:${btoa(paramString)}`;
  }, [locale, namespace, key, params]);
}
