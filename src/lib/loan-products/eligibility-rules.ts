// Vietnamese Loan Eligibility Rules
// Comprehensive eligibility engine for Vietnamese loan products

import type {
  VietnameseLoanProduct,
  VietnameseLoanType,
} from "./vietnamese-loan-products";

/**
 * Eligibility check result
 */
export interface EligibilityResult {
  /** Overall eligibility status */
  eligible: boolean;
  /** Eligibility score (0-100) */
  score: number;
  /** Eligibility confidence (low/medium/high) */
  confidence: "low" | "medium" | "high";
  /** Passed criteria */
  passedCriteria: EligibilityCriterion[];
  /** Failed criteria */
  failedCriteria: EligibilityCriterion[];
  /** Warning criteria (passed but with concerns) */
  warningCriteria: EligibilityCriterion[];
  /** Recommendations for improvement */
  recommendations: string[];
  /** Recommendations in Vietnamese */
  recommendationsVi: string[];
  /** Required documents */
  requiredDocuments: DocumentRequirement[];
  /** Next steps */
  nextSteps: string[];
  /** Next steps in Vietnamese */
  nextStepsVi: string[];
}

/**
 * Individual eligibility criterion
 */
export interface EligibilityCriterion {
  /** Criterion name */
  name: string;
  /** Criterion name in Vietnamese */
  nameVi: string;
  /** Whether it was passed */
  passed: boolean;
  /** Actual value */
  actualValue: any;
  /** Required value */
  requiredValue: any;
  /** Importance level */
  importance: "critical" | "important" | "optional";
  /** Reason for failure */
  reason?: string;
  /** Reason in Vietnamese */
  reasonVi?: string;
  /** Score weight (0-1) */
  weight: number;
}

/**
 * Document requirement
 */
export interface DocumentRequirement {
  /** Document type */
  type: string;
  /** Document type in Vietnamese */
  typeVi: string;
  /** Whether it's mandatory */
  mandatory: boolean;
  /** Description */
  description?: string;
  /** Description in Vietnamese */
  descriptionVi?: string;
  /** Validity requirements */
  validityRequirements?: {
    /** Maximum age in months */
    maxAgeMonths?: number;
    /** Original required */
    originalRequired?: boolean;
    /** Certified copy accepted */
    certifiedCopyAccepted?: boolean;
  };
  /** Where to obtain */
  whereToObtain?: string;
  /** Where to obtain in Vietnamese */
  whereToObtainVi?: string;
}

/**
 * Applicant profile for eligibility checking
 */
export interface ApplicantProfile {
  /** Personal information */
  personalInfo: {
    /** Full name */
    fullName: string;
    /** Date of birth (YYYY-MM-DD) */
    dateOfBirth: string;
    /** Gender */
    gender: "male" | "female" | "other";
    /** National ID (CCCD) */
    nationalId: string;
    /** Phone number */
    phoneNumber: string;
    /** Email */
    email: string;
    /** Vietnamese citizenship */
    vietnameseCitizen: boolean;
    /** Marital status */
    maritalStatus: "single" | "married" | "divorced" | "widowed";
    /** Number of dependents */
    dependentsCount: number;
  };

  /** Residential information */
  residenceInfo: {
    /** Current address */
    currentAddress: {
      province: string;
      district: string;
      ward: string;
      street: string;
    };
    /** Residence status */
    residenceStatus: "owner" | "renter" | "family" | "other";
    /** Duration at current address (months) */
    durationMonths: number;
    /** Whether permanent address matches current */
    permanentAddressMatches: boolean;
  };

  /** Employment information */
  employmentInfo: {
    /** Employment type */
    employmentType:
      | "formal"
      | "informal"
      | "self_employed"
      | "business_owner"
      | "retired"
      | "unemployed"
      | "student";
    /** Employment status */
    employmentStatus:
      | "full_time"
      | "part_time"
      | "contract"
      | "freelance"
      | "temporary";
    /** Company name */
    companyName?: string;
    /** Job title */
    jobTitle?: string;
    /** Industry */
    industry?: string;
    /** Work duration (months) */
    workDurationMonths: number;
    /** Total work experience (years) */
    totalWorkExperienceYears: number;
    /** Monthly income */
    monthlyIncome: number;
    /** Income source */
    incomeSource:
      | "salary"
      | "business"
      | "investment"
      | "rental"
      | "pension"
      | "other";
    /** Income stability (stable/variable/seasonal) */
    incomeStability: "stable" | "variable" | "seasonal";
    /** Whether can provide income proof */
    canProvideIncomeProof: boolean;
  };

  /** Financial information */
  financialInfo: {
    /** Existing monthly debt payments */
    existingMonthlyDebtPayments: number;
    /** Bank account information */
    hasBankAccount: boolean;
    /** Bank account duration (months) */
    bankAccountDurationMonths?: number;
    /** Credit score */
    creditScore?: number;
    /** Credit history length (months) */
    creditHistoryLengthMonths?: number;
    /** Previous loan history */
    previousLoanHistory: {
      hasPreviousLoans: boolean;
      onTimePaymentsPercentage?: number;
      currentOverdueAmount?: number;
      pastDefaultsCount?: number;
    };
    /** Assets */
    assets: {
      hasRealEstate: boolean;
      realEstateValue?: number;
      hasVehicle: boolean;
      vehicleValue?: number;
      hasSavings: boolean;
      savingsAmount?: number;
      hasOtherAssets: boolean;
      otherAssetsValue?: number;
    };
  };

  /** Loan requirements */
  loanRequirements: {
    /** Loan amount requested */
    requestedAmount: number;
    /** Loan term requested */
    requestedTerm: number;
    /** Loan purpose */
    loanPurpose: VietnameseLoanType;
    /** Collateral available */
    collateralAvailable: boolean;
    /** Collateral type */
    collateralType?:
      | "real_estate"
      | "vehicle"
      | "savings_book"
      | "guarantor"
      | "other";
    /** Collateral value */
    collateralValue?: number;
    /** Preferred repayment method */
    preferredRepaymentMethod:
      | "bank_transfer"
      | "cash"
      | "salary_deduction"
      | "auto_debit";
    /** Application urgency */
    applicationUrgency:
      | "immediate"
      | "within_week"
      | "within_month"
      | "flexible";
  };

  /** Special circumstances */
  specialCircumstances?: {
    /** Government employee */
    isGovernmentEmployee?: boolean;
    /** Healthcare worker */
    isHealthcareWorker?: boolean;
    /** Teacher */
    isTeacher?: boolean;
    /** Student */
    isStudent?: boolean;
    /** First-time borrower */
    isFirstTimeBorrower?: boolean;
    /** Salary account holder */
    salaryAccountHolder?: {
      bankCode: string;
      durationMonths: number;
    };
    /** Existing customer */
    existingCustomer?: {
      bankCode: string;
      relationshipDurationMonths: number;
      hasGoodHistory: boolean;
    };
  };
}

/**
 * Vietnamese Eligibility Engine
 */
export class VietnameseEligibilityEngine {
  /**
   * Check comprehensive eligibility for a loan product
   */
  static checkEligibility(
    profile: ApplicantProfile,
    product: VietnameseLoanProduct,
  ): EligibilityResult {
    const criteria: EligibilityCriterion[] = [];
    const passedCriteria: EligibilityCriterion[] = [];
    const failedCriteria: EligibilityCriterion[] = [];
    const warningCriteria: EligibilityCriterion[] = [];

    let totalScore = 0;
    let maxScore = 0;

    // 1. Basic eligibility criteria
    const basicCriteria = VietnameseEligibilityEngine.checkBasicEligibility(
      profile,
      product,
    );
    criteria.push(...basicCriteria);

    // 2. Age eligibility
    const ageCriteria = VietnameseEligibilityEngine.checkAgeEligibility(
      profile,
      product,
    );
    criteria.push(...ageCriteria);

    // 3. Citizenship eligibility
    const citizenshipCriteria =
      VietnameseEligibilityEngine.checkCitizenshipEligibility(profile, product);
    criteria.push(...citizenshipCriteria);

    // 4. Employment eligibility
    const employmentCriteria =
      VietnameseEligibilityEngine.checkEmploymentEligibility(profile, product);
    criteria.push(...employmentCriteria);

    // 5. Income eligibility
    const incomeCriteria = VietnameseEligibilityEngine.checkIncomeEligibility(
      profile,
      product,
    );
    criteria.push(...incomeCriteria);

    // 6. Credit eligibility
    const creditCriteria = VietnameseEligibilityEngine.checkCreditEligibility(
      profile,
      product,
    );
    criteria.push(...creditCriteria);

    // 7. Debt-to-income ratio
    const dtiCriteria =
      VietnameseEligibilityEngine.checkDebtToIncomeEligibility(
        profile,
        product,
      );
    criteria.push(...dtiCriteria);

    // 8. Collateral eligibility
    const collateralCriteria =
      VietnameseEligibilityEngine.checkCollateralEligibility(profile, product);
    criteria.push(...collateralCriteria);

    // 9. Loan amount eligibility
    const loanAmountCriteria =
      VietnameseEligibilityEngine.checkLoanAmountEligibility(profile, product);
    criteria.push(...loanAmountCriteria);

    // 10. Loan term eligibility
    const loanTermCriteria =
      VietnameseEligibilityEngine.checkLoanTermEligibility(profile, product);
    criteria.push(...loanTermCriteria);

    // 11. Special program eligibility
    const specialCriteria =
      VietnameseEligibilityEngine.checkSpecialProgramEligibility(
        profile,
        product,
      );
    criteria.push(...specialCriteria);

    // Separate passed, failed, and warning criteria
    for (const criterion of criteria) {
      maxScore += criterion.weight * 100;

      if (criterion.passed) {
        totalScore += criterion.weight * 100;
        passedCriteria.push(criterion);
      } else {
        if (criterion.importance === "critical") {
          failedCriteria.push(criterion);
        } else {
          warningCriteria.push(criterion);
        }
      }
    }

    const overallScore =
      maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;

    // Determine overall eligibility
    const hasCriticalFailures = failedCriteria.some(
      (c) => c.importance === "critical",
    );
    const eligible = !hasCriticalFailures && overallScore >= 50;

    // Determine confidence level
    let confidence: "low" | "medium" | "high" = "low";
    if (overallScore >= 80) confidence = "high";
    else if (overallScore >= 60) confidence = "medium";

    // Generate recommendations
    const recommendations = VietnameseEligibilityEngine.generateRecommendations(
      failedCriteria,
      warningCriteria,
    );
    const recommendationsVi =
      VietnameseEligibilityEngine.generateRecommendationsVi(
        failedCriteria,
        warningCriteria,
      );

    // Generate required documents
    const requiredDocuments =
      VietnameseEligibilityEngine.generateRequiredDocuments(profile, product);

    // Generate next steps
    const nextSteps = VietnameseEligibilityEngine.generateNextSteps(
      eligible,
      confidence,
      failedCriteria,
    );
    const nextStepsVi = VietnameseEligibilityEngine.generateNextStepsVi(
      eligible,
      confidence,
      failedCriteria,
    );

    return {
      eligible,
      score: overallScore,
      confidence,
      passedCriteria,
      failedCriteria,
      warningCriteria,
      recommendations,
      recommendationsVi,
      requiredDocuments,
      nextSteps,
      nextStepsVi,
    };
  }

  /**
   * Check basic eligibility
   */
  private static checkBasicEligibility(
    profile: ApplicantProfile,
    _product: VietnameseLoanProduct,
  ): EligibilityCriterion[] {
    const criteria: EligibilityCriterion[] = [];

    // Check if profile is complete
    criteria.push({
      name: "Complete Profile",
      nameVi: "Hồ sơ đầy đủ",
      passed:
        !!profile.personalInfo.fullName && !!profile.personalInfo.nationalId,
      actualValue: profile.personalInfo.fullName ? "Complete" : "Incomplete",
      requiredValue: "Complete",
      importance: "critical",
      weight: 0.1,
      reason: profile.personalInfo.fullName
        ? undefined
        : "Profile information is incomplete",
      reasonVi: profile.personalInfo.fullName
        ? undefined
        : "Thông tin hồ sơ chưa đầy đủ",
    });

    return criteria;
  }

  /**
   * Check age eligibility
   */
  private static checkAgeEligibility(
    profile: ApplicantProfile,
    product: VietnameseLoanProduct,
  ): EligibilityCriterion[] {
    const criteria: EligibilityCriterion[] = [];
    const age = VietnameseEligibilityEngine.calculateAge(
      profile.personalInfo.dateOfBirth,
    );

    // Minimum age check
    criteria.push({
      name: "Minimum Age",
      nameVi: "Tuổi tối thiểu",
      passed: age >= product.eligibility.minAge,
      actualValue: age,
      requiredValue: product.eligibility.minAge,
      importance: "critical",
      weight: 0.15,
      reason:
        age >= product.eligibility.minAge
          ? undefined
          : `Age ${age} is below minimum ${product.eligibility.minAge}`,
      reasonVi:
        age >= product.eligibility.minAge
          ? undefined
          : `Tuổi ${age} thấp hơn tối thiểu ${product.eligibility.minAge}`,
    });

    // Maximum age at maturity check
    const ageAtMaturity = age + profile.loanRequirements.requestedTerm / 12;
    criteria.push({
      name: "Maximum Age at Maturity",
      nameVi: "Tuổi tối đa tại thời điểm đáo hạn",
      passed: ageAtMaturity <= product.eligibility.maxAgeAtMaturity,
      actualValue: ageAtMaturity,
      requiredValue: product.eligibility.maxAgeAtMaturity,
      importance: "critical",
      weight: 0.15,
      reason:
        ageAtMaturity <= product.eligibility.maxAgeAtMaturity
          ? undefined
          : `Age at maturity ${ageAtMaturity} exceeds maximum ${product.eligibility.maxAgeAtMaturity}`,
      reasonVi:
        ageAtMaturity <= product.eligibility.maxAgeAtMaturity
          ? undefined
          : `Tuổi tại thời điểm đáo hạn ${ageAtMaturity} vượt quá tối đa ${product.eligibility.maxAgeAtMaturity}`,
    });

    return criteria;
  }

  /**
   * Check citizenship eligibility
   */
  private static checkCitizenshipEligibility(
    profile: ApplicantProfile,
    product: VietnameseLoanProduct,
  ): EligibilityCriterion[] {
    const criteria: EligibilityCriterion[] = [];

    criteria.push({
      name: "Vietnamese Citizenship",
      nameVi: "Quốc tịch Việt Nam",
      passed:
        !product.eligibility.vietnameseCitizen ||
        profile.personalInfo.vietnameseCitizen,
      actualValue: profile.personalInfo.vietnameseCitizen,
      requiredValue: product.eligibility.vietnameseCitizen,
      importance: product.eligibility.vietnameseCitizen
        ? "critical"
        : "optional",
      weight: product.eligibility.vietnameseCitizen ? 0.1 : 0.05,
      reason:
        product.eligibility.vietnameseCitizen &&
        !profile.personalInfo.vietnameseCitizen
          ? "Vietnamese citizenship required"
          : undefined,
      reasonVi:
        product.eligibility.vietnameseCitizen &&
        !profile.personalInfo.vietnameseCitizen
          ? "Yêu cầu quốc tịch Việt Nam"
          : undefined,
    });

    return criteria;
  }

  /**
   * Check employment eligibility
   */
  private static checkEmploymentEligibility(
    profile: ApplicantProfile,
    product: VietnameseLoanProduct,
  ): EligibilityCriterion[] {
    const criteria: EligibilityCriterion[] = [];

    // Employment type check
    const validEmploymentTypes =
      product.eligibility.employmentTypes?.filter((type) =>
        ["formal", "informal", "self_employed", "business_owner"].includes(
          type,
        ),
      ) || [];

    if (validEmploymentTypes && validEmploymentTypes.length > 0) {
      const isEmploymentTypeEligible = validEmploymentTypes.includes(
        profile.employmentInfo.employmentType as
          | "formal"
          | "informal"
          | "self_employed"
          | "business_owner",
      );
      criteria.push({
        name: "Employment Type",
        nameVi: "Loại hình việc làm",
        passed: isEmploymentTypeEligible,
        actualValue: profile.employmentInfo.employmentType,
        requiredValue: validEmploymentTypes,
        importance: "critical",
        weight: 0.1,
        reason: isEmploymentTypeEligible
          ? undefined
          : `Employment type ${profile.employmentInfo.employmentType} not eligible`,
        reasonVi: isEmploymentTypeEligible
          ? undefined
          : `Loại hình việc làm ${profile.employmentInfo.employmentType} không đủ điều kiện`,
      });
    }

    // Employment duration check
    if (product.eligibility.minEmploymentDuration) {
      const requiredMonths =
        product.eligibility.minEmploymentDuration.years * 12 +
        product.eligibility.minEmploymentDuration.months;
      criteria.push({
        name: "Employment Duration",
        nameVi: "Thời gian làm việc",
        passed: profile.employmentInfo.workDurationMonths >= requiredMonths,
        actualValue: profile.employmentInfo.workDurationMonths,
        requiredValue: requiredMonths,
        importance: "important",
        weight: 0.08,
        reason:
          profile.employmentInfo.workDurationMonths >= requiredMonths
            ? undefined
            : `Employment duration ${profile.employmentInfo.workDurationMonths} months below required ${requiredMonths} months`,
        reasonVi:
          profile.employmentInfo.workDurationMonths >= requiredMonths
            ? undefined
            : `Thời gian làm việc ${profile.employmentInfo.workDurationMonths} tháng thấp hơn yêu cầu ${requiredMonths} tháng`,
      });
    }

    // Income proof capability
    criteria.push({
      name: "Income Proof Capability",
      nameVi: "Khả năng chứng minh thu nhập",
      passed: profile.employmentInfo.canProvideIncomeProof,
      actualValue: profile.employmentInfo.canProvideIncomeProof,
      requiredValue: true,
      importance: "important",
      weight: 0.05,
      reason: profile.employmentInfo.canProvideIncomeProof
        ? undefined
        : "Unable to provide income proof",
      reasonVi: profile.employmentInfo.canProvideIncomeProof
        ? undefined
        : "Không thể chứng minh thu nhập",
    });

    return criteria;
  }

  /**
   * Check income eligibility
   */
  private static checkIncomeEligibility(
    profile: ApplicantProfile,
    product: VietnameseLoanProduct,
  ): EligibilityCriterion[] {
    const criteria: EligibilityCriterion[] = [];

    // Minimum income check
    criteria.push({
      name: "Minimum Monthly Income",
      nameVi: "Thu nhập hàng tháng tối thiểu",
      passed:
        profile.employmentInfo.monthlyIncome >=
        product.eligibility.minMonthlyIncome,
      actualValue: profile.employmentInfo.monthlyIncome,
      requiredValue: product.eligibility.minMonthlyIncome,
      importance: "critical",
      weight: 0.15,
      reason:
        profile.employmentInfo.monthlyIncome >=
        product.eligibility.minMonthlyIncome
          ? undefined
          : `Income ${VietnameseEligibilityEngine.formatCurrency(profile.employmentInfo.monthlyIncome)} below minimum ${VietnameseEligibilityEngine.formatCurrency(product.eligibility.minMonthlyIncome)}`,
      reasonVi:
        profile.employmentInfo.monthlyIncome >=
        product.eligibility.minMonthlyIncome
          ? undefined
          : `Thu nhập ${VietnameseEligibilityEngine.formatCurrency(profile.employmentInfo.monthlyIncome)} thấp hơn tối thiểu ${VietnameseEligibilityEngine.formatCurrency(product.eligibility.minMonthlyIncome)}`,
    });

    // Maximum income check (if specified)
    if (product.eligibility.maxMonthlyIncome) {
      criteria.push({
        name: "Maximum Monthly Income",
        nameVi: "Thu nhập hàng tháng tối đa",
        passed:
          profile.employmentInfo.monthlyIncome <=
          product.eligibility.maxMonthlyIncome,
        actualValue: profile.employmentInfo.monthlyIncome,
        requiredValue: product.eligibility.maxMonthlyIncome,
        importance: "important",
        weight: 0.05,
        reason:
          profile.employmentInfo.monthlyIncome <=
          product.eligibility.maxMonthlyIncome
            ? undefined
            : `Income ${VietnameseEligibilityEngine.formatCurrency(profile.employmentInfo.monthlyIncome)} exceeds maximum ${VietnameseEligibilityEngine.formatCurrency(product.eligibility.maxMonthlyIncome)}`,
        reasonVi:
          profile.employmentInfo.monthlyIncome <=
          product.eligibility.maxMonthlyIncome
            ? undefined
            : `Thu nhập ${VietnameseEligibilityEngine.formatCurrency(profile.employmentInfo.monthlyIncome)} vượt quá tối đa ${VietnameseEligibilityEngine.formatCurrency(product.eligibility.maxMonthlyIncome)}`,
      });
    }

    return criteria;
  }

  /**
   * Check credit eligibility
   */
  private static checkCreditEligibility(
    profile: ApplicantProfile,
    product: VietnameseLoanProduct,
  ): EligibilityCriterion[] {
    const criteria: EligibilityCriterion[] = [];

    // Credit score check
    if (
      product.eligibility.minCreditScore &&
      profile.financialInfo.creditScore
    ) {
      criteria.push({
        name: "Credit Score",
        nameVi: "Điểm tín dụng",
        passed:
          profile.financialInfo.creditScore >=
          product.eligibility.minCreditScore,
        actualValue: profile.financialInfo.creditScore,
        requiredValue: product.eligibility.minCreditScore,
        importance: "critical",
        weight: 0.1,
        reason:
          profile.financialInfo.creditScore >=
          product.eligibility.minCreditScore
            ? undefined
            : `Credit score ${profile.financialInfo.creditScore} below minimum ${product.eligibility.minCreditScore}`,
        reasonVi:
          profile.financialInfo.creditScore >=
          product.eligibility.minCreditScore
            ? undefined
            : `Điểm tín dụng ${profile.financialInfo.creditScore} thấp hơn tối thiểu ${product.eligibility.minCreditScore}`,
      });
    }

    // Credit history check
    if (profile.financialInfo.previousLoanHistory.hasPreviousLoans) {
      const onTimePayments =
        profile.financialInfo.previousLoanHistory.onTimePaymentsPercentage || 0;
      criteria.push({
        name: "Payment History",
        nameVi: "Lịch sử trả nợ",
        passed: onTimePayments >= 90,
        actualValue: onTimePayments,
        requiredValue: 90,
        importance: "important",
        weight: 0.05,
        reason:
          onTimePayments >= 90
            ? undefined
            : `On-time payment rate ${onTimePayments}% below recommended 90%`,
        reasonVi:
          onTimePayments >= 90
            ? undefined
            : `Tỷ lệ trả đúng hạn ${onTimePayments}% thấp hơn khuyến nghị 90%`,
      });

      // Check for defaults
      const defaultsCount =
        profile.financialInfo.previousLoanHistory.pastDefaultsCount || 0;
      criteria.push({
        name: "Default History",
        nameVi: "Lịch sử vỡ nợ",
        passed: defaultsCount === 0,
        actualValue: defaultsCount,
        requiredValue: 0,
        importance: "critical",
        weight: 0.08,
        reason:
          defaultsCount === 0
            ? undefined
            : `Has ${defaultsCount} past defaults`,
        reasonVi:
          defaultsCount === 0
            ? undefined
            : `Có ${defaultsCount} lần vỡ nợ trong quá khứ`,
      });
    }

    return criteria;
  }

  /**
   * Check debt-to-income eligibility
   */
  private static checkDebtToIncomeEligibility(
    profile: ApplicantProfile,
    product: VietnameseLoanProduct,
  ): EligibilityCriterion[] {
    const criteria: EligibilityCriterion[] = [];

    const monthlyIncome = profile.employmentInfo.monthlyIncome;
    const existingDebt = profile.financialInfo.existingMonthlyDebtPayments;
    const currentDTI = (existingDebt / monthlyIncome) * 100;

    criteria.push({
      name: "Current Debt-to-Income Ratio",
      nameVi: "Tỷ lệ nợ trên thu nhập hiện tại",
      passed: currentDTI <= 50, // General guideline
      actualValue: currentDTI,
      requiredValue: 50,
      importance: "important",
      weight: 0.05,
      reason:
        currentDTI <= 50
          ? undefined
          : `Current DTI ${currentDTI.toFixed(1)}% exceeds recommended 50%`,
      reasonVi:
        currentDTI <= 50
          ? undefined
          : `DTI hiện tại ${currentDTI.toFixed(1)}% vượt quá khuyến nghị 50%`,
    });

    if (product.eligibility.maxDebtToIncomeRatio) {
      criteria.push({
        name: "Product DTI Limit",
        nameVi: "Giới hạn DTI sản phẩm",
        passed: currentDTI <= product.eligibility.maxDebtToIncomeRatio,
        actualValue: currentDTI,
        requiredValue: product.eligibility.maxDebtToIncomeRatio,
        importance: "critical",
        weight: 0.08,
        reason:
          currentDTI <= product.eligibility.maxDebtToIncomeRatio
            ? undefined
            : `DTI ${currentDTI.toFixed(1)}% exceeds product maximum ${product.eligibility.maxDebtToIncomeRatio}%`,
        reasonVi:
          currentDTI <= product.eligibility.maxDebtToIncomeRatio
            ? undefined
            : `DTI ${currentDTI.toFixed(1)}% vượt quá tối đa sản phẩm ${product.eligibility.maxDebtToIncomeRatio}%`,
      });
    }

    return criteria;
  }

  /**
   * Check collateral eligibility
   */
  private static checkCollateralEligibility(
    profile: ApplicantProfile,
    product: VietnameseLoanProduct,
  ): EligibilityCriterion[] {
    const criteria: EligibilityCriterion[] = [];

    // Collateral requirement check
    if (product.eligibility.collateralRequired) {
      criteria.push({
        name: "Collateral Requirement",
        nameVi: "Yêu cầu tài sản đảm bảo",
        passed: profile.loanRequirements.collateralAvailable,
        actualValue: profile.loanRequirements.collateralAvailable,
        requiredValue: true,
        importance: "critical",
        weight: 0.1,
        reason: profile.loanRequirements.collateralAvailable
          ? undefined
          : "Collateral required but not available",
        reasonVi: profile.loanRequirements.collateralAvailable
          ? undefined
          : "Yêu cầu tài sản đảm bảo nhưng chưa có",
      });

      // Collateral type check
      if (
        profile.loanRequirements.collateralAvailable &&
        product.eligibility.acceptedCollateralTypes
      ) {
        criteria.push({
          name: "Collateral Type",
          nameVi: "Loại tài sản đảm bảo",
          passed:
            !!profile.loanRequirements.collateralType &&
            product.eligibility.acceptedCollateralTypes.includes(
              profile.loanRequirements.collateralType,
            ),
          actualValue: profile.loanRequirements.collateralType,
          requiredValue: product.eligibility.acceptedCollateralTypes,
          importance: "critical",
          weight: 0.08,
          reason:
            profile.loanRequirements.collateralType &&
            product.eligibility.acceptedCollateralTypes.includes(
              profile.loanRequirements.collateralType,
            )
              ? undefined
              : `Collateral type ${profile.loanRequirements.collateralType} not accepted`,
          reasonVi:
            profile.loanRequirements.collateralType &&
            product.eligibility.acceptedCollateralTypes.includes(
              profile.loanRequirements.collateralType,
            )
              ? undefined
              : `Loại tài sản ${profile.loanRequirements.collateralType} không được chấp nhận`,
        });
      }

      // Loan-to-value ratio check
      if (
        profile.loanRequirements.collateralValue &&
        product.eligibility.maxLoanToValueRatio
      ) {
        const requestedAmount = profile.loanRequirements.requestedAmount;
        const collateralValue = profile.loanRequirements.collateralValue;
        const ltvRatio = (requestedAmount / collateralValue) * 100;

        criteria.push({
          name: "Loan-to-Value Ratio",
          nameVi: "Tỷ lệ vay trên giá trị tài sản",
          passed: ltvRatio <= product.eligibility.maxLoanToValueRatio,
          actualValue: ltvRatio,
          requiredValue: product.eligibility.maxLoanToValueRatio,
          importance: "important",
          weight: 0.05,
          reason:
            ltvRatio <= product.eligibility.maxLoanToValueRatio
              ? undefined
              : `LTV ${ltvRatio.toFixed(1)}% exceeds maximum ${product.eligibility.maxLoanToValueRatio}%`,
          reasonVi:
            ltvRatio <= product.eligibility.maxLoanToValueRatio
              ? undefined
              : `LTV ${ltvRatio.toFixed(1)}% vượt quá tối đa ${product.eligibility.maxLoanToValueRatio}%`,
        });
      }
    }

    return criteria;
  }

  /**
   * Check loan amount eligibility
   */
  private static checkLoanAmountEligibility(
    profile: ApplicantProfile,
    product: VietnameseLoanProduct,
  ): EligibilityCriterion[] {
    const criteria: EligibilityCriterion[] = [];
    const requestedAmount = profile.loanRequirements.requestedAmount;

    // Minimum amount check
    criteria.push({
      name: "Minimum Loan Amount",
      nameVi: "Số tiền vay tối thiểu",
      passed: requestedAmount >= product.amountLimits.min,
      actualValue: requestedAmount,
      requiredValue: product.amountLimits.min,
      importance: "critical",
      weight: 0.08,
      reason:
        requestedAmount >= product.amountLimits.min
          ? undefined
          : `Requested amount ${VietnameseEligibilityEngine.formatCurrency(requestedAmount)} below minimum ${VietnameseEligibilityEngine.formatCurrency(product.amountLimits.min)}`,
      reasonVi:
        requestedAmount >= product.amountLimits.min
          ? undefined
          : `Số tiền yêu cầu ${VietnameseEligibilityEngine.formatCurrency(requestedAmount)} thấp hơn tối thiểu ${VietnameseEligibilityEngine.formatCurrency(product.amountLimits.min)}`,
    });

    // Maximum amount check
    criteria.push({
      name: "Maximum Loan Amount",
      nameVi: "Số tiền vay tối đa",
      passed: requestedAmount <= product.amountLimits.max,
      actualValue: requestedAmount,
      requiredValue: product.amountLimits.max,
      importance: "critical",
      weight: 0.08,
      reason:
        requestedAmount <= product.amountLimits.max
          ? undefined
          : `Requested amount ${VietnameseEligibilityEngine.formatCurrency(requestedAmount)} exceeds maximum ${VietnameseEligibilityEngine.formatCurrency(product.amountLimits.max)}`,
      reasonVi:
        requestedAmount <= product.amountLimits.max
          ? undefined
          : `Số tiền yêu cầu ${VietnameseEligibilityEngine.formatCurrency(requestedAmount)} vượt quá tối đa ${VietnameseEligibilityEngine.formatCurrency(product.amountLimits.max)}`,
    });

    return criteria;
  }

  /**
   * Check loan term eligibility
   */
  private static checkLoanTermEligibility(
    profile: ApplicantProfile,
    product: VietnameseLoanProduct,
  ): EligibilityCriterion[] {
    const criteria: EligibilityCriterion[] = [];
    const requestedTerm = profile.loanRequirements.requestedTerm;

    // Minimum term check
    criteria.push({
      name: "Minimum Loan Term",
      nameVi: "Thời gian vay tối thiểu",
      passed: requestedTerm >= product.termOptions.min,
      actualValue: requestedTerm,
      requiredValue: product.termOptions.min,
      importance: "critical",
      weight: 0.05,
      reason:
        requestedTerm >= product.termOptions.min
          ? undefined
          : `Requested term ${requestedTerm} months below minimum ${product.termOptions.min} months`,
      reasonVi:
        requestedTerm >= product.termOptions.min
          ? undefined
          : `Thời gian vay yêu cầu ${requestedTerm} tháng thấp hơn tối thiểu ${product.termOptions.min} tháng`,
    });

    // Maximum term check
    criteria.push({
      name: "Maximum Loan Term",
      nameVi: "Thời gian vay tối đa",
      passed: requestedTerm <= product.termOptions.max,
      actualValue: requestedTerm,
      requiredValue: product.termOptions.max,
      importance: "critical",
      weight: 0.05,
      reason:
        requestedTerm <= product.termOptions.max
          ? undefined
          : `Requested term ${requestedTerm} months exceeds maximum ${product.termOptions.max} months`,
      reasonVi:
        requestedTerm <= product.termOptions.max
          ? undefined
          : `Thời gian vay yêu cầu ${requestedTerm} tháng vượt quá tối đa ${product.termOptions.max} tháng`,
    });

    return criteria;
  }

  /**
   * Check special program eligibility
   */
  private static checkSpecialProgramEligibility(
    profile: ApplicantProfile,
    product: VietnameseLoanProduct,
  ): EligibilityCriterion[] {
    const criteria: EligibilityCriterion[] = [];

    // Government employee programs
    if (
      product.specialConditions?.targetProfessions?.includes(
        "Government employees",
      )
    ) {
      criteria.push({
        name: "Government Employee Program",
        nameVi: "Chương trình công chức",
        passed: !!profile.specialCircumstances?.isGovernmentEmployee,
        actualValue:
          profile.specialCircumstances?.isGovernmentEmployee || false,
        requiredValue: true,
        importance: "optional",
        weight: 0.03,
        reason: profile.specialCircumstances?.isGovernmentEmployee
          ? undefined
          : "Not a government employee",
        reasonVi: profile.specialCircumstances?.isGovernmentEmployee
          ? undefined
          : "Không phải là công chức",
      });
    }

    // Student programs
    if (product.loanType === "student_loan") {
      criteria.push({
        name: "Student Status",
        nameVi: "Tình trạng sinh viên",
        passed:
          !!profile.specialCircumstances?.isStudent ||
          profile.employmentInfo.employmentType === "student",
        actualValue:
          profile.specialCircumstances?.isStudent ||
          profile.employmentInfo.employmentType === "student",
        requiredValue: true,
        importance: "critical",
        weight: 0.1,
        reason:
          profile.specialCircumstances?.isStudent ||
          profile.employmentInfo.employmentType === "student"
            ? undefined
            : "Not a student",
        reasonVi:
          profile.specialCircumstances?.isStudent ||
          profile.employmentInfo.employmentType === "student"
            ? undefined
            : "Không phải là sinh viên",
      });
    }

    return criteria;
  }

  /**
   * Generate recommendations for improving eligibility
   */
  private static generateRecommendations(
    failedCriteria: EligibilityCriterion[],
    warningCriteria: EligibilityCriterion[],
  ): string[] {
    const recommendations: string[] = [];

    for (const criterion of failedCriteria) {
      switch (criterion.name) {
        case "Minimum Age":
          recommendations.push(
            "Consider waiting until you meet the minimum age requirement or explore other loan products with lower age requirements.",
          );
          break;
        case "Maximum Age at Maturity":
          recommendations.push(
            "Consider a shorter loan term or explore loan products with higher maximum age limits.",
          );
          break;
        case "Vietnamese Citizenship":
          recommendations.push(
            "This loan product requires Vietnamese citizenship. Please check with the bank about options for non-citizens.",
          );
          break;
        case "Employment Type":
          recommendations.push(
            "Consider employment options that meet the lender's requirements or explore loan products for your employment type.",
          );
          break;
        case "Employment Duration":
          recommendations.push(
            "Maintain current employment longer to meet the minimum duration requirement.",
          );
          break;
        case "Income Proof Capability":
          recommendations.push(
            "Prepare income documentation such as payslips, tax returns, or bank statements.",
          );
          break;
        case "Minimum Monthly Income":
          recommendations.push(
            "Consider increasing your income through additional sources or applying for a smaller loan amount.",
          );
          break;
        case "Credit Score":
          recommendations.push(
            "Work on improving your credit score by paying bills on time and reducing existing debt.",
          );
          break;
        case "Payment History":
          recommendations.push(
            "Focus on making all payments on time to improve your payment history.",
          );
          break;
        case "Default History":
          recommendations.push(
            "Wait until any negative items age off your credit report and demonstrate consistent on-time payments.",
          );
          break;
        case "Collateral Requirement":
          recommendations.push(
            "Prepare acceptable collateral such as real estate, vehicles, or savings accounts.",
          );
          break;
        case "Minimum Loan Amount":
          recommendations.push(
            "Apply for a larger loan amount that meets the minimum requirement.",
          );
          break;
        case "Maximum Loan Amount":
          recommendations.push(
            "Apply for a smaller loan amount or consider providing additional collateral.",
          );
          break;
      }
    }

    for (const criterion of warningCriteria) {
      if (criterion.name === "Current Debt-to-Income Ratio") {
        recommendations.push(
          "Consider paying down existing debts to improve your debt-to-income ratio.",
        );
      }
    }

    return recommendations;
  }

  /**
   * Generate recommendations in Vietnamese
   */
  private static generateRecommendationsVi(
    failedCriteria: EligibilityCriterion[],
    warningCriteria: EligibilityCriterion[],
  ): string[] {
    const recommendations: string[] = [];

    for (const criterion of failedCriteria) {
      switch (criterion.name) {
        case "Minimum Age":
          recommendations.push(
            "Cân nhắc đợi đến khi đủ tuổi tối thiểu hoặc khám phá các sản phẩm vay khác có yêu cầu tuổi thấp hơn.",
          );
          break;
        case "Maximum Age at Maturity":
          recommendations.push(
            "Cân nhắc thời gian vay ngắn hơn hoặc khám phá các sản phẩm vay có giới hạn tuổi cao hơn.",
          );
          break;
        case "Vietnamese Citizenship":
          recommendations.push(
            "Sản phẩm vay này yêu cầu quốc tịch Việt Nam. Vui lòng kiểm tra với ngân hàng về các lựa chọn cho người không phải công dân Việt Nam.",
          );
          break;
        case "Employment Type":
          recommendations.push(
            "Cân nhắc các lựa chọn việc làm đáp ứng yêu cầu của người cho vay hoặc khám phá các sản phẩm vay cho loại hình việc làm của bạn.",
          );
          break;
        case "Employment Duration":
          recommendations.push(
            "Duy trì việc làm hiện tại lâu hơn để đáp ứng yêu cầu thời gian tối thiểu.",
          );
          break;
        case "Income Proof Capability":
          recommendations.push(
            "Chuẩn bị tài liệu chứng minh thu nhập như bảng lương, tờ khai thuế, hoặc sao kê tài khoản ngân hàng.",
          );
          break;
        case "Minimum Monthly Income":
          recommendations.push(
            "Cân nhắc tăng thu nhập thông qua các nguồn bổ sung hoặc nộp đơn vay số tiền nhỏ hơn.",
          );
          break;
        case "Credit Score":
          recommendations.push(
            "Cải thiện điểm tín dụng bằng cách thanh toán hóa đơn đúng hạn và giảm nợ hiện có.",
          );
          break;
        case "Payment History":
          recommendations.push(
            "Tập trung thanh toán tất cả các khoản đúng hạn để cải thiện lịch sử thanh toán.",
          );
          break;
        case "Default History":
          recommendations.push(
            "Đợi cho đến khi các mục tiêu tiêu cực hết hạn trên báo cáo tín dụng và chứng minh thanh toán đúng hạn.",
          );
          break;
        case "Collateral Requirement":
          recommendations.push(
            "Chuẩn bị tài sản đảm bảo chấp nhận được như bất động sản, phương tiện, hoặc sổ tiết kiệm.",
          );
          break;
        case "Minimum Loan Amount":
          recommendations.push(
            "Nộp đơn vay số tiền lớn hơn đáp ứng yêu cầu tối thiểu.",
          );
          break;
        case "Maximum Loan Amount":
          recommendations.push(
            "Nộp đơn vay số tiền nhỏ hơn hoặc cân nhắc cung cấp tài sản đảm bảo bổ sung.",
          );
          break;
      }
    }

    for (const criterion of warningCriteria) {
      if (criterion.name === "Current Debt-to-Income Ratio") {
        recommendations.push(
          "Cân nhắc trả nợ hiện có để cải thiện tỷ lệ nợ trên thu nhập.",
        );
      }
    }

    return recommendations;
  }

  /**
   * Generate required documents list
   */
  private static generateRequiredDocuments(
    profile: ApplicantProfile,
    product: VietnameseLoanProduct,
  ): DocumentRequirement[] {
    const documents: DocumentRequirement[] = [];

    // Add basic documents
    documents.push({
      type: "national_id",
      typeVi: "CCCD/CMND",
      mandatory: true,
      description: "Valid national ID card (both sides)",
      descriptionVi: "CCCD/CMND còn hiệu lực (cả hai mặt)",
      validityRequirements: {
        maxAgeMonths: 12,
        originalRequired: false,
        certifiedCopyAccepted: true,
      },
      whereToObtain: "Local government office",
      whereToObtainVi: "Ủy ban nhân dân địa phương",
    });

    // Add income proof documents
    if (profile.employmentInfo.employmentType === "formal") {
      documents.push({
        type: "payslip",
        typeVi: "Bảng lương",
        mandatory: true,
        description: "Recent payslips (last 3 months)",
        descriptionVi: "Bảng lương gần nhất (3 tháng gần nhất)",
        validityRequirements: {
          maxAgeMonths: 3,
        },
        whereToObtain: "Employer's HR department",
        whereToObtainVi: "Phòng nhân sự công ty",
      });
    }

    if (
      profile.employmentInfo.employmentType === "self_employed" ||
      profile.employmentInfo.employmentType === "business_owner"
    ) {
      documents.push({
        type: "business_registration",
        typeVi: "Giấy đăng ký kinh doanh",
        mandatory: true,
        description: "Business registration certificate",
        descriptionVi: "Giấy chứng nhận đăng ký kinh doanh",
        validityRequirements: {
          originalRequired: true,
        },
        whereToObtain: "Department of Planning and Investment",
        whereToObtainVi: "Sở Kế hoạch và Đầu tư",
      });
    }

    // Add bank statements
    documents.push({
      type: "bank_statement",
      typeVi: "Sao kê tài khoản ngân hàng",
      mandatory: true,
      description: "Bank statements (last 6 months)",
      descriptionVi: "Sao kê tài khoản ngân hàng (6 tháng gần nhất)",
      validityRequirements: {
        maxAgeMonths: 1,
      },
      whereToObtain: "Your bank branch or online banking",
      whereToObtainVi: "Chi nhánh ngân hàng hoặc ngân hàng trực tuyến",
    });

    // Add collateral documents if required
    if (
      product.eligibility.collateralRequired &&
      profile.loanRequirements.collateralAvailable
    ) {
      switch (profile.loanRequirements.collateralType) {
        case "real_estate":
          documents.push({
            type: "property_documents",
            typeVi: "Giấy tờ bất động sản",
            mandatory: true,
            description: "Property ownership documents, land use certificate",
            descriptionVi:
              "Giấy tờ sở hữu bất động sản, giấy chứng nhận quyền sử dụng đất",
            whereToObtain: "Land registration office",
            whereToObtainVi: "Văn phòng đăng ký đất đai",
          });
          break;
        case "vehicle":
          documents.push({
            type: "vehicle_documents",
            typeVi: "Giấy tờ phương tiện",
            mandatory: true,
            description: "Vehicle registration certificate, insurance",
            descriptionVi: "Giấy đăng ký xe, bảo hiểm",
            whereToObtain: "Department of Transport",
            whereToObtainVi: "Sở Giao thông vận tải",
          });
          break;
      }
    }

    // Add existing loan documents
    if (profile.financialInfo.previousLoanHistory.hasPreviousLoans) {
      documents.push({
        type: "loan_statement",
        typeVi: "Sao kê khoản vay",
        mandatory: false,
        description: "Statements for existing loans",
        descriptionVi: "Sao kê các khoản vay hiện có",
        whereToObtain: "Current lenders",
        whereToObtainVi: "Các đơn vị cho vay hiện tại",
      });
    }

    return documents;
  }

  /**
   * Generate next steps
   */
  private static generateNextSteps(
    eligible: boolean,
    confidence: "low" | "medium" | "high",
    _failedCriteria: EligibilityCriterion[],
  ): string[] {
    const nextSteps: string[] = [];

    if (eligible) {
      if (confidence === "high") {
        nextSteps.push(
          "You can proceed with your loan application with high confidence of approval.",
        );
        nextSteps.push(
          "Prepare all required documents before starting the application.",
        );
        nextSteps.push("Consider applying online for faster processing.");
      } else if (confidence === "medium") {
        nextSteps.push(
          "You have a good chance of approval, but consider improving your profile.",
        );
        nextSteps.push(
          "Double-check all documents for accuracy and completeness.",
        );
        nextSteps.push(
          "Be prepared to provide additional information if requested.",
        );
      } else {
        nextSteps.push(
          "You meet minimum requirements, but consider strengthening your application.",
        );
        nextSteps.push(
          "Review the recommendations to improve your chances of approval.",
        );
        nextSteps.push(
          "Consider applying with a co-signer or additional collateral if possible.",
        );
      }
    } else {
      nextSteps.push(
        "Focus on addressing the critical eligibility issues identified.",
      );
      nextSteps.push(
        "Consider alternative loan products that better match your profile.",
      );
      nextSteps.push(
        "Work on improving your credit score and financial situation before reapplying.",
      );
    }

    return nextSteps;
  }

  /**
   * Generate next steps in Vietnamese
   */
  private static generateNextStepsVi(
    eligible: boolean,
    confidence: "low" | "medium" | "high",
    _failedCriteria: EligibilityCriterion[],
  ): string[] {
    const nextSteps: string[] = [];

    if (eligible) {
      if (confidence === "high") {
        nextSteps.push(
          "Bạn có thể tiếp tục đơn vay với khả năng phê duyệt cao.",
        );
        nextSteps.push(
          "Chuẩn bị tất cả tài liệu cần thiết trước khi bắt đầu hồ sơ.",
        );
        nextSteps.push("Cân nhắc nộp đơn trực tuyến để xử lý nhanh hơn.");
      } else if (confidence === "medium") {
        nextSteps.push(
          "Bạn có cơ hội phê duyệt tốt, nhưng hãy xem xét cải thiện hồ sơ.",
        );
        nextSteps.push(
          "Kiểm tra lại tất cả tài liệu để đảm bảo chính xác và đầy đủ.",
        );
        nextSteps.push("Sẵn sàng cung cấp thông tin bổ sung nếu được yêu cầu.");
      } else {
        nextSteps.push(
          "Bạn đáp ứng yêu cầu tối thiểu, nhưng hãy xem xét tăng cường hồ sơ.",
        );
        nextSteps.push(
          "Xem lại các khuyến nghị để cải thiện cơ hội phê duyệt.",
        );
        nextSteps.push(
          "Cân nhắc nộp đơn với người đồng ký hoặc tài sản đảm bảo bổ sung nếu có thể.",
        );
      }
    } else {
      nextSteps.push(
        "Tập trung giải quyết các vấn đề đủ điều kiện quan trọng được xác định.",
      );
      nextSteps.push(
        "Cân nhắc các sản phẩm vay khác phù hợp hơn với hồ sơ của bạn.",
      );
      nextSteps.push(
        "Cải thiện điểm tín dụng và tình hình tài chính trước khi nộp đơn lại.",
      );
    }

    return nextSteps;
  }

  /**
   * Calculate age from date of birth
   */
  private static calculateAge(dateOfBirth: string): number {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return age;
  }

  /**
   * Format currency amount
   */
  private static formatCurrency(amount: number): string {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  }
}
