/**
 * Translation Monitoring System
 *
 * Tracks performance metrics for i18n implementation including:
 * - Load times for each namespace
 * - Missing translation keys with context
 * - File sizes and cache performance
 * - Request counts per page
 */

// Type definitions
export interface TranslationMetrics {
  loadTimes: Record<string, LoadTimeMetric[]>;
  missingKeys: MissingKeyMetric[];
  cacheStats: CacheStats;
  fileSizes: Record<string, number>;
  requestCounts: Record<string, number>;
}

export interface LoadTimeMetric {
  namespace: string;
  locale: string;
  loadTime: number; // in milliseconds
  size: number; // in bytes
  timestamp: number;
  source: 'server' | 'client';
}

export interface MissingKeyMetric {
  key: string;
  namespace: string;
  locale: string;
  context?: string;
  timestamp: number;
  userAgent?: string;
  url?: string;
}

export interface CacheStats {
  hits: number;
  misses: number;
  details: Array<{
    namespace: string;
    locale: string;
    hit: boolean;
    timestamp: number;
  }>;
}

export interface PerformanceThresholds {
  maxLoadTime: number; // ms
  maxFileSize: number; // bytes
  minCacheHitRate: number; // percentage (0-100)
  maxMissingKeysPerPage: number;
}

export interface AnalyticsConfig {
  enabled: boolean;
  gtagId?: string;
  customEndpoint?: string;
  batchSize: number;
  flushInterval: number; // ms
}

// Default configuration
const DEFAULT_THRESHOLDS: PerformanceThresholds = {
  maxLoadTime: 100, // 100ms
  maxFileSize: 1024 * 1024, // 1MB
  minCacheHitRate: 80, // 80%
  maxMissingKeysPerPage: 10,
};

const DEFAULT_ANALYTICS_CONFIG: AnalyticsConfig = {
  enabled: true,
  batchSize: 10,
  flushInterval: 30000, // 30 seconds
};

// Global state
let isEnabled = process.env.NODE_ENV === 'production';
let metrics: TranslationMetrics = {
  loadTimes: {},
  missingKeys: [],
  cacheStats: { hits: 0, misses: 0, details: [] },
  fileSizes: {},
  requestCounts: {},
};

let thresholds: PerformanceThresholds = DEFAULT_THRESHOLDS;
let analyticsConfig: AnalyticsConfig = DEFAULT_ANALYTICS_CONFIG;
let flushTimer: NodeJS.Timeout | null = null;

/**
 * Initialize the translation monitor
 */
export function initTranslationMonitor(options: {
  enabled?: boolean;
  thresholds?: Partial<PerformanceThresholds>;
  analytics?: Partial<AnalyticsConfig>;
} = {}) {
  isEnabled = options.enabled ?? isEnabled;

  if (options.thresholds) {
    thresholds = { ...thresholds, ...options.thresholds };
  }

  if (options.analytics) {
    analyticsConfig = { ...analyticsConfig, ...options.analytics };
  }

  // Setup periodic flush
  if (analyticsConfig.enabled && !flushTimer) {
    flushTimer = setInterval(() => {
      flushMetrics();
    }, analyticsConfig.flushInterval);
  }
}

/**
 * Track load time for a translation namespace
 */
export function trackLoadTime(
  namespace: string,
  locale: string,
  loadTime: number,
  size: number,
  source: 'server' | 'client' = 'client'
) {
  if (!isEnabled) return;

  const metric: LoadTimeMetric = {
    namespace,
    locale,
    loadTime,
    size,
    timestamp: Date.now(),
    source,
  };

  if (!metrics.loadTimes[namespace]) {
    metrics.loadTimes[namespace] = [];
  }
  metrics.loadTimes[namespace].push(metric);

  // Store file size
  metrics.fileSizes[`${namespace}.${locale}`] = size;

  // Check performance threshold
  if (loadTime > thresholds.maxLoadTime) {
    reportPerformanceIssue({
      type: 'slow_load',
      namespace,
      locale,
      loadTime,
      threshold: thresholds.maxLoadTime,
    });
  }

  // Check file size threshold
  if (size > thresholds.maxFileSize) {
    reportPerformanceIssue({
      type: 'large_file',
      namespace,
      locale,
      size,
      threshold: thresholds.maxFileSize,
    });
  }

  // Send to analytics
  if (analyticsConfig.enabled) {
    sendToAnalytics('translation_load_time', {
      namespace,
      locale,
      load_time: loadTime,
      size,
      source,
    });
  }
}

/**
 * Track missing translation key
 */
export function trackMissingKey(
  key: string,
  namespace: string,
  locale: string,
  context?: string
) {
  if (!isEnabled) return;

  const metric: MissingKeyMetric = {
    key,
    namespace,
    locale,
    context,
    timestamp: Date.now(),
    userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
    url: typeof window !== 'undefined' ? window.location.href : undefined,
  };

  metrics.missingKeys.push(metric);

  // Check threshold
  const recentMissingKeys = metrics.missingKeys.filter(
    (k) => Date.now() - k.timestamp < 60000 && k.namespace === namespace
  );

  if (recentMissingKeys.length > thresholds.maxMissingKeysPerPage) {
    reportPerformanceIssue({
      type: 'too_many_missing_keys',
      namespace,
      locale,
      count: recentMissingKeys.length,
      threshold: thresholds.maxMissingKeysPerPage,
    });
  }

  // Send to analytics
  if (analyticsConfig.enabled) {
    sendToAnalytics('translation_missing_key', {
      key,
      namespace,
      locale,
      context,
    });
  }
}

/**
 * Track cache hit or miss
 */
export function trackCacheHit(namespace: string, locale: string, hit: boolean) {
  if (!isEnabled) return;

  if (hit) {
    metrics.cacheStats.hits++;
  } else {
    metrics.cacheStats.misses++;
  }

  metrics.cacheStats.details.push({
    namespace,
    locale,
    hit,
    timestamp: Date.now(),
  });

  // Check cache hit rate periodically
  const total = metrics.cacheStats.hits + metrics.cacheStats.misses;
  if (total > 0 && total % 10 === 0) {
    const hitRate = (metrics.cacheStats.hits / total) * 100;
    if (hitRate < thresholds.minCacheHitRate) {
      reportPerformanceIssue({
        type: 'low_cache_hit_rate',
        hitRate,
        threshold: thresholds.minCacheHitRate,
      });
    }
  }

  // Send to analytics
  if (analyticsConfig.enabled) {
    sendToAnalytics('translation_cache_hit', {
      namespace,
      locale,
      hit,
    });
  }
}

/**
 * Track translation request
 */
export function trackTranslationRequest(locale: string, namespace: string) {
  if (!isEnabled) return;

  const key = `${namespace}.${locale}`;
  metrics.requestCounts[key] = (metrics.requestCounts[key] || 0) + 1;

  // Send to analytics
  if (analyticsConfig.enabled) {
    sendToAnalytics('translation_request', {
      locale,
      namespace,
    });
  }
}

/**
 * Get collected metrics
 */
export function getMetrics(): TranslationMetrics {
  return { ...metrics };
}

/**
 * Get summary statistics
 */
export function getMetricsSummary() {
  const summary = {
    totalLoadTimes: 0,
    averageLoadTime: 0,
    totalMissingKeys: metrics.missingKeys.length,
    cacheHitRate: 0,
    totalFileSize: 0,
    totalRequests: 0,
  };

  // Calculate load time stats
  const allLoadTimes = Object.values(metrics.loadTimes).flat();
  summary.totalLoadTimes = allLoadTimes.length;
  if (allLoadTimes.length > 0) {
    summary.averageLoadTime = allLoadTimes.reduce((sum, m) => sum + m.loadTime, 0) / allLoadTimes.length;
  }

  // Calculate cache hit rate
  const totalCacheEvents = metrics.cacheStats.hits + metrics.cacheStats.misses;
  if (totalCacheEvents > 0) {
    summary.cacheHitRate = (metrics.cacheStats.hits / totalCacheEvents) * 100;
  }

  // Calculate total file size
  summary.totalFileSize = Object.values(metrics.fileSizes).reduce((sum, size) => sum + size, 0);

  // Calculate total requests
  summary.totalRequests = Object.values(metrics.requestCounts).reduce((sum, count) => sum + count, 0);

  return summary;
}

/**
 * Reset collected metrics
 */
export function resetMetrics() {
  metrics = {
    loadTimes: {},
    missingKeys: [],
    cacheStats: { hits: 0, misses: 0, details: [] },
    fileSizes: {},
    requestCounts: {},
  };
}

/**
 * Enable/disable monitoring
 */
export function setMonitoringEnabled(enabled: boolean) {
  isEnabled = enabled;
}

/**
 * Check if monitoring is enabled
 */
export function isMonitoringEnabled(): boolean {
  return isEnabled;
}

/**
 * Send metrics to analytics endpoint
 */
function sendToAnalytics(eventName: string, data: Record<string, any>) {
  if (!analyticsConfig.enabled) return;

  // Send to Google Analytics if gtag is available
  if (typeof window !== 'undefined' && 'gtag' in window && analyticsConfig.gtagId) {
    (window as any).gtag('event', eventName, {
      event_category: 'translation_performance',
      custom_map: data,
    });
  }

  // Send to custom endpoint if configured
  if (analyticsConfig.customEndpoint) {
    // Store in batch for later sending
    if (!('translationMetricsBatch' in window)) {
      (window as any).translationMetricsBatch = [];
    }

    (window as any).translationMetricsBatch.push({
      eventName,
      data,
      timestamp: Date.now(),
    });

    // Flush if batch size reached
    if ((window as any).translationMetricsBatch.length >= analyticsConfig.batchSize) {
      flushMetrics();
    }
  }
}

/**
 * Flush collected metrics to analytics endpoint
 */
async function flushMetrics() {
  if (!analyticsConfig.customEndpoint) return;

  if (typeof window === 'undefined') return;

  const batch = (window as any).translationMetricsBatch || [];
  if (batch.length === 0) return;

  try {
    await fetch(analyticsConfig.customEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        metrics: batch,
        userAgent: window.navigator.userAgent,
        timestamp: Date.now(),
      }),
    });

    // Clear batch on success
    (window as any).translationMetricsBatch = [];
  } catch (error) {
    console.error('Failed to flush translation metrics:', error);
  }
}

/**
 * Report performance issues
 */
function reportPerformanceIssue(issue: {
  type: string;
  namespace?: string;
  locale?: string;
  [key: string]: any;
}) {
  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.warn('Translation performance issue:', issue);
  }

  // Send to analytics
  if (analyticsConfig.enabled) {
    sendToAnalytics('translation_performance_issue', issue);
  }

  // Could also integrate with error monitoring services like Sentry
  if (typeof window !== 'undefined' && 'Sentry' in window) {
    (window as any).Sentry.captureMessage(
      `Translation performance issue: ${issue.type}`,
      {
        level: 'warning',
        tags: { namespace: issue.namespace, locale: issue.locale },
        extra: issue,
      }
    );
  }
}

/**
 * Server-side metrics collection utilities
 */
export const ServerTranslationMonitor = {
  /**
   * Create a wrapper for next-intl's getRequestConfig that tracks metrics
   */
  withTracking: (originalConfig: any) => {
    return async ({ locale }: { locale: string }) => {
      const startTime = Date.now();

      try {
        const result = await originalConfig({ locale });
        const loadTime = Date.now() - startTime;

        // Calculate message size
        const size = JSON.stringify(result.messages).length;

        // Track server-side metrics
        trackLoadTime('messages', locale, loadTime, size, 'server');

        return result;
      } catch (error) {
        const loadTime = Date.now() - startTime;
        trackLoadTime('messages', locale, loadTime, 0, 'server');
        throw error;
      }
    };
  },

  /**
   * Get server-side metrics for API endpoint
   */
  getServerMetrics: () => {
    return getMetrics();
  },
};

// Clean up on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    if (flushTimer) {
      clearInterval(flushTimer);
    }
    flushMetrics();
  });
}