import type { ComponentVariant, LayoutProps } from "../types/ui-theme";
import { cn } from "@/lib/utils";

/**
 * Utility functions for generating CSS classes and styles for field components
 */

/**
 * Generates responsive CSS classes from responsive configuration
 */
export function generateResponsiveClasses(
  responsive?: Record<string, any>,
): string {
  if (!responsive) return "";

  const classes: string[] = [];

  Object.entries(responsive).forEach(([breakpoint, value]) => {
    if (typeof value === "string") {
      if (breakpoint === "initial") {
        classes.push(value);
      } else {
        classes.push(`${breakpoint}:${value}`);
      }
    }
  });

  return classes.join(" ");
}

/**
 * Generates layout CSS classes from layout configuration
 */
export function generateLayoutClasses(layout?: LayoutProps | string): string {
  if (!layout) return "";

  // If layout is a string, just return it
  if (typeof layout === "string") {
    return layout;
  }

  const classes: string[] = [];

  if (layout.display) {
    classes.push(layout.display);
  }

  if (layout.justify) {
    classes.push(`justify-${layout.justify}`);
  }

  if (layout.align) {
    classes.push(`items-${layout.align}`);
  }

  if (layout.direction) {
    classes.push(`flex-${layout.direction}`);
  }

  if (layout.gap) {
    classes.push(`gap-${String(layout.gap)}`);
  }

  if (layout.padding) {
    classes.push(String(layout.padding));
  }

  if (layout.margin) {
    classes.push(String(layout.margin));
  }

  return classes.join(" ");
}

/**
 * Generates variant CSS classes from variant configuration
 */
export function generateVariantClasses(variant?: ComponentVariant): string {
  if (!variant) return "";

  const classes: string[] = [];

  if (variant.size) {
    classes.push(`variant-${variant.size}`);
  }

  if (variant.color) {
    classes.push(`variant-${variant.color}`);
  }

  if (variant.variant) {
    classes.push(`variant-${variant.variant}`);
  }

  return classes.join(" ");
}

/**
 * Combines multiple CSS class sources with proper priority
 */
export function combineFieldClasses(
  baseClasses?: string,
  responsiveClasses?: string,
  layoutClasses?: string,
  variantClasses?: string,
  additionalClasses?: string,
): string {
  return cn(
    "field-container",
    baseClasses,
    responsiveClasses,
    layoutClasses,
    variantClasses,
    additionalClasses,
  );
}

/**
 * Generates animation CSS classes from animation configuration
 */
export function generateAnimationClasses(animation?: {
  type?: "fade" | "slide" | "scale" | "bounce";
  delay?: number;
  duration?: number;
}): string {
  if (!animation?.type) return "";

  const classes: string[] = [];

  // Animation type class
  classes.push(`animate-${animation.type}`);

  // Animation delay if specified
  if (animation.delay) {
    classes.push(`animation-delay-${animation.delay}ms`);
  }

  // Animation duration if specified
  if (animation.duration) {
    classes.push(`animation-duration-${animation.duration}ms`);
  }

  return classes.join(" ");
}
