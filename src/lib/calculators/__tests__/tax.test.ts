/**
 * Comprehensive tests for Vietnamese personal income tax calculation
 *
 * Vietnamese tax brackets (2024):
 * - 0 - 5,000,000: 5%
 * - 5,000,001 - 10,000,000: 10%
 * - 10,000,001 - 18,000,000: 15%
 * - 18,000,001 - 32,000,000: 20%
 * - 32,000,001 - 52,000,000: 25%
 * - 52,000,001 - 80,000,000: 30%
 * - Above 80,000,000: 35%
 */

import { describe, expect, it } from "vitest";
import { calculateTax } from "../tax";

describe("Vietnamese Personal Income Tax Calculator", () => {
  describe("Basic functionality", () => {
    it("should return 0 for zero income", () => {
      expect(calculateTax(0)).toBe(0);
    });

    it("should return 0 for negative income (handle gracefully)", () => {
      expect(calculateTax(-1000000)).toBe(0);
    });
  });

  describe("First tax bracket (5%)", () => {
    it("should calculate 5% tax for income of 4,000,000", () => {
      // 4,000,000 * 5% = 200,000
      expect(calculateTax(4000000)).toBe(200000);
    });

    it("should calculate exact 5% for income at bracket threshold", () => {
      // 5,000,000 * 5% = 250,000
      expect(calculateTax(5000000)).toBe(250000);
    });

    it("should calculate 5% for minimal taxable income", () => {
      // 1,000,000 * 5% = 50,000
      expect(calculateTax(1000000)).toBe(50000);
    });
  });

  describe("Second tax bracket (10%)", () => {
    it("should calculate progressive tax for income in second bracket", () => {
      // 5,000,000 * 5% + 2,000,000 * 10% = 250,000 + 200,000 = 450,000
      expect(calculateTax(7000000)).toBe(450000);
    });

    it("should calculate exact tax at second bracket threshold", () => {
      // 5,000,000 * 5% + 5,000,000 * 10% = 250,000 + 500,000 = 750,000
      expect(calculateTax(10000000)).toBe(750000);
    });
  });

  describe("Third tax bracket (15%)", () => {
    it("should calculate progressive tax for income in third bracket", () => {
      // 5M*5% + 5M*10% + 2M*15% = 250,000 + 500,000 + 300,000 = 1,050,000
      expect(calculateTax(12000000)).toBe(1050000);
    });

    it("should calculate exact tax at third bracket threshold", () => {
      // 5M*5% + 5M*10% + 8M*15% = 250,000 + 500,000 + 1,200,000 = 1,950,000
      expect(calculateTax(18000000)).toBe(1950000);
    });
  });

  describe("Fourth tax bracket (20%)", () => {
    it("should calculate progressive tax for income in fourth bracket", () => {
      // 5M*5% + 5M*10% + 8M*15% + 10M*20% = 250,000 + 500,000 + 1,200,000 + 2,000,000 = 3,950,000
      expect(calculateTax(28000000)).toBe(3950000);
    });

    it("should calculate exact tax at fourth bracket threshold", () => {
      // 5M*5% + 5M*10% + 8M*15% + 14M*20% = 250,000 + 500,000 + 1,200,000 + 2,800,000 = 4,750,000
      expect(calculateTax(32000000)).toBe(4750000);
    });
  });

  describe("Fifth tax bracket (25%)", () => {
    it("should calculate progressive tax for income in fifth bracket", () => {
      // 5M*5% + 5M*10% + 8M*15% + 14M*20% + 10M*25% = 250,000 + 500,000 + 1,200,000 + 2,800,000 + 2,500,000 = 7,250,000
      expect(calculateTax(42000000)).toBe(7250000);
    });

    it("should calculate exact tax at fifth bracket threshold", () => {
      // 5M*5% + 5M*10% + 8M*15% + 14M*20% + 20M*25% = 250,000 + 500,000 + 1,200,000 + 2,800,000 + 5,000,000 = 9,750,000
      expect(calculateTax(52000000)).toBe(9750000);
    });
  });

  describe("Sixth tax bracket (30%)", () => {
    it("should calculate progressive tax for income in sixth bracket", () => {
      // Sum of previous brackets + 10M*30% = 9,750,000 + 3,000,000 = 12,750,000
      expect(calculateTax(62000000)).toBe(12750000);
    });

    it("should calculate exact tax at sixth bracket threshold", () => {
      // Sum of previous brackets + 28M*30% = 9,750,000 + 8,400,000 = 18,150,000
      expect(calculateTax(80000000)).toBe(18150000);
    });
  });

  describe("Seventh tax bracket (35%)", () => {
    it("should calculate progressive tax for high income", () => {
      // Sum of all previous brackets + 20M*35% = 18,150,000 + 7,000,000 = 25,150,000
      expect(calculateTax(100000000)).toBe(25150000);
    });

    it("should calculate tax for very high income", () => {
      // Sum of all previous brackets + 50M*35% = 18,150,000 + 17,500,000 = 35,650,000
      expect(calculateTax(130000000)).toBe(35650000);
    });
  });

  describe("Edge cases and precision", () => {
    it("should handle floating point precision correctly", () => {
      // Test with odd amounts that require precise calculation
      const income = 12345678;
      // 5M*5% + 5M*10% + 2,345,678*15% = 250,000 + 500,000 + 351,851 = 1,101,851
      expect(calculateTax(income)).toBeCloseTo(1101851, 0);
    });

    it("should handle income just above bracket boundaries", () => {
      // 5,000,001 income rounds to same tax as 5,000,000 due to currency units
      expect(calculateTax(5000001)).toBe(250000);
    });

    it("should handle income just below bracket boundaries", () => {
      // 9,999,999 rounds to 749,999
      expect(calculateTax(9999999)).toBe(749999);
    });

    it("should handle very small income amounts", () => {
      // 100 * 5% = 5
      expect(calculateTax(100)).toBe(5);
    });
  });

  describe("Real-world scenarios", () => {
    it("should calculate tax for minimum wage employee", () => {
      // Assuming minimum wage of 4,400,000 VND/month
      // 4,400,000 * 5% = 220,000
      expect(calculateTax(4400000)).toBe(220000);
    });

    it("should calculate tax for mid-level professional", () => {
      // Income of 25,000,000 VND/month
      // 5M*5% + 5M*10% + 8M*15% + 7M*20% = 250,000 + 500,000 + 1,200,000 + 1,400,000 = 3,350,000
      expect(calculateTax(25000000)).toBe(3350000);
    });

    it("should calculate tax for senior manager", () => {
      // Income of 60,000,000 VND/month
      // Sum of first 5 brackets + 8M*30% = 9,750,000 + 2,400,000 = 12,150,000
      expect(calculateTax(60000000)).toBe(12150000);
    });
  });

  describe("Invalid inputs", () => {
    it("should handle null/undefined inputs gracefully", () => {
      expect(() => calculateTax(null as any)).not.toThrow();
      expect(calculateTax(null as any)).toBe(0);

      expect(() => calculateTax(undefined as any)).not.toThrow();
      expect(calculateTax(undefined as any)).toBe(0);
    });

    it("should handle NaN input", () => {
      expect(calculateTax(NaN)).toBe(0);
    });

    it("should handle non-numeric input", () => {
      expect(calculateTax("invalid" as any)).toBe(0);
    });
  });

  describe("Performance", () => {
    it("should handle large numbers without overflow", () => {
      // Test with extremely high income
      const highIncome = Number.MAX_SAFE_INTEGER;
      expect(() => calculateTax(highIncome)).not.toThrow();
      expect(calculateTax(highIncome)).toBeGreaterThan(0);
    });
  });
});
