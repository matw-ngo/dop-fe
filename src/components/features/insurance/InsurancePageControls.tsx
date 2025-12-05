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
import InsuranceSearchBar from "@/components/features/insurance/SearchBar";
import SortDropdown from "@/components/features/insurance/SortDropdown";
import InsuranceFilterPanel from "@/components/features/insurance/FilterPanel";
import type { InsuranceFilters } from "@/types/insurance";
import { useTheme } from "@/lib/theme/context";

interface InsurancePageControlsProps {
  searchQuery: string;
  onSearch: (query: string) => void;
  sortOption: any;
  onSortChange: (sort: any) => void;
  viewMode: "grid" | "list" | "compact";
  onViewModeChange: (mode: "grid" | "list" | "compact") => void;
  filters: InsuranceFilters;
  onFiltersChange: (filters: Partial<InsuranceFilters>) => void;
  onClearFilters: () => void;
  isLoading: boolean;
  totalProducts: number;
  filteredProductsCount: number;
  activeFiltersCount: number;
  mobileFiltersOpen: boolean;
  onMobileFiltersChange: (open: boolean) => void;
}

export default function InsurancePageControls({
  searchQuery,
  onSearch,
  sortOption,
  onSortChange,
  viewMode,
  onViewModeChange,
  filters,
  onFiltersChange,
  onClearFilters,
  isLoading,
  totalProducts,
  filteredProductsCount,
  activeFiltersCount,
  mobileFiltersOpen,
  onMobileFiltersChange,
}: InsurancePageControlsProps) {
  const t = useTranslations("pages.insurance");
  const { themeConfig } = useTheme();

  const isMedicalTheme = themeConfig?.id === "medical";

  return (
    <div
      className={`bg-card border-b sticky top-0 z-40 ${isMedicalTheme ? "shadow-sm" : ""}`}
    >
      <div className="container mx-auto px-4 py-4">
        {/* Search Bar */}
        <div className="mb-4">
          <InsuranceSearchBar
            value={searchQuery}
            onChange={onSearch}
            placeholder={t("searchPlaceholder")}
          />
        </div>

        {/* Controls Row */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          {/* Left: Results count and active filters */}
          <div className="flex items-center gap-4">
            <div className="text-sm text-muted-foreground">
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                t("showingResults", {
                  count: totalProducts,
                  total: filteredProductsCount,
                })
              )}
            </div>
            {activeFiltersCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClearFilters}
                className="text-sm text-primary hover:text-primary/90"
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
              onChange={onSortChange}
              variant="select"
              size="sm"
              className="w-full sm:w-auto min-w-[200px]"
            />

            {/* View Mode Toggle - Desktop Only */}
            <div
              className={`hidden sm:flex items-center gap-1 p-1 rounded-lg ${
                isMedicalTheme
                  ? "bg-primary/5 border border-primary/20"
                  : "bg-muted"
              }`}
            >
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="sm"
                onClick={() => onViewModeChange("grid")}
                className={`h-7 w-7 p-0 transition-colors ${
                  isMedicalTheme && viewMode !== "grid"
                    ? "hover:bg-primary/10 text-muted-foreground"
                    : ""
                }`}
              >
                <Grid className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="sm"
                onClick={() => onViewModeChange("list")}
                className={`h-7 w-7 p-0 transition-colors ${
                  isMedicalTheme && viewMode !== "list"
                    ? "hover:bg-primary/10 text-muted-foreground"
                    : ""
                }`}
              >
                <List className="w-4 h-4" />
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
                        onClick={onClearFilters}
                        className="text-sm"
                      >
                        {t("clearAll")}
                      </Button>
                    </SheetTitle>
                  </SheetHeader>
                  <div className="mt-6">
                    <InsuranceFilterPanel
                      filters={filters}
                      onFiltersChange={onFiltersChange}
                      onClearFilters={onClearFilters}
                      isMobile={true}
                    />
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
