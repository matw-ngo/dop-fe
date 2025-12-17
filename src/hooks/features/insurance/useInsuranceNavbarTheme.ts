"use client";

import { useMemo } from "react";
import { useThemeUtils } from "@/components/renderer/theme";
import { baseInsuranceNavbarConfig } from "@/configs/insurance-navbar-config";
import type { NavbarConfig } from "@/configs/navbar-config";

/**
 * Hook to get theme-aware insurance navbar configuration
 * This hook ensures the navbar colors match the active theme
 */
export function useInsuranceNavbarTheme(): NavbarConfig {
  const { theme, resolvedTheme } = useThemeUtils();

  return useMemo(() => {
    // Default colors
    let iconColor = "#2563eb"; // Default blue

    // Apply theme-specific colors
    if (theme) {
      if (theme.name === "medical") {
        // Medical theme uses specific blue tones
        // Light mode: oklch(0.45 0.12 200) -> hex approx #1e40af
        // Dark mode: oklch(0.65 0.12 200) -> hex approx #2563eb
        iconColor = resolvedTheme === "dark" ? "#2563eb" : "#1e40af";
      } else {
        // Use the theme's primary color
        iconColor = theme.colors.primary || "#2563eb";
      }
    }

    // Return the config with theme-aware colors
    return {
      ...baseInsuranceNavbarConfig,
      logo: {
        ...baseInsuranceNavbarConfig.logo,
        iconColor,
      },
    };
  }, [theme, resolvedTheme]);
}
