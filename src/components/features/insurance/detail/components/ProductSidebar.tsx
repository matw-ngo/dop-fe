import type { InsuranceProduct } from "@/types/insurance";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { Shield, Phone, Mail, Globe } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";

interface ProductSidebarProps {
  product: InsuranceProduct;
  locale: string;
}

export const ProductSidebar = ({ product, locale }: ProductSidebarProps) => {
  const t = useTranslations("features.insurance.detail");

  return (
    <div className="space-y-6">
      <KeyHighlightsCard product={product} t={t} />
      <PremiumInformationCard product={product} t={t} />
      <CTAButtons product={product} locale={locale} t={t} />
      <ContactInformationCard product={product} />
      <ClaimsInformationCard product={product} t={t} />
    </div>
  );
};

function KeyHighlightsCard({
  product,
  t,
}: {
  product: InsuranceProduct;
  t: any;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-primary" />
          {t("keyHighlights")}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-muted/30 p-3 rounded-lg">
            <p className="text-xs text-muted-foreground mb-1">{t("premium")}</p>
            <p className="text-lg font-semibold text-primary">
              {formatCurrency(product.pricing.totalPremium)}
            </p>
            <p className="text-xs text-muted-foreground">
              /{getCoveragePeriodDisplay(product.pricing.coveragePeriod, t)}
            </p>
          </div>
          <div className="bg-muted/30 p-3 rounded-lg">
            <p className="text-xs text-muted-foreground mb-1">
              {t("maxCoverage")}
            </p>
            <p className="text-lg font-semibold text-primary">
              {getMaxCoverageDisplay(product, t)}
            </p>
          </div>
        </div>

        {product.features.slice(0, 3).map((feature, index) => (
          <div key={index} className="flex items-start gap-2">
            <div className="w-5 h-5 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-primary text-xs">✓</span>
            </div>
            <span className="text-sm">{feature}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function PremiumInformationCard({
  product,
  t,
}: {
  product: InsuranceProduct;
  t: any;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("premiumInfo")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex justify-between">
          <span className="text-muted-foreground">{t("basePremium")}:</span>
          <span className="font-medium">
            {formatCurrency(product.pricing.basePremium)}
          </span>
        </div>
        {product.pricing.taxAmount > 0 && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">
              {t("vatTax", { rate: product.pricing.taxRate * 100 })}
            </span>
            <span className="font-medium">
              {formatCurrency(product.pricing.taxAmount)}
            </span>
          </div>
        )}
        <div className="border-t pt-3">
          <div className="flex justify-between">
            <span className="font-semibold">{t("totalPremium")}:</span>
            <span className="font-bold text-lg text-primary">
              {formatCurrency(product.pricing.totalPremium)}
            </span>
          </div>
        </div>
        {product.paymentOptions.installmentAvailable && (
          <p className="text-xs text-muted-foreground">
            ✓ {t("installmentSupported")}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function CTAButtons({
  product,
  locale,
  t,
}: {
  product: InsuranceProduct;
  locale: string;
  t: any;
}) {
  return (
    <Card>
      <CardContent className="pt-6 space-y-3">
        <Button className="w-full" size="lg" asChild>
          <Link href={product.applyLink}>{t("applyNow")}</Link>
        </Button>
        <Button variant="outline" className="w-full" asChild>
          <Link href={`/${locale}/insurance/compare?ids=${product.id}`}>
            {t("compareProduct")}
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

function ContactInformationCard({ product }: { product: InsuranceProduct }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Thông tin liên hệ</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <a
          href={`tel:${product.claims.contactInfo.hotline.replace(/\s/g, "")}`}
          className="flex items-center gap-3 text-sm hover:text-primary transition-colors"
        >
          <Phone className="w-4 h-4 text-muted-foreground" />
          <span>{product.claims.contactInfo.hotline}</span>
        </a>
        <a
          href={`mailto:${product.claims.contactInfo.email}`}
          className="flex items-center gap-3 text-sm hover:text-primary transition-colors"
        >
          <Mail className="w-4 h-4 text-muted-foreground" />
          <span>{product.claims.contactInfo.email}</span>
        </a>
        {product.claims.contactInfo.website && (
          <a
            href={`https://${product.claims.contactInfo.website}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 text-sm hover:text-primary transition-colors"
          >
            <Globe className="w-4 h-4 text-muted-foreground" />
            <span>{product.claims.contactInfo.website}</span>
          </a>
        )}
      </CardContent>
    </Card>
  );
}

function ClaimsInformationCard({
  product,
  t,
}: {
  product: InsuranceProduct;
  t: any;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("claimsInfo")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">{t("approvalRate")}:</span>
          <span className="font-medium text-green-600">
            {product.claims.approvalRate}%
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">{t("processingTime")}:</span>
          <span className="font-medium">
            {product.claims.processingTime} {t("workingDays")}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">
            {t("averageClaimTime")}:
          </span>
          <span className="font-medium">
            {product.claims.averageClaimTime} {t("days")}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

function getCoveragePeriodDisplay(period: string, t: any): string {
  const periodKeys: Record<string, string> = {
    monthly: "coveragePeriods.monthly",
    quarterly: "coveragePeriods.quarterly",
    "semi-annually": "coveragePeriods.semiAnnually",
    annually: "coveragePeriods.annually",
    custom: "coveragePeriods.custom",
  };
  return t(periodKeys[period]) || period;
}

function getMaxCoverageDisplay(product: InsuranceProduct, t: any): string {
  const coverageLimits = [
    product.coverage.personalAccident.limit,
    product.coverage.death.limit,
    product.coverage.disability.limit,
    product.coverage.medicalExpenses.limit,
    product.coverage.propertyDamage.limit,
    product.coverage.criticalIllness.limit,
  ].filter((limit) => limit > 0 && !product.coverage.personalAccident.disabled);

  const maxLimit = Math.max(...coverageLimits);

  if (maxLimit >= 1000000000) {
    return `${(maxLimit / 1000000000).toFixed(0)} ${t("currency.billion")}`;
  } else if (maxLimit >= 1000000) {
    return `${(maxLimit / 1000000).toFixed(0)} ${t("currency.million")}`;
  }

  return formatCurrency(maxLimit);
}
