"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { ArrowRight, Shield, Plus, Loader2 } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { INSURANCE_PRODUCTS } from "@/data/insurance-products";
import { INSURANCE_CATEGORIES } from "@/constants/insurance";
import { cn } from "@/lib/utils";
import type { InsuranceProduct } from "@/types/insurance";
import InsuranceProductCard from "./InsuranceProduct";

interface SuggestionScore {
  product: InsuranceProduct;
  score: number;
  reasons: string[];
}

interface ComparisonSuggestionsProps {
  currentProducts: InsuranceProduct[];
  maxSuggestions?: number;
  onAddToComparison: (productId: string) => void;
  title?: string;
  className?: string;
}

// Calculate suggestion score based on multiple factors
const calculateSuggestionScore = (
  product: InsuranceProduct,
  currentProducts: InsuranceProduct[],
): SuggestionScore => {
  let score = 0;
  const reasons: string[] = [];

  // Get average values from current products for comparison
  const avgCoverage = currentProducts.reduce((acc, p) => {
    const maxCoverage = Math.max(
      p.coverage.personalAccident.limit,
      p.coverage.propertyDamage.limit,
      p.coverage.medicalExpenses.limit,
      p.coverage.thirdPartyLiability.limit,
    );
    return acc + maxCoverage;
  }, 0) / currentProducts.length;

  const avgPremium = currentProducts.reduce(
    (acc, p) => acc + p.pricing.totalPremium,
    0,
  ) / currentProducts.length;

  // Get categories and issuers from current products
  const categories = new Set(currentProducts.map((p) => p.category));
  const issuers = new Set(currentProducts.map((p) => p.issuer));

  // Same category (highest weight)
  if (categories.has(product.category)) {
    score += 40;
    reasons.push("Cùng danh mục");
  }

  // Same issuer
  if (issuers.has(product.issuer)) {
    score += 25;
    reasons.push("Cùng nhà cung cấp");
  }

  // Similar coverage range (within 30% of average)
  const productMaxCoverage = Math.max(
    product.coverage.personalAccident.limit,
    product.coverage.propertyDamage.limit,
    product.coverage.medicalExpenses.limit,
    product.coverage.thirdPartyLiability.limit,
  );

  const coverageDiff = Math.abs(avgCoverage - productMaxCoverage);
  const coverageSimilarity = Math.max(
    0,
    100 - (coverageDiff / avgCoverage) * 100,
  );
  if (coverageSimilarity > 70) {
    score += 20;
    reasons.push("Quyền lợi bảo hiểm tương đương");
  } else if (coverageSimilarity > 50) {
    score += 10;
    reasons.push("Quyền lợi bảo hiểm gần tương đương");
  }

  // Similar premium range (within 30% of average)
  const premiumDiff = Math.abs(avgPremium - product.pricing.totalPremium);
  const premiumSimilarity = (premiumDiff / avgPremium) * 100;
  if (premiumSimilarity <= 30) {
    score += 15;
    reasons.push("Phí bảo hiểm tương đương");
  }

  // Recommended products bonus
  if (product.isRecommended) {
    score += 20;
    reasons.push("Được đề xuất");
  }

  // Popular products (high review count)
  if (product.reviewCount > 100) {
    score += 10;
    reasons.push("Phổ biến");
  }

  // High rating bonus
  if (product.rating >= 4.5) {
    score += 10;
    reasons.push("Đánh giá cao");
  }

  // New products bonus
  if (product.isNew) {
    score += 5;
    reasons.push("Sản phẩm mới");
  }

  return { product, score, reasons };
};

const ComparisonSuggestions: React.FC<ComparisonSuggestionsProps> = ({
  currentProducts,
  maxSuggestions = 6,
  onAddToComparison,
  title,
  className,
}) => {
  const t = useTranslations("pages.insurance");
  const [isLoading, setIsLoading] = useState(true);
  const [suggestions, setSuggestions] = useState<SuggestionScore[]>([]);

  // Get suggested products
  const getSuggestedProducts = useMemo(() => {
    if (!currentProducts || currentProducts.length === 0) return [];

    // Get IDs of current products to exclude them
    const currentProductIds = new Set(currentProducts.map((p) => p.id));

    // Filter out already compared products
    const availableProducts = INSURANCE_PRODUCTS.filter(
      (p) => !currentProductIds.has(p.id),
    );

    // Calculate suggestion scores
    const scoredProducts = availableProducts
      .map((product) => calculateSuggestionScore(product, currentProducts))
      .filter(({ score }) => score > 0) // Only include products with some relevance
      .sort((a, b) => b.score - a.score); // Sort by relevance

    return scoredProducts.slice(0, maxSuggestions);
  }, [currentProducts, maxSuggestions]);

  // Simulate loading state
  useEffect(() => {
    const timer = setTimeout(() => {
      setSuggestions(getSuggestedProducts);
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [getSuggestedProducts]);

  // Format currency to VND
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Handle add to comparison
  const handleAddToComparison = (productId: string) => {
    onAddToComparison(productId);
  };

  // Render skeleton for loading state
  const renderSkeleton = () => {
    const skeletonItems = Array.from({ length: maxSuggestions }, (_, i) => i);

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {skeletonItems.map((i) => (
          <Card key={`skeleton-${i}`} className="h-96">
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </CardHeader>
            <CardContent className="space-y-3">
              <Skeleton className="h-32 w-full" />
              <div className="space-y-2">
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-2/3" />
              </div>
              <Skeleton className="h-8 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  // Render empty state
  const renderEmptyState = () => (
    <Card className="text-center py-12">
      <CardContent>
        <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">
          {t("noMoreSuggestions", "Không có gợi ý nào khác")}
        </h3>
        <p className="text-muted-foreground mb-4">
          {t(
            "noMoreSuggestionsDesc",
            "Tất cả sản phẩm phù hợp đã được thêm vào so sánh.",
          )}
        </p>
        <Button asChild variant="outline">
          <Link href="/insurance">
            {t("viewAllProducts", "Xem tất cả sản phẩm")}
            <ArrowRight className="h-4 w-4 ml-2" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );

  // Render suggestion card
  const renderSuggestionCard = (item: SuggestionScore) => {
    const { product, reasons } = item;

    return (
      <Card key={product.id} className="group relative">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {INSURANCE_CATEGORIES[product.category]?.name || product.category}
              </Badge>
              {product.isRecommended && (
                <Badge variant="secondary" className="text-xs">
                  {t("recommended")}
                </Badge>
              )}
            </div>
            {reasons.length > 0 && (
              <Badge variant="outline" className="text-xs whitespace-nowrap">
                {reasons[0]}
              </Badge>
            )}
          </div>
          <CardTitle className="text-sm leading-tight line-clamp-2">
            {product.name}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="text-center">
            <img
              src={product.image || "/images/insurance-placeholder.png"}
              alt={product.imageAlt || product.name}
              className="h-20 w-auto mx-auto object-contain"
            />
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">{t("issuer")}</span>
              <span className="font-medium">{product.issuer}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">{t("premium")}</span>
              <span className="font-medium text-primary">
                {formatCurrency(product.pricing.totalPremium)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">{t("coverage")}</span>
              <span className="font-medium">
                {formatCurrency(
                  Math.max(
                    product.coverage.personalAccident.limit,
                    product.coverage.propertyDamage.limit,
                    product.coverage.medicalExpenses.limit,
                    product.coverage.thirdPartyLiability.limit,
                  ),
                )}
              </span>
            </div>
          </div>

          <div className="flex gap-1">
            {reasons.slice(0, 2).map((reason, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {reason}
              </Badge>
            ))}
          </div>

          <Button
            className="w-full"
            size="sm"
            onClick={() => handleAddToComparison(product.id)}
          >
            <Plus className="h-4 w-4 mr-2" />
            {t("addToComparison", "Thêm vào so sánh")}
          </Button>
        </CardContent>
      </Card>
    );
  };

  if (isLoading) {
    return (
      <section className={cn("space-y-6", className)}>
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">
            {title || t("suggestedProducts", "Gợi ý sản phẩm")}
          </h2>
        </div>
        {renderSkeleton()}
      </section>
    );
  }

  if (suggestions.length === 0) {
    return (
      <section className={cn("space-y-6", className)}>
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">
            {title || t("suggestedProducts", "Gợi ý sản phẩm")}
          </h2>
        </div>
        {renderEmptyState()}
      </section>
    );
  }

  return (
    <section className={cn("space-y-6", className)}>
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">
          {title || t("suggestedProducts", "Gợi ý sản phẩm")}
        </h2>
        <Button asChild variant="ghost" size="sm" className="hidden md:flex">
          <Link href="/insurance">
            {t("viewAllProducts", "Xem tất cả")}
            <ArrowRight className="h-4 w-4 ml-2" />
          </Link>
        </Button>
      </div>

      {/* Desktop Grid View */}
      <div className="hidden md:grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {suggestions.map((item) => renderSuggestionCard(item))}
      </div>

      {/* Mobile Carousel View */}
      <div className="md:hidden">
        <Carousel
          opts={{
            align: "start",
            skipSnaps: false,
          }}
          className="w-full"
        >
          <CarouselContent>
            {suggestions.map((item) => (
              <CarouselItem key={item.product.id} className="basis-full">
                {renderSuggestionCard(item)}
              </CarouselItem>
            ))}
          </CarouselContent>
          {suggestions.length > 1 && (
            <>
              <CarouselPrevious className="static -mt-10" />
              <CarouselNext className="static -mt-10" />
            </>
          )}
        </Carousel>
      </div>

      {/* Mobile View All Button */}
      <div className="md:hidden">
        <Button asChild variant="ghost" className="w-full">
          <Link href="/insurance">
            {t("viewAllProducts", "Xem tất cả")}
            <ArrowRight className="h-4 w-4 ml-2" />
          </Link>
        </Button>
      </div>
    </section>
  );
};

export default ComparisonSuggestions;