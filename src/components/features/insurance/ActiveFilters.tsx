"use client";

import React, { useMemo, useCallback } from "react";
import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import {
  X,
  RotateCcw,
  Shield,
  Car,
  Heart,
  Plane,
  Home,
  HelpCircle,
  DollarSign,
  MapPin,
  Star,
  Globe,
  HeadphonesIcon,
  Clock,
  Users,
  Plus,
} from "lucide-react";
import {
  InsuranceFilters,
  InsuranceCategory,
  InsuranceType,
  FeeType,
  CoveragePeriod,
} from "@/types/insurance";
import {
  INSURANCE_CATEGORIES,
  INSURANCE_TYPES,
  PREMIUM_RANGES,
  PERSONAL_ACCIDENT_COVERAGE_RANGES,
  PROPERTY_DAMAGE_COVERAGE_RANGES,
  MEDICAL_EXPENSES_COVERAGE_RANGES,
  VEHICLE_TYPES,
  DEFAULT_FILTERS,
} from "@/constants/insurance";

interface ActiveFiltersProps {
  filters: InsuranceFilters;
  onFiltersChange: (filters: Partial<InsuranceFilters>) => void;
  onClearAll: () => void;
  maxDisplay?: number;
  className?: string;
}

// Define proper types for filter values
type FilterValue =
  | InsuranceCategory
  | InsuranceType
  | VehicleType
  | string
  | boolean
  | { min: number; max: number }
  | null;

interface FilterItem {
  key: string;
  label: string;
  value: FilterValue;
  onRemove: () => void;
}

interface FilterGroup {
  title: string;
  icon: React.ReactNode;
  filters: FilterItem[];
}

const InsuranceActiveFilters: React.FC<ActiveFiltersProps> = React.memo(
  ({
    filters,
    onFiltersChange,
    onClearAll,
    maxDisplay = 10,
    className,
  }) => {
    const t = useTranslations("pages.insurance");

    // Format currency values
    const formatCurrency = useCallback((value: number) => {
      if (value >= 1000000000) {
        return `${(value / 1000000000).toFixed(1)} tỷ`;
      }
      if (value >= 1000000) {
        return `${(value / 1000000).toFixed(0)} triệu`;
      }
      if (value >= 1000) {
        return `${(value / 1000).toFixed(0)} nghìn`;
      }
      return value.toLocaleString("vi-VN");
    }, []);

    // Format range label
    const formatRangeLabel = useCallback(
      (min: number, max: number, ranges: typeof PREMIUM_RANGES) => {
        const range = ranges.find(
          (r) => r.value.min === min && r.value.max === max
        );
        return range ? range.label : `${formatCurrency(min)} - ${formatCurrency(max)}`;
      },
      [formatCurrency]
    );

    // Get category icon
    const getCategoryIcon = useCallback((category: InsuranceCategory) => {
      switch (category) {
        case InsuranceCategory.VEHICLE:
          return <Car className="h-3 w-3" />;
        case InsuranceCategory.HEALTH:
          return <Heart className="h-3 w-3" />;
        case InsuranceCategory.LIFE:
          return <Shield className="h-3 w-3" />;
        case InsuranceCategory.TRAVEL:
          return <Plane className="h-3 w-3" />;
        case InsuranceCategory.PROPERTY:
          return <Home className="h-3 w-3" />;
        default:
          return <Shield className="h-3 w-3" />;
      }
    }, []);

    // Group filters by category
    const filterGroups = useMemo(() => {
      const groups: FilterGroup[] = [];

      // Categories
      if (filters.categories.length > 0) {
        groups.push({
          title: "Loại bảo hiểm",
          icon: <Shield className="h-4 w-4" />,
          filters: filters.categories.map((category) => ({
            key: `category-${category}`,
            label: INSURANCE_CATEGORIES[category]?.name || category,
            value: category,
            onRemove: () => {
              const newCategories = filters.categories.filter((c) => c !== category);
              onFiltersChange({ categories: newCategories });
            },
          })),
        });
      }

      // Types
      if (filters.types.length > 0) {
        groups.push({
          title: "Loại hình",
          icon: <HelpCircle className="h-4 w-4" />,
          filters: filters.types.map((type) => ({
            key: `type-${type}`,
            label: INSURANCE_TYPES[type]?.name || type,
            value: type,
            onRemove: () => {
              const newTypes = filters.types.filter((t) => t !== type);
              onFiltersChange({ types: newTypes });
            },
          })),
        });
      }

      // Issuers
      if (filters.issuers.length > 0) {
        groups.push({
          title: "Nhà cung cấp",
          icon: <Users className="h-4 w-4" />,
          filters: filters.issuers.map((issuer) => ({
            key: `issuer-${issuer}`,
            label: issuer,
            value: issuer,
            onRemove: () => {
              const newIssuers = filters.issuers.filter((i) => i !== issuer);
              onFiltersChange({ issuers: newIssuers });
            },
          })),
        });
      }

      // Premium Range
      if (
        filters.premiumRange.min !== DEFAULT_FILTERS.premiumRange.min ||
        filters.premiumRange.max !== DEFAULT_FILTERS.premiumRange.max
      ) {
        groups.push({
          title: "Phí bảo hiểm",
          icon: <DollarSign className="h-4 w-4" />,
          filters: [
            {
              key: "premium-range",
              label: formatRangeLabel(
                filters.premiumRange.min,
                filters.premiumRange.max,
                PREMIUM_RANGES
              ),
              value: filters.premiumRange,
              onRemove: () => {
                onFiltersChange({
                  premiumRange: DEFAULT_FILTERS.premiumRange,
                });
              },
            },
          ],
        });
      }

      // Coverage Ranges
      const coverageFilters = [];

      // Personal Accident Coverage
      if (
        filters.coverageRange.personalAccident.min !==
          DEFAULT_FILTERS.coverageRange.personalAccident.min ||
        filters.coverageRange.personalAccident.max !==
          DEFAULT_FILTERS.coverageRange.personalAccident.max
      ) {
        coverageFilters.push({
          key: "coverage-pa",
          label: `TN cá nhân: ${formatRangeLabel(
            filters.coverageRange.personalAccident.min,
            filters.coverageRange.personalAccident.max,
            PERSONAL_ACCIDENT_COVERAGE_RANGES
          )}`,
          value: filters.coverageRange.personalAccident,
          onRemove: () => {
            onFiltersChange({
              coverageRange: {
                ...filters.coverageRange,
                personalAccident: DEFAULT_FILTERS.coverageRange.personalAccident,
              },
            });
          },
        });
      }

      // Property Damage Coverage
      if (
        filters.coverageRange.propertyDamage.min !==
          DEFAULT_FILTERS.coverageRange.propertyDamage.min ||
        filters.coverageRange.propertyDamage.max !==
          DEFAULT_FILTERS.coverageRange.propertyDamage.max
      ) {
        coverageFilters.push({
          key: "coverage-pd",
          label: `Tài sản: ${formatRangeLabel(
            filters.coverageRange.propertyDamage.min,
            filters.coverageRange.propertyDamage.max,
            PROPERTY_DAMAGE_COVERAGE_RANGES
          )}`,
          value: filters.coverageRange.propertyDamage,
          onRemove: () => {
            onFiltersChange({
              coverageRange: {
                ...filters.coverageRange,
                propertyDamage: DEFAULT_FILTERS.coverageRange.propertyDamage,
              },
            });
          },
        });
      }

      // Medical Expenses Coverage
      if (
        filters.coverageRange.medicalExpenses.min !==
          DEFAULT_FILTERS.coverageRange.medicalExpenses.min ||
        filters.coverageRange.medicalExpenses.max !==
          DEFAULT_FILTERS.coverageRange.medicalExpenses.max
      ) {
        coverageFilters.push({
          key: "coverage-me",
          label: `Y tế: ${formatRangeLabel(
            filters.coverageRange.medicalExpenses.min,
            filters.coverageRange.medicalExpenses.max,
            MEDICAL_EXPENSES_COVERAGE_RANGES
          )}`,
          value: filters.coverageRange.medicalExpenses,
          onRemove: () => {
            onFiltersChange({
              coverageRange: {
                ...filters.coverageRange,
                medicalExpenses: DEFAULT_FILTERS.coverageRange.medicalExpenses,
              },
            });
          },
        });
      }

      if (coverageFilters.length > 0) {
        groups.push({
          title: "Mức bảo hiểm",
          icon: <Shield className="h-4 w-4" />,
          filters: coverageFilters,
        });
      }

      // Specific Coverages (Vehicle Types)
      if (filters.specificCoverages.length > 0) {
        groups.push({
          title: "Loại xe",
          icon: <Car className="h-4 w-4" />,
          filters: filters.specificCoverages.map((coverage) => ({
            key: `coverage-${coverage}`,
            label: VEHICLE_TYPES[coverage as VehicleType]?.name || coverage,
            value: coverage,
            onRemove: () => {
              const newCoverages = filters.specificCoverages.filter(
                (c) => c !== coverage
              );
              onFiltersChange({ specificCoverages: newCoverages });
            },
          })),
        });
      }

      // Provinces
      if (filters.provinces.length > 0 && !filters.nationalAvailability) {
        const provinceFilters = filters.provinces.slice(0, 3).map((province) => ({
          key: `province-${province}`,
          label: province,
          value: province,
          onRemove: () => {
            const newProvinces = filters.provinces.filter((p) => p !== province);
            onFiltersChange({ provinces: newProvinces });
          },
        }));

        if (filters.provinces.length > 3) {
          provinceFilters.push({
            key: "provinces-more",
            label: `+${filters.provinces.length - 3} tỉnh/thành khác`,
            value: null,
            onRemove: () => {
              onFiltersChange({ provinces: [] });
            },
          });
        }

        groups.push({
          title: "Khu vực",
          icon: <MapPin className="h-4 w-4" />,
          filters: provinceFilters,
        });
      }

      // Feature Flags
      const featureFilters = [];

      if (filters.hasRoadsideAssistance) {
        featureFilters.push({
          key: "feature-roadside",
          label: "Cứu hộ 24/7",
          value: true,
          onRemove: () => onFiltersChange({ hasRoadsideAssistance: false }),
        });
      }

      if (filters.hasWorldwideCoverage) {
        featureFilters.push({
          key: "feature-worldwide",
          label: "Bảo hiểm toàn cầu",
          value: true,
          onRemove: () => onFiltersChange({ hasWorldwideCoverage: false }),
        });
      }

      if (filters.hasMedicalHotline) {
        featureFilters.push({
          key: "feature-hotline",
          label: "Tổng đài y tế",
          value: true,
          onRemove: () => onFiltersChange({ hasMedicalHotline: false }),
        });
      }

      if (filters.hasLegalSupport) {
        featureFilters.push({
          key: "feature-legal",
          label: "Hỗ trợ pháp lý",
          value: true,
          onRemove: () => onFiltersChange({ hasLegalSupport: false }),
        });
      }

      if (filters.hasAutoRenewal) {
        featureFilters.push({
          key: "feature-autorenewal",
          label: "Tự động gia hạn",
          value: true,
          onRemove: () => onFiltersChange({ hasAutoRenewal: false }),
        });
      }

      if (filters.hasInstallments) {
        featureFilters.push({
          key: "feature-installments",
          label: "Trả góp",
          value: true,
          onRemove: () => onFiltersChange({ hasInstallments: false }),
        });
      }

      if (filters.isNew) {
        featureFilters.push({
          key: "feature-new",
          label: "Sản phẩm mới",
          value: true,
          onRemove: () => onFiltersChange({ isNew: false }),
        });
      }

      if (filters.isRecommended) {
        featureFilters.push({
          key: "feature-recommended",
          label: "Đề xuất",
          value: true,
          onRemove: () => onFiltersChange({ isRecommended: false }),
        });
      }

      if (filters.isExclusive) {
        featureFilters.push({
          key: "feature-exclusive",
          label: "Độc quyền",
          value: true,
          onRemove: () => onFiltersChange({ isExclusive: false }),
        });
      }

      if (featureFilters.length > 0) {
        groups.push({
          title: "Tính năng",
          icon: <Star className="h-4 w-4" />,
          filters: featureFilters,
        });
      }

      return groups;
    }, [filters, onFiltersChange, formatRangeLabel]);

    // Flatten all filters for counting
    const allFilters = useMemo(
      () => filterGroups.flatMap((group) => group.filters),
      [filterGroups]
    );

    // No active filters
    if (allFilters.length === 0) {
      return null;
    }

    // Calculate visible and hidden filters
    const visibleFilters = allFilters.slice(0, maxDisplay);
    const hiddenFilters = allFilters.slice(maxDisplay);
    const hasHiddenFilters = hiddenFilters.length > 0;

    return (
      <TooltipProvider>
        <Card className={cn("w-full", className)}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-2 flex-1 min-w-0">
                {/* Active filter pills */}
                {visibleFilters.map((filter) => (
                  <Badge
                    key={filter.key}
                    variant="secondary"
                    className="group relative inline-flex items-center gap-1 max-w-full hover:bg-destructive hover:text-destructive-foreground transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-destructive"
                    onClick={filter.onRemove}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        filter.onRemove();
                      }
                    }}
                    role="button"
                    tabIndex={0}
                    aria-label={`Xóa bộ lọc: ${filter.label}`}
                  >
                    <span className="truncate max-w-[150px]">{filter.label}</span>
                    <X className="h-3 w-3 flex-shrink-0" aria-hidden="true" />
                  </Badge>
                ))}

                {/* More indicator */}
                {hasHiddenFilters && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge
                        variant="outline"
                        className="cursor-pointer hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                        onClick={() => {
                          // Show all filters by temporarily increasing maxDisplay
                          // This could open a modal or expand the list in a real implementation
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            // Show all filters by temporarily increasing maxDisplay
                            // This could open a modal or expand the list in a real implementation
                          }
                        }}
                        role="button"
                        tabIndex={0}
                        aria-label={`Xem thêm ${hiddenFilters.length} bộ lọc`}
                      >
                        <Plus className="h-3 w-3 mr-1" aria-hidden="true" />
                        +{hiddenFilters.length}
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      <div className="space-y-1 max-w-xs">
                        <p className="font-medium mb-2">Bộ lọc bổ sung:</p>
                        {hiddenFilters.map((filter) => (
                          <div key={filter.key} className="text-sm">
                            {filter.label}
                          </div>
                        ))}
                      </div>
                    </TooltipContent>
                  </Tooltip>
                )}

                <Separator orientation="vertical" className="h-6" />

                {/* Clear all button */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClearAll}
                  className="h-7 px-2 text-muted-foreground hover:text-foreground focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                  aria-label="Xóa tất cả bộ lọc"
                >
                  <RotateCcw className="h-3 w-3 mr-1" aria-hidden="true" />
                  Xóa tất cả
                </Button>
              </div>
            </div>

            {/* Filter groups summary (optional - for desktop) */}
            {filterGroups.length > 1 && (
              <div className="mt-3 pt-3 border-t">
                <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                  {filterGroups.map((group) => (
                    <div key={group.title} className="flex items-center gap-1">
                      {group.icon}
                      <span className="font-medium">{group.title}:</span>
                      <span>{group.filters.length}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </TooltipProvider>
    );
  }
);

InsuranceActiveFilters.displayName = "InsuranceActiveFilters";

export default InsuranceActiveFilters;