"use client";

import {
  ArrowRight,
  Car,
  Heart,
  Home,
  Plane,
  Shield,
  Star,
  User,
} from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import type React from "react";
import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Skeleton } from "@/components/ui/skeleton";
import { INSURANCE_CATEGORIES } from "@/constants/insurance";
import { INSURANCE_PRODUCTS } from "@/data/insurance-products";
import { cn } from "@/lib/utils";
import type { InsuranceProduct } from "@/types/insurance";

interface RelatedProductScore {
  product: InsuranceProduct;
  score: number;
  reasons: string[];
}

interface RelatedProductsProps {
  currentProduct: InsuranceProduct;
  maxProducts?: number;
  title?: string;
  showViewAll?: boolean;
  className?: string;
  viewAllLink?: string;
  onProductClick?: (product: InsuranceProduct) => void;
}

// Calculate similarity score between products (moved outside component)
const calculateSimilarity = (
  product: InsuranceProduct,
  currentProduct: InsuranceProduct,
): RelatedProductScore => {
  let score = 0;
  const reasons: string[] = [];

  // Same category (highest weight)
  if (product.category === currentProduct.category) {
    score += 40;
    reasons.push("Cùng danh mục");
  }

  // Same issuer
  if (product.issuer === currentProduct.issuer) {
    score += 25;
    reasons.push("Cùng nhà cung cấp");
  }

  // Similar coverage range
  const currentMaxCoverage = Math.max(
    currentProduct.coverage.personalAccident.limit,
    currentProduct.coverage.propertyDamage.limit,
    currentProduct.coverage.medicalExpenses.limit,
    currentProduct.coverage.thirdPartyLiability.limit,
  );

  const productMaxCoverage = Math.max(
    product.coverage.personalAccident.limit,
    product.coverage.propertyDamage.limit,
    product.coverage.medicalExpenses.limit,
    product.coverage.thirdPartyLiability.limit,
  );

  const coverageDiff = Math.abs(currentMaxCoverage - productMaxCoverage);
  const coverageSimilarity = Math.max(
    0,
    100 - (coverageDiff / currentMaxCoverage) * 100,
  );
  if (coverageSimilarity > 70) {
    score += 20;
    reasons.push("Quyền lợi bảo hiểm tương đương");
  } else if (coverageSimilarity > 50) {
    score += 10;
    reasons.push("Quyền lợi bảo hiểm gần tương đương");
  }

  // Similar premium range (within 30%)
  const premiumDiff = Math.abs(
    currentProduct.pricing.totalPremium - product.pricing.totalPremium,
  );
  const premiumSimilarity =
    (premiumDiff / currentProduct.pricing.totalPremium) * 100;
  if (premiumSimilarity <= 30) {
    score += 15;
    reasons.push("Phí bảo hiểm tương đương");
  }

  // Same type (compulsory/voluntary)
  if (product.type === currentProduct.type) {
    score += 10;
    reasons.push("Cùng loại hình bảo hiểm");
  }

  // Recommended products
  if (product.isRecommended && !currentProduct.isRecommended) {
    score += 15;
    reasons.push("Được đề xuất");
  }

  // High rating bonus
  if (product.rating >= 4 && product.rating > currentProduct.rating) {
    score += 10;
    reasons.push("Đánh giá cao");
  }

  // More reviews bonus
  if (product.reviewCount > currentProduct.reviewCount * 1.5) {
    score += 5;
    reasons.push("Phổ biến hơn");
  }

  return { product, score, reasons };
};

const RelatedProducts: React.FC<RelatedProductsProps> = ({
  currentProduct,
  maxProducts = 6,
  title,
  showViewAll = true,
  className,
  viewAllLink,
  onProductClick,
}) => {
  const t = useTranslations("pages.insurance");
  const [isLoading, setIsLoading] = useState(true);
  const [relatedProducts, setRelatedProducts] = useState<RelatedProductScore[]>(
    [],
  );

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

  // Get related products
  const getRelatedProducts = useMemo(() => {
    if (!currentProduct) return [];

    // Filter out current product
    const filteredProducts = INSURANCE_PRODUCTS.filter(
      (p) => p.id !== currentProduct.id,
    );

    // Calculate similarity scores
    const scoredProducts = filteredProducts
      .map((product) => calculateSimilarity(product, currentProduct))
      .filter(({ score }) => score > 0) // Only include products with some similarity
      .sort((a, b) => b.score - a.score); // Sort by relevance

    return scoredProducts.slice(0, maxProducts);
  }, [currentProduct, maxProducts]);

  // Simulate loading state
  useEffect(() => {
    const timer = setTimeout(() => {
      setRelatedProducts(getRelatedProducts);
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [getRelatedProducts]);

  // Handle product click
  const handleProductClick = (product: InsuranceProduct) => {
    if (onProductClick) {
      onProductClick(product);
    }
  };

  // Render skeleton for loading state
  const renderSkeleton = () => {
    const skeletonItems = Array.from({ length: maxProducts }, (_, i) => i);

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {skeletonItems.map((i) => (
          <Card key={`skeleton-item-${i}-${Date.now()}`} className="h-80">
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </CardHeader>
            <CardContent className="space-y-3">
              <Skeleton className="h-20 w-full" />
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
          {t("noRelatedProducts", "Không tìm thấy sản phẩm liên quan")}
        </h3>
        <p className="text-muted-foreground mb-4">
          {t(
            "noRelatedProductsDesc",
            "Hiện tại chưa có sản phẩm nào tương tự.",
          )}
        </p>
        {showViewAll && (
          <Button asChild variant="outline">
            <Link href="/insurance">
              {t("viewAllProducts", "Xem tất cả sản phẩm")}
              <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </Button>
        )}
      </CardContent>
    </Card>
  );

  // Render product card
  const renderProductCard = (item: RelatedProductScore) => {
    const { product, reasons } = item;

    return (
      <Card
        key={product.id}
        className="group cursor-pointer transition-all hover:shadow-md hover:-translate-y-1"
        onClick={() => handleProductClick(product)}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {getCategoryIcon(product.category)}
                <span className="ml-1">
                  {INSURANCE_CATEGORIES[product.category]?.name ||
                    product.category}
                </span>
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
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <span>{product.issuer}</span>
            <span>•</span>
            <div className="flex items-center gap-1">
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              <span>{product.rating}</span>
              <span>({product.reviewCount})</span>
            </div>
          </div>

          <div className="space-y-2 text-sm">
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
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">
                {t("claimsApproval")}
              </span>
              <span className="font-medium">
                {product.claims.approvalRate}%
              </span>
            </div>
          </div>

          <Button asChild className="w-full" size="sm" variant="outline">
            <Link
              href={`/insurance/${product.slug}`}
              onClick={(e) => e.stopPropagation()}
            >
              {t("viewDetails")}
              <ArrowRight className="h-3 w-3 ml-1" />
            </Link>
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
            {title || t("relatedProducts", "Sản phẩm liên quan")}
          </h2>
        </div>
        {renderSkeleton()}
      </section>
    );
  }

  if (relatedProducts.length === 0) {
    return (
      <section className={cn("space-y-6", className)}>
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">
            {title || t("relatedProducts", "Sản phẩm liên quan")}
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
          {title || t("relatedProducts", "Sản phẩm liên quan")}
        </h2>
        {showViewAll && (
          <Button asChild variant="ghost" className="hidden md:flex">
            <Link
              href={
                viewAllLink || `/insurance/category/${currentProduct.category}`
              }
            >
              {t("viewAllInCategory", "Xem tất cả")}
              <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </Button>
        )}
      </div>

      {/* Desktop Grid View */}
      <div className="hidden md:grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {relatedProducts.map((item) => renderProductCard(item))}
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
            {relatedProducts.map((item) => (
              <CarouselItem key={item.product.id} className="basis-full">
                {renderProductCard(item)}
              </CarouselItem>
            ))}
          </CarouselContent>
          {relatedProducts.length > 1 && (
            <>
              <CarouselPrevious className="static -mt-10" />
              <CarouselNext className="static -mt-10" />
            </>
          )}
        </Carousel>
      </div>

      {/* Mobile View All Button */}
      {showViewAll && (
        <div className="md:hidden">
          <Button asChild variant="ghost" className="w-full">
            <Link
              href={
                viewAllLink || `/insurance/category/${currentProduct.category}`
              }
            >
              {t("viewAllInCategory", "Xem tất cả")}
              <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </Button>
        </div>
      )}
    </section>
  );
};

export default RelatedProducts;
