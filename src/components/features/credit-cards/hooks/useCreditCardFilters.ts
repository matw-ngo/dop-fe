import { useState, useCallback, useMemo } from "react";
import { CreditCardFilters, DEFAULT_FILTERS } from "@/types/credit-card";

interface UseCreditCardFiltersOptions {
  initialFilters?: Partial<CreditCardFilters>;
  onFiltersChange?: (filters: CreditCardFilters) => void;
}

interface UseCreditCardFiltersReturn {
  filters: CreditCardFilters;
  updateFilters: (updates: Partial<CreditCardFilters>) => void;
  clearFilters: () => void;
  clearFilter: (filterType: keyof CreditCardFilters, value?: string) => void;
  hasActiveFilters: boolean;
  activeFiltersCount: number;
  resetToDefaults: () => void;
}

/**
 * Custom hook for managing credit card filters state
 * Provides convenient methods for updating, clearing, and tracking filter state
 */
export const useCreditCardFilters = ({
  initialFilters = {},
  onFiltersChange,
}: UseCreditCardFiltersOptions = {}): UseCreditCardFiltersReturn => {
  // Initialize filters state with defaults and any provided initial filters
  const [filters, setFilters] = useState<CreditCardFilters>(() => ({
    ...DEFAULT_FILTERS,
    ...initialFilters,
  }));

  // Check if any filters are active
  const hasActiveFilters = useMemo(() => {
    return (
      filters.categories.length > 0 ||
      filters.networks.length > 0 ||
      filters.issuers.length > 0 ||
      filters.rewardsTypes.length > 0 ||
      filters.digitalFeatures.length > 0 ||
      filters.annualFeeType.length > 0 ||
      filters.employmentTypes.length > 0 ||
      filters.provinces.length > 0 ||
      filters.ageRange.min > 18 ||
      filters.ageRange.max < 80 ||
      filters.annualFeeRange.min > 0 ||
      filters.annualFeeRange.max < 10000000 ||
      filters.creditLimitRange.min > 0 ||
      filters.creditLimitRange.max < 2000000000 ||
      filters.incomeRange.min > 0 ||
      filters.incomeRange.max < 100000000 ||
      filters.hasWelcomeOffer ||
      filters.hasAnnualFeeWaiver ||
      filters.hasInstallmentPlans ||
      filters.hasInsurance ||
      filters.isNew ||
      filters.isRecommended ||
      filters.isExclusive ||
      filters.minRating > 0
    );
  }, [filters]);

  // Count active filters
  const activeFiltersCount = useMemo(() => {
    let count = 0;

    // Array filters
    if (filters.categories.length > 0) count++;
    if (filters.networks.length > 0) count++;
    if (filters.issuers.length > 0) count++;
    if (filters.rewardsTypes.length > 0) count++;
    if (filters.digitalFeatures.length > 0) count++;
    if (filters.annualFeeType.length > 0) count++;
    if (filters.employmentTypes.length > 0) count++;
    if (filters.provinces.length > 0) count++;

    // Range filters
    if (filters.ageRange.min > 18 || filters.ageRange.max < 80) count++;
    if (filters.annualFeeRange.min > 0 || filters.annualFeeRange.max < 10000000)
      count++;
    if (
      filters.creditLimitRange.min > 0 ||
      filters.creditLimitRange.max < 2000000000
    )
      count++;
    if (filters.incomeRange.min > 0 || filters.incomeRange.max < 100000000)
      count++;

    // Boolean filters
    if (filters.hasWelcomeOffer) count++;
    if (filters.hasAnnualFeeWaiver) count++;
    if (filters.hasInstallmentPlans) count++;
    if (filters.hasInsurance) count++;
    if (filters.isNew) count++;
    if (filters.isRecommended) count++;
    if (filters.isExclusive) count++;

    // Rating filter
    if (filters.minRating > 0) count++;

    return count;
  }, [filters]);

  // Update filters with new values
  const updateFilters = useCallback(
    (updates: Partial<CreditCardFilters>) => {
      const newFilters = {
        ...filters,
        ...updates,
      };
      setFilters(newFilters);
      onFiltersChange?.(newFilters);
    },
    [filters, onFiltersChange],
  );

  // Clear all filters
  const clearFilters = useCallback(() => {
    const clearedFilters = { ...DEFAULT_FILTERS };
    setFilters(clearedFilters);
    onFiltersChange?.(clearedFilters);
  }, [onFiltersChange]);

  // Reset to initial filters
  const resetToDefaults = useCallback(() => {
    const defaultFilters = {
      ...DEFAULT_FILTERS,
      ...initialFilters,
    };
    setFilters(defaultFilters);
    onFiltersChange?.(defaultFilters);
  }, [initialFilters, onFiltersChange]);

  // Clear a specific filter or filter value
  const clearFilter = useCallback(
    (filterType: keyof CreditCardFilters, value?: string) => {
      let newFilters: CreditCardFilters;

      if (value && Array.isArray(filters[filterType])) {
        // Remove specific value from array filter
        const currentValues = filters[filterType] as string[];
        newFilters = {
          ...filters,
          [filterType]: currentValues.filter((v) => v !== value),
        };
      } else if (Array.isArray(filters[filterType])) {
        // Clear entire array filter
        newFilters = {
          ...filters,
          [filterType]: [] as string[],
        };
      } else if (
        typeof filters[filterType] === "object" &&
        filters[filterType] !== null
      ) {
        // Reset range filter to defaults
        const defaultValue = DEFAULT_FILTERS[filterType];
        newFilters = {
          ...filters,
          [filterType]: defaultValue,
        };
      } else if (typeof filters[filterType] === "boolean") {
        // Reset boolean filter to false
        newFilters = {
          ...filters,
          [filterType]: false,
        };
      } else {
        // Reset other filters to defaults
        const defaultValue = DEFAULT_FILTERS[filterType];
        newFilters = {
          ...filters,
          [filterType]: defaultValue,
        };
      }

      setFilters(newFilters);
      onFiltersChange?.(newFilters);
    },
    [filters, onFiltersChange],
  );

  // Toggle array filter value
  const toggleArrayFilter = useCallback(
    (filterType: keyof CreditCardFilters, value: string) => {
      const currentValues = (filters[filterType] as string[]) || [];
      const newValues = currentValues.includes(value)
        ? currentValues.filter((v) => v !== value)
        : [...currentValues, value];

      const newFilters = {
        ...filters,
        [filterType]: newValues,
      };

      setFilters(newFilters);
      onFiltersChange?.(newFilters);
    },
    [filters, onFiltersChange],
  );

  // Toggle boolean filter
  const toggleBooleanFilter = useCallback(
    (filterType: keyof CreditCardFilters) => {
      const currentValue = filters[filterType] as boolean;
      const newFilters = {
        ...filters,
        [filterType]: !currentValue,
      };

      setFilters(newFilters);
      onFiltersChange?.(newFilters);
    },
    [filters, onFiltersChange],
  );

  // Update range filter
  const updateRangeFilter = useCallback(
    (filterType: keyof CreditCardFilters, min?: number, max?: number) => {
      const currentRange = filters[filterType] as { min: number; max: number };
      const newRange = {
        min: min !== undefined ? min : currentRange.min,
        max: max !== undefined ? max : currentRange.max,
      };

      const newFilters = {
        ...filters,
        [filterType]: newRange,
      };

      setFilters(newFilters);
      onFiltersChange?.(newFilters);
    },
    [filters, onFiltersChange],
  );

  // Get active filters as an array of { type, label, value } for display
  const activeFiltersList = useMemo(() => {
    const list: Array<{
      type: keyof CreditCardFilters;
      label: string;
      value?: string;
    }> = [];

    // Helper function to add filter to list
    const addFilter = (
      type: keyof CreditCardFilters,
      label: string,
      value?: string,
    ) => {
      list.push({ type, label, value });
    };

    // Array filters
    filters.categories.forEach((cat) => addFilter("categories", cat, cat));
    filters.networks.forEach((net) => addFilter("networks", net, net));
    filters.issuers.forEach((iss) => addFilter("issuers", iss, iss));
    filters.rewardsTypes.forEach((rt) => addFilter("rewardsTypes", rt, rt));
    filters.digitalFeatures.forEach((df) =>
      addFilter("digitalFeatures", df, df),
    );
    filters.employmentTypes.forEach((et) =>
      addFilter("employmentTypes", et, et),
    );
    filters.provinces.forEach((p) => addFilter("provinces", p, p));

    // Range filters
    if (filters.ageRange.min > 18 || filters.ageRange.max < 80) {
      addFilter(
        "ageRange",
        `${filters.ageRange.min} - ${filters.ageRange.max}`,
      );
    }
    if (
      filters.annualFeeRange.min > 0 ||
      filters.annualFeeRange.max < 10000000
    ) {
      addFilter(
        "annualFeeRange",
        `${filters.annualFeeRange.min} - ${filters.annualFeeRange.max}`,
      );
    }
    if (
      filters.creditLimitRange.min > 0 ||
      filters.creditLimitRange.max < 2000000000
    ) {
      addFilter(
        "creditLimitRange",
        `${filters.creditLimitRange.min} - ${filters.creditLimitRange.max}`,
      );
    }
    if (filters.incomeRange.min > 0 || filters.incomeRange.max < 100000000) {
      addFilter(
        "incomeRange",
        `${filters.incomeRange.min} - ${filters.incomeRange.max}`,
      );
    }

    // Boolean filters
    if (filters.hasWelcomeOffer)
      addFilter("hasWelcomeOffer", "Has Welcome Offer");
    if (filters.hasAnnualFeeWaiver)
      addFilter("hasAnnualFeeWaiver", "Fee Waiver Available");
    if (filters.hasInstallmentPlans)
      addFilter("hasInstallmentPlans", "Has Installment Plans");
    if (filters.hasInsurance) addFilter("hasInsurance", "Has Insurance");
    if (filters.isNew) addFilter("isNew", "New");
    if (filters.isRecommended) addFilter("isRecommended", "Recommended");
    if (filters.isExclusive) addFilter("isExclusive", "Exclusive");

    // Rating filter
    if (filters.minRating > 0) {
      addFilter("minRating", `${filters.minRating}+ Stars`);
    }

    return list;
  }, [filters]);

  return {
    filters,
    updateFilters,
    clearFilters,
    clearFilter,
    hasActiveFilters,
    activeFiltersCount,
    resetToDefaults,
    // Additional utility methods
    toggleArrayFilter,
    toggleBooleanFilter,
    updateRangeFilter,
    activeFiltersList,
  };
};

export default useCreditCardFilters;
