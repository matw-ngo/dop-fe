"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { isValidColor } from "@/lib/validate-colors";
import type { Theme, ThemeContextValue } from "../types/ui-theme.d";
import { darkTheme, lightTheme } from "./default-themes";
import { themes, userGroups } from "./themes";
import type { ThemeColors, ThemeConfig, ThemeState, UserGroup } from "./types";
import { applyTheme } from "./utils";

type ThemeName = "light" | "dark" | string;
type ThemeMode = "light" | "dark" | "system";

export interface UnifiedThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: ThemeName;
  defaultUserGroup?: string;
  storageKey?: string;
  enableSystem?: boolean;
  disableTransitionOnChange?: boolean;
  themes?: Record<string, Theme>;
  attribute?: string;
}

// Enhanced context type that combines both old providers
interface UnifiedThemeContextType extends ThemeContextValue {
  // Additional context features from context.tsx
  currentTheme: string;
  userGroup: string;
  customizations?: Partial<ThemeColors>;
  mode: ThemeMode;

  // Actions
  setThemeByName: (name: ThemeName) => void;
  setThemeById: (themeId: string) => void;
  setUserGroup: (groupId: string) => void;
  setCustomizations: (colors: Partial<ThemeColors>) => void;
  resetCustomizations: () => void;
  setMode: (mode: ThemeMode) => void;

  // Computed values
  availableThemes: string[];
  canCustomize: boolean;
  themeConfig: ThemeConfig | null;
  userGroupConfig: UserGroup | null;
}

const UnifiedThemeContext = createContext<UnifiedThemeContextType | undefined>(
  undefined,
);

export function useTheme(): UnifiedThemeContextType {
  const context = useContext(UnifiedThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}

export function ThemeProvider({
  children,
  defaultTheme = "system",
  defaultUserGroup = "system",
  storageKey = "dop-theme-config",
  enableSystem = true,
  disableTransitionOnChange = false,
  themes: customThemes = { light: lightTheme, dark: darkTheme },
  attribute = "data-theme",
}: UnifiedThemeProviderProps) {
  // Validation cache for performance
  const validationCache = useRef<Map<string, boolean>>(new Map());

  // Track previous theme values to optimize CSS variable updates
  const previousThemeValues = useRef<Map<string, string>>(new Map());

  // Initialize theme state
  const [state, setState] = useState<ThemeState>(() => {
    const defaultState: ThemeState = {
      currentTheme: userGroups[defaultUserGroup]?.defaultTheme || "default",
      userGroup: defaultUserGroup,
    };

    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem(storageKey);
        if (stored) {
          const parsed = JSON.parse(stored);
          // Validate and merge with default state
          const validatedState = {
            ...defaultState,
            currentTheme: parsed.currentTheme || defaultState.currentTheme,
            userGroup: parsed.userGroup || defaultState.userGroup,
            customizations: parsed.customizations,
          };

          // Ensure the theme exists in available themes
          const group = userGroups[validatedState.userGroup];
          if (
            group &&
            group.availableThemes.includes(validatedState.currentTheme)
          ) {
            return validatedState;
          } else {
            // Fallback to valid theme if invalid theme found
            console.warn(
              `Invalid theme configuration found, falling back to defaults`,
            );
            return defaultState;
          }
        }
      } catch (error) {
        console.warn("Failed to load theme config from localStorage:", error);
      }
    }

    return defaultState;
  });

  // Theme mode state (light/dark/system)
  const [mode, setMode] = useState<ThemeMode>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(`${storageKey}-mode`);
      const storedMode = stored as ThemeMode;
      if (
        storedMode === "light" ||
        storedMode === "dark" ||
        storedMode === "system"
      ) {
        return storedMode;
      }
    }
    return defaultTheme as ThemeMode;
  });

  // Current resolved theme
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">(() => {
    if (typeof window !== "undefined") {
      if (mode === "system") {
        return window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light";
      }
      return mode as "light" | "dark";
    }
    return "light";
  });

  // Current theme object (from UI theme type)
  const [theme, setThemeState] = useState<Theme>(() => {
    const themeName =
      state.currentTheme === "default"
        ? resolvedTheme === "dark"
          ? "dark"
          : "light"
        : state.currentTheme;
    return customThemes[themeName] || customThemes[resolvedTheme] || lightTheme;
  });

  // Computed values
  const isDark = resolvedTheme === "dark";
  const currentGroup = userGroups[state.userGroup];
  const availableThemes = currentGroup?.availableThemes || ["default"];
  const canCustomize = currentGroup?.customizations?.allowCustomColors || false;
  const themeConfig = themes[state.currentTheme] || null;
  const userGroupConfig = currentGroup || null;

  // Save state to localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(storageKey, JSON.stringify(state));
        localStorage.setItem(`${storageKey}-mode`, mode);
      } catch (error) {
        console.warn("Failed to save theme config to localStorage:", error);
      }
    }
  }, [state, mode, storageKey]);

  // Listen for system theme changes
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia || !enableSystem)
      return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (e: MediaQueryListEvent) => {
      if (mode === "system") {
        setResolvedTheme(e.matches ? "dark" : "light");
      }
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [mode, enableSystem]);

  // Basic theme application for UI theme objects
  const applyBasicTheme = useCallback(
    (themeObj: Theme, mode: "light" | "dark") => {
      if (typeof document === "undefined") return;

      const root = document.documentElement;
      const currentValues = new Map<string, string>();

      // Helper function to apply variable only if changed
      const setVariableIfChanged = (property: string, value: string) => {
        currentValues.set(property, value);
        const previousValue = previousThemeValues.current.get(property);
        if (previousValue !== value) {
          root.style.setProperty(property, value);
        }
      };

      // Apply all color variables with optimization
      Object.entries(themeObj.colors.primary).forEach(([key, value]) => {
        setVariableIfChanged(`--color-primary-${key}`, value as string);
      });

      Object.entries(themeObj.colors.secondary).forEach(([key, value]) => {
        setVariableIfChanged(`--color-secondary-${key}`, value as string);
      });

      Object.entries(themeObj.colors.gray).forEach(([key, value]) => {
        setVariableIfChanged(`--color-gray-${key}`, value as string);
      });

      // Semantic colors
      setVariableIfChanged("--color-success", themeObj.colors.success);
      setVariableIfChanged("--color-warning", themeObj.colors.warning);
      setVariableIfChanged("--color-error", themeObj.colors.error);
      setVariableIfChanged("--color-info", themeObj.colors.info);

      // Background colors
      setVariableIfChanged("--bg-primary", themeObj.colors.background.primary);
      setVariableIfChanged(
        "--bg-secondary",
        themeObj.colors.background.secondary,
      );
      setVariableIfChanged(
        "--bg-tertiary",
        themeObj.colors.background.tertiary,
      );
      setVariableIfChanged("--bg-inverse", themeObj.colors.background.inverse);

      // Text colors
      setVariableIfChanged("--text-primary", themeObj.colors.text.primary);
      setVariableIfChanged("--text-secondary", themeObj.colors.text.secondary);
      setVariableIfChanged("--text-tertiary", themeObj.colors.text.tertiary);
      setVariableIfChanged("--text-inverse", themeObj.colors.text.inverse);
      setVariableIfChanged("--text-disabled", themeObj.colors.text.disabled);

      // Border colors
      setVariableIfChanged("--border-primary", themeObj.colors.border.primary);
      setVariableIfChanged(
        "--border-secondary",
        themeObj.colors.border.secondary,
      );
      setVariableIfChanged("--border-focus", themeObj.colors.border.focus);
      setVariableIfChanged("--border-error", themeObj.colors.border.error);

      // Typography
      setVariableIfChanged(
        "--font-sans",
        themeObj.typography.fontFamily.sans.join(", "),
      );
      setVariableIfChanged(
        "--font-serif",
        themeObj.typography.fontFamily.serif.join(", "),
      );
      setVariableIfChanged(
        "--font-mono",
        themeObj.typography.fontFamily.mono.join(", "),
      );

      // Spacing
      Object.entries(themeObj.spacing).forEach(([key, value]) => {
        setVariableIfChanged(`--spacing-${key}`, value as string);
      });

      // Border radius
      Object.entries(themeObj.borderRadius).forEach(([key, value]) => {
        setVariableIfChanged(`--radius-${key}`, value as string);
      });

      // Shadows
      Object.entries(themeObj.shadows).forEach(([key, value]) => {
        setVariableIfChanged(`--shadow-${key}`, value as string);
      });

      // Animations
      Object.entries(themeObj.animations.duration).forEach(([key, value]) => {
        setVariableIfChanged(`--duration-${key}`, value as string);
      });

      Object.entries(themeObj.animations.easing).forEach(([key, value]) => {
        setVariableIfChanged(`--easing-${key}`, value as string);
      });

      // Update the ref with current values for next comparison
      previousThemeValues.current = currentValues;
    },
    [],
  );

  // Apply theme to document with data attributes and CSS variables
  useEffect(() => {
    if (typeof document === "undefined") return;

    const root = document.documentElement;

    // Set data attributes
    root.setAttribute(attribute, state.currentTheme);
    root.setAttribute("data-color-scheme", resolvedTheme);
    root.setAttribute("data-user-group", state.userGroup);

    // Handle transitions
    if (!disableTransitionOnChange) {
      root.style.setProperty("--transition-duration", "0.2s");
    } else {
      root.style.setProperty("--transition-duration", "0s");
    }

    // Apply theme configuration if available
    if (themeConfig) {
      applyTheme(themeConfig, resolvedTheme, state.customizations);
    } else {
      // Fallback to basic theme application
      applyBasicTheme(theme, resolvedTheme);
    }

    // Apply any additional data attributes for accessibility
    root.setAttribute("data-theme-mode", mode);
    if (state.customizations) {
      root.setAttribute("data-theme-customized", "true");
    } else {
      root.removeAttribute("data-theme-customized");
    }
  }, [
    theme,
    resolvedTheme,
    state,
    themeConfig,
    attribute,
    disableTransitionOnChange,
    mode,
    applyBasicTheme,
  ]);

  // Theme setting methods
  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
  }, []);

  const setThemeByName = useCallback(
    (name: ThemeName) => {
      const newTheme = customThemes[name];
      if (newTheme) {
        setThemeState(newTheme);
        setState((prev) => ({ ...prev, currentTheme: name }));
      }
    },
    [customThemes],
  );

  const setThemeById = useCallback((themeId: string) => {
    if (themes[themeId]) {
      setState((prev) => ({ ...prev, currentTheme: themeId }));
    }
  }, []);

  const toggleTheme = useCallback(() => {
    setMode((prevMode) => {
      const newMode = prevMode === "light" ? "dark" : "light";
      return newMode;
    });
  }, []);

  const setUserGroup = useCallback((groupId: string) => {
    const group = userGroups[groupId];
    if (group) {
      setState((prev) => ({
        ...prev,
        userGroup: groupId,
        currentTheme: group.defaultTheme,
        customizations: undefined,
      }));
    }
  }, []);

  const setCustomizations = useCallback(
    (colors: Partial<ThemeColors>) => {
      const group = userGroups[state.userGroup];
      if (group?.customizations?.allowCustomColors) {
        // Validate all color inputs
        const validatedColors: Partial<ThemeColors> = {};

        for (const [key, value] of Object.entries(colors)) {
          if (value === undefined || value === null || value === "") {
            continue;
          }

          // Check cache first for performance
          const cacheKey = validationCache.current.get(value);
          if (cacheKey !== undefined) {
            if (cacheKey) {
              validatedColors[key as keyof ThemeColors] = value;
            } else {
              console.warn(`Invalid color value for ${key}: ${value} (cached)`);
            }
            continue;
          }

          // Validate the color
          if (isValidColor(value)) {
            validatedColors[key as keyof ThemeColors] = value;
            validationCache.current.set(value, true);
          } else {
            console.warn(`Invalid color value for ${key}: ${value}`);
            validationCache.current.set(value, false);
          }
        }

        // Only update state if there are valid colors
        if (Object.keys(validatedColors).length > 0) {
          setState((prev) => ({
            ...prev,
            customizations: { ...prev.customizations, ...validatedColors },
          }));
        }
      }
    },
    [state.userGroup],
  );

  const resetCustomizations = useCallback(() => {
    setState((prev) => ({ ...prev, customizations: undefined }));
  }, []);

  // Update resolved theme when mode changes
  useEffect(() => {
    if (mode === "system" && typeof window !== "undefined") {
      setResolvedTheme(
        window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light",
      );
    } else {
      setResolvedTheme(mode as "light" | "dark");
    }
  }, [mode]);

  // Update theme object when current theme or resolved theme changes
  useEffect(() => {
    const themeName =
      state.currentTheme === "default" ? resolvedTheme : state.currentTheme;
    const newTheme =
      customThemes[themeName] || customThemes[resolvedTheme] || lightTheme;
    setThemeState(newTheme);
  }, [state.currentTheme, resolvedTheme, customThemes]);

  const contextValue: UnifiedThemeContextType = {
    // Base theme context values
    theme,
    setTheme,
    toggleTheme,
    isDark,
    resolvedTheme,

    // Enhanced context values
    currentTheme: state.currentTheme,
    userGroup: state.userGroup,
    customizations: state.customizations,
    mode,

    // Actions
    setThemeByName,
    setThemeById,
    setUserGroup,
    setCustomizations,
    resetCustomizations,
    setMode,

    // Computed values
    availableThemes,
    canCustomize,
    themeConfig,
    userGroupConfig,
  };

  return (
    <UnifiedThemeContext.Provider value={contextValue}>
      {children}
    </UnifiedThemeContext.Provider>
  );
}

// Error Boundary Component
interface ThemeErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class ThemeErrorBoundary extends React.Component<
  { children: React.ReactNode; onError?: (error: Error) => void },
  ThemeErrorBoundaryState
> {
  constructor(props: {
    children: React.ReactNode;
    onError?: (error: Error) => void;
  }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ThemeErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Theme Provider Error:", error, errorInfo);
    this.props.onError?.(error);
  }

  render() {
    if (this.state.hasError) {
      // Fallback UI - provider with safe defaults
      return (
        <ThemeProvider
          defaultTheme="light"
          enableSystem={false}
          {...({} as UnifiedThemeProviderProps)}
        >
          {this.props.children}
        </ThemeProvider>
      );
    }

    return this.props.children;
  }
}

// Export wrapped ThemeProvider with error boundary
export function ThemeProviderWithErrorBoundary(
  props: UnifiedThemeProviderProps,
) {
  return (
    <ThemeErrorBoundary
      onError={(error) => {
        console.error(
          "Theme system error, falling back to safe defaults:",
          error,
        );
      }}
    >
      <ThemeProvider {...props} />
    </ThemeErrorBoundary>
  );
}

// Theme system exports

// Re-export theme components
export { ThemeCustomizer } from "@/components/theme/theme-customizer";
export { ThemeSelector } from "@/components/theme/theme-selector";

// Export from context.tsx (legacy context)
export {
  ThemeProvider as LegacyThemeProvider,
  useTheme as useLegacyTheme,
} from "./context";

// Export other modules
export * from "./themes";
export * from "./types";
export * from "./utils";

// Export the context for advanced usage
export { UnifiedThemeContext };

// Export useThemeUtils from use-theme.ts
export { default as useThemeUtils } from "./use-theme";

// Default export
export default ThemeProvider;
