/**
 * Tests for use-insurance-url-sync hook
 */

import { renderHook } from "@testing-library/react";
import { useInsuranceUrlSync } from "../features/insurance/use-insurance-url-sync";
import {
  InsuranceCategory,
  InsuranceType,
  SortOption,
  FeeType,
  CoveragePeriod,
} from "@/types/insurance";
import { DEFAULT_FILTERS } from "@/constants/insurance";

// Mock next/navigation
jest.mock("next/navigation", () => ({
  useSearchParams: jest.fn(),
}));

// Mock next-intl
jest.mock("next-intl", () => ({
  useLocale: jest.fn(() => "en"),
}));

// Mock window.history
const mockReplaceState = jest.fn();
Object.defineProperty(window.history, "replaceState", {
  value: mockReplaceState,
  writable: true,
});

describe("useInsuranceUrlSync", () => {
  beforeEach(() => {
    mockReplaceState.mockClear();
    jest.clearAllMocks();
  });

  it("should not update URL on initial render", () => {
    const { result } = renderHook(() =>
      useInsuranceUrlSync({
        filters: DEFAULT_FILTERS,
        searchQuery: "",
        sortOption: "featured" as SortOption,
        pagination: {
          page: 1,
          limit: 12,
          total: 0,
          totalPages: 0,
          hasNext: false,
          hasPrev: false,
        },
      }),
    );

    // Should not have called replaceState immediately (due to debounce)
    expect(mockReplaceState).not.toHaveBeenCalled();
  });

  it("should update URL with search query", async () => {
    const { rerender } = renderHook(() =>
      useInsuranceUrlSync({
        filters: DEFAULT_FILTERS,
        searchQuery: "test search",
        sortOption: "featured" as SortOption,
        pagination: {
          page: 1,
          limit: 12,
          total: 0,
          totalPages: 0,
          hasNext: false,
          hasPrev: false,
        },
      }),
    );

    // Wait for debounce
    await new Promise((resolve) => setTimeout(resolve, 350));

    expect(mockReplaceState).toHaveBeenCalledWith(
      {},
      "",
      "/en/insurance?search=test+search",
    );
  });

  it("should update URL with filters", async () => {
    const filters = {
      ...DEFAULT_FILTERS,
      categories: [InsuranceCategory.VEHICLE, InsuranceCategory.HEALTH],
      issuers: [" insurer1", "insurer2"],
      hasRoadsideAssistance: true,
      premiumRange: { min: 1000000, max: 5000000 },
    };

    const { rerender } = renderHook(() =>
      useInsuranceUrlSync({
        filters,
        searchQuery: "",
        sortOption: "featured" as SortOption,
        pagination: {
          page: 1,
          limit: 12,
          total: 0,
          totalPages: 0,
          hasNext: false,
          hasPrev: false,
        },
      }),
    );

    // Wait for debounce
    await new Promise((resolve) => setTimeout(resolve, 350));

    expect(mockReplaceState).toHaveBeenCalledWith(
      {},
      "",
      expect.stringContaining("categories=vehicle,health"),
    );
    expect(mockReplaceState).toHaveBeenCalledWith(
      {},
      "",
      expect.stringContaining("issuers=insurer1,insurer2"),
    );
    expect(mockReplaceState).toHaveBeenCalledWith(
      {},
      "",
      expect.stringContaining("hasRoadsideAssistance=true"),
    );
    expect(mockReplaceState).toHaveBeenCalledWith(
      {},
      "",
      expect.stringContaining("premiumMin=1000000"),
    );
    expect(mockReplaceState).toHaveBeenCalledWith(
      {},
      "",
      expect.stringContaining("premiumMax=5000000"),
    );
  });

  it("should update URL with sort option", async () => {
    const { rerender } = renderHook(() =>
      useInsuranceUrlSync({
        filters: DEFAULT_FILTERS,
        searchQuery: "",
        sortOption: "premium-asc" as SortOption,
        pagination: {
          page: 1,
          limit: 12,
          total: 0,
          totalPages: 0,
          hasNext: false,
          hasPrev: false,
        },
      }),
    );

    // Wait for debounce
    await new Promise((resolve) => setTimeout(resolve, 350));

    expect(mockReplaceState).toHaveBeenCalledWith(
      {},
      "",
      "/en/insurance?sort=premium-asc",
    );
  });

  it("should update URL with pagination", async () => {
    const { rerender } = renderHook(() =>
      useInsuranceUrlSync({
        filters: DEFAULT_FILTERS,
        searchQuery: "",
        sortOption: "featured" as SortOption,
        pagination: {
          page: 2,
          limit: 24,
          total: 0,
          totalPages: 0,
          hasNext: false,
          hasPrev: false,
        },
      }),
    );

    // Wait for debounce
    await new Promise((resolve) => setTimeout(resolve, 350));

    expect(mockReplaceState).toHaveBeenCalledWith(
      {},
      "",
      "/en/insurance?page=2&limit=24",
    );
  });

  it("should handle complex nested filters", async () => {
    const filters = {
      ...DEFAULT_FILTERS,
      coverageRange: {
        personalAccident: { min: 100000000, max: 500000000 },
        propertyDamage: { min: 50000000, max: 200000000 },
        medicalExpenses: { min: 20000000, max: 100000000 },
      },
    };

    const { rerender } = renderHook(() =>
      useInsuranceUrlSync({
        filters,
        searchQuery: "",
        sortOption: "featured" as SortOption,
        pagination: {
          page: 1,
          limit: 12,
          total: 0,
          totalPages: 0,
          hasNext: false,
          hasPrev: false,
        },
      }),
    );

    // Wait for debounce
    await new Promise((resolve) => setTimeout(resolve, 350));

    expect(mockReplaceState).toHaveBeenCalledWith(
      {},
      "",
      expect.stringContaining("coverage[personalAccident][min]=100000000"),
    );
    expect(mockReplaceState).toHaveBeenCalledWith(
      {},
      "",
      expect.stringContaining("coverage[personalAccident][max]=500000000"),
    );
  });
});
