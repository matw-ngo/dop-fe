"use client";

import React, { useEffect, useState } from "react";
import { X, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { useFormTheme } from "@/components/form-generation/themes";
import {
  useProductCompareStore,
  MAX_COMPARED_PRODUCTS_COUNT,
} from "@/store/use-product-compare-store";
import { useProducts } from "@/hooks/features/product";
import { useTenant } from "@/hooks/tenant";

export const ProductComparingPanel = () => {
  const router = useRouter();
  const t = useTranslations("features.products.comparing");
  const { theme } = useFormTheme();
  const tenant = useTenant();

  const { selectedProductIds, removeProduct, clearProducts, getCount } =
    useProductCompareStore();
  const [isVisible, setIsVisible] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch products for thumbnails
  const { data: productsData } = useProducts({
    tenantId: tenant.uuid, // Use actual tenant UUID from context
    pageSize: 100,
    pageIndex: 0,
  });

  const allProducts = productsData?.products || [];
  const selectedProducts = allProducts.filter((p) =>
    selectedProductIds.includes(p.product_id),
  );

  // Filter products for search modal
  const searchResults = allProducts.filter((p) => {
    if (searchQuery.trim() === "") return false;
    return p.name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  // Suggested products (exclude already selected)
  const suggestedProducts = allProducts
    .filter((p) => !selectedProductIds.includes(p.product_id))
    .slice(0, 5);

  // Show panel when products selected
  useEffect(() => {
    if (selectedProductIds.length > 0) {
      setIsVisible(true);
    }
  }, [selectedProductIds]);

  const handleClose = () => {
    clearProducts();
    setIsVisible(false);
  };

  const handleReset = () => {
    clearProducts();
  };

  const handleCompare = () => {
    if (selectedProductIds.length > 0) {
      router.push(`/products/compare?ids=${selectedProductIds.join(",")}`);
      clearProducts(); // Clear after navigating
    }
  };

  const handleAddProduct = () => {
    setSearchQuery("");
    setIsSearchModalOpen(true);
  };

  const handleRemoveProduct = (productId: string) => {
    removeProduct(productId);
  };

  const handleAddFromSearch = (productId: string) => {
    const { addProduct, canAddMore } = useProductCompareStore.getState();
    if (!canAddMore()) {
      alert(t("max"));
      return;
    }
    addProduct(productId);
    setIsSearchModalOpen(false);
    setSearchQuery("");
  };

  if (!isVisible || selectedProductIds.length === 0) {
    return null;
  }

  return (
    <>
      {/* Comparing Panel - Match old-code UI exactly */}
      <div
        className="fixed bottom-0 left-0 right-0 border-t shadow-lg z-50"
        style={{
          backgroundColor: theme.colors.surface || "#ffffff",
          borderColor: theme.colors.containerBorder || theme.colors.border,
        }}
      >
        <div
          className="container mx-auto px-4"
          style={{
            paddingTop: theme.spacing.lg,
            paddingBottom: theme.spacing.lg,
          }}
        >
          <div
            className="flex items-center justify-between"
            style={{ gap: theme.spacing.base }}
          >
            {/* Left: Card list + Actions */}
            <div
              className="flex-1 flex items-center"
              style={{ gap: theme.spacing.xl }}
            >
              {/* Card thumbnails */}
              <div
                className="flex items-center"
                style={{ gap: theme.spacing.xl }}
              >
                {selectedProducts.map((product) => (
                  <button
                    key={product.product_id}
                    onClick={() => handleRemoveProduct(product.product_id)}
                    className="relative rounded overflow-hidden transition-transform hover:scale-110"
                    style={{
                      width: "88px",
                      height: "56px",
                      backgroundColor: theme.colors.muted,
                    }}
                    title={t("removeTooltip", { name: product.name })}
                  >
                    {product.thumbnail && (
                      <Image
                        src={product.thumbnail}
                        alt={product.name}
                        fill
                        sizes="88px"
                        className="object-contain"
                      />
                    )}
                  </button>
                ))}

                {/* Add button */}
                {selectedProductIds.length < MAX_COMPARED_PRODUCTS_COUNT && (
                  <button
                    onClick={handleAddProduct}
                    className="border-2 border-dashed rounded flex items-center justify-center transition-colors"
                    style={{
                      width: "88px",
                      height: "56px",
                      borderColor: theme.colors.border,
                      backgroundColor: theme.colors.neutralBackground,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor =
                        theme.colors.hover || "#f9fafb";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor =
                        theme.colors.neutralBackground || "#f2f8f6";
                    }}
                    title={t("addTooltip")}
                  >
                    <Plus
                      className="w-6 h-6"
                      style={{ color: theme.colors.primary }}
                    />
                  </button>
                )}
              </div>

              {/* Action buttons */}
              <div
                className="flex items-center"
                style={{ gap: theme.spacing.xl }}
              >
                <button
                  onClick={handleCompare}
                  disabled={selectedProductIds.length === 0}
                  className="rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium text-white"
                  style={{
                    padding: `${theme.spacing.md} ${theme.spacing.lg}`,
                    fontSize: theme.typography.fontSizes.base,
                    backgroundColor: theme.colors.primary,
                  }}
                >
                  {t("compare", { count: getCount() })}
                </button>
                <button
                  onClick={handleReset}
                  disabled={selectedProductIds.length === 0}
                  className="hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  style={{
                    padding: `${theme.spacing.sm} ${theme.spacing.base}`,
                    fontSize: theme.typography.fontSizes.base,
                    color: theme.colors.textSecondary,
                  }}
                >
                  {t("reset")}
                </button>
              </div>
            </div>

            {/* Right: Close button */}
            <button
              onClick={handleClose}
              className="p-2 rounded-lg transition-all"
              style={{
                backgroundColor: "transparent",
                color: theme.colors.primary,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor =
                  theme.colors.hover || "#f9fafb";
                e.currentTarget.style.transform = "scale(1.25)";
                e.currentTarget.style.color = "red";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
                e.currentTarget.style.transform = "scale(1)";
                e.currentTarget.style.color = theme.colors.primary;
              }}
              title={t("closeTooltip")}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Search Modal - Match old-code UI exactly */}
      {isSearchModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{
            backgroundColor: theme.colors.overlay || "rgba(0, 0, 0, 0.5)",
          }}
          onClick={() => setIsSearchModalOpen(false)}
        >
          <div
            className="rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
            style={{
              backgroundColor: theme.colors.surface || "#ffffff",
              borderColor: theme.colors.border,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div
              className="flex items-center justify-between"
              style={{ marginBottom: theme.spacing.base }}
            >
              <h2
                className="font-bold text-center"
                style={{
                  fontSize: theme.typography.fontSizes["2xl"],
                  lineHeight: theme.typography.lineHeights.loose,
                  color: theme.colors.headingText || theme.colors.textPrimary,
                }}
              >
                {t("searchModal.title")}
              </h2>
              <button
                onClick={() => setIsSearchModalOpen(false)}
                className="p-2 rounded-lg transition-colors"
                style={{ backgroundColor: "transparent" }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor =
                    theme.colors.hover || "#f9fafb";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                }}
                title={t("searchModal.closeTooltip")}
              >
                <X
                  className="w-5 h-5"
                  style={{
                    color:
                      theme.colors.iconSubtle || theme.colors.textSecondary,
                  }}
                />
              </button>
            </div>

            {/* Search Input */}
            <div style={{ marginBottom: theme.spacing.xl }}>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t("searchModal.placeholder")}
                className="w-full border rounded-lg focus:outline-none focus:ring-2"
                style={
                  {
                    padding: `${theme.spacing.md} ${theme.spacing.base}`,
                    fontSize: theme.typography.fontSizes.base,
                    borderColor: theme.colors.border,
                    color: theme.colors.textPrimary,
                    "--tw-ring-color": theme.colors.primary,
                  } as React.CSSProperties
                }
                autoFocus
              />
            </div>

            {/* Search Results */}
            {searchQuery.trim() !== "" && searchResults.length > 0 && (
              <div style={{ marginBottom: theme.spacing.xl }}>
                <h3
                  className="font-semibold"
                  style={{
                    fontSize: theme.typography.fontSizes.xl,
                    lineHeight: "30px",
                    color: theme.colors.headingText || theme.colors.textPrimary,
                  }}
                >
                  {t("searchModal.searchResultsTitle")}
                </h3>
                <div>
                  {searchResults.map((product) => (
                    <div
                      key={product.product_id}
                      className="flex items-center border-b transition-colors"
                      style={{
                        paddingTop: theme.spacing.base,
                        paddingBottom: theme.spacing.base,
                        borderColor:
                          theme.colors.containerBorder || theme.colors.border,
                        backgroundColor: "transparent",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor =
                          theme.colors.hover || "#f9fafb";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "transparent";
                      }}
                    >
                      <div
                        className="rounded-lg overflow-hidden relative"
                        style={{
                          minWidth: "88px",
                          height: "56px",
                          marginRight: theme.spacing.md,
                          backgroundColor: theme.colors.muted,
                        }}
                      >
                        {product.thumbnail && (
                          <Image
                            src={product.thumbnail}
                            alt={product.name}
                            fill
                            sizes="88px"
                            className="object-contain"
                          />
                        )}
                      </div>
                      <div
                        className="flex-1 min-w-0"
                        style={{ paddingRight: theme.spacing.sm }}
                      >
                        <p
                          className="font-medium truncate"
                          style={{
                            fontSize: theme.typography.fontSizes.base,
                            color: theme.colors.textPrimary,
                          }}
                        >
                          {product.name}
                        </p>
                      </div>
                      <button
                        onClick={() => handleAddFromSearch(product.product_id)}
                        disabled={selectedProductIds.includes(
                          product.product_id,
                        )}
                        className="rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-white font-medium"
                        style={{
                          padding: `${theme.spacing.sm} ${theme.spacing.base}`,
                          backgroundColor: theme.colors.primary,
                        }}
                        title={t("searchModal.addTooltip")}
                      >
                        <Plus className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Complete Button */}
            <button
              onClick={() => setIsSearchModalOpen(false)}
              className="w-full px-6 text-white rounded-lg hover:opacity-90 transition-colors font-semibold mb-6 md:h-14 md:text-base md:leading-6 sm:h-12 sm:text-sm sm:leading-5"
              style={{ backgroundColor: theme.colors.primary }}
            >
              {t("searchModal.complete")}
            </button>

            {/* Suggested Products */}
            <h3
              className="text-xl md:text-xl sm:text-lg font-semibold mt-6 leading-[30px] md:leading-[30px] sm:leading-7"
              style={{
                color: theme.colors.headingText || theme.colors.textPrimary,
              }}
            >
              {t("searchModal.suggestedTitle")}
            </h3>
            <div>
              {suggestedProducts.map((product) => (
                <div
                  key={product.product_id}
                  className="flex items-center py-4 border-b transition-colors"
                  style={{
                    borderColor:
                      theme.colors.containerBorder || theme.colors.border,
                    backgroundColor: "transparent",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor =
                      theme.colors.hover || "#f9fafb";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent";
                  }}
                >
                  <div
                    className="min-w-[88px] h-14 relative rounded-lg overflow-hidden mr-3"
                    style={{ backgroundColor: theme.colors.muted || "#f3f4f6" }}
                  >
                    {product.thumbnail && (
                      <Image
                        src={product.thumbnail}
                        alt={product.name}
                        fill
                        sizes="88px"
                        className="object-contain"
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0 pr-2">
                    <p
                      className="font-medium truncate md:text-base sm:text-sm"
                      style={{ color: theme.colors.textPrimary }}
                    >
                      {product.name}
                    </p>
                  </div>
                  <button
                    onClick={() => handleAddFromSearch(product.product_id)}
                    disabled={selectedProductIds.includes(product.product_id)}
                    className="p-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    style={{ backgroundColor: "transparent" }}
                    onMouseEnter={(e) => {
                      if (!selectedProductIds.includes(product.product_id)) {
                        e.currentTarget.style.backgroundColor =
                          theme.colors.hover || "#f9fafb";
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "transparent";
                    }}
                    title={t("searchModal.addTooltip")}
                  >
                    <Plus
                      className="w-5 h-5"
                      style={{ color: theme.colors.primary }}
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
