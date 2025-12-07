# Internationalization (i18n) Cache System

A comprehensive, high-performance caching system for translations with LRU eviction, TTL support, and intelligent cache management.

## Features

- **LRU (Least Recently Used) Eviction**: Automatically removes least recently used entries when cache is full
- **TTL (Time To Live)**: Configurable expiration times for cache entries
- **Namespace-based Caching**: Organize translations by namespaces for better management
- **Priority Levels**: Set priority (low, medium, high) to control eviction order
- **Persistent Storage**: Optionally persist important cache entries across sessions
- **Cache Statistics**: Detailed performance metrics and monitoring
- **Batch Operations**: Efficient handling of multiple translations
- **React Hooks**: Easy integration with React components
- **Cache Warming**: Preload commonly used translations
- **Selective Invalidation**: Invalidate specific namespaces or locales

## Installation

The cache system is part of the i18n module. All components are already set up and ready to use.

## Basic Usage

### Direct Cache API

```typescript
import { translationCache, CacheFactory } from '@/lib/i18n/cache';

// Get a cache instance
const cache = CacheFactory.getInstance('translations');

// Store a translation
cache.set('en:common:save', 'Save', {
  namespace: 'common',
  priority: 'high',
  ttl: 30 * 60 * 1000, // 30 minutes
  persistent: true
});

// Retrieve a translation
const translation = cache.get('en:common:save');

// Check if exists
if (cache.has('en:common:save')) {
  // Translation is cached
}

// Delete a translation
cache.delete('en:common:save');

// Get cache statistics
const stats = cache.getStats();
console.log(`Hit rate: ${(stats.hitRate * 100).toFixed(2)}%`);
```

### Using Cache Manager

```typescript
import {
  getCachedTranslation,
  getCachedTranslations,
  warmUpTranslationCache
} from '@/lib/i18n/cache-integration';

// Get a single translation with caching
const translation = await getCachedTranslation(
  'en',           // locale
  'ui',           // namespace
  'button.save',  // key
  async () => {
    // Fetcher function - called only on cache miss
    const response = await fetch('/api/translations/en/ui/button.save');
    return response.json();
  },
  'core'          // cache strategy
);

// Get multiple translations efficiently
const translations = await getCachedTranslations(
  'en',
  'forms',
  ['email', 'password', 'submit'],
  async (keys) => {
    // Batch fetcher
    const response = await fetch('/api/translations/en/forms/batch', {
      method: 'POST',
      body: JSON.stringify({ keys })
    });
    return response.json();
  }
);

// Warm up cache with common translations
await warmUpTranslationCache('en');
```

### React Hooks

```typescript
import {
  useTranslation,
  useTranslations,
  useCacheStats,
  useCacheWarming
} from '@/lib/i18n/useCache';

// Single translation hook
function SaveButton() {
  const { translation, loading, error } = useTranslation(
    'en',
    'common',
    'save',
    async () => {
      const response = await fetch('/api/translations/en/common/save');
      const data = await response.json();
      return data.translation;
    },
    {
      strategy: 'core',
      revalidateOnMount: false
    }
  );

  if (loading) return <button>Loading...</button>;
  if (error) return <button>Error</button>;

  return <button>{translation || 'Save'}</button>;
}

// Multiple translations hook
function LoginForm() {
  const { translations } = useTranslations(
    'en',
    'forms',
    ['email', 'password', 'login', 'forgot'],
    async (keys) => fetchTranslations(keys)
  );

  return (
    <form>
      <input placeholder={translations.email || 'Email'} />
      <input type="password" placeholder={translations.password || 'Password'} />
      <button>{translations.login || 'Login'}</button>
      <a>{translations.forgot || 'Forgot Password?'}</a>
    </form>
  );
}

// Cache statistics
function CacheMonitor() {
  const stats = useCacheStats();

  return (
    <div>
      <p>Cache Size: {stats.size}/{stats.maxSize}</p>
      <p>Hit Rate: {(stats.hitRate * 100).toFixed(2)}%</p>
      <p>Memory Usage: {(stats.memoryUsage / 1024).toFixed(2)} KB</p>
    </div>
  );
}
```

## Cache Strategies

The system provides predefined cache strategies optimized for different use cases:

| Strategy | Max Size | Default TTL | Priority | Persistent | Use Case |
|----------|----------|-------------|----------|------------|----------|
| `core` | 500 | 60 min | High | Yes | Core UI, navigation |
| `ui` | 300 | 30 min | High | Yes | Common UI elements |
| `feature` | 400 | 15 min | Medium | No | Feature-specific content |
| `page` | 500 | 10 min | Medium | No | Page-specific translations |
| `admin` | 100 | 5 min | Low | No | Admin panel |
| `errors` | 50 | 60 min | High | Yes | Error messages |
| `validation` | 100 | 30 min | Medium | Yes | Form validation |

## Configuration

### Cache Configuration

```typescript
import { TranslationCache } from '@/lib/i18n/cache';

const cache = new TranslationCache({
  maxSize: 1000,              // Maximum number of entries
  defaultTTL: 5 * 60 * 1000,  // Default TTL: 5 minutes
  cleanupInterval: 60 * 1000, // Cleanup interval: 1 minute
  persistKey: 'my-cache',     // Storage key for persistence
  enableStats: true,          // Enable statistics
  enablePersistence: true     // Enable client-side persistence
});
```

### Cache Entry Options

```typescript
interface CacheOptions {
  ttl?: number;                    // Time to live in milliseconds
  priority?: 'low' | 'medium' | 'high';  // Priority for eviction
  persistent?: boolean;            // Persist across sessions
  namespace?: string;              // Namespace for organization
}
```

## Advanced Features

### Cache Warming

Preload commonly used translations for better performance:

```typescript
import { cacheManager } from '@/lib/i18n/cache-integration';

// Warm up cache for a locale
await cacheManager.warmUpCache('en');

// Custom warming logic
const commonKeys = ['nav.home', 'nav.about', 'common.save'];
await cacheManager['getCache']('core').warmUp(
  'en',
  commonKeys,
  async (key) => await fetchTranslation(key)
);
```

### Selective Invalidation

Invalidate cache entries when translations change:

```typescript
import { cacheManager } from '@/lib/i18n/cache-integration';

// Invalidate entire locale
cacheManager.invalidateLocale('en');

// Invalidate specific namespace
cacheManager.invalidateNamespace('en', 'user-profile');
```

### Performance Monitoring

Monitor cache performance:

```typescript
import { translationMonitor } from '@/lib/i18n/monitor';

// Get detailed metrics
const metrics = translationMonitor.getMetrics();
console.log('Hit Rate:', metrics.hitRate);
console.log('Average Fetch Time:', metrics.averageFetchTime);

// Get performance summary
const summary = translationMonitor.getPerformanceSummary();
console.log('Overall Performance:', summary.overall);
console.log('By Locale:', summary.byLocale);
console.log('By Namespace:', summary.byNamespace);
```

### Optimistic Updates

Update cache optimistically for better perceived performance:

```typescript
import { useOptimisticCache } from '@/lib/i18n/useCache';

function UserProfile() {
  const { data, loading, update } = useOptimisticCache(
    'en:user:profile',
    fetchUserProfile,
    {
      optimisticUpdate: (current) => ({
        ...current,
        lastUpdated: new Date().toISOString()
      }),
      rollback: (previous) => {
        console.log('Rolled back to previous state');
      }
    }
  );

  const handleUpdate = async () => {
    try {
      await update({ name: 'John Doe' });
    } catch (error) {
      // Automatic rollback on error
    }
  };

  return (
    // Render user profile
  );
}
```

## Best Practices

1. **Choose the Right Strategy**
   - Use `core` or `ui` for frequently accessed translations
   - Use `feature` for content that changes occasionally
   - Use `admin` with short TTL for security-sensitive content

2. **Batch Requests**
   - Fetch multiple translations in a single request
   - Use the `getTranslations` method for batch operations

3. **Warm Up Critical Paths**
   - Preload translations for common user flows
   - Warm up cache on app initialization

4. **Monitor Performance**
   - Track cache hit rates
   - Monitor fetch times
   - Adjust TTLs based on usage patterns

5. **Selective Invalidation**
   - Only invalidate affected namespaces
   - Use locale-specific invalidation when possible

## Testing

The cache system includes comprehensive tests:

```bash
# Run cache tests
npm test src/lib/i18n/__tests__/cache.test.ts

# Run integration tests
npm test src/lib/i18n/__tests__/cache-integration.test.ts
```

## Examples

See `src/lib/i18n/examples/cache-usage-examples.ts` for comprehensive usage examples covering:

- Basic cache operations
- Different cache strategies
- Batch translation loading
- Cache warming
- React hook usage
- Performance monitoring
- Optimistic updates

## API Reference

### Classes

- **TranslationCache**: Main cache implementation
- **CacheFactory**: Factory for creating cache instances
- **TranslationCacheManager**: High-level cache management
- **TranslationMonitor**: Performance monitoring

### React Hooks

- **useTranslation**: Get a single cached translation
- **useTranslations**: Get multiple cached translations
- **useCacheStats**: Monitor cache statistics
- **useCacheWarming**: Warm up cache on component mount
- **useOptimisticCache**: Optimistic updates with rollback

### Utility Functions

- **getCachedTranslation**: Get translation with caching
- **getCachedTranslations**: Get multiple translations
- **warmUpTranslationCache**: Warm up cache
- **invalidateTranslationCache**: Invalidate cache entries
- **createCacheKey**: Create standardized cache keys
- **parseCacheKey**: Parse cache key components