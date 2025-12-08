import { ComponentVariant, AnimationVariant } from "../types/ui-theme";

// Base variant interface
export interface BaseVariantConfig {
  // Size variants
  sizes?: Record<string, Record<string, any>>;

  // Color variants
  colors?: Record<string, Record<string, any>>;

  // Style variants (solid, outline, ghost, etc.)
  variants?: Record<string, Record<string, any>>;

  // State variants (hover, active, disabled, etc.)
  states?: Record<string, Record<string, any>>;
}

// Variant factory configuration
export interface VariantFactoryConfig extends BaseVariantConfig {
  // Default values for each variant type
  defaultProps?: {
    size?: string;
    color?: string;
    variant?: string;
    state?: string;
  };

  // Class name base
  baseClass?: string;

  // Utility function to merge variants
  mergeVariants?: (
    variants: Partial<ComponentVariant>,
    config: VariantFactoryConfig,
  ) => string;
}

// Animation variant configuration
export interface AnimationConfig {
  // Animation types
  types?: Record<
    string,
    {
      keyframes?: string;
      duration?: string;
      easing?: string;
      delay?: string;
    }
  >;

  // Direction modifiers
  directions?: Record<string, string>;

  // Default animation
  default?: {
    type?: string;
    direction?: string;
    duration?: string;
    easing?: string;
  };
}

// Input component variant config
export interface InputVariantConfig extends BaseVariantConfig {
  // Input-specific properties
  inputTypes?: Record<string, Record<string, any>>;

  // Focus states
  focusStates?: Record<string, Record<string, any>>;
}

// Button component variant config
export interface ButtonVariantConfig extends BaseVariantConfig {
  // Button-specific properties
  buttonSizes?: Record<string, Record<string, any>>;

  // Icon button variants
  iconOnly?: boolean;
}

// Common variant definitions
export const COMMON_SIZES = {
  xs: {
    fontSize: "var(--font-size-xs)",
    padding: "var(--spacing-1) var(--spacing-2)",
    height: "1.5rem",
    minHeight: "1.5rem",
  },
  sm: {
    fontSize: "var(--font-size-sm)",
    padding: "var(--spacing-1-5) var(--spacing-3)",
    height: "2rem",
    minHeight: "2rem",
  },
  md: {
    fontSize: "var(--font-size-base)",
    padding: "var(--spacing-2-5) var(--spacing-3-5)",
    height: "2.5rem",
    minHeight: "2.5rem",
  },
  lg: {
    fontSize: "var(--font-size-lg)",
    padding: "var(--spacing-3) var(--spacing-4)",
    height: "3rem",
    minHeight: "3rem",
  },
  xl: {
    fontSize: "var(--font-size-xl)",
    padding: "var(--spacing-3-5) var(--spacing-5)",
    height: "3.5rem",
    minHeight: "3.5rem",
  },
} as const;

export const COMMON_COLORS = {
  primary: {
    backgroundColor: "var(--color-primary-500)",
    color: "var(--text-inverse)",
    borderColor: "var(--color-primary-500)",
  },
  secondary: {
    backgroundColor: "var(--bg-secondary)",
    color: "var(--text-primary)",
    borderColor: "var(--border-primary)",
  },
  success: {
    backgroundColor: "var(--color-success)",
    color: "var(--text-inverse)",
    borderColor: "var(--color-success)",
  },
  warning: {
    backgroundColor: "var(--color-warning)",
    color: "var(--text-inverse)",
    borderColor: "var(--color-warning)",
  },
  error: {
    backgroundColor: "var(--color-error)",
    color: "var(--text-inverse)",
    borderColor: "var(--color-error)",
  },
  info: {
    backgroundColor: "var(--color-info)",
    color: "var(--text-inverse)",
    borderColor: "var(--color-info)",
  },
} as const;

export const COMMON_VARIANTS = {
  solid: {
    // Use color backgrounds
    backgroundColor: "var(--color-bg)",
    color: "var(--color-text)",
  },
  outline: {
    backgroundColor: "transparent",
    color: "var(--color-text)",
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: "var(--color-border)",
  },
  ghost: {
    backgroundColor: "transparent",
    color: "var(--color-text)",
    borderColor: "transparent",
  },
  link: {
    backgroundColor: "transparent",
    color: "var(--color-primary-500)",
    borderColor: "transparent",
    textDecoration: "underline",
  },
} as const;

export const COMMON_STATES = {
  hover: {
    opacity: "0.9",
    transform: "translateY(-1px)",
  },
  active: {
    transform: "translateY(0)",
  },
  focus: {
    outline: "2px solid var(--color-primary-500)",
    outlineOffset: "2px",
  },
  disabled: {
    opacity: "0.5",
    cursor: "not-allowed",
    pointerEvents: "none",
  },
} as const;

export const ANIMATION_PRESETS = {
  fade: {
    keyframes: "fade-in",
    duration: "var(--duration-200)",
    easing: "var(--easing-in-out)",
  },
  "slide-up": {
    keyframes: "slide-in-from-bottom",
    duration: "var(--duration-300)",
    easing: "var(--easing-out)",
  },
  "slide-down": {
    keyframes: "slide-in-from-top",
    duration: "var(--duration-300)",
    easing: "var(--easing-out)",
  },
  "slide-left": {
    keyframes: "slide-in-from-right",
    duration: "var(--duration-300)",
    easing: "var(--easing-out)",
  },
  "slide-right": {
    keyframes: "slide-in-from-left",
    duration: "var(--duration-300)",
    easing: "var(--easing-out)",
  },
  scale: {
    keyframes: "scale-in",
    duration: "var(--duration-200)",
    easing: "var(--easing-bounce-in)",
  },
  bounce: {
    keyframes: "bounce-in",
    duration: "var(--duration-500)",
    easing: "var(--easing-bounce-in)",
  },
} as const;
