/**
 * TypeScript interfaces for the Insurance Products feature
 * Supports comprehensive insurance product comparison and filtering functionality
 */

// ============================================================================
// Core Enums
// ============================================================================

/**
 * Main insurance categories
 */
export enum InsuranceCategory {
  VEHICLE = "vehicle",
  HEALTH = "health",
  LIFE = "life",
  TRAVEL = "travel",
  PROPERTY = "property",
}

/**
 * Insurance types based on regulatory requirements
 */
export enum InsuranceType {
  COMPULSORY = "compulsory", // Mandatory by law (e.g., TNDS car insurance)
  VOLUNTARY = "voluntary", // Optional coverage
}

/**
 * Vehicle types for vehicle insurance
 */
export enum VehicleType {
  CAR = "car",
  MOTORCYCLE = "motorcycle",
  SCOOTER = "scooter",
  THREE_WHEELER = "three_wheeler",
  TRUCK = "truck",
  BUS = "bus",
}

/**
 * Fee structure types for insurance premiums
 */
export enum FeeType {
  FIXED = "fixed", // Fixed amount per period
  PERCENTAGE = "percentage", // Percentage of insured value
  TIERED = "tiered", // Different rates for different coverage tiers
  CALCULATED = "calculated", // Based on complex formula
}

/**
 * Coverage period types
 */
export enum CoveragePeriod {
  MONTHLY = "monthly",
  QUARTERLY = "quarterly",
  SEMI_ANNUALLY = "semi-annually",
  ANNUALLY = "annually",
  CUSTOM = "custom",
}

/**
 * Claim processing status
 */
export enum ClaimStatus {
  PENDING = "pending",
  UNDER_REVIEW = "under_review",
  APPROVED = "approved",
  REJECTED = "rejected",
  SETTLED = "settled",
}

/**
 * Sort options for insurance products
 */
export enum SortOption {
  FEATURED = "featured",
  RATING_DESC = "rating-desc",
  RATING_ASC = "rating-asc",
  PREMIUM_ASC = "premium-asc",
  PREMIUM_DESC = "premium-desc",
  COVERAGE_ASC = "coverage-asc",
  COVERAGE_DESC = "coverage-desc",
  CLAIMS_APPROVED_DESC = "claims-approved-desc",
  CLAIMS_TIME_ASC = "claims-time-asc",
  NEWEST = "newest",
  NAME_ASC = "name-asc",
  NAME_DESC = "name-desc",
}

// ============================================================================
// Main Interfaces
// ============================================================================

/**
 * Comprehensive Insurance Product interface
 * Contains all coverage, pricing, requirement, and feature information
 */
export interface InsuranceProduct {
  // Identification
  id: string;
  slug: string;
  name: string;
  issuer: string;
  category: InsuranceCategory;
  type: InsuranceType;
  productCode?: string;

  // Coverage Details
  coverage: {
    personalAccident: {
      limit: number;
      disabled: boolean;
    };
    propertyDamage: {
      limit: number;
      disabled: boolean;
    };
    medicalExpenses: {
      limit: number;
      disabled: boolean;
    };
    thirdPartyLiability: {
      limit: number;
      disabled: boolean;
    };
    death: {
      limit: number;
      disabled: boolean;
    };
    disability: {
      limit: number;
      disabled: boolean;
    };
    hospitalization: {
      limit: number;
      disabled: boolean;
    };
    surgery: {
      limit: number;
      disabled: boolean;
    };
    criticalIllness: {
      limit: number;
      disabled: boolean;
    };
    lossOfIncome: {
      limit: number;
      disabled: boolean;
    };
  };

  // Vehicle-specific coverage (for vehicle insurance)
  vehicleCoverage?: {
    vehicleType: VehicleType;
    vehicleValueRange: {
      min: number;
      max: number;
    };
    ownDamage: {
      limit: number;
      disabled: boolean;
    };
    theft: {
      limit: number;
      disabled: boolean;
    };
    fire: {
      limit: number;
      disabled: boolean;
    };
    naturalDisasters: {
      limit: number;
      disabled: boolean;
    };
  };

  // Pricing
  pricing: {
    basePremium: number;
    feeType: FeeType;
    taxRate: number; // VAT rate (typically 10%)
    taxAmount: number;
    totalPremium: number;
    currency: string; // ISO currency code (e.g., VND)
    coveragePeriod: CoveragePeriod;
    customPeriodDays?: number;
  };

  // Deductibles and Exclusions
  deductibles: {
    standardDeductible: number;
    voluntaryDeductibleOptions: number[];
    deductibleType: "fixed" | "percentage";
  };
  exclusions: string[];
  waitingPeriods: {
    general: number; // days
    specific?: {
      [condition: string]: number; // days
    };
  };

  // Target Audience Requirements
  eligibility: {
    ageRange: {
      min: number;
      max?: number;
    };
    occupation?: string[];
    medicalRequirements?: string[];
    preExistingConditions?: {
      allowed: string[];
      notAllowed: string[];
      loading?: {
        condition: string;
        increase: number; // percentage
      }[];
    };
  };

  // Features & Benefits
  features: string[];
  benefits: string[];
  additionalServices?: {
    roadsideAssistance: boolean;
    medicalHotline: boolean;
    legalSupport: boolean;
    homeVisit: boolean;
    worldwideCoverage: boolean;
  };

  // Claims Information
  claims: {
    processDescription: string;
    requiredDocuments: string[];
    processingTime: number; // in business days
    approvalRate: number; // percentage
    averageClaimTime: number; // in days
    claimMethods: ("online" | "phone" | "branch" | "mobile_app")[];
    contactInfo: {
      hotline: string;
      email: string;
      website?: string;
    };
  };

  // Regional Data
  availability: {
    provinces: string[];
    nationalAvailability: boolean;
    exclusions: string[];
  };

  // Payment Options
  paymentOptions: {
    methods: (
      | "cash"
      | "bank_transfer"
      | "credit_card"
      | "mobile_banking"
      | "ewallet"
    )[];
    installmentAvailable: boolean;
    installmentPlans?: {
      months: number;
      interestRate?: number;
    }[];
    discounts?: {
      type: "percentage" | "fixed";
      value: number;
      condition: string;
    }[];
  };

  // Renewal Terms
  renewal: {
    autoRenewal: boolean;
    renewalReminderDays: number;
    gracePeriod: number; // days
    noClaimBonus: {
      maxYears: number;
      maxDiscount: number; // percentage
    };
  };

  // Metadata
  image: string;
  imageAlt: string;
  applyLink: string;
  applyLinkType: "direct" | "affiliate" | "redirect";
  brochureLink?: string;
  policyDocumentLink?: string;
  rating: 1 | 2 | 3 | 4 | 5; // 1-5 scale
  reviewCount: number;
  isRecommended?: boolean;
  isNew?: boolean;
  isExclusive?: boolean;
  tags: string[];

  // SEO & Analytics
  metaTitle?: string;
  metaDescription?: string;
  lastUpdated: Date;
  publishedAt: Date;

  // Partner Information
  partner?: {
    name: string;
    commissionRate?: number;
    trackingPixel?: string;
    cookieDuration?: number; // in days
  };
}

/**
 * Insurance category information for filtering and navigation
 */
export interface InsuranceCategoryInfo {
  id: InsuranceCategory;
  name: string;
  description: string;
  icon: string;
  count: number;
  features: string[];
  mandatory?: boolean; // For compulsory insurances
}

// ============================================================================
// Filter & Search Interfaces
// ============================================================================

/**
 * Comprehensive filter options for insurance products
 */
export interface InsuranceFilters {
  // Basic Filters
  categories: InsuranceCategory[];
  types: InsuranceType[];
  issuers: string[];

  // Coverage Filters
  coverageRange: {
    personalAccident: {
      min: number;
      max: number;
    };
    propertyDamage: {
      min: number;
      max: number;
    };
    medicalExpenses: {
      min: number;
      max: number;
    };
  };
  specificCoverages: string[]; // Specific coverage features

  // Pricing Filters
  premiumRange: {
    min: number;
    max: number;
  };
  feeTypes: FeeType[];
  coveragePeriods: CoveragePeriod[];

  // Eligibility Filters
  ageRange: {
    min: number;
    max: number;
  };
  includePreExistingConditions: boolean;

  // Features Filters
  hasRoadsideAssistance: boolean;
  hasWorldwideCoverage: boolean;
  hasMedicalHotline: boolean;
  hasLegalSupport: boolean;

  // Claims Filters
  minApprovalRate: number;
  maxProcessingTime: number; // days

  // Regional Filters
  provinces: string[];
  nationalAvailability: boolean;

  // Special Filters
  isNew: boolean;
  isRecommended: boolean;
  isExclusive: boolean;
  hasAutoRenewal: boolean;
  hasInstallments: boolean;

  // Rating Filter
  minRating: number;
}

/**
 * Search result interface
 */
export interface InsuranceSearchResult {
  products: InsuranceProduct[];
  total: number;
  facets: {
    categories: InsuranceCategoryInfo[];
    issuers: { name: string; count: number }[];
    coverageRanges: {
      min: number;
      max: number;
    };
    premiumRanges: {
      min: number;
      max: number;
    };
  };
}

/**
 * Search options for insurance products
 */
export interface SearchOptions {
  query: string;
  fields?: ("name" | "issuer" | "features" | "benefits" | "tags")[];
  fuzzy?: boolean;
}

// ============================================================================
// Sorting & Pagination
// ============================================================================

/**
 * Sort option with direction for UI
 */
export interface SortOptionUI {
  value: SortOption;
  labelKey: string;
  description: string;
  direction?: "asc" | "desc";
}

/**
 * Pagination options
 */
export interface PaginationOptions {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// ============================================================================
// Comparison Interfaces
// ============================================================================

/**
 * Comparison result for side-by-side insurance product comparison
 */
export interface InsuranceComparisonResult {
  products: InsuranceProduct[];
  comparisonCriteria: InsuranceComparisonCriteria[];
  winnerByCategory?: {
    [category: string]: string; // productId that wins in this category
  };
  summary: {
    bestOverall?: string;
    lowestPremium?: string;
    highestCoverage?: string;
    bestClaimsService?: string;
    mostComprehensive?: string;
  };
}

/**
 * Individual comparison criteria for insurance products
 */
export interface InsuranceComparisonCriteria {
  id: string;
  label: string;
  description?: string;
  type: "number" | "text" | "boolean" | "percentage" | "currency";
  importance: "low" | "medium" | "high";
  getValue: (product: InsuranceProduct) => string | number | boolean;
  format?: (value: string | number | boolean) => string;
}

/**
 * Comparison state management
 */
export interface ComparisonState {
  selectedProducts: string[];
  maxProducts: number;
  canAddMore: boolean;
  isFull: boolean;
}

// ============================================================================
// Store Interface (Zustand)
// ============================================================================

/**
 * Zustand store interface for insurance products state management
 */
export interface InsuranceStore {
  // State
  products: InsuranceProduct[];
  filteredProducts: InsuranceProduct[];
  filters: InsuranceFilters;
  searchQuery: string;
  sortOption: SortOption;
  pagination: PaginationOptions;
  isLoading: boolean;
  isError: boolean;
  error?: string;

  // Comparison state
  comparison: ComparisonState;

  // UI state
  viewMode: "grid" | "list" | "compact";
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

  // Computed
  getProductById: (id: string) => InsuranceProduct | undefined;
  getProductBySlug: (slug: string) => InsuranceProduct | undefined;
  getFilteredProducts: () => InsuranceProduct[];
  getCategories: () => InsuranceCategoryInfo[];
  getIssuers: () => string[];
  getCoverageRange: () => { min: number; max: number };
  getPremiumRange: () => { min: number; max: number };
}

// ============================================================================
// API & Response Interfaces
// ============================================================================

/**
 * API response for insurance products listing
 */
export interface InsuranceProductsResponse {
  data: InsuranceProduct[];
  pagination: PaginationOptions;
  filters: {
    available: {
      categories: InsuranceCategoryInfo[];
      issuers: string[];
      provinces: string[];
    };
    applied: Partial<InsuranceFilters>;
  };
  sort: SortOption;
}

/**
 * API response for single product details
 */
export interface InsuranceProductDetailResponse {
  data: InsuranceProduct;
  related: InsuranceProduct[];
  comparisons: InsuranceProduct[];
}

/**
 * API error response
 */
export interface InsuranceError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

// ============================================================================
// Form Interfaces
// ============================================================================

/**
 * Insurance application form data
 */
export interface InsuranceApplicationData {
  productId: string;
  personalInfo: {
    fullName: string;
    dateOfBirth: string;
    gender: "male" | "female" | "other";
    idNumber: string;
    phone: string;
    email: string;
    address: {
      street: string;
      ward: string;
      district: string;
      province: string;
    };
  };
  vehicleInfo?: {
    type: VehicleType;
    brand: string;
    model: string;
    year: number;
    licensePlate: string;
    chassisNumber: string;
    engineNumber: string;
    value: number;
  };
  healthInfo?: {
    height: number;
    weight: number;
    smoker: boolean;
    preExistingConditions: string[];
    medications: string[];
  };
  coverageOptions: {
    selectedCoverage: string[];
    deductible?: number;
    additionalBenefits: string[];
  };
  paymentInfo: {
    method: string;
    period: CoveragePeriod;
    autoRenewal: boolean;
  };
}

// ============================================================================
// Analytics & Tracking Interfaces
// ============================================================================

/**
 * Event data for analytics tracking
 */
export interface InsuranceAnalyticsEvent {
  event: string;
  productId?: string;
  category?: string;
  label?: string;
  value?: number;
  properties?: Record<string, any>;
}

/**
 * Common analytics events for insurance products
 */
export type InsuranceAnalyticsEventType =
  | "product_view"
  | "product_click"
  | "product_apply_click"
  | "product_quote_click"
  | "product_bookmark"
  | "product_share"
  | "filter_apply"
  | "filter_clear"
  | "search"
  | "sort_change"
  | "comparison_add"
  | "comparison_remove"
  | "comparison_view"
  | "quote_generated"
  | "application_started"
  | "application_completed"
  | "redirect_to_partner";

// ============================================================================
// Export All Types
// ============================================================================

export type {
  // Re-export for convenience
  InsuranceProduct as default,
};
