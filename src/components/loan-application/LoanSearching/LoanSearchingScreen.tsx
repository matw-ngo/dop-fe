"use client";

import { useTranslations } from "next-intl";
import { Spinner } from "@/components/ui/spinner";
import { useFormTheme } from "@/components/form-generation/themes";
import { cn } from "@/lib/utils";

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

  const displayMessage = message || t("message");

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
          {/* Spinner */}
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
          </div>
        </div>
      </div>
    </div>
  );
}
