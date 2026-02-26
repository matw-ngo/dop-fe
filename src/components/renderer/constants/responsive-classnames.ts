/**
 * Utility functions for converting responsive configurations to Tailwind classes
 */

import type { ResponsiveValue } from "../types/ui-theme";

/**
 * Convert a responsive value to Tailwind responsive classes
 *
 * @param value - The responsive value with breakpoints
 * @param classMap - Function to convert value to class
 * @returns String of responsive classes
 */
export function getResponsiveClasses<T>(
  value: ResponsiveValue<T>,
  classMap: (val: T) => string,
): string {
  const classes: string[] = [];
  const responsiveValue: {
    initial?: T;
    sm?: T;
    md?: T;
    lg?: T;
    xl?: T;
    "2xl"?: T;
  } | null =
    typeof value === "object" && value !== null && !Array.isArray(value)
      ? (value as {
          initial?: T;
          sm?: T;
          md?: T;
          lg?: T;
          xl?: T;
          "2xl"?: T;
        })
      : null;

  if (!responsiveValue) {
    classes.push(classMap(value as T));
    return classes.join(" ");
  }

  // Initial (mobile first)
  if (responsiveValue.initial !== undefined) {
    classes.push(classMap(responsiveValue.initial));
  }

  // Tablet breakpoint
  if (responsiveValue.md !== undefined) {
    classes.push(`md:${classMap(responsiveValue.md)}`);
  }

  // Desktop breakpoint
  if (responsiveValue.lg !== undefined) {
    classes.push(`lg:${classMap(responsiveValue.lg)}`);
  }

  // Large desktop breakpoint
  if (responsiveValue.xl !== undefined) {
    classes.push(`xl:${classMap(responsiveValue.xl)}`);
  }

  // Extra large desktop breakpoint
  if (responsiveValue["2xl"] !== undefined) {
    classes.push(`2xl:${classMap(responsiveValue["2xl"])}`);
  }

  return classes.join(" ");
}

/**
 * Get responsive width classes
 */
export function getResponsiveWidth(value: ResponsiveValue<string>): string {
  return getResponsiveClasses(value, (val) => {
    // Handle common width patterns
    if (val === "full") return "w-full";
    if (val === "1/2") return "w-1/2";
    if (val === "1/3") return "w-1/3";
    if (val === "2/3") return "w-2/3";
    if (val === "1/4") return "w-1/4";
    if (val === "3/4") return "w-3/4";
    if (val.startsWith("max-w-")) return val;
    if (val.startsWith("w-")) return val;

    // Default case
    return `w-[${val}]`;
  });
}

/**
 * Get responsive padding classes
 */
export function getResponsivePadding(value: ResponsiveValue<string>): string {
  return getResponsiveClasses(value, (val) => {
    // Handle common padding patterns
    if (val.startsWith("p-")) return val;
    if (val.startsWith("px-")) return val;
    if (val.startsWith("py-")) return val;
    if (val.startsWith("pt-")) return val;
    if (val.startsWith("pb-")) return val;
    if (val.startsWith("pl-")) return val;
    if (val.startsWith("pr-")) return val;

    // Default case
    return `p-[${val}]`;
  });
}

/**
 * Get responsive margin classes
 */
export function getResponsiveMargin(value: ResponsiveValue<string>): string {
  return getResponsiveClasses(value, (val) => {
    // Handle common margin patterns
    if (val.startsWith("m-")) return val;
    if (val.startsWith("mx-")) return val;
    if (val.startsWith("my-")) return val;
    if (val.startsWith("mt-")) return val;
    if (val.startsWith("mb-")) return val;
    if (val.startsWith("ml-")) return val;
    if (val.startsWith("mr-")) return val;

    // Default case
    return `m-[${val}]`;
  });
}

/**
 * Get responsive display classes
 */
export function getResponsiveDisplay(value: ResponsiveValue<string>): string {
  return getResponsiveClasses(value, (val) => {
    // Handle display values
    if (["block", "flex", "grid", "hidden"].includes(val)) {
      return val === "hidden" ? "hidden" : `${val}`;
    }

    return `d-[${val}]`;
  });
}
