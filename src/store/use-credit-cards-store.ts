/**
 * Credit Cards Store
 *
 * Zustand store for managing credit cards state, including filtering,
 * comparison, search, and UI preferences for the credit cards comparison feature.
 */

import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { useState, useEffect } from "react";
import type {
  CreditCard,
  CardCategory,
  CardNetwork,
  CreditCardFilters,
  SortOption,
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
  comparisonCards: CreditCard[];
  maxComparisonCards: 3;

  // UI State
  searchQuery: string;
  sortBy: SortOption;
  currentPage: number;
  viewMode: "grid" | "list";

  // Computed values (derived state)
  filteredCards: CreditCard[];
  paginatedCards: CreditCard[];
  availableCategories: CardCategory[];
  availableNetworks: CardNetwork[];
  availableIssuers: string[];

  // Actions
  setFilters: (filters: Partial<CreditCardFilters>) => void;
  clearFilters: () => void;
  addToComparison: (cardId: string) => void;
  removeFromComparison: (cardId: string) => void;
  clearComparison: () => void;
  setSearchQuery: (query: string) => void;
  setSortBy: (option: SortOption) => void;
  setCurrentPage: (page: number) => void;
  setViewMode: (mode: "grid" | "list") => void;

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
        // Initialize available options from the data
        const availableCategories = getAvailableCategories(
          vietnameseCreditCards,
        );
        const availableNetworks = getAvailableNetworks(vietnameseCreditCards);
        const availableIssuers = getAvailableIssuers(vietnameseCreditCards);

        return {
          // Initial state
          cards: vietnameseCreditCards,
          categories: availableCategories,
          availableCategories,
          availableNetworks,
          availableIssuers,

          filters: defaultFilters,
          activeFiltersCount: 0,

          comparisonCards: [],
          maxComparisonCards: 3,

          searchQuery: "",
          sortBy: "featured",
          currentPage: 1,
          viewMode: "grid",

          // Computed values
          get filteredCards() {
            const state = get();
            const filtered = applyFilters(
              state.cards,
              state.filters,
              state.searchQuery,
            );
            return sortCards(filtered, state.sortBy);
          },

          get paginatedCards() {
            const state = get();
            const itemsPerPage = 12; // You can make this configurable
            const startIndex = (state.currentPage - 1) * itemsPerPage;
            return state.filteredCards.slice(
              startIndex,
              startIndex + itemsPerPage,
            );
          },

          // Actions
          setFilters: (newFilters) => {
            set((state) => {
              Object.assign(state.filters, newFilters);
              state.activeFiltersCount = calculateActiveFiltersCount(
                state.filters,
              );
              state.currentPage = 1; // Reset to first page when filters change
            });
          },

          clearFilters: () => {
            set((state) => {
              state.filters = { ...defaultFilters };
              state.activeFiltersCount = 0;
              state.currentPage = 1;
            });
          },

          addToComparison: (cardId) => {
            set((state) => {
              const card = state.cards.find((c) => c.id === cardId);
              if (
                !card ||
                state.comparisonCards.length >= state.maxComparisonCards
              ) {
                return;
              }

              const alreadyInComparison = state.comparisonCards.some(
                (c) => c.id === cardId,
              );
              if (alreadyInComparison) {
                return;
              }

              state.comparisonCards.push(card);
            });
          },

          removeFromComparison: (cardId) => {
            set((state) => {
              state.comparisonCards = state.comparisonCards.filter(
                (card) => card.id !== cardId,
              );
            });
          },

          clearComparison: () => {
            set((state) => {
              state.comparisonCards = [];
            });
          },

          setSearchQuery: (query) => {
            set((state) => {
              state.searchQuery = query;
              state.currentPage = 1; // Reset to first page when search changes
            });
          },

          setSortBy: (sortBy) => {
            set((state) => {
              state.sortBy = sortBy;
            });
          },

          setCurrentPage: (page) => {
            set((state) => {
              state.currentPage = page;
            });
          },

          setViewMode: (viewMode) => {
            set((state) => {
              state.viewMode = viewMode;
            });
          },

          // Utility actions
          resetStore: () => {
            set((state) => {
              state.filters = { ...defaultFilters };
              state.activeFiltersCount = 0;
              state.comparisonCards = [];
              state.searchQuery = "";
              state.sortBy = "featured";
              state.currentPage = 1;
              state.viewMode = "grid";
            });
          },

          getCardById: (id) => {
            const state = get();
            return state.cards.find((card) => card.id === id);
          },

          isInComparison: (cardId) => {
            const state = get();
            return state.comparisonCards.some((card) => card.id === cardId);
          },

          canAddToComparison: () => {
            const state = get();
            return state.comparisonCards.length < state.maxComparisonCards;
          },
        };
      }),
      {
        name: "credit-cards-storage",
        // Persist specific fields to avoid bloating storage
        partialize: (state) => ({
          filters: state.filters,
          comparisonCards: state.comparisonCards.map((card) => card.id), // Only store IDs
          searchQuery: state.searchQuery,
          sortBy: state.sortBy,
          viewMode: state.viewMode,
          currentPage: state.currentPage,
        }),
        version: 1,
        // Hydrate comparison cards from stored IDs
        onRehydrateStorage: () => (state) => {
          if (
            state &&
            state.comparisonCards.length > 0 &&
            typeof state.comparisonCards[0] === "string"
          ) {
            // Convert stored IDs back to card objects
            state.comparisonCards = state.comparisonCards
              .map((card) =>
                vietnameseCreditCards.find((_card) => _card.id === card.id),
              )
              .filter(Boolean) as CreditCard[];
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
export const useFilteredCreditCards = () =>
  useCreditCardsStore((state) => state.filteredCards);

/**
 * Hook to get paginated cards
 */
export const usePaginatedCreditCards = () =>
  useCreditCardsStore((state) => state.paginatedCards);

/**
 * Hook to get comparison state
 */
export const useCreditCardComparison = () =>
  useCreditCardsStore((state) => ({
    comparisonCards: state.comparisonCards,
    canAddMore: state.canAddToComparison(),
    isFull: state.comparisonCards.length >= state.maxComparisonCards,
    maxCards: state.maxComparisonCards,
  }));

/**
 * Hook to get filter state
 */
export const useCreditCardFilters = () =>
  useCreditCardsStore((state) => ({
    filters: state.filters,
    activeFiltersCount: state.activeFiltersCount,
    availableCategories: state.availableCategories,
    availableNetworks: state.availableNetworks,
    availableIssuers: state.availableIssuers,
  }));

/**
 * Hook to get search and sort state
 */
export const useCreditCardSearch = () =>
  useCreditCardsStore((state) => ({
    searchQuery: state.searchQuery,
    sortBy: state.sortBy,
    viewMode: state.viewMode,
    currentPage: state.currentPage,
    totalCards: state.filteredCards.length,
  }));

/**
 * Hook to get card actions
 */
export const useCreditCardActions = () =>
  useCreditCardsStore((state) => ({
    setFilters: state.setFilters,
    clearFilters: state.clearFilters,
    addToComparison: state.addToComparison,
    removeFromComparison: state.removeFromComparison,
    clearComparison: state.clearComparison,
    setSearchQuery: state.setSearchQuery,
    setSortBy: state.setSortBy,
    setCurrentPage: state.setCurrentPage,
    setViewMode: state.setViewMode,
    resetStore: state.resetStore,
  }));

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
