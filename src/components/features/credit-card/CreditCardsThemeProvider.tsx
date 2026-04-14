"use client";

import { type ReactNode, useEffect, useRef } from "react";
import { useTheme } from "@/components/renderer/theme";

interface CreditCardsThemeProviderProps {
  children: ReactNode;
}

/**
 * Provider component that ensures the credit cards section uses the business theme
 * This component should be used to wrap credit cards-specific content
 */
export function CreditCardsThemeProvider({
  children,
}: CreditCardsThemeProviderProps) {
  const { setThemeById } = useTheme();
  const isInitialized = useRef(false);

  useEffect(() => {
    // Only run this effect once to prevent infinite loops
    if (!isInitialized.current) {
      // Set the corporate theme for credit cards pages
      setThemeById("corporate");
      isInitialized.current = true;
    }
  }, [setThemeById]);

  return <>{children}</>;
}
