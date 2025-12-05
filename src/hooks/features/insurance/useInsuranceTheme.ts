"use client";

import { useEffect } from "react";
import { useTheme } from "@/lib/theme/context";

/**
 * Hook to manage insurance-specific theme settings
 * Ensures the insurance section uses the healthcare user group
 */
export function useInsuranceTheme() {
  const { userGroup, setUserGroup, currentTheme, availableThemes, setTheme } =
    useTheme();

  useEffect(() => {
    // If not already in healthcare group, switch to it
    if (userGroup !== "healthcare") {
      setUserGroup("healthcare");
    }
  }, [userGroup, setUserGroup]);

  // Ensure medical theme is active
  useEffect(() => {
    if (currentTheme !== "medical" && availableThemes.includes("medical")) {
      setTheme("medical");
    }
  }, [currentTheme, availableThemes, setTheme]);

  return {
    isHealthcareGroup: userGroup === "healthcare",
    currentTheme,
    isMedicalTheme: currentTheme === "medical",
  };
}
