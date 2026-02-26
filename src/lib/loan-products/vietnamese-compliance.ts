// Vietnamese Banking Compliance Module
// Comprehensive validation for State Bank of Vietnam (SBV) regulations

import { VietnameseLoanCalculator } from "./interest-calculations";
import type {
  LoanCalculationParams,
  LoanCalculationResult,
} from "./interest-calculations";
import type {
  VietnameseLoanProduct,
  VietnameseLoanType,
} from "./vietnamese-loan-products";

/**
 * Vietnamese Banking Regulation References
 */
export const VIETNAMESE_REGULATIONS = {
  // State Bank of Vietnam regulations
  SBV_CIRCULAR_39_2016:
    "Circular 39/2016/TT-NHNN - Consumer lending regulations",
  SBV_CIRCULAR_22_2019:
    "Circular 22/2019/TT-NHNN - Risk management requirements",
  SBV_DECISION_1621_2007: "Decision 1621/2007 - Interest rate regulations",
  SBV_CIRCULAR_01_2020:
    "Circular 01/2020/TT-NHNN - Credit information center regulations",

  // Consumer protection
  CONSUMER_PROTECTION_LAW: "Law on Protection of Consumers' Rights 2010",
  CIVIL_CODE: "Civil Code 2015",
  BANKING_LAW: "Law on Credit Institutions 2010",
} as const;

/**
 * Interest Rate Caps by Loan Type (SBV regulations)
 */
export const INTEREST_RATE_CAPS: Record<
  VietnameseLoanType,
  {
    maximumAnnualRate: number;
    effectiveDate: string;
    regulation: keyof typeof VIETNAMESE_REGULATIONS;
    notes: string;
    notesVi: string;
  }
> = {
  home_loan: {
    maximumAnnualRate: 15.0, // Market-based but typically 9-15%
    effectiveDate: "2024-01-01",
    regulation: "SBV_DECISION_1621_2007",
    notes: "Market-based with disclosure requirements",
    notesVi: "Dựa trên thị trường với yêu cầu công bố thông tin",
  },
  auto_loan: {
    maximumAnnualRate: 18.0,
    effectiveDate: "2024-01-01",
    regulation: "SBV_DECISION_1621_2007",
    notes: "Market-based with disclosure requirements",
    notesVi: "Dựa trên thị trường với yêu cầu công bố thông tin",
  },
  consumer_loan: {
    maximumAnnualRate: 20.0, // SBV cap for consumer loans
    effectiveDate: "2024-01-01",
    regulation: "SBV_CIRCULAR_39_2016",
    notes: "Maximum rate for unsecured consumer loans",
    notesVi: "Lãi suất tối đa cho vay tiêu dùng không tài sản đảm bảo",
  },
  business_loan: {
    maximumAnnualRate: 25.0, // Market-based but with limits
    effectiveDate: "2024-01-01",
    regulation: "SBV_CIRCULAR_22_2019",
    notes: "Market-based with risk-based pricing",
    notesVi: "Dựa trên thị trường với định giá dựa trên rủi ro",
  },
  student_loan: {
    maximumAnnualRate: 8.0, // Government subsidized rates
    effectiveDate: "2024-01-01",
    regulation: "SBV_CIRCULAR_39_2016",
    notes: "Preferential rates for education loans",
    notesVi: "Lãi suất ưu đãi cho vay học tập",
  },
  refinancing: {
    maximumAnnualRate: 18.0,
    effectiveDate: "2024-01-01",
    regulation: "SBV_DECISION_1621_2007",
    notes: "Market-based with disclosure requirements",
    notesVi: "Dựa trên thị trường với yêu cầu công bố thông tin",
  },
  credit_card: {
    maximumAnnualRate: 36.0, // Higher due to unsecured nature
    effectiveDate: "2024-01-01",
    regulation: "SBV_CIRCULAR_39_2016",
    notes: "Credit card loans with higher risk premium",
    notesVi: "Vay thẻ tín dụng với phí rủi ro cao hơn",
  },
  mortgage_loan: {
    maximumAnnualRate: 15.0,
    effectiveDate: "2024-01-01",
    regulation: "SBV_DECISION_1621_2007",
    notes: "Similar to home loans with collateral",
    notesVi: "Tương tự vay mua nhà có tài sản đảm bảo",
  },
};

/**
 * Disclosure Requirements
 */
export interface DisclosureRequirements {
  /** Total amount payable (principal + interest + fees) */
  totalPayableAmount: boolean;
  /** Effective annual percentage rate (APR) */
  effectiveAPR: boolean;
  /** All fees and charges breakdown */
  feesAndChargesBreakdown: boolean;
  /** Early repayment penalties */
  earlyRepaymentPenalties: boolean;
  /** Payment schedule */
  paymentSchedule: boolean;
  /** Interest rate calculation method */
  interestRateCalculationMethod: boolean;
  /** Promotional terms (if applicable) */
  promotionalTerms: boolean;
}

/**
 * Compliance Check Result
 */
export interface ComplianceCheckResult {
  /** Overall compliance status */
  compliant: boolean;
  /** Compliance score (0-100) */
  score: number;
  /** Passed checks */
  passedChecks: ComplianceCheck[];
  /** Failed checks */
  failedChecks: ComplianceCheck[];
  /** Warning checks */
  warningChecks: ComplianceCheck[];
  /** Required actions */
  requiredActions: string[];
  /** Required actions in Vietnamese */
  requiredActionsVi: string[];
  /** Regulatory references */
  regulatoryReferences: Array<{
    regulation: string;
    section?: string;
    description: string;
    descriptionVi: string;
  }>;
}

/**
 * Individual compliance check
 */
export interface ComplianceCheck {
  /** Check name */
  name: string;
  /** Check name in Vietnamese */
  nameVi: string;
  /** Whether it passed */
  passed: boolean;
  /** Check category */
  category:
    | "interest_rate"
    | "disclosure"
    | "regulatory"
    | "consumer_protection"
    | "risk_management"
    | "eligibility";
  /** Severity level */
  severity: "critical" | "major" | "minor" | "informational";
  /** Actual value */
  actualValue?: any;
  /** Expected value */
  expectedValue?: any;
  /** Description of the check */
  description: string;
  /** Description in Vietnamese */
  descriptionVi: string;
  /** Regulatory reference */
  regulatoryReference: keyof typeof VIETNAMESE_REGULATIONS;
  /** Recommendation */
  recommendation?: string;
  /** Recommendation in Vietnamese */
  recommendationVi?: string;
}

/**
 * Vietnamese Compliance Engine
 */
export class VietnameseComplianceEngine {
  /**
   * Check loan product compliance with SBV regulations
   */
  static checkProductCompliance(
    product: VietnameseLoanProduct,
  ): ComplianceCheckResult {
    const checks: ComplianceCheck[] = [];
    const passedChecks: ComplianceCheck[] = [];
    const failedChecks: ComplianceCheck[] = [];
    const warningChecks: ComplianceCheck[] = [];
    const requiredActions: string[] = [];
    const requiredActionsVi: string[] = [];

    // 1. Interest rate cap check
    const rateCapCheck =
      VietnameseComplianceEngine.checkInterestRateCap(product);
    checks.push(rateCapCheck);

    // 2. Disclosure requirements check
    const disclosureCheck =
      VietnameseComplianceEngine.checkDisclosureRequirements(product);
    checks.push(disclosureCheck);

    // 3. SBV registration check
    const registrationCheck =
      VietnameseComplianceEngine.checkSBVRegistration(product);
    checks.push(registrationCheck);

    // 4. Consumer protection check
    const consumerProtectionCheck =
      VietnameseComplianceEngine.checkConsumerProtection(product);
    checks.push(consumerProtectionCheck);

    // 5. Risk management check
    const riskManagementCheck =
      VietnameseComplianceEngine.checkRiskManagement(product);
    checks.push(riskManagementCheck);

    // 6. Eligibility requirements check
    const eligibilityCheck =
      VietnameseComplianceEngine.checkEligibilityRequirements(product);
    checks.push(eligibilityCheck);

    // Separate checks by result
    for (const check of checks) {
      if (check.passed) {
        passedChecks.push(check);
      } else {
        if (check.severity === "critical" || check.severity === "major") {
          failedChecks.push(check);
          if (check.recommendation) {
            requiredActions.push(check.recommendation);
            requiredActionsVi.push(
              check.recommendationVi || check.recommendation,
            );
          }
        } else {
          warningChecks.push(check);
        }
      }
    }

    // Calculate compliance score
    const totalWeight = checks.reduce((sum, check) => {
      const weight =
        check.severity === "critical"
          ? 30
          : check.severity === "major"
            ? 20
            : check.severity === "minor"
              ? 10
              : 5;
      return sum + weight;
    }, 0);

    const earnedWeight = checks.reduce((sum, check) => {
      const weight =
        check.severity === "critical"
          ? 30
          : check.severity === "major"
            ? 20
            : check.severity === "minor"
              ? 10
              : 5;
      return sum + (check.passed ? weight : 0);
    }, 0);

    const complianceScore =
      totalWeight > 0 ? Math.round((earnedWeight / totalWeight) * 100) : 0;
    const compliant = failedChecks.length === 0 && complianceScore >= 80;

    // Generate regulatory references
    const regulatoryReferences = [
      {
        regulation: VIETNAMESE_REGULATIONS.SBV_CIRCULAR_39_2016,
        description: "Consumer lending regulations and disclosure requirements",
        descriptionVi:
          "Quy định cho vay tiêu dùng và yêu cầu công bố thông tin",
      },
      {
        regulation: VIETNAMESE_REGULATIONS.SBV_CIRCULAR_22_2019,
        description: "Risk management and loan classification requirements",
        descriptionVi: "Yêu cầu quản lý rủi ro và phân loại khoản vay",
      },
      {
        regulation: VIETNAMESE_REGULATIONS.SBV_DECISION_1621_2007,
        description: "Interest rate regulations and calculation methods",
        descriptionVi: "Quy định về lãi suất và phương pháp tính toán",
      },
    ];

    return {
      compliant,
      score: complianceScore,
      passedChecks,
      failedChecks,
      warningChecks,
      requiredActions,
      requiredActionsVi,
      regulatoryReferences,
    };
  }

  /**
   * Validate loan calculation compliance
   */
  static validateCalculationCompliance(
    params: LoanCalculationParams,
    result: LoanCalculationResult,
    loanType: VietnameseLoanType,
  ): ComplianceCheckResult {
    const checks: ComplianceCheck[] = [];
    const passedChecks: ComplianceCheck[] = [];
    const failedChecks: ComplianceCheck[] = [];
    const warningChecks: ComplianceCheck[] = [];
    const requiredActions: string[] = [];
    const requiredActionsVi: string[] = [];

    // 1. Interest rate cap validation
    const rateCapCheck = VietnameseComplianceEngine.validateInterestRateCap(
      params,
      loanType,
    );
    checks.push(rateCapCheck);

    // 2. APR calculation accuracy
    const aprCheck = VietnameseComplianceEngine.validateAPRCalculation(
      params,
      result,
    );
    checks.push(aprCheck);

    // 3. Total payable calculation
    const totalPayableCheck = VietnameseComplianceEngine.validateTotalPayable(
      params,
      result,
    );
    checks.push(totalPayableCheck);

    // 4. Payment schedule consistency
    const scheduleCheck = VietnameseComplianceEngine.validatePaymentSchedule(
      params,
      result,
    );
    checks.push(scheduleCheck);

    // 5. Fee disclosure compliance
    const feeDisclosureCheck = VietnameseComplianceEngine.validateFeeDisclosure(
      params,
      result,
    );
    checks.push(feeDisclosureCheck);

    // 6. Early repayment calculation
    const earlyRepaymentCheck =
      VietnameseComplianceEngine.validateEarlyRepaymentCalculation(
        params,
        result,
      );
    checks.push(earlyRepaymentCheck);

    // Separate and process checks
    for (const check of checks) {
      if (check.passed) {
        passedChecks.push(check);
      } else {
        if (check.severity === "critical" || check.severity === "major") {
          failedChecks.push(check);
          if (check.recommendation) {
            requiredActions.push(check.recommendation);
            requiredActionsVi.push(
              check.recommendationVi || check.recommendation,
            );
          }
        } else {
          warningChecks.push(check);
        }
      }
    }

    const complianceScore =
      checks.length > 0
        ? Math.round((passedChecks.length / checks.length) * 100)
        : 0;
    const compliant = failedChecks.length === 0 && complianceScore >= 80;

    return {
      compliant,
      score: complianceScore,
      passedChecks,
      failedChecks,
      warningChecks,
      requiredActions,
      requiredActionsVi,
      regulatoryReferences: [
        {
          regulation: VIETNAMESE_REGULATIONS.SBV_DECISION_1621_2007,
          description: "Interest rate and calculation transparency",
          descriptionVi: "Minh bạch lãi suất và tính toán",
        },
      ],
    };
  }

  /**
   * Generate compliance report
   */
  static generateComplianceReport(
    productCompliance: ComplianceCheckResult,
    calculationCompliance?: ComplianceCheckResult,
  ): {
    report: string;
    reportVi: string;
    summary: {
      overallCompliant: boolean;
      overallScore: number;
      criticalIssues: number;
      majorIssues: number;
      recommendations: string[];
      recommendationsVi: string[];
    };
  } {
    const criticalIssues =
      productCompliance.failedChecks.filter((c) => c.severity === "critical")
        .length +
      (calculationCompliance?.failedChecks.filter(
        (c) => c.severity === "critical",
      ).length || 0);
    const majorIssues =
      productCompliance.failedChecks.filter((c) => c.severity === "major")
        .length +
      (calculationCompliance?.failedChecks.filter((c) => c.severity === "major")
        .length || 0);

    const overallScore = calculationCompliance
      ? Math.round((productCompliance.score + calculationCompliance.score) / 2)
      : productCompliance.score;

    const overallCompliant =
      productCompliance.compliant && (calculationCompliance?.compliant ?? true);

    const recommendations = [
      ...productCompliance.requiredActions,
      ...(calculationCompliance?.requiredActions || []),
    ];
    const recommendationsVi = [
      ...productCompliance.requiredActionsVi,
      ...(calculationCompliance?.requiredActionsVi || []),
    ];

    const report = [
      "VIETNAMESE BANKING COMPLIANCE REPORT",
      "=====================================",
      "",
      `Product Compliance Score: ${productCompliance.score}%`,
      ...(calculationCompliance
        ? [`Calculation Compliance Score: ${calculationCompliance.score}%`]
        : []),
      `Overall Compliance Score: ${overallScore}%`,
      `Status: ${overallCompliant ? "COMPLIANT" : "NON-COMPLIANT"}`,
      "",
      `Critical Issues: ${criticalIssues}`,
      `Major Issues: ${majorIssues}`,
      "",
      "Failed Checks:",
      ...productCompliance.failedChecks.map(
        (check) => `- ${check.name}: ${check.description}`,
      ),
      ...(calculationCompliance
        ? calculationCompliance.failedChecks.map(
            (check) => `- ${check.name}: ${check.description}`,
          )
        : []),
      "",
      "Required Actions:",
      ...recommendations.map((action) => `- ${action}`),
      "",
      "Regulatory References:",
      ...productCompliance.regulatoryReferences.map(
        (ref) => `- ${ref.regulation}: ${ref.description}`,
      ),
    ].join("\n");

    const reportVi = [
      "BÁO CÁO TUÂN THỦ LUẬT NGÂN HÀNG VIỆT NAM",
      "=======================================",
      "",
      `Điểm tuân thủ sản phẩm: ${productCompliance.score}%`,
      ...(calculationCompliance
        ? [`Điểm tuân thủ tính toán: ${calculationCompliance.score}%`]
        : []),
      `Điểm tuân thủ tổng thể: ${overallScore}%`,
      `Trạng thái: ${overallCompliant ? "TUÂN THỦ" : "KHÔNG TUÂN THỦ"}`,
      "",
      `Vấn đề nghiêm trọng: ${criticalIssues}`,
      `Vấn đề quan trọng: ${majorIssues}`,
      "",
      "Các kiểm tra không đạt:",
      ...productCompliance.failedChecks.map(
        (check) => `- ${check.nameVi}: ${check.descriptionVi}`,
      ),
      ...(calculationCompliance
        ? calculationCompliance.failedChecks.map(
            (check) => `- ${check.nameVi}: ${check.descriptionVi}`,
          )
        : []),
      "",
      "Hành động cần thiết:",
      ...recommendationsVi.map((action) => `- ${action}`),
      "",
      "Tham chiếu quy định:",
      ...productCompliance.regulatoryReferences.map(
        (ref) => `- ${ref.regulation}: ${ref.descriptionVi}`,
      ),
    ].join("\n");

    return {
      report,
      reportVi,
      summary: {
        overallCompliant,
        overallScore,
        criticalIssues,
        majorIssues,
        recommendations,
        recommendationsVi,
      },
    };
  }

  /**
   * Check interest rate cap compliance
   */
  private static checkInterestRateCap(
    product: VietnameseLoanProduct,
  ): ComplianceCheck {
    const rateCap = INTEREST_RATE_CAPS[product.loanType];
    const isCompliant =
      product.interestRate.annual <= rateCap.maximumAnnualRate;

    return {
      name: "Interest Rate Cap",
      nameVi: "Trần lãi suất",
      passed: isCompliant,
      category: "interest_rate",
      severity: "critical",
      actualValue: product.interestRate.annual,
      expectedValue: rateCap.maximumAnnualRate,
      description: `Annual interest rate ${product.interestRate.annual}% ${isCompliant ? "is within" : "exceeds"} the SBV cap of ${rateCap.maximumAnnualRate}% for ${product.loanType}`,
      descriptionVi: `Lãi suất hàng năm ${product.interestRate.annual}% ${isCompliant ? "nằm trong" : "vượt quá"} trần SBV ${rateCap.maximumAnnualRate}% cho ${product.loanType}`,
      regulatoryReference: "SBV_DECISION_1621_2007",
      recommendation: isCompliant
        ? undefined
        : `Reduce interest rate to maximum ${rateCap.maximumAnnualRate}% or reclassify loan type`,
      recommendationVi: isCompliant
        ? undefined
        : `Giảm lãi suất xuống tối đa ${rateCap.maximumAnnualRate}% hoặc phân loại lại loại khoản vay`,
    };
  }

  /**
   * Check disclosure requirements
   */
  private static checkDisclosureRequirements(
    product: VietnameseLoanProduct,
  ): ComplianceCheck {
    const required = [
      product.regulatoryCompliance.consumerProtectionCompliance,
      product.regulatoryCompliance.dataPrivacyCompliance,
      product.regulatoryCompliance.disclosureRequirementsMet,
    ];

    const allMet = required.every((req) => req);

    return {
      name: "Disclosure Requirements",
      nameVi: "Yêu cầu công bố thông tin",
      passed: allMet,
      category: "disclosure",
      severity: "major",
      actualValue: required,
      expectedValue: [true, true, true],
      description: allMet
        ? "All disclosure requirements are met according to Circular 39/2016"
        : "Some disclosure requirements are missing. Full fee breakdown, APR, and payment terms must be disclosed.",
      descriptionVi: allMet
        ? "Tất cả các yêu cầu công bố thông tin đều được đáp ứng theo Thông tư 39/2016"
        : "Một số yêu cầu công bố thông tin bị thiếu. Phải công bố đầy đủ phí, APR và điều khoản thanh toán.",
      regulatoryReference: "SBV_CIRCULAR_39_2016",
      recommendation: allMet
        ? undefined
        : "Add missing disclosure information to product documentation",
      recommendationVi: allMet
        ? undefined
        : "Thêm thông tin công bố còn thiếu vào tài liệu sản phẩm",
    };
  }

  /**
   * Check SBV registration
   */
  private static checkSBVRegistration(
    product: VietnameseLoanProduct,
  ): ComplianceCheck {
    const hasRegistration =
      !!product.regulatoryCompliance.sbvRegistrationNumber;

    return {
      name: "SBV Registration",
      nameVi: "Đăng ký SBV",
      passed: hasRegistration,
      category: "regulatory",
      severity: "critical",
      actualValue: product.regulatoryCompliance.sbvRegistrationNumber,
      expectedValue: "SBV registration number",
      description: hasRegistration
        ? `Product registered with SBV: ${product.regulatoryCompliance.sbvRegistrationNumber}`
        : "Product lacks SBV registration number - required for legal operation",
      descriptionVi: hasRegistration
        ? `Sản phẩm đã đăng ký với SBV: ${product.regulatoryCompliance.sbvRegistrationNumber}`
        : "Sản phẩm thiếu số đăng ký SBV - bắt buộc để hoạt động hợp pháp",
      regulatoryReference: "SBV_CIRCULAR_22_2019",
      recommendation: hasRegistration
        ? undefined
        : "Register product with State Bank of Vietnam",
      recommendationVi: hasRegistration
        ? undefined
        : "Đăng ký sản phẩm với Ngân hàng Nhà nước",
    };
  }

  /**
   * Check consumer protection compliance
   */
  private static checkConsumerProtection(
    product: VietnameseLoanProduct,
  ): ComplianceCheck {
    const checks = [
      product.regulatoryCompliance.consumerProtectionCompliance,
      product.eligibility.requiredDocuments.length > 0,
      !product.fees.otherFees ||
        product.fees.otherFees.every(
          (fee) => fee.mandatory || !fee.name.toLowerCase().includes("hidden"),
        ),
    ];

    const allPassed = checks.every((check) => check);

    return {
      name: "Consumer Protection",
      nameVi: "Bảo vệ người tiêu dùng",
      passed: allPassed,
      category: "consumer_protection",
      severity: "major",
      description: allPassed
        ? "Consumer protection requirements are met"
        : "Some consumer protection measures need improvement",
      descriptionVi: allPassed
        ? "Các yêu cầu bảo vệ người tiêu dùng được đáp ứng"
        : "Một số biện pháp bảo vệ người tiêu dùng cần cải thiện",
      regulatoryReference: "CONSUMER_PROTECTION_LAW",
      recommendation: allPassed
        ? undefined
        : "Review and enhance consumer protection measures",
      recommendationVi: allPassed
        ? undefined
        : "Rà soát và tăng cường các biện pháp bảo vệ người tiêu dùng",
    };
  }

  /**
   * Check risk management compliance
   */
  private static checkRiskManagement(
    product: VietnameseLoanProduct,
  ): ComplianceCheck {
    const hasRiskControls = [
      product.eligibility.minCreditScore !== undefined,
      product.eligibility.maxDebtToIncomeRatio !== undefined,
      product.eligibility.collateralRequired ||
        product.amountLimits.max <= 500000000, // 500 triệu VND limit for unsecured
    ].every(Boolean);

    return {
      name: "Risk Management",
      nameVi: "Quản lý rủi ro",
      passed: hasRiskControls,
      category: "risk_management",
      severity: "major",
      description: hasRiskControls
        ? "Adequate risk management controls are in place"
        : "Risk management controls need to be strengthened",
      descriptionVi: hasRiskControls
        ? "Các biện pháp kiểm soát quản lý rủi ro đầy đủ"
        : "Biện pháp kiểm soát quản lý rủi ro cần được tăng cường",
      regulatoryReference: "SBV_CIRCULAR_22_2019",
      recommendation: hasRiskControls
        ? undefined
        : "Implement stronger risk assessment criteria",
      recommendationVi: hasRiskControls
        ? undefined
        : "Thực hiện các tiêu chí đánh giá rủi ro chặt chẽ hơn",
    };
  }

  /**
   * Check eligibility requirements
   */
  private static checkEligibilityRequirements(
    product: VietnameseLoanProduct,
  ): ComplianceCheck {
    const hasCompleteEligibility = [
      product.eligibility.minAge > 0 &&
        product.eligibility.maxAgeAtMaturity > product.eligibility.minAge,
      product.eligibility.minMonthlyIncome > 0,
      product.eligibility.requiredDocuments.length > 0,
      product.eligibility.employmentTypes &&
        product.eligibility.employmentTypes.length > 0,
    ].every(Boolean);

    return {
      name: "Eligibility Requirements",
      nameVi: "Yêu cầu đủ điều kiện",
      passed: hasCompleteEligibility,
      category: "eligibility",
      severity: "major",
      description: hasCompleteEligibility
        ? "Eligibility criteria are comprehensive and clear"
        : "Eligibility requirements need to be more detailed",
      descriptionVi: hasCompleteEligibility
        ? "Tiêu chí đủ điều kiện toàn diện và rõ ràng"
        : "Yêu cầu đủ điều kiện cần chi tiết hơn",
      regulatoryReference: "SBV_CIRCULAR_39_2016",
      recommendation: hasCompleteEligibility
        ? undefined
        : "Define clear and comprehensive eligibility criteria",
      recommendationVi: hasCompleteEligibility
        ? undefined
        : "Xác định tiêu chí đủ điều kiện rõ ràng và toàn diện",
    };
  }

  /**
   * Validate interest rate cap for calculations
   */
  private static validateInterestRateCap(
    params: LoanCalculationParams,
    loanType: VietnameseLoanType,
  ): ComplianceCheck {
    const rateCap = INTEREST_RATE_CAPS[loanType];
    const effectiveRate =
      params.promotionalRate && params.promotionalPeriod
        ? Math.max(params.annualRate, params.promotionalRate)
        : params.annualRate;

    const isCompliant = effectiveRate <= rateCap.maximumAnnualRate;

    return {
      name: "Calculation Interest Rate Cap",
      nameVi: "Trần lãi suất tính toán",
      passed: isCompliant,
      category: "interest_rate",
      severity: "critical",
      actualValue: effectiveRate,
      expectedValue: rateCap.maximumAnnualRate,
      description: `Calculated interest rate ${effectiveRate}% ${isCompliant ? "complies with" : "exceeds"} SBV cap of ${rateCap.maximumAnnualRate}%`,
      descriptionVi: `Lãi suất tính toán ${effectiveRate}% ${isCompliant ? "tuân thủ" : "vượt quá"} trần SBV ${rateCap.maximumAnnualRate}%`,
      regulatoryReference: "SBV_DECISION_1621_2007",
      recommendation: isCompliant
        ? undefined
        : `Adjust interest rate to comply with ${rateCap.maximumAnnualRate}% cap`,
      recommendationVi: isCompliant
        ? undefined
        : `Điều chỉnh lãi suất để tuân thủ trần ${rateCap.maximumAnnualRate}%`,
    };
  }

  /**
   * Validate APR calculation
   */
  private static validateAPRCalculation(
    params: LoanCalculationParams,
    result: LoanCalculationResult,
  ): ComplianceCheck {
    // Simple validation: APR should be reasonable compared to nominal rate
    const aprDifference = Math.abs(result.effectiveAPR - params.annualRate);
    const isReasonable = aprDifference <= params.annualRate * 0.5; // Allow 50% difference for fees

    return {
      name: "APR Calculation",
      nameVi: "Tính toán APR",
      passed: isReasonable,
      category: "disclosure",
      severity: "major",
      actualValue: result.effectiveAPR,
      expectedValue: params.annualRate,
      description: `APR ${result.effectiveAPR}% ${isReasonable ? "is reasonable" : "seems incorrect"} compared to nominal rate ${params.annualRate}%`,
      descriptionVi: `APR ${result.effectiveAPR}% ${isReasonable ? "hợp lý" : "có vẻ không chính xác"} so với lãi suất danh nghĩa ${params.annualRate}%`,
      regulatoryReference: "SBV_CIRCULAR_39_2016",
      recommendation: isReasonable
        ? undefined
        : "Review APR calculation methodology",
      recommendationVi: isReasonable
        ? undefined
        : "Rà soát phương pháp tính toán APR",
    };
  }

  /**
   * Validate total payable calculation
   */
  private static validateTotalPayable(
    _params: LoanCalculationParams,
    result: LoanCalculationResult,
  ): ComplianceCheck {
    const expectedTotal = result.paymentSchedule.reduce(
      (sum, payment) => sum + payment.total,
      0,
    );
    const isAccurate = Math.abs(result.totalPayable - expectedTotal) < 100; // Allow 100 VND difference

    return {
      name: "Total Payable Calculation",
      nameVi: "Tính toán tổng số phải trả",
      passed: isAccurate,
      category: "disclosure",
      severity: "critical",
      actualValue: result.totalPayable,
      expectedValue: expectedTotal,
      description: `Total payable ${isAccurate ? "matches" : "does not match"} payment schedule sum`,
      descriptionVi: `Tổng số phải trả ${isAccurate ? "khớp" : "không khớp"} với tổng lịch trình thanh toán`,
      regulatoryReference: "SBV_CIRCULAR_39_2016",
      recommendation: isAccurate
        ? undefined
        : "Fix total payable calculation to match payment schedule",
      recommendationVi: isAccurate
        ? undefined
        : "Sửa tính toán tổng số phải trả để khớp với lịch trình thanh toán",
    };
  }

  /**
   * Validate payment schedule consistency
   */
  private static validatePaymentSchedule(
    params: LoanCalculationParams,
    result: LoanCalculationResult,
  ): ComplianceCheck {
    const hasCorrectLength = result.paymentSchedule.length === params.term;
    const lastPaymentZero =
      result.paymentSchedule.length > 0 &&
      result.paymentSchedule[result.paymentSchedule.length - 1]
        .remainingBalance === 0;

    const isConsistent = hasCorrectLength && lastPaymentZero;

    return {
      name: "Payment Schedule Consistency",
      nameVi: "Tính nhất quán của lịch trình thanh toán",
      passed: isConsistent,
      category: "disclosure",
      severity: "critical",
      actualValue: {
        length: result.paymentSchedule.length,
        finalBalance:
          result.paymentSchedule[result.paymentSchedule.length - 1]
            ?.remainingBalance,
      },
      expectedValue: { length: params.term, finalBalance: 0 },
      description: isConsistent
        ? "Payment schedule is consistent with loan terms"
        : "Payment schedule has inconsistencies in length or final balance",
      descriptionVi: isConsistent
        ? "Lịch trình thanh toán nhất quán với điều khoản vay"
        : "Lịch trình thanh toán có sự không nhất quán về độ dài hoặc số dư cuối kỳ",
      regulatoryReference: "SBV_CIRCULAR_39_2016",
      recommendation: isConsistent
        ? undefined
        : "Fix payment schedule to match loan terms and end with zero balance",
      recommendationVi: isConsistent
        ? undefined
        : "Sửa lịch trình thanh toán để khớp với điều khoản vay và kết thúc với số dư bằng không",
    };
  }

  /**
   * Validate fee disclosure
   */
  private static validateFeeDisclosure(
    params: LoanCalculationParams,
    result: LoanCalculationResult,
  ): ComplianceCheck {
    const hasFees = result.totalFees > 0;
    const feesAreCalculated = Boolean(
      hasFees &&
        (params.processingFee ||
          params.processingFeeFixed ||
          params.insuranceFee),
    );

    const isProperlyDisclosed = !hasFees || feesAreCalculated;

    return {
      name: "Fee Disclosure",
      nameVi: "Công bố phí",
      passed: isProperlyDisclosed,
      category: "disclosure",
      severity: "major",
      actualValue: {
        totalFees: result.totalFees,
        hasFeeParams: feesAreCalculated,
      },
      expectedValue: { totalFees: 0, hasFeeParams: true },
      description: isProperlyDisclosed
        ? "All fees are properly disclosed and calculated"
        : "Fee disclosure or calculation issues detected",
      descriptionVi: isProperlyDisclosed
        ? "Tất cả phí được công bố và tính toán đúng cách"
        : "Phát hiện vấn đề về công bố hoặc tính toán phí",
      regulatoryReference: "SBV_CIRCULAR_39_2016",
      recommendation: isProperlyDisclosed
        ? undefined
        : "Ensure all fees are properly disclosed and calculated",
      recommendationVi: isProperlyDisclosed
        ? undefined
        : "Đảm bảo tất cả phí được công bố và tính toán đúng cách",
    };
  }

  /**
   * Validate early repayment calculation
   */
  private static validateEarlyRepaymentCalculation(
    params: LoanCalculationParams,
    _result: LoanCalculationResult,
  ): ComplianceCheck {
    // Test early repayment calculation for validity
    try {
      const earlyRepaymentResult =
        VietnameseLoanCalculator.calculateEarlyRepayment(
          params,
          6, // After 6 payments
          params.principal * 0.2, // 20% early repayment
          2, // 2% fee
        );

      const isValidCalculation =
        earlyRepaymentResult.remainingBalance >= 0 &&
        earlyRepaymentResult.netSavings >= -earlyRepaymentResult.feeAmount;

      return {
        name: "Early Repayment Calculation",
        nameVi: "Tính toán trả nợ trước hạn",
        passed: isValidCalculation,
        category: "disclosure",
        severity: "minor",
        actualValue: earlyRepaymentResult,
        expectedValue: "Valid calculation result",
        description: isValidCalculation
          ? "Early repayment calculation produces valid results"
          : "Early repayment calculation may have issues",
        descriptionVi: isValidCalculation
          ? "Tính toán trả nợ trước hạn cho kết quả hợp lệ"
          : "Tính toán trả nợ trước hạn có thể có vấn đề",
        regulatoryReference: "SBV_CIRCULAR_39_2016",
        recommendation: isValidCalculation
          ? undefined
          : "Review early repayment calculation methodology",
        recommendationVi: isValidCalculation
          ? undefined
          : "Rà soát phương pháp tính toán trả nợ trước hạn",
      };
    } catch (_error) {
      return {
        name: "Early Repayment Calculation",
        nameVi: "Tính toán trả nợ trước hạn",
        passed: false,
        category: "disclosure",
        severity: "minor",
        description: "Early repayment calculation failed with error",
        descriptionVi: "Tính toán trả nợ trước hạn thất bại với lỗi",
        regulatoryReference: "SBV_CIRCULAR_39_2016",
        recommendation: "Fix early repayment calculation implementation",
        recommendationVi: "Sửa lỗi triển khai tính toán trả nợ trước hạn",
      };
    }
  }
}

export default VietnameseComplianceEngine;
