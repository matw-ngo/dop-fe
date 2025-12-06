/**
 * Vietnamese Net to Gross Salary Calculator
 *
 * This module provides reverse calculation from net to gross salary for Vietnam,
 * using an iterative approach to find the gross salary that produces the desired net.
 */

import {
  calculateGrossToNet,
  type SalaryGrossToNetResult,
} from "./salary-gross-to-net";
import { ALLOWANCES, REGIONAL_MINIMUM_WAGES } from "@/lib/constants/tools";

// Type definition for the return value
export interface SalaryNetToGrossResult {
  net: number; // Input net salary
  gross: number; // Calculated gross salary
  iterations: number; // Number of iterations used
  converged: boolean; // Whether the calculation converged
  finalError?: number; // Final difference between target and calculated net
  breakdown?: SalaryGrossToNetResult; // Final gross-to-net breakdown
}

/**
 * Options for net to gross calculation
 */
export interface NetToGrossOptions {
  tolerance?: number; // Acceptable difference between target and calculated net (default: 0.01)
  maxIterations?: number; // Maximum iterations to prevent infinite loops (default: 100)
  includeBreakdown?: boolean; // Include full breakdown in result (default: false)
}

/**
 * Validates input parameters for net to gross calculation
 */
function validateNetToGrossParams(params: {
  net: number;
  region: number;
  dependents: number;
}): void {
  // Validate net salary
  if (
    typeof params.net !== "number" ||
    isNaN(params.net) ||
    !isFinite(params.net)
  ) {
    throw new Error("Invalid net salary: must be a finite number");
  }

  if (params.net < 0) {
    throw new Error("Invalid net salary: cannot be negative");
  }

  // Validate region
  if (
    typeof params.region !== "number" ||
    !Number.isInteger(params.region) ||
    params.region < 1 ||
    params.region > 4
  ) {
    throw new Error("Invalid region: must be 1, 2, 3, or 4");
  }

  // Validate dependents
  if (
    typeof params.dependents !== "number" ||
    isNaN(params.dependents) ||
    !isFinite(params.dependents)
  ) {
    throw new Error("Invalid dependents: must be a finite number");
  }

  if (params.dependents < 0) {
    throw new Error("Invalid dependents: cannot be negative");
  }

  if (!Number.isInteger(params.dependents)) {
    throw new Error("Invalid dependents: must be an integer");
  }
}

/**
 * Gets an initial estimate for gross salary based on net salary
 */
function getInitialGrossEstimate(
  net: number,
  dependents: number,
  region: number,
): number {
  // For very low net salaries, gross will be close to net
  if (net <= ALLOWANCES.self) {
    // Ensure gross meets minimum wage
    return Math.max(
      net + 1_000_000,
      REGIONAL_MINIMUM_WAGES[region as keyof typeof REGIONAL_MINIMUM_WAGES],
    );
  }

  // Estimate based on typical deduction rates
  // Average total deduction rate (insurance + tax) is usually 15-25%
  const averageDeductionRate = 0.2;
  const estimatedGross = net / (1 - averageDeductionRate);

  // Adjust for dependents (more dependents = less tax = lower gross needed)
  const dependentAdjustment = dependents * ALLOWANCES.dependent * 0.1; // 10% of dependent allowance
  const adjustedGross = estimatedGross - dependentAdjustment;

  // Ensure gross meets minimum wage
  const minimumWage =
    REGIONAL_MINIMUM_WAGES[region as keyof typeof REGIONAL_MINIMUM_WAGES];
  return Math.max(minimumWage, adjustedGross);
}

/**
 * Performs binary search to find the gross salary that produces the target net
 */
function binarySearchGross(
  targetNet: number,
  region: number,
  dependents: number,
  tolerance: number,
  maxIterations: number,
): {
  gross: number;
  iterations: number;
  converged: boolean;
  finalError: number;
} {
  // Initialize search bounds
  const minimumWage =
    REGIONAL_MINIMUM_WAGES[region as keyof typeof REGIONAL_MINIMUM_WAGES];
  let low = Math.max(minimumWage, targetNet); // Gross cannot be less than minimum wage or net
  let high = Math.max(low, targetNet * 3); // Start with triple the net as upper bound (more space for search)

  // If high is too low, expand it until we find a gross that produces the target net
  while (true) {
    const testResult = calculateGrossToNet({ gross: high, region, dependents });
    if (testResult.net >= targetNet) {
      break;
    }
    high *= 1.5;
    if (high > 1_000_000_000) break; // Safety limit
  }

  let gross = (low + high) / 2;
  let iterations = 0;
  let converged = false;
  let bestGross = gross;
  let bestError = Infinity;

  while (iterations < maxIterations) {
    const testGross = Math.round(gross); // Round to integer for cleaner calculation
    const result = calculateGrossToNet({
      gross: testGross,
      region,
      dependents,
    });
    const currentNet = result.net;
    const absError = Math.abs(currentNet - targetNet);

    // Track best solution found
    if (absError < bestError) {
      bestError = absError;
      bestGross = testGross;
    }

    // Check if we've converged
    if (absError <= tolerance) {
      converged = true;
      bestGross = testGross;
      break;
    }

    // Adjust search bounds based on comparison
    if (currentNet < targetNet) {
      low = gross;
    } else {
      high = gross;
    }

    // Calculate new gross as midpoint
    gross = (low + high) / 2;

    // Prevent infinite loop
    if (Math.abs(high - low) < 1) {
      break;
    }

    iterations++;
  }

  return { gross: bestGross, iterations, converged, finalError: bestError };
}

/**
 * Converts net monthly salary to gross salary using reverse calculation
 *
 * This function uses a binary search approach to find the gross salary
 * that produces the desired net salary after all deductions.
 *
 * @param params - Calculation parameters
 * @param options - Optional configuration for the calculation
 * @returns Gross salary calculation result with metadata
 */
export function calculateNetToGross(
  params: {
    net: number;
    region: number;
    dependents: number;
  },
  options?: NetToGrossOptions,
): SalaryNetToGrossResult {
  // Handle null/undefined inputs
  if (params === null || params === undefined) {
    throw new Error("Invalid parameters: params cannot be null or undefined");
  }

  // Set default options
  const opts: Required<NetToGrossOptions> = {
    tolerance: options?.tolerance ?? 0.01,
    maxIterations: options?.maxIterations ?? 100,
    includeBreakdown: options?.includeBreakdown ?? false,
  };

  // Handle NaN net
  if (typeof params.net === "number" && isNaN(params.net)) {
    throw new Error("Net salary must be a valid number");
  }

  // Extract and validate inputs
  const net = Number(params.net) || 0;
  const region = params.region;
  const dependents = Number(params.dependents) || 0;

  const sanitizedParams = { net, region, dependents };
  validateNetToGrossParams(sanitizedParams);

  // Handle edge case: zero net salary
  if (net === 0) {
    const result: SalaryNetToGrossResult = {
      net: 0,
      gross: 0,
      iterations: 0,
      converged: true,
    };

    if (opts.includeBreakdown) {
      result.breakdown = calculateGrossToNet({ gross: 0, region, dependents });
    }

    return result;
  }

  // Special case: net salary is exactly the allowance amount
  // This means no taxable income, so gross = net + minimum insurance
  if (net <= ALLOWANCES.self + ALLOWANCES.dependent * dependents) {
    // Minimum gross would be net + small amount for insurance
    const minimumGross = Math.max(
      net + 100_000,
      REGIONAL_MINIMUM_WAGES[region as keyof typeof REGIONAL_MINIMUM_WAGES],
    );
    const result: SalaryNetToGrossResult = {
      net,
      gross: minimumGross,
      iterations: 1,
      converged: true,
    };

    if (opts.includeBreakdown) {
      result.breakdown = calculateGrossToNet({
        gross: minimumGross,
        region,
        dependents,
      });
    }

    return result;
  }

  // Perform binary search to find the correct gross
  const searchResult = binarySearchGross(
    net,
    region,
    dependents,
    opts.tolerance,
    opts.maxIterations,
  );

  // Local search around the found value for better accuracy
  let bestGross = Math.round(searchResult.gross);
  let bestError = Infinity;
  let totalIterations = searchResult.iterations;
  let finalConverged = false;

  // Search around the found gross value
  const searchRange = 5000; // Search ±5000 VND around the found value
  const searchStep = 500; // Check every 500 VND

  for (let offset = -searchRange; offset <= searchRange; offset += searchStep) {
    if (totalIterations >= opts.maxIterations) break;

    const testGross = Math.max(
      REGIONAL_MINIMUM_WAGES[region as keyof typeof REGIONAL_MINIMUM_WAGES],
      Math.round(searchResult.gross + offset),
    );

    const result = calculateGrossToNet({
      gross: testGross,
      region,
      dependents,
    });
    const error = Math.abs(result.net - net);
    totalIterations++;

    if (error < bestError) {
      bestError = error;
      bestGross = testGross;
    }

    if (error <= opts.tolerance) {
      finalConverged = true;
      break;
    }
  }

  // If still not converged, try linear search
  if (
    !finalConverged &&
    bestError > opts.tolerance &&
    totalIterations < opts.maxIterations
  ) {
    const startGross = Math.max(
      REGIONAL_MINIMUM_WAGES[region as keyof typeof REGIONAL_MINIMUM_WAGES],
      bestGross - 100000,
    );
    const endGross = bestGross + 100000;

    for (let gross = startGross; gross <= endGross; gross += 100) {
      if (totalIterations >= opts.maxIterations) break;

      const result = calculateGrossToNet({ gross, region, dependents });
      const error = Math.abs(result.net - net);
      totalIterations++;

      if (error < bestError) {
        bestError = error;
        bestGross = gross;
      }

      if (error <= opts.tolerance) {
        finalConverged = true;
        break;
      }
    }
  }

  // Build result object
  const result: SalaryNetToGrossResult = {
    net,
    gross: bestGross,
    iterations: totalIterations,
    converged: finalConverged || bestError <= opts.tolerance,
    finalError: bestError,
  };

  // Include breakdown if requested
  if (opts.includeBreakdown) {
    result.breakdown = calculateGrossToNet({
      gross: result.gross,
      region,
      dependents,
    });
  }

  // Validate minimum wage requirement
  const minimumWage =
    REGIONAL_MINIMUM_WAGES[region as keyof typeof REGIONAL_MINIMUM_WAGES];
  if (result.gross > 0 && result.gross < minimumWage) {
    console.warn(
      `Warning: Calculated gross salary (${result.gross.toLocaleString("vi-VN")} VND) is below region ${region} minimum wage (${minimumWage.toLocaleString("vi-VN")} VND)`,
    );
  }

  return result;
}

/**
 * Convenience function to get just the gross amount without metadata
 */
export function getGrossFromNet(
  net: number,
  region: number,
  dependents: number,
  tolerance: number = 0.01,
): number {
  const result = calculateNetToGross(
    { net, region, dependents },
    { tolerance },
  );
  return result.gross;
}
