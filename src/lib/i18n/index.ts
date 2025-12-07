/**
 * Internationalization (i18n) Module
 *
 * This module provides comprehensive internationalization support including:
 * - Dynamic translation loading
 * - Performance monitoring
 * - Client-side hooks
 * - Translation utilities
 */

// Core dynamic loader
export {
  // Main functions
  loadTranslations,
  loadNamespaceTranslations,
  preloadTranslations,
  batchLoadTranslations,

  // Configuration
  getDynamicRequestConfig,
  getDefaultLocale,
  getSupportedLocales,
  isLocaleSupported,

  // Cache management
  getCacheStats,
  clearCache,

  // Validation
  validateTranslations,

  // Client-side loading
  loadClientTranslations,

  // Types
  type Locale,
  type Namespace,
  type TranslationMessages,
  type LoaderOptions,
  type LoadResult,

  // Default export for next-intl
  default as getRequestConfig
} from './dynamic-loader';

// React hooks
export {
  useDynamicTranslations,
  useMultipleNamespaces,
  usePreloadTranslations,
  useConditionalTranslations,
  useLazyTranslations,
  useTranslationMetrics
} from './use-dynamic-translations';

// Utilities
export {
  mergeTranslations,
  flattenTranslations,
  getTranslationByKey,
  hasTranslationKey,
  findMissingKeys,
  extractNamespace,
  extractKey,
  formatTranslation,
  createKeyResolver,
  validateTranslationCompleteness,
  generateTranslationStats,
  sanitizeKey,
  parseKey,
  createKey,
  interpolate
} from './utils';

// Re-export monitoring system
export {
  trackLoadTime,
  trackCacheHit,
  trackTranslationRequest,
  trackMissingKey,
  getMetrics,
  getMetricsSummary,
  resetMetrics,
  setMonitoringEnabled,
  isMonitoringEnabled,
  initTranslationMonitor,
  ServerTranslationMonitor
} from '@/lib/translation-monitor';

// Server-side monitoring
export {
  trackServerLoadTime
} from '@/lib/server-translation-monitor';