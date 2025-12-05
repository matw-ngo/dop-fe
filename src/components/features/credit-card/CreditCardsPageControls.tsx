import React from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Grid, List, Loader2, SlidersHorizontal, X } from "lucide-react";
import { useTheme } from "@/lib/theme/context";
import SearchBar from "@/components/features/credit-card/SearchBar";
import SortDropdown from "@/components/features/credit-card/SortDropdown";
import CreditCardFilterPanel from "@/components/features/credit-cards/CreditCardFilterPanel";
import { CreditCardActiveFilters } from "@/components/features/credit-cards/CreditCardActiveFilters";
import type { CreditCardFilters, SortOption } from "@/types/credit-card";

interface CreditCardsPageControlsProps {
  searchQuery: string;
  sortBy: SortOption;
  viewMode: "grid" | "list" | "compact";
  filters: CreditCardFilters;
  onSearch: (query: string) => void;
  onSortChange: (sortValue: SortOption) => void;
  onFiltersChange: (filters: Partial<CreditCardFilters>) => void;
  onClearFilters: () => void;
  onViewModeChange: (mode: "grid" | "list" | "compact") => void;
  isLoading: boolean;
  totalProducts: number;
  filteredProductsCount: number;
  activeFiltersCount: number;
  mobileFiltersOpen: boolean;
  onMobileFiltersChange: (open: boolean) => void;
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
  isLoading,
  totalProducts,
  filteredProductsCount,
  activeFiltersCount,
  mobileFiltersOpen,
  onMobileFiltersChange,
}: CreditCardsPageControlsProps) {
  const t = useTranslations("pages.creditCard");
  const { themeConfig } = useTheme();

  const isCorporateTheme = themeConfig?.id === "corporate";

  return (
    <div
      className={`bg-card border-b sticky top-0 z-40 ${isCorporateTheme ? "shadow-sm" : ""}`}
    >
      <div className="container mx-auto px-4 py-4">
        {/* Search Bar */}
        <div className="mb-4">
          <SearchBar
            value={searchQuery}
            onChange={onSearch}
            placeholder={t("searchCreditCards")}
          />
        </div>

        {/* Active Filters */}
        {activeFiltersCount > 0 && (
          <div className="mb-4">
            <CreditCardActiveFilters
              filters={filters}
              onClearFilter={(filterType, value) => {
                if (value) {
                  const currentValues = filters[
                    filterType as keyof CreditCardFilters
                  ] as string[];
                  onFiltersChange({
                    [filterType]: currentValues.filter((v) => v !== value),
                  });
                } else {
                  onClearFilters();
                }
              }}
              onClearAll={onClearFilters}
            />
          </div>
        )}

        {/* Controls Row */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          {/* Left: Results count */}
          <div className="text-sm text-muted-foreground">
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              t("showingResults", {
                count: filteredProductsCount,
                total: totalProducts,
              })
            )}
          </div>

          {/* Right: Sort, View Mode */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Sort Dropdown */}
            <SortDropdown
              value={sortBy}
              onChange={onSortChange}
              variant="select"
              size="sm"
              className="w-full sm:w-auto min-w-[200px]"
            />

            {/* View Mode Toggle - Desktop Only */}
            <div
              className={`hidden sm:flex items-center gap-1 p-1 rounded-lg ${
                isCorporateTheme
                  ? "bg-primary/5 border border-primary/20"
                  : "bg-muted"
              }`}
            >
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="sm"
                onClick={() => onViewModeChange("grid")}
                className={`h-7 w-7 p-0 transition-colors ${
                  isCorporateTheme && viewMode !== "grid"
                    ? "hover:bg-primary/10 text-muted-foreground"
                    : ""
                }`}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="sm"
                onClick={() => onViewModeChange("list")}
                className={`h-7 w-7 p-0 transition-colors ${
                  isCorporateTheme && viewMode !== "list"
                    ? "hover:bg-primary/10 text-muted-foreground"
                    : ""
                }`}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>

            {/* Mobile Filter Toggle */}
            <div className="lg:hidden">
              <Sheet
                open={mobileFiltersOpen}
                onOpenChange={onMobileFiltersChange}
              >
                <SheetTrigger asChild>
                  <Button variant="outline" className="flex items-center gap-2">
                    <SlidersHorizontal className="w-4 h-4" />
                    {t("filters.title")}
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
                      {t("filters.title")}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={onClearFilters}
                        className="text-sm"
                      >
                        {t("clearAll")}
                      </Button>
                    </SheetTitle>
                  </SheetHeader>
                  <CreditCardFilterPanel
                    filters={filters}
                    onFiltersChange={onFiltersChange}
                    onClearFilters={onClearFilters}
                    isMobile={true}
                  />
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
