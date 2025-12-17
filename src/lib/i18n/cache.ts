/**
 * Translation Cache System
 *
 * A comprehensive caching system for translations with:
 * - LRU (Least Recently Used) eviction policy
 * - TTL (Time To Live) support
 * - Client and server-side compatibility
 * - Namespace-based caching
 * - Cache statistics and monitoring
 * - Preloading and warming capabilities
 * - Persistent cache for important entries
 */

// Type definitions
export interface CacheOptions {
  ttl?: number; // Time to live in milliseconds
  priority?: "low" | "medium" | "high";
  persistent?: boolean; // Should persist across sessions
  namespace?: string;
}

export interface CacheEntry<T> {
  value: T;
  timestamp: number;
  ttl: number;
  priority: "low" | "medium" | "high";
  namespace: string;
  accessCount: number;
  lastAccessed: number;
  persistent: boolean;
}

export interface CacheStats {
  size: number;
  maxSize: number;
  hits: number;
  misses: number;
  hitRate: number;
  evictions: number;
  memoryUsage: number;
  entriesByPriority: {
    low: number;
    medium: number;
    high: number;
  };
  entriesByNamespace: Record<string, number>;
}

export interface CacheConfig {
  maxSize?: number; // Maximum number of entries
  defaultTTL?: number; // Default TTL in milliseconds
  cleanupInterval?: number; // Cleanup interval in milliseconds
  persistKey?: string; // Key for persistent storage
  enableStats?: boolean;
  enablePersistence?: boolean;
}

// LRU Node for doubly-linked list
class LRUNode<T> {
  constructor(
    public key: string,
    public entry: CacheEntry<T>,
    public prev: LRUNode<T> | null = null,
    public next: LRUNode<T> | null = null,
  ) {}
}

// Main Cache Implementation
export class TranslationCache<T = any> {
  private cache = new Map<string, LRUNode<T>>();
  private head: LRUNode<T> | null = null;
  private tail: LRUNode<T> | null = null;
  private maxSize: number;
  private defaultTTL: number;
  private cleanupInterval: number;
  private persistKey: string;
  private enableStats: boolean;
  private enablePersistence: boolean;
  private cleanupTimer: NodeJS.Timeout | null = null;
  private stats: CacheStats = {
    size: 0,
    maxSize: 0,
    hits: 0,
    misses: 0,
    hitRate: 0,
    evictions: 0,
    memoryUsage: 0,
    entriesByPriority: { low: 0, medium: 0, high: 0 },
    entriesByNamespace: {},
  };

  constructor(config: CacheConfig = {}) {
    this.maxSize = config.maxSize || 1000;
    this.defaultTTL = config.defaultTTL || 5 * 60 * 1000; // 5 minutes
    this.cleanupInterval = config.cleanupInterval || 60 * 1000; // 1 minute
    this.persistKey = config.persistKey || "translation-cache";
    this.enableStats = config.enableStats !== false;
    this.enablePersistence = config.enablePersistence !== false;

    this.stats.maxSize = this.maxSize;

    // Load persistent cache if enabled
    if (this.enablePersistence && this.isClientSide()) {
      this.loadFromStorage();
    }

    // Start cleanup interval
    this.startCleanup();
  }

  /**
   * Get value from cache
   */
  get(key: string): T | null {
    const node = this.cache.get(key);

    if (!node) {
      if (this.enableStats) {
        this.stats.misses++;
        this.updateHitRate();
      }
      return null;
    }

    // Check if expired
    if (this.isExpired(node.entry)) {
      this.delete(key);
      if (this.enableStats) {
        this.stats.misses++;
        this.updateHitRate();
      }
      return null;
    }

    // Update access information
    node.entry.accessCount++;
    node.entry.lastAccessed = Date.now();

    // Move to front (most recently used)
    this.moveToFront(node);

    if (this.enableStats) {
      this.stats.hits++;
      this.updateHitRate();
    }

    return node.entry.value;
  }

  /**
   * Set value in cache with options
   */
  set(key: string, value: T, options: CacheOptions = {}): void {
    const now = Date.now();
    const ttl = options.ttl || this.defaultTTL;

    const entry: CacheEntry<T> = {
      value,
      timestamp: now,
      ttl,
      priority: options.priority || "medium",
      namespace: options.namespace || "default",
      accessCount: 1,
      lastAccessed: now,
      persistent: options.persistent || false,
    };

    // Check if key already exists
    const existingNode = this.cache.get(key);
    if (existingNode) {
      // Update existing entry
      this.updateStatsOnDelete(existingNode.entry);
      existingNode.entry = entry;
      this.moveToFront(existingNode);
      this.updateStatsOnAdd(entry);
      return;
    }

    // Create new node
    const node = new LRUNode(key, entry);

    // Add to front
    this.addToFront(node);

    // Check if eviction is needed
    while (this.cache.size > this.maxSize) {
      // Try LRU eviction first (as it's the primary strategy)
      if (!this.evictLRU()) {
        // If no LRU eviction happened (all entries are persistent), break
        break;
      }
    }

    // Update stats
    if (this.enableStats) {
      this.updateStatsOnAdd(entry);
    }

    // Persist if needed
    if (entry.persistent && this.enablePersistence && this.isClientSide()) {
      this.saveToStorage();
    }
  }

  /**
   * Check if key exists in cache
   */
  has(key: string): boolean {
    const node = this.cache.get(key);
    if (!node) return false;

    if (this.isExpired(node.entry)) {
      this.delete(key);
      return false;
    }

    // Update access time
    node.entry.lastAccessed = Date.now();
    node.entry.accessCount++;

    return true;
  }

  /**
   * Delete entry from cache
   */
  delete(key: string): boolean {
    const node = this.cache.get(key);
    if (!node) return false;

    this.updateStatsOnDelete(node.entry);
    this.removeNode(node);
    this.cache.delete(key);

    // Update persistent storage if needed
    if (
      node.entry.persistent &&
      this.enablePersistence &&
      this.isClientSide()
    ) {
      this.saveToStorage();
    }

    return true;
  }

  /**
   * Clear all entries from cache
   */
  clear(): void {
    // Clear stats
    if (this.enableStats) {
      this.stats = {
        ...this.stats,
        size: 0,
        entriesByPriority: { low: 0, medium: 0, high: 0 },
        entriesByNamespace: {},
      };
    }

    // Clear cache
    this.cache.clear();
    this.head = null;
    this.tail = null;

    // Clear persistent storage
    if (this.enablePersistence && this.isClientSide()) {
      this.clearStorage();
    }
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    this.updateMemoryUsage();
    return { ...this.stats };
  }

  /**
   * Preload multiple entries into cache
   */
  async preload(
    entries: Array<{ key: string; value: T; options?: CacheOptions }>,
  ): Promise<void> {
    for (const { key, value, options } of entries) {
      this.set(key, value, options);
    }
  }

  /**
   * Warm up cache with commonly used translations
   */
  async warmUp(
    locale: string,
    commonKeys: string[],
    getValue: (key: string) => Promise<T>,
  ): Promise<void> {
    const promises = commonKeys.map(async (key) => {
      const cacheKey = `${locale}:${key}`;
      if (!this.has(cacheKey)) {
        try {
          const value = await getValue(key);
          this.set(cacheKey, value, {
            namespace: "common",
            priority: "high",
            ttl: 30 * 60 * 1000, // 30 minutes for common keys
            persistent: true,
          });
        } catch (error) {
          console.warn(`Failed to warm up cache for key: ${key}`, error);
        }
      }
    });

    await Promise.allSettled(promises);
  }

  /**
   * Invalidate cache by namespace
   */
  invalidateByNamespace(namespace: string): number {
    let count = 0;
    const keysToDelete: string[] = [];

    for (const [key, node] of this.cache.entries()) {
      if (node.entry.namespace === namespace) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach((key) => {
      if (this.delete(key)) count++;
    });

    return count;
  }

  /**
   * Destroy cache instance
   */
  destroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }
    this.clear();
  }

  // Private methods

  private isClientSide(): boolean {
    return typeof window !== "undefined" && typeof localStorage !== "undefined";
  }

  private isExpired(entry: CacheEntry<T>): boolean {
    return Date.now() - entry.timestamp > entry.ttl;
  }

  private moveToFront(node: LRUNode<T>): void {
    this.removeNode(node);
    this.addToFront(node);
  }

  private addToFront(node: LRUNode<T>): void {
    node.prev = null;
    node.next = this.head;

    if (this.head) {
      this.head.prev = node;
    }

    this.head = node;

    if (!this.tail) {
      this.tail = node;
    }

    this.cache.set(node.key, node);
  }

  private removeNode(node: LRUNode<T>): void {
    if (node.prev) {
      node.prev.next = node.next;
    } else {
      this.head = node.next;
    }

    if (node.next) {
      node.next.prev = node.prev;
    } else {
      this.tail = node.prev;
    }
  }

  private evictLRU(): boolean {
    if (!this.tail) return false;

    // Don't evict persistent entries - find the first non-persistent from the tail
    let current = this.tail;
    while (current && current.entry.persistent) {
      current = current.prev;
    }

    if (current) {
      this.delete(current.key);
      if (this.enableStats) {
        this.stats.evictions++;
      }
      return true;
    }

    return false;
  }

  private evictByPriority(): boolean {
    const priorities: Array<"low" | "medium" | "high"> = ["low", "medium"];

    for (const priority of priorities) {
      for (const [key, node] of this.cache.entries()) {
        if (node.entry.priority === priority && !node.entry.persistent) {
          this.delete(key);
          if (this.enableStats) {
            this.stats.evictions++;
          }
          return true;
        }
      }
    }

    return false;
  }

  private startCleanup(): void {
    if (this.cleanupInterval > 0) {
      this.cleanupTimer = setInterval(() => {
        this.cleanup();
      }, this.cleanupInterval);
    }
  }

  private cleanup(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];

    for (const [key, node] of this.cache.entries()) {
      if (this.isExpired(node.entry) && !node.entry.persistent) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach((key) => this.delete(key));
  }

  private updateStatsOnAdd(entry: CacheEntry<T>): void {
    if (!this.enableStats) return;

    this.stats.size = this.cache.size;
    this.stats.entriesByPriority[entry.priority]++;
    this.stats.entriesByNamespace[entry.namespace] =
      (this.stats.entriesByNamespace[entry.namespace] || 0) + 1;
  }

  private updateStatsOnDelete(entry: CacheEntry<T>): void {
    if (!this.enableStats) return;

    this.stats.size = this.cache.size - 1;
    this.stats.entriesByPriority[entry.priority]--;
    this.stats.entriesByNamespace[entry.namespace] = Math.max(
      0,
      (this.stats.entriesByNamespace[entry.namespace] || 0) - 1,
    );
  }

  private updateHitRate(): void {
    const total = this.stats.hits + this.stats.misses;
    this.stats.hitRate = total > 0 ? this.stats.hits / total : 0;
  }

  private updateMemoryUsage(): void {
    if (!this.enableStats) return;

    let totalSize = 0;
    for (const node of this.cache.values()) {
      // Rough estimation of memory usage
      totalSize += JSON.stringify(node.entry.value).length * 2; // UTF-16
      totalSize += 200; // Overhead for entry metadata
    }
    this.stats.memoryUsage = totalSize;
  }

  // Storage methods for client-side persistence

  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(this.persistKey);
      if (stored) {
        const data = JSON.parse(stored);
        for (const [key, entry] of Object.entries(data)) {
          const cacheEntry = entry as CacheEntry<T>;
          // Only load if still valid and marked as persistent
          if (cacheEntry.persistent && !this.isExpired(cacheEntry)) {
            // Directly set the entry without going through set() to avoid recursion
            const node = new LRUNode(key, cacheEntry);
            this.addToFront(node);
            this.updateStatsOnAdd(cacheEntry);
          }
        }
      }
    } catch (error) {
      console.warn("Failed to load cache from storage:", error);
    }
  }

  private saveToStorage(): void {
    try {
      const persistentData: Record<string, CacheEntry<T>> = {};
      for (const [key, node] of this.cache.entries()) {
        if (node.entry.persistent) {
          persistentData[key] = node.entry;
        }
      }
      localStorage.setItem(this.persistKey, JSON.stringify(persistentData));
    } catch (error) {
      console.warn("Failed to save cache to storage:", error);
    }
  }

  private clearStorage(): void {
    try {
      localStorage.removeItem(this.persistKey);
    } catch (error) {
      console.warn("Failed to clear cache from storage:", error);
    }
  }
}

// Cache instance factory with predefined configurations
export class CacheFactory {
  private static instances = new Map<string, TranslationCache>();

  static getInstance(
    name: string = "default",
    config?: CacheConfig,
  ): TranslationCache {
    if (!CacheFactory.instances.has(name)) {
      // Predefined configurations for different use cases
      const defaultConfigs: Record<string, CacheConfig> = {
        translations: {
          maxSize: 500,
          defaultTTL: 10 * 60 * 1000, // 10 minutes
          cleanupInterval: 2 * 60 * 1000, // 2 minutes
          persistKey: "i18n-translations",
          enableStats: true,
          enablePersistence: true,
        },
        common: {
          maxSize: 200,
          defaultTTL: 30 * 60 * 1000, // 30 minutes
          cleanupInterval: 5 * 60 * 1000, // 5 minutes
          persistKey: "i18n-common",
          enableStats: true,
          enablePersistence: true,
        },
        admin: {
          maxSize: 100,
          defaultTTL: 2 * 60 * 1000, // 2 minutes
          cleanupInterval: 30 * 1000, // 30 seconds
          persistKey: "i18n-admin",
          enableStats: true,
          enablePersistence: false, // No persistence for admin
        },
        temporary: {
          maxSize: 50,
          defaultTTL: 30 * 1000, // 30 seconds
          cleanupInterval: 10 * 1000, // 10 seconds
          enableStats: false,
          enablePersistence: false,
        },
      };

      const finalConfig = { ...defaultConfigs[name], ...config };
      const instance = new TranslationCache(finalConfig);
      CacheFactory.instances.set(name, instance);
    }

    return CacheFactory.instances.get(name)!;
  }

  static destroyInstance(name: string): void {
    const instance = CacheFactory.instances.get(name);
    if (instance) {
      instance.destroy();
      CacheFactory.instances.delete(name);
    }
  }

  static destroyAll(): void {
    for (const [name, instance] of CacheFactory.instances.entries()) {
      instance.destroy();
    }
    CacheFactory.instances.clear();
  }
}

// Export singleton instances for common use cases
export const translationCache = CacheFactory.getInstance("translations");
export const commonCache = CacheFactory.getInstance("common");
export const adminCache = CacheFactory.getInstance("admin");

// Utility functions
export function createCacheKey(
  locale: string,
  namespace: string,
  key: string,
): string {
  return `${locale}:${namespace}:${key}`;
}

export function parseCacheKey(cacheKey: string): {
  locale: string;
  namespace: string;
  key: string;
} {
  const parts = cacheKey.split(":");
  return {
    locale: parts[0] || "unknown",
    namespace: parts[1] || "default",
    key: parts.slice(2).join(":") || "unknown",
  };
}

// Export types for external use
export type { CacheEntry, CacheOptions, CacheStats, CacheConfig };
