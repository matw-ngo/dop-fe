/**
 * Form Generation Library - Legacy Loan Theme
 *
 * Theme matching the legacy LoanExtraInfoForm component
 */

import type { FormTheme } from "./types";

export const legacyLoanTheme: FormTheme = {
  name: "legacy-loan",

  control: {
    base: "w-full border bg-white transition-colors",

    variants: {
      default: "border-[#bfd1cc] rounded-[8px]",
      outlined: "", // not used in legacy
      filled: "", // not used in legacy
      underlined: "", // not used in legacy
    },

    sizes: {
      sm: "h-12 px-3 text-sm",
      md: "h-[60px] px-4 text-base",
      lg: "h-16 px-4 text-lg",
    },

    states: {
      focus:
        "focus:outline-none focus:border-[#017848] focus:ring-2 focus:ring-[#017848]/20",
      error: "border-red-500",
      disabled: "bg-gray-100 cursor-not-allowed opacity-60",
      readOnly: "bg-gray-50 cursor-default",
    },
  },

  label: {
    base: "sr-only", // Internal label mode enabled
    required: "", // Required marker handled internally or via placeholder
    disabled: "text-gray-400",
  },

  fieldOptions: {
    internalLabel: true,
  },

  error: {
    base: "flex items-start gap-1 text-xs text-[rgb(255,116,116)] mt-1 min-h-[16px]",
    icon: "hidden", // No icon in legacy
  },

  help: {
    base: "text-sm text-gray-500 mt-1",
  },
};
