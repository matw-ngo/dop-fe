/**
 * Financial Comparison Hook
 *
 * Custom hook for financial comparison functionality including loan comparisons,
  * bank rate comparisons, and financial health scoring.
 */

import { useState, useCallback, useEffect } from 'react';
import { useFinancialToolsStore } from '@/store/use-financial-tools-store';
import { calculateFinancialHealthScore } from '@/lib/financial/calculations';
import { analyzeAffordability } from '@/lib/financial/calculations';
import { financialAnalysisApi } from '@/lib/api/endpoints/financial-tools';

// Types
export interface UseFinancialComparisonOptions {
  enableCache?: boolean;
  enableAnalytics?: boolean;
  autoRefresh?: boolean;
  refreshInterval?: number; // in milliseconds
  onError?: (error: string) => void;
  onSuccess?: (result: any) => void;
}

export interface FinancialComparisonState {
  healthScore?: {
    overallScore: number;
    creditScore: number;
    incomeStability: number;
    debtManagement: number;
    savingsRate: number;
    investmentDiversity: number;
    recommendations: string[];
    riskFactors: string[];
    strengths: string[];
  };
  affordabilityAnalysis?: {
    monthlyIncome: number;
    maxMonthlyPayment: number;
    recommendedLoanAmount: number;
    debtToIncomeRatio: number;
    affordabilityScore: number;
    riskLevel: 'low' | 'medium' | 'high';
    recommendations: string[];
  };
  roiAnalysis?: {
    roiPercentage: number;
    annualizedROI: number;
    riskAdjustedROI: number;
    realROI: number;
    profit: number;
    riskMultiplier: number;
    recommendations: string[];
  };
  loading: boolean;
  error?: string;
  lastRefreshed?: string;
}

export interface FinancialComparisonActions {
  calculateHealthScore: (
    monthlyIncome: number,
    monthlyExpenses: number,
    monthlyDebts: number,
    monthlySavings: number,
    creditScore: number,
    hasEmergencyFund: boolean,
    hasInsurance: boolean,
    investmentDiversity: number
  ) => Promise<void>;
  analyzeAffordability: (
    loanAmount: number,
    monthlyIncome: number,
    monthlyDebts: number,
    interestRate: number,
    termInMonths: number
  ) => Promise<void>;
  calculateROI: (
    investmentAmount: number,
    expectedReturn: number,
    investmentPeriod: number,
    riskLevel: 'low' | 'medium' | 'high',
    inflationRate?: number
  ) => Promise<void>;
  refresh: () => Promise<void>;
  reset: () => void;
  exportAnalysis: (type: 'health' | 'affordability' | 'roi', format: 'pdf' | 'excel') => Promise<void>;
}

export type UseFinancialComparisonReturn = FinancialComparisonState & FinancialComparisonActions;

/**
 * Custom hook for financial comparison functionality
 */
export const useFinancialComparison = (
  options: UseFinancialComparisonOptions = {}
): UseFinancialComparisonReturn => {
  const {
    enableCache = true,
    enableAnalytics = false,
    autoRefresh = false,
    refreshInterval = 300000, // 5 minutes
    onError,
    onSuccess,
  } = options;

  // Store integration
  const {
    setHealthScore,
    setAffordabilityAnalysis,
    setLoading,
    setError,
    addToHistory,
  } = useFinancialToolsStore();

  // Local state
  const [healthScore, setHealthScoreLocal] = useState<any>();
  const [affordabilityAnalysis, setAffordabilityAnalysisLocal] = useState<any>();
  const [roiAnalysis, setRoiAnalysisLocal] = useState<any>();
  const [loading, setLoadingLocal] = useState(false);
  const [error, setErrorLocal] = useState<string>();
  const [lastRefreshed, setLastRefreshed] = useState<string>();

  // Cache for results
  const cache = new Map<string, any>();

  // Generate cache key
  const generateCacheKey = (type: string, params: any): string => {
    return JSON.stringify({ type, params });
  };

  // Calculate financial health score
  const calculateHealthScore = useCallback(
    async (
      monthlyIncome: number,
      monthlyExpenses: number,
      monthlyDebts: number,
      monthlySavings: number,
      creditScore: number,
      hasEmergencyFund: boolean,
      hasInsurance: boolean,
      investmentDiversity: number
    ): Promise<void> => {
      const params = {
        monthlyIncome,
        monthlyExpenses,
        monthlyDebts,
        monthlySavings,
        creditScore,
        hasEmergencyFund,
        hasInsurance,
        investmentDiversity,
      };

      setLoadingLocal(true);
      setLoading('calculations', true);

      try {
        // Check cache first
        const cacheKey = generateCacheKey('health', params);
        let healthScoreResult: any;

        if (enableCache && cache.has(cacheKey)) {
          healthScoreResult = cache.get(cacheKey);
        } else {
          // Calculate health score
          healthScoreResult = calculateFinancialHealthScore(
            monthlyIncome,
            monthlyExpenses,
            monthlyDebts,
            monthlySavings,
            creditScore,
            hasEmergencyFund,
            hasInsurance,
            investmentDiversity
          );

          // Cache the result
          if (enableCache) {
            cache.set(cacheKey, healthScoreResult);
          }
        }

        // Update state
        setHealthScoreLocal(healthScoreResult);
        setHealthScore(healthScoreResult);
        setErrorLocal(undefined);
        setError('calculation', undefined);
        setLastRefreshed(new Date().toISOString());

        // Add to history
        addToHistory('health', params, healthScoreResult);

        // Analytics
        if (enableAnalytics) {
          console.log('Financial health score calculated', {
            overallScore: healthScoreResult.overallScore,
            creditScore: healthScoreResult.creditScore,
            riskFactorsCount: healthScoreResult.riskFactors.length,
          });
        }

        onSuccess?.(healthScoreResult);

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Health score calculation failed';
        setErrorLocal(errorMessage);
        setError('calculation', errorMessage);
        onError?.(errorMessage);
      } finally {
        setLoadingLocal(false);
        setLoading('calculations', false);
      }
    },
    [
      enableCache,
      enableAnalytics,
      setHealthScore,
      setError,
      setErrorLocal,
      setLoading,
      addToHistory,
      onSuccess,
      onError,
    ]
  );

  // Analyze affordability
  const analyzeAffordability = useCallback(
    async (
      loanAmount: number,
      monthlyIncome: number,
      monthlyDebts: number,
      interestRate: number,
      termInMonths: number
    ): Promise<void> => {
      const params = {
        loanAmount,
        monthlyIncome,
        monthlyDebts,
        interestRate,
        termInMonths,
      };

      setLoadingLocal(true);
      setLoading('calculations', true);

      try {
        // Check cache first
        const cacheKey = generateCacheKey('affordability', params);
        let affordabilityResult: any;

        if (enableCache && cache.has(cacheKey)) {
          affordabilityResult = cache.get(cacheKey);
        } else {
          // Analyze affordability
          affordabilityResult = analyzeAffordability(
            monthlyIncome,
            monthlyDebts,
            interestRate,
            loanAmount,
            termInMonths
          );

          // Cache the result
          if (enableCache) {
            cache.set(cacheKey, affordabilityResult);
          }
        }

        // Update state
        setAffordabilityAnalysisLocal(affordabilityResult);
        setAffordabilityAnalysis(affordabilityResult);
        setErrorLocal(undefined);
        setError('calculation', undefined);
        setLastRefreshed(new Date().toISOString());

        // Add to history
        addToHistory('affordability', params, affordabilityResult);

        // Analytics
        if (enableAnalytics) {
          console.log('Affordability analysis completed', {
            loanAmount,
            affordabilityScore: affordabilityResult.affordabilityScore,
            riskLevel: affordabilityResult.riskLevel,
          });
        }

        onSuccess?.(affordabilityResult);

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Affordability analysis failed';
        setErrorLocal(errorMessage);
        setError('calculation', errorMessage);
        onError?.(errorMessage);
      } finally {
        setLoadingLocal(false);
        setLoading('calculations', false);
      }
    },
    [
      enableCache,
      enableAnalytics,
      setAffordabilityAnalysis,
      setError,
      setErrorLocal,
      setLoading,
      addToHistory,
      onSuccess,
      onError,
    ]
  );

  // Calculate ROI
  const calculateROI = useCallback(
    async (
      investmentAmount: number,
      expectedReturn: number,
      investmentPeriod: number,
      riskLevel: 'low' | 'medium' | 'high',
      inflationRate: number = 3.89
    ): Promise<void> => {
      const params = {
        investmentAmount,
        expectedReturn,
        investmentPeriod,
        riskLevel,
        inflationRate,
      };

      setLoadingLocal(true);
      setLoading('calculations', true);

      try {
        // Check cache first
        const cacheKey = generateCacheKey('roi', params);
        let roiResult: any;

        if (enableCache && cache.has(cacheKey)) {
          roiResult = cache.get(cacheKey);
        } else {
          // Calculate ROI
          const profit = expectedReturn - investmentAmount;
          const roiPercentage = (profit / investmentAmount) * 100;
          const annualizedROI = roiPercentage * (12 / investmentPeriod);

          // Risk-adjusted ROI
          const riskMultiplier = riskLevel === 'low' ? 1.0 :
                               riskLevel === 'medium' ? 0.8 : 0.6;
          const riskAdjustedROI = annualizedROI * riskMultiplier;

          // Inflation-adjusted ROI
          const realROI = ((1 + annualizedROI / 100) / (1 + inflationRate / 100) - 1) * 100;

          roiResult = {
            roiPercentage,
            annualizedROI,
            riskAdjustedROI,
            realROI,
            profit,
            riskMultiplier,
            recommendations: generateROIRecommendations(annualizedROI, riskLevel, realROI),
          };

          // Cache the result
          if (enableCache) {
            cache.set(cacheKey, roiResult);
          }
        }

        // Update state
        setRoiAnalysisLocal(roiResult);
        setErrorLocal(undefined);
        setError('calculation', undefined);
        setLastRefreshed(new Date().toISOString());

        // Add to history
        addToHistory('roi', params, roiResult);

        // Analytics
        if (enableAnalytics) {
          console.log('ROI calculation completed', {
            investmentAmount,
            roiPercentage: roiResult.roiPercentage,
            riskLevel,
            riskAdjustedROI: roiResult.riskAdjustedROI,
          });
        }

        onSuccess?.(roiResult);

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'ROI calculation failed';
        setErrorLocal(errorMessage);
        setError('calculation', errorMessage);
        onError?.(errorMessage);
      } finally {
        setLoadingLocal(false);
        setLoading('calculations', false);
      }
    },
    [
      enableCache,
      enableAnalytics,
      setError,
      setErrorLocal,
      setLoading,
      addToHistory,
      onSuccess,
      onError,
    ]
  );

  // Generate ROI recommendations
  const generateROIRecommendations = (
    annualizedROI: number,
    riskLevel: 'low' | 'medium' | 'high',
    realROI: number
  ): string[] => {
    const recommendations: string[] = [];

    if (annualizedROI > 20) {
      recommendations.push('ROI rất cao - xem xét rủi ro và tính bền vững');
    } else if (annualizedROI > 10) {
      recommendations.push('ROI tốt - cơ hội đầu tư hấp dẫn');
    } else if (annualizedROI < 5) {
      recommendations.push('ROI thấp - cân nhắc các lựa chọn khác');
    }

    if (realROI < 0) {
      recommendations.push('ROI thực âm sau lạm phát - xem xét lại khoản đầu tư');
    } else if (realROI < 2) {
      recommendations.push('ROI thực thấp - có thể không bù đắp được lạm phát');
    }

    if (riskLevel === 'high' && annualizedROI < 15) {
      recommendations.push('Rủi ro cao nhưng ROI không tương xứng - cân nhắc lại');
    }

    return recommendations;
  };

  // Refresh all analyses
  const refresh = useCallback(async (): Promise<void> => {
    // This would typically refresh market data and recache
    setLastRefreshed(new Date().toISOString());
  }, []);

  // Reset all analyses
  const reset = useCallback(() => {
    setHealthScoreLocal(undefined);
    setAffordabilityAnalysisLocal(undefined);
    setRoiAnalysisLocal(undefined);
    setErrorLocal(undefined);
    setLastRefreshed(undefined);
    cache.clear();
  }, []);

  // Export analysis
  const exportAnalysis = useCallback(
    async (type: 'health' | 'affordability' | 'roi', format: 'pdf' | 'excel'): Promise<void> => {
      let data;
      let analysisType;

      switch (type) {
        case 'health':
          if (!healthScore) return;
          data = healthScore;
          analysisType = 'health-assessment';
          break;
        case 'affordability':
          if (!affordabilityAnalysis) return;
          data = affordabilityAnalysis;
          analysisType = 'affordability-analysis';
          break;
        case 'roi':
          if (!roiAnalysis) return;
          data = roiAnalysis;
          analysisType = 'roi-analysis';
          break;
      }

      try {
        setLoading('export', true);

        const response = await financialAnalysisApi.generateReport(
          analysisType,
          data,
          { format, language: 'vi' }
        );

        if (response.success && response.data) {
          // Trigger download
          const link = document.createElement('a');
          link.href = response.data.downloadUrl;
          link.download = `${analysisType}-${Date.now()}.${format}`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
      } catch (error) {
        console.error('Export error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Export failed';
        setError('export', errorMessage);
      } finally {
        setLoading('export', false);
      }
    },
    [healthScore, affordabilityAnalysis, roiAnalysis, setLoading, setError]
  );

  // Auto refresh
  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        refresh();
      }, refreshInterval);

      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval, refresh]);

  return {
    // State
    healthScore,
    affordabilityAnalysis,
    roiAnalysis,
    loading: loading || setLoadingLocal,
    error: error || useFinancialToolsStore.getState().errors.calculation,
    lastRefreshed,

    // Actions
    calculateHealthScore,
    analyzeAffordability,
    calculateROI,
    refresh,
    reset,
    exportAnalysis,
  };
};

export default useFinancialComparison;