/**
 * Constants and configurations for the Insurance Products feature
 * Contains all constant values used throughout the insurance module
 */

import {
  CoveragePeriod,
  FeeType,
  InsuranceCategory,
  InsuranceType,
  SortOption,
  VehicleType,
} from "@/types/insurance";

// ============================================================================
// Filter Defaults
// ============================================================================

/** Default filter values when no filters are applied */
export const DEFAULT_FILTERS = {
  categories: [] as InsuranceCategory[],
  types: [] as InsuranceType[],
  issuers: [] as string[],
  coverageRange: {
    personalAccident: { min: 0, max: 2000000000 }, // 0 - 2B VND
    propertyDamage: { min: 0, max: 2000000000 }, // 0 - 2B VND
    medicalExpenses: { min: 0, max: 1000000000 }, // 0 - 1B VND
  },
  specificCoverages: [] as string[],
  premiumRange: { min: 0, max: 50000000 }, // 0 - 50M VND
  feeTypes: [] as FeeType[],
  coveragePeriods: [] as CoveragePeriod[],
  ageRange: { min: 18, max: 80 },
  includePreExistingConditions: false,
  hasRoadsideAssistance: false,
  hasWorldwideCoverage: false,
  hasMedicalHotline: false,
  hasLegalSupport: false,
  minApprovalRate: 0,
  maxProcessingTime: 30, // days
  provinces: [] as string[],
  nationalAvailability: false,
  isNew: false,
  isRecommended: false,
  isExclusive: false,
  hasAutoRenewal: false,
  hasInstallments: false,
  minRating: 0,
} as const;

/** Default sorting option */
export const DEFAULT_SORT_OPTION = "featured" as const;

/** Default pagination settings */
export const DEFAULT_PAGE_SIZE = 12;

/** Default page number */
export const DEFAULT_PAGE = 1;

// ============================================================================
// UI Constants
// ============================================================================

/** Maximum number of insurance products that can be compared at once */
export const MAX_COMPARISON_PRODUCTS = 3;

/** Available pagination options */
export const PAGINATION_OPTIONS = [12, 24, 48, 96] as const;

/** Available view modes for product display */
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
    value: SortOption.FEATURED,
    labelKey: "sortFeatured",
    description: "Sản phẩm được đề xuất",
  },
  {
    value: SortOption.RATING_DESC,
    labelKey: "sortRatingDesc",
    description: "Sắp xếp theo đánh giá từ cao xuống thấp",
    direction: "desc" as const,
  },
  {
    value: SortOption.RATING_ASC,
    labelKey: "sortRatingAsc",
    description: "Sắp xếp theo đánh giá từ thấp lên cao",
    direction: "asc" as const,
  },
  {
    value: SortOption.PREMIUM_ASC,
    labelKey: "sortPremiumAsc",
    description: "Sắp xếp theo phí bảo hiểm từ thấp đến cao",
    direction: "asc" as const,
  },
  {
    value: SortOption.PREMIUM_DESC,
    labelKey: "sortPremiumDesc",
    description: "Sắp xếp theo phí bảo hiểm từ cao xuống thấp",
    direction: "desc" as const,
  },
  {
    value: SortOption.COVERAGE_ASC,
    labelKey: "sortCoverageAsc",
    description: "Sắp xếp theo mức bảo hiểm từ thấp đến cao",
    direction: "asc" as const,
  },
  {
    value: SortOption.COVERAGE_DESC,
    labelKey: "sortCoverageDesc",
    description: "Sắp xếp theo mức bảo hiểm từ cao xuống thấp",
    direction: "desc" as const,
  },
  {
    value: SortOption.CLAIMS_APPROVED_DESC,
    labelKey: "sortClaimsApprovedDesc",
    description: "Sắp xếp theo tỷ lệ duyệt yêu cầu bồi thường",
    direction: "desc" as const,
  },
  {
    value: SortOption.CLAIMS_TIME_ASC,
    labelKey: "sortClaimsTimeAsc",
    description: "Sắp xếp theo thời gian xử lý bồi thường",
    direction: "asc" as const,
  },
  {
    value: SortOption.NEWEST,
    labelKey: "sortNewest",
    description: "Sắp xếp theo sản phẩm mới",
  },
  {
    value: SortOption.NAME_ASC,
    labelKey: "sortNameAsc",
    description: "Sắp xếp theo tên sản phẩm từ A đến Z",
    direction: "asc" as const,
  },
  {
    value: SortOption.NAME_DESC,
    labelKey: "sortNameDesc",
    description: "Sắp xếp theo tên sản phẩm từ Z đến A",
    direction: "desc" as const,
  },
] as const;

/** Sort directions */
export const SORT_DIRECTIONS = {
  ASC: "asc",
  DESC: "desc",
} as const;

// ============================================================================
// Insurance Categories
// ============================================================================

/** Insurance category mappings with Vietnamese names and descriptions */
export const INSURANCE_CATEGORIES = {
  [InsuranceCategory.VEHICLE]: {
    id: InsuranceCategory.VEHICLE,
    name: "Bảo hiểm xe",
    description: "Bảo hiểm vật chất xe và trách nhiệm dân sự chủ xe cơ giới",
    icon: "car",
    color: "#3B82F6",
    mandatory: ["Bắt buộc TNDS xe cơ giới"],
    voluntary: ["Tự nguyện vật chất xe"],
  },
  [InsuranceCategory.HEALTH]: {
    id: InsuranceCategory.HEALTH,
    name: "Bảo hiểm sức khỏe",
    description: "Bảo hiểm chi phí y tế và chăm sóc sức khỏe",
    icon: "heart",
    color: "#EF4444",
    mandatory: [],
    voluntary: ["Thân vỏ", "Tai nạn cá nhân", "Bệnh hiểm nghèo"],
  },
  [InsuranceCategory.LIFE]: {
    id: InsuranceCategory.LIFE,
    name: "Bảo hiểm nhân thọ",
    description: "Bảo hiểm life, giáo dục, hưu trí",
    icon: "shield",
    color: "#8B5CF6",
    mandatory: [],
    voluntary: ["Nhân thọ", "Giáo dục", "Hưu trí"],
  },
  [InsuranceCategory.TRAVEL]: {
    id: InsuranceCategory.TRAVEL,
    name: "Bảo hiểm du lịch",
    description: "Bảo hiểm cho chuyến đi trong và ngoài nước",
    icon: "plane",
    color: "#06B6D4",
    mandatory: [],
    voluntary: ["Du lịch nội địa", "Du lịch quốc tế"],
  },
  [InsuranceCategory.PROPERTY]: {
    id: InsuranceCategory.PROPERTY,
    name: "Bảo hiểm tài sản",
    description: "Bảo hiểm nhà cửa, tài sản và cháy nổ",
    icon: "home",
    color: "#10B981",
    mandatory: [],
    voluntary: ["Cháy nổ bắt buộc", "Tài sản tư nhân"],
  },
} as const;

/** Insurance types with Vietnamese names */
export const INSURANCE_TYPES = {
  [InsuranceType.COMPULSORY]: {
    id: InsuranceType.COMPULSORY,
    name: "Bắt buộc",
    description: "Bảo hiểm bắt buộc theo quy định pháp luật",
    color: "#DC2626",
  },
  [InsuranceType.VOLUNTARY]: {
    id: InsuranceType.VOLUNTARY,
    name: "Tự nguyện",
    description: "Bảo hiểm tự nguyện lựa chọn",
    color: "#059669",
  },
} as const;

// ============================================================================
// Vehicle Types
// ============================================================================

/** Vehicle types with Vietnamese names and icons */
export const VEHICLE_TYPES = {
  [VehicleType.CAR]: {
    id: VehicleType.CAR,
    name: "Ô tô",
    description: "Xe ô tô con 4-16 chỗ",
    icon: "car",
  },
  [VehicleType.MOTORCYCLE]: {
    id: VehicleType.MOTORCYCLE,
    name: "Xe máy",
    description: "Xe mô tô hai bánh",
    icon: "motorcycle",
  },
  [VehicleType.SCOOTER]: {
    id: VehicleType.SCOOTER,
    name: "Xe ga",
    description: "Xe tay ga dưới 175cc",
    icon: "scooter",
  },
  [VehicleType.THREE_WHEELER]: {
    id: VehicleType.THREE_WHEELER,
    name: "Xe ba bánh",
    description: "Xe ba bánh cơ giới",
    icon: "three-wheeler",
  },
  [VehicleType.TRUCK]: {
    id: VehicleType.TRUCK,
    name: "Xe tải",
    description: "Xe tải chở hàng",
    icon: "truck",
  },
  [VehicleType.BUS]: {
    id: VehicleType.BUS,
    name: "Xe khách",
    description: "Xe chở khách từ 10 chỗ trở lên",
    icon: "bus",
  },
} as const;

// ============================================================================
// Fee Types
// ============================================================================

/** Fee structure types with descriptions */
export const FEE_TYPES = {
  [FeeType.FIXED]: {
    id: FeeType.FIXED,
    name: "Cố định",
    description: "Phí cố định cho mỗi kỳ",
    icon: "calculator",
  },
  [FeeType.PERCENTAGE]: {
    id: FeeType.PERCENTAGE,
    name: "Phần trăm",
    description: "Phí tính theo % giá trị tài sản",
    icon: "percent",
  },
  [FeeType.TIERED]: {
    id: FeeType.TIERED,
    name: "Theo bậc",
    description: "Phí khác nhau theo từng bậc bảo hiểm",
    icon: "layers",
  },
  [FeeType.CALCULATED]: {
    id: FeeType.CALCULATED,
    name: "Tính toán",
    description: "Phí tính theo công thức phức tạp",
    icon: "functions",
  },
} as const;

// ============================================================================
// Coverage Periods
// ============================================================================

/** Coverage period options with Vietnamese names */
export const COVERAGE_PERIODS = {
  [CoveragePeriod.MONTHLY]: {
    id: CoveragePeriod.MONTHLY,
    name: "Hàng tháng",
    days: 30,
    description: "Bảo hiểm 1 tháng",
  },
  [CoveragePeriod.QUARTERLY]: {
    id: CoveragePeriod.QUARTERLY,
    name: "Hàng quý",
    days: 90,
    description: "Bảo hiểm 3 tháng",
  },
  [CoveragePeriod.SEMI_ANNUALLY]: {
    id: CoveragePeriod.SEMI_ANNUALLY,
    name: "6 tháng",
    days: 180,
    description: "Bảo hiểm 6 tháng",
  },
  [CoveragePeriod.ANNUALLY]: {
    id: CoveragePeriod.ANNUALLY,
    name: "Hàng năm",
    days: 365,
    description: "Bảo hiểm 1 năm",
  },
  [CoveragePeriod.CUSTOM]: {
    id: CoveragePeriod.CUSTOM,
    name: "Tùy chỉnh",
    days: 0,
    description: "Kỳ hạn tùy chỉnh",
  },
} as const;

// ============================================================================
// Coverage Ranges
// ============================================================================

/** Personal accident coverage ranges for filtering (in VND) */
export const PERSONAL_ACCIDENT_COVERAGE_RANGES = [
  { value: { min: 0, max: 100000000 }, label: "< 100 triệu VNĐ" },
  { value: { min: 100000000, max: 300000000 }, label: "100 - 300 triệu VNĐ" },
  { value: { min: 300000000, max: 500000000 }, label: "300 - 500 triệu VNĐ" },
  { value: { min: 500000000, max: 1000000000 }, label: "500 triệu - 1 tỷ VNĐ" },
  { value: { min: 1000000000, max: 2000000000 }, label: "1 - 2 tỷ VNĐ" },
  { value: { min: 2000000000, max: 9999999999 }, label: "> 2 tỷ VNĐ" },
] as const;

/** Property damage coverage ranges for filtering (in VND) */
export const PROPERTY_DAMAGE_COVERAGE_RANGES = [
  { value: { min: 0, max: 50000000 }, label: "< 50 triệu VNĐ" },
  { value: { min: 50000000, max: 100000000 }, label: "50 - 100 triệu VNĐ" },
  { value: { min: 100000000, max: 300000000 }, label: "100 - 300 triệu VNĐ" },
  { value: { min: 300000000, max: 500000000 }, label: "300 - 500 triệu VNĐ" },
  { value: { min: 500000000, max: 1000000000 }, label: "500 triệu - 1 tỷ VNĐ" },
  { value: { min: 1000000000, max: 9999999999 }, label: "> 1 tỷ VNĐ" },
] as const;

/** Medical expenses coverage ranges for filtering (in VND) */
export const MEDICAL_EXPENSES_COVERAGE_RANGES = [
  { value: { min: 0, max: 10000000 }, label: "< 10 triệu VNĐ" },
  { value: { min: 10000000, max: 20000000 }, label: "10 - 20 triệu VNĐ" },
  { value: { min: 20000000, max: 50000000 }, label: "20 - 50 triệu VNĐ" },
  { value: { min: 50000000, max: 100000000 }, label: "50 - 100 triệu VNĐ" },
  {
    value: { min: 100000000, max: 500000000 },
    label: "100 triệu - 500 triệu VNĐ",
  },
  { value: { min: 500000000, max: 9999999999 }, label: "> 500 triệu VNĐ" },
] as const;

// ============================================================================
// Premium Ranges
// ============================================================================

/** Premium ranges for filtering (in VND per year) */
export const PREMIUM_RANGES = [
  { value: { min: 0, max: 1000000 }, label: "< 1 triệu/năm" },
  { value: { min: 1000000, max: 3000000 }, label: "1 - 3 triệu/năm" },
  { value: { min: 3000000, max: 5000000 }, label: "3 - 5 triệu/năm" },
  { value: { min: 5000000, max: 10000000 }, label: "5 - 10 triệu/năm" },
  { value: { min: 10000000, max: 20000000 }, label: "10 - 20 triệu/năm" },
  { value: { min: 20000000, max: 50000000 }, label: "20 - 50 triệu/năm" },
  { value: { min: 50000000, max: 999999999 }, label: "> 50 triệu/năm" },
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

/** Province groups for filtering */
export const PROVINCE_GROUPS = {
  all: {
    id: "all",
    name: "Toàn quốc",
    provinces: ALL_PROVINCES,
  },
  north: {
    id: "north",
    name: "Miền Bắc",
    provinces: VIETNAM_PROVINCES.north,
  },
  central: {
    id: "central",
    name: "Miền Trung",
    provinces: VIETNAM_PROVINCES.central,
  },
  south: {
    id: "south",
    name: "Miền Nam",
    provinces: VIETNAM_PROVINCES.south,
  },
} as const;

/** Region labels */
export const REGION_LABELS = {
  north: "Miền Bắc",
  central: "Miền Trung",
  south: "Miền Nam",
} as const;

// ============================================================================
// Vietnamese Insurance Regulation References
// ============================================================================

/** Legal references for Vietnamese insurance regulations */
export const INSURANCE_REGULATIONS = {
  TNDS_BAT_BUOC: {
    name: "Luật Bảo hiểm TNDS xe cơ giới",
    reference: "Nghị định 03/2021/NĐ-CP",
    description: "Bảo hiểm trách nhiệm dân sự bắt buộc đối với chủ xe cơ giới",
    url: "https://vanban.chinhphu.vn/default.aspx?pageid=27115&docid=189534",
  },
  HANH_LY_BAT_BUOC: {
    name: "Bảo hiểm hàng không",
    reference: "Nghị định 50/2017/NĐ-CP",
    description: "Bảo hiểm bắt buộc trong lĩnh vực hàng không dân dụng",
    url: "https://vanban.chinhphu.vn/default.aspx?pageid=27115&docid=168818",
  },
  HAI_QUAN_BAT_BUUC: {
    name: "Bảo hiểm hải quan",
    reference: "Nghị định 84/2009/NĐ-CP",
    description: "Bảo hiểm cho hàng hóa xuất khẩu, nhập khẩu",
    url: "https://vanban.chinhphu.vn/default.aspx?pageid=27115&docid=90876",
  },
  BAO_HIEM_XUAT_KHAU: {
    name: "Bảo hiểm xuất khẩu",
    reference: "Nghị định 65/2011/NĐ-CP",
    description: "Bảo hiểm tín dụng xuất khẩu",
    url: "https://vanban.chinhphu.vn/default.aspx?pageid=27115&docid=125211",
  },
} as const;

// ============================================================================
// Common Vehicle Types in Vietnam with Tax Information
// ============================================================================

/** Common vehicle types with registration tax rates */
export const VIETNAMESE_VEHICLE_TAX_RATES = {
  CAR_UNDER_9_SEATS: {
    name: "Ô tô dưới 9 chỗ",
    taxRate: 5,
    registrationFee: 10,
    description: "Thuế trước bạ 5%, Phí đăng ký 10%",
  },
  CAR_9_16_SEATS: {
    name: "Ô tô 9-16 chỗ",
    taxRate: 3,
    registrationFee: 10,
    description: "Thuế trước bạ 3%, Phí đăng ký 10%",
  },
  MOTORCYCLE_UNDER_150CC: {
    name: "Xe máy dưới 150cc",
    taxRate: 5,
    registrationFee: 5,
    description: "Thuế trước bạ 5%, Phí đăng ký 5%",
  },
  MOTORCYCLE_150CC_PLUS: {
    name: "Xe máy từ 150cc trở lên",
    taxRate: 10,
    registrationFee: 5,
    description: "Thuế trước bạ 10%, Phí đăng ký 5%",
  },
  ELECTRIC_VEHICLE: {
    name: "Xe điện",
    taxRate: 0,
    registrationFee: 5,
    description: "Miễn thuế trước bạ, Phí đăng ký 5%",
  },
} as const;

// ============================================================================
// Fee Calculation Bases
// ============================================================================

/** Base calculations for different insurance types */
export const FEE_CALCULATION_BASES = {
  TNDS_XE_MAY: {
    baseType: "fixed",
    baseValue: 66000,
    vat: 10,
    description: "Phí TNDS xe máy cố định 66.000đ/năm (đã bao gồm VAT)",
  },
  TNDS_O_TO_NHO: {
    baseType: "fixed",
    baseValue: 437000,
    vat: 10,
    description:
      "Phí TNDS ô tô dưới 6 chỗ cố định 437.000đ/năm (đã bao gồm VAT)",
  },
  TNDS_O_TO_LON: {
    baseType: "fixed",
    baseValue: 790000,
    vat: 10,
    description:
      "Phí TNDS ô tô từ 6-11 chỗ cố định 790.000đ/năm (đã bao gồm VAT)",
  },
  VAT_CHAT_XE: {
    baseType: "percentage",
    baseValue: 1.2,
    minPremium: 1000000,
    vat: 10,
    description:
      "Phí bảo hiểm vật chất xe = 1.2% giá trị xe (tối thiểu 1 triệu)",
  },
  TAI_NAN_CA_NHAN: {
    baseType: "tiered",
    tiers: [
      { max: 100000000, rate: 0.15 },
      { max: 500000000, rate: 0.12 },
      { max: 1000000000, rate: 0.1 },
      { max: 2000000000, rate: 0.08 },
      { max: 5000000000, rate: 0.06 },
    ],
    vat: 10,
    description: "Phí tai nạn cá nhân theo bậc mức bảo hiểm",
  },
} as const;

// ============================================================================
// Search Suggestions
// ============================================================================

/** Common search suggestions for insurance products */
export const SEARCH_SUGGESTIONS = {
  POPULAR_QUERIES: [
    "Bảo hiểm TNDS xe máy",
    "Bảo hiểm vật chất ô tô",
    "Bảo hiểm tai nạn cá nhân",
    "Bảo hiểm sức khỏe cá nhân",
    "Bảo hiểm du lịch quốc tế",
    "Bảo hiểm cháy nổ",
    "Bảo hiểm nhân thọ",
    "Bảo hiểm nhà tư nhân",
  ],
  FEATURED_QUERIES: [
    "Bảo hiểm bắt buộc",
    "Bảo hiểm rẻ nhất",
    "Bảo hiểm cao cấp",
    "Bảo hiểm toàn diện",
    "Bảo hiểm 24/7",
  ],
  CATEGORY_QUERIES: {
    [InsuranceCategory.VEHICLE]: [
      "TNDS",
      "vật chất xe",
      "hai chiều",
      "bộ phận",
    ],
    [InsuranceCategory.HEALTH]: [
      " nội trú",
      "ngoại trú",
      "nha khoa",
      "mắt",
      "thai sản",
    ],
    [InsuranceCategory.LIFE]: [
      "nhân thọ",
      "giáo dục",
      "hưu trí",
      "đầu tư liên kết",
    ],
    [InsuranceCategory.TRAVEL]: [
      "du lịch châu Âu",
      "du lịch Mỹ",
      "visa Schengen",
      "du lịch Đông Nam Á",
    ],
    [InsuranceCategory.PROPERTY]: [
      "cháy nổ",
      "thiên tai",
      "đứt vỡ đường ống",
      "trộm cắp",
    ],
  },
} as const;

// ============================================================================
// Feature Flags
// ============================================================================

/** Feature flags for enabling/disabling functionality */
export const FEATURE_FLAGS = {
  COMPARISON: true,
  QUOTE_GENERATOR: true,
  ONLINE_APPLICATION: true,
  LIVE_CHAT_SUPPORT: false,
  AI_RECOMMENDATIONS: true,
  VIDEO_CONSULTATION: false,
  DOCUMENT_UPLOAD: true,
  ELECTRONIC_SIGNATURE: false,
  PAYMENT_INTEGRATION: true,
  CLAIMS_TRACKING: true,
  POLICY_MANAGEMENT: true,
  MOBILE_APP: false,
  MULTI_LANGUAGE: true,
  CURRENCY_CONVERTER: true,
  DISCOUNT_CODES: true,
  REFERRAL_PROGRAM: false,
} as const;

// ============================================================================
// Storage Keys
// ============================================================================

/** Local storage keys for persistence */
export const STORAGE_KEYS = {
  FILTERS: "insurance_filters",
  SORT_OPTION: "insurance_sort_option",
  VIEW_MODE: "insurance_view_mode",
  COMPARISON: "insurance_comparison",
  SEARCH_HISTORY: "insurance_search_history",
  RECENTLY_VIEWED: "insurance_recently_viewed",
  USER_PREFERENCES: "insurance_user_preferences",
  QUOTE_CACHE: "insurance_quote_cache",
  APPLICATION_DRAFT: "insurance_application_draft",
} as const;

// ============================================================================
// Configuration Objects
// ============================================================================

/** Comparison configuration */
export const COMPARISON_CONFIG = {
  MAX_PRODUCTS: MAX_COMPARISON_PRODUCTS,
  MIN_PRODUCTS: 2,
  AUTO_SAVE_INTERVAL: 5000, // ms
  SHARE_URL_BASE: "/insurance/compare",
  CRITERIA: {
    PRICE: { weight: 0.3, label: "Giá cả" },
    COVERAGE: { weight: 0.35, label: "Quyền lợi" },
    CLAIMS: { weight: 0.2, label: "Dịch vụ bồi thường" },
    FEATURES: { weight: 0.15, label: "Tiện ích" },
  },
} as const;

/** UI state defaults */
export const UI_STATE_DEFAULTS = {
  sidebarOpen: true,
  mobileFiltersOpen: false,
  searchFocused: false,
  viewMode: DEFAULT_VIEW_MODE,
  expandedCards: [] as string[],
  tooltipsVisible: true,
  animationsEnabled: true,
  denseMode: false,
} as const;

/** Image configuration */
export const IMAGE_CONFIG = {
  PLACEHOLDER: "/images/insurance-placeholder.png",
  LAZY_LOADING: true,
  QUALITY: 85,
  WIDTHS: [200, 400, 600, 800],
  ASPECT_RATIO: "16:9",
} as const;

// ============================================================================
// Analytics Events
// ============================================================================

/** Analytics event names for insurance feature */
export const ANALYTICS_EVENTS = {
  // Product interactions
  PRODUCT_VIEW: "insurance_product_view",
  PRODUCT_CLICK: "insurance_product_click",
  PRODUCT_APPLY_CLICK: "insurance_product_apply_click",
  PRODUCT_QUOTE_CLICK: "insurance_product_quote_click",
  PRODUCT_BOOKMARK: "insurance_product_bookmark",
  PRODUCT_SHARE: "insurance_product_share",
  PRODUCT_DETAILS_VIEW: "insurance_product_details_view",

  // Filter and search
  FILTER_APPLY: "insurance_filter_apply",
  FILTER_CLEAR: "insurance_filter_clear",
  FILTER_CHANGE: "insurance_filter_change",
  SEARCH_QUERY: "insurance_search_query",
  SEARCH_SELECT: "insurance_search_select",

  // Sorting and pagination
  SORT_CHANGE: "insurance_sort_change",
  PAGE_CHANGE: "insurance_page_change",
  ITEMS_PER_PAGE_CHANGE: "insurance_items_per_page_change",

  // Comparison
  COMPARISON_ADD: "insurance_comparison_add",
  COMPARISON_REMOVE: "insurance_comparison_remove",
  COMPARISON_VIEW: "insurance_comparison_view",
  COMPARISON_CLEAR: "insurance_comparison_clear",
  COMPARISON_EXPORT: "insurance_comparison_export",

  // Quote and application
  QUOTE_GENERATED: "insurance_quote_generated",
  APPLICATION_STARTED: "insurance_application_started",
  APPLICATION_COMPLETED: "insurance_application_completed",
  APPLICATION_SAVED: "insurance_application_saved",

  // Partner redirects
  REDIRECT_TO_PARTNER: "insurance_redirect_to_partner",
  PARTNER_CLICK: "insurance_partner_click",

  // Error tracking
  ERROR_OCCURRED: "insurance_error_occurred",
  LOAD_FAILED: "insurance_load_failed",
} as const;

/** Analytics event categories */
export const ANALYTICS_CATEGORIES = {
  ENGAGEMENT: "engagement",
  NAVIGATION: "navigation",
  CONVERSION: "conversion",
  SEARCH: "search",
  FILTER: "filter",
  COMPARISON: "comparison",
  QUOTE: "quote",
  APPLICATION: "application",
  ERROR: "error",
} as const;

/** Analytics custom dimensions */
export const ANALYTICS_DIMENSIONS = {
  PRODUCT_ID: "product_id",
  PRODUCT_CATEGORY: "product_category",
  PRODUCT_ISSUER: "product_issuer",
  FILTER_TYPE: "filter_type",
  SORT_OPTION: "sort_option",
  COMPARISON_COUNT: "comparison_count",
  PRICE_RANGE: "price_range",
  COVERAGE_RANGE: "coverage_range",
  USER_LOCATION: "user_location",
  DEVICE_TYPE: "device_type",
} as const;

// ============================================================================
// Error Messages
// ============================================================================

/** Error messages for insurance feature */
export const ERROR_MESSAGES = {
  LOAD_FAILED: "Không thể tải danh sách sản phẩm bảo hiểm. Vui lòng thử lại.",
  DETAIL_LOAD_FAILED:
    "Không thể tải thông tin chi tiết sản phẩm. Vui lòng thử lại.",
  COMPARISON_FULL: `Bạn chỉ có thể so sánh tối đa ${MAX_COMPARISON_PRODUCTS} sản phẩm cùng lúc.`,
  COMPARISON_EMPTY: "Vui lòng chọn ít nhất 2 sản phẩm để so sánh.",
  SEARCH_NO_RESULTS:
    "Không tìm thấy sản phẩm bảo hiểm nào phù hợp với tìm kiếm của bạn.",
  FILTER_NO_RESULTS: "Không tìm thấy sản phẩm bảo hiểm nào phù hợp với bộ lọc.",
  QUOTE_FAILED: "Không thể tính phí bảo hiểm. Vui lòng thử lại.",
  REDIRECT_FAILED: "Không thể chuyển đến trang đối tác. Vui lòng thử lại.",
  BOOKMARK_FAILED: "Không thể lưu sản phẩm vào danh sách yêu thích.",
  SHARE_FAILED: "Không thể chia sẻ thông tin sản phẩm. Vui lòng thử lại.",
  NETWORK_ERROR: "Lỗi kết nối mạng. Vui lòng kiểm tra kết nối và thử lại.",
  SERVER_ERROR: "Lỗi máy chủ. Vui lòng thử lại sau.",
  INVALID_PRODUCT_ID: "Thông tin sản phẩm không hợp lệ.",
  COMPARE_SAME_PRODUCT: "Không thể so sánh cùng một sản phẩm.",
  APPLICATION_FAILED: "Không thể gửi yêu cầu bảo hiểm. Vui lòng thử lại.",
  VALIDATION_ERROR: "Thông tin nhập vào không hợp lệ. Vui lòng kiểm tra lại.",
} as const;

// ============================================================================
// Success Messages
// ============================================================================

/** Success messages for insurance feature */
export const SUCCESS_MESSAGES = {
  BOOKMARK_ADDED: "Đã thêm sản phẩm vào danh sách yêu thích.",
  BOOKMARK_REMOVED: "Đã xóa sản phẩm khỏi danh sách yêu thích.",
  COMPARISON_ADDED: "Đã thêm sản phẩm vào danh sách so sánh.",
  COMPARISON_REMOVED: "Đã xóa sản phẩm khỏi danh sách so sánh.",
  COMPARISON_CLEARED: "Đã xóa tất cả sản phẩm khỏi danh sách so sánh.",
  QUOTE_GENERATED: "Đã tính phí bảo hiểm thành công.",
  APPLICATION_SAVED: "Đã lưu đơn đăng ký bảo hiểm.",
  APPLICATION_SUBMITTED: "Đã nộp đơn đăng ký bảo hiểm thành công.",
  COPIED_LINK: "Đã sao chép đường dẫn.",
  SHARED_SUCCESSFULLY: "Đã chia sẻ thông tin sản phẩm thành công.",
  FILTER_APPLIED: "Đã áp dụng bộ lọc thành công.",
  FILTER_CLEARED: "Đã xóa bộ lọc.",
} as const;

// ============================================================================
// SEO Configuration
// ============================================================================

/** Default SEO titles and descriptions */
export const SEO_DEFAULTS = {
  LIST_TITLE: "So sánh Bảo Hiểm Tốt Nhất 2024 | Tìm Gói Bảo Hiểm Phù Hợp",
  LIST_DESCRIPTION:
    "So sánh và tìm kiếm gói bảo hiểm phù hợp nhất với nhu cầu của bạn. Phí bảo hiểm, quyền lợi, điều kiện và nhiều hơn nữa.",
  COMPARE_TITLE: "So Sánh Bảo Hiểm | So Sánh Đầy Đủ Thông Tin",
  COMPARE_DESCRIPTION:
    "So sánh chi tiết các sản phẩm bảo hiểm. Tìm gói bảo hiểm tốt nhất cho bạn.",
  DETAIL_TITLE_TEMPLATE:
    "{{productName}} - Chi Tiết Bảo Hiểm | Phí, Quyền Lợi, Điều Kiện",
  DETAIL_DESCRIPTION_TEMPLATE:
    "Thông tin chi tiết về sản phẩm bảo hiểm {{productName}}. Phí, quyền lợi, điều kiện, quy trình bồi thường và cách đăng ký.",
} as const;

// ============================================================================
// Structured Data for SEO
// ============================================================================

/** Structured data types */
export const STRUCTURED_DATA_TYPES = {
  PRODUCT: "Product",
  FINANCIAL_SERVICE: "FinancialService",
  AGGREGATE_RATING: "AggregateRating",
  OFFER: "Offer",
  INSURANCE_AGENCY: "InsuranceAgency",
} as const;

// ============================================================================
// Contact Information
// ============================================================================

/** Common contact information for insurance providers */
export const CONTACT_INFO = {
  HOTLINE_REGEX: /^1900[0-9]{4}$/,
  PHONE_REGEX: /^[0-9]{10,11}$/,
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  WORKING_HOURS: {
    WEEKDAY: "8:00 - 18:00",
    SATURDAY: "8:00 - 12:00",
    SUNDAY: "Nghỉ",
    HOLIDAY: "Nghỉ theo quy định",
  },
  EMERGENCY_HOTLINE: "1900 1234",
  COMPLAINT_HOTLINE: "1900 5678",
} as const;
