/**
 * Vietnamese Tax Brackets and Calculations
 *
 * This module provides comprehensive tax calculation functionality for Vietnam,
 * including personal income tax, corporate tax, and other tax-related calculations.
 */

import {
  FamilyDeduction,
  SocialInsuranceRates,
  type VietnameseTaxBracket,
} from "./vietnamese-financial-data";

export interface TaxCalculationResult {
  grossIncome: number;
  socialInsurance: number;
  healthInsurance: number;
  unemploymentInsurance: number;
  totalInsurance: number;
  familyDeductions: number;
  taxableIncome: number;
  incomeTax: number;
  netIncome: number;
  effectiveTaxRate: number;
  breakdown: TaxBreakdown;
}

export interface TaxBreakdown {
  grossIncome: number;
  deductions: {
    socialInsurance: number;
    healthInsurance: number;
    unemploymentInsurance: number;
    familyDeductions: number;
    total: number;
  };
  taxableIncome: number;
  taxBrackets: {
    bracket: VietnameseTaxBracket;
    amount: number;
    tax: number;
  }[];
  incomeTax: number;
  netIncome: number;
}

export interface TaxCalculationParams {
  grossMonthlyIncome: number;
  numberOfDependents: number;
  region: number; // 1-4 based on regional minimum wage
  maritalStatus?: "single" | "married";
  spouseIncome?: number;
  hasDisabledDependent?: boolean;
  hasSelfAndSpouseOnly?: boolean;
}

/**
 * Calculate personal income tax based on Vietnamese regulations
 */
export const calculatePersonalIncomeTax = (
  grossMonthlyIncome: number,
  numberOfDependents: number = 0,
  region: number = 1,
): TaxCalculationResult => {
  // Get current rates
  const socialInsuranceRates = {
    socialInsuranceEmployee: 0.08,
    healthInsuranceEmployee: 0.015,
    unemploymentInsuranceEmployee: region === 1 ? 0.01 : 0.008, // Different rates for region 1
  };

  const familyDeductions = {
    taxpayerDeduction: 11000000,
    dependentDeduction: 4400000,
  };

  // Calculate social insurance contributions
  const socialInsurance = Math.min(
    grossMonthlyIncome * socialInsuranceRates.socialInsuranceEmployee,
    2380000,
  );
  const healthInsurance = Math.min(
    grossMonthlyIncome * socialInsuranceRates.healthInsuranceEmployee,
    447000,
  );
  const unemploymentInsurance = Math.min(
    grossMonthlyIncome * socialInsuranceRates.unemploymentInsuranceEmployee,
    884000,
  );
  const totalInsurance =
    socialInsurance + healthInsurance + unemploymentInsurance;

  // Calculate family deductions
  const familyDeductionsAmount =
    familyDeductions.taxpayerDeduction +
    numberOfDependents * familyDeductions.dependentDeduction;

  // Calculate taxable income
  const taxableIncome = Math.max(
    0,
    grossMonthlyIncome - totalInsurance - familyDeductionsAmount,
  );

  // Calculate income tax using progressive tax brackets
  const taxBrackets = [
    { minIncome: 0, maxIncome: 5000000, taxRate: 5, quickCalc: 0 },
    { minIncome: 5000001, maxIncome: 10000000, taxRate: 10, quickCalc: 250000 },
    {
      minIncome: 10000001,
      maxIncome: 18000000,
      taxRate: 15,
      quickCalc: 750000,
    },
    {
      minIncome: 18000001,
      maxIncome: 32000000,
      taxRate: 20,
      quickCalc: 1950000,
    },
    {
      minIncome: 32000001,
      maxIncome: 52000000,
      taxRate: 25,
      quickCalc: 4750000,
    },
    {
      minIncome: 52000001,
      maxIncome: 80000000,
      taxRate: 30,
      quickCalc: 9750000,
    },
    { minIncome: 80000001, taxRate: 35, quickCalc: 18150000 },
  ];

  let incomeTax = 0;
  const taxBracketDetails: Array<{
    bracket: VietnameseTaxBracket;
    amount: number;
    tax: number;
  }> = [];

  if (taxableIncome > 0) {
    for (const bracket of taxBrackets) {
      if (taxableIncome <= bracket.minIncome) break;

      const taxableInBracket = Math.min(
        taxableIncome - bracket.minIncome,
        bracket.maxIncome ? bracket.maxIncome - bracket.minIncome : Infinity,
      );

      const taxInBracket = taxableInBracket * (bracket.taxRate / 100);
      incomeTax += taxInBracket;

      taxBracketDetails.push({
        bracket: {
          minIncome: bracket.minIncome,
          maxIncome: bracket.maxIncome,
          taxRate: bracket.taxRate,
          quickCalc: bracket.quickCalc,
        },
        amount: taxableInBracket,
        tax: taxInBracket,
      });
    }
  }

  // Calculate net income
  const netIncome = grossMonthlyIncome - totalInsurance - incomeTax;
  const effectiveTaxRate =
    grossMonthlyIncome > 0 ? (incomeTax / grossMonthlyIncome) * 100 : 0;

  // Create breakdown
  const breakdown: TaxBreakdown = {
    grossIncome: grossMonthlyIncome,
    deductions: {
      socialInsurance,
      healthInsurance,
      unemploymentInsurance,
      familyDeductions: familyDeductionsAmount,
      total: totalInsurance + familyDeductionsAmount,
    },
    taxableIncome,
    taxBrackets: taxBracketDetails,
    incomeTax,
    netIncome,
  };

  return {
    grossIncome: grossMonthlyIncome,
    socialInsurance,
    healthInsurance,
    unemploymentInsurance,
    totalInsurance,
    familyDeductions: familyDeductionsAmount,
    taxableIncome,
    incomeTax,
    netIncome,
    effectiveTaxRate,
    breakdown,
  };
};

/**
 * Calculate annual tax projection
 */
export const calculateAnnualTaxProjection = (
  grossMonthlyIncome: number,
  numberOfDependents: number = 0,
  region: number = 1,
  months: number = 12,
): {
  annualGrossIncome: number;
  annualTax: number;
  annualNetIncome: number;
  monthlyDetails: TaxCalculationResult[];
} => {
  const monthlyDetails: TaxCalculationResult[] = [];
  let totalGrossIncome = 0;
  let totalTax = 0;

  for (let month = 1; month <= months; month++) {
    const monthCalculation = calculatePersonalIncomeTax(
      grossMonthlyIncome,
      numberOfDependents,
      region,
    );
    monthlyDetails.push(monthCalculation);
    totalGrossIncome += monthCalculation.grossIncome;
    totalTax += monthCalculation.incomeTax;
  }

  return {
    annualGrossIncome: totalGrossIncome,
    annualTax: totalTax,
    annualNetIncome: totalGrossIncome - totalTax,
    monthlyDetails,
  };
};

/**
 * Calculate tax for married couple (household income)
 */
export const calculateHouseholdTax = (params: {
  spouse1: {
    grossMonthlyIncome: number;
    numberOfDependents: number;
    region: number;
  };
  spouse2?: {
    grossMonthlyIncome: number;
    numberOfDependents: number;
    region: number;
  };
  filingMethod: "separate" | "joint";
}): {
  spouse1: TaxCalculationResult;
  spouse2?: TaxCalculationResult;
  joint?: TaxCalculationResult;
  recommendedMethod: "separate" | "joint";
  taxSavings: number;
} => {
  // Calculate separate filing
  const spouse1Calculation = calculatePersonalIncomeTax(
    params.spouse1.grossMonthlyIncome,
    params.spouse1.numberOfDependents,
    params.spouse1.region,
  );

  let spouse2Calculation: TaxCalculationResult | undefined;
  let jointCalculation: TaxCalculationResult | undefined;
  let recommendedMethod: "separate" | "joint" = "separate";
  let taxSavings = 0;

  if (params.spouse2) {
    spouse2Calculation = calculatePersonalIncomeTax(
      params.spouse2.grossMonthlyIncome,
      params.spouse2.numberOfDependents,
      params.spouse2.region,
    );

    const totalSeparateTax =
      spouse1Calculation.incomeTax + (spouse2Calculation?.incomeTax || 0);

    // Calculate joint filing
    const totalGrossIncome =
      params.spouse1.grossMonthlyIncome + params.spouse2.grossMonthlyIncome;
    const totalDependents =
      params.spouse1.numberOfDependents +
      (params.spouse2?.numberOfDependents || 0);
    const useRegion1 = Math.max(
      params.spouse1.region,
      params.spouse2?.region || 1,
    );

    jointCalculation = calculatePersonalIncomeTax(
      totalGrossIncome,
      totalDependents,
      useRegion1,
    );

    // Determine which method is better
    if (jointCalculation.incomeTax < totalSeparateTax) {
      recommendedMethod = "joint";
      taxSavings = totalSeparateTax - jointCalculation.incomeTax;
    }
  }

  return {
    spouse1: spouse1Calculation,
    spouse2: spouse2Calculation,
    joint: jointCalculation,
    recommendedMethod,
    taxSavings,
  };
};

/**
 * Calculate bonus/overtime tax implications
 */
export const calculateBonusTax = (
  regularMonthlyIncome: number,
  bonusAmount: number,
  numberOfDependents: number = 0,
  region: number = 1,
): {
  regularIncome: TaxCalculationResult;
  incomeWithBonus: TaxCalculationResult;
  bonusTax: number;
  effectiveBonusTaxRate: number;
  netBonus: number;
} => {
  // Calculate tax on regular income
  const regularIncomeCalculation = calculatePersonalIncomeTax(
    regularMonthlyIncome,
    numberOfDependents,
    region,
  );

  // Calculate tax on income including bonus
  const incomeWithBonusCalculation = calculatePersonalIncomeTax(
    regularMonthlyIncome + bonusAmount,
    numberOfDependents,
    region,
  );

  // Calculate bonus-specific tax
  const bonusTax =
    incomeWithBonusCalculation.incomeTax - regularIncomeCalculation.incomeTax;
  const effectiveBonusTaxRate =
    bonusAmount > 0 ? (bonusTax / bonusAmount) * 100 : 0;
  const netBonus = bonusAmount - bonusTax;

  return {
    regularIncome: regularIncomeCalculation,
    incomeWithBonus: incomeWithBonusCalculation,
    bonusTax,
    effectiveBonusTaxRate,
    netBonus,
  };
};

/**
 * Get tax optimization suggestions
 */
export const getTaxOptimizationSuggestions = (
  calculation: TaxCalculationResult,
  params: TaxCalculationParams,
): string[] => {
  const suggestions: string[] = [];

  // Check if close to next tax bracket
  if (calculation.taxableIncome > 0) {
    const taxBrackets = [
      {
        threshold: 5000000,
        suggestion:
          "Consider deferring income to next year if close to 5M VND threshold",
      },
      {
        threshold: 10000000,
        suggestion: "Review timing of compensation near 10M VND threshold",
      },
      {
        threshold: 18000000,
        suggestion: "Tax planning recommended near 18M VND threshold",
      },
      {
        threshold: 32000000,
        suggestion: "Consider bonus timing near 32M VND threshold",
      },
      {
        threshold: 52000000,
        suggestion:
          "Professional tax advice recommended near 52M VND threshold",
      },
      {
        threshold: 80000000,
        suggestion:
          "Professional tax advice recommended near 80M VND threshold",
      },
    ];

    for (const bracket of taxBrackets) {
      if (Math.abs(calculation.taxableIncome - bracket.threshold) < 1000000) {
        suggestions.push(bracket.suggestion);
      }
    }
  }

  // Check social insurance optimization
  if (
    calculation.socialInsurance < 2380000 &&
    params.grossMonthlyIncome >= 29750000
  ) {
    suggestions.push(
      "Consider increasing taxable salary up to 29.75M VND to maximize social insurance benefits",
    );
  }

  // Check dependent deductions
  if (params.numberOfDependents === 0 && calculation.grossIncome > 20000000) {
    suggestions.push(
      "Review eligibility for family deductions (parents, children, etc.)",
    );
  }

  // Check effective tax rate
  if (calculation.effectiveTaxRate > 25) {
    suggestions.push(
      "High effective tax rate detected. Consider professional tax advice",
    );
  }

  return suggestions;
};

/**
 * Validate tax calculation parameters
 */
export const validateTaxParams = (params: TaxCalculationParams): string[] => {
  const errors: string[] = [];

  if (params.grossMonthlyIncome < 0) {
    errors.push("Gross income must be non-negative");
  }

  if (params.numberOfDependents < 0) {
    errors.push("Number of dependents must be non-negative");
  }

  if (params.numberOfDependents > 20) {
    errors.push("Number of dependents exceeds reasonable limit");
  }

  if (params.region < 1 || params.region > 4) {
    errors.push("Region must be between 1 and 4");
  }

  if (params.spouseIncome && params.spouseIncome < 0) {
    errors.push("Spouse income must be non-negative");
  }

  if (params.grossMonthlyIncome > 1000000000) {
    // 1 billion VND
    errors.push("Gross income exceeds calculation limits");
  }

  return errors;
};

export default {
  calculatePersonalIncomeTax,
  calculateAnnualTaxProjection,
  calculateHouseholdTax,
  calculateBonusTax,
  getTaxOptimizationSuggestions,
  validateTaxParams,
};
