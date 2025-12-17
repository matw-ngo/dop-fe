import type { ThemeConfig } from "../types";

// Theme cache to store loaded themes
interface ThemeCache {
  [themeId: string]: {
    theme: ThemeConfig;
    loadTime: number;
    lastAccessed: number;
  };
}

// Global theme cache
const themeCache: ThemeCache = {};

// Cache configuration
const CACHE_MAX_AGE = 5 * 60 * 1000; // 5 minutes
const CACHE_MAX_SIZE = 20; // Maximum number of themes to cache
const PRELOAD_THEMES = ["default", "corporate"]; // Critical themes to preload

// Performance metrics
let cacheHits = 0;
let cacheMisses = 0;

// Get performance metrics
export function getThemeCacheMetrics() {
  return {
    cacheHits,
    cacheMisses,
    hitRate:
      cacheHits + cacheMisses > 0
        ? (cacheHits / (cacheHits + cacheMisses)) * 100
        : 0,
    cacheSize: Object.keys(themeCache).length,
    cacheMemorySize: new Blob([JSON.stringify(themeCache)]).size,
  };
}

// Clear old cache entries
function cleanupCache() {
  const now = Date.now();
  const entries = Object.entries(themeCache);

  // Sort by last accessed time
  entries.sort(([, a], [, b]) => a.lastAccessed - b.lastAccessed);

  // Remove oldest entries if cache is too large
  if (entries.length > CACHE_MAX_SIZE) {
    const toRemove = entries.slice(0, entries.length - CACHE_MAX_SIZE);
    toRemove.forEach(([key]) => delete themeCache[key]);
  }

  // Remove expired entries
  for (const [key, value] of entries) {
    if (now - value.loadTime > CACHE_MAX_AGE) {
      delete themeCache[key];
    }
  }
}

// Get theme from cache
function getCachedTheme(themeId: string): ThemeConfig | null {
  const cached = themeCache[themeId];

  if (!cached) {
    cacheMisses++;
    return null;
  }

  // Check if cache entry is still valid
  const now = Date.now();
  if (now - cached.loadTime > CACHE_MAX_AGE) {
    delete themeCache[themeId];
    cacheMisses++;
    return null;
  }

  // Update last accessed time
  cached.lastAccessed = now;
  cacheHits++;

  return cached.theme;
}

// Add theme to cache
function cacheTheme(theme: ThemeConfig) {
  const now = Date.now();
  themeCache[theme.id] = {
    theme,
    loadTime: now,
    lastAccessed: now,
  };

  cleanupCache();
}

// Lazy load a theme configuration
export async function loadTheme(themeId: string): Promise<ThemeConfig> {
  // Check cache first
  const cached = getCachedTheme(themeId);
  if (cached) {
    return cached;
  }

  // Validate theme ID
  if (!themeId || typeof themeId !== "string") {
    throw new Error("Invalid theme ID");
  }

  try {
    // Dynamic import of the theme module
    const themeModule = await import(`./themes/${themeId}.ts`);

    // Get the theme export (themes are exported as ${themeId}Theme)
    let theme: ThemeConfig | undefined;

    // Try different export names
    const possibleExports = [
      `${themeId}Theme`, // e.g., "corporate" -> corporateTheme
      themeId, // e.g., "corporate" -> corporate
      "theme",
      "defaultTheme",
    ];

    for (const exportName of possibleExports) {
      if (themeModule[exportName]) {
        theme = themeModule[exportName];
        break;
      }
    }

    // If not found in named exports, check default export
    if (!theme && themeModule.default) {
      theme = themeModule.default;
    }

    if (!theme) {
      throw new Error(`Theme configuration not found for: ${themeId}`);
    }

    // Validate theme structure
    if (!theme.id || !theme.name || !theme.colors) {
      throw new Error(`Invalid theme structure for: ${themeId}`);
    }

    // Cache the loaded theme
    cacheTheme(theme);

    return theme;
  } catch (error) {
    // Provide more helpful error messages
    if (error instanceof Error) {
      if (error.message.includes("Cannot find module")) {
        throw new Error(
          `Theme not found: ${themeId}. Available themes: corporate, creative, default, finance, medical`,
        );
      }
      throw new Error(`Failed to load theme "${themeId}": ${error.message}`);
    }
    throw new Error(`Unexpected error loading theme: ${themeId}`);
  }
}

// Preload critical themes
export async function preloadThemes(themeIds: string[] = PRELOAD_THEMES) {
  const promises = themeIds.map((id) =>
    loadTheme(id).catch((error) => {
      console.warn(`Failed to preload theme ${id}:`, error);
      return null;
    }),
  );

  const results = await Promise.allSettled(promises);
  const loaded = results.filter((r) => r.status === "fulfilled").length;
  const failed = results.filter((r) => r.status === "rejected").length;

  return {
    requested: themeIds.length,
    loaded,
    failed,
    themes: results.map((r) =>
      r.status === "fulfilled" && r.value ? (r.value as ThemeConfig).id : null,
    ),
  };
}

// Batch load multiple themes
export async function loadThemes(themeIds: string[]): Promise<ThemeConfig[]> {
  const uniqueIds = [...new Set(themeIds)]; // Remove duplicates

  // Try to get from cache first
  const cached: ThemeConfig[] = [];
  const toLoad: string[] = [];

  for (const id of uniqueIds) {
    const cachedTheme = getCachedTheme(id);
    if (cachedTheme) {
      cached.push(cachedTheme);
    } else {
      toLoad.push(id);
    }
  }

  // Load remaining themes in parallel
  const loadPromises = toLoad.map((id) => loadTheme(id));
  const loaded = await Promise.all(loadPromises);

  return [...cached, ...loaded];
}

// Get list of available theme IDs
export function getAvailableThemes(): string[] {
  return ["corporate", "creative", "default", "finance", "medical"];
}

// Check if a theme is cached
export function isThemeCached(themeId: string): boolean {
  return (
    themeId in themeCache &&
    Date.now() - themeCache[themeId].loadTime <= CACHE_MAX_AGE
  );
}

// Clear theme cache
export function clearThemeCache() {
  Object.keys(themeCache).forEach((key) => delete themeCache[key]);
  cacheHits = 0;
  cacheMisses = 0;
}

// Export cache metrics for debugging
export { themeCache };
