/**
 * Controls component for the Credit Cards page
 * Contains search bar, sort dropdown, view mode toggle, and mobile filter trigger
 */

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import SearchBar from "@/components/features/credit-card/SearchBar";
import SortDropdown from "@/components/features/credit-card/SortDropdown";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Filter as FilterIcon, X, LayoutGrid, List } from "lucide-react";
import { useCreditCardsStore } from "@/store/use-credit-cards-store";
import FilterPanel from "@/components/features/credit-card/FilterPanel";
import type { CreditCardFilters, SortOption } from "@/types/credit-card";

interface CreditCardsPageControlsProps {
  searchQuery: string;
  sortBy: SortOption;
  viewMode: "grid" | "list";
  filters: CreditCardFilters;
  onSearch: (query: string) => void;
  onSortChange: (sortValue: SortOption) => void;
  onFiltersChange: (filters: Partial<CreditCardFilters>) => void;
  onClearFilters: () => void;
  onViewModeChange: (mode: "grid" | "list") => void;
}

export function CreditCardsPageControls({
  searchQuery,
  sortBy,
  viewMode,
  filters,
  onSearch,
  onSortChange,
  onFiltersChange,
  onClearFilters,
  onViewModeChange,
}: CreditCardsPageControlsProps) {
  const t = useTranslations("pages.creditCard");
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);

  return (
    <div className="mb-6 space-y-4">
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Search bar */}
        <div className="flex-1">
          <SearchBar
            value={searchQuery}
            onChange={onSearch}
            onSearch={onSearch}
            placeholder={t("searchCreditCards")}
          />
        </div>

        {/* Sort and view controls */}
        <div className="flex items-center space-x-2">
          <SortDropdown
            value={sortBy}
            onChange={onSortChange}
            variant="dropdown"
            size="sm"
          />
          <div className="hidden sm:flex items-center border rounded-md">
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="sm"
              onClick={() => onViewModeChange("grid")}
              className="rounded-r-none border-r"
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="sm"
              onClick={() => onViewModeChange("list")}
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
                <Badge variant="secondary" className="ml-2 px-2 py-0 text-xs">
                  {useCreditCardsStore.getState().activeFiltersCount}
                </Badge>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-80 overflow-y-auto">
            <FilterPanel
              filters={filters}
              onFiltersChange={onFiltersChange}
              onClearFilters={onClearFilters}
            />
          </SheetContent>
        </Sheet>

        {/* Active filters display for mobile */}
        {useCreditCardsStore.getState().activeFiltersCount > 0 && (
          <Button variant="ghost" size="sm" onClick={onClearFilters}>
            <X className="h-4 w-4 mr-1" />
            {t("clearFilters")}
          </Button>
        )}
      </div>
    </div>
  );
}
