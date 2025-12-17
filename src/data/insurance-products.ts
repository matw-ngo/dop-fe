/**
 * Comprehensive mock data for Vietnamese insurance products
 * Covers all major insurance categories available in the Vietnamese market
 */

import {
  CoveragePeriod,
  FeeType,
  InsuranceCategory,
  type InsuranceCategoryInfo,
  type InsuranceProduct,
  InsuranceType,
  VehicleType,
} from "@/types/insurance";

// ============================================================================
// Vietnamese Provinces (All 63 provinces)
// ============================================================================

const ALL_PROVINCES = [
  "An Giang",
  "Bà Rịa - Vũng Tàu",
  "Bạc Liêu",
  "Bắc Kạn",
  "Bắc Giang",
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
  "Hà Nội",
  "Hải Dương",
  "Hải Phòng",
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
// Insurance Products Data
// ============================================================================

export const INSURANCE_PRODUCTS: InsuranceProduct[] = [
  // =================== VEHICLE INSURANCE ===================
  {
    id: "tnds-bao-viet-oto",
    slug: "tnds-bao-viet-bao-hiem-trach-nhiem-dan-su-o-to",
    name: "TNDS Bắt buộc Xe cơ giới - Bảo Việt",
    issuer: "Tổng Công ty Cổ phần Bảo Việt",
    category: InsuranceCategory.VEHICLE,
    type: InsuranceType.COMPULSORY,
    productCode: "TNDS-OTO-BV-2024",

    coverage: {
      personalAccident: { limit: 150000000, disabled: false },
      propertyDamage: { limit: 100000000, disabled: false },
      medicalExpenses: { limit: 0, disabled: true },
      thirdPartyLiability: { limit: 100000000, disabled: false },
      death: { limit: 0, disabled: true },
      disability: { limit: 0, disabled: true },
      hospitalization: { limit: 0, disabled: true },
      surgery: { limit: 0, disabled: true },
      criticalIllness: { limit: 0, disabled: true },
      lossOfIncome: { limit: 0, disabled: true },
    },

    vehicleCoverage: {
      vehicleType: VehicleType.CAR,
      vehicleValueRange: { min: 0, max: 5000000000 },
      ownDamage: { limit: 0, disabled: true },
      theft: { limit: 0, disabled: true },
      fire: { limit: 0, disabled: true },
      naturalDisasters: { limit: 0, disabled: true },
    },

    pricing: {
      basePremium: 437000,
      feeType: FeeType.FIXED,
      taxRate: 0.1,
      taxAmount: 43700,
      totalPremium: 480700,
      currency: "VND",
      coveragePeriod: CoveragePeriod.ANNUALLY,
    },

    deductibles: {
      standardDeductible: 0,
      voluntaryDeductibleOptions: [],
      deductibleType: "fixed",
    },

    exclusions: [
      "Tai nạn xảy ra khi không có giấy phép lái xe",
      "Thiệt hại do ý thức cố ý",
      "Rượu bia và chất kích thích",
    ],
    waitingPeriods: {
      general: 0,
    },

    eligibility: {
      ageRange: { min: 18, max: 80 },
    },

    features: [
      "Bồi thường nhanh trong 24h",
      "Mạng lưới garage trên toàn quốc",
      "Hỗ trợ cứu hộ 24/7",
    ],
    benefits: [
      "Đảm bảo theo quy định pháp luật Việt Nam",
      "Bảo vệ bên thứ ba theo quy định",
      "Miễn phí hỗ trợ pháp lý",
    ],

    claims: {
      processDescription:
        "Khai báo tai nạn -> Nộp hồ sơ -> Giám định -> Bồi thường",
      requiredDocuments: [
        "Đơn yêu cầu bồi thường",
        "Giấy chứng nhận bảo hiểm",
        "Giấy phép lái xe",
        "Giấy đăng ký xe",
        "Biên bản tai nạn",
      ],
      processingTime: 3,
      approvalRate: 98,
      averageClaimTime: 2,
      claimMethods: ["online", "phone", "branch", "mobile_app"],
      contactInfo: {
        hotline: "1900 54 54 55",
        email: "khachhang@baoviet.com.vn",
        website: "www.baoviet.com.vn",
      },
    },

    availability: {
      provinces: ALL_PROVINCES,
      nationalAvailability: true,
      exclusions: [],
    },

    paymentOptions: {
      methods: ["bank_transfer", "credit_card", "mobile_banking", "ewallet"],
      installmentAvailable: false,
    },

    renewal: {
      autoRenewal: false,
      renewalReminderDays: 30,
      gracePeriod: 10,
      noClaimBonus: { maxYears: 0, maxDiscount: 0 },
    },

    image: "/images/insurance/bao-viet-tnds.jpg",
    imageAlt: "TNDS Bảo Việt",
    applyLink: "/apply/tnds-bao-viet",
    applyLinkType: "direct",
    rating: 4,
    reviewCount: 1250,
    isRecommended: true,
    tags: ["tnds", "bat-buoc", "o-to", "bao-viet"],

    metaTitle: "TNDS Bắt buộc Ô tô Bảo Việt - Giá tốt nhất 2024",
    metaDescription:
      "Bảo hiểm TNDS bắt buộc xe cơ giới Bảo Việt theo quy định. Phù hợp tất cả loại xe. Bồi thường nhanh 24h.",
    lastUpdated: "2024-01-15T00:00:00.000Z",
    publishedAt: "2024-01-10T00:00:00.000Z",
  },

  {
    id: "vat-chat-xe-bao-minh",
    slug: "bao-hiem-vat-chat-xe-co-gioi-bao-minh",
    name: "Bảo hiểm Vật chất Xe cơ giới - Bảo Minh",
    issuer: "Công ty TNHH Bảo hiểm Bảo Minh",
    category: InsuranceCategory.VEHICLE,
    type: InsuranceType.VOLUNTARY,
    productCode: "VCX-BM-2024",

    coverage: {
      personalAccident: { limit: 10000000, disabled: false },
      propertyDamage: { limit: 50000000, disabled: false },
      medicalExpenses: { limit: 10000000, disabled: false },
      thirdPartyLiability: { limit: 0, disabled: true },
      death: { limit: 0, disabled: true },
      disability: { limit: 0, disabled: true },
      hospitalization: { limit: 0, disabled: true },
      surgery: { limit: 0, disabled: true },
      criticalIllness: { limit: 0, disabled: true },
      lossOfIncome: { limit: 0, disabled: true },
    },

    vehicleCoverage: {
      vehicleType: VehicleType.CAR,
      vehicleValueRange: { min: 200000000, max: 5000000000 },
      ownDamage: { limit: 2000000000, disabled: false },
      theft: { limit: 2000000000, disabled: false },
      fire: { limit: 2000000000, disabled: false },
      naturalDisasters: { limit: 2000000000, disabled: false },
    },

    pricing: {
      basePremium: 4500000,
      feeType: FeeType.PERCENTAGE,
      taxRate: 0.1,
      taxAmount: 450000,
      totalPremium: 4950000,
      currency: "VND",
      coveragePeriod: CoveragePeriod.ANNUALLY,
    },

    deductibles: {
      standardDeductible: 1000000,
      voluntaryDeductibleOptions: [1000000, 2000000, 3000000],
      deductibleType: "fixed",
    },

    exclusions: [
      "Mài mòn tự nhiên",
      "Hư hỏng do bảo dưỡng kém",
      "Thiệt hại do hành động chiến tranh",
    ],
    waitingPeriods: {
      general: 0,
    },

    eligibility: {
      ageRange: { min: 18, max: 75 },
    },

    features: [
      "Bảo hiểm tai nạn lái phụ",
      "Bảo hiểm thủy kích",
      "Bảo hiểm mất cắp bộ phận",
      "Hỗ trợ cứu hộ 24/7",
      "Sửa chữa tại garage uy tín",
    ],
    benefits: [
      "Bồi thường 100% thiệt hại",
      "Miễn phí kéo xe",
      "Thay thế phụ tùng chính hãng",
    ],
    additionalServices: {
      roadsideAssistance: true,
      medicalHotline: false,
      legalSupport: true,
      homeVisit: false,
      worldwideCoverage: false,
    },

    claims: {
      processDescription:
        "Báo cáo sự cố -> Giám định tại chỗ -> Phê duyệt -> Sửa chữa",
      requiredDocuments: [
        "Đơn yêu cầu bồi thường",
        "Giấy chứng nhận bảo hiểm",
        "Giấy đăng ký xe",
        "Giấy phép lái xe",
        "Hình ảnh hiện trường",
      ],
      processingTime: 5,
      approvalRate: 95,
      averageClaimTime: 4,
      claimMethods: ["online", "phone", "branch", "mobile_app"],
      contactInfo: {
        hotline: "1900 6169",
        email: "cs@baominh.com.vn",
        website: "www.baominh.com.vn",
      },
    },

    availability: {
      provinces: ALL_PROVINCES,
      nationalAvailability: true,
      exclusions: [],
    },

    paymentOptions: {
      methods: ["bank_transfer", "credit_card", "mobile_banking", "ewallet"],
      installmentAvailable: true,
      installmentPlans: [
        { months: 3 },
        { months: 6 },
        { months: 12, interestRate: 0 },
      ],
      discounts: [
        {
          type: "percentage",
          value: 15,
          condition: "Không bồi thường năm trước",
        },
        { type: "percentage", value: 5, condition: "Khách hàng thân thiết" },
      ],
    },

    renewal: {
      autoRenewal: true,
      renewalReminderDays: 30,
      gracePeriod: 15,
      noClaimBonus: { maxYears: 5, maxDiscount: 40 },
    },

    image: "/images/insurance/bao-minh-vat-chat.jpg",
    imageAlt: "Bảo hiểm vật chất xe Bảo Minh",
    applyLink: "/apply/vat-chat-bao-minh",
    applyLinkType: "direct",
    rating: 4,
    reviewCount: 890,
    tags: ["vat-chat", "tu-nguyen", "o-to", "bao-minh"],

    metaTitle: "Bảo hiểm Vật chất Xe cơ giới Bảo Minh - Bảo vệ toàn diện",
    metaDescription:
      "Gói bảo hiểm vật chất xe ô tô Bảo Minh với quyền lợi bảo vệ toàn diện. Bồi thường nhanh, chi phí cạnh tranh.",
    lastUpdated: "2024-01-20T00:00:00.000Z",
    publishedAt: "2024-01-15T00:00:00.000Z",
  },

  {
    id: "tnds-pvi-xe-may",
    slug: "tnds-bat-buoc-xe-may-pvi",
    name: "TNDS Bắt buộc Xe máy - PVI",
    issuer: "Tổng Công ty Cổ phần Bảo hiểm PVI",
    category: InsuranceCategory.VEHICLE,
    type: InsuranceType.COMPULSORY,
    productCode: "TNDS-XM-PVI-2024",

    coverage: {
      personalAccident: { limit: 70000000, disabled: false },
      propertyDamage: { limit: 50000000, disabled: false },
      medicalExpenses: { limit: 0, disabled: true },
      thirdPartyLiability: { limit: 50000000, disabled: false },
      death: { limit: 0, disabled: true },
      disability: { limit: 0, disabled: true },
      hospitalization: { limit: 0, disabled: true },
      surgery: { limit: 0, disabled: true },
      criticalIllness: { limit: 0, disabled: true },
      lossOfIncome: { limit: 0, disabled: true },
    },

    vehicleCoverage: {
      vehicleType: VehicleType.MOTORCYCLE,
      vehicleValueRange: { min: 0, max: 500000000 },
      ownDamage: { limit: 0, disabled: true },
      theft: { limit: 0, disabled: true },
      fire: { limit: 0, disabled: true },
      naturalDisasters: { limit: 0, disabled: true },
    },

    pricing: {
      basePremium: 66000,
      feeType: FeeType.FIXED,
      taxRate: 0.1,
      taxAmount: 6600,
      totalPremium: 72600,
      currency: "VND",
      coveragePeriod: CoveragePeriod.ANNUALLY,
    },

    deductibles: {
      standardDeductible: 0,
      voluntaryDeductibleOptions: [],
      deductibleType: "fixed",
    },

    exclusions: [
      "Không có giấy phép lái xe",
      "Điều khiển phương tiện khi dùng rượu bia",
      "Cố ý gây tai nạn",
    ],
    waitingPeriods: {
      general: 0,
    },

    eligibility: {
      ageRange: { min: 16, max: 80 },
    },

    features: [
      "Mua bảo hiểm online nhanh chóng",
      "In giấy chứng nhận ngay",
      "Hệ thống cửa hàng toàn quốc",
    ],
    benefits: [
      "Đáp ứng quy định pháp luật",
      "Bảo vệ bên thứ ba",
      "Hỗ trợ xử lý hồ sơ",
    ],

    claims: {
      processDescription: "Báo tai nạn -> Nộp hồ sơ -> Giám định -> Chi trả",
      requiredDocuments: [
        "Đơn yêu cầu bồi thường",
        "Giấy chứng nhận bảo hiểm",
        "Bằng lái xe",
        "Đăng ký xe",
        "Biên bản CA",
      ],
      processingTime: 3,
      approvalRate: 97,
      averageClaimTime: 2,
      claimMethods: ["online", "phone", "branch"],
      contactInfo: {
        hotline: "1900 988 686",
        email: "cs@pvi.com.vn",
        website: "www.pvi.com.vn",
      },
    },

    availability: {
      provinces: ALL_PROVINCES,
      nationalAvailability: true,
      exclusions: [],
    },

    paymentOptions: {
      methods: [
        "cash",
        "bank_transfer",
        "credit_card",
        "mobile_banking",
        "ewallet",
      ],
      installmentAvailable: false,
    },

    renewal: {
      autoRenewal: false,
      renewalReminderDays: 30,
      gracePeriod: 10,
      noClaimBonus: { maxYears: 0, maxDiscount: 0 },
    },

    image: "/images/insurance/pvi-tnds-xe-may.jpg",
    imageAlt: "TNDS xe máy PVI",
    applyLink: "/apply/tnds-pvi-xe-may",
    applyLinkType: "direct",
    rating: 4,
    reviewCount: 2150,
    isRecommended: true,
    tags: ["tnds", "bat-buoc", "xe-may", "pvi"],

    metaTitle: "TNDS Bắt buộc Xe máy PVI - Mua online, nhận ngay",
    metaDescription:
      "Bảo hiểm TNDS bắt buộc xe máy PVI theo Nghị định 03/2021/NĐ-CP. Mua online nhanh chóng, hiệu lực ngay.",
    lastUpdated: "2024-01-18T00:00:00.000Z",
    publishedAt: "2024-01-12T00:00:00.000Z",
  },

  // =================== HEALTH INSURANCE ===================
  {
    id: "suc-khoe-bao-viet-an-tam",
    slug: "bao-hiem-suc-khoe-bao-viet-an-tam",
    name: "Bảo hiểm Sức khỏe An Tâm - Bảo Việt",
    issuer: "Công ty TNHH Bảo hiểm Nhân thọ Bảo Việt",
    category: InsuranceCategory.HEALTH,
    type: InsuranceType.VOLUNTARY,
    productCode: "SK-BV-AT-2024",

    coverage: {
      personalAccident: { limit: 0, disabled: true },
      propertyDamage: { limit: 0, disabled: true },
      medicalExpenses: { limit: 2000000000, disabled: false },
      thirdPartyLiability: { limit: 0, disabled: true },
      death: { limit: 0, disabled: true },
      disability: { limit: 0, disabled: true },
      hospitalization: { limit: 10000000, disabled: false },
      surgery: { limit: 20000000, disabled: false },
      criticalIllness: { limit: 0, disabled: true },
      lossOfIncome: { limit: 0, disabled: true },
    },

    pricing: {
      basePremium: 4800000,
      feeType: FeeType.FIXED,
      taxRate: 0.1,
      taxAmount: 480000,
      totalPremium: 5280000,
      currency: "VND",
      coveragePeriod: CoveragePeriod.ANNUALLY,
    },

    deductibles: {
      standardDeductible: 100000,
      voluntaryDeductibleOptions: [50000, 100000, 200000],
      deductibleType: "fixed",
    },

    exclusions: [
      "Bệnh truyền nhiễm theo quyết định cách ly",
      "Thẩm mỹ, phẫu thuật không cần thiết",
      "Bệnh hiểm nghèo (nếu không mua thêm)",
    ],
    waitingPeriods: {
      general: 30,
      specific: {
        "Bệnh thông thường": 30,
        "Phẫu thuật": 60,
        "Thai sản": 180,
      },
    },

    eligibility: {
      ageRange: { min: 0, max: 65 },
      medicalRequirements: [
        "Đơn đăng ký sức khỏe",
        "Kết quả khám sức khỏe (nếu > 45 tuổi)",
      ],
      preExistingConditions: {
        allowed: ["Cao huyết áp đã kiểm soát", "Tiểu đường type 2"],
        notAllowed: ["Ung thư", "Tim mạch phức tạp", "HIV/AIDS"],
        loading: [
          { condition: "Tiểu đường", increase: 30 },
          { condition: "Cao huyết áp", increase: 20 },
        ],
      },
    },

    features: [
      "Chi trả viện phí up to 2 tỷ VNĐ",
      "Mạng lưới bệnh viện đa dạng",
      "Quyền lợi quốc tế (tùy chọn)",
      "Không cần giấy chứng nhận trước",
    ],
    benefits: [
      "Phòng bệnh viện VIP",
      "Chi trả thuốc ngoài danh mục",
      "Miễn phí kiểm tra sức khỏe định kỳ",
    ],
    additionalServices: {
      roadsideAssistance: false,
      medicalHotline: true,
      legalSupport: false,
      homeVisit: true,
      worldwideCoverage: true,
    },

    claims: {
      processDescription:
        "Thông báo nhập viện -> Nộp hồ sơ -> Xử lý và chi trả",
      requiredDocuments: [
        "Đơn yêu cầu bồi thường",
        "Giấy ra viện",
        "Hóa đơn, chi phí thuốc men",
        "Bản sao CCCD/CMND",
      ],
      processingTime: 7,
      approvalRate: 96,
      averageClaimTime: 5,
      claimMethods: ["online", "phone", "mobile_app", "branch"],
      contactInfo: {
        hotline: "1900 6139",
        email: "cs@baovietlife.com.vn",
        website: "www.baovietlife.com.vn",
      },
    },

    availability: {
      provinces: ALL_PROVINCES,
      nationalAvailability: true,
      exclusions: [],
    },

    paymentOptions: {
      methods: ["bank_transfer", "credit_card", "mobile_banking"],
      installmentAvailable: true,
      installmentPlans: [
        { months: 3, interestRate: 0 },
        { months: 6, interestRate: 1.5 },
        { months: 12, interestRate: 2.5 },
      ],
    },

    renewal: {
      autoRenewal: true,
      renewalReminderDays: 45,
      gracePeriod: 30,
      noClaimBonus: { maxYears: 0, maxDiscount: 0 },
    },

    image: "/images/insurance/bao-viet-suc-khoe.jpg",
    imageAlt: "Bảo hiểm sức khỏe Bảo Việt",
    applyLink: "/apply/suc-khoe-bao-viet",
    applyLinkType: "direct",
    rating: 5,
    reviewCount: 1680,
    isRecommended: true,
    tags: ["suc-khoe", "benh-vien", "bao-viet", "an-tam"],

    metaTitle: "Bảo hiểm Sức khỏe An Tâm Bảo Việt - Quyền lợi up to 2 tỷ",
    metaDescription:
      "Gói bảo hiểm sức khỏe toàn diện từ Bảo Việt. Quyền lợi bệnh viện up to 2 tỷ VNĐ. Mạng lưới bệnh viện lớn nhất Việt Nam.",
    lastUpdated: "2024-01-22T00:00:00.000Z",
    publishedAt: "2024-01-16T00:00:00.000Z",
  },

  {
    id: "bhiem-ngheo-critical-prudential",
    slug: "bao-hiem-benh-hiem-ngheo-prudential",
    name: "Bảo hiểm Bệnh hiểm nghèo - Prudential",
    issuer: "Công ty TNHH Bảo hiểm Nhân thọ Prudential Việt Nam",
    category: InsuranceCategory.HEALTH,
    type: InsuranceType.VOLUNTARY,
    productCode: "BHN-PRU-2024",

    coverage: {
      personalAccident: { limit: 0, disabled: true },
      propertyDamage: { limit: 0, disabled: true },
      medicalExpenses: { limit: 0, disabled: true },
      thirdPartyLiability: { limit: 0, disabled: true },
      death: { limit: 0, disabled: true },
      disability: { limit: 0, disabled: true },
      hospitalization: { limit: 0, disabled: true },
      surgery: { limit: 0, disabled: true },
      criticalIllness: { limit: 2000000000, disabled: false },
      lossOfIncome: { limit: 0, disabled: true },
    },

    pricing: {
      basePremium: 8400000,
      feeType: FeeType.FIXED,
      taxRate: 0.1,
      taxAmount: 840000,
      totalPremium: 9240000,
      currency: "VND",
      coveragePeriod: CoveragePeriod.ANNUALLY,
    },

    deductibles: {
      standardDeductible: 0,
      voluntaryDeductibleOptions: [],
      deductibleType: "fixed",
    },

    exclusions: [
      "Bệnh đã có trước ngày hiệu lực",
      "HIV/AIDS",
      "Bệnh di truyền",
    ],
    waitingPeriods: {
      general: 90,
      specific: {
        "Ung thư": 90,
        "Tai biến mạch máu não": 90,
        "Nhồi máu cơ tim": 90,
      },
    },

    eligibility: {
      ageRange: { min: 18, max: 60 },
      medicalRequirements: [
        "Khai báo sức khỏe",
        "Khám sức khỏe (nếu > 50 tuổi)",
      ],
    },

    features: [
      "Bảo vệ 45+ bệnh hiểm nghèo",
      "Chi trả 100% số bảo hiểm",
      "Bảo vệ đến tuổi 80",
      "Điều trị quốc tế",
    ],
    benefits: [
      "Tự do chi trả",
      "Không cần hóa đơn",
      "Miễn phí sau 1 năm không yêu cầu bồi thường",
    ],
    additionalServices: {
      roadsideAssistance: false,
      medicalHotline: true,
      legalSupport: true,
      homeVisit: true,
      worldwideCoverage: true,
    },

    claims: {
      processDescription:
        "Thông báo chẩn đoán -> Nộp hồ sơ bệnh án -> Xác nhận -> Chi trả",
      requiredDocuments: [
        "Đơn yêu cầu bồi thường",
        "Giấy chứng nhận bảo hiểm",
        "Kết quả chẩn đoán bệnh",
        "Bệnh án chi tiết",
        "CCCD/CMND",
      ],
      processingTime: 10,
      approvalRate: 94,
      averageClaimTime: 7,
      claimMethods: ["online", "phone", "mobile_app", "branch"],
      contactInfo: {
        hotline: "1900 6776",
        email: "customerservice@prudential.com.vn",
        website: "www.prudential.com.vn",
      },
    },

    availability: {
      provinces: ALL_PROVINCES,
      nationalAvailability: true,
      exclusions: [],
    },

    paymentOptions: {
      methods: ["bank_transfer", "credit_card", "mobile_banking"],
      installmentAvailable: false,
    },

    renewal: {
      autoRenewal: true,
      renewalReminderDays: 60,
      gracePeriod: 30,
      noClaimBonus: { maxYears: 0, maxDiscount: 0 },
    },

    image: "/images/insurance/prudential-benh-hiem-ngheo.jpg",
    imageAlt: "Bảo hiểm bệnh hiểm nghèo Prudential",
    applyLink: "/apply/benh-hiem-ngheo-prudential",
    applyLinkType: "affiliate",
    rating: 5,
    reviewCount: 1230,
    tags: ["benh-hiem-ngheo", "suc-khoe", "prudential"],

    metaTitle: "Bảo hiểm Bệnh hiểm nghèo Prudential - 45+ bệnh được bảo vệ",
    metaDescription:
      "Bảo hiểm bệnh hiểm nghèo Prudential chi trả đến 2 tỷ VNĐ. Bảo vệ 45+ bệnh. Thủ tục đơn giản, chi trả nhanh.",
    lastUpdated: "2024-01-25T00:00:00.000Z",
    publishedAt: "2024-01-18T00:00:00.000Z",
  },

  // =================== LIFE INSURANCE ===================
  {
    id: "nhan-tho-dai-ichi-sung-huong",
    slug: "bao-hiem-nhan-tho-dai-ichi-sung-huong",
    name: "Bảo hiểm Nhân thọ Sướng Hưởng - Dai-ichi Life",
    issuer: "Công ty TNHH Bảo hiểm Nhân thọ Dai-ichi Life Việt Nam",
    category: InsuranceCategory.LIFE,
    type: InsuranceType.VOLUNTARY,
    productCode: "NTH-DCL-SH-2024",

    coverage: {
      personalAccident: { limit: 0, disabled: true },
      propertyDamage: { limit: 0, disabled: true },
      medicalExpenses: { limit: 0, disabled: true },
      thirdPartyLiability: { limit: 0, disabled: true },
      death: { limit: 1500000000, disabled: false },
      disability: { limit: 1500000000, disabled: false },
      hospitalization: { limit: 0, disabled: true },
      surgery: { limit: 0, disabled: true },
      criticalIllness: { limit: 0, disabled: true },
      lossOfIncome: { limit: 100000000, disabled: false },
    },

    pricing: {
      basePremium: 18000000,
      feeType: FeeType.FIXED,
      taxRate: 0,
      taxAmount: 0,
      totalPremium: 18000000,
      currency: "VND",
      coveragePeriod: CoveragePeriod.ANNUALLY,
    },

    deductibles: {
      standardDeductible: 0,
      voluntaryDeductibleOptions: [],
      deductibleType: "fixed",
    },

    exclusions: [
      "Tự tử trong 2 năm đầu",
      "Hành vi phạm pháp",
      "Tham gia khủng bố",
    ],
    waitingPeriods: {
      general: 0,
      specific: {
        "Tự tử": 730,
      },
    },

    eligibility: {
      ageRange: { min: 0, max: 65 },
      medicalRequirements: [
        "Khai báo sức khỏe",
        "Khám sức khỏe (nếu > 50 tuổi hoặc cao phí)",
      ],
    },

    features: [
      "Bảo vệ đến 99 tuổi",
      "Giá trị tài khoản được đầu tư",
      "Rút linh hoạt khi cần",
      "Thưởng hợp đồng lâu năm",
    ],
    benefits: [
      "Tích lũy tài chính hiệu quả",
      "Bảo vệ tài sản tương lai",
      "Miễn phí phí khi tai nạn",
    ],
    additionalServices: {
      roadsideAssistance: false,
      medicalHotline: true,
      legalSupport: false,
      homeVisit: true,
      worldwideCoverage: true,
    },

    claims: {
      processDescription:
        "Thông báo sự kiện bảo hiểm -> Nộp hồ sơ -> Giám định -> Chi trả",
      requiredDocuments: [
        "Đơn yêu cầu bồi thường",
        "Hợp đồng bảo hiểm gốc",
        "Giấy chứng tử/Giấy xác nhận thương tật",
        "CCCD/CMND",
        "Giấy tờ pháp lý liên quan",
      ],
      processingTime: 15,
      approvalRate: 98,
      averageClaimTime: 10,
      claimMethods: ["phone", "branch", "mobile_app"],
      contactInfo: {
        hotline: "1900 636 435",
        email: "service@dai-ichi.com.vn",
        website: "www.dai-ichi.com.vn",
      },
    },

    availability: {
      provinces: ALL_PROVINCES,
      nationalAvailability: true,
      exclusions: [],
    },

    paymentOptions: {
      methods: ["bank_transfer", "credit_card", "cash", "mobile_banking"],
      installmentAvailable: false,
    },

    renewal: {
      autoRenewal: true,
      renewalReminderDays: 30,
      gracePeriod: 30,
      noClaimBonus: { maxYears: 0, maxDiscount: 0 },
    },

    image: "/images/insurance/dai-ichi-sung-huong.jpg",
    imageAlt: "Bảo hiểm nhân thọ Sướng Hưởng Dai-ichi Life",
    applyLink: "/apply/nhan-tho-dai-ichi",
    applyLinkType: "affiliate",
    rating: 5,
    reviewCount: 2340,
    isRecommended: true,
    isNew: true,
    tags: ["nhan-tho", "tich-luy", "dai-ichi", "sung-huong"],

    metaTitle:
      "Bảo hiểm Nhân thọ Sướng Hưởng Dai-ichi Life - Tích lũy và bảo vệ",
    metaDescription:
      "Sản phẩm bảo hiểm nhân thọ kết hợp tích lũy Dai-ichi Life. Bảo vệ toàn diện, đầu tư hiệu quả, rút linh hoạt.",
    lastUpdated: "2024-01-28T00:00:00.000Z",
    publishedAt: "2024-01-20T00:00:00.000Z",
  },

  {
    id: "nhan-tho-manulife-estream",
    slug: "bao-hiem-nhan-tho-manulife-estream",
    name: "Bảo hiểm Nhân thọ My - Manulife",
    issuer: "Công ty TNHH Bảo hiểm Nhân thọ Manulife Việt Nam",
    category: InsuranceCategory.LIFE,
    type: InsuranceType.VOLUNTARY,
    productCode: "NTH-MNL-MY-2024",

    coverage: {
      personalAccident: { limit: 0, disabled: true },
      propertyDamage: { limit: 0, disabled: true },
      medicalExpenses: { limit: 0, disabled: true },
      thirdPartyLiability: { limit: 0, disabled: true },
      death: { limit: 1000000000, disabled: false },
      disability: { limit: 1000000000, disabled: false },
      hospitalization: { limit: 0, disabled: true },
      surgery: { limit: 0, disabled: true },
      criticalIllness: { limit: 500000000, disabled: false },
      lossOfIncome: { limit: 50000000, disabled: false },
    },

    pricing: {
      basePremium: 12000000,
      feeType: FeeType.FIXED,
      taxRate: 0,
      taxAmount: 0,
      totalPremium: 12000000,
      currency: "VND",
      coveragePeriod: CoveragePeriod.ANNUALLY,
    },

    deductibles: {
      standardDeductible: 0,
      voluntaryDeductibleOptions: [],
      deductibleType: "fixed",
    },

    exclusions: [
      "Tự sát trong 2 năm",
      "Tham gia hoạt động nguy hiểm",
      "Phạm tội",
    ],
    waitingPeriods: {
      general: 0,
      specific: {
        "Tự tử": 730,
        "Bệnh hiểm nghèo": 90,
      },
    },

    eligibility: {
      ageRange: { min: 18, max: 60 },
    },

    features: [
      "Lợi nhuận không được đảm bảo",
      "Thưởng hợp đồng",
      "Cam kết tài sản tối thiểu",
      "Linh hoạt thay đổi chương trình",
    ],
    benefits: [
      "Bảo vệ tài chính gia đình",
      "Quỹ hưu trí linh hoạt",
      "Tài sản thừa kế cho con cái",
    ],
    additionalServices: {
      roadsideAssistance: false,
      medicalHotline: true,
      legalSupport: true,
      homeVisit: true,
      worldwideCoverage: true,
    },

    claims: {
      processDescription:
        "Thông báo sự kiện -> Cung cấp hồ sơ -> Xử lý -> Chi trả",
      requiredDocuments: [
        "Đơn yêu cầu bồi thường",
        "Hợp đồng bảo hiểm",
        "Giấy chứng tử/tai nạn",
        "CCCD/CMND",
        "Giấy tờ chứng minh quyền lợi",
      ],
      processingTime: 20,
      approvalRate: 96,
      averageClaimTime: 15,
      claimMethods: ["phone", "branch", "mobile_app", "online"],
      contactInfo: {
        hotline: "1900 6186",
        email: "service@manulife.com.vn",
        website: "www.manulife.com.vn",
      },
    },

    availability: {
      provinces: ALL_PROVINCES,
      nationalAvailability: true,
      exclusions: [],
    },

    paymentOptions: {
      methods: ["bank_transfer", "credit_card", "cash", "mobile_banking"],
      installmentAvailable: false,
    },

    renewal: {
      autoRenewal: true,
      renewalReminderDays: 45,
      gracePeriod: 30,
      noClaimBonus: { maxYears: 0, maxDiscount: 0 },
    },

    image: "/images/insurance/manulife-my.jpg",
    imageAlt: "Bảo hiểm nhân thọ My Manulife",
    applyLink: "/apply/nhan-tho-manulife",
    applyLinkType: "affiliate",
    rating: 4,
    reviewCount: 1890,
    tags: ["nhan-tho", "dau-tu", "manulife", "my"],

    metaTitle: "Bảo hiểm Nhân thọ My Manulife - Bảo vệ và đầu tư linh hoạt",
    metaDescription:
      "Sản phẩm bảo hiểm nhân thọ liên kết đầu tư từ Manulife. Bảo vệ toàn diện, cơ hội lợi nhuận hấp dẫn.",
    lastUpdated: "2024-01-30T00:00:00.000Z",
    publishedAt: "2024-01-22T00:00:00.000Z",
  },

  // =================== TRAVEL INSURANCE ===================
  {
    id: "du-lich-bao-minh-asean",
    slug: "bao-hiem-du-lich-bao-minh-asean",
    name: "Bảo hiểm Du lịch ASEAN - Bảo Minh",
    issuer: "Công ty TNHH Bảo hiểm Bảo Minh",
    category: InsuranceCategory.TRAVEL,
    type: InsuranceType.VOLUNTARY,
    productCode: "DL-BM-ASEAN-2024",

    coverage: {
      personalAccident: { limit: 2000000000, disabled: false },
      propertyDamage: { limit: 0, disabled: true },
      medicalExpenses: { limit: 1500000000, disabled: false },
      thirdPartyLiability: { limit: 500000000, disabled: false },
      death: { limit: 2000000000, disabled: false },
      disability: { limit: 2000000000, disabled: false },
      hospitalization: { limit: 0, disabled: true },
      surgery: { limit: 0, disabled: true },
      criticalIllness: { limit: 0, disabled: true },
      lossOfIncome: { limit: 0, disabled: true },
    },

    pricing: {
      basePremium: 450000,
      feeType: FeeType.FIXED,
      taxRate: 0.1,
      taxAmount: 45000,
      totalPremium: 495000,
      currency: "VND",
      coveragePeriod: CoveragePeriod.CUSTOM,
      customPeriodDays: 21,
    },

    deductibles: {
      standardDeductible: 0,
      voluntaryDeductibleOptions: [],
      deductibleType: "fixed",
    },

    exclusions: [
      "Bệnh mãn tính",
      "Tham gia thể thao chuyên nghiệp",
      "Xung đột, chiến tranh",
    ],
    waitingPeriods: {
      general: 0,
    },

    eligibility: {
      ageRange: { min: 1, max: 80 },
    },

    features: [
      "Bảo hiểm COVID-19",
      "Hỗ trợ 24/7 toàn cầu",
      "Chi trả viện phí quốc tế",
      "Thất lạc giấy tờ, hành lý",
    ],
    benefits: [
      "Hỗ trợ y tế khẩn cấp",
      "Đưa về nước khi cần thiết",
      "Bồi thường chậm, hủy chuyến bay",
    ],
    additionalServices: {
      roadsideAssistance: false,
      medicalHotline: true,
      legalSupport: true,
      homeVisit: false,
      worldwideCoverage: true,
    },

    claims: {
      processDescription:
        "Liên hệ tổng đài cấp cứu -> Nhận hướng dẫn -> Nộp hồ sơ -> Chi trả",
      requiredDocuments: [
        "Đơn yêu cầu bồi thường",
        "Giấy chứng nhận bảo hiểm",
        "Hóa đơn chi phí y tế",
        "Báo cáo cảnh sát (nếu có)",
        "Vé máy bay, passport",
      ],
      processingTime: 5,
      approvalRate: 95,
      averageClaimTime: 3,
      claimMethods: ["phone", "online", "mobile_app"],
      contactInfo: {
        hotline: "1900 6169",
        email: "cs@baominh.com.vn",
        website: "www.baominh.com.vn",
      },
    },

    availability: {
      provinces: ALL_PROVINCES,
      nationalAvailability: true,
      exclusions: [],
    },

    paymentOptions: {
      methods: ["bank_transfer", "credit_card", "mobile_banking", "ewallet"],
      installmentAvailable: false,
    },

    renewal: {
      autoRenewal: false,
      renewalReminderDays: 7,
      gracePeriod: 0,
      noClaimBonus: { maxYears: 0, maxDiscount: 0 },
    },

    image: "/images/insurance/bao-minh-du-lich.jpg",
    imageAlt: "Bảo hiểm du lịch ASEAN Bảo Minh",
    applyLink: "/apply/du-lich-bao-minh",
    applyLinkType: "direct",
    rating: 4,
    reviewCount: 890,
    tags: ["du-lich", "asean", "quoc-te", "bao-minh", "covid"],

    metaTitle: "Bảo hiểm Du lịch ASEAN Bảo Minh - Bảo vệ toàn diện",
    metaDescription:
      "Bảo hiểm du lịch ASEAN Bảo Minh. Bảo hiểm COVID-19. Hỗ trợ y tế 24/7. Chi phí cạnh tranh.",
    lastUpdated: "2024-02-01T00:00:00.000Z",
    publishedAt: "2024-01-25T00:00:00.000Z",
  },

  {
    id: "du-lich-toan-cau-pjico",
    slug: "bao-hiem-du-lich-toan-cau-pjico",
    name: "Bảo hiểm Du lịch Toàn cầu - PJICO",
    issuer: "Công ty Cổ phần Bảo hiểm PJICO",
    category: InsuranceCategory.TRAVEL,
    type: InsuranceType.VOLUNTARY,
    productCode: "DL-PJICO-GLOBAL-2024",

    coverage: {
      personalAccident: { limit: 5000000000, disabled: false },
      propertyDamage: { limit: 0, disabled: true },
      medicalExpenses: { limit: 3000000000, disabled: false },
      thirdPartyLiability: { limit: 1000000000, disabled: false },
      death: { limit: 5000000000, disabled: false },
      disability: { limit: 5000000000, disabled: false },
      hospitalization: { limit: 0, disabled: true },
      surgery: { limit: 0, disabled: true },
      criticalIllness: { limit: 0, disabled: true },
      lossOfIncome: { limit: 0, disabled: true },
    },

    pricing: {
      basePremium: 1200000,
      feeType: FeeType.FIXED,
      taxRate: 0.1,
      taxAmount: 120000,
      totalPremium: 1320000,
      currency: "VND",
      coveragePeriod: CoveragePeriod.CUSTOM,
      customPeriodDays: 30,
    },

    deductibles: {
      standardDeductible: 0,
      voluntaryDeductibleOptions: [],
      deductibleType: "fixed",
    },

    exclusions: ["Bệnh có trước", "Mang thai", "Thể thao mạo hiểm"],
    waitingPeriods: {
      general: 0,
    },

    eligibility: {
      ageRange: { min: 6, max: 75 },
    },

    features: [
      "Quyền lợi lên đến 5 tỷ VNĐ",
      "Mạng lưới hỗ trợ toàn cầu",
      "Bảo hiểm COVID-19",
      "Đổi lịch miễn phí",
    ],
    benefits: [
      "Cấp cứu y tế khẩn cấp",
      "Vận chuyển y tế",
      "Hỗ trợ pháp lý ở nước ngoài",
    ],
    additionalServices: {
      roadsideAssistance: false,
      medicalHotline: true,
      legalSupport: true,
      homeVisit: false,
      worldwideCoverage: true,
    },

    claims: {
      processDescription:
        "Gọi tổng đài khẩn cấp -> Nhận hỗ trợ tại chỗ -> Nộp chứng từ -> Bồi thường",
      requiredDocuments: [
        "Yêu cầu bồi thường",
        "Chứng nhận bảo hiểm",
        "Hóa đơn, chứng từ",
        "Báo cáo y tế",
        "Hộ chiếu, visa",
      ],
      processingTime: 7,
      approvalRate: 94,
      averageClaimTime: 5,
      claimMethods: ["phone", "online", "mobile_app"],
      contactInfo: {
        hotline: "1900 9477",
        email: "cs@pjico.com.vn",
        website: "www.pjico.com.vn",
      },
    },

    availability: {
      provinces: ALL_PROVINCES,
      nationalAvailability: true,
      exclusions: [],
    },

    paymentOptions: {
      methods: ["bank_transfer", "credit_card", "mobile_banking"],
      installmentAvailable: false,
    },

    renewal: {
      autoRenewal: false,
      renewalReminderDays: 7,
      gracePeriod: 0,
      noClaimBonus: { maxYears: 0, maxDiscount: 0 },
    },

    image: "/images/insurance/pjico-du-lich-toan-cau.jpg",
    imageAlt: "Bảo hiểm du lịch toàn cầu PJICO",
    applyLink: "/apply/du-lich-pjico",
    applyLinkType: "direct",
    rating: 5,
    reviewCount: 670,
    isRecommended: true,
    tags: ["du-lich", "toan-cau", "quoc-te", "pjico"],

    metaTitle: "Bảo hiểm Du lịch Toàn cầu PJICO - Quyền lợi đến 5 tỷ VNĐ",
    metaDescription:
      "Bảo hiểm du lịch toàn cầu PJICO với quyền lợi up to 5 tỷ. Hỗ trợ 24/7 tại 190+ quốc gia. Bảo hiểm COVID-19.",
    lastUpdated: "2024-02-03T00:00:00.000Z",
    publishedAt: "2024-01-28T00:00:00.000Z",
  },

  // =================== PROPERTY INSURANCE ===================
  {
    id: "nha-tu-nhien-pvi",
    slug: "bao-hiem-nha-tu-nhien-pvi",
    name: "Bảo hiểm Nhà tư nhiên - PVI",
    issuer: "Tổng Công ty Cổ phần Bảo hiểm PVI",
    category: InsuranceCategory.PROPERTY,
    type: InsuranceType.VOLUNTARY,
    productCode: "NTN-PVI-2024",

    coverage: {
      personalAccident: { limit: 50000000, disabled: false },
      propertyDamage: { limit: 2000000000, disabled: false },
      medicalExpenses: { limit: 20000000, disabled: false },
      thirdPartyLiability: { limit: 500000000, disabled: false },
      death: { limit: 50000000, disabled: false },
      disability: { limit: 50000000, disabled: false },
      hospitalization: { limit: 0, disabled: true },
      surgery: { limit: 0, disabled: true },
      criticalIllness: { limit: 0, disabled: true },
      lossOfIncome: { limit: 10000000, disabled: false },
    },

    pricing: {
      basePremium: 2400000,
      feeType: FeeType.PERCENTAGE,
      taxRate: 0.1,
      taxAmount: 240000,
      totalPremium: 2640000,
      currency: "VND",
      coveragePeriod: CoveragePeriod.ANNUALLY,
    },

    deductibles: {
      standardDeductible: 5000000,
      voluntaryDeductibleOptions: [3000000, 5000000, 10000000],
      deductibleType: "fixed",
    },

    exclusions: [
      "Mài mòn tự nhiên",
      "Hư hỏng do côn trùng",
      "Tài sản ngầm dưới đất",
    ],
    waitingPeriods: {
      general: 0,
    },

    eligibility: {
      ageRange: { min: 18, max: 80 },
    },

    features: [
      "Bảo vệ toàn diện nhà cửa",
      "Cháy nổ, sét đánh",
      "Thiên tai, bão lụt",
      "Trộm cắp, đột nhập",
    ],
    benefits: [
      "Chi phí sửa chữa, thay mới",
      "Chi phí tạm thời dọn đi",
      "Trách nhiệm bên thứ ba",
    ],
    additionalServices: {
      roadsideAssistance: false,
      medicalHotline: false,
      legalSupport: true,
      homeVisit: true,
      worldwideCoverage: false,
    },

    claims: {
      processDescription:
        "Báo cáo tổn thất -> Giám định -> Định giá -> Bồi thường",
      requiredDocuments: [
        "Đơn yêu cầu bồi thường",
        "Hợp đồng bảo hiểm",
        "Hình ảnh hiện trường",
        "Hóa đơn sửa chữa",
        "Báo cáo cơ quan chức năng",
      ],
      processingTime: 10,
      approvalRate: 93,
      averageClaimTime: 8,
      claimMethods: ["phone", "branch", "online", "mobile_app"],
      contactInfo: {
        hotline: "1900 988 686",
        email: "cs@pvi.com.vn",
        website: "www.pvi.com.vn",
      },
    },

    availability: {
      provinces: ALL_PROVINCES,
      nationalAvailability: true,
      exclusions: [],
    },

    paymentOptions: {
      methods: ["bank_transfer", "credit_card", "mobile_banking"],
      installmentAvailable: false,
    },

    renewal: {
      autoRenewal: true,
      renewalReminderDays: 30,
      gracePeriod: 15,
      noClaimBonus: { maxYears: 5, maxDiscount: 20 },
    },

    image: "/images/insurance/pvi-nha-tu-nhien.jpg",
    imageAlt: "Bảo hiểm nhà tư nhiên PVI",
    applyLink: "/apply/nha-pvi",
    applyLinkType: "direct",
    rating: 4,
    reviewCount: 560,
    tags: ["nha", "tai-san", "pvi", "chay-no", "thien-tai"],

    metaTitle: "Bảo hiểm Nhà tư nhiên PVI - Bảo vệ toàn diện tài sản",
    metaDescription:
      "Bảo hiểm nhà cửa tư nhiên PVI. Bảo vệ trước cháy nổ, thiên tai, trộm cắp. Chi phí cạnh tranh, bồi thường nhanh.",
    lastUpdated: "2024-02-05T00:00:00.000Z",
    publishedAt: "2024-01-30T00:00:00.000Z",
  },

  {
    id: "tai-san-san-bay-bic",
    slug: "bao-hiem-tai-san-san-bay-bic",
    name: "Bảo hiểm Tài sản Sân bay - BIC",
    issuer: "Công ty Cổ phần Bảo hiểm BIC",
    category: InsuranceCategory.PROPERTY,
    type: InsuranceType.VOLUNTARY,
    productCode: "TSSB-BIC-2024",

    coverage: {
      personalAccident: { limit: 100000000, disabled: false },
      propertyDamage: { limit: 10000000000, disabled: false },
      medicalExpenses: { limit: 50000000, disabled: false },
      thirdPartyLiability: { limit: 2000000000, disabled: false },
      death: { limit: 100000000, disabled: false },
      disability: { limit: 100000000, disabled: false },
      hospitalization: { limit: 0, disabled: true },
      surgery: { limit: 0, disabled: true },
      criticalIllness: { limit: 0, disabled: true },
      lossOfIncome: { limit: 20000000, disabled: false },
    },

    pricing: {
      basePremium: 15000000,
      feeType: FeeType.CALCULATED,
      taxRate: 0.1,
      taxAmount: 1500000,
      totalPremium: 16500000,
      currency: "VND",
      coveragePeriod: CoveragePeriod.ANNUALLY,
    },

    deductibles: {
      standardDeductible: 20000000,
      voluntaryDeductibleOptions: [10000000, 20000000, 50000000],
      deductibleType: "fixed",
    },

    exclusions: [
      "Hành động chiến tranh",
      "Nuclear, radiation",
      "Thiết bị lỗi thời",
    ],
    waitingPeriods: {
      general: 0,
    },

    eligibility: {
      ageRange: { min: 21, max: 70 },
      occupation: [
        "Doanh nghiệp sân bay",
        "Hãng hàng không",
        "Công ty dịch vụ",
      ],
    },

    features: [
      "Bảo vệ nhà ga, đường băng",
      "Thiết bị kiểm soát không lưu",
      "Hệ thống an ninh sân bay",
      "Phương tiện mặt đất",
    ],
    benefits: [
      "Bồi thường nhanh chóng",
      "Đội giám định chuyên nghiệp",
      "Hỗ trợ khôi phục hoạt động",
    ],
    additionalServices: {
      roadsideAssistance: false,
      medicalHotline: false,
      legalSupport: true,
      homeVisit: false,
      worldwideCoverage: false,
    },

    claims: {
      processDescription:
        "Thông báo sự cố -> Đội giám định đến hiện trường -> Lập biên bản -> Xử lý bồi thường",
      requiredDocuments: [
        "Đơn yêu cầu bồi thường",
        "Hợp đồng bảo hiểm",
        "Biên bản hiện trường",
        "Hình ảnh, video",
        "Báo cáo chính quyền",
      ],
      processingTime: 14,
      approvalRate: 95,
      averageClaimTime: 10,
      claimMethods: ["phone", "branch"],
      contactInfo: {
        hotline: "1900 9459",
        email: "cs@bic.com.vn",
        website: "www.bic.com.vn",
      },
    },

    availability: {
      provinces: [
        "Hà Nội",
        "Hồ Chí Minh",
        "Đà Nẵng",
        "Cần Thơ",
        "Hải Phòng",
        "Quảng Ninh",
        "Khánh Hòa",
        "Phú Quốc",
        "Lâm Đồng",
      ],
      nationalAvailability: false,
      exclusions: [],
    },

    paymentOptions: {
      methods: ["bank_transfer", "cash"],
      installmentAvailable: false,
    },

    renewal: {
      autoRenewal: true,
      renewalReminderDays: 60,
      gracePeriod: 30,
      noClaimBonus: { maxYears: 5, maxDiscount: 15 },
    },

    image: "/images/insurance/bic-san-bay.jpg",
    imageAlt: "Bảo hiểm tài sản sân bay BIC",
    applyLink: "/apply/san-bay-bic",
    applyLinkType: "direct",
    rating: 5,
    reviewCount: 45,
    isExclusive: true,
    tags: ["san-bay", "tai-san", "doanh-nghiep", "bic", "chuyen-nghiep"],

    metaTitle: "Bảo hiểm Tài sản Sân bay BIC - Giải pháp chuyên nghiệp",
    metaDescription:
      "Bảo hiểm tài sản sân bay chuyên nghiệp từ BIC. Bảo vệ toàn diện nhà ga, đường băng, thiết bị bay.",
    lastUpdated: "2024-02-08T00:00:00.000Z",
    publishedAt: "2024-02-01T00:00:00.000Z",
  },

  // Additional vehicle insurance products
  {
    id: "xe-2-banh-pjico",
    slug: "bao-hiem-xe-2-banh-pjico",
    name: "Bảo hiểm Xe 2 bánh - PJICO",
    issuer: "Công ty Cổ phần Bảo hiểm PJICO",
    category: InsuranceCategory.VEHICLE,
    type: InsuranceType.VOLUNTARY,
    productCode: "X2B-PJICO-2024",

    coverage: {
      personalAccident: { limit: 20000000, disabled: false },
      propertyDamage: { limit: 5000000, disabled: false },
      medicalExpenses: { limit: 5000000, disabled: false },
      thirdPartyLiability: { limit: 0, disabled: true },
      death: { limit: 10000000, disabled: false },
      disability: { limit: 20000000, disabled: false },
      hospitalization: { limit: 0, disabled: true },
      surgery: { limit: 0, disabled: true },
      criticalIllness: { limit: 0, disabled: true },
      lossOfIncome: { limit: 0, disabled: true },
    },

    vehicleCoverage: {
      vehicleType: VehicleType.MOTORCYCLE,
      vehicleValueRange: { min: 20000000, max: 200000000 },
      ownDamage: { limit: 100000000, disabled: false },
      theft: { limit: 100000000, disabled: false },
      fire: { limit: 100000000, disabled: false },
      naturalDisasters: { limit: 0, disabled: true },
    },

    pricing: {
      basePremium: 450000,
      feeType: FeeType.PERCENTAGE,
      taxRate: 0.1,
      taxAmount: 45000,
      totalPremium: 495000,
      currency: "VND",
      coveragePeriod: CoveragePeriod.ANNUALLY,
    },

    deductibles: {
      standardDeductible: 200000,
      voluntaryDeductibleOptions: [100000, 200000, 500000],
      deductibleType: "fixed",
    },

    exclusions: [
      "Hỏng hóc do mài mòn",
      "Mất cắp do cẩu thả",
      "Đua xe trái phép",
    ],
    waitingPeriods: {
      general: 0,
    },

    eligibility: {
      ageRange: { min: 18, max: 70 },
    },

    features: [
      "Bảo vệ xe máy toàn diện",
      "Tai nạn cá nhân",
      "Mất cắp toàn bộ",
      "Hỗ trợ sửa chữa tận nơi",
    ],
    benefits: [
      "Sửa chữa tại garage chính hãng",
      "Thay thế linh kiện gốc",
      "Miễn phí cứu hộ 50km",
    ],
    additionalServices: {
      roadsideAssistance: true,
      medicalHotline: false,
      legalSupport: false,
      homeVisit: false,
      worldwideCoverage: false,
    },

    claims: {
      processDescription: "Báo cáo sự cố -> Nộp hồ sơ -> Giám định -> Chi trả",
      requiredDocuments: [
        "Đơn yêu cầu bồi thường",
        "Giấy chứng nhận bảo hiểm",
        "Đăng ký xe, bằng lái",
        "Biên bản tai nạn/CA",
        "Hình ảnh xe hư hỏng",
      ],
      processingTime: 4,
      approvalRate: 92,
      averageClaimTime: 3,
      claimMethods: ["phone", "branch", "mobile_app"],
      contactInfo: {
        hotline: "1900 9477",
        email: "cs@pjico.com.vn",
        website: "www.pjico.com.vn",
      },
    },

    availability: {
      provinces: ALL_PROVINCES,
      nationalAvailability: true,
      exclusions: [],
    },

    paymentOptions: {
      methods: [
        "bank_transfer",
        "credit_card",
        "mobile_banking",
        "ewallet",
        "cash",
      ],
      installmentAvailable: false,
    },

    renewal: {
      autoRenewal: true,
      renewalReminderDays: 30,
      gracePeriod: 15,
      noClaimBonus: { maxYears: 3, maxDiscount: 20 },
    },

    image: "/images/insurance/pjico-xe-2-banh.jpg",
    imageAlt: "Bảo hiểm xe 2 bánh PJICO",
    applyLink: "/apply/xe-2-banh-pjico",
    applyLinkType: "direct",
    rating: 4,
    reviewCount: 1450,
    tags: ["xe-may", "2-banh", "tinh-nguyen", "pjico"],

    metaTitle: "Bảo hiểm Xe 2 bánh PJICO - Bảo vệ toàn diện xe máy",
    metaDescription:
      "Bảo hiểm xe máy tự nguyện PJICO. Bảo vệ tai nạn, mất cắp, hư hỏng vật chất. Giá cạnh tranh, hỗ trợ 24/7.",
    lastUpdated: "2024-02-10T00:00:00.000Z",
    publishedAt: "2024-02-03T00:00:00.000Z",
  },

  // Additional health insurance products
  {
    id: "suc-khoe-intas-chua-benh-noi-tru",
    slug: "bao-hiem-chua-benh-noi-tru-intas",
    name: "Bảo hiểm Chữa bệnh Nội trú - ING (Generali)",
    issuer: "Công ty TNHH Bảo hiểm Nhân thọ Generali Việt Nam",
    category: InsuranceCategory.HEALTH,
    type: InsuranceType.VOLUNTARY,
    productCode: "CBNT-GEN-2024",

    coverage: {
      personalAccident: { limit: 0, disabled: true },
      propertyDamage: { limit: 0, disabled: true },
      medicalExpenses: { limit: 5000000000, disabled: false },
      thirdPartyLiability: { limit: 0, disabled: true },
      death: { limit: 0, disabled: true },
      disability: { limit: 0, disabled: true },
      hospitalization: { limit: 20000000, disabled: false },
      surgery: { limit: 100000000, disabled: false },
      criticalIllness: { limit: 0, disabled: true },
      lossOfIncome: { limit: 50000000, disabled: false },
    },

    pricing: {
      basePremium: 7200000,
      feeType: FeeType.TIERED,
      taxRate: 0.1,
      taxAmount: 720000,
      totalPremium: 7920000,
      currency: "VND",
      coveragePeriod: CoveragePeriod.ANNUALLY,
    },

    deductibles: {
      standardDeductible: 200000,
      voluntaryDeductibleOptions: [0, 200000, 500000, 1000000],
      deductibleType: "fixed",
    },

    exclusions: ["Bệnh sẵn có", "Phẫu thuật thẩm mỹ", "Điều trị vô sinh"],
    waitingPeriods: {
      general: 60,
      specific: {
        "Bệnh thông thường": 60,
        "Phẫu thuật": 90,
        "Thai sản": 180,
      },
    },

    eligibility: {
      ageRange: { min: 15, max: 65 },
      medicalRequirements: [
        "Khai báo sức khỏe chi tiết",
        "Khám sức khỏe bắt buộc",
      ],
    },

    features: [
      "Chi trả viện phí không giới hạn",
      "Phòng bệnh viện VIP",
      "Mạng lưới bệnh viện quốc tế",
      "Không cần giấy chứng nhận trước",
    ],
    benefits: [
      "Chi trả 100% chi phí",
      "Bao gồm thuốc ngoài danh mục",
      "Hỗ trợ y tế quốc tế 24/7",
    ],
    additionalServices: {
      roadsideAssistance: false,
      medicalHotline: true,
      legalSupport: true,
      homeVisit: true,
      worldwideCoverage: true,
    },

    claims: {
      processDescription:
        "Thông báo nhập viện -> Gửi hồ sơ -> Giám định -> Chi trả trực tiếp",
      requiredDocuments: [
        "Đơn yêu cầu bồi thường",
        "Hợp đồng bảo hiểm",
        "Giấy ra viện",
        "Toa thuốc, hóa đơn",
        "Kết quả xét nghiệm",
      ],
      processingTime: 5,
      approvalRate: 97,
      averageClaimTime: 3,
      claimMethods: ["online", "mobile_app", "phone", "branch"],
      contactInfo: {
        hotline: "1800 6069",
        email: "customerservice@generali.com.vn",
        website: "www.generali.com.vn",
      },
    },

    availability: {
      provinces: ALL_PROVINCES,
      nationalAvailability: true,
      exclusions: [],
    },

    paymentOptions: {
      methods: ["bank_transfer", "credit_card", "mobile_banking"],
      installmentAvailable: false,
    },

    renewal: {
      autoRenewal: true,
      renewalReminderDays: 45,
      gracePeriod: 30,
      noClaimBonus: { maxYears: 0, maxDiscount: 0 },
    },

    image: "/images/insurance/generali-chua-benh.jpg",
    imageAlt: "Bảo hiểm chữa bệnh nội trú Generali",
    applyLink: "/apply/chua-benh-generali",
    applyLinkType: "affiliate",
    rating: 5,
    reviewCount: 980,
    isRecommended: true,
    tags: ["chua-benh", "noi-tru", "generali", "hospital"],

    metaTitle: "Bảo hiểm Chữa bệnh Nội trú Generali - Không giới hạn chi phí",
    metaDescription:
      "Bảo hiểm chữa bệnh nội trú Generali chi trả không giới hạn. Phòng VIP, bệnh viện quốc tế. Thủ tục đơn giản.",
    lastUpdated: "2024-02-12T00:00:00.000Z",
    publishedAt: "2024-02-05T00:00:00.000Z",
  },

  // Additional travel insurance products
  {
    id: "du-lich-chau-au-fwd",
    slug: "bao-hiem-du-lich-chau-au-fwd",
    name: "Bảo hiểm Du lịch Châu Âu - FWD",
    issuer: "Công ty TNHH Bảo hiểm FWD Việt Nam",
    category: InsuranceCategory.TRAVEL,
    type: InsuranceType.VOLUNTARY,
    productCode: "DL-FWD-EU-2024",

    coverage: {
      personalAccident: { limit: 3000000000, disabled: false },
      propertyDamage: { limit: 0, disabled: true },
      medicalExpenses: { limit: 4000000000, disabled: false },
      thirdPartyLiability: { limit: 2000000000, disabled: false },
      death: { limit: 3000000000, disabled: false },
      disability: { limit: 3000000000, disabled: false },
      hospitalization: { limit: 0, disabled: true },
      surgery: { limit: 0, disabled: true },
      criticalIllness: { limit: 0, disabled: true },
      lossOfIncome: { limit: 0, disabled: true },
    },

    pricing: {
      basePremium: 2400000,
      feeType: FeeType.FIXED,
      taxRate: 0.1,
      taxAmount: 240000,
      totalPremium: 2640000,
      currency: "VND",
      coveragePeriod: CoveragePeriod.CUSTOM,
      customPeriodDays: 90,
    },

    deductibles: {
      standardDeductible: 0,
      voluntaryDeductibleOptions: [],
      deductibleType: "fixed",
    },

    exclusions: [
      "Mục đích nhập cư",
      "Lao động bất hợp pháp",
      "Tham gia nội chiến",
    ],
    waitingPeriods: {
      general: 0,
    },

    eligibility: {
      ageRange: { min: 18, max: 80 },
    },

    features: [
      "Đáp ứng visa Schengen",
      "Bảo hiểm COVID-19",
      "Hỗ trợ 24/7 đa ngôn ngữ",
      "Mất giấy tờ quan trọng",
    ],
    benefits: [
      "Vận chuyển y tế khẩn cấp",
      "Trả về nước khi cần thiết",
      "Thăm người thân khi tai nạn",
    ],
    additionalServices: {
      roadsideAssistance: false,
      medicalHotline: true,
      legalSupport: true,
      homeVisit: false,
      worldwideCoverage: true,
    },

    claims: {
      processDescription:
        "Gọi số khẩn cấp -> Nhận hỗ trợ tại chỗ -> Nộp hồ sơ -> Chi trả",
      requiredDocuments: [
        "Yêu cầu bồi thường",
        "Chứng nhận bảo hiểm",
        "Hóa đơn y tế",
        "Báo cáo police",
        "Passport, visa",
      ],
      processingTime: 10,
      approvalRate: 94,
      averageClaimTime: 7,
      claimMethods: ["phone", "online", "mobile_app"],
      contactInfo: {
        hotline: "1900 585866",
        email: "cs@fwd.com.vn",
        website: "www.fwd.com.vn",
      },
    },

    availability: {
      provinces: ALL_PROVINCES,
      nationalAvailability: true,
      exclusions: [],
    },

    paymentOptions: {
      methods: ["bank_transfer", "credit_card", "mobile_banking", "ewallet"],
      installmentAvailable: false,
    },

    renewal: {
      autoRenewal: false,
      renewalReminderDays: 7,
      gracePeriod: 0,
      noClaimBonus: { maxYears: 0, maxDiscount: 0 },
    },

    image: "/images/insurance/fwd-chau-au.jpg",
    imageAlt: "Bảo hiểm du lịch Châu Âu FWD",
    applyLink: "/apply/du-lich-chau-au-fwd",
    applyLinkType: "affiliate",
    rating: 5,
    reviewCount: 780,
    tags: ["du-lich", "chau-au", "schengen", "fwd", "visa"],

    metaTitle: "Bảo hiểm Du lịch Châu Âu FWD - Đáp ứng visa Schengen",
    metaDescription:
      "Bảo hiểm du lịch Châu Âu FWD đáp ứng tiêu chuẩn visa Schengen. Bảo hiểm COVID-19. Hỗ trợ 24/7 toàn cầu.",
    lastUpdated: "2024-02-15T00:00:00.000Z",
    publishedAt: "2024-02-08T00:00:00.000Z",
  },

  // Additional property insurance products
  {
    id: "kho-hang-hoa-mic",
    slug: "bao-hiem-kho-hang-hoa-mic",
    name: "Bảo hiểm Kho hàng hóa - MIC",
    issuer: "Tổng Công ty Cổ phần Bảo hiểm Quân đội MIC",
    category: InsuranceCategory.PROPERTY,
    type: InsuranceType.VOLUNTARY,
    productCode: "KHH-MIC-2024",

    coverage: {
      personalAccident: { limit: 100000000, disabled: false },
      propertyDamage: { limit: 5000000000, disabled: false },
      medicalExpenses: { limit: 50000000, disabled: false },
      thirdPartyLiability: { limit: 1000000000, disabled: false },
      death: { limit: 100000000, disabled: false },
      disability: { limit: 100000000, disabled: false },
      hospitalization: { limit: 0, disabled: true },
      surgery: { limit: 0, disabled: true },
      criticalIllness: { limit: 0, disabled: true },
      lossOfIncome: { limit: 50000000, disabled: false },
    },

    pricing: {
      basePremium: 8000000,
      feeType: FeeType.PERCENTAGE,
      taxRate: 0.1,
      taxAmount: 800000,
      totalPremium: 8800000,
      currency: "VND",
      coveragePeriod: CoveragePeriod.ANNUALLY,
    },

    deductibles: {
      standardDeductible: 10000000,
      voluntaryDeductibleOptions: [5000000, 10000000, 20000000],
      deductibleType: "fixed",
    },

    exclusions: [
      "Hàng hóa cấm",
      "Hư hỏng do tự nhiên",
      "Giảm sút trọng lượng tự nhiên",
    ],
    waitingPeriods: {
      general: 0,
    },

    eligibility: {
      ageRange: { min: 21, max: 70 },
      occupation: ["Chủ kho bãi", "Doanh nghiệp sản xuất", "Công ty logistics"],
    },

    features: [
      "Bảo vệ hàng hóa tồn kho",
      "Cháy nổ, sét đánh",
      "Thiên tai, lũ lụt",
      "Trộm cắp có vết tội phạm",
    ],
    benefits: ["Chi phí phòng ngừa", "Dọn dẹp hiện trường", "Kiểm kê hàng hóa"],
    additionalServices: {
      roadsideAssistance: false,
      medicalHotline: false,
      legalSupport: true,
      homeVisit: false,
      worldwideCoverage: false,
    },

    claims: {
      processDescription:
        "Báo cáo tổn thất -> Giám định -> Kiểm kê -> Xử lý bồi thường",
      requiredDocuments: [
        "Đơn yêu cầu bồi thường",
        "Hợp đồng bảo hiểm",
        "Báo cáo hiện trường",
        "Biên bản kiểm kê",
        "Hóa đơn, chứng từ",
      ],
      processingTime: 12,
      approvalRate: 94,
      averageClaimTime: 9,
      claimMethods: ["phone", "branch", "online"],
      contactInfo: {
        hotline: "1900 637637",
        email: "cs@mic.com.vn",
        website: "www.mic.com.vn",
      },
    },

    availability: {
      provinces: ALL_PROVINCES,
      nationalAvailability: true,
      exclusions: [],
    },

    paymentOptions: {
      methods: ["bank_transfer", "cash"],
      installmentAvailable: false,
    },

    renewal: {
      autoRenewal: true,
      renewalReminderDays: 45,
      gracePeriod: 30,
      noClaimBonus: { maxYears: 5, maxDiscount: 25 },
    },

    image: "/images/insurance/mic-kho-hang.jpg",
    imageAlt: "Bảo hiểm kho hàng hóa MIC",
    applyLink: "/apply/kho-hang-mic",
    applyLinkType: "direct",
    rating: 4,
    reviewCount: 220,
    tags: ["kho-hang", "hang-hoa", "doanh-nghiep", "mic", "tai-san"],

    metaTitle: "Bảo hiểm Kho hàng hóa MIC - Giải pháp bảo vệ tài sản",
    metaDescription:
      "Bảo hiểm kho bãi, hàng hóa tồn kho MIC. Bảo vệ trước cháy nổ, thiên tai, trộm cắp. Dành cho doanh nghiệp.",
    lastUpdated: "2024-02-18T00:00:00.000Z",
    publishedAt: "2024-02-10T00:00:00.000Z",
  },

  // Additional life insurance products
  {
    id: "nhan-tho-aia-tron-doi",
    slug: "bao-hiem-nhan-tho-aia-tron-doi",
    name: "Bảo hiểm Nhân thọ Trọn đời - AIA",
    issuer: "Công ty TNHH Bảo hiểm Nhân thọ AIA Việt Nam",
    category: InsuranceCategory.LIFE,
    type: InsuranceType.VOLUNTARY,
    productCode: "NTH-AIA-TD-2024",

    coverage: {
      personalAccident: { limit: 0, disabled: true },
      propertyDamage: { limit: 0, disabled: true },
      medicalExpenses: { limit: 0, disabled: true },
      thirdPartyLiability: { limit: 0, disabled: true },
      death: { limit: 3000000000, disabled: false },
      disability: { limit: 3000000000, disabled: false },
      hospitalization: { limit: 0, disabled: true },
      surgery: { limit: 0, disabled: true },
      criticalIllness: { limit: 1000000000, disabled: false },
      lossOfIncome: { limit: 200000000, disabled: false },
    },

    pricing: {
      basePremium: 30000000,
      feeType: FeeType.FIXED,
      taxRate: 0,
      taxAmount: 0,
      totalPremium: 30000000,
      currency: "VND",
      coveragePeriod: CoveragePeriod.ANNUALLY,
    },

    deductibles: {
      standardDeductible: 0,
      voluntaryDeductibleOptions: [],
      deductibleType: "fixed",
    },

    exclusions: [
      "Tự sát trong 2 năm",
      "Tham gia tội phạm",
      "Chiến tranh, khủng bố",
    ],
    waitingPeriods: {
      general: 0,
      specific: {
        "Tự tử": 730,
        "Bệnh hiểm nghèo": 90,
      },
    },

    eligibility: {
      ageRange: { min: 0, max: 65 },
      medicalRequirements: ["Khai báo sức khỏe", "Khám sức khỏe (nếu cần)"],
    },

    features: [
      "Bảo vệ trọn đời",
      "Cam kết giá trị tài khoản",
      "Thưởng không hủy hợp đồng",
      "Linh hoạt rút tiền",
    ],
    benefits: [
      "Kế hoạch thừa kế",
      "Quỹ hưu trí chất lượng",
      "Bảo vệ tài chính gia đình",
    ],
    additionalServices: {
      roadsideAssistance: false,
      medicalHotline: true,
      legalSupport: true,
      homeVisit: true,
      worldwideCoverage: true,
    },

    claims: {
      processDescription:
        "Thông báo sự kiện -> Nộp hồ sơ đầy đủ -> Xử lý và chi trả",
      requiredDocuments: [
        "Đơn yêu cầu bồi thường",
        "Hợp đồng bảo hiểm gốc",
        "Giấy chứng tử/trợ cấp",
        "CCCD/CMND",
        "Giấy tờ chứng minh",
      ],
      processingTime: 15,
      approvalRate: 98,
      averageClaimTime: 12,
      claimMethods: ["phone", "branch", "mobile_app", "online"],
      contactInfo: {
        hotline: "1900 272727",
        email: "customerservice@aia.com.vn",
        website: "www.aia.com.vn",
      },
    },

    availability: {
      provinces: ALL_PROVINCES,
      nationalAvailability: true,
      exclusions: [],
    },

    paymentOptions: {
      methods: ["bank_transfer", "credit_card", "cash", "mobile_banking"],
      installmentAvailable: false,
    },

    renewal: {
      autoRenewal: true,
      renewalReminderDays: 30,
      gracePeriod: 30,
      noClaimBonus: { maxYears: 0, maxDiscount: 0 },
    },

    image: "/images/insurance/aia-tron-doi.jpg",
    imageAlt: "Bảo hiểm nhân thọ trọn đời AIA",
    applyLink: "/apply/nhan-tho-aia",
    applyLinkType: "affiliate",
    rating: 5,
    reviewCount: 3210,
    isRecommended: true,
    tags: ["nhan-tho", "tron-doi", "aia", "ke-hoach-thua-ke"],

    metaTitle: "Bảo hiểm Nhân thọ Trọn đời AIA - Bảo vệ và kế hoạch thừa kế",
    metaDescription:
      "Bảo hiểm nhân thọ trọn đời AIA với quyền lợi bảo vệ đến 99 tuổi. Kế hoạch thừa kế hiệu quả. Cam kết giá trị tài khoản.",
    lastUpdated: "2024-02-20T00:00:00.000Z",
    publishedAt: "2024-02-12T00:00:00.000Z",
  },
];

// ============================================================================
// Insurance Categories for Navigation
// ============================================================================

export const INSURANCE_CATEGORIES: InsuranceCategoryInfo[] = [
  {
    id: InsuranceCategory.VEHICLE,
    name: "Bảo hiểm Xe cơ giới",
    description:
      "TNDS bắt buộc, vật chất xe, tai nạn cá nhân cho mọi loại phương tiện",
    icon: "Car",
    count: 4,
    features: [
      "TNDS Bắt buộc theo luật",
      "Bảo hiểm vật chất xe",
      "Bảo hiểm tai nạn người trên xe",
      "Cứu hộ 24/7 toàn quốc",
    ],
  },
  {
    id: InsuranceCategory.HEALTH,
    name: "Bảo hiểm Sức khỏe",
    description:
      "Chi trả viện phí, bảo hiểm bệnh hiểm nghèo, thẻ khám chữa bệnh",
    icon: "Heart",
    count: 3,
    features: [
      "Chi trả viện phí không giới hạn",
      "Bảo hiểm 45+ bệnh hiểm nghèo",
      "Mạng lưới bệnh viện lớn",
      "Hỗ trợ quốc tế",
    ],
  },
  {
    id: InsuranceCategory.LIFE,
    name: "Bảo hiểm Nhân thọ",
    description:
      "Bảo vệ tài chính, tích lũy hưu trí, kế hoạch thừa kế cho tương lai",
    icon: "Shield",
    count: 3,
    features: [
      "Bảo vệ trọn đời",
      "Tích lũy tài chính",
      "Quỹ hưu trí chất lượng",
      "Kế hoạch thừa kế",
    ],
  },
  {
    id: InsuranceCategory.TRAVEL,
    name: "Bảo hiểm Du lịch",
    description:
      "Bảo hiểm chuyến bay, du lịch quốc tế, visa Schengen, COVID-19",
    icon: "Plane",
    count: 3,
    features: [
      "Đáp ứng visa du lịch",
      "Bảo hiểm COVID-19",
      "Hỗ trợ 24/7 toàn cầu",
      "Chi trả viện phí quốc tế",
    ],
  },
  {
    id: InsuranceCategory.PROPERTY,
    name: "Bảo hiểm Tài sản",
    description: "Bảo hiểm nhà cửa, tài sản doanh nghiệp, cháy nổ, thiên tai",
    icon: "Home",
    count: 3,
    features: [
      "Bảo vệ nhà cửa tư nhiên",
      "Cháy nổ, sét đánh",
      "Thiên tai, bão lụt",
      "Trách nhiệm bên thứ ba",
    ],
  },
];

// ============================================================================
// Export Default Products and Categories
// ============================================================================

export default INSURANCE_PRODUCTS;
