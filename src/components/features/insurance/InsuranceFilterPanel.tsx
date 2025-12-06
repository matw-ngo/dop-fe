"use client";

import React, { useState, useMemo, useCallback } from "react";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Filter,
  DollarSign,
  Car,
  Heart,
  Shield,
  Plane,
  Home,
  Users,
  MapPin,
  Star,
  Phone,
  Globe,
  HeadphonesIcon,
  HelpCircle,
  Clock,
  CheckCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  InsuranceFilters,
  InsuranceCategory,
  InsuranceType,
  VehicleType,
  FeeType,
  CoveragePeriod,
} from "@/types/insurance";
import {
  DEFAULT_FILTERS,
  INSURANCE_CATEGORIES,
  INSURANCE_TYPES,
  VEHICLE_TYPES,
  FEE_TYPES,
  COVERAGE_PERIODS,
  PERSONAL_ACCIDENT_COVERAGE_RANGES,
  PROPERTY_DAMAGE_COVERAGE_RANGES,
  MEDICAL_EXPENSES_COVERAGE_RANGES,
  PREMIUM_RANGES,
  ALL_PROVINCES,
  PROVINCE_GROUPS,
} from "@/constants/insurance";

interface FilterPanelProps {
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
}

interface FilterSectionProps {
  title: string;
  icon?: React.ReactNode;
  defaultOpen?: boolean;
  children: React.ReactNode;
  isCollapsible?: boolean;
}

const FilterSection: React.FC<FilterSectionProps> = React.memo(
  ({ title, icon, defaultOpen = true, children, isCollapsible = true }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    if (isCollapsible) {
      return (
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <CollapsibleTrigger asChild>
            <CardHeader className="pb-3 cursor-pointer hover:bg-muted/50 transition-colors">
              <CardTitle className="text-sm font-medium flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {icon}
                  <span>{title}</span>
                </div>
                {isOpen ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </CardTitle>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="pt-0">{children}</CardContent>
          </CollapsibleContent>
        </Collapsible>
      );
    }

    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center space-x-2">
            {icon}
            <span>{title}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">{children}</CardContent>
      </Card>
    );
  },
);

FilterSection.displayName = "FilterSection";

const InsuranceFilterPanel: React.FC<FilterPanelProps> = React.memo(
  ({
    filters,
    onFiltersChange,
    onClearFilters,
    availableOptions,
    className,
    isMobile = false,
  }) => {
    const t = useTranslations("pages.insurance");

    // Calculate active filters count
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

    // Handle checkbox group changes
    const handleCheckboxGroupChange = useCallback(
      (field: keyof InsuranceFilters, value: string, checked: boolean) => {
        const getArrayValues = (
          filterField: keyof InsuranceFilters,
        ): string[] => {
          const fieldValue = filters[filterField];
          if (Array.isArray(fieldValue)) {
            return fieldValue as string[];
          }
          return [];
        };

        const currentValues = getArrayValues(field);
        if (checked) {
          onFiltersChange({
            [field]: [...currentValues, value],
          });
        } else {
          onFiltersChange({
            [field]: currentValues.filter((v) => v !== value),
          });
        }
      },
      [filters, onFiltersChange],
    );

    // Handle range slider changes
    const handleRangeChange = useCallback(
      (
        field: keyof InsuranceFilters,
        value: number[],
        subField?: "min" | "max",
        nestedField?: string,
      ) => {
        if (nestedField) {
          // Type guard for nested field operations
          const filterValue = filters[field];
          if (
            filterValue &&
            typeof filterValue === "object" &&
            !Array.isArray(filterValue)
          ) {
            const nestedObj = filterValue as Record<string, any>;
            const currentRange = nestedObj[nestedField] as {
              min: number;
              max: number;
            };

            if (subField) {
              onFiltersChange({
                [field]: {
                  ...nestedObj,
                  [nestedField]: {
                    ...currentRange,
                    [subField]: value[0],
                  },
                },
              });
            } else {
              onFiltersChange({
                [field]: {
                  ...nestedObj,
                  [nestedField]: {
                    min: value[0],
                    max: value[1],
                  },
                },
              });
            }
          }
        } else if (subField) {
          // Type guard for simple range operations
          const currentRange = filters[field] as { min: number; max: number };
          onFiltersChange({
            [field]: {
              ...currentRange,
              [subField]: value[0],
            },
          });
        } else {
          onFiltersChange({
            [field]: {
              min: value[0],
              max: value[1],
            },
          });
        }
      },
      [filters, onFiltersChange],
    );

    // Handle boolean filter changes
    const handleBooleanChange = useCallback(
      (field: keyof InsuranceFilters, checked: boolean) => {
        onFiltersChange({
          [field]: checked,
        });
      },
      [onFiltersChange],
    );

    // Get category icon
    const getCategoryIcon = useCallback((category: InsuranceCategory) => {
      switch (category) {
        case InsuranceCategory.VEHICLE:
          return <Car className="h-4 w-4" />;
        case InsuranceCategory.HEALTH:
          return <Heart className="h-4 w-4" />;
        case InsuranceCategory.LIFE:
          return <Shield className="h-4 w-4" />;
        case InsuranceCategory.TRAVEL:
          return <Plane className="h-4 w-4" />;
        case InsuranceCategory.PROPERTY:
          return <Home className="h-4 w-4" />;
        default:
          return <Shield className="h-4 w-4" />;
      }
    }, []);

    // Filter sections content
    const filterSections = useMemo(
      () => [
        // Insurance Categories
        {
          id: "categories",
          title: t("category"),
          icon: <Shield className="h-4 w-4" />,
          content: (
            <div className="grid grid-cols-1 gap-2">
              {Object.entries(INSURANCE_CATEGORIES).map(([key, category]) => (
                <div key={key} className="flex items-center space-x-2">
                  <Checkbox
                    id={`category-${key}`}
                    checked={filters.categories.includes(
                      key as InsuranceCategory,
                    )}
                    onCheckedChange={(checked) =>
                      handleCheckboxGroupChange(
                        "categories",
                        key,
                        checked as boolean,
                      )
                    }
                  />
                  <label
                    htmlFor={`category-${key}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    <div className="flex items-center space-x-2">
                      {getCategoryIcon(key as InsuranceCategory)}
                      <span>{category.name}</span>
                    </div>
                  </label>
                </div>
              ))}
            </div>
          ),
        },

        // Insurance Types
        {
          id: "types",
          title: t("type"),
          icon: <HelpCircle className="h-4 w-4" />,
          content: (
            <RadioGroup
              value={filters.types[0] || ""}
              onValueChange={(value) =>
                onFiltersChange({
                  types: value ? [value as InsuranceType] : [],
                })
              }
            >
              {Object.entries(INSURANCE_TYPES).map(([key, type]) => (
                <div key={key} className="flex items-center space-x-2">
                  <RadioGroupItem value={key} id={`type-${key}`} />
                  <Label
                    htmlFor={`type-${key}`}
                    className="text-sm font-medium"
                  >
                    {type.name}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          ),
        },

        // Issuers
        {
          id: "issuers",
          title: "Nhà cung cấp",
          icon: <Users className="h-4 w-4" />,
          content: availableOptions?.issuers ? (
            <div className="grid grid-cols-2 gap-2">
              {availableOptions.issuers.map((issuer) => (
                <div key={issuer} className="flex items-center space-x-2">
                  <Checkbox
                    id={`issuer-${issuer}`}
                    checked={filters.issuers.includes(issuer)}
                    onCheckedChange={(checked) =>
                      handleCheckboxGroupChange(
                        "issuers",
                        issuer,
                        checked as boolean,
                      )
                    }
                  />
                  <label
                    htmlFor={`issuer-${issuer}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    {issuer}
                  </label>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">
              Đang tải nhà cung cấp...
            </div>
          ),
        },

        // Premium Range
        {
          id: "premium",
          title: t("premium"),
          icon: <DollarSign className="h-4 w-4" />,
          content: (
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-2">
                {PREMIUM_RANGES.map((range, index) => (
                  <div
                    key={`premium-${index}`}
                    className="flex items-center space-x-2"
                  >
                    <Checkbox
                      id={`premium-${index}`}
                      checked={
                        filters.premiumRange.min === range.value.min &&
                        filters.premiumRange.max === range.value.max
                      }
                      onCheckedChange={(checked) => {
                        if (checked) {
                          onFiltersChange({
                            premiumRange: range.value,
                          });
                        }
                      }}
                    />
                    <label
                      htmlFor={`premium-${index}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      {range.label}
                    </label>
                  </div>
                ))}
              </div>
              <div className="px-4">
                <Slider
                  value={[filters.premiumRange.min, filters.premiumRange.max]}
                  onValueChange={(value) =>
                    handleRangeChange("premiumRange", value)
                  }
                  max={50000000}
                  step={1000000}
                  min={0}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-2">
                  <span>0đ</span>
                  <span>50.000.000đ/năm</span>
                </div>
              </div>
            </div>
          ),
        },

        // Coverage Ranges
        {
          id: "coverage",
          title: "Mức bảo hiểm",
          icon: <Shield className="h-4 w-4" />,
          content: (
            <Accordion
              type="multiple"
              className="w-full"
              defaultValue={["personal-accident"]}
            >
              {/* Personal Accident Coverage */}
              <AccordionItem value="personal-accident">
                <AccordionTrigger className="text-sm font-medium py-2">
                  Tai nạn cá nhân
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2">
                    {PERSONAL_ACCIDENT_COVERAGE_RANGES.map((range, index) => (
                      <div
                        key={`pa-${index}`}
                        className="flex items-center space-x-2"
                      >
                        <Checkbox
                          id={`pa-${index}`}
                          checked={
                            filters.coverageRange.personalAccident.min ===
                              range.value.min &&
                            filters.coverageRange.personalAccident.max ===
                              range.value.max
                          }
                          onCheckedChange={(checked) => {
                            if (checked) {
                              handleRangeChange(
                                "coverageRange",
                                [range.value.min, range.value.max],
                                undefined,
                                "personalAccident",
                              );
                            }
                          }}
                        />
                        <label
                          htmlFor={`pa-${index}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                        >
                          {range.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* Property Damage Coverage */}
              <AccordionItem value="property-damage">
                <AccordionTrigger className="text-sm font-medium py-2">
                  Thiệt hại tài sản
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2">
                    {PROPERTY_DAMAGE_COVERAGE_RANGES.map((range, index) => (
                      <div
                        key={`pd-${index}`}
                        className="flex items-center space-x-2"
                      >
                        <Checkbox
                          id={`pd-${index}`}
                          checked={
                            filters.coverageRange.propertyDamage.min ===
                              range.value.min &&
                            filters.coverageRange.propertyDamage.max ===
                              range.value.max
                          }
                          onCheckedChange={(checked) => {
                            if (checked) {
                              handleRangeChange(
                                "coverageRange",
                                [range.value.min, range.value.max],
                                undefined,
                                "propertyDamage",
                              );
                            }
                          }}
                        />
                        <label
                          htmlFor={`pd-${index}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                        >
                          {range.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* Medical Expenses Coverage */}
              <AccordionItem value="medical-expenses">
                <AccordionTrigger className="text-sm font-medium py-2">
                  Chi phí y tế
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2">
                    {MEDICAL_EXPENSES_COVERAGE_RANGES.map((range, index) => (
                      <div
                        key={`me-${index}`}
                        className="flex items-center space-x-2"
                      >
                        <Checkbox
                          id={`me-${index}`}
                          checked={
                            filters.coverageRange.medicalExpenses.min ===
                              range.value.min &&
                            filters.coverageRange.medicalExpenses.max ===
                              range.value.max
                          }
                          onCheckedChange={(checked) => {
                            if (checked) {
                              handleRangeChange(
                                "coverageRange",
                                [range.value.min, range.value.max],
                                undefined,
                                "medicalExpenses",
                              );
                            }
                          }}
                        />
                        <label
                          htmlFor={`me-${index}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                        >
                          {range.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          ),
        },

        // Vehicle Types (for vehicle insurance)
        {
          id: "vehicle-types",
          title: "Loại xe",
          icon: <Car className="h-4 w-4" />,
          content: availableOptions?.vehicleTypes ? (
            <div className="grid grid-cols-2 gap-2">
              {availableOptions.vehicleTypes.map((type) => (
                <div key={type} className="flex items-center space-x-2">
                  <Checkbox
                    id={`vehicle-${type}`}
                    checked={filters.specificCoverages.includes(type)}
                    onCheckedChange={(checked) =>
                      handleCheckboxGroupChange(
                        "specificCoverages",
                        type,
                        checked as boolean,
                      )
                    }
                  />
                  <label
                    htmlFor={`vehicle-${type}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    {VEHICLE_TYPES[type]?.name || type}
                  </label>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">
              Vui lòng chọn loại bảo hiểm xe cơ giới
            </div>
          ),
        },

        // Provinces
        {
          id: "provinces",
          title: "Khu vực",
          icon: <MapPin className="h-4 w-4" />,
          content: (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(PROVINCE_GROUPS).map(([key, group]) => (
                  <div key={key} className="flex items-center space-x-2">
                    <Checkbox
                      id={`province-group-${key}`}
                      checked={
                        key === "all"
                          ? filters.provinces.length === 0
                          : filters.provinces.length ===
                              group.provinces.length &&
                            group.provinces.every((p) =>
                              filters.provinces.includes(p),
                            )
                      }
                      onCheckedChange={(checked) => {
                        if (key === "all") {
                          onFiltersChange({ provinces: [] });
                        } else if (checked) {
                          onFiltersChange({
                            provinces: [...group.provinces],
                          });
                        } else {
                          onFiltersChange({ provinces: [] });
                        }
                      }}
                    />
                    <label
                      htmlFor={`province-group-${key}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      {group.name}
                    </label>
                  </div>
                ))}
              </div>
              {!filters.nationalAvailability && (
                <div className="max-h-40 overflow-y-auto space-y-1">
                  {ALL_PROVINCES.map((province) => (
                    <div key={province} className="flex items-center space-x-2">
                      <Checkbox
                        id={`province-${province}`}
                        checked={filters.provinces.includes(province)}
                        onCheckedChange={(checked) =>
                          handleCheckboxGroupChange(
                            "provinces",
                            province,
                            checked as boolean,
                          )
                        }
                      />
                      <label
                        htmlFor={`province-${province}`}
                        className="text-xs font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        {province}
                      </label>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ),
        },

        // Features
        {
          id: "features",
          title: "Tính năng",
          icon: <Star className="h-4 w-4" />,
          content: (
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="roadside-assistance"
                  checked={filters.hasRoadsideAssistance}
                  onCheckedChange={(checked) =>
                    handleBooleanChange(
                      "hasRoadsideAssistance",
                      checked as boolean,
                    )
                  }
                />
                <label
                  htmlFor="roadside-assistance"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  <div className="flex items-center space-x-1">
                    <Car className="h-3 w-3" />
                    <span>Cứu hộ đường bộ 24/7</span>
                  </div>
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="worldwide-coverage"
                  checked={filters.hasWorldwideCoverage}
                  onCheckedChange={(checked) =>
                    handleBooleanChange(
                      "hasWorldwideCoverage",
                      checked as boolean,
                    )
                  }
                />
                <label
                  htmlFor="worldwide-coverage"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  <div className="flex items-center space-x-1">
                    <Globe className="h-3 w-3" />
                    <span>Bảo hiểm toàn cầu</span>
                  </div>
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="medical-hotline"
                  checked={filters.hasMedicalHotline}
                  onCheckedChange={(checked) =>
                    handleBooleanChange("hasMedicalHotline", checked as boolean)
                  }
                />
                <label
                  htmlFor="medical-hotline"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  <div className="flex items-center space-x-1">
                    <HeadphonesIcon className="h-3 w-3" />
                    <span>Tổng đài y tế 24/7</span>
                  </div>
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="legal-support"
                  checked={filters.hasLegalSupport}
                  onCheckedChange={(checked) =>
                    handleBooleanChange("hasLegalSupport", checked as boolean)
                  }
                />
                <label
                  htmlFor="legal-support"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  <div className="flex items-center space-x-1">
                    <HelpCircle className="h-3 w-3" />
                    <span>Hỗ trợ pháp lý</span>
                  </div>
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="auto-renewal"
                  checked={filters.hasAutoRenewal}
                  onCheckedChange={(checked) =>
                    handleBooleanChange("hasAutoRenewal", checked as boolean)
                  }
                />
                <label
                  htmlFor="auto-renewal"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  <div className="flex items-center space-x-1">
                    <Clock className="h-3 w-3" />
                    <span>Tự động gia hạn</span>
                  </div>
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="installments"
                  checked={filters.hasInstallments}
                  onCheckedChange={(checked) =>
                    handleBooleanChange("hasInstallments", checked as boolean)
                  }
                />
                <label
                  htmlFor="installments"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  <div className="flex items-center space-x-1">
                    <DollarSign className="h-3 w-3" />
                    <span>Trả góp</span>
                  </div>
                </label>
              </div>
            </div>
          ),
        },

        // Special Filters
        {
          id: "special",
          title: "Bộ lọc nhanh",
          icon: <Star className="h-4 w-4" />,
          content: (
            <div className="flex flex-wrap gap-2">
              <Badge
                variant={filters.isNew ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => handleBooleanChange("isNew", !filters.isNew)}
              >
                {t("new")}
              </Badge>
              <Badge
                variant={filters.isRecommended ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() =>
                  handleBooleanChange("isRecommended", !filters.isRecommended)
                }
              >
                {t("recommended")}
              </Badge>
              <Badge
                variant={filters.isExclusive ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() =>
                  handleBooleanChange("isExclusive", !filters.isExclusive)
                }
              >
                Độc quyền
              </Badge>
            </div>
          ),
        },
      ],
      [
        t,
        filters,
        availableOptions,
        handleCheckboxGroupChange,
        handleRangeChange,
        handleBooleanChange,
        getCategoryIcon,
        onFiltersChange,
        INSURANCE_CATEGORIES,
        INSURANCE_TYPES,
        PREMIUM_RANGES,
        PERSONAL_ACCIDENT_COVERAGE_RANGES,
        PROPERTY_DAMAGE_COVERAGE_RANGES,
        MEDICAL_EXPENSES_COVERAGE_RANGES,
        VEHICLE_TYPES,
        PROVINCE_GROUPS,
        ALL_PROVINCES,
      ],
    );

    // Mobile render with accordion
    if (isMobile) {
      return (
        <div className={cn("space-y-4", className)}>
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b bg-background sticky top-0 z-10">
            <div className="flex items-center space-x-2">
              <Filter className="h-5 w-5" />
              <h3 className="font-semibold">{t("filters")}</h3>
              {activeFiltersCount > 0 && (
                <Badge variant="secondary">{activeFiltersCount}</Badge>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearFilters}
              className="text-muted-foreground hover:text-foreground"
            >
              <RotateCcw className="h-4 w-4 mr-1" />
              {t("clearAll")}
            </Button>
          </div>

          {/* Filter Sections */}
          <div className="p-4 space-y-4">
            <Accordion
              type="multiple"
              className="w-full"
              defaultValue={["categories", "types"]}
            >
              {filterSections.map((section) => (
                <AccordionItem key={section.id} value={section.id}>
                  <AccordionTrigger className="hover:no-underline py-3">
                    <div className="flex items-center space-x-2">
                      {section.icon}
                      <span className="text-sm font-medium">
                        {section.title}
                      </span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pb-4">
                    {section.content}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>

            {/* Apply Button for Mobile */}
            <div className="pt-4 border-t sticky bottom-0 bg-background">
              <Button onClick={() => {}} className="w-full">
                {t("apply")}
              </Button>
            </div>
          </div>
        </div>
      );
    }

    // Desktop render with collapsible sections
    return (
      <div className={cn("space-y-4", className)}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <h3 className="font-semibold">{t("filters")}</h3>
            {activeFiltersCount > 0 && (
              <Badge variant="secondary">{activeFiltersCount}</Badge>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="text-muted-foreground hover:text-foreground"
          >
            <RotateCcw className="h-4 w-4 mr-1" />
            {t("clearAll")}
          </Button>
        </div>

        {/* Filter Sections */}
        <div className="p-4 space-y-4">
          {filterSections.map((section) => (
            <Card key={section.id}>
              <FilterSection
                title={section.title}
                icon={section.icon}
                defaultOpen={["categories", "types", "premium"].includes(
                  section.id,
                )}
              >
                {section.content}
              </FilterSection>
            </Card>
          ))}
        </div>
      </div>
    );
  },
);

InsuranceFilterPanel.displayName = "InsuranceFilterPanel";

export default InsuranceFilterPanel;
