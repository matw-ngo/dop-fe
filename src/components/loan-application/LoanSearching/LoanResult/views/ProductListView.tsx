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
  showCount = true,
  className,
}: ProductListViewProps) {
  const t = useTranslations("pages.loan_result");
  const { theme } = useFormTheme();

  // Sort products with special partners first
  const sortedProducts = sortProductsByPriority(products);

  return (
    <div className={cn("w-full", className)}>
      {/* Header - count text matching old design */}
      {showCount && (
        <p className="text-2xl" style={{ color: theme.colors.textSecondary }}>
          <strong style={{ color: theme.colors.textPrimary }}>
            {products.length} {t("countLabel")}
          </strong>{" "}
          {t("countSuffix")}
        </p>
      )}

      {/* Product Cards - responsive grid: 1 → 2 → 3 columns */}
      <div
        className="grid gap-[30px] mt-10"
        style={{
          gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
        }}
      >
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
            className="max-w-[370px] w-full"
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
