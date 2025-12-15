"use client";

import { ReactNode, useEffect, useRef } from "react";
import { useThemeUtils } from "@/components/renderer/theme";

interface InsuranceThemeProviderProps {
  children: ReactNode;
}

/**
 * Provider component that ensures the insurance section uses the medical theme
 * This component should be used to wrap insurance-specific content
 */
export function InsuranceThemeProvider({
  children,
}: InsuranceThemeProviderProps) {
  const { setTheme } = useThemeUtils();
  const isInitialized = useRef(false);

  useEffect(() => {
    // Only run this effect once to prevent infinite loops
    if (!isInitialized.current) {
      // Set the medical theme for insurance pages
      setTheme("medical");
      isInitialized.current = true;
    }
  }, [setTheme]);

  return <>{children}</>;
}
