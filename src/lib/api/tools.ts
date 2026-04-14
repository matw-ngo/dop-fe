// @ts-nocheck
import { toast } from "sonner";
import type {
  IFinancialToolResponse,
  ISalary,
  ISavingsParams,
  ISavingsResult,
} from "@/types/tools";
import { dopClient } from "./services/dop";

// API Configuration for Tools endpoints
const TOOLS_ENDPOINTS = {
  SAVINGS: "/tools/saving",
  SALARY: "/tools/salary",
  INTEREST_RATES: "/tools/interest-rates",
} as const;

// Error types for tools API
export interface ToolsApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
  timestamp: string;
}

// Helper function to handle API errors consistently
const handleToolsApiError = (error: any, defaultMessage: string): never => {
  console.error("Tools API Error:", error);

  // Extract error message from various error formats
  let errorMessage = defaultMessage;
  if (error?.data?.message) {
    errorMessage = error.data.message;
  } else if (error?.message) {
    errorMessage = error.message;
  } else if (typeof error === "string") {
    errorMessage = error;
  }

  // Show user-friendly toast
  toast.error("API Error", {
    description: errorMessage,
  });

  // Throw structured error
  const toolsError: ToolsApiError = {
    code: error?.data?.code || "UNKNOWN_ERROR",
    message: errorMessage,
    details: error?.data?.details,
    timestamp: new Date().toISOString(),
  };

  throw toolsError;
};

/**
 * Calculate savings comparisons across different banks
 * @param params - Savings calculation parameters
 * @returns Promise resolving to savings comparison results
 * @throws ToolsApiError on API failures
 */
export const calculateSavings = async (
  params: ISavingsParams,
): Promise<ISavingsResult> => {
  try {
    const { data, error } = await dopClient.POST(TOOLS_ENDPOINTS.SAVINGS, {
      body: {
        amount: params.amount,
        period: params.period,
        type: params.type,
        orderBy: params.orderBy,
      },
    });

    if (error) {
      handleToolsApiError(error, "Failed to calculate savings");
    }

    // Validate response structure
    if (!data || typeof data !== "object") {
      throw new Error("Invalid response format from savings calculator");
    }

    // Transform response to match ISavingsResult interface
    const result: ISavingsResult = {
      savings: data.savings || [],
      minRate: data.minRate ?? 0,
      maxRate: data.maxRate ?? 0,
      totalCount: data.totalCount ?? 0,
    };

    return result;
  } catch (error) {
    // Re-throw structured errors
    if (error && typeof error === "object" && "code" in error) {
      throw error;
    }

    // Handle unexpected errors
    handleToolsApiError(
      error,
      "Unexpected error occurred while calculating savings",
    );
  }
};

/**
 * Calculate salary breakdown (gross to net or net to gross)
 * @param params - Salary calculation parameters
 * @returns Promise resolving to salary breakdown
 * @throws ToolsApiError on API failures
 */
export const calculateSalary = async (params: {
  /** Gross salary amount (for gross-to-net calculation) */
  gross?: number;
  /** Net salary amount (for net-to-gross calculation) */
  net?: number;
  /** Payment period (monthly/yearly) */
  period?: "monthly" | "yearly";
  /** Number of dependents for tax calculation */
  dependents?: number;
  /** Region for tax calculation (if applicable) */
  region?: string;
}): Promise<ISalary> => {
  try {
    const { data, error } = await dopClient.POST(TOOLS_ENDPOINTS.SALARY, {
      body: params,
    });

    if (error) {
      handleToolsApiError(error, "Failed to calculate salary");
    }

    // Validate response structure
    if (!data || typeof data !== "object") {
      throw new Error("Invalid response format from salary calculator");
    }

    // Transform response to match ISalary interface
    const result: ISalary = {
      gross: data.gross ?? 0,
      net: data.net ?? 0,
      social_insurance: data.social_insurance ?? 0,
      health_insurance: data.health_insurance ?? 0,
      unemployment_insurance: data.unemployment_insurance ?? 0,
      total_insurance: data.total_insurance ?? 0,
      family_allowances: data.family_allowances ?? 0,
      dependent_family_allowances: data.dependent_family_allowances ?? 0,
      taxable_income: data.taxable_income ?? 0,
      income: data.income ?? 0,
      personal_income_tax: Array.isArray(data.personal_income_tax)
        ? data.personal_income_tax
        : [],
      total_personal_income_tax: data.total_personal_income_tax ?? 0,
      org_social_insurance: data.org_social_insurance ?? 0,
      org_health_insurance: data.org_health_insurance ?? 0,
      org_unemployment_insurance: data.org_unemployment_insurance ?? 0,
      total_org_payment: data.total_org_payment ?? 0,
    };

    return result;
  } catch (error) {
    // Re-throw structured errors
    if (error && typeof error === "object" && "code" in error) {
      throw error;
    }

    // Handle unexpected errors
    handleToolsApiError(
      error,
      "Unexpected error occurred while calculating salary",
    );
  }
};

/**
 * Fetch current bank interest rates
 * @returns Promise resolving to array of bank interest rates
 * @throws ToolsApiError on API failures
 */
export const fetchInterestRates = async (): Promise<
  Array<{
    bank: string;
    bankCode: string;
    savingsRates: Array<{
      term: string;
      rate: number;
      minAmount?: number;
      type: "online" | "counter";
    }>;
    lastUpdated: string;
  }>
> => {
  try {
    const { data, error } = await dopClient.GET(TOOLS_ENDPOINTS.INTEREST_RATES);

    if (error) {
      handleToolsApiError(error, "Failed to fetch interest rates");
    }

    // Validate response structure
    if (!Array.isArray(data)) {
      throw new Error("Invalid response format from interest rates API");
    }

    // Transform response to ensure consistent structure
    const result = data.map((bank) => ({
      bank: bank.bank || bank.name || "Unknown Bank",
      bankCode: bank.bankCode || bank.code || "",
      savingsRates: Array.isArray(bank.savingsRates)
        ? bank.savingsRates.map((rate) => ({
            term: rate.term || "N/A",
            rate: rate.rate ?? 0,
            minAmount: rate.minAmount,
            type: rate.type || "counter",
          }))
        : [],
      lastUpdated:
        bank.lastUpdated || bank.updated_at || new Date().toISOString(),
    }));

    return result;
  } catch (error) {
    // Re-throw structured errors
    if (error && typeof error === "object" && "code" in error) {
      throw error;
    }

    // Handle unexpected errors
    handleToolsApiError(
      error,
      "Unexpected error occurred while fetching interest rates",
    );
  }
};

// Export types for external use
export type {
  ISavingsParams,
  ISavingsResult,
  ISalary,
  IFinancialToolResponse,
  ToolsApiError,
};

// Export API functions as a grouped service object for better organization
export const toolsApi = {
  calculateSavings,
  calculateSalary,
  fetchInterestRates,
};

// Default export for convenience
export default toolsApi;
