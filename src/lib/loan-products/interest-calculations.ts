// Vietnamese Loan Interest Calculations
// Comprehensive calculation engine for Vietnamese loan products

import type { InterestRateType } from "./vietnamese-loan-products";
import { VietnameseFinancialValidator } from "./validation";
import { VietnameseComplianceEngine } from "./vietnamese-compliance";

/**
 * Loan calculation parameters
 */
export interface LoanCalculationParams {
  /** Principal amount in VND */
  principal: number;
  /** Loan term in months */
  term: number;
  /** Annual interest rate percentage */
  annualRate: number;
  /** Interest rate type */
  rateType: InterestRateType;
  /** Promotional rate (if applicable) */
  promotionalRate?: number;
  /** Promotional period in months */
  promotionalPeriod?: number;
  /** Down payment amount */
  downPayment?: number;
  /** Processing fee percentage */
  processingFee?: number;
  /** Processing fee fixed amount */
  processingFeeFixed?: number;
  /** Insurance fee percentage */
  insuranceFee?: number;
  /** Other fees */
  otherFees?: number;
  /** First payment date */
  firstPaymentDate?: Date;
  /** Grace period in months */
  gracePeriod?: number;
  /** Calculation method */
  calculationMethod: "daily" | "monthly";
}

/**
 * Monthly payment breakdown
 */
export interface MonthlyPayment {
  /** Payment number */
  paymentNumber: number;
  /** Payment date */
  paymentDate: Date;
  /** Principal portion */
  principal: number;
  /** Interest portion */
  interest: number;
  /** Total payment amount */
  total: number;
  /** Remaining balance */
  remainingBalance: number;
  /** Cumulative interest paid */
  cumulativeInterest: number;
  /** Cumulative principal paid */
  cumulativePrincipal: number;
}

/**
 * Loan calculation results
 */
export interface LoanCalculationResult {
  /** Monthly payment amount */
  monthlyPayment: number;
  /** Total amount payable */
  totalPayable: number;
  /** Total interest amount */
  totalInterest: number;
  /** Total fees amount */
  totalFees: number;
  /** Effective annual percentage rate (APR) */
  effectiveAPR: number;
  /** Payment schedule */
  paymentSchedule: MonthlyPayment[];
  /** Summary statistics */
  summary: {
    /** Average monthly payment */
    averageMonthlyPayment: number;
    /** Total payments */
    totalPayments: number;
    /** First payment date */
    firstPaymentDate: Date;
    /** Last payment date */
    lastPaymentDate: Date;
    /** Break-even point (months) */
    breakEvenPoint?: number;
  };
  /** Promotional period summary (if applicable) */
  promotionalSummary?: {
    /** Promotional monthly payment */
    promotionalMonthlyPayment: number;
    /** Post-promotional monthly payment */
    postPromotionalMonthlyPayment: number;
    /** Savings during promotional period */
    promotionalSavings: number;
  };
}

/**
 * Vietnamese Loan Calculator
 */
export class VietnameseLoanCalculator {
  /**
   * Calculate loan using flat rate method (Lãi suất phẳng)
   */
  static calculateFlatRate(params: LoanCalculationParams): LoanCalculationResult {
    const { principal, term, annualRate, calculationMethod } = params;
    const monthlyRate = annualRate / 100 / 12;

    // For flat rate: interest is calculated on the original principal for the entire term
    const totalInterest = principal * monthlyRate * term;
    const monthlyInterest = totalInterest / term;
    const monthlyPrincipal = principal / term;
    const monthlyPayment = monthlyInterest + monthlyPrincipal;

    const paymentSchedule: MonthlyPayment[] = [];
    let remainingBalance = principal;
    let cumulativeInterest = 0;
    let cumulativePrincipal = 0;

    const currentDate = params.firstPaymentDate || new Date();

    for (let i = 1; i <= term; i++) {
      const paymentDate = new Date(currentDate);
      paymentDate.setMonth(paymentDate.getMonth() + i - 1);

      // During grace period, only pay interest
      let currentMonthlyPayment = monthlyPayment;
      let currentMonthlyPrincipal = monthlyPrincipal;
      let currentMonthlyInterest = monthlyInterest;

      if (params.gracePeriod && i <= params.gracePeriod) {
        currentMonthlyPrincipal = 0;
        currentMonthlyInterest = monthlyInterest;
        currentMonthlyPayment = monthlyInterest;
      }

      remainingBalance -= currentMonthlyPrincipal;
      cumulativeInterest += currentMonthlyInterest;
      cumulativePrincipal += currentMonthlyPrincipal;

      paymentSchedule.push({
        paymentNumber: i,
        paymentDate,
        principal: Math.round(currentMonthlyPrincipal),
        interest: Math.round(currentMonthlyInterest),
        total: Math.round(currentMonthlyPayment),
        remainingBalance: Math.round(Math.max(0, remainingBalance)),
        cumulativeInterest: Math.round(cumulativeInterest),
        cumulativePrincipal: Math.round(cumulativePrincipal),
      });
    }

    const totalFees = this.calculateTotalFees(params);
    const totalPayable = principal + totalInterest + totalFees;
    const effectiveAPR = this.calculateEffectiveAPR(params, monthlyPayment);

    return {
      monthlyPayment: Math.round(monthlyPayment),
      totalPayable: Math.round(totalPayable),
      totalInterest: Math.round(totalInterest),
      totalFees: Math.round(totalFees),
      effectiveAPR,
      paymentSchedule,
      summary: {
        averageMonthlyPayment: Math.round(monthlyPayment),
        totalPayments: term,
        firstPaymentDate: paymentSchedule[0]?.paymentDate || currentDate,
        lastPaymentDate: paymentSchedule[paymentSchedule.length - 1]?.paymentDate || currentDate,
        breakEvenPoint: this.calculateBreakEvenPoint(paymentSchedule),
      },
    };
  }

  /**
   * Calculate loan using reducing balance method (Lãi suất giảm dần)
   */
  static calculateReducingBalance(params: LoanCalculationParams): LoanCalculationResult {
    const { principal, term, annualRate, calculationMethod } = params;
    const monthlyRate = annualRate / 100 / 12;

    let monthlyPayment: number;

    if (monthlyRate === 0) {
      monthlyPayment = principal / term;
    } else {
      monthlyPayment = principal * (monthlyRate * Math.pow(1 + monthlyRate, term)) /
                      (Math.pow(1 + monthlyRate, term) - 1);
    }

    const paymentSchedule: MonthlyPayment[] = [];
    let remainingBalance = principal;
    let cumulativeInterest = 0;
    let cumulativePrincipal = 0;

    const currentDate = params.firstPaymentDate || new Date();

    for (let i = 1; i <= term; i++) {
      const paymentDate = new Date(currentDate);
      paymentDate.setMonth(paymentDate.getMonth() + i - 1);

      let currentMonthlyInterest = remainingBalance * monthlyRate;
      let currentMonthlyPrincipal = monthlyPayment - currentMonthlyInterest;
      let currentMonthlyPayment = monthlyPayment;

      // During grace period, only pay interest
      if (params.gracePeriod && i <= params.gracePeriod) {
        currentMonthlyPrincipal = 0;
        currentMonthlyPayment = currentMonthlyInterest;
      } else if (params.gracePeriod && i === params.gracePeriod + 1) {
        // First payment after grace period
        currentMonthlyPrincipal = monthlyPayment - currentMonthlyInterest;
        currentMonthlyPayment = monthlyPayment;
      }

      // Ensure we don't overpay the principal
      if (currentMonthlyPrincipal > remainingBalance) {
        currentMonthlyPrincipal = remainingBalance;
        currentMonthlyPayment = currentMonthlyInterest + currentMonthlyPrincipal;
      }

      remainingBalance -= currentMonthlyPrincipal;
      cumulativeInterest += currentMonthlyInterest;
      cumulativePrincipal += currentMonthlyPrincipal;

      paymentSchedule.push({
        paymentNumber: i,
        paymentDate,
        principal: Math.round(currentMonthlyPrincipal),
        interest: Math.round(currentMonthlyInterest),
        total: Math.round(currentMonthlyPayment),
        remainingBalance: Math.round(Math.max(0, remainingBalance)),
        cumulativeInterest: Math.round(cumulativeInterest),
        cumulativePrincipal: Math.round(cumulativePrincipal),
      });
    }

    const actualTotalInterest = paymentSchedule.reduce((sum, payment) => sum + payment.interest, 0);
    const totalFees = this.calculateTotalFees(params);
    const totalPayable = principal + actualTotalInterest + totalFees;
    const effectiveAPR = this.calculateEffectiveAPR(params, monthlyPayment);

    return {
      monthlyPayment: Math.round(monthlyPayment),
      totalPayable: Math.round(totalPayable),
      totalInterest: Math.round(actualTotalInterest),
      totalFees: Math.round(totalFees),
      effectiveAPR,
      paymentSchedule,
      summary: {
        averageMonthlyPayment: Math.round(monthlyPayment),
        totalPayments: term,
        firstPaymentDate: paymentSchedule[0]?.paymentDate || currentDate,
        lastPaymentDate: paymentSchedule[paymentSchedule.length - 1]?.paymentDate || currentDate,
        breakEvenPoint: this.calculateBreakEvenPoint(paymentSchedule),
      },
    };
  }

  /**
   * Calculate loan with promotional period
   */
  static calculateWithPromotionalPeriod(params: LoanCalculationParams): LoanCalculationResult {
    if (!params.promotionalRate || !params.promotionalPeriod || params.promotionalPeriod >= params.term) {
      // No promotional period or invalid parameters, use regular calculation
      return params.rateType === "flat"
        ? this.calculateFlatRate(params)
        : this.calculateReducingBalance(params);
    }

    const { term, promotionalPeriod, principal, annualRate, promotionalRate } = params;

    // For flat rate with promotional period:
    // Calculate interest separately for each period
    if (params.rateType === "flat") {
      const monthlyRate = annualRate / 100 / 12;
      const promotionalMonthlyRate = promotionalRate / 100 / 12;

      // Promotional period: interest on original principal with promotional rate
      const promotionalInterest = principal * promotionalMonthlyRate * promotionalPeriod;
      const promotionalMonthlyInterest = promotionalInterest / promotionalPeriod;
      const promotionalMonthlyPrincipal = principal / term; // Principal spread over entire term
      const promotionalMonthlyPayment = promotionalMonthlyInterest + promotionalMonthlyPrincipal;

      // Post-promotional period: remaining principal with regular rate
      const remainingTerm = term - promotionalPeriod;
      const remainingPrincipal = principal - (promotionalMonthlyPrincipal * promotionalPeriod);
      const postPromotionalInterest = remainingPrincipal * monthlyRate * remainingTerm;
      const postPromotionalMonthlyInterest = postPromotionalInterest / remainingTerm;
      const postPromotionalMonthlyPrincipal = remainingPrincipal / remainingTerm;
      const postPromotionalMonthlyPayment = postPromotionalMonthlyInterest + postPromotionalMonthlyPrincipal;

      const paymentSchedule: MonthlyPayment[] = [];
      let remainingBalance = principal;
      let cumulativeInterest = 0;
      let cumulativePrincipal = 0;

      const currentDate = params.firstPaymentDate || new Date();

      // Generate promotional period schedule
      for (let i = 1; i <= promotionalPeriod; i++) {
        const paymentDate = new Date(currentDate);
        paymentDate.setMonth(paymentDate.getMonth() + i - 1);

        remainingBalance -= promotionalMonthlyPrincipal;
        cumulativeInterest += promotionalMonthlyInterest;
        cumulativePrincipal += promotionalMonthlyPrincipal;

        paymentSchedule.push({
          paymentNumber: i,
          paymentDate,
          principal: Math.round(promotionalMonthlyPrincipal),
          interest: Math.round(promotionalMonthlyInterest),
          total: Math.round(promotionalMonthlyPayment),
          remainingBalance: Math.round(Math.max(0, remainingBalance)),
          cumulativeInterest: Math.round(cumulativeInterest),
          cumulativePrincipal: Math.round(cumulativePrincipal),
        });
      }

      // Generate post-promotional period schedule
      for (let i = 1; i <= remainingTerm; i++) {
        const paymentDate = new Date(currentDate);
        paymentDate.setMonth(paymentDate.getMonth() + promotionalPeriod + i - 1);

        remainingBalance -= postPromotionalMonthlyPrincipal;
        cumulativeInterest += postPromotionalMonthlyInterest;
        cumulativePrincipal += postPromotionalMonthlyPrincipal;

        paymentSchedule.push({
          paymentNumber: promotionalPeriod + i,
          paymentDate,
          principal: Math.round(postPromotionalMonthlyPrincipal),
          interest: Math.round(postPromotionalMonthlyInterest),
          total: Math.round(postPromotionalMonthlyPayment),
          remainingBalance: Math.round(Math.max(0, remainingBalance)),
          cumulativeInterest: Math.round(cumulativeInterest),
          cumulativePrincipal: Math.round(cumulativePrincipal),
        });
      }

      const totalInterest = promotionalInterest + postPromotionalInterest;
      const totalFees = this.calculateTotalFees(params);
      const totalPayable = principal + totalInterest + totalFees;
      const effectiveAPR = this.calculateEffectiveAPR(params, postPromotionalMonthlyPayment);

      return {
        monthlyPayment: Math.round(postPromotionalMonthlyPayment),
        totalPayable: Math.round(totalPayable),
        totalInterest: Math.round(totalInterest),
        totalFees: Math.round(totalFees),
        effectiveAPR,
        paymentSchedule,
        summary: {
          averageMonthlyPayment: Math.round((promotionalMonthlyPayment * promotionalPeriod + postPromotionalMonthlyPayment * remainingTerm) / term),
          totalPayments: term,
          firstPaymentDate: paymentSchedule[0]?.paymentDate || currentDate,
          lastPaymentDate: paymentSchedule[paymentSchedule.length - 1]?.paymentDate || currentDate,
          breakEvenPoint: this.calculateBreakEvenPoint(paymentSchedule),
        },
        promotionalSummary: {
          promotionalMonthlyPayment: Math.round(promotionalMonthlyPayment),
          postPromotionalMonthlyPayment: Math.round(postPromotionalMonthlyPayment),
          promotionalSavings: Math.round((postPromotionalMonthlyPayment - promotionalMonthlyPayment) * promotionalPeriod),
        },
      };
    }

    // For reducing balance: recalculate with rate change after promotional period
    const monthlyRate = annualRate / 100 / 12;
    const promotionalMonthlyRate = promotionalRate / 100 / 12;

    const paymentSchedule: MonthlyPayment[] = [];
    let remainingBalance = principal;
    let cumulativeInterest = 0;
    let cumulativePrincipal = 0;

    const currentDate = params.firstPaymentDate || new Date();

    // Promotional period calculations
    let promotionalMonthlyPayment: number;
    if (promotionalMonthlyRate === 0) {
      promotionalMonthlyPayment = principal / term;
    } else {
      promotionalMonthlyPayment = principal * (promotionalMonthlyRate * Math.pow(1 + promotionalMonthlyRate, promotionalPeriod)) /
                              (Math.pow(1 + promotionalMonthlyRate, promotionalPeriod) - 1);
    }

    for (let i = 1; i <= promotionalPeriod; i++) {
      const paymentDate = new Date(currentDate);
      paymentDate.setMonth(paymentDate.getMonth() + i - 1);

      const currentMonthlyInterest = remainingBalance * promotionalMonthlyRate;
      let currentMonthlyPrincipal = promotionalMonthlyPayment - currentMonthlyInterest;
      let currentMonthlyPayment = promotionalMonthlyPayment;

      // During grace period, only pay interest
      if (params.gracePeriod && i <= params.gracePeriod) {
        currentMonthlyPrincipal = 0;
        currentMonthlyPayment = currentMonthlyInterest;
      }

      // Ensure we don't overpay the principal
      if (currentMonthlyPrincipal > remainingBalance) {
        currentMonthlyPrincipal = remainingBalance;
        currentMonthlyPayment = currentMonthlyInterest + currentMonthlyPrincipal;
      }

      remainingBalance -= currentMonthlyPrincipal;
      cumulativeInterest += currentMonthlyInterest;
      cumulativePrincipal += currentMonthlyPrincipal;

      paymentSchedule.push({
        paymentNumber: i,
        paymentDate,
        principal: Math.round(currentMonthlyPrincipal),
        interest: Math.round(currentMonthlyInterest),
        total: Math.round(currentMonthlyPayment),
        remainingBalance: Math.round(Math.max(0, remainingBalance)),
        cumulativeInterest: Math.round(cumulativeInterest),
        cumulativePrincipal: Math.round(cumulativePrincipal),
      });
    }

    // Post-promotional period calculations
    const remainingTerm = term - promotionalPeriod;
    let postPromotionalMonthlyPayment: number;

    if (monthlyRate === 0) {
      postPromotionalMonthlyPayment = remainingBalance / remainingTerm;
    } else {
      postPromotionalMonthlyPayment = remainingBalance * (monthlyRate * Math.pow(1 + monthlyRate, remainingTerm)) /
                                   (Math.pow(1 + monthlyRate, remainingTerm) - 1);
    }

    for (let i = 1; i <= remainingTerm; i++) {
      const paymentDate = new Date(currentDate);
      paymentDate.setMonth(paymentDate.getMonth() + promotionalPeriod + i - 1);

      const currentMonthlyInterest = remainingBalance * monthlyRate;
      let currentMonthlyPrincipal = postPromotionalMonthlyPayment - currentMonthlyInterest;
      let currentMonthlyPayment = postPromotionalMonthlyPayment;

      // Ensure we don't overpay the principal
      if (currentMonthlyPrincipal > remainingBalance) {
        currentMonthlyPrincipal = remainingBalance;
        currentMonthlyPayment = currentMonthlyInterest + currentMonthlyPrincipal;
      }

      remainingBalance -= currentMonthlyPrincipal;
      cumulativeInterest += currentMonthlyInterest;
      cumulativePrincipal += currentMonthlyPrincipal;

      paymentSchedule.push({
        paymentNumber: promotionalPeriod + i,
        paymentDate,
        principal: Math.round(currentMonthlyPrincipal),
        interest: Math.round(currentMonthlyInterest),
        total: Math.round(currentMonthlyPayment),
        remainingBalance: Math.round(Math.max(0, remainingBalance)),
        cumulativeInterest: Math.round(cumulativeInterest),
        cumulativePrincipal: Math.round(cumulativePrincipal),
      });
    }

    const actualTotalInterest = paymentSchedule.reduce((sum, payment) => sum + payment.interest, 0);
    const totalFees = this.calculateTotalFees(params);
    const totalPayable = principal + actualTotalInterest + totalFees;
    const effectiveAPR = this.calculateEffectiveAPR(params, postPromotionalMonthlyPayment);

    return {
      monthlyPayment: Math.round(postPromotionalMonthlyPayment),
      totalPayable: Math.round(totalPayable),
      totalInterest: Math.round(actualTotalInterest),
      totalFees: Math.round(totalFees),
      effectiveAPR,
      paymentSchedule,
      summary: {
        averageMonthlyPayment: Math.round((promotionalMonthlyPayment * promotionalPeriod + postPromotionalMonthlyPayment * remainingTerm) / term),
        totalPayments: term,
        firstPaymentDate: paymentSchedule[0]?.paymentDate || currentDate,
        lastPaymentDate: paymentSchedule[paymentSchedule.length - 1]?.paymentDate || currentDate,
        breakEvenPoint: this.calculateBreakEvenPoint(paymentSchedule),
      },
      promotionalSummary: {
        promotionalMonthlyPayment: Math.round(promotionalMonthlyPayment),
        postPromotionalMonthlyPayment: Math.round(postPromotionalMonthlyPayment),
        promotionalSavings: Math.round((postPromotionalMonthlyPayment - promotionalMonthlyPayment) * promotionalPeriod),
      },
    };
  }

  /**
   * Calculate early repayment
   */
  static calculateEarlyRepayment(
    params: LoanCalculationParams,
    paymentsMade: number,
    earlyRepaymentAmount: number,
    earlyRepaymentFee: number = 2
  ): {
    remainingBalance: number;
    savingsAmount: number;
    feeAmount: number;
    netSavings: number;
    newTerm?: number;
  } {
    // Calculate the loan normally first
    const originalResult = params.rateType === "flat"
      ? this.calculateFlatRate(params)
      : this.calculateReducingBalance(params);

    if (paymentsMade >= params.term || paymentsMade >= originalResult.paymentSchedule.length) {
      return {
        remainingBalance: 0,
        savingsAmount: 0,
        feeAmount: 0,
        netSavings: 0,
      };
    }

    const remainingBalanceBeforeRepayment = originalResult.paymentSchedule[paymentsMade - 1]?.remainingBalance || 0;
    const feeAmount = (earlyRepaymentAmount * earlyRepaymentFee) / 100;

    // Calculate remaining interest without early repayment
    const remainingInterest = originalResult.paymentSchedule
      .slice(paymentsMade)
      .reduce((sum, payment) => sum + payment.interest, 0);

    // New balance after early repayment
    const newBalance = Math.max(0, remainingBalanceBeforeRepayment - earlyRepaymentAmount + feeAmount);

    // Calculate new term for the remaining balance (keeping same payment)
    const newTerm = this.calculateNewTerm(newBalance, originalResult.monthlyPayment, params.annualRate, params.rateType);

    // Calculate interest with new balance and term
    let newInterest = 0;
    if (newTerm && newTerm > 0) {
      const newResult = this.calculateLoan({
        ...params,
        principal: newBalance,
        term: newTerm,
      });
      newInterest = newResult.totalInterest;
    }

    const savingsAmount = remainingInterest - newInterest;
    const netSavings = savingsAmount - feeAmount;

    return {
      remainingBalance: Math.round(newBalance),
      savingsAmount: Math.round(savingsAmount),
      feeAmount: Math.round(feeAmount),
      netSavings: Math.round(netSavings),
      newTerm,
    };
  }

  /**
   * Calculate affordability analysis
   */
  static calculateAffordability(
    monthlyIncome: number,
    monthlyExpenses: number,
    existingDebtPayments: number,
    maxDebtToIncomeRatio: number = 50
  ): {
    maxMonthlyPayment: number;
    maxLoanAmount: number;
    affordableRange: {
      min: number;
      max: number;
    };
    riskLevel: "low" | "medium" | "high";
  } {
    const availableIncome = monthlyIncome - monthlyExpenses;
    const maxMonthlyPayment = (monthlyIncome * maxDebtToIncomeRatio) / 100 - existingDebtPayments;
    const currentDTI = ((existingDebtPayments) / monthlyIncome) * 100;

    // Estimate max loan amount (using conservative 12% annual rate, 5-year term)
    const estimatedMonthlyRate = 0.12 / 12;
    const estimatedTerm = 60;
    let maxLoanAmount = 0;

    if (estimatedMonthlyRate > 0) {
      maxLoanAmount = maxMonthlyPayment * (Math.pow(1 + estimatedMonthlyRate, estimatedTerm) - 1) /
                     (estimatedMonthlyRate * Math.pow(1 + estimatedMonthlyRate, estimatedTerm));
    } else {
      maxLoanAmount = maxMonthlyPayment * estimatedTerm;
    }

    // Determine risk level
    let riskLevel: "low" | "medium" | "high" = "low";
    if (currentDTI > 40 || maxMonthlyPayment < 0) {
      riskLevel = "high";
    } else if (currentDTI > 30 || maxMonthlyPayment < availableIncome * 0.3) {
      riskLevel = "medium";
    }

    // Affordable range (50% to 100% of max)
    const affordableRange = {
      min: Math.round(maxLoanAmount * 0.5),
      max: Math.round(maxLoanAmount),
    };

    return {
      maxMonthlyPayment: Math.round(Math.max(0, maxMonthlyPayment)),
      maxLoanAmount: Math.round(Math.max(0, maxLoanAmount)),
      affordableRange,
      riskLevel,
    };
  }

  /**
   * Main calculation method that routes to appropriate calculation type
   */
  static calculateLoan(params: LoanCalculationParams): LoanCalculationResult {
    // Validate input parameters
    const validation = VietnameseFinancialValidator.validateAndSanitize(params);
    if (!validation.isValid) {
      const errorMessages = validation.errors
        .filter(e => e.severity === "error")
        .map(e => e.message)
        .join("; ");
      throw new Error(`Invalid calculation parameters: ${errorMessages}`);
    }

    // Use sanitized parameters
    const sanitizedParams = validation.sanitizedParams!;

    if (sanitizedParams.promotionalRate && sanitizedParams.promotionalPeriod && sanitizedParams.promotionalPeriod < sanitizedParams.term) {
      return this.calculateWithPromotionalPeriod(sanitizedParams);
    }

    switch (sanitizedParams.rateType) {
      case "flat":
        return this.calculateFlatRate(sanitizedParams);
      case "reducing":
      case "fixed":
      default:
        return this.calculateReducingBalance(sanitizedParams);
    }
  }

  /**
   * Calculate total fees
   */
  private static calculateTotalFees(params: LoanCalculationParams): number {
    let totalFees = 0;

    // Processing fees
    if (params.processingFee) {
      totalFees += (params.principal * params.processingFee) / 100;
    }
    if (params.processingFeeFixed) {
      totalFees += params.processingFeeFixed;
    }

    // Insurance fees
    if (params.insuranceFee) {
      totalFees += (params.principal * params.insuranceFee) / 100;
    }

    // Other fees
    if (params.otherFees) {
      totalFees += params.otherFees;
    }

    return totalFees;
  }

  /**
   * Calculate Effective APR
   */
  private static calculateEffectiveAPR(params: LoanCalculationParams, monthlyPayment: number): number {
    const totalFees = this.calculateTotalFees(params);
    const effectivePrincipal = params.principal - totalFees;

    // Use iterative method to find APR that solves for the payment
    let lowRate = 0;
    let highRate = 100; // 100% annual rate as upper bound
    let apr = params.annualRate; // Start with nominal rate

    for (let i = 0; i < 100; i++) { // Maximum 100 iterations
      const monthlyRate = apr / 100 / 12;
      let calculatedPayment: number;

      if (monthlyRate === 0) {
        calculatedPayment = effectivePrincipal / params.term;
      } else {
        calculatedPayment = effectivePrincipal * (monthlyRate * Math.pow(1 + monthlyRate, params.term)) /
                          (Math.pow(1 + monthlyRate, params.term) - 1);
      }

      if (Math.abs(calculatedPayment - monthlyPayment) < 1) { // Within 1 VND
        break;
      }

      if (calculatedPayment > monthlyPayment) {
        highRate = apr;
      } else {
        lowRate = apr;
      }

      apr = (lowRate + highRate) / 2;
    }

    return Math.round(apr * 100) / 100; // Round to 2 decimal places
  }

  /**
   * Calculate break-even point (when cumulative principal payments exceed half of original principal)
   */
  private static calculateBreakEvenPoint(paymentSchedule: MonthlyPayment[]): number | undefined {
    if (paymentSchedule.length === 0) return undefined;

    const originalPrincipal = paymentSchedule[0].remainingBalance + paymentSchedule[0].principal;
    const halfPrincipal = originalPrincipal / 2;

    // Find the point where cumulative principal payments exceed half of the original principal
    for (const payment of paymentSchedule) {
      if (payment.cumulativePrincipal >= halfPrincipal) {
        return payment.paymentNumber;
      }
    }
    return undefined;
  }

  /**
   * Calculate new term for early repayment
   */
  private static calculateNewTerm(
    balance: number,
    payment: number,
    annualRate: number,
    rateType: InterestRateType
  ): number | undefined {
    if (balance <= 0 || payment <= 0) return undefined;

    const monthlyRate = annualRate / 100 / 12;

    if (rateType === "flat") {
      // For flat rate, simple calculation
      const monthlyInterest = balance * monthlyRate;
      const monthlyPrincipal = payment - monthlyInterest;
      if (monthlyPrincipal <= 0) return undefined;
      return Math.ceil(balance / monthlyPrincipal);
    } else {
      // For reducing balance, use formula
      if (monthlyRate === 0) {
        return Math.ceil(balance / payment);
      }

      // Solve for n in: payment = balance * r * (1+r)^n / [(1+r)^n - 1]
      // This requires iterative solution
      let n = 1;
      let maxN = 360; // 30 years maximum

      while (n <= maxN) {
        const calculatedPayment = balance * (monthlyRate * Math.pow(1 + monthlyRate, n)) /
                                 (Math.pow(1 + monthlyRate, n) - 1);
        if (calculatedPayment <= payment) {
          return n;
        }
        n++;
      }

      return undefined;
    }
  }
}

/**
 * Utility functions for Vietnamese loan calculations
 */

/**
 * Format currency as Vietnamese Dong
 */
export function formatVND(amount: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Calculate monthly payment for quick estimation
 */
export function quickMonthlyPaymentCalculation(
  principal: number,
  annualRate: number,
  term: number,
  rateType: InterestRateType = "reducing"
): number {
  const params: LoanCalculationParams = {
    principal,
    term,
    annualRate,
    rateType,
    calculationMethod: "monthly",
  };

  const result = VietnameseLoanCalculator.calculateLoan(params);
  return result.monthlyPayment;
}

/**
 * Compare different loan options
 */
export function compareLoanOptions(
  options: Array<{
    name: string;
    params: LoanCalculationParams;
  }>
): Array<{
  name: string;
  monthlyPayment: number;
  totalInterest: number;
  totalPayable: number;
  effectiveAPR: number;
  ranking: number;
}> {
  const results = options.map(option => ({
    name: option.name,
    ...VietnameseLoanCalculator.calculateLoan(option.params),
  }));

  // Rank by total cost (total payable)
  results.sort((a, b) => a.totalPayable - b.totalPayable);

  return results.map((result, index) => ({
    ...result,
    ranking: index + 1,
  }));
}

/**
 * Generate loan summary in Vietnamese
 */
export function generateVietnameseLoanSummary(result: LoanCalculationResult): string {
  const originalPrincipal = result.paymentSchedule[0] ?
    result.paymentSchedule[0].remainingBalance + result.paymentSchedule[0].principal :
    0;

  const lines = [
    "TÓM TẮT VAY VỐN",
    "================",
    `Số tiền vay: ${formatVND(originalPrincipal)}`,
    `Thời gian vay: ${result.summary.totalPayments} tháng`,
    `Trả hàng tháng: ${formatVND(result.monthlyPayment)}`,
    `Tổng lãi: ${formatVND(result.totalInterest)}`,
    `Tổng phí: ${formatVND(result.totalFees)}`,
    `Tổng số tiền phải trả: ${formatVND(result.totalPayable)}`,
    `Lãi suất hiệu quả (APR): ${result.effectiveAPR.toFixed(2)}%`,
    "",
    "LỊCH TRẢ NỢ",
    "===========",
    `Ngày trả đầu tiên: ${result.summary.firstPaymentDate.toLocaleDateString("vi-VN")}`,
    `Ngày trả cuối cùng: ${result.summary.lastPaymentDate.toLocaleDateString("vi-VN")}`,
  ];

  if (result.promotionalSummary) {
    lines.push(
      "",
      "GIAI ĐOẠN ƯU ĐÃI",
      "==================",
      `Trả hàng tháng ưu đãi: ${formatVND(result.promotionalSummary.promotionalMonthlyPayment)}`,
      `Trả hàng tháng sau ưu đãi: ${formatVND(result.promotionalSummary.postPromotionalMonthlyPayment)}`,
      `Tiết kiệm trong giai đoạn ưu đãi: ${formatVND(result.promotionalSummary.promotionalSavings)}`
    );
  }

  return lines.join("\n");
}