/**
 * Form Generation Library - Legacy Loan Theme (DEPRECATED)
 *
 * @deprecated Use tenant-aware theming via TenantThemeProvider instead.
 * This theme is just an alias for finzoneTheme and will be removed in a future version.
 *
 * Migration:
 * ```tsx
 * // OLD - Don't use
 * import { FormThemeProvider, legacyLoanTheme } from "@/components/form-generation/themes";
 * <FormThemeProvider theme={legacyLoanTheme}>
 *   <YourComponent />
 * </FormThemeProvider>
 *
 * // NEW - Use tenant-aware theme (automatically applied in app)
 * <YourComponent />
 * ```
 *
 * @see TenantThemeProvider in @/components/layout/TenantThemeProvider
 * @see finzoneTheme in @/configs/themes/finzone-theme
 */

import { finzoneTheme } from "@/configs/themes/finzone-theme";
import type { FormTheme } from "./types";

/**
 * @deprecated Use TenantThemeProvider for automatic tenant-aware theming
 */
export const legacyLoanTheme: FormTheme = {
  ...finzoneTheme,
  name: "legacy-loan",
};
