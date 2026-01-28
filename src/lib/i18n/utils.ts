/**
 * Translation utilities
 *
 * Helper functions for common translation operations
 */

import type { Namespace, TranslationMessages } from "./dynamic-loader";

/**
 * Deep merge translation messages
 */
export function mergeTranslations(
  ...translations: TranslationMessages[]
): TranslationMessages {
  return translations.reduce((merged, current) => {
    return deepMerge(merged, current);
  }, {});
}

/**
 * Deep merge two objects recursively
 */
function deepMerge(target: any, source: any): any {
  if (source === null || source === undefined) {
    return target;
  }

  if (target === null || target === undefined) {
    return source;
  }

  if (typeof source !== "object" || typeof target !== "object") {
    return source;
  }

  const result = { ...target };

  for (const key in source) {
    if (Object.hasOwn(source, key)) {
      if (typeof source[key] === "object" && !Array.isArray(source[key])) {
        result[key] = deepMerge(result[key], source[key]);
      } else {
        result[key] = source[key];
      }
    }
  }

  return result;
}

/**
 * Flatten nested translation keys
 * Example: { user: { name: 'Name' } } => { 'user.name': 'Name' }
 */
export function flattenTranslations(
  messages: TranslationMessages,
  prefix = "",
): Record<string, string> {
  const flattened: Record<string, string> = {};

  for (const [key, value] of Object.entries(messages)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;

    if (typeof value === "object" && value !== null && !Array.isArray(value)) {
      Object.assign(flattened, flattenTranslations(value, fullKey));
    } else {
      flattened[fullKey] = String(value);
    }
  }

  return flattened;
}

/**
 * Get translation value by key path
 * Supports dot notation: 'user.profile.name'
 */
export function getTranslationByKey(
  messages: TranslationMessages,
  keyPath: string,
  fallback?: string,
): string | undefined {
  const keys = keyPath.split(".");
  let current: any = messages;

  for (const key of keys) {
    if (
      current === null ||
      current === undefined ||
      typeof current !== "object"
    ) {
      return fallback;
    }

    if (!Object.hasOwn(current, key)) {
      return fallback;
    }

    current = current[key];
  }

  return typeof current === "string" ? current : fallback;
}

/**
 * Check if translation key exists
 */
export function hasTranslationKey(
  messages: TranslationMessages,
  keyPath: string,
): boolean {
  return getTranslationByKey(messages, keyPath) !== undefined;
}

/**
 * Find missing translation keys
 * Compare template with actual translations
 */
export function findMissingKeys(
  template: TranslationMessages,
  translations: TranslationMessages,
  path = "",
): string[] {
  const missing: string[] = [];

  for (const [key, value] of Object.entries(template)) {
    const currentPath = path ? `${path}.${key}` : key;

    if (typeof value === "object" && value !== null && !Array.isArray(value)) {
      if (!translations[key] || typeof translations[key] !== "object") {
        missing.push(currentPath);
      } else {
        missing.push(
          ...findMissingKeys(value, translations[key] || {}, currentPath),
        );
      }
    } else {
      if (!Object.hasOwn(translations, key)) {
        missing.push(currentPath);
      }
    }
  }

  return missing;
}

/**
 * Extract namespace from key path
 * Example: 'common.buttons.save' => 'common'
 */
export function extractNamespace(
  keyPath: string,
  defaultNs = "common",
): Namespace {
  const firstDot = keyPath.indexOf(".");
  return firstDot > 0 ? keyPath.substring(0, firstDot) : defaultNs;
}

/**
 * Extract key without namespace
 * Example: 'common.buttons.save' => 'buttons.save'
 */
export function extractKey(keyPath: string): string {
  const firstDot = keyPath.indexOf(".");
  return firstDot > 0 ? keyPath.substring(firstDot + 1) : keyPath;
}

/**
 * Format translation value with parameters
 * Simple template string replacement
 */
export function formatTranslation(
  template: string,
  params: Record<string, string | number> = {},
): string {
  return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    return params[key]?.toString() || match;
  });
}

/**
 * Create a translation key resolver
 * Returns a function that resolves keys with fallback
 */
export function createKeyResolver(
  messages: TranslationMessages,
  fallbackMessages?: TranslationMessages,
) {
  return (key: string, params?: Record<string, string | number>): string => {
    const value =
      getTranslationByKey(messages, key) ||
      (fallbackMessages && getTranslationByKey(fallbackMessages, key)) ||
      key;

    return params ? formatTranslation(value, params) : value;
  };
}

/**
 * Validate translation completeness
 */
export function validateTranslationCompleteness(
  primary: TranslationMessages,
  fallback: TranslationMessages,
  options: {
    ignoreKeys?: string[];
    strict?: boolean;
  } = {},
): {
  isComplete: boolean;
  missingKeys: string[];
  extraKeys: string[];
  totalKeys: number;
  translatedKeys: number;
  completionPercentage: number;
} {
  const { ignoreKeys = [], strict = false } = options;

  const _primaryFlat = flattenTranslations(primary);
  const fallbackFlat = flattenTranslations(fallback);

  const missingKeys = findMissingKeys(fallback, primary).filter(
    (key) => !ignoreKeys.some((ignored) => key.startsWith(ignored)),
  );

  const extraKeys = strict
    ? findMissingKeys(primary, fallback).filter(
        (key) => !ignoreKeys.some((ignored) => key.startsWith(ignored)),
      )
    : [];

  const totalKeys = Object.keys(fallbackFlat).length;
  const translatedKeys = totalKeys - missingKeys.length;
  const completionPercentage =
    totalKeys > 0 ? (translatedKeys / totalKeys) * 100 : 100;

  return {
    isComplete: missingKeys.length === 0,
    missingKeys,
    extraKeys,
    totalKeys,
    translatedKeys,
    completionPercentage,
  };
}

/**
 * Generate translation statistics
 */
export function generateTranslationStats(
  messages: TranslationMessages,
  _namespace?: string,
): {
  totalKeys: number;
  totalCharacters: number;
  averageKeyLength: number;
  keysByDepth: Record<number, number>;
  largestKeys: Array<{ key: string; length: number }>;
} {
  const flattened = flattenTranslations(messages);
  const keys = Object.keys(flattened);
  const values = Object.values(flattened);

  const keysByDepth: Record<number, number> = {};
  const largestKeys: Array<{ key: string; length: number }> = [];

  for (const key of keys) {
    const depth = key.split(".").length;
    keysByDepth[depth] = (keysByDepth[depth] || 0) + 1;

    const length = flattened[key].length;
    largestKeys.push({ key, length });
  }

  largestKeys.sort((a, b) => b.length - a.length);
  largestKeys.splice(10); // Keep only top 10

  const totalCharacters = values.reduce((sum, value) => sum + value.length, 0);

  return {
    totalKeys: keys.length,
    totalCharacters,
    averageKeyLength: keys.length > 0 ? totalCharacters / keys.length : 0,
    keysByDepth,
    largestKeys,
  };
}

/**
 * Sanitize translation key for safe usage
 */
export function sanitizeKey(key: string): string {
  return key.replace(/[^a-zA-Z0-9._-]/g, "");
}

/**
 * Split translation key into parts
 */
export function parseKey(key: string): {
  namespace?: string;
  path: string[];
  fullKey: string;
} {
  const parts = key.split(".");
  return {
    namespace: parts.length > 1 ? parts[0] : undefined,
    path: parts,
    fullKey: key,
  };
}

/**
 * Create translation key from parts
 */
export function createKey(parts: string[]): string {
  return parts.filter(Boolean).join(".");
}

/**
 * Interpolate values into translation string
 * Enhanced version supporting arrays and nested objects
 */
export function interpolate(
  template: string,
  values: Record<string, any> = {},
): string {
  // Handle simple {{key}} interpolation
  let result = template.replace(/\{\{([^}]+)\}\}/g, (match, key) => {
    const value = getNestedValue(values, key.trim());
    return value !== undefined ? String(value) : match;
  });

  // Handle conditional blocks {{#if condition}}...{{/if}}
  result = result.replace(
    /\{\{#if\s+([^}]+)\}\}([\s\S]*?)\{\{\/if\}\}/g,
    (_match, condition, content) => {
      const value = getNestedValue(values, condition.trim());
      return value ? content : "";
    },
  );

  // Handle loops {{#each items}}...{{/each}}
  result = result.replace(
    /\{\{#each\s+([^}]+)\}\}([\s\S]*?)\{\{\/each\}\}/g,
    (_match, arrayKey, content) => {
      const array = getNestedValue(values, arrayKey.trim());
      if (!Array.isArray(array)) return "";

      return array
        .map((item, index) => {
          let itemContent = content;

          // Replace {{this}} with item
          itemContent = itemContent.replace(/\{\{this\}\}/g, String(item));

          // Replace {{@index}} with index
          itemContent = itemContent.replace(/\{\{@index\}\}/g, String(index));

          // Replace item properties if item is an object
          if (typeof item === "object" && item !== null) {
            Object.keys(item).forEach((prop) => {
              const regex = new RegExp(`\\{\\{${prop}\\}\\}`, "g");
              itemContent = itemContent.replace(regex, String(item[prop]));
            });
          }

          return itemContent;
        })
        .join("");
    },
  );

  return result;
}

/**
 * Get nested value from object using dot notation
 */
function getNestedValue(obj: any, path: string): any {
  return path.split(".").reduce((current, key) => {
    return current && current[key] !== undefined ? current[key] : undefined;
  }, obj);
}
