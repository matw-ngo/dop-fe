"use client";

import { useTranslations } from "next-intl";
import { useMemo } from "react";

/**
 * Hook that provides a safe translation function that doesn't throw errors
 * when translation keys are missing
 */
export function useSafeTranslations() {
  const tRaw = useTranslations();

  // Safe translation wrapper that doesn't throw
  const t = useMemo(() => {
    const safeFn = (key: string, values?: Record<string, any>) => {
      try {
        return tRaw(key, values);
      } catch (_error) {
        // Return key as fallback for missing translations
        console.warn(
          `Translation key "${key}" not found, using key as fallback`,
        );
        return key;
      }
    };

    // Add has method for checking key existence
    (safeFn as any).has = (key: string) => {
      try {
        return tRaw.has ? tRaw.has(key) : false;
      } catch {
        return false;
      }
    };

    return safeFn;
  }, [tRaw]);

  return t;
}
