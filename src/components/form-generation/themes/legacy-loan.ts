/**
 * Form Generation Library - Legacy Loan Theme (Simplified)
 *
 * Simplified theme matching the legacy LoanExtraInfoForm component
 * Only contains truly customizable properties
 */

import type { FormTheme } from "./types";

export const legacyLoanTheme: FormTheme = {
  name: "legacy-loan",

  colors: {
    primary: "#017848",
    border: "#bfd1cc",
    borderFocus: "#017848",
    background: "#ffffff",
    placeholder: "#9ca3af",
    error: "#ff7474",
    disabled: "#f3f4f6",
    readOnly: "#f9fafb",
  },

  borderRadius: {
    control: "8px",
  },

  spacing: {
    paddingHorizontal: "16px",
    paddingVertical: "20px", // Used for internal label layout
  },

  typography: {
    fontSize: "14px",
    labelFontSize: "12px",
    labelFontWeight: "500",
  },

  sizes: {
    sm: "48px",
    md: "60px",
    lg: "64px",
  },

  focusRing: {
    width: "2px",
    color: "#017848",
    opacity: "20",
  },

  fieldOptions: {
    internalLabel: true,
  },

  // Backward compatibility properties
  label: {
    base: "sr-only", // Internal label mode enabled
    required: "", // Required marker handled internally or via placeholder
    disabled: "text-gray-400",
  },

  error: {
    base: "flex items-start gap-1 text-xs text-[rgb(255,116,116)] mt-1 min-h-[16px]",
    icon: "hidden", // No icon in legacy
  },

  help: {
    base: "text-sm text-gray-500 mt-1",
  },

  // Optional specialized styling
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
