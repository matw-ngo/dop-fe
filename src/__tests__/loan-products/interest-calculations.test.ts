// Vietnamese Loan Interest Calculations Tests
// Comprehensive tests for Vietnamese loan calculation utilities

import {
  VietnameseLoanCalculator,
  formatVND,
  quickMonthlyPaymentCalculation,
  compareLoanOptions,
  generateVietnameseLoanSummary,
} from "@/lib/loan-products/interest-calculations";
import type { LoanCalculationParams, InterestRateType } from "@/lib/loan-products/interest-calculations";

describe("Vietnamese Loan Calculator", () => {
  const baseParams: LoanCalculationParams = {
    principal: 100000000, // 100 triệu VND
    term: 12, // 12 months
    annualRate: 12, // 12% annual rate
    rateType: "reducing",
    calculationMethod: "monthly",
  };

  describe("calculateLoan", () => {
    it("should calculate reducing balance loan correctly", () => {
      const params = { ...baseParams, rateType: "reducing" as InterestRateType };
      const result = VietnameseLoanCalculator.calculateLoan(params);

      expect(result).toHaveProperty("monthlyPayment");
      expect(result).toHaveProperty("totalPayable");
      expect(result).toHaveProperty("totalInterest");
      expect(result).toHaveProperty("totalFees");
      expect(result).toHaveProperty("effectiveAPR");
      expect(result).toHaveProperty("paymentSchedule");
      expect(result).toHaveProperty("summary");

      expect(typeof result.monthlyPayment).toBe("number");
      expect(typeof result.totalPayable).toBe("number");
      expect(typeof result.totalInterest).toBe("number");
      expect(typeof result.effectiveAPR).toBe("number");

      expect(result.monthlyPayment).toBeGreaterThan(0);
      expect(result.totalPayable).toBeGreaterThan(params.principal);
      expect(result.totalInterest).toBeGreaterThanOrEqual(0);
      expect(result.effectiveAPR).toBeGreaterThan(0);

      expect(result.paymentSchedule).toHaveLength(params.term);
      expect(result.summary.totalPayments).toBe(params.term);
    });

    it("should calculate flat rate loan correctly", () => {
      const params = { ...baseParams, rateType: "flat" as InterestRateType };
      const result = VietnameseLoanCalculator.calculateLoan(params);

      expect(result.monthlyPayment).toBeGreaterThan(0);
      expect(result.totalInterest).toBeGreaterThan(0);

      // For flat rate, total interest should be principal * rate * (term/12)
      const expectedTotalInterest = params.principal * (params.annualRate / 100) * (params.term / 12);
      expect(Math.abs(result.totalInterest - expectedTotalInterest)).toBeLessThan(1); // Allow for rounding
    });

    it("should handle zero interest rate", () => {
      const params = { ...baseParams, annualRate: 0 };
      const result = VietnameseLoanCalculator.calculateLoan(params);

      expect(result.totalInterest).toBe(0);
      expect(result.monthlyPayment).toBe(params.principal / params.term);
      expect(result.totalPayable).toBe(params.principal);
    });

    it("should include fees correctly", () => {
      const params = {
        ...baseParams,
        processingFee: 2, // 2%
        processingFeeFixed: 1000000, // 1 triệu VND
        insuranceFee: 0.5, // 0.5%
        otherFees: 500000, // 500k VND
      };
      const result = VietnameseLoanCalculator.calculateLoan(params);

      const expectedProcessingFee = params.principal * (params.processingFee! / 100);
      const expectedInsuranceFee = params.principal * (params.insuranceFee! / 100);
      const expectedTotalFees = expectedProcessingFee + params.processingFeeFixed! + expectedInsuranceFee + params.otherFees!;

      expect(result.totalFees).toBeCloseTo(expectedTotalFees, 0.01);
    });

    it("should handle promotional rates", () => {
      const params = {
        ...baseParams,
        annualRate: 15,
        promotionalRate: 10,
        promotionalPeriod: 6, // 6 months promotional period
      };
      const result = VietnameseLoanCalculator.calculateLoan(params);

      expect(result).toHaveProperty("promotionalSummary");
      expect(result.promotionalSummary).toBeDefined();
      expect(result.promotionalSummary!.promotionalMonthlyPayment).toBeLessThan(result.monthlyPayment);
      expect(result.promotionalSummary!.promotionalSavings).toBeGreaterThan(0);
    });

    it("should handle grace period", () => {
      const params = {
        ...baseParams,
        gracePeriod: 3, // 3 months grace period
      };
      const result = VietnameseLoanCalculator.calculateLoan(params);

      expect(result.paymentSchedule).toHaveLength(params.term);

      // First 3 payments should be interest only (for reducing balance)
      const firstPayments = result.paymentSchedule.slice(0, 3);
      firstPayments.forEach(payment => {
        expect(payment.principal).toBe(0);
        expect(payment.total).toBe(payment.interest);
      });
    });

    it("should handle different calculation methods", () => {
      const dailyParams = { ...baseParams, calculationMethod: "daily" as const };
      const monthlyParams = { ...baseParams, calculationMethod: "monthly" as const };

      const dailyResult = VietnameseLoanCalculator.calculateLoan(dailyParams);
      const monthlyResult = VietnameseLoanCalculator.calculateLoan(monthlyParams);

      expect(dailyResult).toHaveProperty("monthlyPayment");
      expect(monthlyResult).toHaveProperty("monthlyPayment");
      // Results should be similar but might differ slightly due to calculation method
    });
  });

  describe("calculateEarlyRepayment", () => {
    it("should calculate early repayment savings correctly", () => {
      const loanParams = { ...baseParams, term: 24 };
      const result = VietnameseLoanCalculator.calculateLoan(loanParams);

      const earlyRepaymentResult = VietnameseLoanCalculator.calculateEarlyRepayment(
        loanParams,
        12, // 12 payments made
        50000000, // Early repayment amount
        2 // 2% early repayment fee
      );

      expect(earlyRepaymentResult).toHaveProperty("remainingBalance");
      expect(earlyRepaymentResult).toHaveProperty("savingsAmount");
      expect(earlyRepaymentResult).toHaveProperty("feeAmount");
      expect(earlyRepaymentResult).toHaveProperty("netSavings");

      expect(earlyRepaymentResult.feeAmount).toBe(1000000); // 2% of 50M
      expect(earlyRepaymentResult.remainingBalance).toBeGreaterThanOrEqual(0);
      expect(earlyRepaymentResult.netSavings).toBeGreaterThanOrEqual(0);
    });

    it("should handle full early repayment", () => {
      const loanParams = { ...baseParams, term: 24 };
      const earlyRepaymentResult = VietnameseLoanCalculator.calculateEarlyRepayment(
        loanParams,
        12,
        loanParams.principal, // Pay off everything
        2
      );

      expect(earlyRepaymentResult.remainingBalance).toBeCloseTo(0, 1000); // Allow for small rounding differences
    });
  });

  describe("calculateAffordability", () => {
    it("should calculate affordability correctly", () => {
      const monthlyIncome = 20000000; // 20 triệu VND
      const monthlyExpenses = 8000000; // 8 triệu VND
      const existingDebt = 2000000; // 2 triệu VND

      const affordability = VietnameseLoanCalculator.calculateAffordability(
        monthlyIncome,
        monthlyExpenses,
        existingDebt,
        50 // 50% DTI limit
      );

      expect(affordability).toHaveProperty("maxMonthlyPayment");
      expect(affordability).toHaveProperty("maxLoanAmount");
      expect(affordability).toHaveProperty("affordableRange");
      expect(affordability).toHaveProperty("riskLevel");

      expect(affordability.maxMonthlyPayment).toBeGreaterThan(0);
      expect(affordability.maxLoanAmount).toBeGreaterThan(0);
      expect(["low", "medium", "high"]).toContain(affordability.riskLevel);
    });

    it("should handle high debt-to-income ratio", () => {
      const monthlyIncome = 10000000; // 10 triệu VND
      const monthlyExpenses = 7000000; // 7 triệu VND
      const existingDebt = 3000000; // 3 triệu VND

      const affordability = VietnameseLoanCalculator.calculateAffordability(
        monthlyIncome,
        monthlyExpenses,
        existingDebt,
        50
      );

      expect(affordability.maxMonthlyPayment).toBeLessThanOrEqual(0); // No room for new payment
      expect(affordability.riskLevel).toBe("high");
    });
  });

  describe("edge cases", () => {
    it("should handle very short loan terms", () => {
      const params = { ...baseParams, term: 1 };
      const result = VietnameseLoanCalculator.calculateLoan(params);

      expect(result.paymentSchedule).toHaveLength(1);
      expect(result.monthlyPayment).toBe(params.principal + result.totalInterest);
    });

    it("should handle very long loan terms", () => {
      const params = { ...baseParams, term: 360 }; // 30 years
      const result = VietnameseLoanCalculator.calculateLoan(params);

      expect(result.paymentSchedule).toHaveLength(360);
      expect(result.monthlyPayment).toBeGreaterThan(0);
    });

    it("should handle very large loan amounts", () => {
      const params = { ...baseParams, principal: 10000000000 }; // 10 tỷ VND
      const result = VietnameseLoanCalculator.calculateLoan(params);

      expect(result.monthlyPayment).toBeGreaterThan(0);
      expect(result.totalPayable).toBeGreaterThan(params.principal);
    });

    it("should handle very small loan amounts", () => {
      const params = { ...baseParams, principal: 1000000 }; // 1 triệu VND
      const result = VietnameseLoanCalculator.calculateLoan(params);

      expect(result.monthlyPayment).toBeGreaterThan(0);
      expect(result.totalPayable).toBeGreaterThan(params.principal);
    });

    it("should handle very high interest rates", () => {
      const params = { ...baseParams, annualRate: 50 }; // 50% annual rate
      const result = VietnameseLoanCalculator.calculateLoan(params);

      expect(result.monthlyPayment).toBeGreaterThan(0);
      expect(result.totalInterest).toBeGreaterThan(params.principal);
    });
  });
});

describe("Utility Functions", () => {
  describe("formatVND", () => {
    it("should format Vietnamese Dong correctly", () => {
      expect(formatVND(1000000)).toBe("1.000.000 ₫");
      expect(formatVND(1234567)).toBe("1.234.567 ₫");
      expect(formatVND(0)).toBe("0 ₫");
      expect(formatVND(100)).toBe("100 ₫");
    });

    it("should handle negative values", () => {
      expect(formatVND(-1000000)).toBe("-1.000.000 ₫");
    });
  });

  describe("quickMonthlyPaymentCalculation", () => {
    it("should calculate monthly payment quickly", () => {
      const payment = quickMonthlyPaymentCalculation(100000000, 12, 12);
      expect(typeof payment).toBe("number");
      expect(payment).toBeGreaterThan(0);
    });

    it("should handle different rate types", () => {
      const reducingPayment = quickMonthlyPaymentCalculation(100000000, 12, 12, "reducing");
      const flatPayment = quickMonthlyPaymentCalculation(100000000, 12, 12, "flat");
      const fixedPayment = quickMonthlyPaymentCalculation(100000000, 12, 12, "fixed");

      expect(reducingPayment).toBeGreaterThan(0);
      expect(flatPayment).toBeGreaterThan(0);
      expect(fixedPayment).toBeGreaterThan(0);

      // Flat rate should typically be higher than reducing balance for same rate
      expect(flatPayment).toBeGreaterThanOrEqual(reducingPayment);
    });
  });

  describe("compareLoanOptions", () => {
    it("should compare loan options correctly", () => {
      const options = [
        {
          name: "Option A",
          params: { principal: 100000000, term: 12, annualRate: 10, rateType: "reducing" as InterestRateType, calculationMethod: "monthly" },
        },
        {
          name: "Option B",
          params: { principal: 100000000, term: 12, annualRate: 12, rateType: "reducing" as InterestRateType, calculationMethod: "monthly" },
        },
      ];

      const comparison = compareLoanOptions(options);

      expect(comparison).toHaveLength(2);
      expect(comparison[0]).toHaveProperty("name");
      expect(comparison[0]).toHaveProperty("monthlyPayment");
      expect(comparison[0]).toHaveProperty("totalInterest");
      expect(comparison[0]).toHaveProperty("totalPayable");
      expect(comparison[0]).toHaveProperty("effectiveAPR");
      expect(comparison[0]).toHaveProperty("ranking");

      // Should be ranked by total payable (lowest first)
      expect(comparison[0].totalPayable).toBeLessThanOrEqual(comparison[1].totalPayable);
      expect(comparison[0].ranking).toBe(1);
      expect(comparison[1].ranking).toBe(2);
    });

    it("should handle zero interest rate", () => {
      const options = [
        {
          name: "Zero Interest",
          params: { principal: 100000000, term: 12, annualRate: 0, rateType: "reducing" as InterestRateType, calculationMethod: "monthly" },
        },
      ];

      const comparison = compareLoanOptions(options);

      expect(comparison[0].monthlyPayment).toBe(8333333.333333334); // 100M / 12
      expect(comparison[0].totalInterest).toBe(0);
      expect(comparison[0].totalPayable).toBe(100000000);
    });
  });

  describe("generateVietnameseLoanSummary", () => {
    it("should generate Vietnamese loan summary", () => {
      const result = VietnameseLoanCalculator.calculateLoan(baseParams);
      const summary = generateVietnameseLoanSummary(result);

      expect(typeof summary).toBe("string");
      expect(summary).toContain("TÓM TẮT VAY VỐN");
      expect(summary).toContain("Số tiền vay");
      expect(summary).toContain("Thời gian vay");
      expect(summary).toContain("Lãi suất hàng tháng");
      expect(summary).toContain("Tổng lãi suất");
      expect(summary).toContain("Tổng số tiền phải trả");
      expect(summary).toContain("LỊCH TRẢ NỢ");
    });

    it("should include promotional information in summary", () => {
      const params = {
        ...baseParams,
        annualRate: 15,
        promotionalRate: 10,
        promotionalPeriod: 6,
      };
      const result = VietnameseLoanCalculator.calculateLoan(params);
      const summary = generateVietnameseLoanSummary(result);

      expect(summary).toContain("GIAI ĐOẠN ƯU ĐÃI");
    });
  });
});

describe("calculation accuracy", () => {
  it("should have mathematically correct reducing balance calculations", () => {
    const params = {
      principal: 1000000,
      term: 12,
      annualRate: 12, // 1% per month
      rateType: "reducing" as InterestRateType,
      calculationMethod: "monthly" as const,
    };

    const result = VietnameseLoanCalculator.calculateLoan(params);

    // For reducing balance with 12% annual (1% monthly) over 12 months:
    // Month 1: Interest = 1,000,000 * 0.01 = 10,000, Principal = 88,848, Total = 98,848
    const firstPayment = result.paymentSchedule[0];
    expect(Math.abs(firstPayment.interest - 10000)).toBeLessThan(1);
    expect(firstPayment.principal).toBeGreaterThan(0);
    expect(firstPayment.total).toBeGreaterThan(firstPayment.interest);

    // Last payment should have much lower interest
    const lastPayment = result.paymentSchedule[result.paymentSchedule.length - 1];
    expect(lastPayment.interest).toBeLessThan(firstPayment.interest);
    expect(lastPayment.remainingBalance).toBe(0);
  });

  it("should have mathematically correct flat rate calculations", () => {
    const params = {
      principal: 1200000,
      term: 12,
      annualRate: 12, // 12% annual
      rateType: "flat" as InterestRateType,
      calculationMethod: "monthly" as const,
    };

    const result = VietnameseLoanCalculator.calculateLoan(params);

    // For flat rate: Total interest = Principal * Rate * (Term/12)
    const expectedTotalInterest = params.principal * (params.annualRate / 100) * (params.term / 12);
    expect(Math.abs(result.totalInterest - expectedTotalInterest)).toBeLessThan(1);

    // Monthly payment should be the same for all months
    const firstPayment = result.paymentSchedule[0];
    const lastPayment = result.paymentSchedule[result.paymentSchedule.length - 1];
    expect(Math.abs(firstPayment.total - lastPayment.total)).toBeLessThan(1);
  });

  it("should handle promotional periods correctly", () => {
    const params = {
      principal: 1000000,
      term: 24,
      annualRate: 15,
      promotionalRate: 10,
      promotionalPeriod: 6,
      rateType: "reducing" as InterestRateType,
      calculationMethod: "monthly" as const,
    };

    const result = VietnameseLoanCalculator.calculateLoan(params);

    // First 6 payments should use promotional rate
    const promotionalPayment = result.promotionalSummary!.promotionalMonthlyPayment;
    const normalPayment = result.promotionalSummary!.postPromotionalMonthlyPayment;

    expect(promotionalPayment).toBeLessThan(normalPayment);
    expect(result.promotionalSummary!.promotionalSavings).toBeGreaterThan(0);
  });
});