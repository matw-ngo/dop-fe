/**
 * Translation Loader for Split Files
 *
 * This loader handles the new namespace-based file structure:
 * messages/[locale]/
 *   ├── features/
 *   │   ├── insurance/
 *   │   ├── credit-cards/
 *   │   ├── tools/
 *   │   └── admin/
 *   ├── pages/
 *   └── common/
 */

import { getRequestConfig } from "next-intl/server";
import { cache } from "react";
import fs from 'fs';
import path from 'path';

const MESSAGES_DIR = path.join(process.cwd(), 'messages');
const DEFAULT_LOCALE = 'vi';

// Cache for loaded translations
const translationCache = new Map<string, any>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes


function getFromCache(key: string): any | null {
  const entry = translationCache.get(key);
  if (!entry) return null;

  if (Date.now() - entry.timestamp > CACHE_TTL) {
    translationCache.delete(key);
    return null;
  }

  return entry.data;
}

function setCache(key: string, data: any): void {
  translationCache.set(key, {
    data,
    timestamp: Date.now()
  });
}

/**
 * Load a specific namespace file
 */
async function loadNamespaceFile(locale: string, filePath: string): Promise<any> {
  const cacheKey = `${locale}:${filePath}`;
  const cached = getFromCache(cacheKey);
  if (cached) return cached;

  try {
    const fullPath = path.join(MESSAGES_DIR, locale, filePath);
    if (!fs.existsSync(fullPath)) return {};

    const content = fs.readFileSync(fullPath, 'utf-8');
    const translations = JSON.parse(content);

    setCache(cacheKey, translations);
    return translations;
  } catch (error) {
    console.error(`Failed to load ${filePath} for ${locale}:`, error);
    return {};
  }
}

/**
 * Load all features for a locale
 */
async function loadFeatures(locale: string): Promise<any> {
  const featuresDir = path.join(MESSAGES_DIR, locale, 'features');
  if (!fs.existsSync(featuresDir)) return {};

  const features: any = {};
  const featureDirs = fs.readdirSync(featuresDir, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);

  for (const feature of featureDirs) {
    const featureDir = path.join(featuresDir, feature);
    const featureFiles = fs.readdirSync(featureDir)
      .filter(f => f.endsWith('.json'));

    features[feature] = {};
    for (const file of featureFiles) {
      const content = await loadNamespaceFile(locale, `features/${feature}/${file}`);
      const fileName = file.replace('.json', '');
      features[feature][fileName] = content;
    }
  }

  return features;
}

/**
 * Load all pages for a locale
 */
async function loadPages(locale: string): Promise<any> {
  const pagesDir = path.join(MESSAGES_DIR, locale, 'pages');
  if (!fs.existsSync(pagesDir)) return {};

  const pages: any = {};
  const pageFiles = fs.readdirSync(pagesDir)
    .filter(f => f.endsWith('.json'));

  for (const file of pageFiles) {
    const content = await loadNamespaceFile(locale, `pages/${file}`);
    const fileName = file.replace('.json', '');
    pages[fileName] = content;
  }

  return pages;
}

/**
 * Load all common translations for a locale
 */
async function loadCommon(locale: string): Promise<any> {
  const commonDir = path.join(MESSAGES_DIR, locale, 'common');
  if (!fs.existsSync(commonDir)) return {};

  const common: any = {};
  const commonFiles = fs.readdirSync(commonDir)
    .filter(f => f.endsWith('.json'));

  for (const file of commonFiles) {
    const content = await loadNamespaceFile(locale, `common/${file}`);
    const fileName = file.replace('.json', '');
    common[fileName] = content;
  }

  return common;
}

/**
 * Main loader function that loads all translations for a locale
 */
const loadAllTranslations = cache(async (locale: string) => {
  // Try to load from split structure
  const features = await loadFeatures(locale);
  const pages = await loadPages(locale);
  const common = await loadCommon(locale);

  // If we have split files, return them with proper structure
  if (Object.keys(features).length > 0 || Object.keys(pages).length > 0 || Object.keys(common).length > 0) {
    // Create a merged structure for next-intl
    const merged: any = {
      ...common,
      ...pages,
      // Flatten features for easier access
      ...Object.entries(features).reduce((acc, [feature, files]) => ({
        ...acc,
        ...Object.entries(files).reduce((innerAcc, [file, content]) => {
          const key = file === 'main' ? feature : `${feature}.${file}`;
          return { ...innerAcc, [key]: content };
        }, {} as Record<string, any>)
      }), {})
    };

    // Log what we loaded for debugging
    if (process.env.NODE_ENV === 'development') {
      console.log(`📚 Loaded ${locale} translations:`, {
        features: Object.keys(features).length,
        pages: Object.keys(pages).length,
        common: Object.keys(common).length,
        totalKeys: Object.keys(merged).length
      });
    }

    return merged;
  }

  // Fallback to original flat file structure
  const filePath = path.join(MESSAGES_DIR, `${locale}.json`);
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const translations = JSON.parse(content);

    if (process.env.NODE_ENV === 'development') {
      console.log(`📚 Loaded ${locale} from flat file:`, {
        totalKeys: Object.keys(translations).length
      });
    }

    return translations;
  }

  // If nothing found, return empty object
  console.warn(`⚠️ No translations found for locale: ${locale}`);
  return {};
});

/**
 * Create next-intl request configuration
 */
export default getRequestConfig(async ({ locale }) => {
  // Ensure locale is valid
  if (!locale) {
    locale = DEFAULT_LOCALE;
  }

  // Load all translations
  const messages = await loadAllTranslations(locale);

  return {
    messages,
    locale,
    defaultTranslationValues: {
      // Provide fallback for missing keys
      keyNotTranslated: locale
    }
  };
});

/**
 * Export utilities for manual loading
 */
export async function getTranslations(locale: string, namespace?: string) {
  const allTranslations = await loadAllTranslations(locale);

  if (!namespace) {
    return allTranslations;
  }

  // Return specific namespace if requested
  const parts = namespace.split('.');
  let current = allTranslations;

  for (const part of parts) {
    if (current[part]) {
      current = current[part];
    } else {
      return {};
    }
  }

  return current;
}

/**
 * Clear the translation cache
 */
export function clearCache() {
  translationCache.clear();
}