// @ts-nocheck
/**
 * Unit tests for tools API functions
 * These tests ensure the API client functions work as expected
 */

import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  calculateSalary,
  calculateSavings,
  fetchInterestRates,
  toolsApi,
} from "./tools";

// Mock the API client
vi.mock("./client", () => ({
  default: {
    POST: vi.fn(),
    GET: vi.fn(),
  },
}));

// Mock toast
vi.mock("sonner", () => ({
  toast: {
    error: vi.fn(),
  },
}));

describe("Tools API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("calculateSavings", () => {
    it("should calculate savings successfully", async () => {
      const mockResponse = {
        data: {
          savings: [
            {
              name: "VCB",
              full_name: "Vietcombank",
              interested: 1250,
              ir: 5.5,
              total: 1055000,
              interest: 55000,
              link: "https://vcb.com",
            },
          ],
          minRate: 4.5,
          maxRate: 6.0,
          totalCount: 15,
        },
        error: null,
      };

      const { default: apiClient } = await import("./client");
      vi.mocked(apiClient.POST).mockResolvedValue(mockResponse);

      const params = {
        amount: 1000000,
        period: 12,
        type: "online" as const,
        orderBy: "rate_desc" as const,
      };

      const result = await calculateSavings(params);

      expect(result).toEqual({
        savings: mockResponse.data.savings,
        minRate: 4.5,
        maxRate: 6.0,
        totalCount: 15,
      });

      expect(apiClient.POST).toHaveBeenCalledWith("/tools/saving", {
        body: params,
      });
    });

    it("should handle API errors gracefully", async () => {
      const mockError = {
        data: {
          code: "INVALID_PARAMS",
          message: "Amount must be positive",
        },
      };

      const { default: apiClient } = await import("./client");
      vi.mocked(apiClient.POST).mockResolvedValue({
        data: null,
        error: mockError,
      });

      const params = {
        amount: -1000,
        period: 12,
        type: "online" as const,
        orderBy: "rate_desc" as const,
      };

      await expect(calculateSavings(params)).rejects.toThrow(
        "Amount must be positive",
      );
    });
  });

  describe("calculateSalary", () => {
    it("should calculate salary breakdown for gross to net", async () => {
      const mockResponse = {
        data: {
          gross: 10000000,
          net: 8500000,
          social_insurance: 800000,
          health_insurance: 150000,
          unemployment_insurance: 50000,
          total_insurance: 1000000,
          family_allowances: 11000000,
          dependent_family_allowances: 0,
          taxable_income: 9000000,
          income: 9000000,
          personal_income_tax: [500000],
          total_personal_income_tax: 500000,
          org_social_insurance: 1750000,
          org_health_insurance: 300000,
          org_unemployment_insurance: 100000,
          total_org_payment: 12150000,
        },
        error: null,
      };

      const { default: apiClient } = await import("./client");
      vi.mocked(apiClient.POST).mockResolvedValue(mockResponse);

      const params = {
        gross: 10000000,
        period: "monthly" as const,
        dependents: 0,
      };

      const result = await calculateSalary(params);

      expect(result.gross).toBe(10000000);
      expect(result.net).toBe(8500000);
      expect(result.total_insurance).toBe(1000000);
    });

    it("should handle missing data fields gracefully", async () => {
      const mockResponse = {
        data: {
          gross: 10000000,
          // Other fields missing
        },
        error: null,
      };

      const { default: apiClient } = await import("./client");
      vi.mocked(apiClient.POST).mockResolvedValue(mockResponse);

      const result = await calculateSalary({ gross: 10000000 });

      expect(result.gross).toBe(10000000);
      expect(result.net).toBe(0); // Default value
      expect(result.social_insurance).toBe(0); // Default value
    });
  });

  describe("fetchInterestRates", () => {
    it("should fetch interest rates successfully", async () => {
      const mockResponse = {
        data: [
          {
            bank: "Vietcombank",
            bankCode: "VCB",
            savingsRates: [
              {
                term: "1 tháng",
                rate: 3.0,
                minAmount: 1000000,
                type: "online",
              },
              {
                term: "6 tháng",
                rate: 5.5,
                type: "counter",
              },
            ],
            lastUpdated: "2024-01-15T10:30:00Z",
          },
        ],
        error: null,
      };

      const { default: apiClient } = await import("./client");
      vi.mocked(apiClient.GET).mockResolvedValue(mockResponse);

      const result = await fetchInterestRates();

      expect(result).toHaveLength(1);
      expect(result[0].bank).toBe("Vietcombank");
      expect(result[0].savingsRates).toHaveLength(2);
      expect(result[0].savingsRates[0].rate).toBe(3.0);
    });

    it("should handle invalid response format", async () => {
      const mockResponse = {
        data: "invalid data", // Not an array
        error: null,
      };

      const { default: apiClient } = await import("./client");
      vi.mocked(apiClient.GET).mockResolvedValue(mockResponse);

      await expect(fetchInterestRates()).rejects.toThrow(
        "Invalid response format",
      );
    });
  });

  describe("toolsApi service object", () => {
    it("should export all API functions", () => {
      expect(toolsApi).toHaveProperty("calculateSavings");
      expect(toolsApi).toHaveProperty("calculateSalary");
      expect(toolsApi).toHaveProperty("fetchInterestRates");
      expect(typeof toolsApi.calculateSavings).toBe("function");
      expect(typeof toolsApi.calculateSalary).toBe("function");
      expect(typeof toolsApi.fetchInterestRates).toBe("function");
    });
  });
});
