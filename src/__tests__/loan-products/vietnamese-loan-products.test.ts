// Vietnamese Loan Products Tests
// Comprehensive tests for the Vietnamese loan products database and utilities

import {
  vietnameseLoanProducts,
  vietnameseBanks,
  getLoanProductsByType,
  getLoanProductsByBank,
  getFeaturedLoanProducts,
  searchLoanProducts,
  sortLoanProducts,
  getVietnameseLoanTypeName,
  getEnglishLoanTypeName,
} from "@/lib/loan-products/vietnamese-loan-products";
import type { VietnameseLoanProduct, VietnameseLoanType } from "@/lib/loan-products/vietnamese-loan-products";

describe("Vietnamese Loan Products", () => {
  describe(" vietnameseBanks", () => {
    it("should contain all major Vietnamese banks", () => {
      expect(vietnameseBanks).toHaveLength(10);

      const bankCodes = vietnameseBanks.map(bank => bank.code);
      expect(bankCodes).toContain("VCB"); // Vietcombank
      expect(bankCodes).toContain("CTG"); // VietinBank
      expect(bankCodes).toContain("BIDV");
      expect(bankCodes).toContain("AGR"); // Agribank
      expect(bankCodes).toContain("TCB"); // Techcombank
    });

    it("should have required bank properties", () => {
      vietnameseBanks.forEach(bank => {
        expect(bank).toHaveProperty("code");
        expect(bank).toHaveProperty("nameVi");
        expect(bank).toHaveProperty("nameEn");
        expect(bank).toHaveProperty("type");
        expect(bank).toHaveProperty("establishedYear");

        expect(typeof bank.code).toBe("string");
        expect(typeof bank.nameVi).toBe("string");
        expect(typeof bank.nameEn).toBe("string");
        expect(typeof bank.type).toBe("string");
        expect(typeof bank.establishedYear).toBe("number");
      });
    });
  });

  describe("vietnameseLoanProducts", () => {
    it("should contain loan products", () => {
      expect(vietnameseLoanProducts.length).toBeGreaterThan(0);
    });

    it("should have required product properties", () => {
      vietnameseLoanProducts.forEach(product => {
        expect(product).toHaveProperty("id");
        expect(product).toHaveProperty("nameVi");
        expect(product).toHaveProperty("nameEn");
        expect(product).toHaveProperty("descriptionVi");
        expect(product).toHaveProperty("descriptionEn");
        expect(product).toHaveProperty("bank");
        expect(product).toHaveProperty("loanType");
        expect(product).toHaveProperty("active");
        expect(product).toHaveProperty("amountLimits");
        expect(product).toHaveProperty("termOptions");
        expect(product).toHaveProperty("interestRate");
        expect(product).toHaveProperty("fees");
        expect(product).toHaveProperty("eligibility");
        expect(product).toHaveProperty("features");
        expect(product).toHaveProperty("applicationRequirements");
        expect(product).toHaveProperty("regulatoryCompliance");
        expect(product).toHaveProperty("metadata");

        // Check nested properties
        expect(product.amountLimits).toHaveProperty("min");
        expect(product.amountLimits).toHaveProperty("max");
        expect(product.amountLimits).toHaveProperty("default");
        expect(product.amountLimits).toHaveProperty("step");

        expect(product.termOptions).toHaveProperty("min");
        expect(product.termOptions).toHaveProperty("max");
        expect(product.termOptions).toHaveProperty("availableTerms");
        expect(product.termOptions).toHaveProperty("default");

        expect(product.interestRate).toHaveProperty("annual");
        expect(product.interestRate).toHaveProperty("type");

        expect(product.eligibility).toHaveProperty("minAge");
        expect(product.eligibility).toHaveProperty("maxAgeAtMaturity");
        expect(product.eligibility).toHaveProperty("minMonthlyIncome");
        expect(product.eligibility).toHaveProperty("requiredDocuments");
      });
    });

    it("should have valid bank references", () => {
      vietnameseLoanProducts.forEach(product => {
        const bank = vietnameseBanks.find(b => b.code === product.bank.code);
        expect(bank).toBeDefined();
        expect(product.bank.nameVi).toBe(bank?.nameVi);
        expect(product.bank.nameEn).toBe(bank?.nameEn);
      });
    });

    it("should have valid amount limits", () => {
      vietnameseLoanProducts.forEach(product => {
        const { amountLimits } = product;
        expect(amountLimits.min).toBeGreaterThan(0);
        expect(amountLimits.max).toBeGreaterThan(amountLimits.min);
        expect(amountLimits.default).toBeGreaterThanOrEqual(amountLimits.min);
        expect(amountLimits.default).toBeLessThanOrEqual(amountLimits.max);
        expect(amountLimits.step).toBeGreaterThan(0);
      });
    });

    it("should have valid term options", () => {
      vietnameseLoanProducts.forEach(product => {
        const { termOptions } = product;
        expect(termOptions.min).toBeGreaterThan(0);
        expect(termOptions.max).toBeGreaterThan(termOptions.min);
        expect(termOptions.default).toBeGreaterThanOrEqual(termOptions.min);
        expect(termOptions.default).toBeLessThanOrEqual(termOptions.max);
        expect(termOptions.availableTerms.length).toBeGreaterThan(0);

        // Check that available terms are within min and max
        termOptions.availableTerms.forEach(term => {
          expect(term).toBeGreaterThanOrEqual(termOptions.min);
          expect(term).toBeLessThanOrEqual(termOptions.max);
        });
      });
    });

    it("should have valid interest rates", () => {
      vietnameseLoanProducts.forEach(product => {
        const { interestRate } = product;
        expect(interestRate.annual).toBeGreaterThan(0);
        expect(interestRate.annual).toBeLessThan(100); // Should be less than 100%
        expect(["fixed", "reducing", "flat", "floating"]).toContain(interestRate.type);
        expect(["daily", "monthly"]).toContain(interestRate.calculationMethod);

        if (interestRate.promotional) {
          expect(interestRate.promotional.rate).toBeGreaterThan(0);
          expect(interestRate.promotional.rate).toBeLessThan(interestRate.annual);
          expect(interestRate.promotional.duration).toBeGreaterThan(0);
        }
      });
    });

    it("should have valid eligibility criteria", () => {
      vietnameseLoanProducts.forEach(product => {
        const { eligibility } = product;
        expect(eligibility.minAge).toBeGreaterThan(0);
        expect(eligibility.minAge).toBeLessThan(eligibility.maxAgeAtMaturity);
        expect(eligibility.minMonthlyIncome).toBeGreaterThan(0);
        expect(Array.isArray(eligibility.requiredDocuments)).toBe(true);
        expect(eligibility.requiredDocuments.length).toBeGreaterThan(0);

        eligibility.requiredDocuments.forEach(doc => {
          expect(doc).toHaveProperty("type");
          expect(doc).toHaveProperty("typeVi");
          expect(doc).toHaveProperty("mandatory");
          expect(typeof doc.mandatory).toBe("boolean");
        });
      });
    });
  });

  describe("getLoanProductsByType", () => {
    it("should filter products by loan type", () => {
      const homeLoans = getLoanProductsByType("home_loan");
      expect(homeLoans.length).toBeGreaterThan(0);

      homeLoans.forEach(product => {
        expect(product.loanType).toBe("home_loan");
        expect(product.active).toBe(true);
      });
    });

    it("should return empty array for non-existent loan type", () => {
      const result = getLoanProductsByType("non_existent" as VietnameseLoanType);
      expect(result).toHaveLength(0);
    });

    it("should handle all loan types", () => {
      const loanTypes: VietnameseLoanType[] = [
        "home_loan",
        "auto_loan",
        "consumer_loan",
        "business_loan",
        "student_loan",
        "refinancing",
        "credit_card",
        "mortgage_loan",
      ];

      loanTypes.forEach(loanType => {
        const products = getLoanProductsByType(loanType);
        expect(Array.isArray(products)).toBe(true);
        products.forEach(product => {
          expect(product.loanType).toBe(loanType);
        });
      });
    });
  });

  describe("getLoanProductsByBank", () => {
    it("should filter products by bank code", () => {
      const vietcombankProducts = getLoanProductsByBank("VCB");
      expect(vietcombankProducts.length).toBeGreaterThan(0);

      vietcombankProducts.forEach(product => {
        expect(product.bank.code).toBe("VCB");
        expect(product.active).toBe(true);
      });
    });

    it("should return empty array for non-existent bank", () => {
      const result = getLoanProductsByBank("NON_EXISTENT");
      expect(result).toHaveLength(0);
    });

    it("should work for all banks", () => {
      vietnameseBanks.forEach(bank => {
        const products = getLoanProductsByBank(bank.code);
        expect(Array.isArray(products)).toBe(true);
        products.forEach(product => {
          expect(product.bank.code).toBe(bank.code);
        });
      });
    });
  });

  describe("getFeaturedLoanProducts", () => {
    it("should return only featured products", () => {
      const featuredProducts = getFeaturedLoanProducts();
      expect(featuredProducts.length).toBeGreaterThan(0);

      featuredProducts.forEach(product => {
        expect(product.metadata.featured).toBe(true);
        expect(product.active).toBe(true);
      });
    });

    it("should filter by loan type if specified", () => {
      const featuredHomeLoans = getFeaturedLoanProducts("home_loan");
      expect(Array.isArray(featuredHomeLoans)).toBe(true);

      featuredHomeLoans.forEach(product => {
        expect(product.metadata.featured).toBe(true);
        expect(product.loanType).toBe("home_loan");
      });
    });
  });

  describe("searchLoanProducts", () => {
    it("should search products by keywords", () => {
      const results = searchLoanProducts("vay mua nhà");
      expect(results.length).toBeGreaterThan(0);

      results.forEach(product => {
        const searchTerm = "vay mua nhà";
        const matchesKeyword =
          product.nameVi.toLowerCase().includes(searchTerm) ||
          product.nameEn.toLowerCase().includes(searchTerm) ||
          product.descriptionVi.toLowerCase().includes(searchTerm) ||
          product.descriptionEn.toLowerCase().includes(searchTerm);
        expect(matchesKeyword).toBe(true);
      });
    });

    it("should search by bank name", () => {
      const results = searchLoanProducts("Vietcombank");
      expect(results.length).toBeGreaterThan(0);

      results.forEach(product => {
        expect(product.bank.nameVi.toLowerCase()).toContain("vietcombank") ||
               product.bank.nameEn.toLowerCase().toContain("vietcombank") ||
               product.bank.code.toLowerCase().toContain("vcb")).toBe(true);
      });
    });

    it("should return empty results for non-matching search", () => {
      const results = searchLoanProducts("non_existent_search_term_xyz");
      expect(results).toHaveLength(0);
    });

    it("should be case insensitive", () => {
      const results1 = searchLoanProducts("VAY MUA NHÀ");
      const results2 = searchLoanProducts("vay mua nhà");
      expect(results1.length).toBe(results2.length);
    });
  });

  describe("sortLoanProducts", () => {
    const testProducts = vietnameseLoanProducts.slice(0, 3); // Use first 3 products for testing

    it("should sort by popularity", () => {
      const sorted = sortLoanProducts(testProducts, "popularity");
      expect(sorted[0].metadata.popularityScore).toBeGreaterThanOrEqual(sorted[1].metadata.popularityScore);
      expect(sorted[1].metadata.popularityScore).toBeGreaterThanOrEqual(sorted[2].metadata.popularityScore);
    });

    it("should sort by interest rate", () => {
      const sorted = sortLoanProducts(testProducts, "interest_rate");
      expect(sorted[0].interestRate.annual).toBeLessThanOrEqual(sorted[1].interestRate.annual);
      expect(sorted[1].interestRate.annual).toBeLessThanOrEqual(sorted[2].interestRate.annual);
    });

    it("should sort by processing time", () => {
      const sorted = sortLoanProducts(testProducts, "processing_time");
      expect(sorted[0].applicationRequirements.processingTime.min)
        .toBeLessThanOrEqual(sorted[1].applicationRequirements.processingTime.min);
      expect(sorted[1].applicationRequirements.processingTime.min)
        .toBeLessThanOrEqual(sorted[2].applicationRequirements.processingTime.min);
    });

    it("should sort by max amount", () => {
      const sorted = sortLoanProducts(testProducts, "max_amount");
      expect(sorted[0].amountLimits.max).toBeGreaterThanOrEqual(sorted[1].amountLimits.max);
      expect(sorted[1].amountLimits.max).toBeGreaterThanOrEqual(sorted[2].amountLimits.max);
    });

    it("should sort by rating", () => {
      // Add mock ratings for testing
      const productsWithRatings = testProducts.map((product, index) => ({
        ...product,
        metadata: {
          ...product.metadata,
          averageRating: 5 - index, // 5, 4, 3
        },
      }));

      const sorted = sortLoanProducts(productsWithRatings, "rating");
      expect(sorted[0].metadata.averageRating).toBeGreaterThanOrEqual(sorted[1].metadata.averageRating);
      expect(sorted[1].metadata.averageRating).toBeGreaterThanOrEqual(sorted[2].metadata.averageRating);
    });
  });

  describe("getVietnameseLoanTypeName", () => {
    it("should return Vietnamese names for all loan types", () => {
      expect(getVietnameseLoanTypeName("home_loan")).toBe("Vay mua nhà");
      expect(getVietnameseLoanTypeName("auto_loan")).toBe("Vay mua xe");
      expect(getVietnameseLoanTypeName("consumer_loan")).toBe("Vay tiêu dùng");
      expect(getVietnameseLoanTypeName("business_loan")).toBe("Vay kinh doanh");
      expect(getVietnameseLoanTypeName("student_loan")).toBe("Vay sinh viên");
      expect(getVietnameseLoanTypeName("refinancing")).toBe("Vay tái cấp vốn");
      expect(getVietnameseLoanTypeName("credit_card")).toBe("Vay thẻ tín dụng");
      expect(getVietnameseLoanTypeName("mortgage_loan")).toBe("Vay thế chấp");
    });

    it("should return original type for unknown types", () => {
      expect(getVietnameseLoanTypeName("unknown" as VietnameseLoanType)).toBe("unknown");
    });
  });

  describe("getEnglishLoanTypeName", () => {
    it("should return English names for all loan types", () => {
      expect(getEnglishLoanTypeName("home_loan")).toBe("Home Loan");
      expect(getEnglishLoanTypeName("auto_loan")).toBe("Auto Loan");
      expect(getEnglishLoanTypeName("consumer_loan")).toBe("Consumer Loan");
      expect(getEnglishLoanTypeName("business_loan")).toBe("Business Loan");
      expect(getEnglishLoanTypeName("student_loan")).toBe("Student Loan");
      expect(getEnglishLoanTypeName("refinancing")).toBe("Refinancing");
      expect(getEnglishLoanTypeName("credit_card")).toBe("Credit Card Loan");
      expect(getEnglishLoanTypeName("mortgage_loan")).toBe("Mortgage Loan");
    });

    it("should return original type for unknown types", () => {
      expect(getEnglishLoanTypeName("unknown" as VietnameseLoanType)).toBe("unknown");
    });
  });

  describe("data consistency", () => {
    it("should have consistent bank data across products", () => {
      const bankProductsMap = new Map<string, VietnameseLoanProduct[]>();

      vietnameseLoanProducts.forEach(product => {
        if (!bankProductsMap.has(product.bank.code)) {
          bankProductsMap.set(product.bank.code, []);
        }
        bankProductsMap.get(product.bank.code)!.push(product);
      });

      bankProductsMap.forEach((products, bankCode) => {
        const bank = vietnameseBanks.find(b => b.code === bankCode);
        expect(bank).toBeDefined();

        products.forEach(product => {
          expect(product.bank.nameVi).toBe(bank!.nameVi);
          expect(product.bank.nameEn).toBe(bank!.nameEn);
          expect(product.bank.type).toBe(bank!.type);
        });
      });
    });

    it("should have valid Vietnamese characters in Vietnamese fields", () => {
      vietnameseLoanProducts.forEach(product => {
        // Check for Vietnamese characters in name and description
        expect(product.nameVi).toMatch(/[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđĐ]/);

        if (product.descriptionVi) {
          expect(product.descriptionVi).toMatch(/[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđĐ]/);
        }

        // Check required documents
        product.eligibility.requiredDocuments.forEach(doc => {
          expect(doc.typeVi).toMatch(/[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđĐ]/);
        });
      });
    });
  });
});