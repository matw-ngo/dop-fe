"use client";

import { useTranslations } from "next-intl";
import { useFormTheme } from "@/components/form-generation/themes";
import { AlertCircle, ArrowLeft, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorStateProps {
  error?: string;
  status?: "rejected" | "exhausted" | "error";
  onRetry?: () => void;
  onBack?: () => void;
}

/**
 * Error State View
 *
 * Displayed when there's an error or the application was rejected.
 */
export function ErrorState({
  error,
  status = "error",
  onRetry,
  onBack,
}: ErrorStateProps) {
  const t = useTranslations("pages.loan_result");
  const { theme } = useFormTheme();

  // Get appropriate message based on status
  const messageKey =
    status === "rejected"
      ? "error.rejected"
      : status === "exhausted"
        ? "error.exhausted"
        : "error.message";

  return (
    <div className="flex flex-col items-center justify-center py-12 text-center px-4">
      {/* Error Icon */}
      <div
        className="w-20 h-20 rounded-full flex items-center justify-center mb-6"
        style={{ backgroundColor: "rgba(239, 68, 68, 0.15)" }}
      >
        <AlertCircle className="w-10 h-10 text-red-500" />
      </div>

      {/* Title */}
      <h2
        className="text-xl font-semibold mb-2"
        style={{ color: theme.colors.textPrimary }}
      >
        {t("error.title")}
      </h2>

      {/* Message */}
      <p
        className="text-base mb-6 max-w-md"
        style={{ color: theme.colors.textSecondary }}
      >
        {error || t(messageKey)}
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
