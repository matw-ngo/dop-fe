/**
 * Comprehensive tests for Vietnamese gross to net salary conversion
 *
 * This test suite validates the calculateGrossToNet function which converts
 * gross monthly salary to net salary after all mandatory deductions including:
 * - Social insurance (8%)
 * - Health insurance (1.5%)
 * - Unemployment insurance (1%)
 * - Personal income tax (progressive rates)
 *
 * The calculation considers:
 * - Regional minimum wages (4 regions)
 * - Number of dependents (0, 1, 2, 3+)
 * - Insurance salary caps
 * - Tax allowances and brackets
 */

import { describe, it, expect } from "vitest";
import { calculateGrossToNet } from "../salary-gross-to-net";

describe("Vietnamese Gross to Net Salary Calculator", () => {
  describe("Basic Scenarios", () => {
    it("should calculate net salary for single employee with no dependents - Region 1", () => {
      // Gross: 10,000,000 VND
      // Region: 1
      // Dependents: 0

      // Expected calculations:
      // Insurance (10.5%): Social 800,000 + Health 150,000 + Unemployment 100,000 = 1,050,000
      // Allowances: Self 11,000,000 + Dependent 0 = 11,000,000
      // Taxable income: 10,000,000 - 1,050,000 - 11,000,000 = -1,050,000 (0, no tax)
      // Tax: 0
      // Net: 10,000,000 - 1,050,000 - 0 = 8,950,000

      const result = calculateGrossToNet({
        gross: 10_000_000,
        region: 1,
        dependents: 0,
      });

      expect(result.gross).toBe(10_000_000);
      expect(result.net).toBe(8_950_000);
      expect(result.insurance.employee.total).toBe(1_050_000);
      expect(result.insurance.employee.social).toBe(800_000);
      expect(result.insurance.employee.health).toBe(150_000);
      expect(result.insurance.employee.unemployment).toBe(100_000);
      expect(result.allowances.self).toBe(11_000_000);
      expect(result.allowances.dependent).toBe(0);
      expect(result.allowances.total).toBe(11_000_000);
      expect(result.tax.taxableIncome).toBe(0);
      expect(result.tax.tax).toBe(0);
      expect(result.tax.brackets).toHaveLength(0);
    });

    it("should calculate net salary with dependents - Region 2", () => {
      // Gross: 15,000,000 VND
      // Region: 2
      // Dependents: 2

      // Expected calculations:
      // Insurance (10.5%): 15,000,000 * 10.5% = 1,575,000
      // Allowances: Self 11,000,000 + Dependent 4,400,000 * 2 = 19,800,000
      // Taxable income: 15,000,000 - 1,575,000 - 19,800,000 = -6,375,000 (0, no tax)
      // Tax: 0
      // Net: 15,000,000 - 1,575,000 - 0 = 13,425,000

      const result = calculateGrossToNet({
        gross: 15_000_000,
        region: 2,
        dependents: 2,
      });

      expect(result.gross).toBe(15_000_000);
      expect(result.net).toBe(13_425_000);
      expect(result.insurance.employee.total).toBe(1_575_000);
      expect(result.allowances.self).toBe(11_000_000);
      expect(result.allowances.dependent).toBe(8_800_000);
      expect(result.allowances.total).toBe(19_800_000);
      expect(result.tax.taxableIncome).toBe(0);
      expect(result.tax.tax).toBe(0);
    });
  });

  describe("Different Regions", () => {
    it.each([
      [1, 4_680_000],
      [2, 4_160_000],
      [3, 3_640_000],
      [4, 3_250_000],
    ])("should handle minimum wage for region %d", (region, minimumWage) => {
      // Gross: 20,000,000 VND (same across regions)
      // Region: varies
      // Dependents: 1

      const result = calculateGrossToNet({
        gross: 20_000_000,
        region,
        dependents: 1,
      });

      expect(result.gross).toBe(20_000_000);
      expect(result.net).toBeGreaterThan(0);
      expect(result.insurance.employee.total).toBe(2_100_000); // 10.5% of 20M
      expect(result.allowances.dependent).toBe(4_400_000);
      expect(result.allowances.total).toBe(15_400_000); // 11M + 4.4M
    });

    it("should validate region parameter", () => {
      expect(() =>
        calculateGrossToNet({
          gross: 10_000_000,
          region: 5, // Invalid region
          dependents: 0,
        }),
      ).toThrow("Invalid region");
    });
  });

  describe("Higher Salary with Tax", () => {
    it("should calculate net salary with tax - Region 1, 1 dependent", () => {
      // Gross: 30,000,000 VND
      // Region: 1
      // Dependents: 1

      // Expected calculations:
      // Insurance with caps: Social (capped) 1,907,200 + Health (capped) 357,600 + Unemployment 300,000 = 2,564,800
      // Allowances: 11,000,000 + 4,400,000 = 15,400,000
      // Taxable income: 30,000,000 - 2,564,800 - 15,400,000 = 12,035,200
      // Tax: 5M*5% + 5M*10% + 2.0352M*15% = 250,000 + 500,000 + 305,280 = 1,055,280
      // Net: 30,000,000 - 2,564,800 - 1,055,280 = 26,379,920

      const result = calculateGrossToNet({
        gross: 30_000_000,
        region: 1,
        dependents: 1,
      });

      expect(result.gross).toBe(30_000_000);
      expect(result.net).toBe(26_379_920);
      expect(result.insurance.employee.total).toBe(2_564_800);
      expect(result.allowances.total).toBe(15_400_000);
      expect(result.tax.taxableIncome).toBe(12_035_200);
      expect(result.tax.tax).toBe(1_055_280);
    });

    it("should calculate with multiple tax brackets", () => {
      // Gross: 50,000,000 VND
      // Region: 1
      // Dependents: 1

      // Expected calculations:
      // Insurance with caps: 2,609,800
      // Allowances: 15,400,000
      // Taxable income: 31,990,200
      // Tax: 4,748,040
      // Net: 42,642,160

      const result = calculateGrossToNet({
        gross: 50_000_000,
        region: 1,
        dependents: 1,
      });

      expect(result.gross).toBe(50_000_000);
      expect(result.net).toBe(42_642_160);
      expect(result.tax.taxableIncome).toBe(31_990_200);
      expect(result.tax.tax).toBe(4_748_040);
      expect(result.tax.brackets).toHaveLength(5);
    });
  });

  describe("Insurance Caps", () => {
    it("should apply social/health insurance caps for high salary", () => {
      // Gross: 100,000,000 VND (above caps)
      // Region: 1
      // Dependents: 0

      // Expected:
      // Social: capped at 23,840,000 * 8% = 1,907,200
      // Health: capped at 23,840,000 * 1.5% = 357,600
      // Unemployment: capped at 34,500,000 * 1% = 345,000
      // Total insurance: 2,609,800

      const result = calculateGrossToNet({
        gross: 100_000_000,
        region: 1,
        dependents: 0,
      });

      expect(result.insurance.employee.social).toBe(1_907_200);
      expect(result.insurance.employee.health).toBe(357_600);
      expect(result.insurance.employee.unemployment).toBe(345_000);
      expect(result.insurance.employee.total).toBe(2_609_800);
    });

    it("should handle salary at insurance cap boundaries", () => {
      // Salary exactly at social/health cap
      const result = calculateGrossToNet({
        gross: 23_840_000,
        region: 1,
        dependents: 0,
      });

      expect(result.insurance.employee.social).toBe(1_907_200);
      expect(result.insurance.employee.health).toBe(357_600);
      expect(result.insurance.employee.unemployment).toBe(238_400); // Not capped yet
    });
  });

  describe("Edge Cases", () => {
    it("should handle minimum wage salary", () => {
      // Region 1 minimum wage
      const result = calculateGrossToNet({
        gross: 4_680_000,
        region: 1,
        dependents: 0,
      });

      expect(result.gross).toBe(4_680_000);
      expect(result.net).toBeGreaterThan(0);
      expect(result.insurance.employee.total).toBe(491_400); // 4,680,000 * 10.5%
      expect(result.tax.tax).toBe(0); // No tax due to allowances
    });

    it("should handle very high salary with maximum tax bracket", () => {
      // Gross: 150,000,000 VND
      const result = calculateGrossToNet({
        gross: 150_000_000,
        region: 1,
        dependents: 2,
      });

      expect(result.gross).toBe(150_000_000);
      expect(result.net).toBeGreaterThan(100_000_000);
      expect(result.tax.taxableIncome).toBeGreaterThan(80_000_000);
      expect(result.tax.brackets).toHaveLength(7); // All brackets used
    });

    it("should handle zero salary gracefully", () => {
      const result = calculateGrossToNet({
        gross: 0,
        region: 1,
        dependents: 0,
      });

      expect(result.gross).toBe(0);
      expect(result.net).toBe(0);
      expect(result.insurance.employee.total).toBe(0);
      expect(result.tax.tax).toBe(0);
    });

    it("should handle negative salary gracefully", () => {
      const result = calculateGrossToNet({
        gross: -10_000_000,
        region: 1,
        dependents: 0,
      });

      expect(result.gross).toBe(-10_000_000);
      expect(result.net).toBe(-10_000_000);
      expect(result.insurance.employee.total).toBe(0);
      expect(result.tax.tax).toBe(0);
    });
  });

  describe("Dependents", () => {
    it.each([0, 1, 2, 3, 4, 5])(
      "should calculate correctly with %d dependents",
      (dependents) => {
        const result = calculateGrossToNet({
          gross: 20_000_000,
          region: 1,
          dependents,
        });

        expect(result.allowances.dependent).toBe(4_400_000 * dependents);
        expect(result.allowances.total).toBe(
          11_000_000 + 4_400_000 * dependents,
        );
      },
    );
  });

  describe("Tax Bracket Breakdown", () => {
    it("should provide detailed tax bracket breakdown", () => {
      const result = calculateGrossToNet({
        gross: 60_000_000,
        region: 1,
        dependents: 1,
      });

      // Should use 6 tax brackets
      expect(result.tax.brackets).toHaveLength(6);

      // Check first bracket
      expect(result.tax.brackets[0]).toMatchObject({
        max: 5_000_000,
        rate: 0.05,
        tax: 250_000, // 5,000,000 * 5%
      });

      // Check last used bracket (30% bracket)
      const lastBracket = result.tax.brackets[result.tax.brackets.length - 1];
      expect(lastBracket.max).toBe(80_000_000);
      expect(lastBracket.rate).toBe(0.3);
    });

    it("should return empty brackets when no tax is due", () => {
      const result = calculateGrossToNet({
        gross: 10_000_000,
        region: 1,
        dependents: 0,
      });

      expect(result.tax.brackets).toHaveLength(0);
      expect(result.tax.tax).toBe(0);
    });
  });

  describe("Employer Insurance Option", () => {
    it("should include employer insurance when requested", () => {
      const result = calculateGrossToNet({
        gross: 20_000_000,
        region: 1,
        dependents: 0,
        includeEmployer: true,
      });

      expect(result.insurance.employer).toBeDefined();
      expect(result.insurance.employer?.total).toBe(4_300_000); // 21.5% of 20M
      expect(result.insurance.employer?.social).toBe(3_500_000); // 17.5%
      expect(result.insurance.employer?.health).toBe(600_000); // 3%
      expect(result.insurance.employer?.unemployment).toBe(200_000); // 1%
    });

    it("should not include employer insurance by default", () => {
      const result = calculateGrossToNet({
        gross: 20_000_000,
        region: 1,
        dependents: 0,
      });

      expect(result.insurance.employer).toBeUndefined();
    });
  });

  describe("Invalid Inputs", () => {
    it("should handle null/undefined inputs gracefully", () => {
      expect(() => calculateGrossToNet(null as any)).not.toThrow();
      expect(() => calculateGrossToNet(undefined as any)).not.toThrow();
    });

    it("should handle NaN inputs", () => {
      const result = calculateGrossToNet({
        gross: NaN,
        region: 1,
        dependents: 0,
      });

      expect(result.gross).toBeNaN();
      expect(result.net).toBeNaN();
    });

    it("should handle non-numeric region", () => {
      expect(() =>
        calculateGrossToNet({
          gross: 10_000_000,
          region: "invalid" as any,
          dependents: 0,
        }),
      ).toThrow();
    });

    it("should handle negative dependents", () => {
      const result = calculateGrossToNet({
        gross: 10_000_000,
        region: 1,
        dependents: -1,
      });

      expect(result.allowances.dependent).toBe(0);
    });
  });

  describe("Precision and Rounding", () => {
    it("should handle floating point precision correctly", () => {
      // Test with odd salary amount
      const result = calculateGrossToNet({
        gross: 12_345_678,
        region: 1,
        dependents: 0,
      });

      // Insurance calculations should be rounded
      expect(result.insurance.employee.social).toBe(987_654); // Rounded
      expect(result.insurance.employee.health).toBe(185_185); // Rounded
      expect(result.insurance.employee.unemployment).toBe(123_457); // Rounded

      // Net should be properly calculated
      expect(result.net).toBe(11_046_913);
    });

    it("should round tax down to nearest VND", () => {
      // Create scenario where tax calculation has decimal
      const result = calculateGrossToNet({
        gross: 25_000_001,
        region: 1,
        dependents: 0,
      });

      // Tax should be rounded down (floored)
      expect(result.tax.tax).toBe(Math.floor(result.tax.tax));
    });
  });

  describe("Performance", () => {
    it("should handle large numbers without overflow", () => {
      const highSalary = Number.MAX_SAFE_INTEGER;

      expect(() =>
        calculateGrossToNet({
          gross: highSalary,
          region: 1,
          dependents: 0,
        }),
      ).not.toThrow();
    });

    it("should return consistent results for multiple calculations", () => {
      const params = {
        gross: 30_000_000,
        region: 1,
        dependents: 1,
      };

      const result1 = calculateGrossToNet(params);
      const result2 = calculateGrossToNet(params);

      expect(result1).toEqual(result2);
    });
  });

  describe("Real-world Scenarios", () => {
    it("should calculate for fresh graduate - minimum wage, no dependents", () => {
      const result = calculateGrossToNet({
        gross: 5_000_000,
        region: 2,
        dependents: 0,
      });

      expect(result.net).toBeGreaterThan(4_000_000);
      expect(result.tax.tax).toBe(0); // No tax
    });

    it("should calculate for experienced professional with family", () => {
      const result = calculateGrossToNet({
        gross: 35_000_000,
        region: 1,
        dependents: 2,
      });

      expect(result.net).toBeGreaterThan(25_000_000);
      expect(result.tax.tax).toBeGreaterThan(0);
      expect(result.allowances.dependent).toBe(8_800_000);
    });

    it("should calculate for senior executive", () => {
      const result = calculateGrossToNet({
        gross: 80_000_000,
        region: 1,
        dependents: 3,
      });

      expect(result.net).toBeGreaterThan(60_000_000);
      expect(result.tax.taxableIncome).toBeGreaterThan(40_000_000);
      expect(result.tax.brackets).toHaveLength(7); // All brackets
    });
  });
});
