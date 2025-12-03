/**
 * Financial Calculations Tests
 *
 * Unit tests for Vietnamese financial calculation functions
 */

import { describe, it, expect, test } from 'vitest';
import {
  calculateLoanDetails,
  calculateReducingBalancePayment,
  calculateFlatRatePayment,
  validateLoanCalculationParams,
} from '../calculations';
import {
  calculatePersonalIncomeTax,
  validateTaxParams,
} from '../../financial-data/tax-brackets';
import {
  formatVND,
  calculateEffectiveAnnualRate,
} from '../../financial-data/vietnamese-financial-data';

describe('Loan Calculations', () => {
  describe('calculateReducingBalancePayment', () => {
    it('should calculate correct monthly payment for reducing balance method', () => {
      const principal = 100000000; // 100 triệu VND
      const annualRate = 10; // 10%
      const termInMonths = 12; // 1 year

      const payment = calculateReducingBalancePayment(principal, annualRate, termInMonths);

      // Expected: 100M * (0.00833 * (1.00833)^12) / ((1.00833)^12 - 1) ≈ 8.79M VND
      expect(payment).toBeGreaterThan(8700000);
      expect(payment).toBeLessThan(8900000);
    });

    it('should handle zero interest rate correctly', () => {
      const principal = 100000000;
      const annualRate = 0;
      const termInMonths = 12;

      const payment = calculateReducingBalancePayment(principal, annualRate, termInMonths);

      expect(payment).toBe(principal / termInMonths);
    });

    it('should handle short term correctly', () => {
      const principal = 50000000;
      const annualRate = 12;
      const termInMonths = 6;

      const payment = calculateReducingBalancePayment(principal, annualRate, termInMonths);

      expect(payment).toBeGreaterThan(8500000);
      expect(payment).toBeLessThan(9000000);
    });
  });

  describe('calculateFlatRatePayment', () => {
    it('should calculate correct monthly payment for flat rate method', () => {
      const principal = 100000000;
      const annualRate = 12; // 12%
      const termInMonths = 12;

      const payment = calculateFlatRatePayment(principal, annualRate, termInMonths);

      // Flat rate: (100M + 12% * 100M * 1year) / 12 = (112M) / 12 ≈ 9.33M VND
      expect(payment).toBeGreaterThan(9300000);
      expect(payment).toBeLessThan(9350000);
    });

    it('should handle zero interest rate correctly', () => {
      const principal = 100000000;
      const annualRate = 0;
      const termInMonths = 12;

      const payment = calculateFlatRatePayment(principal, annualRate, termInMonths);

      expect(payment).toBe(principal / termInMonths);
    });
  });

  describe('calculateLoanDetails', () => {
    it('should calculate comprehensive loan details', () => {
      const params = {
        principal: 100000000,
        annualRate: 10,
        termInMonths: 12,
        rateType: 'reducing_balance' as const,
        hasInsurance: true,
        insuranceRate: 0.3,
        processingFee: 1.5,
        earlyRepaymentPenalty: 3,
      };

      const result = calculateLoanDetails(params);

      expect(result).toBeDefined();
      expect(result.monthlyPayment).toBeGreaterThan(0);
      expect(result.totalPayment).toBeGreaterThan(params.principal);
      expect(result.totalInterest).toBeGreaterThan(0);
      expect(result.effectiveInterestRate).toBeGreaterThan(0);
      expect(result.apr).toBeGreaterThan(0);
      expect(result.paymentSchedule).toHaveLength(12);
    });

    it('should calculate flat rate loan correctly', () => {
      const params = {
        principal: 100000000,
        annualRate: 12,
        termInMonths: 12,
        rateType: 'flat_rate' as const,
        hasInsurance: false,
        processingFee: 0,
        earlyRepaymentPenalty: 0,
      };

      const result = calculateLoanDetails(params);

      expect(result.monthlyPayment).toBeCloseTo(9333333, 0);
      expect(result.totalInterest).toBeCloseTo(12000000, 0);
    });
  });

  describe('validateLoanCalculationParams', () => {
    it('should pass validation for valid parameters', () => {
      const params = {
        principal: 100000000,
        annualRate: 10,
        termInMonths: 12,
        rateType: 'reducing_balance' as const,
      };

      const validation = validateLoanCalculationParams(params);

      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it('should fail validation for negative principal', () => {
      const params = {
        principal: -100000000,
        annualRate: 10,
        termInMonths: 12,
        rateType: 'reducing_balance' as const,
      };

      const validation = validateLoanCalculationParams(params);

      expect(validation.isValid).toBe(false);
      expect(validation.errors.length).toBeGreaterThan(0);
    });

    it('should fail validation for invalid interest rate', () => {
      const params = {
        principal: 100000000,
        annualRate: -5,
        termInMonths: 12,
        rateType: 'reducing_balance' as const,
      };

      const validation = validateLoanCalculationParams(params);

      expect(validation.isValid).toBe(false);
      expect(validation.errors.length).toBeGreaterThan(0);
    });

    it('should fail validation for invalid term', () => {
      const params = {
        principal: 100000000,
        annualRate: 10,
        termInMonths: 0,
        rateType: 'reducing_balance' as const,
      };

      const validation = validateLoanCalculationParams(params);

      expect(validation.isValid).toBe(false);
      expect(validation.errors.length).toBeGreaterThan(0);
    });
  });
});

describe('Tax Calculations', () => {
  describe('calculatePersonalIncomeTax', () => {
    it('should calculate tax correctly for low income', () => {
      const grossIncome = 5000000; // 5 triệu VND/month
      const numberOfDependents = 0;
      const region = 1;

      const result = calculatePersonalIncomeTax(grossIncome, numberOfDependents, region);

      expect(result.grossIncome).toBe(grossIncome);
      expect(result.socialInsurance).toBe(Math.min(grossIncome * 0.08, 2380000));
      expect(result.healthInsurance).toBe(Math.min(grossIncome * 0.015, 447000));
      expect(result.unemploymentInsurance).toBe(Math.min(grossIncome * 0.01, 884000));
      expect(result.netIncome).toBeLessThan(grossIncome);
      expect(result.effectiveTaxRate).toBeGreaterThanOrEqual(0);
    });

    it('should calculate tax correctly for high income', () => {
      const grossIncome = 100000000; // 100 triệu VND/month
      const numberOfDependents = 2;
      const region = 1;

      const result = calculatePersonalIncomeTax(grossIncome, numberOfDependents, region);

      expect(result.grossIncome).toBe(grossIncome);
      expect(result.incomeTax).toBeGreaterThan(0);
      expect(result.netIncome).toBeLessThan(grossIncome);
      expect(result.effectiveTaxRate).toBeGreaterThan(10);
    });

    it('should handle dependents correctly', () => {
      const grossIncome = 20000000;
      const noDependents = calculatePersonalIncomeTax(grossIncome, 0, 1);
      const withDependents = calculatePersonalIncomeTax(grossIncome, 2, 1);

      expect(withDependents.incomeTax).toBeLessThan(noDependents.incomeTax);
      expect(withDependents.netIncome).toBeGreaterThan(noDependents.netIncome);
    });
  });

  describe('validateTaxParams', () => {
    it('should pass validation for valid parameters', () => {
      const params = {
        grossMonthlyIncome: 15000000,
        numberOfDependents: 0,
        region: 1,
      };

      const validation = validateTaxParams(params);

      expect(validation).toHaveLength(0);
    });

    it('should fail validation for negative income', () => {
      const params = {
        grossMonthlyIncome: -1000000,
        numberOfDependents: 0,
        region: 1,
      };

      const validation = validateTaxParams(params);

      expect(validation.length).toBeGreaterThan(0);
    });

    it('should fail validation for negative dependents', () => {
      const params = {
        grossMonthlyIncome: 15000000,
        numberOfDependents: -1,
        region: 1,
      };

      const validation = validateTaxParams(params);

      expect(validation.length).toBeGreaterThan(0);
    });

    it('should fail validation for invalid region', () => {
      const params = {
        grossMonthlyIncome: 15000000,
        numberOfDependents: 0,
        region: 5,
      };

      const validation = validateTaxParams(params);

      expect(validation.length).toBeGreaterThan(0);
    });
  });
});

describe('Utility Functions', () => {
  describe('formatVND', () => {
    it('should format currency correctly', () => {
      expect(formatVND(1000000)).toBe('1.000.000 ₫');
      expect(formatVND(1234567890)).toBe('1.234.567.890 ₫');
      expect(formatVND(0)).toBe('0 ₫');
    });
  });

  describe('calculateEffectiveAnnualRate', () => {
    it('should calculate effective annual rate correctly', () => {
      // 12% nominal with monthly compounding
      const nominalRate = 12;
      const effectiveRate = calculateEffectiveAnnualRate(nominalRate, 12);

      // Effective rate should be slightly higher than nominal
      expect(effectiveRate).toBeGreaterThan(nominalRate);
      expect(effectiveRate).toBeCloseTo(12.68, 1);
    });

    it('should handle zero nominal rate', () => {
      const nominalRate = 0;
      const effectiveRate = calculateEffectiveAnnualRate(nominalRate, 12);

      expect(effectiveRate).toBe(0);
    });

    it('should handle different compounding frequencies', () => {
      const nominalRate = 10;

      const monthlyEffective = calculateEffectiveAnnualRate(nominalRate, 12);
      const quarterlyEffective = calculateEffectiveAnnualRate(nominalRate, 4);
      const annualEffective = calculateEffectiveAnnualRate(nominalRate, 1);

      // More frequent compounding should yield higher effective rate
      expect(monthlyEffective).toBeGreaterThan(quarterlyEffective);
      expect(quarterlyEffective).toBeGreaterThan(annualEffective);
    });
  });
});

describe('Edge Cases', () => {
  test('should handle very large loan amounts', () => {
    const params = {
      principal: 10000000000, // 10 tỷ VND
      annualRate: 8,
      termInMonths: 360, // 30 years
      rateType: 'reducing_balance' as const,
      hasInsurance: true,
      insuranceRate: 0.3,
      processingFee: 1.5,
      earlyRepaymentPenalty: 3,
    };

    const result = calculateLoanDetails(params);

    expect(result).toBeDefined();
    expect(result.monthlyPayment).toBeGreaterThan(0);
    expect(result.totalPayment).toBeGreaterThan(params.principal);
  });

  test('should handle very short loan terms', () => {
    const params = {
      principal: 100000000,
      annualRate: 15,
      termInMonths: 1,
      rateType: 'reducing_balance' as const,
      hasInsurance: false,
      processingFee: 0,
      earlyRepaymentPenalty: 0,
    };

    const result = calculateLoanDetails(params);

    expect(result).toBeDefined();
    expect(result.paymentSchedule).toHaveLength(1);
  });

  test('should handle maximum tax rate bracket', () => {
    const grossIncome = 200000000; // 200 triệu VND/month
    const numberOfDependents = 0;
    const region = 1;

    const result = calculatePersonalIncomeTax(grossIncome, numberOfDependents, region);

    // Should be in highest tax bracket (35%)
    expect(result.effectiveTaxRate).toBeGreaterThan(30);
  });
});

describe('Performance Tests', () => {
  test('should perform calculations efficiently', () => {
    const startTime = performance.now();

    // Perform 1000 calculations
    for (let i = 0; i < 1000; i++) {
      const params = {
        principal: 100000000 + i * 1000000,
        annualRate: 8 + (i % 5),
        termInMonths: 12 + (i % 24),
        rateType: 'reducing_balance' as const,
        hasInsurance: i % 2 === 0,
        insuranceRate: 0.3,
        processingFee: 1.5,
        earlyRepaymentPenalty: 3,
      };

      calculateLoanDetails(params);
    }

    const endTime = performance.now();
    const duration = endTime - startTime;

    // Should complete 1000 calculations in under 1 second
    expect(duration).toBeLessThan(1000);
  });
});