/**
 * Form Generation Library - Themes
 *
 * Theme system for form components
 *
 * @remarks
 * For most use cases, use TenantThemeProvider which automatically applies
 * the correct theme based on the current tenant. Direct theme usage is only
 * needed for special cases like Storybook or isolated components.
 *
 * @see TenantThemeProvider in @/components/layout/TenantThemeProvider
 */

export { defaultTheme } from "./default";
/**
 * @deprecated Use TenantThemeProvider for automatic tenant-aware theming
 */
export { legacyLoanTheme } from "./legacy-loan";
export { FormThemeProvider, useFormTheme } from "./ThemeProvider";
export type { FormTheme } from "./types";
