"use client";

import React, { useMemo } from "react";
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
import { cn } from "@/lib/utils";
import { Filter, X, RotateCcw, SlidersHorizontal } from "lucide-react";
import { InsuranceFilters, VehicleType } from "@/types/insurance";
import InsuranceFilterPanel from "./InsuranceFilterPanel";

interface InsuranceFilterSidebarProps {
  filters: InsuranceFilters;
  onFiltersChange: (filters: Partial<InsuranceFilters>) => void;
  onClearFilters: () => void;
  availableOptions?: {
    issuers?: string[];
    vehicleTypes?: VehicleType[];
    features?: string[];
  };
  className?: string;
  isMobile?: boolean;
  isOpen?: boolean;
  onClose?: () => void;
}

/**
 * InsuranceFilterSidebar component that wraps the InsuranceFilterPanel for use in a sidebar layout.
 * Provides desktop sidebar styling and mobile drawer integration.
 */
const InsuranceFilterSidebar: React.FC<InsuranceFilterSidebarProps> = ({
  filters,
  onFiltersChange,
  onClearFilters,
  availableOptions,
  className,
  isMobile = false,
  isOpen = false,
  onClose,
}) => {
  const t = useTranslations("features.insurance.listing");

  // Calculate active filters count for badge
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.categories.length > 0) count++;
    if (filters.types.length > 0) count++;
    if (filters.issuers.length > 0) count++;
    if (filters.specificCoverages.length > 0) count++;
    if (filters.feeTypes.length > 0) count++;
    if (filters.coveragePeriods.length > 0) count++;
    if (filters.provinces.length > 0) count++;
    if (filters.ageRange.min > 18 || filters.ageRange.max < 80) count++;
    if (filters.premiumRange.min > 0 || filters.premiumRange.max < 50000000)
      count++;
    if (
      filters.coverageRange.personalAccident.min > 0 ||
      filters.coverageRange.personalAccident.max < 2000000000
    )
      count++;
    if (
      filters.coverageRange.propertyDamage.min > 0 ||
      filters.coverageRange.propertyDamage.max < 2000000000
    )
      count++;
    if (
      filters.coverageRange.medicalExpenses.min > 0 ||
      filters.coverageRange.medicalExpenses.max < 1000000000
    )
      count++;
    if (filters.hasRoadsideAssistance) count++;
    if (filters.hasWorldwideCoverage) count++;
    if (filters.hasMedicalHotline) count++;
    if (filters.hasLegalSupport) count++;
    if (filters.includePreExistingConditions) count++;
    if (filters.isNew) count++;
    if (filters.isRecommended) count++;
    if (filters.isExclusive) count++;
    if (filters.hasAutoRenewal) count++;
    if (filters.hasInstallments) count++;
    if (filters.minRating > 0) count++;
    return count;
  }, [filters]);

  // Mobile drawer render
  if (isMobile) {
    return (
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent
          side="left"
          className="w-full sm:w-80 p-0 overflow-y-auto"
          aria-describedby="filter-description"
        >
          <SheetHeader className="p-4 border-b sticky top-0 bg-background z-10">
            <div className="flex items-center justify-between">
              <SheetTitle className="flex items-center space-x-2 text-lg font-semibold">
                <SlidersHorizontal className="h-5 w-5" />
                <span>{t("filters")}</span>
                {activeFiltersCount > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {activeFiltersCount}
                  </Badge>
                )}
              </SheetTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-8 w-8 p-0"
                aria-label={t("close")}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <p
              id="filter-description"
              className="text-sm text-muted-foreground"
            >
              {t("filterDescription")}
            </p>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto">
            <InsuranceFilterPanel
              filters={filters}
              onFiltersChange={onFiltersChange}
              onClearFilters={onClearFilters}
              availableOptions={availableOptions}
              isMobile={true}
              className="border-0 shadow-none"
            />
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  // Desktop sidebar render
  return (
    <div
      className={cn(
        "w-80 h-full bg-background border-r border-border flex flex-col",
        className,
      )}
      role="complementary"
      aria-label={t("filterSidebar")}
    >
      {/* Sidebar Header */}
      <div className="p-4 border-b border-border bg-muted/30 sticky top-0 z-10">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <Filter className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">{t("filters")}</h2>
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {activeFiltersCount}
              </Badge>
            )}
          </div>
        </div>
        <p className="text-sm text-muted-foreground mb-3">
          {t("filterDescription")}
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={onClearFilters}
          className="w-full justify-start"
          disabled={activeFiltersCount === 0}
          aria-label={t("clearAllFilters")}
        >
          <RotateCcw className="h-4 w-4 mr-2" />
          {t("clearAll")}
        </Button>
      </div>

      {/* Filter Content */}
      <div className="flex-1 overflow-y-auto">
        <InsuranceFilterPanel
          filters={filters}
          onFiltersChange={onFiltersChange}
          onClearFilters={onClearFilters}
          availableOptions={availableOptions}
          isMobile={false}
          className="border-0 shadow-none rounded-none"
        />
      </div>

      {/* Footer with active filters summary */}
      {activeFiltersCount > 0 && (
        <div className="p-4 border-t border-border bg-muted/20">
          <div className="text-xs text-muted-foreground">
            {t("activeFiltersCount", { count: activeFiltersCount }) ||
              `Đang áp dụng ${activeFiltersCount} bộ lọc`}
          </div>
        </div>
      )}
    </div>
  );
};

InsuranceFilterSidebar.displayName = "InsuranceFilterSidebar";

export default InsuranceFilterSidebar;
