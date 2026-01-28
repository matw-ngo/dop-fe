// Loan Product Store
// Zustand store for managing loan product comparison, eligibility, and calculations

import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import type {
  ApplicantProfile,
  EligibilityResult,
} from "@/lib/loan-products/eligibility-rules";
import type {
  LoanCalculationParams,
  LoanCalculationResult,
} from "@/lib/loan-products/interest-calculations";
import type {
  VietnameseLoanProduct,
  VietnameseLoanType,
} from "@/lib/loan-products/vietnamese-loan-products";

/**
 * Product comparison interface
 */
interface ProductComparison {
  /** Unique comparison ID */
  id: string;
  /** Comparison name */
  name: string;
  /** Products being compared */
  productIds: string[];
  /** Products data */
  products: VietnameseLoanProduct[];
  /** Loan amount for comparison */
  loanAmount: number;
  /** Loan term for comparison */
  loanTerm: number;
  /** Calculation results for each product */
  calculations: Array<{
    productId: string;
    result: LoanCalculationResult;
  }>;
  /** Created at */
  createdAt: string;
  /** Updated at */
  updatedAt: string;
  /** Notes */
  notes?: string;
  /** Is public */
  isPublic: boolean;
}

/**
 * Product filter criteria
 */
interface ProductFilters {
  /** Loan types */
  loanTypes: VietnameseLoanType[];
  /** Bank codes */
  bankCodes: string[];
  /** Minimum amount */
  minAmount?: number;
  /** Maximum amount */
  maxAmount?: number;
  /** Minimum term */
  minTerm?: number;
  /** Maximum term */
  maxTerm?: number;
  /** Maximum interest rate */
  maxInterestRate?: number;
  /** Collateral required */
  collateralRequired?: boolean;
  /** Featured only */
  featuredOnly?: boolean;
  /** Online application only */
  onlineApplicationOnly?: boolean;
  /** Fast approval only */
  fastApprovalOnly?: boolean;
}

/**
 * Product preferences
 */
interface ProductPreferences {
  /** Preferred banks */
  preferredBanks: string[];
  /** Maximum interest rate */
  maxInterestRate?: number;
  /** Maximum processing time (days) */
  maxProcessingTime?: number;
  /** Requires online application */
  requiresOnlineApplication?: boolean;
  /** Requires fast approval */
  requiresFastApproval?: boolean;
  /** Prefers early repayment */
  prefersEarlyRepayment?: boolean;
}

/**
 * Loan Product Store State
 */
interface LoanProductStoreState {
  // Product data
  /** All available products */
  products: VietnameseLoanProduct[];
  /** Currently selected products for comparison */
  selectedProducts: VietnameseLoanProduct[];
  /** Favorite products */
  favoriteProducts: string[];
  /** Recently viewed products */
  recentlyViewed: string[];

  // Search and filtering
  /** Current search term */
  searchTerm: string;
  /** Current filters */
  filters: ProductFilters;
  /** Sort criteria */
  sortBy:
    | "popularity"
    | "interest_rate"
    | "processing_time"
    | "max_amount"
    | "rating";
  /** Sort order */
  sortOrder: "asc" | "desc";

  // Comparison state
  /** Current comparison */
  currentComparison: ProductComparison | null;
  /** Saved comparisons */
  savedComparisons: ProductComparison[];
  /** Comparison view mode */
  comparisonViewMode: "table" | "cards";

  // Calculator state
  /** Current calculation parameters */
  calculationParams: LoanCalculationParams;
  /** Current calculation results */
  calculationResults: Record<string, LoanCalculationResult>;

  // Eligibility state
  /** Current applicant profile */
  applicantProfile: Partial<ApplicantProfile>;
  /** Eligibility results */
  eligibilityResults: Record<string, EligibilityResult>;

  // Preferences
  /** User preferences */
  preferences: ProductPreferences;

  // UI state
  /** Loading state */
  loading: boolean;
  /** Error state */
  error: string | null;

  // Cache state
  /** Last updated timestamp */
  lastUpdated: string;
  /** Cache expiry time (minutes) */
  cacheExpiryMinutes: number;
}

/**
 * Loan Product Store Actions
 */
interface LoanProductStoreActions {
  // Product management
  /** Set all products */
  setProducts: (products: VietnameseLoanProduct[]) => void;
  /** Add product */
  addProduct: (product: VietnameseLoanProduct) => void;
  /** Update product */
  updateProduct: (id: string, updates: Partial<VietnameseLoanProduct>) => void;
  /** Remove product */
  removeProduct: (id: string) => void;
  /** Get product by ID */
  getProduct: (id: string) => VietnameseLoanProduct | undefined;

  // Selection management
  /** Select product for comparison */
  selectProduct: (product: VietnameseLoanProduct) => void;
  /** Deselect product */
  deselectProduct: (productId: string) => void;
  /** Toggle product selection */
  toggleProductSelection: (product: VietnameseLoanProduct) => void;
  /** Clear all selections */
  clearSelections: () => void;
  /** Set selected products */
  setSelectedProducts: (products: VietnameseLoanProduct[]) => void;
  /** Check if product is selected */
  isProductSelected: (productId: string) => boolean;

  // Favorites management
  /** Toggle favorite product */
  toggleFavoriteProduct: (productId: string) => void;
  /** Add to favorites */
  addToFavorites: (productId: string) => void;
  /** Remove from favorites */
  removeFromFavorites: (productId: string) => void;
  /** Check if product is favorited */
  isProductFavorited: (productId: string) => boolean;

  // Recently viewed
  /** Add to recently viewed */
  addToRecentlyViewed: (productId: string) => void;
  /** Clear recently viewed */
  clearRecentlyViewed: () => void;

  // Search and filtering
  /** Set search term */
  setSearchTerm: (term: string) => void;
  /** Update filters */
  updateFilters: (filters: Partial<ProductFilters>) => void;
  /** Clear filters */
  clearFilters: () => void;
  /** Set sort criteria */
  setSortBy: (sortBy: LoanProductStoreState["sortBy"]) => void;
  /** Set sort order */
  setSortOrder: (order: "asc" | "desc") => void;

  // Comparison management
  /** Start new comparison */
  startComparison: (name: string, loanAmount: number, loanTerm: number) => void;
  /** Add product to comparison */
  addToComparison: (product: VietnameseLoanProduct) => void;
  /** Remove product from comparison */
  removeFromComparison: (productId: string) => void;
  /** Update comparison calculation */
  updateComparisonCalculation: (
    productId: string,
    result: LoanCalculationResult,
  ) => void;
  /** Save comparison */
  saveComparison: (name?: string, notes?: string, isPublic?: boolean) => void;
  /** Load comparison */
  loadComparison: (comparisonId: string) => void;
  /** Delete saved comparison */
  deleteSavedComparison: (comparisonId: string) => void;
  /** Clear current comparison */
  clearCurrentComparison: () => void;

  // Calculator
  /** Update calculation parameters */
  updateCalculationParams: (params: Partial<LoanCalculationParams>) => void;
  /** Set calculation result */
  setCalculationResult: (
    productId: string,
    result: LoanCalculationResult,
  ) => void;
  /** Get calculation result */
  getCalculationResult: (
    productId: string,
  ) => LoanCalculationResult | undefined;
  /** Clear calculation results */
  clearCalculationResults: () => void;

  // Eligibility
  /** Update applicant profile */
  updateApplicantProfile: (profile: Partial<ApplicantProfile>) => void;
  /** Set eligibility result */
  setEligibilityResult: (productId: string, result: EligibilityResult) => void;
  /** Get eligibility result */
  getEligibilityResult: (productId: string) => EligibilityResult | undefined;
  /** Clear eligibility results */
  clearEligibilityResults: () => void;

  // Preferences
  /** Update preferences */
  updatePreferences: (preferences: Partial<ProductPreferences>) => void;

  // UI state
  /** Set loading state */
  setLoading: (loading: boolean) => void;
  /** Set error state */
  setError: (error: string | null) => void;
  /** Clear error */
  clearError: () => void;

  // Cache management
  /** Check if cache is expired */
  isCacheExpired: () => boolean;
  /** Refresh cache timestamp */
  refreshCacheTimestamp: () => void;

  // Utility actions
  /** Get filtered and sorted products */
  getFilteredProducts: () => VietnameseLoanProduct[];
  /** Get products by type */
  getProductsByType: (loanType: VietnameseLoanType) => VietnameseLoanProduct[];
  /** Get products by bank */
  getProductsByBank: (bankCode: string) => VietnameseLoanProduct[];
  /** Search products */
  searchProducts: (term: string) => VietnameseLoanProduct[];
  /** Get best matching products */
  getBestMatches: (limit?: number) => VietnameseLoanProduct[];
}

/**
 * Combined Loan Product Store Type
 */
type LoanProductStore = LoanProductStoreState & LoanProductStoreActions;

/**
 * Loan Product Store Implementation
 */
export const useLoanProductStore = create<LoanProductStore>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        products: [],
        selectedProducts: [],
        favoriteProducts: [],
        recentlyViewed: [],
        searchTerm: "",
        filters: {
          loanTypes: [],
          bankCodes: [],
        },
        sortBy: "popularity",
        sortOrder: "desc",
        currentComparison: null,
        savedComparisons: [],
        comparisonViewMode: "table",
        calculationParams: {
          principal: 2000000000, // 2 tỷ VND
          term: 24, // 24 months
          annualRate: 10.5,
          rateType: "reducing",
          calculationMethod: "monthly",
        },
        calculationResults: {},
        applicantProfile: {},
        eligibilityResults: {},
        preferences: {
          preferredBanks: [],
        },
        loading: false,
        error: null,
        lastUpdated: new Date().toISOString(),
        cacheExpiryMinutes: 60,

        // Product management actions
        setProducts: (products) => set({ products }),

        addProduct: (product) =>
          set((state) => ({
            products: [
              ...state.products.filter((p) => p.id !== product.id),
              product,
            ],
          })),

        updateProduct: (id, updates) =>
          set((state) => ({
            products: state.products.map((product) =>
              product.id === id ? { ...product, ...updates } : product,
            ),
          })),

        removeProduct: (id) =>
          set((state) => ({
            products: state.products.filter((product) => product.id !== id),
            selectedProducts: state.selectedProducts.filter(
              (product) => product.id !== id,
            ),
            favoriteProducts: state.favoriteProducts.filter(
              (productId) => productId !== id,
            ),
            recentlyViewed: state.recentlyViewed.filter(
              (productId) => productId !== id,
            ),
          })),

        getProduct: (id) => {
          return get().products.find((product) => product.id === id);
        },

        // Selection management actions
        selectProduct: (product) =>
          set((state) => {
            if (state.selectedProducts.length >= 3) {
              return {
                error: "Maximum 3 products can be compared at once",
              };
            }
            return {
              selectedProducts: [
                ...state.selectedProducts.filter((p) => p.id !== product.id),
                product,
              ],
            };
          }),

        deselectProduct: (productId) =>
          set((state) => ({
            selectedProducts: state.selectedProducts.filter(
              (product) => product.id !== productId,
            ),
          })),

        toggleProductSelection: (product) => {
          const state = get();
          if (state.isProductSelected(product.id)) {
            get().deselectProduct(product.id);
          } else {
            get().selectProduct(product);
          }
        },

        clearSelections: () => set({ selectedProducts: [] }),

        setSelectedProducts: (products) =>
          set({
            selectedProducts: products.slice(0, 3), // Limit to 3 products
          }),

        isProductSelected: (productId) => {
          return get().selectedProducts.some(
            (product) => product.id === productId,
          );
        },

        // Favorites management actions
        toggleFavoriteProduct: (productId) => {
          const state = get();
          if (state.isProductFavorited(productId)) {
            get().removeFromFavorites(productId);
          } else {
            get().addToFavorites(productId);
          }
        },

        addToFavorites: (productId) =>
          set((state) => ({
            favoriteProducts: [
              ...new Set([...state.favoriteProducts, productId]),
            ],
          })),

        removeFromFavorites: (productId) =>
          set((state) => ({
            favoriteProducts: state.favoriteProducts.filter(
              (id) => id !== productId,
            ),
          })),

        isProductFavorited: (productId) => {
          return get().favoriteProducts.includes(productId);
        },

        // Recently viewed actions
        addToRecentlyViewed: (productId) =>
          set((state) => {
            const filtered = state.recentlyViewed.filter(
              (id) => id !== productId,
            );
            return {
              recentlyViewed: [productId, ...filtered].slice(0, 10), // Keep last 10
            };
          }),

        clearRecentlyViewed: () => set({ recentlyViewed: [] }),

        // Search and filtering actions
        setSearchTerm: (term) => set({ searchTerm: term }),

        updateFilters: (filters) =>
          set((state) => ({
            filters: { ...state.filters, ...filters },
          })),

        clearFilters: () =>
          set({
            filters: {
              loanTypes: [],
              bankCodes: [],
            },
          }),

        setSortBy: (sortBy) => set({ sortBy }),

        setSortOrder: (order) => set({ sortOrder: order }),

        // Comparison management actions
        startComparison: (name, loanAmount, loanTerm) =>
          set((state) => ({
            currentComparison: {
              id: `comparison_${Date.now()}`,
              name,
              productIds: state.selectedProducts.map((p) => p.id),
              products: state.selectedProducts,
              loanAmount,
              loanTerm,
              calculations: [],
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              isPublic: false,
            },
          })),

        addToComparison: (product) =>
          set((state) => {
            if (!state.currentComparison) return state;

            const existingIds = state.currentComparison.productIds;
            if (existingIds.includes(product.id) || existingIds.length >= 3)
              return state;

            return {
              currentComparison: {
                ...state.currentComparison,
                productIds: [...existingIds, product.id],
                products: [...state.currentComparison.products, product],
                updatedAt: new Date().toISOString(),
              },
            };
          }),

        removeFromComparison: (productId) =>
          set((state) => {
            if (!state.currentComparison) return state;

            return {
              currentComparison: {
                ...state.currentComparison,
                productIds: state.currentComparison.productIds.filter(
                  (id) => id !== productId,
                ),
                products: state.currentComparison.products.filter(
                  (p) => p.id !== productId,
                ),
                calculations: state.currentComparison.calculations.filter(
                  (c) => c.productId !== productId,
                ),
                updatedAt: new Date().toISOString(),
              },
            };
          }),

        updateComparisonCalculation: (productId, result) =>
          set((state) => {
            if (!state.currentComparison) return state;

            const existingCalcIndex =
              state.currentComparison.calculations.findIndex(
                (calc) => calc.productId === productId,
              );

            const newCalculations = [...state.currentComparison.calculations];
            if (existingCalcIndex >= 0) {
              newCalculations[existingCalcIndex] = { productId, result };
            } else {
              newCalculations.push({ productId, result });
            }

            return {
              currentComparison: {
                ...state.currentComparison,
                calculations: newCalculations,
                updatedAt: new Date().toISOString(),
              },
            };
          }),

        saveComparison: (name, notes, isPublic) => {
          const state = get();
          if (!state.currentComparison) return;

          const savedComparison = {
            ...state.currentComparison,
            name: name || state.currentComparison.name,
            notes,
            isPublic: isPublic || false,
          };

          set({
            savedComparisons: [...state.savedComparisons, savedComparison],
          });
        },

        loadComparison: (comparisonId) => {
          const comparison = get().savedComparisons.find(
            (c) => c.id === comparisonId,
          );
          if (comparison) {
            set({
              currentComparison: comparison,
              selectedProducts: comparison.products,
            });
          }
        },

        deleteSavedComparison: (comparisonId) =>
          set((state) => ({
            savedComparisons: state.savedComparisons.filter(
              (c) => c.id !== comparisonId,
            ),
            currentComparison:
              state.currentComparison?.id === comparisonId
                ? null
                : state.currentComparison,
          })),

        clearCurrentComparison: () => set({ currentComparison: null }),

        // Calculator actions
        updateCalculationParams: (params) =>
          set((state) => ({
            calculationParams: { ...state.calculationParams, ...params },
          })),

        setCalculationResult: (productId, result) =>
          set((state) => ({
            calculationResults: {
              ...state.calculationResults,
              [productId]: result,
            },
          })),

        getCalculationResult: (productId) => {
          return get().calculationResults[productId];
        },

        clearCalculationResults: () => set({ calculationResults: {} }),

        // Eligibility actions
        updateApplicantProfile: (profile) =>
          set((state) => ({
            applicantProfile: { ...state.applicantProfile, ...profile },
          })),

        setEligibilityResult: (productId, result) =>
          set((state) => ({
            eligibilityResults: {
              ...state.eligibilityResults,
              [productId]: result,
            },
          })),

        getEligibilityResult: (productId) => {
          return get().eligibilityResults[productId];
        },

        clearEligibilityResults: () => set({ eligibilityResults: {} }),

        // Preferences actions
        updatePreferences: (preferences) =>
          set((state) => ({
            preferences: { ...state.preferences, ...preferences },
          })),

        // UI state actions
        setLoading: (loading) => set({ loading }),
        setError: (error) => set({ error }),
        clearError: () => set({ error: null }),

        // Cache management actions
        isCacheExpired: () => {
          const state = get();
          const now = new Date();
          const lastUpdated = new Date(state.lastUpdated);
          const diffMinutes =
            (now.getTime() - lastUpdated.getTime()) / (1000 * 60);
          return diffMinutes > state.cacheExpiryMinutes;
        },

        refreshCacheTimestamp: () =>
          set({
            lastUpdated: new Date().toISOString(),
          }),

        // Utility actions
        getFilteredProducts: () => {
          const state = get();
          let filtered = [...state.products];

          // Apply search term
          if (state.searchTerm) {
            const term = state.searchTerm.toLowerCase();
            filtered = filtered.filter(
              (product) =>
                product.nameVi.toLowerCase().includes(term) ||
                product.nameEn.toLowerCase().includes(term) ||
                product.descriptionVi.toLowerCase().includes(term) ||
                product.bank.nameVi.toLowerCase().includes(term) ||
                product.bank.code.toLowerCase().includes(term),
            );
          }

          // Apply filters
          if (state.filters.loanTypes.length > 0) {
            filtered = filtered.filter((product) =>
              state.filters.loanTypes.includes(product.loanType),
            );
          }

          if (state.filters.bankCodes.length > 0) {
            filtered = filtered.filter((product) =>
              state.filters.bankCodes.includes(product.bank.code),
            );
          }

          if (state.filters.minAmount !== undefined) {
            filtered = filtered.filter(
              (product) => product.amountLimits.max >= state.filters.minAmount!,
            );
          }

          if (state.filters.maxAmount !== undefined) {
            filtered = filtered.filter(
              (product) => product.amountLimits.min <= state.filters.maxAmount!,
            );
          }

          if (state.filters.minTerm !== undefined) {
            filtered = filtered.filter(
              (product) => product.termOptions.max >= state.filters.minTerm!,
            );
          }

          if (state.filters.maxTerm !== undefined) {
            filtered = filtered.filter(
              (product) => product.termOptions.min <= state.filters.maxTerm!,
            );
          }

          if (state.filters.maxInterestRate !== undefined) {
            filtered = filtered.filter(
              (product) =>
                product.interestRate.annual <= state.filters.maxInterestRate!,
            );
          }

          if (state.filters.collateralRequired !== undefined) {
            filtered = filtered.filter(
              (product) =>
                product.eligibility.collateralRequired ===
                state.filters.collateralRequired,
            );
          }

          if (state.filters.featuredOnly) {
            filtered = filtered.filter((product) => product.metadata.featured);
          }

          if (state.filters.onlineApplicationOnly) {
            filtered = filtered.filter(
              (product) => product.features.onlineApplication,
            );
          }

          if (state.filters.fastApprovalOnly) {
            filtered = filtered.filter(
              (product) => product.features.fastApproval,
            );
          }

          // Apply sorting
          filtered.sort((a, b) => {
            let comparison = 0;

            switch (state.sortBy) {
              case "interest_rate":
                comparison = a.interestRate.annual - b.interestRate.annual;
                break;
              case "processing_time":
                comparison =
                  a.applicationRequirements.processingTime.min -
                  b.applicationRequirements.processingTime.min;
                break;
              case "max_amount":
                comparison = a.amountLimits.max - b.amountLimits.max;
                break;
              case "rating": {
                const aRating = a.metadata.averageRating || 0;
                const bRating = b.metadata.averageRating || 0;
                comparison = aRating - bRating;
                break;
              }
              default:
                comparison =
                  a.metadata.popularityScore - b.metadata.popularityScore;
                break;
            }

            return state.sortOrder === "asc" ? comparison : -comparison;
          });

          return filtered;
        },

        getProductsByType: (loanType) => {
          const state = get();
          return state.products.filter(
            (product) => product.loanType === loanType && product.active,
          );
        },

        getProductsByBank: (bankCode) => {
          const state = get();
          return state.products.filter(
            (product) => product.bank.code === bankCode && product.active,
          );
        },

        searchProducts: (term) => {
          const state = get();
          const searchTerm = term.toLowerCase();
          return state.products.filter(
            (product) =>
              product.active &&
              (product.nameVi.toLowerCase().includes(searchTerm) ||
                product.nameEn.toLowerCase().includes(searchTerm) ||
                product.descriptionVi.toLowerCase().includes(searchTerm) ||
                product.bank.nameVi.toLowerCase().includes(searchTerm) ||
                product.metadata.tags.some((tag) =>
                  tag.toLowerCase().includes(searchTerm),
                )),
          );
        },

        getBestMatches: (limit = 5) => {
          const state = get();
          return state.products
            .filter((product) => product.active && product.metadata.featured)
            .sort(
              (a, b) => b.metadata.popularityScore - a.metadata.popularityScore,
            )
            .slice(0, limit);
        },
      }),
      {
        name: "loan-product-storage",
        // Only persist specific fields to avoid bloating storage
        partialize: (state) => ({
          favoriteProducts: state.favoriteProducts,
          recentlyViewed: state.recentlyViewed,
          filters: state.filters,
          sortBy: state.sortBy,
          sortOrder: state.sortOrder,
          preferences: state.preferences,
          savedComparisons: state.savedComparisons,
        }),
      },
    ),
    {
      name: "LoanProductStore",
    },
  ),
);

/**
 * Selectors for common use cases
 */
export const useProducts = () => useLoanProductStore((state) => state.products);
export const useSelectedProducts = () =>
  useLoanProductStore((state) => state.selectedProducts);
export const useFavoriteProducts = () =>
  useLoanProductStore((state) => state.favoriteProducts);
export const useCurrentComparison = () =>
  useLoanProductStore((state) => state.currentComparison);
export const useCalculationParams = () =>
  useLoanProductStore((state) => state.calculationParams);
export const useApplicantProfile = () =>
  useLoanProductStore((state) => state.applicantProfile);
export const useProductFilters = () =>
  useLoanProductStore((state) => state.filters);
export const useProductLoading = () =>
  useLoanProductStore((state) => state.loading);
export const useProductError = () =>
  useLoanProductStore((state) => state.error);

/**
 * Derived selectors
 */
export const useFilteredProducts = () => {
  const getFilteredProducts = useLoanProductStore(
    (state) => state.getFilteredProducts,
  );
  return getFilteredProducts();
};

export const useIsProductSelected = (productId: string) => {
  const isProductSelected = useLoanProductStore(
    (state) => state.isProductSelected,
  );
  return isProductSelected(productId);
};

export const useIsProductFavorited = (productId: string) => {
  const isProductFavorited = useLoanProductStore(
    (state) => state.isProductFavorited,
  );
  return isProductFavorited(productId);
};

export const useCalculationResult = (productId: string) => {
  const getCalculationResult = useLoanProductStore(
    (state) => state.getCalculationResult,
  );
  return getCalculationResult(productId);
};

export const useEligibilityResult = (productId: string) => {
  const getEligibilityResult = useLoanProductStore(
    (state) => state.getEligibilityResult,
  );
  return getEligibilityResult(productId);
};
