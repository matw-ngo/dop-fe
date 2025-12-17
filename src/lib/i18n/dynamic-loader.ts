/**
 * Dynamic Translation Loader
 *
 * A production-ready dynamic loader for on-demand translation loading with:
 * - Dynamic imports for code splitting
 * - React.cache() for memoization
 * - Performance monitoring integration
 * - Namespace-based loading
 * - Error handling with fallbacks
 * - Server and client-side support
 */

import { cache } from "react";
import {
  trackCacheHit,
  trackLoadTime,
  trackMissingKey,
  trackTranslationRequest,
} from "../translation-monitor";

// Type definitions
export type Locale = "en" | "vi";
export type Namespace = string;

export interface TranslationMessages {
  [key: string]: any;
}

export interface LoaderOptions {
  locale: Locale;
  namespace?: Namespace | Namespace[];
  fallbackLocale?: Locale;
  enableCache?: boolean;
}

export interface LoadResult {
  messages: TranslationMessages;
  locale: string;
  namespace?: string;
  loadTime: number;
  fromCache: boolean;
}

// Configuration
const SUPPORTED_LOCALES: Locale[] = ["en", "vi"];
const DEFAULT_LOCALE: Locale = "vi";
const DEFAULT_NAMESPACE = ""; // Use empty string for root level in flat structure
const COMMON_NAMESPACE = "common"; // For explicit common namespace requests
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// In-memory cache for loaded translations
const translationCache = new Map<
  string,
  {
    messages: TranslationMessages;
    timestamp: number;
    size: number;
  }
>();

// Cache statistics
let cacheHits = 0;
let cacheMisses = 0;

/**
 * Get cache key for a locale and namespace
 */
function getCacheKey(locale: string, namespace: string): string {
  return `${locale}:${namespace}`;
}

/**
 * Check if cache entry is still valid
 */
function isCacheValid(timestamp: number): boolean {
  return Date.now() - timestamp < CACHE_TTL;
}

/**
 * Clean up expired cache entries
 */
function cleanupCache(): void {
  const keysToDelete: string[] = [];
  translationCache.forEach((entry, key) => {
    if (!isCacheValid(entry.timestamp)) {
      keysToDelete.push(key);
    }
  });
  keysToDelete.forEach((key) => translationCache.delete(key));
}

/**
 * Load translation file dynamically with error handling
 *
 * Supports both namespace-based directory structure and flat file with nested namespaces
 */
async function loadTranslationFile(
  locale: string,
  namespace: string,
): Promise<TranslationMessages> {
  try {
    // First try: namespace-based directory structure (e.g., messages/common/vi.json)
    const module = await import(
      `../../../messages/${namespace}/${locale}.json`
    );
    return module.default;
  } catch (namespaceError) {
    try {
      // Second try: load from flat file and extract namespace
      const module = await import(`../../../messages/${locale}.json`);
      const allMessages = module.default;

      // Extract namespace from flat structure if it exists
      if (
        namespace &&
        namespace !== DEFAULT_NAMESPACE &&
        allMessages[namespace]
      ) {
        return allMessages[namespace];
      }

      // Return the entire file if no specific namespace is found or requesting default
      return allMessages;
    } catch (rootError) {
      // Third try: fallback to common namespace in directory structure
      try {
        const module = await import(`../../../messages/common/${locale}.json`);
        return module.default;
      } catch (commonError) {
        // Last resort: return empty object
        console.warn(
          `Failed to load translations for locale "${locale}" and namespace "${namespace}"`,
          {
            namespaceError,
            rootError,
            commonError,
          },
        );
        return {};
      }
    }
  }
}

/**
 * Load translations for a specific locale and namespace with caching
 */
export const loadTranslations = cache(
  async (
    locale: string,
    namespace: string = DEFAULT_NAMESPACE,
    options: {
      enableCache?: boolean;
      fallbackLocale?: Locale;
    } = {},
  ): Promise<LoadResult> => {
    const startTime = Date.now();
    const { enableCache = true, fallbackLocale = DEFAULT_LOCALE } = options;

    // Track translation request
    trackTranslationRequest(locale, namespace);

    // Check cache first
    const cacheKey = getCacheKey(locale, namespace);
    let fromCache = false;
    let messages: TranslationMessages = {};

    if (enableCache && translationCache.has(cacheKey)) {
      const cached = translationCache.get(cacheKey)!;
      if (isCacheValid(cached.timestamp)) {
        messages = cached.messages;
        fromCache = true;
        cacheHits++;
        trackCacheHit(namespace, locale, true);
      } else {
        translationCache.delete(cacheKey);
      }
    }

    // Load from disk if not in cache
    if (!fromCache) {
      cacheMisses++;
      trackCacheHit(namespace, locale, false);

      try {
        messages = await loadTranslationFile(locale, namespace);

        // Cache the result
        if (enableCache && Object.keys(messages).length > 0) {
          const size = JSON.stringify(messages).length;
          translationCache.set(cacheKey, {
            messages,
            timestamp: Date.now(),
            size,
          });
        }
      } catch (error) {
        console.error(
          `Failed to load translations for ${locale}:${namespace}`,
          error,
        );

        // Try fallback locale
        if (locale !== fallbackLocale) {
          return loadTranslations(fallbackLocale, namespace, options);
        }

        // Return empty object as last resort
        messages = {};
      }
    }

    const loadTime = Date.now() - startTime;

    // Track performance
    trackLoadTime(
      namespace,
      locale,
      loadTime,
      JSON.stringify(messages).length,
      typeof window !== "undefined" ? "client" : "server",
    );

    // Cleanup expired entries periodically
    if (cacheMisses % 10 === 0) {
      cleanupCache();
    }

    return {
      messages,
      locale,
      namespace,
      loadTime,
      fromCache,
    };
  },
);

/**
 * Load multiple namespaces for a locale
 */
export async function loadNamespaceTranslations(
  locale: string,
  namespaces: string[],
  options: {
    enableCache?: boolean;
    fallbackLocale?: Locale;
    parallel?: boolean;
    useFlatStructure?: boolean; // New option to optimize for flat file structure
  } = {},
): Promise<TranslationMessages> {
  const {
    enableCache = true,
    fallbackLocale = DEFAULT_LOCALE,
    parallel = true,
    useFlatStructure = false,
  } = options;

  // Optimization: if using flat structure, load the main file once and extract namespaces
  if (useFlatStructure) {
    try {
      // Load the main translation file once
      const mainMessages = await loadTranslationFile(locale, DEFAULT_NAMESPACE);
      const merged: TranslationMessages = {};

      // Extract all requested namespaces from the flat structure
      const namespaceKeys = namespaces.filter(
        (n) => n !== DEFAULT_NAMESPACE && n,
      );
      for (const namespace of namespaces) {
        if (!namespace || namespace === DEFAULT_NAMESPACE) {
          // For empty/default namespace, include all top-level keys that are not other namespaces
          for (const [key, value] of Object.entries(mainMessages)) {
            if (!namespaceKeys.includes(key)) {
              merged[key] = value;
            }
          }
        } else if (mainMessages[namespace]) {
          // For specific namespaces, extract them
          merged[namespace] = mainMessages[namespace];
        }
      }

      // If we found any translations, return them
      if (Object.keys(merged).length > 0) {
        return merged;
      }
    } catch (error) {
      console.error(
        "Failed to load from flat structure, falling back to individual loading",
        error,
      );
    }
  }

  if (parallel) {
    // Load all namespaces in parallel
    const results = await Promise.all(
      namespaces.map((namespace) =>
        loadTranslations(locale, namespace, { enableCache, fallbackLocale })
          .then((result) => result.messages)
          .catch(() => ({})),
      ),
    );

    // Merge all messages
    return results.reduce(
      (merged, messages) => ({
        ...merged,
        ...messages,
      }),
      {},
    );
  } else {
    // Load namespaces sequentially
    const merged: TranslationMessages = {};

    for (const namespace of namespaces) {
      try {
        const result = await loadTranslations(locale, namespace, {
          enableCache,
          fallbackLocale,
        });
        Object.assign(merged, result.messages);
      } catch (error) {
        console.error(`Failed to load namespace "${namespace}"`, error);
      }
    }

    return merged;
  }
}

/**
 * Preload translations for better performance
 */
export async function preloadTranslations(
  locale: string,
  namespaces: string[],
  options: { fallbackLocale?: Locale } = {},
): Promise<void> {
  const { fallbackLocale = DEFAULT_LOCALE } = options;

  // Load in background without blocking
  Promise.all(
    namespaces.map((namespace) =>
      loadTranslations(locale, namespace, {
        enableCache: true,
        fallbackLocale,
      }).catch((error) => {
        console.error(`Failed to preload ${namespace}:${locale}`, error);
      }),
    ),
  );
}

/**
 * Get cache statistics for monitoring
 */
export function getCacheStats() {
  return {
    hits: cacheHits,
    misses: cacheMisses,
    hitRate:
      cacheHits + cacheMisses > 0
        ? (cacheHits / (cacheHits + cacheMisses)) * 100
        : 0,
    size: translationCache.size,
    entries: Array.from(translationCache.entries()).map(([key, value]) => ({
      key,
      size: value.size,
      age: Date.now() - value.timestamp,
    })),
  };
}

/**
 * Clear the translation cache
 */
export function clearCache(): void {
  translationCache.clear();
  cacheHits = 0;
  cacheMisses = 0;
}

/**
 * Get supported locales
 */
export function getSupportedLocales(): Locale[] {
  return [...SUPPORTED_LOCALES];
}

/**
 * Check if a locale is supported
 */
export function isLocaleSupported(locale: string): locale is Locale {
  return SUPPORTED_LOCALES.includes(locale as Locale);
}

/**
 * Get the default locale
 */
export function getDefaultLocale(): Locale {
  return DEFAULT_LOCALE;
}

/**
 * Enhanced getRequestConfig for next-intl with dynamic loading
 */
export async function getDynamicRequestConfig({
  locale,
  namespaces = ["common"],
}: {
  locale: string;
  namespaces?: string[];
}) {
  // Validate locale
  if (!isLocaleSupported(locale)) {
    console.warn(
      `Unsupported locale "${locale}", falling back to "${DEFAULT_LOCALE}"`,
    );
    locale = DEFAULT_LOCALE;
  }

  // Load all required namespaces with flat structure optimization
  const messages = await loadNamespaceTranslations(locale, namespaces, {
    enableCache: true,
    fallbackLocale: DEFAULT_LOCALE,
    parallel: true,
    useFlatStructure: true, // Optimize for current flat file structure
  });

  return {
    locale,
    messages,
  };
}

/**
 * Default export for next-intl integration
 * This can be used directly in src/i18n/request.ts
 */
export default async function getRequestConfig({ locale }: { locale: string }) {
  return getDynamicRequestConfig({
    locale,
    namespaces: ["pages", "components"], // Default namespaces for the app
  });
}

/**
 * Client-side hook for dynamic translation loading
 * Note: This should be used sparingly - most translations should be loaded server-side
 */
export async function loadClientTranslations(
  locale: string,
  namespace: string,
): Promise<TranslationMessages> {
  if (typeof window === "undefined") {
    throw new Error(
      "loadClientTranslations can only be called on the client side",
    );
  }

  const result = await loadTranslations(locale, namespace, {
    enableCache: true,
    fallbackLocale: DEFAULT_LOCALE,
  });

  return result.messages;
}

/**
 * Batch load translations for multiple locales
 * Useful for admin interfaces or language switching
 */
export async function batchLoadTranslations(
  locales: Locale[],
  namespace: string,
): Promise<Record<Locale, TranslationMessages>> {
  const results = await Promise.all(
    locales.map(async (locale) => {
      try {
        const messages = await loadNamespaceTranslations(locale, [namespace]);
        return [locale, messages] as [Locale, TranslationMessages];
      } catch (error) {
        console.error(`Failed to batch load ${namespace}:${locale}`, error);
        return [locale, {}] as [Locale, TranslationMessages];
      }
    }),
  );

  const result: Record<Locale, TranslationMessages> = {} as Record<
    Locale,
    TranslationMessages
  >;
  results.forEach(([locale, messages]) => {
    result[locale] = messages;
  });
  return result;
}

/**
 * Validate translation structure
 * Ensures translation files have the expected structure
 */
export function validateTranslations(
  messages: TranslationMessages,
  namespace: string,
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!messages || typeof messages !== "object") {
    errors.push(`Invalid messages structure for namespace "${namespace}"`);
    return { valid: false, errors };
  }

  // Basic validation - can be extended with schema validation
  const validateNested = (obj: any, path: string = ""): void => {
    for (const [key, value] of Object.entries(obj)) {
      const currentPath = path ? `${path}.${key}` : key;

      if (value === null || value === undefined) {
        errors.push(`Null/undefined value at ${currentPath}`);
      } else if (typeof value === "object" && !Array.isArray(value)) {
        validateNested(value, currentPath);
      }
    }
  };

  validateNested(messages);

  return {
    valid: errors.length === 0,
    errors,
  };
}

// Export constants for external use
export { COMMON_NAMESPACE };

// Types are already exported inline at their definition
