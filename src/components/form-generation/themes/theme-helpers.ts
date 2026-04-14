/**
 * Form Generation Library - Theme Helper Utilities
 *
 * Utility functions for working with themes
 */

import type { FormTheme } from "./types";

/**
 * Merges two themes, with the second theme overriding the first
 * Useful for creating theme variants
 *
 * @example
 * ```typescript
 * const darkVariant = mergeThemes(finzoneTheme, {
 *   name: 'finzone-dark',
 *   colors: {
 *     ...finzoneTheme.colors,
 *     background: '#1a1a1a',
 *     textPrimary: '#ffffff',
 *   }
 * });
 * ```
 */
export function mergeThemes(
  baseTheme: FormTheme,
  overrides: Partial<FormTheme>,
): FormTheme {
  return {
    ...baseTheme,
    ...overrides,
    colors: {
      ...baseTheme.colors,
      ...overrides.colors,
    },
    borderRadius: {
      ...baseTheme.borderRadius,
      ...overrides.borderRadius,
    },
    spacing: {
      ...baseTheme.spacing,
      ...overrides.spacing,
    },
    typography: {
      ...baseTheme.typography,
      ...overrides.typography,
    },
    sizes: {
      ...baseTheme.sizes,
      ...overrides.sizes,
    },
    focusRing: {
      ...baseTheme.focusRing,
      ...overrides.focusRing,
    },
    fieldOptions: {
      ...baseTheme.fieldOptions,
      ...overrides.fieldOptions,
    },
    components: {
      ...baseTheme.components,
      ...overrides.components,
    },
  };
}

/**
 * Creates a dark variant of a theme
 * Automatically adjusts colors for dark mode
 *
 * @example
 * ```typescript
 * const finzoneDark = createDarkVariant(finzoneTheme);
 * ```
 */
export function createDarkVariant(theme: FormTheme): FormTheme {
  return mergeThemes(theme, {
    name: `${theme.name}-dark`,
    colors: {
      ...theme.colors,
      background: "#1a1a1a",
      textPrimary: "#f5f5f5",
      textSecondary: "#a3a3a3",
      disabled: "#2a2a2a",
      readOnly: "#252525",
      border: "#404040",
    },
  });
}

/**
 * Validates if a color string is valid
 * Supports hex, rgb, rgba, hsl, hsla, and CSS variables
 */
export function isValidColor(color: string): boolean {
  // Hex colors
  if (/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color)) return true;
  // RGB/RGBA
  if (/^rgba?\(/.test(color)) return true;
  // HSL/HSLA
  if (/^hsla?\(/.test(color)) return true;
  // CSS variables
  if (/^(var\(|hsl\(var\()/.test(color)) return true;
  // Named colors (basic check)
  if (/^[a-z]+$/i.test(color)) return true;

  return false;
}

/**
 * Converts hex color to RGB
 *
 * @example
 * ```typescript
 * hexToRgb('#017848') // { r: 1, g: 120, b: 72 }
 * ```
 */
export function hexToRgb(
  hex: string,
): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: Number.parseInt(result[1], 16),
        g: Number.parseInt(result[2], 16),
        b: Number.parseInt(result[3], 16),
      }
    : null;
}

/**
 * Converts RGB to hex color
 *
 * @example
 * ```typescript
 * rgbToHex(1, 120, 72) // '#017848'
 * ```
 */
export function rgbToHex(r: number, g: number, b: number): string {
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

/**
 * Lightens a color by a percentage
 *
 * @example
 * ```typescript
 * lightenColor('#017848', 20) // Lighter green
 * ```
 */
export function lightenColor(color: string, percent: number): string {
  const rgb = hexToRgb(color);
  if (!rgb) return color;

  const { r, g, b } = rgb;
  const amount = Math.round(2.55 * percent);

  return rgbToHex(
    Math.min(255, r + amount),
    Math.min(255, g + amount),
    Math.min(255, b + amount),
  );
}

/**
 * Darkens a color by a percentage
 *
 * @example
 * ```typescript
 * darkenColor('#017848', 20) // Darker green
 * ```
 */
export function darkenColor(color: string, percent: number): string {
  const rgb = hexToRgb(color);
  if (!rgb) return color;

  const { r, g, b } = rgb;
  const amount = Math.round(2.55 * percent);

  return rgbToHex(
    Math.max(0, r - amount),
    Math.max(0, g - amount),
    Math.max(0, b - amount),
  );
}

/**
 * Gets contrast ratio between two colors
 * Useful for accessibility checks
 *
 * @returns Contrast ratio (1-21)
 */
export function getContrastRatio(color1: string, color2: string): number {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);

  if (!rgb1 || !rgb2) return 1;

  const l1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
  const l2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);

  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);

  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Calculates relative luminance of a color
 */
function getLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    const sRGB = c / 255;
    return sRGB <= 0.03928 ? sRGB / 12.92 : ((sRGB + 0.055) / 1.055) ** 2.4;
  });

  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * Checks if a color combination meets WCAG AA standards
 *
 * @param foreground - Foreground color (text)
 * @param background - Background color
 * @param level - 'AA' or 'AAA'
 * @returns true if contrast is sufficient
 */
export function meetsWCAGStandards(
  foreground: string,
  background: string,
  level: "AA" | "AAA" = "AA",
): boolean {
  const ratio = getContrastRatio(foreground, background);
  const minRatio = level === "AAA" ? 7 : 4.5;
  return ratio >= minRatio;
}

/**
 * Generates a color palette from a base color
 * Creates lighter and darker variants
 *
 * @example
 * ```typescript
 * const palette = generateColorPalette('#017848');
 * // Returns: { 50: '#...', 100: '#...', ..., 900: '#...' }
 * ```
 */
export function generateColorPalette(
  baseColor: string,
): Record<number, string> {
  return {
    50: lightenColor(baseColor, 45),
    100: lightenColor(baseColor, 40),
    200: lightenColor(baseColor, 30),
    300: lightenColor(baseColor, 20),
    400: lightenColor(baseColor, 10),
    500: baseColor,
    600: darkenColor(baseColor, 10),
    700: darkenColor(baseColor, 20),
    800: darkenColor(baseColor, 30),
    900: darkenColor(baseColor, 40),
  };
}

/**
 * Serializes theme to JSON string
 * Useful for storing theme preferences
 */
export function serializeTheme(theme: FormTheme): string {
  return JSON.stringify(theme, null, 2);
}

/**
 * Deserializes theme from JSON string
 * Includes validation
 */
export function deserializeTheme(json: string): FormTheme | null {
  try {
    const theme = JSON.parse(json) as FormTheme;
    // Basic validation
    if (!theme.name || !theme.colors) {
      console.error("[deserializeTheme] Invalid theme structure");
      return null;
    }
    return theme;
  } catch (error) {
    console.error("[deserializeTheme] Failed to parse theme JSON:", error);
    return null;
  }
}

/**
 * Compares two themes for equality
 */
export function areThemesEqual(theme1: FormTheme, theme2: FormTheme): boolean {
  return JSON.stringify(theme1) === JSON.stringify(theme2);
}

/**
 * Gets a readable name for a theme
 * Converts kebab-case to Title Case
 *
 * @example
 * ```typescript
 * getThemeDisplayName('finzone-dark') // 'Finzone Dark'
 * ```
 */
export function getThemeDisplayName(themeName: string): string {
  return themeName
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
