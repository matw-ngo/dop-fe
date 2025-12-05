/**
 * Credit Cards Store
 *
 * Zustand store for managing credit cards state, including filtering,
 * comparison, search, and UI preferences for the credit cards comparison feature.
 */

import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { useState, useEffect, useMemo } from "react";
import { useShallow } from "zustand/shallow";
import type {
  CreditCard,
  CardCategory,
  CardNetwork,
  CreditCardFilters,
  SortOption,
  PaginationOptions,
  ComparisonState,
} from "@/types/credit-card";
import { vietnameseCreditCards } from "@/data/credit-cards";

// ============================================================================
// Store Types
// ============================================================================

/**
 * Credit Cards store state interface
 */
export interface CreditCardsStore {
  // Data
  cards: CreditCard[];
  categories: CardCategory[];

  // Filters
  filters: CreditCardFilters;
  activeFiltersCount: number;

  // Comparison
  comparison: ComparisonState;

  // UI State
  searchQuery: string;
  sortBy: SortOption;
  pagination: PaginationOptions;
  viewMode: "grid" | "list";
  isLoading: boolean;
  isError: boolean;
  error?: string;

  // Sidebar/Mobile UI
  sidebarOpen: boolean;
  mobileFiltersOpen: boolean;
  searchFocused: boolean;

  // Actions
  setFilters: (filters: Partial<CreditCardFilters>) => void;
  clearFilters: () => void;
  setSearchQuery: (query: string) => void;
  setSortBy: (option: SortOption) => void;
  setPagination: (pagination: Partial<PaginationOptions>) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | undefined) => void;

  // Comparison actions
  addToComparison: (cardId: string) => void;
  removeFromComparison: (cardId: string) => void;
  clearComparison: () => void;

  // UI actions
  setViewMode: (mode: "grid" | "list") => void;
  toggleSidebar: () => void;
  setMobileFiltersOpen: (open: boolean) => void;
  setSearchFocused: (focused: boolean) => void;

  // Utility actions
  resetStore: () => void;
  getCardById: (id: string) => CreditCard | undefined;
  isInComparison: (cardId: string) => boolean;
  canAddToComparison: () => boolean;
}

// ============================================================================
// Default Values
// ============================================================================

/**
 * Default filters state
 */
const defaultFilters: CreditCardFilters = {
  // Basic Filters
  categories: [],
  networks: [],
  issuers: [],

  // Financial Filters
  annualFeeType: [],
  annualFeeRange: {
    min: 0,
    max: 10000000, // 10 million VND
  },
  hasAnnualFeeWaiver: false,

  // Requirements Filters
  ageRange: {
    min: 18,
    max: 70,
  },
  incomeRange: {
    min: 0,
    max: 100000000, // 100 million VND
  },
  creditLimitRange: {
    min: 0,
    max: 2000000000, // 2 billion VND
  },
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
  selectedCards: [],
  maxCards: 3,
  canAddMore: true,
  isFull: false,
};

/**
 * Available categories from the data
 */
const getAvailableCategories = (cards: CreditCard[]): CardCategory[] => {
  const uniqueCategories = new Set(cards.map((card) => card.category));
  return Array.from(uniqueCategories);
};

/**
 * Available networks from the data
 */
const getAvailableNetworks = (cards: CreditCard[]): CardNetwork[] => {
  const uniqueNetworks = new Set(cards.map((card) => card.cardType));
  return Array.from(uniqueNetworks);
};

/**
 * Available issuers from the data
 */
const getAvailableIssuers = (cards: CreditCard[]): string[] => {
  const uniqueIssuers = new Set(cards.map((card) => card.issuer));
  return Array.from(uniqueIssuers).sort();
};

// ============================================================================
// Filter Functions
// ============================================================================

/**
 * Apply filters to credit cards
 */
const applyFilters = (
  cards: CreditCard[],
  filters: CreditCardFilters,
  searchQuery: string,
): CreditCard[] => {
  return cards.filter((card) => {
    // Category filter
    if (
      filters.categories.length > 0 &&
      !filters.categories.includes(card.category)
    ) {
      return false;
    }

    // Network filter
    if (
      filters.networks.length > 0 &&
      !filters.networks.includes(card.cardType)
    ) {
      return false;
    }

    // Issuer filter
    if (filters.issuers.length > 0 && !filters.issuers.includes(card.issuer)) {
      return false;
    }

    // Annual fee type filter
    if (
      filters.annualFeeType.length > 0 &&
      !filters.annualFeeType.includes(card.annualFeeType)
    ) {
      return false;
    }

    // Annual fee range filter
    if (
      card.annualFee < filters.annualFeeRange.min ||
      card.annualFee > filters.annualFeeRange.max
    ) {
      return false;
    }

    // Annual fee waiver filter
    if (
      filters.hasAnnualFeeWaiver &&
      card.annualFeeType !== "waivable" &&
      card.annualFeeType !== "free"
    ) {
      return false;
    }

    // Age range filter
    if (
      card.ageRequiredMin > filters.ageRange.max ||
      (card.ageRequiredMax && card.ageRequiredMax < filters.ageRange.min)
    ) {
      return false;
    }

    // Income range filter
    if (card.incomeRequiredMin > filters.incomeRange.max) {
      return false;
    }
    if (
      card.incomeRequiredMax &&
      card.incomeRequiredMax < filters.incomeRange.min
    ) {
      return false;
    }

    // Employment type filter
    if (
      filters.employmentTypes.length > 0 &&
      card.employmentType &&
      !filters.employmentTypes.includes(card.employmentType)
    ) {
      return false;
    }

    // Province filter
    if (filters.provinces.length > 0) {
      if (!card.nationalAvailability) {
        const hasProvince = filters.provinces.some((province) =>
          card.provinces.includes(province),
        );
        if (!hasProvince) return false;
      }
    }

    // Rewards types filter
    if (filters.rewardsTypes.length > 0 && card.rewardsProgram) {
      const hasMatchingReward = filters.rewardsTypes.some(
        (type) =>
          card.rewardsProgram?.type === type ||
          card.rewardsProgram?.categories?.some((cat) =>
            cat.category.toLowerCase().includes(type.toLowerCase()),
          ),
      );
      if (!hasMatchingReward) return false;
    }

    // Welcome offer filter
    if (filters.hasWelcomeOffer && !card.welcomeOffer) {
      return false;
    }

    // Installment plans filter
    if (
      filters.hasInstallmentPlans &&
      (!card.installmentPlans || card.installmentPlans.length === 0)
    ) {
      return false;
    }

    // Insurance filter
    if (
      filters.hasInsurance &&
      (!card.insurance || Object.values(card.insurance).every((v) => !v))
    ) {
      return false;
    }

    // Digital features filter
    if (filters.digitalFeatures.length > 0 && card.digitalFeatures) {
      const hasMatchingFeature = filters.digitalFeatures.some(
        (feature) =>
          card.digitalFeatures?.[
            feature as keyof typeof card.digitalFeatures
          ] === true,
      );
      if (!hasMatchingFeature) return false;
    }

    // Special filters
    if (filters.isNew && !card.isNew) {
      return false;
    }
    if (filters.isRecommended && !card.isRecommended) {
      return false;
    }
    if (filters.isExclusive && !card.isExclusive) {
      return false;
    }

    // Rating filter
    if (card.rating < filters.minRating) {
      return false;
    }

    // Search query filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const searchableText = [
        card.name,
        card.issuer,
        card.features.join(" "),
        card.benefits.join(" "),
        card.tags.join(" "),
        card.cardType,
        card.category,
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
 * Sort cards based on the selected option
 */
const sortCards = (cards: CreditCard[], sortBy: SortOption): CreditCard[] => {
  const sorted = [...cards];

  switch (sortBy) {
    case "featured":
      // Sort by recommended first, then by rating
      return sorted.sort((a, b) => {
        if (a.isRecommended !== b.isRecommended) {
          return b.isRecommended ? 1 : -1;
        }
        return b.rating - a.rating;
      });

    case "rating-desc":
      return sorted.sort((a, b) => b.rating - a.rating);

    case "rating-asc":
      return sorted.sort((a, b) => a.rating - b.rating);

    case "fee-asc":
      return sorted.sort((a, b) => a.annualFee - b.annualFee);

    case "fee-desc":
      return sorted.sort((a, b) => b.annualFee - a.annualFee);

    case "rate-asc":
      return sorted.sort((a, b) => a.interestRate - b.interestRate);

    case "rate-desc":
      return sorted.sort((a, b) => b.interestRate - a.interestRate);

    case "limit-asc":
      return sorted.sort((a, b) => a.creditLimitMax - b.creditLimitMax);

    case "limit-desc":
      return sorted.sort((a, b) => b.creditLimitMax - a.creditLimitMax);

    case "income-asc":
      return sorted.sort((a, b) => a.incomeRequiredMin - b.incomeRequiredMin);

    case "income-desc":
      return sorted.sort((a, b) => b.incomeRequiredMin - a.incomeRequiredMin);

    case "reviews-desc":
      return sorted.sort((a, b) => b.reviewCount - a.reviewCount);

    case "newest":
      return sorted.sort(
        (a, b) =>
          new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
      );

    case "name-asc":
      return sorted.sort((a, b) => a.name.localeCompare(b.name));

    case "name-desc":
      return sorted.sort((a, b) => b.name.localeCompare(a.name));

    default:
      return sorted;
  }
};

/**
 * Calculate active filters count
 */
const calculateActiveFiltersCount = (filters: CreditCardFilters): number => {
  let count = 0;

  // Basic filters
  if (filters.categories.length > 0) count++;
  if (filters.networks.length > 0) count++;
  if (filters.issuers.length > 0) count++;

  // Financial filters
  if (filters.annualFeeType.length > 0) count++;
  if (filters.annualFeeRange.min > 0 || filters.annualFeeRange.max < 10000000)
    count++;
  if (filters.hasAnnualFeeWaiver) count++;

  // Requirements filters
  if (filters.ageRange.min > 18 || filters.ageRange.max < 70) count++;
  if (filters.incomeRange.min > 0 || filters.incomeRange.max < 100000000)
    count++;
  if (filters.employmentTypes.length > 0) count++;
  if (filters.provinces.length > 0) count++;

  // Feature filters
  if (filters.rewardsTypes.length > 0) count++;
  if (filters.hasWelcomeOffer) count++;
  if (filters.hasInstallmentPlans) count++;
  if (filters.hasInsurance) count++;

  // Digital features
  if (filters.digitalFeatures.length > 0) count++;

  // Special filters
  if (filters.isNew) count++;
  if (filters.isRecommended) count++;
  if (filters.isExclusive) count++;

  // Rating filter
  if (filters.minRating > 1) count++;

  return count;
};

// ============================================================================
// Store Creation
// ============================================================================

/**
 * Create the credit cards store with persistence and devtools
 */
export const useCreditCardsStore = create<CreditCardsStore>()(
  devtools(
    persist(
      immer((set, get) => {
        return {
          // Initial state
          cards: vietnameseCreditCards,
          categories: getAvailableCategories(vietnameseCreditCards),

          filters: defaultFilters,
          activeFiltersCount: 0,

          comparison: defaultComparison,

          searchQuery: "",
          sortBy: "featured" as SortOption,
          pagination: {
            ...defaultPagination,
            total: vietnameseCreditCards.length,
          },
          viewMode: "grid",
          isLoading: false,
          isError: false,

          sidebarOpen: false,
          mobileFiltersOpen: false,
          searchFocused: false,

          // Actions
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

          setSortBy: (sortBy) => {
            set((state) => {
              state.sortBy = sortBy;
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
          addToComparison: (cardId) => {
            set((state) => {
              if (
                state.comparison.selectedCards.length >=
                  state.comparison.maxCards ||
                state.comparison.selectedCards.includes(cardId)
              ) {
                return;
              }

              state.comparison.selectedCards.push(cardId);
              state.comparison.canAddMore =
                state.comparison.selectedCards.length <
                state.comparison.maxCards;
              state.comparison.isFull =
                state.comparison.selectedCards.length >=
                state.comparison.maxCards;
            });
          },

          removeFromComparison: (cardId) => {
            set((state) => {
              state.comparison.selectedCards =
                state.comparison.selectedCards.filter((id) => id !== cardId);
              state.comparison.canAddMore = true;
              state.comparison.isFull = false;
            });
          },

          clearComparison: () => {
            set((state) => {
              state.comparison.selectedCards = [];
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
              state.sortBy = "featured" as SortOption;
              state.pagination = {
                ...defaultPagination,
                total: state.cards.length,
                totalPages: Math.ceil(
                  state.cards.length / defaultPagination.limit,
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

          getCardById: (id) => {
            const state = get();
            return state.cards.find((card) => card.id === id);
          },

          isInComparison: (cardId) => {
            const state = get();
            return state.comparison.selectedCards.includes(cardId);
          },

          canAddToComparison: () => {
            const state = get();
            return (
              state.comparison.selectedCards.length < state.comparison.maxCards
            );
          },
        };
      }),
      {
        name: "credit-cards-storage",
        // Persist specific fields to avoid bloating storage
        partialize: (state) => ({
          filters: state.filters,
          comparison: state.comparison,
          searchQuery: state.searchQuery,
          sortBy: state.sortBy,
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
              state.comparison.selectedCards.length < state.comparison.maxCards;
            state.comparison.isFull =
              state.comparison.selectedCards.length >=
              state.comparison.maxCards;
          }
        },
      },
    ),
    {
      name: "CreditCardsStore",
    },
  ),
);

// ============================================================================
// Selectors for commonly used state
// ============================================================================

/**
 * Hook to get filtered and sorted cards
 */
export const useFilteredCreditCards = () => {
  const { cards, filters, searchQuery, sortBy } = useCreditCardsStore(
    useShallow((state) => ({
      cards: state.cards,
      filters: state.filters,
      searchQuery: state.searchQuery,
      sortBy: state.sortBy,
    })),
  );

  return useMemo(() => {
    const filtered = applyFilters(cards, filters, searchQuery);
    return sortCards(filtered, sortBy);
  }, [cards, filters, searchQuery, sortBy]);
};

/**
 * Hook to get paginated cards
 */
export const usePaginatedCreditCards = () => {
  const filteredCards = useFilteredCreditCards();
  const { page, limit } = useCreditCardsStore(
    useShallow((state) => ({
      page: state.pagination.page,
      limit: state.pagination.limit,
    })),
  );

  return useMemo(() => {
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    return filteredCards.slice(startIndex, endIndex);
  }, [filteredCards, page, limit]);
};

/**
 * Hook to get comparison state
 */
export const useCreditCardComparison = () => {
  const { comparison, getCardById } = useCreditCardsStore(
    useShallow((state) => ({
      comparison: state.comparison,
      getCardById: state.getCardById,
    })),
  );

  return useMemo(
    () => ({
      comparison,
      comparisonCards: comparison.selectedCards
        .map((id) => getCardById(id))
        .filter(Boolean) as CreditCard[],
      canAddMore: comparison.selectedCards.length < comparison.maxCards,
      isFull: comparison.selectedCards.length >= comparison.maxCards,
      maxCards: comparison.maxCards,
    }),
    [comparison, getCardById],
  );
};

/**
 * Hook to get filter state
 */
export const useCreditCardFilters = () => {
  const { filters, activeFiltersCount, cards } = useCreditCardsStore(
    useShallow((state) => ({
      filters: state.filters,
      activeFiltersCount: state.activeFiltersCount,
      cards: state.cards,
    })),
  );

  const computedValues = useMemo(
    () => ({
      availableCategories: getAvailableCategories(cards),
      availableNetworks: getAvailableNetworks(cards),
      availableIssuers: getAvailableIssuers(cards),
    }),
    [cards],
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
export const useCreditCardSearch = () => {
  const { searchQuery, sortBy, viewMode, pagination, cards, filters } =
    useCreditCardsStore(
      useShallow((state) => ({
        searchQuery: state.searchQuery,
        sortBy: state.sortBy,
        viewMode: state.viewMode,
        pagination: state.pagination,
        cards: state.cards,
        filters: state.filters,
      })),
    );

  const totalCards = useMemo(() => {
    const filtered = applyFilters(cards, filters, searchQuery);
    return filtered.length;
  }, [cards, filters, searchQuery]);

  return useMemo(
    () => ({
      searchQuery,
      sortBy,
      viewMode,
      pagination: {
        ...pagination,
        totalPages: Math.ceil(totalCards / pagination.limit),
        hasNext: pagination.page < Math.ceil(totalCards / pagination.limit),
        hasPrev: pagination.page > 1,
      },
      totalCards,
    }),
    [searchQuery, sortBy, viewMode, pagination, totalCards],
  );
};

/**
 * Hook to get UI state
 */
export const useCreditCardUI = () =>
  useCreditCardsStore(
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
 * Hook to get card actions
 */
export const useCreditCardActions = () =>
  useCreditCardsStore(
    useShallow((state) => ({
      setFilters: state.setFilters,
      clearFilters: state.clearFilters,
      addToComparison: state.addToComparison,
      removeFromComparison: state.removeFromComparison,
      clearComparison: state.clearComparison,
      setSearchQuery: state.setSearchQuery,
      setSortBy: state.setSortBy,
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
 * Hook to get card getters
 */
export const useCreditCardGetters = () =>
  useCreditCardsStore(
    useShallow((state) => ({
      getProductById: state.getCardById, // Renamed for consistency
      getCardById: state.getCardById, // Backward compatibility
      isInComparison: state.isInComparison,
      canAddToComparison: state.canAddToComparison,
    })),
  );

/**
 * Hook to get computed properties for backward compatibility
 */
export const useCreditCardsComputedState = () => {
  const filteredCards = useFilteredCreditCards();
  const { pagination, comparison } = useCreditCardsStore(
    useShallow((state) => ({
      pagination: state.pagination,
      comparison: state.comparison,
    })),
  );
  const { getCardById } = useCreditCardGetters();

  return useMemo(
    () => ({
      filteredCards,
      currentPage: pagination.page,
      comparisonCards: comparison.selectedCards
        .map((id) => getCardById(id))
        .filter(Boolean) as CreditCard[],
      setCurrentPage: (page: number) => {
        useCreditCardsStore.getState().setPagination({ page });
      },
    }),
    [filteredCards, pagination.page, comparison.selectedCards, getCardById],
  );
};

/**
 * Hook for store hydration
 */
export const useCreditCardsHydrated = () => {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // Note: Zustand persist handles hydration automatically
    // This is just for reference if needed
    setHydrated(true);
  }, []);

  return hydrated;
};

/**
 * Backward compatibility hook that provides the old store interface
 * This should be used by components that haven't migrated to the new selector-based hooks
 */
export const useCreditCardsStoreLegacy = () => {
  const store = useCreditCardsStore();
  const filteredCards = useFilteredCreditCards();
  const { getCardById } = useCreditCardGetters();
  const { comparisonCards } = useCreditCardComparison();

  return {
    // Direct store properties
    ...store,

    // Computed properties for backward compatibility
    filteredCards,
    currentPage: store.pagination.page,
    comparisonCards,
    setCurrentPage: (page: number) => store.setPagination({ page }),

    // Backward compatibility aliases
    getProductById: store.getCardById,
  };
};
