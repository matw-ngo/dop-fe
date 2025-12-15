/**
 * Theme Hook Migration Utilities
 *
 * This file provides utilities to help developers transition from the old theme API
 * to the new unified theme system. It offers wrapper functions, type mappings, and
 * migration examples to make the transition smoother.
 *
 * OLD API: Simple string-based theme
 * ```ts
 * const { theme, setTheme } = useTheme(); // theme: string
 * ```
 *
 * NEW API: Comprehensive theme object
 * ```ts
 * const { theme, setTheme, isDark, resolvedTheme } = useTheme(); // theme: Theme object
 * ```
 */

import { useCallback } from "react";

// Dynamic import to avoid compilation issues with JSX
const useNewTheme = (() => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { useTheme } = require("./theme-provider");
    return useTheme;
  } catch (e) {
    // Fallback for development
    return () => ({
      theme: {
        colors: {},
        typography: {},
        spacing: {},
        borderRadius: {},
        shadows: {},
        animations: {},
        breakpoints: {},
        name: "light",
      },
      setTheme: () => {},
      toggleTheme: () => {},
      isDark: false,
      resolvedTheme: "light",
    });
  }
})();

// Type definitions (matching the actual types used in the project)
interface ThemeColors {
  primary?: Record<string, string>;
  secondary?: Record<string, string>;
  gray?: Record<string, string>;
  success?: string;
  warning?: string;
  error?: string;
  info?: string;
  background?: {
    primary?: string;
    secondary?: string;
    tertiary?: string;
    inverse?: string;
  };
  text?: {
    primary?: string;
    secondary?: string;
    tertiary?: string;
    inverse?: string;
    disabled?: string;
  };
  border?: {
    primary?: string;
    secondary?: string;
    focus?: string;
    error?: string;
  };
}

interface Theme {
  colors: ThemeColors;
  typography?: any;
  spacing?: any;
  borderRadius?: any;
  shadows?: any;
  animations?: any;
  breakpoints?: any;
  name?: string;
}

interface ThemeContextValue {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  isDark: boolean;
  resolvedTheme: "light" | "dark";
}

// Note: useNewTheme is already defined above with dynamic import

// ============================================================================
// TYPES FOR MIGRATION
// ============================================================================

/**
 * Old theme API response type (for reference)
 */
interface OldThemeContextValue {
  theme: string;
  setTheme: (theme: string) => void;
  defaultUserGroup?: string;
  storageKey?: string;
}

/**
 * Legacy theme names that might be used in old code
 */
type LegacyThemeName = 'default' | 'light' | 'dark' | 'medical' | 'banking' | string;

/**
 * Migration options for configuring behavior
 */
interface MigrationOptions {
  /** Show deprecation warnings in console */
  showWarnings?: boolean;
  /** Enable compatibility mode for gradual migration */
  enableCompatibilityMode?: boolean;
  /** Custom theme name mappings */
  themeNameMappings?: Record<string, string>;
}

// ============================================================================
// DEPRECATION WARNINGS
// ============================================================================

const hasWarned = new Set<string>();

const showDeprecationWarning = (methodName: string, suggestion: string) => {
  if (process.env.NODE_ENV === 'production' || hasWarned.has(methodName)) return;

  console.warn(
    `[THEME MIGRATION] ${methodName} is deprecated. ${suggestion}\n` +
    `See: /src/components/renderer/theme/hook-migration.ts for migration guide`
  );

  hasWarned.add(methodName);
};

// ============================================================================
// CORE MIGRATION UTILITIES
// ============================================================================

/**
 * Maps legacy theme names to new theme names
 */
const LEGACY_THEME_MAPPINGS: Record<string, string> = {
  'default': 'light',
  'system': 'light',
  'medical': 'light', // Legacy medical theme maps to light theme with custom colors
  'banking': 'dark',   // Legacy banking theme maps to dark theme with custom colors
};

/**
 * Transform old theme response format to new format
 *
 * @param newThemeResponse - Response from new useTheme hook
 * @param options - Migration options
 * @returns Formatted response matching old API shape
 *
 * @example
 * ```ts
 * // Instead of: const { theme, setTheme } = useOldTheme();
 * const legacyResponse = mapLegacyUseThemeResponse(useNewTheme());
 * // Returns { theme: 'light', setTheme: fn, ... }
 * ```
 */
export function mapLegacyUseThemeResponse(
  newThemeResponse: ThemeContextValue,
  options: MigrationOptions = {}
): OldThemeContextValue & Partial<ThemeContextValue> {
  const {
    theme,
    setTheme: setNewTheme,
    resolvedTheme,
  } = newThemeResponse;

  const { showWarnings = true } = options;

  if (showWarnings) {
    showDeprecationWarning(
      'mapLegacyUseThemeResponse',
      'Use the new useTheme() hook directly and update your components to use the theme object.'
    );
  }

  // Convert theme object to string (legacy format)
  const legacyThemeName = resolvedTheme || 'light';

  // Create legacy-compatible setTheme function
  const setLegacyTheme = useCallback((themeName: LegacyThemeName) => {
    // Map legacy theme names to new ones
    const mappedName = LEGACY_THEME_MAPPINGS[themeName] || themeName;

    // For now, we can't directly set by name with the new API
    // This is a limitation that encourages migration
    console.warn(
      `[THEME MIGRATION] Setting theme by name is deprecated. ` +
      `Please update your code to use the new theme system.`
    );
  }, []);

  return {
    theme: legacyThemeName,
    setTheme: setLegacyTheme,
    // Provide access to new API for gradual migration
    _newThemeObject: theme,
    _newSetTheme: setNewTheme,
    _isDark: resolvedTheme === 'dark',
  } as any;
}

/**
 * Migrates old theme configuration to new theme structure
 *
 * @param oldConfig - Old theme configuration
 * @param options - Migration options
 * @returns New theme configuration object
 *
 * @example
 * ```ts
 * // Old config format
 * const oldConfig = {
 *   mode: 'dark',
 *   primaryColor: '#2563eb',
 *   userGroup: 'medical'
 * };
 *
 * // New config format
 * const newConfig = migrateThemeConfig(oldConfig);
 * ```
 */
export function migrateThemeConfig(
  oldConfig: any,
  options: MigrationOptions = {}
): Partial<Theme> {
  const { showWarnings = true } = options;

  if (showWarnings) {
    showDeprecationWarning(
      'migrateThemeConfig',
      'Update your theme configuration to use the new Theme interface.'
    );
  }

  // Extract values from old config
  const { mode, primaryColor, colors, ...rest } = oldConfig;

  // Map to new theme structure
  const newConfig: Partial<Theme> = {
    name: mode || 'light',
    colors: {
      primary: colors?.primary || generateColorPalette(primaryColor || '#2563eb'),
      secondary: colors?.secondary || generateColorPalette('#64748b'),
      gray: colors?.gray || {
        50: '#f8fafc',
        100: '#f1f5f9',
        200: '#e2e8f0',
        300: '#cbd5e1',
        400: '#94a3b8',
        500: '#64748b',
        600: '#475569',
        700: '#334155',
        800: '#1e293b',
        900: '#0f172a',
        950: '#020617',
      },
      success: colors?.success || '#10b981',
      warning: colors?.warning || '#f59e0b',
      error: colors?.error || '#ef4444',
      info: colors?.info || '#3b82f6',
      background: {
        primary: mode === 'dark' ? '#0f172a' : '#ffffff',
        secondary: mode === 'dark' ? '#1e293b' : '#f8fafc',
        tertiary: mode === 'dark' ? '#334155' : '#f1f5f9',
        inverse: mode === 'dark' ? '#ffffff' : '#0f172a',
      },
      text: {
        primary: mode === 'dark' ? '#f8fafc' : '#0f172a',
        secondary: mode === 'dark' ? '#cbd5e1' : '#475569',
        tertiary: mode === 'dark' ? '#94a3b8' : '#64748b',
        inverse: mode === 'dark' ? '#0f172a' : '#f8fafc',
        disabled: mode === 'dark' ? '#475569' : '#cbd5e1',
      },
      border: {
        primary: mode === 'dark' ? '#334155' : '#e2e8f0',
        secondary: mode === 'dark' ? '#475569' : '#f1f5f9',
        focus: colors?.primary || '#3b82f6',
        error: colors?.error || '#ef4444',
      },
    },
    // Add other theme properties with defaults
    typography: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['Georgia', 'serif'],
        mono: ['JetBrains Mono', 'Consolas', 'monospace'],
      },
      fontSize: {
        xs: ['0.75rem', { lineHeight: '1rem' }],
        sm: ['0.875rem', { lineHeight: '1.25rem' }],
        base: ['1rem', { lineHeight: '1.5rem' }],
        lg: ['1.125rem', { lineHeight: '1.75rem' }],
        xl: ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        '5xl': ['3rem', { lineHeight: '1' }],
        '6xl': ['3.75rem', { lineHeight: '1' }],
      },
      fontWeight: {
        thin: 100,
        light: 300,
        normal: 400,
        medium: 500,
        semibold: 600,
        bold: 700,
        extrabold: 800,
        black: 900,
      },
    },
    spacing: {
      0: "0",
      px: "1px",
      0.5: "0.125rem",
      1: "0.25rem",
      1.5: "0.375rem",
      2: "0.5rem",
      2.5: "0.625rem",
      3: "0.75rem",
      3.5: "0.875rem",
      4: "1rem",
      5: "1.25rem",
      6: "1.5rem",
      7: "1.75rem",
      8: "2rem",
      9: "2.25rem",
      10: "2.5rem",
      11: "2.75rem",
      12: "3rem",
      14: "3.5rem",
      16: "4rem",
      20: "5rem",
      24: "6rem",
      28: "7rem",
      32: "8rem",
      36: "9rem",
      40: "10rem",
      44: "11rem",
      48: "12rem",
      52: "13rem",
      56: "14rem",
      60: "15rem",
      64: "16rem",
      72: "18rem",
      80: "20rem",
      96: "24rem",
    },
    borderRadius: {
      none: "0",
      sm: "0.125rem",
      DEFAULT: "0.25rem",
      md: "0.375rem",
      lg: "0.5rem",
      xl: "0.75rem",
      "2xl": "1rem",
      "3xl": "1.5rem",
      full: "9999px",
    },
    shadows: {
      sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
      DEFAULT: "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
      md: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
      lg: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
      xl: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
      "2xl": "0 25px 50px -12px rgb(0 0 0 / 0.25)",
      inner: "inset 0 2px 4px 0 rgb(0 0 0 / 0.05)",
      none: "none",
    },
    animations: {
      duration: {
        75: "75ms",
        100: "100ms",
        150: "150ms",
        200: "200ms",
        300: "300ms",
        500: "500ms",
        700: "700ms",
        1000: "1000ms",
      },
      easing: {
        linear: "linear",
        in: "cubic-bezier(0.4, 0, 1, 1)",
        out: "cubic-bezier(0, 0, 0.2, 1)",
        "in-out": "cubic-bezier(0.4, 0, 0.2, 1)",
        "bounce-in": "cubic-bezier(0.68, -0.55, 0.265, 1.55)",
        smooth: "cubic-bezier(0.25, 0.1, 0.25, 1)",
      },
    },
    breakpoints: {
      sm: "640px",
      md: "768px",
      lg: "1024px",
      xl: "1280px",
      "2xl": "1536px",
    },
  };

  return newConfig;
}

/**
 * Creates a legacy wrapper around the new theme hook
 *
 * @param options - Migration options
 * @returns Hook that matches old API but uses new implementation
 *
 * @example
 * ```ts
 * // In your component during migration:
 * const useLegacyTheme = createLegacyWrapper({ showWarnings: true });
 * const { theme, setTheme } = useLegacyTheme();
 *
 * // Then gradually update to:
 * const { theme, setTheme, isDark } = useTheme();
 * ```
 */
export function createLegacyWrapper(options: MigrationOptions = {}) {
  const { showWarnings = true, enableCompatibilityMode = true } = options;

  return function useLegacyTheme(): OldThemeContextValue & {
    /** Access to new theme object for gradual migration */
    _newThemeObject?: Theme;
    /** Access to new isDark flag */
    _isDark?: boolean;
  } {
    // Use the new theme hook
    const newThemeResponse = useNewTheme();

    // Transform to legacy format
    return mapLegacyUseThemeResponse(newThemeResponse, { showWarnings });
  };
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Generates a color palette from a base color
 * This is a simplified version - in production, use a proper color generation library
 */
function generateColorPalette(baseColor: string): Theme['colors']['primary'] {
  // This is a placeholder - in production, use a library like 'chroma-js' or 'color-string'
  return {
    50: lighten(baseColor, 0.95),
    100: lighten(baseColor, 0.9),
    200: lighten(baseColor, 0.8),
    300: lighten(baseColor, 0.7),
    400: lighten(baseColor, 0.6),
    500: baseColor,
    600: darken(baseColor, 0.1),
    700: darken(baseColor, 0.2),
    800: darken(baseColor, 0.3),
    900: darken(baseColor, 0.4),
    950: darken(baseColor, 0.5),
  };
}

/**
 * Simple color lightening function (placeholder)
 */
function lighten(color: string, amount: number): string {
  // In production, use a proper color manipulation library
  return `hsl(210, 50%, ${95 * amount}%)`;
}

/**
 * Simple color darkening function (placeholder)
 */
function darken(color: string, amount: number): string {
  // In production, use a proper color manipulation library
  return `hsl(210, 50%, ${50 * (1 - amount)}%)`;
}

// ============================================================================
// MIGRATION EXAMPLES
// ============================================================================

/**
 * Example 1: Migrating a simple theme toggle
 *
 * OLD CODE:
 * ```ts
 * function ThemeToggle() {
 *   const { theme, setTheme } = useTheme();
 *   return (
 *     <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
 *       Toggle Theme
 *     </button>
 *   );
 * }
 * ```
 *
 * NEW CODE:
 * ```ts
 * function ThemeToggle() {
 *   const { theme, isDark, toggleTheme } = useTheme();
 *   return (
 *     <button onClick={toggleTheme}>
 *       Current: {isDark ? 'Dark' : 'Light'}
 *     </button>
 *   );
 * }
 * ```
 */

/**
 * Example 2: Migrating theme-aware styles
 *
 * OLD CODE:
 * ```ts
 * function Header() {
 *   const { theme } = useTheme();
 *   const isDark = theme === 'dark';
 *
 *   const style = {
 *     backgroundColor: isDark ? '#1a1a1a' : '#ffffff',
 *     color: isDark ? '#ffffff' : '#000000',
 *   };
 *
 *   return <header style={style}>Header</header>;
 * }
 * ```
 *
 * NEW CODE:
 * ```ts
 * function Header() {
 *   const { theme } = useTheme();
 *   const styles = {
 *     backgroundColor: theme.colors.background.primary,
 *     color: theme.colors.text.primary,
 *   };
 *
 *   return <header style={styles}>Header</header>;
 * }
 * ```
 */

/**
 * Example 3: Migrating with useThemeUtils for better performance
 *
 * NEW CODE (OPTIMIZED):
 * ```ts
 * function Header() {
 *   const { styles, isDark } = useThemeUtils();
 *
 *   return (
 *     <header style={styles.bgPrimary}>
 *       <h1 style={styles.textPrimary}>Header</h1>
 *     </header>
 *   );
 * }
 * ```
 */

/**
 * Example 4: Gradual migration strategy
 *
 * STEP 1 - Add legacy wrapper:
 * ```ts
 * const useTheme = createLegacyWrapper({ showWarnings: true });
 * // Your existing code continues to work but shows warnings
 * ```
 *
 * STEP 2 - Update components one by one:
 * ```ts
 * // Replace imports gradually
 * import { useTheme } from './new-theme-path';
 * // Update component to use new API
 * ```
 *
 * STEP 3 - Remove legacy wrapper:
 * ```ts
 * // Once all components are migrated, remove the wrapper
 * const useTheme = useNewTheme; // Direct usage
 * ```
 */

// ============================================================================
// EXPORTS
// ============================================================================

// Export types separately
export type { OldThemeContextValue, LegacyThemeName, MigrationOptions };