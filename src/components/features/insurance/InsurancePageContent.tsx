import { Loader2, Shield } from "lucide-react";
import { useTranslations } from "next-intl";
import InsuranceFilterPanel from "@/components/features/insurance/InsuranceFilterPanel";
import InsuranceGrid from "@/components/features/insurance/InsuranceGrid";
import Pagination from "@/components/features/insurance/InsurancePagination";
import { useThemeUtils } from "@/components/renderer/theme";
import { Button } from "@/components/ui/button";
import { useInsuranceStore } from "@/store/use-insurance-store";
import type { InsuranceProduct } from "@/types/insurance";

interface InsurancePageContentProps {
  isLoading: boolean;
  paginatedProducts: InsuranceProduct[];
  filters: any;
  onFiltersChange: (filters: any) => void;
  onClearFilters: () => void;
  onProductClick: (product: InsuranceProduct) => void;
  onCompareToggle: (productId: string) => void;
  totalPages: number;
  currentPage: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (itemsPerPage: number) => void;
  hasMultiplePages: boolean;
  searchQuery: string;
  activeFiltersCount: number;
  onSearchClear: () => void;
  viewMode: "grid" | "list" | "compact";
}

export default function InsurancePageContent({
  isLoading,
  paginatedProducts,
  filters,
  onFiltersChange,
  onClearFilters,
  onProductClick,
  onCompareToggle,
  totalPages,
  currentPage,
  totalItems,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
  hasMultiplePages,
  searchQuery,
  activeFiltersCount,
  onSearchClear,
  viewMode,
}: InsurancePageContentProps) {
  const t = useTranslations("features.insurance.listing");
  const { theme } = useThemeUtils();

  // Get comparison state from store
  const comparisonProducts = useInsuranceStore(
    (state: any) => state.comparison.selectedProducts,
  );

  const isMedicalTheme = theme.name === "medical";

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex gap-8">
        {/* Sidebar - Desktop */}
        <aside className="hidden lg:block w-80 flex-shrink-0">
          <div
            className={`sticky top-24 rounded-lg border p-4 ${
              isMedicalTheme ? "bg-primary/5 border-primary/20" : "bg-card"
            }`}
          >
            <InsuranceFilterPanel
              filters={filters}
              onFiltersChange={onFiltersChange}
              onClearFilters={onClearFilters}
            />
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 min-w-0">
          {isLoading ? (
            /* Loading State */
            <div className="flex items-center justify-center py-20">
              <div className="flex flex-col items-center gap-4">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <p className="text-muted-foreground">{t("loading")}</p>
              </div>
            </div>
          ) : paginatedProducts.length > 0 ? (
            /* Product Grid */
            <>
              <InsuranceGrid
                products={paginatedProducts}
                viewMode={viewMode === "compact" ? "grid" : viewMode}
                onProductClick={onProductClick}
                onCompareToggle={onCompareToggle}
                comparingProducts={comparisonProducts}
              />

              {/* Pagination */}
              {hasMultiplePages && (
                <div className="mt-8">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    itemsPerPage={itemsPerPage}
                    totalItems={totalItems}
                    onPageChange={onPageChange}
                    onItemsPerPageChange={onItemsPerPageChange}
                    showItemsPerPageSelector={true}
                  />
                </div>
              )}
            </>
          ) : (
            /* No Results State */
            <div
              className={`flex flex-col items-center justify-center py-20 rounded-lg border p-12 ${
                isMedicalTheme ? "bg-primary/5 border-primary/20" : ""
              }`}
            >
              <div
                className={`p-4 rounded-full mb-4 ${
                  isMedicalTheme ? "bg-primary/10" : "bg-muted"
                }`}
              >
                <Shield
                  className={`w-16 h-16 ${
                    isMedicalTheme ? "text-primary" : "text-muted-foreground"
                  }`}
                />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {searchQuery ? t("noSearchResults") : t("noFilterResults")}
              </h3>
              <p className="text-muted-foreground text-center mb-6 max-w-md">
                {searchQuery
                  ? t("tryDifferentSearch")
                  : t("tryAdjustingFilters")}
              </p>
              <div className="flex gap-3">
                {searchQuery && (
                  <Button
                    variant="outline"
                    onClick={onSearchClear}
                    className={
                      isMedicalTheme
                        ? "border-primary/30 hover:bg-primary/10"
                        : ""
                    }
                  >
                    {t("clearSearch")}
                  </Button>
                )}
                {activeFiltersCount > 0 && (
                  <Button
                    variant="outline"
                    onClick={onClearFilters}
                    className={
                      isMedicalTheme
                        ? "border-primary/30 hover:bg-primary/10"
                        : ""
                    }
                  >
                    {t("clearFilters")}
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
