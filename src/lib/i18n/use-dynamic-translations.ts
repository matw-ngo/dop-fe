/**
 * Client-side hook for dynamic translation loading
 *
 * This hook provides React components with the ability to:
 * - Load additional translations on demand
 * - Preload translations for better UX
 * - Handle loading states gracefully
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useLocale } from 'next-intl';
import {
  loadClientTranslations,
  loadNamespaceTranslations,
  preloadTranslations,
  type TranslationMessages,
  type Namespace,
  type Locale
} from './dynamic-loader';

/**
 * Hook state interface
 */
interface UseDynamicTranslationsState {
  translations: TranslationMessages;
  isLoading: boolean;
  error: Error | null;
  isLoaded: boolean;
}

/**
 * Hook for loading additional translations on the client side
 */
export function useDynamicTranslations(
  namespace: Namespace,
  options: {
    preload?: boolean;
    retryCount?: number;
    retryDelay?: number;
  } = {}
) {
  const { preload = false, retryCount = 3, retryDelay = 1000 } = options;
  const locale = useLocale();

  const [state, setState] = useState<UseDynamicTranslationsState>({
    translations: {},
    isLoading: !preload,
    error: null,
    isLoaded: false
  });

  const retryTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const retryCountRef = useRef(0);

  const loadTranslations = useCallback(async () => {
    if (state.isLoaded && !state.error) {
      return state.translations;
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const translations = await loadClientTranslations(locale, namespace);

      setState({
        translations,
        isLoading: false,
        error: null,
        isLoaded: true
      });

      return translations;
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Failed to load translations');

      // Retry logic
      if (retryCountRef.current < retryCount) {
        retryCountRef.current++;
        retryTimeoutRef.current = setTimeout(() => {
          loadTranslations();
        }, retryDelay * retryCountRef.current);

        setState(prev => ({
          ...prev,
          isLoading: true,
          error: err
        }));
      } else {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: err,
          isLoaded: false
        }));
      }

      throw err;
    }
  }, [locale, namespace, state.isLoaded, state.error, retryCount, retryDelay]);

  // Preload if requested
  useEffect(() => {
    if (preload && !state.isLoaded && !state.isLoading) {
      loadTranslations();
    }
  }, [preload, loadTranslations, state.isLoaded, state.isLoading]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, []);

  return {
    ...state,
    reload: loadTranslations,
    clearError: () => setState(prev => ({ ...prev, error: null }))
  };
}

/**
 * Hook for managing multiple namespaces
 */
export function useMultipleNamespaces(
  namespaces: Namespace[],
  options: {
    preload?: boolean;
    lazy?: boolean;
  } = {}
) {
  const { preload = false, lazy = false } = options;
  const locale = useLocale();

  const [state, setState] = useState<{
    translations: Record<Namespace, TranslationMessages>;
    isLoading: boolean;
    errors: Record<Namespace, Error | null>;
    loadedNamespaces: Set<Namespace>;
  }>({
    translations: {},
    isLoading: !lazy,
    errors: {},
    loadedNamespaces: new Set()
  });

  const loadNamespace = useCallback(async (ns: Namespace) => {
    if (state.loadedNamespaces.has(ns)) {
      return state.translations[ns];
    }

    setState(prev => ({
      ...prev,
      isLoading: true,
      errors: { ...prev.errors, [ns]: null }
    }));

    try {
      const translations = await loadClientTranslations(locale, ns);

      setState(prev => ({
        translations: { ...prev.translations, [ns]: translations },
        isLoading: false,
        errors: { ...prev.errors, [ns]: null },
        loadedNamespaces: new Set([...prev.loadedNamespaces, ns])
      }));

      return translations;
    } catch (error) {
      const err = error instanceof Error ? error : new Error(`Failed to load namespace "${ns}"`);

      setState(prev => ({
        ...prev,
        isLoading: false,
        errors: { ...prev.errors, [ns]: err }
      }));

      throw err;
    }
  }, [locale, state.loadedNamespaces, state.translations]);

  const loadAll = useCallback(async () => {
    const results = await Promise.allSettled(
      namespaces.map(ns => loadNamespace(ns))
    );

    // Handle any rejections silently
    results.forEach((result, index) => {
      if (result.status === 'rejected') {
        console.error(`Failed to load namespace "${namespaces[index]}":`, result.reason);
      }
    });

    return state.translations;
  }, [namespaces, loadNamespace, state.translations]);

  // Preload all namespaces if requested
  useEffect(() => {
    if (preload && !lazy) {
      loadAll();
    }
  }, [preload, lazy, loadAll]);

  return {
    ...state,
    loadNamespace,
    loadAll,
    getTranslations: (ns: Namespace) => state.translations[ns] || {},
    isLoaded: (ns: Namespace) => state.loadedNamespaces.has(ns),
    hasError: (ns: Namespace) => !!state.errors[ns]
  };
}

/**
 * Hook for preloading translations
 */
export function usePreloadTranslations() {
  const locale = useLocale();

  return useCallback(async (namespaces: Namespace[], options?: { fallbackLocale?: Locale }) => {
    try {
      await preloadTranslations(locale, namespaces, options);
      return true;
    } catch (error) {
      console.error('Failed to preload translations:', error);
      return false;
    }
  }, [locale]);
}

/**
 * Hook for conditionally loading translations
 * Only loads when the condition is true
 */
export function useConditionalTranslations(
  namespace: Namespace,
  condition: boolean,
  options: {
    delay?: number;
  } = {}
) {
  const { delay = 0 } = options;
  const [shouldLoad, setShouldLoad] = useState(condition);
  const dynamicHook = useDynamicTranslations(namespace, { preload: shouldLoad });

  useEffect(() => {
    if (condition && !shouldLoad) {
      if (delay > 0) {
        const timer = setTimeout(() => setShouldLoad(true), delay);
        return () => clearTimeout(timer);
      } else {
        setShouldLoad(true);
      }
    }
  }, [condition, shouldLoad, delay]);

  return dynamicHook;
}

/**
 * Hook for lazy loading translations with intersection observer
 * Useful for below-the-fold content
 */
export function useLazyTranslations(
  namespace: Namespace,
  elementRef?: React.RefObject<HTMLElement>,
  options: {
    rootMargin?: string;
    threshold?: number;
  } = {}
) {
  const { rootMargin = '50px', threshold = 0.1 } = options;
  const [isVisible, setIsVisible] = useState(false);
  const dynamicHook = useDynamicTranslations(namespace, { preload: isVisible });

  useEffect(() => {
    if (!elementRef?.current || isVisible) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin, threshold }
    );

    observer.observe(elementRef.current);

    return () => {
      observer.disconnect();
    };
  }, [elementRef, isVisible, rootMargin, threshold]);

  return {
    ...dynamicHook,
    isVisible,
    ref: elementRef
  };
}

/**
 * Hook for monitoring translation loading performance
 */
export function useTranslationMetrics() {
  const [metrics, setMetrics] = useState({
    loadTimes: [] as Array<{ namespace: string; loadTime: number; timestamp: number }>,
    errors: [] as Array<{ namespace: string; error: string; timestamp: number }>,
    cacheHits: 0,
    cacheMisses: 0
  });

  const recordLoadTime = useCallback((namespace: string, loadTime: number) => {
    setMetrics(prev => ({
      ...prev,
      loadTimes: [...prev.loadTimes, { namespace, loadTime, timestamp: Date.now() }]
    }));
  }, []);

  const recordError = useCallback((namespace: string, error: Error) => {
    setMetrics(prev => ({
      ...prev,
      errors: [...prev.errors, { namespace, error: error.message, timestamp: Date.now() }]
    }));
  }, []);

  const recordCacheHit = useCallback(() => {
    setMetrics(prev => ({ ...prev, cacheHits: prev.cacheHits + 1 }));
  }, []);

  const recordCacheMiss = useCallback(() => {
    setMetrics(prev => ({ ...prev, cacheMisses: prev.cacheMisses + 1 }));
  }, []);

  const reset = useCallback(() => {
    setMetrics({
      loadTimes: [],
      errors: [],
      cacheHits: 0,
      cacheMisses: 0
    });
  }, []);

  return {
    metrics,
    recordLoadTime,
    recordError,
    recordCacheHit,
    recordCacheMiss,
    reset
  };
}

export default {
  useDynamicTranslations,
  useMultipleNamespaces,
  usePreloadTranslations,
  useConditionalTranslations,
  useLazyTranslations,
  useTranslationMetrics
};