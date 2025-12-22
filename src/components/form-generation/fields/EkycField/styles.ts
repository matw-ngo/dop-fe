/**
 * Styling configuration for EkycField component
 * Extracted for better maintainability
 */

import type { FormTheme } from "../../themes/types";
import { cn } from "../../utils/helpers";

export interface EkycStylesConfig {
  variant: "button" | "compact" | "card" | "inline-status";
  theme: FormTheme;
  error?: string;
  disabled?: boolean;
  internalLabel?: boolean;
}

/**
 * Get wrapper styles for EkycField based on variant and theme
 */
export function getEkycStyles(config: EkycStylesConfig) {
  const { variant, theme, error, disabled, internalLabel } = config;

  // Base wrapper styles - consistent across all variants
  const baseWrapperStyles = ["w-full", "transition-all", "duration-200"];

  // Theme-specific wrapper styles
  const themeWrapperStyles = [
    `border-[${theme.colors.border}]`,
    `bg-[${theme.colors.background}]`,
    // Focus within (for wrapper)
    `focus-within:border-[${theme.colors.borderFocus}]`,
    "focus-within:ring-2",
    theme.focusRing
      ? `focus-within:ring-[${theme.focusRing.color}]/${theme.focusRing.opacity}`
      : `focus-within:ring-[${theme.colors.primary}]/20`,
    // Error state
    error && `border-[${theme.colors.error}]`,
    error && `focus-within:ring-[${theme.colors.error}]/20`,
    // Disabled state
    disabled && `!bg-[${theme.colors.disabled}]`,
  ].filter(Boolean);

  // Variant-specific styles
  const variantStyles: Record<typeof variant, string[]> = {
    button: [
      "border",
      "rounded-[8px]",
      internalLabel ? "min-h-[60px]" : "h-[60px]",
      "px-4",
      internalLabel ? "py-3" : "py-0",
    ],
    compact: ["border", "rounded-md", "h-10", "px-3"],
    card: ["border-2", "rounded-lg", "p-4", "shadow-sm", "hover:shadow-md"],
    "inline-status": ["border-0", "h-auto", "p-0"],
  };

  // Combined wrapper classes
  const wrapperClassName = cn(
    ...baseWrapperStyles,
    ...themeWrapperStyles,
    ...variantStyles[variant],
  );

  return {
    wrapperClassName,
    baseWrapperStyles,
    themeWrapperStyles,
    variantStyles: variantStyles[variant],
  };
}
