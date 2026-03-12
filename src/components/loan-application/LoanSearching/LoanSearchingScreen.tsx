"use client";

import { useTranslations } from "next-intl";
import { Spinner } from "@/components/ui/spinner";
import { useFormTheme } from "@/components/form-generation/themes";
import { cn } from "@/lib/utils";
import {
  useLoanSearchResult,
  useForwardStatus,
} from "@/store/use-loan-search-store";
import type { components } from "@/lib/api/v1/dop";

type ForwardResult = components["schemas"]["ForwardResult"];

interface LoanSearchingScreenProps {
  /**
   * Custom message to display (optional)
   * If not provided, will use default translation
   */
  message?: string;

  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * Loan Searching Screen Component
 *
 * Displays a loading state while the system searches for matching loans.
 * Uses the current theme system and i18n for translations.
 *
 * @example
 * ```tsx
 * <LoanSearchingScreen />
 * ```
 */
export function LoanSearchingScreen({
  message,
  className,
}: LoanSearchingScreenProps) {
  const t = useTranslations("pages.form.finding_loan");
  const { theme } = useFormTheme();

  // Get forward status and result from store
  const forwardStatus = useForwardStatus();
  const result = useLoanSearchResult<ForwardResult>();

  const displayMessage = message || t("message");

  // Determine display state
  const isLoading = !forwardStatus;
  const isSuccess = forwardStatus === "forwarded";
  const isError = forwardStatus === "rejected" || forwardStatus === "exhausted";
  const partnerName = result?.partner_name;

  return (
    <div
      className={cn(
        "flex min-h-screen items-center justify-center px-4 py-8",
        className,
      )}
    >
      <div className="w-full max-w-md mx-auto">
        {/* Content Container */}
        <div className="flex flex-col items-center gap-8 text-center">
          {/* Spinner - hide when success */}
          {!isSuccess && (
            <div
              className="relative"
              style={{
                color: theme.colors.primary,
              }}
            >
              <Spinner
                className="h-24 w-24"
                style={{
                  color: theme.colors.primary,
                }}
              />
            </div>
          )}

          {/* Message */}
          <div className="space-y-2">
            <p
              className="text-base leading-relaxed"
              style={{
                color: theme.colors.textPrimary || "#1f2937",
              }}
            >
              {displayMessage}
            </p>

            {/* Partner Info - shown when forwarded */}
            {isSuccess && partnerName && (
              <p
                className="text-sm font-medium mt-2"
                style={{
                  color: theme.colors.primary,
                }}
              >
                {t("partnerMatch", { partner: partnerName })}
              </p>
            )}

            {/* Error State */}
            {isError && (
              <p className="text-sm text-destructive mt-2">{t("noMatch")}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
