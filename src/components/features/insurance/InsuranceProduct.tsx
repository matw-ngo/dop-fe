"use client";

import {
  ArrowLeftRight,
  Award,
  Banknote,
  Car,
  CheckCircle,
  Clock,
  ExternalLink,
  Heart,
  Home,
  Phone,
  Plane,
  Plus,
  Shield,
  Star,
  User,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";
import type React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  COVERAGE_PERIODS,
  INSURANCE_CATEGORIES,
  INSURANCE_TYPES,
} from "@/constants/insurance";
import { cn } from "@/lib/utils";
import type { InsuranceProduct } from "@/types/insurance";

interface InsuranceProductProps {
  product: InsuranceProduct;
  viewMode?: "grid" | "list" | "compact";
  showCompareButton?: boolean;
  onCompareToggle?: (productId: string) => void;
  isComparing?: boolean;
  onClick?: (product: InsuranceProduct) => void;
  className?: string;
}

const InsuranceProductCard: React.FC<InsuranceProductProps> = ({
  product,
  viewMode = "grid",
  showCompareButton = true,
  onCompareToggle,
  isComparing = false,
  onClick,
  className,
}) => {
  const t = useTranslations("features.insurance.listing");

  // Format currency to VND
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Get category icon
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "vehicle":
        return <Car className="h-4 w-4" />;
      case "health":
        return <Heart className="h-4 w-4" />;
      case "life":
        return <User className="h-4 w-4" />;
      case "travel":
        return <Plane className="h-4 w-4" />;
      case "property":
        return <Home className="h-4 w-4" />;
      default:
        return <Shield className="h-4 w-4" />;
    }
  };

  // Get category badge color
  const getCategoryBadgeVariant = (category: string) => {
    switch (category) {
      case "vehicle":
        return "default";
      case "health":
        return "destructive";
      case "life":
        return "secondary";
      case "travel":
        return "outline";
      case "property":
        return "default";
      default:
        return "default";
    }
  };

  // Get type badge color
  const getTypeBadgeVariant = (type: string) => {
    return type === "compulsory" ? "destructive" : "secondary";
  };

  // Render stars for rating
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={cn(
          "h-4 w-4",
          i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300",
        )}
      />
    ));
  };

  // Handle compare button click
  const handleCompareClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onCompareToggle) {
      onCompareToggle(product.id);
    }
  };

  // Handle product click
  const handleProductClick = (e: React.MouseEvent) => {
    if (onClick) {
      e.preventDefault();
      onClick(product);
    }
  };

  // Get active coverage highlights
  const getCoverageHighlights = () => {
    const highlights = [];
    const { coverage } = product;

    if (
      !coverage.personalAccident.disabled &&
      coverage.personalAccident.limit > 0
    ) {
      highlights.push({
        label: t("personalAccident"),
        value: formatCurrency(coverage.personalAccident.limit),
        icon: <User className="h-4 w-4" />,
      });
    }

    if (
      !coverage.propertyDamage.disabled &&
      coverage.propertyDamage.limit > 0
    ) {
      highlights.push({
        label: t("propertyDamage"),
        value: formatCurrency(coverage.propertyDamage.limit),
        icon: <Home className="h-4 w-4" />,
      });
    }

    if (
      !coverage.medicalExpenses.disabled &&
      coverage.medicalExpenses.limit > 0
    ) {
      highlights.push({
        label: t("medicalExpenses"),
        value: formatCurrency(coverage.medicalExpenses.limit),
        icon: <Heart className="h-4 w-4" />,
      });
    }

    if (
      !coverage.thirdPartyLiability.disabled &&
      coverage.thirdPartyLiability.limit > 0
    ) {
      highlights.push({
        label: t("thirdPartyLiability"),
        value: formatCurrency(coverage.thirdPartyLiability.limit),
        icon: <Shield className="h-4 w-4" />,
      });
    }

    return highlights.slice(0, 3);
  };

  // Compact view for comparison table
  if (viewMode === "compact") {
    return (
      <div
        className={cn("flex items-center space-x-3 p-2", className)}
        role="article"
        aria-labelledby={`product-name-${product.id}`}
        aria-describedby={`product-issuer-${product.id}`}
      >
        <Image
          src={product.image || "/images/insurance-placeholder.png"}
          alt={product.imageAlt || product.name}
          width={60}
          height={40}
          className="object-contain rounded"
        />
        <div className="flex-1 min-w-0">
          <h4
            id={`product-name-${product.id}`}
            className="font-medium truncate"
          >
            {product.name}
          </h4>
          <p
            id={`product-issuer-${product.id}`}
            className="text-sm text-muted-foreground"
          >
            {product.issuer}
          </p>
        </div>
        <div
          className="flex items-center space-x-2"
          aria-label={`${t("category")}: ${INSURANCE_CATEGORIES[product.category]?.name || product.category}, ${t("type")}: ${INSURANCE_TYPES[product.type]?.name || product.type}`}
        >
          <Badge variant={getCategoryBadgeVariant(product.category)}>
            {INSURANCE_CATEGORIES[product.category]?.name || product.category}
          </Badge>
          <Badge variant={getTypeBadgeVariant(product.type)}>
            {INSURANCE_TYPES[product.type]?.name || product.type}
          </Badge>
        </div>
      </div>
    );
  }

  // List view
  if (viewMode === "list") {
    const coverageHighlights = getCoverageHighlights();

    return (
      <Card
        className={cn(
          "cursor-pointer transition-all hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary",
          isComparing && "ring-2 ring-primary",
          className,
        )}
        role="article"
        aria-labelledby={`list-product-name-${product.id}`}
        aria-describedby={`list-product-details-${product.id}`}
        tabIndex={0}
        onClick={handleProductClick}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            if (onClick) {
              onClick(product);
            } else {
              window.location.href = `/insurance/${product.slug}`;
            }
          }
        }}
      >
        <CardContent className="p-4">
          <div className="flex items-center space-x-4">
            <Image
              src={product.image || "/images/insurance-placeholder.png"}
              alt={product.imageAlt || product.name}
              width={120}
              height={80}
              className="object-contain rounded-lg flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div>
                  <h3
                    id={`list-product-name-${product.id}`}
                    className="font-semibold text-lg"
                  >
                    {product.name}
                  </h3>
                  <p
                    id={`list-product-details-${product.id}`}
                    className="text-muted-foreground"
                  >
                    {product.issuer}
                  </p>
                  <div
                    className="flex items-center space-x-2 mt-1"
                    aria-label={`${t("rating")}: ${product.rating} ${t("outOf")} 5 (${product.reviewCount} ${t("reviews")})`}
                  >
                    <div className="flex items-center" aria-hidden="true">
                      {renderStars(product.rating)}
                    </div>
                    <span className="text-sm text-muted-foreground">
                      ({product.reviewCount})
                    </span>
                  </div>
                </div>
                <div className="flex flex-col items-end space-y-2">
                  <div className="flex items-center space-x-2">
                    <Badge variant={getCategoryBadgeVariant(product.category)}>
                      {getCategoryIcon(product.category)}
                      <span className="ml-1">
                        {INSURANCE_CATEGORIES[product.category]?.name ||
                          product.category}
                      </span>
                    </Badge>
                    <Badge variant={getTypeBadgeVariant(product.type)}>
                      {INSURANCE_TYPES[product.type]?.name || product.type}
                    </Badge>
                  </div>
                  {product.isRecommended && (
                    <Badge variant="secondary" className="text-xs">
                      {t("recommended")}
                    </Badge>
                  )}
                  {product.isNew && (
                    <Badge variant="destructive" className="text-xs">
                      {t("new")}
                    </Badge>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                <div>
                  <p className="text-sm text-muted-foreground">
                    {t("premium")}
                  </p>
                  <p className="font-medium">
                    {formatCurrency(product.pricing.totalPremium)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {COVERAGE_PERIODS[product.pricing.coveragePeriod]?.name ||
                      product.pricing.coveragePeriod}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    {t("coverage")}
                  </p>
                  <p className="font-medium">
                    {formatCurrency(
                      Math.max(
                        product.coverage.personalAccident.limit,
                        product.coverage.propertyDamage.limit,
                        product.coverage.medicalExpenses.limit,
                        product.coverage.thirdPartyLiability.limit,
                      ),
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    {t("claimsApproval")}
                  </p>
                  <p className="font-medium">{product.claims.approvalRate}%</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    {t("processingTime")}
                  </p>
                  <p className="font-medium">
                    {product.claims.processingTime} {t("days")}
                  </p>
                </div>
              </div>

              {coverageHighlights.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm text-muted-foreground mb-2">
                    {t("keyCoverages")}
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    {coverageHighlights.map((highlight, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        {highlight.icon}
                        <span className="text-sm">{highlight.label}:</span>
                        <span className="font-medium text-sm">
                          {highlight.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between mt-4">
                <div className="flex flex-wrap gap-2">
                  {product.features.slice(0, 3).map((feature, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {feature}
                    </Badge>
                  ))}
                  {product.features.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{product.features.length - 3} {t("more")}
                    </Badge>
                  )}
                </div>
                {showCompareButton && (
                  <Button
                    variant={isComparing ? "secondary" : "outline"}
                    size="sm"
                    onClick={handleCompareClick}
                    role="switch"
                    aria-checked={isComparing}
                    aria-label={
                      isComparing
                        ? t("removeFromComparison")
                        : t("addToComparison")
                    }
                    className={cn(
                      isComparing
                        ? "bg-primary text-primary-foreground hover:bg-primary/90"
                        : "hover:bg-accent",
                    )}
                  >
                    {isComparing ? (
                      <>
                        <CheckCircle className="h-4 w-4 mr-1" />
                        {t("inComparison")}
                      </>
                    ) : (
                      <>
                        <ArrowLeftRight className="h-4 w-4 mr-1" />
                        {t("compare")}
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Grid view (default)
  const coverageHighlights = getCoverageHighlights();

  return (
    <Card
      className={cn(
        "cursor-pointer transition-all hover:shadow-lg hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-primary",
        isComparing && "ring-2 ring-primary",
        className,
      )}
      role="article"
      aria-labelledby={`grid-product-name-${product.id}`}
      tabIndex={0}
      onClick={handleProductClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          if (onClick) {
            onClick(product);
          } else {
            window.location.href = `/insurance/${product.slug}`;
          }
        }
      }}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div
            className="flex items-center space-x-2"
            aria-label={`${t("category")}: ${INSURANCE_CATEGORIES[product.category]?.name || product.category}, ${t("type")}: ${INSURANCE_TYPES[product.type]?.name || product.type}`}
          >
            <Badge variant={getCategoryBadgeVariant(product.category)}>
              {getCategoryIcon(product.category)}
              <span className="ml-1">
                {INSURANCE_CATEGORIES[product.category]?.name ||
                  product.category}
              </span>
            </Badge>
            <Badge variant={getTypeBadgeVariant(product.type)}>
              {INSURANCE_TYPES[product.type]?.name || product.type}
            </Badge>
          </div>
          {showCompareButton && (
            <Button
              variant={isComparing ? "default" : "ghost"}
              size="sm"
              className={cn(
                "h-8 w-8 p-0",
                isComparing &&
                  "bg-primary text-primary-foreground hover:bg-primary/90",
              )}
              onClick={handleCompareClick}
              role="switch"
              aria-checked={isComparing}
              aria-label={
                isComparing ? t("removeFromComparison") : t("addToComparison")
              }
            >
              {isComparing ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
            </Button>
          )}
        </div>
        {product.isRecommended && (
          <Badge variant="secondary" className="text-xs w-fit">
            <Award className="h-3 w-3 mr-1" />
            {t("recommended")}
          </Badge>
        )}
        {product.isNew && (
          <Badge variant="destructive" className="text-xs w-fit">
            {t("new")}
          </Badge>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="relative h-32 mx-auto">
          <Image
            src={product.image || "/images/insurance-placeholder.png"}
            alt={product.imageAlt || product.name}
            fill
            className="object-contain"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>

        <div className="space-y-2">
          <h3
            id={`grid-product-name-${product.id}`}
            className="font-semibold text-lg line-clamp-1"
          >
            {product.name}
          </h3>
          <p className="text-muted-foreground text-sm">{product.issuer}</p>

          <div
            className="flex items-center space-x-1"
            aria-label={`${t("rating")}: ${product.rating} ${t("outOf")} 5 (${product.reviewCount} ${t("reviews")})`}
          >
            <div className="flex items-center" aria-hidden="true">
              {renderStars(product.rating)}
            </div>
            <span className="text-sm text-muted-foreground ml-1">
              ({product.reviewCount})
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 text-sm">
          <div
            className="flex items-center space-x-1"
            aria-label={`${t("premium")}: ${formatCurrency(product.pricing.totalPremium)}`}
          >
            <Banknote
              className="h-4 w-4 text-muted-foreground"
              aria-hidden="true"
            />
            <span className="font-medium">
              {formatCurrency(product.pricing.totalPremium)}
            </span>
          </div>
          <div
            className="flex items-center space-x-1"
            aria-label={`${t("coveragePeriod")}: ${COVERAGE_PERIODS[product.pricing.coveragePeriod]?.name || product.pricing.coveragePeriod}`}
          >
            <Clock
              className="h-4 w-4 text-muted-foreground"
              aria-hidden="true"
            />
            <span className="text-xs">
              {COVERAGE_PERIODS[product.pricing.coveragePeriod]?.name ||
                product.pricing.coveragePeriod}
            </span>
          </div>
        </div>

        {coverageHighlights.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">{t("keyCoverages")}</p>
            <div className="space-y-1">
              {coverageHighlights.map((highlight, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between text-xs"
                >
                  <div className="flex items-center space-x-1">
                    {highlight.icon}
                    <span>{highlight.label}</span>
                  </div>
                  <span className="font-medium">{highlight.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <Separator />

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">{t("claimsApproval")}</span>
            <span className="font-medium">{product.claims.approvalRate}%</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">{t("processingTime")}</span>
            <span className="font-medium">
              {product.claims.processingTime} {t("days")}
            </span>
          </div>
        </div>

        {product.additionalServices?.roadsideAssistance && (
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Phone className="h-4 w-4" />
            <span>{t("roadsideAssistance")}</span>
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-0">
        <Link
          href={`/insurance/${product.slug}`}
          className="w-full"
          onClick={(e) => e.stopPropagation()}
        >
          <Button className="w-full" variant="outline">
            {t("viewDetails")}
            <ExternalLink className="h-4 w-4 ml-2" />
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
};

export default InsuranceProductCard;
