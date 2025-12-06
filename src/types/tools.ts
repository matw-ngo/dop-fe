/**
 * TypeScript interfaces for the Financial Tools feature
 * Supports savings calculator, salary calculator, and loan calculator functionality
 */

// ============================================================================
// Savings Calculator Types
// ============================================================================

/**
 * Individual savings offering from a bank
 */
export interface ISaving {
  /** Bank name (short form) */
  name: string;
  /** Full bank name */
  full_name: string;
  /** Number of users interested in this savings product */
  interested: number;
  /** Interest rate percentage */
  ir: number;
  /** Total amount after interest period */
  total: number;
  /** Interest amount earned */
  interest: number;
  /** External link to the bank's savings product page */
  link: string;
}

/**
 * Input parameters for savings calculator
 */
export interface ISavingsParams {
  /** Initial deposit amount */
  amount: number;
  /** Savings period in months */
  period: number;
  /** Type of savings account */
  type: "counter" | "online";
  /** Sorting order for results */
  orderBy: "rate_asc" | "rate_desc";
}

/**
 * Result from savings calculator API
 */
export interface ISavingsResult {
  /** Array of savings offerings */
  savings: ISaving[];
  /** Minimum interest rate among results */
  minRate: number;
  /** Maximum interest rate among results */
  maxRate: number;
  /** Total count of savings offerings */
  totalCount: number;
}

// ============================================================================
// Salary Calculator Types
// ============================================================================

/**
 * Salary breakdown calculation result
 */
export interface ISalary {
  /** Gross salary before deductions */
  gross: number;
  /** Net salary after all deductions */
  net: number;
  /** Employee's social insurance contribution */
  social_insurance: number;
  /** Employee's health insurance contribution */
  health_insurance: number;
  /** Employee's unemployment insurance contribution */
  unemployment_insurance: number;
  /** Total employee insurance contributions */
  total_insurance: number;
  /** Family allowances amount */
  family_allowances: number;
  /** Dependent family allowances amount */
  dependent_family_allowances: number;
  /** Taxable income after deductions */
  taxable_income: number;
  /** Income after all deductions before tax */
  income: number;
  /** Personal income tax breakdown by bracket */
  personal_income_tax: number[];
  /** Total personal income tax */
  total_personal_income_tax: number;
  /** Employer's social insurance contribution */
  org_social_insurance: number;
  /** Employer's health insurance contribution */
  org_health_insurance: number;
  /** Employer's unemployment insurance contribution */
  org_unemployment_insurance: number;
  /** Total cost to employer (gross salary + employer contributions) */
  total_org_payment: number;
}

// ============================================================================
// Loan Calculator Types
// ============================================================================

/**
 * Monthly amortization schedule entry
 */
export interface AmortizationEntry {
  /** Month number (starting from 1) */
  month: number;
  /** Principal payment for the month */
  principal: number;
  /** Interest payment for the month */
  interest: number;
  /** Remaining loan balance after payment */
  balance: number;
}

/**
 * Input parameters for loan calculator
 */
export interface ILoanParams {
  /** Loan amount requested */
  amount: number;
  /** Loan term in months */
  term: number;
  /** Annual interest rate percentage */
  rate: number;
}

/**
 * Result from loan calculator
 */
export interface ILoanResult {
  /** Monthly payment amount */
  monthlyPayment: number;
  /** Total amount to be paid over the loan term */
  totalPayment: number;
  /** Total interest to be paid over the loan term */
  totalInterest: number;
  /** Detailed amortization schedule */
  amortization: AmortizationEntry[];
}

// ============================================================================
// Common Types
// ============================================================================

/**
 * Financial tool types for routing/identification
 */
export type FinancialToolType = "savings" | "salary" | "loan";

/**
 * Base API response structure for financial tools
 */
export interface IFinancialToolResponse<T> {
  /** Success status */
  success: boolean;
  /** Response data */
  data: T;
  /** Response message */
  message?: string;
  /** Timestamp of the response */
  timestamp: string;
}
