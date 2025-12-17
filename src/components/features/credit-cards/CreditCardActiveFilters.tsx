import { X } from "lucide-react";
import { useTranslations } from "next-intl";
import type React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CARD_CATEGORIES,
  CARD_NETWORKS,
  CREDIT_LIMIT_TIERS,
  REWARDS_TYPES,
} from "@/constants/credit-cards";
import { cn } from "@/lib/utils";
import type { CreditCardFilters } from "@/types/credit-card";

interface CreditCardActiveFiltersProps {
  filters: CreditCardFilters;
  onClearFilter: (filterType: string, value?: string) => void;
  onClearAll: () => void;
  className?: string;
}

export const CreditCardActiveFilters: React.FC<
  CreditCardActiveFiltersProps
> = ({ filters, onClearFilter, onClearAll, className }) => {
  const t = useTranslations("features.credit-cards.listing");

  const hasActiveFilters =
    filters.categories.length > 0 ||
    filters.networks.length > 0 ||
    filters.rewardsTypes.length > 0 ||
    filters.provinces.length > 0 ||
    filters.employmentTypes.length > 0 ||
    filters.digitalFeatures.length > 0 ||
    filters.annualFeeRange.min > 0 ||
    filters.annualFeeRange.max < 10000000 ||
    filters.ageRange.min > 18 ||
    filters.ageRange.max < 80 ||
    filters.incomeRange.min > 0 ||
    filters.incomeRange.max < 100000000 ||
    filters.creditLimitRange.min > 0 ||
    filters.creditLimitRange.max < 2000000000 ||
    filters.minRating > 0 ||
    filters.hasWelcomeOffer ||
    filters.hasAnnualFeeWaiver ||
    filters.hasInstallmentPlans ||
    filters.hasInsurance ||
    filters.isNew ||
    filters.isRecommended ||
    filters.isExclusive;

  if (!hasActiveFilters) {
    return null;
  }

  const getFilterLabel = (type: string, value: string) => {
    switch (type) {
      case "categories":
        return CARD_CATEGORIES[value as keyof typeof CARD_CATEGORIES]?.name;
      case "networks":
        return CARD_NETWORKS[value as keyof typeof CARD_NETWORKS]?.name;
      case "rewardsTypes":
        return REWARDS_TYPES[value as keyof typeof REWARDS_TYPES]?.name;
      case "creditLimitRange": {
        const tier = CREDIT_LIMIT_TIERS.find(
          (t) =>
            t.value.min === filters.creditLimitRange.min &&
            t.value.max === filters.creditLimitRange.max,
        );
        return tier?.label;
      }
      default:
        return value;
    }
  };

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      <span className="text-sm text-muted-foreground mr-2">
        {t("activeFilters")}:
      </span>

      {/* Categories */}
      {filters.categories.map((category) => (
        <Badge
          key={`category-${category}`}
          variant="secondary"
          className="cursor-pointer"
          onClick={() => onClearFilter("categories", category)}
        >
          {getFilterLabel("categories", category)}
          <X className="w-3 h-3 ml-1" />
        </Badge>
      ))}

      {/* Networks */}
      {filters.networks.map((network) => (
        <Badge
          key={`network-${network}`}
          variant="secondary"
          className="cursor-pointer"
          onClick={() => onClearFilter("networks", network)}
        >
          {getFilterLabel("networks", network)}
          <X className="w-3 h-3 ml-1" />
        </Badge>
      ))}

      {/* Rewards Types */}
      {filters.rewardsTypes.map((rewardType) => (
        <Badge
          key={`reward-${rewardType}`}
          variant="secondary"
          className="cursor-pointer"
          onClick={() => onClearFilter("rewardsTypes", rewardType)}
        >
          {getFilterLabel("rewardsTypes", rewardType)}
          <X className="w-3 h-3 ml-1" />
        </Badge>
      ))}

      {/* Credit Limit */}
      {(filters.creditLimitRange.min > 0 ||
        filters.creditLimitRange.max < 2000000000) && (
        <Badge
          variant="secondary"
          className="cursor-pointer"
          onClick={() => onClearFilter("creditLimitRange")}
        >
          {getFilterLabel("creditLimitRange", "")}
          <X className="w-3 h-3 ml-1" />
        </Badge>
      )}

      {/* Annual Fee */}
      {(filters.annualFeeRange.min > 0 ||
        filters.annualFeeRange.max < 10000000) && (
        <Badge
          variant="secondary"
          className="cursor-pointer"
          onClick={() => onClearFilter("annualFeeRange")}
        >
          {t("annualFee")}: {filters.annualFeeRange.min.toLocaleString()}đ -{" "}
          {filters.annualFeeRange.max.toLocaleString()}đ
          <X className="w-3 h-3 ml-1" />
        </Badge>
      )}

      {/* Income Range */}
      {(filters.incomeRange.min > 0 || filters.incomeRange.max < 100000000) && (
        <Badge
          variant="secondary"
          className="cursor-pointer"
          onClick={() => onClearFilter("incomeRange")}
        >
          {t("income")}: {filters.incomeRange.min.toLocaleString()}đ -{" "}
          {filters.incomeRange.max.toLocaleString()}đ
          <X className="w-3 h-3 ml-1" />
        </Badge>
      )}

      {/* Boolean Filters */}
      {filters.hasWelcomeOffer && (
        <Badge
          variant="secondary"
          className="cursor-pointer"
          onClick={() => onClearFilter("hasWelcomeOffer")}
        >
          {t("hasWelcomeOffer")}
          <X className="w-3 h-3 ml-1" />
        </Badge>
      )}

      {filters.hasAnnualFeeWaiver && (
        <Badge
          variant="secondary"
          className="cursor-pointer"
          onClick={() => onClearFilter("hasAnnualFeeWaiver")}
        >
          {t("hasFeeWaiver")}
          <X className="w-3 h-3 ml-1" />
        </Badge>
      )}

      {filters.isNew && (
        <Badge
          variant="secondary"
          className="cursor-pointer"
          onClick={() => onClearFilter("isNew")}
        >
          {t("new")}
          <X className="w-3 h-3 ml-1" />
        </Badge>
      )}

      {filters.isRecommended && (
        <Badge
          variant="secondary"
          className="cursor-pointer"
          onClick={() => onClearFilter("isRecommended")}
        >
          {t("recommended")}
          <X className="w-3 h-3 ml-1" />
        </Badge>
      )}

      <Button
        variant="ghost"
        size="sm"
        onClick={onClearAll}
        className="h-7 text-xs"
      >
        {t("clearAll")}
      </Button>
    </div>
  );
};

export default CreditCardActiveFilters;
