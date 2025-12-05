"use client";

import React, { useState } from "react";
import { useLocale } from "next-intl";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { useCreditCardsStoreLegacy } from "@/store/use-credit-cards-store";
import type { CreditCardFilters, SortOption } from "@/types/credit-card";
import { useCreditCardsPageState } from "../../../hooks/features/credit-card/useCreditCardsPageState";
import { useCreditCardsNavbarTheme } from "@/hooks/features/credit-card/useCreditCardsNavbarTheme";

import CreditCardsPageHero from "@/components/features/credit-card/CreditCardsPageHero";
import { CreditCardsPageControls } from "@/components/features/credit-card/CreditCardsPageControls";
import { CreditCardsPageResults } from "@/components/features/credit-card/CreditCardsPageResults";
import CreditCardFilterPanel from "@/components/features/credit-cards/CreditCardFilterPanel";
import { CreditCardsThemeProvider } from "@/components/features/credit-card/CreditCardsThemeProvider";
import { CreditCardComparisonSnackbar } from "@/components/features/credit-cards";

// Import custom hooks
import {
  useCreditCardsUrlInit,
  useCreditCardsUrlSync,
  useItemsPerPageFromUrl,
} from "@/hooks/features/credit-card/use-credit-cards-url-sync";

export default function CreditCardsPage() {
  const locale = useLocale();
  const urlItemsPerPage = useItemsPerPageFromUrl();
  const [itemsPerPage, setItemsPerPage] = useState(urlItemsPerPage);
  const { mobileFiltersOpen, setMobileFiltersOpen } = useCreditCardsPageState();

  // Get store methods and state
  const {
    cards,
    filteredCards,
    filters,
    searchQuery,
    sortBy,
    currentPage,
    viewMode,
    activeFiltersCount,
    setFilters,
    setSearchQuery,
    setSortBy,
    setCurrentPage,
    setViewMode,
    addToComparison,
    removeFromComparison,
    comparisonCards,
    clearFilters,
  } = useCreditCardsStoreLegacy();

  // Get available issuers from the cards
  const availableIssuers = React.useMemo(() => {
    const uniqueIssuers = new Set(cards.map((card) => card.issuer));
    return Array.from(uniqueIssuers).sort();
  }, [cards]);

  // Initialize state from URL parameters
  useCreditCardsUrlInit({
    setFilters,
    setSortBy,
    setCurrentPage,
    setSearchQuery,
  });

  // Synchronize state with URL parameters
  useCreditCardsUrlSync({
    filters,
    searchQuery,
    sortBy,
    currentPage,
    itemsPerPage,
  });

  // Calculate pagination
  const totalPages = Math.ceil(filteredCards.length / itemsPerPage);
  const paginatedCards = filteredCards.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  // Event handlers
  const handleCompareToggle = (cardId: string) => {
    if (comparisonCards.some((card) => card.id === cardId)) {
      removeFromComparison(cardId);
    } else if (comparisonCards.length < 3) {
      addToComparison(cardId);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1); // Reset to first page on search
  };

  const handleFiltersChange = (newFilters: Partial<CreditCardFilters>) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page on filter change
  };

  const handleSortChange = (sortValue: SortOption) => {
    setSortBy(sortValue);
    setCurrentPage(1); // Reset to first page on sort change
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Reset to first page
  };

  // Handle viewMode change with type compatibility
  const handleViewModeChange = (mode: "grid" | "list" | "compact") => {
    // Convert 'compact' to 'grid' if needed since store only supports grid/list
    const supportedMode = mode === "compact" ? "grid" : mode;
    setViewMode(supportedMode);
  };

  // Configuration - use theme-aware navbar config
  const creditCardsNavbarConfig = useCreditCardsNavbarTheme();

  return (
    <CreditCardsThemeProvider>
      <div className="flex flex-col min-h-screen bg-background">
        <Header configOverride={creditCardsNavbarConfig} />

        <CreditCardsPageHero
          titleKey="creditCards"
          descriptionKey="creditCardsDescription"
          comparisonCards={comparisonCards}
          locale={locale}
        />

        <CreditCardsPageControls
          searchQuery={searchQuery}
          sortBy={sortBy}
          viewMode={viewMode}
          filters={filters}
          onSearch={handleSearch}
          onSortChange={handleSortChange}
          onFiltersChange={handleFiltersChange}
          onClearFilters={clearFilters}
          onViewModeChange={handleViewModeChange}
          isLoading={false}
          totalProducts={cards.length}
          filteredProductsCount={filteredCards.length}
          activeFiltersCount={activeFiltersCount}
          mobileFiltersOpen={mobileFiltersOpen}
          onMobileFiltersChange={setMobileFiltersOpen}
        />

        <main className="flex-grow">
          <div className="container mx-auto px-4 py-6">
            <div className="flex gap-6">
              {/* Sidebar - Desktop */}
              <div className="hidden lg:block w-80 flex-shrink-0">
                <div className="sticky top-6">
                  <CreditCardFilterPanel
                    filters={filters}
                    onFiltersChange={handleFiltersChange}
                    onClearFilters={clearFilters}
                    availableOptions={{
                      issuers: availableIssuers,
                    }}
                  />
                </div>
              </div>

              {/* Main content */}
              <div className="flex-1">
                {/* Results */}
                <CreditCardsPageResults
                  filteredCards={filteredCards}
                  paginatedCards={paginatedCards}
                  searchQuery={searchQuery}
                  viewMode={viewMode}
                  currentPage={currentPage}
                  totalPages={totalPages}
                  itemsPerPage={itemsPerPage}
                  comparisonCards={comparisonCards}
                  locale={locale}
                  onClearFilters={clearFilters}
                  onPageChange={handlePageChange}
                  onItemsPerPageChange={handleItemsPerPageChange}
                  onCompareToggle={handleCompareToggle}
                />
              </div>
            </div>
          </div>
        </main>

        <Footer company="finzone" />

        {/* Comparison Snackbar */}
        <CreditCardComparisonSnackbar />
      </div>
    </CreditCardsThemeProvider>
  );
}
