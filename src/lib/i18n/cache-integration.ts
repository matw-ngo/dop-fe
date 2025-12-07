/**
 * Translation Cache Integration
 *
 * Integration layer between the cache system and the translation infrastructure.
 * Provides intelligent caching strategies based on usage patterns.
 */

import { TranslationCache, CacheFactory, createCacheKey, parseCacheKey, type CacheOptions } from './cache';
import { translationMonitor } from './monitor';

// Cache strategy definitions
export interface CacheStrategy {
  name: string;
  ttl: number;
  priority: 'low' | 'medium' | 'high';
  persistent: boolean;
  maxSize?: number;
  preloadKeys?: string[];
}

export const CACHE_STRATEGIES: Record<string, CacheStrategy> = {
  // Core application translations (navigation, buttons, etc.)
  core: {
    name: 'core',
    ttl: 60 * 60 * 1000, // 1 hour
    priority: 'high',
    persistent: true,
    maxSize: 200
  },

  // Common user interface elements
  ui: {
    name: 'ui',
    ttl: 30 * 60 * 1000, // 30 minutes
    priority: 'high',
    persistent: true,
    maxSize: 300
  },

  // Feature-specific translations
  feature: {
    name: 'feature',
    ttl: 15 * 60 * 1000, // 15 minutes
    priority: 'medium',
    persistent: false,
    maxSize: 400
  },

  // Page-specific translations
  page: {
    name: 'page',
    ttl: 10 * 60 * 1000, // 10 minutes
    priority: 'medium',
    persistent: false,
    maxSize: 500
  },

  // Admin panel translations
  admin: {
    name: 'admin',
    ttl: 5 * 60 * 1000, // 5 minutes
    priority: 'low',
    persistent: false,
    maxSize: 100
  },

  // Error messages
  errors: {
    name: 'errors',
    ttl: 60 * 60 * 1000, // 1 hour (errors might be reused)
    priority: 'high',
    persistent: true,
    maxSize: 50
  },

  // Form validation messages
  validation: {
    name: 'validation',
    ttl: 30 * 60 * 1000, // 30 minutes
    priority: 'medium',
    persistent: true,
    maxSize: 100
  }
};

// Cache manager class
export class TranslationCacheManager {
  private caches = new Map<string, TranslationCache>();
  private preloadPromises = new Map<string, Promise<void>>();
  private warmingEnabled = true;

  constructor() {
    // Initialize caches for different strategies
    this.initializeCaches();
  }

  /**
   * Get a cached translation
   */
  async getTranslation(
    locale: string,
    namespace: string,
    key: string,
    fetcher: () => Promise<string>,
    strategy: keyof typeof CACHE_STRATEGIES = 'feature'
  ): Promise<string> {
    const cacheKey = createCacheKey(locale, namespace, key);
    const cache = this.getCache(strategy);
    const cacheStrategy = CACHE_STRATEGIES[strategy];

    // Try to get from cache first
    const cached = cache.get(cacheKey);
    if (cached !== null) {
      translationMonitor.recordCacheHit(locale, namespace, key);
      return cached;
    }

    // Record cache miss
    translationMonitor.recordCacheMiss(locale, namespace, key);

    // Fetch translation
    const startTime = performance.now();
    try {
      const translation = await fetcher();
      const fetchTime = performance.now() - startTime;

      // Store in cache
      cache.set(cacheKey, translation, {
        ttl: cacheStrategy.ttl,
        priority: cacheStrategy.priority,
        persistent: cacheStrategy.persistent,
        namespace
      });

      // Record successful fetch
      translationMonitor.recordTranslationFetch(locale, namespace, key, fetchTime, true);

      return translation;
    } catch (error) {
      const fetchTime = performance.now() - startTime;

      // Record failed fetch
      translationMonitor.recordTranslationFetch(locale, namespace, key, fetchTime, false);

      throw error;
    }
  }

  /**
   * Get multiple translations (batch operation)
   */
  async getTranslations(
    locale: string,
    namespace: string,
    keys: string[],
    fetcher: (keys: string[]) => Promise<Record<string, string>>,
    strategy: keyof typeof CACHE_STRATEGIES = 'feature'
  ): Promise<Record<string, string>> {
    const cache = this.getCache(strategy);
    const cacheStrategy = CACHE_STRATEGIES[strategy];
    const result: Record<string, string> = {};
    const uncachedKeys: string[] = [];

    // Check cache for each key
    for (const key of keys) {
      const cacheKey = createCacheKey(locale, namespace, key);
      const cached = cache.get(cacheKey);

      if (cached !== null) {
        result[key] = cached;
        translationMonitor.recordCacheHit(locale, namespace, key);
      } else {
        uncachedKeys.push(key);
        translationMonitor.recordCacheMiss(locale, namespace, key);
      }
    }

    // Fetch uncached translations
    if (uncachedKeys.length > 0) {
      const startTime = performance.now();
      try {
        const fetched = await fetcher(uncachedKeys);
        const fetchTime = performance.now() - startTime;

        // Store in cache
        for (const [key, translation] of Object.entries(fetched)) {
          result[key] = translation;
          const cacheKey = createCacheKey(locale, namespace, key);
          cache.set(cacheKey, translation, {
            ttl: cacheStrategy.ttl,
            priority: cacheStrategy.priority,
            persistent: cacheStrategy.persistent,
            namespace
          });
        }

        // Record batch fetch
        translationMonitor.recordBatchFetch(locale, namespace, uncachedKeys.length, fetchTime, true);

      } catch (error) {
        const fetchTime = performance.now() - startTime;

        // Record failed batch fetch
        translationMonitor.recordBatchFetch(locale, namespace, uncachedKeys.length, fetchTime, false);

        throw error;
      }
    }

    return result;
  }

  /**
   * Preload translations for a locale
   */
  async preloadTranslations(
    locale: string,
    fetcher: (namespace: string, keys: string[]) => Promise<Record<string, string>>
  ): Promise<void> {
    if (!this.warmingEnabled) return;

    const preloadKey = `${locale}:preload`;

    // Avoid duplicate preloads
    if (this.preloadPromises.has(preloadKey)) {
      return this.preloadPromises.get(preloadKey);
    }

    const preloadPromise = this.doPreloadTranslations(locale, fetcher);
    this.preloadPromises.set(preloadKey, preloadPromise);

    try {
      await preloadPromise;
    } finally {
      this.preloadPromises.delete(preloadKey);
    }
  }

  /**
   * Invalidate cache for a namespace
   */
  invalidateNamespace(locale: string, namespace: string): void {
    for (const cache of this.caches.values()) {
      // Find all keys matching the namespace
      const keysToDelete: string[] = [];
      for (const [key] of (cache as any).cache.entries()) {
        const parsed = parseCacheKey(key);
        if (parsed.locale === locale && parsed.namespace === namespace) {
          keysToDelete.push(key);
        }
      }

      // Delete matching keys
      keysToDelete.forEach(key => cache.delete(key));
    }
  }

  /**
   * Invalidate cache for a locale
   */
  invalidateLocale(locale: string): void {
    for (const cache of this.caches.values()) {
      // Find all keys matching the locale
      const keysToDelete: string[] = [];
      for (const [key] of (cache as any).cache.entries()) {
        const parsed = parseCacheKey(key);
        if (parsed.locale === locale) {
          keysToDelete.push(key);
        }
      }

      // Delete matching keys
      keysToDelete.forEach(key => cache.delete(key));
    }
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): Record<string, any> {
    const stats: Record<string, any> = {};

    for (const [strategy, cache] of this.caches.entries()) {
      stats[strategy] = cache.getStats();
    }

    return stats;
  }

  /**
   * Warm up cache with common translations
   */
  async warmUpCache(locale: string): Promise<void> {
    if (!this.warmingEnabled) return;

    const commonTranslations = [
      // Core navigation
      'nav.home',
      'nav.about',
      'nav.contact',
      'nav.login',
      'nav.logout',
      'nav.profile',

      // Common actions
      'common.save',
      'common.cancel',
      'common.delete',
      'common.edit',
      'common.close',
      'common.confirm',
      'common.submit',
      'common.loading',
      'common.error',
      'common.success',

      // Form fields
      'form.email',
      'form.password',
      'form.name',
      'form.phone',
      'form.address',

      // Validation messages
      'validation.required',
      'validation.email',
      'validation.minLength',
      'validation.maxLength',
      'validation.pattern',

      // Error messages
      'error.network',
      'error.timeout',
      'error.notFound',
      'error.unauthorized',
      'error.server'
    ];

    // Warm up different strategy caches
    for (const [strategyName, strategy] of Object.entries(CACHE_STRATEGIES)) {
      const cache = this.getCache(strategyName as keyof typeof CACHE_STRATEGIES);
      const relevantKeys = commonTranslations.filter(key =>
        this.isKeyRelevantToStrategy(key, strategyName)
      );

      await cache.warmUp(locale, relevantKeys, async (key) => {
        // This would typically call your translation service
        // For now, we'll simulate with a placeholder
        return `[${locale}:${key}]`;
      });
    }
  }

  /**
   * Enable or disable cache warming
   */
  setWarmingEnabled(enabled: boolean): void {
    this.warmingEnabled = enabled;
  }

  /**
   * Clear all caches
   */
  clearAll(): void {
    for (const cache of this.caches.values()) {
      cache.clear();
    }
  }

  /**
   * Destroy cache manager
   */
  destroy(): void {
    for (const cache of this.caches.values()) {
      cache.destroy();
    }
    this.caches.clear();
    this.preloadPromises.clear();
  }

  // Private methods

  private initializeCaches(): void {
    // Create a cache for each strategy
    for (const [strategyName, strategy] of Object.entries(CACHE_STRATEGIES)) {
      const cache = CacheFactory.getInstance(`translation-${strategyName}`, {
        maxSize: strategy.maxSize,
        defaultTTL: strategy.ttl,
        cleanupInterval: 2 * 60 * 1000, // 2 minutes
        persistKey: `i18n-${strategyName}`,
        enableStats: true,
        enablePersistence: strategy.persistent
      });

      this.caches.set(strategyName, cache);
    }
  }

  private getCache(strategy: keyof typeof CACHE_STRATEGIES): TranslationCache {
    const cache = this.caches.get(strategy);
    if (!cache) {
      throw new Error(`Cache not found for strategy: ${strategy}`);
    }
    return cache;
  }

  private async doPreloadTranslations(
    locale: string,
    fetcher: (namespace: string, keys: string[]) => Promise<Record<string, string>>
  ): Promise<void> {
    // Define preload configurations
    const preloadConfigs = [
      {
        namespace: 'core',
        strategy: 'core' as const,
        keys: ['app.name', 'app.description', 'nav.home', 'nav.about', 'nav.contact']
      },
      {
        namespace: 'ui',
        strategy: 'ui' as const,
        keys: ['common.save', 'common.cancel', 'common.delete', 'common.edit', 'common.loading']
      },
      {
        namespace: 'errors',
        strategy: 'errors' as const,
        keys: ['error.network', 'error.timeout', 'error.notFound', 'error.server']
      }
    ];

    // Preload in parallel
    const preloadPromises = preloadConfigs.map(async ({ namespace, strategy, keys }) => {
      try {
        const translations = await fetcher(namespace, keys);
        const cache = this.getCache(strategy);
        const cacheStrategy = CACHE_STRATEGIES[strategy];

        for (const [key, translation] of Object.entries(translations)) {
          const cacheKey = createCacheKey(locale, namespace, key);
          cache.set(cacheKey, translation, {
            ttl: cacheStrategy.ttl,
            priority: cacheStrategy.priority,
            persistent: cacheStrategy.persistent,
            namespace
          });
        }
      } catch (error) {
        console.warn(`Failed to preload ${namespace} translations for ${locale}:`, error);
      }
    });

    await Promise.allSettled(preloadPromises);
  }

  private isKeyRelevantToStrategy(key: string, strategy: string): boolean {
    // Simple heuristic to determine if a key belongs to a strategy
    if (strategy === 'core' || strategy === 'ui') {
      return true; // These caches handle most common keys
    }

    if (strategy === 'errors' && key.includes('error')) {
      return true;
    }

    if (strategy === 'validation' && key.includes('validation')) {
      return true;
    }

    if (strategy === 'admin' && key.includes('admin')) {
      return true;
    }

    return false;
  }
}

// Create and export singleton instance
export const cacheManager = new TranslationCacheManager();

// Export convenience functions
export async function getCachedTranslation(
  locale: string,
  namespace: string,
  key: string,
  fetcher: () => Promise<string>,
  strategy?: keyof typeof CACHE_STRATEGIES
): Promise<string> {
  return cacheManager.getTranslation(locale, namespace, key, fetcher, strategy);
}

export async function getCachedTranslations(
  locale: string,
  namespace: string,
  keys: string[],
  fetcher: (keys: string[]) => Promise<Record<string, string>>,
  strategy?: keyof typeof CACHE_STRATEGIES
): Promise<Record<string, string>> {
  return cacheManager.getTranslations(locale, namespace, keys, fetcher, strategy);
}

export function invalidateTranslationCache(
  locale: string,
  namespace?: string
): void {
  if (namespace) {
    cacheManager.invalidateNamespace(locale, namespace);
  } else {
    cacheManager.invalidateLocale(locale);
  }
}

export function warmUpTranslationCache(locale: string): Promise<void> {
  return cacheManager.warmUpCache(locale);
}