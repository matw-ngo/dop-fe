"use client";

import { useTranslations } from "next-intl";
import ComparisonSnackbar from "@/components/features/insurance/InsuranceComparisonSnackbar";
import InsurancePageContent from "@/components/features/insurance/InsurancePageContent";
import InsurancePageControls from "@/components/features/insurance/InsurancePageControls";
import InsurancePageHero from "@/components/features/insurance/InsurancePageHero";
import { InsuranceThemeProvider } from "@/components/features/insurance/InsuranceThemeProvider";
import Footer from "@/components/layout/footer";
import Header from "@/components/layout/header";
import { useInsuranceUrlSyncFull } from "@/hooks/features/insurance/use-insurance-url-sync";
import { useInsuranceNavbarTheme } from "@/hooks/features/insurance/useInsuranceNavbarTheme";
import { useInsurancePageComputed } from "@/hooks/features/insurance/useInsurancePageComputed";
import { useInsurancePageHandlers } from "@/hooks/features/insurance/useInsurancePageHandlers";
import {
  type UseInsurancePageStateReturn,
  useInsurancePageState,
} from "@/hooks/features/insurance/useInsurancePageState";
import {
  useFilteredInsuranceProducts,
  useInsuranceActions,
  useInsuranceFilters,
  useInsuranceGetters,
  useInsuranceSearch,
  useInsuranceUI,
} from "@/store/use-insurance-store";

/**
 * Insurance listing page with filtering, search, and pagination
 */
export default function InsurancePage() {
  const t = useTranslations("features.insurance.listing");

  // Configuration - use theme-aware navbar config
  const insuranceNavbarConfig = useInsuranceNavbarTheme();

  // State management
  const {
    mobileFiltersOpen,
    setMobileFiltersOpen,
    itemsPerPage,
    setItemsPerPage,
    setFiltersState,
  } = useInsurancePageState();

  // Store data
  const filteredProducts = useFilteredInsuranceProducts();
  const { searchQuery, sortOption, viewMode, pagination, totalProducts } =
    useInsuranceSearch();
  const { isLoading } = useInsuranceUI();
  const {
    setSearchQuery,
    setSortOption,
    setViewMode,
    setFilters,
    clearFilters,
    setPagination,
  } = useInsuranceActions();
  const { filters, activeFiltersCount } = useInsuranceFilters();

  // Store actions for handlers
  const { addToComparison, removeFromComparison } = useInsuranceActions();
  const { isInComparison } = useInsuranceGetters();

  // URL Sync
  // useInsuranceUrlSyncFull({
  //   searchQuery,
  //   sortOption,
  //   pagination,
  //   filters,
  //   setSearchQuery,
  //   setSortOption,
  //   setPagination,
  //   setFilters,
  // });

  // Event handlers
  const handlers = useInsurancePageHandlers(
    {
      setSearchQuery,
      setSortOption,
      setFilters,
      clearFilters,
      setPagination,
      setItemsPerPage,
    },
    { setFiltersState, itemsPerPage },
    {
      addToComparison,
      removeFromComparison,
      isInComparison,
      setViewMode,
    },
  );

  // Computed values
  const {
    totalPages,
    paginatedProducts,
    hasProducts,
    hasMultiplePages,
    canPaginate,
  } = useInsurancePageComputed(
    filteredProducts,
    pagination,
    itemsPerPage,
    totalProducts,
  );

  return (
    <InsuranceThemeProvider>
      <div className="flex flex-col min-h-screen bg-background">
        {/* Header */}
        <Header configOverride={insuranceNavbarConfig} />

        {/* Hero Section */}
        <InsurancePageHero
          titleKey="pageTitle"
          descriptionKey="pageDescription"
        />

        {/* Search and Controls */}
        <InsurancePageControls
          searchQuery={searchQuery}
          onSearch={handlers.handleSearch}
          sortOption={sortOption}
          onSortChange={handlers.handleSortChange}
          viewMode={viewMode}
          onViewModeChange={handlers.handleViewModeChange}
          filters={filters}
          onFiltersChange={handlers.handleFiltersChange}
          onClearFilters={handlers.handleClearFilters}
          isLoading={isLoading}
          totalProducts={totalProducts}
          filteredProductsCount={filteredProducts.length}
          activeFiltersCount={activeFiltersCount}
          mobileFiltersOpen={mobileFiltersOpen}
          onMobileFiltersChange={setMobileFiltersOpen}
        />

        {/* Main Content */}
        <main className="flex-grow">
          <InsurancePageContent
            isLoading={isLoading}
            paginatedProducts={paginatedProducts}
            filters={filters}
            onFiltersChange={handlers.handleFiltersChange}
            onClearFilters={handlers.handleClearFilters}
            onProductClick={(product) => {
              // TODO: Implement navigation to product details
              console.log("Selected product:", product.id);
            }}
            onCompareToggle={handlers.handleCompareToggle}
            totalPages={totalPages}
            currentPage={pagination.page}
            totalItems={totalProducts}
            itemsPerPage={itemsPerPage}
            onPageChange={handlers.handlePageChange}
            onItemsPerPageChange={handlers.handleItemsPerPageChange}
            hasMultiplePages={hasMultiplePages}
            searchQuery={searchQuery}
            activeFiltersCount={activeFiltersCount}
            onSearchClear={() => handlers.handleSearch("")}
            viewMode={viewMode}
          />
        </main>

        {/* Footer */}
        <Footer company="finzone" />

        {/* Comparison Status Snack Bar */}
        <ComparisonSnackbar />
      </div>
    </InsuranceThemeProvider>
  );
}
