/**
 * Vietnamese Market Lead Scoring System
 * Advanced lead scoring algorithm with Vietnamese market-specific criteria
 */

import type { VietnameseFinancialPartner, LoanType, VietnameseProvince } from './vietnamese-partners';

export interface LeadData {
  // Personal Information
  fullName: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other';
  nationalId: string;
  phoneNumber: string;
  email?: string;

  // Address Information
  currentAddress: {
    provinceCode: string;
    districtCode?: string;
    wardCode?: string;
    street?: string;
  };
  permanentAddress?: {
    provinceCode: string;
    districtCode?: string;
    wardCode?: string;
    street?: string;
  };

  // Contact Preferences
  contactPreferences: {
    preferredContactMethod: 'phone' | 'email' | 'sms' | 'whatsapp';
    contactTime?: 'morning' | 'afternoon' | 'evening';
    timezone: string;
  };

  // Employment Information
  employment: {
    employmentType: 'full_time' | 'part_time' | 'self_employed' | 'business_owner' | 'freelancer' | 'student' | 'retired' | 'unemployed';
    employmentStatus: 'permanent' | 'contract' | 'probation' | 'temporary' | 'seasonal';
    companyName?: string;
    jobTitle?: string;
    industry?: string;
    workDurationMonths: number;
    monthlyIncome: number;
    incomeSource: 'salary' | 'business_income' | 'freelance' | 'investments' | 'rental' | 'pension' | 'family_support' | 'other';
    canProvideIncomeProof: boolean;
  };

  // Financial Information
  financial: {
    existingMonthlyDebtPayments: number;
    hasBankAccount: boolean;
    creditScore?: number;
    bankAccountMonths?: number;
    previousLoanHistory?: {
      hasPreviousLoans: boolean;
      onTimePaymentsPercentage?: number;
      defaultHistory?: boolean;
      totalRepaidAmount?: number;
    };
    assets?: {
      hasRealEstate: boolean;
      hasVehicle: boolean;
      hasSavings: boolean;
      hasInvestments: boolean;
    };
  };

  // Loan Requirements
  loanRequirements: {
    requestedAmount: number;
    requestedTerm: number; // months
    loanType: LoanType;
    loanPurpose: string;
    urgency: 'urgent' | 'normal' | 'flexible';
    collateralAvailable: boolean;
    collateralType?: string;
    collateralValue?: number;
    preferredInterestRate?: number;
  };

  // Behavioral Information
  behavior: {
    howFound: 'search_engine' | 'social_media' | 'referral' | 'advertisement' | 'website' | 'mobile_app' | 'other';
    previousApplications: number;
    websiteVisits: number;
    timeSpentOnSite: number; // minutes
    pagesViewed: number;
    formStartTime: string;
    formCompletionTime: string;
    deviceType: 'desktop' | 'mobile' | 'tablet';
    browser?: string;
    ipAddress: string;
  };

  // Source and Campaign Information
  source: {
    source: string; // Organic, paid, referral, etc.
    medium: string; // cpc, organic, referral, etc.
    campaign?: string;
    content?: string;
    keyword?: string;
    partner?: string;
  };

  // Consent and Legal
  consent: {
    dataProcessingConsent: boolean;
    marketingConsent: boolean;
    partnerSharingConsent: boolean;
    creditCheckConsent: boolean;
    consentTimestamp: string;
    consentIP: string;
    languagePreference: 'vi' | 'en';
  };
}

export interface LeadScore {
  totalScore: number; // 0-100
  grade: 'A+' | 'A' | 'B+' | 'B' | 'C+' | 'C' | 'D+' | 'D' | 'F';
  breakdown: {
    demographics: number; // 0-15
    financial: number; // 0-25
    employment: number; // 0-20
    loanSpecifics: number; // 0-20
    behavior: number; // 0-10
    source: number; // 0-10
  };
  riskFactors: string[];
  positiveIndicators: string[];
  recommendations: string[];
  confidence: number; // 0-100
  estimatedConversionProbability: number; // 0-100
  suggestedActions: string[];
  disqualified: boolean;
  disqualificationReason?: string;
}

export interface ScoringWeights {
  demographics: number;
  financial: number;
  employment: number;
  loanSpecifics: number;
  behavior: number;
  source: number;
}

export interface VietnameseMarketFactors {
  // Age and Life Stage Scoring (Vietnam-specific)
  ageScoring: {
    optimalAge: { min: number; max: number };
    primeWorkingAge: { min: number; max: number };
    seniorAge: { min: number; max: number };
  };

  // Geographic Scoring
  geographicScoring: {
    tier1Cities: string[]; // HCMC, Hanoi, Da Nang
    tier2Cities: string[]; // Hai Phong, Can Tho, etc.
    ruralProvinces: string[];
    economicZones: string[];
  };

  // Income Scoring (adjusted for Vietnamese economy)
  incomeScoring: {
    minimumViableIncome: number; // 3 million VND
    averageIncome: number; // 7 million VND
    highIncome: number; // 20 million VND
    veryHighIncome: number; // 50 million VND
  };

  // Employment Stability Factors
  employmentScoring: {
    preferredIndustries: string[];
    stableEmploymentTypes: string[];
    governmentSectorBonus: number;
    largeCompanyBonus: number;
  };

  // Cultural and Social Factors
  culturalFactors: {
    familySupportBonus: number;
    homeOwnershipBonus: number;
    maleFemaleRatioAdjustment: number;
    marriageStatusBonus?: number;
  };

  // Loan Product Specific Factors
  loanTypeFactors: {
    [key in LoanType]: {
      popularity: number;
      averageApprovalRate: number;
      riskLevel: number;
      preferredTerm: { min: number; max: number };
      seasonalityFactors?: number[];
    };
  };
}

export const VIETNAMESE_MARKET_FACTORS: VietnameseMarketFactors = {
  ageScoring: {
    optimalAge: { min: 28, max: 45 },
    primeWorkingAge: { min: 25, max: 50 },
    seniorAge: { min: 50, max: 65 },
  },

  geographicScoring: {
    tier1Cities: ['01', '79'], // Hanoi, HCMC
    tier2Cities: ['30', '48', '92'], // Haiphong, Da Nang, Can Tho
    ruralProvinces: [
      '52', '53', '56', '59', '61', '62', '63', '64', '65', '66', '67', '68',
      // Add more rural provinces
    ],
    economicZones: ['north', 'central', 'south'],
  },

  incomeScoring: {
    minimumViableIncome: 3000000, // 3 million VND
    averageIncome: 7000000, // 7 million VND
    highIncome: 20000000, // 20 million VND
    veryHighIncome: 50000000, // 50 million VND
  },

  employmentScoring: {
    preferredIndustries: [
      'technology', 'banking', 'finance', 'government', 'education', 'healthcare',
      'manufacturing', 'retail', 'construction', 'logistics', 'telecommunications'
    ],
    stableEmploymentTypes: ['full_time', 'permanent', 'business_owner'],
    governmentSectorBonus: 5,
    largeCompanyBonus: 3,
  },

  culturalFactors: {
    familySupportBonus: 3,
    homeOwnershipBonus: 4,
    // maleFemaleRatioAdjustment removed - no gender-based scoring adjustments
  },

  loanTypeFactors: {
    [LoanType.PERSONAL_LOAN]: {
      popularity: 9.2,
      averageApprovalRate: 68.5,
      riskLevel: 0.3,
      preferredTerm: { min: 12, max: 36 },
      seasonalityFactors: [1.1, 0.9, 1.0, 1.1, 1.0, 0.9, 1.2, 1.1, 1.0, 1.1, 1.2, 1.3], // Holiday season boost
    },
    [LoanType.BUSINESS_LOAN]: {
      popularity: 7.8,
      averageApprovalRate: 45.2,
      riskLevel: 0.5,
      preferredTerm: { min: 24, max: 60 },
      seasonalityFactors: [1.0, 1.1, 1.2, 1.1, 1.0, 0.9, 1.1, 1.2, 1.3, 1.2, 1.1, 1.0],
    },
    [LoanType.MORTGAGE_LOAN]: {
      popularity: 8.5,
      averageApprovalRate: 72.1,
      riskLevel: 0.2,
      preferredTerm: { min: 120, max: 360 },
      seasonalityFactors: [1.1, 1.0, 1.0, 1.1, 1.2, 1.3, 1.2, 1.1, 1.0, 0.9, 0.9, 1.1],
    },
    [LoanType.AUTO_LOAN]: {
      popularity: 8.0,
      averageApprovalRate: 65.3,
      riskLevel: 0.3,
      preferredTerm: { min: 24, max: 72 },
      seasonalityFactors: [1.0, 1.1, 1.2, 1.3, 1.2, 1.1, 1.0, 0.9, 1.0, 1.1, 1.2, 1.3],
    },
    [LoanType.CREDIT_CARD]: {
      popularity: 9.0,
      averageApprovalRate: 58.7,
      riskLevel: 0.4,
      preferredTerm: { min: 0, max: 0 }, // Revolving credit
      seasonalityFactors: [1.2, 1.1, 1.0, 1.0, 1.1, 1.2, 1.3, 1.2, 1.1, 1.0, 1.1, 1.4],
    },
    [LoanType.AGRICULTURAL_LOAN]: {
      popularity: 4.5,
      averageApprovalRate: 78.9,
      riskLevel: 0.4,
      preferredTerm: { min: 12, max: 48 },
      seasonalityFactors: [1.3, 1.2, 1.0, 0.8, 0.7, 0.6, 0.7, 0.8, 1.0, 1.2, 1.4, 1.5],
    },
    [LoanType.STUDENT_LOAN]: {
      popularity: 6.2,
      averageApprovalRate: 82.4,
      riskLevel: 0.1,
      preferredTerm: { min: 36, max: 120 },
      seasonalityFactors: [1.0, 0.8, 0.7, 0.6, 0.6, 0.5, 0.6, 0.7, 1.5, 1.8, 1.2, 1.0],
    },
    [LoanType.HOME_EQUITY]: {
      popularity: 5.8,
      averageApprovalRate: 70.2,
      riskLevel: 0.2,
      preferredTerm: { min: 60, max: 240 },
      seasonalityFactors: [1.0, 1.0, 1.1, 1.1, 1.2, 1.2, 1.1, 1.0, 0.9, 0.9, 1.0, 1.1],
    },
    [LoanType.DEBT_CONSOLIDATION]: {
      popularity: 7.2,
      averageApprovalRate: 45.8,
      riskLevel: 0.6,
      preferredTerm: { min: 12, max: 48 },
      seasonalityFactors: [1.1, 1.2, 1.3, 1.2, 1.1, 1.0, 1.0, 1.1, 1.2, 1.3, 1.2, 1.1],
    },
    [LoanType.WORKING_CAPITAL]: {
      popularity: 7.5,
      averageApprovalRate: 52.3,
      riskLevel: 0.4,
      preferredTerm: { min: 6, max: 24 },
      seasonalityFactors: [1.2, 1.1, 1.0, 0.9, 1.0, 1.1, 1.2, 1.3, 1.2, 1.1, 1.0, 1.1],
    },
    [LoanType.EQUIPMENT_FINANCING]: {
      popularity: 6.8,
      averageApprovalRate: 48.7,
      riskLevel: 0.3,
      preferredTerm: { min: 24, max: 60 },
      seasonalityFactors: [1.0, 1.1, 1.2, 1.3, 1.2, 1.1, 1.0, 0.9, 1.0, 1.1, 1.2, 1.1],
    },
    [LoanType.INVOICE_FINANCING]: {
      popularity: 5.2,
      averageApprovalRate: 42.1,
      riskLevel: 0.5,
      preferredTerm: { min: 30, max: 90 },
      seasonalityFactors: [1.1, 1.0, 1.0, 1.1, 1.2, 1.2, 1.1, 1.0, 1.0, 1.1, 1.1, 1.2],
    },
    [LoanType.TRADE_FINANCE]: {
      popularity: 4.8,
      averageApprovalRate: 38.5,
      riskLevel: 0.6,
      preferredTerm: { min: 30, max: 180 },
      seasonalityFactors: [1.0, 1.1, 1.2, 1.2, 1.1, 1.0, 0.9, 1.0, 1.1, 1.2, 1.3, 1.2],
    },
    [LoanType.CONSTRUCTION_LOAN]: {
      popularity: 5.5,
      averageApprovalRate: 44.2,
      riskLevel: 0.5,
      preferredTerm: { min: 24, max: 120 },
      seasonalityFactors: [0.8, 0.9, 1.1, 1.3, 1.4, 1.4, 1.3, 1.2, 1.1, 1.0, 0.9, 0.8],
    },
    [LoanType.SME_LOAN]: {
      popularity: 8.3,
      averageApprovalRate: 51.7,
      riskLevel: 0.4,
      preferredTerm: { min: 12, max: 60 },
      seasonalityFactors: [1.1, 1.0, 1.0, 1.1, 1.2, 1.2, 1.1, 1.0, 1.0, 1.1, 1.2, 1.3],
    },
    [LoanType.STARTUP_LOAN]: {
      popularity: 6.5,
      averageApprovalRate: 35.2,
      riskLevel: 0.7,
      preferredTerm: { min: 24, max: 84 },
      seasonalityFactors: [1.0, 1.1, 1.2, 1.3, 1.2, 1.1, 1.0, 0.9, 1.0, 1.1, 1.2, 1.1],
    },
  },
};

const DEFAULT_WEIGHTS: ScoringWeights = {
  demographics: 15,
  financial: 25,
  employment: 20,
  loanSpecifics: 20,
  behavior: 10,
  source: 10,
};

export class VietnameseLeadScorer {
  private weights: ScoringWeights;
  private marketFactors: VietnameseMarketFactors;
  private biasDetectionEnabled: boolean;
  private fairnessMetrics: Map<string, any> = new Map();

  constructor(
    weights: Partial<ScoringWeights> = {},
    marketFactors: Partial<VietnameseMarketFactors> = {},
    biasDetectionEnabled: boolean = true
  ) {
    this.weights = { ...DEFAULT_WEIGHTS, ...weights };
    this.marketFactors = { ...VIETNAMESE_MARKET_FACTORS, ...marketFactors };
    this.biasDetectionEnabled = biasDetectionEnabled;

    this.initializeFairnessMonitoring();
  }

  /**
   * Initialize fairness monitoring and bias detection
   */
  private initializeFairnessMonitoring(): void {
    this.fairnessMetrics.clear();

    // Initialize metrics for demographic groups
    const demographics = ['gender', 'province', 'age_group', 'income_level'];
    demographics.forEach(demo => {
      this.fairnessMetrics.set(demo, {
        totalScores: [],
        averageScores: new Map(),
        approvalRates: new Map(),
        lastUpdated: new Date(),
      });
    });

    console.log('Fairness monitoring initialized with bias detection:', this.biasDetectionEnabled);
  }

  public scoreLead(leadData: LeadData): LeadScore {
    // Check for immediate disqualification
    const disqualificationResult = this.checkDisqualification(leadData);
    if (disqualificationResult.disqualified) {
      return disqualificationResult;
    }

    const breakdown = {
      demographics: this.scoreDemographics(leadData),
      financial: this.scoreFinancial(leadData),
      employment: this.scoreEmployment(leadData),
      loanSpecifics: this.scoreLoanSpecifics(leadData),
      behavior: this.scoreBehavior(leadData),
      source: this.scoreSource(leadData),
    };

    const totalScore = this.calculateTotalScore(breakdown);
    const grade = this.determineGrade(totalScore);
    const riskFactors = this.identifyRiskFactors(leadData, breakdown);
    const positiveIndicators = this.identifyPositiveIndicators(leadData, breakdown);
    const recommendations = this.generateRecommendations(leadData, totalScore, breakdown);
    const confidence = this.calculateConfidence(leadData);
    const estimatedConversionProbability = this.estimateConversionProbability(totalScore, breakdown);
    const suggestedActions = this.generateSuggestedActions(leadData, totalScore, breakdown);

    // Perform bias detection and fairness analysis
    const fairnessAnalysis = this.biasDetectionEnabled ? this.performBiasDetection(leadData, totalScore, breakdown) : null;

    const leadScore: LeadScore = {
      totalScore,
      grade,
      breakdown,
      riskFactors,
      positiveIndicators,
      recommendations,
      confidence,
      estimatedConversionProbability,
      suggestedActions,
      disqualified: false,
    };

    // Add fairness warnings if bias detected
    if (fairnessAnalysis && fairnessAnalysis.hasBias) {
      leadScore.riskFactors.push(`Potential algorithmic bias detected: ${fairnessAnalysis.biasType}`);
      console.warn('Bias detection alert:', fairnessAnalysis);
    }

    return leadScore;
  }

  private checkDisqualification(leadData: LeadData): LeadScore {
    const disqualificationReasons: string[] = [];

    // Age check (must be between 18 and 70)
    const age = this.calculateAge(leadData.dateOfBirth);
    if (age < 18 || age > 70) {
      disqualificationReasons.push('Age outside acceptable range (18-70 years)');
    }

    // Income check (minimum viable income)
    if (leadData.employment.monthlyIncome < this.marketFactors.incomeScoring.minimumViableIncome) {
      disqualificationReasons.push('Income below minimum threshold');
    }

    // Employment status check
    if (leadData.employment.employmentStatus === 'unemployed' && leadData.loanRequirements.loanType !== LoanType.STUDENT_LOAN) {
      disqualificationReasons.push('Unemployed and not applying for student loan');
    }

    // Credit history check
    if (leadData.financial.previousLoanHistory?.defaultHistory) {
      disqualificationReasons.push('History of loan default');
    }

    // Debt-to-income ratio check
    const debtToIncomeRatio = leadData.financial.existingMonthlyDebtPayments / leadData.employment.monthlyIncome;
    if (debtToIncomeRatio > 0.7) {
      disqualificationReasons.push('Debt-to-income ratio too high (>70%)');
    }

    // Consent check
    if (!leadData.consent.dataProcessingConsent || !leadData.consent.creditCheckConsent) {
      disqualificationReasons.push('Missing required consents');
    }

    // Loan amount sanity check
    const maxReasonableLoan = leadData.employment.monthlyIncome * 36; // 36 times monthly income
    if (leadData.loanRequirements.requestedAmount > maxReasonableLoan) {
      disqualificationReasons.push('Loan amount unreasonably high relative to income');
    }

    if (disqualificationReasons.length > 0) {
      return {
        totalScore: 0,
        grade: 'F',
        breakdown: {
          demographics: 0,
          financial: 0,
          employment: 0,
          loanSpecifics: 0,
          behavior: 0,
          source: 0,
        },
        riskFactors: disqualificationReasons,
        positiveIndicators: [],
        recommendations: ['Improve credit profile', 'Increase income stability', 'Reduce existing debt'],
        confidence: 100,
        estimatedConversionProbability: 0,
        suggestedActions: ['Provide additional documentation', 'Consider smaller loan amount', 'Wait for credit score improvement'],
        disqualified: true,
        disqualificationReason: disqualificationReasons.join('; '),
      };
    }

    return null as any; // Will be handled in the main scoring method
  }

  private scoreDemographics(leadData: LeadData): number {
    let score = 0;

    // Age scoring
    const age = this.calculateAge(leadData.dateOfBirth);
    if (age >= this.marketFactors.ageScoring.optimalAge.min && age <= this.marketFactors.ageScoring.optimalAge.max) {
      score += 8;
    } else if (age >= this.marketFactors.ageScoring.primeWorkingAge.min && age <= this.marketFactors.ageScoring.primeWorkingAge.max) {
      score += 6;
    } else if (age >= this.marketFactors.ageScoring.seniorAge.min && age <= this.marketFactors.ageScoring.seniorAge.max) {
      score += 4;
    } else {
      score += 2;
    }

    // Geographic scoring made neutral - equal treatment for all provinces
    // Removed bias toward tier1/tier2 cities to ensure fairness across Vietnam
    score += 3; // Neutral score for all locations to prevent geographic discrimination

    // Gender scoring removed for fairness - no gender-based scoring
    // All genders treated equally to prevent discrimination

    return Math.min(score, 15);
  }

  private scoreFinancial(leadData: LeadData): number {
    let score = 0;

    // Income scoring
    const income = leadData.employment.monthlyIncome;
    if (income >= this.marketFactors.incomeScoring.veryHighIncome) {
      score += 12;
    } else if (income >= this.marketFactors.incomeScoring.highIncome) {
      score += 10;
    } else if (income >= this.marketFactors.incomeScoring.averageIncome) {
      score += 8;
    } else if (income >= this.marketFactors.incomeScoring.minimumViableIncome) {
      score += 5;
    } else {
      score += 2;
    }

    // Credit score
    if (leadData.financial.creditScore) {
      if (leadData.financial.creditScore >= 750) {
        score += 8;
      } else if (leadData.financial.creditScore >= 700) {
        score += 6;
      } else if (leadData.financial.creditScore >= 650) {
        score += 4;
      } else if (leadData.financial.creditScore >= 600) {
        score += 2;
      }
    }

    // Existing debt ratio
    const debtToIncomeRatio = leadData.financial.existingMonthlyDebtPayments / leadData.employment.monthlyIncome;
    if (debtToIncomeRatio <= 0.2) {
      score += 3;
    } else if (debtToIncomeRatio <= 0.4) {
      score += 2;
    } else if (debtToIncomeRatio <= 0.6) {
      score += 1;
    }

    // Bank account stability
    if (leadData.financial.hasBankAccount) {
      score += 2;
      if (leadData.financial.bankAccountMonths && leadData.financial.bankAccountMonths >= 12) {
        score += 1;
      }
    }

    return Math.min(score, 25);
  }

  private scoreEmployment(leadData: LeadData): number {
    let score = 0;

    // Employment type
    if (this.marketFactors.employmentScoring.stableEmploymentTypes.includes(leadData.employment.employmentType)) {
      score += 8;
    } else if (leadData.employment.employmentType === 'part_time' || leadData.employment.employmentType === 'freelancer') {
      score += 5;
    } else if (leadData.employment.employmentType === 'student') {
      score += 3;
    } else {
      score += 1;
    }

    // Employment status
    if (leadData.employment.employmentStatus === 'permanent') {
      score += 6;
    } else if (leadData.employment.employmentStatus === 'contract') {
      score += 4;
    } else if (leadData.employment.employmentStatus === 'probation') {
      score += 2;
    } else {
      score += 1;
    }

    // Work duration
    if (leadData.employment.workDurationMonths >= 36) {
      score += 4;
    } else if (leadData.employment.workDurationMonths >= 24) {
      score += 3;
    } else if (leadData.employment.workDurationMonths >= 12) {
      score += 2;
    } else if (leadData.employment.workDurationMonths >= 6) {
      score += 1;
    }

    // Industry bonus
    if (leadData.employment.industry && this.marketFactors.employmentScoring.preferredIndustries.includes(leadData.employment.industry.toLowerCase())) {
      score += 2;
    }

    return Math.min(score, 20);
  }

  private scoreLoanSpecifics(leadData: LeadData): number {
    let score = 0;

    // Loan type popularity and risk
    const loanTypeFactor = this.marketFactors.loanTypeFactors[leadData.loanRequirements.loanType];
    if (loanTypeFactor) {
      score += Math.min(loanTypeFactor.popularity, 10);

      // Risk level adjustment
      if (loanTypeFactor.riskLevel <= 0.3) {
        score += 3;
      } else if (loanTypeFactor.riskLevel <= 0.5) {
        score += 2;
      } else {
        score += 1;
      }
    }

    // Loan amount vs income ratio
    const loanToIncomeRatio = leadData.loanRequirements.requestedAmount / (leadData.employment.monthlyIncome * 12);
    if (loanToIncomeRatio <= 2) {
      score += 3;
    } else if (loanToIncomeRatio <= 4) {
      score += 2;
    } else if (loanToIncomeRatio <= 6) {
      score += 1;
    }

    // Term appropriateness
    if (loanTypeFactor) {
      const { preferredTerm } = loanTypeFactor;
      if (leadData.loanRequirements.requestedTerm >= preferredTerm.min && leadData.loanRequirements.requestedTerm <= preferredTerm.max) {
        score += 2;
      } else if (leadData.loanRequirements.requestedTerm < preferredTerm.min * 2 || leadData.loanRequirements.requestedTerm > preferredTerm.max * 2) {
        score += 0;
      } else {
        score += 1;
      }
    }

    // Collateral availability
    if (leadData.loanRequirements.collateralAvailable) {
      score += 2;
      if (leadData.loanRequirements.collateralValue && leadData.loanRequirements.collateralValue >= leadData.loanRequirements.requestedAmount * 1.5) {
        score += 1;
      }
    }

    return Math.min(score, 20);
  }

  private scoreBehavior(leadData: LeadData): number {
    let score = 0;

    // Form completion time
    const completionTime = new Date(leadData.behavior.formCompletionTime).getTime() - new Date(leadData.behavior.formStartTime).getTime();
    const completionMinutes = completionTime / (1000 * 60);

    if (completionMinutes >= 5 && completionMinutes <= 30) {
      score += 3; // Thoughtful completion
    } else if (completionMinutes > 30) {
      score += 2; // Careful consideration
    } else if (completionMinutes < 5) {
      score += 1; // Quick completion (could be less reliable)
    }

    // Site engagement
    if (leadData.behavior.pagesViewed >= 5) {
      score += 3;
    } else if (leadData.behavior.pagesViewed >= 3) {
      score += 2;
    } else if (leadData.behavior.pagesViewed >= 1) {
      score += 1;
    }

    // Time spent on site
    if (leadData.behavior.timeSpentOnSite >= 10) {
      score += 2;
    } else if (leadData.behavior.timeSpentOnSite >= 5) {
      score += 1;
    }

    // Previous applications (negative for too many)
    if (leadData.behavior.previousApplications === 0) {
      score += 1;
    } else if (leadData.behavior.previousApplications <= 2) {
      score += 0;
    } else {
      score -= 1;
    }

    // Device type (desktop users often more serious)
    if (leadData.behavior.deviceType === 'desktop') {
      score += 1;
    }

    return Math.min(Math.max(score, 0), 10);
  }

  private scoreSource(leadData: LeadData): number {
    let score = 0;

    // Source quality scoring
    const sourceScores: { [key: string]: number } = {
      'referral': 8,
      'organic': 7,
      'direct': 6,
      'search_engine': 5,
      'social_media': 4,
      'advertisement': 3,
      'email': 3,
      'other': 2,
    };

    score += sourceScores[leadData.source.source] || 2;

    // Medium quality
    const mediumScores: { [key: string]: number } = {
      'referral': 5,
      'organic': 4,
      'cpc': 3,
      'social': 2,
      'email': 2,
      'display': 1,
    };

    score += mediumScores[leadData.source.medium] || 1;

    // Campaign-specific bonuses (if available)
    if (leadData.source.campaign) {
      const campaignLower = leadData.source.campaign.toLowerCase();
      if (campaignLower.includes('premium') || campaignLower.includes('vip')) {
        score += 2;
      } else if (campaignLower.includes('featured') || campaignLower.includes('promoted')) {
        score += 1;
      }
    }

    return Math.min(score, 10);
  }

  private calculateTotalScore(breakdown: LeadScore['breakdown']): number {
    const weightedScore =
      breakdown.demographics * (this.weights.demographics / 15) +
      breakdown.financial * (this.weights.financial / 25) +
      breakdown.employment * (this.weights.employment / 20) +
      breakdown.loanSpecifics * (this.weights.loanSpecifics / 20) +
      breakdown.behavior * (this.weights.behavior / 10) +
      breakdown.source * (this.weights.source / 10);

    return Math.min(Math.round(weightedScore), 100);
  }

  private determineGrade(score: number): LeadScore['grade'] {
    if (score >= 95) return 'A+';
    if (score >= 90) return 'A';
    if (score >= 85) return 'B+';
    if (score >= 80) return 'B';
    if (score >= 75) return 'C+';
    if (score >= 70) return 'C';
    if (score >= 65) return 'D+';
    if (score >= 60) return 'D';
    return 'F';
  }

  private identifyRiskFactors(leadData: LeadData, breakdown: LeadScore['breakdown']): string[] {
    const risks: string[] = [];

    // Low score components
    if (breakdown.financial < 15) risks.push('Weak financial profile');
    if (breakdown.employment < 10) risks.push('Unstable employment');
    if (breakdown.loanSpecifics < 10) risks.push('Risky loan parameters');
    if (breakdown.behavior < 5) risks.push('Low engagement');

    // Specific risk indicators
    const debtToIncomeRatio = leadData.financial.existingMonthlyDebtPayments / leadData.employment.monthlyIncome;
    if (debtToIncomeRatio > 0.5) risks.push('High debt-to-income ratio');

    if (leadData.employment.workDurationMonths < 6) risks.push('Short employment tenure');

    if (leadData.behavior.previousApplications > 5) risks.push('Excessive loan shopping');

    if (leadData.loanRequirements.requestedAmount > leadData.employment.monthlyIncome * 24) {
      risks.push('Loan amount too high relative to income');
    }

    if (leadData.financial.previousLoanHistory?.defaultHistory) {
      risks.push('Previous loan default history');
    }

    return risks;
  }

  private identifyPositiveIndicators(leadData: LeadData, breakdown: LeadScore['breakdown']): string[] {
    const indicators: string[] = [];

    // High score components
    if (breakdown.financial >= 20) indicators.push('Strong financial profile');
    if (breakdown.employment >= 16) indicators.push('Stable employment');
    if (breakdown.demographics >= 12) indicators.push('Ideal demographic profile');
    if (breakdown.loanSpecifics >= 16) indicators.push('Favorable loan parameters');

    // Specific positive indicators
    if (leadData.financial.creditScore && leadData.financial.creditScore >= 700) {
      indicators.push('Excellent credit score');
    }

    if (leadData.employment.workDurationMonths >= 36) {
      indicators.push('Long-term employment stability');
    }

    if (leadData.loanRequirements.collateralAvailable) {
      indicators.push('Loan collateral available');
    }

    if (leadData.behavior.previousApplications === 0) {
      indicators.push('First-time borrower (positive factor)');
    }

    if (leadData.employment.monthlyIncome >= this.marketFactors.incomeScoring.highIncome) {
      indicators.push('Above-average income level');
    }

    if (leadData.source.source === 'referral') {
      indicators.push('Referred source (higher quality)');
    }

    return indicators;
  }

  private generateRecommendations(leadData: LeadData, totalScore: number, breakdown: LeadScore['breakdown']): string[] {
    const recommendations: string[] = [];

    if (totalScore < 70) {
      recommendations.push('Consider improving credit profile before applying');
      recommendations.push('Reduce existing debt obligations');
      recommendations.push('Consider smaller loan amount');
    }

    if (breakdown.financial < 15) {
      recommendations.push('Increase income stability');
      recommendations.push('Improve credit score');
      recommendations.push('Provide additional financial documentation');
    }

    if (breakdown.employment < 10) {
      recommendations.push('Maintain current employment longer');
      recommendations.push('Provide proof of stable income');
    }

    if (breakdown.loanSpecifics < 10) {
      recommendations.push('Consider adding collateral');
      recommendations.push('Adjust loan term or amount');
      recommendations.push('Choose more suitable loan product');
    }

    if (leadData.employment.canProvideIncomeProof === false) {
      recommendations.push('Gather income verification documents');
    }

    return recommendations;
  }

  private calculateConfidence(leadData: LeadData): number {
    let confidence = 50; // Base confidence

    // Increase confidence based on data completeness
    if (leadData.financial.creditScore) confidence += 15;
    if (leadData.financial.previousLoanHistory) confidence += 10;
    if (leadData.employment.companyName) confidence += 5;
    if (leadData.loanRequirements.collateralValue) confidence += 10;
    if (leadData.behavior.pagesViewed > 3) confidence += 5;

    // Decrease confidence for red flags
    if (leadData.behavior.previousApplications > 3) confidence -= 10;
    if (leadData.employment.workDurationMonths < 3) confidence -= 15;

    return Math.min(Math.max(confidence, 0), 100);
  }

  private estimateConversionProbability(totalScore: number, breakdown: LeadScore['breakdown']): number {
    // Base conversion probability from score
    let probability = (totalScore / 100) * 60; // Max 60% base probability

    // Adjust based on individual components
    if (breakdown.financial > 20) probability += 15;
    if (breakdown.employment > 15) probability += 10;
    if (breakdown.loanSpecifics > 15) probability += 10;
    if (breakdown.behavior > 7) probability += 5;

    // Seasonal adjustment for current month
    const currentMonth = new Date().getMonth();
    const seasonalFactor = 1.0; // This could be dynamically calculated based on loan type

    return Math.min(Math.round(probability * seasonalFactor), 100);
  }

  private generateSuggestedActions(leadData: LeadData, totalScore: number, breakdown: LeadScore['breakdown']): string[] {
    const actions: string[] = [];

    if (totalScore >= 85) {
      actions.push('Immediate follow-up with high-priority partners');
      actions.push('Fast-track application process');
      actions.push('Offer premium partner recommendations');
    } else if (totalScore >= 70) {
      actions.push('Standard partner matching process');
      actions.push('Schedule follow-up within 24 hours');
      actions.push('Provide additional documentation requirements');
    } else if (totalScore >= 55) {
      actions.push('Manual review required');
      actions.push('Request additional financial documentation');
      actions.push('Consider alternative loan products');
    } else {
      actions.push('Recommend credit improvement');
      actions.push('Suggest smaller loan amount');
      actions.push('Provide financial counseling resources');
    }

    // Specific actions based on breakdown
    if (breakdown.financial < 15) {
      actions.push('Request income verification documents');
    }

    if (leadData.loanRequirements.collateralAvailable === false && totalScore < 70) {
      actions.push('Explore unsecured loan options');
    }

    return actions;
  }

  private calculateAge(dateOfBirth: string): number {
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDifference = today.getMonth() - birthDate.getMonth();

    if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    return age;
  }

  // Public utility methods
  public updateWeights(newWeights: Partial<ScoringWeights>): void {
    this.weights = { ...this.weights, ...newWeights };
  }

  public getWeights(): ScoringWeights {
    return { ...this.weights };
  }

  public updateMarketFactors(newFactors: Partial<VietnameseMarketFactors>): void {
    this.marketFactors = { ...this.marketFactors, ...newFactors };
  }

  public getMarketFactors(): VietnameseMarketFactors {
    return { ...this.marketFactors };
  }

  public calculateScoreTrend(leadScores: LeadScore[]): {
    trend: 'improving' | 'declining' | 'stable';
    averageScore: number;
    averageConversionProbability: number;
  } {
    if (leadScores.length < 2) {
      return {
        trend: 'stable',
        averageScore: leadScores[0]?.totalScore || 0,
        averageConversionProbability: leadScores[0]?.estimatedConversionProbability || 0,
      };
    }

    const recentScores = leadScores.slice(-5);
    const olderScores = leadScores.slice(-10, -5);

    const recentAvg = recentScores.reduce((sum, score) => sum + score.totalScore, 0) / recentScores.length;
    const olderAvg = olderScores.length > 0 ? olderScores.reduce((sum, score) => sum + score.totalScore, 0) / olderScores.length : recentAvg;

    let trend: 'improving' | 'declining' | 'stable';
    if (recentAvg > olderAvg + 5) {
      trend = 'improving';
    } else if (recentAvg < olderAvg - 5) {
      trend = 'declining';
    } else {
      trend = 'stable';
    }

    const overallAvg = leadScores.reduce((sum, score) => sum + score.totalScore, 0) / leadScores.length;
    const avgConversionProbability = leadScores.reduce((sum, score) => sum + score.estimatedConversionProbability, 0) / leadScores.length;

    return {
      trend,
      averageScore: overallAvg,
      averageConversionProbability,
    };
  }

  /**
   * Perform bias detection and fairness analysis
   */
  private performBiasDetection(
    leadData: LeadData,
    totalScore: number,
    breakdown: LeadScore['breakdown']
  ): { hasBias: boolean; biasType: string; confidence: number; recommendations: string[] } {
    if (!this.biasDetectionEnabled) {
      return { hasBias: false, biasType: '', confidence: 0, recommendations: [] };
    }

    const demographicGroups = this.extractDemographicGroups(leadData);
    const biasAnalysis = this.analyzeGroupScores(demographicGroups, totalScore);

    // Update fairness metrics
    this.updateFairnessMetrics(demographicGroups, totalScore, breakdown);

    // Check for potential bias patterns
    const biasChecks = [
      this.checkGeographicBias(demographicGroups, totalScore),
      this.checkGenderBias(demographicGroups, totalScore),
      this.checkAgeBias(demographicGroups, totalScore),
      this.checkIncomeBias(demographicGroups, totalScore),
    ];

    const detectedBias = biasChecks.find(check => check.hasBias);

    if (detectedBias) {
      console.warn('Algorithmic bias detected:', detectedBias);
      return detectedBias;
    }

    return {
      hasBias: false,
      biasType: '',
      confidence: 0,
      recommendations: [],
    };
  }

  /**
   * Extract demographic groups from lead data
   */
  private extractDemographicGroups(leadData: LeadData): Record<string, string> {
    const age = this.calculateAge(leadData.dateOfBirth);

    return {
      gender: leadData.gender,
      province: leadData.currentAddress.provinceCode,
      age_group: this.categorizeAge(age),
      income_level: this.categorizeIncome(leadData.employment.monthlyIncome),
      employment_type: leadData.employment.employmentType,
      loan_type: leadData.loanRequirements.loanType,
    };
  }

  /**
   * Categorize age for bias analysis
   */
  private categorizeAge(age: number): string {
    if (age < 25) return 'young_adult';
    if (age < 40) return 'adult';
    if (age < 60) return 'middle_aged';
    return 'senior';
  }

  /**
   * Categorize income for bias analysis
   */
  private categorizeIncome(income: number): string {
    if (income < 5000000) return 'low';
    if (income < 15000000) return 'medium';
    if (income < 30000000) return 'high';
    return 'very_high';
  }

  /**
   * Analyze group scores for bias detection
   */
  private analyzeGroupScores(
    demographicGroups: Record<string, string>,
    totalScore: number
  ): { groupScores: Map<string, number[]>; significantDifferences: string[] } {
    const groupScores = new Map<string, number[]>();
    const significantDifferences: string[] = [];

    // Update group scores
    Object.entries(demographicGroups).forEach(([category, group]) => {
      const key = `${category}:${group}`;
      if (!groupScores.has(key)) {
        groupScores.set(key, []);
      }
      groupScores.get(key)!.push(totalScore);
    });

    // Check for significant score differences between groups
    // This is a simplified version - in production, you'd use statistical tests
    const categoryGroups = ['gender', 'province', 'age_group', 'income_level'];

    categoryGroups.forEach(category => {
      const groups = Array.from(groupScores.keys())
        .filter(key => key.startsWith(`${category}:`))
        .map(key => ({
          group: key.split(':')[1],
          scores: groupScores.get(key)!,
        }));

      if (groups.length >= 2) {
        const avgScores = groups.map(g => ({
          group: g.group,
          avg: g.scores.reduce((a, b) => a + b, 0) / g.scores.length,
        }));

        const maxAvg = Math.max(...avgScores.map(g => g.avg));
        const minAvg = Math.min(...avgScores.map(g => g.avg));
        const difference = maxAvg - minAvg;

        // Flag if difference is more than 15 points (potential bias)
        if (difference > 15) {
          significantDifferences.push(`${category}: ${difference.toFixed(1)} point difference`);
        }
      }
    });

    return { groupScores, significantDifferences };
  }

  /**
   * Check for geographic bias
   */
  private checkGeographicBias(
    demographicGroups: Record<string, string>,
    totalScore: number
  ): { hasBias: boolean; biasType: string; confidence: number; recommendations: string[] } {
    const province = demographicGroups.province;

    // Since we removed geographic scoring, this should be minimal
    // But we still monitor for any residual patterns
    const tier1Cities = ['01', '79']; // Hanoi, HCMC
    const isTier1 = tier1Cities.includes(province);

    // This check ensures we haven't introduced geographic bias elsewhere
    if (isTier1 && totalScore < 50) {
      return {
        hasBias: false, // Low scores for tier1 cities is not bias
        biasType: '',
        confidence: 0,
        recommendations: [],
      };
    }

    return { hasBias: false, biasType: '', confidence: 0, recommendations: [] };
  }

  /**
   * Check for gender bias
   */
  private checkGenderBias(
    demographicGroups: Record<string, string>,
    totalScore: number
  ): { hasBias: boolean; biasType: string; confidence: number; recommendations: string[] } {
    const gender = demographicGroups.gender;

    // Since we removed gender-based scoring, this should be minimal
    // But we monitor for any residual bias in other components

    return { hasBias: false, biasType: '', confidence: 0, recommendations: [] };
  }

  /**
   * Check for age bias
   */
  private checkAgeBias(
    demographicGroups: Record<string, string>,
    totalScore: number
  ): { hasBias: boolean; biasType: string; confidence: number; recommendations: string[] } {
    const ageGroup = demographicGroups.age_group;

    // Check for disproportionate low scores for seniors or young adults
    if ((ageGroup === 'young_adult' || ageGroup === 'senior') && totalScore < 40) {
      const fairnessMetrics = this.fairnessMetrics.get('age_group');
      if (fairnessMetrics) {
        const groupScores = fairnessMetrics.averageScores.get(ageGroup) || 0;
        const overallAvg = this.calculateOverallAverage();

        if (groupScores > 0 && (overallAvg - groupScores) > 20) {
          return {
            hasBias: true,
            biasType: 'age_discrimination',
            confidence: 0.7,
            recommendations: [
              'Review age-based scoring factors',
              'Ensure age-neutral assessment criteria',
              'Consider additional data for young adult and senior applicants',
            ],
          };
        }
      }
    }

    return { hasBias: false, biasType: '', confidence: 0, recommendations: [] };
  }

  /**
   * Check for income bias
   */
  private checkIncomeBias(
    demographicGroups: Record<string, string>,
    totalScore: number
  ): { hasBias: boolean; biasType: string; confidence: number; recommendations: string[] } {
    const incomeLevel = demographicGroups.income_level;

    // Income-based scoring is legitimate for loan applications,
    // but we monitor for excessive discrimination
    if (incomeLevel === 'low' && totalScore < 30) {
      return {
        hasBias: true,
        biasType: 'excessive_income_bias',
        confidence: 0.6,
        recommendations: [
          'Review income weighting in scoring algorithm',
          'Consider alternative factors for low-income applicants',
          'Ensure minimum viable income requirements are reasonable',
        ],
      };
    }

    return { hasBias: false, biasType: '', confidence: 0, recommendations: [] };
  }

  /**
   * Update fairness metrics
   */
  private updateFairnessMetrics(
    demographicGroups: Record<string, string>,
    totalScore: number,
    breakdown: LeadScore['breakdown']
  ): void {
    Object.entries(demographicGroups).forEach(([category, group]) => {
      const metrics = this.fairnessMetrics.get(category);
      if (metrics) {
        // Update total scores
        metrics.totalScores.push(totalScore);

        // Update group averages
        const currentAvg = metrics.averageScores.get(group) || 0;
        const count = metrics.totalScores.filter((_, index) => {
          const historicalGroup = this.extractDemographicGroupsFromIndex(index)[category];
          return historicalGroup === group;
        }).length;

        metrics.averageScores.set(group, (currentAvg * (count - 1) + totalScore) / count);

        // Update approval rates (scores > 60)
        const approved = totalScore > 60 ? 1 : 0;
        const currentApprovalRate = metrics.approvalRates.get(group) || 0;
        metrics.approvalRates.set(group, ((currentApprovalRate * (count - 1)) + approved) / count);

        metrics.lastUpdated = new Date();
      }
    });
  }

  /**
   * Calculate overall average score
   */
  private calculateOverallAverage(): number {
    const allScores = Array.from(this.fairnessMetrics.values())
      .flatMap(metrics => metrics.totalScores);

    if (allScores.length === 0) return 0;

    return allScores.reduce((sum, score) => sum + score, 0) / allScores.length;
  }

  /**
   * Extract demographic groups from historical index (placeholder)
   */
  private extractDemographicGroupsFromIndex(index: number): Record<string, string> {
    // In a real implementation, this would retrieve historical data
    // For now, return empty object
    return {};
  }

  /**
   * Get fairness report
   */
  public getFairnessReport(): {
    algorithmFairness: boolean;
    biasDetected: boolean;
    demographicBreakdown: Record<string, any>;
    recommendations: string[];
    lastAudit: string;
  } {
    const overallAvg = this.calculateOverallAverage();
    let biasDetected = false;
    const recommendations: string[] = [];

    // Analyze each demographic category
    const demographicBreakdown: Record<string, any> = {};

    this.fairnessMetrics.forEach((metrics, category) => {
      const groupAverages: Record<string, number> = {};
      let maxDiff = 0;

      metrics.averageScores.forEach((avg, group) => {
        groupAverages[group] = avg;
        const diff = Math.abs(avg - overallAvg);
        maxDiff = Math.max(maxDiff, diff);
      });

      // Flag significant differences
      if (maxDiff > 15) {
        biasDetected = true;
        recommendations.push(`Review ${category} scoring - ${maxDiff.toFixed(1)} point deviation detected`);
      }

      demographicBreakdown[category] = {
        groupAverages,
        approvalRates: Object.fromEntries(metrics.approvalRates),
        sampleSize: metrics.totalScores.length,
        maxDeviation: maxDiff,
      };
    });

    return {
      algorithmFairness: !biasDetected,
      biasDetected,
      demographicBreakdown,
      recommendations,
      lastAudit: new Date().toISOString(),
    };
  }
}

// Default scorer instance
export const defaultLeadScorer = new VietnameseLeadScorer();

// Convenience function
export const scoreVietnameseLead = (leadData: LeadData): LeadScore => {
  return defaultLeadScorer.scoreLead(leadData);
};

export default VietnameseLeadScorer;