import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { CardCategory } from "@/types/credit-card";
import { useCreditCardFilters } from "./useCreditCardFilters";

// Mock the constants
vi.mock("@/constants/credit-cards", () => ({
  DEFAULT_FILTERS: {
    categories: [],
    networks: [],
    issuers: [],
    annualFeeType: [],
    annualFeeRange: { min: 0, max: 10000000 },
    creditLimitRange: { min: 0, max: 2000000000 },
    hasAnnualFeeWaiver: false,
    ageRange: { min: 18, max: 80 },
    incomeRange: { min: 0, max: 100000000 },
    employmentTypes: [],
    provinces: [],
    rewardsTypes: [],
    hasWelcomeOffer: false,
    hasInstallmentPlans: false,
    hasInsurance: false,
    digitalFeatures: [],
    isNew: false,
    isRecommended: false,
    isExclusive: false,
    minRating: 0,
  },
}));

describe("useCreditCardFilters", () => {
  it("should initialize with default filters", () => {
    const { result } = renderHook(() => useCreditCardFilters());

    expect(result.current.filters.categories).toEqual([]);
    expect(result.current.filters.networks).toEqual([]);
    expect(result.current.filters.issuers).toEqual([]);
    expect(result.current.hasActiveFilters).toBe(false);
    expect(result.current.activeFiltersCount).toBe(0);
  });

  it("should update filters", () => {
    const { result } = renderHook(() => useCreditCardFilters());

    act(() => {
      result.current.updateFilters({
        categories: ["cashback" as CardCategory],
      });
    });

    expect(result.current.filters.categories).toContain("cashback");
    expect(result.current.hasActiveFilters).toBe(true);
    expect(result.current.activeFiltersCount).toBeGreaterThan(0);
  });

  it("should clear all filters", () => {
    const { result } = renderHook(() => useCreditCardFilters());

    act(() => {
      result.current.updateFilters({
        categories: ["cashback" as CardCategory],
        networks: ["visa"],
      });
    });

    expect(result.current.hasActiveFilters).toBe(true);

    act(() => {
      result.current.clearFilters();
    });

    expect(result.current.filters.categories).toEqual([]);
    expect(result.current.filters.networks).toEqual([]);
    expect(result.current.hasActiveFilters).toBe(false);
  });

  it("should toggle boolean filters", () => {
    const { result } = renderHook(() => useCreditCardFilters());

    expect(result.current.filters.hasWelcomeOffer).toBe(false);

    act(() => {
      result.current.toggleBooleanFilter("hasWelcomeOffer");
    });

    expect(result.current.filters.hasWelcomeOffer).toBe(true);

    act(() => {
      result.current.toggleBooleanFilter("hasWelcomeOffer");
    });

    expect(result.current.filters.hasWelcomeOffer).toBe(false);
  });

  it("should toggle array filters", () => {
    const { result } = renderHook(() => useCreditCardFilters());

    expect(result.current.filters.categories).toEqual([]);

    act(() => {
      result.current.toggleArrayFilter("categories", "cashback");
    });

    expect(result.current.filters.categories).toContain("cashback");

    act(() => {
      result.current.toggleArrayFilter("categories", "cashback");
    });

    expect(result.current.filters.categories).not.toContain("cashback");
  });

  it("should call onFiltersChange callback when provided", () => {
    const onFiltersChange = vi.fn();
    const { result } = renderHook(() =>
      useCreditCardFilters({ onFiltersChange }),
    );

    act(() => {
      result.current.updateFilters({ hasWelcomeOffer: true });
    });

    expect(onFiltersChange).toHaveBeenCalledWith(
      expect.objectContaining({ hasWelcomeOffer: true }),
    );
  });

  it("should update range filters", () => {
    const { result } = renderHook(() => useCreditCardFilters());

    act(() => {
      result.current.updateRangeFilter("annualFeeRange", 50, 200);
    });

    expect(result.current.filters.annualFeeRange).toEqual({
      min: 50,
      max: 200,
    });
  });
});
