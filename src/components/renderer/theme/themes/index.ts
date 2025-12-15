import type { ThemeConfig } from "../types";
import {
  loadTheme,
  loadThemes,
  preloadThemes,
  getAvailableThemes,
  isThemeCached,
  getThemeCacheMetrics,
  clearThemeCache
} from "../lazy-loader";

// Lazy load theme function
export const getTheme = loadTheme;

// Batch load themes
export { loadThemes };

// Preload critical themes
export { preloadThemes };

// Get available theme list
export { getAvailableThemes };

// Check if theme is cached
export { isThemeCached };

// Get cache metrics for debugging
export { getThemeCacheMetrics };

// Clear cache
export { clearThemeCache };

// Type for theme getter function
export type ThemeGetter = typeof getTheme;

// Legacy exports for backward compatibility (deprecated)
// These still use lazy loading under the hood
export async function getCorporateTheme(): Promise<ThemeConfig> {
  return loadTheme('corporate');
}

export async function getCreativeTheme(): Promise<ThemeConfig> {
  return loadTheme('creative');
}

export async function getDefaultTheme(): Promise<ThemeConfig> {
  return loadTheme('default');
}

export async function getFinanceTheme(): Promise<ThemeConfig> {
  return loadTheme('finance');
}

export async function getMedicalTheme(): Promise<ThemeConfig> {
  return loadTheme('medical');
}

// Theme metadata (lightweight, can be loaded synchronously)
export interface ThemeMetadata {
  id: string;
  name: string;
  description?: string;
  group: string;
  preview?: {
    light: string;
    dark: string;
  };
}

// Lightweight theme metadata for immediate access
export const themeMetadata: Record<string, ThemeMetadata> = {
  corporate: {
    id: 'corporate',
    name: 'Corporate',
    description: 'Professional business theme',
    group: 'business',
    preview: {
      light: '#0f172a',
      dark: '#f8fafc',
    },
  },
  creative: {
    id: 'creative',
    name: 'Creative',
    description: 'Vibrant artistic theme',
    group: 'creative',
    preview: {
      light: '#7c3aed',
      dark: '#c4b5fd',
    },
  },
  default: {
    id: 'default',
    name: 'Default',
    description: 'Default system theme',
    group: 'system',
    preview: {
      light: '#0ea5e9',
      dark: '#38bdf8',
    },
  },
  finance: {
    id: 'finance',
    name: 'Finance',
    description: 'Professional finance theme',
    group: 'business',
    preview: {
      light: '#059669',
      dark: '#34d399',
    },
  },
  medical: {
    id: 'medical',
    name: 'Medical',
    description: 'Clean medical theme',
    group: 'medical',
    preview: {
      light: '#dc2626',
      dark: '#f87171',
    },
  },
};

// Get theme metadata without loading the full theme
export function getThemeMetadata(themeId: string): ThemeMetadata | null {
  return themeMetadata[themeId] || null;
}

// Get all theme metadata
export function getAllThemeMetadata(): ThemeMetadata[] {
  return Object.values(themeMetadata);
}

// Search themes by metadata
export function searchThemes(query: string): ThemeMetadata[] {
  const lowerQuery = query.toLowerCase();
  return getAllThemeMetadata().filter(theme =>
    theme.name.toLowerCase().includes(lowerQuery) ||
    theme.description?.toLowerCase().includes(lowerQuery) ||
    theme.group.toLowerCase().includes(lowerQuery)
  );
}

// Group themes by category
export function getThemesByGroup(): Record<string, ThemeMetadata[]> {
  const groups: Record<string, ThemeMetadata[]> = {};

  for (const theme of getAllThemeMetadata()) {
    if (!groups[theme.group]) {
      groups[theme.group] = [];
    }
    groups[theme.group].push(theme);
  }

  return groups;
}

// Initialize theme preloading (call this early in app startup)
export function initializeThemes() {
  // Preload critical themes in the background
  preloadThemes().catch(error => {
    console.warn('Failed to preload themes:', error);
  });
}

// Export theme type for convenience
export type { ThemeConfig };
