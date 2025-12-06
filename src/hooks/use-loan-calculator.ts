/**
 * Loan Calculator Hook
 *
 * Custom hook for loan calculation functionality with Vietnamese market specifics,
 * caching, error handling, and analytics.
 */

import { useState, useCallback, useEffect } from "react";
import { useFinancialToolsStore } from "@/store/use-financial-tools-store";
import {
  calculateLoanDetails,
  LoanCalculationParams,
  LoanCalculationResult,
} from "@/lib/financial/calculations";
import {
  calculateHomeLoan,
  calculateAutoLoan,
  calculateConsumerLoan,
  calculateBusinessLoan,
} from "@/lib/financial/loan-calculations";
import {
  assessLoanEligibility,
  compareLoanOptions,
} from "@/lib/financial/loan-calculations";
import {
  loanCalculationApi,
  exportApi,
} from "@/lib/api/endpoints/financial-tools";
import { validateLoanCalculationParams } from "@/lib/financial/validation";
import type { ILoanParams, ILoanResult } from "@/types/tools";

// Type adapter functions for backward compatibility
const adaptLoanResult = (result: LoanCalculationResult): ILoanResult => ({
  monthlyPayment: result.monthlyPayment,
  totalPayment: result.totalPayment,
  totalInterest: result.totalInterest,
  amortization:
    result.paymentSchedule?.map((entry: any, index: number) => ({
      month: entry.period || index + 1,
      principal: entry.principalPayment,
      interest: entry.interestPayment,
      balance: entry.endingBalance,
    })) || [],
});

// Types
export interface UseLoanCalculatorOptions {
  enableCache?: boolean;
  enableAnalytics?: boolean;
  autoCalculate?: boolean;
  validateOnChange?: boolean;
  onError?: (error: string) => void;
  onSuccess?: (result: LoanCalculationResult) => void;
}

export interface LoanCalculatorState {
  params?: LoanCalculationParams;
  result?: LoanCalculationResult;
  loading: boolean;
  error?: string;
  isValid: boolean;
  eligibility?: {
    eligible: boolean;
    probability: number;
    recommendations: string[];
  };
}

export interface LoanCalculatorActions {
  setParams: (params: LoanCalculationParams) => void;
  calculate: () => Promise<void>;
  reset: () => void;
  validate: () => boolean;
  assessEligibility: (
    monthlyIncome: number,
    monthlyDebts: number,
    creditScore?: number,
  ) => Promise<void>;
  compareWith: (otherLoanParams: LoanCalculationParams) => Promise<any>;
  exportResults: (format: "pdf" | "excel") => Promise<void>;
}

export type UseLoanCalculatorReturn = LoanCalculatorState &
  LoanCalculatorActions;

/**
 * Custom hook for loan calculation functionality
 */
export const useLoanCalculator = (
  initialParams?: LoanCalculationParams,
  options: UseLoanCalculatorOptions = {},
): UseLoanCalculatorReturn => {
  const {
    enableCache = true,
    enableAnalytics = false,
    autoCalculate = true,
    validateOnChange = true,
    onError,
    onSuccess,
  } = options;

  // Store integration
  const {
    setLoanParams,
    setLoanResults,
    clearLoanCalculation,
    setLoading,
    setError,
    addToHistory,
  } = useFinancialToolsStore();

  // Local state
  const [localParams, setLocalParams] = useState<
    LoanCalculationParams | undefined
  >(initialParams);
  const [result, setResult] = useState<LoanCalculationResult | undefined>();
  const [loading, setLoadingLocal] = useState(false);
  const [error, setErrorLocal] = useState<string | undefined>();
  const [eligibility, setEligibility] = useState<any>();

  // Combined state
  const combinedLoading = loading;
  const combinedError =
    error || useFinancialToolsStore.getState().errors.calculation;

  // Cache for results
  const cache = new Map<string, LoanCalculationResult>();

  // Generate cache key
  const generateCacheKey = (params: LoanCalculationParams): string => {
    return JSON.stringify({
      principal: params.principal,
      annualRate: params.annualRate,
      termInMonths: params.termInMonths,
      rateType: params.rateType,
      promotionalPeriod: params.promotionalPeriod,
      promotionalRate: params.promotionalRate,
    });
  };

  // Validate parameters
  const validate = useCallback((): boolean => {
    if (!localParams) return false;

    const validation = validateLoanCalculationParams(localParams);

    if (!validation.isValid) {
      const errorMessage = validation.errors.map((e) => e.message).join(", ");
      setErrorLocal(errorMessage);
      setError("calculation", errorMessage);
      onError?.(errorMessage);
      return false;
    }

    setErrorLocal(undefined);
    setError("calculation", undefined);
    return true;
  }, [localParams, setError, onError]);

  // Calculate loan
  const calculate = useCallback(async (): Promise<void> => {
    if (!localParams) return;

    // Validate parameters
    if (validateOnChange && !validate()) {
      return;
    }

    setLoadingLocal(true);
    setLoadingLocal(true);

    try {
      // Check cache first
      const cacheKey = generateCacheKey(localParams);
      let calculationResult: LoanCalculationResult;

      if (enableCache && cache.has(cacheKey)) {
        calculationResult = cache.get(cacheKey)!;
      } else {
        // Perform calculation based on loan type
        switch (localParams.loanType) {
          case "home":
            calculationResult = calculateHomeLoan(
              localParams.principal,
              localParams.annualRate,
              localParams.termInMonths,
              {
                loanType: localParams.rateType,
                collateralType: "real_estate",
                propertyType: "apartment",
                propertyLocation: "other",
                isPrimaryResidence: true,
                disbursementMethod: "lump_sum",
                interestPaymentMethod: "monthly",
              },
            );
            break;

          case "auto":
            calculationResult = calculateAutoLoan(
              localParams.principal,
              localParams.annualRate,
              localParams.termInMonths,
              {
                loanType: localParams.rateType,
                collateralType: "vehicle",
                vehicleType: "new_car",
                vehicleValue: localParams.principal * 1.2,
                isNewCar: true,
                disbursementMethod: "lump_sum",
                interestPaymentMethod: "monthly",
              },
            );
            break;

          case "consumer":
            calculationResult = calculateConsumerLoan(
              localParams.principal,
              localParams.annualRate,
              localParams.termInMonths,
              {
                loanType: localParams.rateType,
                collateralType: "none",
                purpose: "home_improvement",
                employmentType: "permanent",
                monthlyIncome: 15000000,
                disbursementMethod: "lump_sum",
                interestPaymentMethod: "monthly",
              },
            );
            break;

          case "business":
            calculationResult = calculateBusinessLoan(
              localParams.principal,
              localParams.annualRate,
              localParams.termInMonths,
              {
                loanType: localParams.rateType,
                collateralType: "real_estate",
                businessType: "llc",
                businessAge: 3,
                annualRevenue: 180000000,
                profitability: 15,
                disbursementMethod: "installment",
                interestPaymentMethod: "monthly",
              },
            );
            break;

          default:
            calculationResult = calculateLoanDetails(localParams);
            break;
        }

        // Cache the result
        if (enableCache) {
          cache.set(cacheKey, calculationResult);
        }
      }

      // Update state
      setResult(calculationResult);

      // Convert to ILoanResult for store compatibility
      const loanResultForStore = adaptLoanResult(calculationResult);
      setLoanResults(loanResultForStore);

      setErrorLocal(undefined);
      setError("calculation", undefined);

      // Add to history
      addToHistory("loan", localParams, calculationResult);

      // Analytics
      if (enableAnalytics) {
        // Send analytics event
        console.log("Loan calculation completed", {
          loanType: localParams.loanType,
          principal: localParams.principal,
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
    validateOnChange,
    enableCache,
    enableAnalytics,
    setResult,
    setLoanResults,
    setError,
    setErrorLocal,
    addToHistory,
    setLoading,
    onSuccess,
    onError,
  ]);

  // Assess eligibility
  const assessEligibility = useCallback(
    async (
      monthlyIncome: number,
      monthlyDebts: number,
      creditScore?: number,
    ): Promise<void> => {
      if (!localParams) return;

      try {
        const eligibilityResult = assessLoanEligibility(
          localParams.loanType || "consumer",
          localParams.principal,
          monthlyIncome,
          monthlyDebts,
          creditScore,
          true, // Assume collateral for most loans
        );

        setEligibility(eligibilityResult);
      } catch (error) {
        console.error("Eligibility assessment error:", error);
      }
    },
    [localParams],
  );

  // Compare with another loan
  const compareWith = useCallback(
    async (otherLoanParams: LoanCalculationParams): Promise<any> => {
      if (!result) return null;

      try {
        // Calculate other loan
        const otherResult = calculateLoanDetails(otherLoanParams);

        // Compare loans
        const comparison = compareLoanOptions(result, otherResult);

        return comparison;
      } catch (error) {
        console.error("Loan comparison error:", error);
        return null;
      }
    },
    [result],
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
            eligibility,
            exportDate: new Date().toISOString(),
          },
          options: {
            includeChart: true,
            includeDetails: true,
            language: "vi" as const,
          },
        };

        const response = await exportApi.exportResults(exportData);

        if (response.success && response.data) {
          // Trigger download
          const link = document.createElement("a");
          link.href = response.data.downloadUrl;
          link.download = `loan-calculation-${Date.now()}.${format}`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
      } catch (error) {
        console.error("Export error:", error);
        const errorMessage =
          error instanceof Error ? error.message : "Export failed";
        setError("export", errorMessage);
      } finally {
        setLoading("export", false);
      }
    },
    [result, localParams, eligibility, setLoading, setError],
  );

  // Set parameters
  const setParams = useCallback(
    (params: LoanCalculationParams) => {
      setLocalParams(params);

      // Convert to ILoanParams for store compatibility
      const loanParamsForStore: ILoanParams = {
        amount: params.principal,
        term: params.termInMonths,
        rate: params.annualRate,
      };
      setLoanParams(loanParamsForStore);

      // Auto calculate if enabled
      if (autoCalculate) {
        // Use setTimeout to avoid immediate calculation during param updates
        setTimeout(() => calculate(), 0);
      }
    },
    [setLoanParams, autoCalculate, calculate],
  );

  // Reset calculator
  const reset = useCallback(() => {
    setLocalParams(undefined);
    setResult(undefined);
    setErrorLocal(undefined);
    setEligibility(undefined);
    clearLoanCalculation();
    cache.clear();
  }, [clearLoanCalculation]);

  // Auto-calculate when params change and autoCalculate is enabled
  useEffect(() => {
    if (localParams && autoCalculate) {
      calculate();
    }
  }, [localParams, autoCalculate, calculate]);

  // Validate on param change if enabled
  useEffect(() => {
    if (validateOnChange && localParams) {
      validate();
    }
  }, [localParams, validateOnChange, validate]);

  return {
    // State
    params: localParams,
    result,
    loading: combinedLoading,
    error: combinedError,
    isValid: !combinedError,
    eligibility,

    // Actions
    setParams,
    calculate,
    reset,
    validate,
    assessEligibility,
    compareWith,
    exportResults,
  };
};

/**
 * Hook for loan comparison functionality
 */
export const useLoanComparison = () => {
  const [comparisons, setComparisons] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const addComparison = useCallback(
    async (
      loan1Params: LoanCalculationParams,
      loan2Params: LoanCalculationParams,
    ) => {
      setLoading(true);

      try {
        // Calculate both loans
        const result1 = calculateLoanDetails(loan1Params);
        const result2 = calculateLoanDetails(loan2Params);

        // Compare them
        const comparison = compareLoanOptions(result1, result2);

        const comparisonData = {
          id: Date.now().toString(),
          loan1: { params: loan1Params, result: result1 },
          loan2: { params: loan2Params, result: result2 },
          comparison,
          createdAt: new Date().toISOString(),
        };

        setComparisons((prev) => [comparisonData, ...prev].slice(0, 5)); // Keep last 5
        return comparisonData;
      } catch (error) {
        console.error("Comparison error:", error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const removeComparison = useCallback((id: string) => {
    setComparisons((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const clearComparisons = useCallback(() => {
    setComparisons([]);
  }, []);

  return {
    comparisons,
    loading,
    addComparison,
    removeComparison,
    clearComparisons,
  };
};

/**
 * Hook for loan eligibility assessment
 */
export const useLoanEligibility = () => {
  const [assessments, setAssessments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const assess = useCallback(
    async (
      loanType: string,
      loanAmount: number,
      monthlyIncome: number,
      monthlyDebts: number,
      creditScore?: number,
      hasCollateral?: boolean,
    ) => {
      setLoading(true);

      try {
        const assessment = assessLoanEligibility(
          loanType,
          loanAmount,
          monthlyIncome,
          monthlyDebts,
          creditScore,
          hasCollateral,
        );

        const assessmentData = {
          id: Date.now().toString(),
          loanType,
          loanAmount,
          monthlyIncome,
          monthlyDebts,
          creditScore,
          hasCollateral,
          assessment,
          createdAt: new Date().toISOString(),
        };

        setAssessments((prev) => [assessmentData, ...prev].slice(0, 10)); // Keep last 10
        return assessment;
      } catch (error) {
        console.error("Eligibility assessment error:", error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const clearAssessments = useCallback(() => {
    setAssessments([]);
  }, []);

  return {
    assessments,
    loading,
    assess,
    clearAssessments,
  };
};

export default useLoanCalculator;
