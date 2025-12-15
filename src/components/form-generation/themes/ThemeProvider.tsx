/**
 * Form Generation Library - Theme Provider
 *
 * React context provider for form theming
 */

"use client";

import { createContext, useContext, useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { FormTheme } from "./types";
import { defaultTheme } from "./default";

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
 * import { legacyLoanTheme } from '@/components/form-generation/themes/legacy-loan';
 *
 * <FormThemeProvider theme={legacyLoanTheme}>
 *   <StepWizard config={wizardConfig} />
 * </FormThemeProvider>
 * ```
 */
export function FormThemeProvider({
  theme = defaultTheme,
  children,
}: FormThemeProviderProps) {
  const [currentTheme, setCurrentTheme] = useState(theme);

  const value = useMemo(
    () => ({ theme: currentTheme, setTheme: setCurrentTheme }),
    [currentTheme],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
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
