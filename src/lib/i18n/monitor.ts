/**
 * Translation Performance Monitor
 *
 * Monitors translation performance metrics including:
 * - Cache hit/miss rates
 * - Translation fetch times
 * - Batch operation performance
 * - Error rates
 */

export interface TranslationMetrics {
  cacheHits: number;
  cacheMisses: number;
  totalFetches: number;
  successfulFetches: number;
  failedFetches: number;
  averageFetchTime: number;
  totalFetchTime: number;
  batchFetches: number;
  errorRate: number;
  hitRate: number;
  metricsByLocale: Record<string, LocaleMetrics>;
  metricsByNamespace: Record<string, NamespaceMetrics>;
}

export interface LocaleMetrics {
  cacheHits: number;
  cacheMisses: number;
  totalFetches: number;
  successfulFetches: number;
  failedFetches: number;
  averageFetchTime: number;
}

export interface NamespaceMetrics {
  cacheHits: number;
  cacheMisses: number;
  totalFetches: number;
  averageFetchTime: number;
  requestCount: number;
}

export class TranslationMonitor {
  private metrics: TranslationMetrics = {
    cacheHits: 0,
    cacheMisses: 0,
    totalFetches: 0,
    successfulFetches: 0,
    failedFetches: 0,
    averageFetchTime: 0,
    totalFetchTime: 0,
    batchFetches: 0,
    errorRate: 0,
    hitRate: 0,
    metricsByLocale: {},
    metricsByNamespace: {},
  };

  private startTimes = new Map<string, number>();
  private enabled = true;

  constructor(enabled = true) {
    this.enabled = enabled;
  }

  /**
   * Record a cache hit
   */
  recordCacheHit(locale: string, namespace: string, _key: string): void {
    if (!this.enabled) return;

    this.metrics.cacheHits++;
    this.updateHitRate();

    // Update locale metrics
    this.updateLocaleMetrics(locale, {
      cacheHits: 1,
      cacheMisses: 0,
      totalFetches: 0,
      successfulFetches: 0,
      failedFetches: 0,
      averageFetchTime: 0,
    });

    // Update namespace metrics
    this.updateNamespaceMetrics(namespace, {
      cacheHits: 1,
      cacheMisses: 0,
      totalFetches: 0,
      averageFetchTime: 0,
      requestCount: 0,
    });
  }

  /**
   * Record a cache miss
   */
  recordCacheMiss(locale: string, namespace: string, _key: string): void {
    if (!this.enabled) return;

    this.metrics.cacheMisses++;
    this.updateHitRate();

    // Update locale metrics
    this.updateLocaleMetrics(locale, {
      cacheHits: 0,
      cacheMisses: 1,
      totalFetches: 0,
      successfulFetches: 0,
      failedFetches: 0,
      averageFetchTime: 0,
    });

    // Update namespace metrics
    this.updateNamespaceMetrics(namespace, {
      cacheHits: 0,
      cacheMisses: 1,
      totalFetches: 0,
      averageFetchTime: 0,
      requestCount: 0,
    });
  }

  /**
   * Start timing a translation fetch
   */
  startFetchTiming(locale: string, namespace: string, key: string): string {
    if (!this.enabled) return "";

    const id = `${locale}:${namespace}:${key}:${Date.now()}:${Math.random()}`;
    this.startTimes.set(id, performance.now());
    return id;
  }

  /**
   * End timing and record a successful translation fetch
   */
  recordTranslationFetch(
    locale: string,
    namespace: string,
    _key: string,
    fetchTime: number,
    success: boolean,
    timingId?: string,
  ): void {
    if (!this.enabled) return;

    // Remove timing record
    if (timingId) {
      this.startTimes.delete(timingId);
    }

    this.metrics.totalFetches++;
    this.metrics.totalFetchTime += fetchTime;
    this.metrics.averageFetchTime =
      this.metrics.totalFetchTime / this.metrics.totalFetches;

    if (success) {
      this.metrics.successfulFetches++;
    } else {
      this.metrics.failedFetches++;
    }

    this.metrics.errorRate =
      this.metrics.failedFetches / this.metrics.totalFetches;

    // Update locale metrics
    this.updateLocaleMetrics(locale, {
      cacheHits: 0,
      cacheMisses: 0,
      totalFetches: 1,
      successfulFetches: success ? 1 : 0,
      failedFetches: success ? 0 : 1,
      averageFetchTime: fetchTime,
    });

    // Update namespace metrics
    this.updateNamespaceMetrics(namespace, {
      cacheHits: 0,
      cacheMisses: 0,
      totalFetches: 1,
      averageFetchTime: fetchTime,
      requestCount: 1,
    });
  }

  /**
   * Record a batch fetch operation
   */
  recordBatchFetch(
    locale: string,
    namespace: string,
    keyCount: number,
    fetchTime: number,
    success: boolean,
  ): void {
    if (!this.enabled) return;

    this.metrics.batchFetches++;
    this.metrics.totalFetches += keyCount;
    this.metrics.totalFetchTime += fetchTime;
    this.metrics.averageFetchTime =
      this.metrics.totalFetchTime / this.metrics.totalFetches;

    if (success) {
      this.metrics.successfulFetches += keyCount;
    } else {
      this.metrics.failedFetches += keyCount;
    }

    this.metrics.errorRate =
      this.metrics.failedFetches / this.metrics.totalFetches;

    // Update locale metrics
    this.updateLocaleMetrics(locale, {
      cacheHits: 0,
      cacheMisses: 0,
      totalFetches: keyCount,
      successfulFetches: success ? keyCount : 0,
      failedFetches: success ? 0 : keyCount,
      averageFetchTime: fetchTime / keyCount, // Average per key
    });

    // Update namespace metrics
    this.updateNamespaceMetrics(namespace, {
      cacheHits: 0,
      cacheMisses: 0,
      totalFetches: keyCount,
      averageFetchTime: fetchTime / keyCount,
      requestCount: 1,
    });
  }

  /**
   * Get current metrics
   */
  getMetrics(): TranslationMetrics {
    return { ...this.metrics };
  }

  /**
   * Get metrics for a specific locale
   */
  getLocaleMetrics(locale: string): LocaleMetrics | null {
    return this.metrics.metricsByLocale[locale] || null;
  }

  /**
   * Get metrics for a specific namespace
   */
  getNamespaceMetrics(namespace: string): NamespaceMetrics | null {
    return this.metrics.metricsByNamespace[namespace] || null;
  }

  /**
   * Reset all metrics
   */
  reset(): void {
    this.metrics = {
      cacheHits: 0,
      cacheMisses: 0,
      totalFetches: 0,
      successfulFetches: 0,
      failedFetches: 0,
      averageFetchTime: 0,
      totalFetchTime: 0,
      batchFetches: 0,
      errorRate: 0,
      hitRate: 0,
      metricsByLocale: {},
      metricsByNamespace: {},
    };
    this.startTimes.clear();
  }

  /**
   * Enable or disable monitoring
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  /**
   * Check if monitoring is enabled
   */
  isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Get performance summary
   */
  getPerformanceSummary(): {
    overall: {
      hitRate: string;
      errorRate: string;
      averageFetchTime: string;
      totalRequests: number;
    };
    byLocale: Record<
      string,
      {
        hitRate: string;
        errorRate: string;
        averageFetchTime: string;
      }
    >;
    byNamespace: Record<
      string,
      {
        hitRate: string;
        averageFetchTime: string;
        requestCount: number;
      }
    >;
  } {
    const totalRequests = this.metrics.cacheHits + this.metrics.cacheMisses;

    return {
      overall: {
        hitRate: `${(this.metrics.hitRate * 100).toFixed(2)}%`,
        errorRate: `${(this.metrics.errorRate * 100).toFixed(2)}%`,
        averageFetchTime: `${this.metrics.averageFetchTime.toFixed(2)}ms`,
        totalRequests,
      },
      byLocale: Object.fromEntries(
        Object.entries(this.metrics.metricsByLocale).map(
          ([locale, metrics]) => [
            locale,
            {
              hitRate: this.calculateHitRate(
                metrics.cacheHits,
                metrics.cacheMisses,
              ),
              errorRate: this.calculateErrorRate(
                metrics.successfulFetches,
                metrics.failedFetches,
              ),
              averageFetchTime: `${metrics.averageFetchTime.toFixed(2)}ms`,
            },
          ],
        ),
      ),
      byNamespace: Object.fromEntries(
        Object.entries(this.metrics.metricsByNamespace).map(
          ([namespace, metrics]) => [
            namespace,
            {
              hitRate: this.calculateHitRate(
                metrics.cacheHits,
                metrics.cacheMisses,
              ),
              averageFetchTime: `${metrics.averageFetchTime.toFixed(2)}ms`,
              requestCount: metrics.requestCount,
            },
          ],
        ),
      ),
    };
  }

  // Private methods

  private updateHitRate(): void {
    const total = this.metrics.cacheHits + this.metrics.cacheMisses;
    this.metrics.hitRate = total > 0 ? this.metrics.cacheHits / total : 0;
  }

  private updateLocaleMetrics(
    locale: string,
    deltas: Partial<LocaleMetrics>,
  ): void {
    if (!this.metrics.metricsByLocale[locale]) {
      this.metrics.metricsByLocale[locale] = {
        cacheHits: 0,
        cacheMisses: 0,
        totalFetches: 0,
        successfulFetches: 0,
        failedFetches: 0,
        averageFetchTime: 0,
      };
    }

    const metrics = this.metrics.metricsByLocale[locale];

    if (deltas.cacheHits) metrics.cacheHits += deltas.cacheHits;
    if (deltas.cacheMisses) metrics.cacheMisses += deltas.cacheMisses;
    if (deltas.totalFetches) metrics.totalFetches += deltas.totalFetches;
    if (deltas.successfulFetches)
      metrics.successfulFetches += deltas.successfulFetches;
    if (deltas.failedFetches) metrics.failedFetches += deltas.failedFetches;

    if (deltas.averageFetchTime) {
      const totalFetches = metrics.totalFetches;
      if (totalFetches > 0) {
        metrics.averageFetchTime =
          (metrics.averageFetchTime * (totalFetches - 1) +
            deltas.averageFetchTime) /
          totalFetches;
      }
    }
  }

  private updateNamespaceMetrics(
    namespace: string,
    deltas: Partial<NamespaceMetrics>,
  ): void {
    if (!this.metrics.metricsByNamespace[namespace]) {
      this.metrics.metricsByNamespace[namespace] = {
        cacheHits: 0,
        cacheMisses: 0,
        totalFetches: 0,
        averageFetchTime: 0,
        requestCount: 0,
      };
    }

    const metrics = this.metrics.metricsByNamespace[namespace];

    if (deltas.cacheHits) metrics.cacheHits += deltas.cacheHits;
    if (deltas.cacheMisses) metrics.cacheMisses += deltas.cacheMisses;
    if (deltas.totalFetches) metrics.totalFetches += deltas.totalFetches;
    if (deltas.requestCount) metrics.requestCount += deltas.requestCount;

    if (deltas.averageFetchTime) {
      const totalFetches = metrics.totalFetches;
      if (totalFetches > 0) {
        metrics.averageFetchTime =
          (metrics.averageFetchTime * (totalFetches - 1) +
            deltas.averageFetchTime) /
          totalFetches;
      }
    }
  }

  private calculateHitRate(hits: number, misses: number): string {
    const total = hits + misses;
    return total > 0 ? `${((hits / total) * 100).toFixed(2)}%` : "0%";
  }

  private calculateErrorRate(success: number, failed: number): string {
    const total = success + failed;
    return total > 0 ? `${((failed / total) * 100).toFixed(2)}%` : "0%";
  }
}

// Create and export singleton instance
export const translationMonitor = new TranslationMonitor();

// Export convenience functions
export function recordCacheHit(
  locale: string,
  namespace: string,
  key: string,
): void {
  translationMonitor.recordCacheHit(locale, namespace, key);
}

export function recordCacheMiss(
  locale: string,
  namespace: string,
  key: string,
): void {
  translationMonitor.recordCacheMiss(locale, namespace, key);
}

export function startFetchTiming(
  locale: string,
  namespace: string,
  key: string,
): string {
  return translationMonitor.startFetchTiming(locale, namespace, key);
}

export function recordTranslationFetch(
  locale: string,
  namespace: string,
  key: string,
  fetchTime: number,
  success: boolean,
  timingId?: string,
): void {
  translationMonitor.recordTranslationFetch(
    locale,
    namespace,
    key,
    fetchTime,
    success,
    timingId,
  );
}

export function recordBatchFetch(
  locale: string,
  namespace: string,
  keyCount: number,
  fetchTime: number,
  success: boolean,
): void {
  translationMonitor.recordBatchFetch(
    locale,
    namespace,
    keyCount,
    fetchTime,
    success,
  );
}
