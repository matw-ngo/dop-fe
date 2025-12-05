"use client";

import React from "react";
import { useLocale } from "next-intl";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { getInsuranceNavbarConfig } from "@/configs/insurance-navbar-config";
import { useComparisonData } from "../../../../components/features/insurance/compare/hooks/useComparisonData";
import { ComparisonHeader } from "../../../../components/features/insurance/compare/components/ComparisonHeader";
import { ComparisonEmptyState } from "../../../../components/features/insurance/compare/components/ComparisonEmptyState";
import { ComparisonContent } from "../../../../components/features/insurance/compare/components/ComparisonContent";
import { ComparisonLoading } from "../../../../components/features/insurance/compare/components/ComparisonLoading";

export default function InsuranceComparePage() {
  const locale = useLocale();

  const {
    productIds,
    products,
    isLoading,
    handleClearComparison,
    handleRemoveProduct,
  } = useComparisonData();

  // Loading state
  if (isLoading) {
    return <ComparisonLoading />;
  }

  const handleClearAll = () => {
    handleClearComparison(locale);
  };

  return (
    <>
      <Header configOverride={getInsuranceNavbarConfig()} />
      <div className="min-h-screen bg-background">
        <ComparisonHeader
          locale={locale}
          productCount={productIds.length}
          onClearAll={handleClearAll}
        />

        {/* Main Content */}
        <div className="container mx-auto px-4 py-8">
          {productIds.length > 0 ? (
            <ComparisonContent
              products={products}
              onRemoveProduct={(productId) => handleRemoveProduct(productId, locale)}
              onClearAll={handleClearAll}
            />
          ) : (
            <ComparisonEmptyState />
          )}
        </div>
      </div>
      <Footer company="finzone" />
    </>
  );
}