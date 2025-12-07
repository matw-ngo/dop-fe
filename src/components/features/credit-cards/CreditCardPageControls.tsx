import React from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { CreditCardFilterSidebar } from "./CreditCardFilterSidebar";
import { CreditCardSortDropdown } from "./CreditCardSortDropdown";
import { CreditCardSearchBar } from "./CreditCardSearchBar";
import { CreditCardFilters, SortOption } from "@/types/credit-card";
import { Grid3X3, List, LayoutGrid, SlidersHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

export type ViewMode = "grid" | "list" | "compact";

interface CreditCardPageControlsProps {
  filters: CreditCardFilters;
  onFiltersChange: (filters: Partial<CreditCardFilters>) => void;
  sortOption: SortOption;
  onSortChange: (value: SortOption) => void;
  totalResults: number;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  onMobileFiltersToggle?: () => void;
  className?: string;
}

export const CreditCardPageControls: React.FC<CreditCardPageControlsProps> = ({
  filters,
  onFiltersChange,
  sortOption,
  onSortChange,
  totalResults,
  viewMode,
  onViewModeChange,
  searchQuery = "",
  onSearchChange,
  onMobileFiltersToggle,
  className,
}) => {
  const t = useTranslations("features.credit-cards.listing");

  return (
    <div className={cn("space-y-4", className)}>
      {/* Top Row - Search and Mobile Filter Toggle */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* Search Bar - Full width on mobile, flex-grow on desktop */}
        <div className="w-full sm:flex-1 max-w-2xl">
          <CreditCardSearchBar
            value={searchQuery}
            onChange={onSearchChange}
            placeholder={t("search.placeholder")}
            className="w-full"
            showRecentSearches={true}
            showSuggestions={true}
          />
        </div>

        {/* Mobile Filter Toggle */}
        <Button
          variant="outline"
          size="sm"
          onClick={onMobileFiltersToggle}
          className="sm:hidden flex items-center gap-2"
        >
          <SlidersHorizontal className="h-4 w-4" />
          {t("filters.title")}
        </Button>
      </div>

      {/* Bottom Row - Results Count, View Mode, and Sort */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Results Count */}
        <div className="order-2 sm:order-1">
          <p className="text-sm text-muted-foreground">
            {totalResults > 0
              ? t("results.count", { count: totalResults })
              : t("results.noResults")}
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3 order-1 sm:order-2">
          {/* View Mode Toggle */}
          <div className="flex items-center border rounded-md p-1">
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="sm"
              onClick={() => onViewModeChange("grid")}
              className="h-8 w-8 p-0 rounded-sm"
              title={t("viewMode.grid")}
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="sm"
              onClick={() => onViewModeChange("list")}
              className="h-8 w-8 p-0 rounded-sm"
              title={t("viewMode.list")}
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "compact" ? "default" : "ghost"}
              size="sm"
              onClick={() => onViewModeChange("compact")}
              className="h-8 w-8 p-0 rounded-sm"
              title={t("viewMode.compact")}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
          </div>

          {/* Sort Dropdown */}
          <CreditCardSortDropdown
            value={sortOption}
            onChange={onSortChange}
            size="sm"
            className="w-full sm:w-48"
          />

          {/* Desktop Filters Button */}
          <div className="hidden sm:block">
            <CreditCardFilterSidebar
              filters={filters}
              onFiltersChange={onFiltersChange}
              trigger={
                <Button variant="outline" size="sm" className="gap-2">
                  <SlidersHorizontal className="h-4 w-4" />
                  {t("filters.title")}
                </Button>
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreditCardPageControls;
