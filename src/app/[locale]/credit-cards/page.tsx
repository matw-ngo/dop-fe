"use client";

import React, { useState, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useSearchParams } from "next/navigation";
import CreditCardGrid from "@/components/features/credit-card/CreditCardGrid";
import FilterPanel from "@/components/features/credit-card/FilterPanel";
import SearchBar from "@/components/features/credit-card/SearchBar";
import SortDropdown from "@/components/features/credit-card/SortDropdown";
import Pagination from "@/components/features/credit-card/Pagination";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Filter as FilterIcon, X, LayoutGrid, List } from "lucide-react";
import { useCreditCardsStore } from "@/store/use-credit-cards-store";
import { CreditCardFilters } from "@/types/credit-card";
import { DEFAULT_FILTERS, DEFAULT_PAGE_SIZE } from "@/constants/credit-cards";
import { CardCategory, CardNetwork, SortOption } from "@/types/credit-card";

// Convert search params to filters
const searchParamsToFilters = (
  searchParams: URLSearchParams,
): Partial<CreditCardFilters> => {
  const filters: Partial<CreditCardFilters> = {};

  // Parse categories
  const categories = searchParams.get("categories");
  if (categories) {
    filters.categories = categories.split(",") as CardCategory[];
  }

  // Parse networks
  const networks = searchParams.get("networks");
  if (networks) {
    filters.networks = networks.split(",") as CardNetwork[];
  }

  // Parse annual fee range
  const annualFeeMin = searchParams.get("annualFeeMin");
  const annualFeeMax = searchParams.get("annualFeeMax");
  if (annualFeeMin || annualFeeMax) {
    filters.annualFeeRange = {
      min: annualFeeMin
        ? parseInt(annualFeeMin)
        : DEFAULT_FILTERS.annualFeeRange.min,
      max: annualFeeMax
        ? parseInt(annualFeeMax)
        : DEFAULT_FILTERS.annualFeeRange.max,
    };
  }

  // Parse age range
  const ageMin = searchParams.get("ageMin");
  const ageMax = searchParams.get("ageMax");
  if (ageMin || ageMax) {
    filters.ageRange = {
      min: ageMin ? parseInt(ageMin) : DEFAULT_FILTERS.ageRange.min,
      max: ageMax ? parseInt(ageMax) : DEFAULT_FILTERS.ageRange.max,
    };
  }

  // Parse income range
  const incomeMin = searchParams.get("incomeMin");
  const incomeMax = searchParams.get("incomeMax");
  if (incomeMin || incomeMax) {
    filters.incomeRange = {
      min: incomeMin ? parseInt(incomeMin) : DEFAULT_FILTERS.incomeRange.min,
      max: incomeMax ? parseInt(incomeMax) : DEFAULT_FILTERS.incomeRange.max,
    };
  }

  // Note: creditLimitRange is not in the CreditCardFilters interface
  // This will be handled by the credit limit filtering in the store

  // Parse provinces
  const provinces = searchParams.get("provinces");
  if (provinces) {
    filters.provinces = provinces.split(",");
  }

  // Parse employment types
  const employmentTypes = searchParams.get("employmentTypes");
  if (employmentTypes) {
    filters.employmentTypes = employmentTypes.split(",") as (
      | "full_time"
      | "part_time"
      | "business_owner"
      | "freelancer"
      | "retired"
    )[];
  }

  // Parse rewards types
  const rewardsTypes = searchParams.get("rewardsTypes");
  if (rewardsTypes) {
    filters.rewardsTypes = rewardsTypes.split(",");
  }

  // Parse digital features
  const digitalFeatures = searchParams.get("digitalFeatures");
  if (digitalFeatures) {
    filters.digitalFeatures = digitalFeatures.split(",");
  }

  // Parse min rating
  const minRating = searchParams.get("minRating");
  if (minRating) {
    filters.minRating = parseInt(minRating);
  }

  // Parse boolean filters
  const hasWelcomeOffer = searchParams.get("hasWelcomeOffer");
  if (hasWelcomeOffer) {
    filters.hasWelcomeOffer = hasWelcomeOffer === "true";
  }

  const hasAnnualFeeWaiver = searchParams.get("hasAnnualFeeWaiver");
  if (hasAnnualFeeWaiver) {
    filters.hasAnnualFeeWaiver = hasAnnualFeeWaiver === "true";
  }

  const hasInstallmentPlans = searchParams.get("hasInstallmentPlans");
  if (hasInstallmentPlans) {
    filters.hasInstallmentPlans = hasInstallmentPlans === "true";
  }

  const hasInsurance = searchParams.get("hasInsurance");
  if (hasInsurance) {
    filters.hasInsurance = hasInsurance === "true";
  }

  const isNew = searchParams.get("isNew");
  if (isNew) {
    filters.isNew = isNew === "true";
  }

  const isRecommended = searchParams.get("isRecommended");
  if (isRecommended) {
    filters.isRecommended = isRecommended === "true";
  }

  const isExclusive = searchParams.get("isExclusive");
  if (isExclusive) {
    filters.isExclusive = isExclusive === "true";
  }

  return filters;
};

// Convert filters to search params
const filtersToSearchParams = (filters: CreditCardFilters): URLSearchParams => {
  const params = new URLSearchParams();

  // Add categories
  if (filters.categories.length > 0) {
    params.set("categories", filters.categories.join(","));
  }

  // Add networks
  if (filters.networks.length > 0) {
    params.set("networks", filters.networks.join(","));
  }

  // Add annual fee range
  if (
    filters.annualFeeRange.min !== DEFAULT_FILTERS.annualFeeRange.min ||
    filters.annualFeeRange.max !== DEFAULT_FILTERS.annualFeeRange.max
  ) {
    params.set("annualFeeMin", filters.annualFeeRange.min.toString());
    params.set("annualFeeMax", filters.annualFeeRange.max.toString());
  }

  // Add age range
  if (
    filters.ageRange.min !== DEFAULT_FILTERS.ageRange.min ||
    filters.ageRange.max !== DEFAULT_FILTERS.ageRange.max
  ) {
    params.set("ageMin", filters.ageRange.min.toString());
    params.set("ageMax", filters.ageRange.max.toString());
  }

  // Add income range
  if (
    filters.incomeRange.min !== DEFAULT_FILTERS.incomeRange.min ||
    filters.incomeRange.max !== DEFAULT_FILTERS.incomeRange.max
  ) {
    params.set("incomeMin", filters.incomeRange.min.toString());
    params.set("incomeMax", filters.incomeRange.max.toString());
  }

  // Note: creditLimitRange is not in the CreditCardFilters interface
  // Credit limit filtering is handled internally in the store

  // Add provinces
  if (filters.provinces.length > 0) {
    params.set("provinces", filters.provinces.join(","));
  }

  // Add employment types
  if (filters.employmentTypes.length > 0) {
    params.set("employmentTypes", filters.employmentTypes.join(","));
  }

  // Add rewards types
  if (filters.rewardsTypes.length > 0) {
    params.set("rewardsTypes", filters.rewardsTypes.join(","));
  }

  // Add digital features
  if (filters.digitalFeatures.length > 0) {
    params.set("digitalFeatures", filters.digitalFeatures.join(","));
  }

  // Add min rating
  if (filters.minRating > 0) {
    params.set("minRating", filters.minRating.toString());
  }

  // Add boolean filters
  if (filters.hasWelcomeOffer) params.set("hasWelcomeOffer", "true");
  if (filters.hasAnnualFeeWaiver) params.set("hasAnnualFeeWaiver", "true");
  if (filters.hasInstallmentPlans) params.set("hasInstallmentPlans", "true");
  if (filters.hasInsurance) params.set("hasInsurance", "true");
  if (filters.isNew) params.set("isNew", "true");
  if (filters.isRecommended) params.set("isRecommended", "true");
  if (filters.isExclusive) params.set("isExclusive", "true");

  return params;
};

export default function CreditCardsPage() {
  const t = useTranslations("pages.creditCard");
  const locale = useLocale();
  const searchParams = useSearchParams();
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);

  // Get store methods and state
  const {
    filteredCards,
    filters,
    searchQuery,
    sortBy,
    currentPage,
    viewMode,
    setFilters,
    setSearchQuery,
    setSortBy,
    setCurrentPage,
    setViewMode,
    addToComparison,
    removeFromComparison,
    comparisonCards,
    clearFilters,
  } = useCreditCardsStore();

  // Local state for items per page
  const [itemsPerPage, setItemsPerPage] = useState(DEFAULT_PAGE_SIZE);

  // Initialize filters from URL params
  useEffect(() => {
    const urlFilters = searchParamsToFilters(
      searchParams as any as URLSearchParams,
    );
    if (Object.keys(urlFilters).length > 0) {
      setFilters({ ...DEFAULT_FILTERS, ...urlFilters });
    }

    // Initialize sort from URL
    const urlSort = searchParams.get("sort");
    if (urlSort) {
      setSortBy(urlSort as SortOption);
    }

    // Initialize page from URL
    const urlPage = searchParams.get("page");
    if (urlPage) {
      setCurrentPage(parseInt(urlPage));
    }

    // Initialize items per page from URL
    const urlItemsPerPage = searchParams.get("itemsPerPage");
    if (urlItemsPerPage) {
      setItemsPerPage(parseInt(urlItemsPerPage));
    }

    // Initialize search query from URL
    const urlSearch = searchParams.get("search");
    if (urlSearch) {
      setSearchQuery(urlSearch);
    }
  }, [
    searchParams,
    setFilters,
    setSortBy,
    setCurrentPage,
    setItemsPerPage,
    setSearchQuery,
  ]);

  // Update URL when filters change
  useEffect(() => {
    const params = filtersToSearchParams(filters);

    if (searchQuery) {
      params.set("search", searchQuery);
    }

    if (sortBy !== "featured") {
      params.set("sort", sortBy);
    }

    if (currentPage > 1) {
      params.set("page", currentPage.toString());
    }

    if (itemsPerPage !== DEFAULT_PAGE_SIZE) {
      params.set("itemsPerPage", itemsPerPage.toString());
    }

    // Update URL without page reload
    const newUrl = `/${locale}/credit-cards${params.toString() ? "?" + params.toString() : ""}`;
    window.history.replaceState({}, "", newUrl);
  }, [filters, searchQuery, sortBy, currentPage, itemsPerPage, locale]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredCards.length / itemsPerPage);
  const paginatedCards = filteredCards.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  // Handle card comparison
  const handleCompareToggle = (cardId: string) => {
    if (comparisonCards.some((card) => card.id === cardId)) {
      removeFromComparison(cardId);
    } else if (comparisonCards.length < 3) {
      addToComparison(cardId);
    }
  };

  // Handle search
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1); // Reset to first page on search
  };

  // Handle filter change
  const handleFiltersChange = (newFilters: Partial<CreditCardFilters>) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page on filter change
  };

  // Handle sort change
  const handleSortChange = (sortValue: SortOption) => {
    setSortBy(sortValue);
    setCurrentPage(1); // Reset to first page on sort change
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Handle items per page change
  const handleItemsPerPageChange = (itemsPerPage: number) => {
    setItemsPerPage(itemsPerPage);
    setCurrentPage(1); // Reset to first page
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                {t("creditCards")}
              </h1>
              <p className="text-muted-foreground mt-1">
                {t("creditCardsDescription")}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              {comparisonCards.length > 0 && (
                <Badge variant="secondary" className="px-3 py-1">
                  {comparisonCards.length}/3 {t("cardsSelected")}
                </Badge>
              )}
              {comparisonCards.length > 0 && (
                <Button variant="outline" asChild size="sm">
                  <a href={`/${locale}/credit-cards/compare`}>
                    {t("compareCards")} ({comparisonCards.length})
                  </a>
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Search and controls */}
        <div className="mb-6 space-y-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search bar */}
            <div className="flex-1">
              <SearchBar
                value={searchQuery}
                onChange={setSearchQuery}
                onSearch={handleSearch}
                placeholder={t("searchCreditCards")}
              />
            </div>

            {/* Sort and view controls */}
            <div className="flex items-center space-x-2">
              <SortDropdown
                value={sortBy}
                onChange={handleSortChange}
                variant="dropdown"
                size="sm"
              />
              <div className="hidden sm:flex items-center border rounded-md">
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className="rounded-r-none border-r"
                >
                  <LayoutGrid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className="rounded-l-none"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Mobile filter trigger */}
          <div className="lg:hidden flex items-center justify-between">
            <Sheet open={filterSheetOpen} onOpenChange={setFilterSheetOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm">
                  <FilterIcon className="h-4 w-4 mr-2" />
                  {t("filters")}
                  {useCreditCardsStore.getState().activeFiltersCount > 0 && (
                    <Badge
                      variant="secondary"
                      className="ml-2 px-2 py-0 text-xs"
                    >
                      {useCreditCardsStore.getState().activeFiltersCount}
                    </Badge>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80 overflow-y-auto">
                <FilterPanel
                  filters={filters}
                  onFiltersChange={handleFiltersChange}
                  onClearFilters={clearFilters}
                />
              </SheetContent>
            </Sheet>

            {/* Active filters display for mobile */}
            {useCreditCardsStore.getState().activeFiltersCount > 0 && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <X className="h-4 w-4 mr-1" />
                {t("clearFilters")}
              </Button>
            )}
          </div>
        </div>

        <div className="flex gap-6">
          {/* Sidebar - Desktop */}
          <div className="hidden lg:block w-80 flex-shrink-0">
            <div className="sticky top-6">
              <FilterPanel
                filters={filters}
                onFiltersChange={handleFiltersChange}
                onClearFilters={clearFilters}
              />
            </div>
          </div>

          {/* Main content */}
          <div className="flex-1">
            {/* Results header */}
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold">
                  {t("results", { count: filteredCards.length })}
                </h2>
                {searchQuery && (
                  <p className="text-sm text-muted-foreground">
                    {t("searchResultsFor", { query: searchQuery })}
                  </p>
                )}
              </div>

              {/* Items per page selector */}
              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground">
                  {t("show")}:
                </span>
                <select
                  value={itemsPerPage}
                  onChange={(e) =>
                    handleItemsPerPageChange(parseInt(e.target.value))
                  }
                  className="h-9 w-20 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value={12}>12</option>
                  <option value={24}>24</option>
                  <option value={48}>48</option>
                  <option value={96}>96</option>
                </select>
              </div>
            </div>

            {/* Results */}
            <div className="space-y-6">
              {filteredCards.length === 0 ? (
                <div className="text-center py-12">
                  <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <FilterIcon className="h-12 w-12 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">
                    {t("noCardsFound")}
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    {t("tryAdjustingFilters")}
                  </p>
                  <Button onClick={clearFilters} variant="outline">
                    {t("clearFilters")}
                  </Button>
                </div>
              ) : (
                <>
                  {/* Cards grid */}
                  <CreditCardGrid
                    cards={paginatedCards}
                    loading={false}
                    viewMode={viewMode}
                    selectedCards={comparisonCards.map((card) => card.id)}
                    onCompare={handleCompareToggle}
                    onCardClick={(card) => {
                      // Handle card click - navigate to detail page
                      window.location.href = `/${locale}/credit-cards/${card.slug}`;
                    }}
                  />

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      totalItems={filteredCards.length}
                      itemsPerPage={itemsPerPage}
                      onPageChange={handlePageChange}
                      onItemsPerPageChange={handleItemsPerPageChange}
                    />
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
