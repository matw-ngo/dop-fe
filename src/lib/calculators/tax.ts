/**
 * Vietnamese Personal Income Tax Calculator
 *
 * This module provides a function to calculate Vietnamese personal income tax
 * based on the progressive tax brackets defined by law.
 *
 * Tax brackets (2024):
 * - 0 - 5,000,000: 5%
 * - 5,000,001 - 10,000,000: 10%
 * - 10,000,001 - 18,000,000: 15%
 * - 18,000,001 - 32,000,000: 20%
 * - 32,000,001 - 52,000,000: 25%
 * - 52,000,001 - 80,000,000: 30%
 * - Above 80,000,000: 35%
 */

import { TAX_BRACKETS } from "@/lib/constants/tools";

/**
 * Calculates Vietnamese personal income tax based on taxable income.
 *
 * This function implements a progressive tax calculation method where different
 * portions of income are taxed at different rates according to Vietnamese law.
 *
 * @param taxableIncome - The taxable income amount in VND
 * @returns The calculated tax amount in VND, rounded to nearest integer
 *
 * @example
 * ```typescript
 * calculateTax(5000000) // Returns 250000
 * calculateTax(10000000) // Returns 750000
 * calculateTax(12000000) // Returns 1050000
 * ```
 */
export function calculateTax(taxableIncome: number): number {
  // Handle invalid inputs
  if (
    taxableIncome == null ||
    typeof taxableIncome !== "number" ||
    isNaN(taxableIncome) ||
    taxableIncome <= 0
  ) {
    return 0;
  }

  let tax = 0;
  let remainingIncome = taxableIncome;
  let previousBracketMax = 0;

  // Calculate tax progressively through each bracket
  for (const bracket of TAX_BRACKETS) {
    if (remainingIncome <= 0) break;

    // Determine the taxable amount in the current bracket
    const taxableInBracket = Math.min(
      remainingIncome,
      bracket.max - previousBracketMax,
    );

    // Add tax for this bracket
    tax += taxableInBracket * bracket.rate;

    // Update remaining income and previous bracket max
    remainingIncome -= taxableInBracket;
    previousBracketMax = bracket.max;
  }

  // Round down to nearest integer as per Vietnamese tax calculation rules
  // This ensures taxpayers are not overcharged
  return Math.floor(tax);
}
