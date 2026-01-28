"use client";

import {
  ChevronDown,
  ChevronUp,
  CreditCard as CreditCardIcon,
  DollarSign,
  Filter,
  Gift,
  RotateCcw,
  Shield,
  Smartphone,
  Star,
  Tag,
  TrendingUp,
  Users,
} from "lucide-react";
import { useTranslations } from "next-intl";
import type React from "react";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Slider } from "@/components/ui/slider";
import {
  CARD_CATEGORIES,
  CARD_NETWORKS,
  CREDIT_LIMIT_TIERS,
  REWARDS_TYPES,
} from "@/constants/credit-cards";
import { cn } from "@/lib/utils";
import type {
  CardCategory,
  CardNetwork,
  CreditCardFilters,
} from "@/types/credit-card";

interface FilterPanelProps {
  filters: CreditCardFilters;
  onFiltersChange: (filters: Partial<CreditCardFilters>) => void;
  onClearFilters: () => void;
  className?: string;
}

interface FilterSectionProps {
  title: string;
  icon?: React.ReactNode;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

const FilterSection: React.FC<FilterSectionProps> = ({
  title,
  icon,
  defaultOpen = true,
  children,
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

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
};

const FilterPanel: React.FC<FilterPanelProps> = ({
  filters,
  onFiltersChange,
  onClearFilters,
  className,
}) => {
  const t = useTranslations("features.credit-cards.listing");

  // Calculate active filters count
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.categories.length > 0) count++;
    if (filters.networks.length > 0) count++;
    if (filters.annualFeeRange.min > 0 || filters.annualFeeRange.max < 10000000)
      count++;
    if (filters.ageRange.min > 18 || filters.ageRange.max < 80) count++;
    if (filters.incomeRange.min > 0 || filters.incomeRange.max < 100000000)
      count++;
    if (
      filters.creditLimitRange.min > 0 ||
      filters.creditLimitRange.max < 2000000000
    )
      count++;
    if (filters.provinces.length > 0) count++;
    if (filters.employmentTypes.length > 0) count++;
    if (filters.rewardsTypes.length > 0) count++;
    if (filters.digitalFeatures.length > 0) count++;
    if (filters.minRating > 0) count++;
    if (filters.hasWelcomeOffer) count++;
    if (filters.hasAnnualFeeWaiver) count++;
    if (filters.hasInstallmentPlans) count++;
    if (filters.hasInsurance) count++;
    if (filters.isNew) count++;
    if (filters.isRecommended) count++;
    if (filters.isExclusive) count++;
    return count;
  }, [filters]);

  // Handle checkbox group changes
  const handleCheckboxGroupChange = (
    field: keyof CreditCardFilters,
    value: string,
    checked: boolean,
  ) => {
    const currentValues = filters[field] as string[];
    if (checked) {
      onFiltersChange({
        [field]: [...currentValues, value],
      });
    } else {
      onFiltersChange({
        [field]: currentValues.filter((v) => v !== value),
      });
    }
  };

  // Handle range slider changes
  const handleRangeChange = (
    field: keyof CreditCardFilters,
    value: number[],
    subField?: "min" | "max",
  ) => {
    if (subField) {
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
  };

  // Handle boolean filter changes
  const handleBooleanChange = (
    field: keyof CreditCardFilters,
    checked: boolean,
  ) => {
    onFiltersChange({
      [field]: checked,
    });
  };

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

      <div className="p-4 space-y-4">
        {/* Card Categories */}
        <FilterSection
          title={t("cardCategory")}
          icon={<CreditCardIcon className="h-4 w-4" />}
        >
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(CARD_CATEGORIES).map(([key, category]) => {
              const categoryKey = key as CardCategory;
              return (
                <div key={key} className="flex items-center space-x-2">
                  <Checkbox
                    id={`category-${key}`}
                    checked={filters.categories.includes(categoryKey)}
                    onCheckedChange={(checked) =>
                      handleCheckboxGroupChange(
                        "categories",
                        categoryKey,
                        checked as boolean,
                      )
                    }
                  />
                  <label
                    htmlFor={`category-${key}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    {category.name}
                  </label>
                </div>
              );
            })}
          </div>
        </FilterSection>

        {/* Card Networks */}
        <FilterSection
          title={t("cardNetwork")}
          icon={<Tag className="h-4 w-4" />}
        >
          <div className="flex flex-wrap gap-2">
            {Object.entries(CARD_NETWORKS).map(([key, network]) => {
              const networkKey = key as CardNetwork;
              return (
                <Badge
                  key={key}
                  variant={
                    filters.networks.includes(networkKey)
                      ? "default"
                      : "outline"
                  }
                  className="cursor-pointer"
                  onClick={() =>
                    handleCheckboxGroupChange(
                      "networks",
                      networkKey,
                      !filters.networks.includes(networkKey),
                    )
                  }
                >
                  {network.name}
                </Badge>
              );
            })}
          </div>
        </FilterSection>

        {/* Annual Fee */}
        <FilterSection
          title={t("annualFee")}
          icon={<DollarSign className="h-4 w-4" />}
        >
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="free-cards"
                checked={filters.annualFeeRange.max === 0}
                onCheckedChange={(checked) =>
                  handleRangeChange(
                    "annualFeeRange",
                    checked ? [0, 0] : [0, 10000000],
                    "max",
                  )
                }
              />
              <label
                htmlFor="free-cards"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                {t("freeAnnualFeeOnly")}
              </label>
            </div>
            <div className="px-4">
              <Slider
                value={[filters.annualFeeRange.min, filters.annualFeeRange.max]}
                onValueChange={(value) =>
                  handleRangeChange("annualFeeRange", value)
                }
                max={10000000}
                step={100000}
                min={0}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-2">
                <span>{t("free")}</span>
                <span>10.000.000đ</span>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="fee-waiver"
                checked={filters.hasAnnualFeeWaiver}
                onCheckedChange={(checked) =>
                  handleBooleanChange("hasAnnualFeeWaiver", checked as boolean)
                }
              />
              <label
                htmlFor="fee-waiver"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                {t("hasFeeWaiver")}
              </label>
            </div>
          </div>
        </FilterSection>

        {/* Credit Limit */}
        <FilterSection
          title={t("creditLimit")}
          icon={<TrendingUp className="h-4 w-4" />}
        >
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-2">
              {CREDIT_LIMIT_TIERS.map((tier, index) => (
                <div
                  key={`credit-limit-${index}`}
                  className="flex items-center space-x-2"
                >
                  <Checkbox
                    id={`limit-${index}`}
                    checked={
                      filters.creditLimitRange.min === tier.value.min &&
                      filters.creditLimitRange.max === tier.value.max
                    }
                    onCheckedChange={(checked) => {
                      if (checked) {
                        onFiltersChange({
                          creditLimitRange: tier.value,
                        });
                      }
                    }}
                  />
                  <label
                    htmlFor={`limit-${index}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    {tier.label}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </FilterSection>

        {/* Income Requirement */}
        <FilterSection
          title={t("incomeRequired")}
          icon={<Users className="h-4 w-4" />}
        >
          <div className="space-y-4">
            <Slider
              value={[filters.incomeRange.min, filters.incomeRange.max]}
              onValueChange={(value) => handleRangeChange("incomeRange", value)}
              max={100000000}
              step={1000000}
              min={0}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>0đ</span>
              <span>100.000.000đ/tháng</span>
            </div>
          </div>
        </FilterSection>

        {/* Rewards Types */}
        <FilterSection
          title={t("rewardsTypes")}
          icon={<Gift className="h-4 w-4" />}
        >
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(REWARDS_TYPES).map(([key, reward]) => (
              <div key={key} className="flex items-center space-x-2">
                <Checkbox
                  id={`reward-${key}`}
                  checked={filters.rewardsTypes.includes(key)}
                  onCheckedChange={(checked) =>
                    handleCheckboxGroupChange(
                      "rewardsTypes",
                      key,
                      checked as boolean,
                    )
                  }
                />
                <label
                  htmlFor={`reward-${key}`}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  {reward.name}
                </label>
              </div>
            ))}
          </div>
        </FilterSection>

        {/* Special Features */}
        <FilterSection
          title={t("specialFeatures")}
          icon={<Star className="h-4 w-4" />}
        >
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="welcome-offer"
                checked={filters.hasWelcomeOffer}
                onCheckedChange={(checked) =>
                  handleBooleanChange("hasWelcomeOffer", checked as boolean)
                }
              />
              <label
                htmlFor="welcome-offer"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                {t("hasWelcomeOffer")}
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="installment-plans"
                checked={filters.hasInstallmentPlans}
                onCheckedChange={(checked) =>
                  handleBooleanChange("hasInstallmentPlans", checked as boolean)
                }
              />
              <label
                htmlFor="installment-plans"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                {t("hasInstallmentPlans")}
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="insurance"
                checked={filters.hasInsurance}
                onCheckedChange={(checked) =>
                  handleBooleanChange("hasInsurance", checked as boolean)
                }
              />
              <label
                htmlFor="insurance"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                {t("hasInsurance")}
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="digital-banking"
                checked={filters.digitalFeatures.length > 0}
                onCheckedChange={(checked) => {
                  if (checked) {
                    onFiltersChange({
                      digitalFeatures: [
                        "mobileBanking",
                        "onlineBanking",
                        "contactless",
                      ],
                    });
                  } else {
                    onFiltersChange({
                      digitalFeatures: [],
                    });
                  }
                }}
              />
              <label
                htmlFor="digital-banking"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                <div className="flex items-center space-x-1">
                  <Smartphone className="h-3 w-3" />
                  <span>{t("digitalBanking")}</span>
                </div>
              </label>
            </div>
          </div>
        </FilterSection>

        {/* Quick Filters */}
        <FilterSection
          title={t("quickFilters")}
          icon={<Shield className="h-4 w-4" />}
        >
          <div className="flex flex-wrap gap-2">
            <Badge
              variant={filters.isNew ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => handleBooleanChange("isNew", !filters.isNew)}
            >
              {t("newCards")}
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
              {t("exclusive")}
            </Badge>
          </div>
        </FilterSection>
      </div>
    </div>
  );
};

export default FilterPanel;
