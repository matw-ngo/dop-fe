"use client";

import React, { useState } from "react";
import { useLocale } from "next-intl";
import { useCreditCardsStore } from "@/store/use-credit-cards-store";
import type { CreditCardFilters, SortOption } from "@/types/credit-card";

// Import refactored components
import { CreditCardsPageHeader } from "@/components/features/credit-card/CreditCardsPageHeader";
import { CreditCardsPageControls } from "@/components/features/credit-card/CreditCardsPageControls";
import { CreditCardsPageResults } from "@/components/features/credit-card/CreditCardsPageResults";
import FilterPanel from "@/components/features/credit-card/FilterPanel";

// Import custom hooks
import {
  useCreditCardsUrlInit,
  useCreditCardsUrlSync,
  useItemsPerPageFromUrl,
} from "@/hooks/use-credit-cards-url-sync";

export default function CreditCardsPage() {
  const locale = useLocale();
  const urlItemsPerPage = useItemsPerPageFromUrl();
  const [itemsPerPage, setItemsPerPage] = useState(urlItemsPerPage);

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

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <CreditCardsPageHeader
        comparisonCards={comparisonCards}
        locale={locale}
      />

      <div className="container mx-auto px-4 py-6">
        {/* Search and controls */}
        <CreditCardsPageControls
          searchQuery={searchQuery}
          sortBy={sortBy}
          viewMode={viewMode}
          filters={filters}
          onSearch={handleSearch}
          onSortChange={handleSortChange}
          onFiltersChange={handleFiltersChange}
          onClearFilters={clearFilters}
          onViewModeChange={setViewMode}
        />

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
    </div>
  );
}
