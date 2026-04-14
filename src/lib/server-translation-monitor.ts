/**
 * Server-side Translation Monitoring
 *
 * Separate module to avoid circular dependencies in the request handler.
 */

import { getMetrics, initTranslationMonitor } from "./translation-monitor";

// Track server-side metrics without requiring client-side modules
const serverMetrics: {
  loadTimes: Record<
    string,
    Array<{ loadTime: number; size: number; timestamp: number }>
  >;
  fileSizes: Record<string, number>;
} = {
  loadTimes: {},
  fileSizes: {},
};

export function trackServerLoadTime(
  namespace: string,
  locale: string,
  loadTime: number,
  size: number,
) {
  const key = `${namespace}.${locale}`;

  if (!serverMetrics.loadTimes[key]) {
    serverMetrics.loadTimes[key] = [];
  }

  serverMetrics.loadTimes[key].push({
    loadTime,
    size,
    timestamp: Date.now(),
  });

  serverMetrics.fileSizes[key] = size;
}

export function getServerMetrics() {
  return {
    serverMetrics,
    clientMetrics: getMetrics(),
  };
}

// Initialize monitoring in server environment
if (typeof window === "undefined") {
  initTranslationMonitor({
    enabled: process.env.NODE_ENV === "production",
    analytics: {
      enabled:
        !!process.env.NEXT_PUBLIC_GA_ID ||
        !!process.env.TRANSLATION_ANALYTICS_ENDPOINT,
      gtagId: process.env.NEXT_PUBLIC_GA_ID,
      customEndpoint: process.env.TRANSLATION_ANALYTICS_ENDPOINT,
    },
  });
}
