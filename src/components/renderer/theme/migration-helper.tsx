/**
 * Theme Provider Migration Helper
 *
 * This module provides backward compatibility for legacy theme APIs
 * while transitioning to the new unified ThemeProvider.
 *
 * @deprecated This is a temporary helper for migration purposes.
 *            Please update your code to use the new unified ThemeProvider API.
 */

import React from "react";
import { useTheme as useNewTheme, ThemeProvider } from "./index";

// Legacy theme context types for backward compatibility
export interface LegacyThemeContextType {
  theme: any;
  setTheme: (theme: any) => void;
  toggleTheme: () => void;
  isDark: boolean;
  resolvedTheme: "light" | "dark";
}

// Legacy theme props for backward compatibility
export interface LegacyThemeProviderProps {
  children: React.ReactNode;
  theme?: any;
  attribute?: string;
  defaultTheme?: string;
  enableSystem?: boolean;
  disableTransitionOnChange?: boolean;
  storageKey?: string;
  themes?: Record<string, any>;
}

/**
 * Legacy Theme Provider Wrapper
 *
 * @deprecated Use the new ThemeProvider from @/components/renderer/theme instead
 */
export function LegacyThemeProvider({
  children,
  theme,
  attribute = "class",
  defaultTheme = "system",
  enableSystem = true,
  disableTransitionOnChange = false,
  storageKey = "theme",
  themes,
}: LegacyThemeProviderProps) {
  // Show warning in development
  if (process.env.NODE_ENV === "development") {
    console.warn(
      "LegacyThemeProvider is deprecated. Please use the new ThemeProvider from @/components/renderer/theme instead.",
      "See migration guide: docs/theme-system/migration-guide.md"
    );
  }

  return (
    <ThemeProvider
      defaultTheme={defaultTheme}
      enableSystem={enableSystem}
      disableTransitionOnChange={disableTransitionOnChange}
      storageKey={storageKey === "theme" ? "dop-theme-config" : storageKey}
      attribute={attribute === "class" ? "data-theme" : attribute as any}
      themes={themes as any || { light: {}, dark: {} }}
    >
      {children}
    </ThemeProvider>
  );
}

/**
 * Legacy useTheme Hook Wrapper
 *
 * Provides backward compatibility for the old useTheme API
 *
 * @deprecated Use the new useTheme hook from @/components/renderer/theme instead
 */
export function useLegacyTheme(): LegacyThemeContextType {
  const newTheme = useNewTheme() as any;

  // Map new API to legacy API
  const legacyTheme: LegacyThemeContextType = {
    theme: newTheme.theme,
    setTheme: (theme: any) => {
      console.warn(
        "setTheme is deprecated. Use setThemeByName or setMode instead.",
        "See migration guide: docs/theme-system/migration-guide.md"
      );
      // Try to extract theme name if possible
      if (theme?.colors) {
        newTheme.setThemeByName && newTheme.setThemeByName("custom");
      }
    },
    toggleTheme: () => {
      console.warn(
        "toggleTheme is deprecated. Use setMode instead.",
        "See migration guide: docs/theme-system/migration-guide.md"
      );
      // Use the new toggleTheme method if available
      newTheme.toggleTheme && newTheme.toggleTheme();
    },
    isDark: newTheme.isDark,
    resolvedTheme: newTheme.resolvedTheme,
  };

  return legacyTheme;
}

/**
 * Migration Helper Class
 *
 * Provides utilities to help migrate from old to new theme API
 */
export class ThemeMigrationHelper {
  /**
   * Maps legacy theme colors to new theme structure
   */
  static mapLegacyColors(legacyColors: Record<string, string>): Record<string, string> {
    const mappedColors: Record<string, string> = {};

    // Map common legacy color keys to new structure
    const colorMap: Record<string, string> = {
      'primary': 'primary-500',
      'secondary': 'secondary-500',
      'accent': 'primary-600',
      'background': 'bg-primary',
      'surface': 'bg-secondary',
      'text': 'text-primary',
      'textSecondary': 'text-secondary',
    };

    Object.entries(legacyColors).forEach(([key, value]) => {
      const newKey = colorMap[key] || key;
      mappedColors[newKey] = value;
    });

    return mappedColors;
  }

  /**
   * Converts legacy CSS classes to data attributes
   */
  static convertClassesToDataAttributes(classes: string[]): Record<string, string> {
    const attributes: Record<string, string> = {};

    classes.forEach(cls => {
      if (cls.startsWith('theme-')) {
        const themeName = cls.replace('theme-', '');
        attributes['data-theme'] = themeName;
      } else if (cls === 'dark') {
        attributes['data-color-scheme'] = 'dark';
      } else if (cls === 'light') {
        attributes['data-color-scheme'] = 'light';
      }
    });

    return attributes;
  }

  /**
   * Updates old localStorage theme data to new format
   */
  static migrateLocalStorage(): void {
    try {
      // Check for old theme data
      const oldTheme = localStorage.getItem('theme');
      const oldConfig = localStorage.getItem('theme-config');

      if (oldTheme && !localStorage.getItem('dop-theme-config')) {
        // Migrate simple theme value
        const newConfig = {
          currentTheme: oldTheme === 'dark' ? 'default' : oldTheme,
          userGroup: 'system',
          mode: oldTheme,
        };
        localStorage.setItem('dop-theme-config', JSON.stringify(newConfig));
        localStorage.removeItem('theme');
      }

      if (oldConfig && !localStorage.getItem('dop-theme-config')) {
        // Migrate complex theme config
        const parsedOld = JSON.parse(oldConfig);
        const newConfig = {
          currentTheme: parsedOld.currentTheme || 'default',
          userGroup: parsedOld.userGroup || 'system',
          mode: parsedOld.mode || 'light',
          customizations: parsedOld.customizations || {},
        };
        localStorage.setItem('dop-theme-config', JSON.stringify(newConfig));
        localStorage.removeItem('theme-config');
      }
    } catch (error) {
      console.error('Failed to migrate theme data:', error);
    }
  }

  /**
   * Validates if a theme object follows the new structure
   */
  static validateThemeStructure(theme: any): boolean {
    if (!theme || typeof theme !== 'object') {
      return false;
    }

    // Check for required new structure properties
    const hasColors = theme.colors && typeof theme.colors === 'object';
    const hasTypography = theme.typography && typeof theme.typography === 'object';
    const hasSpacing = theme.spacing && typeof theme.spacing === 'object';
    const hasBorderRadius = theme.borderRadius && typeof theme.borderRadius === 'object';
    const hasShadows = theme.shadows && typeof theme.shadows === 'object';

    return hasColors && hasTypography && hasSpacing && hasBorderRadius && hasShadows;
  }

  /**
   * Converts old theme structure to new format
   */
  static convertLegacyTheme(legacyTheme: any): any {
    const converted = {
      colors: {
        primary: {},
        secondary: {},
        gray: {},
        success: legacyTheme.colors?.success || '#10b981',
        warning: legacyTheme.colors?.warning || '#f59e0b',
        error: legacyTheme.colors?.error || '#ef4444',
        info: legacyTheme.colors?.info || '#3b82f6',
        background: {
          primary: legacyTheme.background || '#ffffff',
          secondary: legacyTheme.surface || '#f8fafc',
          tertiary: legacyTheme.card || '#ffffff',
          inverse: legacyTheme.inverse || '#111827',
        },
        text: {
          primary: legacyTheme.text || '#111827',
          secondary: legacyTheme.textSecondary || '#6b7280',
          tertiary: legacyTheme.textMuted || '#9ca3af',
          inverse: legacyTheme.textInverse || '#f9fafb',
          disabled: legacyTheme.textDisabled || '#d1d5db',
        },
        border: {
          primary: legacyTheme.border || '#e5e7eb',
          secondary: legacyTheme.borderSecondary || '#f3f4f6',
          focus: legacyTheme.focus || '#3b82f6',
          error: legacyTheme.errorBorder || '#ef4444',
        },
      },
      typography: {
        fontFamily: {
          sans: legacyTheme.fontFamily?.sans || ['Inter', 'system-ui', 'sans-serif'],
          serif: legacyTheme.fontFamily?.serif || ['Georgia', 'serif'],
          mono: legacyTheme.fontFamily?.mono || ['JetBrains Mono', 'monospace'],
        },
        fontSize: legacyTheme.fontSize || {
          xs: '0.75rem',
          sm: '0.875rem',
          base: '1rem',
          lg: '1.125rem',
          xl: '1.25rem',
          '2xl': '1.5rem',
          '3xl': '1.875rem',
          '4xl': '2.25rem',
          '5xl': '3rem',
          '6xl': '3.75rem',
        },
        fontWeight: legacyTheme.fontWeight || {
          thin: '100',
          light: '300',
          normal: '400',
          medium: '500',
          semibold: '600',
          bold: '700',
          extrabold: '800',
          black: '900',
        },
        lineHeight: legacyTheme.lineHeight || {
          tight: 1.25,
          snug: 1.375,
          normal: 1.5,
          relaxed: 1.625,
          loose: 1.75,
        },
      },
      spacing: legacyTheme.spacing || {
        xs: '0.25rem',
        sm: '0.5rem',
        md: '1rem',
        lg: '1.5rem',
        xl: '2rem',
        '2xl': '3rem',
        '3xl': '4rem',
        '4xl': '6rem',
        '5xl': '8rem',
        '6xl': '10rem',
      },
      borderRadius: legacyTheme.borderRadius || {
        none: '0',
        sm: '0.125rem',
        base: '0.25rem',
        md: '0.375rem',
        lg: '0.5rem',
        xl: '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
        full: '9999px',
      },
      shadows: legacyTheme.shadows || {
        sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      },
      animations: {
        duration: {
          fast: '150ms',
          normal: '300ms',
          slow: '500ms',
        },
        easing: {
          ease: 'ease',
          easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
          easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
          easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
        },
      },
    };

    // Copy over any custom color palettes
    if (legacyTheme.colors?.primary) {
      Object.entries(legacyTheme.colors.primary).forEach(([key, value]) => {
        (converted.colors.primary as any)[key] = value;
      });
    }
    if (legacyTheme.colors?.secondary) {
      Object.entries(legacyTheme.colors.secondary).forEach(([key, value]) => {
        (converted.colors.secondary as any)[key] = value;
      });
    }

    return converted;
  }

  /**
   * Clear old localStorage entries after successful migration
   */
  static clearOldStorage(): void {
    const oldKeys = [
      'theme',
      'theme-mode',
      'user-theme',
      'custom-theme',
      'theme-settings',
      'theme-preferences'
    ];

    oldKeys.forEach(key => {
      try {
        localStorage.removeItem(key);
      } catch (error) {
        console.warn(`Failed to remove ${key} from localStorage:`, error);
      }
    });
  }

  /**
   * Create a mapping of old component names to new ones for replacement suggestions
   */
  static createComponentReplacementMap(): Record<string, string> {
    return {
      // Old ThemeProvider patterns
      'ThemeProvider': 'ThemeProvider (from @/components/renderer/theme)',
      'useTheme': 'useTheme (from @/components/renderer/theme)',
      'ThemeProviderV1': 'ThemeProvider (from @/components/renderer/theme)',
      'ThemeProviderV2': 'ThemeProvider (from @/components/renderer/theme)',

      // Legacy theme contexts
      'ThemeContext': 'UnifiedThemeContext',
      'ThemeConfigContext': 'UnifiedThemeContext',

      // Legacy hooks
      'useThemeV1': 'useTheme (from @/components/renderer/theme)',
      'useThemeV2': 'useTheme (from @/components/renderer/theme)',
      'useDarkMode': 'useTheme (from @/components/renderer/theme)',
      'useColorMode': 'useTheme (from @/components/renderer/theme)',

      // Legacy utilities
      'getTheme': 'useTheme hook',
      'setTheme': 'useTheme().setThemeByName',
      'toggleTheme': 'useTheme().setMode',

      // Import paths
      '@/components/theme': '@/components/renderer/theme',
      '@/lib/theme': '@/components/renderer/theme',
      '@/hooks/use-theme': '@/components/renderer/theme/use-theme',
    };
  }
}

/**
 * One-time migration function to be called during app initialization
 */
export function initializeMigration() {
  // Run migration helper
  ThemeMigrationHelper.migrateLocalStorage();

  // Log migration completion
  if (process.env.NODE_ENV === 'development') {
    console.log(
      'Theme migration helper initialized. ' +
      'Please update your components to use the new ThemeProvider API. ' +
      'See migration guide for details.'
    );
  }
}

// Re-export for backward compatibility (explicit)
export {
  ThemeProvider,
  useTheme
} from "./index";