import type { ThemeColors, ThemeConfig, ThemeMode } from "./types";

/**
 * Convert camelCase to kebab-case for CSS variables
 */
function camelToKebab(str: string): string {
  return str.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, "$1-$2").toLowerCase();
}

/**
 * Generate CSS variables from theme colors
 */
export function generateCSSVariables(
  colors: ThemeColors,
  prefix = "",
): Record<string, string> {
  const variables: Record<string, string> = {};

  Object.entries(colors).forEach(([key, value]) => {
    const cssVar = `--${prefix}${camelToKebab(key)}`;
    variables[cssVar] = value;
  });

  return variables;
}

/**
 * Apply theme colors to document root
 */
export function applyTheme(
  theme: ThemeConfig,
  mode: "light" | "dark",
  customizations?: Partial<ThemeColors>,
): void {
  if (typeof document === "undefined") return;

  const root = document.documentElement;

  // Get base colors for the mode
  const baseColors = theme.colors[mode];

  // Merge with customizations if provided
  const finalColors = customizations
    ? { ...baseColors, ...customizations }
    : baseColors;

  // Generate and apply CSS variables
  const variables = generateCSSVariables(finalColors);

  Object.entries(variables).forEach(([property, value]) => {
    root.style.setProperty(property, value);
  });

  // Apply radius if specified
  if (theme.radius) {
    root.style.setProperty("--radius", theme.radius);
  }

  // Apply custom fonts if specified
  if (theme.fonts?.sans) {
    root.style.setProperty("--font-sans", theme.fonts.sans);
  }
  if (theme.fonts?.mono) {
    root.style.setProperty("--font-mono", theme.fonts.mono);
  }

  // Apply custom CSS if provided
  if (theme.customCSS) {
    // Remove existing custom theme styles
    const existingStyle = document.getElementById("custom-theme-styles");
    if (existingStyle) {
      existingStyle.remove();
    }

    // Add new custom styles
    const style = document.createElement("style");
    style.id = "custom-theme-styles";
    style.textContent = theme.customCSS;
    document.head.appendChild(style);
  }
}

/**
 * Get contrasting color (simple implementation)
 */
export function getContrastColor(oklchColor: string): string {
  // Extract lightness from OKLCH color
  const match = oklchColor.match(/oklch\(([0-9.]+)/);
  if (!match) return "oklch(0.5 0 0)";

  const lightness = parseFloat(match[1]);

  // Return dark or light based on lightness
  return lightness > 0.5
    ? "oklch(0.1 0.02 0)" // Dark
    : "oklch(0.9 0.02 0)"; // Light
}

/**
 * Generate theme variants for different components
 */
export function generateThemeVariants(baseColors: ThemeColors) {
  return {
    button: {
      primary: {
        background: baseColors.primary,
        foreground: baseColors.primaryForeground,
        hover: adjustLightness(baseColors.primary, -0.1),
      },
      secondary: {
        background: baseColors.secondary,
        foreground: baseColors.secondaryForeground,
        hover: adjustLightness(baseColors.secondary, -0.05),
      },
      destructive: {
        background: baseColors.destructive,
        foreground: getContrastColor(baseColors.destructive),
        hover: adjustLightness(baseColors.destructive, -0.1),
      },
    },
    input: {
      background: baseColors.background,
      border: baseColors.border,
      foreground: baseColors.foreground,
      placeholder: baseColors.mutedForeground,
      focus: {
        border: baseColors.ring,
        ring: `${baseColors.ring}/20`,
      },
    },
    card: {
      background: baseColors.card,
      foreground: baseColors.cardForeground,
      border: baseColors.border,
    },
  };
}

/**
 * Adjust lightness of OKLCH color
 */
function adjustLightness(oklchColor: string, adjustment: number): string {
  const match = oklchColor.match(
    /oklch\(([0-9.]+)\s+([0-9.]+)\s+([0-9.]+)(?:\s*\/\s*([0-9.%]+))?\)/,
  );
  if (!match) return oklchColor;

  const [, l, c, h, alpha] = match;
  const newLightness = Math.max(0, Math.min(1, parseFloat(l) + adjustment));

  return `oklch(${newLightness} ${c} ${h}${alpha ? ` / ${alpha}` : ""})`;
}

/**
 * Validate theme configuration
 */
export function validateTheme(theme: ThemeConfig): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!theme.id) {
    errors.push("Theme must have an id");
  }

  if (!theme.name) {
    errors.push("Theme must have a name");
  }

  if (!theme.colors?.light || !theme.colors?.dark) {
    errors.push("Theme must have both light and dark color variants");
  }

  // Validate required colors
  const requiredColors = [
    "background",
    "foreground",
    "primary",
    "primaryForeground",
    "secondary",
    "secondaryForeground",
    "border",
    "input",
    "ring",
  ];

  ["light", "dark"].forEach((mode) => {
    const colors = theme.colors?.[mode as keyof typeof theme.colors];
    if (colors) {
      requiredColors.forEach((color) => {
        if (!(color in colors)) {
          errors.push(`Missing required color '${color}' in ${mode} mode`);
        }
      });
    }
  });

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Create a new theme based on an existing one
 */
export function createThemeVariant(
  baseTheme: ThemeConfig,
  overrides: Partial<ThemeConfig>,
): ThemeConfig {
  return {
    ...baseTheme,
    ...overrides,
    colors: {
      light: { ...baseTheme.colors.light, ...overrides.colors?.light },
      dark: { ...baseTheme.colors.dark, ...overrides.colors?.dark },
    },
  };
}

/**
 * Export theme as CSS
 */
export function exportThemeAsCSS(theme: ThemeConfig): string {
  const lightVariables = generateCSSVariables(theme.colors.light);
  const darkVariables = generateCSSVariables(theme.colors.dark);

  let css = `/* ${theme.name} Theme */\n\n`;

  // Root variables (light mode)
  css += ":root {\n";
  if (theme.radius) {
    css += `  --radius: ${theme.radius};\n`;
  }
  Object.entries(lightVariables).forEach(([property, value]) => {
    css += `  ${property}: ${value};\n`;
  });
  css += "}\n\n";

  // Dark mode variables
  css += ".dark {\n";
  Object.entries(darkVariables).forEach(([property, value]) => {
    css += `  ${property}: ${value};\n`;
  });
  css += "}\n";

  // Custom CSS if provided
  if (theme.customCSS) {
    css += `\n/* Custom styles */\n${theme.customCSS}\n`;
  }

  return css;
}
