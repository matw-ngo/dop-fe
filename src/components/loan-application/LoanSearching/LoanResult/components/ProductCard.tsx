"use client";

import { useTranslations } from "next-intl";
import { useFormTheme } from "@/components/form-generation/themes";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Banknote, ArrowRight, Building2 } from "lucide-react";
import type { components } from "@/lib/api/v1/dop";
import {
  isSpecialPartner,
  getSpecialPartnerConfig,
} from "../config/special-partners";
import {
  formatLoanPeriod,
  formatAmount,
  getPartnerLogoUrl,
  getLoanTypeKey,
} from "../utils/formatters";

type MatchedProduct = components["schemas"]["matched_product"];

interface ProductCardProps {
  product: MatchedProduct;
  onSelect?: (product: MatchedProduct) => void;
  index: number;
  locale?: string;
}

/**
 * Product Card Component
 *
 * Displays a single matched loan product with:
 * - Partner logo and name
 * - Loan type badge
 * - Loan details (period, amount)
 * - CTA button
 *
 * Supports special partner configurations for custom styling.
 */
export function ProductCard({
  product,
  onSelect,
  index,
  locale = "vi",
}: ProductCardProps) {
  const t = useTranslations("pages.loan_result");
  const { theme } = useFormTheme();

  const partnerCode = product.partner_code.toUpperCase();
  const isSpecial = isSpecialPartner(partnerCode);
  const specialConfig = getSpecialPartnerConfig(partnerCode);

  // Get translation keys
  const loanTypeKey = getLoanTypeKey(product.product_type);
  const ctaKey = specialConfig?.customCtaKey || "actions.register";
  const badgeKey = specialConfig?.badgeKey || "specialPartner.badge";

  return (
    <Card
      className={cn(
        "relative overflow-visible transition-all duration-300 hover:shadow-lg",
        isSpecial && "ring-2 ring-primary/20",
      )}
      style={{
        borderColor: isSpecial ? theme.colors.primary : undefined,
        animationDelay: `${index * 100}ms`,
      }}
    >
      {/* Loan type tag - centered at top, overlapping card border */}
      <div className="absolute left-1/2 -translate-x-1/2 -top-[17.5px]">
        <Badge
          variant="secondary"
          className="text-xs rounded-full px-3 py-1 whitespace-nowrap"
          style={{
            backgroundColor: `${theme.colors.primary}15`,
            color: theme.colors.primary,
            border: `1px solid ${theme.colors.border}`,
          }}
        >
          {isSpecial ? t(badgeKey) : t(loanTypeKey)}
        </Badge>
      </div>

      <CardContent className="pt-8 pb-6 px-6">
        {/* Logo + Name section with border-bottom */}
        <div
          className="flex items-center gap-4 pb-5 mb-5"
          style={{ borderBottom: `1px solid ${theme.colors.border}` }}
        >
          <div
            className="w-20 h-12 rounded flex items-center justify-center bg-white flex-shrink-0"
            style={{ border: `1px solid ${theme.colors.border}` }}
          >
            <ProductLogo partnerCode={product.partner_code} />
          </div>
          <h3
            className="font-semibold text-lg leading-tight"
            style={{ color: theme.colors.textPrimary }}
          >
            {product.partner_name}
          </h3>
        </div>

        {/* Special Partner Custom Message */}
        {isSpecial && specialConfig?.customMessageKey && (
          <p
            className="text-sm mb-4 p-2 rounded-md"
            style={{
              backgroundColor: `${theme.colors.primary}10`,
              color: theme.colors.primary,
            }}
          >
            {t(specialConfig.customMessageKey)}
          </p>
        )}

        {/* Product Details - hidden for special partners if configured */}
        {(!isSpecial || !specialConfig?.hideDetails) && (
          <div className="space-y-4 mb-5">
            <div className="flex items-center justify-between">
              <span
                className="flex items-center gap-1.5 text-sm"
                style={{ color: theme.colors.primary }}
              >
                <Calendar className="w-4 h-4" />
                {t("details.loanPeriod")}
              </span>
              <span
                className="text-sm font-medium whitespace-nowrap"
                style={{ color: theme.colors.textPrimary }}
              >
                {formatLoanPeriod(12, locale)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span
                className="flex items-center gap-1.5 text-sm"
                style={{ color: theme.colors.primary }}
              >
                <Banknote className="w-4 h-4" />
                {t("details.loanAmount")}
              </span>
              <span
                className="text-sm font-medium whitespace-nowrap"
                style={{ color: theme.colors.textPrimary }}
              >
                {formatAmount(50000000, locale)}
              </span>
            </div>
          </div>
        )}

        {/* CTA Button */}
        <Button
          onClick={() => onSelect?.(product)}
          className="w-full transition-all h-14 text-sm font-semibold rounded-lg"
          style={{
            backgroundColor: theme.colors.primary,
            color: "#fff",
          }}
        >
          <span>{t(ctaKey)}</span>
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </CardContent>
    </Card>
  );
}

/**
 * Product Logo Component
 * Handles image loading with fallback
 */
function ProductLogo({ partnerCode }: { partnerCode: string }) {
  const { theme } = useFormTheme();

  return (
    <img
      src={getPartnerLogoUrl(partnerCode)}
      alt={partnerCode}
      className="w-10 h-10 object-contain"
      onError={(e) => {
        const container = (e.target as HTMLImageElement).parentElement;
        if (container) {
          (e.target as HTMLImageElement).style.display = "none";
          // Inject fallback icon
          const icon = document.createElement("div");
          icon.innerHTML = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="${theme.colors.primary}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>`;
          container.appendChild(icon.firstChild!);
        }
      }}
    />
  );
}

/**
 * Product Detail Item
 */
function ProductDetail({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  const { theme } = useFormTheme();

  return (
    <div className="flex items-center gap-2">
      <span style={{ color: theme.colors.primary }}>{icon}</span>
      <div className="flex flex-col">
        <span className="text-xs" style={{ color: theme.colors.textSecondary }}>
          {label}
        </span>
        <span
          className="text-sm font-medium"
          style={{ color: theme.colors.textPrimary }}
        >
          {value}
        </span>
      </div>
    </div>
  );
}
