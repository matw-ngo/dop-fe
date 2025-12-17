/**
 * Comprehensive tests for Vietnamese insurance calculation functions
 *
 * Vietnamese insurance rates (2024):
 * Employee rates:
 * - Social insurance: 8%
 * - Health insurance: 1.5%
 * - Unemployment insurance: 1%
 * - Total employee: 10.5%
 *
 * Employer rates:
 * - Social insurance: 17.5%
 * - Health insurance: 3%
 * - Unemployment insurance: 1%
 * - Total employer: 21.5%
 *
 * Insurance salary caps:
 * - Social/Health (employee): 23,840,000 VND
 * - Social/Health (employer): 94,000,000 VND
 * - Unemployment (both): 34,500,000 VND
 */

import { describe, expect, it } from "vitest";
import {
  calculateEmployeeInsurance,
  calculateEmployerInsurance,
  calculateTotalInsurance,
} from "../insurance";

describe("Vietnamese Insurance Calculator", () => {
  describe("Employee Insurance Calculation", () => {
    it("should return 0 for zero salary", () => {
      const result = calculateEmployeeInsurance(0);
      expect(result).toEqual({
        social: 0,
        health: 0,
        unemployment: 0,
        total: 0,
      });
    });

    it("should handle negative salary gracefully", () => {
      const result = calculateEmployeeInsurance(-1000000);
      expect(result).toEqual({
        social: 0,
        health: 0,
        unemployment: 0,
        total: 0,
      });
    });

    it("should calculate basic employee insurance correctly", () => {
      // Salary: 10,000,000 VND
      // Social: 10,000,000 * 8% = 800,000
      // Health: 10,000,000 * 1.5% = 150,000
      // Unemployment: 10,000,000 * 1% = 100,000
      // Total: 1,050,000 (10.5%)
      const salary = 10_000_000;
      const result = calculateEmployeeInsurance(salary);

      expect(result).toEqual({
        social: 800_000,
        health: 150_000,
        unemployment: 100_000,
        total: 1_050_000,
      });
    });

    it("should calculate insurance at social/health cap", () => {
      // Salary: 23,840,000 VND (at cap)
      // Social: 23,840,000 * 8% = 1,907,200
      // Health: 23,840,000 * 1.5% = 357,600
      // Unemployment: 23,840,000 * 1% = 238,400 (below unemployment cap)
      // Total: 2,503,200
      const salary = 23_840_000;
      const result = calculateEmployeeInsurance(salary);

      expect(result).toEqual({
        social: 1_907_200,
        health: 357_600,
        unemployment: 238_400,
        total: 2_503_200,
      });
    });

    it("should apply salary cap for social and health insurance", () => {
      // Salary: 50,000,000 VND (above cap)
      // Should calculate social and health on capped amount (23,840,000)
      // Social: 23,840,000 * 8% = 1,907,200 (capped)
      // Health: 23,840,000 * 1.5% = 357,600 (capped)
      // Unemployment: 34,500,000 * 1% = 345,000 (capped at unemployment cap)
      // Note: Since salary is above unemployment cap too
      const salary = 50_000_000;
      const result = calculateEmployeeInsurance(salary);

      expect(result).toEqual({
        social: 1_907_200,
        health: 357_600,
        unemployment: 345_000,
        total: 2_609_800,
      });
    });

    it("should apply all caps for very high salary", () => {
      // Salary: 100,000,000 VND (above all caps)
      // Social: 23,840,000 * 8% = 1,907,200 (capped)
      // Health: 23,840,000 * 1.5% = 357,600 (capped)
      // Unemployment: 34,500,000 * 1% = 345,000 (capped)
      const salary = 100_000_000;
      const result = calculateEmployeeInsurance(salary);

      expect(result).toEqual({
        social: 1_907_200,
        health: 357_600,
        unemployment: 345_000,
        total: 2_609_800,
      });
    });

    it("should handle salary at unemployment cap", () => {
      // Salary: 34,500,000 VND (at unemployment cap)
      // Social: 23,840,000 * 8% = 1,907,200 (capped at social/health cap)
      // Health: 23,840,000 * 1.5% = 357,600 (capped at social/health cap)
      // Unemployment: 34,500,000 * 1% = 345,000 (at unemployment cap)
      const salary = 34_500_000;
      const result = calculateEmployeeInsurance(salary);

      expect(result).toEqual({
        social: 1_907_200,
        health: 357_600,
        unemployment: 345_000,
        total: 2_609_800,
      });
    });
  });

  describe("Employer Insurance Calculation", () => {
    it("should return 0 for zero salary", () => {
      const result = calculateEmployerInsurance(0);
      expect(result).toEqual({
        social: 0,
        health: 0,
        unemployment: 0,
        total: 0,
      });
    });

    it("should calculate basic employer insurance correctly", () => {
      // Salary: 10,000,000 VND
      // Social: 10,000,000 * 17.5% = 1,750,000
      // Health: 10,000,000 * 3% = 300,000
      // Unemployment: 10,000,000 * 1% = 100,000
      // Total: 2,150,000 (21.5%)
      const salary = 10_000_000;
      const result = calculateEmployerInsurance(salary);

      expect(result).toEqual({
        social: 1_750_000,
        health: 300_000,
        unemployment: 100_000,
        total: 2_150_000,
      });
    });

    it("should apply salary caps for employer correctly", () => {
      // Salary: 100,000,000 VND (above caps)
      // Social: 94,000,000 * 17.5% = 16,450,000 (capped at employer social cap)
      // Health: 94,000,000 * 3% = 2,820,000 (capped at employer health cap)
      // Unemployment: 34,500,000 * 1% = 345,000 (capped at unemployment cap)
      const salary = 100_000_000;
      const result = calculateEmployerInsurance(salary);

      expect(result).toEqual({
        social: 16_450_000,
        health: 2_820_000,
        unemployment: 345_000,
        total: 19_615_000,
      });
    });

    it("should handle salary between social/health and unemployment caps", () => {
      // Salary: 50,000,000 VND
      // Social: 50,000,000 * 17.5% = 8,750,000 (below employer social cap)
      // Health: 50,000,000 * 3% = 1,500,000 (below employer health cap)
      // Unemployment: 34,500,000 * 1% = 345,000 (capped at unemployment cap)
      const salary = 50_000_000;
      const result = calculateEmployerInsurance(salary);

      expect(result).toEqual({
        social: 8_750_000,
        health: 1_500_000,
        unemployment: 345_000,
        total: 10_595_000,
      });
    });
  });

  describe("Total Insurance Calculation", () => {
    it("should calculate total combined insurance correctly", () => {
      // Salary: 10,000,000 VND
      // Employee total: 1,050,000
      // Employer total: 2,150,000
      // Combined: 3,200,000
      const salary = 10_000_000;
      const result = calculateTotalInsurance(salary);

      expect(result).toEqual({
        employee: {
          social: 800_000,
          health: 150_000,
          unemployment: 100_000,
          total: 1_050_000,
        },
        employer: {
          social: 1_750_000,
          health: 300_000,
          unemployment: 100_000,
          total: 2_150_000,
        },
        total: 3_200_000,
      });
    });

    it("should return zero for zero salary", () => {
      const result = calculateTotalInsurance(0);
      expect(result.total).toBe(0);
      expect(result.employee.total).toBe(0);
      expect(result.employer.total).toBe(0);
    });

    it("should calculate total cost for high salary with all caps", () => {
      // Salary: 100,000,000 VND
      // Employee total: 2,609,800 (all caps applied)
      // Employer total: 19,615,000 (all caps applied)
      // Combined: 22,224,800
      const salary = 100_000_000;
      const result = calculateTotalInsurance(salary);

      expect(result.employee.total).toBe(2_609_800);
      expect(result.employer.total).toBe(19_615_000);
      expect(result.total).toBe(22_224_800);
    });
  });

  describe("Edge Cases and Precision", () => {
    it("should handle floating point precision correctly", () => {
      // Test with odd salary amount
      const salary = 12_345_678;
      const result = calculateEmployeeInsurance(salary);

      // Social: 12,345,678 * 8% = 987,654.24
      // Health: 12,345,678 * 1.5% = 185,185.17
      // Unemployment: 12,345,678 * 1% = 123,456.78
      expect(result.social).toBeCloseTo(987654, 0);
      expect(result.health).toBeCloseTo(185185, 0);
      expect(result.unemployment).toBeCloseTo(123457, 0);
      expect(result.total).toBeCloseTo(1_296_296, 0);
    });

    it("should handle very small salary amounts", () => {
      const salary = 1_000_000; // Minimum reasonable salary
      const result = calculateEmployeeInsurance(salary);

      expect(result).toEqual({
        social: 80_000,
        health: 15_000,
        unemployment: 10_000,
        total: 105_000,
      });
    });

    it("should handle salary just above caps", () => {
      // Just above social/health cap for employee
      const salary = 23_840_001;
      const result = calculateEmployeeInsurance(salary);

      // Should use capped amount for social and health
      expect(result.social).toBe(1_907_200);
      expect(result.health).toBe(357_600);
      // Unemployment still calculated on full amount (below cap)
      expect(result.unemployment).toBe(238_400);
    });

    it("should handle null/undefined inputs gracefully", () => {
      expect(() => calculateEmployeeInsurance(null as any)).not.toThrow();
      expect(calculateEmployeeInsurance(null as any)).toEqual({
        social: 0,
        health: 0,
        unemployment: 0,
        total: 0,
      });

      expect(() => calculateEmployerInsurance(undefined as any)).not.toThrow();
      expect(calculateEmployerInsurance(undefined as any)).toEqual({
        social: 0,
        health: 0,
        unemployment: 0,
        total: 0,
      });
    });

    it("should handle NaN input", () => {
      const employeeResult = calculateEmployeeInsurance(NaN);
      expect(employeeResult.total).toBe(0);

      const employerResult = calculateEmployerInsurance(NaN);
      expect(employerResult.total).toBe(0);
    });

    it("should handle non-numeric input", () => {
      expect(() => calculateEmployeeInsurance("invalid" as any)).not.toThrow();
      expect(calculateEmployeeInsurance("invalid" as any).total).toBe(0);
    });
  });

  describe("Real-world Scenarios", () => {
    it("should calculate insurance for minimum wage employee", () => {
      // Region I minimum wage: 4,680,000 VND
      const salary = 4_680_000;
      const result = calculateEmployeeInsurance(salary);

      expect(result).toEqual({
        social: 374_400,
        health: 70_200,
        unemployment: 46_800,
        total: 491_400,
      });
    });

    it("should calculate total cost for mid-level professional", () => {
      // Salary: 25,000,000 VND/month
      // Above social/health cap for employee, below for employer
      const salary = 25_000_000;
      const result = calculateTotalInsurance(salary);

      // Employee: social and health capped, unemployment on full amount
      expect(result.employee.social).toBe(1_907_200);
      expect(result.employee.health).toBe(357_600);
      expect(result.employee.unemployment).toBe(250_000);

      // Employer: all on full amount (below caps)
      expect(result.employer.social).toBe(4_375_000);
      expect(result.employer.health).toBe(750_000);
      expect(result.employer.unemployment).toBe(250_000);

      // Total cost to company
      expect(result.total).toBe(7_889_800);
    });

    it("should calculate insurance for senior manager", () => {
      // Salary: 60,000,000 VND/month
      // Above employee social/health caps, at unemployment cap
      const salary = 60_000_000;
      const result = calculateTotalInsurance(salary);

      // Employee: social/health capped, unemployment capped
      expect(result.employee.total).toBe(2_609_800);

      // Employer: social/health below caps, unemployment capped
      expect(result.employer.social).toBe(10_500_000);
      expect(result.employer.health).toBe(1_800_000);
      expect(result.employer.unemployment).toBe(345_000);

      expect(result.total).toBe(15_254_800);
    });
  });

  describe("Rate Verification", () => {
    it("should maintain exact employee contribution rates", () => {
      const salary = 10_000_000;
      const result = calculateEmployeeInsurance(salary);

      // Verify exact percentages
      expect(result.social / salary).toBe(0.08); // 8%
      expect(result.health / salary).toBe(0.015); // 1.5%
      expect(result.unemployment / salary).toBe(0.01); // 1%
      expect(result.total / salary).toBe(0.105); // 10.5%
    });

    it("should maintain exact employer contribution rates", () => {
      const salary = 10_000_000;
      const result = calculateEmployerInsurance(salary);

      // Verify exact percentages
      expect(result.social / salary).toBe(0.175); // 17.5%
      expect(result.health / salary).toBe(0.03); // 3%
      expect(result.unemployment / salary).toBe(0.01); // 1%
      expect(result.total / salary).toBe(0.215); // 21.5%
    });
  });

  describe("Performance", () => {
    it("should handle large numbers without overflow", () => {
      const highSalary = Number.MAX_SAFE_INTEGER;
      expect(() => calculateEmployeeInsurance(highSalary)).not.toThrow();
      expect(() => calculateEmployerInsurance(highSalary)).not.toThrow();
      expect(() => calculateTotalInsurance(highSalary)).not.toThrow();
    });

    it("should return consistent results for edge case salaries", () => {
      // Test salaries at exact cap boundaries
      const salaries = [23_840_000, 34_500_000, 94_000_000];

      salaries.forEach((salary) => {
        const employee1 = calculateEmployeeInsurance(salary);
        const employee2 = calculateEmployeeInsurance(salary);
        expect(employee1).toEqual(employee2);

        const employer1 = calculateEmployerInsurance(salary);
        const employer2 = calculateEmployerInsurance(salary);
        expect(employer1).toEqual(employer2);
      });
    });
  });
});
