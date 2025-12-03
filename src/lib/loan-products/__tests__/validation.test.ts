// Financial Calculation Validation Tests
// Comprehensive test suite for input validation and sanitization

import { VietnameseFinancialValidator } from "../validation";
import { vietnameseLoanProducts } from "../vietnamese-loan-products";
import type { LoanCalculationParams } from "../interest-calculations";

describe("Financial Calculation Validation", () => {
  describe("Parameter Validation", () => {
    test("should validate correct parameters", () => {
      const params: LoanCalculationParams = {
        principal: 1000000000,
        term: 24,
        annualRate: 12,
        rateType: "reducing",
        calculationMethod: "monthly",
      };

      const validation = VietnameseFinancialValidator.validateAndSanitize(params);

      expect(validation.isValid).toBe(true);
      expect(validation.hasWarnings).toBe(false);
      expect(validation.errors).toHaveLength(0);
      expect(validation.sanitizedParams).toBeDefined();
    });

    test("should reject negative principal", () => {
      const params: LoanCalculationParams = {
        principal: -1000000,
        term: 24,
        annualRate: 12,
        rateType: "reducing",
        calculationMethod: "monthly",
      };

      const validation = VietnameseFinancialValidator.validateAndSanitize(params);

      expect(validation.isValid).toBe(false);
      expect(validation.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            field: "principal",
            severity: "error",
            code: "INVALID_PRINCIPAL",
          })
        ])
      );
    });

    test("should reject zero or negative term", () => {
      const params: LoanCalculationParams = {
        principal: 1000000000,
        term: 0,
        annualRate: 12,
        rateType: "reducing",
        calculationMethod: "monthly",
      };

      const validation = VietnameseFinancialValidator.validateAndSanitize(params);

      expect(validation.isValid).toBe(false);
      expect(validation.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            field: "term",
            severity: "error",
            code: "INVALID_TERM",
          })
        ])
      );
    });

    test("should reject excessive term", () => {
      const params: LoanCalculationParams = {
        principal: 1000000000,
        term: 700, // Exceeds 50 years (600 months)
        annualRate: 12,
        rateType: "reducing",
        calculationMethod: "monthly",
      };

      const validation = VietnameseFinancialValidator.validateAndSanitize(params);

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

    test("should reject negative interest rate", () => {
      const params: LoanCalculationParams = {
        principal: 1000000000,
        term: 24,
        annualRate: -5,
        rateType: "reducing",
        calculationMethod: "monthly",
      };

      const validation = VietnameseFinancialValidator.validateAndSanitize(params);

      expect(validation.isValid).toBe(false);
      expect(validation.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            field: "annualRate",
            severity: "error",
            code: "NEGATIVE_RATE",
          })
        ])
      );
    });

    test("should warn about excessive interest rates", () => {
      const params: LoanCalculationParams = {
        principal: 1000000000,
        term: 24,
        annualRate: 60, // Very high rate
        rateType: "reducing",
        calculationMethod: "monthly",
      };

      const validation = VietnameseFinancialValidator.validateAndSanitize(params);

      expect(validation.isValid).toBe(true);
      expect(validation.hasWarnings).toBe(true);
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
  });

  describe("Parameter Sanitization", () => {
    test("should sanitize numeric values within bounds", () => {
      const params: LoanCalculationParams = {
        principal: 1.23456789, // Should be rounded
        term: 24.7, // Should be integer
        annualRate: 12.999, // Should be reasonable
        rateType: "reducing",
        calculationMethod: "monthly",
      };

      const validation = VietnameseFinancialValidator.validateAndSanitize(params, {
        roundToVND: true,
      });

      expect(validation.isValid).toBe(true);
      expect(validation.sanitizedParams!.principal).toBe(1);
      expect(validation.sanitizedParams!.term).toBe(24);
      expect(validation.sanitizedParams!.annualRate).toBe(12.999);
    });

    test("should sanitize extreme values", () => {
      const params: LoanCalculationParams = {
        principal: Number.MAX_SAFE_INTEGER, // Should be capped
        term: 1000, // Should be capped to 600
        annualRate: 150, // Should be capped to 100
        rateType: "reducing",
        calculationMethod: "monthly",
      };

      const validation = VietnameseFinancialValidator.validateAndSanitize(params);

      expect(validation.isValid).toBe(true);
      expect(validation.sanitizedParams!.principal).toBeLessThanOrEqual(Number.MAX_SAFE_INTEGER);
      expect(validation.sanitizedParams!.term).toBeLessThanOrEqual(600);
      expect(validation.sanitizedParams!.annualRate).toBeLessThanOrEqual(100);
    });

    test("should sanitize invalid rate types", () => {
      const params: LoanCalculationParams = {
        principal: 1000000000,
        term: 24,
        annualRate: 12,
        rateType: "invalid_type" as any,
        calculationMethod: "monthly",
      };

      const validation = VietnameseFinancialValidator.validateAndSanitize(params);

      expect(validation.sanitizedParams!.rateType).toBe("reducing"); // Default to reducing
    });

    test("should sanitize invalid calculation methods", () => {
      const params: LoanCalculationParams = {
        principal: 1000000000,
        term: 24,
        annualRate: 12,
        rateType: "reducing",
        calculationMethod: "invalid_method" as any,
      };

      const validation = VietnameseFinancialValidator.validateAndSanitize(params);

      expect(validation.sanitizedParams!.calculationMethod).toBe("monthly"); // Default to monthly
    });
  });

  describe("Promotional Period Validation", () => {
    test("should validate consistent promotional parameters", () => {
      const params: LoanCalculationParams = {
        principal: 1000000000,
        term: 24,
        annualRate: 12,
        promotionalRate: 8,
        promotionalPeriod: 6,
        rateType: "reducing",
        calculationMethod: "monthly",
      };

      const validation = VietnameseFinancialValidator.validateAndSanitize(params);

      expect(validation.isValid).toBe(true);
      expect(validation.errors.filter(e => e.severity === "error")).toHaveLength(0);
    });

    test("should reject promotional rate without period", () => {
      const params: LoanCalculationParams = {
        principal: 1000000000,
        term: 24,
        annualRate: 12,
        promotionalRate: 8, // But no promotionalPeriod
        rateType: "reducing",
        calculationMethod: "monthly",
      };

      const validation = VietnameseFinancialValidator.validateAndSanitize(params);

      expect(validation.isValid).toBe(false);
      expect(validation.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            field: "promotionalPeriod",
            severity: "error",
            code: "MISSING_PROMOTIONAL_PERIOD",
          })
        ])
      );
    });

    test("should reject promotional period without rate", () => {
      const params: LoanCalculationParams = {
        principal: 1000000000,
        term: 24,
        annualRate: 12,
        promotionalPeriod: 6, // But no promotionalRate
        rateType: "reducing",
        calculationMethod: "monthly",
      };

      const validation = VietnameseFinancialValidator.validateAndSanitize(params);

      expect(validation.isValid).toBe(false);
      expect(validation.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            field: "promotionalRate",
            severity: "error",
            code: "MISSING_PROMOTIONAL_RATE",
          })
        ])
      );
    });

    test("should reject promotional period >= loan term", () => {
      const params: LoanCalculationParams = {
        principal: 1000000000,
        term: 24,
        annualRate: 12,
        promotionalRate: 8,
        promotionalPeriod: 24, // Equal to loan term
        rateType: "reducing",
        calculationMethod: "monthly",
      };

      const validation = VietnameseFinancialValidator.validateAndSanitize(params);

      expect(validation.isValid).toBe(false);
      expect(validation.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            field: "promotionalPeriod",
            severity: "error",
            code: "PROMOTIONAL_PERIOD_TOO_LONG",
          })
        ])
      );
    });

    test("should warn about promotional rate >= standard rate", () => {
      const params: LoanCalculationParams = {
        principal: 1000000000,
        term: 24,
        annualRate: 8,
        promotionalRate: 10, // Higher than standard rate
        promotionalPeriod: 6,
        rateType: "reducing",
        calculationMethod: "monthly",
      };

      const validation = VietnameseFinancialValidator.validateAndSanitize(params);

      expect(validation.hasWarnings).toBe(true);
      expect(validation.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            field: "promotionalRate",
            severity: "warning",
            code: "INVALID_PROMOTIONAL_RATE",
          })
        ])
      );
    });
  });

  describe("Fee Validation", () => {
    test("should validate reasonable fees", () => {
      const params: LoanCalculationParams = {
        principal: 1000000000,
        term: 24,
        annualRate: 12,
        processingFee: 1.5,
        insuranceFee: 0.5,
        rateType: "reducing",
        calculationMethod: "monthly",
      };

      const validation = VietnameseFinancialValidator.validateAndSanitize(params);

      expect(validation.isValid).toBe(true);
    });

    test("should warn about excessive processing fees", () => {
      const params: LoanCalculationParams = {
        principal: 1000000000,
        term: 24,
        annualRate: 12,
        processingFee: 15, // 15% processing fee
        rateType: "reducing",
        calculationMethod: "monthly",
      };

      const validation = VietnameseFinancialValidator.validateAndSanitize(params);

      expect(validation.hasWarnings).toBe(true);
      expect(validation.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            field: "processingFee",
            severity: "warning",
            code: "HIGH_PROCESSING_FEE",
          })
        ])
      );
    });

    test("should warn about excessive total fees", () => {
      const params: LoanCalculationParams = {
        principal: 1000000000,
        term: 24,
        annualRate: 12,
        processingFee: 10,
        insuranceFee: 15, // Total 25%
        rateType: "reducing",
        calculationMethod: "monthly",
      };

      const validation = VietnameseFinancialValidator.validateAndSanitize(params);

      expect(validation.hasWarnings).toBe(true);
      expect(validation.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            field: "totalFees",
            severity: "warning",
            code: "HIGH_TOTAL_FEES",
          })
        ])
      );
    });

    test("should warn about excessive fixed fees", () => {
      const params: LoanCalculationParams = {
        principal: 1000000000,
        term: 24,
        annualRate: 12,
        processingFeeFixed: 200000000, // 200 million VND (20% of principal)
        rateType: "reducing",
        calculationMethod: "monthly",
      };

      const validation = VietnameseFinancialValidator.validateAndSanitize(params);

      expect(validation.hasWarnings).toBe(true);
      expect(validation.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            field: "fixedFees",
            severity: "warning",
            code: "HIGH_FIXED_FEES",
          })
        ])
      );
    });
  });

  describe("Date Validation", () => {
    test("should sanitize past payment dates", () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);

      const params: LoanCalculationParams = {
        principal: 1000000000,
        term: 24,
        annualRate: 12,
        rateType: "reducing",
        calculationMethod: "monthly",
        firstPaymentDate: pastDate,
      };

      const validation = VietnameseFinancialValidator.validateAndSanitize(params);

      expect(validation.isValid).toBe(false);
      expect(validation.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            field: "firstPaymentDate",
            severity: "error",
            code: "PAST_PAYMENT_DATE",
          })
        ])
      );
    });

    test("should warn about far future payment dates", () => {
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 2);

      const params: LoanCalculationParams = {
        principal: 1000000000,
        term: 24,
        annualRate: 12,
        rateType: "reducing",
        calculationMethod: "monthly",
        firstPaymentDate: futureDate,
      };

      const validation = VietnameseFinancialValidator.validateAndSanitize(params);

      expect(validation.hasWarnings).toBe(true);
      expect(validation.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            field: "firstPaymentDate",
            severity: "warning",
            code: "FAR_FUTURE_PAYMENT_DATE",
          })
        ])
      );
    });
  });

  describe("Product Constraint Validation", () => {
    test("should validate against product constraints", () => {
      const product = vietnameseLoanProducts[0];
      const params: LoanCalculationParams = {
        principal: product.amountLimits.min,
        term: product.termOptions.min,
        annualRate: product.interestRate.annual,
        rateType: product.interestRate.type,
        calculationMethod: product.interestRate.calculationMethod,
      };

      const validation = VietnameseFinancialValidator.validateAndSanitize(params, product);

      expect(validation.isValid).toBe(true);
    });

    test("should reject amount below product minimum", () => {
      const product = vietnameseLoanProducts[0];
      const params: LoanCalculationParams = {
        principal: product.amountLimits.min - 1,
        term: product.termOptions.min,
        annualRate: product.interestRate.annual,
        rateType: product.interestRate.type,
        calculationMethod: product.interestRate.calculationMethod,
      };

      const validation = VietnameseFinancialValidator.validateAndSanitize(params, product);

      expect(validation.isValid).toBe(false);
      expect(validation.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            field: "principal",
            severity: "error",
            code: "BELOW_MIN_AMOUNT",
          })
        ])
      );
    });

    test("should reject amount above product maximum", () => {
      const product = vietnameseLoanProducts[0];
      const params: LoanCalculationParams = {
        principal: product.amountLimits.max + 1,
        term: product.termOptions.min,
        annualRate: product.interestRate.annual,
        rateType: product.interestRate.type,
        calculationMethod: product.interestRate.calculationMethod,
      };

      const validation = VietnameseFinancialValidator.validateAndSanitize(params, product);

      expect(validation.isValid).toBe(false);
      expect(validation.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            field: "principal",
            severity: "error",
            code: "ABOVE_MAX_AMOUNT",
          })
        ])
      );
    });

    test("should reject term below product minimum", () => {
      const product = vietnameseLoanProducts[0];
      const params: LoanCalculationParams = {
        principal: product.amountLimits.min,
        term: product.termOptions.min - 1,
        annualRate: product.interestRate.annual,
        rateType: product.interestRate.type,
        calculationMethod: product.interestRate.calculationMethod,
      };

      const validation = VietnameseFinancialValidator.validateAndSanitize(params, product);

      expect(validation.isValid).toBe(false);
      expect(validation.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            field: "term",
            severity: "error",
            code: "BELOW_MIN_TERM",
          })
        ])
      );
    });

    test("should reject rate type mismatch", () => {
      const product = vietnameseLoanProducts[0];
      const wrongRateType = product.interestRate.type === "reducing" ? "flat" : "reducing";

      const params: LoanCalculationParams = {
        principal: product.amountLimits.min,
        term: product.termOptions.min,
        annualRate: product.interestRate.annual,
        rateType: wrongRateType,
        calculationMethod: product.interestRate.calculationMethod,
      };

      const validation = VietnameseFinancialValidator.validateAndSanitize(params, product);

      expect(validation.isValid).toBe(false);
      expect(validation.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            field: "rateType",
            severity: "error",
            code: "RATE_TYPE_MISMATCH",
          })
        ])
      );
    });
  });

  describe("Vietnamese Banking Limits", () => {
    test("should warn about rates exceeding SBV guidelines", () => {
      const params: LoanCalculationParams = {
        principal: 1000000000,
        term: 24,
        annualRate: 25, // Exceeds typical consumer loan guideline
        rateType: "reducing",
        calculationMethod: "monthly",
      };

      const validation = VietnameseFinancialValidator.validateAndSanitize(params);

      expect(validation.hasWarnings).toBe(true);
      expect(validation.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            field: "estimatedAPR",
            severity: "warning",
            code: "HIGH_APR",
          })
        ])
      );
    });

    test("should flag very high APR", () => {
      const params: LoanCalculationParams = {
        principal: 1000000000,
        term: 12,
        annualRate: 20,
        processingFee: 10,
        insuranceFee: 10, // Very high total APR
        rateType: "reducing",
        calculationMethod: "monthly",
      };

      const validation = VietnameseFinancialValidator.validateAndSanitize(params);

      expect(validation.hasWarnings).toBe(true);
      expect(validation.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            field: "estimatedAPR",
            severity: "warning",
            code: "HIGH_APR",
          })
        ])
      );
    });
  });

  describe("Product Validation", () => {
    test("should validate complete loan products", () => {
      for (const product of vietnameseLoanProducts) {
        const validation = VietnameseFinancialValidator.validateLoanProduct(product);

        expect(validation.isValid).toBe(true);
        expect(validation.errors.filter(e => e.severity === "error")).toHaveLength(0);
      }
    });

    test("should reject products without required fields", () => {
      const incompleteProduct = {
        ...vietnameseLoanProducts[0],
        id: "", // Missing ID
        nameVi: "", // Missing Vietnamese name
      };

      const validation = VietnameseFinancialValidator.validateLoanProduct(incompleteProduct);

      expect(validation.isValid).toBe(false);
      expect(validation.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            field: "id",
            severity: "error",
            code: "REQUIRED_FIELD",
          }),
          expect.objectContaining({
            field: "nameVi",
            severity: "error",
            code: "REQUIRED_FIELD",
          }),
        ])
      );
    });

    test("should validate amount limits", () => {
      const productWithBadLimits = {
        ...vietnameseLoanProducts[0],
        amountLimits: {
          min: 1000000000,
          max: 500000000, // Max < Min
          default: 2000000000,
          step: 100000000,
        },
      };

      const validation = VietnameseFinancialValidator.validateLoanProduct(productWithBadLimits);

      expect(validation.isValid).toBe(false);
      expect(validation.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            field: "amountLimits",
            severity: "error",
            code: "INVALID_AMOUNT_RANGE",
          })
        ])
      );
    });

    test("should validate term options", () => {
      const productWithBadTerms = {
        ...vietnameseLoanProducts[0],
        termOptions: {
          min: 24,
          max: 12, // Max < Min
          availableTerms: [6, 12, 24],
          default: 12,
        },
      };

      const validation = VietnameseFinancialValidator.validateLoanProduct(productWithBadTerms);

      expect(validation.isValid).toBe(false);
      expect(validation.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            field: "termOptions",
            severity: "error",
            code: "INVALID_TERM_RANGE",
          })
        ])
      );
    });

    test("should validate interest rates", () => {
      const productWithBadRate = {
        ...vietnameseLoanProducts[0],
        interestRate: {
          ...vietnameseLoanProducts[0].interestRate,
          annual: -5, // Negative rate
        },
      };

      const validation = VietnameseFinancialValidator.validateLoanProduct(productWithBadRate);

      expect(validation.isValid).toBe(false);
      expect(validation.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            field: "interestRate.annual",
            severity: "error",
            code: "INVALID_ANNUAL_RATE",
          })
        ])
      );
    });

    test("should validate SBV compliance", () => {
      const productWithoutSBV = {
        ...vietnameseLoanProducts[0],
        regulatoryCompliance: {
          ...vietnameseLoanProducts[0].regulatoryCompliance,
          sbvRegistrationNumber: undefined,
        },
      };

      const validation = VietnameseFinancialValidator.validateLoanProduct(productWithoutSBV);

      expect(validation.isValid).toBe(false);
      expect(validation.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            field: "regulatoryCompliance.sbvRegistrationNumber",
            severity: "error",
            code: "MISSING_SBV_REGISTRATION",
          })
        ])
      );
    });
  });

  describe("Grace Period Validation", () => {
    test("should validate reasonable grace periods", () => {
      const params: LoanCalculationParams = {
        principal: 1000000000,
        term: 24,
        annualRate: 12,
        gracePeriod: 3, // 3 months grace period
        rateType: "reducing",
        calculationMethod: "monthly",
      };

      const validation = VietnameseFinancialValidator.validateAndSanitize(params);

      expect(validation.isValid).toBe(true);
    });

    test("should reject grace period >= loan term", () => {
      const params: LoanCalculationParams = {
        principal: 1000000000,
        term: 12,
        annualRate: 12,
        gracePeriod: 12, // Equal to loan term
        rateType: "reducing",
        calculationMethod: "monthly",
      };

      const validation = VietnameseFinancialValidator.validateAndSanitize(params);

      expect(validation.isValid).toBe(false);
      expect(validation.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            field: "gracePeriod",
            severity: "error",
            code: "INVALID_GRACE_PERIOD",
          })
        ])
      );
    });

    test("should provide info about grace periods with flat rate", () => {
      const params: LoanCalculationParams = {
        principal: 1000000000,
        term: 24,
        annualRate: 12,
        gracePeriod: 3,
        rateType: "flat",
        calculationMethod: "monthly",
      };

      const validation = VietnameseFinancialValidator.validateAndSanitize(params);

      expect(validation.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            field: "gracePeriod",
            severity: "info",
            code: "GRACE_PERIOD_INFO",
          })
        ])
      );
    });
  });
});