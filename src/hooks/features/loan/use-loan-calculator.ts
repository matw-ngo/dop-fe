// Loan Calculator Hook
// Custom hook for Vietnamese loan calculations

import { useCallback, useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { VietnameseLoanProduct } from "@/lib/loan-products/vietnamese-loan-products";
import type { LoanCalculationParams, LoanCalculationResult } from "@/lib/loan-products/interest-calculations";
import {
  VietnameseLoanCalculator,
  quickMonthlyPaymentCalculation,
  formatVND,
} from "@/lib/loan-products/interest-calculations";
import { VietnameseFinancialValidator } from "@/lib/loan-products/validation";
import { VietnameseComplianceEngine } from "@/lib/loan-products/vietnamese-compliance";
import VietnameseFinancialAuditLogger from "@/lib/loan-products/audit-logging";
import { loanProductApi } from "@/lib/api/endpoints/loans";
import { useLoanProductStore } from "@/store/use-loan-product-store";

interface UseLoanCalculatorOptions {
  /** Auto-calculate on parameter change */
  autoCalculate?: boolean;
  /** Enable real-time calculations */
  enableRealTime?: boolean;
  /** Cache calculations */
  cacheResults?: boolean;
  /** Include promotional rates */
  includePromotions?: boolean;
}

interface CalculationHistory {
  id: string;
  timestamp: string;
  params: LoanCalculationParams;
  result: LoanCalculationResult;
  productName?: string;
  productId?: string;
}

export function useLoanCalculator(
  initialParams: Partial<LoanCalculationParams> = {},
  options: UseLoanCalculatorOptions = {}
) {
  const {
    autoCalculate = true,
    enableRealTime = true,
    cacheResults = true,
    includePromotions = true,
  } = options;

  const store = useLoanProductStore();

  // Current calculation parameters
  const [params, setParams] = useState<LoanCalculationParams>({
    principal: 2000000000, // 2 tỷ VND
    term: 24, // 24 months
    annualRate: 10.5, // 10.5% annual rate
    rateType: "reducing",
    calculationMethod: "monthly",
    processingFee: 1.0,
    processingFeeFixed: 0,
    insuranceFee: 0.2,
    otherFees: 0,
    firstPaymentDate: new Date(),
    gracePeriod: 0,
    ...initialParams,
  });

  // Calculation history
  const [history, setHistory] = useState<CalculationHistory[]>([]);

  // Current calculation result
  const [currentResult, setCurrentResult] = useState<LoanCalculationResult | null>(null);

  // Get products for comparison
  const { data: products } = useQuery({
    queryKey: ["loan-products"],
    queryFn: async () => {
      try {
        const result = await loanProductApi.getVietnameseLoanProducts({ active: true });
        return Array.isArray(result) ? result : [];
      } catch (error) {
        console.error("Failed to fetch loan products:", error);
        return [];
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Update parameters
  const updateParams = useCallback((newParams: Partial<LoanCalculationParams>) => {
    setParams(prev => ({ ...prev, ...newParams }));
  }, []);

  // Update single parameter
  const updateParam = useCallback((key: keyof LoanCalculationParams, value: any) => {
    setParams(prev => ({ ...prev, [key]: value }));
  }, []);

  // Calculate loan
  const calculate = useCallback((
    calculationParams?: Partial<LoanCalculationParams>
  ): LoanCalculationResult => {
    const paramsToUse = calculationParams ? { ...params, ...calculationParams } : params;
    const result = VietnameseLoanCalculator.calculateLoan(paramsToUse);

    if (cacheResults) {
      store.updateCalculationParams(paramsToUse);
      store.setCalculationResult("current", result);
    }

    setCurrentResult(result);

    // Add to history
    const historyItem: CalculationHistory = {
      id: `calc_${Date.now()}`,
      timestamp: new Date().toISOString(),
      params: paramsToUse,
      result,
    };

    setHistory(prev => [historyItem, ...prev.slice(0, 49)]); // Keep last 50 calculations

    return result;
  }, [params, cacheResults, store]);

  // Calculate for specific product
  const calculateForProduct = useCallback((
    product: VietnameseLoanProduct,
    overrides: Partial<LoanCalculationParams> = {}
  ): LoanCalculationResult => {
    const productParams: LoanCalculationParams = {
      principal: params.principal,
      term: params.term,
      annualRate: includePromotions && product.interestRate.promotional
        ? product.interestRate.promotional.rate
        : product.interestRate.annual,
      rateType: product.interestRate.type,
      calculationMethod: product.interestRate.calculationMethod,
      processingFee: product.fees.processingFee || 0,
      processingFeeFixed: product.fees.processingFeeFixed || 0,
      insuranceFee: product.fees.insuranceFee || 0,
      otherFees: product.fees.otherFees?.reduce((sum, fee) => sum + (fee.type === "fixed" ? fee.amount : (params.principal * fee.amount) / 100), 0) || 0,
      promotionalRate: includePromotions ? product.interestRate.promotional?.rate : undefined,
      promotionalPeriod: includePromotions ? product.interestRate.promotional?.duration : undefined,
      ...overrides,
    };

    const result = VietnameseLoanCalculator.calculateLoan(productParams);

    // Add to history with product info
    const historyItem: CalculationHistory = {
      id: `calc_${Date.now()}`,
      timestamp: new Date().toISOString(),
      params: productParams,
      result,
      productName: product.nameVi,
      productId: product.id,
    };

    setHistory(prev => [historyItem, ...prev.slice(0, 49)]);

    return result;
  }, [params, includePromotions]);

  // Calculate multiple products for comparison
  const calculateMultiple = useCallback((
    products: VietnameseLoanProduct[],
    overrides: Partial<LoanCalculationParams> = {}
  ) => {
    return products.map(product => ({
      product,
      result: calculateForProduct(product, overrides),
    }));
  }, [calculateForProduct]);

  // Quick calculation for affordability
  const calculateAffordability = useCallback((
    monthlyIncome: number,
    monthlyExpenses: number,
    existingDebt: number = 0,
    maxDTI: number = 50
  ) => {
    return VietnameseLoanCalculator.calculateAffordability(
      monthlyIncome,
      monthlyExpenses,
      existingDebt,
      maxDTI
    );
  }, []);

  // Early repayment calculation
  const calculateEarlyRepayment = useCallback((
    product: VietnameseLoanProduct,
    paymentsMade: number,
    earlyRepaymentAmount: number,
    earlyRepaymentFee: number = 2
  ) => {
    const productParams: LoanCalculationParams = {
      principal: params.principal,
      term: params.term,
      annualRate: product.interestRate.annual,
      rateType: product.interestRate.type,
      calculationMethod: product.interestRate.calculationMethod,
    };

    return VietnameseLoanCalculator.calculateEarlyRepayment(
      productParams,
      paymentsMade,
      earlyRepaymentAmount,
      earlyRepaymentFee
    );
  }, [params]);

  // Quick monthly payment estimate
  const quickPayment = useCallback((
    amount: number,
    rate: number,
    term: number,
    rateType: "reducing" | "flat" | "fixed" = "reducing"
  ) => {
    return quickMonthlyPaymentCalculation(amount, rate, term, rateType);
  }, []);

  // Get loan summary in Vietnamese
  const getVietnameseSummary = useCallback((result: LoanCalculationResult) => {
    const { generateVietnameseLoanSummary } = require("@/lib/loan-products/interest-calculations");
    return generateVietnameseLoanSummary(result);
  }, []);

  // Auto-calculate when parameters change
  useEffect(() => {
    if (autoCalculate && params.principal > 0 && params.term > 0 && params.annualRate > 0) {
      calculate();
    }
  }, [params, autoCalculate, calculate]);

  // Sync with store
  useEffect(() => {
    if (enableRealTime) {
      store.updateCalculationParams(params);
    }
  }, [params, enableRealTime, store]);

  // Formatted values for display
  const formattedValues = useMemo(() => {
    if (!currentResult) return null;

    return {
      principal: formatVND(params.principal),
      monthlyPayment: formatVND(currentResult.monthlyPayment),
      totalInterest: formatVND(currentResult.totalInterest),
      totalPayable: formatVND(currentResult.totalPayable),
      effectiveAPR: currentResult.effectiveAPR.toFixed(2),
      totalFees: formatVND(currentResult.totalFees),
    };
  }, [currentResult, params]);

  // Common loan amounts for quick selection
  const commonAmounts = useMemo(() => [
    { value: 500000000, label: "500 triệu" },
    { value: 1000000000, label: "1 tỷ" },
    { value: 2000000000, label: "2 tỷ" },
    { value: 3000000000, label: "3 tỷ" },
    { value: 5000000000, label: "5 tỷ" },
    { value: 10000000000, label: "10 tỷ" },
  ], []);

  // Common loan terms for quick selection
  const commonTerms = useMemo(() => [
    { value: 12, label: "1 năm" },
    { value: 24, label: "2 năm" },
    { value: 36, label: "3 năm" },
    { value: 60, label: "5 năm" },
    { value: 120, label: "10 năm" },
    { value: 180, label: "15 năm" },
    { value: 240, label: "20 năm" },
    { value: 360, label: "30 năm" },
  ], []);

  // Get best rates from products
  const bestRates = useMemo(() => {
    if (!products || !Array.isArray(products)) return [];

    return products
      .filter((product: any) => product && product.active && product.interestRate)
      .sort((a: any, b: any) => a.interestRate.annual - b.interestRate.annual)
      .slice(0, 5)
      .map((product: any) => ({
        product,
        calculation: calculateForProduct(product),
      }));
  }, [products, calculateForProduct]);

  // Calculate payment schedule (first 12 months for preview)
  const paymentSchedulePreview = useMemo(() => {
    if (!currentResult) return [];

    return currentResult.paymentSchedule.slice(0, 12).map(payment => ({
      month: payment.paymentNumber,
      date: payment.paymentDate.toLocaleDateString("vi-VN"),
      principal: formatVND(payment.principal),
      interest: formatVND(payment.interest),
      total: formatVND(payment.total),
      balance: formatVND(payment.remainingBalance),
    }));
  }, [currentResult]);

  // Clear history
  const clearHistory = useCallback(() => {
    setHistory([]);
  }, []);

  // Load calculation from history
  const loadFromHistory = useCallback((historyId: string) => {
    const historyItem = history.find(item => item.id === historyId);
    if (historyItem) {
      setParams(historyItem.params);
      setCurrentResult(historyItem.result);
    }
  }, [history]);

  // Export calculation
  const exportCalculation = useCallback((format: "json" | "csv" = "json") => {
    if (!currentResult) return null;

    const exportData = {
      params,
      result: currentResult,
      timestamp: new Date().toISOString(),
      formattedValues,
      summary: getVietnameseSummary(currentResult),
    };

    if (format === "json") {
      return JSON.stringify(exportData, null, 2);
    }

    // CSV format
    const csvHeaders = ["Tháng", "Ngày trả", "Gốc", "Lãi", "Tổng", "Dư nợ"];
    const csvRows = currentResult.paymentSchedule.map(payment => [
      payment.paymentNumber,
      payment.paymentDate.toLocaleDateString("vi-VN"),
      payment.principal,
      payment.interest,
      payment.total,
      payment.remainingBalance,
    ]);

    return [csvHeaders.join(","), ...csvRows.map(row => row.join(","))].join("\n");
  }, [currentResult, params, formattedValues, getVietnameseSummary]);

  return {
    // State
    params,
    currentResult,
    formattedValues,
    history,
    bestRates,
    paymentSchedulePreview,
    commonAmounts,
    commonTerms,

    // Actions
    calculate,
    updateParams,
    updateParam,
    calculateForProduct,
    calculateMultiple,
    calculateAffordability,
    calculateEarlyRepayment,
    quickPayment,
    getVietnameseSummary,
    clearHistory,
    loadFromHistory,
    exportCalculation,

    // Products data
    products,

    // Computed properties
    hasResult: !!currentResult,
    hasHistory: history.length > 0,
    monthlyPayment: currentResult?.monthlyPayment || 0,
    totalInterest: currentResult?.totalInterest || 0,
    totalPayable: currentResult?.totalPayable || 0,
    effectiveAPR: currentResult?.effectiveAPR || 0,

    // Utility
    formatVND,
  };
}