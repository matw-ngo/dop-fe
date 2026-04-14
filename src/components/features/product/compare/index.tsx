"use client";

import React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useFormTheme } from "@/components/form-generation/themes";
import { useProducts } from "@/hooks/features/product";
import { useTenant } from "@/hooks/tenant";
import { ProductCompareTable } from "./product-compare-table";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import type { components } from "@/lib/api/v1/dop";

type ProductDetail = components["schemas"]["ProductDetail"];

const MAX_COMPARED_PRODUCTS = 3;

export function ProductCompare() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations("features.products.compare");
  const { theme } = useFormTheme();
  const tenant = useTenant();

  const idsParam = searchParams.get("ids");
  const productIds = idsParam ? idsParam.split(",").filter(Boolean) : [];

  const canAddMore = productIds.length < MAX_COMPARED_PRODUCTS;

  // Fetch suggested products (all products for now)
  const { data: suggestedData } = useProducts({
    tenantId: tenant.uuid, // Use actual tenant UUID from context
    pageIndex: 0,
    pageSize: 10,
  });

  // Filter out already compared products
  const suggestedProducts =
    suggestedData?.products?.filter(
      (p) => !productIds.includes(p.product_id),
    ) || [];

  const handleAddProduct = (product: ProductDetail) => {
    if (productIds.length >= MAX_COMPARED_PRODUCTS) {
      alert(
        `Số lượng sản phẩm so sánh không được lớn hơn ${MAX_COMPARED_PRODUCTS}. Vui lòng chọn lại.`,
      );
      return;
    }
    if (productIds.includes(product.product_id)) {
      alert("Sản phẩm đã nằm trong danh sách so sánh!");
      return;
    }

    const newIds = [...productIds, product.product_id];
    router.push(`/products/compare?ids=${newIds.join(",")}`);
  };

  if (productIds.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <div style={{ color: theme.colors.textSecondary }}>
          {t("noProducts")}
        </div>
        <button
          onClick={() => router.push("/products")}
          className="px-4 py-2 rounded-lg text-white"
          style={{ backgroundColor: theme.colors.primary }}
        >
          {t("backToList")}
        </button>
      </div>
    );
  }

  return (
    <>
      <main className="min-h-screen">
        {/* Header */}
        <Header />

        {/* Desktop Layout */}
        <div
          className="hidden md:block mb-20"
          style={{
            borderTop: `2px solid ${theme.colors.primary}`,
            paddingTop: "60px", // Account for fixed header
          }}
        >
          <div className="container mx-auto">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 mb-6 text-sm pt-6">
              <button
                onClick={() => router.push("/")}
                className="hover:underline"
                style={{ color: theme.colors.textSecondary }}
              >
                {t("breadcrumb.home")}
              </button>
              <span style={{ color: theme.colors.textSecondary }}>&gt;</span>
              <button
                onClick={() => router.push("/products")}
                className="hover:underline"
                style={{ color: theme.colors.textSecondary }}
              >
                {t("breadcrumb.products")}
              </button>
              <span style={{ color: theme.colors.textSecondary }}>&gt;</span>
              <span style={{ color: theme.colors.textPrimary }}>
                {t("title")}
              </span>
            </nav>

            {/* Title */}
            <h1
              className="font-bold mb-6"
              style={{
                color: theme.colors.textPrimary,
                fontSize: theme.typography.fontSizes["3xl"],
                lineHeight: "40px",
              }}
            >
              {t("title")}
            </h1>

            {/* Compare Table - Now includes add column */}
            <ProductCompareTable
              productIds={productIds}
              suggestedProducts={suggestedProducts}
              onAddProduct={handleAddProduct}
              canAddMore={canAddMore}
            />
          </div>
        </div>

        {/* Mobile Layout */}
        <div
          className="md:hidden mb-12"
          style={{
            borderTop: `2px solid ${theme.colors.primary}`,
            paddingTop: "60px", // Account for fixed header
          }}
        >
          <div className="container">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 mb-6 text-sm pt-6">
              <button
                onClick={() => router.push("/")}
                className="hover:underline"
                style={{ color: theme.colors.textSecondary }}
              >
                {t("breadcrumb.home")}
              </button>
              <span style={{ color: theme.colors.textSecondary }}>&gt;</span>
              <button
                onClick={() => router.push("/products")}
                className="hover:underline"
                style={{ color: theme.colors.textSecondary }}
              >
                {t("breadcrumb.products")}
              </button>
              <span style={{ color: theme.colors.textSecondary }}>&gt;</span>
              <span style={{ color: theme.colors.textPrimary }}>
                {t("title")}
              </span>
            </nav>

            {/* Title */}
            <h1
              className="font-bold mb-6"
              style={{
                color: theme.colors.textPrimary,
                fontSize: theme.typography.fontSizes["2xl"],
                lineHeight: "32px",
              }}
            >
              {t("title")}
            </h1>

            {/* Suggested Products - Horizontal Scroll */}
            {canAddMore && (
              <div className="py-6">
                <h3
                  className="font-semibold mb-4"
                  style={{
                    fontSize: theme.typography.fontSizes.base,
                    lineHeight: "28px",
                    color: theme.colors.textSecondary,
                  }}
                >
                  {t("suggestedProducts")}
                </h3>

                <div className="flex overflow-x-auto gap-6 pb-4">
                  {suggestedProducts.map((product) => (
                    <div
                      key={product.product_id}
                      className="flex items-center border-b min-w-[310px]"
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

                      {/* Add Button - Using inline SVG instead of PlusCircle */}
                      <button
                        onClick={() => handleAddProduct(product)}
                        className="hover:opacity-80 transition-opacity"
                        style={{ color: theme.colors.primary }}
                        title={t("addTooltip")}
                      >
                        <svg
                          className="w-6 h-6"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <circle cx="12" cy="12" r="10" strokeWidth="2" />
                          <path
                            d="M12 8v8M8 12h8"
                            strokeWidth="2"
                            strokeLinecap="round"
                          />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Compare Table */}
            <div className="overflow-x-auto">
              <ProductCompareTable
                productIds={productIds}
                suggestedProducts={suggestedProducts}
                onAddProduct={handleAddProduct}
                canAddMore={canAddMore}
              />
            </div>
          </div>
        </div>
      </main>

      <Footer company="finzone" />
    </>
  );
}
