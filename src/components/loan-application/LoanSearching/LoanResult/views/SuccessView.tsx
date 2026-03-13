"use client";

import { useTranslations } from "next-intl";
import { useFormTheme } from "@/components/form-generation/themes";
import { CheckCircle2, ArrowRight } from "lucide-react";
import type { components } from "@/lib/api/v1/dop";
import { Button } from "@/components/ui/button";

type ForwardResult = components["schemas"]["ForwardResult"];

interface SuccessViewProps {
  forwardResult: ForwardResult;
  onContinue?: () => void;
}

/**
 * Success View Component
 *
 * Displayed when a loan application has been successfully forwarded
 * to a financial institution partner.
 */
export function SuccessView({ forwardResult, onContinue }: SuccessViewProps) {
  const t = useTranslations("pages.loan_result");
  const { theme } = useFormTheme();

  return (
    <div className="flex flex-col items-center justify-center py-12 text-center px-4">
      {/* Success Icon */}
      <div
        className="w-20 h-20 rounded-full flex items-center justify-center mb-6"
        style={{ backgroundColor: `${theme.colors.primary}20` }}
      >
        <CheckCircle2
          className="w-10 h-10"
          style={{ color: theme.colors.primary }}
        />
      </div>

      {/* Title */}
      <h2
        className="text-2xl font-bold mb-2"
        style={{ color: theme.colors.textPrimary }}
      >
        {t("success.title")}
      </h2>

      {/* Partner Message */}
      <p
        className="text-base mb-4 max-w-md"
        style={{ color: theme.colors.textSecondary }}
      >
        {t("success.message", { partner: forwardResult.partner_name })}
      </p>

      {/* Partner Lead ID (if available) */}
      {forwardResult.partner_lead_id && (
        <div
          className="px-4 py-2 rounded-lg mb-6"
          style={{
            backgroundColor: `${theme.colors.primary}10`,
            border: `1px solid ${theme.colors.border}`,
          }}
        >
          <p
            className="text-sm font-medium"
            style={{ color: theme.colors.primary }}
          >
            {t("success.leadId", { id: forwardResult.partner_lead_id })}
          </p>
        </div>
      )}

      {/* Continue Button */}
      {onContinue && (
        <Button
          onClick={onContinue}
          className="mt-4"
          style={{
            backgroundColor: theme.colors.primary,
            color: "#fff",
          }}
        >
          <span>{t("actions.continue")}</span>
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      )}
    </div>
  );
}
