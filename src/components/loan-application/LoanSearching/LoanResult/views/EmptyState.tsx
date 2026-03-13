"use client";

import { useTranslations } from "next-intl";
import { useFormTheme } from "@/components/form-generation/themes";
import { CreditCard, ArrowLeft, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  onRetry?: () => void;
  onBack?: () => void;
}

/**
 * Empty State View
 *
 * Displayed when no loan products match the user's profile.
 */
export function EmptyState({ onRetry, onBack }: EmptyStateProps) {
  const t = useTranslations("pages.loan_result");
  const { theme } = useFormTheme();

  return (
    <div className="flex flex-col items-center justify-center py-12 text-center px-4">
      {/* Icon */}
      <div
        className="w-20 h-20 rounded-full flex items-center justify-center mb-6"
        style={{ backgroundColor: `${theme.colors.primary}15` }}
      >
        <CreditCard
          className="w-10 h-10"
          style={{ color: theme.colors.primary }}
        />
      </div>

      {/* Message */}
      <h2
        className="text-xl font-semibold mb-2"
        style={{ color: theme.colors.textPrimary }}
      >
        {t("emptyState.title")}
      </h2>
      <p
        className="text-base mb-6 max-w-md"
        style={{ color: theme.colors.textSecondary }}
      >
        {t("emptyState.message")}
      </p>

      {/* Actions */}
      <div className="flex gap-3">
        {onBack && (
          <Button
            variant="outline"
            onClick={onBack}
            style={{
              borderColor: theme.colors.border,
              color: theme.colors.textPrimary,
            }}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t("actions.back")}
          </Button>
        )}
        {onRetry && (
          <Button
            onClick={onRetry}
            style={{
              backgroundColor: theme.colors.primary,
              color: "#fff",
            }}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            {t("actions.retry")}
          </Button>
        )}
      </div>
    </div>
  );
}
