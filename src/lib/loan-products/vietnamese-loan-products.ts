// Vietnamese Loan Products Database
// Comprehensive database of loan products from Vietnamese banks

/**
 * Vietnamese Bank Information
 */
export interface VietnameseBank {
  /** Bank code */
  code: string;
  /** Bank name in Vietnamese */
  nameVi: string;
  /** Bank name in English */
  nameEn: string;
  /** Bank logo URL */
  logo?: string;
  /** Bank website */
  website?: string;
  /** Bank hotline */
  hotline?: string;
  /** Bank type */
  type: "state" | "commercial" | "foreign" | "investment";
  /** Established year */
  establishedYear?: number;
}

/**
 * Interest Rate Types
 */
export type InterestRateType =
  | "fixed" // Lãi suất cố định
  | "reducing" // Lãi suất giảm dần
  | "flat" // Lãi suất phẳng
  | "floating"; // Lãi suất thả nổi

/**
 * Loan Types in Vietnamese Market
 */
export type VietnameseLoanType =
  | "home_loan" // Vay mua nhà
  | "auto_loan" // Vay mua xe
  | "consumer_loan" // Vay tiêu dùng
  | "business_loan" // Vay kinh doanh
  | "student_loan" // Vay sinh viên
  | "refinancing" // Vay tái cấp vốn
  | "credit_card" // Vay thẻ tín dụng
  | "mortgage_loan"; // Vay thế chấp

/**
 * Fee Structure
 */
export interface FeeStructure {
  /** Processing fee percentage */
  processingFee?: number;
  /** Processing fee fixed amount */
  processingFeeFixed?: number;
  /** Late payment fee percentage */
  latePaymentFee?: number;
  /** Early repayment fee percentage */
  earlyRepaymentFee?: number;
  /** Pre-payment fee fixed amount */
  prePaymentFeeFixed?: number;
  /** Monthly service fee */
  monthlyServiceFee?: number;
  /** Insurance fee */
  insuranceFee?: number;
  /** Other fees */
  otherFees?: Array<{
    name: string;
    nameVi: string;
    amount: number;
    type: "fixed" | "percentage";
    mandatory: boolean;
  }>;
}

/**
 * Eligibility Criteria
 */
export interface EligibilityCriteria {
  /** Minimum age */
  minAge: number;
  /** Maximum age at loan maturity */
  maxAgeAtMaturity: number;
  /** Minimum monthly income (VND) */
  minMonthlyIncome: number;
  /** Maximum monthly income (VND) */
  maxMonthlyIncome?: number;
  /** Minimum employment duration */
  minEmploymentDuration?: {
    months: number;
    years: number;
  };
  /** Required employment types */
  employmentTypes?: Array<
    "formal" | "informal" | "self_employed" | "business_owner"
  >;
  /** Credit score requirements */
  minCreditScore?: number;
  /** Debt-to-income ratio maximum */
  maxDebtToIncomeRatio?: number;
  /** Vietnamese citizenship requirement */
  vietnameseCitizen?: boolean;
  /** Required documents */
  requiredDocuments: Array<{
    type: string;
    typeVi: string;
    mandatory: boolean;
    description?: string;
    descriptionVi?: string;
  }>;
  /** Collateral requirements */
  collateralRequired?: boolean;
  /** Collateral types accepted */
  acceptedCollateralTypes?: Array<
    "real_estate" | "vehicle" | "savings_book" | "guarantor" | "other"
  >;
  /** Minimum collateral value */
  minCollateralValue?: number;
  /** Maximum loan-to-value ratio */
  maxLoanToValueRatio?: number;
}

/**
 * Loan Product Features
 */
export interface LoanProductFeatures {
  /** Online application available */
  onlineApplication: boolean;
  /** Fast approval available */
  fastApproval: boolean;
  /** Disbursement time */
  disbursementTime: {
    min: number; // in hours
    max: number; // in hours
    description: string;
    descriptionVi: string;
  };
  /** Flexible repayment options */
  flexibleRepayment: boolean;
  /** Grace period available */
  gracePeriodAvailable: boolean;
  /** Grace period duration */
  gracePeriod?: number; // in months
  /** Early repayment allowed */
  earlyRepaymentAllowed: boolean;
  /** Payment holidays available */
  paymentHolidaysAvailable: boolean;
  /** Mobile app support */
  mobileAppSupport: boolean;
  /** 24/7 customer service */
  support24_7: boolean;
  /** Special promotions */
  promotions?: Array<{
    name: string;
    nameVi: string;
    description: string;
    descriptionVi: string;
    validUntil: string;
    conditions?: string[];
    conditionsVi?: string[];
  }>;
}

/**
 * Vietnamese Loan Product
 */
export interface VietnameseLoanProduct {
  /** Unique product identifier */
  id: string;
  /** Product name in Vietnamese */
  nameVi: string;
  /** Product name in English */
  nameEn: string;
  /** Product description in Vietnamese */
  descriptionVi: string;
  /** Product description in English */
  descriptionEn: string;
  /** Bank information */
  bank: VietnameseBank;
  /** Loan type */
  loanType: VietnameseLoanType;
  /** Is this product currently active */
  active: boolean;
  /** Loan amount limits */
  amountLimits: {
    /** Minimum amount in VND */
    min: number;
    /** Maximum amount in VND */
    max: number;
    /** Default recommended amount */
    default: number;
    /** Amount increment step */
    step: number;
  };
  /** Loan term options */
  termOptions: {
    /** Minimum term in months */
    min: number;
    /** Maximum term in months */
    max: number;
    /** Available term options */
    availableTerms: number[];
    /** Default term */
    default: number;
  };
  /** Interest rate configuration */
  interestRate: {
    /** Annual interest rate percentage */
    annual: number;
    /** Promotional rate (if applicable) */
    promotional?: {
      rate: number;
      duration: number; // in months
      conditions?: string[];
      conditionsVi?: string[];
    };
    /** Interest rate type */
    type: InterestRateType;
    /** Interest calculation method */
    calculationMethod: "daily" | "monthly";
    /** Floating rate reference */
    floatingRateReference?: string;
  };
  /** Fee structure */
  fees: FeeStructure;
  /** Eligibility criteria */
  eligibility: EligibilityCriteria;
  /** Product features */
  features: LoanProductFeatures;
  /** Application requirements */
  applicationRequirements: {
    /** Minimum application processing time */
    processingTime: {
      min: number; // in days
      max: number; // in days
      description: string;
      descriptionVi: string;
    };
    /** Online application available */
    onlineApplication: boolean;
    /** Physical visit required */
    physicalVisitRequired: boolean;
    /** Credit check required */
    creditCheckRequired: boolean;
  };
  /** Special conditions */
  specialConditions?: {
    /** Specific professions eligible */
    targetProfessions?: string[];
    targetProfessionsVi?: string[];
    /** Geographic restrictions */
    geographicRestrictions?: string[];
    geographicRestrictionsVi?: string[];
    /** Priority sectors */
    prioritySectors?: string[];
    prioritySectorsVi?: string[];
  };
  /** Regulatory compliance */
  regulatoryCompliance: {
    /** State Bank registration number */
    sbvRegistrationNumber?: string;
    /** Consumer protection compliance */
    consumerProtectionCompliance: boolean;
    /** Data privacy compliance */
    dataPrivacyCompliance: boolean;
    /** Disclosure requirements met */
    disclosureRequirementsMet: boolean;
  };
  /** Product metadata */
  metadata: {
    /** Created at */
    createdAt: string;
    /** Updated at */
    updatedAt: string;
    /** Version */
    version: string;
    /** Product category */
    category: string;
    /** Tags */
    tags: string[];
    /** Featured product */
    featured: boolean;
    /** Popularity score */
    popularityScore: number;
    /** User ratings */
    averageRating?: number;
    /** Number of reviews */
    reviewCount?: number;
  };
}

/**
 * Vietnamese Banks Database
 */
export const vietnameseBanks: VietnameseBank[] = [
  {
    code: "VCB",
    nameVi: "Ngân hàng TMCP Ngoại thương Việt Nam",
    nameEn: "Vietcombank",
    type: "state",
    establishedYear: 1963,
    website: "https://www.vietcombank.com.vn",
    hotline: "1900 5454 13",
  },
  {
    code: "CTG",
    nameVi: "Ngân hàng TMCP Công Thương Việt Nam",
    nameEn: "VietinBank",
    type: "state",
    establishedYear: 1988,
    website: "https://www.vietinbank.vn",
    hotline: "1900 5588 68",
  },
  {
    code: "BIDV",
    nameVi: "Ngân hàng TMCP Đầu tư và Phát triển Việt Nam",
    nameEn: "BIDV",
    type: "state",
    establishedYear: 1957,
    website: "https://www.bidv.com.vn",
    hotline: "1900 9247",
  },
  {
    code: "AGR",
    nameVi: "Ngân hàng Nông nghiệp và Phát triển Nông thôn Việt Nam",
    nameEn: "Agribank",
    type: "state",
    establishedYear: 1988,
    website: "https://www.agribank.com.vn",
    hotline: "1900 5555 77",
  },
  {
    code: "TCB",
    nameVi: "Ngân hàng TMCP Kỹ thương Việt Nam",
    nameEn: "Techcombank",
    type: "commercial",
    establishedYear: 1993,
    website: "https://www.techcombank.com.vn",
    hotline: "1800 5888 22",
  },
  {
    code: "MB",
    nameVi: "Ngân hàng TMCP Quân đội",
    nameEn: "MB Bank",
    type: "commercial",
    establishedYear: 1994,
    website: "https://www.mb-bank.vn",
    hotline: "1900 5454 36",
  },
  {
    code: "VPB",
    nameVi: "Ngân hàng TMCP Tiên Phong",
    nameEn: "VPBank",
    type: "commercial",
    establishedYear: 1993,
    website: "https://www.vpbank.com.vn",
    hotline: "1900 5454 15",
  },
  {
    code: "STB",
    nameVi: "Ngân hàng TMCP Sài Gòn Thương Tín",
    nameEn: "Sacombank",
    type: "commercial",
    establishedYear: 1991,
    website: "https://www.sacombank.com.vn",
    hotline: "1900 5555 88",
  },
  {
    code: "ACB",
    nameVi: "Ngân hàng TMCP Á Châu",
    nameEn: "ACB",
    type: "commercial",
    establishedYear: 1993,
    website: "https://www.acb.com.vn",
    hotline: "1900 5454 33",
  },
  {
    code: "TPB",
    nameVi: "Ngân hàng TMCP Tiên Phong",
    nameEn: "TPBank",
    type: "commercial",
    establishedYear: 2008,
    website: "https://www.tpbank.vn",
    hotline: "1900 6066 88",
  },
];

/**
 * Vietnamese Loan Products Database
 */
export const vietnameseLoanProducts: VietnameseLoanProduct[] = [
  // Vietcombank Home Loans
  {
    id: "vcb-home-loan-1",
    nameVi: "Vay mua nhà - Bất động sản",
    nameEn: "Home Loan - Real Estate",
    descriptionVi:
      "Gói vay mua nhà, đất đai, căn hộ với lãi suất ưu đãi và thời gian vay lên đến 35 năm.",
    descriptionEn:
      "Home loan package for purchasing houses, land, and apartments with preferential interest rates and terms up to 35 years.",
    bank: vietnameseBanks.find((bank) => bank.code === "VCB")!,
    loanType: "home_loan",
    active: true,
    amountLimits: {
      min: 100000000, // 100 triệu VND
      max: 50000000000, // 50 tỷ VND
      default: 2000000000, // 2 tỷ VND
      step: 100000000, // 100 triệu VND
    },
    termOptions: {
      min: 12,
      max: 420, // 35 năm
      availableTerms: [12, 24, 36, 48, 60, 84, 120, 180, 240, 300, 360, 420],
      default: 240, // 20 năm
    },
    interestRate: {
      annual: 8.5,
      promotional: {
        rate: 7.5,
        duration: 12,
        conditions: ["For new customers", "Credit score > 700"],
        conditionsVi: ["Cho khách hàng mới", "Điểm tín dụng > 700"],
      },
      type: "fixed",
      calculationMethod: "monthly",
    },
    fees: {
      processingFee: 1.0,
      latePaymentFee: 0.05,
      earlyRepaymentFee: 2.0,
      insuranceFee: 0.2,
    },
    eligibility: {
      minAge: 18,
      maxAgeAtMaturity: 70,
      minMonthlyIncome: 15000000, // 15 triệu VND
      minEmploymentDuration: {
        months: 6,
        years: 0,
      },
      employmentTypes: ["formal", "self_employed"],
      minCreditScore: 600,
      maxDebtToIncomeRatio: 50,
      vietnameseCitizen: true,
      requiredDocuments: [
        {
          type: "national_id",
          typeVi: "CCCD/CMND",
          mandatory: true,
          description: "Valid national ID card",
          descriptionVi: "CCCD/CMND còn hiệu lực",
        },
        {
          type: "income_proof",
          typeVi: "Chứng minh thu nhập",
          mandatory: true,
          description: "Payslips or bank statements",
          descriptionVi: "Bảng lương hoặc sao kê tài khoản ngân hàng",
        },
        {
          type: "employment_contract",
          typeVi: "Hợp đồng lao động",
          mandatory: true,
          description: "Employment contract",
          descriptionVi: "Hợp đồng lao động",
        },
      ],
      collateralRequired: true,
      acceptedCollateralTypes: ["real_estate", "savings_book"],
      minCollateralValue: 1200000000, // 1.2 tỷ VND
      maxLoanToValueRatio: 80,
    },
    features: {
      onlineApplication: true,
      fastApproval: false,
      disbursementTime: {
        min: 72,
        max: 120,
        description: "3-5 business days",
        descriptionVi: "3-5 ngày làm việc",
      },
      flexibleRepayment: true,
      gracePeriodAvailable: true,
      gracePeriod: 6,
      earlyRepaymentAllowed: true,
      paymentHolidaysAvailable: false,
      mobileAppSupport: true,
      support24_7: true,
    },
    applicationRequirements: {
      processingTime: {
        min: 5,
        max: 7,
        description: "5-7 business days",
        descriptionVi: "5-7 ngày làm việc",
      },
      onlineApplication: true,
      physicalVisitRequired: true,
      creditCheckRequired: true,
    },
    specialConditions: {
      targetProfessions: [
        "Government employees",
        "Teachers",
        "Healthcare workers",
      ],
      targetProfessionsVi: ["Công chức", "Giáo viên", "Nhân viên y tế"],
    },
    regulatoryCompliance: {
      sbvRegistrationNumber: "VCB/QLNH/2024/12345",
      consumerProtectionCompliance: true,
      dataPrivacyCompliance: true,
      disclosureRequirementsMet: true,
    },
    metadata: {
      createdAt: "2024-01-15T00:00:00Z",
      updatedAt: "2024-11-01T00:00:00Z",
      version: "1.2.0",
      category: "home_loan",
      tags: ["home", "real_estate", "mortgage", "long_term"],
      featured: true,
      popularityScore: 95,
      averageRating: 4.7,
      reviewCount: 1250,
    },
  },

  // Techcombank Consumer Loan
  {
    id: "tcb-consumer-loan-1",
    nameVi: "Vay tiêu dùng không tài sản đảm bảo",
    nameEn: "Unsecured Consumer Loan",
    descriptionVi:
      "Gói vay tiêu dùng nhanh chóng, không cần tài sản đảm bảo, giải ngân trong 24 giờ.",
    descriptionEn:
      "Fast consumer loan without collateral requirements, disbursed within 24 hours.",
    bank: vietnameseBanks.find((bank) => bank.code === "TCB")!,
    loanType: "consumer_loan",
    active: true,
    amountLimits: {
      min: 20000000, // 20 triệu VND
      max: 500000000, // 500 triệu VND
      default: 100000000, // 100 triệu VND
      step: 10000000, // 10 triệu VND
    },
    termOptions: {
      min: 6,
      max: 60,
      availableTerms: [6, 9, 12, 18, 24, 36, 48, 60],
      default: 24,
    },
    interestRate: {
      annual: 12.5,
      promotional: {
        rate: 10.5,
        duration: 6,
        conditions: ["Techcombank salary account holders"],
        conditionsVi: ["Khách hàng có tài khoản lương tại Techcombank"],
      },
      type: "flat",
      calculationMethod: "monthly",
    },
    fees: {
      processingFeeFixed: 1500000, // 1.5 triệu VND
      latePaymentFee: 0.1,
      earlyRepaymentFee: 3.0,
    },
    eligibility: {
      minAge: 22,
      maxAgeAtMaturity: 60,
      minMonthlyIncome: 8000000, // 8 triệu VND
      maxMonthlyIncome: 50000000, // 50 triệu VND
      minEmploymentDuration: {
        months: 3,
        years: 0,
      },
      employmentTypes: ["formal"],
      minCreditScore: 650,
      maxDebtToIncomeRatio: 40,
      vietnameseCitizen: true,
      requiredDocuments: [
        {
          type: "national_id",
          typeVi: "CCCD/CMND",
          mandatory: true,
          description: "Valid national ID card",
          descriptionVi: "CCCD/CMND còn hiệu lực",
        },
        {
          type: "income_proof",
          typeVi: "Chứng minh thu nhập",
          mandatory: true,
          description: "3 months payslips",
          descriptionVi: "Bảng lương 3 tháng gần nhất",
        },
        {
          type: "bank_statement",
          typeVi: "Sao kê tài khoản ngân hàng",
          mandatory: true,
          description: "3 months bank statements",
          descriptionVi: "Sao kê tài khoản 3 tháng gần nhất",
        },
      ],
      collateralRequired: false,
    },
    features: {
      onlineApplication: true,
      fastApproval: true,
      disbursementTime: {
        min: 24,
        max: 48,
        description: "24-48 hours",
        descriptionVi: "24-48 giờ",
      },
      flexibleRepayment: true,
      gracePeriodAvailable: false,
      earlyRepaymentAllowed: true,
      paymentHolidaysAvailable: false,
      mobileAppSupport: true,
      support24_7: true,
    },
    applicationRequirements: {
      processingTime: {
        min: 1,
        max: 2,
        description: "1-2 business days",
        descriptionVi: "1-2 ngày làm việc",
      },
      onlineApplication: true,
      physicalVisitRequired: false,
      creditCheckRequired: true,
    },
    specialConditions: {
      targetProfessions: ["Techcombank customers", "Salary account holders"],
      targetProfessionsVi: [
        "Khách hàng Techcombank",
        "Người có tài khoản lương",
      ],
    },
    regulatoryCompliance: {
      sbvRegistrationNumber: "TCB/QLNH/2024/23456",
      consumerProtectionCompliance: true,
      dataPrivacyCompliance: true,
      disclosureRequirementsMet: true,
    },
    metadata: {
      createdAt: "2024-02-01T00:00:00Z",
      updatedAt: "2024-11-15T00:00:00Z",
      version: "1.1.0",
      category: "consumer_loan",
      tags: ["unsecured", "fast", "consumer", "short_term"],
      featured: true,
      popularityScore: 88,
      averageRating: 4.5,
      reviewCount: 890,
    },
  },

  // VPBank Auto Loan
  {
    id: "vpb-auto-loan-1",
    nameVi: "Vay mua ô tô",
    nameEn: "Car Loan",
    descriptionVi:
      "Gói vay mua ô tô mới và cũ với lãi suất cạnh tranh, hỗ trợ lên đến 85% giá trị xe.",
    descriptionEn:
      "Car loan package for new and used vehicles with competitive interest rates, supporting up to 85% of vehicle value.",
    bank: vietnameseBanks.find((bank) => bank.code === "VPB")!,
    loanType: "auto_loan",
    active: true,
    amountLimits: {
      min: 150000000, // 150 triệu VND
      max: 3000000000, // 3 tỷ VND
      default: 800000000, // 800 triệu VND
      step: 50000000, // 50 triệu VND
    },
    termOptions: {
      min: 12,
      max: 84,
      availableTerms: [12, 18, 24, 36, 48, 60, 72, 84],
      default: 48,
    },
    interestRate: {
      annual: 9.5,
      promotional: {
        rate: 8.5,
        duration: 12,
        conditions: ["New cars only", "VPBank customers"],
        conditionsVi: ["Chỉ áp dụng cho xe mới", "Khách hàng VPBank"],
      },
      type: "reducing",
      calculationMethod: "monthly",
    },
    fees: {
      processingFee: 1.5,
      latePaymentFee: 0.08,
      earlyRepaymentFee: 2.5,
      insuranceFee: 0.8,
    },
    eligibility: {
      minAge: 20,
      maxAgeAtMaturity: 65,
      minMonthlyIncome: 10000000, // 10 triệu VND
      minEmploymentDuration: {
        months: 6,
        years: 0,
      },
      employmentTypes: ["formal", "self_employed", "business_owner"],
      minCreditScore: 620,
      maxDebtToIncomeRatio: 45,
      vietnameseCitizen: true,
      requiredDocuments: [
        {
          type: "national_id",
          typeVi: "CCCD/CMND",
          mandatory: true,
          description: "Valid national ID card",
          descriptionVi: "CCCD/CMND còn hiệu lực",
        },
        {
          type: "driving_license",
          typeVi: "Bằng lái xe",
          mandatory: true,
          description: "Valid driving license",
          descriptionVi: "Bằng lái xe còn hiệu lực",
        },
        {
          type: "income_proof",
          typeVi: "Chứng minh thu nhập",
          mandatory: true,
          description: "Income proof documents",
          descriptionVi: "Chứng minh thu nhập",
        },
        {
          type: "vehicle_documents",
          typeVi: "Giấy tờ xe",
          mandatory: true,
          description: "Vehicle registration documents",
          descriptionVi: "Giấy đăng ký xe",
        },
      ],
      collateralRequired: true,
      acceptedCollateralTypes: ["vehicle"],
      maxLoanToValueRatio: 85,
    },
    features: {
      onlineApplication: true,
      fastApproval: false,
      disbursementTime: {
        min: 48,
        max: 72,
        description: "2-3 business days",
        descriptionVi: "2-3 ngày làm việc",
      },
      flexibleRepayment: true,
      gracePeriodAvailable: true,
      gracePeriod: 1,
      earlyRepaymentAllowed: true,
      paymentHolidaysAvailable: false,
      mobileAppSupport: true,
      support24_7: false,
      promotions: [
        {
          name: "New Car Special",
          nameVi: "Ưu đãi xe mới",
          description: "Reduced interest rates for new car purchases",
          descriptionVi: "Lãi suất ưu đãi cho xe mới",
          validUntil: "2024-12-31T23:59:59Z",
          conditions: ["New cars only", "Loan amount > 500M VND"],
          conditionsVi: ["Chỉ xe mới", "Số tiền vay > 500 triệu VND"],
        },
      ],
    },
    applicationRequirements: {
      processingTime: {
        min: 2,
        max: 4,
        description: "2-4 business days",
        descriptionVi: "2-4 ngày làm việc",
      },
      onlineApplication: true,
      physicalVisitRequired: true,
      creditCheckRequired: true,
    },
    specialConditions: {
      targetProfessions: ["Car dealers", "Corporate employees"],
      targetProfessionsVi: ["Đại lý xe", "Nhân viên công ty"],
    },
    regulatoryCompliance: {
      sbvRegistrationNumber: "VPB/QLNH/2024/34567",
      consumerProtectionCompliance: true,
      dataPrivacyCompliance: true,
      disclosureRequirementsMet: true,
    },
    metadata: {
      createdAt: "2024-01-20T00:00:00Z",
      updatedAt: "2024-10-15T00:00:00Z",
      version: "1.0.5",
      category: "auto_loan",
      tags: ["car", "vehicle", "auto", "transport"],
      featured: false,
      popularityScore: 75,
      averageRating: 4.3,
      reviewCount: 420,
    },
  },

  // ACB Student Loan
  {
    id: "acb-student-loan-1",
    nameVi: "Vay học sinh - sinh viên",
    nameEn: "Student Loan",
    descriptionVi:
      "Gói vay hỗ trợ học sinh, sinh viên chi trả học phí và chi phí sinh hoạt với lãi suất ưu đãi.",
    descriptionEn:
      "Student loan package supporting tuition fees and living expenses with preferential interest rates.",
    bank: vietnameseBanks.find((bank) => bank.code === "ACB")!,
    loanType: "student_loan",
    active: true,
    amountLimits: {
      min: 5000000, // 5 triệu VND
      max: 150000000, // 150 triệu VND
      default: 30000000, // 30 triệu VND
      step: 5000000, // 5 triệu VND
    },
    termOptions: {
      min: 12,
      max: 120,
      availableTerms: [12, 24, 36, 48, 60, 72, 84, 96, 120],
      default: 48,
    },
    interestRate: {
      annual: 7.0,
      promotional: {
        rate: 6.5,
        duration: 24,
        conditions: ["Excellent academic performance", "Low-income families"],
        conditionsVi: ["Học tập xuất sắc", "Hộ gia đình có thu nhập thấp"],
      },
      type: "fixed",
      calculationMethod: "monthly",
    },
    fees: {
      processingFee: 0.5,
      latePaymentFee: 0.03,
      earlyRepaymentFee: 0, // No early repayment fee
    },
    eligibility: {
      minAge: 16,
      maxAgeAtMaturity: 25,
      minMonthlyIncome: 0, // No income requirement for students
      employmentTypes: ["formal"], // For guarantor
      minCreditScore: 600, // For guarantor
      maxDebtToIncomeRatio: 60, // For guarantor
      vietnameseCitizen: true,
      requiredDocuments: [
        {
          type: "student_id",
          typeVi: "Thẻ sinh viên",
          mandatory: true,
          description: "Valid student ID",
          descriptionVi: "Thẻ sinh viên còn hiệu lực",
        },
        {
          type: "enrollment_proof",
          typeVi: "Giấy xác nhận nhập học",
          mandatory: true,
          description: "Proof of enrollment",
          descriptionVi: "Giấy xác nhận nhập học",
        },
        {
          type: "guarantor_documents",
          typeVi: "Giấy tờ người bảo lãnh",
          mandatory: true,
          description: "Guarantor's ID and income proof",
          descriptionVi: "CCCD và chứng minh thu nhập của người bảo lãnh",
        },
      ],
      collateralRequired: false,
    },
    features: {
      onlineApplication: true,
      fastApproval: false,
      disbursementTime: {
        min: 72,
        max: 120,
        description: "3-5 business days",
        descriptionVi: "3-5 ngày làm việc",
      },
      flexibleRepayment: true,
      gracePeriodAvailable: true,
      gracePeriod: 12, // 12 months grace period after graduation
      earlyRepaymentAllowed: true,
      paymentHolidaysAvailable: true,
      mobileAppSupport: true,
      support24_7: false,
    },
    applicationRequirements: {
      processingTime: {
        min: 3,
        max: 5,
        description: "3-5 business days",
        descriptionVi: "3-5 ngày làm việc",
      },
      onlineApplication: true,
      physicalVisitRequired: true,
      creditCheckRequired: true,
    },
    specialConditions: {
      targetProfessions: ["Students", "Parents"],
      targetProfessionsVi: ["Sinh viên", "Phụ huynh"],
      prioritySectors: ["Education", "Healthcare", "Technology"],
      prioritySectorsVi: ["Giáo dục", "Y tế", "Công nghệ"],
    },
    regulatoryCompliance: {
      sbvRegistrationNumber: "ACB/QLNH/2024/45678",
      consumerProtectionCompliance: true,
      dataPrivacyCompliance: true,
      disclosureRequirementsMet: true,
    },
    metadata: {
      createdAt: "2024-01-10T00:00:00Z",
      updatedAt: "2024-09-20T00:00:00Z",
      version: "1.3.0",
      category: "student_loan",
      tags: ["student", "education", "academic", "grace_period"],
      featured: true,
      popularityScore: 82,
      averageRating: 4.6,
      reviewCount: 680,
    },
  },

  // MB Bank Business Loan
  {
    id: "mb-business-loan-1",
    nameVi: "Vay kinh doanh Doanh nghiệp vừa và nhỏ",
    nameEn: "SME Business Loan",
    descriptionVi:
      "Gói vay vốn kinh doanh dành cho các doanh nghiệp vừa và nhỏ với thủ tục đơn giản, giải ngân nhanh.",
    descriptionEn:
      "Business capital loan for SMEs with simplified procedures and fast disbursement.",
    bank: vietnameseBanks.find((bank) => bank.code === "MB")!,
    loanType: "business_loan",
    active: true,
    amountLimits: {
      min: 100000000, // 100 triệu VND
      max: 5000000000, // 5 tỷ VND
      default: 1000000000, // 1 tỷ VND
      step: 50000000, // 50 triệu VND
    },
    termOptions: {
      min: 6,
      max: 60,
      availableTerms: [6, 12, 18, 24, 36, 48, 60],
      default: 24,
    },
    interestRate: {
      annual: 11.0,
      promotional: {
        rate: 9.5,
        duration: 12,
        conditions: ["MB Bank business account holders", "Export businesses"],
        conditionsVi: [
          "Khách hàng có tài khoản kinh doanh MB",
          "Doanh nghiệp xuất khẩu",
        ],
      },
      type: "reducing",
      calculationMethod: "monthly",
    },
    fees: {
      processingFee: 2.0,
      latePaymentFee: 0.1,
      earlyRepaymentFee: 3.0,
      insuranceFee: 0.3,
    },
    eligibility: {
      minAge: 22,
      maxAgeAtMaturity: 65,
      minMonthlyIncome: 20000000, // 20 triệu VND
      minEmploymentDuration: {
        months: 12,
        years: 0,
      },
      employmentTypes: ["business_owner", "self_employed"],
      minCreditScore: 650,
      maxDebtToIncomeRatio: 55,
      vietnameseCitizen: true,
      requiredDocuments: [
        {
          type: "business_registration",
          typeVi: "Giấy đăng ký kinh doanh",
          mandatory: true,
          description: "Business registration certificate",
          descriptionVi: "Giấy chứng nhận đăng ký kinh doanh",
        },
        {
          type: "financial_statements",
          typeVi: "Báo cáo tài chính",
          mandatory: true,
          description: "Last 2 years financial statements",
          descriptionVi: "Báo cáo tài chính 2 năm gần nhất",
        },
        {
          type: "tax_documents",
          typeVi: "Giấy tờ thuế",
          mandatory: true,
          description: "Tax clearance documents",
          descriptionVi: "Giấy xác nhận hoàn thành nghĩa vụ thuế",
        },
        {
          type: "business_plan",
          typeVi: "Kế hoạch kinh doanh",
          mandatory: true,
          description: "Business plan and loan utilization",
          descriptionVi: "Kế hoạch kinh doanh và mục đích sử dụng vốn",
        },
      ],
      collateralRequired: true,
      acceptedCollateralTypes: [
        "real_estate",
        "vehicle",
        "savings_book",
        "other",
      ],
      minCollateralValue: 200000000, // 200 triệu VND
      maxLoanToValueRatio: 70,
    },
    features: {
      onlineApplication: true,
      fastApproval: false,
      disbursementTime: {
        min: 72,
        max: 168,
        description: "3-7 business days",
        descriptionVi: "3-7 ngày làm việc",
      },
      flexibleRepayment: true,
      gracePeriodAvailable: true,
      gracePeriod: 3,
      earlyRepaymentAllowed: true,
      paymentHolidaysAvailable: false,
      mobileAppSupport: true,
      support24_7: false,
    },
    applicationRequirements: {
      processingTime: {
        min: 5,
        max: 10,
        description: "5-10 business days",
        descriptionVi: "5-10 ngày làm việc",
      },
      onlineApplication: true,
      physicalVisitRequired: true,
      creditCheckRequired: true,
    },
    specialConditions: {
      targetProfessions: ["SME owners", "Startups", "Export businesses"],
      targetProfessionsVi: [
        "Chủ doanh nghiệp vừa và nhỏ",
        "Khởi nghiệp",
        "Doanh nghiệp xuất khẩu",
      ],
      prioritySectors: ["Manufacturing", "Agriculture", "Technology", "Export"],
      prioritySectorsVi: ["Sản xuất", "Nông nghiệp", "Công nghệ", "Xuất khẩu"],
    },
    regulatoryCompliance: {
      sbvRegistrationNumber: "MB/QLNH/2024/56789",
      consumerProtectionCompliance: true,
      dataPrivacyCompliance: true,
      disclosureRequirementsMet: true,
    },
    metadata: {
      createdAt: "2024-01-25T00:00:00Z",
      updatedAt: "2024-11-10T00:00:00Z",
      version: "1.2.5",
      category: "business_loan",
      tags: ["business", "sme", "commercial", "working_capital"],
      featured: true,
      popularityScore: 79,
      averageRating: 4.4,
      reviewCount: 320,
    },
  },
];

/**
 * Helper functions for loan products
 */

/**
 * Get loan products by loan type
 */
export function getLoanProductsByType(
  loanType: VietnameseLoanType,
): VietnameseLoanProduct[] {
  return vietnameseLoanProducts.filter(
    (product) => product.loanType === loanType && product.active,
  );
}

/**
 * Get loan products by bank
 */
export function getLoanProductsByBank(
  bankCode: string,
): VietnameseLoanProduct[] {
  return vietnameseLoanProducts.filter(
    (product) => product.bank.code === bankCode && product.active,
  );
}

/**
 * Get featured loan products
 */
export function getFeaturedLoanProducts(): VietnameseLoanProduct[] {
  return vietnameseLoanProducts.filter(
    (product) => product.metadata.featured && product.active,
  );
}

/**
 * Get loan products by amount range
 */
export function getLoanProductsByAmount(
  amount: number,
): VietnameseLoanProduct[] {
  return vietnameseLoanProducts.filter(
    (product) =>
      product.active &&
      amount >= product.amountLimits.min &&
      amount <= product.amountLimits.max,
  );
}

/**
 * Get loan products by term
 */
export function getLoanProductsByTerm(term: number): VietnameseLoanProduct[] {
  return vietnameseLoanProducts.filter(
    (product) =>
      product.active &&
      term >= product.termOptions.min &&
      term <= product.termOptions.max,
  );
}

/**
 * Search loan products by keywords
 */
export function searchLoanProducts(keywords: string): VietnameseLoanProduct[] {
  const lowerKeywords = keywords.toLowerCase();
  return vietnameseLoanProducts.filter(
    (product) =>
      product.active &&
      (product.nameVi.toLowerCase().includes(lowerKeywords) ||
        product.nameEn.toLowerCase().includes(lowerKeywords) ||
        product.descriptionVi.toLowerCase().includes(lowerKeywords) ||
        product.descriptionEn.toLowerCase().includes(lowerKeywords) ||
        product.metadata.tags.some((tag) =>
          tag.toLowerCase().includes(lowerKeywords),
        )),
  );
}

/**
 * Sort loan products by criteria
 */
export function sortLoanProducts(
  products: VietnameseLoanProduct[],
  sortBy:
    | "interest_rate"
    | "popularity"
    | "processing_time"
    | "max_amount"
    | "rating" = "interest_rate",
): VietnameseLoanProduct[] {
  const sorted = [...products];

  switch (sortBy) {
    case "interest_rate":
      return sorted.sort(
        (a, b) => a.interestRate.annual - b.interestRate.annual,
      );
    case "popularity":
      return sorted.sort(
        (a, b) => b.metadata.popularityScore - a.metadata.popularityScore,
      );
    case "processing_time":
      return sorted.sort(
        (a, b) =>
          a.applicationRequirements.processingTime.min -
          b.applicationRequirements.processingTime.min,
      );
    case "max_amount":
      return sorted.sort((a, b) => b.amountLimits.max - a.amountLimits.max);
    case "rating":
      return sorted.sort(
        (a, b) =>
          (b.metadata.averageRating || 0) - (a.metadata.averageRating || 0),
      );
    default:
      return sorted;
  }
}

/**
 * Get Vietnamese loan type name in Vietnamese
 */
export function getVietnameseLoanTypeName(
  loanType: VietnameseLoanType,
): string {
  const typeNames: Record<VietnameseLoanType, string> = {
    home_loan: "Vay mua nhà",
    auto_loan: "Vay mua xe",
    consumer_loan: "Vay tiêu dùng",
    business_loan: "Vay kinh doanh",
    student_loan: "Vay sinh viên",
    refinancing: "Vay tái cấp vốn",
    credit_card: "Vay thẻ tín dụng",
    mortgage_loan: "Vay thế chấp",
  };
  return typeNames[loanType] || loanType;
}

/**
 * Get Vietnamese loan type name in English
 */
export function getEnglishLoanTypeName(loanType: VietnameseLoanType): string {
  const typeNames: Record<VietnameseLoanType, string> = {
    home_loan: "Home Loan",
    auto_loan: "Auto Loan",
    consumer_loan: "Consumer Loan",
    business_loan: "Business Loan",
    student_loan: "Student Loan",
    refinancing: "Refinancing",
    credit_card: "Credit Card Loan",
    mortgage_loan: "Mortgage Loan",
  };
  return typeNames[loanType] || loanType;
}
