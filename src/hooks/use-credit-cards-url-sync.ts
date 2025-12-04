/**
 * Custom hooks for synchronizing credit cards state with URL parameters
 * Extracted to improve component readability and reusability
 */

import { useEffect } from "react";
import { useLocale } from "next-intl";
import { useSearchParams } from "next/navigation";
import type { CreditCardFilters, SortOption } from "@/types/credit-card";
import { DEFAULT_PAGE_SIZE } from "@/constants/credit-cards";
import type { CreditCardsStore } from "@/store/use-credit-cards-store";
import type { CardCategory, CardNetwork } from "@/types/credit-card";

// Default filters with proper typing for URL initialization
const DEFAULT_FILTERS_FOR_URL: CreditCardFilters = {
  // Basic Filters
  categories: [],
  networks: [],
  issuers: [],

  // Financial Filters
  annualFeeType: [],
  annualFeeRange: { min: 0, max: 10000000 },
  creditLimitRange: { min: 0, max: 2000000000 },
  hasAnnualFeeWaiver: false,

  // Requirements Filters
  ageRange: { min: 18, max: 80 },
  incomeRange: { min: 0, max: 100000000 },
  employmentTypes: [],
  provinces: [],

  // Feature Filters
  rewardsTypes: [],
  hasWelcomeOffer: false,
  hasInstallmentPlans: false,
  hasInsurance: false,

  // Digital Features
  digitalFeatures: [],

  // Special Filters
  isNew: false,
  isRecommended: false,
  isExclusive: false,

  // Rating Filter
  minRating: 0,
};

// ============================================================================
// URL Parameter Conversion Utilities
// ============================================================================

/**
 * Parse URL search parameters to filters object
 */
export const searchParamsToFilters = (
  searchParams: URLSearchParams,
): Partial<CreditCardFilters> => {
  const filters: Partial<CreditCardFilters> = {};

  // Array-based filters
  const arrayFields = [
    "categories",
    "networks",
    "provinces",
    "employmentTypes",
    "rewardsTypes",
    "digitalFeatures",
  ] as const;

  arrayFields.forEach((field) => {
    const value = searchParams.get(field);
    if (value) {
      (filters as any)[field] = value.split(",");
    }
  });

  // Range filters
  const rangeFields = [
    { min: "annualFeeMin", max: "annualFeeMax", target: "annualFeeRange" },
    { min: "ageMin", max: "ageMax", target: "ageRange" },
    { min: "incomeMin", max: "incomeMax", target: "incomeRange" },
  ] as const;

  rangeFields.forEach(({ min, max, target }) => {
    const minValue = searchParams.get(min);
    const maxValue = searchParams.get(max);
    if (minValue || maxValue) {
      const defaultValue = DEFAULT_FILTERS_FOR_URL[
        target as keyof typeof DEFAULT_FILTERS_FOR_URL
      ] as { min: number; max: number };
      (filters as any)[target] = {
        min: minValue ? parseInt(minValue) : defaultValue.min,
        max: maxValue ? parseInt(maxValue) : defaultValue.max,
      };
    }
  });

  // Numeric filters
  const numericFields = ["minRating"] as const;
  numericFields.forEach((field) => {
    const value = searchParams.get(field);
    if (value) {
      (filters as any)[field] = parseInt(value);
    }
  });

  // Boolean filters
  const booleanFields = [
    "hasWelcomeOffer",
    "hasAnnualFeeWaiver",
    "hasInstallmentPlans",
    "hasInsurance",
    "isNew",
    "isRecommended",
    "isExclusive",
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
export const filtersToSearchParams = (
  filters: CreditCardFilters,
): URLSearchParams => {
  const params = new URLSearchParams();

  // Array-based filters
  const arrayFields = [
    "categories",
    "networks",
    "provinces",
    "employmentTypes",
    "rewardsTypes",
    "digitalFeatures",
  ] as const;

  arrayFields.forEach((field) => {
    const value = (filters as any)[field];
    if (Array.isArray(value) && value.length > 0) {
      params.set(field, value.join(","));
    }
  });

  // Range filters
  const rangeFields = [
    { min: "annualFeeMin", max: "annualFeeMax", target: "annualFeeRange" },
    { min: "ageMin", max: "ageMax", target: "ageRange" },
    { min: "incomeMin", max: "incomeMax", target: "incomeRange" },
  ] as const;

  rangeFields.forEach(({ min, max, target }) => {
    const range = (filters as any)[target] as { min: number; max: number };
    if (range) {
      const defaultValue = DEFAULT_FILTERS_FOR_URL[
        target as keyof typeof DEFAULT_FILTERS_FOR_URL
      ] as { min: number; max: number };
      if (range.min !== defaultValue.min) {
        params.set(min, range.min.toString());
      }
      if (range.max !== defaultValue.max) {
        params.set(max, range.max.toString());
      }
    }
  });

  // Numeric filters
  if (filters.minRating > 0) {
    params.set("minRating", filters.minRating.toString());
  }

  // Boolean filters
  const booleanFields = [
    "hasWelcomeOffer",
    "hasAnnualFeeWaiver",
    "hasInstallmentPlans",
    "hasInsurance",
    "isNew",
    "isRecommended",
    "isExclusive",
  ] as const;

  booleanFields.forEach((field) => {
    const value = (filters as any)[field];
    if (value) {
      params.set(field, "true");
    }
  });

  return params;
};

// ============================================================================
// Custom Hooks
// ============================================================================

/**
 * Hook to initialize state from URL parameters
 */
export const useCreditCardsUrlInit = (
  store: Pick<
    CreditCardsStore,
    "setFilters" | "setSortBy" | "setCurrentPage" | "setSearchQuery"
  >,
) => {
  const searchParams = useSearchParams();

  useEffect(() => {
    // Initialize filters from URL
    const urlFilters = searchParamsToFilters(
      searchParams as any as URLSearchParams,
    );
    if (Object.keys(urlFilters).length > 0) {
      store.setFilters({ ...DEFAULT_FILTERS_FOR_URL, ...urlFilters });
    }

    // Initialize sort from URL
    const urlSort = searchParams.get("sort");
    if (urlSort) {
      store.setSortBy(urlSort as SortOption);
    }

    // Initialize page from URL
    const urlPage = searchParams.get("page");
    if (urlPage) {
      store.setCurrentPage(parseInt(urlPage));
    }

    // Initialize search query from URL
    const urlSearch = searchParams.get("search");
    if (urlSearch) {
      store.setSearchQuery(urlSearch);
    }
  }, [searchParams]); // Removed 'store' from dependencies - Zustand store methods are stable
};

/**
 * Hook to synchronize state with URL parameters
 */
export const useCreditCardsUrlSync = (state: {
  filters: CreditCardFilters;
  searchQuery: string;
  sortBy: SortOption;
  currentPage: number;
  itemsPerPage: number;
}) => {
  const locale = useLocale();

  useEffect(() => {
    const params = filtersToSearchParams(state.filters);

    if (state.searchQuery) {
      params.set("search", state.searchQuery);
    }

    if (state.sortBy !== "featured") {
      params.set("sort", state.sortBy);
    }

    if (state.currentPage > 1) {
      params.set("page", state.currentPage.toString());
    }

    if (state.itemsPerPage !== DEFAULT_PAGE_SIZE) {
      params.set("itemsPerPage", state.itemsPerPage.toString());
    }

    // Update URL without page reload
    const newUrl = `/${locale}/credit-cards${params.toString() ? "?" + params.toString() : ""}`;
    window.history.replaceState({}, "", newUrl);
  }, [
    state.filters,
    state.searchQuery,
    state.sortBy,
    state.currentPage,
    state.itemsPerPage,
    locale,
  ]);
};

/**
 * Hook to get items per page from URL
 */
export const useItemsPerPageFromUrl = () => {
  const searchParams = useSearchParams();
  const urlItemsPerPage = searchParams.get("itemsPerPage");
  return urlItemsPerPage ? parseInt(urlItemsPerPage) : DEFAULT_PAGE_SIZE;
};
