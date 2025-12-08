"use client";

import { useMemo } from "react";
import { useTheme } from "@/components/renderer/theme/context";
import { useTheme as useNextTheme } from "next-themes";
import { baseInsuranceNavbarConfig } from "@/configs/insurance-navbar-config";
import { NavbarConfig } from "@/configs/navbar-config";

/**
 * Hook to get theme-aware insurance navbar configuration
 * This hook ensures the navbar colors match the active theme
 */
export function useInsuranceNavbarTheme(): NavbarConfig {
  const { themeConfig, userGroup } = useTheme();
  const { resolvedTheme } = useNextTheme();

  return useMemo(() => {
    // Default colors
    let iconColor = "#2563eb"; // Default blue

    // Apply theme-specific colors
    if (themeConfig) {
      if (themeConfig.id === "medical" || userGroup === "healthcare") {
        // Medical theme uses specific blue tones
        // Light mode: oklch(0.45 0.12 200) -> hex approx #1e40af
        // Dark mode: oklch(0.65 0.12 200) -> hex approx #2563eb
        iconColor = resolvedTheme === "dark" ? "#2563eb" : "#1e40af";
      } else {
        // Use the theme's primary color based on current mode
        const mode = resolvedTheme === "dark" ? "dark" : "light";
        iconColor = themeConfig.colors[mode]?.primary || "#2563eb";
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
  }, [themeConfig, userGroup, resolvedTheme]);
}
