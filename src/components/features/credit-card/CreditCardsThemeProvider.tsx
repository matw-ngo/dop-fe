"use client";

import { ReactNode, useEffect, useRef } from "react";
import { useTheme } from "@/lib/theme/context";

interface CreditCardsThemeProviderProps {
  children: ReactNode;
}

/**
 * Provider component that ensures the credit cards section uses the business user group
 * This component should be used to wrap credit cards-specific content
 */
export function CreditCardsThemeProvider({
  children,
}: CreditCardsThemeProviderProps) {
  const { userGroup, setUserGroup, setTheme } = useTheme();
  const isInitialized = useRef(false);

  useEffect(() => {
    // Only run this effect once to prevent infinite loops
    if (!isInitialized.current) {
      // Set the business user group for credit cards pages
      if (userGroup !== "business") {
        setUserGroup("business");
      } else {
        // If userGroup is already business, ensure corporate theme is set
        setTheme("corporate");
      }
      isInitialized.current = true;
    }
  }, [userGroup, setUserGroup, setTheme]);

  return <>{children}</>;
}
