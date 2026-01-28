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

import fs from "node:fs";
import path from "node:path";
import { getRequestConfig } from "next-intl/server";
import { cache } from "react";

const MESSAGES_DIR = path.join(process.cwd(), "messages");
const DEFAULT_LOCALE = "vi";

// Cache for loaded translations
const translationCache = new Map<string, any>();
// const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const CACHE_TTL = 0;

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
    timestamp: Date.now(),
  });
}

/**
 * Load a specific namespace file
 */
async function loadNamespaceFile(
  locale: string,
  filePath: string,
): Promise<any> {
  const cacheKey = `${locale}:${filePath}`;
  const cached = getFromCache(cacheKey);
  if (cached) return cached;

  try {
    const fullPath = path.join(MESSAGES_DIR, locale, filePath);
    if (!fs.existsSync(fullPath)) return {};

    const content = fs.readFileSync(fullPath, "utf-8");
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
  const featuresDir = path.join(MESSAGES_DIR, locale, "features");
  if (!fs.existsSync(featuresDir)) return {};

  const features: any = {};
  const featureDirs = fs
    .readdirSync(featuresDir, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name);

  for (const feature of featureDirs) {
    const featureDir = path.join(featuresDir, feature);
    const featureFiles = fs
      .readdirSync(featureDir)
      .filter((f) => f.endsWith(".json"));

    features[feature] = {};
    for (const file of featureFiles) {
      const content = await loadNamespaceFile(
        locale,
        `features/${feature}/${file}`,
      );
      const fileName = file.replace(".json", "");
      features[feature][fileName] = content;
    }
  }

  return features;
}

/**
 * Load all pages for a locale
 */
async function loadPages(locale: string): Promise<any> {
  const pagesDir = path.join(MESSAGES_DIR, locale, "pages");
  if (!fs.existsSync(pagesDir)) return {};

  const pages: any = {};
  const pageFiles = fs.readdirSync(pagesDir).filter((f) => f.endsWith(".json"));

  for (const file of pageFiles) {
    const content = await loadNamespaceFile(locale, `pages/${file}`);
    const fileName = file.replace(".json", "");
    pages[fileName] = content;
  }

  return pages;
}

/**
 * Load all common translations for a locale
 */
async function loadCommon(locale: string): Promise<any> {
  const commonDir = path.join(MESSAGES_DIR, locale, "common");
  if (!fs.existsSync(commonDir)) return {};

  const common: any = {};
  const commonFiles = fs
    .readdirSync(commonDir)
    .filter((f) => f.endsWith(".json"));

  for (const file of commonFiles) {
    const content = await loadNamespaceFile(locale, `common/${file}`);
    const fileName = file.replace(".json", "");

    // For loan-purposes and phone-validation, flatten the structure
    // Instead of common["loan-purposes"] = { "loanPurposes": {...} }
    // We want common["loanPurposes"] = {...}
    if (fileName === "loan-purposes" && content.loanPurposes) {
      common.loanPurposes = content.loanPurposes;
      if (content.loanPurposeDescriptions) {
        common.loanPurposeDescriptions = content.loanPurposeDescriptions;
      }
      if (content.defaultPurpose) {
        common.defaultPurpose = content.defaultPurpose;
      }
      if (content.defaultDescription) {
        common.defaultDescription = content.defaultDescription;
      }
    } else if (fileName === "phone-validation" && content.phoneValidation) {
      common.phoneValidation = content.phoneValidation;
    } else {
      // Default behavior for other files
      common[fileName] = content;
    }
  }

  return common;
}

/**
 * Load all components translations for a locale
 */
async function loadComponents(locale: string): Promise<any> {
  const componentsDir = path.join(MESSAGES_DIR, locale, "components");
  if (!fs.existsSync(componentsDir)) return {};

  const components: any = {};

  // Read both files and directories
  const entries = fs.readdirSync(componentsDir, { withFileTypes: true });

  // Process direct .json files
  const componentFiles = entries
    .filter((entry) => entry.isFile() && entry.name.endsWith(".json"))
    .map((entry) => entry.name);

  for (const file of componentFiles) {
    const content = await loadNamespaceFile(locale, `components/${file}`);
    const fileName = file.replace(".json", "");
    components[fileName] = content;
  }

  // Process subdirectories (like layout/, home/)
  const componentDirs = entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name);

  for (const dir of componentDirs) {
    const dirPath = path.join(componentsDir, dir);
    const dirFiles = fs.readdirSync(dirPath).filter((f) => f.endsWith(".json"));

    components[dir] = {};
    for (const file of dirFiles) {
      const content = await loadNamespaceFile(
        locale,
        `components/${dir}/${file}`,
      );
      const fileName = file.replace(".json", "");
      components[dir][fileName] = content;
    }
  }

  if (process.env.NODE_ENV === "development") {
    // console.log("🔍 Components structure loaded:", {
    //   topLevelKeys: Object.keys(components),
    //   layout: components.layout ? Object.keys(components.layout) : "missing",
    //   home: components.home ? Object.keys(components.home) : "missing",
    //   layoutHeaderSample: components.layout?.header?.nav
    //     ? "nav exists"
    //     : "nav missing",
    // });
  }

  return components;
}

/**
 * Load all forms translations for a locale
 */
async function loadForms(locale: string): Promise<any> {
  const formsDir = path.join(MESSAGES_DIR, locale, "forms");
  if (!fs.existsSync(formsDir)) return {};

  const forms: any = {};
  const formFiles = fs.readdirSync(formsDir).filter((f) => f.endsWith(".json"));

  for (const file of formFiles) {
    const content = await loadNamespaceFile(locale, `forms/${file}`);
    const fileName = file.replace(".json", "");

    if (fileName === "main") {
      // For main.json, flatten the structure into the root of forms
      Object.assign(forms, content);
    } else {
      forms[fileName] = content;
    }
  }

  return forms;
}

/**
 * Load all tenant translations for a locale
 */
async function loadTenantTranslations(locale: string): Promise<any> {
  const tenantsDir = path.join(MESSAGES_DIR, locale, "tenants");
  if (!fs.existsSync(tenantsDir)) return {};

  const tenants: any = {};

  // Get all tenant directories
  const tenantDirs = fs
    .readdirSync(tenantsDir, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name);

  for (const tenantId of tenantDirs) {
    const tenantDir = path.join(tenantsDir, tenantId);
    const tenantFiles = fs
      .readdirSync(tenantDir)
      .filter((f) => f.endsWith(".json"));

    tenants[tenantId] = {};
    for (const file of tenantFiles) {
      const content = await loadNamespaceFile(
        locale,
        `tenants/${tenantId}/${file}`,
      );
      const fileName = file.replace(".json", "");
      tenants[tenantId][fileName] = content;
    }
  }

  return tenants;
}

/**
 * Main loader function that loads all translations for a locale
 */
const loadAllTranslations = cache(async (locale: string) => {
  // Try to load from split structure
  const features = await loadFeatures(locale);
  const pages = await loadPages(locale);
  const common = await loadCommon(locale);
  const components = await loadComponents(locale);
  const forms = await loadForms(locale);
  const tenants = await loadTenantTranslations(locale);

  // If we have split files, return them with proper structure
  if (
    Object.keys(features).length > 0 ||
    Object.keys(pages).length > 0 ||
    Object.keys(common).length > 0 ||
    Object.keys(components).length > 0 ||
    Object.keys(forms).length > 0 ||
    Object.keys(tenants).length > 0
  ) {
    // Create a merged structure for next-intl
    const merged: any = {
      ...common,
      pages,
      components,
      forms,
      tenants,

      // Properly nest features
      features: Object.entries(features).reduce(
        (acc, [feature, files]) => {
          const typedFiles = files as Record<string, any>;
          // Create nested structure for features
          if (typedFiles.main && Object.keys(typedFiles).length === 1) {
            // If only main.json exists, put content directly under feature
            return { ...acc, [feature]: typedFiles.main };
          } else {
            // Otherwise, create nested structure with feature as parent
            return { ...acc, [feature]: typedFiles };
          }
        },
        {} as Record<string, any>,
      ),
    };

    // Log what we loaded for debugging
    if (process.env.NODE_ENV === "development") {
      // Prepare feature details with sample keys
      const _featureDetails = Object.entries(features).map(
        ([featureName, files]) => {
          const typedFiles = files as Record<string, any>;
          const fileNames = Object.keys(typedFiles);
          const sampleKeys: string[] = [];

          fileNames.forEach((fileName) => {
            const keys = Object.keys(typedFiles[fileName] || {});
            if (keys.length > 0) {
              sampleKeys.push(
                `${fileName}: ${keys.slice(0, 3).join(", ")}${keys.length > 3 ? "..." : ""}`,
              );
            }
          });

          return {
            name: featureName,
            files: fileNames,
            sampleKeys: sampleKeys.length > 0 ? sampleKeys : ["No keys"],
          };
        },
      );

      // Prepare page details with sample keys
      const _pageDetails = Object.entries(pages).map(([pageName, content]) => {
        const keys = Object.keys(content || {});
        return {
          name: pageName,
          sampleKeys: keys.length > 0 ? keys.slice(0, 5).join(", ") : "No keys",
        };
      });

      // Prepare common details with sample keys
      const _commonDetails = Object.entries(common).map(
        ([commonName, content]) => {
          const keys = Object.keys(content || {});
          return {
            name: commonName,
            sampleKeys:
              keys.length > 0 ? keys.slice(0, 5).join(", ") : "No keys",
          };
        },
      );

      // Prepare components details with sample keys
      const _componentsDetails = Object.entries(components).map(
        ([componentName, content]) => {
          const keys = Object.keys(content || {});
          return {
            name: componentName,
            sampleKeys:
              keys.length > 0 ? keys.slice(0, 5).join(", ") : "No keys",
          };
        },
      );

      // console.log(`📚 Loaded ${locale} translations:`, {
      //   summary: {
      //     features: Object.keys(features).length,
      //     pages: Object.keys(pages).length,
      //     common: Object.keys(common).length,
      //     components: Object.keys(components).length,
      //     forms: Object.keys(forms).length,
      //     tenants: Object.keys(tenants).length,
      //     totalKeys: Object.keys(merged).length,
      //   },
      //   features: featureDetails,
      //   pages: pageDetails,
      //   common: commonDetails,
      //   components: componentsDetails,
      // });

      // Log the actual merged structure for debugging
      const _loanApp = merged.features?.["loan-application"];
      // console.log(`🔍 Merged structure for ${locale}:`, {
      //   topLevelKeys: Object.keys(merged),
      //   featuresKeys: Object.keys(merged.features || {}),
      //   loanApplicationStructure: merged.features?.["loan-application"],
      //   loanApplicationKeys: Object.keys(loanApp || {}),
      //   hasLoanApplication: !!loanApp,
      //   sampleLoanApplicationKeys: loanApp
      //     ? {
      //         title: loanApp.title,
      //         expectedAmountLabel: loanApp.expectedAmount?.label,
      //         loanPeriodLabel: loanApp.loanPeriod?.label,
      //         loanPeriodPlaceholder: loanApp.loanPeriod?.placeholder,
      //         otpContinue: loanApp.otp?.continue,
      //       }
      //     : null,
      //   commonKeys: Object.keys(merged.common || {}),
      //   componentsKeys: Object.keys(merged.components || {}),
      // });
    }

    return merged;
  }

  // Fallback to original flat file structure
  const filePath = path.join(MESSAGES_DIR, `${locale}.json`);
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, "utf-8");
    const translations = JSON.parse(content);

    if (process.env.NODE_ENV === "development") {
      // console.log(`📚 Loaded ${locale} from flat file:`, {
      //   totalKeys: Object.keys(translations).length,
      // });
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
      keyNotTranslated: locale,
    },
  };
});

/**
 * Export utilities for manual loading
 */
export { loadAllTranslations };
export async function getTranslations(locale: string, namespace?: string) {
  const allTranslations = await loadAllTranslations(locale);

  if (!namespace) {
    return allTranslations;
  }

  // Return specific namespace if requested
  const parts = namespace.split(".");
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
