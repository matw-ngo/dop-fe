/**
 * Vietnamese Financial Data Database
 *
 * This module contains comprehensive financial data for the Vietnamese market,
 * including tax brackets, bank interest rates, minimum wage data, and other
 * market indicators needed for loan calculations and financial tools.
 */

export interface VietnameseTaxBracket {
  /** Taxable income range (VND per year) */
  minIncome: number;
  maxIncome?: number;
  /** Tax rate percentage */
  taxRate: number;
  /** Quick calculation amount (VND) */
  quickCalc: number;
}

export interface SocialInsuranceRates {
  /** Employee social insurance contribution */
  socialInsuranceEmployee: number; // 8%
  /** Employer social insurance contribution */
  socialInsuranceEmployer: number; // 17.5%
  /** Employee health insurance contribution */
  healthInsuranceEmployee: number; // 1.5%
  /** Employer health insurance contribution */
  healthInsuranceEmployer: number; // 3%
  /** Employee unemployment insurance contribution */
  unemploymentInsuranceEmployee: number; // 1%
  /** Employer unemployment insurance contribution */
  unemploymentInsuranceEmployer: number; // 1%
}

export interface FamilyDeduction {
  /** Standard deduction for taxpayer (VND per month) */
  taxpayerDeduction: number;
  /** Standard deduction for each dependent (VND per month) */
  dependentDeduction: number;
}

export interface RegionalMinimumWage {
  /** Region 1: Hanoi, HCMC and other urban areas */
  region1: number;
  /** Region 2: Urban areas in other provinces/cities */
  region2: number;
  /** Region 3: Rural areas */
  region3: number;
  /** Region 4: Rural areas in disadvantaged provinces */
  region4: number;
}

export interface VietnameseBank {
  id: string;
  name: string;
  nameVn: string;
  logo?: string;
  website?: string;
  hotlines?: string[];
  savingsRates: {
    [termInMonths: number]: {
      rate: number;
      minimumAmount: number;
      onlineRate?: number;
    };
  };
  loanRates: {
    [loanType: string]: {
      minRate: number;
      maxRate: number;
      description: string;
    };
  };
}

export interface MarketIndicator {
  /** Consumer Price Index (%) */
  cpi: number;
  /** Inflation rate (%) */
  inflationRate: number;
  /** Base interest rate (%) */
  baseInterestRate: number;
  /** Refinancing rate (%) */
  refinancingRate: number;
  /** Discount rate (%) */
  discountRate: number;
  /** GDP growth rate (%) */
  gdpGrowthRate: number;
  /** Average deposit rate (%) */
  averageDepositRate: number;
  /** Average lending rate (%) */
  averageLendingRate: number;
}

export interface VietnameseLoanType {
  id: string;
  name: string;
  nameVn: string;
  description: string;
  typicalInterestRange: {
    min: number;
    max: number;
  };
  typicalTermRange: {
    min: number;
    max: number;
  };
  collateralRequired: boolean;
  processingTime: string;
  targetAudience: string[];
}

/**
 * Vietnamese Personal Income Tax Brackets (2024)
 * Based on Circular No. 111/2013/TT-BTC (as amended)
 */
export const VIETNAMESE_TAX_BRACKETS: VietnameseTaxBracket[] = [
  { minIncome: 0, maxIncome: 5000000, taxRate: 5, quickCalc: 0 },
  { minIncome: 5000001, maxIncome: 10000000, taxRate: 10, quickCalc: 250000 },
  { minIncome: 10000001, maxIncome: 18000000, taxRate: 15, quickCalc: 750000 },
  { minIncome: 18000001, maxIncome: 32000000, taxRate: 20, quickCalc: 1950000 },
  { minIncome: 32000001, maxIncome: 52000000, taxRate: 25, quickCalc: 4750000 },
  { minIncome: 52000001, maxIncome: 80000000, taxRate: 30, quickCalc: 9750000 },
  { minIncome: 80000001, taxRate: 35, quickCalc: 18150000 },
];

/**
 * Vietnamese Social Insurance Contribution Rates
 * Based on Social Insurance Law and related decrees
 */
export const SOCIAL_INSURANCE_RATES: SocialInsuranceRates = {
  socialInsuranceEmployee: 0.08, // 8%
  socialInsuranceEmployer: 0.175, // 17.5%
  healthInsuranceEmployee: 0.015, // 1.5%
  healthInsuranceEmployer: 0.03, // 3%
  unemploymentInsuranceEmployee: 0.01, // 1%
  unemploymentInsuranceEmployer: 0.01, // 1%
};

/**
 * Vietnamese Family Deduction Standards (2024)
 */
export const FAMILY_DEDUCTIONS: FamilyDeduction = {
  taxpayerDeduction: 11000000, // 11 million VND per month
  dependentDeduction: 4400000, // 4.4 million VND per dependent per month
};

/**
 * Regional Minimum Wage (2024)
 * Based on Decree No. 38/2022/NĐ-CP
 */
export const REGIONAL_MINIMUM_WAGE: RegionalMinimumWage = {
  region1: 4680000, // 4.68 million VND
  region2: 4160000, // 4.16 million VND
  region3: 3640000, // 3.64 million VND
  region4: 3250000, // 3.25 million VND
};

/**
 * Vietnamese Banks with Interest Rates (2024)
 * Rates are regularly updated and may vary
 */
export const VIETNAMESE_BANKS: VietnameseBank[] = [
  {
    id: 'vcb',
    name: 'Vietcombank',
    nameVn: 'Ngân hàng TMCP Ngoại thương Việt Nam',
    logo: '/banks/vcb.png',
    website: 'https://vietcombank.com.vn',
    hotlines: ['1900 800 819', '024 3945 6677'],
    savingsRates: {
      1: { rate: 0.5, minimumAmount: 100000 },
      3: { rate: 1.5, minimumAmount: 100000 },
      6: { rate: 2.8, minimumAmount: 100000 },
      12: { rate: 4.7, minimumAmount: 100000 },
      24: { rate: 5.2, minimumAmount: 100000 },
      36: { rate: 5.5, minimumAmount: 100000 },
    },
    loanRates: {
      home: { minRate: 7.5, maxRate: 11.0, description: 'Vay mua nhà, đất, xây dựng/sửa chữa nhà ở' },
      auto: { minRate: 9.0, maxRate: 13.0, description: 'Vay mua ô tô' },
      consumer: { minRate: 12.0, maxRate: 18.0, description: 'Vay tiêu dùng' },
      business: { minRate: 6.5, maxRate: 9.5, description: 'Vay kinh doanh' },
    },
  },
  {
    id: 'tcb',
    name: 'Techcombank',
    nameVn: 'Ngân hàng TMCP Kỹ thương Việt Nam',
    logo: '/banks/tcb.png',
    website: 'https://techcombank.com.vn',
    hotlines: ['1800 588 822'],
    savingsRates: {
      1: { rate: 0.8, minimumAmount: 100000 },
      3: { rate: 2.0, minimumAmount: 100000 },
      6: { rate: 3.5, minimumAmount: 100000 },
      12: { rate: 5.5, minimumAmount: 100000 },
      24: { rate: 6.0, minimumAmount: 100000 },
      36: { rate: 6.3, minimumAmount: 100000 },
    },
    loanRates: {
      home: { minRate: 7.8, maxRate: 11.5, description: 'Vay mua nhà, đất' },
      auto: { minRate: 9.5, maxRate: 14.0, description: 'Vay mua ô tô' },
      consumer: { minRate: 13.0, maxRate: 20.0, description: 'Vay tiêu dùng không tài sản đảm bảo' },
      business: { minRate: 7.0, maxRate: 10.0, description: 'Vay kinh doanh' },
    },
  },
  {
    id: 'acb',
    name: 'ACB',
    nameVn: 'Ngân hàng TMCP Á Châu',
    logo: '/banks/acb.png',
    website: 'https://acb.com.vn',
    hotlines: ['1900 54 54 54'],
    savingsRates: {
      1: { rate: 0.6, minimumAmount: 100000 },
      3: { rate: 1.8, minimumAmount: 100000 },
      6: { rate: 3.2, minimumAmount: 100000 },
      12: { rate: 5.0, minimumAmount: 100000 },
      24: { rate: 5.5, minimumAmount: 100000 },
      36: { rate: 5.8, minimumAmount: 100000 },
    },
    loanRates: {
      home: { minRate: 7.2, maxRate: 10.5, description: 'Vay mua nhà, đất' },
      auto: { minRate: 8.8, maxRate: 12.5, description: 'Vay mua ô tô' },
      consumer: { minRate: 11.5, maxRate: 17.0, description: 'Vay tiêu dùng' },
      business: { minRate: 6.8, maxRate: 9.8, description: 'Vay kinh doanh' },
    },
  },
  {
    id: 'mb',
    name: 'MB Bank',
    nameVn: 'Ngân hàng TMCP Quân đội',
    logo: '/banks/mb.png',
    website: 'https://mbbank.com.vn',
    hotlines: ['1900 5454 36', '024 3767 4455'],
    savingsRates: {
      1: { rate: 0.7, minimumAmount: 100000 },
      3: { rate: 1.9, minimumAmount: 100000 },
      6: { rate: 3.3, minimumAmount: 100000 },
      12: { rate: 5.2, minimumAmount: 100000 },
      24: { rate: 5.7, minimumAmount: 100000 },
      36: { rate: 6.0, minimumAmount: 100000 },
    },
    loanRates: {
      home: { minRate: 7.6, maxRate: 11.2, description: 'Vay mua nhà, đất' },
      auto: { minRate: 9.2, maxRate: 13.5, description: 'Vay mua ô tô' },
      consumer: { minRate: 12.5, maxRate: 19.0, description: 'Vay tiêu dùng' },
      business: { minRate: 6.9, maxRate: 9.9, description: 'Vay kinh doanh' },
    },
  },
  {
    id: 'vib',
    name: 'VIB',
    nameVn: 'Ngân hàng TMCP Quốc Tế Việt Nam',
    logo: '/banks/vib.png',
    website: 'https://vib.com.vn',
    hotlines: ['1800 8180'],
    savingsRates: {
      1: { rate: 0.9, minimumAmount: 100000 },
      3: { rate: 2.2, minimumAmount: 100000 },
      6: { rate: 3.8, minimumAmount: 100000 },
      12: { rate: 5.8, minimumAmount: 100000 },
      24: { rate: 6.3, minimumAmount: 100000 },
      36: { rate: 6.6, minimumAmount: 100000 },
    },
    loanRates: {
      home: { minRate: 8.0, maxRate: 12.0, description: 'Vay mua nhà, đất' },
      auto: { minRate: 10.0, maxRate: 15.0, description: 'Vay mua ô tô' },
      consumer: { minRate: 14.0, maxRate: 22.0, description: 'Vay tiêu dùng' },
      business: { minRate: 7.5, maxRate: 11.0, description: 'Vay kinh doanh' },
    },
  },
];

/**
 * Common Vietnamese Loan Types
 */
export const VIETNAMESE_LOAN_TYPES: VietnameseLoanType[] = [
  {
    id: 'home-loan',
    name: 'Home Loan',
    nameVn: 'Vay mua nhà',
    description: 'Mortgage loans for purchasing houses, apartments, or land',
    typicalInterestRange: { min: 7.0, max: 15.0 },
    typicalTermRange: { min: 60, max: 360 },
    collateralRequired: true,
    processingTime: '7-14 days',
    targetAudience: ['individuals', 'families'],
  },
  {
    id: 'auto-loan',
    name: 'Auto Loan',
    nameVn: 'Vay mua xe',
    description: 'Loans for purchasing new or used vehicles',
    typicalInterestRange: { min: 9.0, max: 18.0 },
    typicalTermRange: { min: 12, max: 84 },
    collateralRequired: true,
    processingTime: '3-7 days',
    targetAudience: ['individuals', 'businesses'],
  },
  {
    id: 'consumer-loan',
    name: 'Consumer Loan',
    nameVn: 'Vay tiêu dùng',
    description: 'Personal loans for consumption purposes',
    typicalInterestRange: { min: 12.0, max: 24.0 },
    typicalTermRange: { min: 6, max: 60 },
    collateralRequired: false,
    processingTime: '1-3 days',
    targetAudience: ['individuals'],
  },
  {
    id: 'business-loan',
    name: 'Business Loan',
    nameVn: 'Vay kinh doanh',
    description: 'Loans for business operations and expansion',
    typicalInterestRange: { min: 6.5, max: 12.0 },
    typicalTermRange: { min: 12, max: 120 },
    collateralRequired: true,
    processingTime: '7-21 days',
    targetAudience: ['businesses', 'enterprises'],
  },
  {
    id: 'credit-card-loan',
    name: 'Credit Card Loan',
    nameVn: 'Vay qua thẻ tín dụng',
    description: 'Cash advance through credit cards',
    typicalInterestRange: { min: 18.0, max: 36.0 },
    typicalTermRange: { min: 1, max: 24 },
    collateralRequired: false,
    processingTime: 'Immediate',
    targetAudience: ['individuals'],
  },
];

/**
 * Current Vietnamese Market Indicators (2024)
 */
export const VIETNAMESE_MARKET_INDICATORS: MarketIndicator = {
  cpi: 3.67, // November 2024 CPI
  inflationRate: 3.89, // 2024 inflation rate
  baseInterestRate: 4.5, // SBV base rate
  refinancingRate: 5.0, // SBV refinancing rate
  discountRate: 3.0, // SBV discount rate
  gdpGrowthRate: 6.3, // 2024 GDP growth forecast
  averageDepositRate: 5.2, // Average deposit rate across banks
  averageLendingRate: 9.8, // Average lending rate across banks
};

/**
 * Early Repayment Penalty Rates
 */
export const EARLY_REPAYMENT_PENALTIES = {
  fixedRate: 0.05, // 5% of outstanding principal
  floatingRate: 0.03, // 3% of outstanding principal
  promotionalRate: 0.10, // 10% during promotional period
  maxPenalty: 0.05, // Maximum 5% of outstanding principal
  gracePeriodMonths: 12, // No penalty for early repayment within 12 months
};

/**
 * Loan Processing Fees
 */
export const LOAN_PROCESSING_FEES = {
  assessment: 0.01, // 1% of loan amount
  appraisal: 0.005, // 0.5% of loan amount
  legal: 0.002, // 0.2% of loan amount
  registration: 0.001, // 0.1% of loan amount
  minimumFee: 1000000, // Minimum 1 million VND
  maximumFee: 20000000, // Maximum 20 million VND
};

/**
 * Helper Functions
 */

/**
 * Get tax bracket for given taxable income
 */
export const getTaxBracket = (taxableIncome: number): VietnameseTaxBracket | null => {
  return VIETNAMESE_TAX_BRACKETS.find(bracket =>
    taxableIncome >= bracket.minIncome &&
    (!bracket.maxIncome || taxableIncome <= bracket.maxIncome)
  ) || null;
};

/**
 * Get bank by ID
 */
export const getBankById = (bankId: string): VietnameseBank | null => {
  return VIETNAMESE_BANKS.find(bank => bank.id === bankId) || null;
};

/**
 * Get banks with best savings rates for given term
 */
export const getBestSavingsRates = (termInMonths: number): VietnameseBank[] => {
  return [...VIETNAMESE_BANKS]
    .filter(bank => bank.savingsRates[termInMonths])
    .sort((a, b) => b.savingsRates[termInMonths].rate - a.savingsRates[termInMonths].rate);
};

/**
 * Get banks with lowest loan rates for given loan type
 */
export const getBestLoanRates = (loanType: string): VietnameseBank[] => {
  return [...VIETNAMESE_BANKS]
    .filter(bank => bank.loanRates[loanType])
    .sort((a, b) => a.loanRates[loanType].minRate - b.loanRates[loanType].minRate);
};

/**
 * Calculate effective annual rate with compound interest
 */
export const calculateEffectiveAnnualRate = (nominalRate: number, compoundingFrequency: number = 12): number => {
  return Math.pow(1 + nominalRate / 100 / compoundingFrequency, compoundingFrequency) - 1;
};

/**
 * Format currency amount in Vietnamese Dong
 */
export const formatVND = (amount: number): string => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

/**
 * Validate Vietnamese bank account number format
 */
export const isValidBankAccount = (accountNumber: string): boolean => {
  // Basic validation: 8-15 digits, only numbers
  const accountRegex = /^\d{8,15}$/;
  return accountRegex.test(accountNumber.replace(/\s/g, ''));
};

/**
 * Calculate monthly payment for reducing balance method
 */
export const calculateReducingBalancePayment = (principal: number, annualRate: number, termInMonths: number): number => {
  const monthlyRate = annualRate / 100 / 12;
  if (monthlyRate === 0) return principal / termInMonths;

  return principal * (monthlyRate * Math.pow(1 + monthlyRate, termInMonths)) /
         (Math.pow(1 + monthlyRate, termInMonths) - 1);
};

/**
 * Calculate monthly payment for flat rate method
 */
export const calculateFlatRatePayment = (principal: number, annualRate: number, termInMonths: number): number => {
  const totalInterest = principal * (annualRate / 100) * (termInMonths / 12);
  const totalPayment = principal + totalInterest;
  return totalPayment / termInMonths;
};

/**
 * Calculate total interest for flat rate method
 */
export const calculateFlatRateInterest = (principal: number, annualRate: number, termInMonths: number): number => {
  return principal * (annualRate / 100) * (termInMonths / 12);
};

export default {
  VIETNAMESE_TAX_BRACKETS,
  SOCIAL_INSURANCE_RATES,
  FAMILY_DEDUCTIONS,
  REGIONAL_MINIMUM_WAGE,
  VIETNAMESE_BANKS,
  VIETNAMESE_LOAN_TYPES,
  VIETNAMESE_MARKET_INDICATORS,
  EARLY_REPAYMENT_PENALTIES,
  LOAN_PROCESSING_FEES,
  getTaxBracket,
  getBankById,
  getBestSavingsRates,
  getBestLoanRates,
  calculateEffectiveAnnualRate,
  formatVND,
  isValidBankAccount,
  calculateReducingBalancePayment,
  calculateFlatRatePayment,
  calculateFlatRateInterest,
};