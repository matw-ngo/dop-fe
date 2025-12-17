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
    opacity: "0.2",
  },

  fieldOptions: {
    internalLabel: true,
  },
};
