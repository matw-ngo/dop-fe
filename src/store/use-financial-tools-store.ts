/**
 * Financial Tools Store
 *
 * Zustand store for managing financial tools state, calculations,
 * user preferences, and offline support for the Vietnamese digital lending platform.
 */

import React from "react";
import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import type {
  AffordabilityAnalysis,
  FinancialHealthScore,
  LoanCalculationParams,
  LoanCalculationResult,
} from "@/lib/financial/calculations";
import type {
  TaxCalculationParams,
  TaxCalculationResult,
} from "@/lib/financial-data/tax-brackets";
import type {
  ILoanParams,
  ILoanResult,
  ISalary,
  ISavingsParams,
  ISavingsResult,
} from "@/types/tools";

// Type adapter functions for backward compatibility
const adaptLoanParams = (params: ILoanParams): LoanCalculationParams => ({
  principal: params.amount,
  annualRate: params.rate,
  termInMonths: params.term,
  rateType: "reducing_balance" as const,
});

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
export interface CalculatorState {
  /** Current calculation parameters */
  loanParams?: ILoanParams;
  taxParams?: TaxCalculationParams;
  savingsParams?: ISavingsParams;

  /** Calculation results */
  loanResults?: ILoanResult;
  taxResults?: TaxCalculationResult | ISalary;
  savingsResults?: ISavingsResult;

  /** Financial analysis results */
  healthScore?: FinancialHealthScore;
  affordabilityAnalysis?: AffordabilityAnalysis;

  /** Comparison data */
  comparisons: Array<{
    id: string;
    type: "loan" | "savings" | "investment";
    name: string;
    options: any[];
    result: any;
    createdAt: string;
  }>;

  /** User preferences */
  preferences: {
    defaultRegion: number;
    currency: "VND";
    language: "vi" | "en";
    theme: "light" | "dark" | "auto";
    notifications: {
      calculationComplete: boolean;
      rateChanges: boolean;
      recommendations: boolean;
    };
    display: {
      showCharts: boolean;
      showDetails: boolean;
      showTips: boolean;
    };
  };

  /** Favorites and bookmarks */
  favorites: {
    calculations: Array<{
      id: string;
      type: string;
      name: string;
      params: any;
      result?: any;
      createdAt: string;
    }>;
    bankProducts: Array<{
      bankId: string;
      productId: string;
      name: string;
      rate: number;
      features: string[];
    }>;
  };

  /** Calculation history */
  history: Array<{
    id: string;
    type: "loan" | "tax" | "savings" | "comparison" | "health";
    timestamp: string;
    params: any;
    results?: any;
    duration?: number;
  }>;

  /** Offline data */
  offlineData: {
    bankRates: any;
    marketIndicators: any;
    taxBrackets: any;
    lastSync: string;
  };

  /** Loading and error states */
  loading: {
    calculations: boolean;
    marketData: boolean;
    export: boolean;
  };

  errors: {
    calculation?: string;
    marketData?: string;
    export?: string;
  };
}

export interface CalculatorActions {
  // Loan calculator actions
  setLoanParams: (params: ILoanParams) => void;
  setLoanResults: (results: ILoanResult) => void;
  clearLoanCalculation: () => void;

  // Tax calculator actions
  setTaxParams: (params: TaxCalculationParams) => void;
  setTaxResults: (results: TaxCalculationResult | ISalary) => void;
  clearTaxCalculation: () => void;

  // Savings calculator actions
  setSavingsParams: (params: ISavingsParams) => void;
  setSavingsResults: (results: ISavingsResult) => void;
  clearSavingsCalculation: () => void;

  // Financial analysis actions
  setHealthScore: (score: FinancialHealthScore) => void;
  setAffordabilityAnalysis: (analysis: AffordabilityAnalysis) => void;

  // Comparison actions
  addComparison: (
    type: "loan" | "savings" | "investment",
    name: string,
    options: any[],
    result: any,
  ) => void;
  removeComparison: (id: string) => void;
  clearComparisons: () => void;

  // Preferences actions
  updatePreferences: (
    preferences: Partial<CalculatorState["preferences"]>,
  ) => void;
  setDefaultRegion: (region: number) => void;
  setTheme: (theme: "light" | "dark" | "auto") => void;
  toggleNotifications: (
    type: keyof CalculatorState["preferences"]["notifications"],
  ) => void;

  // Favorites actions
  addFavoriteCalculation: (
    type: string,
    name: string,
    params: any,
    result?: any,
  ) => void;
  removeFavoriteCalculation: (id: string) => void;
  addFavoriteBankProduct: (bankProduct: any) => void;
  removeFavoriteBankProduct: (bankId: string, productId: string) => void;

  // History actions
  addToHistory: (
    type: "loan" | "tax" | "savings" | "comparison" | "health",
    params: any,
    results?: any,
    duration?: number,
  ) => void;
  clearHistory: () => void;
  removeFromHistory: (id: string) => void;

  // Offline data actions
  setOfflineData: (data: Partial<CalculatorState["offlineData"]>) => void;
  syncOfflineData: () => Promise<void>;
  clearOfflineData: () => void;

  // Loading and error actions
  setLoading: (
    type: keyof CalculatorState["loading"],
    loading: boolean,
  ) => void;
  setError: (type: keyof CalculatorState["errors"], error?: string) => void;
  clearErrors: () => void;

  // Utility actions
  resetStore: () => void;
  exportData: () => string;
  importData: (data: string) => boolean;
  generateReport: (type: "summary" | "detailed" | "comparison") => any;
}

/**
 * Combined Calculator Store Type
 */
type CalculatorStore = CalculatorState & CalculatorActions;

/**
 * Create the calculator store with persistence and devtools
 */
export const useFinancialToolsStore = create<CalculatorStore>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        comparisons: [],
        preferences: {
          defaultRegion: 1,
          currency: "VND",
          language: "vi",
          theme: "auto",
          notifications: {
            calculationComplete: true,
            rateChanges: true,
            recommendations: false,
          },
          display: {
            showCharts: true,
            showDetails: true,
            showTips: true,
          },
        },
        favorites: {
          calculations: [],
          bankProducts: [],
        },
        history: [],
        offlineData: {
          bankRates: null,
          marketIndicators: null,
          taxBrackets: null,
          lastSync: new Date().toISOString(),
        },
        loading: {
          calculations: false,
          marketData: false,
          export: false,
        },
        errors: {},

        // Loan calculator actions
        setLoanParams: (params) => {
          set({ loanParams: params }, false, "setLoanParams");
        },

        setLoanResults: (results) => {
          const state = get();
          set({ loanResults: results }, false, "setLoanResults");

          // Add to history
          if (state.loanParams) {
            get().addToHistory("loan", state.loanParams, results);
          }
        },

        clearLoanCalculation: () => {
          set(
            { loanParams: undefined, loanResults: undefined },
            false,
            "clearLoanCalculation",
          );
        },

        // Tax calculator actions
        setTaxParams: (params) => {
          set({ taxParams: params }, false, "setTaxParams");
        },

        setTaxResults: (results) => {
          const state = get();
          set({ taxResults: results }, false, "setTaxResults");

          // Add to history
          if (state.taxParams) {
            get().addToHistory("tax", state.taxParams, results);
          }
        },

        clearTaxCalculation: () => {
          set(
            { taxParams: undefined, taxResults: undefined },
            false,
            "clearTaxCalculation",
          );
        },

        // Savings calculator actions
        setSavingsParams: (params) => {
          set({ savingsParams: params }, false, "setSavingsParams");
        },

        setSavingsResults: (results) => {
          const state = get();
          set({ savingsResults: results }, false, "setSavingsResults");

          // Add to history
          if (state.savingsParams) {
            get().addToHistory("savings", state.savingsParams, results);
          }
        },

        clearSavingsCalculation: () => {
          set(
            { savingsParams: undefined, savingsResults: undefined },
            false,
            "clearSavingsCalculation",
          );
        },

        // Financial analysis actions
        setHealthScore: (score) => {
          set({ healthScore: score }, false, "setHealthScore");
        },

        setAffordabilityAnalysis: (analysis) => {
          set(
            { affordabilityAnalysis: analysis },
            false,
            "setAffordabilityAnalysis",
          );
        },

        // Comparison actions
        addComparison: (type, name, options, result) => {
          const comparison = {
            id: Date.now().toString(),
            type,
            name,
            options,
            result,
            createdAt: new Date().toISOString(),
          };
          set(
            (state) => ({
              comparisons: [...state.comparisons, comparison].slice(-10), // Keep last 10
            }),
            false,
            "addComparison",
          );
        },

        removeComparison: (id) => {
          set(
            (state) => ({
              comparisons: state.comparisons.filter((c) => c.id !== id),
            }),
            false,
            "removeComparison",
          );
        },

        clearComparisons: () => {
          set({ comparisons: [] }, false, "clearComparisons");
        },

        // Preferences actions
        updatePreferences: (preferences) => {
          set(
            (state) => ({
              preferences: { ...state.preferences, ...preferences },
            }),
            false,
            "updatePreferences",
          );
        },

        setDefaultRegion: (region) => {
          set(
            (state) => ({
              preferences: { ...state.preferences, defaultRegion: region },
            }),
            false,
            "setDefaultRegion",
          );
        },

        setTheme: (theme) => {
          set(
            (state) => ({
              preferences: { ...state.preferences, theme },
            }),
            false,
            "setTheme",
          );
        },

        toggleNotifications: (type) => {
          set(
            (state) => ({
              preferences: {
                ...state.preferences,
                notifications: {
                  ...state.preferences.notifications,
                  [type]: !state.preferences.notifications[type],
                },
              },
            }),
            false,
            "toggleNotifications",
          );
        },

        // Favorites actions
        addFavoriteCalculation: (type, name, params, result) => {
          const favorite = {
            id: Date.now().toString(),
            type,
            name,
            params,
            result,
            createdAt: new Date().toISOString(),
          };
          set(
            (state) => ({
              favorites: {
                ...state.favorites,
                calculations: [...state.favorites.calculations, favorite],
              },
            }),
            false,
            "addFavoriteCalculation",
          );
        },

        removeFavoriteCalculation: (id) => {
          set(
            (state) => ({
              favorites: {
                ...state.favorites,
                calculations: state.favorites.calculations.filter(
                  (c) => c.id !== id,
                ),
              },
            }),
            false,
            "removeFavoriteCalculation",
          );
        },

        addFavoriteBankProduct: (bankProduct) => {
          const exists = get().favorites.bankProducts.some(
            (p) =>
              p.bankId === bankProduct.bankId &&
              p.productId === bankProduct.productId,
          );

          if (!exists) {
            set(
              (state) => ({
                favorites: {
                  ...state.favorites,
                  bankProducts: [...state.favorites.bankProducts, bankProduct],
                },
              }),
              false,
              "addFavoriteBankProduct",
            );
          }
        },

        removeFavoriteBankProduct: (bankId, productId) => {
          set(
            (state) => ({
              favorites: {
                ...state.favorites,
                bankProducts: state.favorites.bankProducts.filter(
                  (p) => !(p.bankId === bankId && p.productId === productId),
                ),
              },
            }),
            false,
            "removeFavoriteBankProduct",
          );
        },

        // History actions
        addToHistory: (type, params, results, duration) => {
          const historyItem = {
            id: Date.now().toString(),
            type,
            timestamp: new Date().toISOString(),
            params,
            results,
            duration,
          };
          set(
            (state) => ({
              history: [historyItem, ...state.history].slice(0, 100), // Keep last 100
            }),
            false,
            "addToHistory",
          );
        },

        clearHistory: () => {
          set({ history: [] }, false, "clearHistory");
        },

        removeFromHistory: (id) => {
          set(
            (state) => ({
              history: state.history.filter((h) => h.id !== id),
            }),
            false,
            "removeFromHistory",
          );
        },

        // Offline data actions
        setOfflineData: (data) => {
          set(
            (state) => ({
              offlineData: { ...state.offlineData, ...data },
            }),
            false,
            "setOfflineData",
          );
        },

        syncOfflineData: async () => {
          const state = get();
          set(
            { loading: { ...state.loading, marketData: true } },
            false,
            "syncOfflineData-start",
          );

          try {
            // This would make API calls to sync data
            // For now, just update the sync timestamp
            set(
              (state) => ({
                offlineData: {
                  ...state.offlineData,
                  lastSync: new Date().toISOString(),
                },
                loading: { ...state.loading, marketData: false },
              }),
              false,
              "syncOfflineData-success",
            );
          } catch (error) {
            set(
              (state) => ({
                errors: {
                  ...state.errors,
                  marketData: "Failed to sync offline data",
                },
                loading: { ...state.loading, marketData: false },
              }),
              false,
              "syncOfflineData-error",
            );
          }
        },

        clearOfflineData: () => {
          set(
            {
              offlineData: {
                bankRates: null,
                marketIndicators: null,
                taxBrackets: null,
                lastSync: new Date().toISOString(),
              },
            },
            false,
            "clearOfflineData",
          );
        },

        // Loading and error actions
        setLoading: (type, loading) => {
          set(
            (state) => ({
              loading: { ...state.loading, [type]: loading },
            }),
            false,
            "setLoading",
          );
        },

        setError: (type, error) => {
          set(
            (state) => ({
              errors: { ...state.errors, [type]: error },
            }),
            false,
            "setError",
          );
        },

        clearErrors: () => {
          set({ errors: {} }, false, "clearErrors");
        },

        // Utility actions
        resetStore: () => {
          set(
            {
              loanParams: undefined,
              loanResults: undefined,
              taxParams: undefined,
              taxResults: undefined,
              savingsParams: undefined,
              savingsResults: undefined,
              healthScore: undefined,
              affordabilityAnalysis: undefined,
              comparisons: [],
              history: [],
              loading: {
                calculations: false,
                marketData: false,
                export: false,
              },
              errors: {},
            },
            false,
            "resetStore",
          );
        },

        exportData: () => {
          const state = get();
          const exportData = {
            preferences: state.preferences,
            favorites: state.favorites,
            history: state.history.slice(0, 50), // Limit history export
            comparisons: state.comparisons,
            offlineData: {
              ...state.offlineData,
              // Exclude large data objects
              bankRates: state.offlineData.bankRates ? "cached" : null,
              marketIndicators: state.offlineData.marketIndicators
                ? "cached"
                : null,
            },
            exportDate: new Date().toISOString(),
          };
          return JSON.stringify(exportData, null, 2);
        },

        importData: (dataString) => {
          try {
            const data = JSON.parse(dataString);
            const state = get();

            // Validate imported data
            if (!data.preferences || !data.favorites) {
              return false;
            }

            set(
              {
                preferences: { ...state.preferences, ...data.preferences },
                favorites: data.favorites,
                history: data.history || [],
                comparisons: data.comparisons || [],
              },
              false,
              "importData",
            );

            return true;
          } catch (error) {
            console.error("Import data error:", error);
            return false;
          }
        },

        generateReport: (type) => {
          const state = get();
          const reportData = {
            type,
            generatedAt: new Date().toISOString(),
            summary: {
              totalCalculations: state.history.length,
              favoritesCount: state.favorites.calculations.length,
              comparisonsCount: state.comparisons.length,
            },
            recentActivity: state.history.slice(0, 10),
            topFavorites: state.favorites.calculations.slice(0, 5),
            preferences: state.preferences,
          };

          if (type === "detailed") {
            return {
              ...reportData,
              fullHistory: state.history,
              allComparisons: state.comparisons,
              allFavorites: state.favorites,
            };
          }

          return reportData;
        },
      }),
      {
        name: "financial-tools-storage",
        // Only persist specific fields to avoid bloating storage
        partialize: (state) => ({
          preferences: state.preferences,
          favorites: state.favorites,
          history: state.history.slice(0, 50), // Limit history in storage
          offlineData: state.offlineData,
        }),
        version: 1,
      },
    ),
    {
      name: "FinancialToolsStore",
    },
  ),
);

/**
 * Selectors for commonly used state
 */
export const useLoanCalculation = () =>
  useFinancialToolsStore((state) => ({
    params: state.loanParams,
    results: state.loanResults,
    loading: state.loading.calculations,
    error: state.errors.calculation,
  }));

export const useTaxCalculation = () =>
  useFinancialToolsStore((state) => ({
    params: state.taxParams,
    results: state.taxResults,
    loading: state.loading.calculations,
    error: state.errors.calculation,
  }));

export const useSavingsCalculation = () =>
  useFinancialToolsStore((state) => ({
    params: state.savingsParams,
    results: state.savingsResults,
    loading: state.loading.calculations,
    error: state.errors.calculation,
  }));

export const useFinancialAnalysis = () =>
  useFinancialToolsStore((state) => ({
    healthScore: state.healthScore,
    affordabilityAnalysis: state.affordabilityAnalysis,
    loading: state.loading.calculations,
    error: state.errors.calculation,
  }));

export const useUserPreferences = () =>
  useFinancialToolsStore((state) => state.preferences);

export const useFavorites = () =>
  useFinancialToolsStore((state) => state.favorites);

export const useHistory = () =>
  useFinancialToolsStore((state) => state.history);

export const useComparisons = () =>
  useFinancialToolsStore((state) => state.comparisons);

export const useOfflineData = () =>
  useFinancialToolsStore((state) => state.offlineData);

export const useLoadingState = () =>
  useFinancialToolsStore((state) => state.loading);

export const useErrors = () => useFinancialToolsStore((state) => state.errors);

/**
 * Hook for store hydration
 */
export const useFinancialToolsHydrated = () => {
  const [hydrated, setHydrated] = React.useState(false);

  React.useEffect(() => {
    // Note: Zustand persist handles hydration automatically
    // This is just for reference if needed
    setHydrated(true);
  }, []);

  return hydrated;
};
