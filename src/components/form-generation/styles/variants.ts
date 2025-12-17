/**
 * Form Generation Library - Component Variants
 *
 * TailwindCSS variants using class-variance-authority
 */

import { cva, type VariantProps } from "class-variance-authority";

// ============================================================================
// Field Wrapper Variants
// ============================================================================

export const fieldWrapperVariants = cva(
  "flex flex-col w-full transition-opacity duration-200",
  {
    variants: {
      size: {
        sm: "gap-1 text-sm",
        md: "gap-1.5 text-base",
        lg: "gap-2 text-lg",
      },
      variant: {
        default: "flex-col",
        inline: "sm:flex-row sm:items-center sm:gap-4",
      },
      disabled: {
        true: "opacity-60 cursor-not-allowed",
        false: "",
      },
    },
    defaultVariants: {
      size: "md",
      variant: "default",
      disabled: false,
    },
  },
);

export type FieldWrapperVariantsProps = VariantProps<
  typeof fieldWrapperVariants
>;

// ============================================================================
// Label Variants
// ============================================================================

export const labelVariants = cva("font-medium transition-colors", {
  variants: {
    size: {
      sm: "text-xs",
      md: "text-sm",
      lg: "text-base",
    },
    required: {
      true: "after:content-['*'] after:ml-0.5 after:text-destructive",
      false: "",
    },
    disabled: {
      true: "text-muted-foreground",
      false: "text-foreground",
    },
    variant: {
      default: "",
      floating: "absolute left-3 transition-all duration-200",
    },
  },
  defaultVariants: {
    size: "md",
    required: false,
    disabled: false,
    variant: "default",
  },
});

export type LabelVariantsProps = VariantProps<typeof labelVariants>;

// ============================================================================
// Input Variants
// ============================================================================

export const inputVariants = cva(
  "w-full rounded-md border bg-background px-3 py-2 text-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "border-input",
        filled: "border-transparent bg-muted",
        outline: "border-2 border-input",
      },
      inputSize: {
        sm: "h-8 px-2 py-1 text-xs",
        md: "h-10 px-3 py-2 text-sm",
        lg: "h-12 px-4 py-3 text-base",
      },
      state: {
        default:
          "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        error: "border-destructive focus:ring-destructive",
        success: "border-green-500 focus:ring-green-500",
      },
    },
    defaultVariants: {
      variant: "default",
      inputSize: "md",
      state: "default",
    },
  },
);

export type InputVariantsProps = VariantProps<typeof inputVariants>;

// ============================================================================
// Error Message Variants
// ============================================================================

export const errorVariants = cva(
  "flex items-center gap-1 animate-in fade-in-50 slide-in-from-top-1",
  {
    variants: {
      size: {
        sm: "text-xs",
        md: "text-sm",
        lg: "text-base",
      },
    },
    defaultVariants: {
      size: "sm",
    },
  },
);

export type ErrorVariantsProps = VariantProps<typeof errorVariants>;

// ============================================================================
// Help Text Variants
// ============================================================================

export const helpTextVariants = cva("transition-colors", {
  variants: {
    size: {
      sm: "text-xs",
      md: "text-sm",
      lg: "text-base",
    },
  },
  defaultVariants: {
    size: "sm",
  },
});

export type HelpTextVariantsProps = VariantProps<typeof helpTextVariants>;

// ============================================================================
// Form Section Variants
// ============================================================================

export const formSectionVariants = cva("w-full", {
  variants: {
    variant: {
      default: "",
      bordered: "rounded-lg border p-4",
      card: "rounded-lg border bg-card p-6 shadow-sm",
    },
    spacing: {
      sm: "space-y-3",
      md: "space-y-4",
      lg: "space-y-6",
    },
  },
  defaultVariants: {
    variant: "default",
    spacing: "md",
  },
});

export type FormSectionVariantsProps = VariantProps<typeof formSectionVariants>;

// ============================================================================
// Button Variants (for submit button)
// ============================================================================

export const submitButtonVariants = cva(
  "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        ghost: "hover:bg-accent hover:text-accent-foreground",
      },
      size: {
        sm: "h-9 px-3 text-sm",
        md: "h-10 px-4 py-2",
        lg: "h-11 px-8 text-base",
      },
      fullWidth: {
        true: "w-full",
        false: "",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
      fullWidth: false,
    },
  },
);

export type SubmitButtonVariantsProps = VariantProps<
  typeof submitButtonVariants
>;

// ============================================================================
// Grid Layout Variants
// ============================================================================

export const gridLayoutVariants = cva("grid w-full", {
  variants: {
    columns: {
      1: "grid-cols-1",
      2: "grid-cols-1 md:grid-cols-2",
      3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
      4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
      6: "grid-cols-1 md:grid-cols-3 lg:grid-cols-6",
      12: "grid-cols-1 md:grid-cols-6 lg:grid-cols-12",
    },
    gap: {
      sm: "gap-2",
      md: "gap-4",
      lg: "gap-6",
    },
  },
  defaultVariants: {
    columns: 1,
    gap: "md",
  },
});

export type GridLayoutVariantsProps = VariantProps<typeof gridLayoutVariants>;

// ============================================================================
// Flex Layout Variants
// ============================================================================

export const flexLayoutVariants = cva("flex w-full", {
  variants: {
    direction: {
      row: "flex-row",
      column: "flex-col",
      rowReverse: "flex-row-reverse",
      columnReverse: "flex-col-reverse",
    },
    align: {
      start: "items-start",
      center: "items-center",
      end: "items-end",
      stretch: "items-stretch",
    },
    justify: {
      start: "justify-start",
      center: "justify-center",
      end: "justify-end",
      between: "justify-between",
      around: "justify-around",
    },
    wrap: {
      wrap: "flex-wrap",
      nowrap: "flex-nowrap",
      wrapReverse: "flex-wrap-reverse",
    },
    gap: {
      sm: "gap-2",
      md: "gap-4",
      lg: "gap-6",
    },
  },
  defaultVariants: {
    direction: "column",
    align: "stretch",
    justify: "start",
    wrap: "nowrap",
    gap: "md",
  },
});

export type FlexLayoutVariantsProps = VariantProps<typeof flexLayoutVariants>;
