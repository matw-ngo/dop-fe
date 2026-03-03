/**
 * Form Generation Library - Theme Provider
 *
 * React context provider for form theming
 */

"use client";

import type { CSSProperties, ReactNode } from "react";
import { createContext, useContext, useMemo, useState } from "react";
import { defaultTheme } from "./default";
import type { FormTheme } from "./types";

interface ThemeContextValue {
  theme: FormTheme;
  setTheme: (theme: FormTheme) => void;
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
}: FormThemeProviderProps) {
  const [currentTheme, setCurrentTheme] = useState(theme);

  const themeCssVars = useMemo(() => {
    const textPrimary = currentTheme.colors.textPrimary || "#0f172a";
    const textSecondary = currentTheme.colors.textSecondary || "#64748b";

    return {
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
      "--radius": currentTheme.borderRadius.control,
      "--form-primary": currentTheme.colors.primary,
      "--form-border": currentTheme.colors.border,
      "--form-bg": currentTheme.colors.background,
      "--form-text": textPrimary,
      "--form-text-secondary": textSecondary,
      "--form-radio-border":
        currentTheme.colors.radioBorder || currentTheme.colors.border,
      colorScheme: "light",
    } as CSSProperties;
  }, [currentTheme]);

  const value = useMemo(
    () => ({ theme: currentTheme, setTheme: setCurrentTheme }),
    [currentTheme],
  );

  return (
    <ThemeContext.Provider value={value}>
      <div style={themeCssVars}>{children}</div>
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
 * const { theme, setTheme } = useFormTheme();
 * ```
 */
export function useFormTheme() {
  const context = useContext(ThemeContext);

  // Return default theme if used outside provider
  if (!context) {
    return {
      theme: defaultTheme,
      setTheme: () => {
        console.warn(
          "setTheme called outside FormThemeProvider. Wrap your component with FormThemeProvider to enable theme switching.",
        );
      },
    };
  }

  return context;
}
