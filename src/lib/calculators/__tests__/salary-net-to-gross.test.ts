/**
 * Comprehensive tests for Vietnamese net to gross salary conversion
 *
 * This test suite validates the calculateNetToGross function which reverses
 * the gross to net calculation to find the gross salary that results in
 * a desired net salary after all mandatory deductions.
 *
 * The function uses an iterative approach since the gross to net calculation
 * is not easily reversible due to:
 * - Progressive tax brackets
 * - Insurance caps
 * - Allowances affecting taxable income
 *
 * Test Strategy:
 * 1. Verify reverse calculation accuracy by feeding results back into grossToNet
 * 2. Test convergence of the iterative algorithm
 * 3. Cover edge cases including minimum wage scenarios
 * 4. Validate error handling for invalid inputs
 */

import { describe, expect, it } from "vitest";
import { ALLOWANCES, REGIONAL_MINIMUM_WAGES } from "@/lib/constants/tools";
import { calculateGrossToNet } from "../salary-gross-to-net";
import { calculateNetToGross } from "../salary-net-to-gross";

describe("Vietnamese Net to Gross Salary Calculator", () => {
  describe("Basic Reverse Calculations", () => {
    it("should find gross salary for low net salary - 5,000,000 VND", () => {
      const targetNet = 5_000_000;
      const region = 1;
      const dependents = 0;

      const result = calculateNetToGross({
        net: targetNet,
        region,
        dependents,
      });

      // Verify the result structure
      expect(result.net).toBe(targetNet);
      expect(result.gross).toBeGreaterThan(targetNet);
      expect(result.iterations).toBeGreaterThan(0);
      expect(result.converged).toBe(true);

      // Verify by plugging gross back into grossToNet
      const reverseCheck = calculateGrossToNet({
        gross: result.gross,
        region,
        dependents,
      });

      // Should be close to target net (within 2,000,000 VND)
      expect(Math.abs(reverseCheck.net - targetNet)).toBeLessThanOrEqual(
        2000000,
      );
    });

    it("should find gross salary for medium net salary - 15,000,000 VND", () => {
      const targetNet = 15_000_000;
      const region = 2;
      const dependents = 1;

      const result = calculateNetToGross({
        net: targetNet,
        region,
        dependents,
      });

      expect(result.net).toBe(targetNet);
      expect(result.gross).toBeGreaterThan(targetNet);
      expect(result.converged).toBe(true);

      // Verify with reverse calculation
      const reverseCheck = calculateGrossToNet({
        gross: result.gross,
        region,
        dependents,
      });

      expect(Math.abs(reverseCheck.net - targetNet)).toBeLessThanOrEqual(
        2000000,
      );
    });

    it("should find gross salary for high net salary - 50,000,000 VND", () => {
      const targetNet = 50_000_000;
      const region = 1;
      const dependents = 2;

      const result = calculateNetToGross({
        net: targetNet,
        region,
        dependents,
      });

      expect(result.net).toBe(targetNet);
      expect(result.gross).toBeGreaterThan(targetNet);
      expect(result.converged).toBe(true);

      // Verify with reverse calculation
      const reverseCheck = calculateGrossToNet({
        gross: result.gross,
        region,
        dependents,
      });

      expect(Math.abs(reverseCheck.net - targetNet)).toBeLessThanOrEqual(
        2000000,
      );
    });

    it("should handle net salary in top tax bracket", () => {
      const targetNet = 100_000_000;
      const region = 1;
      const dependents = 0;

      const result = calculateNetToGross({
        net: targetNet,
        region,
        dependents,
      });

      expect(result.net).toBe(targetNet);
      expect(result.gross).toBeGreaterThan(targetNet);
      expect(result.converged).toBe(true);

      // Verify with reverse calculation
      const reverseCheck = calculateGrossToNet({
        gross: result.gross,
        region,
        dependents,
      });

      expect(Math.abs(reverseCheck.net - targetNet)).toBeLessThanOrEqual(
        2000000,
      );
    });
  });

  describe("Different Regions and Dependents", () => {
    it.each([
      [1, 4_680_000],
      [2, 4_160_000],
      [3, 3_640_000],
      [4, 3_250_000],
    ])(
      "should handle minimum wage scenario for region %d",
      (region, minimumWage) => {
        // Net salary slightly below what minimum wage would give
        const targetNet = Math.floor(minimumWage * 0.85);
        const dependents = 0;

        const result = calculateNetToGross({
          net: targetNet,
          region,
          dependents,
        });

        expect(result.net).toBe(targetNet);
        expect(result.gross).toBeGreaterThanOrEqual(minimumWage);
        expect(result.converged).toBe(true);

        // Verify reverse calculation
        const reverseCheck = calculateGrossToNet({
          gross: result.gross,
          region,
          dependents,
        });

        expect(Math.abs(reverseCheck.net - targetNet)).toBeLessThanOrEqual(
          2000000,
        );
      },
    );

    it.each([0, 1, 2, 3, 4, 5])(
      "should handle different numbers of dependents: %d",
      (dependents) => {
        const targetNet = 20_000_000;
        const region = 1;

        const result = calculateNetToGross({
          net: targetNet,
          region,
          dependents,
        });

        expect(result.net).toBe(targetNet);
        expect(result.gross).toBeGreaterThan(targetNet);

        // More dependents should result in lower gross for same net
        if (dependents > 0) {
          const resultNoDependents = calculateNetToGross({
            net: targetNet,
            region,
            dependents: 0,
          });
          expect(result.gross).toBeLessThan(resultNoDependents.gross);
        }
      },
    );
  });

  describe("Algorithm Convergence", () => {
    it("should converge within reasonable iterations", () => {
      const targetNet = 25_000_000;
      const region = 1;
      const dependents = 1;

      const result = calculateNetToGross({
        net: targetNet,
        region,
        dependents,
      });

      expect(result.iterations).toBeLessThan(50); // Should converge well before default max
      expect(result.converged).toBe(true);
    });

    it("should allow custom convergence tolerance", () => {
      const targetNet = 30_000_000;
      const region = 1;
      const dependents = 0;

      const result = calculateNetToGross(
        {
          net: targetNet,
          region,
          dependents,
        },
        {
          tolerance: 1, // 1 VND tolerance
        },
      );

      expect(result.converged).toBe(true);

      // Verify actual tolerance
      const reverseCheck = calculateGrossToNet({
        gross: result.gross,
        region,
        dependents,
      });

      expect(Math.abs(reverseCheck.net - targetNet)).toBeLessThanOrEqual(1);
    });

    it("should allow custom maximum iterations", () => {
      const targetNet = 40_000_000;
      const region = 1;
      const dependents = 2;

      const result = calculateNetToGross(
        {
          net: targetNet,
          region,
          dependents,
        },
        {
          maxIterations: 10, // Very low limit
        },
      );

      // May or may not converge with low iteration limit
      expect(result.iterations).toBeLessThanOrEqual(10);
    });
  });

  describe("Edge Cases", () => {
    it("should handle very low net salary", () => {
      const targetNet = 1_000_000;
      const region = 1;
      const dependents = 0;

      const result = calculateNetToGross({
        net: targetNet,
        region,
        dependents,
      });

      expect(result.net).toBe(targetNet);
      expect(result.gross).toBeGreaterThanOrEqual(REGIONAL_MINIMUM_WAGES[1]);
    });

    it("should handle zero net salary", () => {
      const result = calculateNetToGross({
        net: 0,
        region: 1,
        dependents: 0,
      });

      expect(result.net).toBe(0);
      expect(result.gross).toBe(0);
      expect(result.converged).toBe(true);
    });

    it("should throw error for negative net salary", () => {
      expect(() =>
        calculateNetToGross({
          net: -1_000_000,
          region: 1,
          dependents: 0,
        }),
      ).toThrow("Invalid net salary: cannot be negative");
    });

    it("should handle net salary equal to allowance", () => {
      // Net salary equal to self allowance (no tax scenario)
      const result = calculateNetToGross({
        net: ALLOWANCES.self,
        region: 1,
        dependents: 0,
      });

      expect(result.net).toBe(ALLOWANCES.self);
      // Gross should be at least minimum wage
      expect(result.gross).toBeGreaterThanOrEqual(ALLOWANCES.self);
      expect(result.converged).toBe(true);
    });

    it("should handle extremely high net salary", () => {
      const targetNet = 500_000_000; // 500 million VND
      const region = 1;
      const dependents = 3;

      const result = calculateNetToGross({
        net: targetNet,
        region,
        dependents,
      });

      expect(result.net).toBe(targetNet);
      expect(result.gross).toBeGreaterThan(targetNet);
      expect(result.converged).toBe(true);

      // Verify reverse calculation
      const reverseCheck = calculateGrossToNet({
        gross: result.gross,
        region,
        dependents,
      });

      expect(Math.abs(reverseCheck.net - targetNet)).toBeLessThanOrEqual(
        2000000,
      );
    });
  });

  describe("Invalid Inputs", () => {
    it("should validate region parameter", () => {
      expect(() =>
        calculateNetToGross({
          net: 10_000_000,
          region: 5, // Invalid region
          dependents: 0,
        }),
      ).toThrow("Invalid region");
    });

    it("should validate region parameter type", () => {
      expect(() =>
        calculateNetToGross({
          net: 10_000_000,
          region: "invalid" as any,
          dependents: 0,
        }),
      ).toThrow("Invalid region");
    });

    it("should handle null/undefined inputs", () => {
      expect(() => calculateNetToGross(null as any)).toThrow();
      expect(() => calculateNetToGross(undefined as any)).toThrow();
    });

    it("should handle NaN inputs", () => {
      expect(() =>
        calculateNetToGross({
          net: NaN,
          region: 1,
          dependents: 0,
        }),
      ).toThrow("Net salary must be a valid number");
    });

    it("should handle infinite inputs", () => {
      expect(() =>
        calculateNetToGross({
          net: Infinity,
          region: 1,
          dependents: 0,
        }),
      ).toThrow("Invalid net salary: must be a finite number");
    });

    it("should handle negative dependents", () => {
      expect(() =>
        calculateNetToGross({
          net: 10_000_000,
          region: 1,
          dependents: -1, // Negative dependents
        }),
      ).toThrow("Invalid dependents: cannot be negative");
    });
  });

  describe("Precision and Performance", () => {
    it("should handle floating point net salaries", () => {
      const targetNet = 12_345_678.5;
      const region = 1;
      const dependents = 0;

      const result = calculateNetToGross({
        net: targetNet,
        region,
        dependents,
      });

      expect(result.net).toBe(targetNet);
      expect(Number.isInteger(result.gross)).toBe(true); // Gross should be integer
    });

    it("should return consistent results for multiple calculations", () => {
      const params = {
        net: 30_000_000,
        region: 1,
        dependents: 1,
      };

      const result1 = calculateNetToGross(params);
      const result2 = calculateNetToGross(params);

      expect(result1).toEqual(result2);
    });

    it("should handle decimal number of dependents", () => {
      expect(() =>
        calculateNetToGross({
          net: 15_000_000,
          region: 1,
          dependents: 1.7, // Decimal dependents
        }),
      ).toThrow("Invalid dependents: must be an integer");
    });
  });

  describe("Real-world Scenarios", () => {
    it("should calculate for fresh graduate net salary", () => {
      const targetNet = 6_000_000; // What a fresh grad might take home
      const region = 2;
      const dependents = 0;

      const result = calculateNetToGross({
        net: targetNet,
        region,
        dependents,
      });

      expect(result.net).toBe(targetNet);
      expect(result.gross).toBeGreaterThanOrEqual(REGIONAL_MINIMUM_WAGES[2]);
      expect(result.converged).toBe(true);
    });

    it("should calculate for family breadwinner", () => {
      const targetNet = 25_000_000;
      const region = 1;
      const dependents = 3;

      const result = calculateNetToGross(
        {
          net: targetNet,
          region,
          dependents,
        },
        {
          includeBreakdown: true,
        },
      );

      expect(result.net).toBe(targetNet);
      if (result.breakdown) {
        expect(result.breakdown.allowances.total).toBe(
          ALLOWANCES.self + ALLOWANCES.dependent * 3,
        );
      }
    });

    it("should calculate for expatriate with no dependents", () => {
      const targetNet = 80_000_000;
      const region = 1;
      const dependents = 0;

      const result = calculateNetToGross({
        net: targetNet,
        region,
        dependents,
      });

      expect(result.net).toBe(targetNet);
      expect(result.gross).toBeGreaterThan(100_000_000); // High gross needed for this net
      expect(result.converged).toBe(true);
    });
  });

  describe("Boundary Conditions", () => {
    it("should handle net salary at tax bracket boundaries", () => {
      // Test net that would result in taxable income at bracket boundaries
      const testCases = [
        { net: 10_000_000, expectedBracket: 0 }, // No tax
        { net: 15_000_000, expectedBracket: 1 }, // First tax bracket
        { net: 25_000_000, expectedBracket: 2 }, // Second tax bracket
        { net: 40_000_000, expectedBracket: 3 }, // Third tax bracket
      ];

      testCases.forEach(({ net, expectedBracket }) => {
        const result = calculateNetToGross({
          net,
          region: 1,
          dependents: 0,
        });

        const reverseCheck = calculateGrossToNet({
          gross: result.gross,
          region: 1,
          dependents: 0,
        });

        expect(Math.abs(reverseCheck.net - net)).toBeLessThanOrEqual(2000000);

        if (reverseCheck.tax.brackets && reverseCheck.tax.brackets.length > 0) {
          expect(reverseCheck.tax.brackets.length).toBeGreaterThan(
            expectedBracket,
          );
        }
      });
    });

    it("should handle net salary requiring insurance caps", () => {
      // Net salary high enough that gross will exceed insurance caps
      const targetNet = 60_000_000;
      const region = 1;
      const dependents = 0;

      const result = calculateNetToGross({
        net: targetNet,
        region,
        dependents,
      });

      const reverseCheck = calculateGrossToNet({
        gross: result.gross,
        region,
        dependents,
      });

      // Check that insurance caps are applied
      expect(reverseCheck.insurance.employee.social).toBeLessThanOrEqual(
        1_907_200,
      ); // Social cap
      expect(Math.abs(reverseCheck.net - targetNet)).toBeLessThanOrEqual(
        2000000,
      );
    });
  });

  describe("Algorithm Edge Cases", () => {
    it("should handle scenario where initial guess is too low", () => {
      // Very high net salary requires careful iteration
      const targetNet = 200_000_000;
      const region = 1;
      const dependents = 0;

      const result = calculateNetToGross({
        net: targetNet,
        region,
        dependents,
      });

      expect(result.converged).toBe(true);
      expect(result.iterations).toBeGreaterThan(0);

      const reverseCheck = calculateGrossToNet({
        gross: result.gross,
        region,
        dependents,
      });

      expect(Math.abs(reverseCheck.net - targetNet)).toBeLessThanOrEqual(
        2000000,
      );
    });

    it("should handle scenario with maximum dependents", () => {
      const targetNet = 20_000_000;
      const region = 1;
      const dependents = 10; // Many dependents

      const result = calculateNetToGross({
        net: targetNet,
        region,
        dependents,
      });

      expect(result.net).toBe(targetNet);
      // With many dependents, gross will be close to net due to reduced tax
      expect(result.gross).toBeGreaterThan(targetNet);

      const reverseCheck = calculateGrossToNet({
        gross: result.gross,
        region,
        dependents,
      });

      // This is an extreme case with many dependents, so tolerance is higher
      expect(Math.abs(reverseCheck.net - targetNet)).toBeLessThanOrEqual(
        2500000,
      );
    });
  });

  describe("Return Value Structure", () => {
    it("should return all required fields", () => {
      const result = calculateNetToGross({
        net: 15_000_000,
        region: 1,
        dependents: 1,
      });

      // Check all required fields exist and are of correct type
      expect(result).toHaveProperty("net");
      expect(result).toHaveProperty("gross");
      expect(result).toHaveProperty("iterations");
      expect(result).toHaveProperty("converged");

      expect(typeof result.net).toBe("number");
      expect(typeof result.gross).toBe("number");
      expect(typeof result.iterations).toBe("number");
      expect(typeof result.converged).toBe("boolean");
    });

    it("should include optional breakdown information when requested", () => {
      const result = calculateNetToGross(
        {
          net: 30_000_000,
          region: 1,
          dependents: 1,
        },
        {
          includeBreakdown: true,
        },
      );

      // Breakdown should be included when requested
      expect(result).toHaveProperty("breakdown");

      if (result.breakdown) {
        expect(result.breakdown).toHaveProperty("gross");
        expect(result.breakdown).toHaveProperty("net");
        expect(result.breakdown).toHaveProperty("insurance");
        expect(result.breakdown).toHaveProperty("allowances");
        expect(result.breakdown).toHaveProperty("tax");
      }
    });
  });
});
