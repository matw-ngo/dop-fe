import type { VariantFactoryConfig } from "./variant-types";

// Input-specific size configurations
export const INPUT_SIZES = {
  xs: {
    fontSize: "var(--font-size-xs)",
    padding: "var(--spacing-1) var(--spacing-2)",
    height: "1.75rem",
    minHeight: "1.75rem",
    borderRadius: "var(--radius-sm)",
  },
  sm: {
    fontSize: "var(--font-size-sm)",
    padding: "var(--spacing-1-5) var(--spacing-2-5)",
    height: "2.25rem",
    minHeight: "2.25rem",
    borderRadius: "var(--radius-sm)",
  },
  md: {
    fontSize: "var(--font-size-base)",
    padding: "var(--spacing-2) var(--spacing-3)",
    height: "2.5rem",
    minHeight: "2.5rem",
    borderRadius: "var(--radius-DEFAULT)",
  },
  lg: {
    fontSize: "var(--font-size-lg)",
    padding: "var(--spacing-2-5) var(--spacing-3-5)",
    height: "3rem",
    minHeight: "3rem",
    borderRadius: "var(--radius-md)",
  },
  xl: {
    fontSize: "var(--font-size-xl)",
    padding: "var(--spacing-3) var(--spacing-4)",
    height: "3.5rem",
    minHeight: "3.5rem",
    borderRadius: "var(--radius-md)",
  },
} as const;

// Input color configurations
export const INPUT_COLORS = {
  default: {
    backgroundColor: "var(--bg-primary)",
    color: "var(--text-primary)",
    borderColor: "var(--border-primary)",
    placeholderColor: "var(--text-tertiary)",
  },
  primary: {
    backgroundColor: "var(--bg-primary)",
    color: "var(--text-primary)",
    borderColor: "var(--color-primary-300)",
    placeholderColor: "var(--text-tertiary)",
  },
  secondary: {
    backgroundColor: "var(--bg-secondary)",
    color: "var(--text-primary)",
    borderColor: "var(--border-secondary)",
    placeholderColor: "var(--text-secondary)",
  },
  success: {
    backgroundColor: "var(--bg-primary)",
    color: "var(--text-primary)",
    borderColor: "var(--color-success)",
    placeholderColor: "var(--text-tertiary)",
  },
  warning: {
    backgroundColor: "var(--bg-primary)",
    color: "var(--text-primary)",
    borderColor: "var(--color-warning)",
    placeholderColor: "var(--text-tertiary)",
  },
  error: {
    backgroundColor: "var(--bg-primary)",
    color: "var(--text-primary)",
    borderColor: "var(--color-error)",
    placeholderColor: "var(--text-tertiary)",
  },
} as const;

// Input variant configurations
export const INPUT_VARIANTS = {
  outline: {
    borderWidth: "1px",
    borderStyle: "solid",
    backgroundColor: "var(--bg-primary)",
    "&:hover": {
      borderColor: "var(--border-focus)",
    },
    "&:focus": {
      borderColor: "var(--color-primary-500)",
      boxShadow: "0 0 0 1px var(--color-primary-500)",
    },
  },
  filled: {
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: "transparent",
    backgroundColor: "var(--bg-secondary)",
    "&:hover": {
      backgroundColor: "var(--bg-tertiary)",
    },
    "&:focus": {
      borderColor: "var(--color-primary-500)",
      backgroundColor: "var(--bg-primary)",
      boxShadow: "0 0 0 1px var(--color-primary-500)",
    },
  },
  flushed: {
    borderWidth: "0",
    borderBottomWidth: "1px",
    borderBottomStyle: "solid",
    borderBottomColor: "var(--border-primary)",
    borderRadius: "0",
    backgroundColor: "transparent",
    "&:hover": {
      borderBottomColor: "var(--border-focus)",
    },
    "&:focus": {
      borderBottomColor: "var(--color-primary-500)",
      boxShadow: "0 1px 0 var(--color-primary-500)",
    },
  },
  unstyled: {
    borderWidth: "0",
    backgroundColor: "transparent",
    color: "var(--text-primary)",
    "&:hover": {
      backgroundColor: "var(--bg-tertiary)",
    },
    "&:focus": {
      outline: "1px solid var(--color-primary-500)",
      outlineOffset: "2px",
    },
  },
} as const;

// Input state configurations
export const INPUT_STATES = {
  default: {},
  hover: {
    borderColor: "var(--border-focus)",
  },
  focus: {
    borderColor: "var(--color-primary-500)",
    boxShadow: "0 0 0 1px var(--color-primary-500)",
    outline: "none",
  },
  error: {
    borderColor: "var(--color-error)",
    boxShadow: "0 0 0 1px var(--color-error)",
  },
  disabled: {
    backgroundColor: "var(--bg-tertiary)",
    color: "var(--text-disabled)",
    borderColor: "var(--border-secondary)",
    cursor: "not-allowed",
    opacity: "0.6",
  },
  readonly: {
    backgroundColor: "var(--bg-secondary)",
    color: "var(--text-secondary)",
    borderColor: "var(--border-secondary)",
    cursor: "default",
  },
} as const;

// Input variant factory configuration
export const inputVariantConfig: VariantFactoryConfig = {
  baseClass: "field-input",
  defaultProps: {
    size: "md",
    color: "default",
    variant: "outline",
    state: "default",
  },
  sizes: INPUT_SIZES,
  colors: INPUT_COLORS,
  variants: INPUT_VARIANTS,
  states: INPUT_STATES,
};

// Textarea-specific configurations
export const TEXTAREA_SIZES = {
  xs: {
    fontSize: "var(--font-size-xs)",
    padding: "var(--spacing-1-5) var(--spacing-2)",
    minHeight: "4rem",
    borderRadius: "var(--radius-sm)",
  },
  sm: {
    fontSize: "var(--font-size-sm)",
    padding: "var(--spacing-2) var(--spacing-2-5)",
    minHeight: "5rem",
    borderRadius: "var(--radius-sm)",
  },
  md: {
    fontSize: "var(--font-size-base)",
    padding: "var(--spacing-2-5) var(--spacing-3)",
    minHeight: "6rem",
    borderRadius: "var(--radius-DEFAULT)",
  },
  lg: {
    fontSize: "var(--font-size-lg)",
    padding: "var(--spacing-3) var(--spacing-3-5)",
    minHeight: "8rem",
    borderRadius: "var(--radius-md)",
  },
  xl: {
    fontSize: "var(--font-size-xl)",
    padding: "var(--spacing-3-5) var(--spacing-4)",
    minHeight: "10rem",
    borderRadius: "var(--radius-md)",
  },
} as const;

// Textarea variant factory configuration
export const textareaVariantConfig: VariantFactoryConfig = {
  ...inputVariantConfig,
  defaultProps: {
    size: "md",
    color: "default",
    variant: "outline",
    state: "default",
  },
  sizes: TEXTAREA_SIZES,
};

// Select-specific configurations
export const SELECT_SIZES = {
  xs: {
    fontSize: "var(--font-size-xs)",
    padding:
      "var(--spacing-1) var(--spacing-8) var(--spacing-1) var(--spacing-2)",
    height: "1.75rem",
    minHeight: "1.75rem",
  },
  sm: {
    fontSize: "var(--font-size-sm)",
    padding:
      "var(--spacing-1-5) var(--spacing-9) var(--spacing-1-5) var(--spacing-2-5)",
    height: "2.25rem",
    minHeight: "2.25rem",
  },
  md: {
    fontSize: "var(--font-size-base)",
    padding:
      "var(--spacing-2) var(--spacing-10) var(--spacing-2) var(--spacing-3)",
    height: "2.5rem",
    minHeight: "2.5rem",
  },
  lg: {
    fontSize: "var(--font-size-lg)",
    padding:
      "var(--spacing-2-5) var(--spacing-11) var(--spacing-2-5) var(--spacing-3-5)",
    height: "3rem",
    minHeight: "3rem",
  },
  xl: {
    fontSize: "var(--font-size-xl)",
    padding:
      "var(--spacing-3) var(--spacing-12) var(--spacing-3) var(--spacing-4)",
    height: "3.5rem",
    minHeight: "3.5rem",
  },
} as const;

// Select variant factory configuration
export const selectVariantConfig: VariantFactoryConfig = {
  ...inputVariantConfig,
  defaultProps: {
    size: "md",
    color: "default",
    variant: "outline",
    state: "default",
  },
  sizes: SELECT_SIZES,
};
