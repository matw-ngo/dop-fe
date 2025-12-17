/**
 * Results component for the Credit Cards page
 * Contains results header, card grid, and pagination
 */

import { Filter as FilterIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import React from "react";
import CreditCardGrid from "@/components/features/credit-card/CreditCardGrid";
import Pagination from "@/components/features/credit-card/Pagination";
import { Button } from "@/components/ui/button";
import type { CreditCard } from "@/types/credit-card";

interface CreditCardsPageResultsProps {
  filteredCards: CreditCard[];
  paginatedCards: CreditCard[];
  searchQuery: string;
  viewMode: "grid" | "list";
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
  comparisonCards: CreditCard[];
  locale: string;
  onClearFilters: () => void;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (itemsPerPage: number) => void;
  onCompareToggle: (cardId: string) => void;
}

export function CreditCardsPageResults({
  filteredCards,
  paginatedCards,
  searchQuery,
  viewMode,
  currentPage,
  totalPages,
  itemsPerPage,
  comparisonCards,
  locale,
  onClearFilters,
  onPageChange,
  onItemsPerPageChange,
  onCompareToggle,
}: CreditCardsPageResultsProps) {
  const t = useTranslations("features.credit-cards.listing");

  return (
    <div className="space-y-6">
      {/* Results header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">
            {t("results.count", { count: filteredCards.length })}
          </h2>
          {searchQuery && (
            <p className="text-sm text-muted-foreground">
              {t("searchResultsFor", { query: searchQuery })}
            </p>
          )}
        </div>

        {/* Items per page selector */}
        <div className="flex items-center space-x-2">
          <span className="text-sm text-muted-foreground">{t("show")}:</span>
          <select
            value={itemsPerPage}
            onChange={(e) => onItemsPerPageChange(parseInt(e.target.value))}
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
      {filteredCards.length === 0 ? (
        <div className="text-center py-12">
          <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
            <FilterIcon className="h-12 w-12 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">{t("noCardsFound")}</h3>
          <p className="text-muted-foreground mb-4">
            {t("tryAdjustingFilters")}
          </p>
          <Button onClick={onClearFilters} variant="outline">
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
            onCompare={onCompareToggle}
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
              onPageChange={onPageChange}
              onItemsPerPageChange={onItemsPerPageChange}
            />
          )}
        </>
      )}
    </div>
  );
}
