"use client";

import { ReactNode, useEffect, useRef } from "react";
import { useThemeUtils } from "@/components/renderer/theme";

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
  const { setTheme, setThemeDebounced, resolvedTheme } = useThemeUtils();
  const isInitialized = useRef(false);

  useEffect(() => {
    // Only run this effect once to prevent infinite loops
    if (!isInitialized.current) {
      // Set the corporate theme for credit cards pages
      setTheme("corporate");
      isInitialized.current = true;
    }
  }, [setTheme]);

  return <>{children}</>;
}
