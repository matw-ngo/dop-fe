import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Filter, X } from "lucide-react";
import { CreditCardFilters } from "@/types/credit-card";
import CreditCardFilterPanel from "./CreditCardFilterPanel";
import { DEFAULT_FILTERS } from "@/constants/credit-cards";

interface CreditCardFilterSidebarProps {
  filters: CreditCardFilters;
  onFiltersChange: (filters: Partial<CreditCardFilters>) => void;
  className?: string;
  trigger?: React.ReactNode;
}

export const CreditCardFilterSidebar: React.FC<
  CreditCardFilterSidebarProps
> = ({ filters, onFiltersChange, className, trigger }) => {
  const t = useTranslations("features.credit-cards.listing");
  const [isOpen, setIsOpen] = useState(false);

  const handleClearFilters = () => {
    onFiltersChange(DEFAULT_FILTERS);
    setIsOpen(false);
  };

  const handleFiltersChange = (newFilters: Partial<CreditCardFilters>) => {
    onFiltersChange(newFilters);
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.categories.length > 0) count++;
    if (filters.networks.length > 0) count++;
    if (filters.rewardsTypes.length > 0) count++;
    if (filters.provinces.length > 0) count++;
    if (filters.employmentTypes.length > 0) count++;
    if (filters.digitalFeatures.length > 0) count++;
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
    if (filters.minRating > 0) count++;
    if (filters.hasWelcomeOffer) count++;
    if (filters.hasAnnualFeeWaiver) count++;
    if (filters.hasInstallmentPlans) count++;
    if (filters.hasInsurance) count++;
    if (filters.isNew) count++;
    if (filters.isRecommended) count++;
    if (filters.isExclusive) count++;
    return count;
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        {trigger || (
          <Button variant="outline" className={className}>
            <Filter className="w-4 h-4 mr-2" />
            {t("filters")}
            {getActiveFiltersCount() > 0 && (
              <span className="ml-2 px-2 py-0.5 text-xs bg-primary text-primary-foreground rounded-full">
                {getActiveFiltersCount()}
              </span>
            )}
          </Button>
        )}
      </SheetTrigger>
      <SheetContent side="left" className="w-full sm:w-96 overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center justify-between">
            {t("filters")}
            <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
              <X className="w-4 h-4" />
            </Button>
          </SheetTitle>
        </SheetHeader>

        <div className="mt-6">
          <CreditCardFilterPanel
            filters={filters}
            onFiltersChange={handleFiltersChange}
            onClearFilters={handleClearFilters}
          />

          <div className="mt-4 flex gap-2 px-4">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setIsOpen(false)}
            >
              {t("apply")}
            </Button>
            <Button variant="ghost" onClick={handleClearFilters}>
              {t("clearAll")}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default CreditCardFilterSidebar;
