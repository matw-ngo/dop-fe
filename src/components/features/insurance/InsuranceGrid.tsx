"use client";

import { useTranslations } from "next-intl";
import type React from "react";
import { useMemo } from "react";
import { cn, getGapClass } from "@/lib/utils";
import type { InsuranceProduct } from "@/types/insurance";
import InsuranceProductCard from "./InsuranceProduct";

interface InsuranceGridProps {
  products: InsuranceProduct[];
  loading?: boolean;
  viewMode?: "grid" | "list";
  columns?: number;
  gap?: string;
  onProductClick?: (product: InsuranceProduct) => void;
  onCompareToggle?: (productId: string) => void;
  comparingProducts?: string[];
  className?: string;
  emptyStateMessage?: string;
}

const InsuranceGrid: React.FC<InsuranceGridProps> = ({
  products,
  loading = false,
  viewMode = "grid",
  columns,
  gap = "6",
  onProductClick,
  onCompareToggle,
  comparingProducts = [],
  className,
  emptyStateMessage,
}) => {
  const t = useTranslations("features.insurance.listing");

  // Get grid columns based on view mode and custom columns prop
  const gridColsClass = useMemo(() => {
    if (viewMode === "list") {
      return "grid-cols-1";
    }

    if (columns) {
      // Custom columns configuration
      const colsMap: Record<number, string> = {
        1: "grid-cols-1",
        2: "grid-cols-1 md:grid-cols-2",
        3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
        4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
        5: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5",
        6: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6",
      };
      return colsMap[columns] || colsMap[3];
    }

    // Default responsive columns
    return "grid-cols-1 md:grid-cols-2 lg:grid-cols-3";
  }, [viewMode, columns]);

  // Loading skeleton
  if (loading) {
    const skeletonCount = columns ? Math.min(columns * 2, 12) : 6;

    return (
      <div
        className={cn("space-y-4", className)}
        role="status"
        aria-label={t("loadingProducts")}
        aria-busy="true"
      >
        <div
          className={cn("grid", getGapClass(gap), gridColsClass)}
          role="list"
        >
          {Array.from({ length: skeletonCount }, (_, i) => (
            <div
              key={i}
              className="animate-pulse"
              role="listitem"
              aria-label={t("loadingProductItem")}
            >
              {viewMode === "list" ? (
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="h-20 w-32 bg-gray-200 rounded-lg flex-shrink-0"></div>
                    <div className="flex-1 space-y-3">
                      <div className="flex justify-between">
                        <div className="space-y-2">
                          <div className="h-6 bg-gray-200 rounded w-2/3"></div>
                          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                        </div>
                        <div className="space-y-2">
                          <div className="h-6 bg-gray-200 rounded w-20"></div>
                          <div className="h-6 bg-gray-200 rounded w-20"></div>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="h-8 bg-gray-200 rounded"></div>
                        <div className="h-8 bg-gray-200 rounded"></div>
                        <div className="h-8 bg-gray-200 rounded"></div>
                        <div className="h-8 bg-gray-200 rounded"></div>
                      </div>
                      <div className="h-10 bg-gray-200 rounded w-1/4"></div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="border rounded-lg p-4 space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                    </div>
                    <div className="h-8 w-8 bg-gray-200 rounded"></div>
                  </div>
                  <div className="relative h-32 bg-gray-200 rounded"></div>
                  <div className="space-y-2">
                    <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    <div className="flex space-x-1">
                      <div className="h-4 w-4 bg-gray-200 rounded"></div>
                      <div className="h-4 w-4 bg-gray-200 rounded"></div>
                      <div className="h-4 w-4 bg-gray-200 rounded"></div>
                      <div className="h-4 w-4 bg-gray-200 rounded"></div>
                      <div className="h-4 w-4 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="h-10 bg-gray-200 rounded"></div>
                    <div className="h-10 bg-gray-200 rounded"></div>
                  </div>
                  <div className="h-10 bg-gray-200 rounded w-full"></div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Empty state
  if (products.length === 0) {
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center py-12",
          className,
        )}
        role="status"
        aria-live="polite"
        aria-label={t("noProductsFound")}
      >
        <div className="text-center space-y-4 max-w-md">
          <div
            className="w-24 h-24 mx-auto bg-gray-100 rounded-full flex items-center justify-center"
            aria-hidden="true"
          >
            <svg
              className="w-12 h-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h2
            className="text-lg font-semibold text-gray-900"
            id="empty-state-title"
          >
            {t("noProductsFound")}
          </h2>
          <p className="text-gray-600">
            {emptyStateMessage || t("tryAdjustingFilters")}
          </p>
        </div>
      </div>
    );
  }

  // Grid of products
  return (
    <div className={cn("space-y-4", className)}>
      <div
        className={cn("grid", getGapClass(gap), gridColsClass)}
        role="list"
        aria-label={t("insuranceProductsList", { count: products.length })}
      >
        {products.map((product) => (
          <InsuranceProductCard
            key={product.id}
            product={product}
            viewMode={viewMode}
            showCompareButton={!!onCompareToggle}
            onCompareToggle={onCompareToggle}
            isComparing={comparingProducts.includes(product.id)}
            className={cn(
              "transition-all duration-200",
              onProductClick && "cursor-pointer",
            )}
            onClick={() => onProductClick?.(product)}
          />
        ))}
      </div>

      {/* Show results count */}
      <div
        className="mt-6 text-sm text-muted-foreground text-center"
        role="status"
        aria-live="polite"
      >
        {t("showingResults", {
          count: products.length,
          total: products.length,
        })}
      </div>
    </div>
  );
};

export default InsuranceGrid;
