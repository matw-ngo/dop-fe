/**
 * Form Generation Library - Default Theme
 *
 * Shadcn-inspired default theme for form components
 */

import type { FormTheme } from "./types";

export const defaultTheme: FormTheme = {
  name: "default",

  control: {
    base: "w-full rounded-md border border-input bg-background ring-offset-background transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50",

    variants: {
      default: "",
      outlined: "border-2 bg-transparent",
      filled: "border-0 bg-muted",
      underlined: "border-0 border-b-2 rounded-none bg-transparent",
    },

    sizes: {
      sm: "h-9 px-3 py-1 text-sm",
      md: "h-10 px-3 py-2 text-base",
      lg: "h-12 px-4 py-3 text-lg",
    },

    states: {
      focus:
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      error: "border-destructive focus-visible:ring-destructive",
      disabled: "cursor-not-allowed opacity-50",
      readOnly: "bg-muted cursor-default",
    },
  },

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
};
