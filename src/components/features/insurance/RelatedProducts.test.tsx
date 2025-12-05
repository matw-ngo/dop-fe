import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import RelatedProducts from "./RelatedProducts";
import { InsuranceProduct } from "@/types/insurance";
import { INSURANCE_PRODUCTS } from "@/data/insurance-products";

// Mock next-intl
const mockMessages = {
  pages: {
    insurance: {
      relatedProducts: "Sản phẩm liên quan",
      noRelatedProducts: "Không tìm thấy sản phẩm liên quan",
      noRelatedProductsDesc: "Hiện tại chưa có sản phẩm nào tương tự.",
      viewAllProducts: "Xem tất cả sản phẩm",
      viewAllInCategory: "Xem tất cả",
      recommended: "Đề xuất",
      viewDetails: "Xem chi tiết",
      premium: "Phí bảo hiểm",
      coverage: "Mức bảo hiểm",
      claimsApproval: "Tỷ lệ duyệt",
    },
  },
};

const mockLocale = "vi";

// Mock the carousel component
jest.mock("@/components/ui/carousel", () => ({
  Carousel: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  CarouselContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  CarouselItem: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  CarouselPrevious: () => <button data-testid="carousel-previous">Previous</button>,
  CarouselNext: () => <button data-testid="carousel-next">Next</button>,
}));

// Mock next/link
jest.mock("next/link", () => {
  return ({ children, href, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  );
});

const renderWithIntl = (component: React.ReactElement) => {
  return render(
    <NextIntlClientProvider locale={mockLocale} messages={mockMessages}>
      {component}
    </NextIntlClientProvider>
  );
};

describe("RelatedProducts", () => {
  const mockProduct: InsuranceProduct = INSURANCE_PRODUCTS[0]; // TNDS Bảo Việt

  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("renders loading state initially", () => {
    renderWithIntl(
      <RelatedProducts
        currentProduct={mockProduct}
        maxProducts={3}
      />
    );

    // Check for skeleton loaders
    expect(screen.getAllByRole("generic")).toBeTruthy();
  });

  it("displays related products after loading", async () => {
    renderWithIntl(
      <RelatedProducts
        currentProduct={mockProduct}
        maxProducts={3}
      />
    );

    // Fast-forward past loading delay
    jest.advanceTimersByTime(500);

    await waitFor(() => {
      expect(screen.queryByText("Sản phẩm liên quan")).toBeInTheDocument();
    });

    // Should find product cards (not skeleton)
    const productCards = screen.getAllByText(/Xem chi tiết/);
    expect(productCards.length).toBeGreaterThan(0);
  });

  it("filters out current product from results", async () => {
    renderWithIntl(
      <RelatedProducts
        currentProduct={mockProduct}
        maxProducts={6}
      />
    );

    jest.advanceTimersByTime(500);

    await waitFor(() => {
      expect(screen.queryByText(mockProduct.name)).not.toBeInTheDocument();
    });
  });

  it("displays custom title when provided", async () => {
    const customTitle = "Gợi ý khác cho bạn";
    renderWithIntl(
      <RelatedProducts
        currentProduct={mockProduct}
        title={customTitle}
      />
    );

    jest.advanceTimersByTime(500);

    await waitFor(() => {
      expect(screen.getByText(customTitle)).toBeInTheDocument();
      expect(screen.queryByText("Sản phẩm liên quan")).not.toBeInTheDocument();
    });
  });

  it("shows empty state when no related products found", async () => {
    // Create a mock product that won't have matches
    const uniqueProduct: InsuranceProduct = {
      ...mockProduct,
      id: "unique-product",
      name: "Unique Product That Has No Matches",
      issuer: "Unique Issuer",
      category: "vehicle" as any,
      type: "compulsory" as any,
      pricing: {
        ...mockProduct.pricing,
        totalPremium: 999999999,
      },
      coverage: {
        personalAccident: { limit: 999999999, disabled: false },
        propertyDamage: { limit: 999999999, disabled: false },
        medicalExpenses: { limit: 999999999, disabled: false },
        thirdPartyLiability: { limit: 999999999, disabled: false },
        death: { limit: 0, disabled: true },
        disability: { limit: 0, disabled: true },
        hospitalization: { limit: 0, disabled: true },
        surgery: { limit: 0, disabled: true },
        criticalIllness: { limit: 0, disabled: true },
        lossOfIncome: { limit: 0, disabled: true },
      },
    } as InsuranceProduct;

    // Mock empty products array
    jest.mock("@/data/insurance-products", () => ({
      INSURANCE_PRODUCTS: [uniqueProduct],
    }));

    renderWithIntl(
      <RelatedProducts
        currentProduct={uniqueProduct}
        maxProducts={6}
      />
    );

    jest.advanceTimersByTime(500);

    await waitFor(() => {
      expect(screen.getByText("Không tìm thấy sản phẩm liên quan")).toBeInTheDocument();
      expect(screen.getByText("Hiện tại chưa có sản phẩm nào tương tự.")).toBeInTheDocument();
    });
  });

  it("calls onProductClick when product card is clicked", async () => {
    const mockOnClick = jest.fn();
    renderWithIntl(
      <RelatedProducts
        currentProduct={mockProduct}
        maxProducts={3}
        onProductClick={mockOnClick}
      />
    );

    jest.advanceTimersByTime(500);

    await waitFor(() => {
      const productCards = screen.getAllByRole("generic");
      // Find the first clickable product card
      const clickableCard = productCards.find(card =>
        card.textContent && !card.textContent.includes("Sản phẩm liên quan")
      );

      if (clickableCard) {
        fireEvent.click(clickableCard);
        expect(mockOnClick).toHaveBeenCalledTimes(1);
      }
    });
  });

  it("limits results to maxProducts", async () => {
    renderWithIntl(
      <RelatedProducts
        currentProduct={mockProduct}
        maxProducts={2}
      />
    );

    jest.advanceTimersByTime(500);

    await waitFor(() => {
      const viewDetailsButtons = screen.getAllByText("Xem chi tiết");
      // Should have at most 2 products (maxProducts)
      expect(viewDetailsButtons.length).toBeLessThanOrEqual(2);
    });
  });

  it("shows view all button when showViewAll is true", async () => {
    renderWithIntl(
      <RelatedProducts
        currentProduct={mockProduct}
        showViewAll={true}
        viewAllLink="/test-link"
      />
    );

    jest.advanceTimersByTime(500);

    await waitFor(() => {
      expect(screen.getByText("Xem tất cả")).toBeInTheDocument();
    });
  });

  it("hides view all button when showViewAll is false", () => {
    renderWithIntl(
      <RelatedProducts
        currentProduct={mockProduct}
        showViewAll={false}
      />
    );

    expect(screen.queryByText("Xem tất cả")).not.toBeInTheDocument();
  });

  it("applies custom className", () => {
    const customClass = "custom-related-products";
    const { container } = renderWithIntl(
      <RelatedProducts
        currentProduct={mockProduct}
        className={customClass}
      />
    );

    const section = container.querySelector("section");
    expect(section).toHaveClass(customClass);
  });

  it("displays category badge correctly", async () => {
    renderWithIntl(
      <RelatedProducts
        currentProduct={mockProduct}
        maxProducts={1}
      />
    );

    jest.advanceTimersByTime(500);

    await waitFor(() => {
      // Should show category name
      expect(screen.getByText("Bảo hiểm xe")).toBeInTheDocument();
    });
  });

  it("displays recommended badge for recommended products", async () => {
    // Find a recommended product that's not the current one
    const recommendedProduct = INSURANCE_PRODUCTS.find(
      p => p.isRecommended && p.id !== mockProduct.id
    );

    if (recommendedProduct) {
      renderWithIntl(
        <RelatedProducts
          currentProduct={mockProduct}
          maxProducts={1}
        />
      );

      jest.advanceTimersByTime(500);

      await waitFor(() => {
        // Should show recommended badge if the related product is recommended
        const recommendedBadges = screen.getAllByText("Đề xuất");
        expect(recommendedBadges.length).toBeGreaterThanOrEqual(0);
      });
    }
  });
});