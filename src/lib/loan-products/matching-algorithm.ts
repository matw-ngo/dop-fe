// Loan Product Matching Algorithm
// Intelligent matching system for Vietnamese loan products

import type {
  VietnameseLoanProduct,
  VietnameseLoanType,
  InterestRateType,
} from "./vietnamese-loan-products";

/**
 * User profile for loan matching
 */
export interface UserProfile {
  /** Basic information */
  age: number;
  monthlyIncome: number;
  employmentType: "formal" | "informal" | "self_employed" | "business_owner" | "unemployed";
  employmentDurationMonths: number;
  creditScore?: number;
  vietnameseCitizen: boolean;

  /** Financial situation */
  existingLoans?: number;
  existingMonthlyDebt?: number;
  assets?: {
    hasRealEstate: boolean;
    hasVehicle: boolean;
    hasSavings: boolean;
    realEstateValue?: number;
    vehicleValue?: number;
    savingsAmount?: number;
  };

  /** Loan requirements */
  loanAmount: number;
  loanTerm: number;
  loanPurpose?: VietnameseLoanType;
  hasCollateral: boolean;
  collateralType?: "real_estate" | "vehicle" | "savings_book" | "guarantor" | "other";
  collateralValue?: number;

  /** Preferences */
  preferredBanks?: string[];
  maxInterestRate?: number;
  maxProcessingTime?: number; // in days
  requiresOnlineApplication?: boolean;
  requiresFastApproval?: boolean;
  prefersEarlyRepayment?: boolean;

  /** Special circumstances */
  isStudent?: boolean;
  isGovernmentEmployee?: boolean;
  isHealthcareWorker?: boolean;
  isTeacher?: boolean;
  isFirstTimeBorrower?: boolean;
  hasSalaryAccount?: {
    bankCode: string;
    durationMonths: number;
  };
}

/**
 * Matching result with score and reasoning
 */
export interface MatchingResult {
  /** The matched product */
  product: VietnameseLoanProduct;
  /** Match score (0-100) */
  score: number;
  /** Match confidence (low/medium/high) */
  confidence: "low" | "medium" | "high";
  /** Reasons for matching */
  matchReasons: string[];
  /** Match reasons in Vietnamese */
  matchReasonsVi: string[];
  /** Potential blockers */
  blockers: string[];
  /** Blockers in Vietnamese */
  blockersVi: string[];
  /** Estimated monthly payment */
  estimatedMonthlyPayment?: number;
  /** Total interest amount */
  totalInterest?: number;
  /** Total amount payable */
  totalPayable?: number;
  /** Match score breakdown */
  scoreBreakdown: {
    eligibility: number;
    amount: number;
    term: number;
    interest: number;
    features: number;
    preferences: number;
  };
}

/**
 * Matching criteria weights
 */
export interface MatchingWeights {
  /** Eligibility criteria weight */
  eligibility: number;
  /** Loan amount compatibility weight */
  amount: number;
  /** Loan term compatibility weight */
  term: number;
  /** Interest rate competitiveness weight */
  interest: number;
  /** Product features weight */
  features: number;
  /** User preferences weight */
  preferences: number;
}

/**
 * Default matching weights
 */
export const defaultMatchingWeights: MatchingWeights = {
  eligibility: 30,
  amount: 20,
  term: 15,
  interest: 15,
  features: 10,
  preferences: 10,
};

/**
 * Vietnamese eligibility rules engine
 */
export class VietnameseEligibilityEngine {
  /**
   * Check basic eligibility requirements
   */
  static checkBasicEligibility(
    product: VietnameseLoanProduct,
    profile: UserProfile
  ): { eligible: boolean; reasons: string[]; reasonsVi: string[] } {
    const reasons: string[] = [];
    const reasonsVi: string[] = [];
    let eligible = true;

    // Age check
    if (profile.age < product.eligibility.minAge) {
      eligible = false;
      reasons.push(`Age ${profile.age} is below minimum required age ${product.eligibility.minAge}`);
      reasonsVi.push(`Tuổi ${profile.age} thấp hơn tuổi tối thiểu ${product.eligibility.minAge}`);
    }

    if (profile.age > product.eligibility.maxAgeAtMaturity) {
      eligible = false;
      reasons.push(`Age ${profile.age} exceeds maximum age ${product.eligibility.maxAgeAtMaturity} at loan maturity`);
      reasonsVi.push(`Tuổi ${profile.age} vượt quá tuổi tối đa ${product.eligibility.maxAgeAtMaturity} tại thời điểm đáo hạn`);
    }

    // Vietnamese citizenship check
    if (product.eligibility.vietnameseCitizen && !profile.vietnameseCitizen) {
      eligible = false;
      reasons.push("Vietnamese citizenship required");
      reasonsVi.push("Yêu cầu quốc tịch Việt Nam");
    }

    // Income check
    if (profile.monthlyIncome < product.eligibility.minMonthlyIncome) {
      eligible = false;
      reasons.push(
        `Monthly income ${this.formatCurrency(profile.monthlyIncome)} is below minimum required ${this.formatCurrency(product.eligibility.minMonthlyIncome)}`
      );
      reasonsVi.push(
        `Thu nhập hàng tháng ${this.formatCurrency(profile.monthlyIncome)} thấp hơn tối thiểu ${this.formatCurrency(product.eligibility.minMonthlyIncome)}`
      );
    }

    if (product.eligibility.maxMonthlyIncome && profile.monthlyIncome > product.eligibility.maxMonthlyIncome) {
      eligible = false;
      reasons.push(
        `Monthly income ${this.formatCurrency(profile.monthlyIncome)} exceeds maximum allowed ${this.formatCurrency(product.eligibility.maxMonthlyIncome)}`
      );
      reasonsVi.push(
        `Thu nhập hàng tháng ${this.formatCurrency(profile.monthlyIncome)} vượt quá mức cho phép ${this.formatCurrency(product.eligibility.maxMonthlyIncome)}`
      );
    }

    // Employment type check
    if (product.eligibility.employmentTypes && product.eligibility.employmentTypes.length > 0) {
      if (!product.eligibility.employmentTypes.includes(profile.employmentType)) {
        eligible = false;
        reasons.push(`Employment type ${profile.employmentType} is not eligible`);
        reasonsVi.push(`Loại hình việc làm ${profile.employmentType} không đủ điều kiện`);
      }
    }

    // Employment duration check
    if (product.eligibility.minEmploymentDuration) {
      const requiredMonths = product.eligibility.minEmploymentDuration.years * 12 + product.eligibility.minEmploymentDuration.months;
      if (profile.employmentDurationMonths < requiredMonths) {
        eligible = false;
        reasons.push(`Employment duration ${profile.employmentDurationMonths} months is below required ${requiredMonths} months`);
        reasonsVi.push(`Thời gian làm việc ${profile.employmentDurationMonths} tháng thấp hơn yêu cầu ${requiredMonths} tháng`);
      }
    }

    // Credit score check
    if (product.eligibility.minCreditScore && profile.creditScore) {
      if (profile.creditScore < product.eligibility.minCreditScore) {
        eligible = false;
        reasons.push(`Credit score ${profile.creditScore} is below minimum required ${product.eligibility.minCreditScore}`);
        reasonsVi.push(`Điểm tín dụng ${profile.creditScore} thấp hơn tối thiểu ${product.eligibility.minCreditScore}`);
      }
    }

    return { eligible, reasons, reasonsVi };
  }

  /**
   * Check loan amount eligibility
   */
  static checkLoanAmountEligibility(
    product: VietnameseLoanProduct,
    requestedAmount: number
  ): { eligible: boolean; reasons: string[]; reasonsVi: string[] } {
    const reasons: string[] = [];
    const reasonsVi: string[] = [];
    let eligible = true;

    if (requestedAmount < product.amountLimits.min) {
      eligible = false;
      reasons.push(`Requested amount ${this.formatCurrency(requestedAmount)} is below minimum ${this.formatCurrency(product.amountLimits.min)}`);
      reasonsVi.push(`Số tiền yêu cầu ${this.formatCurrency(requestedAmount)} thấp hơn tối thiểu ${this.formatCurrency(product.amountLimits.min)}`);
    }

    if (requestedAmount > product.amountLimits.max) {
      eligible = false;
      reasons.push(`Requested amount ${this.formatCurrency(requestedAmount)} exceeds maximum ${this.formatCurrency(product.amountLimits.max)}`);
      reasonsVi.push(`Số tiền yêu cầu ${this.formatCurrency(requestedAmount)} vượt quá tối đa ${this.formatCurrency(product.amountLimits.max)}`);
    }

    // Check collateral requirements
    if (product.eligibility.collateralRequired && !profile.hasCollateral) {
      eligible = false;
      reasons.push("Collateral required but not provided");
      reasonsVi.push("Yêu cầu tài sản đảm bảo nhưng chưa cung cấp");
    }

    // Check loan-to-value ratio if collateral provided
    if (profile.collateralValue && product.eligibility.maxLoanToValueRatio) {
      const ltvRatio = (requestedAmount / profile.collateralValue) * 100;
      if (ltvRatio > product.eligibility.maxLoanToValueRatio) {
        eligible = false;
        reasons.push(
          `Loan-to-value ratio ${ltvRatio.toFixed(1)}% exceeds maximum ${product.eligibility.maxLoanToValueRatio}%`
        );
        reasonsVi.push(
          `Tỷ lệ vay trên giá trị tài sản ${ltvRatio.toFixed(1)}% vượt quá tối đa ${product.eligibility.maxLoanToValueRatio}%`
        );
      }
    }

    return { eligible, reasons, reasonsVi };
  }

  /**
   * Check loan term eligibility
   */
  static checkLoanTermEligibility(
    product: VietnameseLoanProduct,
    requestedTerm: number
  ): { eligible: boolean; reasons: string[]; reasonsVi: string[] } {
    const reasons: string[] = [];
    const reasonsVi: string[] = [];
    let eligible = true;

    if (requestedTerm < product.termOptions.min) {
      eligible = false;
      reasons.push(`Requested term ${requestedTerm} months is below minimum ${product.termOptions.min} months`);
      reasonsVi.push(`Thời gian vay ${requestedTerm} tháng thấp hơn tối thiểu ${product.termOptions.min} tháng`);
    }

    if (requestedTerm > product.termOptions.max) {
      eligible = false;
      reasons.push(`Requested term ${requestedTerm} months exceeds maximum ${product.termOptions.max} months`);
      reasonsVi.push(`Thời gian vay ${requestedTerm} tháng vượt quá tối đa ${product.termOptions.max} tháng`);
    }

    // Check if term is in available options
    if (product.termOptions.availableTerms.length > 0) {
      if (!product.termOptions.availableTerms.includes(requestedTerm)) {
        // Not a blocker, but note it
        reasons.push(`Requested term ${requestedTerm} months may not be standard (available: ${product.termOptions.availableTerms.join(", ")} months)`);
        reasonsVi.push(`Thời gian vay ${requestedTerm} tháng có thể không tiêu chuẩn (có sẵn: ${product.termOptions.availableTerms.join(", ")} tháng)`);
      }
    }

    return { eligible, reasons, reasonsVi };
  }

  /**
   * Calculate debt-to-income ratio
   */
  static calculateDebtToIncomeRatio(profile: UserProfile): number {
    const monthlyDebt = profile.existingMonthlyDebt || 0;
    const monthlyIncome = profile.monthlyIncome;
    return (monthlyDebt / monthlyIncome) * 100;
  }

  /**
   * Check debt-to-income ratio
   */
  static checkDebtToIncomeRatio(
    product: VietnameseLoanProduct,
    profile: UserProfile,
    estimatedMonthlyPayment?: number
  ): { eligible: boolean; reasons: string[]; reasonsVi: string[] } {
    const reasons: string[] = [];
    const reasonsVi: string[] = [];
    let eligible = true;

    const monthlyDebt = profile.existingMonthlyDebt || 0;
    const newMonthlyPayment = estimatedMonthlyPayment || 0;
    const totalMonthlyDebt = monthlyDebt + newMonthlyPayment;
    const dtiRatio = (totalMonthlyDebt / profile.monthlyIncome) * 100;

    if (product.eligibility.maxDebtToIncomeRatio && dtiRatio > product.eligibility.maxDebtToIncomeRatio) {
      eligible = false;
      reasons.push(
        `Debt-to-income ratio ${dtiRatio.toFixed(1)}% exceeds maximum ${product.eligibility.maxDebtToIncomeRatio}%`
      );
      reasonsVi.push(
        `Tỷ lệ nợ trên thu nhập ${dtiRatio.toFixed(1)}% vượt quá tối đa ${product.eligibility.maxDebtToIncomeRatio}%`
      );
    }

    return { eligible, reasons, reasonsVi };
  }

  /**
   * Format currency amount
   */
  private static formatCurrency(amount: number): string {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  }
}

/**
 * Loan Product Matching Algorithm
 */
export class LoanProductMatcher {
  /**
   * Match user profile with available loan products
   */
  static matchProducts(
    profile: UserProfile,
    products: VietnameseLoanProduct[],
    weights: MatchingWeights = defaultMatchingWeights
  ): MatchingResult[] {
    const results: MatchingResult[] = [];

    for (const product of products) {
      if (!product.active) continue;

      const result = this.evaluateProduct(profile, product, weights);
      if (result.score > 0) {
        results.push(result);
      }
    }

    // Sort by score (highest first)
    return results.sort((a, b) => b.score - a.score);
  }

  /**
   * Evaluate a single product against user profile
   */
  private static evaluateProduct(
    profile: UserProfile,
    product: VietnameseLoanProduct,
    weights: MatchingWeights
  ): MatchingResult {
    let totalScore = 0;
    const scoreBreakdown = {
      eligibility: 0,
      amount: 0,
      term: 0,
      interest: 0,
      features: 0,
      preferences: 0,
    };

    const matchReasons: string[] = [];
    const matchReasonsVi: string[] = [];
    const blockers: string[] = [];
    const blockersVi: string[] = [];

    // 1. Basic eligibility check (30% weight)
    const basicEligibility = VietnameseEligibilityEngine.checkBasicEligibility(product, profile);
    if (basicEligibility.eligible) {
      scoreBreakdown.eligibility = weights.eligibility;
      matchReasons.push("Meets basic eligibility requirements");
      matchReasonsVi.push("Đáp ứng các yêu cầu điều kiện cơ bản");
    } else {
      scoreBreakdown.eligibility = 0;
      blockers.push(...basicEligibility.reasons);
      blockersVi.push(...basicEligibility.reasonsVi);
    }

    // 2. Loan amount compatibility (20% weight)
    const amountEligibility = VietnameseEligibilityEngine.checkLoanAmountEligibility(product, profile.loanAmount);
    if (amountEligibility.eligible) {
      // Score based on how well the amount fits
      const amountRange = product.amountLimits.max - product.amountLimits.min;
      const amountPosition = (profile.loanAmount - product.amountLimits.min) / amountRange;
      scoreBreakdown.amount = weights.amount * (0.5 + Math.abs(0.5 - amountPosition)); // Higher score for amounts in the middle range
      matchReasons.push(`Requested amount ${this.formatCurrency(profile.loanAmount)} is within product limits`);
      matchReasonsVi.push(`Số tiền yêu cầu ${this.formatCurrency(profile.loanAmount)} trong giới hạn sản phẩm`);
    } else {
      scoreBreakdown.amount = 0;
      blockers.push(...amountEligibility.reasons);
      blockersVi.push(...amountEligibility.reasonsVi);
    }

    // 3. Loan term compatibility (15% weight)
    const termEligibility = VietnameseEligibilityEngine.checkLoanTermEligibility(product, profile.loanTerm);
    if (termEligibility.eligible) {
      // Score based on exact term match
      const exactMatch = product.termOptions.availableTerms.includes(profile.loanTerm);
      scoreBreakdown.term = weights.term * (exactMatch ? 1.0 : 0.7);
      matchReasons.push(`Requested term ${profile.loanTerm} months is supported`);
      matchReasonsVi.push(`Thời gian vay ${profile.loanTerm} tháng được hỗ trợ`);
    } else {
      scoreBreakdown.term = 0;
      blockers.push(...termEligibility.reasons);
      blockersVi.push(...termEligibility.reasonsVi);
    }

    // 4. Interest rate competitiveness (15% weight)
    if (profile.maxInterestRate) {
      const effectiveRate = product.interestRate.promotional?.rate || product.interestRate.annual;
      if (effectiveRate <= profile.maxInterestRate) {
        scoreBreakdown.interest = weights.interest * (1 - (effectiveRate - 5) / 15); // Assuming 5% is excellent, 20% is poor
        matchReasons.push(`Interest rate ${effectiveRate}% is competitive`);
        matchReasonsVi.push(`Lãi suất ${effectiveRate}% cạnh tranh`);
      } else {
        scoreBreakdown.interest = weights.interest * 0.3; // Low score but not a blocker
      }
    } else {
      // Score based on market competitiveness
      const rateScore = Math.max(0, 1 - (product.interestRate.annual - 5) / 15);
      scoreBreakdown.interest = weights.interest * rateScore;
    }

    // 5. Product features (10% weight)
    let featureScore = 0;
    if (profile.requiresOnlineApplication && product.features.onlineApplication) {
      featureScore += 3;
      matchReasons.push("Online application available");
      matchReasonsVi.push("Hỗ trợ đăng ký online");
    }
    if (profile.requiresFastApproval && product.features.fastApproval) {
      featureScore += 3;
      matchReasons.push("Fast approval available");
      matchReasonsVi.push("Hỗ trợ phê duyệt nhanh");
    }
    if (profile.prefersEarlyRepayment && product.features.earlyRepaymentAllowed) {
      featureScore += 2;
      matchReasons.push("Early repayment allowed");
      matchReasonsVi.push("Cho phép trả trước hạn");
    }
    scoreBreakdown.features = Math.min(weights.features, featureScore);

    // 6. User preferences (10% weight)
    let preferenceScore = weights.preferences;
    if (profile.preferredBanks && profile.preferredBanks.length > 0) {
      if (profile.preferredBanks.includes(product.bank.code)) {
        preferenceScore += 2;
        matchReasons.push("Preferred bank");
        matchReasonsVi.push("Ngân hàng ưu tiên");
      }
    }
    if (profile.maxProcessingTime) {
      if (product.applicationRequirements.processingTime.max <= profile.maxProcessingTime) {
        preferenceScore += 2;
        matchReasons.push("Processing time meets requirements");
        matchReasonsVi.push("Thời gian xử lý đáp ứng yêu cầu");
      }
    }
    scoreBreakdown.preferences = Math.min(weights.preferences, preferenceScore);

    // Calculate total score
    totalScore = Object.values(scoreBreakdown).reduce((sum, score) => sum + score, 0);

    // Calculate loan details if score is significant
    let estimatedMonthlyPayment: number | undefined;
    let totalInterest: number | undefined;
    let totalPayable: number | undefined;

    if (totalScore > 20) {
      const payment = this.calculateLoanPayment(product, profile.loanAmount, profile.loanTerm);
      estimatedMonthlyPayment = payment.monthlyPayment;
      totalInterest = payment.totalInterest;
      totalPayable = payment.totalPayable;

      // Check debt-to-income ratio
      const dtiCheck = VietnameseEligibilityEngine.checkDebtToIncomeRatio(
        product,
        profile,
        estimatedMonthlyPayment
      );
      if (!dtiCheck.eligible) {
        blockers.push(...dtiCheck.reasons);
        blockersVi.push(...dtiCheck.reasonsVi);
        totalScore *= 0.5; // Reduce score for DTI issues
      }
    }

    // Determine confidence level
    let confidence: "low" | "medium" | "high" = "low";
    if (totalScore >= 80) confidence = "high";
    else if (totalScore >= 50) confidence = "medium";

    return {
      product,
      score: Math.round(totalScore),
      confidence,
      matchReasons,
      matchReasonsVi,
      blockers,
      blockersVi,
      estimatedMonthlyPayment,
      totalInterest,
      totalPayable,
      scoreBreakdown,
    };
  }

  /**
   * Calculate loan payment details
   */
  static calculateLoanPayment(
    product: VietnameseLoanProduct,
    amount: number,
    term: number
  ): { monthlyPayment: number; totalInterest: number; totalPayable: number } {
    const effectiveRate = product.interestRate.promotional?.rate || product.interestRate.annual;
    const monthlyRate = effectiveRate / 100 / 12;

    let monthlyPayment: number;
    let totalInterest: number;

    switch (product.interestRate.type) {
      case "flat":
        // Flat rate calculation (simple interest on principal)
        totalInterest = (amount * effectiveRate / 100) * (term / 12);
        monthlyPayment = (amount + totalInterest) / term;
        break;

      case "reducing":
      case "fixed":
      default:
        // Reducing balance calculation (amortized loan)
        if (monthlyRate === 0) {
          monthlyPayment = amount / term;
          totalInterest = 0;
        } else {
          monthlyPayment = amount * (monthlyRate * Math.pow(1 + monthlyRate, term)) /
                          (Math.pow(1 + monthlyRate, term) - 1);
          totalInterest = (monthlyPayment * term) - amount;
        }
        break;
    }

    const totalPayable = amount + totalInterest;

    return {
      monthlyPayment: Math.round(monthlyPayment),
      totalInterest: Math.round(totalInterest),
      totalPayable: Math.round(totalPayable),
    };
  }

  /**
   * Get top N matches
   */
  static getTopMatches(
    profile: UserProfile,
    products: VietnameseLoanProduct[],
    limit: number = 3,
    weights?: MatchingWeights
  ): MatchingResult[] {
    const matches = this.matchProducts(profile, products, weights);
    return matches.slice(0, limit);
  }

  /**
   * Get best match
   */
  static getBestMatch(
    profile: UserProfile,
    products: VietnameseLoanProduct[],
    weights?: MatchingWeights
  ): MatchingResult | null {
    const matches = this.matchProducts(profile, products, weights);
    return matches.length > 0 ? matches[0] : null;
  }

  /**
   * Format currency amount
   */
  private static formatCurrency(amount: number): string {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  }
}

/**
 * Specialized matching functions for Vietnamese market scenarios
 */

/**
 * Match for first-time borrowers
 */
export function matchForFirstTimeBorrower(
  profile: UserProfile,
  products: VietnameseLoanProduct[]
): MatchingResult[] {
  // Filter products suitable for first-time borrowers
  const suitableProducts = products.filter(product => {
    // Lower amounts, shorter terms, no collateral requirements
    return product.amountLimits.max <= 500000000 && // Max 500M VND
           product.termOptions.max <= 36 && // Max 3 years
           !product.eligibility.collateralRequired;
  });

  return LoanProductMatcher.matchProducts(profile, suitableProducts, {
    ...defaultMatchingWeights,
    eligibility: 40, // Higher weight on eligibility for first-timers
    features: 15, // Higher weight on user-friendly features
  });
}

/**
 * Match for government employees
 */
export function matchForGovernmentEmployees(
  profile: UserProfile,
  products: VietnameseLoanProduct[]
): MatchingResult[] {
  // Filter products with special conditions for government employees
  const suitableProducts = products.filter(product => {
    return product.specialConditions?.targetProfessions?.includes("Government employees") ||
           product.specialConditions?.targetProfessionsVi?.some(prof =>
             prof.toLowerCase().includes("công chức") ||
             prof.toLowerCase().includes("viên chức")
           );
  });

  return LoanProductMatcher.matchProducts(profile, suitableProducts);
}

/**
 * Match for students
 */
export function matchForStudents(
  profile: UserProfile,
  products: VietnameseLoanProduct[]
): MatchingResult[] {
  const studentProducts = products.filter(product => product.loanType === "student_loan");
  return LoanProductMatcher.matchProducts(profile, studentProducts, {
    ...defaultMatchingWeights,
    eligibility: 50, // Very high weight on eligibility for students
    amount: 10,
    term: 10,
    interest: 20, // Students are very interest-sensitive
    features: 5,
    preferences: 5,
  });
}

/**
 * Match for business owners
 */
export function matchForBusinessOwners(
  profile: UserProfile,
  products: VietnameseLoanProduct[]
): MatchingResult[] {
  const businessProducts = products.filter(product =>
    product.loanType === "business_loan" ||
    product.eligibility.employmentTypes?.includes("business_owner")
  );

  return LoanProductMatcher.matchProducts(profile, businessProducts, {
    ...defaultMatchingWeights,
    amount: 25, // Business loans often need larger amounts
    features: 15, // Business features like flexible repayment
  });
}

/**
 * Match by specific Vietnamese loan type
 */
export function matchByLoanType(
  profile: UserProfile,
  products: VietnameseLoanProduct[],
  loanType: VietnameseLoanType
): MatchingResult[] {
  const typeProducts = products.filter(product => product.loanType === loanType);

  // Adjust weights based on loan type
  let weights = { ...defaultMatchingWeights };

  switch (loanType) {
    case "home_loan":
      weights.amount = 25; // Amount is very important for home loans
      weights.term = 20; // Long-term considerations
      break;
    case "consumer_loan":
      weights.interest = 20; // Interest rate sensitivity
      weights.features = 15; // Fast approval important
      break;
    case "auto_loan":
      weights.amount = 22; // Vehicle price considerations
      weights.term = 18; // Term flexibility
      break;
  }

  return LoanProductMatcher.matchProducts(profile, typeProducts, weights);
}