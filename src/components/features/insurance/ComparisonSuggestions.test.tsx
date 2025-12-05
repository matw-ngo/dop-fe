import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import ComparisonSuggestions from "./ComparisonSuggestions";
import { INSURANCE_PRODUCTS } from "@/data/insurance-products";
import type { InsuranceProduct } from "@/types/insurance";

// Mock next-intl
const mockTranslations = {
  pages: {
    insurance: {
      suggestedProducts: "Gợi ý sản phẩm",
      addToComparison: "Thêm vào so sánh",
      recommended: "Được đề xuất",
      issuer: "Nhà cung cấp",
      premium: "Phí bảo hiểm",
      coverage: "Quyền lợi",
      viewAllProducts: "Xem tất cả sản phẩm",
      noMoreSuggestions: "Không có gợi ý nào khác",
      noMoreSuggestionsDesc: "Tất cả sản phẩm phù hợp đã được thêm vào so sánh.",
      "Cùng danh mục": "Cùng danh mục",
      "Cùng nhà cung cấp": "Cùng nhà cung cấp",
      "Quyền lợi bảo hiểm tương đương": "Quyền lợi bảo hiểm tương đương",
      "Phí bảo hiểm tương đương": "Phí bảo hiểm tương đương",
      "Được đề xuất": "Được đề xuất",
      "Phổ biến": "Phổ biến",
      "Đánh giá cao": "Đánh giá cao",
    },
  },
};

// Mock data
const mockCurrentProducts: InsuranceProduct[] = [
  INSURANCE_PRODUCTS[0], // First product
  INSURANCE_PRODUCTS[1], // Second product
];

const renderWithIntl = (component: React.ReactElement) => {
  return render(
    <NextIntlClientProvider locale="vi" messages={mockTranslations}>
      {component}
    </NextIntlClientProvider>,
  );
};

describe("ComparisonSuggestions", () => {
  const mockOnAddToComparison = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock timer for loading state
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("renders loading state initially", () => {
    renderWithIntl(
      <ComparisonSuggestions
        currentProducts={mockCurrentProducts}
        onAddToComparison={mockOnAddToComparison}
      />,
    );

    expect(screen.getAllByRole("generic")).toBeTruthy();
    // Should show skeleton cards
    const skeletonCards = document.querySelectorAll(".skeleton");
    expect(skeletonCards.length).toBeGreaterThan(0);
  });

  it("renders suggestions after loading", async () => {
    renderWithIntl(
      <ComparisonSuggestions
        currentProducts={mockCurrentProducts}
        onAddToComparison={mockOnAddToComparison}
        maxSuggestions={3}
      />,
    );

    // Fast-forward past loading delay
    jest.advanceTimersByTime(500);

    await waitFor(() => {
      expect(screen.getByText("Gợi ý sản phẩm")).toBeInTheDocument();
    });

    // Should render suggestion cards
    const suggestionCards = document.querySelectorAll('[class*="group relative"]');
    expect(suggestionCards.length).toBeGreaterThan(0);
    expect(suggestionCards.length).toBeLessThanOrEqual(3);
  });

  it("filters out already compared products", async () => {
    renderWithIntl(
      <ComparisonSuggestions
        currentProducts={mockCurrentProducts}
        onAddToComparison={mockOnAddToComparison}
      />,
    );

    jest.advanceTimersByTime(500);

    await waitFor(() => {
      // Should not show current products in suggestions
      mockCurrentProducts.forEach((product) => {
        expect(
          screen.queryByText(product.name, { exact: false }),
        ).not.toBeInTheDocument();
      });
    });
  });

  it("calls onAddToComparison when button is clicked", async () => {
    renderWithIntl(
      <ComparisonSuggestions
        currentProducts={mockCurrentProducts}
        onAddToComparison={mockOnAddToComparison}
        maxSuggestions={1}
      />,
    );

    jest.advanceTimersByTime(500);

    await waitFor(() => {
      expect(screen.getByText("Gợi ý sản phẩm")).toBeInTheDocument();
    });

    // Find and click add to comparison button
    const addButton = screen.getByText("Thêm vào so sánh");
    fireEvent.click(addButton);

    expect(mockOnAddToComparison).toHaveBeenCalledTimes(1);
  });

  it("shows empty state when no suggestions available", async () => {
    // Mock all products as current products
    const allProducts = INSURANCE_PRODUCTS.slice(0, 10);

    renderWithIntl(
      <ComparisonSuggestions
        currentProducts={allProducts}
        onAddToComparison={mockOnAddToComparison}
      />,
    );

    jest.advanceTimersByTime(500);

    await waitFor(() => {
      expect(screen.getByText("Không có gợi ý nào khác")).toBeInTheDocument();
      expect(
        screen.getByText(
          "Tất cả sản phẩm phù hợp đã được thêm vào so sánh.",
        ),
      ).toBeInTheDocument();
    });
  });

  it("respects maxSuggestions prop", async () => {
    renderWithIntl(
      <ComparisonSuggestions
        currentProducts={mockCurrentProducts}
        onAddToComparison={mockOnAddToComparison}
        maxSuggestions={2}
      />,
    );

    jest.advanceTimersByTime(500);

    await waitFor(() => {
      const suggestionCards = document.querySelectorAll('[class*="group relative"]');
      expect(suggestionCards.length).toBeLessThanOrEqual(2);
    });
  });

  it("uses custom title when provided", async () => {
    const customTitle = "Các sản phẩm tương tự";
    renderWithIntl(
      <ComparisonSuggestions
        currentProducts={mockCurrentProducts}
        onAddToComparison={mockOnAddToComparison}
        title={customTitle}
      />,
    );

    jest.advanceTimersByTime(500);

    await waitFor(() => {
      expect(screen.getByText(customTitle)).toBeInTheDocument();
      expect(screen.queryByText("Gợi ý sản phẩm")).not.toBeInTheDocument();
    });
  });

  it("shows product information correctly", async () => {
    renderWithIntl(
      <ComparisonSuggestions
        currentProducts={mockCurrentProducts}
        onAddToComparison={mockOnAddToComparison}
        maxSuggestions={1}
      />,
    );

    jest.advanceTimersByTime(500);

    await waitFor(() => {
      expect(screen.getByText("Gợi ý sản phẩm")).toBeInTheDocument();
    });

    // Check for product information labels
    expect(screen.getByText("Nhà cung cấp")).toBeInTheDocument();
    expect(screen.getByText("Phí bảo hiểm")).toBeInTheDocument();
    expect(screen.getByText("Quyền lợi")).toBeInTheDocument();
  });

  it("applies custom className", () => {
    const customClass = "custom-suggestions-class";
    renderWithIntl(
      <ComparisonSuggestions
        currentProducts={mockCurrentProducts}
        onAddToComparison={mockOnAddToComparison}
        className={customClass}
      />,
    );

    const section = screen.getByRole("region") || document.querySelector("section");
    expect(section).toHaveClass(customClass);
  });

  it("shows suggestion reasons", async () => {
    renderWithIntl(
      <ComparisonSuggestions
        currentProducts={mockCurrentProducts}
        onAddToComparison={mockOnAddToComparison}
        maxSuggestions={1}
      />,
    );

    jest.advanceTimersByTime(500);

    await waitFor(() => {
      // Check for reason badges
      const reasonBadges = document.querySelectorAll('[class*="text-xs"]');
      const hasReason = Array.from(reasonBadges).some((badge) =>
        ["Cùng danh mục", "Cùng nhà cung cấp", "Được đề xuất"].includes(
          badge.textContent || "",
        ),
      );
      expect(hasReason).toBe(true);
    });
  });

  it("handles empty currentProducts array", async () => {
    renderWithIntl(
      <ComparisonSuggestions
        currentProducts={[]}
        onAddToComparison={mockOnAddToComparison}
      />,
    );

    jest.advanceTimersByTime(500);

    await waitFor(() => {
      // Should show empty state
      expect(
        screen.getByText("Không có gợi ý nào khác"),
      ).toBeInTheDocument();
    });
  });
});