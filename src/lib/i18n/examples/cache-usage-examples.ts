/**
 * Examples of Using the Translation Cache System
 *
 * This file demonstrates various ways to use the caching system
 * for optimal performance in different scenarios.
 */

import {
  TranslationCache,
  CacheFactory,
  cacheManager,
  getCachedTranslation,
  getCachedTranslations,
  warmUpTranslationCache,
  invalidateTranslationCache,
  type CacheOptions
} from '../cache';
import { CACHE_STRATEGIES } from '../cache-integration';

import {
  useTranslation,
  useTranslations,
  useCacheStats,
  useCacheWarming,
  useOptimisticCache
} from '../useCache';

// Example 1: Basic Cache Usage
export async function basicCacheExample() {
  console.log('=== Basic Cache Example ===');

  // Get the default translation cache
  const cache = CacheFactory.getInstance('translations');

  // Set a translation with default options
  cache.set('en:common:save', 'Save', {
    namespace: 'common',
    priority: 'high',
    ttl: 30 * 60 * 1000 // 30 minutes
  });

  // Retrieve the translation
  const translation = cache.get('en:common:save');
  console.log('Translation:', translation);

  // Check if exists
  console.log('Has translation:', cache.has('en:common:save'));

  // Get cache statistics
  const stats = cache.getStats();
  console.log('Cache stats:', {
    size: stats.size,
    hitRate: stats.hitRate,
    memoryUsage: `${(stats.memoryUsage / 1024).toFixed(2)} KB`
  });
}

// Example 2: Using Different Cache Strategies
export async function cacheStrategyExample() {
  console.log('=== Cache Strategy Example ===');

  // Core UI translations - long TTL, persistent
  const coreCache = CacheFactory.getInstance('core');
  coreCache.set('en:nav:home', 'Home', {
    namespace: 'navigation',
    priority: 'high',
    persistent: true,
    ttl: 60 * 60 * 1000 // 1 hour
  });

  // Feature-specific translations - medium TTL
  const featureCache = CacheFactory.getInstance('feature');
  featureCache.set('en:dashboard:title', 'Dashboard Overview', {
    namespace: 'dashboard',
    priority: 'medium',
    ttl: 15 * 60 * 1000 // 15 minutes
  });

  // Admin translations - short TTL, no persistence
  const adminCache = CacheFactory.getInstance('admin');
  adminCache.set('en:admin:users', 'User Management', {
    namespace: 'admin',
    priority: 'low',
    ttl: 5 * 60 * 1000 // 5 minutes
  });
}

// Example 3: Batch Translation Loading
export async function batchTranslationExample() {
  console.log('=== Batch Translation Example ===');

  // Define multiple translations needed
  const translations = [
    { key: 'welcome.message', value: 'Welcome to our platform!' },
    { key: 'welcome.subtitle', value: 'Get started in minutes' },
    { key: 'button.getStarted', value: 'Get Started' },
    { key: 'button.learnMore', value: 'Learn More' }
  ];

  // Preload all translations at once
  const cache = CacheFactory.getInstance('ui');
  await cache.preload(
    translations.map(t => ({
      key: `en:welcome:${t.key}`,
      value: t.value,
      options: {
        namespace: 'welcome',
        priority: 'high',
        ttl: 30 * 60 * 1000
      }
    }))
  );

  console.log('Preloaded', translations.length, 'translations');
}

// Example 4: Cache Warming Strategy
export async function cacheWarmingExample() {
  console.log('=== Cache Warming Example ===');

  // Common translations that should always be cached
  const commonTranslations = [
    'common.save',
    'common.cancel',
    'common.delete',
    'common.edit',
    'common.loading',
    'common.error',
    'common.success'
  ];

  // Warm up cache for English locale
  await warmUpTranslationCache('en');

  // You can also warm up specific namespaces
  const cache = CacheFactory.getInstance('core');
  await cache.warmUp('en', commonTranslations, async (key) => {
    // In a real app, this would fetch from your translation service
    return `[EN:${key}]`;
  });

  console.log('Cache warmed for', commonTranslations.length, 'common keys');
}

// Example 5: React Hook Usage
export function TranslationComponentExample() {
  // Single translation hook
  const { translation: saveText, loading } = useTranslation(
    'en',
    'common',
    'save',
    async () => {
      // Fetch translation from API
      const response = await fetch('/api/translations/en/common/save');
      const data = await response.json();
      return data.translation;
    },
    {
      strategy: 'core', // Use core cache strategy
      revalidateOnMount: false // Don't refetch if cached
    }
  );

  // Multiple translations hook
  const { translations, loading: loadingAll } = useTranslations(
    'en',
    'forms',
    ['email', 'password', 'submit', 'cancel'],
    async (keys) => {
      // Fetch multiple translations at once
      const response = await fetch('/api/translations/en/forms/batch', {
        method: 'POST',
        body: JSON.stringify({ keys })
      });
      return response.json();
    },
    {
      strategy: 'ui'
    }
  );

  // Cache warming hook
  const { warming, warmed } = useCacheWarming('en', true);

  return (
    <form>
      <input placeholder={translations.email || 'Email'} />
      <input type="password" placeholder={translations.password || 'Password'} />
      <button type="submit">
        {loading ? 'Loading...' : translations.submit || 'Submit'}
      </button>
      <button type="button">
        {loading ? 'Loading...' : translations.cancel || 'Cancel'}
      </button>
    </form>
  );
}

// Example 6: Cache Statistics Monitoring
export function CacheStatsExample() {
  // Get stats for all caches
  const allStats = useCacheStats();

  // Get stats for specific cache strategy
  const coreStats = useCacheStats('core');

  return (
    <div>
      <h3>Overall Cache Performance</h3>
      <ul>
        <li>Total Size: {Object.values(allStats).reduce((sum, stats) => sum + stats.size, 0)}</li>
        <li>Memory Usage: {(Object.values(allStats).reduce((sum, stats) => sum + stats.memoryUsage, 0) / 1024).toFixed(2)} KB</li>
        <li>Average Hit Rate: {(Object.values(allStats).reduce((sum, stats) => sum + stats.hitRate, 0) / Object.keys(allStats).length * 100).toFixed(2)}%</li>
      </ul>

      <h3>Core Cache Performance</h3>
      <ul>
        <li>Size: {coreStats.size}/{coreStats.maxSize}</li>
        <li>Hit Rate: {(coreStats.hitRate * 100).toFixed(2)}%</li>
        <li>Evictions: {coreStats.evictions}</li>
      </ul>
    </div>
  );
}

// Example 7: Advanced Cache Configuration
export function advancedCacheExample() {
  console.log('=== Advanced Cache Configuration ===');

  // Create a custom cache with specific configuration
  const customCache = new TranslationCache({
    maxSize: 2000, // Larger cache size
    defaultTTL: 20 * 60 * 1000, // 20 minutes default TTL
    cleanupInterval: 30 * 1000, // Clean up every 30 seconds
    persistKey: 'custom-translation-cache',
    enableStats: true,
    enablePersistence: true
  });

  // Set translations with different configurations
  customCache.set('en:critical:error', 'Critical Error', {
    priority: 'high',
    persistent: true,
    ttl: 2 * 60 * 60 * 1000, // 2 hours
    namespace: 'errors'
  });

  customCache.set('en:temp:notification', 'New notification', {
    priority: 'low',
    persistent: false,
    ttl: 30 * 1000, // 30 seconds
    namespace: 'temporary'
  });

  // Monitor cache performance
  const monitor = setInterval(() => {
    const stats = customCache.getStats();
    console.log('Custom cache stats:', {
      size: stats.size,
      hitRate: (stats.hitRate * 100).toFixed(2) + '%',
      memoryUsage: (stats.memoryUsage / 1024).toFixed(2) + ' KB'
    });
  }, 5000);

  // Cleanup after 1 minute
  setTimeout(() => {
    clearInterval(monitor);
    customCache.destroy();
  }, 60000);
}

// Example 8: Cache Invalidation Strategies
export async function cacheInvalidationExample() {
  console.log('=== Cache Invalidation Example ===');

  // Invalidate specific namespace
  invalidateTranslationCache('en', 'user-profile');

  // Invalidate entire locale
  invalidateTranslationCache('en');

  // Or use cache manager directly for more control
  await cacheManager.invalidateNamespace('en', 'dashboard');
  await cacheManager.invalidateLocale('fr');

  console.log('Cache invalidated for specific namespaces');
}

// Example 9: Optimistic Updates with Cache
export function OptimisticUpdateExample() {
  const { data, loading, error, update } = useOptimisticCache(
    'en:user:profile',
    async () => {
      const response = await fetch('/api/user/profile');
      return response.json();
    },
    {
      optimisticUpdate: (current) => ({
        ...current,
        lastUpdated: new Date().toISOString()
      }),
      rollback: (previous) => {
        console.log('Rolled back to previous state');
      },
      strategy: 'user'
    }
  );

  const handleUpdateProfile = async () => {
    try {
      await update({
        name: 'John Doe',
        email: 'john@example.com'
      });
    } catch (error) {
      // Error is handled internally, rollback occurs
      console.error('Update failed:', error);
    }
  };

  return (
    <div>
      <h2>User Profile</h2>
      {loading && <p>Loading...</p>}
      {error && <p>Error: {error.message}</p>}
      {data && (
        <div>
          <p>Name: {data.name}</p>
          <p>Email: {data.email}</p>
          <p>Last Updated: {data.lastUpdated}</p>
          <button onClick={handleUpdateProfile}>
            Update Profile
          </button>
        </div>
      )}
    </div>
  );
}

// Example 10: Performance Optimization Tips
export const performanceTips = {
  // 1. Use appropriate cache strategies
  strategies: {
    core: 'Use for navigation, buttons, and frequently used UI elements',
    feature: 'Use for feature-specific content that changes occasionally',
    page: 'Use for page-specific translations',
    admin: 'Use for admin panel with shorter TTL for security'
  },

  // 2. Preload critical translations
  preloading: {
    tip: 'Preload common translations on app initialization',
    code: `await warmUpTranslationCache(navigator.language);`
  },

  // 3. Batch requests
  batching: {
    tip: 'Fetch multiple translations in a single request',
    code: `const translations = await getCachedTranslations(locale, namespace, keys, fetcher);`
  },

  // 4. Monitor cache performance
  monitoring: {
    tip: 'Use cache statistics to optimize hit rates',
    code: `const stats = useCacheStats();`
  },

  // 5. Invalidate selectively
  invalidation: {
    tip: 'Only invalidate relevant cache entries when translations change',
    code: `invalidateTranslationCache(locale, namespace);`
  }
};

// Example 11: Integration with Translation Service
export class TranslationServiceWithCache {
  constructor() {
    // Initialize cache on service creation
    this.initializeCache();
  }

  private async initializeCache() {
    // Warm up cache for user's locale
    const userLocale = navigator.language || 'en';
    await warmUpTranslationCache(userLocale);
  }

  async getTranslation(
    locale: string,
    namespace: string,
    key: string
  ): Promise<string> {
    return getCachedTranslation(
      locale,
      namespace,
      key,
      async () => {
        // Fetch from API if not in cache
        const response = await fetch(
          `/api/translations/${locale}/${namespace}/${key}`
        );
        if (!response.ok) {
          throw new Error(`Translation not found: ${key}`);
        }
        const data = await response.json();
        return data.translation;
      },
      this.getCacheStrategy(namespace)
    );
  }

  async getTranslations(
    locale: string,
    namespace: string,
    keys: string[]
  ): Promise<Record<string, string>> {
    return getCachedTranslations(
      locale,
      namespace,
      keys,
      async (keysToFetch) => {
        // Batch fetch from API
        const response = await fetch(
          `/api/translations/${locale}/${namespace}/batch`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ keys: keysToFetch })
          }
        );
        return response.json();
      },
      this.getCacheStrategy(namespace)
    );
  }

  private getCacheStrategy(namespace: string): keyof typeof CACHE_STRATEGIES {
    switch (namespace) {
      case 'core':
      case 'navigation':
        return 'core';
      case 'ui':
      case 'forms':
        return 'ui';
      case 'errors':
      case 'validation':
        return 'errors';
      case 'admin':
        return 'admin';
      default:
        return 'feature';
    }
  }
}

// Export all examples for easy testing
export const examples = {
  basicCacheExample,
  cacheStrategyExample,
  batchTranslationExample,
  cacheWarmingExample,
  advancedCacheExample,
  cacheInvalidationExample
};