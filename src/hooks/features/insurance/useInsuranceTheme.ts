"use client";

import { useEffect } from "react";
import { useTheme } from "@/components/renderer/theme";

/**
 * Hook to manage insurance-specific theme settings
 * Ensures the insurance section uses the medical theme
 */
export function useInsuranceTheme() {
  const { currentTheme, setThemeByName } = useTheme();

  // Ensure medical theme is active
  useEffect(() => {
    if (currentTheme !== "medical") {
      setThemeByName("medical");
    }
  }, [currentTheme, setThemeByName]);

  return {
    isHealthcareGroup: true, // Always true for insurance section
    currentTheme,
    isMedicalTheme: currentTheme === "medical",
  };
}
