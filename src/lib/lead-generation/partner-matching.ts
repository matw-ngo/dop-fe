/**
 * Vietnamese Lead-to-Partner Matching System
 * Advanced partner matching algorithm with Vietnamese market optimization
 */

import type { VietnameseFinancialPartner, LoanType } from './vietnamese-partners';
import type { LeadData, LeadScore } from './lead-scoring';
import { VIETNAMESE_FINANCIAL_PARTNERS, getActivePartners, sortPartnersByPriority } from './vietnamese-partners';

export interface MatchingCriteria {
  loanType: LoanType;
  loanAmount: number;
  loanTerm: number;
  provinceCode: string;
  creditScore?: number;
  monthlyIncome?: number;
  employmentType?: string;
  urgency: 'urgent' | 'normal' | 'flexible';
  preferredBanks?: string[];
  excludeBanks?: string[];
  maxInterestRate?: number;
  requiresOnlineApplication?: boolean;
  requiresFastApproval?: boolean;
  collateralAvailable?: boolean;
  collateralValue?: number;
}

export interface MatchingScore {
  partnerId: string;
  partnerName: string;
  totalScore: number;
  breakdown: {
    specialization: number; // 0-25
    capacity: number; // 0-20
    performance: number; // 0-20
    geography: number; // 0-15
    riskAlignment: number; // 0-10
    workload: number; // 0-10
  };
  confidence: number; // 0-100
  matchReasons: string[];
  concerns: string[];
  estimatedResponseTime: number; // hours
  approvalProbability: number; // 0-100
  recommendedActions: string[];
}

export interface MatchingResult {
  leadId: string;
  criteria: MatchingCriteria;
  scores: MatchingScore[];
  recommendations: PartnerRecommendation[];
  summary: {
    totalPartnersEvaluated: number;
    eligiblePartnersCount: number;
    highConfidenceMatches: number;
    averageScore: number;
    processingTime: number; // milliseconds
  };
  bestMatch?: MatchingScore;
  topMatches: MatchingScore[];
  alternativeOptions: MatchingScore[];
  timestamp: Date;
  algorithmVersion: string;
}

export interface PartnerRecommendation {
  partnerId: string;
  partnerName: string;
  recommended: boolean;
  priority: 'high' | 'medium' | 'low';
  reasoning: string[];
  advantages: string[];
  disadvantages: string[];
  applicationTips: string[];
  requiredDocuments: string[];
  expectedTimeline: string;
  contactMethod: string;
  specialRequirements: string[];
}

export interface MatchingWeights {
  specialization: number;
  capacity: number;
  performance: number;
  geography: number;
  riskAlignment: number;
  workload: number;
}

export interface VietnameseMarketFactors {
  regionalPreferences: {
    [provinceCode: string]: {
      preferredPartners: string[];
      localAdvantages: string[];
      processingTimeMultipliers: { [partnerId: string]: number };
    };
  };
  seasonalFactors: {
    [month: number]: {
      affectedPartners: string[];
      adjustmentFactors: { [partnerId: string]: number };
    };
  };
  demographicFactors: {
    [ageRange: string]: {
      preferredPartners: string[];
      successRateAdjustments: { [partnerId: string]: number };
    };
  };
  economicFactors: {
    gdpGrowth: number;
    interestRateTrend: number;
    marketSaturation: { [partnerId: string]: number };
  };
}

export const VIETNAMESE_MARKET_FACTORS: VietnameseMarketFactors = {
  regionalPreferences: {
    '01': { // Hanoi
      preferredPartners: ['vcb', 'ctg', 'bvb', 'agribank'],
      localAdvantages: ['headquarter_presence', 'government_focus', 'high_income_areas'],
      processingTimeMultipliers: {
        'vcb': 0.8, 'ctg': 0.9, 'bvb': 0.8, 'agribank': 1.0,
      },
    },
    '79': { // Ho Chi Minh City
      preferredPartners: ['vcb', 'ctg', 'hdsaison', 'fecredit', 'momo'],
      localAdvantages: ['commercial_center', 'young_population', 'fintech_adoption'],
      processingTimeMultipliers: {
        'vcb': 0.7, 'ctg': 0.8, 'hdsaison': 0.6, 'fecredit': 0.6, 'momo': 0.5,
      },
    },
    '30': { // Haiphong
      preferredPartners: ['vcb', 'bvb', 'agribank'],
      localAdvantages: ['port_city', 'industrial_focus', 'shipping_industry'],
      processingTimeMultipliers: {
        'vcb': 0.9, 'bvb': 0.8, 'agribank': 1.1,
      },
    },
    '48': { // Da Nang
      preferredPartners: ['vcb', 'bvb', 'agribank'],
      localAdvantages: ['tourism_hub', 'central_region', 'growing_economy'],
      processingTimeMultipliers: {
        'vcb': 0.9, 'bvb': 0.9, 'agribank': 1.0,
      },
    },
  },
  seasonalFactors: {
    1: { // January (Tet holiday preparation)
      affectedPartners: ['hdsaison', 'fecredit', 'homecredit'],
      adjustmentFactors: {
        'hdsaison': 1.3, 'fecredit': 1.4, 'homecredit': 1.2,
      },
    },
    2: { // February (Tet holiday)
      affectedPartners: ['hdsaison', 'fecredit', 'homecredit', 'tima'],
      adjustmentFactors: {
        'hdsaison': 1.5, 'fecredit': 1.6, 'homecredit': 1.4, 'tima': 1.3,
      },
    },
    11: { // November (Year-end spending)
      affectedPartners: ['vcb', 'ctg', 'hdsaison', 'fecredit'],
      adjustmentFactors: {
        'vcb': 1.1, 'ctg': 1.1, 'hdsaison': 1.2, 'fecredit': 1.2,
      },
    },
    12: { // December (Holiday shopping)
      affectedPartners: ['hdsaison', 'fecredit', 'homecredit', 'vcb', 'ctg'],
      adjustmentFactors: {
        'hdsaison': 1.4, 'fecredit': 1.5, 'homecredit': 1.3, 'vcb': 1.2, 'ctg': 1.2,
      },
    },
  },
  demographicFactors: {
    '18-25': {
      preferredPartners: ['fecredit', 'hdsaison', 'momo', 'tima'],
      successRateAdjustments: {
        'fecredit': 1.2, 'hdsaison': 1.1, 'momo': 1.3, 'tima': 1.1,
      },
    },
    '26-35': {
      preferredPartners: ['vcb', 'ctg', 'fecredit', 'hdsaison', 'momo'],
      successRateAdjustments: {
        'vcb': 1.1, 'ctg': 1.1, 'fecredit': 1.0, 'hdsaison': 1.0, 'momo': 1.2,
      },
    },
    '36-50': {
      preferredPartners: ['vcb', 'ctg', 'bvb', 'agribank'],
      successRateAdjustments: {
        'vcb': 1.2, 'ctg': 1.2, 'bvb': 1.1, 'agribank': 1.0,
      },
    },
    '51-65': {
      preferredPartners: ['vcb', 'agribank', 'bvb'],
      successRateAdjustments: {
        'vcb': 1.1, 'agribank': 1.2, 'bvb': 1.0,
      },
    },
  },
  economicFactors: {
    gdpGrowth: 5.8, // Vietnam GDP growth rate
    interestRateTrend: 8.5, // Average interest rate
    marketSaturation: {
      'vcb': 0.85, 'ctg': 0.78, 'bvb': 0.82, 'agribank': 0.75,
      'hdsaison': 0.65, 'fecredit': 0.60, 'homecredit': 0.55, 'momo': 0.70,
      'tima': 0.45,
    },
  },
};

export const DEFAULT_MATCHING_WEIGHTS: MatchingWeights = {
  specialization: 25,
  capacity: 20,
  performance: 20,
  geography: 15,
  riskAlignment: 10,
  workload: 10,
};

export class VietnamesePartnerMatcher {
  private weights: MatchingWeights;
  private marketFactors: VietnameseMarketFactors;
  private algorithmVersion: string;

  constructor(
    weights: Partial<MatchingWeights> = {},
    marketFactors: Partial<VietnameseMarketFactors> = {}
  ) {
    this.weights = { ...DEFAULT_MATCHING_WEIGHTS, ...weights };
    this.marketFactors = { ...VIETNAMESE_MARKET_FACTORS, ...marketFactors };
    this.algorithmVersion = '2.1.0';
  }

  public matchPartners(
    leadId: string,
    criteria: MatchingCriteria,
    leadData?: LeadData,
    leadScore?: LeadScore
  ): MatchingResult {
    const startTime = Date.now();

    // Get eligible partners
    const eligiblePartners = this.getEligiblePartners(criteria);

    // Score each eligible partner
    const scores = eligiblePartners.map(partner =>
      this.scorePartner(partner, criteria, leadData, leadScore)
    );

    // Sort by total score
    scores.sort((a, b) => b.totalScore - a.totalScore);

    // Generate recommendations
    const recommendations = this.generateRecommendations(scores, criteria, leadData);

    // Extract best matches
    const bestMatch = scores.length > 0 ? scores[0] : undefined;
    const topMatches = scores.slice(0, 3);
    const alternativeOptions = scores.slice(3, 8);

    // Calculate summary
    const summary = {
      totalPartnersEvaluated: VIETNAMESE_FINANCIAL_PARTNERS.length,
      eligiblePartnersCount: eligiblePartners.length,
      highConfidenceMatches: scores.filter(s => s.confidence >= 80).length,
      averageScore: scores.length > 0 ? scores.reduce((sum, s) => sum + s.totalScore, 0) / scores.length : 0,
      processingTime: Date.now() - startTime,
    };

    return {
      leadId,
      criteria,
      scores,
      recommendations,
      summary,
      bestMatch,
      topMatches,
      alternativeOptions,
      timestamp: new Date(),
      algorithmVersion: this.algorithmVersion,
    };
  }

  private getEligiblePartners(criteria: MatchingCriteria): VietnameseFinancialPartner[] {
    const activePartners = getActivePartners();

    return activePartners.filter(partner => {
      // Check loan type compatibility
      if (!partner.specializations.loanTypes.includes(criteria.loanType)) {
        return false;
      }

      // Check loan amount range
      if (criteria.loanAmount < partner.specializations.minAmount ||
          criteria.loanAmount > partner.specializations.maxAmount) {
        return false;
      }

      // Check geographic coverage
      if (!partner.coverage.provinces.includes(criteria.provinceCode)) {
        return false;
      }

      // Check capacity
      if (partner.capacity.currentWorkload >= partner.capacity.maxDailyLeads) {
        return false;
      }

      // Check credit score if provided
      if (criteria.creditScore && partner.specializations.creditScoreMin) {
        if (criteria.creditScore < partner.specializations.creditScoreMin) {
          return false;
        }
      }

      // Check income if provided
      if (criteria.monthlyIncome && partner.leadForwarding.acceptanceCriteria.minIncomeLevel) {
        if (criteria.monthlyIncome < partner.leadForwarding.acceptanceCriteria.minIncomeLevel) {
          return false;
        }
      }

      // Check preferred banks exclusions
      if (criteria.excludeBanks?.includes(partner.id)) {
        return false;
      }

      // Check interest rate limit if provided
      if (criteria.maxInterestRate) {
        if (partner.specializations.interestRateRange.min > criteria.maxInterestRate) {
          return false;
        }
      }

      // Check online application requirement
      if (criteria.requiresOnlineApplication && partner.integration.apiAvailable === false) {
        return false;
      }

      // Check fast approval requirement
      if (criteria.requiresFastApproval && partner.specializations.processingTime.max > 3) {
        return false;
      }

      return true;
    });
  }

  private scorePartner(
    partner: VietnameseFinancialPartner,
    criteria: MatchingCriteria,
    leadData?: LeadData,
    leadScore?: LeadScore
  ): MatchingScore {
    const breakdown = {
      specialization: this.scoreSpecialization(partner, criteria, leadData),
      capacity: this.scoreCapacity(partner, criteria),
      performance: this.scorePerformance(partner, criteria),
      geography: this.scoreGeography(partner, criteria),
      riskAlignment: this.scoreRiskAlignment(partner, criteria, leadScore),
      workload: this.scoreWorkload(partner, criteria),
    };

    const totalScore = this.calculateTotalScore(breakdown);
    const confidence = this.calculateConfidence(partner, criteria, leadData);
    const matchReasons = this.generateMatchReasons(partner, criteria, breakdown);
    const concerns = this.generateConcerns(partner, criteria, breakdown);
    const estimatedResponseTime = this.estimateResponseTime(partner, criteria);
    const approvalProbability = this.calculateApprovalProbability(partner, criteria, leadScore);
    const recommendedActions = this.generateRecommendedActions(partner, criteria, breakdown);

    return {
      partnerId: partner.id,
      partnerName: partner.name,
      totalScore,
      breakdown,
      confidence,
      matchReasons,
      concerns,
      estimatedResponseTime,
      approvalProbability,
      recommendedActions,
    };
  }

  private scoreSpecialization(
    partner: VietnameseFinancialPartner,
    criteria: MatchingCriteria,
    leadData?: LeadData
  ): number {
    let score = 0;

    // Loan type specialization (10 points)
    const loanTypeIndex = partner.specializations.loanTypes.indexOf(criteria.loanType);
    if (loanTypeIndex === 0) {
      score += 10; // Primary specialization
    } else if (loanTypeIndex > 0 && loanTypeIndex <= 2) {
      score += 8; // Secondary specialization
    } else if (loanTypeIndex > 2) {
      score += 5; // Tertiary specialization
    }

    // Loan amount fit (8 points)
    const amountRange = partner.specializations.maxAmount - partner.specializations.minAmount;
    const amountPosition = (criteria.loanAmount - partner.specializations.minAmount) / amountRange;
    if (amountPosition >= 0.2 && amountPosition <= 0.8) {
      score += 8; // Ideal range
    } else if (amountPosition >= 0.1 && amountPosition <= 0.9) {
      score += 6; // Good range
    } else {
      score += 4; // Acceptable range
    }

    // Target segment alignment (7 points)
    if (leadData?.employment.employmentType) {
      const segmentMatch = partner.specializations.targetSegments.some(segment =>
        this.matchesEmploymentType(segment, leadData.employment.employmentType)
      );
      if (segmentMatch) {
        score += 7;
      } else {
        score += 3;
      }
    } else {
      score += 5; // Neutral
    }

    return Math.min(score, 25);
  }

  private scoreCapacity(partner: VietnameseFinancialPartner, criteria: MatchingCriteria): number {
    let score = 0;

    // Current workload vs capacity (10 points)
    const utilizationRate = partner.capacity.currentWorkload / partner.capacity.maxDailyLeads;
    if (utilizationRate <= 0.5) {
      score += 10; // Excellent capacity
    } else if (utilizationRate <= 0.7) {
      score += 8; // Good capacity
    } else if (utilizationRate <= 0.85) {
      score += 6; // Acceptable capacity
    } else if (utilizationRate <= 0.95) {
      score += 3; // Limited capacity
    } else {
      score += 1; // Very limited capacity
    }

    // Integration capability (5 points)
    if (criteria.requiresOnlineApplication && partner.integration.apiAvailable) {
      score += 5;
    } else if (partner.integration.webhookSupported) {
      score += 3;
    } else {
      score += 1;
    }

    // Auto-accept capability (5 points)
    if (partner.leadForwarding.autoAcceptEnabled) {
      score += 5;
    } else {
      score += 2;
    }

    return Math.min(score, 20);
  }

  private scorePerformance(partner: VietnameseFinancialPartner, criteria: MatchingCriteria): number {
    let score = 0;

    // Conversion rate (8 points)
    if (partner.capacity.conversionRate >= 35) {
      score += 8;
    } else if (partner.capacity.conversionRate >= 28) {
      score += 6;
    } else if (partner.capacity.conversionRate >= 20) {
      score += 4;
    } else {
      score += 2;
    }

    // Approval rate (7 points)
    if (partner.capacity.approvalRate >= 75) {
      score += 7;
    } else if (partner.capacity.approvalRate >= 65) {
      score += 5;
    } else if (partner.capacity.approvalRate >= 55) {
      score += 3;
    } else {
      score += 1;
    }

    // Customer satisfaction (5 points)
    if (partner.capacity.customerSatisfaction >= 4.5) {
      score += 5;
    } else if (partner.capacity.customerSatisfaction >= 4.0) {
      score += 4;
    } else if (partner.capacity.customerSatisfaction >= 3.5) {
      score += 3;
    } else {
      score += 1;
    }

    return Math.min(score, 20);
  }

  private scoreGeography(partner: VietnameseFinancialPartner, criteria: MatchingCriteria): number {
    let score = 0;

    // Provincial presence (10 points)
    if (partner.coverage.national) {
      score += 10;
    } else if (partner.coverage.provinces.length >= 50) {
      score += 8;
    } else if (partner.coverage.provinces.length >= 30) {
      score += 6;
    } else if (partner.coverage.provinces.length >= 15) {
      score += 4;
    } else {
      score += 2;
    }

    // Regional preferences (5 points)
    const provinceData = this.marketFactors.regionalPreferences[criteria.provinceCode];
    if (provinceData) {
      if (provinceData.preferredPartners.includes(partner.id)) {
        score += 5;
      } else if (provinceData.localAdvantages.some(advantage =>
        this.matchesPartnerType(partner.type, advantage)
      )) {
        score += 3;
      } else {
        score += 2;
      }
    } else {
      score += 3; // Neutral
    }

    return Math.min(score, 15);
  }

  private scoreRiskAlignment(
    partner: VietnameseFinancialPartner,
    criteria: MatchingCriteria,
    leadScore?: LeadScore
  ): number {
    let score = 0;

    // Credit score alignment (5 points)
    if (criteria.creditScore && partner.specializations.creditScoreMin) {
      if (criteria.creditScore >= partner.specializations.creditScoreMin + 100) {
        score += 5; // Very good fit
      } else if (criteria.creditScore >= partner.specializations.creditScoreMin + 50) {
        score += 4; // Good fit
      } else if (criteria.creditScore >= partner.specializations.creditScoreMin) {
        score += 3; // Minimum fit
      } else {
        score += 1; // Poor fit
      }
    } else {
      score += 3; // Neutral
    }

    // Interest rate competitiveness (3 points)
    if (criteria.maxInterestRate) {
      if (partner.specializations.interestRateRange.min <= criteria.maxInterestRate * 0.8) {
        score += 3; // Very competitive
      } else if (partner.specializations.interestRateRange.min <= criteria.maxInterestRate) {
        score += 2; // Competitive
      } else {
        score += 1; // Less competitive
      }
    } else {
      score += 2; // Neutral
    }

    // Compliance score (2 points)
    if (partner.compliance.complianceScore >= 90) {
      score += 2;
    } else if (partner.compliance.complianceScore >= 80) {
      score += 1;
    } else {
      score += 0;
    }

    return Math.min(score, 10);
  }

  private scoreWorkload(partner: VietnameseFinancialPartner, criteria: MatchingCriteria): number {
    let score = 0;

    // Current workload (6 points)
    const workloadRatio = partner.capacity.currentWorkload / partner.capacity.maxDailyLeads;
    if (workloadRatio <= 0.3) {
      score += 6; // Very available
    } else if (workloadRatio <= 0.5) {
      score += 5; // Available
    } else if (workloadRatio <= 0.7) {
      score += 4; // Reasonably available
    } else if (workloadRatio <= 0.85) {
      score += 2; // Limited availability
    } else {
      score += 1; // Very limited
    }

    // Response time (4 points)
    if (partner.capacity.averageResponseTime <= 2) {
      score += 4; // Very fast
    } else if (partner.capacity.averageResponseTime <= 4) {
      score += 3; // Fast
    } else if (partner.capacity.averageResponseTime <= 8) {
      score += 2; // Reasonable
    } else {
      score += 1; // Slow
    }

    return Math.min(score, 10);
  }

  private calculateTotalScore(breakdown: MatchingScore['breakdown']): number {
    const weightedScore =
      breakdown.specialization * (this.weights.specialization / 25) +
      breakdown.capacity * (this.weights.capacity / 20) +
      breakdown.performance * (this.weights.performance / 20) +
      breakdown.geography * (this.weights.geography / 15) +
      breakdown.riskAlignment * (this.weights.riskAlignment / 10) +
      breakdown.workload * (this.weights.workload / 10);

    return Math.round(weightedScore);
  }

  private calculateConfidence(
    partner: VietnameseFinancialPartner,
    criteria: MatchingCriteria,
    leadData?: LeadData
  ): number {
    let confidence = 50;

    // Data completeness
    if (leadData) {
      if (leadData.financial.creditScore) confidence += 10;
      if (leadData.employment.companyName) confidence += 5;
      if (leadData.loanRequirements.collateralAvailable) confidence += 5;
    }

    // Partner stability
    if (partner.business.establishedYear <= 2000) confidence += 10;
    if (partner.compliance.complianceScore >= 90) confidence += 10;

    // Market presence
    if (partner.coverage.national) confidence += 5;

    // Performance consistency
    if (partner.capacity.conversionRate >= 25 && partner.capacity.approvalRate >= 60) {
      confidence += 5;
    }

    return Math.min(confidence, 100);
  }

  private generateMatchReasons(
    partner: VietnameseFinancialPartner,
    criteria: MatchingCriteria,
    breakdown: MatchingScore['breakdown']
  ): string[] {
    const reasons: string[] = [];

    if (breakdown.specialization >= 20) {
      reasons.push(`Excellent specialization for ${criteria.loanType}`);
    }
    if (breakdown.capacity >= 16) {
      reasons.push('Strong processing capacity and availability');
    }
    if (breakdown.performance >= 16) {
      reasons.push('High approval and conversion rates');
    }
    if (breakdown.geography >= 12) {
      reasons.push('Strong local presence and coverage');
    }
    if (breakdown.riskAlignment >= 8) {
      reasons.push('Good risk profile alignment');
    }
    if (breakdown.workload >= 8) {
      reasons.push('Quick response times expected');
    }

    // Partner-specific reasons
    if (partner.metadata.featured) {
      reasons.push('Featured partner with proven track record');
    }
    if (partner.integration.apiAvailable && criteria.requiresOnlineApplication) {
      reasons.push('Full online application support');
    }
    if (partner.specializations.processingTime.max <= 3 && criteria.urgency === 'urgent') {
      reasons.push('Fast processing for urgent needs');
    }

    return reasons;
  }

  private generateConcerns(
    partner: VietnameseFinancialPartner,
    criteria: MatchingCriteria,
    breakdown: MatchingScore['breakdown']
  ): string[] {
    const concerns: string[] = [];

    if (breakdown.specialization < 15) {
      concerns.push('Limited experience with this loan type');
    }
    if (breakdown.capacity < 12) {
      concerns.push('Limited processing capacity');
    }
    if (breakdown.performance < 12) {
      concerns.push('Below-average performance metrics');
    }
    if (breakdown.geography < 10) {
      concerns.push('Limited local presence');
    }
    if (breakdown.riskAlignment < 6) {
      concerns.push('Risk profile may not align well');
    }
    if (breakdown.workload < 6) {
      concerns.push('Potential delays in response');
    }

    // Specific concerns
    const utilizationRate = partner.capacity.currentWorkload / partner.capacity.maxDailyLeads;
    if (utilizationRate > 0.85) {
      concerns.push('High current workload may affect response time');
    }

    if (partner.specializations.interestRateRange.min > (criteria.maxInterestRate || 50)) {
      concerns.push('Interest rates may be higher than preferred');
    }

    return concerns;
  }

  private estimateResponseTime(partner: VietnameseFinancialPartner, criteria: MatchingCriteria): number {
    let baseTime = partner.capacity.averageResponseTime;

    // Apply seasonal adjustments
    const currentMonth = new Date().getMonth() + 1;
    const seasonalFactor = this.marketFactors.seasonalFactors[currentMonth];
    if (seasonalFactor && seasonalFactor.affectedPartners.includes(partner.id)) {
      const adjustment = seasonalFactor.adjustmentFactors[partner.id] || 1.0;
      baseTime *= adjustment;
    }

    // Apply regional adjustments
    const provinceData = this.marketFactors.regionalPreferences[criteria.provinceCode];
    if (provinceData && provinceData.processingTimeMultipliers[partner.id]) {
      baseTime *= provinceData.processingTimeMultipliers[partner.id];
    }

    // Apply urgency adjustments
    if (criteria.urgency === 'urgent' && partner.specializations.processingTime.max <= 3) {
      baseTime *= 0.5; // Priority processing
    }

    // Apply workload adjustments
    const utilizationRate = partner.capacity.currentWorkload / partner.capacity.maxDailyLeads;
    if (utilizationRate > 0.8) {
      baseTime *= 1.5;
    } else if (utilizationRate > 0.6) {
      baseTime *= 1.2;
    }

    return Math.round(baseTime);
  }

  private calculateApprovalProbability(
    partner: VietnameseFinancialPartner,
    criteria: MatchingCriteria,
    leadScore?: LeadScore
  ): number {
    let probability = partner.capacity.approvalRate;

    // Adjust based on lead score
    if (leadScore) {
      if (leadScore.totalScore >= 85) {
        probability += 10;
      } else if (leadScore.totalScore >= 75) {
        probability += 5;
      } else if (leadScore.totalScore <= 60) {
        probability -= 10;
      } else if (leadScore.totalScore <= 50) {
        probability -= 20;
      }
    }

    // Adjust based on fit
    const amountRange = partner.specializations.maxAmount - partner.specializations.minAmount;
    const amountPosition = (criteria.loanAmount - partner.specializations.minAmount) / amountRange;
    if (amountPosition >= 0.3 && amountPosition <= 0.7) {
      probability += 5;
    } else if (amountPosition < 0.1 || amountPosition > 0.9) {
      probability -= 5;
    }

    // Adjust based on credit score
    if (criteria.creditScore && partner.specializations.creditScoreMin) {
      const scoreDifference = criteria.creditScore - partner.specializations.creditScoreMin;
      if (scoreDifference >= 100) {
        probability += 8;
      } else if (scoreDifference >= 50) {
        probability += 4;
      } else if (scoreDifference < 0) {
        probability -= 15;
      }
    }

    // Adjust based on capacity
    const utilizationRate = partner.capacity.currentWorkload / partner.capacity.maxDailyLeads;
    if (utilizationRate > 0.9) {
      probability -= 10;
    } else if (utilizationRate > 0.8) {
      probability -= 5;
    }

    return Math.min(Math.max(Math.round(probability), 0), 100);
  }

  private generateRecommendedActions(
    partner: VietnameseFinancialPartner,
    criteria: MatchingCriteria,
    breakdown: MatchingScore['breakdown']
  ): string[] {
    const actions: string[] = [];

    if (partner.integration.apiAvailable) {
      actions.push('Submit via online application portal');
    } else {
      actions.push('Contact branch office for application');
    }

    if (partner.specializations.processingTime.max <= 3) {
      actions.push('Prepare all documents for fast processing');
    }

    if (partner.leadForwarding.autoAcceptEnabled) {
      actions.push('Expect immediate confirmation of receipt');
    }

    if (breakdown.specialization < 15) {
      actions.push('Consider providing additional documentation to strengthen application');
    }

    if (breakdown.performance < 15) {
      actions.push('Have backup financial institutions ready');
    }

    if (partner.compliance.complianceScore < 85) {
      actions.push('Verify all compliance requirements are met');
    }

    return actions;
  }

  private generateRecommendations(
    scores: MatchingScore[],
    criteria: MatchingCriteria,
    leadData?: LeadData
  ): PartnerRecommendation[] {
    return scores.map(score => {
      const partner = VIETNAMESE_FINANCIAL_PARTNERS.find(p => p.id === score.partnerId)!;

      const recommended = score.totalScore >= 70 && score.confidence >= 70;
      const priority = score.totalScore >= 85 ? 'high' : score.totalScore >= 75 ? 'medium' : 'low';

      const reasoning = score.matchReasons;
      const advantages = this.extractAdvantages(partner, criteria);
      const disadvantages = this.extractDisadvantages(partner, criteria, score.concerns);
      const applicationTips = this.generateApplicationTips(partner, criteria, leadData);
      const requiredDocuments = this.getRequiredDocuments(partner, criteria);
      const expectedTimeline = this.generateExpectedTimeline(partner, criteria);
      const contactMethod = this.getContactMethod(partner);
      const specialRequirements = this.getSpecialRequirements(partner, criteria);

      return {
        partnerId: score.partnerId,
        partnerName: score.partnerName,
        recommended,
        priority,
        reasoning,
        advantages,
        disadvantages,
        applicationTips,
        requiredDocuments,
        expectedTimeline,
        contactMethod,
        specialRequirements,
      };
    });
  }

  private matchesEmploymentType(segment: string, employmentType: string): boolean {
    const segmentMappings: Record<string, string[]> = {
      'individual': ['full_time', 'part_time', 'self_employed'],
      'salaried_workers': ['full_time', 'part_time'],
      'government_employees': ['full_time'],
      'business': ['business_owner', 'self_employed'],
      'freelancer': ['freelancer', 'self_employed'],
    };

    return segmentMappings[segment]?.includes(employmentType) || false;
  }

  private matchesPartnerType(partnerType: string, advantage: string): boolean {
    const typeAdvantageMap: Record<string, string[]> = {
      'commercial_bank': ['government_focus', 'high_income_areas'],
      'consumer_finance': ['young_population', 'fintech_adoption'],
      'fintech': ['fintech_adoption', 'digital_services'],
      'p2p_lending': ['alternative_financing'],
    };

    return typeAdvantageMap[partnerType]?.includes(advantage) || false;
  }

  private extractAdvantages(partner: VietnameseFinancialPartner, criteria: MatchingCriteria): string[] {
    const advantages: string[] = [];

    if (partner.metadata.featured) advantages.push('Featured partner with proven track record');
    if (partner.coverage.national) advantages.push('Nationwide coverage');
    if (partner.integration.apiAvailable) advantages.push('Online application available');
    if (partner.specializations.processingTime.max <= 3) advantages.push('Fast processing');
    if (partner.capacity.conversionRate >= 30) advantages.push('High conversion rate');
    if (partner.capacity.approvalRate >= 70) advantages.push('High approval rate');
    if (partner.compliance.complianceScore >= 90) advantages.push('Excellent compliance record');

    return advantages;
  }

  private extractDisadvantages(
    partner: VietnameseFinancialPartner,
    criteria: MatchingCriteria,
    concerns: string[]
  ): string[] {
    const disadvantages: string[] = [];

    if (partner.specializations.interestRateRange.min > 15) {
      disadvantages.push('Higher interest rates');
    }
    if (partner.specializations.processingTime.max > 7) {
      disadvantages.push('Longer processing time');
    }
    if (!partner.coverage.national) {
      disadvantages.push('Limited geographic coverage');
    }
    if (partner.capacity.currentWorkload / partner.capacity.maxDailyLeads > 0.8) {
      disadvantages.push('Currently high workload');
    }

    return [...disadvantages, ...concerns];
  }

  private generateApplicationTips(
    partner: VietnameseFinancialPartner,
    criteria: MatchingCriteria,
    leadData?: LeadData
  ): string[] {
    const tips: string[] = [];

    if (partner.specializations.loanTypes.includes(criteria.loanType)) {
      tips.push(`Highlight your experience with ${criteria.loanType} needs`);
    }

    if (partner.leadForwarding.acceptanceCriteria.requiredFields.includes('businessDocuments')) {
      tips.push('Prepare business financial statements in advance');
    }

    if (criteria.loanAmount > partner.specializations.maxAmount * 0.8) {
      tips.push('Consider applying for a slightly lower amount initially');
    }

    if (partner.specializations.processingTime.max <= 3) {
      tips.push('Have all documents ready for same-day processing');
    }

    return tips;
  }

  private getRequiredDocuments(partner: VietnameseFinancialPartner, criteria: MatchingCriteria): string[] {
    const documents: string[] = ['ID Card/Passport', 'Proof of Income', 'Proof of Address'];

    if (criteria.loanAmount > 100000000) {
      documents.push('Bank Statements (6 months)');
    }

    if (partner.leadForwarding.acceptanceCriteria.requiredFields.includes('businessDocuments')) {
      documents.push('Business Registration', 'Tax Returns');
    }

    if (criteria.loanType === 'mortgage_loan') {
      documents.push('Property Documents', 'Title Deed');
    }

    if (criteria.loanType === 'auto_loan') {
      documents.push('Vehicle Documents', 'Purchase Agreement');
    }

    return documents;
  }

  private generateExpectedTimeline(partner: VietnameseFinancialPartner, criteria: MatchingCriteria): string {
    const processingDays = Math.round(
      (partner.specializations.processingTime.min + partner.specializations.processingTime.max) / 2
    );

    if (criteria.urgency === 'urgent' && partner.specializations.processingTime.max <= 3) {
      return `Same-day to ${processingDays} business days`;
    } else if (processingDays <= 2) {
      return '1-2 business days';
    } else if (processingDays <= 5) {
      return '2-5 business days';
    } else {
      return '5-10 business days';
    }
  }

  private getContactMethod(partner: VietnameseFinancialPartner): string {
    if (partner.integration.apiAvailable) {
      return 'Online Application Portal';
    } else if (partner.contact.hotlines && partner.contact.hotlines.length > 0) {
      return `Hotline: ${partner.contact.hotlines[0]}`;
    } else if (partner.contact.phone) {
      return `Phone: ${partner.contact.phone}`;
    } else {
      return 'Visit nearest branch';
    }
  }

  private getSpecialRequirements(
    partner: VietnameseFinancialPartner,
    criteria: MatchingCriteria
  ): string[] {
    const requirements: string[] = [];

    if (partner.leadForwarding.acceptanceCriteria.minIncomeLevel) {
      requirements.push(`Minimum income: ${partner.leadForwarding.acceptanceCriteria.minIncomeLevel.toLocaleString('vi-VN')} VND/month`);
    }

    if (partner.specializations.creditScoreMin) {
      requirements.push(`Minimum credit score: ${partner.specializations.creditScoreMin}`);
    }

    if (partner.leadForwarding.acceptanceCriteria.excludedProvinces?.includes(criteria.provinceCode)) {
      requirements.push('Province not covered by this partner');
    }

    if (partner.leadForwarding.acceptanceCriteria.maxLoanAmount &&
        criteria.loanAmount > partner.leadForwarding.acceptanceCriteria.maxLoanAmount) {
      requirements.push('Loan amount exceeds partner limit');
    }

    return requirements;
  }

  // Public utility methods
  public updateWeights(newWeights: Partial<MatchingWeights>): void {
    this.weights = { ...this.weights, ...newWeights };
  }

  public getWeights(): MatchingWeights {
    return { ...this.weights };
  }

  public updateMarketFactors(newFactors: Partial<VietnameseMarketFactors>): void {
    this.marketFactors = { ...this.marketFactors, ...newFactors };
  }

  public getMarketFactors(): VietnameseMarketFactors {
    return { ...this.marketFactors };
  }

  public getAlgorithmVersion(): string {
    return this.algorithmVersion;
  }
}

// Default matcher instance
export const defaultPartnerMatcher = new VietnamesePartnerMatcher();

// Convenience functions
export const matchVietnamesePartners = (
  leadId: string,
  criteria: MatchingCriteria,
  leadData?: LeadData,
  leadScore?: LeadScore
): MatchingResult => {
  return defaultPartnerMatcher.matchPartners(leadId, criteria, leadData, leadScore);
};

export default VietnamesePartnerMatcher;