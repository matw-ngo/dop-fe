"use client";

import React, { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import type { InsuranceFilters, SortOption } from "@/types/insurance";

// Import components
import InsuranceSearchBar from "@/components/features/insurance/SearchBar";
import InsuranceFilterPanel from "@/components/features/insurance/FilterPanel";
import InsuranceGrid from "@/components/features/insurance/InsuranceGrid";
import Pagination from "@/components/features/insurance/Pagination";
import SortDropdown from "@/components/features/insurance/SortDropdown";

// Import UI components
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

// Import icons
import {
  Grid,
  List,
  Shield,
  Loader2,
  SlidersHorizontal,
  X,
} from "lucide-react";

// Import hooks
import {
  useFilteredInsuranceProducts,
  useInsuranceSearch,
  useInsuranceUI,
  useInsuranceActions,
  useInsuranceFilters,
} from "@/store/use-insurance-store";

// Import constants
import { PAGINATION_OPTIONS, DEFAULT_PAGE_SIZE } from "@/constants/insurance";

export default function InsurancePage() {
  const t = useTranslations("pages.insurance");

  // State for mobile filters drawer
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [itemsPerPage, setItemsPerPage] = useState(DEFAULT_PAGE_SIZE);

  // Get store data and actions
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

  // Calculate pagination
  const totalPages = Math.ceil(totalProducts / itemsPerPage);
  const paginatedProducts = useMemo(() => {
    return filteredProducts.slice(
      (pagination.page - 1) * itemsPerPage,
      pagination.page * itemsPerPage,
    );
  }, [filteredProducts, pagination.page, itemsPerPage]);

  // Event handlers
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setPagination({ page: 1 });
  };

  const handleSortChange = (sort: SortOption) => {
    setSortOption(sort);
    setPagination({ page: 1 });
  };

  const handleFiltersChange = (newFilters: Partial<InsuranceFilters>) => {
    setFilters(newFilters);
    setPagination({ page: 1 });
  };

  const handleClearFilters = () => {
    clearFilters();
    setPagination({ page: 1 });
  };

  const handlePageChange = (page: number) => {
    setPagination({ page });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setPagination({ page: 1 });
  };

  const handleViewModeChange = (mode: "grid" | "list" | "compact") => {
    setViewMode(mode);
  };

  const handleCompareToggle = (productId: string) => {
    // This will be implemented when we have comparison functionality
    console.log("Toggle compare for product:", productId);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                <Shield className="w-8 h-8 text-blue-600" />
                {t("pageTitle")}
              </h1>
              <p className="text-gray-600 mt-2">{t("pageDescription")}</p>
            </div>

            {/* Mobile Filter Toggle */}
            <div className="lg:hidden">
              <Sheet
                open={mobileFiltersOpen}
                onOpenChange={setMobileFiltersOpen}
              >
                <SheetTrigger asChild>
                  <Button variant="outline" className="flex items-center gap-2">
                    <SlidersHorizontal className="w-4 h-4" />
                    {t("filters")}
                    {activeFiltersCount > 0 && (
                      <Badge variant="secondary" className="ml-1">
                        {activeFiltersCount}
                      </Badge>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[320px] overflow-y-auto">
                  <SheetHeader>
                    <SheetTitle className="flex items-center justify-between">
                      {t("filters")}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleClearFilters}
                        className="text-sm"
                      >
                        {t("clearAll")}
                      </Button>
                    </SheetTitle>
                  </SheetHeader>
                  <div className="mt-6">
                    <InsuranceFilterPanel
                      filters={filters}
                      onFiltersChange={handleFiltersChange}
                      onClearFilters={handleClearFilters}
                      isMobile={true}
                    />
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Controls */}
      <div className="bg-white border-b sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          {/* Search Bar */}
          <div className="mb-4">
            <InsuranceSearchBar
              value={searchQuery}
              onChange={handleSearch}
              placeholder={t("searchPlaceholder")}
            />
          </div>

          {/* Controls Row */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            {/* Left: Results count and active filters */}
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-600">
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  t("showingResults", {
                    count: totalProducts,
                    total: filteredProducts.length,
                  })
                )}
              </div>
              {activeFiltersCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearFilters}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  <X className="w-3 h-3 mr-1" />
                  {t("clearFilters")}
                </Button>
              )}
            </div>

            {/* Right: Sort, View Mode, and Items per Page */}
            <div className="flex items-center gap-2 sm:gap-4">
              {/* Sort Dropdown */}
              <SortDropdown
                value={sortOption}
                onChange={handleSortChange}
                variant="select"
                size="sm"
                className="w-full sm:w-auto min-w-[200px]"
              />

              {/* View Mode Toggle - Desktop Only */}
              <div className="hidden sm:flex items-center gap-1 p-1 bg-gray-100 rounded-lg">
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => handleViewModeChange("grid")}
                  className="h-7 w-7 p-0"
                >
                  <Grid className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => handleViewModeChange("list")}
                  className="h-7 w-7 p-0"
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>

              {/* Items per Page - Desktop Only */}
              <div className="hidden sm:flex items-center gap-2">
                <span className="text-sm text-gray-600 whitespace-nowrap">
                  {t("show")}:
                </span>
                <select
                  value={itemsPerPage}
                  onChange={(e) =>
                    handleItemsPerPageChange(Number(e.target.value))
                  }
                  className="text-sm border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {PAGINATION_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Active Filters - When implemented */}
          {/* <div className="mt-4">
            <ActiveFilters
              filters={filters}
              onFiltersChange={handleFiltersChange}
            />
          </div> */}
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Sidebar - Desktop */}
          <div className="hidden lg:block w-80 flex-shrink-0">
            <div className="sticky top-24">
              <InsuranceFilterPanel
                filters={filters}
                onFiltersChange={handleFiltersChange}
                onClearFilters={handleClearFilters}
              />
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 min-w-0">
            {isLoading ? (
              /* Loading State */
              <div className="flex items-center justify-center py-20">
                <div className="flex flex-col items-center gap-4">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                  <p className="text-gray-600">{t("loading")}</p>
                </div>
              </div>
            ) : paginatedProducts.length > 0 ? (
              /* Product Grid */
              <>
                <InsuranceGrid
                  products={paginatedProducts}
                  viewMode={
                    viewMode === "compact"
                      ? "grid"
                      : (viewMode as "grid" | "list")
                  }
                  onProductClick={(product) => {
                    console.log("Selected product:", product.id);
                    // Navigate to product details
                  }}
                  onCompareToggle={handleCompareToggle}
                  comparingProducts={[]} // Will be populated from store
                />

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-8">
                    <Pagination
                      currentPage={pagination.page}
                      totalPages={totalPages}
                      itemsPerPage={itemsPerPage}
                      totalItems={totalProducts}
                      onPageChange={handlePageChange}
                      onItemsPerPageChange={handleItemsPerPageChange}
                      showItemsPerPageSelector={true}
                    />
                  </div>
                )}
              </>
            ) : (
              /* No Results State */
              <div className="flex flex-col items-center justify-center py-20">
                <Shield className="w-16 h-16 text-gray-300 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {searchQuery ? t("noSearchResults") : t("noFilterResults")}
                </h3>
                <p className="text-gray-600 text-center mb-6 max-w-md">
                  {searchQuery
                    ? t("tryDifferentSearch")
                    : t("tryAdjustingFilters")}
                </p>
                <div className="flex gap-3">
                  {searchQuery && (
                    <Button variant="outline" onClick={() => handleSearch("")}>
                      {t("clearSearch")}
                    </Button>
                  )}
                  {activeFiltersCount > 0 && (
                    <Button variant="outline" onClick={handleClearFilters}>
                      {t("clearFilters")}
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-50 border-t mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-sm text-gray-600">
            <p>{t("footerText")}</p>
          </div>
        </div>
      </footer>

      {/* Comparison Drawer - When implemented */}
      {/* <ComparisonDrawer
        isOpen={comparisonDrawerOpen}
        onClose={() => setComparisonDrawerOpen(false)}
        products={comparisonProducts}
        onRemoveProduct={handleRemoveFromComparison}
        onCompare={handleCompare}
        onClearComparison={handleClearComparison}
      /> */}
    </div>
  );
}
