/**
 * Comprehensive mock data for Vietnamese credit cards
 * Matches the CreditCard interface from src/types/credit-card.ts
 */

import type {
  CreditCard,
  CardNetwork,
  CardCategory,
  AnnualFeeType,
  InterestRateType,
  CreditLimitTier,
} from "@/types/credit-card";

// ============================================================================
// Vietnamese Banks Data
// ============================================================================

const vietnameseProvinces = [
  "Hà Nội",
  "TP. Hồ Chí Minh",
  "Đà Nẵng",
  "Hải Phòng",
  "Cần Thơ",
  "An Giang",
  "Bà Rịa - Vũng Tàu",
  "Bắc Giang",
  "Bắc Kạn",
  "Bạc Liêu",
  "Bắc Ninh",
  "Bến Tre",
  "Bình Định",
  "Bình Dương",
  "Bình Phước",
  "Bình Thuận",
  "Cà Mau",
  "Cao Bằng",
  "Đắk Lắk",
  "Đắk Nông",
  "Điện Biên",
  "Đồng Nai",
  "Đồng Tháp",
  "Gia Lai",
  "Hà Giang",
  "Hà Nam",
  "Hà Tĩnh",
  "Hải Dương",
  "Hậu Giang",
  "Hòa Bình",
  "Hưng Yên",
  "Khánh Hòa",
  "Kiên Giang",
  "Kon Tum",
  "Lai Châu",
  "Lâm Đồng",
  "Lạng Sơn",
  "Lào Cai",
  "Long An",
  "Nam Định",
  "Nghệ An",
  "Ninh Bình",
  "Ninh Thuận",
  "Phú Thọ",
  "Phú Yên",
  "Quảng Bình",
  "Quảng Nam",
  "Quảng Ngãi",
  "Quảng Ninh",
  "Quảng Trị",
  "Sóc Trăng",
  "Sơn La",
  "Tây Ninh",
  "Thái Bình",
  "Thái Nguyên",
  "Thanh Hóa",
  "Thừa Thiên Huế",
  "Tiền Giang",
  "Trà Vinh",
  "Tuyên Quang",
  "Vĩnh Long",
  "Vĩnh Phúc",
  "Yên Bái",
];

// ============================================================================
// Credit Cards Data
// ============================================================================

export const vietnameseCreditCards: CreditCard[] = [
  // Vietcombank Cards
  {
    id: "vcb-visa-classic",
    slug: "vcb-visa-classic",
    name: "Vietcombank Visa Classic",
    issuer: "Vietcombank",
    cardType: "visa",
    category: "personal",

    // Financial Details
    annualFee: 500000,
    annualFeeType: "waivable",
    annualFeeWaiverConditions: "Chi tiêu 30 triệu/năm",
    interestRate: 19.2,
    interestRateType: "fixed",
    creditLimitMin: 10000000,
    creditLimitMax: 50000000,
    creditLimitTier: "standard",

    // Income Requirements
    incomeRequiredMin: 5000000,
    incomeRequiredMax: undefined,
    incomeProof: ["payroll", "bank_statement"],
    employmentType: "full_time",

    // Age Requirements
    ageRequiredMin: 21,
    ageRequiredMax: 60,

    // Geographic Availability
    provinces: vietnameseProvinces,
    nationalAvailability: true,

    // Features & Benefits
    features: [
      "Miễn phí giao dịch tại POS Việt Nam",
      "Bảo hiểm mua sắm toàn cầu",
      "Hỗ trợ khẩn cấp 24/7",
      "Quản lý thẻ qua VCBBank",
    ],
    benefits: [
      "Hoàn tiền 0.3% chi tiêu",
      "Tích điểm VOZ",
      "Ưu đãi tại 500+ đối tác",
      "Miễn phí báo cáo",
    ],
    welcomeOffer: "Tặng 100.000 VOZ khi phát sinh giao dịch đầu tiên",
    welcomeOfferExpiry: "2025-06-30",

    // Rewards Program
    rewardsProgram: {
      type: "points",
      earnRate: 1,
      categories: [
        { category: "Ăn uống", rate: 2 },
        { category: "Mua sắm", rate: 1.5 },
      ],
      expiryMonths: 24,
      minimumRedemption: 100,
    },

    // Fees Structure
    withdrawalFee: 3,
    withdrawalFeeMin: 30000,
    foreignExchangeFee: 2.5,
    latePaymentFee: 150000,
    latePaymentFeeType: "fixed",
    overLimitFee: 200000,
    returnedPaymentFee: 100000,
    balanceTransferFee: 3,
    balanceTransferFeeType: "percentage",

    // Installment Plans
    installmentPlans: [
      { months: 3, interestRate: 0, minAmount: 3000000 },
      { months: 6, interestRate: 1.5, minAmount: 3000000 },
      { months: 9, interestRate: 2.5, minAmount: 5000000 },
      { months: 12, interestRate: 3, minAmount: 5000000 },
    ],

    // Insurance & Protection
    insurance: {
      travel: false,
      medical: false,
      purchaseProtection: true,
      fraudProtection: true,
      carRental: false,
    },

    // Digital Features
    digitalFeatures: {
      mobileBanking: true,
      nfcPayment: true,
      qrPayment: true,
      onlineBanking: true,
      cardControl: true,
      expenseTracking: true,
    },

    // Application Process
    applicationMethods: ["online", "branch", "mobile_app"],
    processingTime: 7,
    documentsRequired: [
      "CMND/CCCD",
      "Hộ khẩu",
      "Hợp đồng lao động",
      "Bảng lương 3 tháng gần nhất",
    ],

    // Metadata
    image: "/images/cards/vcb-visa-classic.png",
    imageAlt: "Vietcombank Visa Classic",
    applyLink: "https://vcbdigibank.vietcombank.com.vn",
    applyLinkType: "direct",
    rating: 4,
    reviewCount: 1250,
    isRecommended: true,
    isNew: false,
    isExclusive: false,
    tags: ["miễn phí thường niên", "điểm thưởng", "bảo hiểm"],

    // SEO & Analytics
    metaTitle: "Thẻ Vietcombank Visa Classic - Phí thấp, uy tín hàng đầu",
    metaDescription:
      "Thẻ Visa Classic từ Vietcombank với mức phí cạnh tranh, mạng lưới rộng khắp toàn quốc",
    lastUpdated: new Date("2025-01-15"),
    publishedAt: new Date("2024-06-01"),
  },

  {
    id: "vcb-visa-signature",
    slug: "vcb-visa-signature",
    name: "Vietcombank Visa Signature",
    issuer: "Vietcombank",
    cardType: "visa",
    category: "premium",

    // Financial Details
    annualFee: 3500000,
    annualFeeType: "waivable",
    annualFeeWaiverConditions: "Chi tiêu 120 triệu/năm",
    interestRate: 17.8,
    interestRateType: "tiered",
    creditLimitMin: 200000000,
    creditLimitMax: 1000000000,
    creditLimitTier: "infinite",

    // Income Requirements
    incomeRequiredMin: 30000000,
    incomeRequiredMax: undefined,
    incomeProof: ["payroll", "bank_statement", "tax_return"],
    employmentType: "full_time",

    // Age Requirements
    ageRequiredMin: 25,
    ageRequiredMax: 65,

    // Geographic Availability
    provinces: ["Hà Nội", "TP. Hồ Chí Minh", "Đà Nẵng", "Hải Phòng", "Cần Thơ"],
    nationalAvailability: false,

    // Features & Benefits
    features: [
      "Dịch vụ Concierge 24/7",
      "Lounge Priority Pass tại sân bay",
      "Bảo hiểm du lịch quốc tế",
      "Ưu đãi khách hàng VIP",
    ],
    benefits: [
      "Hoàn tiền đến 2%",
      "Tích điểm 10x",
      "Dịch vụ xe cứu hộ",
      "Miễn phí giao dịch quốc tế",
    ],
    welcomeOffer: "Tặng 500.000 VOZ + 2 lượt nghỉ dưỡng tại khách sạn 5 sao",
    welcomeOfferExpiry: "2025-06-30",

    // Rewards Program
    rewardsProgram: {
      type: "hybrid",
      earnRate: 5,
      categories: [
        { category: "Du lịch", rate: 10 },
        { category: "Ăn uống cao cấp", rate: 8 },
        { category: "Mua sắm", rate: 5 },
      ],
      expiryMonths: 36,
      minimumRedemption: 500,
    },

    // Fees Structure
    withdrawalFee: 2,
    withdrawalFeeMin: 50000,
    foreignExchangeFee: 1.8,
    latePaymentFee: 300000,
    latePaymentFeeType: "tiered",
    overLimitFee: 500000,
    returnedPaymentFee: 200000,
    balanceTransferFee: 2,
    balanceTransferFeeType: "percentage",

    // Installment Plans
    installmentPlans: [
      { months: 6, interestRate: 0, minAmount: 5000000 },
      { months: 12, interestRate: 0, minAmount: 10000000 },
      { months: 24, interestRate: 1.5, minAmount: 20000000 },
    ],

    // Insurance & Protection
    insurance: {
      travel: true,
      medical: true,
      purchaseProtection: true,
      fraudProtection: true,
      carRental: true,
    },

    // Digital Features
    digitalFeatures: {
      mobileBanking: true,
      nfcPayment: true,
      qrPayment: true,
      onlineBanking: true,
      cardControl: true,
      expenseTracking: true,
    },

    // Application Process
    applicationMethods: ["branch", "phone"],
    processingTime: 10,
    documentsRequired: [
      "CMND/CCCD",
      "Hộ khẩu",
      "Hợp đồng lao động",
      "Bảng lương 6 tháng",
      "Sao kê tài khoản 6 tháng",
      "Giấy tờ chứng minh tài sản",
    ],

    // Metadata
    image: "/images/cards/vcb-visa-signature.png",
    imageAlt: "Vietcombank Visa Signature",
    applyLink: "https://vcbdigibank.vietcombank.com.vn",
    applyLinkType: "direct",
    rating: 5,
    reviewCount: 380,
    isRecommended: true,
    isNew: false,
    isExclusive: true,
    tags: ["cao cấp", "concierge", "lounge", "bảo hiểm du lịch"],

    // SEO & Analytics
    metaTitle: "Thẻ Vietcombank Visa Signature - Dành cho khách hàng VIP",
    metaDescription:
      "Thẻ Visa Signature cao cấp với nhiều đặc quyền và ưu đãi độc quyền",
    lastUpdated: new Date("2025-01-15"),
    publishedAt: new Date("2024-08-01"),
  },

  // Techcombank Cards
  {
    id: "tcb-mastercard-cashback",
    slug: "tcb-mastercard-cashback",
    name: "Techcombank Mastercard Cashback",
    issuer: "Techcombank",
    cardType: "mastercard",
    category: "cashback",

    // Financial Details
    annualFee: 740000,
    annualFeeType: "waivable",
    annualFeeWaiverConditions: "Chi tiêu 50 triệu/năm",
    interestRate: 20.8,
    interestRateType: "fixed",
    creditLimitMin: 20000000,
    creditLimitMax: 200000000,
    creditLimitTier: "gold",

    // Income Requirements
    incomeRequiredMin: 8000000,
    incomeProof: ["payroll", "bank_statement"],
    employmentType: "full_time",

    // Age Requirements
    ageRequiredMin: 22,
    ageRequiredMax: 65,

    // Geographic Availability
    provinces: vietnameseProvinces,
    nationalAvailability: true,

    // Features & Benefits
    features: [
      "Hoàn tiền trực tiếp vào tài khoản",
      "Tích điểm Techcombank Rewards",
      "Miễn phí rút tiền ATM",
      "Quản lý thẻ qua Techcombank Mobile",
    ],
    benefits: [
      "Hoàn tiền đến 2.5%",
      "Hoàn tiền không giới hạn",
      "Ưu đãi tại Grab",
      "Giảm giá điện máy",
    ],
    welcomeOffer: "Hoàn tiền 20% tối đa 500.000 cho chi tiêu trong tháng đầu",
    welcomeOfferExpiry: "2025-03-31",

    // Rewards Program
    rewardsProgram: {
      type: "cashback",
      earnRate: 2.5,
      categories: [
        { category: "Ăn uống", rate: 2.5 },
        { category: "Mua sắm online", rate: 2 },
        { category: "Xăng dầu", rate: 3 },
        { category: "Thanh toán hóa đơn", rate: 0.5 },
      ],
      expiryMonths: 0,
      minimumRedemption: 0,
    },

    // Fees Structure
    withdrawalFee: 3,
    withdrawalFeeMin: 50000,
    foreignExchangeFee: 2.5,
    latePaymentFee: 200000,
    latePaymentFeeType: "percentage",
    overLimitFee: 300000,
    returnedPaymentFee: 150000,
    balanceTransferFee: 4,
    balanceTransferFeeType: "percentage",

    // Installment Plans
    installmentPlans: [
      { months: 3, interestRate: 0, minAmount: 3000000 },
      { months: 6, interestRate: 2.5, minAmount: 3000000 },
      { months: 12, interestRate: 4.5, minAmount: 5000000 },
    ],

    // Insurance & Protection
    insurance: {
      travel: false,
      medical: false,
      purchaseProtection: true,
      fraudProtection: true,
      carRental: false,
    },

    // Digital Features
    digitalFeatures: {
      mobileBanking: true,
      nfcPayment: true,
      qrPayment: true,
      onlineBanking: true,
      cardControl: true,
      expenseTracking: true,
    },

    // Application Process
    applicationMethods: ["online", "branch", "mobile_app"],
    processingTime: 5,
    documentsRequired: ["CMND/CCCD", "Hợp đồng lao động", "Bảng lương 3 tháng"],

    // Metadata
    image: "/images/cards/tcb-mastercard-cashback.png",
    imageAlt: "Techcombank Mastercard Cashback",
    applyLink: "https://www.techcombank.com.vn",
    applyLinkType: "direct",
    rating: 4,
    reviewCount: 890,
    isRecommended: true,
    isNew: false,
    isExclusive: false,
    tags: ["hoàn tiền", "cashback", "miễn phí rút tiền"],

    // SEO & Analytics
    metaTitle: "Thẻ Techcombank Mastercard Cashback - Hoàn tiền cao nhất",
    metaDescription: "Thẻ tín dụng hoàn tiền đến 2.5% cho mọi giao dịch",
    lastUpdated: new Date("2025-01-10"),
    publishedAt: new Date("2024-05-15"),
  },

  // VPBank Cards
  {
    id: "vpb-jcb-ultimate",
    slug: "vpb-jcb-ultimate",
    name: "VPBank JCB Ultimate",
    issuer: "VPBank",
    cardType: "jcb",
    category: "travel",

    // Financial Details
    annualFee: 2500000,
    annualFeeType: "waivable",
    annualFeeWaiverConditions: "Chi tiêu 100 triệu/năm",
    interestRate: 23.8,
    interestRateType: "fixed",
    creditLimitMin: 100000000,
    creditLimitMax: 500000000,
    creditLimitTier: "platinum",

    // Income Requirements
    incomeRequiredMin: 20000000,
    incomeProof: ["payroll", "bank_statement", "tax_return"],
    employmentType: "full_time",

    // Age Requirements
    ageRequiredMin: 23,
    ageRequiredMax: 65,

    // Geographic Availability
    provinces: vietnameseProvinces,
    nationalAvailability: true,

    // Features & Benefits
    features: [
      "Lounge sân bay JCB",
      "Dịch vụ JCB Plaza",
      "Ưu đãi JCB Special",
      "Concierge 24/7",
    ],
    benefits: [
      "Tích điểm 4x JCB",
      "Đổi vé máy bay",
      "Ưu đãi khách sạn",
      "Bảo hiểm du lịch",
    ],
    welcomeOffer: "Tặng 1000 điểm JCB + 2 lượt lounge",
    welcomeOfferExpiry: "2025-06-30",

    // Rewards Program
    rewardsProgram: {
      type: "points",
      earnRate: 4,
      categories: [
        { category: "Du lịch", rate: 8 },
        { category: "Nhà hàng", rate: 6 },
        { category: "Mua sắm", rate: 4 },
      ],
      expiryMonths: 36,
      minimumRedemption: 300,
    },

    // Fees Structure
    withdrawalFee: 3,
    withdrawalFeeMin: 50000,
    foreignExchangeFee: 2.2,
    latePaymentFee: 250000,
    latePaymentFeeType: "fixed",
    overLimitFee: 400000,
    returnedPaymentFee: 180000,
    balanceTransferFee: 3,
    balanceTransferFeeType: "percentage",

    // Installment Plans
    installmentPlans: [
      { months: 6, interestRate: 0, minAmount: 5000000 },
      { months: 12, interestRate: 2, minAmount: 10000000 },
      { months: 24, interestRate: 3, minAmount: 20000000 },
    ],

    // Insurance & Protection
    insurance: {
      travel: true,
      medical: false,
      purchaseProtection: true,
      fraudProtection: true,
      carRental: true,
    },

    // Digital Features
    digitalFeatures: {
      mobileBanking: true,
      nfcPayment: true,
      qrPayment: true,
      onlineBanking: true,
      cardControl: true,
      expenseTracking: true,
    },

    // Application Process
    applicationMethods: ["online", "branch", "mobile_app"],
    processingTime: 7,
    documentsRequired: [
      "CMND/CCCD",
      "Hợp đồng lao động",
      "Bảng lương 6 tháng",
      "Giấy chứng nhận đăng ký kinh doanh (nếu chủ DN)",
    ],

    // Metadata
    image: "/images/cards/vpb-jcb-ultimate.png",
    imageAlt: "VPBank JCB Ultimate",
    applyLink: "https://www.vpbank.com.vn",
    applyLinkType: "direct",
    rating: 4,
    reviewCount: 420,
    isRecommended: false,
    isNew: false,
    isExclusive: false,
    tags: ["du lịch", "lounge", "JCB", "điểm thưởng"],

    // SEO & Analytics
    metaTitle: "Thẻ VPBank JCB Ultimate - Du lịch toàn cầu",
    metaDescription:
      "Thẻ JCB Ultimate với nhiều ưu đãi du lịch và lounge sân bay",
    lastUpdated: new Date("2025-01-08"),
    publishedAt: new Date("2024-07-01"),
  },

  // ACB Cards
  {
    id: "acb-visa-traditional",
    slug: "acb-visa-traditional",
    name: "ACB Visa Traditional",
    issuer: "ACB",
    cardType: "visa",
    category: "personal",

    // Financial Details
    annualFee: 295000,
    annualFeeType: "waivable",
    annualFeeWaiverConditions: "Chi tiêu 20 triệu/năm",
    interestRate: 17.6,
    interestRateType: "fixed",
    creditLimitMin: 10000000,
    creditLimitMax: 100000000,
    creditLimitTier: "standard",

    // Income Requirements
    incomeRequiredMin: 5000000,
    incomeProof: ["payroll", "bank_statement"],
    employmentType: "full_time",

    // Age Requirements
    ageRequiredMin: 21,
    ageRequiredMax: 60,

    // Geographic Availability
    provinces: vietnameseProvinces,
    nationalAvailability: true,

    // Features & Benefits
    features: [
      "Miễn phí thường năm năm đầu",
      "Lãi suất cạnh tranh",
      "Hỗ trợ online ACB",
      "Miễn phí chuyển khoản ACB",
    ],
    benefits: ["Tích điểm ACB", "Ưu đãi đa dạng", "Phí thấp", "Duyệt nhanh"],
    welcomeOffer: undefined,
    welcomeOfferExpiry: undefined,

    // Rewards Program
    rewardsProgram: {
      type: "points",
      earnRate: 0.5,
      categories: [
        { category: "Mua sắm", rate: 1 },
        { category: "Thanh toán hóa đơn", rate: 0.5 },
      ],
      expiryMonths: 24,
      minimumRedemption: 100,
    },

    // Fees Structure
    withdrawalFee: 4,
    withdrawalFeeMin: 30000,
    foreignExchangeFee: 2.5,
    latePaymentFee: 130000,
    latePaymentFeeType: "fixed",
    overLimitFee: 200000,
    returnedPaymentFee: 100000,
    balanceTransferFee: 3,
    balanceTransferFeeType: "percentage",

    // Installment Plans
    installmentPlans: [
      { months: 6, interestRate: 0, minAmount: 3000000 },
      { months: 9, interestRate: 1.5, minAmount: 5000000 },
      { months: 12, interestRate: 2.5, minAmount: 5000000 },
    ],

    // Insurance & Protection
    insurance: {
      travel: false,
      medical: false,
      purchaseProtection: true,
      fraudProtection: true,
      carRental: false,
    },

    // Digital Features
    digitalFeatures: {
      mobileBanking: true,
      nfcPayment: true,
      qrPayment: true,
      onlineBanking: true,
      cardControl: true,
      expenseTracking: false,
    },

    // Application Process
    applicationMethods: ["online", "branch", "mobile_app"],
    processingTime: 5,
    documentsRequired: [
      "CMND/CCCD",
      "Hộ khẩu",
      "Hợp đồng lao động",
      "Bảng lương 3 tháng",
    ],

    // Metadata
    image: "/images/cards/acb-visa-traditional.png",
    imageAlt: "ACB Visa Traditional",
    applyLink: "https://www.acb.com.vn",
    applyLinkType: "direct",
    rating: 4,
    reviewCount: 980,
    isRecommended: true,
    isNew: false,
    isExclusive: false,
    tags: ["lãi suất thấp", "miễn phí", "phổ thông"],

    // SEO & Analytics
    metaTitle: "Thẻ ACB Visa Traditional - Lãi suất thấp, phù hợp đại chúng",
    metaDescription: "Thẻ tín dụng ACB với lãi suất cạnh tranh và nhiều ưu đãi",
    lastUpdated: new Date("2025-01-12"),
    publishedAt: new Date("2024-04-01"),
  },

  // MB Bank Cards
  {
    id: "mbb-mastercard-free",
    slug: "mbb-mastercard-free",
    name: "MB Bank Mastercard Free Forever",
    issuer: "MB Bank",
    cardType: "mastercard",
    category: "personal",

    // Financial Details
    annualFee: 0,
    annualFeeType: "free",
    interestRate: 18.5,
    interestRateType: "fixed",
    creditLimitMin: 5000000,
    creditLimitMax: 50000000,
    creditLimitTier: "standard",

    // Income Requirements
    incomeRequiredMin: 3000000,
    incomeProof: ["payroll", "bank_statement"],
    employmentType: undefined,

    // Age Requirements
    ageRequiredMin: 20,
    ageRequiredMax: 60,

    // Geographic Availability
    provinces: vietnameseProvinces,
    nationalAvailability: true,

    // Features & Benefits
    features: [
      "Miễn phí thường niên vĩnh viễn",
      "Miễn phí phát hành thẻ",
      "Miễn phí giao dịch",
      "App BFast dễ dùng",
    ],
    benefits: [
      "Không phí thường niên",
      "Duyệt hồ sơ online",
      "Thẻ tự động gia hạn",
      "Ưu đãi Grab Gojek",
    ],

    // Rewards Program
    rewardsProgram: {
      type: "cashback",
      earnRate: 0.5,
      categories: [
        { category: "Ăn uống", rate: 0.5 },
        { category: "Mua sắm", rate: 0.5 },
      ],
      expiryMonths: 0,
      minimumRedemption: 0,
    },

    // Fees Structure
    withdrawalFee: 3,
    withdrawalFeeMin: 30000,
    foreignExchangeFee: 3,
    latePaymentFee: 150000,
    latePaymentFeeType: "fixed",
    overLimitFee: 200000,
    returnedPaymentFee: 80000,
    balanceTransferFee: 3,
    balanceTransferFeeType: "percentage",

    // Installment Plans
    installmentPlans: [
      { months: 3, interestRate: 0, minAmount: 2000000 },
      { months: 6, interestRate: 2.5, minAmount: 3000000 },
      { months: 9, interestRate: 3.5, minAmount: 5000000 },
    ],

    // Insurance & Protection
    insurance: {
      travel: false,
      medical: false,
      purchaseProtection: false,
      fraudProtection: true,
      carRental: false,
    },

    // Digital Features
    digitalFeatures: {
      mobileBanking: true,
      nfcPayment: true,
      qrPayment: true,
      onlineBanking: true,
      cardControl: true,
      expenseTracking: false,
    },

    // Application Process
    applicationMethods: ["online", "mobile_app"],
    processingTime: 3,
    documentsRequired: ["CMND/CCCD", "Thông tin cá nhân", "Ảnh selfie"],

    // Metadata
    image: "/images/cards/mbb-mastercard-free.png",
    imageAlt: "MB Bank Mastercard Free Forever",
    applyLink: "https://www.bankmb.vn",
    applyLinkType: "direct",
    rating: 4,
    reviewCount: 1520,
    isRecommended: true,
    isNew: false,
    isExclusive: false,
    tags: ["miễn phí", "free", "không phí thường niên"],

    // SEO & Analytics
    metaTitle: "Thẻ MB Bank Mastercard Free Forever - Miễn phí trọn đời",
    metaDescription: "Thẻ tín dụng miễn phí thường niên vĩnh viễn từ MB Bank",
    lastUpdated: new Date("2025-01-14"),
    publishedAt: new Date("2024-03-01"),
  },

  // Sacombank Cards
  {
    id: "sacombank-visa-signature",
    slug: "sacombank-visa-signature",
    name: "Sacombank Visa Signature",
    issuer: "Sacombank",
    cardType: "visa",
    category: "premium",

    // Financial Details
    annualFee: 2000000,
    annualFeeType: "waivable",
    annualFeeWaiverConditions: "Chi tiêu 100 triệu/năm",
    interestRate: 21.9,
    interestRateType: "fixed",
    creditLimitMin: 150000000,
    creditLimitMax: 800000000,
    creditLimitTier: "platinum",

    // Income Requirements
    incomeRequiredMin: 25000000,
    incomeProof: ["payroll", "bank_statement", "tax_return"],
    employmentType: "full_time",

    // Age Requirements
    ageRequiredMin: 25,
    ageRequiredMax: 65,

    // Geographic Availability
    provinces: vietnameseProvinces,
    nationalAvailability: true,

    // Features & Benefits
    features: [
      "Dịch vụ Sacombank Ultimate",
      "Lounge sân bay",
      "Bảo hiểm toàn cầu",
      "Ưu đãi golf",
    ],
    benefits: [
      "Hoàn tiền 1.5%",
      "Tích điểm Sacombank",
      "Ưu đãi y tế",
      "Dịch vụ đặc quyền",
    ],
    welcomeOffer: "Tặng voucher 5 triệu + 1 lượt golf",
    welcomeOfferExpiry: "2025-06-30",

    // Rewards Program
    rewardsProgram: {
      type: "hybrid",
      earnRate: 2,
      categories: [
        { category: "Du lịch", rate: 5 },
        { category: "Ăn uống", rate: 3 },
        { category: "Mua sắm", rate: 2 },
      ],
      expiryMonths: 30,
      minimumRedemption: 200,
    },

    // Fees Structure
    withdrawalFee: 3,
    withdrawalFeeMin: 50000,
    foreignExchangeFee: 2,
    latePaymentFee: 300000,
    latePaymentFeeType: "tiered",
    overLimitFee: 400000,
    returnedPaymentFee: 200000,
    balanceTransferFee: 2.5,
    balanceTransferFeeType: "percentage",

    // Installment Plans
    installmentPlans: [
      { months: 6, interestRate: 0, minAmount: 5000000 },
      { months: 12, interestRate: 1, minAmount: 10000000 },
      { months: 24, interestRate: 2, minAmount: 20000000 },
    ],

    // Insurance & Protection
    insurance: {
      travel: true,
      medical: true,
      purchaseProtection: true,
      fraudProtection: true,
      carRental: true,
    },

    // Digital Features
    digitalFeatures: {
      mobileBanking: true,
      nfcPayment: true,
      qrPayment: true,
      onlineBanking: true,
      cardControl: true,
      expenseTracking: true,
    },

    // Application Process
    applicationMethods: ["online", "branch", "mobile_app"],
    processingTime: 8,
    documentsRequired: [
      "CMND/CCCD",
      "Hộ khẩu",
      "Hợp đồng lao động",
      "Bảng lương 6 tháng",
      "Giấy tờ tài sản",
    ],

    // Metadata
    image: "/images/cards/sacombank-visa-signature.png",
    imageAlt: "Sacombank Visa Signature",
    applyLink: "https://www.sacombank.com.vn",
    applyLinkType: "direct",
    rating: 4,
    reviewCount: 340,
    isRecommended: false,
    isNew: false,
    isExclusive: false,
    tags: ["cao cấp", "golf", "lounge", "bảo hiểm"],

    // SEO & Analytics
    metaTitle: "Thẻ Sacombank Visa Signature - Đẳng cấp vượt trội",
    metaDescription:
      "Thẻ tín dụng cao cấp với nhiều đặc quyền và ưu đãi độc quyền",
    lastUpdated: new Date("2025-01-11"),
    publishedAt: new Date("2024-09-01"),
  },

  // Students Card
  {
    id: "vib-student-visa",
    slug: "vib-student-visa",
    name: "VIB Student Visa",
    issuer: "VIB",
    cardType: "visa",
    category: "student",

    // Financial Details
    annualFee: 0,
    annualFeeType: "free",
    interestRate: 20,
    interestRateType: "fixed",
    creditLimitMin: 5000000,
    creditLimitMax: 20000000,
    creditLimitTier: "standard",

    // Income Requirements
    incomeRequiredMin: 0,
    incomeRequiredMax: undefined,
    incomeProof: ["bank_statement"],
    employmentType: undefined,

    // Age Requirements
    ageRequiredMin: 18,
    ageRequiredMax: 25,

    // Geographic Availability
    provinces: [
      "Hà Nội",
      "TP. Hồ Chí Minh",
      "Đà Nẵng",
      "Hải Phòng",
      "Cần Thơ",
      "Huế",
      "Nha Trang",
      "Đà Lạt",
    ],
    nationalAvailability: false,

    // Features & Benefits
    features: [
      "Miễn phí cho sinh viên",
      "Yêu cầu đơn giản",
      "Giảm giá học liệu",
      "Quản lý qua app VIB",
    ],
    benefits: [
      "Giảm 10% sách Fahasa",
      "Ưu đãi xem phim",
      "Giảm giá cafe",
      "Không cần chứng minh thu nhập",
    ],

    // Rewards Program
    rewardsProgram: {
      type: "points",
      earnRate: 1,
      categories: [
        { category: "Ăn uống", rate: 1 },
        { category: "Giải trí", rate: 2 },
        { category: "Mua sắm", rate: 1 },
      ],
      expiryMonths: 12,
      minimumRedemption: 50,
    },

    // Fees Structure
    withdrawalFee: 4,
    withdrawalFeeMin: 20000,
    foreignExchangeFee: 3.5,
    latePaymentFee: 100000,
    latePaymentFeeType: "fixed",
    overLimitFee: 150000,
    returnedPaymentFee: 50000,
    balanceTransferFee: 3,
    balanceTransferFeeType: "percentage",

    // Installment Plans
    installmentPlans: [
      { months: 3, interestRate: 0, minAmount: 1000000 },
      { months: 6, interestRate: 3, minAmount: 2000000 },
      { months: 9, interestRate: 4, minAmount: 3000000 },
    ],

    // Insurance & Protection
    insurance: {
      travel: false,
      medical: false,
      purchaseProtection: false,
      fraudProtection: true,
      carRental: false,
    },

    // Digital Features
    digitalFeatures: {
      mobileBanking: true,
      nfcPayment: true,
      qrPayment: true,
      onlineBanking: true,
      cardControl: true,
      expenseTracking: false,
    },

    // Application Process
    applicationMethods: ["online", "branch", "mobile_app"],
    processingTime: 5,
    documentsRequired: [
      "CMND/CCCD",
      "Thẻ sinh viên",
      "Giấy xác nhận là sinh viên",
    ],

    // Metadata
    image: "/images/cards/vib-student-visa.png",
    imageAlt: "VIB Student Visa",
    applyLink: "https://www.vib.com.vn",
    applyLinkType: "direct",
    rating: 4,
    reviewCount: 560,
    isRecommended: true,
    isNew: false,
    isExclusive: false,
    tags: ["sinh viên", "miễn phí", "học sinh"],

    // SEO & Analytics
    metaTitle: "Thẻ VIB Student Visa - Dành cho sinh viên Việt Nam",
    metaDescription:
      "Thẻ tín dụng đầu tiên cho sinh viên với nhiều ưu đãi học tập",
    lastUpdated: new Date("2025-01-13"),
    publishedAt: new Date("2024-08-15"),
  },

  // Business Card
  {
    id: "hdb-business-mastercard",
    slug: "hdb-business-mastercard",
    name: "HDBank Business Mastercard",
    issuer: "HDBank",
    cardType: "mastercard",
    category: "business",

    // Financial Details
    annualFee: 1500000,
    annualFeeType: "waivable",
    annualFeeWaiverConditions: "Chi tiêu 200 triệu/năm",
    interestRate: 18,
    interestRateType: "tiered",
    creditLimitMin: 50000000,
    creditLimitMax: 500000000,
    creditLimitTier: "gold",

    // Income Requirements
    incomeRequiredMin: 50000000,
    incomeProof: ["tax_return", "business_license", "bank_statement"],
    employmentType: "business_owner",

    // Age Requirements
    ageRequiredMin: 25,
    ageRequiredMax: 65,

    // Geographic Availability
    provinces: vietnameseProvinces,
    nationalAvailability: true,

    // Features & Benefits
    features: [
      "Quản lý chi tiêu doanh nghiệp",
      "Báo cáo chi tiết",
      "Thẻ phụ miễn phí",
      "Ưu đãi doanh nghiệp",
    ],
    benefits: [
      "Hoàn tiền 1.5%",
      "Miễn phí chuyển khoản",
      "Hỗ trợ doanh nghiệp",
      "Tích điểm doanh nghiệp",
    ],

    // Rewards Program
    rewardsProgram: {
      type: "cashback",
      earnRate: 1.5,
      categories: [
        { category: "Văn phòng", rate: 2 },
        { category: "Du lịch công tác", rate: 3 },
        { category: "Quảng cáo", rate: 1.5 },
      ],
      expiryMonths: 0,
      minimumRedemption: 0,
    },

    // Fees Structure
    withdrawalFee: 2.5,
    withdrawalFeeMin: 50000,
    foreignExchangeFee: 2,
    latePaymentFee: 400000,
    latePaymentFeeType: "percentage",
    overLimitFee: 500000,
    returnedPaymentFee: 250000,
    balanceTransferFee: 2,
    balanceTransferFeeType: "percentage",

    // Installment Plans
    installmentPlans: [
      { months: 6, interestRate: 0, minAmount: 10000000 },
      { months: 12, interestRate: 1, minAmount: 20000000 },
      { months: 24, interestRate: 1.5, minAmount: 50000000 },
    ],

    // Insurance & Protection
    insurance: {
      travel: true,
      medical: false,
      purchaseProtection: true,
      fraudProtection: true,
      carRental: true,
    },

    // Digital Features
    digitalFeatures: {
      mobileBanking: true,
      nfcPayment: true,
      qrPayment: true,
      onlineBanking: true,
      cardControl: true,
      expenseTracking: true,
    },

    // Application Process
    applicationMethods: ["branch", "phone"],
    processingTime: 10,
    documentsRequired: [
      "CMND/CCCD",
      "Giấy đăng ký kinh doanh",
      "Báo cáo tài chính",
      "Sao kê tài khoản 6 tháng",
    ],

    // Metadata
    image: "/images/cards/hdb-business-mastercard.png",
    imageAlt: "HDBank Business Mastercard",
    applyLink: "https://www.hdbank.com.vn",
    applyLinkType: "direct",
    rating: 4,
    reviewCount: 120,
    isRecommended: false,
    isNew: false,
    isExclusive: false,
    tags: ["doanh nghiệp", "business", "thẻ phụ"],

    // SEO & Analytics
    metaTitle: "Thẻ HDBank Business Mastercard - Cho doanh nghiệp SME",
    metaDescription:
      "Thẻ tín dụng doanh nghiệp với nhiều công cụ quản lý chi tiêu",
    lastUpdated: new Date("2025-01-16"),
    publishedAt: new Date("2024-10-01"),
  },

  // Shopping Card
  {
    id: "shb-visa-shopping",
    slug: "shb-visa-shopping",
    name: "SHB Visa Shopping",
    issuer: "SHB",
    cardType: "visa",
    category: "shopping",

    // Financial Details
    annualFee: 800000,
    annualFeeType: "waivable",
    annualFeeWaiverConditions: "Chi tiêu 60 triệu/năm",
    interestRate: 22,
    interestRateType: "fixed",
    creditLimitMin: 20000000,
    creditLimitMax: 150000000,
    creditLimitTier: "gold",

    // Income Requirements
    incomeRequiredMin: 8000000,
    incomeProof: ["payroll", "bank_statement"],
    employmentType: "full_time",

    // Age Requirements
    ageRequiredMin: 21,
    ageRequiredMax: 60,

    // Geographic Availability
    provinces: vietnameseProvinces,
    nationalAvailability: true,

    // Features & Benefits
    features: [
      "Giảm giá tại các TTTM",
      "Điểm thưởng mua sắm",
      "Ưu đãi online",
      "Miễn phí giao dịch",
    ],
    benefits: [
      "Giảm 20% tại các rạp phim",
      "Giảm 15% nhà hàng",
      "Tích điểm 2x",
      "Ưu đãi Vincom",
    ],
    welcomeOffer: "Tặng voucher 2 triệu đồng khi chi tiêu 10 triệu đầu tiên",
    welcomeOfferExpiry: "2025-06-30",

    // Rewards Program
    rewardsProgram: {
      type: "points",
      earnRate: 2,
      categories: [
        { category: "Thời trang", rate: 4 },
        { category: "Điện máy", rate: 3 },
        { category: "Mỹ phẩm", rate: 3 },
      ],
      expiryMonths: 24,
      minimumRedemption: 200,
    },

    // Fees Structure
    withdrawalFee: 3.5,
    withdrawalFeeMin: 35000,
    foreignExchangeFee: 2.8,
    latePaymentFee: 180000,
    latePaymentFeeType: "fixed",
    overLimitFee: 250000,
    returnedPaymentFee: 120000,

    // Installment Plans
    installmentPlans: [
      { months: 3, interestRate: 0, minAmount: 3000000 },
      { months: 6, interestRate: 2, minAmount: 5000000 },
      { months: 12, interestRate: 3.5, minAmount: 10000000 },
    ],

    // Insurance & Protection
    insurance: {
      travel: false,
      medical: false,
      purchaseProtection: true,
      fraudProtection: true,
      carRental: false,
    },

    // Digital Features
    digitalFeatures: {
      mobileBanking: true,
      nfcPayment: true,
      qrPayment: true,
      onlineBanking: true,
      cardControl: true,
      expenseTracking: true,
    },

    // Application Process
    applicationMethods: ["online", "branch", "mobile_app"],
    processingTime: 6,
    documentsRequired: ["CMND/CCCD", "Hợp đồng lao động", "Bảng lương 3 tháng"],

    // Metadata
    image: "/images/cards/shb-visa-shopping.png",
    imageAlt: "SHB Visa Shopping",
    applyLink: "https://www.shb.com.vn",
    applyLinkType: "direct",
    rating: 4,
    reviewCount: 450,
    isRecommended: false,
    isNew: false,
    isExclusive: false,
    tags: ["mua sắm", "shopping", "giảm giá", "TTTM"],

    // SEO & Analytics
    metaTitle: "Thẻ SHB Visa Shopping - Giảm giá mua sắm",
    metaDescription:
      "Thẻ tín dụng với nhiều ưu đãi khi mua sắm tại các TTTM và online",
    lastUpdated: new Date("2025-01-17"),
    publishedAt: new Date("2024-11-01"),
  },

  // Fuel Card
  {
    id: "pvr-mastercard-fuel",
    slug: "pvr-mastercard-fuel",
    name: "PVOIL Mastercard Fuel",
    issuer: "PVcomBank",
    cardType: "mastercard",
    category: "fuel",

    // Financial Details
    annualFee: 600000,
    annualFeeType: "waivable",
    annualFeeWaiverConditions: "Chi tiêu 40 triệu/năm",
    interestRate: 19.5,
    interestRateType: "fixed",
    creditLimitMin: 15000000,
    creditLimitMax: 100000000,
    creditLimitTier: "standard",

    // Income Requirements
    incomeRequiredMin: 6000000,
    incomeProof: ["payroll", "bank_statement"],
    employmentType: undefined,

    // Age Requirements
    ageRequiredMin: 20,
    ageRequiredMax: 60,

    // Geographic Availability
    provinces: vietnameseProvinces,
    nationalAvailability: true,

    // Features & Benefits
    features: [
      "Giảm giá xăng dầu PVOIL",
      "Tích điểm nhiên liệu",
      "Ưu đãi bảo hiểm xe",
      "Miễn phí rút tiền ATM",
    ],
    benefits: [
      "Giảm 5% xăng PVOIL",
      "Giảm 3% bảo hiểm PTI",
      "Tích điểm 2x",
      "Ưu đãi sửa chữa xe",
    ],

    // Rewards Program
    rewardsProgram: {
      type: "cashback",
      earnRate: 2,
      categories: [
        { category: "Xăng dầu", rate: 5 },
        { category: "Sửa chữa xe", rate: 3 },
        { category: "Bảo hiểm", rate: 3 },
      ],
      expiryMonths: 0,
      minimumRedemption: 0,
    },

    // Fees Structure
    withdrawalFee: 3,
    withdrawalFeeMin: 30000,
    foreignExchangeFee: 2.5,
    latePaymentFee: 160000,
    latePaymentFeeType: "fixed",
    overLimitFee: 220000,
    returnedPaymentFee: 100000,
    balanceTransferFee: 3,
    balanceTransferFeeType: "percentage",

    // Installment Plans
    installmentPlans: [
      { months: 3, interestRate: 0, minAmount: 2000000 },
      { months: 6, interestRate: 2.5, minAmount: 3000000 },
      { months: 12, interestRate: 4, minAmount: 5000000 },
    ],

    // Insurance & Protection
    insurance: {
      travel: false,
      medical: false,
      purchaseProtection: false,
      fraudProtection: true,
      carRental: false,
    },

    // Digital Features
    digitalFeatures: {
      mobileBanking: true,
      nfcPayment: true,
      qrPayment: true,
      onlineBanking: true,
      cardControl: true,
      expenseTracking: false,
    },

    // Application Process
    applicationMethods: ["online", "branch", "mobile_app"],
    processingTime: 5,
    documentsRequired: ["CMND/CCCD", "Hợp đồng lao động", "Bảng lương 3 tháng"],

    // Metadata
    image: "/images/cards/pvr-mastercard-fuel.png",
    imageAlt: "PVOIL Mastercard Fuel",
    applyLink: "https://www.pvcombank.com.vn",
    applyLinkType: "direct",
    rating: 4,
    reviewCount: 280,
    isRecommended: false,
    isNew: false,
    isExclusive: false,
    tags: ["xăng dầu", "nhiên liệu", "PVOIL", "giảm giá"],

    // SEO & Analytics
    metaTitle: "Thẻ PVOIL Mastercard Fuel - Giảm giá xăng dầu",
    metaDescription: "Thẻ tín dụng với ưu đãi đặc biệt khi mua xăng tại PVOIL",
    lastUpdated: new Date("2025-01-18"),
    publishedAt: new Date("2024-12-01"),
  },

  // Dining Card
  {
    id: "vnpay-jcb-dining",
    slug: "vnpay-jcb-dining",
    name: "VNPAY JCB Dining",
    issuer: "VNPAY",
    cardType: "jcb",
    category: "dining",

    // Financial Details
    annualFee: 900000,
    annualFeeType: "waivable",
    annualFeeWaiverConditions: "Chi tiêu 50 triệu/năm",
    interestRate: 20.5,
    interestRateType: "fixed",
    creditLimitMin: 20000000,
    creditLimitMax: 150000000,
    creditLimitTier: "gold",

    // Income Requirements
    incomeRequiredMin: 8000000,
    incomeProof: ["payroll", "bank_statement"],
    employmentType: "full_time",

    // Age Requirements
    ageRequiredMin: 21,
    ageRequiredMax: 60,

    // Geographic Availability
    provinces: vietnameseProvinces,
    nationalAvailability: true,

    // Features & Benefits
    features: [
      "Giảm giá nhà hàng",
      "Tích điểm ăn uống",
      "Ưu đãi giao đồ ăn",
      "Quản lý qua VNPAY QR",
    ],
    benefits: [
      "Giảm 25% nhà hàng đối tác",
      "Tích điểm 5x",
      "Miễn phí giao đồ ăn",
      "Ưu đãi Foody",
    ],

    // Rewards Program
    rewardsProgram: {
      type: "points",
      earnRate: 3,
      categories: [
        { category: "Nhà hàng", rate: 8 },
        { category: "Cafe", rate: 5 },
        { category: "Giao đồ ăn", rate: 4 },
      ],
      expiryMonths: 18,
      minimumRedemption: 150,
    },

    // Fees Structure
    withdrawalFee: 3,
    withdrawalFeeMin: 30000,
    foreignExchangeFee: 2.2,
    latePaymentFee: 180000,
    latePaymentFeeType: "fixed",
    overLimitFee: 250000,
    returnedPaymentFee: 120000,

    // Installment Plans
    installmentPlans: [
      { months: 3, interestRate: 0, minAmount: 2000000 },
      { months: 6, interestRate: 2, minAmount: 3000000 },
      { months: 9, interestRate: 3, minAmount: 5000000 },
    ],

    // Insurance & Protection
    insurance: {
      travel: false,
      medical: false,
      purchaseProtection: true,
      fraudProtection: true,
      carRental: false,
    },

    // Digital Features
    digitalFeatures: {
      mobileBanking: true,
      nfcPayment: true,
      qrPayment: true,
      onlineBanking: true,
      cardControl: true,
      expenseTracking: true,
    },

    // Application Process
    applicationMethods: ["online", "mobile_app"],
    processingTime: 4,
    documentsRequired: ["CMND/CCCD", "Thông tin cá nhân", "Ảnh selfie"],

    // Metadata
    image: "/images/cards/vnpay-jcb-dining.png",
    imageAlt: "VNPAY JCB Dining",
    applyLink: "https://vnpay.vn",
    applyLinkType: "direct",
    rating: 4,
    reviewCount: 680,
    isRecommended: true,
    isNew: false,
    isExclusive: false,
    tags: ["ăn uống", "dining", "nhà hàng", "giảm giá"],

    // SEO & Analytics
    metaTitle: "Thẻ VNPAY JCB Dining - Ưu đãi ăn uống hàng đầu",
    metaDescription:
      "Thẻ tín dụng với giảm giá đến 25% tại các nhà hàng đối tác",
    lastUpdated: new Date("2025-01-19"),
    publishedAt: new Date("2024-12-15"),
  },

  // Entertainment Card
  {
    id: "tpb-visa-entertainment",
    slug: "tpb-visa-entertainment",
    name: "TPBank Visa Entertainment",
    issuer: "TPBank",
    cardType: "visa",
    category: "entertainment",

    // Financial Details
    annualFee: 750000,
    annualFeeType: "waivable",
    annualFeeWaiverConditions: "Chi tiêu 45 triệu/năm",
    interestRate: 21,
    interestRateType: "fixed",
    creditLimitMin: 15000000,
    creditLimitMax: 120000000,
    creditLimitTier: "gold",

    // Income Requirements
    incomeRequiredMin: 7000000,
    incomeProof: ["payroll", "bank_statement"],
    employmentType: "full_time",

    // Age Requirements
    ageRequiredMin: 21,
    ageRequiredMax: 60,

    // Geographic Availability
    provinces: vietnameseProvinces,
    nationalAvailability: true,

    // Features & Benefits
    features: [
      "Ưu đãi xem phim",
      "Giảm vé sự kiện",
      "Tích điểm giải trí",
      "App LiveBank 24/7",
    ],
    benefits: [
      "Giảm 50% vé xem phim",
      "Giảm 30% vé sự kiện",
      "Tích điểm 3x",
      "Ưu đãi BHD, CGV",
    ],

    // Rewards Program
    rewardsProgram: {
      type: "points",
      earnRate: 2.5,
      categories: [
        { category: "Xem phim", rate: 6 },
        { category: "Sự kiện", rate: 5 },
        { category: "Game", rate: 3 },
      ],
      expiryMonths: 20,
      minimumRedemption: 100,
    },

    // Fees Structure
    withdrawalFee: 3,
    withdrawalFeeMin: 30000,
    foreignExchangeFee: 2.5,
    latePaymentFee: 170000,
    latePaymentFeeType: "fixed",
    overLimitFee: 230000,
    returnedPaymentFee: 110000,

    // Installment Plans
    installmentPlans: [
      { months: 3, interestRate: 0, minAmount: 2000000 },
      { months: 6, interestRate: 2, minAmount: 3000000 },
      { months: 12, interestRate: 3.5, minAmount: 5000000 },
    ],

    // Insurance & Protection
    insurance: {
      travel: false,
      medical: false,
      purchaseProtection: false,
      fraudProtection: true,
      carRental: false,
    },

    // Digital Features
    digitalFeatures: {
      mobileBanking: true,
      nfcPayment: true,
      qrPayment: true,
      onlineBanking: true,
      cardControl: true,
      expenseTracking: false,
    },

    // Application Process
    applicationMethods: ["online", "branch", "mobile_app"],
    processingTime: 5,
    documentsRequired: ["CMND/CCCD", "Hợp đồng lao động", "Bảng lương 3 tháng"],

    // Metadata
    image: "/images/cards/tpb-visa-entertainment.png",
    imageAlt: "TPBank Visa Entertainment",
    applyLink: "https://www.tpbank.com.vn",
    applyLinkType: "direct",
    rating: 4,
    reviewCount: 420,
    isRecommended: false,
    isNew: false,
    isExclusive: false,
    tags: ["giải trí", "entertainment", "xem phim", "sự kiện"],

    // SEO & Analytics
    metaTitle: "Thẻ TPBank Visa Entertainment - Giải trí không giới hạn",
    metaDescription:
      "Thẻ tín dụng với nhiều ưu đãi xem phim và sự kiện giải trí",
    lastUpdated: new Date("2025-01-20"),
    publishedAt: new Date("2024-12-20"),
  },

  // Travel Card
  {
    id: "msb-visa-travel",
    slug: "msb-visa-travel",
    name: "MSB Visa Travel",
    issuer: "MSB",
    cardType: "visa",
    category: "travel",

    // Financial Details
    annualFee: 1200000,
    annualFeeType: "waivable",
    annualFeeWaiverConditions: "Chi tiêu 70 triệu/năm",
    interestRate: 22.5,
    interestRateType: "fixed",
    creditLimitMin: 30000000,
    creditLimitMax: 200000000,
    creditLimitTier: "gold",

    // Income Requirements
    incomeRequiredMin: 10000000,
    incomeProof: ["payroll", "bank_statement"],
    employmentType: "full_time",

    // Age Requirements
    ageRequiredMin: 22,
    ageRequiredMax: 60,

    // Geographic Availability
    provinces: vietnameseProvinces,
    nationalAvailability: true,

    // Features & Benefits
    features: [
      "Lounge sân bay",
      "Bảo hiểm du lịch",
      "Tích dặm bay",
      "Ưu đãi khách sạn",
    ],
    benefits: [
      "2 lượt lounge/năm",
      "Bảo hiểm du lịch 10 tỷ",
      "Tích dặm Vietnam Airlines",
      "Giảm 30% khách sạn",
    ],

    // Rewards Program
    rewardsProgram: {
      type: "miles",
      earnRate: 1.5,
      categories: [
        { category: "Vé máy bay", rate: 3 },
        { category: "Khách sạn", rate: 2.5 },
        { category: "Du lịch", rate: 2 },
      ],
      expiryMonths: 36,
      minimumRedemption: 500,
    },

    // Fees Structure
    withdrawalFee: 3,
    withdrawalFeeMin: 40000,
    foreignExchangeFee: 2,
    latePaymentFee: 200000,
    latePaymentFeeType: "fixed",
    overLimitFee: 300000,
    returnedPaymentFee: 150000,
    balanceTransferFee: 3,
    balanceTransferFeeType: "percentage",

    // Installment Plans
    installmentPlans: [
      { months: 6, interestRate: 0, minAmount: 5000000 },
      { months: 12, interestRate: 1.5, minAmount: 10000000 },
      { months: 18, interestRate: 2.5, minAmount: 15000000 },
    ],

    // Insurance & Protection
    insurance: {
      travel: true,
      medical: true,
      purchaseProtection: true,
      fraudProtection: true,
      carRental: true,
    },

    // Digital Features
    digitalFeatures: {
      mobileBanking: true,
      nfcPayment: true,
      qrPayment: true,
      onlineBanking: true,
      cardControl: true,
      expenseTracking: true,
    },

    // Application Process
    applicationMethods: ["online", "branch", "mobile_app"],
    processingTime: 7,
    documentsRequired: [
      "CMND/CCCD",
      "Hộ khẩu",
      "Hợp đồng lao động",
      "Bảng lương 6 tháng",
    ],

    // Metadata
    image: "/images/cards/msb-visa-travel.png",
    imageAlt: "MSB Visa Travel",
    applyLink: "https://www.msb.com.vn",
    applyLinkType: "direct",
    rating: 4,
    reviewCount: 210,
    isRecommended: false,
    isNew: false,
    isExclusive: false,
    tags: ["du lịch", "travel", "lounge", "dặm bay"],

    // SEO & Analytics
    metaTitle: "Thẻ MSB Visa Travel - Du lịch tiện lợi",
    metaDescription: "Thẻ tín dụng với nhiều ưu đãi du lịch và tích dặm bay",
    lastUpdated: new Date("2025-01-21"),
    publishedAt: new Date("2024-12-25"),
  },
];

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get all credit cards
 */
export const getAllCreditCards = (): CreditCard[] => {
  return vietnameseCreditCards;
};

/**
 * Get credit card by ID
 */
export const getCreditCardById = (id: string): CreditCard | undefined => {
  return vietnameseCreditCards.find((card) => card.id === id);
};

/**
 * Get credit card by slug
 */
export const getCreditCardBySlug = (slug: string): CreditCard | undefined => {
  return vietnameseCreditCards.find((card) => card.slug === slug);
};

/**
 * Get credit cards by category
 */
export const getCreditCardsByCategory = (
  category: CardCategory,
): CreditCard[] => {
  return vietnameseCreditCards.filter((card) => card.category === category);
};

/**
 * Get credit cards by issuer
 */
export const getCreditCardsByIssuer = (issuer: string): CreditCard[] => {
  return vietnameseCreditCards.filter((card) => card.issuer === issuer);
};

/**
 * Get credit cards by card type (network)
 */
export const getCreditCardsByType = (cardType: CardNetwork): CreditCard[] => {
  return vietnameseCreditCards.filter((card) => card.cardType === cardType);
};

/**
 * Get recommended credit cards
 */
export const getRecommendedCreditCards = (): CreditCard[] => {
  return vietnameseCreditCards.filter((card) => card.isRecommended);
};

/**
 * Get new credit cards
 */
export const getNewCreditCards = (): CreditCard[] => {
  return vietnameseCreditCards.filter((card) => card.isNew);
};

/**
 * Get exclusive credit cards
 */
export const getExclusiveCreditCards = (): CreditCard[] => {
  return vietnameseCreditCards.filter((card) => card.isExclusive);
};

/**
 * Search credit cards by query
 */
export const searchCreditCards = (query: string): CreditCard[] => {
  const lowerQuery = query.toLowerCase();
  return vietnameseCreditCards.filter(
    (card) =>
      card.name.toLowerCase().includes(lowerQuery) ||
      card.issuer.toLowerCase().includes(lowerQuery) ||
      card.features.some((feature) =>
        feature.toLowerCase().includes(lowerQuery),
      ) ||
      card.benefits.some((benefit) =>
        benefit.toLowerCase().includes(lowerQuery),
      ) ||
      card.tags.some((tag) => tag.toLowerCase().includes(lowerQuery)),
  );
};

/**
 * Get unique issuers list
 */
export const getUniqueIssuers = (): string[] => {
  return [...new Set(vietnameseCreditCards.map((card) => card.issuer))].sort();
};

/**
 * Get unique card types list
 */
export const getUniqueCardTypes = (): CardNetwork[] => {
  return [...new Set(vietnameseCreditCards.map((card) => card.cardType))];
};

/**
 * Get credit cards with annual fee waiver
 */
export const getCardsWithAnnualFeeWaiver = (): CreditCard[] => {
  return vietnameseCreditCards.filter(
    (card) =>
      card.annualFeeType === "waivable" || card.annualFeeType === "free",
  );
};

/**
 * Get credit cards by minimum income requirement
 */
export const getCardsByIncomeRequirement = (
  maxIncome: number,
): CreditCard[] => {
  return vietnameseCreditCards.filter(
    (card) => card.incomeRequiredMin <= maxIncome,
  );
};

/**
 * Get premium credit cards (credit limit >= 100 million)
 */
export const getPremiumCreditCards = (): CreditCard[] => {
  return vietnameseCreditCards.filter(
    (card) => card.creditLimitMax >= 100000000,
  );
};

/**
 * Sort credit cards by rating
 */
export const getTopRatedCreditCards = (limit: number = 10): CreditCard[] => {
  return [...vietnameseCreditCards]
    .sort((a, b) => b.rating - a.rating)
    .slice(0, limit);
};

// Export default
export default vietnameseCreditCards;
