/**
 * Vietnamese Bank Interest Rates and Products
 *
 * This module provides comprehensive data on Vietnamese bank interest rates,
 * loan products, savings products, and rate comparison functionality.
 */

import { VietnameseBank, VietnameseLoanType } from './vietnamese-financial-data';

export interface BankRateComparison {
  bankId: string;
  bankName: string;
  rate: number;
  effectiveRate: number;
  minimumAmount: number;
  features: string[];
  pros: string[];
  cons: string[];
  score: number;
}

export interface SavingsProduct {
  bankId: string;
  bankName: string;
  productName: string;
  termInMonths: number;
  interestRate: number;
  effectiveRate: number;
  minimumAmount: number;
  maximumAmount?: number;
  isOnlineOnly: boolean;
  specialConditions: string[];
  autoRenewal: boolean;
}

export interface LoanProduct {
  bankId: string;
  bankName: string;
  loanType: string;
  loanTypeName: string;
  minInterestRate: number;
  maxInterestRate: number;
  minLoanAmount: number;
  maxLoanAmount: number;
  minTerm: number;
  maxTerm: number;
  collateralRequired: boolean;
  processingTime: string;
  requirements: string[];
  fees: {
    processingFee: number;
    appraisalFee: number;
    earlyRepaymentFee: number;
  };
}

export interface RateHistory {
  date: string;
  rate: number;
  bankId: string;
  productId: string;
}

export interface MarketRateSummary {
  averageSavingsRate: number;
  averageLoanRate: string;
  highestSavingsRate: BankRateComparison;
  lowestLoanRate: BankRateComparison;
  rateTrends: {
    direction: 'up' | 'down' | 'stable';
    change: number;
    period: string;
  };
}

/**
 * Get all available savings products
 */
export const getAllSavingsProducts = (termInMonths?: number): SavingsProduct[] => {
  const banks: VietnameseBank[] = [
    {
      id: 'vcb',
      name: 'Vietcombank',
      nameVn: 'Ngân hàng TMCP Ngoại thương Việt Nam',
      savingsRates: {
        1: { rate: 0.5, minimumAmount: 100000 },
        3: { rate: 1.5, minimumAmount: 100000 },
        6: { rate: 2.8, minimumAmount: 100000 },
        12: { rate: 4.7, minimumAmount: 100000 },
        24: { rate: 5.2, minimumAmount: 100000 },
        36: { rate: 5.5, minimumAmount: 100000 },
      },
      loanRates: {},
    },
    {
      id: 'tcb',
      name: 'Techcombank',
      nameVn: 'Ngân hàng TMCP Kỹ thương Việt Nam',
      savingsRates: {
        1: { rate: 0.8, minimumAmount: 100000 },
        3: { rate: 2.0, minimumAmount: 100000 },
        6: { rate: 3.5, minimumAmount: 100000 },
        12: { rate: 5.5, minimumAmount: 100000 },
        24: { rate: 6.0, minimumAmount: 100000 },
        36: { rate: 6.3, minimumAmount: 100000 },
      },
      loanRates: {},
    },
    {
      id: 'acb',
      name: 'ACB',
      nameVn: 'Ngân hàng TMCP Á Châu',
      savingsRates: {
        1: { rate: 0.6, minimumAmount: 100000 },
        3: { rate: 1.8, minimumAmount: 100000 },
        6: { rate: 3.2, minimumAmount: 100000 },
        12: { rate: 5.0, minimumAmount: 100000 },
        24: { rate: 5.5, minimumAmount: 100000 },
        36: { rate: 5.8, minimumAmount: 100000 },
      },
      loanRates: {},
    },
  ];

  const products: SavingsProduct[] = [];

  banks.forEach(bank => {
    Object.entries(bank.savingsRates).forEach(([term, rateInfo]) => {
      const termNum = parseInt(term);

      if (!termInMonths || termNum === termInMonths) {
        const effectiveRate = calculateEffectiveAnnualRate(rateInfo.rate, 12);

        products.push({
          bankId: bank.id,
          bankName: bank.name,
          productName: `Tiết kiệm có kỳ hạn ${termNum} tháng`,
          termInMonths: termNum,
          interestRate: rateInfo.rate,
          effectiveRate,
          minimumAmount: rateInfo.minimumAmount,
          isOnlineOnly: false,
          specialConditions: [],
          autoRenewal: true,
        });
      }
    });
  });

  return products.sort((a, b) => b.effectiveRate - a.effectiveRate);
};

/**
 * Get best savings rates for specific term
 */
export const getBestSavingsRates = (termInMonths: number, amount: number = 100000000): BankRateComparison[] => {
  const products = getAllSavingsProducts(termInMonths);
  const comparisons: BankRateComparison[] = [];

  products.forEach(product => {
    if (product.minimumAmount <= amount) {
      comparisons.push({
        bankId: product.bankId,
        bankName: product.bankName,
        rate: product.interestRate,
        effectiveRate: product.effectiveRate,
        minimumAmount: product.minimumAmount,
        features: [
          `Kỳ hạn ${product.termInMonths} tháng`,
          `Tối thiểu ${formatVND(product.minimumAmount)}`,
          product.autoRenewal ? 'Tự động gia hạn' : 'Không tự động gia hạn',
        ],
        pros: [
          `Lãi suất cạnh tranh ${product.interestRate}%`,
          product.bankName === 'Vietcombank' ? 'Ngân hàng quốc doanh uy tín' : '',
          product.autoRenewal ? 'Tự động gia hạn tiện lợi' : '',
        ].filter(Boolean),
        cons: [
          product.minimumAmount > 1000000000 ? 'Yêu cầu số tiền lớn' : '',
          !product.isOnlineOnly ? 'Cần đến quầy giao dịch' : '',
        ].filter(Boolean),
        score: calculateBankScore(product),
      });
    }
  });

  return comparisons.sort((a, b) => b.score - a.score);
};

/**
 * Get all available loan products
 */
export const getAllLoanProducts = (loanType?: string): LoanProduct[] = {
  const loanProducts: LoanProduct[] = [
    {
      bankId: 'vcb',
      bankName: 'Vietcombank',
      loanType: 'home',
      loanTypeName: 'Vay mua nhà',
      minInterestRate: 7.5,
      maxInterestRate: 11.0,
      minLoanAmount: 100000000,
      maxLoanAmount: 10000000000,
      minTerm: 60,
      maxTerm: 360,
      collateralRequired: true,
      processingTime: '7-14 ngày',
      requirements: [
        'Hộ khẩu hoặc KT3 tại nơi cho vay',
        'Thu nhập ổn định từ 15 triệu/tháng',
        'Không có nợ xấu tại CIC',
        'Có tài sản đảm bảo (nhà, đất)',
      ],
      fees: {
        processingFee: 0.01,
        appraisalFee: 0.005,
        earlyRepaymentFee: 0.05,
      },
    },
    {
      bankId: 'acb',
      bankName: 'ACB',
      loanType: 'home',
      loanTypeName: 'Vay mua nhà',
      minInterestRate: 7.2,
      maxInterestRate: 10.5,
      minLoanAmount: 50000000,
      maxLoanAmount: 8000000000,
      minTerm: 60,
      maxTerm: 300,
      collateralRequired: true,
      processingTime: '5-10 ngày',
      requirements: [
        'Công dân Việt Nam từ 18 tuổi',
        'Thu nhập từ 12 triệu/tháng',
        'Làm việc tại công ty trên 6 tháng',
        'Có tài sản đảm bảo',
      ],
      fees: {
        processingFee: 0.008,
        appraisalFee: 0.004,
        earlyRepaymentFee: 0.03,
      },
    },
    {
      bankId: 'tcb',
      bankName: 'Techcombank',
      loanType: 'consumer',
      loanTypeName: 'Vay tiêu dùng không tài sản đảm bảo',
      minInterestRate: 13.0,
      maxInterestRate: 20.0,
      minLoanAmount: 20000000,
      maxLoanAmount: 500000000,
      minTerm: 6,
      maxTerm: 60,
      collateralRequired: false,
      processingTime: '2-5 ngày',
      requirements: [
        'Thu nhập từ 10 triệu/tháng',
        'Làm việc trên 3 tháng',
        'Không có nợ xấu',
        'Tuổi từ 20-60',
      ],
      fees: {
        processingFee: 0.02,
        appraisalFee: 0,
        earlyRepaymentFee: 0.05,
      },
    },
  ];

  return loanType
    ? loanProducts.filter(product => product.loanType === loanType)
    : loanProducts;
};

/**
 * Get best loan rates for specific loan type
 */
export const getBestLoanRates = (loanType: string, loanAmount: number): BankRateComparison[] => {
  const products = getAllLoanProducts(loanType);
  const comparisons: BankRateComparison[] = [];

  products.forEach(product => {
    if (product.minLoanAmount <= loanAmount && loanAmount <= product.maxLoanAmount) {
      const averageRate = (product.minInterestRate + product.maxInterestRate) / 2;

      comparisons.push({
        bankId: product.bankId,
        bankName: product.bankName,
        rate: averageRate,
        effectiveRate: averageRate, // For loans, nominal and effective are typically the same
        minimumAmount: product.minLoanAmount,
        features: [
          `${product.loanTypeName}`,
          `Thời gian xử lý: ${product.processingTime}`,
          `Kỳ hạn: ${product.minTerm}-${product.maxTerm} tháng`,
          product.collateralRequired ? 'Cần tài sản đảm bảo' : 'Không cần tài sản đảm bảo',
        ],
        pros: [
          `Lãi suất từ ${product.minInterestRate}%`,
          `Vay tối đa ${formatVND(product.maxLoanAmount)}`,
          product.processingTime.includes('2-5') ? 'Nhanh chóng' : '',
          !product.collateralRequired ? 'Không cần tài sản đảm bảo' : '',
        ].filter(Boolean),
        cons: [
          product.collateralRequired ? 'Cần tài sản đảm bảo' : '',
          product.minLoanAmount > 100000000 ? 'Yêu cầu số tiền vay lớn' : '',
        ].filter(Boolean),
        score: calculateLoanProductScore(product, loanAmount),
      });
    }
  });

  return comparisons.sort((a, b) => b.score - a.score);
};

/**
 * Calculate compound interest for savings
 */
export const calculateCompoundInterest = (
  principal: number,
  annualRate: number,
  termInMonths: number,
  compoundingFrequency: number = 12
): {
  finalAmount: number;
  totalInterest: number;
  effectiveRate: number;
} => {
  const ratePerPeriod = annualRate / 100 / compoundingFrequency;
  const numberOfPeriods = (termInMonths / 12) * compoundingFrequency;

  const finalAmount = principal * Math.pow(1 + ratePerPeriod, numberOfPeriods);
  const totalInterest = finalAmount - principal;
  const effectiveRate = (finalAmount - principal) / principal * 100;

  return {
    finalAmount,
    totalInterest,
    effectiveRate,
  };
};

/**
 * Calculate simple interest for comparison
 */
export const calculateSimpleInterest = (
  principal: number,
  annualRate: number,
  termInMonths: number
): {
  finalAmount: number;
  totalInterest: number;
} => {
  const totalInterest = principal * (annualRate / 100) * (termInMonths / 12);
  const finalAmount = principal + totalInterest;

  return {
    finalAmount,
    totalInterest,
  };
};

/**
 * Compare savings products
 */
export const compareSavingsProducts = (
  amount: number,
  termInMonths: number,
  includeCompound: boolean = true
): {
  productComparisons: BankRateComparison[];
  bestProduct: BankRateComparison | null;
  monthlyProjections: Array<{
    month: number;
    simple: number;
    compound: number;
    difference: number;
  }>;
} => {
  const products = getBestSavingsRates(termInMonths, amount);
  const monthlyProjections: Array<{ month: number; simple: number; compound: number; difference: number }> = [];

  if (products.length > 0) {
    const bestProduct = products[0];

    for (let month = 1; month <= termInMonths; month++) {
      const simpleResult = calculateSimpleInterest(amount, bestProduct.rate, month);
      const compoundResult = calculateCompoundInterest(amount, bestProduct.rate, month, 12);

      monthlyProjections.push({
        month,
        simple: simpleResult.finalAmount,
        compound: compoundResult.finalAmount,
        difference: compoundResult.finalAmount - simpleResult.finalAmount,
      });
    }

    return {
      productComparisons: products,
      bestProduct,
      monthlyProjections,
    };
  }

  return {
    productComparisons: products,
    bestProduct: null,
    monthlyProjections: [],
  };
};

/**
 * Get market rate summary
 */
export const getMarketRateSummary = (): MarketRateSummary => {
  const savingsProducts = getAllSavingsProducts();
  const loanProducts = getAllLoanProducts();

  const averageSavingsRate = savingsProducts.reduce((sum, product) => sum + product.interestRate, 0) / savingsProducts.length;

  const homeLoanProducts = loanProducts.filter(p => p.loanType === 'home');
  const averageHomeLoanRate = homeLoanProducts.length > 0
    ? (homeLoanProducts.reduce((sum, product) => sum + (product.minInterestRate + product.maxInterestRate) / 2, 0) / homeLoanProducts.length).toFixed(1)
    : '0.0';

  const highestSavingsRate = getBestSavingsRates(12).find(comparison => comparison.rate > 0) || {
    bankId: '',
    bankName: '',
    rate: 0,
    effectiveRate: 0,
    minimumAmount: 0,
    features: [],
    pros: [],
    cons: [],
    score: 0,
  };

  const lowestLoanRate = getBestLoanRates('home', 1000000000).find(comparison => comparison.rate > 0) || {
    bankId: '',
    bankName: '',
    rate: 0,
    effectiveRate: 0,
    minimumAmount: 0,
    features: [],
    pros: [],
    cons: [],
    score: 0,
  };

  return {
    averageSavingsRate,
    averageLoanRate: averageHomeLoanRate,
    highestSavingsRate,
    lowestLoanRate,
    rateTrends: {
      direction: 'stable',
      change: 0.1,
      period: 'tháng qua',
    },
  };
};

/**
 * Calculate bank score for comparison
 */
function calculateBankScore(product: SavingsProduct): number {
  let score = 0;

  // Interest rate weight (40%)
  score += (product.interestRate / 10) * 40;

  // Minimum amount penalty (20%)
  if (product.minimumAmount <= 1000000) score += 20;
  else if (product.minimumAmount <= 10000000) score += 15;
  else if (product.minimumAmount <= 100000000) score += 10;
  else if (product.minimumAmount <= 500000000) score += 5;

  // Bank reputation (20%)
  if (product.bankName === 'Vietcombank') score += 20;
  else if (['Techcombank', 'ACB', 'MB Bank'].includes(product.bankName)) score += 15;
  else score += 10;

  // Features (20%)
  if (product.autoRenewal) score += 10;
  if (product.isOnlineOnly) score += 5;
  if (product.specialConditions.length === 0) score += 5;

  return Math.min(100, score);
}

/**
 * Calculate loan product score
 */
function calculateLoanProductScore(product: LoanProduct, loanAmount: number): number {
  let score = 0;

  // Interest rate weight (40%)
  const averageRate = (product.minInterestRate + product.maxInterestRate) / 2;
  score += ((15 - averageRate) / 15) * 40;

  // Processing time (20%)
  if (product.processingTime.includes('2-5')) score += 20;
  else if (product.processingTime.includes('5-10')) score += 15;
  else if (product.processingTime.includes('7-14')) score += 10;
  else score += 5;

  // Collateral requirement (20%)
  if (!product.collateralRequired) score += 20;
  else score += 5;

  // Bank reputation (20%)
  if (product.bankName === 'Vietcombank') score += 20;
  else if(['Techcombank', 'ACB', 'MB Bank'].includes(product.bankName)) score += 15;
  else score += 10;

  return Math.min(100, score);
}

/**
 * Calculate effective annual rate
 */
function calculateEffectiveAnnualRate(nominalRate: number, compoundingFrequency: number): number {
  return Math.pow(1 + nominalRate / 100 / compoundingFrequency, compoundingFrequency) - 1;
}

/**
 * Format currency amount
 */
function formatVND(amount: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export default {
  getAllSavingsProducts,
  getBestSavingsRates,
  getAllLoanProducts,
  getBestLoanRates,
  calculateCompoundInterest,
  calculateSimpleInterest,
  compareSavingsProducts,
  getMarketRateSummary,
};