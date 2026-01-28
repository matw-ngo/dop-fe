"use client";

import type React from "react";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import type { Theme, ThemeContextValue } from "../types/ui-theme";
import { darkTheme, lightTheme } from "./default-themes";

type ThemeName = "light" | "dark" | string;

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: ThemeName;
  storageKey?: string;
  themes?: Record<string, Theme>;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({
  children,
  defaultTheme = "light",
  storageKey = "renderer-theme",
  themes = { light: lightTheme, dark: darkTheme },
}: ThemeProviderProps) {
  const [themeName, setThemeName] = useState<ThemeName>(() => {
    // Initialize theme from localStorage or system preference
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(storageKey) as ThemeName;
      if (stored && themes[stored]) {
        return stored;
      }

      // Check system preference
      if (window.matchMedia?.("(prefers-color-scheme: dark)").matches) {
        return "dark";
      }
    }
    return defaultTheme;
  });

  const [theme, setThemeState] = useState<Theme>(() => {
    return themes[themeName] || themes[defaultTheme] || lightTheme;
  });

  const isDark = themeName === "dark";
  const resolvedTheme: "light" | "dark" = isDark ? "dark" : "light";

  // Track previous theme values to optimize CSS variable updates
  const previousThemeValues = useRef<Map<string, string>>(new Map());

  // Apply theme to CSS variables
  useEffect(() => {
    if (typeof document === "undefined") return;

    const root = document.documentElement;

    // Set data attributes instead of classes
    root.setAttribute("data-theme", themeName);

    // Set color-scheme for light/dark detection
    root.setAttribute("data-color-scheme", resolvedTheme);

    // Apply CSS custom properties with optimization
    const applyThemeVariables = (theme: Theme) => {
      const currentValues = new Map<string, string>();

      // Helper function to apply variable only if changed
      const setVariableIfChanged = (property: string, value: string) => {
        currentValues.set(property, value);
        const previousValue = previousThemeValues.current.get(property);
        if (previousValue !== value) {
          root.style.setProperty(property, value);
        }
      };

      // Colors
      Object.entries(theme.colors.primary).forEach(([key, value]) => {
        setVariableIfChanged(`--color-primary-${key}`, value as string);
      });

      Object.entries(theme.colors.secondary).forEach(([key, value]) => {
        setVariableIfChanged(`--color-secondary-${key}`, value as string);
      });

      Object.entries(theme.colors.gray).forEach(([key, value]) => {
        setVariableIfChanged(`--color-gray-${key}`, value as string);
      });

      // Semantic colors
      setVariableIfChanged("--color-success", theme.colors.success);
      setVariableIfChanged("--color-warning", theme.colors.warning);
      setVariableIfChanged("--color-error", theme.colors.error);
      setVariableIfChanged("--color-info", theme.colors.info);

      // Background colors
      setVariableIfChanged("--bg-primary", theme.colors.background.primary);
      setVariableIfChanged("--bg-secondary", theme.colors.background.secondary);
      setVariableIfChanged("--bg-tertiary", theme.colors.background.tertiary);
      setVariableIfChanged("--bg-inverse", theme.colors.background.inverse);

      // Text colors
      setVariableIfChanged("--text-primary", theme.colors.text.primary);
      setVariableIfChanged("--text-secondary", theme.colors.text.secondary);
      setVariableIfChanged("--text-tertiary", theme.colors.text.tertiary);
      setVariableIfChanged("--text-inverse", theme.colors.text.inverse);
      setVariableIfChanged("--text-disabled", theme.colors.text.disabled);

      // Border colors
      setVariableIfChanged("--border-primary", theme.colors.border.primary);
      setVariableIfChanged("--border-secondary", theme.colors.border.secondary);
      setVariableIfChanged("--border-focus", theme.colors.border.focus);
      setVariableIfChanged("--border-error", theme.colors.border.error);

      // Typography
      setVariableIfChanged(
        "--font-sans",
        theme.typography.fontFamily.sans.join(", "),
      );
      setVariableIfChanged(
        "--font-serif",
        theme.typography.fontFamily.serif.join(", "),
      );
      setVariableIfChanged(
        "--font-mono",
        theme.typography.fontFamily.mono.join(", "),
      );

      // Spacing
      Object.entries(theme.spacing).forEach(([key, value]) => {
        setVariableIfChanged(`--spacing-${key}`, value as string);
      });

      // Border radius
      Object.entries(theme.borderRadius).forEach(([key, value]) => {
        setVariableIfChanged(`--radius-${key}`, value as string);
      });

      // Shadows
      Object.entries(theme.shadows).forEach(([key, value]) => {
        setVariableIfChanged(`--shadow-${key}`, value as string);
      });

      // Animations
      Object.entries(theme.animations.duration).forEach(([key, value]) => {
        setVariableIfChanged(`--duration-${key}`, value as string);
      });

      Object.entries(theme.animations.easing).forEach(([key, value]) => {
        setVariableIfChanged(`--easing-${key}`, value as string);
      });

      // Update the ref with current values for next comparison
      previousThemeValues.current = currentValues;
    };

    applyThemeVariables(theme);

    // Save to localStorage
    localStorage.setItem(storageKey, themeName);
  }, [theme, themeName, storageKey, resolvedTheme]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    // Find theme name if it exists in themes
    const name = Object.entries(themes).find(([_, t]) => t === newTheme)?.[0];
    if (name) {
      setThemeName(name);
    }
  };

  const setThemeByName = (name: ThemeName) => {
    const newTheme = themes[name];
    if (newTheme) {
      setThemeName(name);
      setThemeState(newTheme);
    }
  };

  const toggleTheme = () => {
    const newThemeName = isDark ? "light" : "dark";
    setThemeByName(newThemeName);
  };

  // Listen for system theme changes
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (e: MediaQueryListEvent) => {
      // Only auto-switch if user hasn't manually set a theme
      const stored = localStorage.getItem(storageKey);
      if (!stored) {
        setThemeByName(e.matches ? "dark" : "light");
      }
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [storageKey, setThemeByName]);

  const value: ThemeContextValue = {
    theme,
    setTheme,
    toggleTheme,
    isDark,
    resolvedTheme,
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}

// Export theme provider and hook for convenience
export { ThemeContext };
export default ThemeProvider;
