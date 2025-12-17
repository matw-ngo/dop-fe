import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useFinancialToolsStore } from "@/store/use-financial-tools-store";
import { SavingsCalculator } from "./SavingsCalculator";

// Mock the store hook
vi.mock("@/store/use-financial-tools-store");
vi.mock("@/lib/utils", () => ({
  formatCurrency: (value: number) => `₫${value.toLocaleString("vi-VN")}`,
  cn: vi.fn((...args) => args.filter(Boolean).join(" ")),
}));

const mockUseFinancialToolsStore = vi.mocked(useFinancialToolsStore);

describe("SavingsCalculator", () => {
  const mockSetSavingsParams = vi.fn();
  const mockSetSavingsResults = vi.fn();
  const mockClearSavingsCalculation = vi.fn();
  const mockAddToHistory = vi.fn();

  const mockSavingsResults = {
    savings: [
      {
        name: "VCB",
        full_name: "Vietcombank",
        interested: 1250,
        ir: 5.5,
        total: 52_750_000,
        interest: 2_750_000,
        link: "https://vcb.com.vn",
      },
      {
        name: "TCB",
        full_name: "Techcombank",
        interested: 980,
        ir: 6.0,
        total: 53_000_000,
        interest: 3_000_000,
        link: "https://techcombank.com.vn",
      },
    ],
    minRate: 5.5,
    maxRate: 6.0,
    totalCount: 2,
  };

  const mockStoreState = {
    setSavingsParams: mockSetSavingsParams,
    setSavingsResults: mockSetSavingsResults,
    savingsResults: mockSavingsResults,
    clearSavingsCalculation: mockClearSavingsCalculation,
    loading: { calculations: false },
    errors: { calculation: null },
    addToHistory: mockAddToHistory,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseFinancialToolsStore.mockReturnValue(mockStoreState as any);
  });

  it("renders with default values", () => {
    render(<SavingsCalculator />);

    expect(screen.getByText("Savings Calculator")).toBeInTheDocument();
    expect(
      screen.getByText("Compare savings rates from different banks"),
    ).toBeInTheDocument();
  });

  it("displays initial filter values", () => {
    render(<SavingsCalculator />);

    // Check amount display
    expect(screen.getByDisplayValue(/₫50,000,000/)).toBeInTheDocument();

    // Check period selection
    expect(screen.getByText("12 months")).toBeInTheDocument();

    // Check type toggle
    expect(screen.getByText("Online Savings")).toBeInTheDocument();

    // Check sort option
    expect(screen.getByText("Highest Interest Rate")).toBeInTheDocument();
  });

  it("handles amount slider change", async () => {
    const user = userEvent.setup();
    render(<SavingsCalculator />);

    const slider = screen.getByRole("slider");
    await user.click(slider);

    // Since the component uses useEffect with debouncing, we need to wait
    await waitFor(
      () => {
        expect(mockSetSavingsParams).toHaveBeenCalled();
      },
      { timeout: 400 },
    );
  });

  it("handles amount input change", async () => {
    const user = userEvent.setup();
    render(<SavingsCalculator />);

    const input = screen.getByPlaceholderText("Enter amount");
    await user.clear(input);
    await user.type(input, "100000000");

    await waitFor(
      () => {
        expect(mockSetSavingsParams).toHaveBeenCalled();
      },
      { timeout: 400 },
    );
  });

  it("handles period selection change", async () => {
    const user = userEvent.setup();
    render(<SavingsCalculator />);

    const periodSelect = screen.getByRole("combobox", {
      name: /Savings Period/i,
    });
    await user.click(periodSelect);

    const sixMonthsOption = screen.getByText("6 months");
    await user.click(sixMonthsOption);

    await waitFor(
      () => {
        expect(mockSetSavingsParams).toHaveBeenCalled();
      },
      { timeout: 400 },
    );
  });

  it("handles type toggle change", async () => {
    const user = userEvent.setup();
    render(<SavingsCalculator />);

    const typeToggle = screen.getByRole("switch");
    await user.click(typeToggle);

    await waitFor(
      () => {
        expect(mockSetSavingsParams).toHaveBeenCalled();
      },
      { timeout: 400 },
    );
  });

  it("handles sort order change", async () => {
    const user = userEvent.setup();
    render(<SavingsCalculator />);

    const sortSelect = screen.getByRole("combobox", { name: /Sort By/i });
    await user.click(sortSelect);

    const ascendingOption = screen.getByText("Lowest Interest Rate");
    await user.click(ascendingOption);

    await waitFor(
      () => {
        expect(mockSetSavingsParams).toHaveBeenCalled();
      },
      { timeout: 400 },
    );
  });

  it("displays results when data is available", () => {
    render(<SavingsCalculator />);

    // Check bank names
    expect(screen.getByText("Vietcombank")).toBeInTheDocument();
    expect(screen.getByText("Techcombank")).toBeInTheDocument();

    // Check interest rates
    expect(screen.getByText("5.5%")).toBeInTheDocument();
    expect(screen.getByText("6.0%")).toBeInTheDocument();

    // Check interest amounts
    expect(screen.getByText("₫2,750,000")).toBeInTheDocument();
    expect(screen.getByText("₫3,000,000")).toBeInTheDocument();
  });

  it("highlights best rate", () => {
    render(<SavingsCalculator />);

    // Should show "Best" badge for highest rate
    expect(screen.getByText("Best")).toBeInTheDocument();
  });

  it("displays loading state", () => {
    mockUseFinancialToolsStore.mockReturnValue({
      ...mockStoreState,
      loading: { calculations: true },
    } as any);

    render(<SavingsCalculator />);

    // Check for skeleton loaders
    expect(
      screen
        .getAllByRole("generic", { hidden: true })
        .filter(
          (el) =>
            el.className.includes("animate-pulse") ||
            el.className.includes("bg-muted"),
        ).length,
    ).toBeGreaterThan(0);
  });

  it("displays error state with retry button", async () => {
    const errorMessage = "Failed to fetch savings data";
    mockUseFinancialToolsStore.mockReturnValue({
      ...mockStoreState,
      errors: { calculation: errorMessage },
      savingsResults: null,
    } as any);

    const user = userEvent.setup();
    render(<SavingsCalculator />);

    expect(screen.getByText(errorMessage)).toBeInTheDocument();

    const retryButton = screen.getByText("Retry");
    await user.click(retryButton);

    expect(mockClearSavingsCalculation).toHaveBeenCalled();
  });

  it("displays empty state when no results", () => {
    mockUseFinancialToolsStore.mockReturnValue({
      ...mockStoreState,
      savingsResults: { savings: [], minRate: 0, maxRate: 0, totalCount: 0 },
    } as any);

    render(<SavingsCalculator />);

    expect(
      screen.getByText("No savings products found matching your criteria."),
    ).toBeInTheDocument();
  });

  it("opens bank link in new tab", async () => {
    const user = userEvent.setup();
    render(<SavingsCalculator />);

    const openButtons = screen.getAllByText("Open");
    await user.click(openButtons[0]);

    // Check if link has correct attributes
    const link = screen.getByRole("link", { name: /Open/i });
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("displays summary statistics", () => {
    render(<SavingsCalculator />);

    expect(screen.getByText(/Average Rate:/)).toBeInTheDocument();
    expect(screen.getByText(/Total Interest Range:/)).toBeInTheDocument();
    expect(screen.getByText(/Best Total Return:/)).toBeInTheDocument();
  });
});
