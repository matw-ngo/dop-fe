/**
 * Vietnamese Financial Calculation Constants
 *
 * This file contains all critical constants for financial calculations
 * in Vietnam, including tax brackets, insurance rates, and other
 * legal requirements as per Vietnamese law.
 */

// ================================
// TAX CONSTANTS
// ================================

/**
 * Vietnamese personal income tax brackets
 * Based on Vietnamese law - Circular No. 111/2013/TT-BTC
 * Rates are progressive and apply to taxable income after deductions
 */
export const TAX_BRACKETS = [
  { max: 5_000_000, rate: 0.05 }, // 5% for income up to 5 million VND
  { max: 10_000_000, rate: 0.1 }, // 10% for income from 5-10 million VND
  { max: 18_000_000, rate: 0.15 }, // 15% for income from 10-18 million VND
  { max: 32_000_000, rate: 0.2 }, // 20% for income from 18-32 million VND
  { max: 52_000_000, rate: 0.25 }, // 25% for income from 32-52 million VND
  { max: 80_000_000, rate: 0.3 }, // 30% for income from 52-80 million VND
  { max: Infinity, rate: 0.35 }, // 35% for income above 80 million VND
] as const;

/**
 * Personal income tax deductions and allowances (2024)
 * Based on Decree No. 164/2022/ND-CP
 */
export const ALLOWANCES = {
  /** Self-dependence allowance: 11 million VND/month */
  self: 11_000_000,
  /** Dependent allowance: 4.4 million VND/person/month */
  dependent: 4_400_000,
} as const;

// ================================
// INSURANCE CONSTANTS
// ================================

/**
 * Mandatory social insurance contribution rates in Vietnam
 * Based on Law on Social Insurance and guiding circulars
 * Rates are applied to monthly salary
 */
export const INSURANCE_RATES = {
  /** Employee contribution rates */
  employee: {
    /** Social insurance: 8% of salary */
    social: 0.08,
    /** Health insurance: 1.5% of salary */
    health: 0.015,
    /** Unemployment insurance: 1% of salary */
    unemployment: 0.01,
  },
  /** Employer contribution rates */
  employer: {
    /** Social insurance: 17.5% of salary */
    social: 0.175,
    /** Health insurance: 3% of salary */
    health: 0.03,
    /** Unemployment insurance: 1% of salary */
    unemployment: 0.01,
  },
} as const;

/**
 * Salary limits for insurance contributions
 * Based on current regulations and minimum wage levels
 */
export const INSURANCE_SALARY_LIMITS = {
  social: {
    /** Employee cap: 20x Region I minimum wage */
    employee: 23_840_000,
    /** Employer cap for contribution calculation */
    employer: 94_000_000,
  },
  health: {
    /** Employee cap: 20x Region I minimum wage */
    employee: 23_840_000,
    /** Employer cap for contribution calculation */
    employer: 94_000_000,
  },
  unemployment: {
    /** Unemployment insurance cap for both employee and employer */
    employee: 34_500_000,
    employer: 34_500_000,
  },
} as const;

// ================================
// REGIONAL MINIMUM WAGES
// ================================

/**
 * Regional minimum wages in Vietnam (2024)
 * Based on Decree No. 38/2022/ND-CP
 * Effective from July 1, 2022
 */
export const REGIONAL_MINIMUM_WAGES = {
  /** Region I: Urban districts of Hanoi, HCMC */
  1: 4_680_000,
  /** Region II: Rural districts of Hanoi, HCMC; urban districts of other cities */
  2: 4_160_000,
  /** Region III: Towns and rural districts of cities/provinces */
  3: 3_640_000,
  /** Region IV: Remaining rural areas */
  4: 3_250_000,
} as const;

// ================================
// SAVINGS CALCULATOR DEFAULTS
// ================================

/**
 * Default parameters for savings calculator
 * Common values used in Vietnamese banking systems
 */
export const SAVINGS_DEFAULTS = {
  /** Minimum savings amount: 10 million VND */
  MIN_AMOUNT: 10_000_000,
  /** Maximum savings amount: 1 billion VND */
  MAX_AMOUNT: 1_000_000_000,
  /** Standard savings periods in months */
  PERIODS: [1, 3, 6, 9, 12, 18, 24],
  /** Default savings period: 12 months */
  DEFAULT_PERIOD: 12,
  /** Savings account types */
  TYPES: {
    /** Counter savings account */
    COUNTER: 0,
    /** Online savings account */
    ONLINE: 1,
  },
} as const;

// ================================
// LOAN CALCULATOR DEFAULTS
// ================================

/**
 * Default parameters for loan calculator
 * Based on common loan products in Vietnamese banks
 */
export const LOAN_DEFAULTS = {
  /** Minimum loan term: 1 month */
  MIN_TERM: 1,
  /** Maximum loan term: 360 months (30 years) */
  MAX_TERM: 360,
  /** Default loan term: 12 months (1 year) */
  DEFAULT_TERM: 12,
  /** Minimum interest rate: 1.0% per year */
  MIN_RATE: 1.0,
  /** Maximum interest rate: 30.0% per year */
  MAX_RATE: 30.0,
} as const;

// ================================
// UTILITY CONSTANTS
// ================================

/**
 * Common numeric values used in calculations
 */
export const NUMERIC_CONSTANTS = {
  /** Percentage conversion factor */
  PERCENTAGE: 100,
  /** Months in a year */
  MONTHS_IN_YEAR: 12,
  /** Days in a year (for daily calculations) */
  DAYS_IN_YEAR: 365,
} as const;

/**
 * Currency formatting constants
 */
export const CURRENCY = {
  /** Vietnamese Dong currency code */
  CODE: "VND",
  /** Default number of decimal places */
  DECIMALS: 0,
  /** Thousands separator */
  THOUSANDS_SEPARATOR: ",",
} as const;
