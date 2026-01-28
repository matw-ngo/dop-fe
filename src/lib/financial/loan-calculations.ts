/**
 * Vietnamese Loan Calculations
 *
 * Specialized calculations for Vietnamese loan products including home loans,
 * auto loans, consumer loans, and business loans with Vietnamese market specifics.
 */

import {
  EARLY_REPAYMENT_PENALTIES,
  LOAN_PROCESSING_FEES,
} from "../financial-data/vietnamese-financial-data";
import {
  calculateLoanDetails,
  type LoanCalculationParams,
  type LoanCalculationResult,
} from "./calculations";

export interface VietnameseLoanSpecifics {
  loanType: string;
  collateralType: "real_estate" | "vehicle" | "deposits" | "guarantee" | "none";
  collateralValue?: number;
  ltvRatio?: number; // Loan-to-Value ratio
  disbursementMethod: "lump_sum" | "installment" | "flexible";
  interestPaymentMethod: "monthly" | "quarterly" | "bulleted";
  gracePeriod?: number; // in months
  fixedRatePeriod?: number; // in months
  floatingRateIndex?: "sbv_base" | "interbank" | "custom";
  floatingRateSpread?: number;
}

export interface HomeLoanParams extends VietnameseLoanSpecifics {
  propertyType: "apartment" | "house" | "land" | "under_construction";
  propertyLocation: "hanoi" | "hcmc" | "other";
  isPrimaryResidence: boolean;
  hasExistingMortgage?: boolean;
  constructionProgress?: number; // for under construction properties
}

export interface AutoLoanParams extends VietnameseLoanSpecifics {
  vehicleType: "new_car" | "used_car" | "motorcycle";
  vehicleBrand?: string;
  vehicleModel?: string;
  vehicleYear?: number;
  vehicleValue: number;
  isNewCar: boolean;
  hasComprehensiveInsurance?: boolean;
}

export interface ConsumerLoanParams extends VietnameseLoanSpecifics {
  purpose:
    | "debt_consolidation"
    | "home_improvement"
    | "education"
    | "medical"
    | "travel"
    | "other";
  employmentType: "permanent" | "contract" | "freelancer" | "business_owner";
  monthlyIncome: number;
  creditScore?: number;
  hasGuarantor?: boolean;
}

export interface BusinessLoanParams extends VietnameseLoanSpecifics {
  businessType: "sole_proprietor" | "partnership" | "llc" | "corporation";
  businessAge: number; // in years
  annualRevenue: number;
  profitability: number; // profit margin percentage
  businessPlan?: boolean;
  collateralDescription?: string;
}

export interface LoanComparisonResult {
  loan1: LoanCalculationResult;
  loan2: LoanCalculationResult;
  comparison: {
    cheaperMonthlyPayment: "loan1" | "loan2" | "equal";
    cheaperTotalInterest: "loan1" | "loan2" | "equal";
    lowerEffectiveRate: "loan1" | "loan2" | "equal";
    savings: {
      monthlyPaymentDifference: number;
      totalInterestDifference: number;
      totalCostDifference: number;
    };
    recommendation: string;
    reasoning: string[];
  };
}

/**
 * Calculate Vietnamese home loan specifics
 */
export const calculateHomeLoan = (
  principal: number,
  annualRate: number,
  termInMonths: number,
  specifics: HomeLoanParams,
): LoanCalculationResult & { homeLoanDetails: HomeLoanParams } => {
  // Adjust LTV ratio based on property type and location
  let maxLTV = 0.8; // 80% default
  if (specifics.propertyType === "apartment" && specifics.isPrimaryResidence) {
    maxLTV =
      specifics.propertyLocation === "hanoi" ||
      specifics.propertyLocation === "hcmc"
        ? 0.8
        : 0.75;
  } else if (specifics.propertyType === "land") {
    maxLTV = 0.6;
  } else if (specifics.propertyType === "under_construction") {
    maxLTV =
      specifics.constructionProgress && specifics.constructionProgress > 50
        ? 0.7
        : 0.6;
  }

  // Calculate required collateral value
  const requiredCollateralValue = principal / (specifics.ltvRatio || maxLTV);

  // Adjust interest rate based on LTV
  let adjustedRate = annualRate;
  if (specifics.ltvRatio && specifics.ltvRatio > 0.7) {
    adjustedRate += 0.5; // Higher rate for high LTV
  }

  // Adjust for existing mortgage
  if (specifics.hasExistingMortgage) {
    adjustedRate += 1.0;
  }

  // Build loan parameters
  const loanParams: LoanCalculationParams = {
    principal,
    annualRate: adjustedRate,
    termInMonths,
    rateType: specifics.loanType === "fixed" ? "fixed" : "reducing_balance",
    promotionalPeriod: specifics.fixedRatePeriod,
    promotionalRate: specifics.fixedRatePeriod ? annualRate : undefined,
    hasInsurance: true,
    insuranceRate: 0.3, // Home insurance typically 0.3%
    processingFee:
      LOAN_PROCESSING_FEES.assessment +
      LOAN_PROCESSING_FEES.appraisal +
      LOAN_PROCESSING_FEES.legal,
    earlyRepaymentPenalty: EARLY_REPAYMENT_PENALTIES.fixedRate,
  };

  const calculationResult = calculateLoanDetails(loanParams);

  return {
    ...calculationResult,
    homeLoanDetails: {
      ...specifics,
      collateralValue: requiredCollateralValue,
      ltvRatio: principal / requiredCollateralValue,
    },
  };
};

/**
 * Calculate Vietnamese auto loan specifics
 */
export const calculateAutoLoan = (
  principal: number,
  annualRate: number,
  termInMonths: number,
  specifics: AutoLoanParams,
): LoanCalculationResult & { autoLoanDetails: AutoLoanParams } => {
  // Adjust LTV ratio for vehicles
  let _maxLTV = specifics.isNewCar ? 0.8 : 0.7; // Lower LTV for used cars

  // Adjust based on vehicle age
  if (specifics.vehicleYear && !specifics.isNewCar) {
    const currentYear = new Date().getFullYear();
    const vehicleAge = currentYear - specifics.vehicleYear;
    if (vehicleAge > 5) _maxLTV = 0.5;
    else if (vehicleAge > 3) _maxLTV = 0.6;
  }

  // Adjust interest rate based on vehicle type and age
  let adjustedRate = annualRate;
  if (!specifics.isNewCar) {
    adjustedRate += 2.0; // Higher rate for used cars
  }

  if (
    specifics.vehicleBrand &&
    ["luxury", "premium"].includes(specifics.vehicleBrand.toLowerCase())
  ) {
    adjustedRate += 0.5; // Slightly higher for luxury brands
  }

  // Build loan parameters
  const loanParams: LoanCalculationParams = {
    principal,
    annualRate: adjustedRate,
    termInMonths,
    rateType: "reducing_balance",
    hasInsurance: specifics.hasComprehensiveInsurance,
    insuranceRate: specifics.hasComprehensiveInsurance ? 1.5 : 0, // Comprehensive insurance
    processingFee: LOAN_PROCESSING_FEES.assessment + LOAN_PROCESSING_FEES.legal,
    earlyRepaymentPenalty: EARLY_REPAYMENT_PENALTIES.fixedRate,
  };

  const calculationResult = calculateLoanDetails(loanParams);

  return {
    ...calculationResult,
    autoLoanDetails: {
      ...specifics,
      collateralValue: specifics.vehicleValue,
      ltvRatio: principal / specifics.vehicleValue,
    },
  };
};

/**
 * Calculate Vietnamese consumer loan specifics
 */
export const calculateConsumerLoan = (
  principal: number,
  annualRate: number,
  termInMonths: number,
  specifics: ConsumerLoanParams,
): LoanCalculationResult & { consumerLoanDetails: ConsumerLoanParams } => {
  // Adjust interest rate based on risk factors
  let adjustedRate = annualRate;

  // Adjust for employment type
  if (
    specifics.employmentType === "freelancer" ||
    specifics.employmentType === "business_owner"
  ) {
    adjustedRate += 2.0;
  } else if (specifics.employmentType === "contract") {
    adjustedRate += 1.0;
  }

  // Adjust for income level
  const incomeRatio = principal / specifics.monthlyIncome;
  if (incomeRatio > 10) {
    // Loan amount more than 10x monthly income
    adjustedRate += 1.5;
  } else if (incomeRatio > 7) {
    adjustedRate += 1.0;
  }

  // Adjust for credit score
  if (specifics.creditScore) {
    if (specifics.creditScore < 600) {
      adjustedRate += 3.0;
    } else if (specifics.creditScore < 700) {
      adjustedRate += 1.5;
    } else if (specifics.creditScore > 800) {
      adjustedRate -= 0.5;
    }
  }

  // Adjust for guarantor
  if (specifics.hasGuarantor) {
    adjustedRate -= 0.5;
  }

  // Build loan parameters
  const loanParams: LoanCalculationParams = {
    principal,
    annualRate: adjustedRate,
    termInMonths,
    rateType: "flat_rate", // Consumer loans often use flat rate
    hasInsurance: false,
    processingFee: LOAN_PROCESSING_FEES.assessment,
    earlyRepaymentPenalty: EARLY_REPAYMENT_PENALTIES.fixedRate,
  };

  const calculationResult = calculateLoanDetails(loanParams);

  return {
    ...calculationResult,
    consumerLoanDetails: specifics,
  };
};

/**
 * Calculate Vietnamese business loan specifics
 */
export const calculateBusinessLoan = (
  principal: number,
  annualRate: number,
  termInMonths: number,
  specifics: BusinessLoanParams,
): LoanCalculationResult & { businessLoanDetails: BusinessLoanParams } => {
  // Adjust interest rate based on business risk factors
  let adjustedRate = annualRate;

  // Adjust for business age
  if (specifics.businessAge < 1) {
    adjustedRate += 2.5; // Startup premium
  } else if (specifics.businessAge < 3) {
    adjustedRate += 1.5;
  }

  // Adjust for profitability
  if (specifics.profitability < 5) {
    adjustedRate += 2.0; // Low margin business
  } else if (specifics.profitability > 20) {
    adjustedRate -= 1.0; // High margin business
  }

  // Adjust for revenue
  const revenuePerEmployee = specifics.annualRevenue / 50; // Assume 50 employees average
  if (revenuePerEmployee < 1000000000) {
    // Less than 1 tỷ/nhân viên/năm
    adjustedRate += 1.0;
  }

  // Adjust for business type
  if (
    specifics.businessType === "sole_proprietor" ||
    specifics.businessType === "partnership"
  ) {
    adjustedRate += 0.5; // Higher risk than corporations
  }

  // Build loan parameters
  const loanParams: LoanCalculationParams = {
    principal,
    annualRate: adjustedRate,
    termInMonths,
    rateType: "reducing_balance",
    hasInsurance: false,
    processingFee: LOAN_PROCESSING_FEES.assessment + LOAN_PROCESSING_FEES.legal,
    earlyRepaymentPenalty: EARLY_REPAYMENT_PENALTIES.fixedRate,
  };

  const calculationResult = calculateLoanDetails(loanParams);

  // Calculate DSCR if revenue data is available
  const monthlyPayment = calculationResult.monthlyPayment;
  const monthlyRevenue = specifics.annualRevenue / 12;
  const monthlyExpenses = monthlyRevenue * (1 - specifics.profitability / 100);
  const monthlyCashFlow = monthlyRevenue - monthlyExpenses;
  const dscr = monthlyCashFlow / monthlyPayment;

  return {
    ...calculationResult,
    businessLoanDetails: specifics,
    dscr,
  };
};

/**
 * Compare two loan options
 */
export const compareLoanOptions = (
  loan1: LoanCalculationResult,
  loan2: LoanCalculationResult,
): LoanComparisonResult => {
  const monthlyPaymentDiff = loan2.monthlyPayment - loan1.monthlyPayment;
  const totalInterestDiff = loan2.totalInterest - loan1.totalInterest;
  const totalCostDiff = loan2.totalCosts - loan1.totalCosts;

  const cheaperMonthlyPayment =
    monthlyPaymentDiff < 0
      ? "loan2"
      : monthlyPaymentDiff > 0
        ? "loan1"
        : "equal";
  const cheaperTotalInterest =
    totalInterestDiff < 0 ? "loan2" : totalInterestDiff > 0 ? "loan1" : "equal";
  const lowerEffectiveRate =
    loan2.effectiveInterestRate < loan1.effectiveInterestRate
      ? "loan2"
      : loan2.effectiveInterestRate > loan1.effectiveInterestRate
        ? "loan1"
        : "equal";

  const _recommendations: string[] = [];
  const reasoning: string[] = [];

  // Analyze which loan is better
  let recommendation = "";
  const score1 = calculateLoanScore(loan1);
  const score2 = calculateLoanScore(loan2);

  if (score1 > score2 + 10) {
    recommendation = "Option 1 is significantly better";
    reasoning.push("Option 1 has better overall terms and lower total cost");
  } else if (score2 > score1 + 10) {
    recommendation = "Option 2 is significantly better";
    reasoning.push("Option 2 has better overall terms and lower total cost");
  } else {
    recommendation = "Both options are comparable";
    reasoning.push(
      "Both options have similar terms - consider other factors like customer service and convenience",
    );
  }

  if (Math.abs(monthlyPaymentDiff) > 1000000) {
    reasoning.push(
      `Monthly payment difference: ${Math.abs(monthlyPaymentDiff).toLocaleString("vi-VN")} VND`,
    );
  }

  if (Math.abs(totalInterestDiff) > 10000000) {
    reasoning.push(
      `Total interest difference: ${Math.abs(totalInterestDiff).toLocaleString("vi-VN")} VND`,
    );
  }

  return {
    loan1,
    loan2,
    comparison: {
      cheaperMonthlyPayment,
      cheaperTotalInterest,
      lowerEffectiveRate,
      savings: {
        monthlyPaymentDifference: Math.abs(monthlyPaymentDiff),
        totalInterestDifference: Math.abs(totalInterestDiff),
        totalCostDifference: Math.abs(totalCostDiff),
      },
      recommendation,
      reasoning,
    },
  };
};

/**
 * Calculate loan score for comparison
 */
function calculateLoanScore(loan: LoanCalculationResult): number {
  let score = 50; // Base score

  // Lower interest rate is better
  score += Math.max(0, (20 - loan.effectiveInterestRate) * 2);

  // Lower total costs is better
  const costRatio = loan.totalCosts / loan.loanParams.principal;
  score += Math.max(0, (1 - costRatio) * 30);

  // Lower monthly payment relative to principal is better
  const paymentRatio = loan.monthlyPayment / loan.loanParams.principal;
  score += Math.max(0, (1 - paymentRatio * 100) * 10);

  // Flexible terms are better
  if (loan.loanParams.loanType === "reducing_balance") score += 10;
  if (loan.loanParams.promotionalPeriod) score += 5;

  return Math.max(0, Math.min(100, score));
}

/**
 * Get loan eligibility assessment
 */
export const assessLoanEligibility = (
  loanType: string,
  principal: number,
  monthlyIncome: number,
  monthlyDebts: number,
  creditScore: number = 650,
  hasCollateral: boolean = true,
): {
  eligible: boolean;
  probability: number; // 0-100%
  factors: Array<{
    factor: string;
    impact: "positive" | "negative" | "neutral";
    weight: number;
    score: number;
  }>;
  recommendations: string[];
  requiredDocuments: string[];
} => {
  const factors = [];
  let totalScore = 0;
  let totalWeight = 0;

  // Income assessment
  const debtToIncome =
    ((monthlyDebts + principal * 0.01) / monthlyIncome) * 100;
  let incomeScore = 0;
  if (debtToIncome < 30) incomeScore = 100;
  else if (debtToIncome < 40) incomeScore = 80;
  else if (debtToIncome < 50) incomeScore = 60;
  else incomeScore = 30;

  factors.push({
    factor: "Debt-to-Income Ratio",
    impact:
      debtToIncome < 40
        ? "positive"
        : debtToIncome < 50
          ? "neutral"
          : "negative",
    weight: 0.3,
    score: incomeScore,
  });

  totalScore += incomeScore * 0.3;
  totalWeight += 0.3;

  // Credit score assessment
  let creditScoreScore = 0;
  if (creditScore >= 750) creditScoreScore = 100;
  else if (creditScore >= 700) creditScoreScore = 85;
  else if (creditScore >= 650) creditScoreScore = 70;
  else if (creditScore >= 600) creditScoreScore = 50;
  else creditScoreScore = 20;

  factors.push({
    factor: "Credit Score",
    impact:
      creditScore >= 650
        ? "positive"
        : creditScore >= 600
          ? "neutral"
          : "negative",
    weight: 0.25,
    score: creditScoreScore,
  });

  totalScore += creditScoreScore * 0.25;
  totalWeight += 0.25;

  // Collateral assessment
  const collateralScore = hasCollateral ? 90 : 50;
  factors.push({
    factor: "Collateral Availability",
    impact: hasCollateral ? "positive" : "negative",
    weight: 0.2,
    score: collateralScore,
  });

  totalScore += collateralScore * 0.2;
  totalWeight += 0.2;

  // Loan amount assessment
  const loanToIncome = principal / (monthlyIncome * 12);
  let loanAmountScore = 0;
  if (loanToIncome < 2) loanAmountScore = 100;
  else if (loanToIncome < 5) loanAmountScore = 80;
  else if (loanToIncome < 10) loanAmountScore = 60;
  else loanAmountScore = 40;

  factors.push({
    factor: "Loan Amount Reasonableness",
    impact:
      loanToIncome < 5
        ? "positive"
        : loanToIncome < 10
          ? "neutral"
          : "negative",
    weight: 0.15,
    score: loanAmountScore,
  });

  totalScore += loanAmountScore * 0.15;
  totalWeight += 0.15;

  // Loan type specific factors
  let loanTypeScore = 70; // Default score
  if (loanType === "home" && hasCollateral) loanTypeScore = 90;
  if (loanType === "consumer" && !hasCollateral) loanTypeScore = 60;
  if (loanType === "business") loanTypeScore = 65;

  factors.push({
    factor: "Loan Type Risk",
    impact:
      loanTypeScore >= 70
        ? "positive"
        : loanTypeScore >= 50
          ? "neutral"
          : "negative",
    weight: 0.1,
    score: loanTypeScore,
  });

  totalScore += loanTypeScore * 0.1;
  totalWeight += 0.1;

  const finalScore = totalWeight > 0 ? totalScore / totalWeight : 50;
  const eligible = finalScore >= 60;
  const probability = Math.max(0, Math.min(100, finalScore));

  const recommendations = [];
  const requiredDocuments = [];

  if (!eligible) {
    recommendations.push("Cải thiện điểm tín dụng");
    recommendations.push("Tăng thu nhập hoặc giảm nợ hiện tại");
    recommendations.push("Cung cấp tài sản đảm bảo");
  }

  if (loanType === "home") {
    requiredDocuments.push("Giấy chứng nhận quyền sử dụng đất");
    requiredDocuments.push("Hợp đồng mua bán nhà đất");
    requiredDocuments.push("Hộ khẩu, CMND/CCCD");
  } else if (loanType === "consumer") {
    requiredDocuments.push("Hợp đồng lao động");
    requiredDocuments.push("Sao kê lương 3 tháng gần nhất");
    requiredDocuments.push("Hộ khẩu, CMND/CCCD");
  } else if (loanType === "business") {
    requiredDocuments.push("Giấy phép kinh doanh");
    requiredDocuments.push("Báo cáo tài chính 2 năm gần nhất");
    requiredDocuments.push("Kế hoạch kinh doanh/vay vốn");
  }

  return {
    eligible,
    probability,
    factors,
    recommendations,
    requiredDocuments,
  };
};

export default {
  calculateHomeLoan,
  calculateAutoLoan,
  calculateConsumerLoan,
  calculateBusinessLoan,
  compareLoanOptions,
  assessLoanEligibility,
};
