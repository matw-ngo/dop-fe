"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { Theme, ThemeContextValue } from "@/types/ui-theme";
import { lightTheme, darkTheme } from "./default-themes";

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
      if (
        window.matchMedia &&
        window.matchMedia("(prefers-color-scheme: dark)").matches
      ) {
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

  // Apply theme to CSS variables
  useEffect(() => {
    if (typeof document === "undefined") return;

    const root = document.documentElement;

    // Remove existing theme classes
    root.classList.remove("theme-light", "theme-dark");

    // Add current theme class
    root.classList.add(`theme-${themeName}`);

    // Apply CSS custom properties
    const applyThemeVariables = (theme: Theme) => {
      // Colors
      Object.entries(theme.colors.primary).forEach(([key, value]) => {
        root.style.setProperty(`--color-primary-${key}`, value);
      });

      Object.entries(theme.colors.secondary).forEach(([key, value]) => {
        root.style.setProperty(`--color-secondary-${key}`, value);
      });

      Object.entries(theme.colors.gray).forEach(([key, value]) => {
        root.style.setProperty(`--color-gray-${key}`, value);
      });

      // Semantic colors
      root.style.setProperty("--color-success", theme.colors.success);
      root.style.setProperty("--color-warning", theme.colors.warning);
      root.style.setProperty("--color-error", theme.colors.error);
      root.style.setProperty("--color-info", theme.colors.info);

      // Background colors
      root.style.setProperty("--bg-primary", theme.colors.background.primary);
      root.style.setProperty(
        "--bg-secondary",
        theme.colors.background.secondary,
      );
      root.style.setProperty("--bg-tertiary", theme.colors.background.tertiary);
      root.style.setProperty("--bg-inverse", theme.colors.background.inverse);

      // Text colors
      root.style.setProperty("--text-primary", theme.colors.text.primary);
      root.style.setProperty("--text-secondary", theme.colors.text.secondary);
      root.style.setProperty("--text-tertiary", theme.colors.text.tertiary);
      root.style.setProperty("--text-inverse", theme.colors.text.inverse);
      root.style.setProperty("--text-disabled", theme.colors.text.disabled);

      // Border colors
      root.style.setProperty("--border-primary", theme.colors.border.primary);
      root.style.setProperty(
        "--border-secondary",
        theme.colors.border.secondary,
      );
      root.style.setProperty("--border-focus", theme.colors.border.focus);
      root.style.setProperty("--border-error", theme.colors.border.error);

      // Typography
      root.style.setProperty(
        "--font-sans",
        theme.typography.fontFamily.sans.join(", "),
      );
      root.style.setProperty(
        "--font-serif",
        theme.typography.fontFamily.serif.join(", "),
      );
      root.style.setProperty(
        "--font-mono",
        theme.typography.fontFamily.mono.join(", "),
      );

      // Spacing
      Object.entries(theme.spacing).forEach(([key, value]) => {
        root.style.setProperty(`--spacing-${key}`, value);
      });

      // Border radius
      Object.entries(theme.borderRadius).forEach(([key, value]) => {
        root.style.setProperty(`--radius-${key}`, value);
      });

      // Shadows
      Object.entries(theme.shadows).forEach(([key, value]) => {
        root.style.setProperty(`--shadow-${key}`, value);
      });

      // Animations
      Object.entries(theme.animations.duration).forEach(([key, value]) => {
        root.style.setProperty(`--duration-${key}`, value);
      });

      Object.entries(theme.animations.easing).forEach(([key, value]) => {
        root.style.setProperty(`--easing-${key}`, value);
      });
    };

    applyThemeVariables(theme);

    // Save to localStorage
    localStorage.setItem(storageKey, themeName);
  }, [theme, themeName, storageKey]);

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
  }, [storageKey]);

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
