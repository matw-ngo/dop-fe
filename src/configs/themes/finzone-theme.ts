/**
 * Fin Zone Brand Theme
 *
 * Primary theme for Fin Zone brand with comprehensive design tokens
 * Based on 4px/8px spacing scale following design system best practices
 */

import type { FormTheme } from "@/components/form-generation/themes/types";

export const finzoneTheme: FormTheme = {
  name: "finzone",

  // Color tokens - Mapped from SCSS variables
  colors: {
    primary: "#017848", // $text-800, $bg-100
    border: "#bfd1cc", // $text-1100 - Default borders
    borderFocus: "#017848",
    background: "#ffffff",
    placeholder: "#A3A3A3",
    error: "#ff7474",
    disabled: "#f3f4f6",
    readOnly: "#f9fafb",
    textPrimary: "#073126", // $text-600 - Primary text
    textSecondary: "#4d7e70", // $text-900 - Secondary text, labels
    radioBorder: "#999999",

    // Extended color palette for UI components
    backgroundSecondary: "#eff7f0", // $bg-200 - Light background for inactive states
    accent: "#ffd566", // $bg-800 - Accent color for highlights
    accentText: "#073126", // Text on accent backgrounds
    surface: "#ffffff", // Card, panel, modal backgrounds
    overlay: "rgba(0, 0, 0, 0.5)", // Modal backdrop, drawer overlay
    muted: "#f3f4f6", // Muted backgrounds, placeholders
    hover: "#f9fafb", // Hover states

    // Semantic colors
    headingText: "#004733", // $text-200 - Heading text color
    containerBorder: "#bfddd1", // $text-1000 - Container borders
    interactiveBorder: "#bfddd1", // $text-1000 - Interactive element borders
    infoBackground: "#f2f6f5", // $bg-600 - Info section backgrounds
    warning: "#EEBE40", // Warning/highlight color
    iconSubtle: "#739a8f", // $text-1200 - Subtle icon color
    neutralBackground: "#f2f8f6", // $bg-300 - Neutral button backgrounds
  },

  // Spacing tokens - 4px base scale
  spacing: {
    xxs: "2px",
    xs: "4px",
    sm: "8px",
    md: "12px",
    base: "16px",
    lg: "20px",
    xl: "24px",
    "2xl": "32px",
    "3xl": "40px",
    "4xl": "48px",

    // Legacy support
    paddingHorizontal: "16px",
    paddingVertical: "20px",
  },

  // Typography tokens
  typography: {
    fontSizes: {
      xs: "12px", // $text-ss
      sm: "14px", // $text-xs
      base: "16px", // $text-base
      lg: "18px", // $text-md
      xl: "20px", // $text-lg
      "2xl": "24px", // $text-2xl
      "3xl": "32px", // $text-5xl
    },

    fontWeights: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },

    lineHeights: {
      tight: "16px",
      snug: "20px",
      normal: "24px",
      relaxed: "28px",
      loose: "32px",
      xl: "40px",
    },

    // Legacy support
    fontSize: "14px",
    labelFontSize: "12px",
    labelFontWeight: "500",
  },

  // Border radius tokens
  borderRadius: {
    sm: "4px",
    md: "8px",
    lg: "12px",
    xl: "16px",
    control: "8px", // Legacy
  },

  // Size tokens
  sizes: {
    sm: "48px",
    md: "60px",
    lg: "64px",
  },

  // Focus ring
  focusRing: {
    width: "2px",
    color: "#017848",
    opacity: "20",
  },

  // Field options
  fieldOptions: {
    internalLabel: true,
  },

  // Backward compatibility properties
  label: {
    base: "sr-only",
    required: "",
    disabled: "text-gray-400",
  },

  error: {
    base: "flex items-start gap-1 text-xs text-[rgb(255,116,116)] mt-1 min-h-[16px]",
    icon: "hidden",
  },

  help: {
    base: "text-sm text-gray-500 mt-1",
  },

  // Component-specific tokens (minimal)
  components: {
    file: {
      borderDashed: "#bfd1cc",
      backgroundDashed: "#ffffff",
      hoverBackground: "#f9fafb",
      hoverBorder: "#017848",
    },

    ekyc: {
      success: "#017848",
      processing: "#017848",
      retryButton: "#017848",
    },

    checkable: {
      checkedColor: "#017848",
      uncheckedBorder: "#d1d5db",
      focusRing: "#017848",
    },
  },
};
