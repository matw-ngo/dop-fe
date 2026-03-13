"use client";

import { useTranslations } from "next-intl";
import { useFormTheme } from "@/components/form-generation/themes";
import { CheckCircle2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { components } from "@/lib/api/v1/dop";
import { getPartnerLogoUrl } from "../utils/formatters";

type MatchedProduct = components["schemas"]["matched_product"];

interface RegistrationSuccessViewProps {
  product: MatchedProduct;
  onBack?: () => void;
}

/**
 * Registration Success View
 *
 * Displayed after user selects a loan product ("Đăng ký vay").
 * Matches old LoanSuccessBox design: title, success icon, partner box, note.
 */
export function RegistrationSuccessView({
  product,
  onBack,
}: RegistrationSuccessViewProps) {
  const t = useTranslations("pages.loan_result");
  const { theme } = useFormTheme();

  return (
    <div className="flex flex-col items-center py-12 px-4">
      {/* Title */}
      <h4
        className="text-2xl font-bold text-center mb-6"
        style={{ color: theme.colors.textPrimary }}
      >
        {t("success.notificationTitle")}
      </h4>

      {/* Success Icon */}
      <div
        className="w-20 h-20 rounded-full flex items-center justify-center mb-4"
        style={{ backgroundColor: `${theme.colors.primary}20` }}
      >
        <CheckCircle2
          className="w-10 h-10"
          style={{ color: theme.colors.primary }}
        />
      </div>

      {/* Success message */}
      <p
        className="text-base text-center mb-8"
        style={{ color: theme.colors.textPrimary }}
      >
        {t("success.registrationSuccess")}
      </p>

      {/* Partner Box */}
      <div
        className="w-full max-w-md rounded-xl p-5 mb-6"
        style={{
          border: `1px solid ${theme.colors.border}`,
          backgroundColor: "#fff",
        }}
      >
        {/* Logo + Name row with border-bottom */}
        <div
          className="flex items-center gap-4 pb-4 mb-4"
          style={{ borderBottom: `1px solid ${theme.colors.border}` }}
        >
          <div
            className="w-20 h-12 rounded flex items-center justify-center bg-white flex-shrink-0"
            style={{ border: `1px solid ${theme.colors.border}` }}
          >
            <img
              src={getPartnerLogoUrl(product.partner_code)}
              alt={product.partner_name}
              className="w-10 h-10 object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          </div>
          <p
            className="font-semibold text-lg"
            style={{ color: theme.colors.textPrimary }}
          >
            {product.partner_name}
          </p>
        </div>

        {/* Product Name */}
        <p className="text-sm" style={{ color: theme.colors.textSecondary }}>
          {product.product_name}
        </p>
      </div>

      {/* Partner Note */}
      <p
        className="text-sm text-center max-w-md mb-8"
        style={{ color: theme.colors.textSecondary }}
      >
        {t("success.partnerNote", { partner: product.partner_name })}
      </p>

      {/* Back Button */}
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
    </div>
  );
}
