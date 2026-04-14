/**
 * Financial Calculation Validation
 *
 * Comprehensive validation functions for financial calculations, ensuring
 * accuracy, compliance, and data integrity for Vietnamese financial regulations.
 */

import type { TaxCalculationParams } from "../financial-data/tax-brackets";
import type { LoanCalculationParams } from "./calculations";

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  score: number; // 0-100 confidence score
  recommendations: string[];
}

export interface ValidationError {
  field: string;
  message: string;
  severity: "critical" | "high" | "medium" | "low";
  code: string;
  fix?: string;
}

export interface ValidationWarning {
  field: string;
  message: string;
  severity: "high" | "medium" | "low";
  code: string;
  suggestion?: string;
}

export interface ComplianceCheck {
  regulation: string;
  isCompliant: boolean;
  riskLevel: "low" | "medium" | "high";
  details: string;
  remedialActions?: string[];
}

/**
 * Validate loan calculation parameters
 */
export const validateLoanCalculationParams = (
  params: LoanCalculationParams,
): ValidationResult => {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];
  const recommendations: string[] = [];
  let score = 100;

  // Principal validation
  if (params.principal <= 0) {
    errors.push({
      field: "principal",
      message: "Số tiền vay phải lớn hơn 0",
      severity: "critical",
      code: "LOAN_001",
      fix: "Nhập số tiền vay hợp lệ",
    });
    score -= 50;
  } else if (params.principal < 1000000) {
    warnings.push({
      field: "principal",
      message: "Số tiền vay quá nhỏ (dưới 1 triệu VND)",
      severity: "medium",
      code: "LOAN_002",
      suggestion: "Kiểm tra lại số tiền vay mong muốn",
    });
    score -= 10;
  } else if (params.principal > 10000000000) {
    warnings.push({
      field: "principal",
      message: "Số tiền vay lớn (trên 10 tỷ VND) - yêu cầu thẩm định đặc biệt",
      severity: "high",
      code: "LOAN_003",
      suggestion: "Chuẩn bị hồ sơ tài chính chi tiết",
    });
    score -= 15;
  }

  // Interest rate validation
  if (params.annualRate < 0 || params.annualRate > 50) {
    errors.push({
      field: "annualRate",
      message: "Lãi suất không hợp lệ (0-50%)",
      severity: "critical",
      code: "LOAN_004",
      fix: "Nhập lãi suất trong khoảng 0-50%",
    });
    score -= 40;
  } else if (params.annualRate > 25) {
    warnings.push({
      field: "annualRate",
      message: "Lãi suất rất cao - cân nhắc các lựa chọn khác",
      severity: "high",
      code: "LOAN_005",
      suggestion: "So sánh với các ngân hàng khác",
    });
    score -= 20;
  } else if (params.annualRate < 3) {
    warnings.push({
      field: "annualRate",
      message: "Lãi suất unusually low - kiểm tra điều kiện ưu đãi",
      severity: "medium",
      code: "LOAN_006",
      suggestion: "Kiểm tra thời gian ưu đãi và điều kiện áp dụng",
    });
    score -= 5;
  }

  // Term validation
  if (params.termInMonths < 1 || params.termInMonths > 360) {
    errors.push({
      field: "termInMonths",
      message: "Kỳ hạn vay không hợp lệ (1-360 tháng)",
      severity: "critical",
      code: "LOAN_007",
      fix: "Nhập kỳ hạn vay từ 1-360 tháng",
    });
    score -= 30;
  } else if (params.termInMonths < 6) {
    warnings.push({
      field: "termInMonths",
      message: "Kỳ hạn vay quá ngắn - có thể áp dụng lãi suất cao hơn",
      severity: "medium",
      code: "LOAN_008",
      suggestion: "Cân nhắc kéo dài kỳ hạn để giảm áp lực trả nợ",
    });
    score -= 10;
  } else if (params.termInMonths > 240) {
    warnings.push({
      field: "termInMonths",
      message: "Kỳ hạn vay rất dài - tổng lãi suất cao",
      severity: "high",
      code: "LOAN_009",
      suggestion: "Cân nhắc các lựa chọn giảm thời gian vay",
    });
    score -= 15;
  }

  // Promotional period validation
  if (params.promotionalPeriod) {
    if (params.promotionalPeriod < 0) {
      errors.push({
        field: "promotionalPeriod",
        message: "Thời gian ưu đãi không được âm",
        severity: "critical",
        code: "LOAN_010",
        fix: "Nhập thời gian ưu đãi hợp lệ",
      });
      score -= 20;
    } else if (params.promotionalPeriod > params.termInMonths) {
      errors.push({
        field: "promotionalPeriod",
        message: "Thời gian ưu đãi không thể lớn hơn thời gian vay",
        severity: "critical",
        code: "LOAN_011",
        fix: "Giảm thời gian ưu đãi hoặc tăng thời gian vay",
      });
      score -= 25;
    } else if (!params.promotionalRate) {
      warnings.push({
        field: "promotionalPeriod",
        message: "Có thời gian ưu đãi nhưng không có lãi suất ưu đãi",
        severity: "medium",
        code: "LOAN_012",
        suggestion: "Nhập lãi suất ưu đãi hoặc bỏ thời gian ưu đãi",
      });
      score -= 10;
    }
  }

  // Promotional rate validation
  if (params.promotionalRate) {
    if (params.promotionalRate < 0) {
      errors.push({
        field: "promotionalRate",
        message: "Lãi suất ưu đãi không được âm",
        severity: "critical",
        code: "LOAN_013",
        fix: "Nhập lãi suất ưu đãi hợp lệ",
      });
      score -= 20;
    } else if (params.promotionalRate > params.annualRate) {
      warnings.push({
        field: "promotionalRate",
        message: "Lãi suất ưu đãi cao hơn lãi suất thông thường",
        severity: "high",
        code: "LOAN_014",
        suggestion: "Kiểm tra lại thông tin lãi suất",
      });
      score -= 15;
    }
  }

  // Fee validations
  if (params.processingFee) {
    if (params.processingFee < 0 || params.processingFee > 10) {
      errors.push({
        field: "processingFee",
        message: "Phí xử lý không hợp lệ (0-10%)",
        severity: "high",
        code: "LOAN_015",
        fix: "Nhập phí xử lý trong khoảng 0-10%",
      });
      score -= 15;
    } else if (params.processingFee > 3) {
      warnings.push({
        field: "processingFee",
        message: "Phí xử lý cao - kiểm tra các ngân hàng khác",
        severity: "medium",
        code: "LOAN_016",
        suggestion: "Đàm phán giảm phí hoặc tìm lựa chọn khác",
      });
      score -= 10;
    }
  }

  if (params.insuranceRate) {
    if (params.insuranceRate < 0 || params.insuranceRate > 5) {
      errors.push({
        field: "insuranceRate",
        message: "Tỷ lệ bảo hiểm không hợp lệ (0-5%)",
        severity: "high",
        code: "LOAN_017",
        fix: "Nhập tỷ lệ bảo hiểm trong khoảng 0-5%",
      });
      score -= 15;
    }
  }

  // Early repayment penalty validation
  if (params.earlyRepaymentPenalty) {
    if (params.earlyRepaymentPenalty < 0 || params.earlyRepaymentPenalty > 10) {
      errors.push({
        field: "earlyRepaymentPenalty",
        message: "Phí trả trước hạn không hợp lệ (0-10%)",
        severity: "high",
        code: "LOAN_018",
        fix: "Nhập phí trả trước hạn trong khoảng 0-10%",
      });
      score -= 15;
    } else if (params.earlyRepaymentPenalty > 5) {
      warnings.push({
        field: "earlyRepaymentPenalty",
        message: "Phí trả trước hạn cao - hạn chế trả trước hạn",
        severity: "medium",
        code: "LOAN_019",
        suggestion: "Tìm các lựa chọn có phí thấp hơn",
      });
      score -= 10;
    }
  }

  // Generate recommendations
  if (score > 80) {
    recommendations.push(
      "Thông tin khoản vay hợp lệ - có thể tiến hành tính toán",
    );
  } else if (score > 60) {
    recommendations.push("Có một số cảnh báo - nên kiểm tra lại thông tin");
  } else if (score > 40) {
    recommendations.push("Nhiều cảnh báo - cần xem xét kỹ trước khi vay");
  } else {
    recommendations.push(
      "Thông tin không hợp lệ - cần chỉnh sửa trước khi tiếp tục",
    );
  }

  // Add specific recommendations
  if (params.principal > 5000000000 && !params.hasInsurance) {
    recommendations.push("Khoản vay lớn nên cân nhắc mua bảo hiểm");
  }

  if (params.termInMonths > 180 && params.rateType === "flat_rate") {
    recommendations.push("Vay dài hạn nên chọn phương pháp lãi suất dư giảm");
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    score: Math.max(0, score),
    recommendations,
  };
};

/**
 * Validate tax calculation parameters
 */
export const validateTaxCalculationParams = (
  params: TaxCalculationParams,
): ValidationResult => {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];
  const recommendations: string[] = [];
  let score = 100;

  // Income validation
  if (params.grossMonthlyIncome < 0) {
    errors.push({
      field: "grossMonthlyIncome",
      message: "Thu nhập không được âm",
      severity: "critical",
      code: "TAX_001",
      fix: "Nhập thu nhập hợp lệ",
    });
    score -= 50;
  } else if (params.grossMonthlyIncome === 0) {
    warnings.push({
      field: "grossMonthlyIncome",
      message: "Thu nhập 0 - không có thuế phải nộp",
      severity: "low",
      code: "TAX_002",
      suggestion: "Kiểm tra lại thông tin thu nhập",
    });
    score -= 5;
  } else if (params.grossMonthlyIncome > 500000000) {
    warnings.push({
      field: "grossMonthlyIncome",
      message: "Thu nhập rất cao - cần kê khai và đóng thuế chính xác",
      severity: "high",
      code: "TAX_003",
      suggestion: "Tham khảo tư vấn thuế chuyên nghiệp",
    });
    score -= 10;
  }

  // Dependents validation
  if (params.numberOfDependents < 0) {
    errors.push({
      field: "numberOfDependents",
      message: "Số người phụ thuộc không được âm",
      severity: "critical",
      code: "TAX_004",
      fix: "Nhập số người phụ thuộc hợp lệ",
    });
    score -= 30;
  } else if (params.numberOfDependents > 20) {
    errors.push({
      field: "numberOfDependents",
      message: "Số người phụ thuộc quá nhiều",
      severity: "high",
      code: "TAX_005",
      fix: "Kiểm tra lại thông tin người phụ thuộc",
    });
    score -= 25;
  } else if (params.numberOfDependents > 5) {
    warnings.push({
      field: "numberOfDependents",
      message: "Số người phụ thuộc nhiều - cần cung cấp giấy tờ chứng minh",
      severity: "medium",
      code: "TAX_006",
      suggestion: "Chuẩn bị hồ sơ người phụ thuộc đầy đủ",
    });
    score -= 10;
  }

  // Region validation
  if (params.region < 1 || params.region > 4) {
    errors.push({
      field: "region",
      message: "Khu vực không hợp lệ (1-4)",
      severity: "critical",
      code: "TAX_007",
      fix: "Chọn khu vực từ 1-4",
    });
    score -= 20;
  }

  // Spouse income validation
  if (params.spouseIncome && params.spouseIncome < 0) {
    errors.push({
      field: "spouseIncome",
      message: "Thu nhập vợ/chồng không được âm",
      severity: "critical",
      code: "TAX_008",
      fix: "Nhập thu nhập vợ/chồng hợp lệ",
    });
    score -= 20;
  }

  // Marital status validation
  if (params.maritalStatus === "married" && !params.spouseIncome) {
    warnings.push({
      field: "spouseIncome",
      message: "Đã kết hôn nhưng chưa có thông tin thu nhập vợ/chồng",
      severity: "medium",
      code: "TAX_009",
      suggestion: "Nhập thu nhập vợ/chồng để tối ưu thuế",
    });
    score -= 10;
  }

  // Special conditions validation
  if (params.hasDisabledDependent && params.numberOfDependents === 0) {
    warnings.push({
      field: "hasDisabledDependent",
      message: "Có người phụ thuộc tàn tật nhưng số người phụ thuộc là 0",
      severity: "high",
      code: "TAX_010",
      suggestion: "Tăng số người phụ thuộc để tính giảm trừ",
    });
    score -= 15;
  }

  // Generate recommendations
  if (
    params.maritalStatus === "married" &&
    params.spouseIncome &&
    params.grossMonthlyIncome > params.spouseIncome * 2
  ) {
    recommendations.push("Cân nhắc kê khai thuế riêng để tối ưu thuế suất");
  }

  if (params.numberOfDependents === 0 && params.grossMonthlyIncome > 20000000) {
    recommendations.push(
      "Kiểm tra điều kiện người phụ thuộc (cha mẹ, con cái) để giảm trừ thuế",
    );
  }

  if (params.grossMonthlyIncome > 50000000) {
    recommendations.push(
      "Thu nhập cao - nên đăng ký thuế thu nhập cá nhân và kê khai định kỳ",
    );
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    score: Math.max(0, score),
    recommendations,
  };
};

/**
 * Validate calculation results for consistency
 */
export const validateCalculationResults = (
  type: "loan" | "tax" | "savings",
  inputs: any,
  results: any,
): ValidationResult => {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];
  const recommendations: string[] = [];
  let score = 100;

  switch (type) {
    case "loan": {
      // Validate loan calculation results
      if (results.monthlyPayment <= 0) {
        errors.push({
          field: "monthlyPayment",
          message: "Khoản thanh toán hàng tháng không hợp lệ",
          severity: "critical",
          code: "RESULT_001",
          fix: "Kiểm tra lại thông tin đầu vào",
        });
        score -= 50;
      }

      if (results.totalPayment < inputs.principal) {
        errors.push({
          field: "totalPayment",
          message: "Tổng thanh toán nhỏ hơn số tiền vay",
          severity: "critical",
          code: "RESULT_002",
          fix: "Kiểm tra lại công thức tính toán",
        });
        score -= 40;
      }

      if (results.totalInterest < 0) {
        errors.push({
          field: "totalInterest",
          message: "Tổng lãi suất âm",
          severity: "critical",
          code: "RESULT_003",
          fix: "Kiểm tra lại công thức lãi suất",
        });
        score -= 40;
      }

      // Check for reasonable ranges
      const monthlyPaymentRatio = results.monthlyPayment / inputs.principal;
      if (monthlyPaymentRatio > 0.1) {
        // More than 10% of principal monthly
        warnings.push({
          field: "monthlyPayment",
          message: "Khoản thanh toán hàng tháng rất cao",
          severity: "high",
          code: "RESULT_004",
          suggestion: "Cân nhắc tăng kỳ hạn vay",
        });
        score -= 15;
      }

      if (results.effectiveInterestRate > inputs.annualRate * 1.5) {
        warnings.push({
          field: "effectiveInterestRate",
          message: "Lãi suất hiệu quả cao hơn nhiều so với lãi suất danh nghĩa",
          severity: "medium",
          code: "RESULT_005",
          suggestion: "Kiểm tra phí và phương pháp tính lãi suất",
        });
        score -= 10;
      }

      break;
    }

    case "tax":
      // Validate tax calculation results
      if (results.incomeTax < 0) {
        errors.push({
          field: "incomeTax",
          message: "Thuế thu nhập cá nhân âm",
          severity: "critical",
          code: "RESULT_006",
          fix: "Kiểm tra lại công thức tính thuế",
        });
        score -= 50;
      }

      if (results.netIncome > inputs.grossMonthlyIncome) {
        errors.push({
          field: "netIncome",
          message: "Thu nhập ròng lớn hơn thu nhập gộp",
          severity: "critical",
          code: "RESULT_007",
          fix: "Kiểm tra lại tính toán khấu trừ",
        });
        score -= 40;
      }

      if (results.effectiveTaxRate > 100) {
        errors.push({
          field: "effectiveTaxRate",
          message: "Thuế suất hiệu quả trên 100%",
          severity: "critical",
          code: "RESULT_008",
          fix: "Kiểm tra lại công thức tính thuế suất",
        });
        score -= 40;
      }

      if (results.socialInsurance > inputs.grossMonthlyIncome * 0.2) {
        warnings.push({
          field: "socialInsurance",
          message: "Phí bảo hiểm xã hội quá cao",
          severity: "medium",
          code: "RESULT_009",
          suggestion: "Kiểm tra mức đóng bảo hiểm xã hội tối đa",
        });
        score -= 10;
      }

      break;

    case "savings": {
      // Validate savings calculation results
      if (results.finalAmount < inputs.principal) {
        errors.push({
          field: "finalAmount",
          message: "Số tiền cuối kỳ nhỏ hơn tiền gửi ban đầu",
          severity: "critical",
          code: "RESULT_010",
          fix: "Kiểm tra lại lãi suất và kỳ hạn",
        });
        score -= 50;
      }

      if (results.totalInterest < 0) {
        errors.push({
          field: "totalInterest",
          message: "Tổng lãi suất tiết kiệm âm",
          severity: "critical",
          code: "RESULT_011",
          fix: "Kiểm tra lại lãi suất tiết kiệm",
        });
        score -= 40;
      }

      // Check for reasonable interest rates
      const annualInterestRate =
        (results.totalInterest / inputs.principal) *
        (12 / inputs.termInMonths) *
        100;
      if (annualInterestRate > 20) {
        warnings.push({
          field: "totalInterest",
          message: "Lãi suất tiết kiệm rất cao - kiểm tra lại thông tin",
          severity: "high",
          code: "RESULT_012",
          suggestion: "Xác minh lãi suất từ ngân hàng",
        });
        score -= 20;
      }

      break;
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    score: Math.max(0, score),
    recommendations,
  };
};

/**
 * Check Vietnamese regulatory compliance
 */
export const checkRegulatoryCompliance = (
  type: "loan" | "tax" | "savings",
  details: any,
): {
  isCompliant: boolean;
  checks: ComplianceCheck[];
  overallRiskLevel: "low" | "medium" | "high";
} => {
  const checks: ComplianceCheck[] = [];
  let isCompliant = true;

  switch (type) {
    case "loan":
      // Interest rate ceiling check
      checks.push({
        regulation: "Lãi suất cho vay (Circular 39/2016/TT-NHNN)",
        isCompliant: details.annualRate <= 20,
        riskLevel: details.annualRate > 20 ? "high" : "low",
        details:
          details.annualRate <= 20
            ? "Lãi suất trong giới hạn quy định"
            : `Lãi suất ${details.annualRate}% vượt quá giới hạn 20%`,
        remedialActions:
          details.annualRate > 20
            ? ["Đàm phán giảm lãi suất", "Tìm lựa chọn thay thế"]
            : undefined,
      });

      // Loan term check
      checks.push({
        regulation: "Thời hạn cho vay tối đa",
        isCompliant: details.termInMonths <= 360,
        riskLevel: details.termInMonths > 360 ? "high" : "low",
        details:
          details.termInMonths <= 360
            ? "Thời hạn cho vay hợp lệ"
            : `Thời hạn ${details.termInMonths} tháng vượt quá giới hạn 30 năm`,
      });

      // Processing fee check
      if (details.processingFee) {
        checks.push({
          regulation: "Phí xử lý khoản vay",
          isCompliant: details.processingFee <= 5,
          riskLevel: details.processingFee > 5 ? "medium" : "low",
          details:
            details.processingFee <= 5
              ? "Phí xử lý hợp lý"
              : `Phí xử lý ${details.processingFee}% cao hơn mức phổ biến`,
          remedialActions:
            details.processingFee > 5 ? ["Đàm phán giảm phí"] : undefined,
        });
      }

      break;

    case "tax":
      // Minimum wage check
      checks.push({
        regulation: "Lương tối thiểu vùng",
        isCompliant: details.grossMonthlyIncome >= 4000000,
        riskLevel: details.grossMonthlyIncome < 4000000 ? "medium" : "low",
        details:
          details.grossMonthlyIncome >= 4000000
            ? "Thu nhập trên mức lương tối thiểu"
            : "Thu nhập dưới mức lương tối thiểu - cần kiểm tra lại",
      });

      // Social insurance cap check
      checks.push({
        regulation: "Mức đóng BHXH tối đa",
        isCompliant: details.socialInsurance <= 2380000,
        riskLevel: details.socialInsurance > 2380000 ? "high" : "low",
        details:
          details.socialInsurance <= 2380000
            ? "Mức đóng BHXH hợp lệ"
            : "Mức đóng BHXH vượt quá giới hạn",
        remedialActions:
          details.socialInsurance > 2380000
            ? ["Áp dụng mức trần BHXH"]
            : undefined,
      });

      break;

    case "savings":
      // Interest rate check
      checks.push({
        regulation: "Lãi suất huy động",
        isCompliant: details.annualRate <= 10,
        riskLevel: details.annualRate > 10 ? "medium" : "low",
        details:
          details.annualRate <= 10
            ? "Lãi suất tiết kiệm hợp lý"
            : `Lãi suất ${details.annualRate}% cao hơn mức phổ biến`,
        remedialActions:
          details.annualRate > 10
            ? ["Kiểm tra lại lãi suất", "Xác minh với ngân hàng"]
            : undefined,
      });

      break;
  }

  isCompliant = checks.every((check) => check.isCompliant);
  const highRiskCount = checks.filter(
    (check) => check.riskLevel === "high",
  ).length;
  const mediumRiskCount = checks.filter(
    (check) => check.riskLevel === "medium",
  ).length;

  let overallRiskLevel: "low" | "medium" | "high" = "low";
  if (highRiskCount > 0) {
    overallRiskLevel = "high";
  } else if (mediumRiskCount > 0) {
    overallRiskLevel = "medium";
  }

  return {
    isCompliant,
    checks,
    overallRiskLevel,
  };
};

/**
 * Generate validation report
 */
export const generateValidationReport = (
  type: "loan" | "tax" | "savings",
  inputs: any,
  results: any,
): {
  summary: {
    status: "passed" | "warning" | "failed";
    score: number;
    issuesFound: number;
    recommendationsCount: number;
  };
  details: {
    inputValidation: ValidationResult;
    resultValidation: ValidationResult;
    complianceCheck: any;
  };
  actions: string[];
} => {
  const inputValidation =
    type === "loan"
      ? validateLoanCalculationParams(inputs)
      : validateTaxCalculationParams(inputs);

  const resultValidation = validateCalculationResults(type, inputs, results);
  const complianceCheck = checkRegulatoryCompliance(type, inputs);

  const totalIssues =
    inputValidation.errors.length +
    inputValidation.warnings.length +
    resultValidation.errors.length +
    resultValidation.warnings.length +
    complianceCheck.checks.filter((c: ComplianceCheck) => !c.isCompliant)
      .length;

  const averageScore = (inputValidation.score + resultValidation.score) / 2;

  let status: "passed" | "warning" | "failed" = "passed";
  if (totalIssues > 5 || averageScore < 60) {
    status = "failed";
  } else if (totalIssues > 0 || averageScore < 80) {
    status = "warning";
  }

  const recommendationsCount =
    inputValidation.recommendations.length +
    resultValidation.recommendations.length;

  const actions: string[] = [];

  if (inputValidation.errors.length > 0) {
    actions.push("Sửa lỗi thông tin đầu vào trước khi tiếp tục");
  }

  if (resultValidation.errors.length > 0) {
    actions.push("Kiểm tra lại kết quả tính toán");
  }

  if (!complianceCheck.isCompliant) {
    actions.push("Chỉnh sửa để đảm bảo tuân thủ quy định");
  }

  if (inputValidation.warnings.length > 2) {
    actions.push("Xem xét các cảnh báo để tối ưu hóa kết quả");
  }

  return {
    summary: {
      status,
      score: Math.round(averageScore),
      issuesFound: totalIssues,
      recommendationsCount,
    },
    details: {
      inputValidation,
      resultValidation,
      complianceCheck,
    },
    actions,
  };
};

export default {
  validateLoanCalculationParams,
  validateTaxCalculationParams,
  validateCalculationResults,
  checkRegulatoryCompliance,
  generateValidationReport,
};
