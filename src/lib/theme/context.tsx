"use client";

import {
  ThemeProvider as NextThemesProvider,
  ThemeProviderProps,
  useTheme as useNextTheme,
} from "next-themes";
import type React from "react";
import { createContext, useContext, useEffect, useState } from "react";
import { themes, userGroups } from "./themes";
import type { ThemeColors, ThemeState } from "./types";
import { applyTheme } from "./utils";

interface ThemeContextType {
  // Current state
  currentTheme: string;
  userGroup: string;
  customizations?: Partial<ThemeColors>;

  // Actions
  setTheme: (themeId: string) => void;
  setUserGroup: (groupId: string) => void;
  setCustomizations: (colors: Partial<ThemeColors>) => void;
  resetCustomizations: () => void;

  // Computed values
  availableThemes: string[];
  canCustomize: boolean;
  themeConfig: (typeof themes)[string] | null;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}

// This component acts as a bridge between next-themes and our custom theme system.
function ThemeSync() {
  const { resolvedTheme } = useNextTheme();
  const { currentTheme, customizations } = useTheme();

  useEffect(() => {
    const themeConfig = themes[currentTheme];
    if (themeConfig && resolvedTheme) {
      applyTheme(
        themeConfig,
        resolvedTheme as "light" | "dark",
        customizations,
      );
    }
  }, [currentTheme, resolvedTheme, customizations]);

  return null;
}

interface CustomThemeProviderProps
  extends Omit<ThemeProviderProps, "children"> {
  children: React.ReactNode;
  defaultUserGroup?: string;
  storageKey?: string;
}

export function ThemeProvider({
  children,
  defaultUserGroup = "system",
  storageKey = "dop-theme-config",
  ...props
}: CustomThemeProviderProps) {
  const [state, setState] = useState<ThemeState>(() => {
    const defaultState: ThemeState = {
      currentTheme: userGroups[defaultUserGroup]?.defaultTheme || "default",
      userGroup: defaultUserGroup,
    };

    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem(storageKey);
        if (stored) {
          // We ignore the 'mode' property from old stored configs
          const { mode, ...rest } = JSON.parse(stored);
          return { ...defaultState, ...rest };
        }
      } catch (error) {
        console.warn("Failed to load theme config from localStorage:", error);
      }
    }

    return defaultState;
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(storageKey, JSON.stringify(state));
      } catch (error) {
        console.warn("Failed to save theme config to localStorage:", error);
      }
    }
  }, [state, storageKey]);

  const setTheme = (themeId: string) => {
    if (themes[themeId]) {
      setState((prev) => ({ ...prev, currentTheme: themeId }));
    }
  };

  const setUserGroup = (groupId: string) => {
    const group = userGroups[groupId];
    if (group) {
      setState((prev) => ({
        ...prev,
        userGroup: groupId,
        currentTheme: group.defaultTheme,
        customizations: undefined,
      }));
    }
  };

  const setCustomizations = (colors: Partial<ThemeColors>) => {
    const group = userGroups[state.userGroup];
    if (group?.customizations?.allowCustomColors) {
      setState((prev) => ({
        ...prev,
        customizations: { ...prev.customizations, ...colors },
      }));
    }
  };

  const resetCustomizations = () => {
    setState((prev) => ({ ...prev, customizations: undefined }));
  };

  const currentGroup = userGroups[state.userGroup];
  const availableThemes = currentGroup?.availableThemes || ["default"];
  const canCustomize = currentGroup?.customizations?.allowCustomColors || false;
  const themeConfig = themes[state.currentTheme] || null;

  const contextValue: ThemeContextType = {
    currentTheme: state.currentTheme,
    userGroup: state.userGroup,
    customizations: state.customizations,
    setTheme,
    setUserGroup,
    setCustomizations,
    resetCustomizations,
    availableThemes,
    canCustomize,
    themeConfig,
  };

  return (
    <NextThemesProvider
      {...props}
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <ThemeContext.Provider value={contextValue}>
        <ThemeSync />
        {children}
      </ThemeContext.Provider>
    </NextThemesProvider>
  );
}
