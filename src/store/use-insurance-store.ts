/**
 * Insurance Store
 *
 * Zustand store for managing insurance products state, including filtering,
 * comparison, search, and UI preferences for the insurance products comparison feature.
 */

import { useEffect, useMemo, useState } from "react";
import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { useShallow } from "zustand/shallow";
import {
  INSURANCE_CATEGORIES,
  INSURANCE_PRODUCTS,
} from "@/data/insurance-products";
import {
  type ComparisonState,
  CoveragePeriod,
  FeeType,
  InsuranceCategory,
  type InsuranceCategoryInfo,
  type InsuranceFilters,
  type InsuranceProduct,
  InsuranceType,
  type PaginationOptions,
  SortOption,
} from "@/types/insurance";

// ============================================================================
// Store Types
// ============================================================================

/**
 * Insurance store state interface
 */
export interface InsuranceStore {
  // Data
  products: InsuranceProduct[];
  categories: InsuranceCategoryInfo[];

  // Filters
  filters: InsuranceFilters;
  activeFiltersCount: number;

  // Comparison
  comparison: ComparisonState;

  // UI State
  searchQuery: string;
  sortOption: SortOption;
  pagination: PaginationOptions;
  viewMode: "grid" | "list" | "compact";
  isLoading: boolean;
  isError: boolean;
  error?: string;

  // Sidebar/Mobile UI
  sidebarOpen: boolean;
  mobileFiltersOpen: boolean;
  searchFocused: boolean;

  // Actions
  setProducts: (products: InsuranceProduct[]) => void;
  setFilters: (filters: Partial<InsuranceFilters>) => void;
  clearFilters: () => void;
  setSearchQuery: (query: string) => void;
  setSortOption: (option: SortOption) => void;
  setPagination: (pagination: Partial<PaginationOptions>) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | undefined) => void;

  // Comparison actions
  addToComparison: (productId: string) => void;
  removeFromComparison: (productId: string) => void;
  clearComparison: () => void;

  // UI actions
  setViewMode: (mode: "grid" | "list" | "compact") => void;
  toggleSidebar: () => void;
  setMobileFiltersOpen: (open: boolean) => void;
  setSearchFocused: (focused: boolean) => void;

  // Utility actions
  resetStore: () => void;
  getProductById: (id: string) => InsuranceProduct | undefined;
  getProductBySlug: (slug: string) => InsuranceProduct | undefined;
  isInComparison: (productId: string) => boolean;
  canAddToComparison: () => boolean;
}

// ============================================================================
// Default Values
// ============================================================================

/**
 * Default filters state
 */
const defaultFilters: InsuranceFilters = {
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
};

/**
 * Default pagination state
 */
const defaultPagination: PaginationOptions = {
  page: 1,
  limit: 12,
  total: 0,
  totalPages: 0,
  hasNext: false,
  hasPrev: false,
};

/**
 * Default comparison state
 */
const defaultComparison: ComparisonState = {
  selectedProducts: [],
  maxProducts: 3,
  canAddMore: true,
  isFull: false,
};

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get available issuers from products
 */
const getAvailableIssuers = (products: InsuranceProduct[]): string[] => {
  const uniqueIssuers = new Set(products.map((product) => product.issuer));
  return Array.from(uniqueIssuers).sort();
};

/**
 * Get available provinces from products
 */
const getAvailableProvinces = (products: InsuranceProduct[]): string[] => {
  const allProvinces = new Set<string>();
  products.forEach((product) => {
    product.availability.provinces.forEach((province) => {
      allProvinces.add(province);
    });
  });
  return Array.from(allProvinces).sort();
};

/**
 * Get coverage range from products
 */
const getCoverageRange = (
  products: InsuranceProduct[],
): { min: number; max: number } => {
  let min = Number.MAX_SAFE_INTEGER;
  let max = 0;

  products.forEach((product) => {
    // Check all coverage types
    Object.values(product.coverage).forEach((coverage) => {
      if (!coverage.disabled && coverage.limit > 0) {
        min = Math.min(min, coverage.limit);
        max = Math.max(max, coverage.limit);
      }
    });

    // Check vehicle coverage if present
    if (product.vehicleCoverage) {
      Object.values(product.vehicleCoverage).forEach((coverage) => {
        if (typeof coverage === "object" && coverage && "limit" in coverage) {
          if (!coverage.disabled && coverage.limit > 0) {
            min = Math.min(min, coverage.limit);
            max = Math.max(max, coverage.limit);
          }
        }
      });
    }
  });

  return { min: min === Number.MAX_SAFE_INTEGER ? 0 : min, max };
};

/**
 * Get premium range from products
 */
const getPremiumRange = (
  products: InsuranceProduct[],
): { min: number; max: number } => {
  let min = Number.MAX_SAFE_INTEGER;
  let max = 0;

  products.forEach((product) => {
    min = Math.min(min, product.pricing.totalPremium);
    max = Math.max(max, product.pricing.totalPremium);
  });

  return { min: min === Number.MAX_SAFE_INTEGER ? 0 : min, max };
};

// ============================================================================
// Filter Functions
// ============================================================================

/**
 * Apply filters to insurance products
 */
const applyFilters = (
  products: InsuranceProduct[],
  filters: InsuranceFilters,
  searchQuery: string,
): InsuranceProduct[] => {
  return products.filter((product) => {
    // Category filter
    if (
      filters.categories.length > 0 &&
      !filters.categories.includes(product.category)
    ) {
      return false;
    }

    // Type filter
    if (filters.types.length > 0 && !filters.types.includes(product.type)) {
      return false;
    }

    // Issuer filter
    if (
      filters.issuers.length > 0 &&
      !filters.issuers.includes(product.issuer)
    ) {
      return false;
    }

    // Coverage range filters
    if (
      product.coverage.personalAccident.limit <
        filters.coverageRange.personalAccident.min ||
      product.coverage.personalAccident.limit >
        filters.coverageRange.personalAccident.max
    ) {
      return false;
    }

    if (
      product.coverage.propertyDamage.limit <
        filters.coverageRange.propertyDamage.min ||
      product.coverage.propertyDamage.limit >
        filters.coverageRange.propertyDamage.max
    ) {
      return false;
    }

    if (
      product.coverage.medicalExpenses.limit <
        filters.coverageRange.medicalExpenses.min ||
      product.coverage.medicalExpenses.limit >
        filters.coverageRange.medicalExpenses.max
    ) {
      return false;
    }

    // Premium range filter
    if (
      product.pricing.totalPremium < filters.premiumRange.min ||
      product.pricing.totalPremium > filters.premiumRange.max
    ) {
      return false;
    }

    // Fee type filter
    if (
      filters.feeTypes.length > 0 &&
      !filters.feeTypes.includes(product.pricing.feeType)
    ) {
      return false;
    }

    // Coverage period filter
    if (
      filters.coveragePeriods.length > 0 &&
      !filters.coveragePeriods.includes(product.pricing.coveragePeriod)
    ) {
      return false;
    }

    // Age range filter
    if (
      product.eligibility.ageRange.min > filters.ageRange.max ||
      (product.eligibility.ageRange.max &&
        product.eligibility.ageRange.max < filters.ageRange.min)
    ) {
      return false;
    }

    // Pre-existing conditions filter
    if (
      filters.includePreExistingConditions &&
      (!product.eligibility.preExistingConditions ||
        product.eligibility.preExistingConditions.allowed.length === 0)
    ) {
      return false;
    }

    // Feature filters
    if (
      filters.hasRoadsideAssistance &&
      (!product.additionalServices ||
        !product.additionalServices.roadsideAssistance)
    ) {
      return false;
    }

    if (
      filters.hasWorldwideCoverage &&
      (!product.additionalServices ||
        !product.additionalServices.worldwideCoverage)
    ) {
      return false;
    }

    if (
      filters.hasMedicalHotline &&
      (!product.additionalServices ||
        !product.additionalServices.medicalHotline)
    ) {
      return false;
    }

    if (
      filters.hasLegalSupport &&
      (!product.additionalServices || !product.additionalServices.legalSupport)
    ) {
      return false;
    }

    // Claims filters
    if (product.claims.approvalRate < filters.minApprovalRate) {
      return false;
    }

    if (product.claims.processingTime > filters.maxProcessingTime) {
      return false;
    }

    // Regional filters
    if (filters.provinces.length > 0) {
      if (!product.availability.nationalAvailability) {
        const hasProvince = filters.provinces.some((province) =>
          product.availability.provinces.includes(province),
        );
        if (!hasProvince) return false;
      }
    }

    if (
      filters.nationalAvailability &&
      !product.availability.nationalAvailability
    ) {
      return false;
    }

    // Special filters
    if (filters.isNew && !product.isNew) {
      return false;
    }

    if (filters.isRecommended && !product.isRecommended) {
      return false;
    }

    if (filters.isExclusive && !product.isExclusive) {
      return false;
    }

    if (filters.hasAutoRenewal && !product.renewal.autoRenewal) {
      return false;
    }

    if (
      filters.hasInstallments &&
      !product.paymentOptions.installmentAvailable
    ) {
      return false;
    }

    // Rating filter
    if (product.rating < filters.minRating) {
      return false;
    }

    // Search query filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const searchableText = [
        product.name,
        product.issuer,
        product.features.join(" "),
        product.benefits.join(" "),
        product.tags.join(" "),
        product.productCode || "",
      ]
        .join(" ")
        .toLowerCase();

      if (!searchableText.includes(query)) {
        return false;
      }
    }

    return true;
  });
};

/**
 * Sort products based on the selected option
 */
const sortProducts = (
  products: InsuranceProduct[],
  sortBy: SortOption,
): InsuranceProduct[] => {
  const sorted = [...products];

  switch (sortBy) {
    case "featured": // SortOption.FEATURED
      // Sort by recommended first, then by rating
      return sorted.sort((a, b) => {
        if (a.isRecommended !== b.isRecommended) {
          return b.isRecommended ? 1 : -1;
        }
        return b.rating - a.rating;
      });

    case "rating-desc": // SortOption.RATING_DESC
      return sorted.sort((a, b) => b.rating - a.rating);

    case "rating-asc": // SortOption.RATING_ASC
      return sorted.sort((a, b) => a.rating - b.rating);

    case "premium-asc": // SortOption.PREMIUM_ASC
      return sorted.sort(
        (a, b) => a.pricing.totalPremium - b.pricing.totalPremium,
      );

    case "premium-desc": // SortOption.PREMIUM_DESC
      return sorted.sort(
        (a, b) => b.pricing.totalPremium - a.pricing.totalPremium,
      );

    case "coverage-asc": // SortOption.COVERAGE_ASC
      // Sort by maximum coverage limit
      return sorted.sort((a, b) => {
        const getMaxCoverage = (product: InsuranceProduct) => {
          return Math.max(
            ...Object.values(product.coverage).map((c) =>
              c.disabled ? 0 : c.limit,
            ),
          );
        };
        return getMaxCoverage(a) - getMaxCoverage(b);
      });

    case "coverage-desc": // SortOption.COVERAGE_DESC
      // Sort by maximum coverage limit descending
      return sorted.sort((a, b) => {
        const getMaxCoverage = (product: InsuranceProduct) => {
          return Math.max(
            ...Object.values(product.coverage).map((c) =>
              c.disabled ? 0 : c.limit,
            ),
          );
        };
        return getMaxCoverage(b) - getMaxCoverage(a);
      });

    case "claims-approved-desc": // SortOption.CLAIMS_APPROVED_DESC
      return sorted.sort(
        (a, b) => b.claims.approvalRate - a.claims.approvalRate,
      );

    case "claims-time-asc": // SortOption.CLAIMS_TIME_ASC
      return sorted.sort(
        (a, b) => a.claims.processingTime - b.claims.processingTime,
      );

    case "newest": // SortOption.NEWEST
      return sorted.sort(
        (a, b) =>
          new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
      );

    case "name-asc": // SortOption.NAME_ASC
      return sorted.sort((a, b) => a.name.localeCompare(b.name));

    case "name-desc": // SortOption.NAME_DESC
      return sorted.sort((a, b) => b.name.localeCompare(a.name));

    default:
      return sorted;
  }
};

/**
 * Calculate active filters count
 */
const calculateActiveFiltersCount = (filters: InsuranceFilters): number => {
  let count = 0;

  // Basic filters
  if (filters.categories.length > 0) count++;
  if (filters.types.length > 0) count++;
  if (filters.issuers.length > 0) count++;

  // Coverage filters
  if (
    filters.coverageRange.personalAccident.min > 0 ||
    filters.coverageRange.personalAccident.max < 5000000000 ||
    filters.coverageRange.propertyDamage.min > 0 ||
    filters.coverageRange.propertyDamage.max < 10000000000 ||
    filters.coverageRange.medicalExpenses.min > 0 ||
    filters.coverageRange.medicalExpenses.max < 5000000000
  )
    count++;

  if (filters.specificCoverages.length > 0) count++;

  // Pricing filters
  if (filters.premiumRange.min > 0 || filters.premiumRange.max < 50000000)
    count++;

  if (filters.feeTypes.length > 0) count++;
  if (filters.coveragePeriods.length > 0) count++;

  // Eligibility filters
  if (filters.ageRange.min > 0 || filters.ageRange.max < 100) count++;
  if (filters.includePreExistingConditions) count++;

  // Features filters
  if (filters.hasRoadsideAssistance) count++;
  if (filters.hasWorldwideCoverage) count++;
  if (filters.hasMedicalHotline) count++;
  if (filters.hasLegalSupport) count++;

  // Claims filters
  if (filters.minApprovalRate > 0) count++;
  if (filters.maxProcessingTime < 30) count++;

  // Regional filters
  if (filters.provinces.length > 0) count++;
  if (filters.nationalAvailability) count++;

  // Special filters
  if (filters.isNew) count++;
  if (filters.isRecommended) count++;
  if (filters.isExclusive) count++;
  if (filters.hasAutoRenewal) count++;
  if (filters.hasInstallments) count++;

  // Rating filter
  if (filters.minRating > 1) count++;

  return count;
};

// ============================================================================
// Store Creation
// ============================================================================

/**
 * Create the insurance store with persistence and devtools
 */
export const useInsuranceStore = create<InsuranceStore>()(
  devtools(
    persist(
      immer((set, get) => {
        return {
          // Initial state
          products: INSURANCE_PRODUCTS,
          categories: INSURANCE_CATEGORIES,

          filters: defaultFilters,
          activeFiltersCount: 0,

          comparison: defaultComparison,

          searchQuery: "",
          sortOption: "featured" as SortOption,
          pagination: {
            ...defaultPagination,
            total: INSURANCE_PRODUCTS.length,
          },
          viewMode: "grid",
          isLoading: false,
          isError: false,

          sidebarOpen: false,
          mobileFiltersOpen: false,
          searchFocused: false,

          // Actions
          setProducts: (products) => {
            set((state) => {
              state.products = products;
              state.pagination.total = products.length;
              // Note: Available options are computed in selectors
            });
          },

          setFilters: (newFilters) => {
            set((state) => {
              Object.assign(state.filters, newFilters);
              state.activeFiltersCount = calculateActiveFiltersCount(
                state.filters,
              );
              state.pagination.page = 1; // Reset to first page when filters change
            });
          },

          clearFilters: () => {
            set((state) => {
              state.filters = { ...defaultFilters };
              state.activeFiltersCount = 0;
              state.pagination.page = 1;
            });
          },

          setSearchQuery: (query) => {
            set((state) => {
              state.searchQuery = query;
              state.pagination.page = 1; // Reset to first page when search changes
            });
          },

          setSortOption: (sortOption) => {
            set((state) => {
              state.sortOption = sortOption;
            });
          },

          setPagination: (newPagination) => {
            set((state) => {
              Object.assign(state.pagination, newPagination);

              // Note: totalPages, hasNext, and hasPrev will be calculated in selectors
            });
          },

          setLoading: (loading) => {
            set((state) => {
              state.isLoading = loading;
            });
          },

          setError: (error) => {
            set((state) => {
              state.isError = !!error;
              state.error = error;
            });
          },

          // Comparison actions
          addToComparison: (productId) => {
            set((state) => {
              if (
                state.comparison.selectedProducts.length >=
                  state.comparison.maxProducts ||
                state.comparison.selectedProducts.includes(productId)
              ) {
                return;
              }

              state.comparison.selectedProducts.push(productId);
              state.comparison.canAddMore =
                state.comparison.selectedProducts.length <
                state.comparison.maxProducts;
              state.comparison.isFull =
                state.comparison.selectedProducts.length >=
                state.comparison.maxProducts;
            });
          },

          removeFromComparison: (productId) => {
            set((state) => {
              state.comparison.selectedProducts =
                state.comparison.selectedProducts.filter(
                  (id) => id !== productId,
                );
              state.comparison.canAddMore = true;
              state.comparison.isFull = false;
            });
          },

          clearComparison: () => {
            set((state) => {
              state.comparison.selectedProducts = [];
              state.comparison.canAddMore = true;
              state.comparison.isFull = false;
            });
          },

          // UI actions
          setViewMode: (viewMode) => {
            set((state) => {
              state.viewMode = viewMode;
            });
          },

          toggleSidebar: () => {
            set((state) => {
              state.sidebarOpen = !state.sidebarOpen;
            });
          },

          setMobileFiltersOpen: (open) => {
            set((state) => {
              state.mobileFiltersOpen = open;
            });
          },

          setSearchFocused: (focused) => {
            set((state) => {
              state.searchFocused = focused;
            });
          },

          // Utility actions
          resetStore: () => {
            set((state) => {
              state.filters = { ...defaultFilters };
              state.activeFiltersCount = 0;
              state.comparison = { ...defaultComparison };
              state.searchQuery = "";
              state.sortOption = SortOption.FEATURED;
              state.pagination = {
                ...defaultPagination,
                total: state.products.length,
                totalPages: Math.ceil(
                  state.products.length / defaultPagination.limit,
                ),
              };
              state.viewMode = "grid";
              state.isLoading = false;
              state.isError = false;
              state.error = undefined;
              state.sidebarOpen = false;
              state.mobileFiltersOpen = false;
              state.searchFocused = false;
            });
          },

          getProductById: (id) => {
            const state = get();
            return state.products.find((product) => product.id === id);
          },

          getProductBySlug: (slug) => {
            const state = get();
            return state.products.find((product) => product.slug === slug);
          },

          isInComparison: (productId) => {
            const state = get();
            return state.comparison.selectedProducts.includes(productId);
          },

          canAddToComparison: () => {
            const state = get();
            return (
              state.comparison.selectedProducts.length <
              state.comparison.maxProducts
            );
          },
        };
      }),
      {
        name: "insurance-storage",
        // Persist specific fields to avoid bloating storage
        partialize: (state) => ({
          filters: state.filters,
          comparison: state.comparison,
          searchQuery: state.searchQuery,
          sortOption: state.sortOption,
          viewMode: state.viewMode,
          pagination: {
            page: state.pagination.page,
            limit: state.pagination.limit,
          },
          sidebarOpen: state.sidebarOpen,
        }),
        version: 1,
        onRehydrateStorage: () => (state) => {
          // Validate and fix comparison data on rehydration
          if (state && state.comparison) {
            // Ensure comparison state is valid
            state.comparison.canAddMore =
              state.comparison.selectedProducts.length <
              state.comparison.maxProducts;
            state.comparison.isFull =
              state.comparison.selectedProducts.length >=
              state.comparison.maxProducts;
          }
        },
      },
    ),
    {
      name: "InsuranceStore",
    },
  ),
);

// ============================================================================
// Selectors for commonly used state
// ============================================================================

/**
 * Hook to get filtered and sorted products
 */
export const useFilteredInsuranceProducts = () => {
  const { products, filters, searchQuery, sortOption } = useInsuranceStore(
    useShallow((state) => ({
      products: state.products,
      filters: state.filters,
      searchQuery: state.searchQuery,
      sortOption: state.sortOption,
    })),
  );

  return useMemo(() => {
    const filtered = applyFilters(products, filters, searchQuery);
    return sortProducts(filtered, sortOption);
  }, [products, filters, searchQuery, sortOption]);
};

/**
 * Hook to get paginated products
 */
export const usePaginatedInsuranceProducts = () => {
  const filteredProducts = useFilteredInsuranceProducts();
  const { page, limit } = useInsuranceStore(
    useShallow((state) => ({
      page: state.pagination.page,
      limit: state.pagination.limit,
    })),
  );

  return useMemo(() => {
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    return filteredProducts.slice(startIndex, endIndex);
  }, [filteredProducts, page, limit]);
};

/**
 * Hook to get comparison state
 */
export const useInsuranceComparison = () => {
  const { comparison, getProductById } = useInsuranceStore(
    useShallow((state) => ({
      comparison: state.comparison,
      getProductById: state.getProductById,
    })),
  );

  return useMemo(
    () => ({
      comparison,
      comparisonProducts: comparison.selectedProducts
        .map((id) => getProductById(id))
        .filter(Boolean) as InsuranceProduct[],
      canAddMore: comparison.selectedProducts.length < comparison.maxProducts,
      isFull: comparison.selectedProducts.length >= comparison.maxProducts,
      maxProducts: comparison.maxProducts,
    }),
    [comparison, getProductById],
  );
};

/**
 * Hook to get filter state
 */
export const useInsuranceFilters = () => {
  const { filters, activeFiltersCount, products } = useInsuranceStore(
    useShallow((state) => ({
      filters: state.filters,
      activeFiltersCount: state.activeFiltersCount,
      products: state.products,
    })),
  );

  const computedValues = useMemo(
    () => ({
      availableCategories: INSURANCE_CATEGORIES,
      availableIssuers: getAvailableIssuers(products),
      availableProvinces: getAvailableProvinces(products),
      coverageRange: getCoverageRange(products),
      premiumRange: getPremiumRange(products),
    }),
    [products],
  );

  return useMemo(
    () => ({
      filters,
      activeFiltersCount,
      ...computedValues,
    }),
    [filters, activeFiltersCount, computedValues],
  );
};

/**
 * Hook to get search and sort state
 */
export const useInsuranceSearch = () => {
  const { searchQuery, sortOption, viewMode, pagination, products, filters } =
    useInsuranceStore(
      useShallow((state) => ({
        searchQuery: state.searchQuery,
        sortOption: state.sortOption,
        viewMode: state.viewMode,
        pagination: state.pagination,
        products: state.products,
        filters: state.filters,
      })),
    );

  const totalProducts = useMemo(() => {
    const filtered = applyFilters(products, filters, searchQuery);
    return filtered.length;
  }, [products, filters, searchQuery]);

  return useMemo(
    () => ({
      searchQuery,
      sortOption,
      viewMode,
      pagination: {
        ...pagination,
        totalPages: Math.ceil(totalProducts / pagination.limit),
        hasNext: pagination.page < Math.ceil(totalProducts / pagination.limit),
        hasPrev: pagination.page > 1,
      },
      totalProducts,
    }),
    [searchQuery, sortOption, viewMode, pagination, totalProducts],
  );
};

/**
 * Hook to get UI state
 */
export const useInsuranceUI = () =>
  useInsuranceStore(
    useShallow((state) => ({
      viewMode: state.viewMode,
      sidebarOpen: state.sidebarOpen,
      mobileFiltersOpen: state.mobileFiltersOpen,
      searchFocused: state.searchFocused,
      isLoading: state.isLoading,
      isError: state.isError,
      error: state.error,
    })),
  );

/**
 * Hook to get product actions
 */
export const useInsuranceActions = () =>
  useInsuranceStore(
    useShallow((state) => ({
      setFilters: state.setFilters,
      clearFilters: state.clearFilters,
      addToComparison: state.addToComparison,
      removeFromComparison: state.removeFromComparison,
      clearComparison: state.clearComparison,
      setSearchQuery: state.setSearchQuery,
      setSortOption: state.setSortOption,
      setPagination: state.setPagination,
      setViewMode: state.setViewMode,
      toggleSidebar: state.toggleSidebar,
      setMobileFiltersOpen: state.setMobileFiltersOpen,
      setSearchFocused: state.setSearchFocused,
      resetStore: state.resetStore,
      setLoading: state.setLoading,
      setError: state.setError,
    })),
  );

/**
 * Hook to get product getters
 */
export const useInsuranceGetters = () =>
  useInsuranceStore(
    useShallow((state) => ({
      getProductById: state.getProductById,
      getProductBySlug: state.getProductBySlug,
      isInComparison: state.isInComparison,
      canAddToComparison: state.canAddToComparison,
    })),
  );

/**
 * Hook for store hydration
 */
export const useInsuranceHydrated = () => {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // Note: Zustand persist handles hydration automatically
    // This is just for reference if needed
    setHydrated(true);
  }, []);

  return hydrated;
};
