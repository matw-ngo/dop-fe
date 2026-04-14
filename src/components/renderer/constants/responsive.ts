import type {
  Breakpoint,
  BreakpointConfig,
  MediaQueryConfig,
  ResolvedStyles,
  ResponsiveFieldConfig,
  ResponsiveStyles,
  ResponsiveValue,
} from "../types/responsive";

// Default breakpoint values in pixels
export const defaultBreakpoints: BreakpointConfig = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
};

// Minimum breakpoint values for media queries
export const minBreakpoints: BreakpointConfig = {
  sm: 0,
  md: 640,
  lg: 768,
  xl: 1024,
  "2xl": 1280,
};

// Maximum breakpoint values for media queries
export const maxBreakpoints: BreakpointConfig = {
  sm: 639,
  md: 767,
  lg: 1023,
  xl: 1279,
  "2xl": 1535,
};

/**
 * Check if a value is a responsive object
 */
export function isResponsiveValue<T>(
  value: ResponsiveValue<T>,
): value is Record<string, T> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * Get the initial value from a responsive value
 */
export function getInitialValue<T>(value: ResponsiveValue<T>): T {
  if (isResponsiveValue(value)) {
    return (
      value.initial ??
      value.sm ??
      value.md ??
      value.lg ??
      value.xl ??
      value["2xl"] ??
      null
    );
  }
  return value;
}

/**
 * Generate a media query string for a breakpoint
 */
export function createMediaQuery(
  breakpoint: Breakpoint,
  minMax: "min" | "max" = "min",
): string {
  const value =
    minMax === "min" ? minBreakpoints[breakpoint] : maxBreakpoints[breakpoint];
  return `(${minMax}-width: ${value}px)`;
}

/**
 * Generate responsive class names
 */
export function getResponsiveClassNames(
  value: ResponsiveValue<any>,
  prefix: string,
  suffix?: string,
): string[] {
  const classes: string[] = [];

  if (isResponsiveValue(value)) {
    // Add initial value class
    if (value.initial !== undefined) {
      classes.push(`${prefix}${value.initial}${suffix ? `-${suffix}` : ""}`);
    }

    // Add breakpoint-specific classes
    Object.keys(value).forEach((bp) => {
      if (bp !== "initial" && value[bp as keyof typeof value] !== undefined) {
        classes.push(
          `${bp}:${prefix}${value[bp as keyof typeof value]}${suffix ? `-${suffix}` : ""}`,
        );
      }
    });
  } else {
    // Single value
    classes.push(`${prefix}${value}${suffix ? `-${suffix}` : ""}`);
  }

  return classes;
}

/**
 * Convert responsive styles to CSS with media queries
 */
export function resolveResponsiveStyles(
  styles: ResponsiveStyles,
): ResolvedStyles {
  const className: string[] = [];
  const style: React.CSSProperties = {};
  const mediaQueries: MediaQueryConfig[] = [];

  Object.entries(styles).forEach(([property, value]) => {
    if (!value) return;

    if (isResponsiveValue(value)) {
      // Add initial value to style
      const initialValue = getInitialValue(value);
      if (initialValue !== null && initialValue !== undefined) {
        style[property] = initialValue as any;
      }

      // Add breakpoint-specific media queries
      Object.keys(value).forEach((bp) => {
        if (bp !== "initial" && value[bp as keyof typeof value] !== undefined) {
          const query = createMediaQuery(bp as Breakpoint);
          mediaQueries.push({
            query,
            breakpoint: bp as Breakpoint,
            value: { [property]: value[bp as keyof typeof value] },
          });
        }
      });
    } else {
      // Single value
      style[property] = value as any;
    }
  });

  return {
    className: className.join(" "),
    style,
    mediaQueries,
  };
}

/**
 * Generate responsive width classes
 */
export function getResponsiveWidthClasses(
  width: ResponsiveFieldConfig["width"],
): string[] {
  if (!width) return [];

  const classes: string[] = [];

  if (isResponsiveValue(width)) {
    if (width.initial !== undefined) {
      classes.push(mapWidthToClass(width.initial));
    }

    Object.keys(width).forEach((bp) => {
      if (bp !== "initial" && width[bp as keyof typeof width] !== undefined) {
        classes.push(
          `${bp}:${mapWidthToClass(width[bp as keyof typeof width] as any)}`,
        );
      }
    });
  } else {
    classes.push(mapWidthToClass(width));
  }

  return classes;
}

/**
 * Map width value to Tailwind class
 */
function mapWidthToClass(width: ResponsiveFieldConfig["width"]): string {
  if (typeof width === "string") {
    if (width === "full") return "w-full";
    if (width === "1/2") return "w-1/2";
    if (width === "1/3") return "w-1/3";
    if (width === "2/3") return "w-2/3";
    if (width === "1/4") return "w-1/4";
    if (width === "3/4") return "w-3/4";
    if (width.startsWith("w-")) return width;
    return `w-${width}`;
  }

  if (typeof width === "number") {
    return `w-${width}`;
  }

  return "w-auto";
}

/**
 * Generate responsive order classes
 */
export function getResponsiveOrderClasses(
  order: ResponsiveFieldConfig["order"],
): string[] {
  if (!order) return [];

  return getResponsiveClassNames(order, "order-");
}

/**
 * Generate responsive display classes
 */
export function getResponsiveDisplayClasses(
  display: ResponsiveFieldConfig["display"],
): string[] {
  if (!display) return [];

  const classes: string[] = [];

  if (isResponsiveValue(display)) {
    if (display.initial !== undefined) {
      classes.push(mapDisplayToClass(display.initial));
    }

    Object.keys(display).forEach((bp) => {
      if (
        bp !== "initial" &&
        display[bp as keyof typeof display] !== undefined
      ) {
        classes.push(
          `${bp}:${mapDisplayToClass(display[bp as keyof typeof display] as any)}`,
        );
      }
    });
  } else {
    classes.push(mapDisplayToClass(display));
  }

  return classes;
}

/**
 * Map display value to Tailwind class
 */
function mapDisplayToClass(
  display: "none" | "block" | "flex" | "grid",
): string {
  switch (display) {
    case "none":
      return "hidden";
    case "block":
      return "block";
    case "flex":
      return "flex";
    case "grid":
      return "grid";
    default:
      return "block";
  }
}

/**
 * Generate responsive spacing classes
 */
export function getResponsiveSpacingClasses(
  spacing: ResponsiveFieldConfig["margin"],
  type: "m" | "p" = "m",
): string[] {
  if (!spacing) return [];

  const prefix = type === "m" ? "m" : "p";
  return getResponsiveClassNames(spacing, prefix, "-");
}

/**
 * Apply responsive styles to an element
 */
export function applyResponsiveStyles(
  element: HTMLElement,
  mediaQueries: MediaQueryConfig[],
): void {
  // Create style element for media queries
  if (mediaQueries.length > 0) {
    const styleId = "responsive-styles";
    let styleElement = document.getElementById(styleId) as HTMLStyleElement;

    if (!styleElement) {
      styleElement = document.createElement("style");
      styleElement.id = styleId;
      document.head.appendChild(styleElement);
    }

    // Add media query rules
    mediaQueries.forEach(({ query, value }) => {
      const rules: string[] = [];

      Object.entries(value).forEach(([property, propValue]) => {
        const cssProperty = property.replace(/([A-Z])/g, "-$1").toLowerCase();
        rules.push(`  ${cssProperty}: ${propValue};`);
      });

      if (rules.length > 0) {
        const cssRule = `
@media ${query} {
  [data-responsive-id="${element.dataset.responsiveId}"] {
${rules.join("\n")}
  }
}`;
        styleElement.textContent += cssRule;
      }
    });

    // Add unique ID to element
    if (!element.dataset.responsiveId) {
      element.dataset.responsiveId = Math.random().toString(36).substr(2, 9);
    }
  }
}

/**
 * Create a responsive configuration object
 */
export function createResponsiveConfig<T>(
  initial?: T,
  sm?: T,
  md?: T,
  lg?: T,
  xl?: T,
  xxl?: T,
): ResponsiveValue<T> {
  const config: any = {};

  if (initial !== undefined) config.initial = initial;
  if (sm !== undefined) config.sm = sm;
  if (md !== undefined) config.md = md;
  if (lg !== undefined) config.lg = lg;
  if (xl !== undefined) config.xl = xl;
  if (xxl !== undefined) config["2xl"] = xxl;

  return Object.keys(config).length > 0 ? config : (initial as T);
}

/**
 * Helper to merge responsive values
 */
export function mergeResponsiveValues<T>(
  ...values: (ResponsiveValue<T> | undefined)[]
): ResponsiveValue<T> {
  const result: any = {};

  values.forEach((value) => {
    if (value) {
      if (isResponsiveValue(value)) {
        Object.entries(value).forEach(([key, val]) => {
          if (val !== undefined) {
            result[key] = val;
          }
        });
      } else {
        result.initial = value;
      }
    }
  });

  return Object.keys(result).length > 0 ? result : undefined;
}
