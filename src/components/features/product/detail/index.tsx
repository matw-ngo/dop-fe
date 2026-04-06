"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { useFormTheme } from "@/components/form-generation/themes";
import { useProductDetail } from "@/hooks/features/product";
import { useTenant } from "@/hooks/tenant";
import { ProductDetailContent } from "./product-detail-content";
import { ProductComparingPanel } from "../comparing-panel";
import Footer from "@/components/layout/footer";

interface ProductDetailProps {
  productId: string;
}

export function ProductDetail({ productId }: ProductDetailProps) {
  const router = useRouter();
  const t = useTranslations("features.products.detail");
  const { theme } = useFormTheme();
  const tenant = useTenant();
  const {
    data: product,
    isLoading,
    error,
  } = useProductDetail({
    productId,
    tenantId: tenant.uuid, // Use actual tenant UUID from context
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div style={{ color: theme.colors.textSecondary }}>{t("loading")}</div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <div style={{ color: theme.colors.textSecondary }}>{t("notFound")}</div>
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
        <div className="container mx-auto px-4 py-6">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 mb-6 text-sm">
            <button
              onClick={() => router.push("/")}
              className="hover:underline"
              style={{ color: theme.colors.textSecondary }}
            >
              {t("breadcrumb.home")}
            </button>
            <ChevronRight
              className="w-4 h-4"
              style={{ color: theme.colors.textSecondary }}
            />
            <button
              onClick={() => router.push("/products")}
              className="hover:underline"
              style={{ color: theme.colors.textSecondary }}
            >
              {t("breadcrumb.products")}
            </button>
            <ChevronRight
              className="w-4 h-4"
              style={{ color: theme.colors.textSecondary }}
            />
            <span style={{ color: theme.colors.textPrimary }}>
              {product.name}
            </span>
          </nav>

          {/* Product Detail Content */}
          <ProductDetailContent product={product} />
        </div>
      </main>

      <Footer company="finzone" />
      <ProductComparingPanel />
    </>
  );
}
