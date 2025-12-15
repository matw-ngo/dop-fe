/**
 * Migration validation and fallback system for theme migration.
 *
 * This module provides comprehensive validation and fallback mechanisms to ensure
 * that the theme migration process is robust and handles edge cases gracefully.
 *
 * @fileoverview Migration validation and fallback system
 * @author Theme System
 * @version 1.0.0
 */

import { isValidColor } from "../../../lib/validate-colors";
import { defaultThemes } from "./default-themes";
import type { ThemeConfig, ThemeColors, UserGroup, Theme } from "./types";

/**
 * Validation result interface
 */
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  sanitizedData?: Partial<ThemeConfig>;
  sanitizedCustomizations?: Partial<ThemeColors>;
}

/**
 * Migration data interface
 */
export interface MigrationData {
  currentTheme: string;
  userGroup: string;
  customizations?: Partial<ThemeColors>;
  mode?: "light" | "dark" | "system";
}

/**
 * Fallback strategy types
 */
export type FallbackStrategy =
  | "default-theme"
  | "group-default"
  | "light-theme"
  | "dark-theme"
  | "safe-colors";

/**
 * Validation options for migration
 */
export interface MigrationValidationOptions {
  /** Whether to sanitize invalid colors instead of rejecting */
  sanitizeColors?: boolean;
  /** Whether to validate user group compatibility */
  validateUserGroup?: boolean;
  /** Whether to allow fallback to system themes */
  allowSystemFallback?: boolean;
  /** Custom fallback theme ID */
  fallbackTheme?: string;
  /** Strict mode - fail on any error */
  strict?: boolean;
}

/**
 * Default validation options
 */
const DEFAULT_VALIDATION_OPTIONS: Required<MigrationValidationOptions> = {
  sanitizeColors: true,
  validateUserGroup: true,
  allowSystemFallback: true,
  fallbackTheme: "default",
  strict: false,
};

/**
 * Default fallback colors for invalid color values
 * These are safe, accessible colors that work in most contexts
 */
const DEFAULT_FALLBACK_COLORS: Record<keyof ThemeColors, string> = {
  background: "oklch(1 0 0)",
  foreground: "oklch(0.13 0.016 247.858)",
  card: "oklch(1 0 0)",
  cardForeground: "oklch(0.13 0.016 247.858)",
  popover: "oklch(1 0 0)",
  popoverForeground: "oklch(0.13 0.016 247.858)",
  primary: "oklch(0.623 0.188 259.815)",
  primaryForeground: "oklch(0.987 0.002 247.858)",
  secondary: "oklch(0.685 0.059 247.858)",
  secondaryForeground: "oklch(0.13 0.016 247.858)",
  muted: "oklch(0.938 0.011 247.858)",
  mutedForeground: "oklch(0.647 0.025 247.858)",
  accent: "oklch(0.839 0.113 247.858)",
  accentForeground: "oklch(0.13 0.016 247.858)",
  destructive: "oklch(0.637 0.208 25.331)",
  border: "oklch(0.873 0.017 247.858)",
  input: "oklch(0.938 0.011 247.858)",
  ring: "oklch(0.623 0.188 259.815)",
  chart1: "oklch(0.623 0.188 259.815)",
  chart2: "oklch(0.696 0.149 162.48)",
  chart3: "oklch(0.769 0.165 70.08)",
  chart4: "oklch(0.715 0.126 215.221)",
  chart5: "oklch(0.685 0.059 247.858)",
  sidebar: "oklch(0.938 0.011 247.858)",
  sidebarForeground: "oklch(0.13 0.016 247.858)",
  sidebarPrimary: "oklch(0.623 0.188 259.815)",
  sidebarPrimaryForeground: "oklch(0.987 0.002 247.858)",
  sidebarAccent: "oklch(0.839 0.113 247.858)",
  sidebarAccentForeground: "oklch(0.13 0.016 247.858)",
  sidebarBorder: "oklch(0.873 0.017 247.858)",
  sidebarRing: "oklch(0.623 0.188 259.815)",
};

/**
 * Main validation function for migrated theme data
 *
 * @param data - The migration data to validate
 * @param availableThemes - List of available theme IDs
 * @param userGroups - List of available user groups
 * @param options - Validation options
 * @returns Validation result with sanitized data if applicable
 */
export function validateMigratedData(
  data: MigrationData,
  availableThemes: string[],
  userGroups: UserGroup[],
  options: MigrationValidationOptions = {}
): ValidationResult {
  const opts = { ...DEFAULT_VALIDATION_OPTIONS, ...options };
  const errors: string[] = [];
  const warnings: string[] = [];
  const sanitizedData: Partial<ThemeConfig> = {};
  let sanitizedCustomizations: Partial<ThemeColors> | undefined;

  try {
    // Validate theme exists
    if (!data.currentTheme) {
      errors.push("Missing theme ID");
    } else if (!availableThemes.includes(data.currentTheme)) {
      const error = `Theme '${data.currentTheme}' is not available`;
      if (opts.strict) {
        errors.push(error);
      } else {
        warnings.push(error);
        sanitizedData.id = opts.fallbackTheme;
      }
    } else {
      sanitizedData.id = data.currentTheme;
    }

    // Validate user group
    if (!data.userGroup) {
      errors.push("Missing user group");
    } else if (!userGroups.find(group => group.id === data.userGroup)) {
      const error = `User group '${data.userGroup}' is not valid`;
      if (opts.strict) {
        errors.push(error);
      } else {
        warnings.push(error);
        sanitizedData.group = "system"; // Default to system group
      }
    } else {
      sanitizedData.group = data.userGroup;
    }

    // Validate theme-user group compatibility
    if (opts.validateUserGroup && sanitizedData.id && sanitizedData.group) {
      const userGroup = userGroups.find(group => group.id === sanitizedData.group);
      if (userGroup && !userGroup.availableThemes.includes(sanitizedData.id!)) {
        const error = `Theme '${sanitizedData.id}' is not available for user group '${sanitizedData.group}'`;
        if (opts.strict) {
          errors.push(error);
        } else {
          warnings.push(error);
          sanitizedData.id = userGroup.defaultTheme;
        }
      }
    }

    // Validate customizations
    if (data.customizations) {
      const result = sanitizeThemeColors(
        data.customizations,
        opts.sanitizeColors
      );

      if (result.invalidColors.length > 0) {
        warnings.push(
          `Invalid colors found and ${opts.sanitizeColors ? 'sanitized' : 'removed'}: ${result.invalidColors.join(", ")}`
        );
      }

      // Store sanitized customizations separately
      if (Object.keys(result.colors).length > 0) {
        sanitizedCustomizations = result.colors;
      }
    }

    // Validate mode
    if (data.mode && !["light", "dark", "system"].includes(data.mode)) {
      warnings.push(`Invalid mode '${data.mode}', defaulting to 'system'`);
      // Mode is handled at the provider level, no need to include in sanitized data
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      sanitizedData: Object.keys(sanitizedData).length > 0 ? sanitizedData : undefined,
      sanitizedCustomizations,
    };
  } catch (error) {
    console.error("Unexpected error during migration validation:", error);
    return {
      isValid: false,
      errors: ["Unexpected validation error"],
      warnings: [],
      sanitizedData: undefined,
      sanitizedCustomizations: undefined,
    };
  }
}

/**
 * Sanitize theme colors by validating and replacing invalid colors
 *
 * @param colors - The colors to sanitize
 * @param replaceInvalid - Whether to replace invalid colors with defaults
 * @returns Sanitized colors and list of invalid color keys
 */
export function sanitizeThemeColors(
  colors: Partial<ThemeColors>,
  replaceInvalid: boolean = true
): { colors: Partial<ThemeColors>; invalidColors: string[] } {
  const sanitized: Partial<ThemeColors> = {};
  const invalidColors: string[] = [];

  try {
    for (const [key, value] of Object.entries(colors)) {
      if (value && isValidColor(value)) {
        sanitized[key as keyof ThemeColors] = value;
      } else {
        invalidColors.push(key);
        if (replaceInvalid && key in DEFAULT_FALLBACK_COLORS) {
          sanitized[key as keyof ThemeColors] = DEFAULT_FALLBACK_COLORS[key as keyof ThemeColors];
        }
      }
    }
  } catch (error) {
    console.error("Error sanitizing theme colors:", error);
    // Return empty colors on error
    return { colors: {}, invalidColors: Object.keys(colors) };
  }

  return { colors: sanitized, invalidColors };
}

/**
 * Determine appropriate fallback theme based on context
 *
 * @param invalidThemeId - The invalid theme ID that needs fallback
 * @param userGroup - The current user group
 * @param availableThemes - List of available theme IDs
 * @param strategy - Fallback strategy to use
 * @returns Appropriate fallback theme ID
 */
export function getFallbackTheme(
  invalidThemeId: string,
  userGroup: UserGroup | null,
  availableThemes: string[],
  strategy: FallbackStrategy = "group-default"
): string {
  try {
    switch (strategy) {
      case "group-default":
        if (userGroup && userGroup.defaultTheme && availableThemes.includes(userGroup.defaultTheme)) {
          return userGroup.defaultTheme;
        }
        // Fall through to default-theme if group default is not available

      case "default-theme":
        if (availableThemes.includes("default")) {
          return "default";
        }
        // Fall through to first available theme

      case "light-theme":
        if (availableThemes.includes("light")) {
          return "light";
        }
        // Fall through to dark theme

      case "dark-theme":
        if (availableThemes.includes("dark")) {
          return "dark";
        }
        // Fall through to safe-colors

      case "safe-colors":
      default:
        // Return first available theme
        return availableThemes[0] || "default";
    }
  } catch (error) {
    console.error("Error determining fallback theme:", error);
    return "default";
  }
}

/**
 * Validate if a user group supports a specific theme
 *
 * @param userGroup - The user group to check
 * @param themeId - The theme ID to validate
 * @returns True if theme is supported by the user group
 */
export function validateUserGroupThemeCompatibility(
  userGroup: UserGroup,
  themeId: string
): boolean {
  try {
    if (!userGroup || !themeId) return false;
    return userGroup.availableThemes.includes(themeId);
  } catch (error) {
    console.error("Error validating user group theme compatibility:", error);
    return false;
  }
}

/**
 * Create a safe fallback theme configuration
 *
 * @param themeId - The theme ID to use for fallback
 * @param userGroup - The user group context
 * @returns Minimal valid theme configuration
 */
export function createFallbackThemeConfig(
  themeId: string,
  userGroup: string
): Partial<ThemeConfig> {
  return {
    id: themeId,
    name: themeId.charAt(0).toUpperCase() + themeId.slice(1),
    group: userGroup,
    colors: {
      light: DEFAULT_FALLBACK_COLORS,
      dark: DEFAULT_FALLBACK_COLORS,
    },
  };
}

/**
 * Comprehensive migration error recovery
 *
 * @param error - The error that occurred during migration
 * @param originalData - The original migration data
 * @param availableThemes - List of available theme IDs
 * @param userGroups - List of available user groups
 * @returns Recovered migration data
 */
export function recoverFromMigrationError(
  error: Error,
  originalData: MigrationData,
  availableThemes: string[],
  userGroups: UserGroup[]
): MigrationData {
  console.error("Migration error, attempting recovery:", error);

  try {
    // Create minimal safe migration data
    const safeData: MigrationData = {
      currentTheme: "default",
      userGroup: "system",
      mode: originalData.mode || "system",
    };

    // Try to preserve theme if it exists
    if (originalData.currentTheme && availableThemes.includes(originalData.currentTheme)) {
      safeData.currentTheme = originalData.currentTheme;
    }

    // Try to preserve user group if it exists
    if (originalData.userGroup && userGroups.some(g => g.id === originalData.userGroup)) {
      safeData.userGroup = originalData.userGroup;
    }

    // Try to preserve valid customizations
    if (originalData.customizations) {
      const { colors } = sanitizeThemeColors(originalData.customizations, true);
      if (Object.keys(colors).length > 0) {
        safeData.customizations = colors;
      }
    }

    return safeData;
  } catch (recoveryError) {
    console.error("Failed to recover from migration error:", recoveryError);
    // Return absolute minimal data
    return {
      currentTheme: "default",
      userGroup: "system",
      mode: "system",
    };
  }
}

/**
 * Validate migration data integrity and provide detailed diagnostics
 *
 * @param data - Migration data to analyze
 * @param availableThemes - List of available theme IDs
 * @param userGroups - List of available user groups
 * @returns Detailed diagnostic report
 */
export function diagnoseMigrationData(
  data: MigrationData,
  availableThemes: string[],
  userGroups: UserGroup[]
): {
  isHealthy: boolean;
  issues: Array<{
    severity: "error" | "warning" | "info";
    category: "theme" | "userGroup" | "customization" | "mode";
    message: string;
    suggestion?: string;
  }>;
  recommendations: string[];
} {
  const issues: Array<{
    severity: "error" | "warning" | "info";
    category: "theme" | "userGroup" | "customization" | "mode";
    message: string;
    suggestion?: string;
  }> = [];
  const recommendations: string[] = [];

  // Check theme
  if (!data.currentTheme) {
    issues.push({
      severity: "error",
      category: "theme",
      message: "Missing theme ID",
      suggestion: "Set a valid theme ID",
    });
  } else if (!availableThemes.includes(data.currentTheme)) {
    issues.push({
      severity: "error",
      category: "theme",
      message: `Theme '${data.currentTheme}' is not available`,
      suggestion: `Choose from: ${availableThemes.slice(0, 5).join(", ")}${availableThemes.length > 5 ? "..." : ""}`,
    });
  }

  // Check user group
  if (!data.userGroup) {
    issues.push({
      severity: "error",
      category: "userGroup",
      message: "Missing user group",
      suggestion: "Set a valid user group ID",
    });
  } else {
    const userGroup = userGroups.find(g => g.id === data.userGroup);
    if (!userGroup) {
      issues.push({
        severity: "error",
        category: "userGroup",
        message: `User group '${data.userGroup}' does not exist`,
        suggestion: `Choose from: ${userGroups.slice(0, 5).map(g => g.id).join(", ")}${userGroups.length > 5 ? "..." : ""}`,
      });
    } else if (data.currentTheme && !userGroup.availableThemes.includes(data.currentTheme)) {
      issues.push({
        severity: "warning",
        category: "theme",
        message: `Theme '${data.currentTheme}' is not available for user group '${data.userGroup}'`,
        suggestion: `Use group default: ${userGroup.defaultTheme}`,
      });
    }
  }

  // Check customizations
  if (data.customizations) {
    const { invalidColors } = sanitizeThemeColors(data.customizations, false);
    if (invalidColors.length > 0) {
      issues.push({
        severity: "warning",
        category: "customization",
        message: `Invalid color values: ${invalidColors.join(", ")}`,
        suggestion: "Replace with valid color values or remove invalid entries",
      });
      recommendations.push("Consider sanitizing invalid colors automatically");
    }
  }

  // Check mode
  if (data.mode && !["light", "dark", "system"].includes(data.mode)) {
    issues.push({
      severity: "warning",
      category: "mode",
      message: `Invalid mode: ${data.mode}`,
      suggestion: "Use 'light', 'dark', or 'system'",
    });
  }

  // Generate recommendations
  if (issues.some(i => i.severity === "error")) {
    recommendations.push("Run migration validation before applying changes");
  }
  if (issues.some(i => i.category === "customization")) {
    recommendations.push("Review color customization policies");
  }
  if (issues.some(i => i.category === "userGroup")) {
    recommendations.push("Verify user group permissions and available themes");
  }

  const isHealthy = issues.filter(i => i.severity === "error").length === 0;

  return {
    isHealthy,
    issues,
    recommendations,
  };
}

/**
 * Export utilities for theme provider integration
 */
export const MigrationValidation = {
  validateMigratedData,
  sanitizeThemeColors,
  getFallbackTheme,
  validateUserGroupThemeCompatibility,
  createFallbackThemeConfig,
  recoverFromMigrationError,
  diagnoseMigrationData,
  DEFAULT_FALLBACK_COLORS,
};

// Types are already exported when they are declared above