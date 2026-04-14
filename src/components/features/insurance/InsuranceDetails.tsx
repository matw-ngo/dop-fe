"use client";

import {
  Ban,
  BarChart3,
  Car,
  CreditCard,
  FileCheck,
  Heart,
  Home,
  Minus,
  Plane,
  Plus,
  Shield,
  ShieldCheck,
  Star,
} from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import React, { useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { InsuranceProduct } from "@/types/insurance";

import {
  BenefitsTab,
  ClaimsTab,
  CoverageTab,
  ExclusionsTab,
  PaymentTab,
  ProductOverviewCard,
} from "./detail/components";
import { useInsuranceComparison } from "./detail/hooks/useInsuranceComparison";

interface InsuranceDetailsProps {
  product: InsuranceProduct;
}

export const InsuranceDetails = React.memo(function InsuranceDetails({
  product,
}: InsuranceDetailsProps) {
  const t = useTranslations("features.insurance.detail");

  const comparisonState = useInsuranceComparison(product.id, t);
  const {
    isInComparisonList,
    comparisonCount,
    canAddMore,
    handleCompareAction,
  } = comparisonState;

  // Memoize expensive calculations
  const _categoryIcon = useMemo(() => {
    const icons = {
      health: <Heart className="w-5 h-5" />,
      vehicle: <Car className="w-5 h-5" />,
      travel: <Plane className="w-5 h-5" />,
      property: <Home className="w-5 h-5" />,
      life: <Shield className="w-5 h-5" />,
    };
    return (
      icons[product.category as keyof typeof icons] || (
        <Shield className="w-5 h-5" />
      )
    );
  }, [product.category]);

  return (
    <div className="space-y-6">
      {/* Product Overview */}
      <ProductOverviewCard product={product} t={t} />

      {/* Comprehensive Product Info with 5 Tabs */}
      <Card>
        <CardHeader>
          <CardTitle>{t("productDetails.title")}</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="coverage" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="coverage" className="text-xs sm:text-sm">
                <Shield className="w-4 h-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">
                  {t("tabs.coverage.title")}
                </span>
                <span className="sm:hidden">
                  {t("tabs.coverage.shortTitle")}
                </span>
              </TabsTrigger>
              <TabsTrigger value="benefits" className="text-xs sm:text-sm">
                <Star className="w-4 h-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">
                  {t("tabs.benefits.title")}
                </span>
                <span className="sm:hidden">
                  {t("tabs.benefits.shortTitle")}
                </span>
              </TabsTrigger>
              <TabsTrigger value="exclusions" className="text-xs sm:text-sm">
                <Ban className="w-4 h-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">
                  {t("tabs.exclusions.title")}
                </span>
                <span className="sm:hidden">
                  {t("tabs.exclusions.shortTitle")}
                </span>
              </TabsTrigger>
              <TabsTrigger value="claims" className="text-xs sm:text-sm">
                <FileCheck className="w-4 h-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">
                  {t("tabs.claims.title")}
                </span>
                <span className="sm:hidden">{t("tabs.claims.shortTitle")}</span>
              </TabsTrigger>
              <TabsTrigger value="payment" className="text-xs sm:text-sm">
                <CreditCard className="w-4 h-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">
                  {t("tabs.payment.title")}
                </span>
                <span className="sm:hidden">
                  {t("tabs.payment.shortTitle")}
                </span>
              </TabsTrigger>
            </TabsList>

            {/* Tab Contents */}
            <TabsContent value="coverage">
              <CoverageTab product={product} t={t} />
            </TabsContent>

            <TabsContent value="benefits">
              <BenefitsTab product={product} t={t} />
            </TabsContent>

            <TabsContent value="exclusions">
              <ExclusionsTab product={product} t={t} />
            </TabsContent>

            <TabsContent value="claims">
              <ClaimsTab product={product} t={t} />
            </TabsContent>

            <TabsContent value="payment">
              <PaymentTab product={product} t={t} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* CTA Section */}
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            {/* Comparison Status */}
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-primary" />
                  <span className="font-medium text-foreground">
                    {t("comparisonStatus")}
                  </span>
                </div>
                <Badge
                  variant="secondary"
                  className="bg-primary/10 text-primary"
                >
                  {comparisonCount}/{4} {t("products")}
                </Badge>
              </div>
            </div>

            {/* Action Buttons */}
            <div
              className={`${
                comparisonCount > 0
                  ? "grid grid-cols-1 md:grid-cols-3 gap-3"
                  : "grid grid-cols-1 md:grid-cols-2 gap-3"
              }`}
            >
              {/* Add/Remove from Comparison Button */}
              <Button
                variant={isInComparisonList ? "secondary" : "outline"}
                onClick={handleCompareAction}
                disabled={!canAddMore && !isInComparisonList}
                className={`
                  ${
                    isInComparisonList
                      ? "bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive/20"
                      : "text-primary border-primary/20 hover:bg-primary/5"
                  }
                  ${!canAddMore && !isInComparisonList ? "opacity-50 cursor-not-allowed" : ""}
                `}
              >
                {isInComparisonList ? (
                  <>
                    <Minus className="w-4 h-4 mr-2" />
                    {t("removeFromComparison")}
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    {t("addToComparison")}
                  </>
                )}
              </Button>

              {/* View Comparison Button */}
              {comparisonCount > 0 && (
                <Link href="/insurance/compare" className="w-full">
                  <Button
                    variant="default"
                    className="w-full bg-primary hover:bg-primary/90"
                  >
                    <BarChart3 className="w-4 h-4 mr-2" />
                    {t("compareProducts")}
                    <Badge
                      variant="secondary"
                      className="ml-2 bg-primary-foreground text-primary"
                    >
                      {comparisonCount}
                    </Badge>
                  </Button>
                </Link>
              )}

              {/* Apply Button */}
              <Button className="w-full bg-primary hover:bg-primary/90">
                <ShieldCheck className="w-4 h-4 mr-2" />
                {t("applyNow")}
              </Button>
            </div>

            {/* Additional Information */}
            <div className="text-center text-sm text-muted-foreground pt-2">
              <p>{t("ctaNote")}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
});

InsuranceDetails.displayName = "InsuranceDetails";
