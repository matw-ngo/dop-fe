"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Shield, Search } from "lucide-react";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Badge } from "@/components/ui/badge";
import { useInsuranceStore } from "@/store/use-insurance-store";
import { InsuranceProduct } from "@/types/insurance";
import InsuranceGrid from "@/components/features/insurance/InsuranceGrid";
import ComparisonPanel from "@/components/features/insurance/ComparisonPanel";

// Placeholder components - to be created in subsequent tasks
const InsuranceComparison = ({ productIds }: { productIds: string[] }) => {
  const t = useTranslations();
  const { getProductById } = useInsuranceStore();

  const products = productIds
    .map((id) => getProductById(id))
    .filter(Boolean) as InsuranceProduct[];

  if (products.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">
          {t("pages.insurance.comparingProducts", { count: products.length }) ||
            `Đang so sánh ${products.length} sản phẩm bảo hiểm`}
        </h2>
        <p className="text-muted-foreground">
          {t("pages.insurance.comparingDescription") ||
            "So sánh chi tiết các tính năng và quyền lợi của các sản phẩm đã chọn"}
        </p>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-sm text-yellow-800">
          <strong>Lưu ý:</strong> This is a placeholder for the
          InsuranceComparison component. The actual comparison component will be
          implemented in Task 25.
        </p>
      </div>

      {/* Temporary display of selected products */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => (
          <div key={product.id} className="border rounded-lg p-4">
            <h3 className="font-semibold mb-2">{product.name}</h3>
            <p className="text-sm text-muted-foreground mb-2">
              {product.issuer}
            </p>
            <p className="text-lg font-bold text-primary">
              {new Intl.NumberFormat("vi-VN", {
                style: "currency",
                currency: "VND",
              }).format(product.pricing.totalPremium)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

// Comparison Panel Integration Component
const ComparisonPanelWrapper = ({
  productIds,
  onClearAll,
}: {
  productIds: string[];
  onClearAll: () => void;
}) => {
  const t = useTranslations();
  const { getProductById } = useInsuranceStore();

  const products = productIds
    .map((id) => getProductById(id))
    .filter(Boolean) as InsuranceProduct[];

  const handleAddProduct = () => {
    // Navigate back to insurance listing to add more products
    window.location.href = `/${t("common.locale") || "vi"}/insurance`;
  };

  const handleRemoveProduct = (productId: string) => {
    // This would typically update URL or state
    const updatedIds = productIds.filter((id) => id !== productId);
    if (updatedIds.length > 0) {
      window.location.href = `/${t("common.locale") || "vi"}/insurance/compare?ids=${updatedIds.join(",")}`;
    } else {
      onClearAll();
    }
  };

  return (
    <ComparisonPanel
      products={products}
      onAdd={handleAddProduct}
      onRemove={handleRemoveProduct}
      onClear={onClearAll}
      maxProducts={3}
      isSticky={true}
    />
  );
};

export default function InsuranceComparePage() {
  const t = useTranslations();
  const locale = useLocale();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [productIds, setProductIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Get comparison actions from store
  const { clearComparison, getProductById } = useInsuranceStore();

  useEffect(() => {
    // Read comparison IDs from URL parameters
    // Support both 'ids' and 'products' parameter names
    const idsParam = searchParams.get("ids");
    const productsParam = searchParams.get("products");

    const ids = idsParam || productsParam;

    if (ids) {
      const idArray = ids.split(",").filter((id) => id.trim());
      // Validate that the products exist
      const validIds = idArray.filter((id) => {
        const product = getProductById(id);
        return product !== undefined;
      });
      setProductIds(validIds);
    } else {
      setProductIds([]);
    }

    setIsLoading(false);
  }, [searchParams, getProductById]);

  // Handle clearing comparison
  const handleClearComparison = () => {
    clearComparison();
    router.push(`/${locale}/insurance`);
  };

  // Handle URL synchronization when product IDs change
  useEffect(() => {
    if (productIds.length > 0) {
      // Update URL with current product IDs
      const params = new URLSearchParams(searchParams.toString());
      params.set("ids", productIds.join(","));
      // Remove 'products' parameter if it exists to avoid duplication
      params.delete("products");

      const newUrl = `/${locale}/insurance/compare?${params.toString()}`;
      router.replace(newUrl, { scroll: false });
    }
  }, [productIds, locale, router, searchParams]);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Shield className="w-16 h-16 mx-auto text-primary animate-pulse" />
          <p className="text-lg">
            {t("pages.insurance.loadingComparison") || "Đang tải so sánh..."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header with Breadcrumb */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          {/* Breadcrumb Navigation */}
          <Breadcrumb className="mb-4">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href={`/${locale}`}>
                  {t("common.home") || "Trang chủ"}
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href={`/${locale}/insurance`}>
                  {t("pages.insurance.insuranceProducts") ||
                    "Sản phẩm bảo hiểm"}
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>
                  {t("pages.insurance.compare") || "So sánh"}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Link href={`/${locale}/insurance`}>
                <Button variant="outline" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  {t("common.back") || "Quay lại"}
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">
                  {t("pages.insurance.compareProducts") ||
                    "So sánh sản phẩm bảo hiểm"}
                </h1>
                <p className="text-muted-foreground">
                  {t("pages.insurance.compareDescription") ||
                    "So sánh chi tiết các sản phẩm bảo hiểm đã chọn"}
                </p>
              </div>
            </div>

            {productIds.length > 0 && (
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-sm">
                  {productIds.length}{" "}
                  {t("pages.insurance.products") || "sản phẩm"}
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearComparison}
                >
                  {t("pages.insurance.clearAll") || "Xóa tất cả"}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {productIds.length > 0 ? (
          <div className="space-y-8">
            {/* Comparison Panel */}
            <div className="lg:col-span-1">
              <ComparisonPanelWrapper
                productIds={productIds}
                onClearAll={handleClearComparison}
              />
            </div>

            {/* Main Comparison Area */}
            <div>
              <InsuranceComparison productIds={productIds} />
            </div>

            {/* Suggestions Section */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">
                {t("pages.insurance.youMightAlsoLike") || "Bạn có thể thích"}
              </h2>
              <InsuranceGrid
                products={[]} // Will be populated with suggestions in Task 28
                columns={3}
                gap="4"
                emptyStateMessage={
                  t("pages.insurance.noMoreSuggestions") ||
                  "Không có thêm gợi ý nào"
                }
              />
            </div>
          </div>
        ) : (
          /* Empty State */
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
              <Shield className="w-12 h-12 text-gray-400" />
            </div>
            <h2 className="text-2xl font-semibold mb-4">
              {t("pages.insurance.noProductsToCompare") ||
                "Chưa có sản phẩm nào để so sánh"}
            </h2>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              {t("pages.insurance.selectAtLeastTwo") ||
                "Vui lòng chọn ít nhất 2 sản phẩm bảo hiểm để so sánh và tìm thấy gói phù hợp nhất với bạn"}
            </p>
            <div className="space-y-4">
              <Link href={`/${locale}/insurance`}>
                <Button size="lg" className="mr-4">
                  <Search className="w-4 h-4 mr-2" />
                  {t("pages.insurance.browseInsurance") ||
                    "Duyệt sản phẩm bảo hiểm"}
                </Button>
              </Link>
              <Button variant="outline" size="lg" onClick={() => router.back()}>
                {t("common.goBack") || "Quay lại"}
              </Button>
            </div>

            {/* Additional Help Text */}
            <div className="mt-12 p-6 bg-muted rounded-lg max-w-2xl mx-auto">
              <h3 className="font-semibold mb-3">
                {t("pages.insurance.howToCompare") || "Cách so sánh sản phẩm"}
              </h3>
              <ol className="text-left text-sm text-muted-foreground space-y-2">
                <li>
                  1.{" "}
                  {t("pages.insurance.step1") ||
                    "Duyệt qua danh sách sản phẩm bảo hiểm"}
                </li>
                <li>
                  2.{" "}
                  {t("pages.insurance.step2") ||
                    "Nhấp vào nút 'So sánh' trên các sản phẩm bạn quan tâm"}
                </li>
                <li>
                  3.{" "}
                  {t("pages.insurance.step3") ||
                    "Chọn tối đa 3 sản phẩm để so sánh chi tiết"}
                </li>
                <li>
                  4.{" "}
                  {t("pages.insurance.step4") ||
                    "Xem bảng so sánh và chọn sản phẩm phù hợp nhất"}
                </li>
              </ol>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
