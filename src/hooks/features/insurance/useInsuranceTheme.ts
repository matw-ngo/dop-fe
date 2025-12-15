"use client";

import { useEffect } from "react";
import { useThemeUtils } from "@/components/renderer/theme";

/**
 * Hook to manage insurance-specific theme settings
 * Ensures the insurance section uses the medical theme
 */
export function useInsuranceTheme() {
  const { theme, setTheme } = useThemeUtils();

  // Ensure medical theme is active
  useEffect(() => {
    if (theme.name !== "medical") {
      setTheme("medical");
    }
  }, [theme, setTheme]);

  return {
    isHealthcareGroup: true, // Always true for insurance section
    currentTheme: theme.name,
    isMedicalTheme: theme.name === "medical",
  };
}
