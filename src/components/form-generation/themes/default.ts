/**
 * Form Generation Library - Default Theme
 *
 * Shadcn-inspired default theme for form components (Simplified)
 */

import type { FormTheme } from "./types";

export const defaultTheme: FormTheme = {
  name: "default",

  colors: {
    primary: "hsl(var(--ring))",
    border: "hsl(var(--border))",
    borderFocus: "hsl(var(--ring))",
    background: "hsl(var(--background))",
    placeholder: "hsl(var(--muted-foreground))",
    error: "hsl(var(--destructive))",
    disabled: "hsl(var(--muted))",
    readOnly: "hsl(var(--muted))",
    textPrimary: "hsl(var(--foreground))",
    textSecondary: "hsl(var(--muted-foreground))",
    radioBorder: "hsl(var(--border))",
  },

  borderRadius: {
    control: "6px",
  },

  spacing: {
    paddingHorizontal: "12px",
    paddingVertical: "16px",
  },

  typography: {
    fontSize: "14px",
    labelFontSize: "14px",
    labelFontWeight: "500",
  },

  sizes: {
    sm: "36px",
    md: "40px",
    lg: "48px",
  },

  focusRing: {
    width: "2px",
    color: "hsl(var(--ring))",
    opacity: "0.2",
  },

  fieldOptions: {
    internalLabel: false,
  },

  // Backward compatibility properties
  label: {
    base: "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
    required: 'after:content-["*"] after:ml-0.5 after:text-destructive',
    disabled: "opacity-70 cursor-not-allowed",
  },

  error: {
    base: "flex items-center gap-2 text-sm font-medium text-destructive mt-1.5",
    icon: "h-4 w-4 shrink-0",
  },

  help: {
    base: "text-sm text-muted-foreground mt-1.5",
  },

  // Optional specialized styling
  components: {
    file: {
      borderDashed: "hsl(var(--border))",
      backgroundDashed: "hsl(var(--background))",
      hoverBackground: "hsl(var(--muted))",
      hoverBorder: "hsl(var(--ring))",
    },

    ekyc: {
      success: "hsl(var(--ring))",
      processing: "hsl(var(--ring))",
      retryButton: "hsl(var(--ring))",
    },

    checkable: {
      checkedColor: "hsl(var(--ring))",
      uncheckedBorder: "hsl(var(--border))",
      focusRing: "hsl(var(--ring))",
    },
  },
};
