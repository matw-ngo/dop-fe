import type {
  AnimationVariant,
  ComponentVariant,
} from "@/components/renderer/types/ui-theme";

/**
 * Default field variant sizes
 */
export type FieldSize = ComponentVariant["size"];
export type FieldColor = ComponentVariant["color"];
export type FieldVariant = ComponentVariant["variant"];

/**
 * Default animation types
 */
export type AnimationType = AnimationVariant["type"];
export type AnimationDirection = AnimationVariant["direction"];

/**
 * Create a standardized field variant configuration
 */
export function createFieldVariant(
  size: FieldSize = "md",
  color: FieldColor = "primary",
  variant: FieldVariant = "outline",
): ComponentVariant {
  return {
    size,
    color,
    variant,
  };
}

/**
 * Create a standardized animation configuration
 */
export function createFieldAnimation(
  type: AnimationType = "fade",
  direction: AnimationDirection = "up",
  duration: AnimationVariant["duration"] = 300,
): AnimationVariant {
  return {
    type,
    direction,
    duration,
    easing: "out",
  };
}

/**
 * Pre-defined field variants for common use cases
 */
export const FIELD_VARIANTS = {
  /**
   * Standard input field variant
   */
  DEFAULT: createFieldVariant("sm", "primary", "outline"),

  /**
   * Large input field for important data
   */
  LARGE: createFieldVariant("lg", "primary", "solid"),

  /**
   * Compact field for dense layouts
   */
  COMPACT: createFieldVariant("sm", "secondary", "ghost"),

  /**
   * Full width field
   */
  FULL_WIDTH: createFieldVariant("md", "primary", "outline"),
} as const;

/**
 * Pre-defined animation variants
 */
export const FIELD_ANIMATIONS = {
  /**
   * Quick fade in animation
   */
  FADE_IN: createFieldAnimation("fade", "up", 150),

  /**
   * Slide up animation
   */
  SLIDE_UP: createFieldAnimation("slide", "up", 300),

  /**
   * Scale in animation
   */
  SCALE_IN: createFieldAnimation("scale", "up", 200),

  /**
   * Bounce in for attention-grabbing fields
   */
  BOUNCE_IN: createFieldAnimation("bounce", "up", 500),
} as const;

/**
 * Responsive layout configurations
 */
export const LAYOUT_CONFIG = {
  /**
   * Default field layout
   */
  DEFAULT: {
    display: "block" as const,
    padding: "p-2",
  },

  /**
   * Compact layout for forms with many fields
   */
  COMPACT: {
    display: "block" as const,
    padding: "p-1",
  },

  /**
   * Spacious layout for important sections
   */
  SPACIOUS: {
    display: "block" as const,
    padding: "p-4",
  },
} as const;

/**
 * Grid span configurations for responsive layouts
 */
export const GRID_SPANS = {
  /**
   * Single column field
   */
  SINGLE: "col-span-1",

  /**
   * Two columns on large screens
   */
  HALF_WIDTH: "col-span-1 lg:col-span-2",

  /**
   * Full width field
   */
  FULL_WIDTH: "col-span-1 lg:col-span-4",

  /**
   * Three-quarters width
   */
  THREE_QUARTERS: "col-span-1 lg:col-span-3",
} as const;

/**
 * Get a complete field configuration with variant and animation
 */
export function getFieldConfig(
  variant: ComponentVariant = FIELD_VARIANTS.DEFAULT,
  animation: AnimationVariant = FIELD_ANIMATIONS.FADE_IN,
  layout = LAYOUT_CONFIG.DEFAULT,
) {
  return {
    variant,
    animation,
    layout,
  };
}
