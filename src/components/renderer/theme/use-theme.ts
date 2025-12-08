import { useCallback } from "react";
import { useTheme } from "./theme-provider";
import type { Theme, ThemeName } from "@/types/ui-theme";

export function useThemeUtils() {
  const { theme, setTheme, toggleTheme, isDark, resolvedTheme } = useTheme();

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
    transition: (duration: keyof Theme["animations"]["duration"] = "200") => ({
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
