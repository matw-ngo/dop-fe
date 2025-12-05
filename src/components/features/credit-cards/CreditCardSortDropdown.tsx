import React from "react";
import { useTranslations } from "next-intl";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Star,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  Award,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SortOption, SortOptionUI } from "@/types/credit-card";

export type CreditCardSortOption =
  | "featured"
  | "rating-desc"
  | "rating-asc"
  | "fee-asc"
  | "fee-desc"
  | "rate-asc"
  | "rate-desc"
  | "limit-asc"
  | "limit-desc"
  | "income-asc"
  | "income-desc"
  | "rewards-desc"
  | "bonus-desc"
  | "reviews-desc"
  | "newest"
  | "name-asc"
  | "name-desc";

interface CreditCardSortDropdownProps {
  value?: CreditCardSortOption;
  onChange?: (value: CreditCardSortOption) => void;
  variant?: "select" | "dropdown";
  size?: "sm" | "default" | "lg";
  className?: string;
  showDirectionIcon?: boolean;
  showLabels?: boolean;
}

// Enhanced sort options with icons and groupings
const SORT_OPTIONS: SortOptionUI[] = [
  // Editor's Choice
  {
    value: "featured",
    labelKey: "sort.featured",
    description: "Editor's choice and recommended cards",
    icon: Star,
  },
  {
    value: "rating-desc",
    labelKey: "sort.ratingDesc",
    description: "Highest rated cards first",
    icon: Award,
    direction: "desc",
  },

  // Financials
  {
    value: "fee-asc",
    labelKey: "sort.lowestAnnualFee",
    description: "Cards with lowest annual fees",
    icon: TrendingDown,
    direction: "asc",
  },
  {
    value: "rate-asc",
    labelKey: "sort.lowestInterestRate",
    description: "Cards with lowest interest rates",
    icon: TrendingDown,
    direction: "asc",
  },
  {
    value: "limit-desc",
    labelKey: "sort.highestCreditLimit",
    description: "Cards with highest credit limits",
    icon: TrendingUp,
    direction: "desc",
  },
  {
    value: "income-asc",
    labelKey: "sort.lowestIncomeRequirement",
    description: "Cards with lowest income requirements",
    icon: TrendingDown,
    direction: "asc",
  },

  // Rewards & Benefits
  {
    value: "rewards-desc",
    labelKey: "sort.highestRewardsRate",
    description: "Cards with best rewards programs",
    icon: TrendingUp,
    direction: "desc",
  },
  {
    value: "bonus-desc",
    labelKey: "sort.bestWelcomeBonus",
    description: "Cards with best welcome bonuses",
    icon: DollarSign,
    direction: "desc",
  },

  // Popularity
  {
    value: "reviews-desc",
    labelKey: "sort.mostReviews",
    description: "Most reviewed cards",
    icon: Star,
    direction: "desc",
  },
  {
    value: "newest",
    labelKey: "sort.newestCards",
    description: "Recently launched cards",
    icon: Calendar,
  },

  // Alphabetical
  {
    value: "name-asc",
    labelKey: "sort.nameAZ",
    description: "Alphabetical order A-Z",
    direction: "asc",
  },
  {
    value: "name-desc",
    labelKey: "sort.nameZA",
    description: "Alphabetical order Z-A",
    direction: "desc",
  },
];

// Group options by category
const SORT_GROUPS = [
  {
    label: "sortGroup.recommended",
    options: ["featured", "rating-desc", "reviews-desc"],
  },
  {
    label: "sortGroup.financials",
    options: ["fee-asc", "rate-asc", "limit-desc", "income-asc"],
  },
  {
    label: "sortGroup.rewards",
    options: ["rewards-desc", "bonus-desc"],
  },
  {
    label: "sortGroup.other",
    options: ["newest", "name-asc", "name-desc"],
  },
];

export const CreditCardSortDropdown: React.FC<CreditCardSortDropdownProps> = ({
  value,
  onChange,
  variant = "select",
  size = "default",
  className,
  showDirectionIcon = true,
  showLabels = true,
}) => {
  const t = useTranslations("creditCard");

  // Find the current sort option
  const currentSort = SORT_OPTIONS.find((option) => option.value === value);

  // Get sort direction icon
  const getDirectionIcon = (option: SortOptionUI) => {
    if (!showDirectionIcon) return null;

    switch (option.direction) {
      case "asc":
        return <ArrowUp className="h-3 w-3" />;
      case "desc":
        return <ArrowDown className="h-3 w-3" />;
      default:
        return null;
    }
  };

  // Get option icon
  const getOptionIcon = (option: SortOptionUI) => {
    if (!option.icon) return null;
    const Icon = option.icon;
    return <Icon className="h-4 w-4" />;
  };

  // Handle sort change
  const handleSortChange = (newValue: string) => {
    onChange?.(newValue as CreditCardSortOption);
  };

  // Size classes
  const sizeClasses = {
    sm: "h-9 text-sm",
    default: "h-10",
    lg: "h-12 text-base",
  };

  // Select variant
  if (variant === "select") {
    return (
      <Select value={value} onValueChange={handleSortChange}>
        <SelectTrigger className={cn("w-full", sizeClasses[size], className)}>
          <div className="flex items-center space-x-2">
            <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
            <SelectValue placeholder={t("sort.sortBy")} />
          </div>
        </SelectTrigger>
        <SelectContent>
          {SORT_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center space-x-2">
                  {getOptionIcon(option)}
                  <span>{t(option.labelKey)}</span>
                </div>
                {getDirectionIcon(option)}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }

  // Dropdown menu variant with groups
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size={size}
          className={cn("justify-between", className)}
        >
          <div className="flex items-center space-x-2">
            <ArrowUpDown className="h-4 w-4" />
            <span className="truncate">
              {showLabels && currentSort
                ? t(currentSort.labelKey)
                : t("sort.sortBy")}
            </span>
          </div>
          {currentSort && getDirectionIcon(currentSort)}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-72">
        <div className="px-2 py-1.5">
          <p className="text-sm font-medium text-muted-foreground">
            {t("sort.sortBy")}
          </p>
        </div>
        <DropdownMenuSeparator />

        {SORT_GROUPS.map((group, groupIndex) => (
          <React.Fragment key={group.label}>
            {groupIndex > 0 && <DropdownMenuSeparator />}
            <div className="px-2 py-1.5">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                {t(group.label)}
              </p>
            </div>
            {group.options.map((optionValue) => {
              const option = SORT_OPTIONS.find(
                (opt) => opt.value === optionValue,
              );
              if (!option) return null;

              return (
                <DropdownMenuItem
                  key={option.value}
                  onClick={() => handleSortChange(option.value)}
                  className={cn(
                    "flex items-center justify-between cursor-pointer py-2",
                    value === option.value && "bg-accent",
                  )}
                >
                  <div className="flex items-center space-x-2 flex-1 min-w-0">
                    {getOptionIcon(option)}
                    <span className="truncate">{t(option.labelKey)}</span>
                  </div>
                  {getDirectionIcon(option)}
                </DropdownMenuItem>
              );
            })}
          </React.Fragment>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default CreditCardSortDropdown;
