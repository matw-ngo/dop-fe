/**
 * Vietnamese Insurance Calculator
 *
 * Implements calculations for mandatory social, health, and unemployment insurance
 * contributions in Vietnam according to current legal requirements.
 *
 * Rates effective 2024:
 * - Employee rates: Social (8%), Health (1.5%), Unemployment (1%) = 10.5% total
 * - Employer rates: Social (17.5%), Health (3%), Unemployment (1%) = 21.5% total
 */

import { INSURANCE_RATES, INSURANCE_SALARY_LIMITS } from "../constants";

// ============================================================================
// Type Definitions
// ============================================================================

/** Interface for insurance breakdown by component */
export interface InsuranceBreakdown {
  /** Social insurance contribution amount */
  social: number;
  /** Health insurance contribution amount */
  health: number;
  /** Unemployment insurance contribution amount */
  unemployment: number;
  /** Total contribution amount */
  total: number;
}

/** Interface for total insurance costs (employee + employer) */
export interface TotalInsurance {
  /** Employee contribution breakdown */
  employee: InsuranceBreakdown;
  /** Employer contribution breakdown */
  employer: InsuranceBreakdown;
  /** Total combined contribution */
  total: number;
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Validates salary input and handles edge cases
 * @param salary - The salary amount to validate
 * @returns Valid salary (>= 0) or 0 for invalid input
 */
function validateSalary(salary: any): number {
  // Handle null/undefined/NaN/non-numeric inputs
  if (
    salary === null ||
    salary === undefined ||
    Number.isNaN(salary) ||
    typeof salary !== "number"
  ) {
    return 0;
  }

  // Handle negative salaries
  if (salary < 0) {
    return 0;
  }

  return salary;
}

/**
 * Calculates contribution for a single insurance component with cap
 * @param salary - The base salary
 * @param rate - The contribution rate
 * @param cap - The salary cap for this component
 * @returns Rounded contribution amount
 */
function calculateWithCap(salary: number, rate: number, cap: number): number {
  const taxableSalary = Math.min(salary, cap);
  return Math.round(taxableSalary * rate);
}

// ============================================================================
// Main Calculation Functions
// ============================================================================

/**
 * Calculates employee's insurance contributions
 * @param salary - Monthly gross salary
 * @returns Breakdown of employee contributions by type
 */
export function calculateEmployeeInsurance(salary: number): InsuranceBreakdown {
  const validSalary = validateSalary(salary);

  if (validSalary === 0) {
    return {
      social: 0,
      health: 0,
      unemployment: 0,
      total: 0,
    };
  }

  const rates = INSURANCE_RATES.employee;
  const limits = INSURANCE_SALARY_LIMITS;

  // Calculate each component with respective caps
  const social = calculateWithCap(
    validSalary,
    rates.social,
    limits.social.employee,
  );
  const health = calculateWithCap(
    validSalary,
    rates.health,
    limits.health.employee,
  );
  const unemployment = calculateWithCap(
    validSalary,
    rates.unemployment,
    limits.unemployment.employee,
  );

  const total = social + health + unemployment;

  return {
    social,
    health,
    unemployment,
    total,
  };
}

/**
 * Calculates employer's insurance contributions
 * @param salary - Monthly gross salary of employee
 * @returns Breakdown of employer contributions by type
 */
export function calculateEmployerInsurance(salary: number): InsuranceBreakdown {
  const validSalary = validateSalary(salary);

  if (validSalary === 0) {
    return {
      social: 0,
      health: 0,
      unemployment: 0,
      total: 0,
    };
  }

  const rates = INSURANCE_RATES.employer;
  const limits = INSURANCE_SALARY_LIMITS;

  // Calculate each component with respective caps
  const social = calculateWithCap(
    validSalary,
    rates.social,
    limits.social.employer,
  );
  const health = calculateWithCap(
    validSalary,
    rates.health,
    limits.health.employer,
  );
  const unemployment = calculateWithCap(
    validSalary,
    rates.unemployment,
    limits.unemployment.employer,
  );

  const total = social + health + unemployment;

  return {
    social,
    health,
    unemployment,
    total,
  };
}

/**
 * Calculates total insurance contributions (employee + employer)
 * @param salary - Monthly gross salary
 * @returns Complete breakdown including employee, employer, and total contributions
 */
export function calculateTotalInsurance(salary: number): TotalInsurance {
  const employee = calculateEmployeeInsurance(salary);
  const employer = calculateEmployerInsurance(salary);

  const total = employee.total + employer.total;

  return {
    employee,
    employer,
    total,
  };
}
