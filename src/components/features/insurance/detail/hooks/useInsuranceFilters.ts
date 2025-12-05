/**
 * Insurance Filter Hook
 *
 * Provides comprehensive filter state management for insurance products,
 * including filter initialization, updates, active filter counting, and
 * extraction of available filter options from product data.
 */

import { useCallback, useMemo } from "react";
import type {
  InsuranceFilters,
  VehicleType,
  InsuranceCategory,
  InsuranceType,
  FeeType,
  CoveragePeriod,
} from "@/types/insurance";
import { useInsuranceStore, useInsuranceFilters as useStoreFilters } from "@/store/use-insurance-store";

// ============================================================================
// Hook Interface
// ============================================================================

/**
 * Interface for the insurance filter hook return value
 */
export interface UseInsuranceFiltersReturn {
  /**
   * Current filter state
   */
  filters: InsuranceFilters;

  /**
   * Number of active filters
   */
  activeFiltersCount: number;

  /**
   * Update multiple filters at once
   */
  setFilters: (filters: Partial<InsuranceFilters>) => void;

  /**
   * Clear all filters to default state
   */
  clearFilters: () => void;

  /**
   * Update a single filter by key
   */
  updateFilter: (key: keyof InsuranceFilters, value: any) => void;

  /**
   * Available filter options from product data
   */
  availableOptions: {
    issuers: string[];
    vehicleTypes: VehicleType[];
    features: string[];
  };
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Extract unique vehicle types from filtered products
 */
const extractVehicleTypes = (products: any[]): VehicleType[] => {
  const vehicleTypes = new Set<VehicleType>();

  products.forEach((product) => {
    if (product.vehicleCoverage?.vehicleType) {
      vehicleTypes.add(product.vehicleCoverage.vehicleType);
    }
  });

  return Array.from(vehicleTypes).sort();
};

/**
 * Extract unique features from filtered products
 */
const extractFeatures = (products: any[]): string[] => {
  const features = new Set<string>();

  products.forEach((product) => {
    product.features?.forEach((feature: string) => {
      if (feature) features.add(feature);
    });
    product.benefits?.forEach((benefit: string) => {
      if (benefit) features.add(benefit);
    });
  });

  return Array.from(features).sort();
};

/**
 * Default filter values for resetting
 */
const getDefaultFilters = (): InsuranceFilters => ({
  // Basic Filters
  categories: [],
  types: [],
  issuers: [],

  // Coverage Filters
  coverageRange: {
    personalAccident: { min: 0, max: 5000000000 },
    propertyDamage: { min: 0, max: 10000000000 },
    medicalExpenses: { min: 0, max: 5000000000 },
  },
  specificCoverages: [],

  // Pricing Filters
  premiumRange: {
    min: 0,
    max: 50000000, // 50 million VND
  },
  feeTypes: [],
  coveragePeriods: [],

  // Eligibility Filters
  ageRange: {
    min: 0,
    max: 100,
  },
  includePreExistingConditions: false,

  // Features Filters
  hasRoadsideAssistance: false,
  hasWorldwideCoverage: false,
  hasMedicalHotline: false,
  hasLegalSupport: false,

  // Claims Filters
  minApprovalRate: 0,
  maxProcessingTime: 30, // 30 days

  // Regional Filters
  provinces: [],
  nationalAvailability: false,

  // Special Filters
  isNew: false,
  isRecommended: false,
  isExclusive: false,
  hasAutoRenewal: false,
  hasInstallments: false,

  // Rating Filter
  minRating: 1,
});

// ============================================================================
// Main Hook Implementation
// ============================================================================

/**
 * Hook for managing insurance product filters
 *
 * This hook provides:
 * - Current filter state from the store
 * - Methods to update filters (bulk and single)
 * - Active filter count
 * - Available filter options extracted from product data
 * - Optimized performance with memoization
 *
 * @returns Filter state and management functions
 */
export const useInsuranceFilters = (): UseInsuranceFiltersReturn => {
  // Get store filters and available options
  const storeFilters = useStoreFilters();

  // Get store actions and raw state
  const {
    products,
    setFilters: setStoreFilters,
    clearFilters: clearStoreFilters,
  } = useInsuranceStore((state) => ({
    products: state.products,
    setFilters: state.setFilters,
    clearFilters: state.clearFilters,
  }));

  // Extract available issuers from products
  const availableIssuers = useMemo(() => {
    const issuers = new Set<string>();
    products.forEach((product) => {
      if (product.issuer) issuers.add(product.issuer);
    });
    return Array.from(issuers).sort();
  }, [products]);

  // Memoize available options extracted from product data
  const availableOptions = useMemo(() => {
    const vehicleTypes = extractVehicleTypes(products);
    const features = extractFeatures(products);

    return {
      issuers: availableIssuers,
      vehicleTypes,
      features,
    };
  }, [products, availableIssuers]);

  // Update multiple filters at once
  const setFilters = useCallback(
    (newFilters: Partial<InsuranceFilters>) => {
      setStoreFilters(newFilters);
    },
    [setStoreFilters]
  );

  // Clear all filters to default state
  const clearFilters = useCallback(() => {
    clearStoreFilters();
  }, [clearStoreFilters]);

  // Update a single filter by key with proper type handling
  const updateFilter = useCallback(
    (key: keyof InsuranceFilters, value: any) => {
      setStoreFilters({ [key]: value });
    },
    [setStoreFilters]
  );

  // Helper functions for common filter operations
  const helpers = useMemo(() => ({
    // Toggle array-based filters (categories, types, issuers, etc.)
    toggleArrayFilter: (
      key: keyof InsuranceFilters,
      item: string | InsuranceCategory | InsuranceType | FeeType | CoveragePeriod
    ) => {
      const currentArray = storeFilters.filters[key] as (string | InsuranceCategory | InsuranceType | FeeType | CoveragePeriod)[];
      const exists = currentArray.includes(item);

      if (exists) {
        updateFilter(key, currentArray.filter(i => i !== item));
      } else {
        updateFilter(key, [...currentArray, item]);
      }
    },

    // Update nested range filters
    updateRangeFilter: (
      parentKey: keyof InsuranceFilters,
      childKey: string,
      value: number
    ) => {
      const currentRange = storeFilters.filters[parentKey] as any;
      updateFilter(parentKey, {
        ...currentRange,
        [childKey]: value,
      });
    },

    // Update nested coverage range filters
    updateCoverageRangeFilter: (
      coverageType: "personalAccident" | "propertyDamage" | "medicalExpenses",
      rangeType: "min" | "max",
      value: number
    ) => {
      updateFilter("coverageRange", {
        ...storeFilters.filters.coverageRange,
        [coverageType]: {
          ...storeFilters.filters.coverageRange[coverageType],
          [rangeType]: value,
        },
      });
    },

    // Reset specific filter group
    resetFilterGroup: (group: "basic" | "coverage" | "pricing" | "eligibility" | "features" | "claims" | "regional" | "special") => {
      const defaultFilters = getDefaultFilters();

      switch (group) {
        case "basic":
          setFilters({
            categories: defaultFilters.categories,
            types: defaultFilters.types,
            issuers: defaultFilters.issuers,
          });
          break;
        case "coverage":
          setFilters({
            coverageRange: defaultFilters.coverageRange,
            specificCoverages: defaultFilters.specificCoverages,
          });
          break;
        case "pricing":
          setFilters({
            premiumRange: defaultFilters.premiumRange,
            feeTypes: defaultFilters.feeTypes,
            coveragePeriods: defaultFilters.coveragePeriods,
          });
          break;
        case "eligibility":
          setFilters({
            ageRange: defaultFilters.ageRange,
            includePreExistingConditions: defaultFilters.includePreExistingConditions,
          });
          break;
        case "features":
          setFilters({
            hasRoadsideAssistance: defaultFilters.hasRoadsideAssistance,
            hasWorldwideCoverage: defaultFilters.hasWorldwideCoverage,
            hasMedicalHotline: defaultFilters.hasMedicalHotline,
            hasLegalSupport: defaultFilters.hasLegalSupport,
          });
          break;
        case "claims":
          setFilters({
            minApprovalRate: defaultFilters.minApprovalRate,
            maxProcessingTime: defaultFilters.maxProcessingTime,
          });
          break;
        case "regional":
          setFilters({
            provinces: defaultFilters.provinces,
            nationalAvailability: defaultFilters.nationalAvailability,
          });
          break;
        case "special":
          setFilters({
            isNew: defaultFilters.isNew,
            isRecommended: defaultFilters.isRecommended,
            isExclusive: defaultFilters.isExclusive,
            hasAutoRenewal: defaultFilters.hasAutoRenewal,
            hasInstallments: defaultFilters.hasInstallments,
          });
          break;
      }
    },

    // Check if filter group has active filters
    hasActiveFilterGroup: (group: "basic" | "coverage" | "pricing" | "eligibility" | "features" | "claims" | "regional" | "special"): boolean => {
      const f = storeFilters.filters; // Use local variable for readability
      switch (group) {
        case "basic":
          return f.categories.length > 0 ||
                 f.types.length > 0 ||
                 f.issuers.length > 0;
        case "coverage":
          return f.specificCoverages.length > 0 ||
                 f.coverageRange.personalAccident.min > 0 ||
                 f.coverageRange.personalAccident.max < 5000000000 ||
                 f.coverageRange.propertyDamage.min > 0 ||
                 f.coverageRange.propertyDamage.max < 10000000000 ||
                 f.coverageRange.medicalExpenses.min > 0 ||
                 f.coverageRange.medicalExpenses.max < 5000000000;
        case "pricing":
          return f.premiumRange.min > 0 ||
                 f.premiumRange.max < 50000000 ||
                 f.feeTypes.length > 0 ||
                 f.coveragePeriods.length > 0;
        case "eligibility":
          return f.ageRange.min > 0 ||
                 f.ageRange.max < 100 ||
                 f.includePreExistingConditions;
        case "features":
          return f.hasRoadsideAssistance ||
                 f.hasWorldwideCoverage ||
                 f.hasMedicalHotline ||
                 f.hasLegalSupport;
        case "claims":
          return f.minApprovalRate > 0 ||
                 f.maxProcessingTime < 30;
        case "regional":
          return f.provinces.length > 0 ||
                 f.nationalAvailability;
        case "special":
          return f.isNew ||
                 f.isRecommended ||
                 f.isExclusive ||
                 f.hasAutoRenewal ||
                 f.hasInstallments ||
                 f.minRating > 1;
      }
    },
  }), [storeFilters.filters, setFilters, updateFilter]);

  // Return hook interface with helper functions attached
  return useMemo(() => ({
    filters: storeFilters.filters,
    activeFiltersCount: storeFilters.activeFiltersCount,
    setFilters,
    clearFilters,
    updateFilter,
    availableOptions,
    ...helpers,
  }), [storeFilters.filters, storeFilters.activeFiltersCount, setFilters, clearFilters, updateFilter, availableOptions, helpers]);
};

// ============================================================================
// Utility Exports
// ============================================================================

/**
 * Export default filter values for external use
 */
export { getDefaultFilters };

/**
 * Export filter group types for type safety
 */
export type FilterGroup =
  | "basic"
  | "coverage"
  | "pricing"
  | "eligibility"
  | "features"
  | "claims"
  | "regional"
  | "special";