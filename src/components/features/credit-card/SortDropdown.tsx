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
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { SortOption, SortOptionUI } from "@/types/credit-card";
import { SORT_OPTIONS } from "@/constants/credit-cards";

interface SortDropdownProps {
  value?: SortOptionUI["value"];
  onChange?: (value: SortOptionUI["value"]) => void;
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
  const t = useTranslations("features.credit-cards.listing");

  // Find the current sort option
  const currentSort = SORT_OPTIONS.find((option) => option.value === value);

  // Get sort direction icon
  const getDirectionIcon = (option: SortOptionUI) => {
    if (!showDirectionIcon) return null;

    switch (option.direction) {
      case "asc":
        return <ArrowUp className="h-4 w-4" />;
      case "desc":
        return <ArrowDown className="h-4 w-4" />;
      default:
        return null;
    }
  };

  // Handle sort change
  const handleSortChange = (newValue: string) => {
    onChange?.(newValue as SortOptionUI["value"]);
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
                <span>{t(option.labelKey)}</span>
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
      <DropdownMenuContent align="start" className="w-56">
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
              "flex items-center justify-between cursor-pointer",
              value === option.value && "bg-accent",
            )}
          >
            <span>{t(option.labelKey)}</span>
            {getDirectionIcon(option)}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default SortDropdown;
