// Vietnamese Loan Calculations Tests
// Comprehensive test suite for loan calculation accuracy and Vietnamese compliance

import {
  VietnameseLoanCalculator,
  formatVND,
  quickMonthlyPaymentCalculation,
  compareLoanOptions,
} from "../interest-calculations";
import type { LoanCalculationParams } from "../interest-calculations";
import { VietnameseFinancialValidator } from "../validation";
import { VietnameseComplianceEngine } from "../vietnamese-compliance";
import VietnameseFinancialAuditLogger from "../audit-logging";

describe("Vietnamese Loan Calculations", () => {
  let auditLogger: VietnameseFinancialAuditLogger;

  beforeEach(() => {
    auditLogger = VietnameseFinancialAuditLogger.getInstance({
      enabled: true,
      maxInMemoryLogs: 100,
      persistToStorage: false,
    });
  });

  afterEach(() => {
    auditLogger.clearOldLogs();
  });

  describe("Flat Rate Calculations", () => {
    test("should calculate flat rate loan correctly", () => {
      const params: LoanCalculationParams = {
        principal: 1000000000, // 1 tỷ VND
        term: 24, // 2 years
        annualRate: 12, // 12%
        rateType: "flat",
        calculationMethod: "monthly",
      };

      const result = VietnameseLoanCalculator.calculateLoan(params);

      // Verify calculation accuracy
      expect(result.monthlyPayment).toBeGreaterThan(0);
      expect(result.totalInterest).toBe(240000000); // 1 tỷ * 12% * 2 năm = 240 triệu
      expect(result.totalPayable).toBe(1240000000); // 1 tỷ + 240 triệu
      expect(result.paymentSchedule).toHaveLength(24);
      expect(result.paymentSchedule[0].principal).toBe(41666667); // 1 tỷ / 24 tháng
      expect(result.paymentSchedule[0].interest).toBe(10000000); // 240 triệu / 24 tháng
    });

    test("should handle flat rate with promotional period", () => {
      const params: LoanCalculationParams = {
        principal: 1000000000,
        term: 36,
        annualRate: 12,
        promotionalRate: 8,
        promotionalPeriod: 6,
        rateType: "flat",
        calculationMethod: "monthly",
      };

      const result = VietnameseLoanCalculator.calculateLoan(params);

      expect(result.promotionalSummary).toBeDefined();
      expect(result.promotionalSummary!.promotionalMonthlyPayment).toBeLessThan(
        result.promotionalSummary!.postPromotionalMonthlyPayment
      );
      expect(result.paymentSchedule).toHaveLength(36);
    });
  });

  describe("Reducing Balance Calculations", () => {
    test("should calculate reducing balance loan correctly", () => {
      const params: LoanCalculationParams = {
        principal: 1000000000,
        term: 24,
        annualRate: 12,
        rateType: "reducing",
        calculationMethod: "monthly",
      };

      const result = VietnameseLoanCalculator.calculateLoan(params);

      // Verify calculation accuracy
      expect(result.monthlyPayment).toBeGreaterThan(0);
      expect(result.totalInterest).toBeLessThan(240000000); // Should be less than flat rate
      expect(result.totalPayable).toBeLessThan(1240000000);
      expect(result.paymentSchedule).toHaveLength(24);

      // Verify reducing balance behavior
      expect(result.paymentSchedule[0].interest).toBeGreaterThan(result.paymentSchedule[23].interest);
      expect(result.paymentSchedule[0].principal).toBeLessThan(result.paymentSchedule[23].principal);
    });

    test("should handle zero interest rate", () => {
      const params: LoanCalculationParams = {
        principal: 1000000000,
        term: 12,
        annualRate: 0,
        rateType: "reducing",
        calculationMethod: "monthly",
      };

      const result = VietnameseLoanCalculator.calculateLoan(params);

      expect(result.monthlyPayment).toBe(83333333); // 1 tỷ / 12 tháng
      expect(result.totalInterest).toBe(0);
      expect(result.totalPayable).toBe(1000000000);
    });
  });

  describe("Early Repayment Calculations", () => {
    test("should calculate early repayment savings correctly", () => {
      const params: LoanCalculationParams = {
        principal: 1000000000,
        term: 60,
        annualRate: 12,
        rateType: "reducing",
        calculationMethod: "monthly",
      };

      const earlyRepayment = VietnameseLoanCalculator.calculateEarlyRepayment(
        params,
        12, // After 12 payments
        200000000, // 200 triệu VND early payment
        2 // 2% fee
      );

      expect(earlyRepayment.remainingBalance).toBeGreaterThanOrEqual(0);
      expect(earlyRepayment.feeAmount).toBe(4000000); // 2% of 200 triệu
      expect(earlyRepayment.savingsAmount).toBeGreaterThanOrEqual(0);
      expect(earlyRepayment.netSavings).toBeGreaterThanOrEqual(-earlyRepayment.feeAmount);
    });
  });

  describe("Input Validation", () => {
    test("should validate positive principal amount", () => {
      const params: LoanCalculationParams = {
        principal: -1000000,
        term: 12,
        annualRate: 10,
        rateType: "reducing",
        calculationMethod: "monthly",
      };

      expect(() => VietnameseLoanCalculator.calculateLoan(params)).toThrow();
    });

    test("should validate positive term", () => {
      const params: LoanCalculationParams = {
        principal: 1000000000,
        term: 0,
        annualRate: 10,
        rateType: "reducing",
        calculationMethod: "monthly",
      };

      expect(() => VietnameseLoanCalculator.calculateLoan(params)).toThrow();
    });

    test("should validate reasonable interest rate", () => {
      const params: LoanCalculationParams = {
        principal: 1000000000,
        term: 12,
        annualRate: -5,
        rateType: "reducing",
        calculationMethod: "monthly",
      };

      expect(() => VietnameseLoanCalculator.calculateLoan(params)).toThrow();
    });
  });

  describe("Vietnamese Compliance", () => {
    test("should flag excessive interest rates", () => {
      const params: LoanCalculationParams = {
        principal: 1000000000,
        term: 12,
        annualRate: 25, // High rate for consumer loan
        rateType: "reducing",
        calculationMethod: "monthly",
      };

      const validation = VietnameseFinancialValidator.validateAndSanitize(params);

      expect(validation.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            field: "annualRate",
            severity: "warning",
            code: "HIGH_RATE",
          })
        ])
      );
    });

    test("should validate Vietnamese banking limits", () => {
      const params: LoanCalculationParams = {
        principal: 100000000, // Small amount
        term: 3, // Very short term
        annualRate: 15,
        rateType: "reducing",
        calculationMethod: "monthly",
      };

      const validation = VietnameseFinancialValidator.validateAndSanitize(params);

      expect(validation.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            field: "principal",
            severity: "warning",
            code: "SMALL_PRINCIPAL",
          })
        ])
      );
    });
  });

  describe("Audit Logging", () => {
    test("should log successful calculations", () => {
      const params: LoanCalculationParams = {
        principal: 1000000000,
        term: 24,
        annualRate: 12,
        rateType: "reducing",
        calculationMethod: "monthly",
      };

      const result = VietnameseLoanCalculator.calculateLoan(params);

      const logs = auditLogger.getLogs({ calculationType: "loan_calculation" });
      expect(logs).toHaveLength(1);
      expect(logs[0].success).toBe(true);
      expect(logs[0].calculationType).toBe("loan_calculation");
    });

    test("should log calculation errors", () => {
      const params: LoanCalculationParams = {
        principal: -1000000,
        term: 12,
        annualRate: 10,
        rateType: "reducing",
        calculationMethod: "monthly",
      };

      expect(() => VietnameseLoanCalculator.calculateLoan(params)).toThrow();

      const logs = auditLogger.getLogs({ calculationType: "loan_calculation" });
      expect(logs).toHaveLength(1);
      expect(logs[0].success).toBe(false);
      expect(logs[0].errorMessage).toBeDefined();
    });
  });

  describe("Utility Functions", () => {
    test("should format VND correctly", () => {
      expect(formatVND(1234567)).toBe("1.234.567 ₫");
      expect(formatVND(1000000000)).toBe("1.000.000.000 ₫");
      expect(formatVND(0)).toBe("0 ₫");
    });

    test("should calculate quick monthly payment", () => {
      const payment = quickMonthlyPaymentCalculation(
        1000000000,
        12,
        24,
        "reducing"
      );

      expect(payment).toBeGreaterThan(0);
      expect(typeof payment).toBe("number");
    });

    test("should compare loan options correctly", () => {
      const options = [
        {
          name: "Option 1",
          params: {
            principal: 1000000000,
            term: 24,
            annualRate: 10,
            rateType: "reducing" as const,
            calculationMethod: "monthly" as const,
          },
        },
        {
          name: "Option 2",
          params: {
            principal: 1000000000,
            term: 24,
            annualRate: 12,
            rateType: "reducing" as const,
            calculationMethod: "monthly" as const,
          },
        },
      ];

      const comparison = compareLoanOptions(options);

      expect(comparison).toHaveLength(2);
      expect(comparison[0].ranking).toBe(1); // Lower rate should rank first
      expect(comparison[1].ranking).toBe(2);
    });
  });

  describe("Edge Cases", () => {
    test("should handle very large principal amounts", () => {
      const params: LoanCalculationParams = {
        principal: 10000000000, // 10 tỷ VND
        term: 360, // 30 years
        annualRate: 8,
        rateType: "reducing",
        calculationMethod: "monthly",
      };

      const result = VietnameseLoanCalculator.calculateLoan(params);

      expect(result.monthlyPayment).toBeGreaterThan(0);
      expect(result.paymentSchedule).toHaveLength(360);
      expect(result.paymentSchedule[359].remainingBalance).toBe(0);
    });

    test("should handle grace period correctly", () => {
      const params: LoanCalculationParams = {
        principal: 1000000000,
        term: 24,
        annualRate: 12,
        rateType: "reducing",
        calculationMethod: "monthly",
        gracePeriod: 3,
      };

      const result = VietnameseLoanCalculator.calculateLoan(params);

      // During grace period, should only pay interest
      expect(result.paymentSchedule[0].principal).toBe(0);
      expect(result.paymentSchedule[0].interest).toBeGreaterThan(0);
      expect(result.paymentSchedule[1].principal).toBe(0);
      expect(result.paymentSchedule[1].interest).toBeGreaterThan(0);
      expect(result.paymentSchedule[2].principal).toBe(0);
      expect(result.paymentSchedule[2].interest).toBeGreaterThan(0);

      // After grace period, should pay both principal and interest
      expect(result.paymentSchedule[3].principal).toBeGreaterThan(0);
      expect(result.paymentSchedule[3].interest).toBeGreaterThan(0);
    });
  });

  describe("Vietnamese Banking Regulations", () => {
    test("should comply with SBV interest rate caps", () => {
      // Consumer loan cap test
      const consumerParams: LoanCalculationParams = {
        principal: 500000000, // 500 triệu VND
        term: 36,
        annualRate: 18, // Below 20% cap for consumer loans
        rateType: "reducing",
        calculationMethod: "monthly",
      };

      const validation = VietnameseFinancialValidator.validateAndSanitize(consumerParams);
      expect(validation.isValid).toBe(true);

      // Exceeding cap
      const highRateParams: LoanCalculationParams = {
        ...consumerParams,
        annualRate: 25, // Exceeds 20% cap
      };

      const highRateValidation = VietnameseFinancialValidator.validateAndSanitize(highRateParams);
      expect(highRateValidation.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            field: "annualRate",
            severity: "warning",
            code: "EXCEEDS_SBV_GUIDELINE",
          })
        ])
      );
    });

    test("should validate loan term limits", () => {
      const longTermParams: LoanCalculationParams = {
        principal: 1000000000,
        term: 480, // 40 years - exceeds typical maximum
        annualRate: 10,
        rateType: "reducing",
        calculationMethod: "monthly",
      };

      const validation = VietnameseFinancialValidator.validateAndSanitize(longTermParams);
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            field: "term",
            severity: "error",
            code: "EXCESSIVE_TERM",
          })
        ])
      );
    });
  });

  describe("Performance and Reliability", () => {
    test("should handle rapid successive calculations", () => {
      const baseParams: LoanCalculationParams = {
        principal: 1000000000,
        term: 24,
        annualRate: 12,
        rateType: "reducing",
        calculationMethod: "monthly",
      };

      const startTime = Date.now();

      // Perform 100 calculations
      for (let i = 0; i < 100; i++) {
        const params = { ...baseParams, principal: 1000000000 + i * 1000000 };
        VietnameseLoanCalculator.calculateLoan(params);
      }

      const endTime = Date.now();
      const totalTime = endTime - startTime;

      // Should complete 100 calculations in reasonable time (< 1 second)
      expect(totalTime).toBeLessThan(1000);
    });

    test("should maintain calculation precision", () => {
      const params: LoanCalculationParams = {
        principal: 123456789, // Odd number to test precision
        term: 36,
        annualRate: 11.5, // Decimal interest rate
        rateType: "reducing",
        calculationMethod: "monthly",
      };

      const result = VietnameseLoanCalculator.calculateLoan(params);

      // Verify payment schedule sums to total payable
      const scheduleSum = result.paymentSchedule.reduce((sum, payment) => sum + payment.total, 0);
      expect(Math.abs(scheduleSum - result.totalPayable)).toBeLessThan(100); // Allow small rounding difference

      // Verify final balance is exactly zero
      expect(result.paymentSchedule[result.paymentSchedule.length - 1].remainingBalance).toBe(0);
    });
  });
});