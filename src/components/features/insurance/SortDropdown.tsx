"use client";

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
} from "@/components/ui/dropdown-menu";
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Star,
  TrendingUp,
  TrendingDown,
  Shield,
  Clock,
  Calendar,
  ArrowUpAZ,
  ArrowDownAZ,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SortOption } from "@/types/insurance";
import { SORT_OPTIONS } from "@/constants/insurance";

interface SortDropdownProps {
  value?: SortOption;
  onChange?: (value: SortOption) => void;
  variant?: "select" | "dropdown";
  size?: "sm" | "default" | "lg";
  className?: string;
  showDirectionIcon?: boolean;
}

const SortDropdown: React.FC<SortDropdownProps> = ({
  value,
  onChange,
  variant = "select",
  size = "default",
  className,
  showDirectionIcon = true,
}) => {
  const t = useTranslations("pages.insurance");

  // Find the current sort option
  const currentSort = SORT_OPTIONS.find((option) => option.value === value);

  // Get icon for sort option
  const getSortIcon = (optionValue: SortOption) => {
    switch (optionValue) {
      case SortOption.FEATURED:
        return <Star className="h-4 w-4" />;
      case SortOption.RATING_DESC:
      case SortOption.RATING_ASC:
        return <TrendingUp className="h-4 w-4" />;
      case SortOption.PREMIUM_ASC:
      case SortOption.PREMIUM_DESC:
        return <ArrowUpDown className="h-4 w-4" />;
      case SortOption.COVERAGE_ASC:
      case SortOption.COVERAGE_DESC:
        return <Shield className="h-4 w-4" />;
      case SortOption.CLAIMS_APPROVED_DESC:
        return <TrendingUp className="h-4 w-4" />;
      case SortOption.CLAIMS_TIME_ASC:
        return <Clock className="h-4 w-4" />;
      case SortOption.NEWEST:
        return <Calendar className="h-4 w-4" />;
      case SortOption.NAME_ASC:
        return <ArrowDownAZ className="h-4 w-4" />;
      case SortOption.NAME_DESC:
        return <ArrowUpAZ className="h-4 w-4" />;
      default:
        return <ArrowUpDown className="h-4 w-4" />;
    }
  };

  // Get sort direction icon
  const getDirectionIcon = (option: { direction?: "asc" | "desc" }) => {
    if (!showDirectionIcon || !option.direction) return null;

    switch (option.direction) {
      case "asc":
        return <ArrowUp className="h-3 w-3 text-muted-foreground" />;
      case "desc":
        return <ArrowDown className="h-3 w-3 text-muted-foreground" />;
      default:
        return null;
    }
  };

  // Handle sort change
  const handleSortChange = (newValue: string) => {
    onChange?.(newValue as SortOption);
  };

  // Select variant
  if (variant === "select") {
    return (
      <Select value={value} onValueChange={handleSortChange}>
        <SelectTrigger
          className={cn(
            "w-full",
            size === "sm" && "h-9",
            size === "lg" && "h-12",
            className,
          )}
        >
          <div className="flex items-center space-x-2">
            <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
            <SelectValue placeholder={t("sortBy")} />
          </div>
        </SelectTrigger>
        <SelectContent>
          {SORT_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center space-x-2">
                  {getSortIcon(option.value)}
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

  // Dropdown menu variant
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
            <span>{currentSort ? t(currentSort.labelKey) : t("sortBy")}</span>
          </div>
          {currentSort && getDirectionIcon(currentSort)}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64">
        <div className="px-2 py-1.5">
          <p className="text-sm font-medium text-muted-foreground">
            {t("sortBy")}
          </p>
        </div>
        {SORT_OPTIONS.map((option) => (
          <DropdownMenuItem
            key={option.value}
            onClick={() => handleSortChange(option.value)}
            className={cn(
              "flex items-center justify-between cursor-pointer py-2",
              value === option.value && "bg-accent",
            )}
          >
            <div className="flex items-center space-x-2">
              {getSortIcon(option.value)}
              <span className="text-sm">{t(option.labelKey)}</span>
            </div>
            <div className="flex items-center space-x-1">
              {getDirectionIcon(option)}
              {value === option.value && (
                <div className="w-2 h-2 bg-primary rounded-full" />
              )}
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default SortDropdown;
