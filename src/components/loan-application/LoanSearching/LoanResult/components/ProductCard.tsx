"use client";

import { useTranslations } from "next-intl";
import { useFormTheme } from "@/components/form-generation/themes";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
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
        "overflow-hidden transition-all duration-300 hover:shadow-lg",
        isSpecial && "ring-2 ring-primary/20",
      )}
      style={{
        borderColor: isSpecial ? theme.colors.primary : undefined,
        animationDelay: `${index * 100}ms`,
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
              <ProductLogo partnerCode={product.partner_code} />
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
                {t(loanTypeKey)}
              </Badge>
            </div>
          </div>

          {/* Special Partner Badge */}
          {isSpecial && (
            <Badge
              className="text-xs"
              style={{
                backgroundColor: theme.colors.primary,
                color: "#fff",
              }}
            >
              {t(badgeKey)}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-0">
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
          <div className="grid grid-cols-2 gap-3 mb-4">
            <ProductDetail
              icon={<Calendar className="w-4 h-4" />}
              label={t("details.loanPeriod")}
              value={formatLoanPeriod(12, locale)}
            />
            <ProductDetail
              icon={<Banknote className="w-4 h-4" />}
              label={t("details.loanAmount")}
              value={formatAmount(50000000, locale)}
            />
          </div>
        )}

        {/* CTA Button */}
        <Button
          onClick={() => onSelect?.(product)}
          className="w-full transition-all"
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
