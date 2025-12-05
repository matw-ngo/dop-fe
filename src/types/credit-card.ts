/**
 * TypeScript interfaces for the Credit Cards feature
 * Supports comprehensive credit card comparison and filtering functionality
 */

// ============================================================================
// Core Types
// ============================================================================

/**
 * Card network types accepted in Vietnam
 */
export type CardNetwork =
  | "visa"
  | "mastercard"
  | "jcb"
  | "amex"
  | "unionpay"
  | "napas";

/**
 * Card categories based on target audience and features
 */
export type CardCategory =
  | "personal" // Standard personal cards
  | "business" // Business/corporate cards
  | "premium" // Premium/luxury cards with high requirements
  | "student" // Student cards with lower requirements
  | "cashback" // Cards focused on cashback rewards
  | "travel" // Travel-focused cards with lounge access
  | "shopping" // Shopping-focused cards with merchant discounts
  | "fuel" // Fuel-focused cards with gas station benefits
  | "dining" // Dining-focused cards with restaurant benefits
  | "entertainment"; // Entertainment-focused cards

/**
 * Annual fee structure types
 */
export type AnnualFeeType =
  | "free" // No annual fee
  | "waivable" // Fee can be waived based on spending
  | "tiered" // Different fees for different tiers
  | "fixed"; // Fixed annual fee

/**
 * Interest rate calculation types
 */
export type InterestRateType =
  | "fixed" // Fixed interest rate
  | "variable" // Variable based on market conditions
  | "tiered"; // Different rates for different tiers

/**
 * Credit limit tiers
 */
export type CreditLimitTier =
  | "standard" // 10-50 million VND
  | "gold" // 50-100 million VND
  | "platinum" // 100-300 million VND
  | "infinite"; // 300+ million VND

// ============================================================================
// Main Interfaces
// ============================================================================

/**
 * Comprehensive Credit Card interface
 * Contains all financial, requirement, and feature information
 */
export interface CreditCard {
  // Identification
  id: string;
  slug: string;
  name: string;
  issuer: string;
  cardType: CardNetwork;
  category: CardCategory;

  // Financial Details
  annualFee: number;
  annualFeeType: AnnualFeeType;
  annualFeeWaiverConditions?: string;
  interestRate: number; // Annual interest rate in % (typically 15-35%)
  interestRateType: InterestRateType;
  creditLimitMin: number;
  creditLimitMax: number;
  creditLimitTier: CreditLimitTier;

  // Income Requirements
  incomeRequiredMin: number;
  incomeRequiredMax?: number;
  incomeProof: (
    | "payroll"
    | "bank_statement"
    | "tax_return"
    | "business_license"
  )[];
  employmentType?:
    | "full_time"
    | "part_time"
    | "business_owner"
    | "freelancer"
    | "retired";

  // Age Requirements
  ageRequiredMin: number;
  ageRequiredMax?: number;

  // Geographic Availability
  provinces: string[];
  nationalAvailability: boolean;

  // Features & Benefits
  features: string[];
  benefits: string[];
  welcomeOffer?: string;
  welcomeOfferExpiry?: string;

  // Rewards Program
  rewardsProgram?: {
    type: "points" | "cashback" | "miles" | "hybrid";
    earnRate: number; // points/miles/cashback per 1000 VND
    categories?: {
      category: string;
      rate: number;
    }[];
    expiryMonths?: number;
    minimumRedemption?: number;
  };

  // Fees Structure
  withdrawalFee: number; // % of amount (typically 3-4%)
  withdrawalFeeMin?: number;
  foreignExchangeFee: number; // % of transaction (typically 2-3.5%)
  latePaymentFee: number;
  latePaymentFeeType: "fixed" | "percentage" | "tiered";
  overLimitFee: number;
  returnedPaymentFee: number;
  balanceTransferFee?: number; // % of transfer amount (typically 2-5%)
  balanceTransferFeeType?: "fixed" | "percentage";

  // Installment Plans
  installmentPlans?: {
    months: number;
    interestRate: number;
    minAmount: number;
  }[];

  // Insurance & Protection
  insurance?: {
    travel?: boolean;
    medical?: boolean;
    purchaseProtection?: boolean;
    fraudProtection?: boolean;
    carRental?: boolean;
  };

  // Digital Features
  digitalFeatures?: {
    mobileBanking: boolean;
    nfcPayment: boolean;
    qrPayment: boolean;
    onlineBanking: boolean;
    cardControl: boolean; // freeze/unfreeze card
    expenseTracking: boolean;
  };

  // Application Process
  applicationMethods: ("online" | "branch" | "phone" | "mobile_app")[];
  processingTime: number; // in business days
  documentsRequired: string[];

  // Metadata
  image: string;
  imageAlt: string;
  applyLink: string;
  applyLinkType: "direct" | "affiliate" | "redirect";
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
 * Card category information for filtering and navigation
 */
export interface CardCategoryInfo {
  id: CardCategory;
  name: string;
  description: string;
  icon: string;
  count: number;
  features: string[];
}

// ============================================================================
// Filter & Search Interfaces
// ============================================================================

/**
 * Comprehensive filter options for credit cards
 */
export interface CreditCardFilters {
  // Basic Filters
  categories: CardCategory[];
  networks: CardNetwork[];
  issuers: string[];

  // Financial Filters
  annualFeeType: AnnualFeeType[];
  annualFeeRange: {
    min: number;
    max: number;
  };
  creditLimitRange: {
    min: number;
    max: number;
  };
  hasAnnualFeeWaiver: boolean;

  // Requirements Filters
  ageRange: {
    min: number;
    max: number;
  };
  incomeRange: {
    min: number;
    max: number;
  };
  employmentTypes: (
    | "full_time"
    | "part_time"
    | "business_owner"
    | "freelancer"
    | "retired"
  )[];
  provinces: string[];

  // Feature Filters
  rewardsTypes: string[];
  hasWelcomeOffer: boolean;
  hasInstallmentPlans: boolean;
  hasInsurance: boolean;

  // Digital Features
  digitalFeatures: string[];

  // Special Filters
  isNew: boolean;
  isRecommended: boolean;
  isExclusive: boolean;

  // Rating Filter
  minRating: number;
}

/**
 * Search options
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
 * Available sorting options
 */
export type SortOption =
  | "featured" // Editor's choice, recommended cards
  | "rating-desc" // Highest rated first
  | "rating-asc" // Lowest rated first
  | "fee-asc" // Lowest annual fee first
  | "fee-desc" // Highest annual fee first
  | "rate-asc" // Lowest interest rate first
  | "rate-desc" // Highest interest rate first
  | "limit-asc" // Lowest credit limit first
  | "limit-desc" // Highest credit limit first
  | "income-asc" // Lowest income requirement first
  | "income-desc" // Highest income requirement first
  | "reviews-desc" // Most reviews first
  | "newest" // Newest cards first
  | "name-asc" // Alphabetical A-Z
  | "name-desc"; // Alphabetical Z-A

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
 * Comparison result for side-by-side card comparison
 */
export interface ComparisonResult {
  cards: CreditCard[];
  comparisonCriteria: ComparisonCriteria[];
  winnerByCategory?: {
    [category: string]: string; // cardId that wins in this category
  };
  summary: {
    bestOverall?: string;
    lowestFee?: string;
    highestLimit?: string;
    bestRewards?: string;
    mostFlexible?: string;
  };
}

/**
 * Individual comparison criteria
 */
export interface ComparisonCriteria {
  id: string;
  label: string;
  description?: string;
  type: "number" | "text" | "boolean" | "percentage" | "currency";
  importance: "low" | "medium" | "high";
  getValue: (card: CreditCard) => string | number | boolean;
  format?: (value: any) => string;
}

/**
 * Comparison state management
 */
export interface ComparisonState {
  selectedCards: string[];
  maxCards: number;
  canAddMore: boolean;
  isFull: boolean;
}

// ============================================================================
// API & Response Interfaces
// ============================================================================

/**
 * API response for credit cards listing
 */
export interface CreditCardsResponse {
  data: CreditCard[];
  pagination: PaginationOptions;
  filters: {
    available: {
      categories: CardCategoryInfo[];
      issuers: string[];
      networks: CardNetwork[];
      provinces: string[];
    };
    applied: Partial<CreditCardFilters>;
  };
  sort: SortOption;
}

/**
 * API response for single card details
 */
export interface CreditCardDetailResponse {
  data: CreditCard;
  related: CreditCard[];
  comparisons: CreditCard[];
}

/**
 * API error response
 */
export interface CreditCardsError {
  code: string;
  message: string;
  details?: any;
}

// ============================================================================
// UI State Interfaces
// ============================================================================

/**
 * View mode for card display
 */
export type ViewMode = "grid" | "list" | "compact";

/**
 * Card list UI state
 */
export interface CreditCardsUIState {
  viewMode: ViewMode;
  isLoading: boolean;
  isError: boolean;
  error?: CreditCardsError;
  sidebarOpen: boolean;
  mobileFiltersOpen: boolean;
  searchFocused: boolean;
}

/**
 * Individual card UI state
 */
export interface CardUIState {
  isBookmarked: boolean;
  isInComparison: boolean;
  showDetails: boolean;
  imageLoaded: boolean;
  applyClicked: boolean;
}

// ============================================================================
// Analytics & Tracking Interfaces
// ============================================================================

/**
 * Event data for analytics tracking
 */
export interface AnalyticsEvent {
  event: string;
  cardId?: string;
  category?: string;
  label?: string;
  value?: number;
  properties?: Record<string, any>;
}

/**
 * Common analytics events for credit cards
 */
export type CreditCardAnalyticsEvent =
  | "card_view"
  | "card_click"
  | "card_apply_click"
  | "card_bookmark"
  | "card_share"
  | "filter_apply"
  | "filter_clear"
  | "search"
  | "sort_change"
  | "comparison_add"
  | "comparison_remove"
  | "comparison_view"
  | "redirect_to_partner";

// ============================================================================
// Type Aliases for Convenience
// ============================================================================

/**
 * Alias for CreditCard interface - used in detail components
 * Provides semantic clarity for components that display detailed card information
 */
export type DetailedCreditCardInfo = CreditCard;

// ============================================================================
// Export All Types
// ============================================================================

export type {
  // Re-export for convenience
  CreditCard as default,
};
