/**
 * Form Generation Library - Enhanced Theme Provider
 *
 * React context provider for form theming with advanced features:
 * - Smooth theme transitions
 * - Runtime theme validation
 * - Performance monitoring
 * - Better error handling
 */

"use client";

import type { CSSProperties, ReactNode } from "react";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { defaultTheme } from "./default";
import type { FormTheme } from "./types";

interface ThemeContextValue {
  theme: FormTheme;
  setTheme: (theme: FormTheme) => void;
  isTransitioning: boolean;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export interface FormThemeProviderProps {
  /**
   * Theme configuration
   */
  theme?: FormTheme;

  /**
   * Children components
   */
  children: ReactNode;

  /**
   * Enable smooth transitions when theme changes
   * @default true
   */
  enableTransitions?: boolean;

  /**
   * Transition duration in milliseconds
   * @default 200
   */
  transitionDuration?: number;

  /**
   * Enable runtime theme validation
   * @default process.env.NODE_ENV === 'development'
   */
  validateTheme?: boolean;

  /**
   * Enable performance monitoring
   * @default process.env.NODE_ENV === 'development'
   */
  enablePerformanceMonitoring?: boolean;
}

/**
 * Validates theme configuration
 */
function validateThemeConfig(theme: FormTheme): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Required fields
  if (!theme.name) errors.push("Theme name is required");
  if (!theme.colors) errors.push("Theme colors are required");
  if (!theme.colors.primary) errors.push("Primary color is required");
  if (!theme.colors.border) errors.push("Border color is required");
  if (!theme.colors.background) errors.push("Background color is required");

  // Color format validation (basic)
  const colorFields = [
    "primary",
    "border",
    "borderFocus",
    "background",
    "placeholder",
    "error",
  ] as const;

  for (const field of colorFields) {
    const color = theme.colors[field];
    if (color && !isValidColor(color)) {
      errors.push(`Invalid color format for ${field}: ${color}`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Basic color validation (hex, rgb, hsl, css variables)
 */
function isValidColor(color: string): boolean {
  // Hex colors
  if (/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color)) return true;
  // RGB/RGBA
  if (/^rgba?\(/.test(color)) return true;
  // HSL/HSLA
  if (/^hsla?\(/.test(color)) return true;
  // CSS variables
  if (/^(var\(|hsl\(var\()/.test(color)) return true;
  // Named colors (basic check)
  if (/^[a-z]+$/i.test(color)) return true;

  return false;
}

/**
 * Theme provider for form components
 *
 * Wrap your form with this provider to apply a theme globally
 *
 * @example
 * ```tsx
 * import { FormThemeProvider } from '@/components/form-generation/themes/ThemeProvider';
 * import { finzoneTheme } from '@/configs/themes/finzone-theme';
 *
 * <FormThemeProvider theme={finzoneTheme}>
 *   <StepWizard config={wizardConfig} />
 * </FormThemeProvider>
 * ```
 */
export function FormThemeProvider({
  theme = defaultTheme,
  children,
  enableTransitions = true,
  transitionDuration = 200,
  validateTheme = process.env.NODE_ENV === "development",
  enablePerformanceMonitoring = process.env.NODE_ENV === "development",
}: FormThemeProviderProps) {
  const [currentTheme, setCurrentTheme] = useState(theme);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Validate theme on mount and when it changes
  useEffect(() => {
    if (validateTheme) {
      const validation = validateThemeConfig(currentTheme);
      if (!validation.isValid) {
        console.error(
          `[ThemeProvider] Theme validation failed for "${currentTheme.name}":`,
          validation.errors,
        );
      }
    }
  }, [currentTheme, validateTheme]);

  // Performance monitoring
  useEffect(() => {
    if (enablePerformanceMonitoring) {
      const startTime = performance.now();
      return () => {
        const endTime = performance.now();
        const duration = endTime - startTime;
        if (duration > 16) {
          // More than one frame (16ms)
          console.warn(
            `[ThemeProvider] Theme render took ${duration.toFixed(2)}ms`,
          );
        }
      };
    }
  }, [currentTheme, enablePerformanceMonitoring]);

  // Handle theme changes with transitions
  const handleSetTheme = (newTheme: FormTheme) => {
    if (enableTransitions) {
      setIsTransitioning(true);
      setCurrentTheme(newTheme);

      // Reset transition state after duration
      setTimeout(() => {
        setIsTransitioning(false);
      }, transitionDuration);
    } else {
      setCurrentTheme(newTheme);
    }
  };

  const themeCssVars = useMemo(() => {
    const textPrimary = currentTheme.colors.textPrimary || "#0f172a";
    const textSecondary = currentTheme.colors.textSecondary || "#64748b";

    return {
      // Shadcn/UI compatibility variables (with color- prefix)
      "--color-primary": currentTheme.colors.primary,
      "--color-primary-foreground": "#ffffff",
      "--color-ring":
        currentTheme.colors.borderFocus || currentTheme.colors.primary,
      "--color-border": currentTheme.colors.border,
      "--color-input": currentTheme.colors.border,
      "--color-background": currentTheme.colors.background,
      "--color-foreground": textPrimary,
      "--color-card": currentTheme.colors.background,
      "--color-card-foreground": textPrimary,
      "--color-popover": currentTheme.colors.background,
      "--color-popover-foreground": textPrimary,
      "--color-muted": currentTheme.colors.readOnly,
      "--color-muted-foreground": textSecondary,
      "--color-accent": currentTheme.colors.readOnly,
      "--color-accent-foreground": textPrimary,
      "--color-destructive": currentTheme.colors.error,

      // Shadcn/UI compatibility variables (without prefix)
      "--primary": currentTheme.colors.primary,
      "--primary-foreground": "#ffffff",
      "--ring": currentTheme.colors.borderFocus || currentTheme.colors.primary,
      "--border": currentTheme.colors.border,
      "--input": currentTheme.colors.border,
      "--background": currentTheme.colors.background,
      "--foreground": textPrimary,
      "--popover": currentTheme.colors.background,
      "--popover-foreground": textPrimary,
      "--muted": currentTheme.colors.readOnly,
      "--muted-foreground": textSecondary,
      "--accent": currentTheme.colors.readOnly,
      "--accent-foreground": textPrimary,
      "--destructive": currentTheme.colors.error,
      "--card": currentTheme.colors.background,
      "--card-foreground": textPrimary,

      // Form-specific variables
      "--form-primary": currentTheme.colors.primary,
      "--form-border": currentTheme.colors.border,
      "--form-border-focus":
        currentTheme.colors.borderFocus || currentTheme.colors.primary,
      "--form-bg": currentTheme.colors.background,
      "--form-text": textPrimary,
      "--form-text-secondary": textSecondary,
      "--form-placeholder": currentTheme.colors.placeholder,
      "--form-error": currentTheme.colors.error,
      "--form-disabled-bg": currentTheme.colors.disabled,
      "--form-readonly-bg": currentTheme.colors.readOnly,
      "--form-muted-bg": currentTheme.colors.readOnly,
      "--form-radio-border":
        currentTheme.colors.radioBorder || currentTheme.colors.border,
      "--form-selection-bg": currentTheme.colors.primary,

      // Slider-specific variables
      "--slider-track": currentTheme.colors.background,

      // Layout
      "--radius": currentTheme.borderRadius.control,

      colorScheme: "light",
    } as CSSProperties;
  }, [currentTheme]);

  const value = useMemo(
    () => ({
      theme: currentTheme,
      setTheme: handleSetTheme,
      isTransitioning,
    }),
    [currentTheme, isTransitioning],
  );

  // Transition styles
  const transitionStyles: CSSProperties = enableTransitions
    ? {
        transition: `all ${transitionDuration}ms ease-in-out`,
      }
    : {};

  return (
    <ThemeContext.Provider value={value}>
      <div
        style={{ ...themeCssVars, ...transitionStyles }}
        data-theme={currentTheme.name}
        data-transitioning={isTransitioning}
      >
        {children}
      </div>
    </ThemeContext.Provider>
  );
}

/**
 * Hook to access the current form theme
 *
 * Returns the default theme if used outside a FormThemeProvider
 *
 * @example
 * ```tsx
 * const { theme, setTheme, isTransitioning } = useFormTheme();
 *
 * // Check if theme is currently transitioning
 * if (isTransitioning) {
 *   console.log('Theme is changing...');
 * }
 *
 * // Change theme programmatically
 * setTheme(newTheme);
 * ```
 */
export function useFormTheme() {
  const context = useContext(ThemeContext);

  // Return default theme if used outside provider
  if (!context) {
    if (process.env.NODE_ENV === "development") {
      console.warn(
        "[useFormTheme] Hook called outside FormThemeProvider. Using default theme. " +
          "Wrap your component with FormThemeProvider or TenantThemeProvider to enable theming.",
      );
    }

    return {
      theme: defaultTheme,
      setTheme: () => {
        console.warn(
          "[useFormTheme] setTheme called outside FormThemeProvider. " +
            "Wrap your component with FormThemeProvider to enable theme switching.",
        );
      },
      isTransitioning: false,
    };
  }

  return context;
}

/**
 * Hook to get theme CSS variables as an object
 * Useful for inline styles or dynamic styling
 *
 * @example
 * ```tsx
 * const cssVars = useThemeCssVars();
 *
 * <div style={{
 *   color: cssVars['--form-text'],
 *   backgroundColor: cssVars['--form-bg']
 * }}>
 *   Themed content
 * </div>
 * ```
 */
export function useThemeCssVars(): Record<string, string> {
  const { theme } = useFormTheme();

  return useMemo(() => {
    const textPrimary = theme.colors.textPrimary || "#0f172a";
    const textSecondary = theme.colors.textSecondary || "#64748b";

    return {
      "--color-primary": theme.colors.primary,
      "--color-border": theme.colors.border,
      "--color-background": theme.colors.background,
      "--form-primary": theme.colors.primary,
      "--form-border": theme.colors.border,
      "--form-bg": theme.colors.background,
      "--form-text": textPrimary,
      "--form-text-secondary": textSecondary,
      "--form-radio-border": theme.colors.radioBorder || theme.colors.border,
    };
  }, [theme]);
}
