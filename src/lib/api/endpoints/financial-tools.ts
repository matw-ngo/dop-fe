// @ts-nocheck
/**
 * Financial Tools API Endpoints
 *
 * API endpoints for financial calculations, validation, and data retrieval
 * for the Vietnamese digital lending platform.
 */

import { createClient } from "@/lib/api/client";
import type {
  LoanCalculationParams,
  MarketIndicator,
  TaxCalculationParams,
  VietnameseBank,
} from "@/lib/financial-data/vietnamese-financial-data";

// Create API client
const client = createClient("/api/v1");

// Types for API responses
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: {
    timestamp: string;
    requestId: string;
    version: string;
  };
}

export interface LoanCalculationResponse {
  monthlyPayment: number;
  totalPayment: number;
  totalInterest: number;
  effectiveInterestRate: number;
  apr: number;
  paymentSchedule: Array<{
    period: number;
    beginningBalance: number;
    scheduledPayment: number;
    principalPayment: number;
    interestPayment: number;
    endingBalance: number;
  }>;
  affordabilityScore?: number;
  dscr?: number;
}

export interface TaxCalculationResponse {
  grossIncome: number;
  socialInsurance: number;
  healthInsurance: number;
  unemploymentInsurance: number;
  totalInsurance: number;
  familyDeductions: number;
  taxableIncome: number;
  incomeTax: number;
  netIncome: number;
  effectiveTaxRate: number;
  additionalInsights: {
    isHighIncomeEarner: boolean;
    taxOptimizationOpportunities: string[];
    recommendedFilingMethod: string;
  };
}

export interface SavingsCalculationResponse {
  finalAmount: number;
  totalContributions: number;
  totalInterest: number;
  effectiveRate: number;
  realReturns: number;
  purchasingPowerImpact: {
    futureValue: number;
    purchasingPower: number;
    loss: number;
    lossPercentage: number;
  };
}

export interface BankComparisonResponse {
  banks: Array<{
    bankId: string;
    bankName: string;
    rate: number;
    effectiveRate: number;
    minimumAmount: number;
    features: string[];
    score: number;
  }>;
  bestOption: string;
  savingsAmount: number;
}

export interface FinancialHealthScoreResponse {
  overallScore: number;
  creditScore: number;
  incomeStability: number;
  debtManagement: number;
  savingsRate: number;
  investmentDiversity: number;
  recommendations: string[];
  riskFactors: string[];
  strengths: string[];
}

export interface AffordabilityAnalysisResponse {
  monthlyIncome: number;
  maxMonthlyPayment: number;
  recommendedLoanAmount: number;
  debtToIncomeRatio: number;
  affordabilityScore: number;
  riskLevel: "low" | "medium" | "high";
  recommendations: string[];
}

export interface ROIAnalysisResponse {
  roiPercentage: number;
  annualizedROI: number;
  riskAdjustedROI: number;
  realROI: number;
  profit: number;
  riskMultiplier: number;
  recommendations: string[];
}

export interface ValidationResponse {
  isValid: boolean;
  errors: Array<{
    field: string;
    message: string;
    severity: "critical" | "high" | "medium" | "low";
    code: string;
  }>;
  warnings: Array<{
    field: string;
    message: string;
    severity: "high" | "medium" | "low";
    code: string;
  }>;
  score: number;
  recommendations: string[];
}

export interface MarketDataResponse {
  indicators: MarketIndicator;
  trends: Array<{
    indicator: string;
    currentValue: number;
    previousValue: number;
    change: number;
    changePercent: number;
    direction: "up" | "down" | "stable";
  }>;
  riskAssessment: {
    overallRisk: "low" | "medium" | "high";
    factors: Array<{
      factor: string;
      risk: "low" | "medium" | "high";
      impact: string;
    }>;
  };
}

export interface ExportRequest {
  format: "pdf" | "excel" | "csv";
  data: any;
  template?: string;
  options?: {
    includeChart?: boolean;
    includeDetails?: boolean;
    language?: "vi" | "en";
  };
}

export interface ExportResponse {
  downloadUrl: string;
  fileId: string;
  expiresAt: string;
  fileSize: number;
  format: string;
}

/**
 * Loan Calculation Endpoints
 */
export const loanCalculationApi = {
  /**
   * Calculate loan details
   */
  calculate: async (
    params: LoanCalculationParams,
  ): Promise<ApiResponse<LoanCalculationResponse>> => {
    try {
      const response = await client.post(
        "/financial-tools/loan/calculate",
        params,
      );
      return response.data;
    } catch (error) {
      console.error("Loan calculation error:", error);
      throw error;
    }
  },

  /**
   * Compare multiple loan options
   */
  compare: async (
    loanOptions: LoanCalculationParams[],
  ): Promise<ApiResponse<any>> => {
    try {
      const response = await client.post("/financial-tools/loan/compare", {
        loanOptions,
      });
      return response.data;
    } catch (error) {
      console.error("Loan comparison error:", error);
      throw error;
    }
  },

  /**
   * Assess loan eligibility
   */
  assessEligibility: async (
    loanType: string,
    loanAmount: number,
    monthlyIncome: number,
    monthlyDebts: number,
    creditScore?: number,
    hasCollateral?: boolean,
  ): Promise<ApiResponse<any>> => {
    try {
      const response = await client.post("/financial-tools/loan/eligibility", {
        loanType,
        loanAmount,
        monthlyIncome,
        monthlyDebts,
        creditScore,
        hasCollateral,
      });
      return response.data;
    } catch (error) {
      console.error("Eligibility assessment error:", error);
      throw error;
    }
  },

  /**
   * Get early repayment options
   */
  calculateEarlyRepayment: async (
    originalLoan: any,
    currentMonth: number,
    earlyRepaymentAmount: number,
  ): Promise<ApiResponse<any>> => {
    try {
      const response = await client.post(
        "/financial-tools/loan/early-repayment",
        {
          originalLoan,
          currentMonth,
          earlyRepaymentAmount,
        },
      );
      return response.data;
    } catch (error) {
      console.error("Early repayment calculation error:", error);
      throw error;
    }
  },
};

/**
 * Tax Calculation Endpoints
 */
export const taxCalculationApi = {
  /**
   * Calculate personal income tax
   */
  calculate: async (
    params: TaxCalculationParams,
  ): Promise<ApiResponse<TaxCalculationResponse>> => {
    try {
      const response = await client.post(
        "/financial-tools/tax/calculate",
        params,
      );
      return response.data;
    } catch (error) {
      console.error("Tax calculation error:", error);
      throw error;
    }
  },

  /**
   * Analyze compensation structure
   */
  analyzeCompensation: async (
    baseSalary: number,
    bonus?: number,
    allowances?: number,
    stockOptions?: number,
    numberOfDependents?: number,
    region?: number,
  ): Promise<ApiResponse<any>> => {
    try {
      const response = await client.post(
        "/financial-tools/tax/compensation-analysis",
        {
          baseSalary,
          bonus,
          allowances,
          stockOptions,
          numberOfDependents,
          region,
        },
      );
      return response.data;
    } catch (error) {
      console.error("Compensation analysis error:", error);
      throw error;
    }
  },

  /**
   * Get tax compliance checklist
   */
  getComplianceChecklist: async (
    taxpayerType: "individual" | "corporate" | "freelancer",
    annualIncome: number,
  ): Promise<ApiResponse<any>> => {
    try {
      const response = await client.post(
        "/financial-tools/tax/compliance-checklist",
        {
          taxpayerType,
          annualIncome,
        },
      );
      return response.data;
    } catch (error) {
      console.error("Compliance checklist error:", error);
      throw error;
    }
  },
};

/**
 * Savings Calculation Endpoints
 */
export const savingsCalculationApi = {
  /**
   * Calculate savings growth
   */
  calculate: async (
    principal: number,
    monthlyContribution?: number,
    annualRate: number,
    termInMonths: number,
    compoundingFrequency?: "monthly" | "quarterly" | "annual",
  ): Promise<ApiResponse<SavingsCalculationResponse>> => {
    try {
      const response = await client.post("/financial-tools/savings/calculate", {
        principal,
        monthlyContribution,
        annualRate,
        termInMonths,
        compoundingFrequency,
      });
      return response.data;
    } catch (error) {
      console.error("Savings calculation error:", error);
      throw error;
    }
  },

  /**
   * Compare bank savings rates
   */
  compareBanks: async (
    amount: number,
    termInMonths: number,
  ): Promise<ApiResponse<BankComparisonResponse>> => {
    try {
      const response = await client.post(
        "/financial-tools/savings/compare-banks",
        {
          amount,
          termInMonths,
        },
      );
      return response.data;
    } catch (error) {
      console.error("Bank comparison error:", error);
      throw error;
    }
  },

  /**
   * Calculate savings goal feasibility
   */
  analyzeGoal: async (
    targetAmount: number,
    currentSavings: number,
    monthlyContribution: number,
    desiredMonths: number,
  ): Promise<ApiResponse<any>> => {
    try {
      const response = await client.post(
        "/financial-tools/savings/goal-analysis",
        {
          targetAmount,
          currentSavings,
          monthlyContribution,
          desiredMonths,
        },
      );
      return response.data;
    } catch (error) {
      console.error("Goal analysis error:", error);
      throw error;
    }
  },
};

/**
 * Financial Analysis Endpoints
 */
export const financialAnalysisApi = {
  /**
   * Calculate financial health score
   */
  calculateHealthScore: async (
    monthlyIncome: number,
    monthlyExpenses: number,
    monthlyDebts: number,
    monthlySavings: number,
    creditScore: number,
    hasEmergencyFund: boolean,
    hasInsurance: boolean,
    investmentDiversity: number,
  ): Promise<ApiResponse<FinancialHealthScoreResponse>> => {
    try {
      const response = await client.post(
        "/financial-tools/analysis/health-score",
        {
          monthlyIncome,
          monthlyExpenses,
          monthlyDebts,
          monthlySavings,
          creditScore,
          hasEmergencyFund,
          hasInsurance,
          investmentDiversity,
        },
      );
      return response.data;
    } catch (error) {
      console.error("Health score calculation error:", error);
      throw error;
    }
  },

  /**
   * Analyze loan affordability
   */
  analyzeAffordability: async (
    loanAmount: number,
    monthlyIncome: number,
    monthlyDebts: number,
    interestRate: number,
    termInMonths: number,
  ): Promise<ApiResponse<AffordabilityAnalysisResponse>> => {
    try {
      const response = await client.post(
        "/financial-tools/analysis/affordability",
        {
          loanAmount,
          monthlyIncome,
          monthlyDebts,
          interestRate,
          termInMonths,
        },
      );
      return response.data;
    } catch (error) {
      console.error("Affordability analysis error:", error);
      throw error;
    }
  },

  /**
   * Calculate return on investment
   */
  calculateROI: async (
    investmentAmount: number,
    expectedReturn: number,
    investmentPeriod: number,
    riskLevel: "low" | "medium" | "high",
    inflationRate?: number,
  ): Promise<ApiResponse<ROIAnalysisResponse>> => {
    try {
      const response = await client.post("/financial-tools/analysis/roi", {
        investmentAmount,
        expectedReturn,
        investmentPeriod,
        riskLevel,
        inflationRate,
      });
      return response.data;
    } catch (error) {
      console.error("ROI calculation error:", error);
      throw error;
    }
  },
};

/**
 * Market Data Endpoints
 */
export const marketDataApi = {
  /**
   * Get current market indicators
   */
  getIndicators: async (): Promise<ApiResponse<MarketDataResponse>> => {
    try {
      const response = await client.get("/financial-tools/market/indicators");
      return response.data;
    } catch (error) {
      console.error("Market indicators error:", error);
      throw error;
    }
  },

  /**
   * Get Vietnamese bank rates
   */
  getBankRates: async (
    productType?: "loan" | "savings",
    term?: number,
  ): Promise<ApiResponse<VietnameseBank[]>> => {
    try {
      const params = new URLSearchParams();
      if (productType) params.append("productType", productType);
      if (term) params.append("term", term.toString());

      const response = await client.get(
        `/financial-tools/market/bank-rates?${params}`,
      );
      return response.data;
    } catch (error) {
      console.error("Bank rates error:", error);
      throw error;
    }
  },

  /**
   * Get interest rate trends
   */
  getInterestRateTrends: async (
    period: "1m" | "3m" | "6m" | "1y" | "all",
  ): Promise<ApiResponse<any>> => {
    try {
      const response = await client.get(
        `/financial-tools/market/interest-trends?period=${period}`,
      );
      return response.data;
    } catch (error) {
      console.error("Interest rate trends error:", error);
      throw error;
    }
  },
};

/**
 * Validation Endpoints
 */
export const validationApi = {
  /**
   * Validate loan calculation parameters
   */
  validateLoanParams: async (
    params: LoanCalculationParams,
  ): Promise<ApiResponse<ValidationResponse>> => {
    try {
      const response = await client.post(
        "/financial-tools/validation/loan",
        params,
      );
      return response.data;
    } catch (error) {
      console.error("Loan validation error:", error);
      throw error;
    }
  },

  /**
   * Validate tax calculation parameters
   */
  validateTaxParams: async (
    params: TaxCalculationParams,
  ): Promise<ApiResponse<ValidationResponse>> => {
    try {
      const response = await client.post(
        "/financial-tools/validation/tax",
        params,
      );
      return response.data;
    } catch (error) {
      console.error("Tax validation error:", error);
      throw error;
    }
  },

  /**
   * Check regulatory compliance
   */
  checkCompliance: async (
    type: "loan" | "tax" | "savings",
    details: any,
  ): Promise<ApiResponse<any>> => {
    try {
      const response = await client.post(
        "/financial-tools/validation/compliance",
        {
          type,
          details,
        },
      );
      return response.data;
    } catch (error) {
      console.error("Compliance check error:", error);
      throw error;
    }
  },
};

/**
 * Export and Reporting Endpoints
 */
export const exportApi = {
  /**
   * Export calculation results
   */
  exportResults: async (
    request: ExportRequest,
  ): Promise<ApiResponse<ExportResponse>> => {
    try {
      const response = await client.post("/financial-tools/export", request);
      return response.data;
    } catch (error) {
      console.error("Export error:", error);
      throw error;
    }
  },

  /**
   * Generate financial report
   */
  generateReport: async (
    reportType:
      | "loan-summary"
      | "tax-analysis"
      | "savings-projection"
      | "health-assessment",
    data: any,
    options?: any,
  ): Promise<ApiResponse<ExportResponse>> => {
    try {
      const response = await client.post("/financial-tools/reports/generate", {
        reportType,
        data,
        options,
      });
      return response.data;
    } catch (error) {
      console.error("Report generation error:", error);
      throw error;
    }
  },

  /**
   * Get download URL for exported file
   */
  getDownloadUrl: async (
    fileId: string,
  ): Promise<ApiResponse<{ downloadUrl: string }>> => {
    try {
      const response = await client.get(
        `/financial-tools/export/download/${fileId}`,
      );
      return response.data;
    } catch (error) {
      console.error("Download URL error:", error);
      throw error;
    }
  },
};

/**
 * Utility function to handle API errors
 */
export const handleApiError = (error: any): string => {
  if (error.response?.data?.error?.message) {
    return error.response.data.error.message;
  }
  if (error.message) {
    return error.message;
  }
  return "Đã xảy ra lỗi không mong muốn. Vui lòng thử lại sau.";
};

/**
 * Utility function to check API response success
 */
export const isApiSuccess = <T>(
  response: ApiResponse<T>,
): response is ApiResponse<T> & { success: true } => {
  return response.success === true;
};

// Export all APIs
export default {
  loan: loanCalculationApi,
  tax: taxCalculationApi,
  savings: savingsCalculationApi,
  analysis: financialAnalysisApi,
  market: marketDataApi,
  validation: validationApi,
  export: exportApi,
  utils: {
    handleApiError,
    isApiSuccess,
  },
};
