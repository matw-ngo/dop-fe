"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Star, X, ChevronUp, ChevronDown, PlusCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import { useFormTheme } from "@/components/form-generation/themes";
import { useProductDetail } from "@/hooks/features/product";
import { useTenant } from "@/hooks/tenant";
import { getMockRating } from "@/mocks/data/products";
import type { components } from "@/lib/api/v1/dop";

type ProductDetail = components["schemas"]["ProductDetail"];

interface ProductCompareTableProps {
  productIds: string[];
  suggestedProducts?: ProductDetail[];
  onAddProduct?: (product: ProductDetail) => void;
  canAddMore?: boolean;
}

interface CompareRow {
  title: string;
  getValue: (product: ProductDetail) => string | string[];
  type: "string" | "array";
}

export function ProductCompareTable({
  productIds,
  suggestedProducts = [],
  onAddProduct,
  canAddMore = false,
}: ProductCompareTableProps) {
  const router = useRouter();
  const t = useTranslations("features.products.compare");
  const { theme } = useFormTheme();
  const tenant = useTenant();

  // Fetch all products using actual tenant UUID
  const products = productIds.map((id) =>
    useProductDetail({ productId: id, tenantId: tenant.uuid }),
  );

  const isLoading = products.some((p) => p.isLoading);
  const hasError = products.some((p) => p.error);

  const validProducts = products
    .map((p) => p.data)
    .filter((p): p is ProductDetail => p !== undefined);

  // Define compare rows
  const compareRows: CompareRow[] = [
    {
      title: t("rows.summary"),
      getValue: (p) => p.summary || "-",
      type: "string",
    },
    {
      title: t("rows.productType"),
      getValue: (p) => {
        if (p.product_type === "credit_card") return t("types.creditCard");
        if (p.product_type === "insurance") return t("types.insurance");
        if (p.product_type === "loan") return t("types.loan");
        return "-";
      },
      type: "string",
    },
    {
      title: t("rows.partner"),
      getValue: (p) => p.partner_name || "-",
      type: "string",
    },
    {
      title: t("rows.status"),
      getValue: (p) =>
        p.status === "active" ? t("status.active") : t("status.inactive"),
      type: "string",
    },
  ];

  // Track expanded/collapsed rows
  const [expandedRows, setExpandedRows] = useState<Record<number, boolean>>(
    Object.fromEntries(compareRows.map((_, i) => [i, true])),
  );

  const toggleRow = (index: number) => {
    setExpandedRows((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const handleRemoveProduct = (productId: string) => {
    const newIds = productIds.filter((id) => id !== productId);
    if (newIds.length === 0) {
      router.push("/products");
    } else {
      router.push(`/products/compare?ids=${newIds.join(",")}`);
    }
  };

  const handleApplyNow = (product: ProductDetail) => {
    // TODO: Implement apply logic
    console.log("Apply for product:", product.product_id);
  };

  if (isLoading) {
    return (
      <div
        className="text-center py-12"
        style={{ color: theme.colors.textSecondary }}
      >
        {t("loading")}
      </div>
    );
  }

  if (hasError) {
    return (
      <div
        className="text-center py-12"
        style={{ color: theme.colors.textSecondary }}
      >
        {t("error")}
      </div>
    );
  }

  if (validProducts.length === 0) {
    return (
      <div
        className="text-center py-12"
        style={{ color: theme.colors.textSecondary }}
      >
        {t("noProducts")}
      </div>
    );
  }

  return (
    <div className="flex w-full">
      {/* Products Table */}
      <div
        className="overflow-x-auto border flex-1"
        style={{ borderColor: theme.colors.border }}
      >
        <table
          className="border-collapse w-full"
          style={{ tableLayout: "fixed" }}
        >
          <tbody>
            {/* Card Summary Row */}
            <tr>
              {validProducts.map((product) => (
                <td
                  key={product.product_id}
                  className="p-0 border-r last:border-r-0"
                  style={{
                    width: canAddMore
                      ? `${100 / (validProducts.length + 1)}%`
                      : `${100 / validProducts.length}%`,
                    minWidth: "280px",
                    borderColor: theme.colors.border,
                  }}
                >
                  <div className="px-6 pt-8 pb-8 md:px-6 md:pt-8 md:pb-8">
                    {/* Close Button */}
                    <div className="flex justify-end mb-[-12px]">
                      <button
                        onClick={() => handleRemoveProduct(product.product_id)}
                        className="text-2xl hover:opacity-80 transition-colors"
                        style={{ color: "#99B5AD" }}
                        aria-label={t("remove")}
                        title={t("removeTooltip")}
                      >
                        <X className="w-6 h-6" />
                      </button>
                    </div>

                    <div className="flex flex-col items-center">
                      {/* Image - 220x139px desktop, 200x127px mobile */}
                      <div className="w-[200px] h-[127px] md:w-[220px] md:h-[139px] mb-4 md:mb-5">
                        {product.thumbnail && (
                          <img
                            src={product.thumbnail}
                            alt={product.name}
                            className="w-full h-full object-contain mx-auto"
                            style={{ borderRadius: theme.borderRadius.md }}
                          />
                        )}
                      </div>

                      {/* Name */}
                      <h2
                        className="text-base md:text-lg font-semibold text-center mb-3"
                        style={{
                          color: theme.colors.textPrimary,
                          lineHeight: "24px",
                          fontSize: theme.typography.fontSizes.base,
                        }}
                      >
                        {product.name}
                      </h2>

                      {/* Rating */}
                      <div className="flex items-center mb-4">
                        <Star
                          className="w-4 h-4 fill-[#EEBE40] text-[#EEBE40]"
                          style={{ marginRight: theme.spacing.xs }}
                        />
                        <span
                          className="font-semibold"
                          style={{
                            color: theme.colors.textPrimary,
                            fontSize: theme.typography.fontSizes.lg,
                            lineHeight: "28px",
                          }}
                        >
                          {getMockRating(product.product_id)}
                        </span>
                        <span
                          style={{
                            color: theme.colors.textSecondary,
                            fontSize: theme.typography.fontSizes.xs,
                            lineHeight: "20px",
                          }}
                        >
                          /5
                        </span>
                      </div>

                      {/* Apply Button */}
                      <button
                        onClick={() => handleApplyNow(product)}
                        className="w-full text-white rounded-lg hover:opacity-90 transition-colors"
                        style={{
                          backgroundColor: theme.colors.primary,
                          padding: `${theme.spacing.sm} ${theme.spacing.base}`,
                          fontSize: theme.typography.fontSizes.sm,
                          lineHeight: "20px",
                        }}
                      >
                        {t("applyNow")}
                      </button>
                    </div>
                  </div>
                </td>
              ))}
            </tr>

            {/* Compare Rows */}
            {compareRows.map((row, rowIndex) => (
              <React.Fragment key={`row_${rowIndex}`}>
                {/* Row Title */}
                <tr
                  className="border-t"
                  style={{ borderColor: theme.colors.border }}
                >
                  <td
                    colSpan={validProducts.length}
                    className="px-6 py-4 md:px-6 md:py-4"
                    style={{
                      backgroundColor: "#f2f8f6",
                      color: theme.colors.textPrimary,
                      fontSize: theme.typography.fontSizes.base,
                      fontWeight: theme.typography.fontWeights.bold,
                      lineHeight: "24px",
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <span>{row.title}</span>
                      <button
                        onClick={() => toggleRow(rowIndex)}
                        className="hover:opacity-80 transition-opacity"
                        title={
                          expandedRows[rowIndex]
                            ? t("collapseTooltip")
                            : t("expandTooltip")
                        }
                      >
                        {expandedRows[rowIndex] ? (
                          <ChevronUp className="w-5 h-5" />
                        ) : (
                          <ChevronDown className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>

                {/* Row Content */}
                {expandedRows[rowIndex] && (
                  <tr
                    className="border-t"
                    style={{ borderColor: theme.colors.border }}
                  >
                    {validProducts.map((product) => {
                      const value = row.getValue(product);
                      const isArray = Array.isArray(value);

                      return (
                        <td
                          key={product.product_id}
                          className="px-6 py-4 md:px-6 md:py-4 border-r last:border-r-0"
                          style={{
                            borderColor: theme.colors.border,
                            color: theme.colors.textSecondary,
                            fontSize: theme.typography.fontSizes.base,
                            lineHeight: "24px",
                            textAlign: "justify",
                          }}
                        >
                          {isArray ? (
                            <div>
                              {value.map((item, i) => (
                                <p
                                  key={i}
                                  className={i < value.length - 1 ? "mb-3" : ""}
                                >
                                  {item.startsWith("-") ? (
                                    <span>&nbsp; {item}</span>
                                  ) : (
                                    item
                                  )}
                                </p>
                              ))}
                            </div>
                          ) : (
                            value
                          )}
                        </td>
                      );
                    })}
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Product Column - Full Height */}
      {canAddMore && (
        <div
          className="border-b border-l flex-shrink-0"
          style={{
            borderColor: theme.colors.border,
            width: `${100 / (validProducts.length + 1)}%`,
            minWidth: "280px",
          }}
        >
          <div className="px-6 pt-8 pb-8 md:px-6 md:pt-8 md:pb-8 h-full sticky top-0">
            <h2
              className="text-center font-bold mb-4"
              style={{
                fontSize: theme.typography.fontSizes["2xl"],
                lineHeight: "32px",
                color: theme.colors.textPrimary,
              }}
            >
              {t("addProducts")}
            </h2>

            <h3
              className="font-semibold mb-4"
              style={{
                fontSize: theme.typography.fontSizes.lg,
                lineHeight: "30px",
                color: theme.colors.textSecondary,
              }}
            >
              {t("suggestedProducts")}
            </h3>

            {/* Suggested Products List */}
            <div>
              {suggestedProducts.map((product) => (
                <div
                  key={product.product_id}
                  className="flex items-center border-b last:border-b-0"
                  style={{
                    borderColor: theme.colors.border,
                    paddingTop: theme.spacing.base,
                    paddingBottom: "24px",
                  }}
                >
                  {/* Thumbnail */}
                  <div className="min-w-[88px] h-14">
                    {product.thumbnail && (
                      <img
                        src={product.thumbnail}
                        alt={product.name}
                        className="w-full h-full object-contain mx-auto"
                        style={{ borderRadius: theme.borderRadius.md }}
                      />
                    )}
                  </div>

                  {/* Name */}
                  <div
                    className="flex-1 px-3"
                    style={{ color: theme.colors.textPrimary }}
                  >
                    {product.name}
                  </div>

                  {/* Add Button */}
                  <button
                    onClick={() => onAddProduct?.(product)}
                    className="hover:opacity-80 transition-opacity"
                    style={{ color: theme.colors.primary }}
                    title={t("addTooltip")}
                  >
                    <PlusCircle className="w-6 h-6" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
