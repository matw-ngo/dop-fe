/**
 * Constants and configurations for the Credit Cards feature
 * Contains all constant values used throughout the credit cards module
 */

import type {
  CardCategory,
  CardNetwork,
  AnnualFeeType,
  CreditCardFilters,
} from "@/types/credit-card";

// ============================================================================
// Filter Defaults
// ============================================================================

/** Default filter values when no filters are applied */
export const DEFAULT_FILTERS: CreditCardFilters = {
  categories: [] as CardCategory[],
  networks: [] as CardNetwork[],
  issuers: [] as string[],
  annualFeeType: [] as AnnualFeeType[],
  annualFeeRange: { min: 0, max: 10000000 }, // 0 - 10M VND
  creditLimitRange: { min: 0, max: 2000000000 }, // 0 - 2B VND
  hasAnnualFeeWaiver: false,
  ageRange: { min: 18, max: 80 },
  incomeRange: { min: 0, max: 100000000 }, // 0 - 100M VND
  employmentTypes: [] as (
    | "full_time"
    | "part_time"
    | "business_owner"
    | "freelancer"
    | "retired"
  )[],
  provinces: [] as string[],
  rewardsTypes: [] as string[],
  hasWelcomeOffer: false,
  hasInstallmentPlans: false,
  hasInsurance: false,
  digitalFeatures: [] as string[],
  isNew: false,
  isRecommended: false,
  isExclusive: false,
  minRating: 0,
};

/** Default sorting option */
export const DEFAULT_SORT_OPTION = "featured" as const;

/** Default pagination settings */
export const DEFAULT_PAGE_SIZE = 12;

/** Default page number */
export const DEFAULT_PAGE = 1;

// ============================================================================
// UI Constants
// ============================================================================

/** Maximum number of cards that can be compared at once */
export const MAX_COMPARISON_CARDS = 3;

/** Available pagination options */
export const PAGINATION_OPTIONS = [12, 24, 48, 96] as const;

/** Available view modes for card display */
export const VIEW_MODES = {
  GRID: "grid",
  LIST: "list",
  COMPACT: "compact",
} as const;

/** Default view mode */
export const DEFAULT_VIEW_MODE = VIEW_MODES.GRID;

/** Items per page options with labels */
export const ITEMS_PER_PAGE_OPTIONS = [
  { value: 12, label: "12" },
  { value: 24, label: "24" },
  { value: 48, label: "48" },
  { value: 96, label: "96" },
] as const;

// ============================================================================
// Sorting Options
// ============================================================================

/** All available sorting options with label keys for translations */
export const SORT_OPTIONS = [
  {
    value: "featured",
    labelKey: "sortFeatured",
    description: "Thẻ được đề xuất",
  },
  {
    value: "rating-desc",
    labelKey: "sortRatingDesc",
    description: "Sắp xếp theo đánh giá từ cao xuống thấp",
    direction: "desc" as const,
  },
  {
    value: "rating-asc",
    labelKey: "sortRatingAsc",
    description: "Sắp xếp theo đánh giá từ thấp lên cao",
    direction: "asc" as const,
  },
  {
    value: "fee-asc",
    labelKey: "sortFeeAsc",
    description: "Sắp xếp theo phí thường niên từ thấp lên cao",
    direction: "asc" as const,
  },
  {
    value: "fee-desc",
    labelKey: "sortFeeDesc",
    description: "Sắp xếp theo phí thường niên từ cao xuống thấp",
    direction: "desc" as const,
  },
  {
    value: "rate-asc",
    labelKey: "sortRateAsc",
    description: "Sắp xếp theo lãi suất từ thấp lên cao",
    direction: "asc" as const,
  },
  {
    value: "rate-desc",
    labelKey: "sortRateDesc",
    description: "Sắp xếp theo lãi suất từ cao xuống thấp",
    direction: "desc" as const,
  },
  {
    value: "limit-asc",
    labelKey: "sortLimitAsc",
    description: "Sắp xếp theo hạn mức từ thấp lên cao",
    direction: "asc" as const,
  },
  {
    value: "limit-desc",
    labelKey: "sortLimitDesc",
    description: "Sắp xếp theo hạn mức từ cao xuống thấp",
    direction: "desc" as const,
  },
  {
    value: "income-asc",
    labelKey: "sortIncomeAsc",
    description: "Sắp xếp theo yêu cầu thu nhập từ thấp lên cao",
    direction: "asc" as const,
  },
  {
    value: "income-desc",
    labelKey: "sortIncomeDesc",
    description: "Sắp xếp theo yêu cầu thu nhập từ cao xuống thấp",
    direction: "desc" as const,
  },
  {
    value: "reviews-desc",
    labelKey: "sortReviewsDesc",
    description: "Sắp xếp theo số lượng đánh giá",
    direction: "desc" as const,
  },
  {
    value: "newest",
    labelKey: "sortNewest",
    description: "Sắp xếp theo thẻ mới phát hành",
  },
  {
    value: "name-asc",
    labelKey: "sortNameAsc",
    description: "Sắp xếp theo tên thẻ từ A đến Z",
    direction: "asc" as const,
  },
  {
    value: "name-desc",
    labelKey: "sortNameDesc",
    description: "Sắp xếp theo tên thẻ từ Z đến A",
    direction: "desc" as const,
  },
] as const;

/** Sort directions */
export const SORT_DIRECTIONS = {
  ASC: "asc",
  DESC: "desc",
} as const;

// ============================================================================
// Card Categories
// ============================================================================

/** Card category mappings with Vietnamese names and descriptions */
export const CARD_CATEGORIES = {
  personal: {
    id: "personal",
    name: "Cá nhân",
    description: "Thẻ tín dụng cá nhân thông thường",
    icon: "credit-card",
    color: "#3B82F6",
  },
  business: {
    id: "business",
    name: "Doanh nghiệp",
    description: "Thẻ tín dụng cho doanh nghiệp và công ty",
    icon: "briefcase",
    color: "#10B981",
  },
  premium: {
    id: "premium",
    name: "Cao cấp",
    description: "Thẻ tín dụng cao cấp với nhiều đặc quyền",
    icon: "diamond",
    color: "#8B5CF6",
  },
  student: {
    id: "student",
    name: "Sinh viên",
    description: "Thẻ tín dụng dành cho sinh viên",
    icon: "graduation-cap",
    color: "#F59E0B",
  },
  cashback: {
    id: "cashback",
    name: "Hoàn tiền",
    description: "Thẻ tín dụng hoàn tiền cao",
    icon: "cash",
    color: "#22C55E",
  },
  travel: {
    id: "travel",
    name: "Du lịch",
    description: "Thẻ tín dụng ưu đãi du lịch, phòng chờ",
    icon: "plane",
    color: "#06B6D4",
  },
  shopping: {
    id: "shopping",
    name: "Mua sắm",
    description: "Thẻ tín dụng ưu đãi mua sắm",
    icon: "shopping-bag",
    color: "#EC4899",
  },
  fuel: {
    id: "fuel",
    name: "Xăng dầu",
    description: "Thẻ tín dụng ưu đãi xăng dầu",
    icon: "fuel",
    color: "#F97316",
  },
  dining: {
    id: "dining",
    name: "Ăn uống",
    description: "Thẻ tín dụng ưu đãi ẩm thực",
    icon: "utensils",
    color: "#EF4444",
  },
  entertainment: {
    id: "entertainment",
    name: "Giải trí",
    description: "Thẻ tín dụng ưu đãi giải trí",
    icon: "music",
    color: "#A855F7",
  },
} as const;

/** Card network options */
export const CARD_NETWORKS = {
  visa: { id: "visa", name: "Visa", icon: "visa" },
  mastercard: { id: "mastercard", name: "Mastercard", icon: "mastercard" },
  jcb: { id: "jcb", name: "JCB", icon: "jcb" },
  amex: { id: "amex", name: "American Express", icon: "amex" },
  unionpay: { id: "unionpay", name: "UnionPay", icon: "unionpay" },
  napas: { id: "napas", name: "Napas", icon: "napas" },
} as const;

/** Rewards program types */
export const REWARDS_TYPES = {
  points: { id: "points", name: "Tích điểm", icon: "star" },
  cashback: { id: "cashback", name: "Hoàn tiền", icon: "cash" },
  miles: { id: "miles", name: "Dặm bay", icon: "plane" },
  shopping: { id: "shopping", name: "Mua sắm", icon: "shopping-bag" },
  dining: { id: "dining", name: "Ăn uống", icon: "utensils" },
} as const;

// ============================================================================
// Fee Ranges
// ============================================================================

/** Annual fee ranges for filtering */
export const ANNUAL_FEE_RANGES = [
  { value: { min: 0, max: 0 }, label: "Miễn phí" },
  { value: { min: 0, max: 500000 }, label: "< 500.000 VNĐ" },
  { value: { min: 500000, max: 1000000 }, label: "500.000 - 1.000.000 VNĐ" },
  { value: { min: 1000000, max: 2000000 }, label: "1.000.000 - 2.000.000 VNĐ" },
  { value: { min: 2000000, max: 5000000 }, label: "2.000.000 - 5.000.000 VNĐ" },
  {
    value: { min: 5000000, max: 10000000 },
    label: "5.000.000 - 10.000.000 VNĐ",
  },
  { value: { min: 10000000, max: 999999999 }, label: "> 10.000.000 VNĐ" },
] as const;

/** Interest rate ranges for filtering */
export const INTEREST_RATE_RANGES = [
  { value: { min: 0, max: 15 }, label: "< 15%/năm" },
  { value: { min: 15, max: 20 }, label: "15% - 20%/năm" },
  { value: { min: 20, max: 25 }, label: "20% - 25%/năm" },
  { value: { min: 25, max: 30 }, label: "25% - 30%/năm" },
  { value: { min: 30, max: 35 }, label: "30% - 35%/năm" },
  { value: { min: 35, max: 100 }, label: "> 35%/năm" },
] as const;

/** Credit limit tiers for filtering */
export const CREDIT_LIMIT_TIERS = [
  { value: { min: 0, max: 20000000 }, label: "< 20 triệu VNĐ" },
  { value: { min: 20000000, max: 50000000 }, label: "20 - 50 triệu VNĐ" },
  { value: { min: 50000000, max: 100000000 }, label: "50 - 100 triệu VNĐ" },
  { value: { min: 100000000, max: 300000000 }, label: "100 - 300 triệu VNĐ" },
  { value: { min: 300000000, max: 999999999 }, label: "> 300 triệu VNĐ" },
] as const;

/** Income requirement ranges for filtering */
export const INCOME_REQUIREMENT_RANGES = [
  { value: { min: 0, max: 5000000 }, label: "< 5 triệu/tháng" },
  { value: { min: 5000000, max: 10000000 }, label: "5 - 10 triệu/tháng" },
  { value: { min: 10000000, max: 15000000 }, label: "10 - 15 triệu/tháng" },
  { value: { min: 15000000, max: 20000000 }, label: "15 - 20 triệu/tháng" },
  { value: { min: 20000000, max: 30000000 }, label: "20 - 30 triệu/tháng" },
  { value: { min: 30000000, max: 50000000 }, label: "30 - 50 triệu/tháng" },
  { value: { min: 50000000, max: 999999999 }, label: "> 50 triệu/tháng" },
] as const;

// ============================================================================
// Vietnamese Provinces
// ============================================================================

/** All 63 provinces and cities of Vietnam grouped by region */
export const VIETNAM_PROVINCES = {
  north: [
    "Hà Nội",
    "Hà Giang",
    "Cao Bằng",
    "Bắc Kạn",
    "Tuyên Quang",
    "Lào Cai",
    "Điện Biên",
    "Lai Châu",
    "Sơn La",
    "Yên Bái",
    "Hoà Bình",
    "Thái Nguyên",
    "Lạng Sơn",
    "Quảng Ninh",
    "Bắc Giang",
    "Phú Thọ",
    "Vĩnh Phúc",
    "Bắc Ninh",
    "Hải Dương",
    "Hải Phòng",
    "Hưng Yên",
    "Thái Bình",
    "Hà Nam",
    "Nam Định",
    "Ninh Bình",
    "Thanh Hóa",
    "Nghệ An",
  ],
  central: [
    "Hà Tĩnh",
    "Quảng Bình",
    "Quảng Trị",
    "Thừa Thiên Huế",
    "Đà Nẵng",
    "Quảng Nam",
    "Quảng Ngãi",
    "Bình Định",
    "Phú Yên",
    "Khánh Hòa",
    "Ninh Thuận",
    "Bình Thuận",
    "Kon Tum",
    "Gia Lai",
    "Đắk Lắk",
    "Đắk Nông",
    "Lâm Đồng",
    "Quảng Ngãi",
  ],
  south: [
    "Bình Phước",
    "Tây Ninh",
    "Bình Dương",
    "Đồng Nai",
    "Bà Rịa - Vũng Tàu",
    "Hồ Chí Minh",
    "Long An",
    "Tiền Giang",
    "Bến Tre",
    "Trà Vinh",
    "Vĩnh Long",
    "Đồng Tháp",
    "An Giang",
    "Kiên Giang",
    "Cần Thơ",
    "Hậu Giang",
    "Sóc Trăng",
    "Bạc Liêu",
    "Cà Mau",
  ],
} as const;

/** All provinces in a single array for dropdown */
export const ALL_PROVINCES = [
  ...VIETNAM_PROVINCES.north,
  ...VIETNAM_PROVINCES.central,
  ...VIETNAM_PROVINCES.south,
] as const;

/** Region labels */
export const REGION_LABELS = {
  north: "Miền Bắc",
  central: "Miền Trung",
  south: "Miền Nam",
} as const;

/** Province groups for filtering */
export const PROVINCE_GROUPS = {
  all: {
    id: "all",
    name: "Toàn quốc",
    provinces: ALL_PROVINCES,
  },
  north: {
    id: "north",
    name: REGION_LABELS.north,
    provinces: Object.keys(VIETNAM_PROVINCES.north),
  },
  central: {
    id: "central",
    name: REGION_LABELS.central,
    provinces: Object.keys(VIETNAM_PROVINCES.central),
  },
  south: {
    id: "south",
    name: REGION_LABELS.south,
    provinces: Object.keys(VIETNAM_PROVINCES.south),
  },
} as const;

// ============================================================================
// Analytics Events
// ============================================================================

/** Analytics event names for credit cards feature */
export const ANALYTICS_EVENTS = {
  // Card interactions
  CARD_VIEW: "credit_card_view",
  CARD_CLICK: "credit_card_click",
  CARD_APPLY_CLICK: "credit_card_apply_click",
  CARD_BOOKMARK: "credit_card_bookmark",
  CARD_SHARE: "credit_card_share",
  CARD_DETAILS_VIEW: "credit_card_details_view",

  // Filter and search
  FILTER_APPLY: "credit_card_filter_apply",
  FILTER_CLEAR: "credit_card_filter_clear",
  FILTER_CHANGE: "credit_card_filter_change",
  SEARCH_QUERY: "credit_card_search_query",
  SEARCH_SELECT: "credit_card_search_select",

  // Sorting and pagination
  SORT_CHANGE: "credit_card_sort_change",
  PAGE_CHANGE: "credit_card_page_change",
  ITEMS_PER_PAGE_CHANGE: "credit_card_items_per_page_change",

  // Comparison
  COMPARISON_ADD: "credit_card_comparison_add",
  COMPARISON_REMOVE: "credit_card_comparison_remove",
  COMPARISON_VIEW: "credit_card_comparison_view",
  COMPARISON_CLEAR: "credit_card_comparison_clear",
  COMPARISON_EXPORT: "credit_card_comparison_export",

  // View mode
  VIEW_MODE_CHANGE: "credit_card_view_mode_change",

  // Partner redirects
  REDIRECT_TO_PARTNER: "credit_card_redirect_to_partner",
  PARTNER_CLICK: "credit_card_partner_click",

  // Recommendations
  RECOMMENDATION_VIEW: "credit_card_recommendation_view",
  RECOMMENDATION_CLICK: "credit_card_recommendation_click",

  // Error tracking
  ERROR_OCCURRED: "credit_card_error_occurred",
  LOAD_FAILED: "credit_card_load_failed",
} as const;

/** Analytics event categories */
export const ANALYTICS_CATEGORIES = {
  ENGAGEMENT: "engagement",
  NAVIGATION: "navigation",
  CONVERSION: "conversion",
  SEARCH: "search",
  FILTER: "filter",
  COMPARISON: "comparison",
  ERROR: "error",
} as const;

/** Analytics custom dimensions */
export const ANALYTICS_DIMENSIONS = {
  CARD_ID: "card_id",
  CARD_CATEGORY: "card_category",
  CARD_ISSUER: "card_issuer",
  FILTER_TYPE: "filter_type",
  SORT_OPTION: "sort_option",
  VIEW_MODE: "view_mode",
  PAGE_NUMBER: "page_number",
  RESULTS_COUNT: "results_count",
  COMPARISON_COUNT: "comparison_count",
} as const;

// ============================================================================
// Application Constants
// ============================================================================

/** Application processing time in business days */
export const APPLICATION_PROCESSING_TIME = {
  FAST: 3, // 3 business days
  STANDARD: 7, // 7 business days
  SLOW: 14, // 14 business days
} as const;

/** Required documents for application */
export const REQUIRED_DOCUMENTS = {
  ID_CARD: "Căn cước công dân/CMND",
  HOUSEHOLD_REGISTRATION: "Sổ hộ khẩu",
  INCOME_PROOF: "Giấy tờ chứng minh thu nhập",
  EMPLOYMENT_CONTRACT: "Hợp đồng lao động",
  BANK_STATEMENT: "Sao kê ngân hàng",
  TAX_RETURN: "Báo cáo thuế",
  BUSINESS_LICENSE: "Giấy phép kinh doanh",
} as const;

/** Employment types */
export const EMPLOYMENT_TYPES = {
  FULL_TIME: {
    id: "full_time",
    name: "Toàn thời gian",
    label: "Nhân viên chính thức",
  },
  PART_TIME: {
    id: "part_time",
    name: "Bán thời gian",
    label: "Nhân viên bán thời gian",
  },
  BUSINESS_OWNER: {
    id: "business_owner",
    name: "Chủ doanh nghiệp",
    label: "Chủ doanh nghiệp",
  },
  FREELANCER: { id: "freelancer", name: "Tự do", label: "Làm việc tự do" },
  RETIRED: { id: "retired", name: "Hưu trí", label: "Người đã hưu trí" },
} as const;

// ============================================================================
// UI Configuration
// ============================================================================

/** Breakpoints for responsive design */
export const BREAKPOINTS = {
  SM: 640,
  MD: 768,
  LG: 1024,
  XL: 1280,
  "2XL": 1536,
} as const;

/** Animation durations in milliseconds */
export const ANIMATION_DURATIONS = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500,
} as const;

/** Debounce times in milliseconds */
export const DEBOUNCE_TIMES = {
  SEARCH: 300,
  FILTER: 500,
  TYPING: 200,
} as const;

/** Image configuration */
export const IMAGE_CONFIG = {
  PLACEHOLDER: "/images/credit-card-placeholder.png",
  LAZY_LOADING: true,
  QUALITY: 85,
  WIDTHS: [200, 400, 600, 800],
} as const;

// ============================================================================
// Error Messages
// ============================================================================

/** Error messages for credit cards feature */
export const ERROR_MESSAGES = {
  LOAD_FAILED: "Không thể tải danh sách thẻ tín dụng. Vui lòng thử lại.",
  DETAIL_LOAD_FAILED:
    "Không thể tải thông tin chi tiết thẻ tín dụng. Vui lòng thử lại.",
  COMPARISON_FULL: "Bạn chỉ có thể so sánh tối đa 3 thẻ cùng lúc.",
  COMPARISON_EMPTY: "Vui lòng chọn ít nhất 2 thẻ để so sánh.",
  SEARCH_NO_RESULTS:
    "Không tìm thấy thẻ tín dụng nào phù hợp với tìm kiếm của bạn.",
  FILTER_NO_RESULTS: "Không tìm thấy thẻ tín dụng nào phù hợp với bộ lọc.",
  REDIRECT_FAILED: "Không thể chuyển đến trang đối tác. Vui lòng thử lại.",
  BOOKMARK_FAILED: "Không thể lưu thẻ vào danh sách yêu thích.",
  SHARE_FAILED: "Không thể chia sẻ thông tin thẻ. Vui lòng thử lại.",
  NETWORK_ERROR: "Lỗi kết nối mạng. Vui lòng kiểm tra kết nối và thử lại.",
  SERVER_ERROR: "Lỗi máy chủ. Vui lòng thử lại sau.",
  INVALID_CARD_ID: "Thông tin thẻ không hợp lệ.",
  COMPARE_SAME_CARD: "Không thể so sánh cùng một thẻ.",
} as const;

// ============================================================================
// Success Messages
// ============================================================================

/** Success messages for credit cards feature */
export const SUCCESS_MESSAGES = {
  BOOKMARK_ADDED: "Đã thêm thẻ vào danh sách yêu thích.",
  BOOKMARK_REMOVED: "Đã xóa thẻ khỏi danh sách yêu thích.",
  COMPARISON_ADDED: "Đã thêm thẻ vào danh sách so sánh.",
  COMPARISON_REMOVED: "Đã xóa thẻ khỏi danh sách so sánh.",
  COMPARISON_CLEARED: "Đã xóa tất cả thẻ khỏi danh sách so sánh.",
  COPIED_LINK: "Đã sao chép đường dẫn.",
  SHARED_SUCCESSFULLY: "Đã chia sẻ thông tin thẻ thành công.",
  FILTER_APPLIED: "Đã áp dụng bộ lọc thành công.",
  FILTER_CLEARED: "Đã xóa bộ lọc.",
} as const;

// ============================================================================
// SEO Configuration
// ============================================================================

/** Default SEO titles and descriptions */
export const SEO_DEFAULTS = {
  LIST_TITLE: "So sánh Thẻ Tín Dụng Tốt Nhất 2024 | Tìm Thẻ Phù Hợp",
  LIST_DESCRIPTION:
    "So sánh và tìm kiếm thẻ tín dụng phù hợp nhất với nhu cầu của bạn. Phí thường niên, lãi suất, ưu đãi và nhiều hơn nữa.",
  COMPARE_TITLE: "So Sánh Thẻ Tín Dụng | So Sánh Đầy Đủ Thông Tin",
  COMPARE_DESCRIPTION:
    "So sánh chi tiết các loại thẻ tín dụng cạnh tranh. Tìm thẻ tốt nhất cho bạn.",
  DETAIL_TITLE_TEMPLATE:
    "{{cardName}} - Chi Tiết Thẻ Tín Dụng | Phí, Lãi Suất, Ưu Đãi",
  DETAIL_DESCRIPTION_TEMPLATE:
    "Thông tin chi tiết về thẻ tín dụng {{cardName}}. Phí thường niên, lãi suất, điều kiện, ưu đãi và cách đăng ký.",
} as const;

/** Structured data types */
export const STRUCTURED_DATA_TYPES = {
  PRODUCT: "Product",
  FINANCIAL_SERVICE: "FinancialService",
  AGGREGATE_RATING: "AggregateRating",
  OFFER: "Offer",
} as const;
