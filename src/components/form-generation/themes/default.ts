/**
 * Default Theme
 *
 * Fallback theme with sensible defaults
 */

import type { FormTheme } from "./types";

export const defaultTheme: FormTheme = {
  name: "default",

  colors: {
    primary: "#3b82f6",
    border: "#d1d5db",
    borderFocus: "#3b82f6",
    background: "#ffffff",
    placeholder: "#9ca3af",
    error: "#ef4444",
    disabled: "#f3f4f6",
    readOnly: "#f9fafb",
    textPrimary: "#111827",
    textSecondary: "#6b7280",
    radioBorder: "#d1d5db",

    backgroundSecondary: "#f3f4f6",
    accent: "#fbbf24",
    accentText: "#111827",
    surface: "#ffffff",
    overlay: "rgba(0, 0, 0, 0.5)",
    muted: "#f3f4f6",
    hover: "#f9fafb",
    headingText: "#111827",
    containerBorder: "#e5e7eb",
    interactiveBorder: "#d1d5db",
    infoBackground: "#f3f4f6",
    warning: "#fbbf24",
    iconSubtle: "#9ca3af",
    neutralBackground: "#f9fafb",
  },

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
    paddingHorizontal: "16px",
    paddingVertical: "20px",
  },

  typography: {
    fontSizes: {
      xs: "12px",
      sm: "14px",
      base: "16px",
      lg: "18px",
      xl: "20px",
      "2xl": "24px",
      "3xl": "32px",
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
    fontSize: "14px",
    labelFontSize: "12px",
    labelFontWeight: "500",
  },

  borderRadius: {
    sm: "4px",
    md: "8px",
    lg: "12px",
    xl: "16px",
    control: "8px",
  },

  sizes: {
    sm: "48px",
    md: "60px",
    lg: "64px",
  },

  focusRing: {
    width: "2px",
    color: "#3b82f6",
    opacity: "20",
  },

  fieldOptions: {
    internalLabel: false,
  },

  label: {
    base: "block text-sm font-medium text-gray-700 mb-1",
    required: "text-red-500",
    disabled: "text-gray-400",
  },

  error: {
    base: "flex items-start gap-1 text-xs text-red-500 mt-1 min-h-[16px]",
    icon: "w-3 h-3 mt-0.5 flex-shrink-0",
  },

  help: {
    base: "text-sm text-gray-500 mt-1",
  },

  components: {
    file: {
      borderDashed: "#d1d5db",
      backgroundDashed: "#ffffff",
      hoverBackground: "#f9fafb",
      hoverBorder: "#3b82f6",
    },
    ekyc: {
      success: "#10b981",
      processing: "#3b82f6",
      retryButton: "#3b82f6",
    },
    checkable: {
      checkedColor: "#3b82f6",
      uncheckedBorder: "#d1d5db",
      focusRing: "#3b82f6",
    },
  },
};
