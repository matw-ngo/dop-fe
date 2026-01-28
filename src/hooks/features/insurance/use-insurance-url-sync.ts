/**
 * Custom hooks for synchronizing insurance products state with URL parameters
 * Extracted to improve component readability and reusability
 */

import { useSearchParams } from "next/navigation";
import { useLocale } from "next-intl";
import { useEffect } from "react";
import { DEFAULT_PAGE_SIZE } from "@/constants/insurance";
import type {
  InsuranceFilters,
  PaginationOptions,
  SortOption,
} from "@/types/insurance";

// Default filters with proper typing for URL initialization
const DEFAULT_FILTERS_FOR_URL: InsuranceFilters = {
  // Basic Filters
  categories: [],
  types: [],
  issuers: [],

  // Coverage Filters
  coverageRange: {
    personalAccident: { min: 0, max: 1000000000 },
    propertyDamage: { min: 0, max: 1000000000 },
    medicalExpenses: { min: 0, max: 1000000000 },
  },
  specificCoverages: [],

  // Pricing Filters
  premiumRange: { min: 0, max: 100000000 },
  feeTypes: [],
  coveragePeriods: [],

  // Eligibility Filters
  ageRange: { min: 18, max: 80 },
  includePreExistingConditions: false,

  // Features Filters
  hasRoadsideAssistance: false,
  hasWorldwideCoverage: false,
  hasMedicalHotline: false,
  hasLegalSupport: false,

  // Claims Filters
  minApprovalRate: 0,
  maxProcessingTime: 30, // days

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
  minRating: 0,
};

// ============================================================================
// URL Parameter Conversion Utilities
// ============================================================================

/**
 * Parse URL search parameters to filters object
 */
export const searchParamsToInsuranceFilters = (
  searchParams: URLSearchParams,
): Partial<InsuranceFilters> => {
  const filters: Partial<InsuranceFilters> = {};

  // Array-based filters
  const arrayFields = [
    "categories",
    "types",
    "issuers",
    "specificCoverages",
    "feeTypes",
    "coveragePeriods",
    "provinces",
  ] as const;

  arrayFields.forEach((field) => {
    const value = searchParams.get(field);
    if (value) {
      (filters as any)[field] = value.split(",");
    }
  });

  // Range filters for premiums
  const premiumMin = searchParams.get("premiumMin");
  const premiumMax = searchParams.get("premiumMax");
  if (premiumMin || premiumMax) {
    filters.premiumRange = {
      min: premiumMin
        ? parseInt(premiumMin, 10)
        : DEFAULT_FILTERS_FOR_URL.premiumRange.min,
      max: premiumMax
        ? parseInt(premiumMax, 10)
        : DEFAULT_FILTERS_FOR_URL.premiumRange.max,
    };
  }

  // Coverage range filters (nested)
  const coverageTypes = [
    "personalAccident",
    "propertyDamage",
    "medicalExpenses",
  ] as const;
  coverageTypes.forEach((coverageType) => {
    const coverageMin = searchParams.get(`coverage[${coverageType}][min]`);
    const coverageMax = searchParams.get(`coverage[${coverageType}][max]`);
    if (coverageMin || coverageMax) {
      if (!filters.coverageRange) {
        filters.coverageRange = { ...DEFAULT_FILTERS_FOR_URL.coverageRange };
      }
      (filters.coverageRange as any)[coverageType] = {
        min: coverageMin
          ? parseInt(coverageMin, 10)
          : DEFAULT_FILTERS_FOR_URL.coverageRange[
              coverageType as keyof typeof DEFAULT_FILTERS_FOR_URL.coverageRange
            ].min,
        max: coverageMax
          ? parseInt(coverageMax, 10)
          : DEFAULT_FILTERS_FOR_URL.coverageRange[
              coverageType as keyof typeof DEFAULT_FILTERS_FOR_URL.coverageRange
            ].max,
      };
    }
  });

  // Age range filter
  const ageMin = searchParams.get("ageMin");
  const ageMax = searchParams.get("ageMax");
  if (ageMin || ageMax) {
    filters.ageRange = {
      min: ageMin ? parseInt(ageMin, 10) : DEFAULT_FILTERS_FOR_URL.ageRange.min,
      max: ageMax ? parseInt(ageMax, 10) : DEFAULT_FILTERS_FOR_URL.ageRange.max,
    };
  }

  // Numeric filters
  const numericFields = [
    "minApprovalRate",
    "maxProcessingTime",
    "minRating",
  ] as const;
  numericFields.forEach((field) => {
    const value = searchParams.get(field);
    if (value) {
      (filters as any)[field] = parseInt(value, 10);
    }
  });

  // Boolean filters
  const booleanFields = [
    "includePreExistingConditions",
    "hasRoadsideAssistance",
    "hasWorldwideCoverage",
    "hasMedicalHotline",
    "hasLegalSupport",
    "nationalAvailability",
    "isNew",
    "isRecommended",
    "isExclusive",
    "hasAutoRenewal",
    "hasInstallments",
  ] as const;

  booleanFields.forEach((field) => {
    const value = searchParams.get(field);
    if (value) {
      (filters as any)[field] = value === "true";
    }
  });

  return filters;
};

/**
 * Convert filters object to URL search parameters
 */
export const insuranceFiltersToSearchParams = (
  filters: InsuranceFilters,
): URLSearchParams => {
  const params = new URLSearchParams();

  // Array-based filters
  const arrayFields = [
    "categories",
    "types",
    "issuers",
    "specificCoverages",
    "feeTypes",
    "coveragePeriods",
    "provinces",
  ] as const;

  arrayFields.forEach((field) => {
    const value = (filters as any)[field];
    if (Array.isArray(value) && value.length > 0) {
      params.set(field, value.join(","));
    }
  });

  // Premium range filter
  if (filters.premiumRange) {
    if (filters.premiumRange.min !== DEFAULT_FILTERS_FOR_URL.premiumRange.min) {
      params.set("premiumMin", filters.premiumRange.min.toString());
    }
    if (filters.premiumRange.max !== DEFAULT_FILTERS_FOR_URL.premiumRange.max) {
      params.set("premiumMax", filters.premiumRange.max.toString());
    }
  }

  // Coverage range filters (nested)
  const coverageTypes = [
    "personalAccident",
    "propertyDamage",
    "medicalExpenses",
  ] as const;
  coverageTypes.forEach((coverageType) => {
    const range =
      filters.coverageRange[coverageType as keyof typeof filters.coverageRange];
    if (range) {
      const defaultRange =
        DEFAULT_FILTERS_FOR_URL.coverageRange[
          coverageType as keyof typeof DEFAULT_FILTERS_FOR_URL.coverageRange
        ];
      if (range.min !== defaultRange.min) {
        params.set(`coverage[${coverageType}][min]`, range.min.toString());
      }
      if (range.max !== defaultRange.max) {
        params.set(`coverage[${coverageType}][max]`, range.max.toString());
      }
    }
  });

  // Age range filter
  if (filters.ageRange) {
    if (filters.ageRange.min !== DEFAULT_FILTERS_FOR_URL.ageRange.min) {
      params.set("ageMin", filters.ageRange.min.toString());
    }
    if (filters.ageRange.max !== DEFAULT_FILTERS_FOR_URL.ageRange.max) {
      params.set("ageMax", filters.ageRange.max.toString());
    }
  }

  // Numeric filters
  if (filters.minApprovalRate > 0) {
    params.set("minApprovalRate", filters.minApprovalRate.toString());
  }
  if (filters.maxProcessingTime < 30) {
    // Only if less than default
    params.set("maxProcessingTime", filters.maxProcessingTime.toString());
  }
  if (filters.minRating > 0) {
    params.set("minRating", filters.minRating.toString());
  }

  // Boolean filters (only include if true)
  const booleanFields = [
    "includePreExistingConditions",
    "hasRoadsideAssistance",
    "hasWorldwideCoverage",
    "hasMedicalHotline",
    "hasLegalSupport",
    "nationalAvailability",
    "isNew",
    "isRecommended",
    "isExclusive",
    "hasAutoRenewal",
    "hasInstallments",
  ] as const;

  booleanFields.forEach((field) => {
    const value = (filters as any)[field];
    if (value === true) {
      params.set(field, "true");
    }
  });

  return params;
};

// ============================================================================
// Hook Interface
// ============================================================================

export interface UseInsuranceUrlSyncOptions {
  searchQuery: string;
  sortOption: SortOption;
  pagination: PaginationOptions;
  filters: InsuranceFilters;
  setSearchQuery: (query: string) => void;
  setSortOption: (option: SortOption) => void;
  setPagination: (pagination: Partial<PaginationOptions>) => void;
  setFilters: (filters: Partial<InsuranceFilters>) => void;
}

// ============================================================================
// Custom Hooks
// ============================================================================

/**
 * Hook to initialize state from URL parameters
 */
export const useInsuranceUrlInit = (
  options: Pick<
    UseInsuranceUrlSyncOptions,
    "setFilters" | "setSortOption" | "setPagination" | "setSearchQuery"
  >,
) => {
  const searchParams = useSearchParams();

  useEffect(() => {
    // Initialize filters from URL
    const urlFilters = searchParamsToInsuranceFilters(
      searchParams as any as URLSearchParams,
    );
    if (Object.keys(urlFilters).length > 0) {
      options.setFilters({ ...DEFAULT_FILTERS_FOR_URL, ...urlFilters });
    }

    // Initialize sort from URL
    const urlSort = searchParams.get("sort");
    if (urlSort) {
      options.setSortOption(urlSort as SortOption);
    }

    // Initialize page from URL
    const urlPage = searchParams.get("page");
    if (urlPage) {
      const pageNum = parseInt(urlPage, 10);
      if (!Number.isNaN(pageNum) && pageNum > 0) {
        options.setPagination({ page: pageNum });
      }
    }

    // Initialize limit from URL
    const urlLimit = searchParams.get("limit");
    if (urlLimit) {
      const limitNum = parseInt(urlLimit, 10);
      if (!Number.isNaN(limitNum) && limitNum > 0) {
        options.setPagination({ limit: limitNum });
      }
    }

    // Initialize search query from URL
    const urlSearch = searchParams.get("search");
    if (urlSearch) {
      options.setSearchQuery(urlSearch);
    }
  }, [
    searchParams,
    options.setFilters,
    options.setPagination,
    options.setSearchQuery,
    options.setSortOption,
  ]); // Removed 'options' from dependencies - Zustand store methods are stable
};

/**
 * Hook to synchronize state with URL parameters with debouncing
 */
export const useInsuranceUrlSync = (state: {
  filters: InsuranceFilters;
  searchQuery: string;
  sortOption: SortOption;
  pagination: PaginationOptions;
}) => {
  const locale = useLocale();

  // Create debounced update function
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const updateUrl = () => {
      const params = insuranceFiltersToSearchParams(state.filters);

      // Add search query
      if (state.searchQuery) {
        params.set("search", state.searchQuery);
      }

      // Add sort option
      if (state.sortOption !== "featured") {
        params.set("sort", state.sortOption);
      }

      // Add pagination
      if (state.pagination.page > 1) {
        params.set("page", state.pagination.page.toString());
      }

      if (state.pagination.limit !== DEFAULT_PAGE_SIZE) {
        params.set("limit", state.pagination.limit.toString());
      }

      // Update URL without page reload
      const newUrl = `/${locale}/insurance${params.toString() ? `?${params.toString()}` : ""}`;
      window.history.replaceState({}, "", newUrl);
    };

    // Debounce URL updates
    timeoutId = setTimeout(updateUrl, 300); // 300ms debounce

    // Cleanup timeout on unmount or when dependencies change
    return () => {
      clearTimeout(timeoutId);
    };
  }, [
    state.filters,
    state.searchQuery,
    state.sortOption,
    state.pagination.page,
    state.pagination.limit,
    locale,
  ]);
};

/**
 * Hook to get pagination values from URL
 */
export const usePaginationFromUrl = () => {
  const searchParams = useSearchParams();

  const urlPage = searchParams.get("page");
  const urlLimit = searchParams.get("limit");

  return {
    page: urlPage ? parseInt(urlPage, 10) : 1,
    limit: urlLimit ? parseInt(urlLimit, 10) : DEFAULT_PAGE_SIZE,
  };
};

/**
 * Combined hook for full URL synchronization
 * This hook both initializes from URL and syncs changes back to URL
 */
export const useInsuranceUrlSyncFull = (
  options: UseInsuranceUrlSyncOptions,
) => {
  // Initialize from URL on mount
  useInsuranceUrlInit(options);

  // Sync changes to URL
  useInsuranceUrlSync({
    filters: options.filters,
    searchQuery: options.searchQuery,
    sortOption: options.sortOption,
    pagination: options.pagination,
  });
};
