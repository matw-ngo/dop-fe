import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { useInsuranceStore } from "@/store/use-insurance-store";
import { InsuranceProduct } from "@/types/insurance";

export function useComparisonData() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const locale = useLocale();
  const [productIds, setProductIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  // Get comparison state from store
  const storeComparisonProducts = useInsuranceStore(
    (state) => state.comparison.selectedProducts,
  );
  const { clearComparison, getProductById } = useInsuranceStore();

  // Initialize product IDs from URL or store
  useEffect(() => {
    if (isInitialized) return;

    // First try to get IDs from URL parameters (for direct link access)
    const idsParam = searchParams.get("ids");
    const productsParam = searchParams.get("products");
    const ids = idsParam || productsParam;

    if (ids) {
      // If URL has IDs, use them
      const idArray = ids.split(",").filter((id) => id.trim());
      const validIds = idArray.filter((id) => {
        const product = getProductById(id);
        return product !== undefined;
      });
      setProductIds(validIds);
    } else {
      // If no URL params, use store state
      setProductIds(storeComparisonProducts);
    }

    setIsLoading(false);
    setIsInitialized(true);
  }, [searchParams, getProductById, storeComparisonProducts, isInitialized]);

  // Handle URL synchronization when product IDs change
  useEffect(() => {
    if (!isInitialized || productIds.length === 0) return;

    // Update URL with current product IDs
    const params = new URLSearchParams(searchParams.toString());
    params.set("ids", productIds.join(","));
    // Remove 'products' parameter if it exists to avoid duplication
    params.delete("products");

    const newUrl = `/${locale}/insurance/compare?${params.toString()}`;
    router.replace(newUrl, { scroll: false });
  }, [productIds, router, searchParams, isInitialized, locale]);

  // Get products from IDs
  const getProducts = (): InsuranceProduct[] => {
    return productIds
      .map((id) => getProductById(id))
      .filter(Boolean) as InsuranceProduct[];
  };

  // Handle clearing comparison
  const handleClearComparison = (clearLocale: string = locale) => {
    clearComparison();
    setProductIds([]);
    router.push(`/${clearLocale}/insurance`);
  };

  // Handle removing a product
  const handleRemoveProduct = (productId: string, locale: string) => {
    const updatedIds = productIds.filter((id) => id !== productId);
    setProductIds(updatedIds);

    // Also remove from store
    const store = useInsuranceStore.getState();
    store.removeFromComparison(productId);

    if (updatedIds.length === 0) {
      handleClearComparison(locale);
    }
  };

  return {
    productIds,
    products: getProducts(),
    isLoading,
    isInitialized,
    handleClearComparison,
    handleRemoveProduct,
    setProductIds,
  };
}