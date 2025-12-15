/**
 * Color conversion utilities for theme system
 * Uses culori library for accurate color space conversions
 */

import { converter, formatCss } from "culori";

// Define converter function
const hexToOklch = converter("oklch");

/**
 * Converts a hex color to OKLCH format
 * @param hex - Hex color string (e.g., "#3b82f6")
 * @returns OKLCH color string (e.g., "oklch(0.58 0.22 265)")
 */
export function hexToOklchFormat(hex: string): string {
  const oklch = hexToOklch(hex);

  if (!oklch) {
    throw new Error(`Invalid hex color: ${hex}`);
  }

  // Use culori's formatter to get proper CSS format
  return formatCss(oklch);
}

/**
 * Converts multiple hex colors to OKLCH format
 * @param hexColors - Object with hex color values
 * @returns Object with OKLCH color values
 */
export function convertHexObjectToOklch(hexColors: Record<string, string>): Record<string, string> {
  const result: Record<string, string> = {};

  for (const [key, value] of Object.entries(hexColors)) {
    try {
      result[key] = hexToOklchFormat(value);
    } catch (error) {
      console.warn(`Failed to convert color ${key}: ${value}`, error);
      // Keep original value if conversion fails
      result[key] = value;
    }
  }

  return result;
}

/**
 * Checks if a color is in hex format
 * @param color - Color string to check
 * @returns True if color is in hex format
 */
export function isHexColor(color: string): boolean {
  return /^#([0-9A-F]{3}){1,2}$/i.test(color);
}

/**
 * Converts a color to OKLCH if it's in hex format, otherwise returns as-is
 * @param color - Color string in any format
 * @returns OKLCH color string if input was hex, otherwise original color
 */
export function ensureOklchFormat(color: string): string {
  if (isHexColor(color)) {
    return hexToOklchFormat(color);
  }
  return color;
}