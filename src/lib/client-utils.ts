"use client";

import { usePathname } from "next/navigation";

/**
 * Creates a URL path with locale prefix
 * @param path - The path without locale (e.g., "/admin/login")
 * @param locale - The locale to use (e.g., "vi", "en")
 * @returns The path with locale prefix (e.g., "/vi/admin/login")
 */
export function getLocalePath(path: string, locale: string): string {
  // Remove leading slash to avoid double slashes
  const cleanPath = path.startsWith("/") ? path.slice(1) : path;

  // If path already starts with locale, return as is
  if (cleanPath.startsWith(`${locale}/`) || cleanPath === locale) {
    return `/${cleanPath}`;
  }

  return `/${locale}/${cleanPath}`;
}

/**
 * Hook to get the current locale from pathname
 * @returns The current locale or default locale
 */
export function useCurrentLocale(): string {
  const pathname = usePathname();

  // Extract locale from pathname
  const segments = pathname.split("/").filter(Boolean);
  const locale = segments[0];

  // Validate locale (assuming vi and en are supported)
  const supportedLocales = ["vi", "en"];
  return supportedLocales.includes(locale) ? locale : "vi";
}

/**
 * Creates a localized redirect URL
 * @param path - The path without locale (e.g., "/admin/login")
 * @param currentPathname - The current pathname to extract locale from
 * @returns The localized redirect URL
 */
export function getLocalizedRedirect(
  path: string,
  currentPathname: string,
): string {
  const segments = currentPathname.split("/").filter(Boolean);
  const locale = segments[0];

  // Validate locale
  const supportedLocales = ["vi", "en"];
  const currentLocale = supportedLocales.includes(locale) ? locale : "vi";

  return getLocalePath(path, currentLocale);
}

/**
 * Client-side hook for creating localized paths
 * @returns A function to create localized paths
 */
export function useLocalizedPath() {
  const currentLocale = useCurrentLocale();

  return (path: string) => getLocalePath(path, currentLocale);
}
