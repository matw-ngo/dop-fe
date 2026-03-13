"use client";

import { useTranslations } from "next-intl";
import { useFormTheme } from "@/components/form-generation/themes";
import { cn } from "@/lib/utils";
import {
  useMatchedProducts,
  useForwardStatus,
  useLoanSearchResult,
} from "@/store/use-loan-search-store";
import type { components } from "@/lib/api/v1/dop";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Banknote,
  CreditCard,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

type MatchedProduct = components["schemas"]["matched_product"];
type ForwardResult = components["schemas"]["ForwardResult"];

interface LoanResultScreenProps {
  /**
   * Callback when user selects a product
   */
  onSelectProduct?: (product: MatchedProduct) => void;
  /**
   * Callback for "view more" action
   */
  onViewMore?: () => void;
  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * Special partner configurations
 * For partners requiring special handling (like CathayBank)
 */
const SPECIAL_PARTNER_CONFIGS: Record<
  string,
  {
    theme: "blue" | "green" | "gold" | "purple";
    customMessage?: string;
    hideDetails?: boolean;
  }
> = {
  CATHAYBANK: {
    theme: "blue",
    customMessage: "specialPartner.cathaybank.message",
    hideDetails: false,
  },
  // Add more special partners as needed
};

/**
 * Format loan period for display
 */
function formatLoanPeriod(months: number): string {
  if (months < 12) return `${months} tháng`;
  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;
  if (remainingMonths === 0) return `${years} năm`;
  return `${years} năm ${remainingMonths} tháng`;
}

/**
 * Format currency amount
 */
function formatAmount(amount: number): string {
  if (amount >= 1000000000) {
    return `${(amount / 1000000000).toFixed(1)} tỷ`;
  }
  if (amount >= 1000000) {
    return `${(amount / 1000000).toFixed(0)} triệu`;
  }
  return amount.toLocaleString("vi-VN");
}

/**
 * Get partner logo path
 */
function getPartnerLogo(partnerCode: string): string {
  return `/images/partners/${partnerCode.toLowerCase()}.png`;
}

/**
 * Check if partner requires special handling
 */
function isSpecialPartner(partnerCode: string): boolean {
  return partnerCode.toUpperCase() in SPECIAL_PARTNER_CONFIGS;
}

/**
 * Product Card Component
 */
function ProductCard({
  product,
  onSelect,
  index,
}: {
  product: MatchedProduct;
  onSelect?: (product: MatchedProduct) => void;
  index: number;
}) {
  const t = useTranslations("pages.loan_result");
  const { theme } = useFormTheme();
  const partnerCode = product.partner_code.toUpperCase();
  const isSpecial = isSpecialPartner(partnerCode);
  const specialConfig = SPECIAL_PARTNER_CONFIGS[partnerCode];

  return (
    <Card
      className={cn(
        "overflow-hidden transition-all duration-300 hover:shadow-lg",
        isSpecial && "ring-2 ring-primary/20",
      )}
      style={{
        borderColor: isSpecial ? theme.colors.primary : undefined,
      }}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            {/* Partner Logo */}
            <div
              className="w-12 h-12 rounded-lg flex items-center justify-center bg-white shadow-sm"
              style={{ border: `1px solid ${theme.colors.border}` }}
            >
              <img
                src={getPartnerLogo(product.partner_code)}
                alt={product.partner_name}
                className="w-10 h-10 object-contain"
                onError={(e) => {
                  // Fallback to default icon if logo not found
                  (e.target as HTMLImageElement).style.display = "none";
                  (e.target as HTMLImageElement).parentElement!.innerHTML =
                    '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>';
                }}
              />
            </div>
            <div>
              <h3
                className="font-semibold text-lg"
                style={{ color: theme.colors.textPrimary }}
              >
                {product.partner_name}
              </h3>
              <Badge
                variant="secondary"
                className="text-xs mt-1"
                style={{
                  backgroundColor: `${theme.colors.primary}15`,
                  color: theme.colors.primary,
                }}
              >
                {product.product_type === "personal_loan"
                  ? t("loanType.personal")
                  : product.product_type === "credit_card"
                    ? t("loanType.creditCard")
                    : t("loanType.other")}
              </Badge>
            </div>
          </div>
          {isSpecial && (
            <Badge
              className="text-xs"
              style={{
                backgroundColor: theme.colors.primary,
                color: "#fff",
              }}
            >
              {t("specialPartner.badge")}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {/* Special partner message */}
        {isSpecial && specialConfig?.customMessage && (
          <p
            className="text-sm mb-4 p-2 rounded-md"
            style={{
              backgroundColor: `${theme.colors.primary}10`,
              color: theme.colors.primary,
            }}
          >
            {t(specialConfig.customMessage)}
          </p>
        )}

        {/* Product details - hidden for special partners if configured */}
        {(!isSpecial || !specialConfig?.hideDetails) && (
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="flex items-center gap-2">
              <Calendar
                className="w-4 h-4"
                style={{ color: theme.colors.primary }}
              />
              <span
                className="text-sm"
                style={{ color: theme.colors.textSecondary }}
              >
                {formatLoanPeriod(12)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Banknote
                className="w-4 h-4"
                style={{ color: theme.colors.primary }}
              />
              <span
                className="text-sm"
                style={{ color: theme.colors.textSecondary }}
              >
                {formatAmount(50000000)}
              </span>
            </div>
          </div>
        )}

        {/* Action button */}
        <Button
          onClick={() => onSelect?.(product)}
          className="w-full transition-all"
          style={{
            backgroundColor: theme.colors.primary,
            color: "#fff",
          }}
        >
          <span>{t("actions.register")}</span>
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </CardContent>
    </Card>
  );
}

/**
 * Success View Component
 * Shown when forward is successful
 */
function SuccessView({ forwardResult }: { forwardResult: ForwardResult }) {
  const t = useTranslations("pages.loan_result");
  const { theme } = useFormTheme();

  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div
        className="w-20 h-20 rounded-full flex items-center justify-center mb-6"
        style={{ backgroundColor: `${theme.colors.primary}20` }}
      >
        <CheckCircle2
          className="w-10 h-10"
          style={{ color: theme.colors.primary }}
        />
      </div>
      <h2
        className="text-2xl font-bold mb-2"
        style={{ color: theme.colors.textPrimary }}
      >
        {t("success.title")}
      </h2>
      <p
        className="text-base mb-4"
        style={{ color: theme.colors.textSecondary }}
      >
        {t("success.message", { partner: forwardResult.partner_name })}
      </p>
      {forwardResult.partner_lead_id && (
        <p className="text-sm" style={{ color: theme.colors.textSecondary }}>
          {t("success.leadId", { id: forwardResult.partner_lead_id })}
        </p>
      )}
    </div>
  );
}

/**
 * Loan Result Screen Component
 *
 * Displays matched products from distribution engine.
 * Supports special partner handling (e.g., CathayBank).
 * Uses theme system and i18n for customization.
 */
export function LoanResultScreen({
  onSelectProduct,
  onViewMore,
  className,
}: LoanResultScreenProps) {
  const t = useTranslations("pages.loan_result");
  const { theme } = useFormTheme();

  const matchedProducts = useMatchedProducts();
  const forwardStatus = useForwardStatus();
  const forwardResult = useLoanSearchResult<ForwardResult>();

  const hasProducts = matchedProducts.length > 0;
  const isForwarded = forwardStatus === "forwarded";

  // Show success view if already forwarded
  if (isForwarded && forwardResult) {
    return (
      <div
        className={cn(
          "flex min-h-screen items-center justify-center px-4 py-8",
          className,
        )}
      >
        <div className="w-full max-w-md">
          <SuccessView forwardResult={forwardResult} />
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex min-h-screen items-start justify-center px-4 py-8",
        className,
      )}
      style={{ backgroundColor: theme.colors.background }}
    >
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1
            className="text-2xl font-bold mb-2"
            style={{ color: theme.colors.textPrimary }}
          >
            {t("title")}
          </h1>
          <p style={{ color: theme.colors.textSecondary }}>
            {t("subtitle", { count: matchedProducts.length })}
          </p>
        </div>

        {/* Product List */}
        {hasProducts ? (
          <div className="space-y-4">
            {matchedProducts.map((product, index) => (
              <ProductCard
                key={product.product_id}
                product={product}
                onSelect={onSelectProduct}
                index={index}
              />
            ))}
          </div>
        ) : (
          <div
            className="text-center py-12 rounded-lg"
            style={{ backgroundColor: `${theme.colors.primary}10` }}
          >
            <CreditCard
              className="w-16 h-16 mx-auto mb-4"
              style={{ color: theme.colors.primary }}
            />
            <p style={{ color: theme.colors.textSecondary }}>
              {t("noResults")}
            </p>
          </div>
        )}

        {/* View More Button */}
        {onViewMore && hasProducts && (
          <div className="mt-8 text-center">
            <Button
              variant="outline"
              onClick={onViewMore}
              className="w-full sm:w-auto"
              style={{
                borderColor: theme.colors.border,
                color: theme.colors.textPrimary,
              }}
            >
              {t("actions.viewMore")}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export default LoanResultScreen;
