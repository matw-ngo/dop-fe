/**
 * Core Financial Calculations Engine
 *
 * This module provides comprehensive financial calculation functions for the Vietnamese
 * market, including loan calculations, interest calculations, tax calculations, and
 * financial analysis tools.
 */

import { formatVND } from "../financial-data/vietnamese-financial-data";
import { calculatePersonalIncomeTax } from "../financial-data/tax-brackets";

// Type definitions
export type InterestRateType =
  | "reducing_balance"
  | "flat_rate"
  | "fixed"
  | "floating"
  | "promotional";
export type LoanType =
  | "home"
  | "auto"
  | "consumer"
  | "business"
  | "credit_card";
export type PaymentFrequency =
  | "monthly"
  | "quarterly"
  | "semi_annual"
  | "annual";

export interface LoanCalculationParams {
  principal: number;
  annualRate: number;
  termInMonths: number;
  rateType: InterestRateType;
  loanType?: LoanType;
  paymentFrequency?: PaymentFrequency;
  promotionalPeriod?: number; // in months
  promotionalRate?: number;
  floatingRateIndex?: string;
  floatingRateSpread?: number;
  hasInsurance?: boolean;
  insuranceRate?: number;
  processingFee?: number;
  earlyRepaymentPenalty?: number;
}

export interface LoanPaymentSchedule {
  period: number;
  paymentDate: string;
  beginningBalance: number;
  scheduledPayment: number;
  principalPayment: number;
  interestPayment: number;
  endingBalance: number;
  totalInterest: number;
  totalPayments: number;
}

export interface LoanCalculationResult {
  loanParams: LoanCalculationParams;
  monthlyPayment: number;
  totalPayment: number;
  totalInterest: number;
  effectiveInterestRate: number;
  paymentSchedule: LoanPaymentSchedule[];
  earlyRepaymentPenalty: number;
  processingFees: number;
  insuranceFees: number;
  totalCosts: number;
  apr: number; // Annual Percentage Rate
  dscr?: number; // Debt Service Coverage Ratio (for business loans)
  affordabilityScore?: number; // 0-100 score
}

export interface EarlyRepaymentCalculation {
  originalLoan: LoanCalculationResult;
  currentMonth: number;
  outstandingBalance: number;
  earlyRepaymentAmount: number;
  penaltyAmount: number;
  interestSaved: number;
  netSavings: number;
  newPaymentSchedule?: LoanPaymentSchedule[];
}

export interface AffordabilityAnalysis {
  monthlyIncome: number;
  monthlyDebts: number;
  maxMonthlyPayment: number;
  recommendedLoanAmount: number;
  debtToIncomeRatio: number;
  affordabilityScore: number;
  recommendations: string[];
  riskLevel: "low" | "medium" | "high";
}

export interface FinancialHealthScore {
  overallScore: number; // 0-100
  creditScore: number;
  incomeStability: number;
  debtManagement: number;
  savingsRate: number;
  investmentDiversity: number;
  recommendations: string[];
  riskFactors: string[];
  strengths: string[];
}

/**
 * Calculate loan payment using reducing balance method (most common in Vietnam)
 */
export const calculateReducingBalancePayment = (
  principal: number,
  annualRate: number,
  termInMonths: number,
  paymentFrequency: PaymentFrequency = "monthly",
): number => {
  const frequencyMultiplier = getFrequencyMultiplier(paymentFrequency);
  const adjustedRate = annualRate / 100 / frequencyMultiplier;
  const adjustedTerm = termInMonths / frequencyMultiplier;

  if (adjustedRate === 0) return principal / adjustedTerm;

  return (
    (principal * (adjustedRate * Math.pow(1 + adjustedRate, adjustedTerm))) /
    (Math.pow(1 + adjustedRate, adjustedTerm) - 1)
  );
};

/**
 * Calculate loan payment using flat rate method
 */
export const calculateFlatRatePayment = (
  principal: number,
  annualRate: number,
  termInMonths: number,
): number => {
  const totalInterest = principal * (annualRate / 100) * (termInMonths / 12);
  const totalPayment = principal + totalInterest;
  return totalPayment / termInMonths;
};

/**
 * Get frequency multiplier for payment calculations
 */
function getFrequencyMultiplier(frequency: PaymentFrequency): number {
  switch (frequency) {
    case "monthly":
      return 12;
    case "quarterly":
      return 4;
    case "semi_annual":
      return 2;
    case "annual":
      return 1;
    default:
      return 12;
  }
}

/**
 * Generate complete loan payment schedule
 */
export const generatePaymentSchedule = (
  params: LoanCalculationParams,
): LoanPaymentSchedule[] => {
  const schedule: LoanPaymentSchedule[] = [];
  let beginningBalance = params.principal;
  let totalInterestPaid = 0;
  let totalPaymentsMade = 0;

  for (let period = 1; period <= params.termInMonths; period++) {
    const isPromotional =
      params.promotionalPeriod && period <= params.promotionalPeriod;
    const currentRate =
      isPromotional && params.promotionalRate
        ? params.promotionalRate
        : params.annualRate;

    let payment: number;
    let principalPayment: number;
    let interestPayment: number;

    if (params.rateType === "flat_rate") {
      payment = calculateFlatRatePayment(
        beginningBalance,
        currentRate,
        params.termInMonths - period + 1,
      );
      interestPayment = (beginningBalance * (currentRate / 100)) / 12;
      principalPayment = payment - interestPayment;
    } else {
      // Reducing balance calculation
      payment = calculateReducingBalancePayment(
        beginningBalance,
        currentRate,
        params.termInMonths - period + 1,
      );
      interestPayment = (beginningBalance * (currentRate / 100)) / 12;
      principalPayment = payment - interestPayment;
    }

    const endingBalance = Math.max(0, beginningBalance - principalPayment);
    totalInterestPaid += interestPayment;
    totalPaymentsMade += payment;

    // Calculate payment date
    const paymentDate = new Date();
    paymentDate.setMonth(paymentDate.getMonth() + period);

    schedule.push({
      period,
      paymentDate: paymentDate.toISOString().split("T")[0],
      beginningBalance,
      scheduledPayment: payment,
      principalPayment,
      interestPayment,
      endingBalance,
      totalInterest: totalInterestPaid,
      totalPayments: totalPaymentsMade,
    });

    beginningBalance = endingBalance;
  }

  return schedule;
};

/**
 * Calculate comprehensive loan details
 */
export const calculateLoanDetails = (
  params: LoanCalculationParams,
): LoanCalculationResult => {
  // Calculate monthly payment
  let monthlyPayment: number;
  if (params.rateType === "flat_rate") {
    monthlyPayment = calculateFlatRatePayment(
      params.principal,
      params.annualRate,
      params.termInMonths,
    );
  } else {
    monthlyPayment = calculateReducingBalancePayment(
      params.principal,
      params.annualRate,
      params.termInMonths,
      params.paymentFrequency,
    );
  }

  // Generate payment schedule
  const paymentSchedule = generatePaymentSchedule(params);

  // Calculate totals
  const totalPayment = paymentSchedule.reduce(
    (sum, payment) => sum + payment.scheduledPayment,
    0,
  );
  const totalInterest = paymentSchedule.reduce(
    (sum, payment) => sum + payment.interestPayment,
    0,
  );

  // Calculate additional costs
  const processingFees = params.processingFee
    ? params.principal * (params.processingFee / 100)
    : 0;
  const insuranceFees =
    params.hasInsurance && params.insuranceRate
      ? params.principal * (params.insuranceRate / 100)
      : 0;

  // Calculate early repayment penalty (if applicable)
  const earlyRepaymentPenalty = params.earlyRepaymentPenalty
    ? params.principal * (params.earlyRepaymentPenalty / 100)
    : 0;

  // Calculate effective interest rate
  const totalCosts = totalInterest + processingFees + insuranceFees;
  const effectiveInterestRate =
    (totalCosts / params.principal) * (12 / params.termInMonths) * 100;

  // Calculate APR (includes fees)
  const apr = calculateAPR(
    params.principal,
    monthlyPayment,
    params.termInMonths,
    processingFees,
  );

  // Calculate affordability score (placeholder - would need more data)
  const affordabilityScore = calculateAffordabilityScore(params);

  return {
    loanParams: params,
    monthlyPayment,
    totalPayment,
    totalInterest,
    effectiveInterestRate,
    paymentSchedule,
    earlyRepaymentPenalty,
    processingFees,
    insuranceFees,
    totalCosts,
    apr,
    affordabilityScore,
  };
};

/**
 * Calculate Annual Percentage Rate (APR)
 */
export const calculateAPR = (
  principal: number,
  monthlyPayment: number,
  termInMonths: number,
  fees: number = 0,
): number => {
  const financedAmount = principal - fees;
  const monthlyRate = monthlyPayment / financedAmount - 1 / termInMonths;

  // Iterative solution for APR
  let apr = monthlyRate * 12 * 100;
  let tolerance = 0.0001;
  let maxIterations = 100;
  let iteration = 0;

  while (iteration < maxIterations) {
    const testPayment =
      (financedAmount *
        (apr / 100 / 12) *
        Math.pow(1 + apr / 100 / 12, termInMonths)) /
      (Math.pow(1 + apr / 100 / 12, termInMonths) - 1);

    if (Math.abs(testPayment - monthlyPayment) < tolerance) {
      break;
    }

    if (testPayment > monthlyPayment) {
      apr -= 0.1;
    } else {
      apr += 0.1;
    }

    iteration++;
  }

  return Math.max(0, apr);
};

/**
 * Calculate early repayment options
 */
export const calculateEarlyRepayment = (
  loan: LoanCalculationResult,
  currentMonth: number,
  earlyRepaymentAmount: number,
): EarlyRepaymentCalculation => {
  if (currentMonth < 1 || currentMonth > loan.paymentSchedule.length) {
    throw new Error("Invalid current month");
  }

  const currentPayment = loan.paymentSchedule[currentMonth - 1];
  const outstandingBalance = currentPayment.endingBalance;
  const remainingMonths = loan.paymentSchedule.length - currentMonth;

  // Calculate penalty
  const penaltyRate = loan.loanParams.earlyRepaymentPenalty || 0.03;
  const penaltyAmount = earlyRepaymentAmount * penaltyRate;

  // Calculate interest saved
  const remainingInterest = loan.paymentSchedule
    .slice(currentMonth)
    .reduce((sum, payment) => sum + payment.interestPayment, 0);

  const interestSaved =
    remainingInterest * (earlyRepaymentAmount / outstandingBalance);
  const netSavings = interestSaved - penaltyAmount;

  // Generate new payment schedule (simplified)
  const newPrincipal = outstandingBalance - earlyRepaymentAmount;
  const newPaymentSchedule =
    newPrincipal > 0
      ? generatePaymentSchedule({
          ...loan.loanParams,
          principal: newPrincipal,
          termInMonths: remainingMonths,
        })
      : [];

  return {
    originalLoan: loan,
    currentMonth,
    outstandingBalance,
    earlyRepaymentAmount,
    penaltyAmount,
    interestSaved,
    netSavings,
    newPaymentSchedule,
  };
};

/**
 * Analyze loan affordability
 */
export const analyzeAffordability = (
  monthlyIncome: number,
  monthlyDebts: number,
  interestRate: number,
  targetLoanAmount: number,
  termInMonths: number,
): AffordabilityAnalysis => {
  // Calculate monthly payment for target loan
  const monthlyPayment = calculateReducingBalancePayment(
    targetLoanAmount,
    interestRate,
    termInMonths,
  );

  // Calculate debt-to-income ratio
  const totalMonthlyDebts = monthlyDebts + monthlyPayment;
  const debtToIncomeRatio = (totalMonthlyDebts / monthlyIncome) * 100;

  // Maximum recommended payment (30% of income)
  const maxMonthlyPayment = monthlyIncome * 0.3;

  // Maximum recommended loan amount
  const recommendedLoanAmount =
    (maxMonthlyPayment * termInMonths * 12) /
    (1 + (interestRate / 100) * (termInMonths / 24));

  // Calculate affordability score
  let score = 100;
  if (debtToIncomeRatio > 50) score = 20;
  else if (debtToIncomeRatio > 40) score = 40;
  else if (debtToIncomeRatio > 35) score = 60;
  else if (debtToIncomeRatio > 30) score = 80;

  const recommendations: string[] = [];
  let riskLevel: "low" | "medium" | "high" = "low";

  if (debtToIncomeRatio > 50) {
    riskLevel = "high";
    recommendations.push(
      "Tỷ lệ nợ quá cao - không nên vay số tiền này",
      "Cần giảm số tiền vay hoặc tăng thu nhập",
      "Xem xét các lựa chọn tài chính khác",
    );
  } else if (debtToIncomeRatio > 40) {
    riskLevel = "medium";
    recommendations.push(
      "Tỷ lệ nợ khá cao - cần cân nhắc kỹ",
      "Nên có khoản tiết kiệm dự phòng",
      "Xem xét kéo dài thời gian vay",
    );
  } else {
    recommendations.push(
      "Tỷ lệ nợ trong giới hạn an toàn",
      "Có thể xem xét tăng số tiền vay nếu cần",
      "Duy trì thói quen tiết kiệm tốt",
    );
  }

  return {
    monthlyIncome,
    monthlyDebts,
    maxMonthlyPayment,
    recommendedLoanAmount,
    debtToIncomeRatio,
    affordabilityScore: score,
    recommendations,
    riskLevel,
  };
};

/**
 * Calculate affordability score (0-100)
 */
function calculateAffordabilityScore(params: LoanCalculationParams): number {
  let score = 50; // Base score

  // Adjust based on interest rate
  if (params.annualRate < 8) score += 20;
  else if (params.annualRate < 12) score += 10;
  else if (params.annualRate > 18) score -= 20;

  // Adjust based on loan term
  if (params.termInMonths < 60) score += 10;
  else if (params.termInMonths > 240) score -= 10;

  // Adjust based on rate type
  if (params.rateType === "reducing_balance") score += 10;
  else if (params.rateType === "flat_rate") score -= 10;

  // Adjust based on insurance
  if (params.hasInsurance) score += 5;

  return Math.max(0, Math.min(100, score));
}

/**
 * Calculate financial health score
 */
export const calculateFinancialHealthScore = (
  monthlyIncome: number,
  monthlyExpenses: number,
  monthlyDebts: number,
  monthlySavings: number,
  creditScore: number,
  hasEmergencyFund: boolean,
  hasInsurance: boolean,
  investmentDiversity: number = 0,
): FinancialHealthScore => {
  // Income stability (based on savings rate)
  const savingsRate = (monthlySavings / monthlyIncome) * 100;
  const incomeStability = Math.min(100, savingsRate * 2);

  // Debt management (inverse of debt-to-income ratio)
  const debtToIncomeRatio = (monthlyDebts / monthlyIncome) * 100;
  const debtManagement = Math.max(0, 100 - debtToIncomeRatio * 2);

  // Savings rate
  const savingsRateScore = Math.min(100, savingsRate * 3);

  // Investment diversity (0-100 based on portfolio diversification)
  const investmentDiversityScore = investmentDiversity;

  // Overall score calculation
  const overallScore =
    creditScore * 0.25 +
    incomeStability * 0.2 +
    debtManagement * 0.2 +
    savingsRateScore * 0.2 +
    investmentDiversityScore * 0.15;

  // Generate recommendations
  const recommendations: string[] = [];
  const riskFactors: string[] = [];
  const strengths: string[] = [];

  if (savingsRate < 10) {
    recommendations.push("Tăng tỷ lệ tiết kiệm lên ít nhất 10% thu nhập");
    riskFactors.push("Tỷ lệ tiết kiệm thấp");
  } else {
    strengths.push("Tỷ lệ tiết kiệm tốt");
  }

  if (debtToIncomeRatio > 35) {
    recommendations.push("Giảm nợ hiện tại xuống dưới 35% thu nhập");
    riskFactors.push("Tỷ lệ nợ cao");
  } else {
    strengths.push("Quản lý nợ tốt");
  }

  if (!hasEmergencyFund) {
    recommendations.push("Thiết lập quỹ khẩn cấp 3-6 tháng chi phí");
    riskFactors.push("Không có quỹ khẩn cấp");
  } else {
    strengths.push("Có quỹ khẩn cấp");
  }

  if (!hasInsurance) {
    recommendations.push("Cân nhắc mua bảo hiểm nhân thọ và sức khỏe");
    riskFactors.push("Thiếu bảo hiểm");
  } else {
    strengths.push("Có bảo hiểm");
  }

  if (creditScore < 700) {
    recommendations.push("Cải thiện điểm tín dụng");
    riskFactors.push("Điểm tín dụng thấp");
  } else {
    strengths.push("Điểm tín dụng tốt");
  }

  if (investmentDiversity < 50) {
    recommendations.push("Đa dạng hóa danh mục đầu tư");
    riskFactors.push("Đầu tư thiếu đa dạng");
  } else {
    strengths.push("Danh mục đầu tư đa dạng");
  }

  return {
    overallScore: Math.round(overallScore),
    creditScore,
    incomeStability: Math.round(incomeStability),
    debtManagement: Math.round(debtManagement),
    savingsRate: Math.round(savingsRateScore),
    investmentDiversity: Math.round(investmentDiversityScore),
    recommendations,
    riskFactors,
    strengths,
  };
};

/**
 * Validate loan calculation parameters
 */
export const validateLoanParams = (params: LoanCalculationParams): string[] => {
  const errors: string[] = [];

  if (params.principal <= 0) {
    errors.push("Số tiền vay phải lớn hơn 0");
  }

  if (params.principal > 10000000000) {
    // 10 billion VND
    errors.push("Số tiền vay vượt quá giới hạn cho phép");
  }

  if (params.annualRate < 0 || params.annualRate > 50) {
    errors.push("Lãi suất không hợp lệ");
  }

  if (params.termInMonths < 1 || params.termInMonths > 360) {
    errors.push("Kỳ hạn vay không hợp lệ (1-360 tháng)");
  }

  if (params.promotionalRate && params.promotionalRate < 0) {
    errors.push("Lãi suất ưu đãi không được âm");
  }

  if (
    params.promotionalPeriod &&
    params.promotionalPeriod > params.termInMonths
  ) {
    errors.push("Thời gian ưu đãi không thể lớn hơn thời gian vay");
  }

  if (
    params.processingFee &&
    (params.processingFee < 0 || params.processingFee > 10)
  ) {
    errors.push("Phí xử lý không hợp lệ (0-10%)");
  }

  if (
    params.insuranceRate &&
    (params.insuranceRate < 0 || params.insuranceRate > 5)
  ) {
    errors.push("Tỷ lệ bảo hiểm không hợp lệ (0-5%)");
  }

  return errors;
};

/**
 * Format loan results for display
 */
export const formatLoanResults = (
  result: LoanCalculationResult,
): {
  monthlyPaymentFormatted: string;
  totalPaymentFormatted: string;
  totalInterestFormatted: string;
  effectiveRateFormatted: string;
  aprFormatted: string;
  totalCostsFormatted: string;
} => {
  return {
    monthlyPaymentFormatted: formatVND(result.monthlyPayment),
    totalPaymentFormatted: formatVND(result.totalPayment),
    totalInterestFormatted: formatVND(result.totalInterest),
    effectiveRateFormatted: `${result.effectiveInterestRate.toFixed(2)}%`,
    aprFormatted: `${result.apr.toFixed(2)}%`,
    totalCostsFormatted: formatVND(result.totalCosts),
  };
};

export default {
  calculateReducingBalancePayment,
  calculateFlatRatePayment,
  generatePaymentSchedule,
  calculateLoanDetails,
  calculateAPR,
  calculateEarlyRepayment,
  analyzeAffordability,
  calculateFinancialHealthScore,
  validateLoanParams,
  formatLoanResults,
};
