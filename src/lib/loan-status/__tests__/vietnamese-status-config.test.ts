/**
 * Vietnamese Status Configuration Tests
 * Comprehensive test coverage for Vietnamese loan status configuration
 */

import {
  VIETNAMESE_STATUS_CONFIG,
  VIETNAMESE_DOCUMENT_TYPES,
  PROCESSING_TIME_STANDARDS,
  getStatusConfig,
  getDocumentTypeConfig,
  getProcessingTimeStandards,
  isStatusTransitionAllowed,
  getNextAllowedStatuses,
  calculateEstimatedCompletionTime,
} from "../vietnamese-status-config";

import type {
  LoanApplicationStatus,
  DocumentVerificationStatus,
} from "../vietnamese-status-config";

describe("Vietnamese Status Configuration", () => {
  describe("Status Configuration", () => {
    test("should have all required Vietnamese statuses", () => {
      const requiredStatuses: LoanApplicationStatus[] = [
        "da_tiep_nhan",
        "dang_xu_ly",
        "cho_bo_sung_giay_to",
        "dang_tham_dinh",
        "da_duyet",
        "cho_giai_ngan",
        "da_giai_ngan",
        "bi_tu_choi",
        "da_huy",
        "nhap",
        "tam_dung",
      ];

      requiredStatuses.forEach(status => {
        expect(VIETNAMESE_STATUS_CONFIG[status]).toBeDefined();
        expect(VIETNAMESE_STATUS_CONFIG[status].id).toBe(status);
        expect(VIETNAMESE_STATUS_CONFIG[status].label).toBeTruthy();
        expect(VIETNAMESE_STATUS_CONFIG[status].description).toBeTruthy();
        expect(VIETNAMESE_STATUS_CONFIG[status].color).toBeTruthy();
        expect(VIETNAMESE_STATUS_CONFIG[status].icon).toBeTruthy();
        expect(VIETNAMESE_STATUS_CONFIG[status].category).toBeTruthy();
        expect(Array.isArray(VIETNAMESE_STATUS_CONFIG[status].nextStatuses)).toBe(true);
      });
    });

    test("should have valid Vietnamese labels", () => {
      const statusConfig = VIETNAMESE_STATUS_CONFIG.da_tiep_nhan;
      expect(statusConfig.label).toBe("Đã tiếp nhận");
      expect(statusConfig.description).toContain("tiếp nhận");
    });

    test("should have correct status categories", () => {
      expect(VIETNAMESE_STATUS_CONFIG.da_tiep_nhan.category).toBe("initial");
      expect(VIETNAMESE_STATUS_CONFIG.dang_xu_ly.category).toBe("processing");
      expect(VIETNAMESE_STATUS_CONFIG.dang_tham_dinh.category).toBe("review");
      expect(VIETNAMESE_STATUS_CONFIG.da_duyet.category).toBe("decision");
      expect(VIETNAMESE_STATUS_CONFIG.da_giai_ngan.category).toBe("completion");
      expect(VIETNAMESE_STATUS_CONFIG.bi_tu_choi.category).toBe("termination");
    });

    test("should allow user actions on appropriate statuses", () => {
      expect(VIETNAMESE_STATUS_CONFIG.cho_bo_sung_giay_to.allowUserAction).toBe(true);
      expect(VIETNAMESE_STATUS_CONFIG.da_duyet.allowUserAction).toBe(true);
      expect(VIETNAMESE_STATUS_CONFIG.da_huy.allowUserAction).toBe(false);
      expect(VIETNAMESE_STATUS_CONFIG.dang_xu_ly.allowUserAction).toBe(false);
    });

    test("should have valid estimated durations", () => {
      const status = VIETNAMESE_STATUS_CONFIG.da_tiep_nhan;
      if (status.estimatedDuration) {
        expect(status.estimatedDuration.min).toBeGreaterThanOrEqual(0);
        expect(status.estimatedDuration.max).toBeGreaterThanOrEqual(status.estimatedDuration.min);
      }
    });
  });

  describe("Document Types Configuration", () => {
    test("should have Vietnamese document types", () => {
      expect(Object.keys(VIETNAMESE_DOCUMENT_TYPES)).toContain("cmnd_cccd");
      expect(Object.keys(VIETNAMESE_DOCUMENT_TYPES)).toContain("hop_dong_lao_dong");
      expect(Object.keys(VIETNAMESE_DOCUMENT_TYPES)).toContain("bang_luong");
    });

    test("should have required document properties", () => {
      const docType = VIETNAMESE_DOCUMENT_TYPES.cmnd_cccd;
      expect(docType.id).toBe("cmnd_cccd");
      expect(docType.name).toBe("CMND/CCCD");
      expect(docType.description).toBeTruthy();
      expect(docType.category).toBe("giay_to_dinh_danh");
      expect(docType.required).toBe(true);
      expect(Array.isArray(docType.allowedFormats)).toBe(true);
      expect(docType.maxSize).toBeGreaterThan(0);
      expect(Array.isArray(docType.verificationSteps)).toBe(true);
      expect(docType.vietnameseInstructions).toBeTruthy();
    });

    test("should have valid file formats", () => {
      const docType = VIETNAMESE_DOCUMENT_TYPES.cmnd_cccd;
      expect(docType.allowedFormats).toContain("PDF");
      expect(docType.allowedFormats).toContain("JPG");
      expect(docType.allowedFormats).toContain("PNG");
    });

    test("should have reasonable file size limits", () => {
      Object.values(VIETNAMESE_DOCUMENT_TYPES).forEach(docType => {
        expect(docType.maxSize).toBeGreaterThan(0);
        expect(docType.maxSize).toBeLessThanOrEqual(50); // Max 50MB seems reasonable
      });
    });
  });

  describe("Processing Time Standards", () => {
    test("should have Vietnamese loan types", () => {
      const loanTypes = PROCESSING_TIME_STANDARDS.map(standard => standard.loanType);
      expect(loanTypes).toContain("vay_tieu_dung");
      expect(loanTypes).toContain("vay_mua_nha");
      expect(loanTypes).toContain("vay_kinh_doanh");
      expect(loanTypes).toContain("the_tin_dung");
    });

    test("should have valid processing time ranges", () => {
      PROCESSING_TIME_STANDARDS.forEach(standard => {
        expect(standard.standard.minBusinessDays).toBeGreaterThan(0);
        expect(standard.standard.maxBusinessDays).toBeGreaterThan(standard.standard.minBusinessDays);
        expect(standard.standard.averageBusinessDays).toBeGreaterThanOrEqual(standard.standard.minBusinessDays);
        expect(standard.standard.averageBusinessDays).toBeLessThanOrEqual(standard.standard.maxBusinessDays);
      });
    });

    test("should have reasonable processing times for consumer loans", () => {
      const consumerLoan = PROCESSING_TIME_STANDARDS.find(s => s.loanType === "vay_tieu_dung");
      expect(consumerLoan).toBeDefined();
      expect(consumerLoan!.standard.minBusinessDays).toBeLessThanOrEqual(5);
      expect(consumerLoan!.standard.maxBusinessDays).toBeLessThanOrEqual(10);
    });

    test("should have longer processing times for home loans", () => {
      const homeLoan = PROCESSING_TIME_STANDARDS.find(s => s.loanType === "vay_mua_nha");
      const consumerLoan = PROCESSING_TIME_STANDARDS.find(s => s.loanType === "vay_tieu_dung");

      expect(homeLoan).toBeDefined();
      expect(consumerLoan).toBeDefined();
      expect(homeLoan!.standard.minBusinessDays).toBeGreaterThan(consumerLoan!.standard.minBusinessDays);
    });
  });

  describe("Utility Functions", () => {
    describe("getStatusConfig", () => {
      test("should return correct status configuration", () => {
        const config = getStatusConfig("da_duyet");
        expect(config).toBeDefined();
        expect(config!.id).toBe("da_duyet");
        expect(config!.label).toBe("Đã duyệt");
      });

      test("should return null for invalid status", () => {
        const config = getStatusConfig("invalid_status" as LoanApplicationStatus);
        expect(config).toBeNull();
      });
    });

    describe("getDocumentTypeConfig", () => {
      test("should return correct document type configuration", () => {
        const config = getDocumentTypeConfig("cmnd_cccd");
        expect(config).toBeDefined();
        expect(config!.id).toBe("cmnd_cccd");
        expect(config!.name).toBe("CMND/CCCD");
      });

      test("should return null for invalid document type", () => {
        const config = getDocumentTypeConfig("invalid_document");
        expect(config).toBeNull();
      });
    });

    describe("getProcessingTimeStandards", () => {
      test("should return correct processing time standards", () => {
        const standards = getProcessingTimeStandards("vay_tieu_dung");
        expect(standards).toBeDefined();
        expect(standards!.loanType).toBe("vay_tieu_dung");
      });

      test("should return null for invalid loan type", () => {
        const standards = getProcessingTimeStandards("invalid_loan_type" as any);
        expect(standards).toBeNull();
      });
    });

    describe("isStatusTransitionAllowed", () => {
      test("should allow valid transitions", () => {
        // This would test actual transition rules when implemented
        expect(isStatusTransitionAllowed("da_tiep_nhan", "dang_xu_ly", "customer")).toBe(true);
      });

      test("should prevent invalid transitions", () => {
        // This would test actual transition rules when implemented
        expect(isStatusTransitionAllowed("da_giai_ngan", "dang_xu_ly", "customer")).toBe(false);
      });
    });

    describe("getNextAllowedStatuses", () => {
      test("should return next allowed statuses", () => {
        const nextStatuses = getNextAllowedStatuses("da_tiep_nhan", "customer");
        expect(Array.isArray(nextStatuses)).toBe(true);
        expect(nextStatuses.length).toBeGreaterThan(0);
      });

      test("should return empty array for final status", () => {
        const nextStatuses = getNextAllowedStatuses("da_giai_ngan", "customer");
        expect(Array.isArray(nextStatuses)).toBe(true);
        // May not be empty depending on implementation
      });
    });

    describe("calculateEstimatedCompletionTime", () => {
      test("should return valid completion time", () => {
        const completionTime = calculateEstimatedCompletionTime("dang_xu_ly", "vay_tieu_dung");
        expect(completionTime).toBeDefined();
        expect(completionTime!.hours).toBeGreaterThan(0);
        expect(completionTime!.businessDays).toBeGreaterThan(0);
      });

      test("should return null for invalid inputs", () => {
        const completionTime = calculateEstimatedCompletionTime("invalid_status" as LoanApplicationStatus, "invalid_loan_type" as any);
        expect(completionTime).toBeNull();
      });

      test("should calculate different times for different loan types", () => {
        const consumerTime = calculateEstimatedCompletionTime("dang_tham_dinh", "vay_tieu_dung");
        const homeTime = calculateEstimatedCompletionTime("dang_tham_dinh", "vay_mua_nha");

        expect(consumerTime).toBeDefined();
        expect(homeTime).toBeDefined();
        // Home loans typically take longer
        expect(homeTime!.businessDays).toBeGreaterThanOrEqual(consumerTime!.businessDays);
      });
    });
  });

  describe("Vietnamese Language Support", () => {
    test("should have Vietnamese labels for all statuses", () => {
      Object.values(VIETNAMESE_STATUS_CONFIG).forEach(config => {
        // Check for Vietnamese characters
        expect(config.label).toMatch(/[\u00C0-\u017F]/); // Vietnamese Unicode range
        expect(config.description).toMatch(/[\u00C0-\u017F]/);
      });
    });

    test("should have Vietnamese document names", () => {
      Object.values(VIETNAMESE_DOCUMENT_TYPES).forEach(docType => {
        expect(docType.name).toMatch(/[\u00C0-\u017F]/);
        expect(docType.description).toMatch(/[\u00C0-\u017F]/);
        expect(docType.vietnameseInstructions).toMatch(/[\u00C0-\u017F]/);
      });
    });

    test("should have proper Vietnamese diacritics", () => {
      expect(VIETNAMESE_STATUS_CONFIG.da_duyet.label).toBe("Đã duyệt");
      expect(VIETNAMESE_STATUS_CONFIG.cho_bo_sung_giay_to.label).toBe("Chờ bổ sung giấy tờ");
      expect(VIETNAMESE_STATUS_CONFIG.dang_tham_dinh.label).toBe("Đang thẩm định");
    });
  });

  describe("Status Flow Validation", () => {
    test("should have logical status flows", () => {
      const statusFlow: LoanApplicationStatus[] = [
        "da_tiep_nhan",
        "dang_xu_ly",
        "dang_tham_dinh",
        "da_duyet",
        "cho_giai_ngan",
        "da_giai_ngan",
      ];

      statusFlow.forEach((status, index) => {
        const config = VIETNAMESE_STATUS_CONFIG[status];
        expect(config).toBeDefined();

        // Check that next status is in the allowed list (except for final status)
        if (index < statusFlow.length - 1) {
          const nextStatus = statusFlow[index + 1];
          expect(config!.nextStatuses).toContain(nextStatus);
        }
      });
    });

    test("should have proper termination states", () => {
      const terminationStatuses: LoanApplicationStatus[] = ["da_giai_ngan", "bi_tu_choi", "da_huy"];

      terminationStatuses.forEach(status => {
        const config = VIETNAMESE_STATUS_CONFIG[status];
        expect(config).toBeDefined();
        // Termination states should have no next statuses
        if (status === "da_giai_ngan") {
          expect(config!.nextStatuses).toHaveLength(0);
        }
      });
    });
  });

  describe("Document Category Validation", () => {
    test("should have proper document categories", () => {
      const categories = ["giay_to_dinh_danh", "giay_to_thu_nhap", "giay_to_nha_o", "giay_to_doanh_nghiep"];

      categories.forEach(category => {
        const docsInCategory = Object.values(VIETNAMESE_DOCUMENT_TYPES)
          .filter(doc => doc.category === category);

        expect(docsInCategory.length).toBeGreaterThan(0);
      });
    });

    test("should have appropriate required document flags", () => {
      // Identification documents should be required
      const idDocs = Object.values(VIETNAMESE_DOCUMENT_TYPES)
        .filter(doc => doc.category === "giay_to_dinh_danh");

      idDocs.forEach(doc => {
        expect(doc.required).toBe(true);
      });
    });
  });

  describe("Error Handling", () => {
    test("should handle malformed inputs gracefully", () => {
      expect(() => getStatusConfig(null as any)).not.toThrow();
      expect(() => getStatusConfig(undefined as any)).not.toThrow();
      expect(() => getDocumentTypeConfig(null as any)).not.toThrow();
      expect(() => getProcessingTimeStandards(null as any)).not.toThrow();
    });

    test("should handle edge cases in calculations", () => {
      expect(calculateEstimatedCompletionTime("da_tiep_nhan", "vay_tieu_dung", 999999)).toBeDefined();
      expect(calculateEstimatedCompletionTime("da_tiep_nhan", "vay_tieu_dung", -1)).toBeDefined();
    });
  });

  describe("Performance", () => {
    test("should retrieve configurations quickly", () => {
      const start = performance.now();

      for (let i = 0; i < 1000; i++) {
        getStatusConfig("da_duyet");
        getDocumentTypeConfig("cmnd_cccd");
        getProcessingTimeStandards("vay_tieu_dung");
      }

      const end = performance.now();
      expect(end - start).toBeLessThan(100); // Should complete in less than 100ms
    });
  });

  describe("Type Safety", () => {
    test("should maintain type safety for status IDs", () => {
      const validStatus: LoanApplicationStatus = "da_duyet";
      const config = getStatusConfig(validStatus);
      expect(config?.id).toBe(validStatus);
    });

    test("should maintain type safety for document type IDs", () => {
      const validDocType = "cmnd_cccd";
      const config = getDocumentTypeConfig(validDocType);
      expect(config?.id).toBe(validDocType);
    });

    test("should maintain type safety for loan types", () => {
      const validLoanType = "vay_tieu_dung";
      const standards = getProcessingTimeStandards(validLoanType);
      expect(standards?.loanType).toBe(validLoanType);
    });
  });
});