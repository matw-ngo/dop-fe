/**
 * React Hook for Translation Monitoring
 *
 * Provides easy integration with React components for tracking
 * translation performance metrics and missing keys.
 */

import { useLocale, useTranslations } from "next-intl";
import type React from "react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  isMonitoringEnabled,
  trackCacheHit,
  trackMissingKey,
  trackTranslationRequest,
} from "./translation-monitor";

interface UseTranslationMonitorOptions {
  trackMissingKeys?: boolean;
  trackCacheHits?: boolean;
  trackRequests?: boolean;
  namespace?: string;
}

/**
 * Hook to monitor translation usage in React components
 */
export function useTranslationMonitor(
  options: UseTranslationMonitorOptions = {},
) {
  const {
    trackMissingKeys: shouldTrackMissing = true,
    trackCacheHits: shouldTrackCache = true,
    trackRequests: shouldTrackRequests = true,
    namespace: defaultNamespace,
  } = options;

  const locale = useLocale();
  const trackedKeys = useRef<Set<string>>(new Set());
  const cacheRef = useRef<Map<string, any>>(new Map());

  /**
   * Track translation request with caching simulation
   */
  const trackRequest = useCallback(
    (key: string, ns?: string) => {
      if (!isMonitoringEnabled()) return;

      const actualNamespace = ns || defaultNamespace;
      const cacheKey = `${actualNamespace || "default"}:${locale}:${key}`;

      if (shouldTrackRequests && actualNamespace) {
        trackTranslationRequest(locale, actualNamespace);
      }

      // Simulate cache hit/miss
      if (shouldTrackCache && actualNamespace) {
        const isHit = cacheRef.current.has(cacheKey);
        trackCacheHit(actualNamespace, locale, isHit);
      }
    },
    [locale, defaultNamespace, shouldTrackRequests, shouldTrackCache],
  );

  /**
   * Enhanced translation function with monitoring
   */
  const useMonitoredTranslations = useCallback(
    (ns?: string) => {
      const t = useTranslations(ns);
      const actualNamespace = ns || defaultNamespace;

      return useCallback(
        (key: string, values?: any) => {
          trackRequest(key, actualNamespace);

          // Get the translation
          const result = t(key, values);

          // Check if key is missing (returns the key itself)
          if (shouldTrackMissing && result === key && !key.startsWith("{")) {
            // Only track once per session to avoid spam
            const trackingKey = `${actualNamespace || "default"}:${key}`;
            if (!trackedKeys.current.has(trackingKey)) {
              trackedKeys.current.add(trackingKey);
              trackMissingKey(key, actualNamespace || "default", locale);
            }
          }

          // Cache the result
          const cacheKey = `${actualNamespace || "default"}:${locale}:${key}`;
          cacheRef.current.set(cacheKey, result);

          return result;
        },
        [t, trackRequest, shouldTrackMissing, locale],
      );
    },
    [trackRequest, shouldTrackMissing],
  );

  /**
   * Clear tracked keys cache
   */
  const clearTrackedKeys = useCallback(() => {
    trackedKeys.current.clear();
  }, []);

  /**
   * Clear translation cache
   */
  const clearCache = useCallback(() => {
    cacheRef.current.clear();
  }, []);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      // Clean up if needed
    };
  }, []);

  return {
    useMonitoredTranslations,
    trackRequest,
    clearTrackedKeys,
    clearCache,
    trackedKeysCount: trackedKeys.current.size,
    cacheSize: cacheRef.current.size,
  };
}

/**
 * Higher-order component for automatic monitoring
 */
export function withTranslationMonitor<P extends object>(
  Component: React.ComponentType<P>,
  options: UseTranslationMonitorOptions = {},
) {
  return function MonitoredComponent(props: P) {
    const monitor = useTranslationMonitor(options);

    return <Component {...props} translationMonitor={monitor} />;
  };
}

/**
 * Context provider for global translation monitoring settings
 */

interface TranslationMonitorContextValue {
  enabled: boolean;
  options: UseTranslationMonitorOptions;
  setEnabled: (enabled: boolean) => void;
  setOptions: (options: Partial<UseTranslationMonitorOptions>) => void;
}

const TranslationMonitorContext =
  createContext<TranslationMonitorContextValue | null>(null);

interface TranslationMonitorProviderProps {
  children: React.ReactNode;
  enabled?: boolean;
  options?: UseTranslationMonitorOptions;
}

export function TranslationMonitorProvider({
  children,
  enabled = true,
  options = {},
}: TranslationMonitorProviderProps) {
  const [isEnabled, setIsEnabled] = useState(enabled);
  const [currentOptions, setCurrentOptions] = useState(options);

  const setEnabled = useCallback((newEnabled: boolean) => {
    setIsEnabled(newEnabled);
  }, []);

  const setOptions = useCallback(
    (newOptions: Partial<UseTranslationMonitorOptions>) => {
      setCurrentOptions((prev) => ({ ...prev, ...newOptions }));
    },
    [],
  );

  const value: TranslationMonitorContextValue = {
    enabled: isEnabled,
    options: currentOptions,
    setEnabled,
    setOptions,
  };

  return (
    <TranslationMonitorContext.Provider value={value}>
      {children}
    </TranslationMonitorContext.Provider>
  );
}

/**
 * Hook to access translation monitor context
 */
export function useTranslationMonitorContext() {
  const context = useContext(TranslationMonitorContext);
  if (!context) {
    throw new Error(
      "useTranslationMonitorContext must be used within TranslationMonitorProvider",
    );
  }
  return context;
}
