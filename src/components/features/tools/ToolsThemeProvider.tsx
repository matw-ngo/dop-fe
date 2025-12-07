"use client";

import { ReactNode, useEffect, useRef } from "react";
import { useTheme } from "@/lib/theme/context";

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
  const { userGroup, setUserGroup, setTheme, currentTheme } = useTheme();
  const isInitialized = useRef(false);

  useEffect(() => {
    // Only run this effect once to prevent infinite loops
    if (!isInitialized.current) {
      // Check if we have a saved tools theme preference
      const savedToolsTheme = localStorage.getItem("dop-tools-theme");

      if (savedToolsTheme) {
        // Restore saved theme preference
        try {
          const { themeId, userGroupId } = JSON.parse(savedToolsTheme);

          // Set user group first if different
          if (userGroup !== userGroupId) {
            setUserGroup(userGroupId);
          } else {
            // If user group is already correct, set the theme
            setTheme(themeId);
          }
        } catch (error) {
          console.warn("Failed to parse saved tools theme:", error);
          // Fall back to default theme
          setDefaultTheme();
        }
      } else {
        // No saved preference, use default
        setDefaultTheme();
      }

      isInitialized.current = true;
    }
  }, [userGroup, setUserGroup, setTheme]);

  // Save theme changes to localStorage for persistence
  useEffect(() => {
    if (isInitialized.current && currentTheme) {
      // Save current theme configuration for tools
      const themeConfig = {
        themeId: currentTheme,
        userGroup: userGroup,
        timestamp: Date.now(),
      };

      localStorage.setItem("dop-tools-theme", JSON.stringify(themeConfig));
    }
  }, [currentTheme, userGroup]);

  const setDefaultTheme = () => {
    // Set the appropriate user group based on default theme
    const themeToUserGroupMap = {
      finance: "finance",
      medical: "healthcare",
      corporate: "business",
    };

    const targetUserGroup = themeToUserGroupMap[defaultTheme];

    if (userGroup !== targetUserGroup) {
      setUserGroup(targetUserGroup);
    } else {
      setTheme(defaultTheme);
    }
  };

  return <>{children}</>;
}
