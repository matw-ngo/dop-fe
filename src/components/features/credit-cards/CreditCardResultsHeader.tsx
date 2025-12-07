import React from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Grid3X3,
  List,
  SlidersHorizontal,
  Home,
  ChevronRight,
} from "lucide-react";
import { CreditCardFilters } from "@/types/credit-card";
import CreditCardActiveFilters from "./CreditCardActiveFilters";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { cn } from "@/lib/utils";

export type ViewMode = "grid" | "list" | "compact";

interface CreditCardResultsHeaderProps {
  totalResults: number;
  currentPage: number;
  itemsPerPage: number;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  filters: CreditCardFilters;
  onClearFilter: (filterType: string, value?: string) => void;
  onClearAllFilters: () => void;
  onShowFilters: () => void;
  onItemsPerPageChange?: (itemsPerPage: number) => void;
  showBreadcrumb?: boolean;
  breadcrumbItems?: Array<{
    label: string;
    href?: string;
  }>;
  className?: string;
}

export const CreditCardResultsHeader: React.FC<
  CreditCardResultsHeaderProps
> = ({
  totalResults,
  currentPage,
  itemsPerPage,
  viewMode,
  onViewModeChange,
  filters,
  onClearFilter,
  onClearAllFilters,
  onShowFilters,
  onItemsPerPageChange,
  showBreadcrumb = true,
  breadcrumbItems,
  className,
}) => {
  const t = useTranslations("features.credit-cards.listing");

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalResults);

  // Default breadcrumb items
  const defaultBreadcrumbItems = [
    { label: t("breadcrumb.home"), href: "/" },
    { label: t("breadcrumb.creditCards") },
  ];

  const breadcrumbs = breadcrumbItems || defaultBreadcrumbItems;

  return (
    <div className={cn("space-y-4", className)}>
      {/* Breadcrumb Navigation */}
      {showBreadcrumb && (
        <Breadcrumb className="block">
          <BreadcrumbList>
            {breadcrumbs.map((item, index) => (
              <React.Fragment key={index}>
                <BreadcrumbItem>
                  {item.href ? (
                    <BreadcrumbLink
                      href={item.href}
                      className="flex items-center gap-1"
                    >
                      {index === 0 && <Home className="h-4 w-4" />}
                      {item.label}
                    </BreadcrumbLink>
                  ) : (
                    <BreadcrumbPage className="flex items-center gap-1">
                      {index === 0 && <Home className="h-4 w-4" />}
                      {item.label}
                    </BreadcrumbPage>
                  )}
                </BreadcrumbItem>
                {index < breadcrumbs.length - 1 && (
                  <BreadcrumbSeparator>
                    <ChevronRight className="h-4 w-4" />
                  </BreadcrumbSeparator>
                )}
              </React.Fragment>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
      )}

      {/* Active Filters */}
      <CreditCardActiveFilters
        filters={filters}
        onClearFilter={onClearFilter}
        onClearAll={onClearAllFilters}
        className="hidden"
      />

      {/* Results Header */}
      <div className="flex flex-col gap-4">
        {/* Results Title and Count */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold mb-1">
              {totalResults > 0
                ? t("results.title", { count: totalResults })
                : t("results.noResultsTitle")}
            </h1>
            <p className="text-sm text-muted-foreground">
              {totalResults > 0
                ? t("results.showing", {
                    start: startItem,
                    end: endItem,
                    total: totalResults,
                  })
                : t("results.noResultsDescription")}
            </p>
          </div>

          {/* Mobile Filter Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={onShowFilters}
            className="sm:hidden w-fit"
          >
            <SlidersHorizontal className="w-4 h-4 mr-2" />
            {t("filters.title")}
          </Button>
        </div>

        {/* Controls Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Filter Summary - Desktop */}
          <div className="hidden lg:block">
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">
                {t("results.filteredBy")}:
              </span>
              <CreditCardActiveFilters
                filters={filters}
                onClearFilter={onClearFilter}
                onClearAll={onClearAllFilters}
                className="inline-flex"
              />
            </div>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-3">
            {/* Items Per Page - Desktop */}
            <div className="hidden sm:block">
              <Select
                value={itemsPerPage.toString()}
                onValueChange={(value) => {
                  onItemsPerPageChange?.(parseInt(value));
                }}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="12">12 {t("results.perPage")}</SelectItem>
                  <SelectItem value="24">24 {t("results.perPage")}</SelectItem>
                  <SelectItem value="48">48 {t("results.perPage")}</SelectItem>
                  <SelectItem value="96">96 {t("results.perPage")}</SelectItem>
                </SelectContent>
              </Select>
            </div>

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
            </div>
          </div>
        </div>

        {/* Active Filters - Mobile */}
        <div className="lg:hidden">
          <CreditCardActiveFilters
            filters={filters}
            onClearFilter={onClearFilter}
            onClearAll={onClearAllFilters}
          />
        </div>
      </div>
    </div>
  );
};

export default CreditCardResultsHeader;
