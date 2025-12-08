import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import {
  VariantFactoryConfig,
  COMMON_SIZES,
  COMMON_COLORS,
  COMMON_VARIANTS,
  COMMON_STATES,
  ANIMATION_PRESETS,
} from "./variant-types";
import { AnimationVariant, ComponentVariant } from "../types/ui-theme";

/**
 * Utility to merge class names with Tailwind classes
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Create variant classes based on configuration
 */
export function createVariantClasses(
  variant: Partial<ComponentVariant>,
  config: VariantFactoryConfig,
): string {
  const classes = [];

  // Base class
  if (config.baseClass) {
    classes.push(config.baseClass);
  }

  // Size variant
  if (variant.size && config.sizes?.[variant.size]) {
    const sizeClasses = config.sizes[variant.size];
    classes.push(
      typeof sizeClasses === "string" ? sizeClasses : cn(sizeClasses),
    );
  } else if (variant.size && COMMON_SIZES[variant.size]) {
    const sizeStyles = COMMON_SIZES[variant.size];
    classes.push(cn(sizeStyles));
  }

  // Color variant
  if (variant.color && config.colors?.[variant.color]) {
    const colorClasses = config.colors[variant.color];
    classes.push(
      typeof colorClasses === "string" ? colorClasses : cn(colorClasses),
    );
  }

  // Style variant
  if (variant.variant && config.variants?.[variant.variant]) {
    const variantClasses = config.variants[variant.variant];
    classes.push(
      typeof variantClasses === "string" ? variantClasses : cn(variantClasses),
    );
  }

  // State variant
  if (variant.state && config.states?.[variant.state]) {
    const stateClasses = config.states[variant.state];
    classes.push(
      typeof stateClasses === "string" ? stateClasses : cn(stateClasses),
    );
  }

  return cn(classes);
}

/**
 * Create animation classes based on variant
 */
export function createAnimationClasses(
  animation: AnimationVariant | undefined,
): {
  className: string;
  style: React.CSSProperties;
} {
  if (!animation || !animation.type) {
    return { className: "", style: {} };
  }

  const preset = ANIMATION_PRESETS[animation.type];
  if (!preset) {
    return { className: "", style: {} };
  }

  // Build animation name with direction
  let animationName = preset.keyframes;
  if (animation.direction && animation.direction !== "center") {
    animationName = `${animation.type}-${animation.direction}`;
  }

  // Build CSS animation property
  const animationParts = [animationName];

  if (animation.duration || preset.duration) {
    animationParts.push(
      animation.duration || preset.duration || "var(--duration-200)",
    );
  }

  if (animation.easing || preset.easing) {
    animationParts.push(
      animation.easing || preset.easing || "var(--easing-in-out)",
    );
  }

  if (animation.delay) {
    animationParts.push(animation.delay);
  }

  // Add fill mode
  animationParts.push("both");

  const className = `animate-${animation.type}`;
  const style: React.CSSProperties = {
    animation: animationParts.join(" "),
  };

  return { className, style };
}

/**
 * Create a variant factory for components
 */
export function createVariantFactory<T extends VariantFactoryConfig>(
  config: T,
) {
  return {
    /**
     * Get class names for given variant props
     */
    getClassNames: (variant: Partial<ComponentVariant>) => {
      return createVariantClasses(variant, config);
    },

    /**
     * Get default props with variants applied
     */
    getProps: (variant: Partial<ComponentVariant>) => {
      const classNames = createVariantClasses(variant, config);
      const { className, style } = createAnimationClasses(variant.animation);

      return {
        className: cn(classNames, className),
        style: {
          ...variant.style,
          ...style,
        },
        "data-size": variant.size || config.defaultProps?.size,
        "data-color": variant.color || config.defaultProps?.color,
        "data-variant": variant.variant || config.defaultProps?.variant,
        "data-state": variant.state || config.defaultProps?.state,
      };
    },

    /**
     * Get responsive styles
     */
    getResponsiveStyles: (variant: Partial<ComponentVariant>) => {
      const styles: React.CSSProperties = {};

      if (variant.responsive?.width) {
        styles.width = getResponsiveValue(variant.responsive.width);
      }

      if (variant.responsive?.height) {
        styles.height = getResponsiveValue(variant.responsive.height);
      }

      if (variant.responsive?.display) {
        styles.display = getResponsiveValue(variant.responsive.display);
      }

      return styles;
    },

    /**
     * Get layout styles
     */
    getLayoutStyles: (variant: Partial<ComponentVariant>) => {
      const styles: React.CSSProperties = {};

      if (variant.layout?.display) {
        styles.display = variant.layout.display as any;
      }

      if (variant.layout?.direction) {
        styles.flexDirection = variant.layout.direction as any;
      }

      if (variant.layout?.align) {
        styles.alignItems = getAlignValue(variant.layout.align);
      }

      if (variant.layout?.justify) {
        styles.justifyContent = getJustifyValue(variant.layout.justify);
      }

      if (variant.layout?.wrap) {
        styles.flexWrap = variant.layout.wrap as any;
      }

      if (variant.layout?.gap) {
        styles.gap = `var(--spacing-${variant.layout.gap})`;
      }

      if (variant.layout?.padding) {
        styles.padding = `var(--spacing-${variant.layout.padding})`;
      }

      if (variant.layout?.margin) {
        styles.margin = `var(--spacing-${variant.layout.margin})`;
      }

      return styles;
    },
  };
}

/**
 * Helper to convert responsive value to CSS
 */
function getResponsiveValue(value: any): string {
  if (typeof value === "string") {
    return value;
  }

  if (typeof value === "object" && value !== null) {
    // For now, return the largest breakpoint value
    // In a full implementation, this would generate media queries
    const breakpoints = ["2xl", "xl", "lg", "md", "sm"];
    for (const bp of breakpoints) {
      if (value[bp]) {
        return value[bp];
      }
    }
    return value.initial || "";
  }

  return String(value || "");
}

/**
 * Helper to convert align value to CSS
 */
function getAlignValue(align: string): string {
  const alignMap: Record<string, string> = {
    start: "flex-start",
    center: "center",
    end: "flex-end",
    stretch: "stretch",
    baseline: "baseline",
  };
  return alignMap[align] || align;
}

/**
 * Helper to convert justify value to CSS
 */
function getJustifyValue(justify: string): string {
  const justifyMap: Record<string, string> = {
    start: "flex-start",
    center: "center",
    end: "flex-end",
    between: "space-between",
    around: "space-around",
    evenly: "space-evenly",
  };
  return justifyMap[justify] || justify;
}

/**
 * Default variant factory for common components
 */
export const defaultVariantFactory = createVariantFactory({
  baseClass: "component-variant",
  defaultProps: {
    size: "md",
    color: "primary",
    variant: "solid",
    state: "default",
  },
  sizes: COMMON_SIZES,
  colors: COMMON_COLORS,
  variants: COMMON_VARIANTS,
  states: COMMON_STATES,
});
