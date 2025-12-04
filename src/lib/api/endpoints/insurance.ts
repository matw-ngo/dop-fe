/**
 * Insurance Products API Endpoints
 *
 * API endpoints for insurance product search, filtering, comparison, and analytics
 * for the Vietnamese digital lending platform.
 */

// import apiClient from "@/lib/api/client"; // Using mock data
import type {
  InsuranceProduct,
  VehicleType,
  InsuranceFilters,
  SearchOptions,
  PaginationOptions,
  InsuranceComparisonResult,
  InsuranceComparisonCriteria,
  InsuranceCategoryInfo,
  InsuranceProductsResponse,
  InsuranceProductDetailResponse,
  InsuranceError,
  FeeType,
  CoveragePeriod,
} from "@/types/insurance";
import {
  InsuranceCategory,
  InsuranceType,
  SortOption,
} from "@/types/insurance";
import { INSURANCE_PRODUCTS } from "@/data/insurance-products";

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
  products: InsuranceProduct[];
  facets: {
    categories: Array<{ id: InsuranceCategory; name: string; count: number }>;
    issuers: Array<{ name: string; count: number }>;
    types: Array<{ type: InsuranceType; count: number }>;
    coverageRanges: {
      personalAccident: { min: number; max: number };
      propertyDamage: { min: number; max: number };
      medicalExpenses: { min: number; max: number };
    };
    premiumRanges: {
      min: number;
      max: number;
    };
  };
  suggestions?: string[];
}

export interface RedirectTrackingRequest {
  productId: string;
  source: "listing" | "detail" | "comparison" | "recommendation";
  position?: number;
  sessionId?: string;
  userId?: string;
}

export interface RedirectTrackingResponse {
  success: boolean;
  redirectUrl: string;
  trackingId: string;
}

// Helper functions for data manipulation
const filterProducts = (
  products: InsuranceProduct[],
  filters: Partial<InsuranceFilters>,
): InsuranceProduct[] => {
  return products.filter((product) => {
    // Category filter
    if (filters.categories && filters.categories.length > 0) {
      if (!filters.categories.includes(product.category)) return false;
    }

    // Type filter
    if (filters.types && filters.types.length > 0) {
      if (!filters.types.includes(product.type)) return false;
    }

    // Issuer filter
    if (filters.issuers && filters.issuers.length > 0) {
      if (!filters.issuers.includes(product.issuer)) return false;
    }

    // Coverage range filters
    if (filters.coverageRange) {
      if (
        product.coverage.personalAccident.limit <
          filters.coverageRange.personalAccident.min ||
        product.coverage.personalAccident.limit >
          filters.coverageRange.personalAccident.max
      )
        return false;

      if (
        product.coverage.propertyDamage.limit <
          filters.coverageRange.propertyDamage.min ||
        product.coverage.propertyDamage.limit >
          filters.coverageRange.propertyDamage.max
      )
        return false;

      if (
        product.coverage.medicalExpenses.limit <
          filters.coverageRange.medicalExpenses.min ||
        product.coverage.medicalExpenses.limit >
          filters.coverageRange.medicalExpenses.max
      )
        return false;
    }

    // Pricing filters
    if (filters.premiumRange) {
      if (
        product.pricing.totalPremium < filters.premiumRange.min ||
        product.pricing.totalPremium > filters.premiumRange.max
      )
        return false;
    }

    if (filters.feeTypes && filters.feeTypes.length > 0) {
      if (!filters.feeTypes.includes(product.pricing.feeType)) return false;
    }

    if (filters.coveragePeriods && filters.coveragePeriods.length > 0) {
      if (!filters.coveragePeriods.includes(product.pricing.coveragePeriod))
        return false;
    }

    // Eligibility filters
    if (filters.ageRange) {
      if (
        product.eligibility.ageRange.min > filters.ageRange.max ||
        (product.eligibility.ageRange.max &&
          product.eligibility.ageRange.max < filters.ageRange.min)
      )
        return false;
    }

    // Features filters
    if (filters.hasRoadsideAssistance !== undefined) {
      if (
        product.additionalServices?.roadsideAssistance !==
        filters.hasRoadsideAssistance
      )
        return false;
    }

    if (filters.hasWorldwideCoverage !== undefined) {
      if (
        product.additionalServices?.worldwideCoverage !==
        filters.hasWorldwideCoverage
      )
        return false;
    }

    if (filters.hasMedicalHotline !== undefined) {
      if (
        product.additionalServices?.medicalHotline !== filters.hasMedicalHotline
      )
        return false;
    }

    if (filters.hasLegalSupport !== undefined) {
      if (product.additionalServices?.legalSupport !== filters.hasLegalSupport)
        return false;
    }

    // Claims filters
    if (
      filters.minApprovalRate &&
      product.claims.approvalRate < filters.minApprovalRate
    )
      return false;

    if (
      filters.maxProcessingTime &&
      product.claims.processingTime > filters.maxProcessingTime
    )
      return false;

    // Regional filters
    if (filters.provinces && filters.provinces.length > 0) {
      if (!product.availability.nationalAvailability) {
        const hasProvince = filters.provinces.some((province) =>
          product.availability.provinces.includes(province),
        );
        if (!hasProvince) return false;
      }
    }

    // Special filters
    if (filters.isNew !== undefined) {
      if (filters.isNew !== !!product.isNew) return false;
    }

    if (filters.isRecommended !== undefined) {
      if (filters.isRecommended !== !!product.isRecommended) return false;
    }

    if (filters.isExclusive !== undefined) {
      if (filters.isExclusive !== !!product.isExclusive) return false;
    }

    if (filters.hasAutoRenewal !== undefined) {
      if (filters.hasAutoRenewal !== product.renewal.autoRenewal) return false;
    }

    if (filters.hasInstallments !== undefined) {
      const hasInstallments = product.paymentOptions.installmentAvailable;
      if (filters.hasInstallments !== hasInstallments) return false;
    }

    // Rating filter
    if (filters.minRating && product.rating < filters.minRating) return false;

    return true;
  });
};

const sortProducts = (
  products: InsuranceProduct[],
  sortBy: SortOption,
): InsuranceProduct[] => {
  const sorted = [...products];

  switch (sortBy) {
    case SortOption.FEATURED:
      return sorted.sort((a, b) => {
        if (a.isRecommended && !b.isRecommended) return -1;
        if (!a.isRecommended && b.isRecommended) return 1;
        if (a.isExclusive && !b.isExclusive) return -1;
        if (!a.isExclusive && b.isExclusive) return 1;
        return b.rating - a.rating;
      });

    case SortOption.RATING_DESC:
      return sorted.sort((a, b) => b.rating - a.rating);

    case SortOption.RATING_ASC:
      return sorted.sort((a, b) => a.rating - b.rating);

    case SortOption.PREMIUM_ASC:
      return sorted.sort(
        (a, b) => a.pricing.totalPremium - b.pricing.totalPremium,
      );

    case SortOption.PREMIUM_DESC:
      return sorted.sort(
        (a, b) => b.pricing.totalPremium - a.pricing.totalPremium,
      );

    case SortOption.COVERAGE_ASC:
      return sorted.sort((a, b) => {
        const aTotal = (
          Object.values(a.coverage) as Array<{ limit: number }>
        ).reduce((sum, cov) => sum + cov.limit, 0);
        const bTotal = (
          Object.values(b.coverage) as Array<{ limit: number }>
        ).reduce((sum, cov) => sum + cov.limit, 0);
        return aTotal - bTotal;
      });

    case SortOption.COVERAGE_DESC:
      return sorted.sort((a, b) => {
        const aTotal = (
          Object.values(a.coverage) as Array<{ limit: number }>
        ).reduce((sum, cov) => sum + cov.limit, 0);
        const bTotal = (
          Object.values(b.coverage) as Array<{ limit: number }>
        ).reduce((sum, cov) => sum + cov.limit, 0);
        return bTotal - aTotal;
      });

    case SortOption.CLAIMS_APPROVED_DESC:
      return sorted.sort(
        (a, b) => b.claims.approvalRate - a.claims.approvalRate,
      );

    case SortOption.CLAIMS_TIME_ASC:
      return sorted.sort(
        (a, b) => a.claims.processingTime - b.claims.processingTime,
      );

    case SortOption.NEWEST:
      return sorted.sort(
        (a, b) =>
          new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
      );

    case SortOption.NAME_ASC:
      return sorted.sort((a, b) => a.name.localeCompare(b.name));

    case SortOption.NAME_DESC:
      return sorted.sort((a, b) => b.name.localeCompare(a.name));

    default:
      return sorted;
  }
};

const searchProducts = (
  products: InsuranceProduct[],
  query: string,
  fields?: string[],
): InsuranceProduct[] => {
  if (!query.trim()) return products;

  const searchFields = fields || [
    "name",
    "issuer",
    "features",
    "benefits",
    "tags",
  ];
  const lowerQuery = query.toLowerCase();

  return products.filter((product) => {
    return searchFields.some((field) => {
      const value = (product as any)[field];
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

const paginateProducts = (
  products: InsuranceProduct[],
  page: number,
  limit: number,
): PaginatedResponse<InsuranceProduct> => {
  const total = products.length;
  const totalPages = Math.ceil(total / limit);
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedProducts = products.slice(startIndex, endIndex);

  return {
    data: paginatedProducts,
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
 * Insurance Products API
 */
export const insuranceApi = {
  /**
   * Search insurance products with filters and pagination
   */
  search: async (
    query?: string,
    filters?: Partial<InsuranceFilters>,
    sortBy: SortOption = SortOption.FEATURED,
    page: number = 1,
    limit: number = 20,
  ): Promise<ApiResponse<SearchResponse>> => {
    try {
      // Start with all products
      let filteredProducts = [...INSURANCE_PRODUCTS];

      // Apply text search
      if (query) {
        filteredProducts = searchProducts(filteredProducts, query);
      }

      // Apply filters
      if (filters) {
        filteredProducts = filterProducts(filteredProducts, filters);
      }

      // Apply sorting
      filteredProducts = sortProducts(filteredProducts, sortBy);

      // Apply pagination
      const paginatedResult = paginateProducts(filteredProducts, page, limit);

      // Generate facets for filtering UI
      const categories = Array.from(
        new Set(INSURANCE_PRODUCTS.map((p) => p.category)),
      ).map((category) => ({
        id: category,
        name: getCategoryName(category),
        count: INSURANCE_PRODUCTS.filter((p) => p.category === category).length,
      }));

      const issuers = Array.from(
        new Set(INSURANCE_PRODUCTS.map((p) => p.issuer)),
      ).map((issuer) => ({
        name: issuer as string,
        count: INSURANCE_PRODUCTS.filter((p) => p.issuer === issuer).length,
      }));

      const types = Array.from(
        new Set(INSURANCE_PRODUCTS.map((p) => p.type)),
      ).map((type) => ({
        type,
        count: INSURANCE_PRODUCTS.filter((p) => p.type === type).length,
      }));

      // Calculate coverage ranges
      const coverageRanges = {
        personalAccident: {
          min: Math.min(
            ...INSURANCE_PRODUCTS.map(
              (p) => p.coverage.personalAccident.limit,
            ).filter((v) => v > 0),
          ),
          max: Math.max(
            ...INSURANCE_PRODUCTS.map((p) => p.coverage.personalAccident.limit),
          ),
        },
        propertyDamage: {
          min: Math.min(
            ...INSURANCE_PRODUCTS.map(
              (p) => p.coverage.propertyDamage.limit,
            ).filter((v) => v > 0),
          ),
          max: Math.max(
            ...INSURANCE_PRODUCTS.map((p) => p.coverage.propertyDamage.limit),
          ),
        },
        medicalExpenses: {
          min: Math.min(
            ...INSURANCE_PRODUCTS.map(
              (p) => p.coverage.medicalExpenses.limit,
            ).filter((v) => v > 0),
          ),
          max: Math.max(
            ...INSURANCE_PRODUCTS.map((p) => p.coverage.medicalExpenses.limit),
          ),
        },
      };

      const premiumRanges = {
        min: Math.min(...INSURANCE_PRODUCTS.map((p) => p.pricing.totalPremium)),
        max: Math.max(...INSURANCE_PRODUCTS.map((p) => p.pricing.totalPremium)),
      };

      // Generate search suggestions if query provided
      let suggestions: string[] | undefined;
      if (query && query.trim()) {
        suggestions = [
          `Bảo hiểm ${query}`,
          `${query} giá tốt`,
          `Bảo hiểm ${query} uy tín`,
        ].slice(0, 3);
      }

      const response: SearchResponse = {
        products: paginatedResult.data,
        facets: {
          categories,
          issuers,
          types,
          coverageRanges,
          premiumRanges,
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
      console.error("Insurance products search error:", error);
      return {
        success: false,
        error: {
          code: "SEARCH_ERROR",
          message: "Failed to search insurance products",
          details: error,
        },
      };
    }
  },

  /**
   * Get all insurance products with optional pagination
   */
  getAll: async (
    sortBy: SortOption = SortOption.FEATURED,
    page: number = 1,
    limit: number = 20,
  ): Promise<ApiResponse<PaginatedResponse<InsuranceProduct>>> => {
    try {
      const sortedProducts = sortProducts(INSURANCE_PRODUCTS, sortBy);
      const result = paginateProducts(sortedProducts, page, limit);

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
      console.error("Get all insurance products error:", error);
      return {
        success: false,
        error: {
          code: "GET_ALL_ERROR",
          message: "Failed to retrieve insurance products",
          details: error,
        },
      };
    }
  },

  /**
   * Get insurance product by ID
   */
  getById: async (id: string): Promise<ApiResponse<InsuranceProduct>> => {
    try {
      const product = INSURANCE_PRODUCTS.find((p) => p.id === id);

      if (!product) {
        return {
          success: false,
          error: {
            code: "PRODUCT_NOT_FOUND",
            message: `Insurance product with ID ${id} not found`,
          },
        };
      }

      return {
        success: true,
        data: product,
        meta: {
          timestamp: new Date().toISOString(),
          requestId: crypto.randomUUID(),
          version: "1.0",
        },
      };
    } catch (error) {
      console.error("Get insurance product by ID error:", error);
      return {
        success: false,
        error: {
          code: "GET_BY_ID_ERROR",
          message: "Failed to retrieve insurance product",
          details: error,
        },
      };
    }
  },

  /**
   * Get insurance product by slug
   */
  getBySlug: async (slug: string): Promise<ApiResponse<InsuranceProduct>> => {
    try {
      const product = INSURANCE_PRODUCTS.find((p) => p.slug === slug);

      if (!product) {
        return {
          success: false,
          error: {
            code: "PRODUCT_NOT_FOUND",
            message: `Insurance product with slug ${slug} not found`,
          },
        };
      }

      return {
        success: true,
        data: product,
        meta: {
          timestamp: new Date().toISOString(),
          requestId: crypto.randomUUID(),
          version: "1.0",
        },
      };
    } catch (error) {
      console.error("Get insurance product by slug error:", error);
      return {
        success: false,
        error: {
          code: "GET_BY_SLUG_ERROR",
          message: "Failed to retrieve insurance product",
          details: error,
        },
      };
    }
  },

  /**
   * Get all insurance categories with counts
   */
  getCategories: async (): Promise<ApiResponse<InsuranceCategoryInfo[]>> => {
    try {
      const categoryMap = new Map<InsuranceCategory, InsuranceCategoryInfo>();

      INSURANCE_PRODUCTS.forEach((product) => {
        const existing = categoryMap.get(product.category);

        if (existing) {
          existing.count++;
        } else {
          categoryMap.set(product.category, {
            id: product.category,
            name: getCategoryName(product.category),
            description: getCategoryDescription(product.category),
            icon: getCategoryIcon(product.category),
            count: 1,
            features: product.features.slice(0, 3), // Get first 3 features as example
            mandatory: product.type === InsuranceType.COMPULSORY,
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
          message: "Failed to retrieve insurance categories",
          details: error,
        },
      };
    }
  },

  /**
   * Track partner redirect for analytics
   */
  trackRedirect: async (
    request: RedirectTrackingRequest,
  ): Promise<ApiResponse<RedirectTrackingResponse>> => {
    try {
      // Find the product to get redirect URL
      const product = INSURANCE_PRODUCTS.find(
        (p) => p.id === request.productId,
      );

      if (!product) {
        return {
          success: false,
          error: {
            code: "PRODUCT_NOT_FOUND",
            message: `Insurance product with ID ${request.productId} not found`,
          },
        };
      }

      // In a real implementation, this would:
      // 1. Log the click to analytics database
      // 2. Create tracking pixel if needed
      // 3. Generate affiliate link if applicable

      const trackingId = crypto.randomUUID();

      console.log("Insurance product redirect tracked:", {
        productId: request.productId,
        source: request.source,
        position: request.position,
        trackingId,
        timestamp: new Date().toISOString(),
      });

      return {
        success: true,
        data: {
          success: true,
          redirectUrl: product.applyLink,
          trackingId,
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId: crypto.randomUUID(),
          version: "1.0",
        },
      };
    } catch (error) {
      console.error("Track redirect error:", error);
      return {
        success: false,
        error: {
          code: "TRACK_REDIRECT_ERROR",
          message: "Failed to track product redirect",
          details: error,
        },
      };
    }
  },

  /**
   * Compare multiple insurance products
   */
  compare: async (
    productIds: string[],
  ): Promise<ApiResponse<InsuranceComparisonResult>> => {
    try {
      if (productIds.length < 2) {
        return {
          success: false,
          error: {
            code: "INSUFFICIENT_PRODUCTS",
            message: "At least 2 products are required for comparison",
          },
        };
      }

      if (productIds.length > 5) {
        return {
          success: false,
          error: {
            code: "TOO_MANY_PRODUCTS",
            message: "Maximum 5 products can be compared at once",
          },
        };
      }

      const products = INSURANCE_PRODUCTS.filter((p) =>
        productIds.includes(p.id),
      );

      if (products.length !== productIds.length) {
        const foundIds = products.map((p) => p.id);
        const missingIds = productIds.filter((id) => !foundIds.includes(id));

        return {
          success: false,
          error: {
            code: "SOME_PRODUCTS_NOT_FOUND",
            message: `Some insurance products not found: ${missingIds.join(", ")}`,
          },
        };
      }

      // Generate comparison criteria
      const comparisonCriteria: InsuranceComparisonCriteria[] = [
        {
          id: "premium",
          label: "Phí bảo hiểm",
          description: "Tổng phí bảo hiểm hàng năm",
          type: "currency",
          importance: "high",
          getValue: (product: InsuranceProduct) => product.pricing.totalPremium,
          format: (value: number) => `${value.toLocaleString("vi-VN")} VND`,
        },
        {
          id: "personalAccidentCoverage",
          label: "Quyền lợi tai nạn cá nhân",
          description: "Số tiền bảo hiểm cho tai nạn cá nhân",
          type: "currency",
          importance: "high",
          getValue: (product: InsuranceProduct) =>
            product.coverage.personalAccident.limit,
          format: (value: number) => `${value.toLocaleString("vi-VN")} VND`,
        },
        {
          id: "propertyDamageCoverage",
          label: "Quyền lợi tổn thất tài sản",
          description: "Số tiền bảo hiểm cho thiệt hại tài sản",
          type: "currency",
          importance: "high",
          getValue: (product: InsuranceProduct) =>
            product.coverage.propertyDamage.limit,
          format: (value: number) => `${value.toLocaleString("vi-VN")} VND`,
        },
        {
          id: "claimProcessingTime",
          label: "Thời gian xử lý yêu cầu",
          description: "Số ngày trung bình để xử lý yêu cầu bồi thường",
          type: "number",
          importance: "medium",
          getValue: (product: InsuranceProduct) =>
            product.claims.processingTime,
          format: (value: number) => `${value} ngày`,
        },
        {
          id: "approvalRate",
          label: "Tỷ lệ duyệt yêu cầu",
          description: "Tỷ lệ phần trăm yêu cầu được duyệt",
          type: "percentage",
          importance: "medium",
          getValue: (product: InsuranceProduct) => product.claims.approvalRate,
          format: (value: number) => `${value}%`,
        },
        {
          id: "rating",
          label: "Đánh giá",
          description: "Điểm đánh giá của khách hàng (1-5 sao)",
          type: "number",
          importance: "medium",
          getValue: (product: InsuranceProduct) => product.rating,
        },
      ];

      // Determine winners by category
      const winnerByCategory: { [category: string]: string } = {
        premium: products.reduce((min, product) =>
          product.pricing.totalPremium < min.pricing.totalPremium
            ? product
            : min,
        ).id,
        personalAccidentCoverage: products.reduce((max, product) =>
          product.coverage.personalAccident.limit >
          max.coverage.personalAccident.limit
            ? product
            : max,
        ).id,
        propertyDamageCoverage: products.reduce((max, product) =>
          product.coverage.propertyDamage.limit >
          max.coverage.propertyDamage.limit
            ? product
            : max,
        ).id,
        claimProcessingTime: products.reduce((min, product) =>
          product.claims.processingTime < min.claims.processingTime
            ? product
            : min,
        ).id,
        approvalRate: products.reduce((max, product) =>
          product.claims.approvalRate > max.claims.approvalRate ? product : max,
        ).id,
        rating: products.reduce((max, product) =>
          product.rating > max.rating ? product : max,
        ).id,
      };

      // Generate summary
      const summary = {
        bestOverall: products.reduce((best, product) =>
          product.rating > best.rating ? product : best,
        ).id,
        lowestPremium: winnerByCategory.premium,
        highestCoverage: products.reduce((max, product) => {
          const totalCoverage = (
            Object.values(product.coverage) as Array<{ limit: number }>
          ).reduce((sum, cov) => sum + cov.limit, 0);
          const maxTotalCoverage = (
            Object.values(max.coverage) as Array<{ limit: number }>
          ).reduce((sum, cov) => sum + cov.limit, 0);
          return totalCoverage > maxTotalCoverage ? product : max;
        }).id,
        bestClaimsService: winnerByCategory.claimProcessingTime,
        mostComprehensive: products.reduce((max, product) => {
          const featureCount =
            product.features.length + product.benefits.length;
          const maxFeatureCount = max.features.length + max.benefits.length;
          return featureCount > maxFeatureCount ? product : max;
        }).id,
      };

      const result: InsuranceComparisonResult = {
        products,
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
      console.error("Compare products error:", error);
      return {
        success: false,
        error: {
          code: "COMPARE_ERROR",
          message: "Failed to compare insurance products",
          details: error,
        },
      };
    }
  },
};

/**
 * Helper function to get category display name
 */
function getCategoryName(category: InsuranceCategory): string {
  const names = {
    [InsuranceCategory.VEHICLE]: "Bảo hiểm Xe cơ giới",
    [InsuranceCategory.HEALTH]: "Bảo hiểm Sức khỏe",
    [InsuranceCategory.LIFE]: "Bảo hiểm Nhân thọ",
    [InsuranceCategory.TRAVEL]: "Bảo hiểm Du lịch",
    [InsuranceCategory.PROPERTY]: "Bảo hiểm Tài sản",
  };
  return names[category] || category;
}

/**
 * Helper function to get category description
 */
function getCategoryDescription(category: InsuranceCategory): string {
  const descriptions = {
    [InsuranceCategory.VEHICLE]:
      "TNDS bắt buộc, vật chất xe, tai nạn cá nhân cho mọi loại phương tiện",
    [InsuranceCategory.HEALTH]:
      "Chi trả viện phí, bảo hiểm bệnh hiểm nghèo, thẻ khám chữa bệnh",
    [InsuranceCategory.LIFE]:
      "Bảo vệ tài chính, tích lũy hưu trí, kế hoạch thừa kế cho tương lai",
    [InsuranceCategory.TRAVEL]:
      "Bảo hiểm chuyến bay, du lịch quốc tế, visa Schengen, COVID-19",
    [InsuranceCategory.PROPERTY]:
      "Bảo hiểm nhà cửa, tài sản doanh nghiệp, cháy nổ, thiên tai",
  };
  return descriptions[category] || "";
}

/**
 * Helper function to get category icon
 */
function getCategoryIcon(category: InsuranceCategory): string {
  const icons = {
    [InsuranceCategory.VEHICLE]: "Car",
    [InsuranceCategory.HEALTH]: "Heart",
    [InsuranceCategory.LIFE]: "Shield",
    [InsuranceCategory.TRAVEL]: "Plane",
    [InsuranceCategory.PROPERTY]: "Home",
  };
  return icons[category] || "File";
}

/**
 * Utility function to handle API errors
 */
export const handleInsuranceApiError = (error: any): string => {
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
export const isInsuranceApiSuccess = <T>(
  response: ApiResponse<T>,
): response is ApiResponse<T> & { success: true } => {
  return response.success === true;
};

// Export API and utilities
export default {
  insurance: insuranceApi,
  utils: {
    handleError: handleInsuranceApiError,
    isSuccess: isInsuranceApiSuccess,
  },
};
