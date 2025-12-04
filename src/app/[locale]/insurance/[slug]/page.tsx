"use client";

import { notFound } from "next/navigation";
import { useParams } from "next/navigation";
import { INSURANCE_PRODUCTS } from "@/data/insurance-products";
import type { InsuranceProduct } from "@/types/insurance";
import InsuranceDetails from "@/components/features/insurance/InsuranceDetails";
import BreadcrumbNav from "@/components/ui/breadcrumb-nav";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Shield, Phone, Mail, Globe } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import Head from "next/head";

// Helper function to get product by slug
function getInsuranceProductBySlug(slug: string): InsuranceProduct | undefined {
  return INSURANCE_PRODUCTS.find((product) => product.slug === slug);
}

// SEO metadata component
function SEOHead({
  product,
  locale,
}: {
  product: InsuranceProduct;
  locale: string;
}) {
  const title = product.metaTitle || `${product.name} - ${product.issuer}`;
  const description =
    product.metaDescription ||
    `Thông tin chi tiết về ${product.name} từ ${product.issuer}`;
  const keywords = [
    product.name,
    product.issuer,
    product.category,
    ...product.tags,
  ].join(", ");
  const canonicalUrl = `/${locale}/insurance/${product.slug}`;

  return (
    <Head>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta property="og:type" content="website" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={product.image} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={product.imageAlt} />
      <meta property="og:locale" content={locale} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={product.image} />
      <link rel="canonical" href={canonicalUrl} />
      <link rel="alternate" hrefLang={locale} href={canonicalUrl} />
      <link
        rel="alternate"
        hrefLang="x-default"
        href={`/en/insurance/${product.slug}`}
      />
    </Head>
  );
}

// Structured data for SEO
function generateStructuredData(product: InsuranceProduct) {
  return {
    "@context": "https://schema.org",
    "@type": "InsuranceProduct",
    name: product.name,
    provider: {
      "@type": "Organization",
      name: product.issuer,
    },
    category: product.category,
    offers: {
      "@type": "Offer",
      price: product.pricing.totalPremium,
      priceCurrency: product.pricing.currency,
      availability: "https://schema.org/InStock",
    },
    description: product.metaDescription,
    image: product.image,
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: product.rating,
      reviewCount: product.reviewCount,
    },
  };
}

export default function InsuranceProductDetailPage() {
  const params = useParams() as { locale: string; slug: string };
  const t = useTranslations("pages.insurance");
  const tCommon = useTranslations("common");
  const [product, setProduct] = useState<InsuranceProduct | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const foundProduct = getInsuranceProductBySlug(params.slug);
    if (!foundProduct) {
      notFound();
    }
    setProduct(foundProduct);
    setLoading(false);
  }, [params.slug]);

  if (loading || !product) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">{tCommon("loading") || "Đang tải..."}</div>
      </div>
    );
  }

  const structuredData = generateStructuredData(product);

  // Breadcrumb items
  const breadcrumbItems = [
    { label: t("breadcrumb.home") || "Trang chủ", href: `/${params.locale}` },
    {
      label: t("breadcrumb.insurance") || "Bảo hiểm",
      href: `/${params.locale}/insurance`,
    },
    {
      label: getCategoryDisplayName(product.category, t),
      href: `/${params.locale}/insurance?category=${product.category}`,
    },
    { label: product.name },
  ];

  return (
    <>
      {/* SEO Meta Tags */}
      <SEOHead product={product} locale={params.locale} />

      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="border-b bg-card">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center gap-4 mb-4">
              <Link href={`/${params.locale}/insurance`}>
                <Button variant="outline" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  {tCommon("back") || "Quay lại"}
                </Button>
              </Link>
            </div>

            {/* Breadcrumb */}
            <BreadcrumbNav items={breadcrumbItems} />

            <div className="mt-6">
              <div className="flex items-start gap-4">
                <div className="w-20 h-20 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Shield className="w-10 h-10 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-3xl font-bold tracking-tight">
                      {product.name}
                    </h1>
                    {product.isRecommended && (
                      <Badge
                        variant="secondary"
                        className="bg-yellow-100 text-yellow-800"
                      >
                        {t("recommended") || "Đề xuất"}
                      </Badge>
                    )}
                    {product.isNew && (
                      <Badge
                        variant="secondary"
                        className="bg-green-100 text-green-800"
                      >
                        {t("new") || "Mới"}
                      </Badge>
                    )}
                  </div>
                  <p className="text-xl text-muted-foreground mb-3">
                    {product.issuer}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>
                      {t("productCode") || "Mã sản phẩm"}:{" "}
                      {product.productCode || product.id}
                    </span>
                    <span>•</span>
                    <span>
                      {t("rating") || "Đánh giá"}: {product.rating}/5 (
                      {t("reviews") || "đánh giá"})
                      {product.reviewCount.toLocaleString("vi-VN")}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-8">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content Area */}
            <div className="lg:col-span-2">
              <InsuranceDetails product={product} />
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Key Highlights Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-primary" />
                    {t("keyHighlights") || "Điểm nổi bật"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-muted/30 p-3 rounded-lg">
                      <p className="text-xs text-muted-foreground mb-1">
                        {t("premium") || "Phí bảo hiểm"}
                      </p>
                      <p className="text-lg font-semibold text-primary">
                        {formatCurrency(product.pricing.totalPremium)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        /
                        {getCoveragePeriodDisplay(
                          product.pricing.coveragePeriod,
                          t,
                        )}
                      </p>
                    </div>
                    <div className="bg-muted/30 p-3 rounded-lg">
                      <p className="text-xs text-muted-foreground mb-1">
                        {t("maxCoverage") || "Mức bồi thường cao nhất"}
                      </p>
                      <p className="text-lg font-semibold text-primary">
                        {getMaxCoverageDisplay(product, t)}
                      </p>
                    </div>
                  </div>

                  {product.features.slice(0, 3).map((feature, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-green-600 text-xs">✓</span>
                      </div>
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Premium Information */}
              <Card>
                <CardHeader>
                  <CardTitle>
                    {t("premiumInfo") || "Thông tin phí bảo hiểm"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      {t("basePremium") || "Phí cơ bản"}:
                    </span>
                    <span className="font-medium">
                      {formatCurrency(product.pricing.basePremium)}
                    </span>
                  </div>
                  {product.pricing.taxAmount > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        {t("vatTax", { rate: product.pricing.taxRate * 100 }) ||
                          `Thuế VAT (${product.pricing.taxRate * 100}%):`}
                      </span>
                      <span className="font-medium">
                        {formatCurrency(product.pricing.taxAmount)}
                      </span>
                    </div>
                  )}
                  <div className="border-t pt-3">
                    <div className="flex justify-between">
                      <span className="font-semibold">
                        {t("totalPremium") || "Tổng phí"}:
                      </span>
                      <span className="font-bold text-lg text-primary">
                        {formatCurrency(product.pricing.totalPremium)}
                      </span>
                    </div>
                  </div>
                  {product.paymentOptions.installmentAvailable && (
                    <p className="text-xs text-muted-foreground">
                      ✓ {t("installmentSupported") || "Hỗ trợ trả góp"}
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* CTA Buttons */}
              <Card>
                <CardContent className="pt-6 space-y-3">
                  <Button className="w-full" size="lg" asChild>
                    <Link href={product.applyLink}>
                      {t("applyNow") || "Đăng ký ngay"}
                    </Link>
                  </Button>
                  <Button variant="outline" className="w-full" asChild>
                    <Link
                      href={`/${params.locale}/insurance/compare?ids=${product.id}`}
                    >
                      {t("compareProduct") || "So sánh sản phẩm"}
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              {/* Contact Information */}
              <Card>
                <CardHeader>
                  <CardTitle>
                    {t("contactInfo") || "Thông tin liên hệ"}
                  </CardTitle>
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

              {/* Claims Information */}
              <Card>
                <CardHeader>
                  <CardTitle>
                    {t("claimsInfo") || "Thông tin bồi thường"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      {t("approvalRate") || "Tỷ lệ duyệt"}:
                    </span>
                    <span className="font-medium text-green-600">
                      {product.claims.approvalRate}%
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      {t("processingTime") || "Thời gian xử lý"}:
                    </span>
                    <span className="font-medium">
                      {product.claims.processingTime}{" "}
                      {t("workingDays") || "ngày làm việc"}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      {t("averageClaimTime") || "Thời gian chi trả trung bình"}:
                    </span>
                    <span className="font-medium">
                      {product.claims.averageClaimTime} {t("days") || "ngày"}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// Helper functions
function getCategoryDisplayName(category: string, t: any): string {
  const categoryKeys: Record<string, string> = {
    vehicle: "categories.vehicle",
    health: "categories.health",
    life: "categories.life",
    travel: "categories.travel",
    property: "categories.property",
  };
  return t(categoryKeys[category]) || category;
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
  // Find the highest coverage limit
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
    return `${(maxLimit / 1000000000).toFixed(0)} ${t("currency.billion") || "tỷ VNĐ"}`;
  } else if (maxLimit >= 1000000) {
    return `${(maxLimit / 1000000).toFixed(0)} ${t("currency.million") || "triệu VNĐ"}`;
  }

  return formatCurrency(maxLimit);
}
