"use client";

import { useTranslations } from "next-intl";
import { useFormTheme } from "@/components/form-generation/themes";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { components } from "@/lib/api/v1/dop";
import { ProductCard } from "../components/ProductCard";
import { sortProductsByPriority } from "../config/special-partners";
import { ChevronDown } from "lucide-react";

type MatchedProduct = components["schemas"]["matched_product"];

interface ProductListViewProps {
  products: MatchedProduct[];
  onSelectProduct?: (product: MatchedProduct) => void;
  onViewMore?: () => void;
  title?: string;
  subtitle?: string;
  showCount?: boolean;
  className?: string;
}

/**
 * Product List View
 *
 * Displays a list of matched loan products.
 * Handles sorting by priority and special partner ordering.
 */
export function ProductListView({
  products,
  onSelectProduct,
  onViewMore,
  title,
  subtitle,
  showCount = true,
  className,
}: ProductListViewProps) {
  const t = useTranslations("pages.loan_result");
  const { theme } = useFormTheme();

  // Sort products with special partners first
  const sortedProducts = sortProductsByPriority(products);

  const displayTitle = title || t("title");
  const displaySubtitle = subtitle || t("subtitle", { count: products.length });

  return (
    <div className={cn("w-full max-w-2xl mx-auto", className)}>
      {/* Header */}
      <div className="text-center mb-8">
        <h1
          className="text-2xl font-bold mb-2"
          style={{ color: theme.colors.textPrimary }}
        >
          {displayTitle}
        </h1>
        {showCount && (
          <p style={{ color: theme.colors.textSecondary }}>{displaySubtitle}</p>
        )}
      </div>

      {/* Product Cards */}
      <div className="space-y-4">
        {sortedProducts.map((product, index) => (
          <ProductCard
            key={product.product_id}
            product={product}
            onSelect={onSelectProduct}
            index={index}
          />
        ))}
      </div>

      {/* View More Button */}
      {onViewMore && (
        <div className="mt-8 text-center">
          <Button
            variant="outline"
            onClick={onViewMore}
            className="w-full sm:w-auto"
            style={{
              borderColor: theme.colors.border,
              color: theme.colors.textPrimary,
            }}
          >
            <span>{t("actions.viewMore")}</span>
            <ChevronDown className="w-4 h-4 ml-2" />
          </Button>
        </div>
      )}
    </div>
  );
}
