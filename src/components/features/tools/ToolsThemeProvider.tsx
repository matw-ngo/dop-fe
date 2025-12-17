"use client";

import { type ReactNode, useEffect, useRef } from "react";
import { useThemeUtils } from "@/components/renderer/theme";

interface ToolsThemeProviderProps {
  children: ReactNode;
  defaultTheme?: "finance" | "medical" | "corporate";
}

/**
 * Provider component that ensures the tools section uses the appropriate theme
 * This component should be used to wrap tools-specific content
 *
 * Features:
 * - Persistent theme selection for tools
 * - Supports finance, medical, and corporate themes
 * - Prevents infinite loops with proper initialization
 */
export function ToolsThemeProvider({
  children,
  defaultTheme = "finance",
}: ToolsThemeProviderProps) {
  const { theme, setTheme, resolvedTheme } = useThemeUtils();
  const isInitialized = useRef(false);

  useEffect(() => {
    // Only run this effect once to prevent infinite loops
    if (!isInitialized.current) {
      // Check if we have a saved tools theme preference
      const savedToolsTheme = localStorage.getItem("dop-tools-theme");

      if (savedToolsTheme) {
        // Restore saved theme preference
        try {
          const { themeId } = JSON.parse(savedToolsTheme);
          // Set the saved theme
          setTheme(themeId);
        } catch (error) {
          console.warn("Failed to parse saved tools theme:", error);
          // Fall back to default theme
          setTheme(defaultTheme);
        }
      } else {
        // No saved preference, use default
        setTheme(defaultTheme);
      }

      isInitialized.current = true;
    }
  }, [setTheme, defaultTheme]);

  // Save theme changes to localStorage for persistence
  useEffect(() => {
    if (isInitialized.current && theme) {
      // Save current theme configuration for tools
      const themeConfig = {
        themeId: theme.name || defaultTheme,
        timestamp: Date.now(),
      };

      localStorage.setItem("dop-tools-theme", JSON.stringify(themeConfig));
    }
  }, [theme, defaultTheme]);

  return <>{children}</>;
}
