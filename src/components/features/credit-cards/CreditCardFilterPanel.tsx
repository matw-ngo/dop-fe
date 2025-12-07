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
  CreditCard,
  Building,
  Star,
  Percent,
  DollarSign,
  MapPin,
  Shield,
  Smartphone,
  Plane,
  Car,
  ShoppingBag,
  Utensils,
  Fuel,
  Music,
  Heart,
  Home,
  Users,
  HelpCircle,
  Clock,
  CheckCircle,
  Wallet,
  PiggyBank,
  Award,
  Globe,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  CreditCardFilters,
  CardCategory,
  CardNetwork,
} from "@/types/credit-card";
import {
  DEFAULT_FILTERS,
  CARD_CATEGORIES,
  CARD_NETWORKS,
  REWARDS_TYPES,
  ANNUAL_FEE_RANGES,
  INTEREST_RATE_RANGES,
  CREDIT_LIMIT_TIERS,
  INCOME_REQUIREMENT_RANGES,
  PROVINCE_GROUPS,
  ALL_PROVINCES,
  EMPLOYMENT_TYPES,
} from "@/constants/credit-cards";

interface FilterPanelProps {
  filters: CreditCardFilters;
  onFiltersChange: (filters: Partial<CreditCardFilters>) => void;
  onClearFilters: () => void;
  availableOptions?: {
    issuers?: string[];
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

const CreditCardFilterPanel: React.FC<FilterPanelProps> = React.memo(
  ({
    filters,
    onFiltersChange,
    onClearFilters,
    availableOptions,
    className,
    isMobile = false,
  }) => {
    const t = useTranslations("features.credit-cards.listing");

    // Calculate active filters count
    const activeFiltersCount = useMemo(() => {
      let count = 0;
      if (filters.categories.length > 0) count++;
      if (filters.networks.length > 0) count++;
      if (filters.issuers.length > 0) count++;
      if (filters.rewardsTypes.length > 0) count++;
      if (filters.digitalFeatures.length > 0) count++;
      if (filters.annualFeeType.length > 0) count++;
      if (filters.employmentTypes.length > 0) count++;
      if (filters.provinces.length > 0) count++;
      if (filters.ageRange.min > 18 || filters.ageRange.max < 80) count++;
      if (
        filters.annualFeeRange.min > 0 ||
        filters.annualFeeRange.max < 10000000
      )
        count++;
      if (
        filters.creditLimitRange.min > 0 ||
        filters.creditLimitRange.max < 2000000000
      )
        count++;
      if (filters.incomeRange.min > 0 || filters.incomeRange.max < 100000000)
        count++;
      if (filters.hasWelcomeOffer) count++;
      if (filters.hasAnnualFeeWaiver) count++;
      if (filters.hasInstallmentPlans) count++;
      if (filters.hasInsurance) count++;
      if (filters.isNew) count++;
      if (filters.isRecommended) count++;
      if (filters.isExclusive) count++;
      if (filters.minRating > 0) count++;
      return count;
    }, [filters]);

    // Handle checkbox group changes
    const handleCheckboxGroupChange = useCallback(
      (field: keyof CreditCardFilters, value: string, checked: boolean) => {
        const getArrayValues = (
          filterField: keyof CreditCardFilters,
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
      },
      [filters, onFiltersChange],
    );

    // Handle boolean filter changes
    const handleBooleanChange = useCallback(
      (field: keyof CreditCardFilters, checked: boolean) => {
        onFiltersChange({
          [field]: checked,
        });
      },
      [onFiltersChange],
    );

    // Get category icon
    const getCategoryIcon = useCallback((category: string) => {
      switch (category) {
        case "personal":
          return <CreditCard className="h-4 w-4" />;
        case "business":
          return <Building className="h-4 w-4" />;
        case "premium":
          return <Star className="h-4 w-4" />;
        case "student":
          return <Award className="h-4 w-4" />;
        case "cashback":
          return <DollarSign className="h-4 w-4" />;
        case "travel":
          return <Plane className="h-4 w-4" />;
        case "shopping":
          return <ShoppingBag className="h-4 w-4" />;
        case "fuel":
          return <Fuel className="h-4 w-4" />;
        case "dining":
          return <Utensils className="h-4 w-4" />;
        case "entertainment":
          return <Music className="h-4 w-4" />;
        default:
          return <CreditCard className="h-4 w-4" />;
      }
    }, []);

    // Filter sections content
    const filterSections = useMemo(
      () => [
        // Card Categories
        {
          id: "categories",
          title: t("cardType"),
          icon: <CreditCard className="h-4 w-4" />,
          content: (
            <div className="grid grid-cols-1 gap-2">
              {Object.entries(CARD_CATEGORIES).map(([key, category]) => (
                <div key={key} className="flex items-center space-x-2">
                  <Checkbox
                    id={`category-${key}`}
                    checked={filters.categories.includes(key as CardCategory)}
                    onCheckedChange={(checked) =>
                      handleCheckboxGroupChange(
                        "categories",
                        key as CardCategory,
                        checked as boolean,
                      )
                    }
                  />
                  <label
                    htmlFor={`category-${key}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    <div className="flex items-center space-x-2">
                      {getCategoryIcon(key)}
                      <span>{category.name}</span>
                    </div>
                  </label>
                </div>
              ))}
            </div>
          ),
        },

        // Card Networks
        {
          id: "networks",
          title: t("cardNetwork"),
          icon: <CreditCard className="h-4 w-4" />,
          content: (
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(CARD_NETWORKS).map(([key, network]) => (
                <div key={key} className="flex items-center space-x-2">
                  <Checkbox
                    id={`network-${key}`}
                    checked={filters.networks.includes(key as CardNetwork)}
                    onCheckedChange={(checked) =>
                      handleCheckboxGroupChange(
                        "networks",
                        key as CardNetwork,
                        checked as boolean,
                      )
                    }
                  />
                  <label
                    htmlFor={`network-${key}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    {network.name}
                  </label>
                </div>
              ))}
            </div>
          ),
        },

        // Issuers
        {
          id: "issuers",
          title: t("issuer"),
          icon: <Building className="h-4 w-4" />,
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
              {t("loadingIssuers")}
            </div>
          ),
        },

        // Annual Fee
        {
          id: "annualFee",
          title: t("annualFee"),
          icon: <DollarSign className="h-4 w-4" />,
          content: (
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-2">
                {ANNUAL_FEE_RANGES.map((range, index) => (
                  <div
                    key={`fee-${index}`}
                    className="flex items-center space-x-2"
                  >
                    <Checkbox
                      id={`fee-${index}`}
                      checked={
                        filters.annualFeeRange.min === range.value.min &&
                        filters.annualFeeRange.max === range.value.max
                      }
                      onCheckedChange={(checked) => {
                        if (checked) {
                          onFiltersChange({
                            annualFeeRange: range.value,
                          });
                        }
                      }}
                    />
                    <label
                      htmlFor={`fee-${index}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      {range.label}
                    </label>
                  </div>
                ))}
              </div>
              <div className="px-4">
                <Slider
                  value={[
                    filters.annualFeeRange.min,
                    filters.annualFeeRange.max,
                  ]}
                  onValueChange={(value) =>
                    handleRangeChange("annualFeeRange", value)
                  }
                  max={10000000}
                  step={100000}
                  min={0}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-2">
                  <span>0đ</span>
                  <span>10.000.000đ/năm</span>
                </div>
              </div>
            </div>
          ),
        },

        // Interest Rates
        {
          id: "interestRates",
          title: t("interestRates"),
          icon: <Percent className="h-4 w-4" />,
          content: (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  {t("purchaseAPR")}
                </label>
                {INTEREST_RATE_RANGES.map((range, index) => (
                  <div
                    key={`apr-${index}`}
                    className="flex items-center space-x-2"
                  >
                    <Checkbox
                      id={`apr-${index}`}
                      name="purchaseAPR"
                      checked={
                        filters.annualFeeRange.min === range.value.min &&
                        filters.annualFeeRange.max === range.value.max
                      }
                      onCheckedChange={() => {
                        // TODO: Add interest rate filters to CreditCardFilters type
                      }}
                    />
                    <label
                      htmlFor={`apr-${index}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      {range.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          ),
        },

        // Credit Limit Tiers
        {
          id: "creditLimit",
          title: t("creditLimit"),
          icon: <Wallet className="h-4 w-4" />,
          content: (
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-2">
                {CREDIT_LIMIT_TIERS.map((tier, index) => (
                  <div
                    key={`limit-${index}`}
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
              <div className="px-4">
                <Slider
                  value={[
                    filters.creditLimitRange.min,
                    filters.creditLimitRange.max,
                  ]}
                  onValueChange={(value) =>
                    handleRangeChange("creditLimitRange", value)
                  }
                  max={2000000000}
                  step={10000000}
                  min={0}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-2">
                  <span>0đ</span>
                  <span>2.000.000.000đ</span>
                </div>
              </div>
            </div>
          ),
        },

        // Income Requirements
        {
          id: "income",
          title: t("incomeRequirement"),
          icon: <PiggyBank className="h-4 w-4" />,
          content: (
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-2">
                {INCOME_REQUIREMENT_RANGES.map((range, index) => (
                  <div
                    key={`income-${index}`}
                    className="flex items-center space-x-2"
                  >
                    <Checkbox
                      id={`income-${index}`}
                      checked={
                        filters.incomeRange.min === range.value.min &&
                        filters.incomeRange.max === range.value.max
                      }
                      onCheckedChange={(checked) => {
                        if (checked) {
                          onFiltersChange({
                            incomeRange: range.value,
                          });
                        }
                      }}
                    />
                    <label
                      htmlFor={`income-${index}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      {range.label}
                    </label>
                  </div>
                ))}
              </div>
              <div className="px-4">
                <Slider
                  value={[filters.incomeRange.min, filters.incomeRange.max]}
                  onValueChange={(value) =>
                    handleRangeChange("incomeRange", value)
                  }
                  max={100000000}
                  step={1000000}
                  min={0}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-2">
                  <span>0đ</span>
                  <span>100.000.000đ/tháng</span>
                </div>
              </div>
            </div>
          ),
        },

        // Reward Programs
        {
          id: "rewards",
          title: t("rewardsProgram"),
          icon: <Award className="h-4 w-4" />,
          content: (
            <div className="grid grid-cols-1 gap-2">
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
          ),
        },

        // Digital Features
        {
          id: "digital",
          title: t("digitalFeatures"),
          icon: <Smartphone className="h-4 w-4" />,
          content: (
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="mobile-payments"
                  checked={filters.digitalFeatures.includes("mobile_payments")}
                  onCheckedChange={(checked) =>
                    handleCheckboxGroupChange(
                      "digitalFeatures",
                      "mobile_payments",
                      checked as boolean,
                    )
                  }
                />
                <label
                  htmlFor="mobile-payments"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  <div className="flex items-center space-x-1">
                    <Smartphone className="h-3 w-3" />
                    <span>{t("mobilePayments")}</span>
                  </div>
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="nfc"
                  checked={filters.digitalFeatures.includes("nfc")}
                  onCheckedChange={(checked) =>
                    handleCheckboxGroupChange(
                      "digitalFeatures",
                      "nfc",
                      checked as boolean,
                    )
                  }
                />
                <label
                  htmlFor="nfc"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  <div className="flex items-center space-x-1">
                    <Smartphone className="h-3 w-3" />
                    <span>{t("nfcPayments")}</span>
                  </div>
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="virtual-cards"
                  checked={filters.digitalFeatures.includes("virtual_cards")}
                  onCheckedChange={(checked) =>
                    handleCheckboxGroupChange(
                      "digitalFeatures",
                      "virtual_cards",
                      checked as boolean,
                    )
                  }
                />
                <label
                  htmlFor="virtual-cards"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  <div className="flex items-center space-x-1">
                    <CreditCard className="h-3 w-3" />
                    <span>{t("virtualCards")}</span>
                  </div>
                </label>
              </div>
            </div>
          ),
        },

        // Insurance Benefits
        {
          id: "insurance",
          title: t("insuranceBenefits"),
          icon: <Shield className="h-4 w-4" />,
          content: (
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="travel-insurance"
                  checked={filters.hasInsurance}
                  onCheckedChange={(checked) =>
                    handleBooleanChange("hasInsurance", checked as boolean)
                  }
                />
                <label
                  htmlFor="travel-insurance"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  <div className="flex items-center space-x-1">
                    <Plane className="h-3 w-3" />
                    <span>{t("travelInsurance")}</span>
                  </div>
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="purchase-protection"
                  checked={filters.digitalFeatures.includes(
                    "purchase_protection",
                  )}
                  onCheckedChange={(checked) =>
                    handleCheckboxGroupChange(
                      "digitalFeatures",
                      "purchase_protection",
                      checked as boolean,
                    )
                  }
                />
                <label
                  htmlFor="purchase-protection"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  <div className="flex items-center space-x-1">
                    <ShoppingBag className="h-3 w-3" />
                    <span>{t("purchaseProtection")}</span>
                  </div>
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="medical-insurance"
                  checked={filters.digitalFeatures.includes(
                    "medical_insurance",
                  )}
                  onCheckedChange={(checked) =>
                    handleCheckboxGroupChange(
                      "digitalFeatures",
                      "medical_insurance",
                      checked as boolean,
                    )
                  }
                />
                <label
                  htmlFor="medical-insurance"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  <div className="flex items-center space-x-1">
                    <Heart className="h-3 w-3" />
                    <span>{t("medicalInsurance")}</span>
                  </div>
                </label>
              </div>
            </div>
          ),
        },

        // Employment Types
        {
          id: "employment",
          title: t("employmentType"),
          icon: <Users className="h-4 w-4" />,
          content: (
            <div className="grid grid-cols-1 gap-2">
              {Object.entries(EMPLOYMENT_TYPES).map(([key, type]) => (
                <div key={key} className="flex items-center space-x-2">
                  <Checkbox
                    id={`employment-${key}`}
                    checked={filters.employmentTypes.includes(
                      key as
                        | "full_time"
                        | "part_time"
                        | "business_owner"
                        | "freelancer"
                        | "retired",
                    )}
                    onCheckedChange={(checked) =>
                      handleCheckboxGroupChange(
                        "employmentTypes",
                        key as
                          | "full_time"
                          | "part_time"
                          | "business_owner"
                          | "freelancer"
                          | "retired",
                        checked as boolean,
                      )
                    }
                  />
                  <label
                    htmlFor={`employment-${key}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    {type.label}
                  </label>
                </div>
              ))}
            </div>
          ),
        },

        // Provinces
        {
          id: "provinces",
          title: t("location"),
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
                            provinces: group.provinces as string[],
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
            </div>
          ),
        },

        // Special Filters
        {
          id: "special",
          title: t("quickFilters"),
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
                {t("exclusive")}
              </Badge>
              <Badge
                variant={filters.hasWelcomeOffer ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() =>
                  handleBooleanChange(
                    "hasWelcomeOffer",
                    !filters.hasWelcomeOffer,
                  )
                }
              >
                {t("hasWelcomeOffer")}
              </Badge>
              <Badge
                variant={filters.hasAnnualFeeWaiver ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() =>
                  handleBooleanChange(
                    "hasAnnualFeeWaiver",
                    !filters.hasAnnualFeeWaiver,
                  )
                }
              >
                {t("hasFeeWaiver")}
              </Badge>
              <Badge
                variant={filters.hasInstallmentPlans ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() =>
                  handleBooleanChange(
                    "hasInstallmentPlans",
                    !filters.hasInstallmentPlans,
                  )
                }
              >
                {t("hasInstallments")}
              </Badge>
            </div>
          ),
        },
      ],
      [
        t,
        filters,
        availableOptions?.issuers,
        handleCheckboxGroupChange,
        handleRangeChange,
        handleBooleanChange,
        getCategoryIcon,
        onFiltersChange,
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
              defaultValue={["categories", "networks"]}
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
            <h3 className="font-semibold">{t("filters.title")}</h3>
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
                defaultOpen={["categories", "networks", "annualFee"].includes(
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

CreditCardFilterPanel.displayName = "CreditCardFilterPanel";

export default CreditCardFilterPanel;
