import { useCallback, useEffect, useRef } from "react";
import { debounce } from "@/lib/utils/debounce";
import type { Theme } from "../types/ui-theme";
import { useTheme } from "./index";

export function useThemeUtils() {
  const { theme, setTheme, toggleTheme, isDark, resolvedTheme } = useTheme();

  // Store debounced functions in refs to persist across re-renders
  const debouncedSetThemeRef = useRef<ReturnType<typeof debounce> | null>(null);
  const debouncedToggleThemeRef = useRef<ReturnType<typeof debounce> | null>(
    null,
  );

  // Cleanup function for debounced functions
  useEffect(() => {
    return () => {
      // Cancel pending debounced calls on unmount
      debouncedSetThemeRef.current?.cancel();
      debouncedToggleThemeRef.current?.cancel();
    };
  }, []);

  // Create debounced versions of theme change functions
  const debouncedSetTheme = useCallback(
    (newTheme: Parameters<typeof setTheme>[0]) => {
      if (!debouncedSetThemeRef.current) {
        debouncedSetThemeRef.current = debounce(setTheme, 300);
      }
      debouncedSetThemeRef.current(newTheme);
    },
    [setTheme],
  );

  const debouncedToggleTheme = useCallback(() => {
    if (!debouncedToggleThemeRef.current) {
      debouncedToggleThemeRef.current = debounce(toggleTheme, 300);
    }
    debouncedToggleThemeRef.current();
  }, [toggleTheme]);

  // Get theme-aware color
  const getColor = useCallback(
    (colorPath: string) => {
      const keys = colorPath.split(".");
      let value: any = theme.colors;

      for (const key of keys) {
        value = value[key];
        if (value === undefined) return undefined;
      }

      return value;
    },
    [theme],
  );

  // Get spacing value
  const getSpacing = useCallback(
    (key: keyof Theme["spacing"]) => {
      return theme.spacing[key];
    },
    [theme],
  );

  // Get font size
  const getFontSize = useCallback(
    (key: keyof Theme["typography"]["fontSize"]) => {
      const [size, lineHeight] = theme.typography.fontSize[key];
      return { size, lineHeight };
    },
    [theme],
  );

  // Get shadow
  const getShadow = useCallback(
    (key: keyof Theme["shadows"]) => {
      return theme.shadows[key];
    },
    [theme],
  );

  // Get animation duration
  const getDuration = useCallback(
    (key: keyof Theme["animations"]["duration"]) => {
      return theme.animations.duration[key];
    },
    [theme],
  );

  // Get easing function
  const getEasing = useCallback(
    (key: keyof Theme["animations"]["easing"]) => {
      return theme.animations.easing[key];
    },
    [theme],
  );

  // Generate CSS custom property value
  const cssVar = useCallback((property: string, fallback?: string) => {
    return fallback ? `var(--${property}, ${fallback})` : `var(--${property})`;
  }, []);

  // Common theme-aware styles
  const styles = {
    // Background styles
    bgPrimary: { backgroundColor: theme.colors.background.primary },
    bgSecondary: { backgroundColor: theme.colors.background.secondary },
    bgTertiary: { backgroundColor: theme.colors.background.tertiary },

    // Text styles
    textPrimary: { color: theme.colors.text.primary },
    textSecondary: { color: theme.colors.text.secondary },
    textTertiary: { color: theme.colors.text.tertiary },

    // Border styles
    borderPrimary: { borderColor: theme.colors.border.primary },
    borderSecondary: { borderColor: theme.colors.border.secondary },
    borderFocus: { borderColor: theme.colors.border.focus },

    // Semantic colors
    success: { color: theme.colors.success },
    warning: { color: theme.colors.warning },
    error: { color: theme.colors.error },
    info: { color: theme.colors.info },

    // Spacing shortcuts
    spacing: (key: keyof Theme["spacing"]) => ({ padding: theme.spacing[key] }),
    margin: (key: keyof Theme["spacing"]) => ({ margin: theme.spacing[key] }),
    gap: (key: keyof Theme["spacing"]) => ({ gap: theme.spacing[key] }),

    // Shadow shortcuts
    shadow: (key: keyof Theme["shadows"]) => ({
      boxShadow: theme.shadows[key],
    }),

    // Animation shortcuts
    transition: (duration: keyof Theme["animations"]["duration"] = 200) => ({
      transition: `all ${theme.animations.duration[duration]} ${theme.animations.easing["in-out"]}`,
    }),
  };

  return {
    // Theme basics
    theme,
    setTheme,
    toggleTheme,
    isDark,
    resolvedTheme,

    // Debounced versions (300ms delay to prevent layout thrashing)
    setThemeDebounced: debouncedSetTheme,
    toggleThemeDebounced: debouncedToggleTheme,

    // Utilities
    getColor,
    getSpacing,
    getFontSize,
    getShadow,
    getDuration,
    getEasing,
    cssVar,

    // Style shortcuts
    styles,

    // Helper to get theme CSS classes
    themeClass: `theme-${resolvedTheme}`,
  };
}

// Export the original useTheme for direct access
export { useTheme };
export default useThemeUtils;
