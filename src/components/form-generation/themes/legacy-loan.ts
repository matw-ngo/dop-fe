/**
 * Form Generation Library - Legacy Loan Theme (Simplified)
 *
 * Simplified theme matching the legacy LoanExtraInfoForm component
 * Only contains truly customizable properties
 */

import { finzoneTheme } from "@/configs/themes/finzone-theme";
import type { FormTheme } from "./types";

export const legacyLoanTheme: FormTheme = {
  ...finzoneTheme,
  name: "legacy-loan",
};
