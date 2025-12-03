// Loan Comparison Hook
// Custom hook for loan product comparison functionality

import { useCallback, useEffect, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { VietnameseLoanProduct } from "@/lib/loan-products/vietnamese-loan-products";
import type { LoanCalculationParams, LoanCalculationResult } from "@/lib/loan-products/interest-calculations";
import { VietnameseLoanCalculator } from "@/lib/loan-products/interest-calculations";
import { loanProductApi } from "@/lib/api/endpoints/loans";
import { useLoanProductStore } from "@/store/use-loan-product-store";

interface UseLoanComparisonOptions {
  /** Auto-calculate on selection change */
  autoCalculate?: boolean;
  /** Include fees in calculations */
  includeFees?: boolean;
  /** Include promotional rates */
  includePromotions?: boolean;
  /** Enable real-time calculations */
  enableRealTime?: boolean;
}

interface ComparisonData {
  /** Product */
  product: VietnameseLoanProduct;
  /** Calculation result */
  calculation: LoanCalculationResult;
  /** Monthly payment */
  monthlyPayment: number;
  /** Total interest */
  totalInterest: number;
  /** Total payable */
  totalPayable: number;
  /** Effective APR */
  effectiveAPR: number;
  /** Ranking */
  ranking?: number;
}

export function useLoanComparison(
  loanAmount: number,
  loanTerm: number,
  options: UseLoanComparisonOptions = {}
) {
  const {
    autoCalculate = true,
    includeFees = true,
    includePromotions = true,
    enableRealTime = true,
  } = options;

  const queryClient = useQueryClient();
  const store = useLoanProductStore();

  // Get selected products from store
  const selectedProducts = useLoanProductStore((state) => state.selectedProducts);

  // Select products
  const selectProduct = useCallback((product: VietnameseLoanProduct) => {
    store.selectProduct(product);
  }, [store]);

  const deselectProduct = useCallback((productId: string) => {
    store.deselectProduct(productId);
  }, [store]);

  const toggleProductSelection = useCallback((product: VietnameseLoanProduct) => {
    store.toggleProductSelection(product);
  }, [store]);

  const clearSelections = useCallback(() => {
    store.clearSelections();
  }, [store]);

  // Calculate comparison data
  const comparisonData = useMemo(() => {
    if (!autoCalculate) return [];

    return selectedProducts.map((product) => {
      const params: LoanCalculationParams = {
        principal: loanAmount,
        term: loanTerm,
        annualRate: includePromotions && product.interestRate.promotional
          ? product.interestRate.promotional.rate
          : product.interestRate.annual,
        rateType: product.interestRate.type,
        calculationMethod: product.interestRate.calculationMethod,
        processingFee: includeFees ? product.fees.processingFee : 0,
        processingFeeFixed: includeFees ? product.fees.processingFeeFixed : 0,
        insuranceFee: includeFees ? product.fees.insuranceFee : 0,
        otherFees: includeFees
          ? product.fees.otherFees?.reduce((sum, fee) => sum + (fee.type === "fixed" ? fee.amount : (loanAmount * fee.amount) / 100), 0)
          : 0,
        promotionalRate: includePromotions ? product.interestRate.promotional?.rate : undefined,
        promotionalPeriod: includePromotions ? product.interestRate.promotional?.duration : undefined,
      };

      const calculation = VietnameseLoanCalculator.calculateLoan(params);

      return {
        product,
        calculation,
        monthlyPayment: calculation.monthlyPayment,
        totalInterest: calculation.totalInterest,
        totalPayable: calculation.totalPayable,
        effectiveAPR: calculation.effectiveAPR,
      };
    });
  }, [selectedProducts, loanAmount, loanTerm, autoCalculate, includeFees, includePromotions]);

  // Ranked comparison data
  const rankedComparisonData = useMemo(() => {
    const sorted = [...comparisonData].sort((a, b) => {
      // Sort by total cost (lowest first)
      return a.totalPayable - b.totalPayable;
    });

    return sorted.map((item, index) => ({
      ...item,
      ranking: index + 1,
    }));
  }, [comparisonData]);

  // Get best option
  const bestOption = useMemo(() => {
    return rankedComparisonData[0] || null;
  }, [rankedComparisonData]);

  // Calculate savings compared to worst option
  const savingsVsWorst = useMemo(() => {
    if (rankedComparisonData.length < 2) return null;

    const best = rankedComparisonData[0];
    const worst = rankedComparisonData[rankedComparisonData.length - 1];

    return {
      monthlyPayment: worst.monthlyPayment - best.monthlyPayment,
      totalInterest: worst.totalInterest - best.totalInterest,
      totalPayable: worst.totalPayable - best.totalPayable,
      percentage: ((worst.totalPayable - best.totalPayable) / worst.totalPayable) * 100,
    };
  }, [rankedComparisonData]);

  // Calculate averages
  const averages = useMemo(() => {
    if (comparisonData.length === 0) return null;

    const totals = comparisonData.reduce(
      (acc, item) => ({
        monthlyPayment: acc.monthlyPayment + item.monthlyPayment,
        totalInterest: acc.totalInterest + item.totalInterest,
        totalPayable: acc.totalPayable + item.totalPayable,
        effectiveAPR: acc.effectiveAPR + item.effectiveAPR,
      }),
      { monthlyPayment: 0, totalInterest: 0, totalPayable: 0, effectiveAPR: 0 }
    );

    const count = comparisonData.length;
    return {
      monthlyPayment: totals.monthlyPayment / count,
      totalInterest: totals.totalInterest / count,
      totalPayable: totals.totalPayable / count,
      effectiveAPR: totals.effectiveAPR / count,
    };
  }, [comparisonData]);

  // API mutation for saving comparison
  const saveComparisonMutation = useMutation({
    mutationFn: async (params: {
      name: string;
      productIds: string[];
      loanAmount: number;
      loanTerm: number;
      notes?: string;
      isPublic?: boolean;
    }) => {
      return loanProductApi.saveComparison(params);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["saved-comparisons"] });
      return data;
    },
  });

  // Save comparison
  const saveComparison = useCallback(async (
    name: string,
    notes?: string,
    isPublic = false
  ) => {
    const productIds = selectedProducts.map(p => p.id);

    return saveComparisonMutation.mutateAsync({
      name,
      productIds,
      loanAmount,
      loanTerm,
      notes,
      isPublic,
    });
  }, [selectedProducts, loanAmount, loanTerm, saveComparisonMutation]);

  // Get saved comparisons query
  const { data: savedComparisons, isLoading: isLoadingSaved } = useQuery({
    queryKey: ["saved-comparisons"],
    queryFn: () => loanProductApi.getSavedComparisons(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Real-time calculations when enabled
  useEffect(() => {
    if (enableRealTime && autoCalculate) {
      // Store calculation results in the store for persistence
      comparisonData.forEach((data) => {
        store.setCalculationResult(data.product.id, data.calculation);
      });
    }
  }, [comparisonData, enableRealTime, autoCalculate, store]);

  // Sync with store
  useEffect(() => {
    // Update store calculation parameters when they change
    store.updateCalculationParams({
      principal: loanAmount,
      term: loanTerm,
    });
  }, [loanAmount, loanTerm, store]);

  return {
    // State
    selectedProducts,
    comparisonData,
    rankedComparisonData,
    bestOption,
    savingsVsWorst,
    averages,
    savedComparisons,

    // Loading states
    isLoading: saveComparisonMutation.isPending,
    isLoadingSaved,

    // Actions
    selectProduct,
    deselectProduct,
    toggleProductSelection,
    clearSelections,
    saveComparison,

    // Computed properties
    hasSelections: selectedProducts.length > 0,
    canCompare: selectedProducts.length >= 2,
    maxReached: selectedProducts.length >= 3,

    // Error handling
    saveError: saveComparisonMutation.error,
  };
}