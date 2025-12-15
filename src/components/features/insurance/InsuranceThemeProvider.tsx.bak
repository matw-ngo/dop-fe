"use client";

import { ReactNode, useEffect, useRef } from "react";
import { useTheme } from "@/components/renderer/theme/context";

interface InsuranceThemeProviderProps {
  children: ReactNode;
}

/**
 * Provider component that ensures the insurance section uses the healthcare user group
 * This component should be used to wrap insurance-specific content
 */
export function InsuranceThemeProvider({
  children,
}: InsuranceThemeProviderProps) {
  const { userGroup, setUserGroup, setTheme } = useTheme();
  const isInitialized = useRef(false);

  useEffect(() => {
    // Only run this effect once to prevent infinite loops
    if (!isInitialized.current) {
      // Set the healthcare user group for insurance pages
      if (userGroup !== "healthcare") {
        setUserGroup("healthcare");
      } else {
        // If userGroup is already healthcare, ensure medical theme is set
        setTheme("medical");
      }
      isInitialized.current = true;
    }
  }, [userGroup, setUserGroup, setTheme]);

  return <>{children}</>;
}
