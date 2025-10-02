"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ThemeProviderProps } from "next-themes/dist/types";
import type { ThemeState, ThemeMode, ThemeColors } from "./types";
import { themes, userGroups } from "./themes";
import { applyTheme, generateCSSVariables } from "./utils";

interface ThemeContextType {
  // Current state
  currentTheme: string;
  mode: ThemeMode;
  userGroup: string;
  customizations?: Partial<ThemeColors>;

  // Actions
  setTheme: (themeId: string) => void;
  setMode: (mode: ThemeMode) => void;
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
    // Initialize with default values
    const defaultState: ThemeState = {
      currentTheme: userGroups[defaultUserGroup]?.defaultTheme || "default",
      mode: "system",
      userGroup: defaultUserGroup,
    };

    // Try to load from localStorage on client side
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem(storageKey);
        if (stored) {
          const parsed = JSON.parse(stored);
          return { ...defaultState, ...parsed };
        }
      } catch (error) {
        console.warn("Failed to load theme config from localStorage:", error);
      }
    }

    return defaultState;
  });

  // Save to localStorage whenever state changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(storageKey, JSON.stringify(state));
      } catch (error) {
        console.warn("Failed to save theme config to localStorage:", error);
      }
    }
  }, [state, storageKey]);

  // Apply theme whenever it changes
  useEffect(() => {
    const theme = themes[state.currentTheme];
    if (theme) {
      applyTheme(theme, state.mode, state.customizations);
    }
  }, [state.currentTheme, state.mode, state.customizations]);

  const setTheme = (themeId: string) => {
    if (themes[themeId]) {
      setState((prev) => ({ ...prev, currentTheme: themeId }));
    }
  };

  const setMode = (mode: ThemeMode) => {
    setState((prev) => ({ ...prev, mode }));
  };

  const setUserGroup = (groupId: string) => {
    const group = userGroups[groupId];
    if (group) {
      setState((prev) => ({
        ...prev,
        userGroup: groupId,
        currentTheme: group.defaultTheme,
        customizations: undefined, // Reset customizations when changing groups
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

  // Computed values
  const currentGroup = userGroups[state.userGroup];
  const availableThemes = currentGroup?.availableThemes || ["default"];
  const canCustomize = currentGroup?.customizations?.allowCustomColors || false;
  const themeConfig = themes[state.currentTheme] || null;

  const contextValue: ThemeContextType = {
    currentTheme: state.currentTheme,
    mode: state.mode,
    userGroup: state.userGroup,
    customizations: state.customizations,
    setTheme,
    setMode,
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
        {children}
      </ThemeContext.Provider>
    </NextThemesProvider>
  );
}
