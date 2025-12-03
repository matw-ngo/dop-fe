// Vietnamese Banking Compliance Tests
// Comprehensive test suite for SBV regulations and Vietnamese compliance

import { VietnameseComplianceEngine, INTEREST_RATE_CAPS } from "../vietnamese-compliance";
import { vietnameseLoanProducts } from "../vietnamese-loan-products";
import VietnameseFinancialAuditLogger from "../audit-logging";

describe("Vietnamese Banking Compliance", () => {
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

  describe("Interest Rate Caps", () => {
    test("should enforce consumer loan interest rate cap", () => {
      const consumerLoan = vietnameseLoanProducts.find(p => p.loanType === "consumer_loan");
      expect(consumerLoan).toBeDefined();

      const compliance = VietnameseComplianceEngine.checkProductCompliance(consumerLoan!);

      const rateCapCheck = compliance.failedChecks.find(c => c.name === "Interest Rate Cap");
      expect(rateCapCheck).toBeUndefined(); // Should pass
    });

    test("should validate interest rate caps by loan type", () => {
      expect(INTEREST_RATE_CAPS.consumer_loan.maximumAnnualRate).toBe(20.0);
      expect(INTEREST_RATE_CAPS.home_loan.maximumAnnualRate).toBe(15.0);
      expect(INTEREST_RATE_CAPS.student_loan.maximumAnnualRate).toBe(8.0);
      expect(INTEREST_RATE_CAPS.credit_card.maximumAnnualRate).toBe(36.0);
    });

    test("should flag excessive interest rates", () => {
      // Create a product with excessive rate
      const highRateProduct = {
        ...vietnameseLoanProducts[0],
        interestRate: {
          ...vietnameseLoanProducts[0].interestRate,
          annual: 25, // Excessive rate
        },
      };

      const compliance = VietnameseComplianceEngine.checkProductCompliance(highRateProduct);

      const rateCapCheck = compliance.failedChecks.find(c => c.name === "Interest Rate Cap");
      expect(rateCapCheck).toBeDefined();
      expect(rateCapCheck!.severity).toBe("critical");
      expect(rateCapCheck!.passed).toBe(false);
    });
  });

  describe("SBV Registration Requirements", () => {
    test("should validate SBV registration numbers", () => {
      for (const product of vietnameseLoanProducts) {
        const compliance = VietnameseComplianceEngine.checkProductCompliance(product);

        const registrationCheck = compliance.failedChecks.find(c => c.name === "SBV Registration");
        expect(registrationCheck).toBeUndefined(); // All products should have registration
      }
    });

    test("should flag missing SBV registration", () => {
      const productWithoutRegistration = {
        ...vietnameseLoanProducts[0],
        regulatoryCompliance: {
          ...vietnameseLoanProducts[0].regulatoryCompliance,
          sbvRegistrationNumber: undefined,
        },
      };

      const compliance = VietnameseComplianceEngine.checkProductCompliance(productWithoutRegistration);

      const registrationCheck = compliance.failedChecks.find(c => c.name === "SBV Registration");
      expect(registrationCheck).toBeDefined();
      expect(registrationCheck!.severity).toBe("critical");
    });
  });

  describe("Disclosure Requirements", () => {
    test("should validate disclosure compliance", () => {
      for (const product of vietnameseLoanProducts) {
        const compliance = VietnameseComplianceEngine.checkProductCompliance(product);

        const disclosureCheck = compliance.failedChecks.find(c => c.name === "Disclosure Requirements");
        expect(disclosureCheck).toBeUndefined(); // All products should meet disclosure requirements
      }
    });

    test("should flag missing disclosure requirements", () => {
      const productWithoutDisclosure = {
        ...vietnameseLoanProducts[0],
        regulatoryCompliance: {
          ...vietnameseLoanProducts[0].regulatoryCompliance,
          disclosureRequirementsMet: false,
        },
      };

      const compliance = VietnameseComplianceEngine.checkProductCompliance(productWithoutDisclosure);

      const disclosureCheck = compliance.failedChecks.find(c => c.name === "Disclosure Requirements");
      expect(disclosureCheck).toBeDefined();
      expect(disclosureCheck!.severity).toBe("major");
    });
  });

  describe("Consumer Protection", () => {
    test("should validate consumer protection compliance", () => {
      for (const product of vietnameseLoanProducts) {
        const compliance = VietnameseComplianceEngine.checkProductCompliance(product);

        const consumerProtectionCheck = compliance.failedChecks.find(c => c.name === "Consumer Protection");
        expect(consumerProtectionCheck).toBeUndefined(); // All products should comply
      }
    });

    test("should flag hidden fees", () => {
      const productWithHiddenFees = {
        ...vietnameseLoanProducts[0],
        fees: {
          ...vietnameseLoanProducts[0].fees,
          otherFees: [
            {
              name: "hidden_fee",
              nameVi: "Phí ẩn",
              amount: 5000000,
              type: "fixed" as const,
              mandatory: true,
            },
          ],
        },
      };

      const compliance = VietnameseComplianceEngine.checkProductCompliance(productWithHiddenFees);

      const consumerProtectionCheck = compliance.failedChecks.find(c => c.name === "Consumer Protection");
      expect(consumerProtectionCheck).toBeDefined();
    });
  });

  describe("Risk Management", () => {
    test("should validate risk management controls", () => {
      for (const product of vietnameseLoanProducts) {
        const compliance = VietnameseComplianceEngine.checkProductCompliance(product);

        const riskManagementCheck = compliance.failedChecks.find(c => c.name === "Risk Management");
        expect(riskManagementCheck).toBeUndefined(); // All products should have risk controls
      }
    });

    test("should flag missing credit score requirements", () => {
      const productWithoutCreditScore = {
        ...vietnameseLoanProducts[0],
        eligibility: {
          ...vietnameseLoanProducts[0].eligibility,
          minCreditScore: undefined,
        },
      };

      const compliance = VietnameseComplianceEngine.checkProductCompliance(productWithoutCreditScore);

      const riskManagementCheck = compliance.failedChecks.find(c => c.name === "Risk Management");
      expect(riskManagementCheck).toBeDefined();
    });
  });

  describe("Eligibility Requirements", () => {
    test("should validate eligibility criteria", () => {
      for (const product of vietnameseLoanProducts) {
        const compliance = VietnameseComplianceEngine.checkProductCompliance(product);

        const eligibilityCheck = compliance.failedChecks.find(c => c.name === "Eligibility Requirements");
        expect(eligibilityCheck).toBeUndefined(); // All products should have proper eligibility
      }
    });

    test("should flag invalid age ranges", () => {
      const productWithInvalidAge = {
        ...vietnameseLoanProducts[0],
        eligibility: {
          ...vietnameseLoanProducts[0].eligibility,
          minAge: 25,
          maxAgeAtMaturity: 20, // Invalid: max < min
        },
      };

      const compliance = VietnameseComplianceEngine.checkProductCompliance(productWithInvalidAge);

      const eligibilityCheck = compliance.failedChecks.find(c => c.name === "Eligibility Requirements");
      expect(eligibilityCheck).toBeDefined();
      expect(eligibilityCheck!.severity).toBe("major");
    });
  });

  describe("Calculation Compliance", () => {
    test("should validate APR calculation accuracy", () => {
      const params = {
        principal: 1000000000,
        term: 24,
        annualRate: 12,
        rateType: "reducing" as const,
        calculationMethod: "monthly" as const,
      };

      const result = VietnameseComplianceEngine.validateCalculationCompliance(
        params,
        require("../interest-calculations").VietnameseLoanCalculator.calculateLoan(params),
        "consumer_loan"
      );

      const aprCheck = result.failedChecks.find(c => c.name === "APR Calculation");
      expect(aprCheck).toBeUndefined(); // Should pass APR validation
    });

    test("should flag excessive APR", () => {
      const params = {
        principal: 1000000000,
        term: 12,
        annualRate: 25,
        rateType: "reducing" as const,
        calculationMethod: "monthly" as const,
        processingFee: 10, // High fees
      };

      const result = VietnameseComplianceEngine.validateCalculationCompliance(
        params,
        require("../interest-calculations").VietnameseLoanCalculator.calculateLoan(params),
        "consumer_loan"
      );

      const aprCheck = result.failedChecks.find(c => c.name === "APR Calculation");
      expect(aprCheck?.severity).toBe("major");
    });
  });

  describe("Compliance Reporting", () => {
    test("should generate compliance reports", () => {
      const product = vietnameseLoanProducts[0];
      const productCompliance = VietnameseComplianceEngine.checkProductCompliance(product);

      const report = VietnameseComplianceEngine.generateComplianceReport(productCompliance);

      expect(report.report).toContain("VIETNAMESE BANKING COMPLIANCE REPORT");
      expect(report.reportVi).toContain("BÁO CÁO TUÂN THỦ LUẬT NGÂN HÀNG VIỆT NAM");
      expect(report.summary.overallCompliant).toBe(true);
      expect(report.summary.overallScore).toBeGreaterThan(80);
    });

    test("should include regulatory references in reports", () => {
      const product = vietnameseLoanProducts[0];
      const productCompliance = VietnameseComplianceEngine.checkProductCompliance(product);

      const report = VietnameseComplianceEngine.generateComplianceReport(productCompliance);

      expect(report.report).toContain("Circular 39/2016/TT-NHNN");
      expect(report.report).toContain("Consumer lending regulations");
      expect(report.reportVi).toContain("Thông tư 39/2016/TT-NHNN");
      expect(report.reportVi).toContain("Quy định cho vay tiêu dùng");
    });
  });

  describe("Audit Logging", () => {
    test("should log compliance checks", () => {
      const product = vietnameseLoanProducts[0];
      const complianceResult = VietnameseComplianceEngine.checkProductCompliance(product);

      auditLogger.logComplianceCheck(product, complianceResult, 100);

      const logs = auditLogger.getLogs({ calculationType: "compliance_check" });
      expect(logs).toHaveLength(1);
      expect(logs[0].calculationType).toBe("compliance_check");
      expect(logs[0].success).toBe(true);
      expect(logs[0].complianceStatus).toBe("compliant");
    });

    test("should track compliance statistics", () => {
      // Log multiple compliance checks
      for (let i = 0; i < 5; i++) {
        const product = vietnameseLoanProducts[i % vietnameseLoanProducts.length];
        const complianceResult = VietnameseComplianceEngine.checkProductCompliance(product);
        auditLogger.logComplianceCheck(product, complianceResult, 50);
      }

      const stats = auditLogger.getComplianceStats();
      expect(stats.totalCalculations).toBeGreaterThanOrEqual(5);
      expect(stats.compliantCalculations).toBeGreaterThanOrEqual(0);
      expect(stats.averageProcessingTime).toBeGreaterThan(0);
      expect(stats.errorRate).toBeGreaterThanOrEqual(0);
    });
  });

  describe("Regulatory References", () => {
    test("should include all required regulations", () => {
      const product = vietnameseLoanProducts[0];
      const compliance = VietnameseComplianceEngine.checkProductCompliance(product);

      expect(compliance.regulatoryReferences).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            regulation: "Circular 39/2016/TT-NHNN - Consumer lending regulations",
          }),
          expect.objectContaining({
            regulation: "Circular 22/2019/TT-NHNN - Risk management requirements",
          }),
          expect.objectContaining({
            regulation: "Decision 1621/2007 - Interest rate regulations",
          }),
        ])
      );
    });

    test("should provide Vietnamese descriptions", () => {
      const product = vietnameseLoanProducts[0];
      const compliance = VietnameseComplianceEngine.checkProductCompliance(product);

      compliance.regulatoryReferences.forEach(ref => {
        expect(ref.description).toBeDefined();
        expect(ref.descriptionVi).toBeDefined();
        expect(ref.descriptionVi).not.toBe(ref.description); // Should have different Vietnamese description
      });
    });
  });

  describe("Edge Cases", () => {
    test("should handle products with no promotional rates", () => {
      const productWithoutPromo = {
        ...vietnameseLoanProducts[0],
        interestRate: {
          ...vietnameseLoanProducts[0].interestRate,
          promotional: undefined,
        },
      };

      const compliance = VietnameseComplianceEngine.checkProductCompliance(productWithoutPromo);
      expect(compliance.compliant).toBe(true); // Should still be compliant without promotional rates
    });

    test("should handle products with no collateral requirement", () => {
      const unsecuredProduct = vietnameseLoanProducts.find(p => p.loanType === "consumer_loan");
      expect(unsecuredProduct).toBeDefined();
      expect(unsecuredProduct!.eligibility.collateralRequired).toBe(false);

      const compliance = VietnameseComplianceEngine.checkProductCompliance(unsecuredProduct!);
      expect(compliance.compliant).toBe(true); // Unsecured loans should still be compliant
    });
  });

  describe("Performance", () => {
    test("should handle compliance checks efficiently", () => {
      const startTime = Date.now();

      // Perform compliance checks on all products
      for (const product of vietnameseLoanProducts) {
        VietnameseComplianceEngine.checkProductCompliance(product);
      }

      const endTime = Date.now();
      const totalTime = endTime - startTime;

      // Should complete all checks in reasonable time (< 500ms)
      expect(totalTime).toBeLessThan(500);
    });

    test("should handle bulk compliance reporting", () => {
      const startTime = Date.now();

      const reports = vietnameseLoanProducts.map(product => {
        const compliance = VietnameseComplianceEngine.checkProductCompliance(product);
        return VietnameseComplianceEngine.generateComplianceReport(compliance);
      });

      const endTime = Date.now();
      const totalTime = endTime - startTime;

      expect(reports).toHaveLength(vietnameseLoanProducts.length);
      expect(totalTime).toBeLessThan(1000); // Should be fast even for bulk operations
    });
  });
});