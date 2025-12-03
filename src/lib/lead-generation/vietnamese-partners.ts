/**
 * Vietnamese Financial Partners Database
 * Comprehensive database of Vietnamese banks, financial institutions, and lending partners
 */

export interface VietnameseFinancialPartner {
  id: string;
  name: string;
  nameVI: string;
  type: PartnerType;
  subtype?: PartnerSubtype;
  code: string; // Bank code or partner identifier
  logo?: string;
  website?: string;
  description?: string;
  descriptionVI?: string;

  // Contact and Integration
  contact: {
    phone?: string;
    email?: string;
    address?: string;
    headquarters?: string;
    hotlines?: string[];
  };

  integration: {
    apiAvailable: boolean;
    webhookSupported: boolean;
    integrationStatus: 'active' | 'testing' | 'pending' | 'inactive';
    lastSync?: Date;
    apiKey?: string;
    webhookUrl?: string;
  };

  // Geographic Coverage
  coverage: {
    national: boolean;
    provinces: string[]; // Province codes
    regions: string[]; // North, Central, South, etc.
    urbanOnly?: boolean;
    ruralOnly?: boolean;
    specialZones?: string[]; // Special economic zones
  };

  // Loan Specializations
  specializations: {
    loanTypes: LoanType[];
    minAmount: number;
    maxAmount: number;
    targetSegments: string[]; // SME, individual, corporate, etc.
    creditScoreMin?: number;
    creditScoreMax?: number;
    interestRateRange: {
      min: number;
      max: number;
    };
    processingTime: {
      min: number; // days
      max: number; // days
    };
  };

  // Capacity and Performance
  capacity: {
    maxDailyLeads: number;
    currentWorkload: number;
    averageResponseTime: number; // hours
    conversionRate: number; // percentage
    approvalRate: number; // percentage
    averageLoanSize: number;
    customerSatisfaction: number; // 1-5 rating
  };

  // Compliance and Licensing
  compliance: {
    licensedBy: string[]; // SBV, Ministry of Finance, etc.
    licenseNumber?: string;
    licenseExpiry?: Date;
    regulatoryStatus: 'active' | 'suspended' | 'under_review';
    complianceScore: number; // 1-100
    lastAuditDate?: Date;
  };

  // Business Details
  business: {
    establishedYear: number;
    totalAssets?: number; // VND
    marketShare?: number; // percentage
    employeeCount?: number;
    branchCount?: number;
    atmCount?: number;
    parentCompany?: string;
    subsidiaries?: string[];
  };

  // Lead Forwarding Configuration
  leadForwarding: {
    autoAcceptEnabled: boolean;
    acceptanceCriteria: {
      minScore: number;
      requiredFields: string[];
      excludedProvinces?: string[];
      maxLoanAmount?: number;
      minIncomeLevel?: number;
    };
    forwardingMethod: 'api' | 'email' | 'webhook' | 'manual';
    format: 'json' | 'xml' | 'csv' | 'custom';
    encryption: boolean;
    priority: number; // 1-10, higher = higher priority
  };

  // Performance Tracking
  performance: {
    totalLeadsReceived: number;
    leadsThisMonth: number;
    leadsLastMonth: number;
    conversionThisMonth: number;
    conversionLastMonth: number;
    averageTimeToContact: number; // hours
    rejectionReasons: Array<{
      reason: string;
      count: number;
      percentage: number;
    }>;
  };

  // Metadata
  metadata: {
    active: boolean;
    featured: boolean;
    verified: boolean;
    createdAt: Date;
    updatedAt: Date;
    notes?: string;
    tags: string[];
  };
}

export enum PartnerType {
  COMMERCIAL_BANK = 'commercial_bank',
  STATE_BANK = 'state_bank',
  FOREIGN_BANK = 'foreign_bank',
  INVESTMENT_BANK = 'investment_bank',
  FINANCE_COMPANY = 'finance_company',
  FINTECH = 'fintech',
  P2P_LENDING = 'p2p_lending',
  MICROFINANCE = 'microfinance',
  CREDIT_UNION = 'credit_union',
  CONSUMER_FINANCE = 'consumer_finance',
  MORTGAGE_FINANCE = 'mortgage_finance',
  AUTO_FINANCE = 'auto_finance',
  AGRICULTURAL_FINANCE = 'agricultural_finance',
}

export enum PartnerSubtype {
  // Banks
  BIG_FOUR = 'big_four', // Vietcombank, VietinBank, BIDV, Agribank
  STATE_OWNED = 'state_owned',
  JOINT_STOCK = 'joint_stock',
  FOREIGN_BANK_BRANCH = 'foreign_bank_branch',

  // Finance Companies
  CONSUMER_Finance = 'consumer_finance',
  INVESTMENT_FINANCE = 'investment_finance',
  SECURITIES = 'securities',
  INSURANCE = 'insurance',

  // Fintech
  DIGITAL_WALLET = 'digital_wallet',
  P2P_PLATFORM = 'p2p_platform',
  CREDIT_SCORING = 'credit_scoring',
  PAYMENT_GATEWAY = 'payment_gateway',
}

export enum LoanType {
  PERSONAL_LOAN = 'personal_loan',
  BUSINESS_LOAN = 'business_loan',
  MORTGAGE_LOAN = 'mortgage_loan',
  AUTO_LOAN = 'auto_loan',
  CREDIT_CARD = 'credit_card',
  AGRICULTURAL_LOAN = 'agricultural_loan',
  STUDENT_LOAN = 'student_loan',
  HOME_EQUITY = 'home_equity',
  DEBT_CONSOLIDATION = 'debt_consolidation',
  WORKING_CAPITAL = 'working_capital',
  EQUIPMENT_FINANCING = 'equipment_financing',
  INVOICE_FINANCING = 'invoice_financing',
  TRADE_FINANCE = 'trade_finance',
  CONSTRUCTION_LOAN = 'construction_loan',
  SME_LOAN = 'sme_loan',
  STARTUP_LOAN = 'startup_loan',
}

export enum VietnameseProvince {
  // North Vietnam
  HANOI = '01',
  HO_CHI_MINH_CITY = '79',
  HAIPHONG = '30',
  DA_NANG = '48',
  CAN_THO = '92',
  AN_GIANG = '89',
  BA_RIA_VUNG_TAU = '77',
  BAC_GIANG = '54',
  BAC_KAN = '56',
  BAC_LIEU = '95',
  BAC_NINH = '55',
  BEN_TRE = '83',
  BINH_DINH = '46',
  BINH_DUONG = '74',
  BINH_PHUOC = '70',
  BINH_THUAN = '66',
  CA_MAU = '96',
  CAO_BANG = '52',
  DA_KLAK = '66',
  DAK_NONG = '72',
  DIEN_BIEN = '50',
  DONG_NAI = '71',
  DONG_THAP = '87',
  GIA_LAI = '64',
  HA_GIANG = '51',
  HA_NAM = '63',
  HA_TINH = '61',
  HAI_DUONG = '60',
  HAU_GIANG = '93',
  HOA_BINH = '62',
  HUNG_YEN = '65',
  KHANH_HOA = '58',
  KIEN_GIANG = '88',
  KON_TUM = '58',
  LAI_CHAU = '49',
  LAM_DONG = '68',
  LANG_SON = '53',
  LAO_CAI = '45',
  LONG_AN = '80',
  NAM_DINH = '67',
  NGHE_AN = '59',
  NINH_BINH = '68',
  NINH_THUAN = '67',
  PHU_THO = '69',
  PHU_YEN = '62',
  QUANG_BINH = '57',
  QUANG_NAM = '55',
  QUANG_NINH = '56',
  QUANG_TRI = '59',
  SOC_TRANG = '94',
  SON_LA = '48',
  TAY_NINH = '75',
  THAI_BINH = '64',
  THAI_NGUYEN = '57',
  THANH_HOA = '58',
  THUA_THIEN_HUE = '54',
  TIEN_GIANG = '82',
  TRA_VINH = '85',
  TUYEN_QUANG = '52',
  VINH_LONG = '81',
  VINH_PHUC = '66',
  YEN_BAI = '47',
}

export const VIETNAMESE_REGIONS = {
  NORTH: ['north', 'miền_bắc'],
  CENTRAL: ['central', 'miền_trung'],
  SOUTH: ['south', 'miền_nam'],
  HIGHLANDS: ['highlands', 'tây_nguyên'],
  MEKONG_DELTA: ['mekong_delta', 'đồng_bằng_sông_cửu_long'],
} as const;

export const VIETNAMESE_PROVINCE_NAMES: Record<string, { vi: string; en: string; region: keyof typeof VIETNAMESE_REGIONS }> = {
  '01': { vi: 'Hà Nội', en: 'Hanoi', region: 'NORTH' },
  '79': { vi: 'Thành phố Hồ Chí Minh', en: 'Ho Chi Minh City', region: 'SOUTH' },
  '30': { vi: 'Hải Phòng', en: 'Haiphong', region: 'NORTH' },
  '48': { vi: 'Đà Nẵng', en: 'Da Nang', region: 'CENTRAL' },
  '92': { vi: 'Cần Thơ', en: 'Can Tho', region: 'MEKONG_DELTA' },
  // Add all 63 provinces...
};

/**
 * Vietnamese Financial Partners Database
 */
export const VIETNAMESE_FINANCIAL_PARTNERS: VietnameseFinancialPartner[] = [
  // Big Four Commercial Banks
  {
    id: 'vcb',
    name: 'Vietcombank',
    nameVI: 'Ngân hàng TMCP Ngoại thương Việt Nam',
    type: PartnerType.COMMERCIAL_BANK,
    subtype: PartnerSubtype.BIG_FOUR,
    code: 'VCB',
    logo: '/partners/vcb-logo.png',
    website: 'https://vcb.com.vn',
    description: 'Vietnam Commercial Bank for Foreign Trade',
    descriptionVI: 'Ngân hàng TMCP Ngoại thương Việt Nam',

    contact: {
      phone: '024 3934 5555',
      email: 'support@vcb.com.vn',
      address: '198 Trần Quang Khải, Hoàn Kiếm, Hà Nội',
      headquarters: '198 Trần Quang Khải, Hoàn Kiếm, Hà Nội',
      hotlines: ['1800 8080'],
    },

    integration: {
      apiAvailable: true,
      webhookSupported: true,
      integrationStatus: 'active',
      lastSync: new Date(),
      encryption: true,
    },

    coverage: {
      national: true,
      provinces: Object.keys(VIETNAMESE_PROVINCE_NAMES),
      regions: ['north', 'central', 'south'],
    },

    specializations: {
      loanTypes: [
        LoanType.PERSONAL_LOAN,
        LoanType.BUSINESS_LOAN,
        LoanType.MORTGAGE_LOAN,
        LoanType.AUTO_LOAN,
        LoanType.SME_LOAN,
      ],
      minAmount: 10000000, // 10 million VND
      maxAmount: 50000000000, // 50 billion VND
      targetSegments: ['individual', 'sme', 'corporate'],
      creditScoreMin: 650,
      interestRateRange: {
        min: 6.5,
        max: 12.0,
      },
      processingTime: {
        min: 3,
        max: 7,
      },
    },

    capacity: {
      maxDailyLeads: 500,
      currentWorkload: 320,
      averageResponseTime: 4,
      conversionRate: 28.5,
      approvalRate: 75.2,
      averageLoanSize: 250000000, // 250 million VND
      customerSatisfaction: 4.2,
    },

    compliance: {
      licensedBy: ['State Bank of Vietnam'],
      licenseNumber: '123/GP-NHNN',
      licenseExpiry: new Date('2025-12-31'),
      regulatoryStatus: 'active',
      complianceScore: 95,
      lastAuditDate: new Date('2024-06-15'),
    },

    business: {
      establishedYear: 1963,
      totalAssets: 1500000000000000, // 1.5 quadrillion VND
      marketShare: 12.5,
      employeeCount: 25000,
      branchCount: 600,
      atmCount: 1800,
    },

    leadForwarding: {
      autoAcceptEnabled: true,
      acceptanceCriteria: {
        minScore: 70,
        requiredFields: ['fullName', 'nationalId', 'income', 'loanAmount'],
        maxLoanAmount: 50000000000,
        minIncomeLevel: 5000000, // 5 million VND/month
      },
      forwardingMethod: 'api',
      format: 'json',
      encryption: true,
      priority: 9,
    },

    performance: {
      totalLeadsReceived: 125000,
      leadsThisMonth: 8500,
      leadsLastMonth: 8200,
      conversionThisMonth: 2422,
      conversionLastMonth: 2310,
      averageTimeToContact: 4.2,
      rejectionReasons: [
        { reason: 'Low credit score', count: 2800, percentage: 32.9 },
        { reason: 'Insufficient income', count: 2100, percentage: 24.7 },
        { reason: 'Incomplete documentation', count: 1500, percentage: 17.6 },
        { reason: 'High debt ratio', count: 1200, percentage: 14.1 },
        { reason: 'Other', count: 900, percentage: 10.7 },
      ],
    },

    metadata: {
      active: true,
      featured: true,
      verified: true,
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date(),
      tags: ['big_four', 'reliable', 'nationwide', 'digital_banking'],
    },
  },

  // VietinBank
  {
    id: 'ctg',
    name: 'VietinBank',
    nameVI: 'Ngân hàng TMCP Công Thương Việt Nam',
    type: PartnerType.COMMERCIAL_BANK,
    subtype: PartnerSubtype.BIG_FOUR,
    code: 'CTG',
    logo: '/partners/ctg-logo.png',
    website: 'https://vietinbank.vn',

    contact: {
      phone: '024 3942 5555',
      email: 'info@vietinbank.vn',
      address: 'Trần Quang Khải, Hoàn Kiếm, Hà Nội',
    },

    integration: {
      apiAvailable: true,
      webhookSupported: true,
      integrationStatus: 'active',
      lastSync: new Date(),
    },

    coverage: {
      national: true,
      provinces: Object.keys(VIETNAMESE_PROVINCE_NAMES),
      regions: ['north', 'central', 'south'],
    },

    specializations: {
      loanTypes: [
        LoanType.PERSONAL_LOAN,
        LoanType.BUSINESS_LOAN,
        LoanType.MORTGAGE_LOAN,
        LoanType.SME_LOAN,
        LoanType.CREDIT_CARD,
      ],
      minAmount: 20000000,
      maxAmount: 30000000000,
      targetSegments: ['individual', 'sme', 'corporate'],
      creditScoreMin: 600,
      interestRateRange: {
        min: 7.0,
        max: 13.5,
      },
      processingTime: {
        min: 5,
        max: 10,
      },
    },

    capacity: {
      maxDailyLeads: 400,
      currentWorkload: 280,
      averageResponseTime: 5,
      conversionRate: 25.8,
      approvalRate: 72.1,
      averageLoanSize: 200000000,
      customerSatisfaction: 4.0,
    },

    compliance: {
      licensedBy: ['State Bank of Vietnam'],
      licenseNumber: '456/GP-NHNN',
      licenseExpiry: new Date('2025-12-31'),
      regulatoryStatus: 'active',
      complianceScore: 92,
      lastAuditDate: new Date('2024-05-20'),
    },

    business: {
      establishedYear: 1988,
      totalAssets: 1200000000000000,
      marketShare: 10.2,
      employeeCount: 22000,
      branchCount: 550,
      atmCount: 1600,
    },

    leadForwarding: {
      autoAcceptEnabled: true,
      acceptanceCriteria: {
        minScore: 65,
        requiredFields: ['fullName', 'nationalId', 'income', 'loanAmount'],
        maxLoanAmount: 30000000000,
        minIncomeLevel: 4000000,
      },
      forwardingMethod: 'api',
      format: 'json',
      encryption: true,
      priority: 8,
    },

    performance: {
      totalLeadsReceived: 98000,
      leadsThisMonth: 6800,
      leadsLastMonth: 6500,
      conversionThisMonth: 1754,
      conversionLastMonth: 1677,
      averageTimeToContact: 5.1,
      rejectionReasons: [
        { reason: 'Low credit score', count: 2400, percentage: 35.3 },
        { reason: 'Insufficient income', count: 1800, percentage: 26.5 },
        { reason: 'Incomplete documentation', count: 1200, percentage: 17.6 },
        { reason: 'High debt ratio', count: 900, percentage: 13.2 },
        { reason: 'Other', count: 500, percentage: 7.4 },
      ],
    },

    metadata: {
      active: true,
      featured: true,
      verified: true,
      createdAt: new Date('2024-01-20'),
      updatedAt: new Date(),
      tags: ['big_four', 'reliable', 'nationwide', 'business_focus'],
    },
  },

  // BIDV
  {
    id: 'bvb',
    name: 'BIDV',
    nameVI: 'Ngân hàng TMCP Đầu tư và Phát triển Việt Nam',
    type: PartnerType.COMMERCIAL_BANK,
    subtype: PartnerSubtype.BIG_FOUR,
    code: 'BVB',
    logo: '/partners/bidv-logo.png',
    website: 'https://bidv.com.vn',

    contact: {
      phone: '024 3945 5555',
      email: 'info@bidv.com.vn',
      address: '193 Bà Triệu, Hai Bà Trưng, Hà Nội',
    },

    integration: {
      apiAvailable: true,
      webhookSupported: true,
      integrationStatus: 'active',
      lastSync: new Date(),
    },

    coverage: {
      national: true,
      provinces: Object.keys(VIETNAMESE_PROVINCE_NAMES),
      regions: ['north', 'central', 'south'],
    },

    specializations: {
      loanTypes: [
        LoanType.BUSINESS_LOAN,
        LoanType.SME_LOAN,
        LoanType.MORTGAGE_LOAN,
        LoanType.CONSTRUCTION_LOAN,
        LoanType.WORKING_CAPITAL,
        LoanType.EQUIPMENT_FINANCING,
      ],
      minAmount: 50000000,
      maxAmount: 100000000000,
      targetSegments: ['sme', 'corporate', 'construction'],
      creditScoreMin: 620,
      interestRateRange: {
        min: 6.8,
        max: 12.5,
      },
      processingTime: {
        min: 7,
        max: 14,
      },
    },

    capacity: {
      maxDailyLeads: 350,
      currentWorkload: 250,
      averageResponseTime: 6,
      conversionRate: 23.2,
      approvalRate: 68.5,
      averageLoanSize: 400000000,
      customerSatisfaction: 3.9,
    },

    compliance: {
      licensedBy: ['State Bank of Vietnam'],
      licenseNumber: '789/GP-NHNN',
      licenseExpiry: new Date('2025-12-31'),
      regulatoryStatus: 'active',
      complianceScore: 90,
      lastAuditDate: new Date('2024-04-10'),
    },

    business: {
      establishedYear: 1957,
      totalAssets: 1600000000000000,
      marketShare: 13.8,
      employeeCount: 28000,
      branchCount: 650,
      atmCount: 2000,
    },

    leadForwarding: {
      autoAcceptEnabled: true,
      acceptanceCriteria: {
        minScore: 68,
        requiredFields: ['fullName', 'nationalId', 'income', 'businessDocuments'],
        maxLoanAmount: 100000000000,
        minIncomeLevel: 6000000,
      },
      forwardingMethod: 'api',
      format: 'json',
      encryption: true,
      priority: 8,
    },

    performance: {
      totalLeadsReceived: 87000,
      leadsThisMonth: 6200,
      leadsLastMonth: 5900,
      conversionThisMonth: 1438,
      conversionLastMonth: 1369,
      averageTimeToContact: 6.3,
      rejectionReasons: [
        { reason: 'Insufficient collateral', count: 2200, percentage: 35.5 },
        { reason: 'Low credit score', count: 1800, percentage: 29.0 },
        { reason: 'Weak business plan', count: 1200, percentage: 19.4 },
        { reason: 'Incomplete documentation', count: 600, percentage: 9.7 },
        { reason: 'Other', count: 400, percentage: 6.4 },
      ],
    },

    metadata: {
      active: true,
      featured: true,
      verified: true,
      createdAt: new Date('2024-01-18'),
      updatedAt: new Date(),
      tags: ['big_four', 'business_focus', 'investment', 'infrastructure'],
    },
  },

  // HD Saison (Consumer Finance)
  {
    id: 'hdsaison',
    name: 'HD Saison',
    nameVI: 'Công ty TNHH MTV Tài chính HD Saison',
    type: PartnerType.CONSUMER_FINANCE,
    subtype: PartnerSubtype.CONSUMER_Finance,
    code: 'HD_SAISON',
    logo: '/partners/hd-saison-logo.png',
    website: 'https://hdsaison.com.vn',

    contact: {
      phone: '028 3864 6688',
      email: 'chamsockhachhang@hdsaison.com.vn',
      address: 'Tầng 10, Tòa nhà Pearl Plaza, 561A Điện Biên Phủ, P.25, Q.Bình Thạnh, TP.HCM',
    },

    integration: {
      apiAvailable: true,
      webhookSupported: true,
      integrationStatus: 'active',
      lastSync: new Date(),
    },

    coverage: {
      national: true,
      provinces: Object.keys(VIETNAMESE_PROVINCE_NAMES),
      regions: ['north', 'central', 'south'],
      urbanOnly: false,
      ruralOnly: false,
    },

    specializations: {
      loanTypes: [
        LoanType.PERSONAL_LOAN,
        LoanType.CREDIT_CARD,
        LoanType.AUTO_LOAN,
        LoanType.HOME_EQUITY,
        LoanType.DEBT_CONSOLIDATION,
      ],
      minAmount: 5000000,
      maxAmount: 200000000,
      targetSegments: ['individual', 'salaried_workers', 'government_employees'],
      creditScoreMin: 580,
      interestRateRange: {
        min: 12.0,
        max: 29.5,
      },
      processingTime: {
        min: 1,
        max: 3,
      },
    },

    capacity: {
      maxDailyLeads: 1000,
      currentWorkload: 750,
      averageResponseTime: 2,
      conversionRate: 35.6,
      approvalRate: 65.2,
      averageLoanSize: 80000000,
      customerSatisfaction: 4.1,
    },

    compliance: {
      licensedBy: ['State Bank of Vietnam'],
      licenseNumber: '123/GP-NHNN',
      licenseExpiry: new Date('2025-06-30'),
      regulatoryStatus: 'active',
      complianceScore: 88,
      lastAuditDate: new Date('2024-03-15'),
    },

    business: {
      establishedYear: 2007,
      totalAssets: 25000000000000,
      marketShare: 8.5,
      employeeCount: 8000,
      branchCount: 350,
      parentCompany: 'HDBank',
    },

    leadForwarding: {
      autoAcceptEnabled: true,
      acceptanceCriteria: {
        minScore: 60,
        requiredFields: ['fullName', 'nationalId', 'phoneNumber', 'monthlyIncome'],
        maxLoanAmount: 200000000,
        minIncomeLevel: 3000000,
      },
      forwardingMethod: 'api',
      format: 'json',
      encryption: true,
      priority: 7,
    },

    performance: {
      totalLeadsReceived: 186000,
      leadsThisMonth: 12400,
      leadsLastMonth: 11800,
      conversionThisMonth: 4414,
      conversionLastMonth: 4200,
      averageTimeToContact: 2.1,
      rejectionReasons: [
        { reason: 'Low monthly income', count: 3200, percentage: 25.8 },
        { reason: 'Poor employment history', count: 2800, percentage: 22.6 },
        { reason: 'High existing debt', count: 2400, percentage: 19.4 },
        { reason: 'Negative credit history', count: 2000, percentage: 16.1 },
        { reason: 'Other', count: 2000, percentage: 16.1 },
      ],
    },

    metadata: {
      active: true,
      featured: true,
      verified: true,
      createdAt: new Date('2024-02-01'),
      updatedAt: new Date(),
      tags: ['consumer_finance', 'fast_approval', 'high_volume', 'credit_card'],
    },
  },

  // FE Credit (Consumer Finance)
  {
    id: 'fecredit',
    name: 'FE Credit',
    nameVI: 'Công ty TNHH MTV Tài chính tiêu dùng FE Credit',
    type: PartnerType.CONSUMER_FINANCE,
    subtype: PartnerSubtype.CONSUMER_Finance,
    code: 'FE_CREDIT',
    logo: '/partners/fe-credit-logo.png',
    website: 'https://fecredit.com.vn',

    contact: {
      phone: '028 3865 0660',
      email: 'hotline@fecredit.com.vn',
      address: 'Tầng 12, Tòa nhà Bitexco Financial Tower, 02 Hải Triều, Q.1, TP.HCM',
    },

    integration: {
      apiAvailable: true,
      webhookSupported: true,
      integrationStatus: 'active',
      lastSync: new Date(),
    },

    coverage: {
      national: true,
      provinces: Object.keys(VIETNAMESE_PROVINCE_NAMES),
      regions: ['north', 'central', 'south'],
    },

    specializations: {
      loanTypes: [
        LoanType.PERSONAL_LOAN,
        LoanType.CREDIT_CARD,
        LoanType.AUTO_LOAN,
        LoanType.HOME_EQUITY,
        LoanType.DEBT_CONSOLIDATION,
      ],
      minAmount: 10000000,
      maxAmount: 300000000,
      targetSegments: ['individual', 'salaried_workers', 'self_employed'],
      creditScoreMin: 550,
      interestRateRange: {
        min: 15.0,
        max: 35.0,
      },
      processingTime: {
        min: 0.5,
        max: 2,
      },
    },

    capacity: {
      maxDailyLeads: 1500,
      currentWorkload: 1200,
      averageResponseTime: 1,
      conversionRate: 32.8,
      approvalRate: 58.4,
      averageLoanSize: 95000000,
      customerSatisfaction: 3.7,
    },

    compliance: {
      licensedBy: ['State Bank of Vietnam'],
      licenseNumber: '456/GP-NHNN',
      licenseExpiry: new Date('2025-09-30'),
      regulatoryStatus: 'active',
      complianceScore: 85,
      lastAuditDate: new Date('2024-02-28'),
    },

    business: {
      establishedYear: 2008,
      totalAssets: 35000000000000,
      marketShare: 12.2,
      employeeCount: 12000,
      branchCount: 450,
      parentCompany: 'VPBank',
    },

    leadForwarding: {
      autoAcceptEnabled: true,
      acceptanceCriteria: {
        minScore: 55,
        requiredFields: ['fullName', 'nationalId', 'phoneNumber', 'monthlyIncome'],
        maxLoanAmount: 300000000,
        minIncomeLevel: 3500000,
      },
      forwardingMethod: 'api',
      format: 'json',
      encryption: true,
      priority: 7,
    },

    performance: {
      totalLeadsReceived: 245000,
      leadsThisMonth: 16800,
      leadsLastMonth: 16200,
      conversionThisMonth: 5510,
      conversionLastMonth: 5314,
      averageTimeToContact: 1.5,
      rejectionReasons: [
        { reason: 'Low credit score', count: 4500, percentage: 26.8 },
        { reason: 'High existing debt', count: 3800, percentage: 22.6 },
        { reason: 'Insufficient income', count: 3200, percentage: 19.0 },
        { reason: 'Employment instability', count: 2800, percentage: 16.7 },
        { reason: 'Other', count: 2500, percentage: 14.9 },
      ],
    },

    metadata: {
      active: true,
      featured: true,
      verified: true,
      createdAt: new Date('2024-02-10'),
      updatedAt: new Date(),
      tags: ['consumer_finance', 'fast_processing', 'high_approval', 'cash_loan'],
    },
  },

  // Home Credit Vietnam
  {
    id: 'homecredit',
    name: 'Home Credit Vietnam',
    nameVI: 'Công ty TNHH Home Credit Việt Nam',
    type: PartnerType.CONSUMER_FINANCE,
    subtype: PartnerSubtype.CONSUMER_Finance,
    code: 'HOME_CREDIT',
    logo: '/partners/home-credit-logo.png',
    website: 'https://homecredit.vn',

    contact: {
      phone: '028 3868 0666',
      email: 'support@homecredit.vn',
      address: 'Tầng 31, Landmark 81, 720A Điện Biên Phủ, Bình Thạnh, TP.HCM',
    },

    integration: {
      apiAvailable: true,
      webhookSupported: true,
      integrationStatus: 'active',
      lastSync: new Date(),
    },

    coverage: {
      national: true,
      provinces: Object.keys(VIETNAMESE_PROVINCE_NAMES),
      regions: ['north', 'central', 'south'],
    },

    specializations: {
      loanTypes: [
        LoanType.PERSONAL_LOAN,
        LoanType.CREDIT_CARD,
        LoanType.AUTO_LOAN,
        LoanType.HOME_EQUITY,
        LoanType.DEBT_CONSOLIDATION,
      ],
      minAmount: 10000000,
      maxAmount: 250000000,
      targetSegments: ['individual', 'salaried_workers', 'young_professionals'],
      creditScoreMin: 600,
      interestRateRange: {
        min: 13.0,
        max: 28.0,
      },
      processingTime: {
        min: 1,
        max: 2,
      },
    },

    capacity: {
      maxDailyLeads: 800,
      currentWorkload: 600,
      averageResponseTime: 3,
      conversionRate: 29.4,
      approvalRate: 62.8,
      averageLoanSize: 85000000,
      customerSatisfaction: 3.8,
    },

    compliance: {
      licensedBy: ['State Bank of Vietnam'],
      licenseNumber: '789/GP-NHNN',
      licenseExpiry: new Date('2025-12-31'),
      regulatoryStatus: 'active',
      complianceScore: 87,
      lastAuditDate: new Date('2024-04-20'),
    },

    business: {
      establishedYear: 2008,
      totalAssets: 22000000000000,
      marketShare: 7.8,
      employeeCount: 6000,
      branchCount: 300,
      parentCompany: 'Home Credit Group',
    },

    leadForwarding: {
      autoAcceptEnabled: true,
      acceptanceCriteria: {
        minScore: 58,
        requiredFields: ['fullName', 'nationalId', 'phoneNumber', 'employmentDetails'],
        maxLoanAmount: 250000000,
        minIncomeLevel: 4000000,
      },
      forwardingMethod: 'api',
      format: 'json',
      encryption: true,
      priority: 6,
    },

    performance: {
      totalLeadsReceived: 92000,
      leadsThisMonth: 6400,
      leadsLastMonth: 6100,
      conversionThisMonth: 1882,
      conversionLastMonth: 1793,
      averageTimeToContact: 3.2,
      rejectionReasons: [
        { reason: 'Low monthly income', count: 1800, percentage: 28.1 },
        { reason: 'Poor employment stability', count: 1500, percentage: 23.4 },
        { reason: 'High debt-to-income ratio', count: 1200, percentage: 18.8 },
        { reason: 'Incomplete documentation', count: 1000, percentage: 15.6 },
        { reason: 'Other', count: 900, percentage: 14.1 },
      ],
    },

    metadata: {
      active: true,
      featured: true,
      verified: true,
      createdAt: new Date('2024-02-15'),
      updatedAt: new Date(),
      tags: ['consumer_finance', 'international', 'flexible_terms', 'digital_first'],
    },
  },

  // Tima (Fintech/P2P)
  {
    id: 'tima',
    name: 'Tima',
    nameVI: 'Tima - Kết nối tài chính',
    type: PartnerType.FINTECH,
    subtype: PartnerSubtype.P2P_PLATFORM,
    code: 'TIMA',
    logo: '/partners/tima-logo.png',
    website: 'https://tima.vn',

    contact: {
      phone: '028 7300 8866',
      email: 'hotline@tima.vn',
      address: 'Tầng 5, Tòa nhà Vietcomreal, 148 Nguyễn Huệ, Q.1, TP.HCM',
    },

    integration: {
      apiAvailable: true,
      webhookSupported: true,
      integrationStatus: 'active',
      lastSync: new Date(),
    },

    coverage: {
      national: true,
      provinces: Object.keys(VIETNAMESE_PROVINCE_NAMES),
      regions: ['north', 'central', 'south'],
    },

    specializations: {
      loanTypes: [
        LoanType.PERSONAL_LOAN,
        LoanType.BUSINESS_LOAN,
        LoanType.AUTO_LOAN,
        LoanType.SME_LOAN,
        LoanType.STARTUP_LOAN,
      ],
      minAmount: 3000000,
      maxAmount: 200000000,
      targetSegments: ['individual', 'sme', 'startup', 'freelancer'],
      creditScoreMin: 500,
      interestRateRange: {
        min: 18.0,
        max: 36.0,
      },
      processingTime: {
        min: 0.25,
        max: 1,
      },
    },

    capacity: {
      maxDailyLeads: 2000,
      currentWorkload: 1500,
      averageResponseTime: 0.5,
      conversionRate: 22.1,
      approvalRate: 52.3,
      averageLoanSize: 65000000,
      customerSatisfaction: 3.5,
    },

    compliance: {
      licensedBy: ['State Bank of Vietnam', 'Ministry of Planning and Investment'],
      licenseNumber: '3700187519',
      licenseExpiry: new Date('2025-11-30'),
      regulatoryStatus: 'active',
      complianceScore: 82,
      lastAuditDate: new Date('2024-01-10'),
    },

    business: {
      establishedYear: 2016,
      totalAssets: 5000000000000,
      marketShare: 4.2,
      employeeCount: 3000,
      branchCount: 20,
    },

    leadForwarding: {
      autoAcceptEnabled: true,
      acceptanceCriteria: {
        minScore: 50,
        requiredFields: ['fullName', 'nationalId', 'phoneNumber', 'purpose'],
        maxLoanAmount: 200000000,
        minIncomeLevel: 2500000,
      },
      forwardingMethod: 'webhook',
      format: 'json',
      encryption: true,
      priority: 5,
    },

    performance: {
      totalLeadsReceived: 185000,
      leadsThisMonth: 14000,
      leadsLastMonth: 13500,
      conversionThisMonth: 3094,
      conversionLastMonth: 2984,
      averageTimeToContact: 0.8,
      rejectionReasons: [
        { reason: 'Low credit score', count: 5200, percentage: 37.1 },
        { reason: 'Insufficient documentation', count: 3500, percentage: 25.0 },
        { reason: 'High risk profile', count: 2800, percentage: 20.0 },
        { reason: 'Loan amount too high', count: 1500, percentage: 10.7 },
        { reason: 'Other', count: 1000, percentage: 7.2 },
      ],
    },

    metadata: {
      active: true,
      featured: false,
      verified: true,
      createdAt: new Date('2024-03-01'),
      updatedAt: new Date(),
      tags: ['fintech', 'p2p_lending', 'fast_approval', 'alternative_credit', 'startup'],
    },
  },

  // MoMo (Digital Wallet/Fintech)
  {
    id: 'momo',
    name: 'MoMo',
    nameVI: 'MoMo - Ví điện tử',
    type: PartnerType.FINTECH,
    subtype: PartnerSubtype.DIGITAL_WALLET,
    code: 'MOMO',
    logo: '/partners/momo-logo.png',
    website: 'https://momo.vn',

    contact: {
      phone: '1900 5454',
      email: 'hotline@momo.vn',
      address: 'Tầng 21, Tòa nhà Bitexco Financial Tower, 02 Hải Triều, Q.1, TP.HCM',
    },

    integration: {
      apiAvailable: true,
      webhookSupported: true,
      integrationStatus: 'active',
      lastSync: new Date(),
    },

    coverage: {
      national: true,
      provinces: Object.keys(VIETNAMESE_PROVINCE_NAMES),
      regions: ['north', 'central', 'south'],
    },

    specializations: {
      loanTypes: [
        LoanType.PERSONAL_LOAN,
        LoanType.CREDIT_CARD,
        LoanType.BUSINESS_LOAN,
      ],
      minAmount: 1000000,
      maxAmount: 100000000,
      targetSegments: ['individual', 'digital_users', 'young_professionals'],
      creditScoreMin: 550,
      interestRateRange: {
        min: 14.0,
        max: 25.0,
      },
      processingTime: {
        min: 0.1,
        max: 0.5,
      },
    },

    capacity: {
      maxDailyLeads: 5000,
      currentWorkload: 3500,
      averageResponseTime: 0.2,
      conversionRate: 18.7,
      approvalRate: 55.8,
      averageLoanSize: 45000000,
      customerSatisfaction: 4.0,
    },

    compliance: {
      licensedBy: ['State Bank of Vietnam'],
      licenseNumber: '34/GP-NHNN',
      licenseExpiry: new Date('2025-08-31'),
      regulatoryStatus: 'active',
      complianceScore: 90,
      lastAuditDate: new Date('2024-06-01'),
    },

    business: {
      establishedYear: 2013,
      totalAssets: 15000000000000,
      marketShare: 15.5,
      employeeCount: 4000,
      branchCount: 5,
    },

    leadForwarding: {
      autoAcceptEnabled: true,
      acceptanceCriteria: {
        minScore: 52,
        requiredFields: ['fullName', 'phoneNumber', 'momoAccount'],
        maxLoanAmount: 100000000,
        minIncomeLevel: 3000000,
      },
      forwardingMethod: 'api',
      format: 'json',
      encryption: true,
      priority: 8,
    },

    performance: {
      totalLeadsReceived: 325000,
      leadsThisMonth: 22000,
      leadsLastMonth: 21000,
      conversionThisMonth: 4114,
      conversionLastMonth: 3927,
      averageTimeToContact: 0.3,
      rejectionReasons: [
        { reason: 'Low MoMo activity score', count: 6800, percentage: 30.9 },
        { reason: 'Insufficient KYC completion', count: 5500, percentage: 25.0 },
        { reason: 'Low transaction history', count: 4200, percentage: 19.1 },
        { reason: 'Risk assessment', count: 3000, percentage: 13.6 },
        { reason: 'Other', count: 2500, percentage: 11.4 },
      ],
    },

    metadata: {
      active: true,
      featured: true,
      verified: true,
      createdAt: new Date('2024-01-25'),
      updatedAt: new Date(),
      tags: ['fintech', 'digital_wallet', 'instant_approval', 'mobile_first', 'ecosystem'],
    },
  },

  // Agribank (State-owned, Agricultural Focus)
  {
    id: 'agribank',
    name: 'Agribank',
    nameVI: 'Ngân hàng Nông nghiệp và Phát triển Nông thôn Việt Nam',
    type: PartnerType.STATE_BANK,
    subtype: PartnerSubtype.STATE_OWNED,
    code: 'AGRIBANK',
    logo: '/partners/agribank-logo.png',
    website: 'https://agribank.com.vn',

    contact: {
      phone: '024 3846 2626',
      email: 'info@agribank.com.vn',
      address: '2 Quang Trung, Hai Bà Trưng, Hà Nội',
    },

    integration: {
      apiAvailable: true,
      webhookSupported: true,
      integrationStatus: 'active',
      lastSync: new Date(),
    },

    coverage: {
      national: true,
      provinces: Object.keys(VIETNAMESE_PROVINCE_NAMES),
      regions: ['north', 'central', 'south'],
      ruralOnly: false,
    },

    specializations: {
      loanTypes: [
        LoanType.AGRICULTURAL_LOAN,
        LoanType.BUSINESS_LOAN,
        LoanType.SME_LOAN,
        LoanType.PERSONAL_LOAN,
        LoanType.MORTGAGE_LOAN,
      ],
      minAmount: 10000000,
      maxAmount: 50000000000,
      targetSegments: ['farmers', 'rural_population', 'agribusiness', 'sme'],
      creditScoreMin: 600,
      interestRateRange: {
        min: 5.5,
        max: 10.5,
      },
      processingTime: {
        min: 5,
        max: 15,
      },
    },

    capacity: {
      maxDailyLeads: 600,
      currentWorkload: 420,
      averageResponseTime: 8,
      conversionRate: 31.2,
      approvalRate: 78.9,
      averageLoanSize: 180000000,
      customerSatisfaction: 4.1,
    },

    compliance: {
      licensedBy: ['State Bank of Vietnam'],
      licenseNumber: '01/GP-NHNN',
      licenseExpiry: new Date('2025-12-31'),
      regulatoryStatus: 'active',
      complianceScore: 93,
      lastAuditDate: new Date('2024-05-10'),
    },

    business: {
      establishedYear: 1988,
      totalAssets: 2000000000000000,
      marketShare: 18.2,
      employeeCount: 35000,
      branchCount: 2300,
      atmCount: 2500,
    },

    leadForwarding: {
      autoAcceptEnabled: true,
      acceptanceCriteria: {
        minScore: 62,
        requiredFields: ['fullName', 'nationalId', 'agriculturalActivity', 'landOwnership'],
        maxLoanAmount: 50000000000,
        minIncomeLevel: 2000000,
      },
      forwardingMethod: 'api',
      format: 'json',
      encryption: true,
      priority: 7,
    },

    performance: {
      totalLeadsReceived: 112000,
      leadsThisMonth: 8200,
      leadsLastMonth: 7800,
      conversionThisMonth: 2558,
      conversionLastMonth: 2434,
      averageTimeToContact: 8.5,
      rejectionReasons: [
        { reason: 'Insufficient collateral', count: 1800, percentage: 21.9 },
        { reason: 'Low agricultural income', count: 1500, percentage: 18.3 },
        { reason: 'Seasonal business risk', count: 1400, percentage: 17.1 },
        { reason: 'Incomplete land documentation', count: 1200, percentage: 14.6 },
        { reason: 'Other', count: 2300, percentage: 28.1 },
      ],
    },

    metadata: {
      active: true,
      featured: true,
      verified: true,
      createdAt: new Date('2024-02-05'),
      updatedAt: new Date(),
      tags: ['state_bank', 'agricultural_finance', 'rural_focus', 'government_backed'],
    },
  },
];

/**
 * Utility functions for Vietnamese Financial Partners
 */

export const getPartnerById = (id: string): VietnameseFinancialPartner | undefined => {
  return VIETNAMESE_FINANCIAL_PARTNERS.find(partner => partner.id === id);
};

export const getPartnersByType = (type: PartnerType): VietnameseFinancialPartner[] => {
  return VIETNAMESE_FINANCIAL_PARTNERS.filter(partner => partner.type === type);
};

export const getPartnersByLoanType = (loanType: LoanType): VietnameseFinancialPartner[] => {
  return VIETNAMESE_FINANCIAL_PARTNERS.filter(partner =>
    partner.specializations.loanTypes.includes(loanType)
  );
};

export const getPartnersByProvince = (provinceCode: string): VietnameseFinancialPartner[] => {
  return VIETNAMESE_FINANCIAL_PARTNERS.filter(partner =>
    partner.coverage.provinces.includes(provinceCode)
  );
};

export const getActivePartners = (): VietnameseFinancialPartner[] => {
  return VIETNAMESE_FINANCIAL_PARTNERS.filter(partner =>
    partner.metadata.active &&
    partner.compliance.regulatoryStatus === 'active'
  );
};

export const getFeaturedPartners = (): VietnameseFinancialPartner[] => {
  return VIETNAMESE_FINANCIAL_PARTNERS.filter(partner =>
    partner.metadata.featured &&
    partner.metadata.active &&
    partner.compliance.regulatoryStatus === 'active'
  );
};

export const getPartnersByScoreRange = (minScore: number, maxScore: number): VietnameseFinancialPartner[] => {
  return VIETNAMESE_FINANCIAL_PARTNERS.filter(partner => {
    const averageScore = (
      partner.compliance.complianceScore +
      (partner.customerSatisfaction * 20) +
      (partner.approvalRate * 0.5)
    ) / 3;
    return averageScore >= minScore && averageScore <= maxScore;
  });
};

export const getAvailablePartnersForLead = (leadData: {
  loanAmount: number;
  loanType: LoanType;
  provinceCode: string;
  creditScore?: number;
  monthlyIncome?: number;
}): VietnameseFinancialPartner[] => {
  return getActivePartners().filter(partner => {
    // Check loan amount range
    if (leadData.loanAmount < partner.specializations.minAmount ||
        leadData.loanAmount > partner.specializations.maxAmount) {
      return false;
    }

    // Check loan type
    if (!partner.specializations.loanTypes.includes(leadData.loanType)) {
      return false;
    }

    // Check geographic coverage
    if (!partner.coverage.provinces.includes(leadData.provinceCode)) {
      return false;
    }

    // Check credit score if provided
    if (leadData.creditScore && partner.specializations.creditScoreMin) {
      if (leadData.creditScore < partner.specializations.creditScoreMin) {
        return false;
      }
    }

    // Check income if provided
    if (leadData.monthlyIncome && partner.leadForwarding.acceptanceCriteria.minIncomeLevel) {
      if (leadData.monthlyIncome < partner.leadForwarding.acceptanceCriteria.minIncomeLevel) {
        return false;
      }
    }

    // Check capacity
    if (partner.capacity.currentWorkload >= partner.capacity.maxDailyLeads) {
      return false;
    }

    return true;
  });
};

export const sortPartnersByPriority = (partners: VietnameseFinancialPartner[]): VietnameseFinancialPartner[] => {
  return partners.sort((a, b) => {
    // Primary sort: Priority score
    if (a.leadForwarding.priority !== b.leadForwarding.priority) {
      return b.leadForwarding.priority - a.leadForwarding.priority;
    }

    // Secondary sort: Capacity availability
    const aCapacityRatio = a.capacity.currentWorkload / a.capacity.maxDailyLeads;
    const bCapacityRatio = b.capacity.currentWorkload / b.capacity.maxDailyLeads;
    if (aCapacityRatio !== bCapacityRatio) {
      return aCapacityRatio - bCapacityRatio;
    }

    // Tertiary sort: Conversion rate
    return b.capacity.conversionRate - a.capacity.conversionRate;
  });
};

export const updatePartnerCapacity = (partnerId: string, newWorkload: number): boolean => {
  const partner = getPartnerById(partnerId);
  if (partner) {
    partner.capacity.currentWorkload = newWorkload;
    partner.metadata.updatedAt = new Date();
    return true;
  }
  return false;
};

export const getPartnerStatistics = (): {
  totalPartners: number;
  activePartners: number;
  totalCapacity: number;
  averageConversionRate: number;
  totalLeadsProcessed: number;
  topPerformers: VietnameseFinancialPartner[];
} => {
  const activePartners = getActivePartners();
  const totalCapacity = activePartners.reduce((sum, partner) => sum + partner.capacity.maxDailyLeads, 0);
  const averageConversionRate = activePartners.length > 0
    ? activePartners.reduce((sum, partner) => sum + partner.capacity.conversionRate, 0) / activePartners.length
    : 0;
  const totalLeadsProcessed = activePartners.reduce((sum, partner) => sum + partner.performance.totalLeadsReceived, 0);

  const topPerformers = sortPartnersByPriority(activePartners).slice(0, 5);

  return {
    totalPartners: VIETNAMESE_FINANCIAL_PARTNERS.length,
    activePartners: activePartners.length,
    totalCapacity,
    averageConversionRate,
    totalLeadsProcessed,
    topPerformers,
  };
};

export default VIETNAMESE_FINANCIAL_PARTNERS;