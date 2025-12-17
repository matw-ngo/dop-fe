/**
 * Internationalization (i18n) Module
 *
 * This module provides comprehensive internationalization support including:
 * - Dynamic translation loading
 * - Performance monitoring
 * - Client-side hooks
 * - Translation utilities
 */

// Server-side monitoring
export { trackServerLoadTime } from "@/lib/server-translation-monitor";
// Re-export monitoring system
export {
  getMetrics,
  getMetricsSummary,
  initTranslationMonitor,
  isMonitoringEnabled,
  resetMetrics,
  ServerTranslationMonitor,
  setMonitoringEnabled,
  trackCacheHit,
  trackLoadTime,
  trackMissingKey,
  trackTranslationRequest,
} from "@/lib/translation-monitor";
// Core dynamic loader
export {
  batchLoadTranslations,
  clearCache,
  // Default export for next-intl
  default as getRequestConfig,
  // Cache management
  getCacheStats,
  getDefaultLocale,
  // Configuration
  getDynamicRequestConfig,
  getSupportedLocales,
  isLocaleSupported,
  type LoaderOptions,
  type LoadResult,
  // Types
  type Locale,
  // Client-side loading
  loadClientTranslations,
  loadNamespaceTranslations,
  // Main functions
  loadTranslations,
  type Namespace,
  preloadTranslations,
  type TranslationMessages,
  // Validation
  validateTranslations,
} from "./dynamic-loader";
// React hooks
export {
  useConditionalTranslations,
  useDynamicTranslations,
  useLazyTranslations,
  useMultipleNamespaces,
  usePreloadTranslations,
  useTranslationMetrics,
} from "./use-dynamic-translations";
// Utilities
export {
  createKey,
  createKeyResolver,
  extractKey,
  extractNamespace,
  findMissingKeys,
  flattenTranslations,
  formatTranslation,
  generateTranslationStats,
  getTranslationByKey,
  hasTranslationKey,
  interpolate,
  mergeTranslations,
  parseKey,
  sanitizeKey,
  validateTranslationCompleteness,
} from "./utils";
