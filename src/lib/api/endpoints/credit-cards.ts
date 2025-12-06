// @ts-nocheck
/**
 * Credit Cards API Endpoints
 *
 * API endpoints for credit card search, filtering, comparison, and analytics
 * for the Vietnamese digital lending platform.
 */

import apiClient from "@/lib/api/client";
import type {
  CreditCard,
  CardCategory,
  CardNetwork,
  CreditCardFilters,
  SearchOptions,
  SortOption,
  PaginationOptions,
  ComparisonResult,
  CardCategoryInfo,
  CreditCardsResponse,
  CreditCardDetailResponse,
} from "@/types/credit-card";
import { vietnameseCreditCards } from "@/data/credit-cards";

// Using mock data, no API client needed

// Types for API responses (reusing from financial-tools pattern)
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: {
    timestamp: string;
    requestId: string;
    version: string;
  };
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface SearchResponse {
  cards: CreditCard[];
  facets: {
    categories: Array<{ id: CardCategory; name: string; count: number }>;
    issuers: Array<{ name: string; count: number }>;
    networks: Array<{ type: CardNetwork; count: number }>;
  };
  suggestions?: string[];
}

export interface ClickTrackingRequest {
  cardId: string;
  source: "listing" | "detail" | "comparison" | "recommendation";
  position?: number;
  sessionId?: string;
  userId?: string;
}

export interface ClickTrackingResponse {
  success: boolean;
  redirectUrl: string;
  trackingId: string;
}

// Helper functions for data manipulation
const filterCards = (
  cards: CreditCard[],
  filters: Partial<CreditCardFilters>,
): CreditCard[] => {
  return cards.filter((card) => {
    // Category filter
    if (filters.categories && filters.categories.length > 0) {
      if (!filters.categories.includes(card.category)) return false;
    }

    // Network filter
    if (filters.networks && filters.networks.length > 0) {
      if (!filters.networks.includes(card.cardType)) return false;
    }

    // Issuer filter
    if (filters.issuers && filters.issuers.length > 0) {
      if (!filters.issuers.includes(card.issuer)) return false;
    }

    // Annual fee type filter
    if (filters.annualFeeType && filters.annualFeeType.length > 0) {
      if (!filters.annualFeeType.includes(card.annualFeeType)) return false;
    }

    // Annual fee range filter
    if (filters.annualFeeRange) {
      if (
        card.annualFee < filters.annualFeeRange.min ||
        card.annualFee > filters.annualFeeRange.max
      )
        return false;
    }

    // Annual fee waiver filter
    if (filters.hasAnnualFeeWaiver !== undefined) {
      const hasWaiver =
        card.annualFeeType === "waivable" || card.annualFeeType === "free";
      if (filters.hasAnnualFeeWaiver !== hasWaiver) return false;
    }

    // Age range filter
    if (filters.ageRange) {
      if (
        card.ageRequiredMin > filters.ageRange.max ||
        (card.ageRequiredMax && card.ageRequiredMax < filters.ageRange.min)
      )
        return false;
    }

    // Income range filter
    if (filters.incomeRange) {
      if (
        card.incomeRequiredMin > filters.incomeRange.max ||
        (card.incomeRequiredMax &&
          card.incomeRequiredMax < filters.incomeRange.min)
      )
        return false;
    }

    // Employment type filter
    if (filters.employmentTypes && filters.employmentTypes.length > 0) {
      if (
        !card.employmentType ||
        !filters.employmentTypes.includes(card.employmentType)
      )
        return false;
    }

    // Province filter
    if (filters.provinces && filters.provinces.length > 0) {
      // If card is NOT nationally available, check if it's available in the selected provinces
      if (!card.nationalAvailability) {
        const hasProvince = filters.provinces.some((province) =>
          card.provinces.includes(province),
        );
        if (!hasProvince) return false;
      }
      // If card IS nationally available, it passes the province filter
    }

    // Welcome offer filter
    if (filters.hasWelcomeOffer !== undefined) {
      const hasOffer = !!card.welcomeOffer;
      if (filters.hasWelcomeOffer !== hasOffer) return false;
    }

    // Installment plans filter
    if (filters.hasInstallmentPlans !== undefined) {
      const hasPlans =
        !!card.installmentPlans && card.installmentPlans.length > 0;
      if (filters.hasInstallmentPlans !== hasPlans) return false;
    }

    // Insurance filter
    if (filters.hasInsurance !== undefined) {
      const hasInsurance =
        !!card.insurance && Object.values(card.insurance).some((v) => v);
      if (filters.hasInsurance !== hasInsurance) return false;
    }

    // New card filter
    if (filters.isNew !== undefined) {
      if (filters.isNew !== !!card.isNew) return false;
    }

    // Recommended filter
    if (filters.isRecommended !== undefined) {
      if (filters.isRecommended !== !!card.isRecommended) return false;
    }

    // Exclusive filter
    if (filters.isExclusive !== undefined) {
      if (filters.isExclusive !== !!card.isExclusive) return false;
    }

    // Rating filter
    if (filters.minRating && card.rating < filters.minRating) return false;

    return true;
  });
};

const sortCards = (cards: CreditCard[], sortBy: SortOption): CreditCard[] => {
  const sorted = [...cards];

  switch (sortBy) {
    case "featured":
      return sorted.sort((a, b) => {
        if (a.isRecommended && !b.isRecommended) return -1;
        if (!a.isRecommended && b.isRecommended) return 1;
        if (a.isExclusive && !b.isExclusive) return -1;
        if (!a.isExclusive && b.isExclusive) return 1;
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
      return sorted.sort((a, b) => a.creditLimitMin - b.creditLimitMin);

    case "limit-desc":
      return sorted.sort((a, b) => b.creditLimitMin - a.creditLimitMin);

    case "income-asc":
      return sorted.sort((a, b) => a.incomeRequiredMin - b.incomeRequiredMin);

    case "income-desc":
      return sorted.sort((a, b) => b.incomeRequiredMin - a.incomeRequiredMin);

    case "reviews-desc":
      return sorted.sort((a, b) => b.reviewCount - a.reviewCount);

    case "newest":
      return sorted.sort(
        (a, b) => b.publishedAt.getTime() - a.publishedAt.getTime(),
      );

    case "name-asc":
      return sorted.sort((a, b) => a.name.localeCompare(b.name));

    case "name-desc":
      return sorted.sort((a, b) => b.name.localeCompare(a.name));

    default:
      return sorted;
  }
};

const searchCards = (
  cards: CreditCard[],
  query: string,
  fields?: string[],
): CreditCard[] => {
  if (!query.trim()) return cards;

  const searchFields = fields || [
    "name",
    "issuer",
    "features",
    "benefits",
    "tags",
  ];
  const lowerQuery = query.toLowerCase();

  return cards.filter((card) => {
    return searchFields.some((field) => {
      const value = (card as any)[field];
      if (Array.isArray(value)) {
        return value.some((item: string) =>
          item.toLowerCase().includes(lowerQuery),
        );
      }
      if (typeof value === "string") {
        return value.toLowerCase().includes(lowerQuery);
      }
      return false;
    });
  });
};

const paginateCards = (
  cards: CreditCard[],
  page: number,
  limit: number,
): PaginatedResponse<CreditCard> => {
  const total = cards.length;
  const totalPages = Math.ceil(total / limit);
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedCards = cards.slice(startIndex, endIndex);

  return {
    data: paginatedCards,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  };
};

/**
 * Credit Cards API
 */
export const creditCardsApi = {
  /**
   * Search credit cards with filters and pagination
   */
  search: async (
    query?: string,
    filters?: Partial<CreditCardFilters>,
    sortBy: SortOption = "featured",
    page: number = 1,
    limit: number = 20,
  ): Promise<ApiResponse<SearchResponse>> => {
    try {
      // Start with all cards
      let filteredCards = [...vietnameseCreditCards];

      // Apply text search
      if (query) {
        filteredCards = searchCards(filteredCards, query);
      }

      // Apply filters
      if (filters) {
        filteredCards = filterCards(filteredCards, filters);
      }

      // Apply sorting
      filteredCards = sortCards(filteredCards, sortBy);

      // Apply pagination
      const paginatedResult = paginateCards(filteredCards, page, limit);

      // Generate facets for filtering UI
      const categories = Array.from(
        new Set(vietnameseCreditCards.map((c) => c.category)),
      ).map((category) => ({
        id: category,
        name:
          (category as string).charAt(0).toUpperCase() +
          (category as string).slice(1).replace("_", " "),
        count: vietnameseCreditCards.filter((c) => c.category === category)
          .length,
      }));

      const issuers = Array.from(
        new Set(vietnameseCreditCards.map((c) => c.issuer)),
      ).map((issuer) => ({
        name: issuer as string,
        count: vietnameseCreditCards.filter((c) => c.issuer === issuer).length,
      }));

      const networks = Array.from(
        new Set(vietnameseCreditCards.map((c) => c.cardType)),
      ).map((network) => ({
        type: network,
        count: vietnameseCreditCards.filter((c) => c.cardType === network)
          .length,
      }));

      // Generate search suggestions if query provided
      let suggestions: string[] | undefined;
      if (query && query.trim()) {
        suggestions = [
          `Thẻ tín dụng ${query}`,
          `${query} không phí thường niên`,
          `Thẻ ${query} hoàn tiền`,
        ].slice(0, 3);
      }

      const response: SearchResponse = {
        cards: paginatedResult.data,
        facets: {
          categories,
          issuers,
          networks,
        },
        suggestions,
      };

      return {
        success: true,
        data: response,
        meta: {
          timestamp: new Date().toISOString(),
          requestId: crypto.randomUUID(),
          version: "1.0",
        },
      };
    } catch (error) {
      console.error("Credit cards search error:", error);
      return {
        success: false,
        error: {
          code: "SEARCH_ERROR",
          message: "Failed to search credit cards",
          details: error,
        },
      };
    }
  },

  /**
   * Get all credit cards with optional pagination
   */
  getAll: async (
    sortBy: SortOption = "featured",
    page: number = 1,
    limit: number = 20,
  ): Promise<ApiResponse<PaginatedResponse<CreditCard>>> => {
    try {
      const sortedCards = sortCards(vietnameseCreditCards, sortBy);
      const result = paginateCards(sortedCards, page, limit);

      return {
        success: true,
        data: result,
        meta: {
          timestamp: new Date().toISOString(),
          requestId: crypto.randomUUID(),
          version: "1.0",
        },
      };
    } catch (error) {
      console.error("Get all credit cards error:", error);
      return {
        success: false,
        error: {
          code: "GET_ALL_ERROR",
          message: "Failed to retrieve credit cards",
          details: error,
        },
      };
    }
  },

  /**
   * Get credit card by ID
   */
  getById: async (id: string): Promise<ApiResponse<CreditCard>> => {
    try {
      const card = vietnameseCreditCards.find((c) => c.id === id);

      if (!card) {
        return {
          success: false,
          error: {
            code: "CARD_NOT_FOUND",
            message: `Credit card with ID ${id} not found`,
          },
        };
      }

      return {
        success: true,
        data: card,
        meta: {
          timestamp: new Date().toISOString(),
          requestId: crypto.randomUUID(),
          version: "1.0",
        },
      };
    } catch (error) {
      console.error("Get credit card by ID error:", error);
      return {
        success: false,
        error: {
          code: "GET_BY_ID_ERROR",
          message: "Failed to retrieve credit card",
          details: error,
        },
      };
    }
  },

  /**
   * Get credit card by slug
   */
  getBySlug: async (slug: string): Promise<ApiResponse<CreditCard>> => {
    try {
      const card = vietnameseCreditCards.find((c) => c.slug === slug);

      if (!card) {
        return {
          success: false,
          error: {
            code: "CARD_NOT_FOUND",
            message: `Credit card with slug ${slug} not found`,
          },
        };
      }

      return {
        success: true,
        data: card,
        meta: {
          timestamp: new Date().toISOString(),
          requestId: crypto.randomUUID(),
          version: "1.0",
        },
      };
    } catch (error) {
      console.error("Get credit card by slug error:", error);
      return {
        success: false,
        error: {
          code: "GET_BY_SLUG_ERROR",
          message: "Failed to retrieve credit card",
          details: error,
        },
      };
    }
  },

  /**
   * Get multiple credit cards by IDs
   */
  getByIds: async (ids: string[]): Promise<ApiResponse<CreditCard[]>> => {
    try {
      const cards = vietnameseCreditCards.filter((c) => ids.includes(c.id));

      if (cards.length !== ids.length) {
        const foundIds = cards.map((c) => c.id);
        const missingIds = ids.filter((id) => !foundIds.includes(id));

        return {
          success: false,
          error: {
            code: "SOME_CARDS_NOT_FOUND",
            message: `Some credit cards not found: ${missingIds.join(", ")}`,
          },
        };
      }

      return {
        success: true,
        data: cards,
        meta: {
          timestamp: new Date().toISOString(),
          requestId: crypto.randomUUID(),
          version: "1.0",
        },
      };
    } catch (error) {
      console.error("Get credit cards by IDs error:", error);
      return {
        success: false,
        error: {
          code: "GET_BY_IDS_ERROR",
          message: "Failed to retrieve credit cards",
          details: error,
        },
      };
    }
  },

  /**
   * Get all card categories with counts
   */
  getCategories: async (): Promise<ApiResponse<CardCategoryInfo[]>> => {
    try {
      const categoryMap = new Map<CardCategory, CardCategoryInfo>();

      vietnameseCreditCards.forEach((card) => {
        const existing = categoryMap.get(card.category);

        if (existing) {
          existing.count++;
        } else {
          categoryMap.set(card.category, {
            id: card.category,
            name:
              (card.category as string).charAt(0).toUpperCase() +
              (card.category as string).slice(1).replace("_", " "),
            description: `${card.category} credit cards with specialized features and benefits`,
            icon: `${card.category}-icon`,
            count: 1,
            features: card.features.slice(0, 3), // Get first 3 features as example
          });
        }
      });

      return {
        success: true,
        data: Array.from(categoryMap.values()),
        meta: {
          timestamp: new Date().toISOString(),
          requestId: crypto.randomUUID(),
          version: "1.0",
        },
      };
    } catch (error) {
      console.error("Get categories error:", error);
      return {
        success: false,
        error: {
          code: "GET_CATEGORIES_ERROR",
          message: "Failed to retrieve card categories",
          details: error,
        },
      };
    }
  },

  /**
   * Track card click for analytics
   */
  trackClick: async (
    request: ClickTrackingRequest,
  ): Promise<ApiResponse<ClickTrackingResponse>> => {
    try {
      // Find the card to get redirect URL
      const card = vietnameseCreditCards.find((c) => c.id === request.cardId);

      if (!card) {
        return {
          success: false,
          error: {
            code: "CARD_NOT_FOUND",
            message: `Credit card with ID ${request.cardId} not found`,
          },
        };
      }

      // In a real implementation, this would:
      // 1. Log the click to analytics database
      // 2. Create tracking pixel if needed
      // 3. Generate affiliate link if applicable

      const trackingId = crypto.randomUUID();

      console.log("Card click tracked:", {
        cardId: request.cardId,
        source: request.source,
        position: request.position,
        trackingId,
        timestamp: new Date().toISOString(),
      });

      return {
        success: true,
        data: {
          success: true,
          redirectUrl: card.applyLink,
          trackingId,
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId: crypto.randomUUID(),
          version: "1.0",
        },
      };
    } catch (error) {
      console.error("Track click error:", error);
      return {
        success: false,
        error: {
          code: "TRACK_CLICK_ERROR",
          message: "Failed to track card click",
          details: error,
        },
      };
    }
  },

  /**
   * Compare multiple credit cards
   */
  compare: async (
    cardIds: string[],
  ): Promise<ApiResponse<ComparisonResult>> => {
    try {
      if (cardIds.length < 2) {
        return {
          success: false,
          error: {
            code: "INSUFFICIENT_CARDS",
            message: "At least 2 cards are required for comparison",
          },
        };
      }

      if (cardIds.length > 5) {
        return {
          success: false,
          error: {
            code: "TOO_MANY_CARDS",
            message: "Maximum 5 cards can be compared at once",
          },
        };
      }

      const cards = vietnameseCreditCards.filter((c) => cardIds.includes(c.id));

      if (cards.length !== cardIds.length) {
        const foundIds = cards.map((c) => c.id);
        const missingIds = cardIds.filter((id) => !foundIds.includes(id));

        return {
          success: false,
          error: {
            code: "SOME_CARDS_NOT_FOUND",
            message: `Some credit cards not found: ${missingIds.join(", ")}`,
          },
        };
      }

      // Generate comparison criteria
      const comparisonCriteria = [
        {
          id: "annualFee",
          label: "Annual Fee",
          description: "Yearly maintenance cost",
          type: "currency" as const,
          importance: "high" as const,
          getValue: (card: CreditCard) => card.annualFee,
          format: (value: number) => `${value.toLocaleString("vi-VN")} VND`,
        },
        {
          id: "interestRate",
          label: "Interest Rate",
          description: "Annual interest rate on outstanding balance",
          type: "percentage" as const,
          importance: "high" as const,
          getValue: (card: CreditCard) => card.interestRate,
          format: (value: number) => `${value}%`,
        },
        {
          id: "creditLimit",
          label: "Credit Limit",
          description: "Maximum credit limit",
          type: "currency" as const,
          importance: "high" as const,
          getValue: (card: CreditCard) => card.creditLimitMax,
          format: (value: number) => `${value.toLocaleString("vi-VN")} VND`,
        },
        {
          id: "incomeRequired",
          label: "Minimum Income",
          description: "Minimum monthly income requirement",
          type: "currency" as const,
          importance: "medium" as const,
          getValue: (card: CreditCard) => card.incomeRequiredMin,
          format: (value: number) => `${value.toLocaleString("vi-VN")} VND`,
        },
        {
          id: "rating",
          label: "Rating",
          description: "User rating (1-5 stars)",
          type: "number" as const,
          importance: "medium" as const,
          getValue: (card: CreditCard) => card.rating,
        },
      ];

      // Determine winners by category
      const winnerByCategory: { [category: string]: string } = {
        annualFee: cards.reduce((min, card) =>
          card.annualFee < min.annualFee ? card : min,
        ).id,
        interestRate: cards.reduce((min, card) =>
          card.interestRate < min.interestRate ? card : min,
        ).id,
        creditLimit: cards.reduce((max, card) =>
          card.creditLimitMax > max.creditLimitMax ? card : max,
        ).id,
        incomeRequired: cards.reduce((min, card) =>
          card.incomeRequiredMin < min.incomeRequiredMin ? card : min,
        ).id,
        rating: cards.reduce((max, card) =>
          card.rating > max.rating ? card : max,
        ).id,
      };

      // Generate summary
      const summary = {
        bestOverall: cards.reduce((best, card) =>
          card.rating > best.rating ? card : best,
        ).id,
        lowestFee: winnerByCategory.annualFee,
        highestLimit: winnerByCategory.creditLimit,
        bestRewards: cards.find((c) => c.rewardsProgram)?.id || cards[0].id,
        mostFlexible:
          cards.find((c) => c.installmentPlans && c.installmentPlans.length > 0)
            ?.id || cards[0].id,
      };

      const result: ComparisonResult = {
        cards,
        comparisonCriteria,
        winnerByCategory,
        summary,
      };

      return {
        success: true,
        data: result,
        meta: {
          timestamp: new Date().toISOString(),
          requestId: crypto.randomUUID(),
          version: "1.0",
        },
      };
    } catch (error) {
      console.error("Compare cards error:", error);
      return {
        success: false,
        error: {
          code: "COMPARE_ERROR",
          message: "Failed to compare credit cards",
          details: error,
        },
      };
    }
  },
};

/**
 * Utility function to handle API errors
 */
export const handleCreditCardsApiError = (error: any): string => {
  if (error.error?.message) {
    return error.error.message;
  }
  if (error.message) {
    return error.message;
  }
  return "Đã xảy ra lỗi không mong muốn. Vui lòng thử lại sau.";
};

/**
 * Utility function to check API response success
 */
export const isCreditCardsApiSuccess = <T>(
  response: ApiResponse<T>,
): response is ApiResponse<T> & { success: true } => {
  return response.success === true;
};

// Export API and utilities
export default {
  creditCards: creditCardsApi,
  utils: {
    handleError: handleCreditCardsApiError,
    isSuccess: isCreditCardsApiSuccess,
  },
};
