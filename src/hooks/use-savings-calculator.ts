/**
 * Savings Calculator Hook
 *
 * Custom hook for savings calculation functionality with Vietnamese market specifics,
 * bank comparisons, and goal planning.
 */

import { useState, useCallback, useEffect } from "react";
import { useFinancialToolsStore } from "@/store/use-financial-tools-store";
import {
  getBestSavingsRates,
  compareSavingsProducts,
  calculateCompoundInterest,
} from "@/lib/financial-data/bank-rates";
import { calculateRealReturns } from "@/lib/financial-data/market-indicators";

// Types
export interface UseSavingsCalculatorOptions {
  enableCache?: boolean;
  enableAnalytics?: boolean;
  autoCalculate?: boolean;
  includeInflation?: boolean;
  onError?: (error: string) => void;
  onSuccess?: (result: any) => void;
}

export interface SavingsCalculatorState {
  params?: {
    principal: number;
    monthlyContribution?: number;
    annualRate: number;
    termInMonths: number;
    compoundingFrequency?: "monthly" | "quarterly" | "annual";
  };
  result?: {
    finalAmount: number;
    totalContributions: number;
    totalInterest: number;
    effectiveRate: number;
    realReturns?: number;
  };
  loading: boolean;
  error?: string;
  isValid: boolean;
}

export interface SavingsCalculatorActions {
  setParams: (params: any) => void;
  calculate: () => Promise<void>;
  reset: () => void;
  validate: () => boolean;
  compareBanks: (amount: number, termInMonths: number) => Promise<any>;
  calculateGoal: (
    targetAmount: number,
    monthlyContribution: number,
    desiredMonths: number,
  ) => Promise<any>;
  exportResults: (format: "pdf" | "excel") => Promise<void>;
}

export type UseSavingsCalculatorReturn = SavingsCalculatorState &
  SavingsCalculatorActions;

/**
 * Custom hook for savings calculation functionality
 */
export const useSavingsCalculator = (
  initialParams?: any,
  options: UseSavingsCalculatorOptions = {},
): UseSavingsCalculatorReturn => {
  const {
    enableCache = true,
    enableAnalytics = false,
    autoCalculate = true,
    includeInflation = false,
    onError,
    onSuccess,
  } = options;

  // Store integration
  const {
    setSavingsParams,
    setSavingsResults,
    clearSavingsCalculation,
    setLoading,
    setError,
    addToHistory,
  } = useFinancialToolsStore();

  // Local state
  const [localParams, setLocalParams] = useState(initialParams);
  const [result, setResult] = useState<any>();
  const [loading, setLoadingLocal] = useState(false);
  const [error, setErrorLocal] = useState<string>();

  // Cache for results
  const cache = new Map<string, any>();

  // Generate cache key
  const generateCacheKey = (params: any): string => {
    return JSON.stringify({
      principal: params.principal,
      monthlyContribution: params.monthlyContribution,
      annualRate: params.annualRate,
      termInMonths: params.termInMonths,
      compoundingFrequency: params.compoundingFrequency,
      includeInflation,
    });
  };

  // Validate parameters
  const validate = useCallback((): boolean => {
    if (!localParams) return false;

    if (localParams.principal <= 0) {
      const errorMessage = "Số tiền gửi phải lớn hơn 0";
      setErrorLocal(errorMessage);
      setError("calculation", errorMessage);
      onError?.(errorMessage);
      return false;
    }

    if (localParams.annualRate < 0 || localParams.annualRate > 50) {
      const errorMessage = "Lãi suất không hợp lệ (0-50%)";
      setErrorLocal(errorMessage);
      setError("calculation", errorMessage);
      onError?.(errorMessage);
      return false;
    }

    setErrorLocal(undefined);
    setError("calculation", undefined);
    return true;
  }, [localParams, setError, onError]);

  // Calculate savings
  const calculate = useCallback(async (): Promise<void> => {
    if (!localParams) return;

    // Validate parameters
    if (!validate()) return;

    setLoadingLocal(true);
    setLoading("calculations", true);

    try {
      // Check cache first
      const cacheKey = generateCacheKey(localParams);
      let calculationResult: any;

      if (enableCache && cache.has(cacheKey)) {
        calculationResult = cache.get(cacheKey);
      } else {
        // Perform calculation
        const frequency =
          localParams.compoundingFrequency === "monthly"
            ? 12
            : localParams.compoundingFrequency === "quarterly"
              ? 4
              : 1;

        // Calculate base interest
        const baseCalculation = calculateCompoundInterest(
          localParams.principal,
          localParams.annualRate,
          localParams.termInMonths,
          frequency,
        );

        let finalAmount = baseCalculation.finalAmount;
        let totalInterest = baseCalculation.totalInterest;
        let totalContributions = localParams.principal;

        // Calculate with monthly contributions if specified
        if (
          localParams.monthlyContribution &&
          localParams.monthlyContribution > 0
        ) {
          let currentBalance = localParams.principal;
          const monthlyRate = localParams.annualRate / 100 / 12;

          for (let month = 1; month <= localParams.termInMonths; month++) {
            const monthInterest = currentBalance * monthlyRate;
            currentBalance += monthInterest + localParams.monthlyContribution;
            totalContributions += localParams.monthlyContribution;
          }

          finalAmount = currentBalance;
          totalInterest = finalAmount - totalContributions;
        }

        // Calculate effective rate
        const effectiveRate =
          ((finalAmount - totalContributions) / totalContributions) *
          (12 / localParams.termInMonths) *
          100;

        calculationResult = {
          finalAmount,
          totalContributions,
          totalInterest,
          effectiveRate,
        };

        // Add inflation adjustment if requested
        if (includeInflation) {
          const realReturns = calculateRealReturns(effectiveRate, 3.89); // Current inflation
          calculationResult.realReturns = realReturns;
        }

        // Cache the result
        if (enableCache) {
          cache.set(cacheKey, calculationResult);
        }
      }

      // Update state
      setResult(calculationResult);

      // Convert to ISavingsResult for store compatibility
      const savingsResultForStore = {
        savings: [], // TODO: Convert calculationResult to ISavings format
        minRate: localParams.annualRate,
        maxRate: localParams.annualRate,
        totalCount: 0,
      };
      setSavingsResults(savingsResultForStore);

      setErrorLocal(undefined);
      setError("calculation", undefined);

      // Add to history
      addToHistory("savings", localParams, calculationResult);

      // Analytics
      if (enableAnalytics) {
        console.log("Savings calculation completed", {
          principal: localParams.principal,
          annualRate: localParams.annualRate,
          termInMonths: localParams.termInMonths,
          result: calculationResult,
        });
      }

      onSuccess?.(calculationResult);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Calculation failed";
      setErrorLocal(errorMessage);
      setError("calculation", errorMessage);
      onError?.(errorMessage);
    } finally {
      setLoadingLocal(false);
      setLoading("calculations", false);
    }
  }, [
    localParams,
    validate,
    enableCache,
    includeInflation,
    enableAnalytics,
    setResult,
    setSavingsResults,
    setError,
    setErrorLocal,
    addToHistory,
    setLoading,
    onSuccess,
    onError,
  ]);

  // Compare bank rates
  const compareBanks = useCallback(
    async (amount: number, termInMonths: number): Promise<any> => {
      try {
        setLoading("calculations", true);

        const comparison = compareSavingsProducts(amount, termInMonths);
        return comparison;
      } catch (error) {
        console.error("Bank comparison error:", error);
        throw error;
      } finally {
        setLoading("calculations", false);
      }
    },
    [setLoading],
  );

  // Calculate savings goal
  const calculateGoal = useCallback(
    async (
      targetAmount: number,
      monthlyContribution: number,
      desiredMonths: number,
    ): Promise<any> => {
      try {
        setLoading("calculations", true);

        const remainingAmount = targetAmount;
        const monthlyRate = 0.006; // Assume 7.2% annual rate

        // Time calculation with compound interest
        const timeWithInterest =
          Math.log((remainingAmount * monthlyRate) / monthlyContribution + 1) /
          Math.log(1 + monthlyRate);
        const timeToGoal = Math.ceil(timeWithInterest);

        // Feasibility assessment
        let feasibility: "easy" | "moderate" | "challenging" | "impossible";
        let recommendations: string[] = [];

        if (timeToGoal <= desiredMonths) {
          feasibility = "easy";
          recommendations.push(
            "Mục tiêu khả quan - có thể đạt được sớm hơn dự kiến",
          );
        } else if (timeToGoal <= desiredMonths * 1.5) {
          feasibility = "moderate";
          recommendations.push(
            "Mục tiêu có thể đạt được - cần tăng tiết kiệm hoặc thời gian",
          );
        } else if (timeToGoal <= desiredMonths * 2) {
          feasibility = "challenging";
          recommendations.push(
            "Mục tiêu thử thách - cần tăng đáng kể tiết kiệm",
          );
        } else {
          feasibility = "impossible";
          recommendations.push(
            "Mục tiêu hiện không khả thi với điều kiện hiện tại",
          );
        }

        return {
          targetAmount,
          monthlyContribution,
          desiredMonths,
          timeToGoal,
          feasibility,
          recommendations,
          requiredRate:
            (Math.pow(
              targetAmount / (monthlyContribution * desiredMonths),
              1 / desiredMonths,
            ) -
              1) *
            12 *
            100,
        };
      } catch (error) {
        console.error("Goal calculation error:", error);
        throw error;
      } finally {
        setLoading("calculations", false);
      }
    },
    [setLoading],
  );

  // Export results
  const exportResults = useCallback(
    async (format: "pdf" | "excel"): Promise<void> => {
      if (!result || !localParams) return;

      try {
        setLoading("export", true);

        const exportData = {
          format,
          data: {
            params: localParams,
            results: result,
            exportDate: new Date().toISOString(),
          },
          options: {
            includeChart: true,
            includeDetails: true,
            language: "vi",
          },
        };

        console.log("EXPORT");
        // const response = await savingsApi.exportResults(exportData);

        // if (response.success && response.data) {
        //   // Trigger download
        //   const link = document.createElement('a');
        //   link.href = response.data.downloadUrl;
        //   link.download = `savings-calculation-${Date.now()}.${format}`;
        //   document.body.appendChild(link);
        //   link.click();
        //   document.body.removeChild(link);
        // }
      } catch (error) {
        console.error("Export error:", error);
        const errorMessage =
          error instanceof Error ? error.message : "Export failed";
        setError("export", errorMessage);
      } finally {
        setLoading("export", false);
      }
    },
    [result, localParams, setLoading, setError],
  );

  // Set parameters
  const setParams = useCallback(
    (params: any) => {
      setLocalParams(params);
      setSavingsParams(params);

      // Auto calculate if enabled
      if (autoCalculate) {
        setTimeout(() => calculate(), 0);
      }
    },
    [setSavingsParams, autoCalculate, calculate],
  );

  // Reset calculator
  const reset = useCallback(() => {
    setLocalParams(undefined);
    setResult(undefined);
    setErrorLocal(undefined);
    clearSavingsCalculation();
    cache.clear();
  }, [clearSavingsCalculation]);

  // Auto-calculate when params change
  useEffect(() => {
    if (localParams && autoCalculate) {
      calculate();
    }
  }, [localParams, autoCalculate, calculate]);

  return {
    // State
    params: localParams,
    result,
    loading: loading,
    error: error || useFinancialToolsStore.getState().errors.calculation,
    isValid: !error && !useFinancialToolsStore.getState().errors.calculation,

    // Actions
    setParams,
    calculate,
    reset,
    validate,
    compareBanks,
    calculateGoal,
    exportResults,
  };
};

export default useSavingsCalculator;
