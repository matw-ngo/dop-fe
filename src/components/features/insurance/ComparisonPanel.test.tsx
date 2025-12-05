import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import ComparisonPanel from "./ComparisonPanel";
import { InsuranceProduct } from "@/types/insurance";

// Mock next-intl
jest.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
  NextIntlClientProvider: ({ children }: { children: React.ReactNode }) => children,
}));

// Mock navigator.clipboard
Object.assign(navigator, {
  clipboard: {
    writeText: jest.fn().mockResolvedValue(undefined),
  },
  share: jest.fn().mockResolvedValue(undefined),
});

const mockProducts: InsuranceProduct[] = [
  {
    id: "1",
    slug: "test-product-1",
    name: "Test Insurance Product 1",
    issuer: "Test Insurance Co",
    category: "health" as any,
    type: "voluntary" as any,
    coverage: {
      personalAccident: { limit: 100000000, disabled: false },
      propertyDamage: { limit: 0, disabled: true },
      medicalExpenses: { limit: 50000000, disabled: false },
      thirdPartyLiability: { limit: 0, disabled: true },
      death: { limit: 200000000, disabled: false },
      disability: { limit: 0, disabled: true },
      hospitalization: { limit: 0, disabled: true },
      surgery: { limit: 0, disabled: true },
      criticalIllness: { limit: 0, disabled: true },
      lossOfIncome: { limit: 0, disabled: true },
    },
    pricing: {
      basePremium: 1000000,
      feeType: "fixed" as any,
      taxRate: 0.1,
      taxAmount: 100000,
      totalPremium: 1100000,
      currency: "VND",
      coveragePeriod: "annually" as any,
    },
    deductibles: {
      standardDeductible: 100000,
      voluntaryDeductibleOptions: [0, 200000, 500000],
      deductibleType: "fixed",
    },
    exclusions: [],
    waitingPeriods: {
      general: 30,
    },
    eligibility: {
      ageRange: { min: 18, max: 65 },
    },
    features: ["Feature 1", "Feature 2"],
    benefits: ["Benefit 1", "Benefit 2"],
    claims: {
      processDescription: "Test process",
      requiredDocuments: ["ID", "Form"],
      processingTime: 5,
      approvalRate: 95,
      averageClaimTime: 3,
      claimMethods: ["online"],
      contactInfo: {
        hotline: "1900 1234",
        email: "test@example.com",
      },
    },
    availability: {
      provinces: ["HCM", "HN"],
      nationalAvailability: true,
      exclusions: [],
    },
    paymentOptions: {
      methods: ["bank_transfer", "credit_card"],
      installmentAvailable: true,
    },
    renewal: {
      autoRenewal: true,
      renewalReminderDays: 30,
      gracePeriod: 15,
      noClaimBonus: {
        maxYears: 5,
        maxDiscount: 30,
      },
    },
    image: "/test-image.jpg",
    imageAlt: "Test Product",
    applyLink: "#",
    applyLinkType: "direct" as any,
    rating: 4,
    reviewCount: 100,
    tags: ["health", "family"],
    lastUpdated: new Date(),
    publishedAt: new Date(),
  },
];

describe("ComparisonPanel", () => {
  const mockOnAdd = jest.fn();
  const mockOnRemove = jest.fn();
  const mockOnClear = jest.fn();
  const mockOnShare = jest.fn();
  const mockOnExport = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders empty state when no products", () => {
    render(
      <ComparisonPanel
        products={[]}
        onAdd={mockOnAdd}
        onRemove={mockOnRemove}
        onClear={mockOnClear}
      />
    );

    expect(screen.getByText(/noProductsInComparison/i)).toBeInTheDocument();
    expect(screen.getByText(/addProductsToCompare/i)).toBeInTheDocument();
    expect(screen.getByText(/selectProducts/i)).toBeInTheDocument();
  });

  it("renders products correctly", () => {
    render(
      <ComparisonPanel
        products={mockProducts}
        onAdd={mockOnAdd}
        onRemove={mockOnRemove}
        onClear={mockOnClear}
      />
    );

    expect(screen.getByText("Test Insurance Product 1")).toBeInTheDocument();
    expect(screen.getByText("Test Insurance Co")).toBeInTheDocument();
    expect(screen.getByText("₫1,100,000")).toBeInTheDocument();
  });

  it("shows correct progress and limit information", () => {
    render(
      <ComparisonPanel
        products={mockProducts}
        onAdd={mockOnAdd}
        onRemove={mockOnRemove}
        onClear={mockOnClear}
        maxProducts={3}
      />
    );

    expect(screen.getByText("1/3")).toBeInTheDocument();
    expect(screen.getByText("33%")).toBeInTheDocument();
    expect(screen.getByText(/canAddMore.*2/i)).toBeInTheDocument();
  });

  it("displays limit message when full", () => {
    const fullProducts = Array(3).fill(mockProducts[0]);
    render(
      <ComparisonPanel
        products={fullProducts}
        onAdd={mockOnAdd}
        onRemove={mockOnRemove}
        onClear={mockOnClear}
        maxProducts={3}
      />
    );

    expect(screen.getByText("3/3")).toBeInTheDocument();
    expect(screen.getByText("100%")).toBeInTheDocument();
    expect(screen.getByText(/maxProductsReached/i)).toBeInTheDocument();
    expect(screen.getByText(/comparisonLimit.*3/i)).toBeInTheDocument();
  });

  it("calls onAdd when add button is clicked", () => {
    render(
      <ComparisonPanel
        products={mockProducts}
        onAdd={mockOnAdd}
        onRemove={mockOnRemove}
        onClear={mockOnClear}
      />
    );

    fireEvent.click(screen.getByText(/addProduct/i));
    expect(mockOnAdd).toHaveBeenCalledTimes(1);
  });

  it("calls onRemove when remove button is clicked", async () => {
    render(
      <ComparisonPanel
        products={mockProducts}
        onAdd={mockOnAdd}
        onRemove={mockOnRemove}
        onClear={mockOnClear}
      />
    );

    // Hover to show remove button
    const productContainer = screen.getByText("Test Insurance Product 1").closest("div");
    fireEvent.mouseEnter(productContainer!);

    // Wait for the remove button to become visible
    const removeButton = await screen.findByRole("button", { name: /removeProduct/i });
    fireEvent.click(removeButton);

    expect(mockOnRemove).toHaveBeenCalledWith("1");
  });

  it("calls onClear when clear all button is clicked", () => {
    render(
      <ComparisonPanel
        products={mockProducts}
        onAdd={mockOnAdd}
        onRemove={mockOnRemove}
        onClear={mockOnClear}
      />
    );

    fireEvent.click(screen.getByText(/clearAll/i));
    expect(mockOnClear).toHaveBeenCalledTimes(1);
  });

  it("shows loading state when isLoading is true", () => {
    render(
      <ComparisonPanel
        products={mockProducts}
        onAdd={mockOnAdd}
        onRemove={mockOnRemove}
        onClear={mockOnClear}
        isLoading={true}
      />
    );

    expect(screen.getByText(/loadingComparison/i)).toBeInTheDocument();
  });

  describe("Share functionality", () => {
    beforeEach(() => {
      // Mock URL
      Object.defineProperty(window, "location", {
        value: {
          href: "http://localhost:3000/test",
        },
        writable: true,
      });
    });

    it("uses navigator.share when available", async () => {
      render(
        <ComparisonPanel
          products={mockProducts}
          onAdd={mockOnAdd}
          onRemove={mockOnRemove}
          onClear={mockOnClear}
          onShare={mockOnShare}
        />
      );

      fireEvent.click(screen.getByText(/shareComparison/i));
      expect(mockOnShare).toHaveBeenCalledTimes(1);
    });

    it("falls back to clipboard when share is not available", async () => {
      render(
        <ComparisonPanel
          products={mockProducts}
          onAdd={mockOnAdd}
          onRemove={mockOnRemove}
          onClear={mockOnClear}
        />
      );

      fireEvent.click(screen.getByText(/shareComparison/i));

      await waitFor(() => {
        expect(navigator.clipboard.writeText).toHaveBeenCalledWith("http://localhost:3000/test");
      });
    });
  });

  describe("Export functionality", () => {
    it("calls onExport when provided", () => {
      render(
        <ComparisonPanel
          products={mockProducts}
          onAdd={mockOnAdd}
          onRemove={mockOnRemove}
          onClear={mockOnClear}
          onExport={mockOnExport}
        />
      );

      fireEvent.click(screen.getByText(/exportComparison/i));
      expect(mockOnExport).toHaveBeenCalledTimes(1);
    });

    it("downloads CSV when onExport is not provided", () => {
      // Mock URL.createObjectURL and URL.revokeObjectURL
      global.URL.createObjectURL = jest.fn(() => "blob:mock-url");
      global.URL.revokeObjectURL = jest.fn();

      // Mock createElement and appendChild
      const mockCreateElement = jest.spyOn(document, "createElement");
      const mockAppendChild = jest.spyOn(document.body, "appendChild");
      const mockRemoveChild = jest.spyOn(document.body, "removeChild");

      const mockLink = {
        setAttribute: jest.fn(),
        click: jest.fn(),
        style: { visibility: "" },
      };
      mockCreateElement.mockReturnValue(mockLink as any);

      render(
        <ComparisonPanel
          products={mockProducts}
          onAdd={mockOnAdd}
          onRemove={mockOnRemove}
          onClear={mockOnClear}
        />
      );

      fireEvent.click(screen.getByText(/exportComparison/i));

      expect(mockCreateElement).toHaveBeenCalledWith("a");
      expect(mockLink.setAttribute).toHaveBeenCalledWith("download", expect.stringMatching(/insurance-comparison-.*\.csv/));
      expect(mockLink.click).toHaveBeenCalled();
      expect(mockAppendChild).toHaveBeenCalledWith(mockLink);
      expect(mockRemoveChild).toHaveBeenCalledWith(mockLink);

      // Cleanup
      mockCreateElement.mockRestore();
      mockAppendChild.mockRestore();
      mockRemoveChild.mockRestore();
    });
  });

  it("applies custom className", () => {
    render(
      <ComparisonPanel
        products={mockProducts}
        onAdd={mockOnAdd}
        onRemove={mockOnRemove}
        onClear={mockOnClear}
        className="custom-test-class"
      />
    );

    const card = screen.getByRole("generic").closest(".custom-test-class");
    expect(card).toBeInTheDocument();
  });

  it("hides add button when comparison is full", () => {
    const fullProducts = Array(3).fill(mockProducts[0]);
    render(
      <ComparisonPanel
        products={fullProducts}
        onAdd={mockOnAdd}
        onRemove={mockOnRemove}
        onClear={mockOnClear}
        maxProducts={3}
      />
    );

    expect(screen.queryByText(/addProduct/i)).not.toBeInTheDocument();
  });
});