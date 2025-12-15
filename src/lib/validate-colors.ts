/**
 * Color validation utilities for the theme system.
 *
 * This module provides comprehensive validation functions for various color formats
 * used in the theme system, with special support for OKLCH (the primary format),
 * hex, HSL/HSLA, and RGB/RGBA color formats.
 *
 * @fileoverview Color validation utilities
 * @author Theme System
 * @version 1.0.0
 */

/**
 * Supported color format types
 */
export type ColorFormat = "oklch" | "hex" | "hsl" | "hsla" | "rgb" | "rgba";

/**
 * Color value options for validation
 */
export interface ColorValidationOptions {
  /** Allow alpha channel transparency */
  allowAlpha?: boolean;
  /** Minimum lightness value for OKLCH/HSL (0-1) */
  minLightness?: number;
  /** Maximum lightness value for OKLCH/HSL (0-1) */
  maxLightness?: number;
  /** Minimum chroma/saturation value (0-1) */
  minChroma?: number;
  /** Maximum chroma/saturation value (0-1) */
  maxChroma?: number;
}

/**
 * Regex patterns for color format validation
 */
const COLOR_PATTERNS = {
  /**
   * OKLCH color format: oklch(lightness chroma hue [/ alpha])
   * - Lightness: 0 to 1 (percentage)
   * - Chroma: 0 to ~0.37 (theoretical maximum)
   * - Hue: 0 to 360 (degrees)
   * - Alpha: 0 to 1 (optional)
   */
  oklch:
    /^oklch\(\s*([01]?\.\d+|0|1)\s+([01]?\.\d+|0|1(?:\.\d+)?)\s+(\d+(?:\.\d+)?)\s*(?:\/\s*([01]?\.\d+|0|1))?\s*\)$/i,

  /**
   * Hex color formats:
   * - #RGB (3-digit)
   * - #RGBA (4-digit)
   * - #RRGGBB (6-digit)
   * - #RRGGBBAA (8-digit)
   */
  hex3: /^#([0-9a-f]{3})$/i,
  hex4: /^#([0-9a-f]{4})$/i,
  hex6: /^#([0-9a-f]{6})$/i,
  hex8: /^#([0-9a-f]{8})$/i,

  /**
   * HSL format: hsl(hue saturation% lightness% [/ alpha])
   * - Hue: 0 to 360
   * - Saturation: 0% to 100%
   * - Lightness: 0% to 100%
   * - Alpha: 0 to 1 (optional)
   */
  hsl: /^hsl\(\s*(\d+(?:\.\d+)?)\s+(100|\d{1,2})%\s+(100|\d{1,2})%\s*(?:\/\s*([01]?\.\d+|0|1))?\s*\)$/i,

  /**
   * RGB format: rgb(red green blue [/ alpha])
   * - Red: 0 to 255
   * - Green: 0 to 255
   * - Blue: 0 to 255
   * - Alpha: 0 to 1 (optional)
   */
  rgb: /^rgb\(\s*(25[0-5]|2[0-4]\d|1\d\d|[0-9]?\d)\s+(25[0-5]|2[0-4]\d|1\d\d|[0-9]?\d)\s+(25[0-5]|2[0-4]\d|1\d\d|[0-9]?\d)\s*(?:\/\s*([01]?\.\d+|0|1))?\s*\)$/i,
} as const;

/**
 * Default validation options
 */
const DEFAULT_OPTIONS: Required<ColorValidationOptions> = {
  allowAlpha: true,
  minLightness: 0,
  maxLightness: 1,
  minChroma: 0,
  maxChroma: 1,
};

/**
 * Validates an OKLCH color string
 *
 * @param color - The OKLCH color string to validate
 * @param options - Validation options
 * @returns True if valid OKLCH color, false otherwise
 *
 * @example
 * ```typescript
 * isValidOklch('oklch(0.7 0.15 250)'); // true
 * isValidOklch('oklch(0.7 0.15 250 / 0.8)'); // true
 * isValidOklch('oklch(1.1 0.15 250)'); // false (lightness > 1)
 * ```
 */
export function isValidOklch(
  color: string,
  options?: ColorValidationOptions,
): boolean {
  if (typeof color !== "string") return false;

  const opts = { ...DEFAULT_OPTIONS, ...options };
  const match = COLOR_PATTERNS.oklch.exec(color.trim());

  if (!match) return false;

  const [, lightness, chroma, hue, alpha] = match;
  const l = parseFloat(lightness);
  const c = parseFloat(chroma);
  const h = parseFloat(hue);

  // Check lightness range
  if (l < opts.minLightness || l > opts.maxLightness) return false;

  // Check chroma range (OKLCH chroma typically maxes out around 0.37)
  const maxChroma = opts.maxChroma < 0.5 ? opts.maxChroma : 0.37;
  if (c < opts.minChroma || c > maxChroma) return false;

  // Check hue range
  if (h < 0 || h > 360) return false;

  // Check alpha if present
  if (alpha !== undefined && !opts.allowAlpha) return false;
  if (alpha !== undefined) {
    const a = parseFloat(alpha);
    if (a < 0 || a > 1) return false;
  }

  return true;
}

/**
 * Validates a hex color string
 *
 * @param color - The hex color string to validate
 * @param options - Validation options
 * @returns True if valid hex color, false otherwise
 *
 * @example
 * ```typescript
 * isValidHex('#FF0000'); // true
 * isValidHex('#F00'); // true
 * isValidHex('#FF000080'); // true (with alpha)
 * isValidHex('FF0000'); // false (missing #)
 * isValidHex('#GGGGGG'); // false (invalid hex digits)
 * ```
 */
export function isValidHex(
  color: string,
  options?: ColorValidationOptions,
): boolean {
  if (typeof color !== "string") return false;

  const opts = { ...DEFAULT_OPTIONS, ...options };
  const trimmed = color.trim();

  // Check if hex with alpha is allowed
  if (
    !opts.allowAlpha &&
    (COLOR_PATTERNS.hex4.test(trimmed) || COLOR_PATTERNS.hex8.test(trimmed))
  ) {
    return false;
  }

  return (
    COLOR_PATTERNS.hex3.test(trimmed) ||
    COLOR_PATTERNS.hex4.test(trimmed) ||
    COLOR_PATTERNS.hex6.test(trimmed) ||
    COLOR_PATTERNS.hex8.test(trimmed)
  );
}

/**
 * Validates an HSL/HSLA color string
 *
 * @param color - The HSL color string to validate
 * @param options - Validation options
 * @returns True if valid HSL/HSLA color, false otherwise
 *
 * @example
 * ```typescript
 * isValidHsl('hsl(250 50% 60%)'); // true
 * isValidHsl('hsl(250 50% 60% / 0.8)'); // true
 * isValidHsl('hsl(370 50% 60%)'); // false (hue > 360)
 * isValidHsl('hsl(250 110% 60%)'); // false (saturation > 100%)
 * ```
 */
export function isValidHsl(
  color: string,
  options?: ColorValidationOptions,
): boolean {
  if (typeof color !== "string") return false;

  const opts = { ...DEFAULT_OPTIONS, ...options };
  const match = COLOR_PATTERNS.hsl.exec(color.trim());

  if (!match) return false;

  const [, hue, saturation, lightness, alpha] = match;
  const h = parseFloat(hue);
  const s = parseInt(saturation, 10);
  const l = parseInt(lightness, 10);

  // Check hue range
  if (h < 0 || h > 360) return false;

  // Check saturation and lightness ranges
  if (s < 0 || s > 100) return false;
  if (l < 0 || l > 100) return false;

  // Convert percentage to 0-1 range for validation against options
  const lightnessNorm = l / 100;
  if (lightnessNorm < opts.minLightness || lightnessNorm > opts.maxLightness)
    return false;

  // Check alpha if present
  if (alpha !== undefined && !opts.allowAlpha) return false;
  if (alpha !== undefined) {
    const a = parseFloat(alpha);
    if (a < 0 || a > 1) return false;
  }

  return true;
}

/**
 * Validates an RGB/RGBA color string
 *
 * @param color - The RGB color string to validate
 * @param options - Validation options
 * @returns True if valid RGB/RGBA color, false otherwise
 *
 * @example
 * ```typescript
 * isValidRgb('rgb(255 0 0)'); // true
 * isValidRgb('rgb(255 0 0 / 0.8)'); // true
 * isValidRgb('rgb(256 0 0)'); // false (red > 255)
 * isValidRgb('rgb(-1 0 0)'); // false (red < 0)
 * ```
 */
export function isValidRgb(
  color: string,
  options?: ColorValidationOptions,
): boolean {
  if (typeof color !== "string") return false;

  const opts = { ...DEFAULT_OPTIONS, ...options };
  const match = COLOR_PATTERNS.rgb.exec(color.trim());

  if (!match) return false;

  const [, red, green, blue, alpha] = match;
  const r = parseInt(red, 10);
  const g = parseInt(green, 10);
  const b = parseInt(blue, 10);

  // Check RGB ranges
  if (r < 0 || r > 255) return false;
  if (g < 0 || g > 255) return false;
  if (b < 0 || b > 255) return false;

  // Check alpha if present
  if (alpha !== undefined && !opts.allowAlpha) return false;
  if (alpha !== undefined) {
    const a = parseFloat(alpha);
    if (a < 0 || a > 1) return false;
  }

  return true;
}

/**
 * Main color validation function that checks all supported formats
 *
 * @param color - The color string to validate
 * @param options - Validation options
 * @returns True if valid color in any supported format, false otherwise
 *
 * @example
 * ```typescript
 * isValidColor('#FF0000'); // true (hex)
 * isValidColor('oklch(0.7 0.15 250)'); // true (oklch)
 * isValidColor('hsl(250 50% 60%)'); // true (hsl)
 * isValidColor('rgb(255 0 0)'); // true (rgb)
 * isValidColor('invalid'); // false
 * ```
 */
export function isValidColor(
  color: string,
  options?: ColorValidationOptions,
): boolean {
  if (typeof color !== "string" || !color.trim()) return false;

  const opts = { ...DEFAULT_OPTIONS, ...options };

  return (
    isValidOklch(color, opts) ||
    isValidHex(color, opts) ||
    isValidHsl(color, opts) ||
    isValidRgb(color, opts)
  );
}

/**
 * Detects the format of a color string
 *
 * @param color - The color string to analyze
 * @returns The detected color format or null if invalid
 *
 * @example
 * ```typescript
 * getColorFormat('#FF0000'); // 'hex'
 * getColorFormat('oklch(0.7 0.15 250)'); // 'oklch'
 * getColorFormat('hsl(250 50% 60%)'); // 'hsl'
 * getColorFormat('rgb(255 0 0)'); // 'rgb'
 * getColorFormat('invalid'); // null
 * ```
 */
export function getColorFormat(color: string): ColorFormat | null {
  if (typeof color !== "string") return null;

  const trimmed = color.trim();

  if (COLOR_PATTERNS.oklch.test(trimmed)) return "oklch";

  if (COLOR_PATTERNS.hsl.test(trimmed)) {
    return trimmed.includes("/") ? "hsla" : "hsl";
  }

  if (COLOR_PATTERNS.rgb.test(trimmed)) {
    return trimmed.includes("/") ? "rgba" : "rgb";
  }

  if (
    COLOR_PATTERNS.hex3.test(trimmed) ||
    COLOR_PATTERNS.hex6.test(trimmed) ||
    COLOR_PATTERNS.hex4.test(trimmed) ||
    COLOR_PATTERNS.hex8.test(trimmed)
  ) {
    return "hex";
  }

  return null;
}

/**
 * Parses a color string into its components
 *
 * @param color - The color string to parse
 * @returns Parsed color components or null if invalid
 *
 * @example
 * ```typescript
 * parseColor('oklch(0.7 0.15 250 / 0.8)');
 * // Returns: { format: 'oklch', lightness: 0.7, chroma: 0.15, hue: 250, alpha: 0.8 }
 *
 * parseColor('#FF0000');
 * // Returns: { format: 'hex', red: 255, green: 0, blue: 0 }
 * ```
 */
export function parseColor(color: string): {
  format: ColorFormat;
  [key: string]: unknown;
} | null {
  const format = getColorFormat(color);
  if (!format) return null;

  const trimmed = color.trim();

  if (format === "oklch") {
    const match = COLOR_PATTERNS.oklch.exec(trimmed);
    if (!match) return null;
    const [, lightness, chroma, hue, alpha] = match;
    return {
      format,
      lightness: parseFloat(lightness),
      chroma: parseFloat(chroma),
      hue: parseFloat(hue),
      ...(alpha !== undefined && { alpha: parseFloat(alpha) }),
    };
  }

  if (format === "hsl" || format === "hsla") {
    const match = COLOR_PATTERNS.hsl.exec(trimmed);
    if (!match) return null;
    const [, hue, saturation, lightness, alpha] = match;
    return {
      format,
      hue: parseFloat(hue),
      saturation: parseInt(saturation, 10),
      lightness: parseInt(lightness, 10),
      ...(alpha !== undefined && { alpha: parseFloat(alpha) }),
    };
  }

  if (format === "rgb" || format === "rgba") {
    const match = COLOR_PATTERNS.rgb.exec(trimmed);
    if (!match) return null;
    const [, red, green, blue, alpha] = match;
    return {
      format,
      red: parseInt(red, 10),
      green: parseInt(green, 10),
      blue: parseInt(blue, 10),
      ...(alpha !== undefined && { alpha: parseFloat(alpha) }),
    };
  }

  if (format === "hex") {
    const hex = trimmed.slice(1);
    let r: number, g: number, b: number, a: number | undefined;

    if (hex.length === 3) {
      r = parseInt(hex[0] + hex[0], 16);
      g = parseInt(hex[1] + hex[1], 16);
      b = parseInt(hex[2] + hex[2], 16);
    } else if (hex.length === 4) {
      r = parseInt(hex[0] + hex[0], 16);
      g = parseInt(hex[1] + hex[1], 16);
      b = parseInt(hex[2] + hex[2], 16);
      a = parseInt(hex[3] + hex[3], 16) / 255;
    } else if (hex.length === 6) {
      r = parseInt(hex.slice(0, 2), 16);
      g = parseInt(hex.slice(2, 4), 16);
      b = parseInt(hex.slice(4, 6), 16);
    } else if (hex.length === 8) {
      r = parseInt(hex.slice(0, 2), 16);
      g = parseInt(hex.slice(2, 4), 16);
      b = parseInt(hex.slice(4, 6), 16);
      a = parseInt(hex.slice(6, 8), 16) / 255;
    } else {
      return null;
    }

    return {
      format: "hex",
      red: r,
      green: g,
      blue: b,
      ...(a !== undefined && { alpha: a }),
    };
  }

  return null;
}

/**
 * Utility functions for color format conversion (basic implementations)
 * Note: These are simplified conversions. For production use, consider using a library
 * like culori or color-convert for more accurate conversions.
 */

/**
 * Converts hex to RGB
 *
 * @param hex - Hex color string
 * @returns RGB string or null if invalid
 */
export function hexToRgb(hex: string): string | null {
  const parsed = parseColor(hex);
  if (!parsed || parsed.format !== "hex") return null;

  const { red, green, blue, alpha } = parsed;
  if (typeof alpha === "number") {
    return `rgb(${red} ${green} ${blue} / ${alpha.toFixed(2)})`;
  }
  return `rgb(${red} ${green} ${blue})`;
}

/**
 * Normalizes a color string to OKLCH format
 *
 * @param color - Any supported color format
 * @returns OKLCH color string or null if conversion not supported
 */
export function normalizeToOklch(color: string): string | null {
  const format = getColorFormat(color);
  if (!format) return null;

  if (format === "oklch") return color.trim();

  // For other formats, conversion would require more complex calculations
  // This is a placeholder - in production, use a proper color conversion library
  console.warn(
    "Direct conversion to OKLCH not implemented. Use a color conversion library.",
  );
  return null;
}
