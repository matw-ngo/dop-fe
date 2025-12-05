"use client";

import { useTranslations } from "next-intl";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { getInsuranceNavbarConfig } from "@/configs/insurance-navbar-config";
import InsurancePageHero from "@/components/features/insurance/InsurancePageHero";
import InsurancePageControls from "@/components/features/insurance/InsurancePageControls";
import InsurancePageContent from "@/components/features/insurance/InsurancePageContent";
import {
  useInsurancePageState,
  type UseInsurancePageStateReturn,
} from "@/hooks/features/insurance/useInsurancePageState";
import { useInsurancePageHandlers } from "@/hooks/features/insurance/useInsurancePageHandlers";
import { useInsurancePageComputed } from "@/hooks/features/insurance/useInsurancePageComputed";
import { useInsuranceUrlSyncFull } from "@/hooks/features/insurance/use-insurance-url-sync";
import {
  useInsuranceSearch,
  useInsuranceUI,
  useInsuranceActions,
  useInsuranceFilters,
  useFilteredInsuranceProducts,
} from "@/store/use-insurance-store";

/**
 * Insurance listing page with filtering, search, and pagination
 */
export default function InsurancePage() {
  const t = useTranslations("pages.insurance");

  // Configuration
  const insuranceNavbarConfig = getInsuranceNavbarConfig();

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
        />
      </main>

      {/* Footer */}
      <Footer company="finzone" />
    </div>
  );
}
