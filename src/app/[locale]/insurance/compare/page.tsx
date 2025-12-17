"use client";

import { useLocale } from "next-intl";
import React from "react";
import Footer from "@/components/layout/footer";
import Header from "@/components/layout/header";
import { getInsuranceNavbarConfig } from "@/configs/insurance-navbar-config";
import { ComparisonContent } from "../../../../components/features/insurance/compare/components/ComparisonContent";
import { ComparisonEmptyState } from "../../../../components/features/insurance/compare/components/ComparisonEmptyState";
import { ComparisonHeader } from "../../../../components/features/insurance/compare/components/ComparisonHeader";
import { ComparisonLoading } from "../../../../components/features/insurance/compare/components/ComparisonLoading";
import { useComparisonData } from "../../../../components/features/insurance/compare/hooks/useComparisonData";

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
              onRemoveProduct={(productId) =>
                handleRemoveProduct(productId, locale)
              }
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
