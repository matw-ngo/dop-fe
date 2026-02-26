/**
 * Form Generation Library - Theme Utilities
 *
 * Utilities for working with simplified themes
 */

import { defaultTheme } from "./default";
import type { FormTheme } from "./types";
import type { FormTheme as SimplifiedFormTheme } from "./types";

type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K];
};

/**
 * Converts a simplified theme to a full theme structure
 * This maintains backward compatibility while using the simplified API
 */
export function expandTheme(simplifiedTheme: SimplifiedFormTheme): FormTheme {
  const {
    colors,
    borderRadius,
    spacing,
    typography,
    sizes,
    focusRing,
    fieldOptions,
  } = simplifiedTheme;

  // Build base styles using CSS custom properties for better maintainability
  const cssVars = {
    "--form-primary": colors.primary,
    "--form-border": colors.border,
    "--form-border-focus": colors.borderFocus,
    "--form-bg": colors.background,
    "--form-placeholder": colors.placeholder,
    "--form-error": colors.error,
    "--form-disabled": colors.disabled,
    "--form-readonly": colors.readOnly,
    "--form-radius": borderRadius.control,
    "--form-font-size": typography.fontSize,
    "--form-label-font-size": typography.labelFontSize,
    "--form-label-font-weight": typography.labelFontWeight,
    "--form-focus-ring-width": focusRing.width,
    "--form-focus-ring-color": focusRing.color,
    "--form-focus-ring-opacity": focusRing.opacity,
  } as const;

  const cssVarsString = Object.entries(cssVars)
    .map(([key, value]) => `${key}: ${value}`)
    .join("; ");

  return {
    name: simplifiedTheme.name,
    colors,
    borderRadius,
    spacing,
    typography,
    sizes,
    focusRing,
    control: {
      base: [
        "w-full",
        "border",
        "transition-colors",
        "bg-white",
        // Apply CSS variables
        `[${cssVarsString}]`,
        // Use CSS variables for dynamic values
        "border-[var(--form-border)]",
        "bg-[var(--form-bg)]",
        "rounded-[var(--form-radius)]",
        "text-[var(--form-font-size)]",
        // Placeholder styling with CSS variables for consistency
        "placeholder:text-[var(--form-placeholder)]",
        "placeholder:font-medium",
        "focus:outline-none",
        "focus:border-[var(--form-border-focus)]",
        `focus:ring-[var(--form-focus-ring-width)]`,
        `focus:ring-[var(--form-focus-ring-color)]`,
        `focus:ring-opacity-[var(--form-focus-ring-opacity)]`,
      ].join(" "),
      variants: {
        default: "",
        outlined: "border-2",
        filled: "border-0",
        underlined: "border-x-0 border-t-0 rounded-none",
      },
      sizes: {
        sm: `h-[${sizes.sm}] px-[${spacing.paddingHorizontal}] text-sm`,
        md: `h-[${sizes.md}] px-[${spacing.paddingHorizontal}] text-sm md:text-sm`,
        lg: `h-[${sizes.lg}] px-[${spacing.paddingHorizontal}] text-lg`,
      },
      states: {
        focus: "", // Already included in base
        error: `border-[var(--form-error)] focus:ring-[var(--form-error)]`,
        disabled: `bg-[var(--form-disabled)] cursor-not-allowed opacity-60`,
        readOnly: `bg-[var(--form-readonly)] cursor-default`,
      },
    },
    label: {
      base: fieldOptions?.internalLabel ? "sr-only" : "text-sm font-medium",
      required: "",
      disabled: "text-gray-400",
    },
    fieldOptions,
    error: {
      base: "flex items-start gap-1 text-xs mt-1 min-h-[16px]",
      icon: "hidden",
    },
    help: {
      base: "text-sm text-gray-500 mt-1",
    },
  };
}

/**
 * Creates a theme by merging a simplified theme with the default theme
 * This allows for partial customization
 */
export function createTheme(
  partialSimplifiedTheme: DeepPartial<SimplifiedFormTheme>,
): FormTheme {
  // Create a complete simplified theme by merging with defaults
  const mergedSimplifiedTheme: SimplifiedFormTheme = {
    name: partialSimplifiedTheme.name || "custom",
    colors: {
      primary: "#000000",
      border: "#d1d5db",
      borderFocus: "#000000",
      background: "#ffffff",
      placeholder: "#9ca3af",
      error: "#ef4444",
      disabled: "#f3f4f6",
      readOnly: "#f9fafb",
      ...partialSimplifiedTheme.colors,
    },
    borderRadius: {
      control: "6px",
      ...partialSimplifiedTheme.borderRadius,
    },
    spacing: {
      paddingHorizontal: "12px",
      paddingVertical: "8px",
      ...partialSimplifiedTheme.spacing,
    },
    typography: {
      fontSize: "14px",
      labelFontSize: "12px",
      labelFontWeight: "500",
      ...partialSimplifiedTheme.typography,
    },
    sizes: {
      sm: "36px",
      md: "40px",
      lg: "48px",
      ...partialSimplifiedTheme.sizes,
    },
    focusRing: {
      width: "2px",
      color: "currentColor",
      opacity: "0.2",
      ...partialSimplifiedTheme.focusRing,
    },
    fieldOptions: {
      ...partialSimplifiedTheme.fieldOptions,
    },
  };

  return expandTheme(mergedSimplifiedTheme);
}
