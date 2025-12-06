/**
 * Vietnamese Gross to Net Salary Calculator
 *
 * This module provides comprehensive gross to net salary conversion for Vietnam,
 * including all mandatory deductions and tax calculations.
 */

import { calculateTax } from "./tax";
import {
  calculateEmployeeInsurance,
  calculateEmployerInsurance,
  type InsuranceBreakdown,
} from "./insurance";
import {
  ALLOWANCES,
  REGIONAL_MINIMUM_WAGES,
  TAX_BRACKETS,
} from "@/lib/constants/tools";

// Type definition for the return value
export interface SalaryGrossToNetResult {
  gross: number;
  net: number;
  insurance: {
    employee: InsuranceBreakdown;
    employer?: InsuranceBreakdown;
  };
  allowances: {
    self: number;
    dependent: number;
    total: number;
  };
  tax: {
    taxableIncome: number;
    tax: number;
    brackets?: Array<{ max: number; rate: number; tax: number }>;
  };
  employerCost?: number; // gross + employer insurance
}

/**
 * Helper function to calculate tax with bracket breakdowns
 */
function calculateTaxWithBrackets(taxableIncome: number): {
  tax: number;
  brackets: Array<{ max: number; rate: number; tax: number }>;
} {
  if (taxableIncome <= 0) {
    return { tax: 0, brackets: [] };
  }

  // Use the existing calculateTax function for the actual tax calculation
  const tax = calculateTax(taxableIncome);

  // Calculate bracket breakdowns for display purposes
  let remainingIncome = taxableIncome;
  let previousMax = 0;
  const brackets: Array<{ max: number; rate: number; tax: number }> = [];
  let startedIncludingBrackets = false;
  let includedOneExtraBracket = false;

  for (const bracket of TAX_BRACKETS) {
    const rangeMax = bracket.max === Infinity ? Infinity : bracket.max;
    const taxableInThisBracket = Math.min(
      remainingIncome,
      rangeMax - previousMax,
    );

    const taxInThisBracket = Math.max(0, taxableInThisBracket * bracket.rate);

    // Start including brackets once we find the first bracket with taxable income
    if (taxableInThisBracket > 0) {
      startedIncludingBrackets = true;
    }

    // Include bracket if:
    // 1. We've started the sequence, OR
    // 2. We've included at least one bracket with taxable income and haven't included the extra one yet
    if (
      startedIncludingBrackets ||
      (brackets.length > 0 && !includedOneExtraBracket)
    ) {
      brackets.push({
        max: bracket.max === Infinity ? 80_000_000 : bracket.max,
        rate: bracket.rate,
        tax: Math.floor(taxInThisBracket),
      });

      // Mark that we've included one extra bracket after the ones with taxable income
      if (taxableInThisBracket === 0 && brackets.length > 0) {
        includedOneExtraBracket = true;
      }
    }

    if (taxableInThisBracket > 0) {
      remainingIncome -= taxableInThisBracket;
    }

    previousMax = bracket.max;

    // Stop if we've exhausted remaining income AND included one extra bracket
    if (remainingIncome <= 0 && includedOneExtraBracket) break;
  }

  return { tax, brackets };
}

/**
 * Validates input parameters
 */
function validateInputs(params: {
  gross: number;
  region: number;
  dependents: number;
}): void {
  // Validate region
  if (
    typeof params.region !== "number" ||
    !Number.isInteger(params.region) ||
    params.region < 1 ||
    params.region > 4
  ) {
    throw new Error("Invalid region: must be 1, 2, 3, or 4");
  }

  // Check minimum wage requirement
  const minimumWage =
    REGIONAL_MINIMUM_WAGES[
      params.region as keyof typeof REGIONAL_MINIMUM_WAGES
    ];
  if (params.gross > 0 && params.gross < minimumWage) {
    console.warn(
      `Warning: Gross salary (${params.gross.toLocaleString("vi-VN")} VND) is below region ${params.region} minimum wage (${minimumWage.toLocaleString("vi-VN")} VND)`,
    );
  }
}

/**
 * Converts gross monthly salary to net salary with all deductions
 *
 * This function calculates the complete breakdown from gross to net salary,
 * including social insurance, health insurance, unemployment insurance,
 * personal income tax, and all applicable allowances.
 *
 * @param params - Calculation parameters
 * @returns Complete salary breakdown with all deductions
 */
export function calculateGrossToNet(params: {
  gross: number;
  region: number;
  dependents: number;
  includeEmployer?: boolean;
}): SalaryGrossToNetResult {
  // Handle null/undefined inputs
  if (params === null || params === undefined) {
    return {
      gross: 0,
      net: 0,
      insurance: {
        employee: { social: 0, health: 0, unemployment: 0, total: 0 },
      },
      allowances: {
        self: ALLOWANCES.self,
        dependent: 0,
        total: ALLOWANCES.self,
      },
      tax: { taxableIncome: 0, tax: 0, brackets: [] },
    };
  }

  // Handle NaN
  if (typeof params.gross === "number" && isNaN(params.gross)) {
    return {
      gross: NaN,
      net: NaN,
      insurance: {
        employee: { social: 0, health: 0, unemployment: 0, total: 0 },
      },
      allowances: {
        self: ALLOWANCES.self,
        dependent: 0,
        total: ALLOWANCES.self,
      },
      tax: { taxableIncome: 0, tax: 0, brackets: [] },
    };
  }

  // Extract inputs
  const gross = Number(params.gross) || 0;
  const region = params.region; // Keep original for validation
  const dependents = Number(params.dependents) || 0;
  const includeEmployer = Boolean(params.includeEmployer);

  // Sanitize dependents - negative values become 0, decimal values are floored
  const sanitizedDependents = Math.max(0, Math.floor(dependents));

  const validatedParams = { gross, region, dependents: sanitizedDependents };
  validateInputs(validatedParams);

  // Handle edge cases for gross salary
  if (gross <= 0) {
    const result: SalaryGrossToNetResult = {
      gross,
      net: gross,
      insurance: {
        employee: { social: 0, health: 0, unemployment: 0, total: 0 },
      },
      allowances: {
        self: ALLOWANCES.self,
        dependent: ALLOWANCES.dependent * Math.max(0, dependents),
        total: ALLOWANCES.self + ALLOWANCES.dependent * Math.max(0, dependents),
      },
      tax: { taxableIncome: 0, tax: 0, brackets: [] },
    };

    if (includeEmployer) {
      result.insurance.employer = {
        social: 0,
        health: 0,
        unemployment: 0,
        total: 0,
      };
      result.employerCost = gross;
    }

    return result;
  }

  // Calculate insurance deductions (employee)
  const employeeInsurance = calculateEmployeeInsurance(gross);

  // Calculate allowances
  const selfAllowance = ALLOWANCES.self;
  const dependentAllowance = ALLOWANCES.dependent * sanitizedDependents;
  const totalAllowances = selfAllowance + dependentAllowance;

  // Calculate taxable income
  const taxableIncome = Math.max(
    0,
    gross - employeeInsurance.total - totalAllowances,
  );

  // Calculate tax with bracket breakdowns
  const taxResult = calculateTaxWithBrackets(taxableIncome);

  // Calculate net salary
  const net = gross - employeeInsurance.total - taxResult.tax;

  // Build result object
  const result: SalaryGrossToNetResult = {
    gross,
    net,
    insurance: {
      employee: employeeInsurance,
    },
    allowances: {
      self: selfAllowance,
      dependent: dependentAllowance,
      total: totalAllowances,
    },
    tax: {
      taxableIncome,
      tax: taxResult.tax,
      brackets: taxResult.brackets,
    },
  };

  // Include employer insurance if requested
  if (includeEmployer) {
    const employerInsurance = calculateEmployerInsurance(gross);
    result.insurance.employer = employerInsurance;
    result.employerCost = gross + employerInsurance.total;
  }

  return result;
}
