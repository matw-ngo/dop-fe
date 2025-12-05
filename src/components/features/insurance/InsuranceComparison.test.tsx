import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { InsuranceComparison } from "./InsuranceComparison";
import { InsuranceProduct, InsuranceCategory, FeeType, CoveragePeriod } from "@/types/insurance";

// Mock next-intl
jest.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

const mockProducts: InsuranceProduct[] = [
  {
    id: "1",
    slug: "test-insurance-1",
    name: "Bảo hiểm xe ô tô A",
    issuer: "Công ty ABC",
    category: InsuranceCategory.VEHICLE,
    type: "voluntary" as any,
    coverage: {
      personalAccident: { limit: 500000000, disabled: false },
      propertyDamage: { limit: 1000000000, disabled: false },
      medicalExpenses: { limit: 100000000, disabled: false },
      thirdPartyLiability: { limit: 0, disabled: true },
      death: { limit: 0, disabled: true },
      disability: { limit: 0, disabled: true },
      hospitalization: { limit: 0, disabled: true },
      surgery: { limit: 0, disabled: true },
      criticalIllness: { limit: 0, disabled: true },
      lossOfIncome: { limit: 0, disabled: true },
    },
    pricing: {
      basePremium: 5000000,
      feeType: FeeType.FIXED,
      taxRate: 10,
      taxAmount: 500000,
      totalPremium: 5500000,
      currency: "VND",
      coveragePeriod: CoveragePeriod.ANNUALLY,
    },
    deductibles: {
      standardDeductible: 500000,
      voluntaryDeductibleOptions: [],
      deductibleType: "fixed",
    },
    exclusions: [],
    waitingPeriods: {
      general: 0,
    },
    eligibility: {
      ageRange: { min: 18, max: 70 },
    },
    features: ["24/7 support", "Worldwide coverage"],
    benefits: ["Quick claims", "Online management"],
    additionalServices: {
      roadsideAssistance: true,
      medicalHotline: true,
      legalSupport: false,
      homeVisit: false,
      worldwideCoverage: true,
    },
    claims: {
      processDescription: "Quick online process",
      requiredDocuments: ["ID", "Registration"],
      processingTime: 3,
      approvalRate: 95,
      averageClaimTime: 5,
      claimMethods: ["online", "phone"],
      contactInfo: {
        hotline: "1900-1234",
        email: "support@example.com",
      },
    },
    availability: {
      provinces: ["Hà Nội", "TP.HCM"],
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
        maxDiscount: 50,
      },
    },
    image: "/test-image.jpg",
    imageAlt: "Test Insurance",
    applyLink: "#",
    applyLinkType: "direct",
    rating: 5,
    reviewCount: 100,
    isRecommended: true,
    tags: ["premium", "comprehensive"],
    lastUpdated: new Date(),
    publishedAt: new Date(),
  },
  {
    id: "2",
    slug: "test-insurance-2",
    name: "Bảo hiểm sức khỏe B",
    issuer: "Công ty XYZ",
    category: InsuranceCategory.HEALTH,
    type: "voluntary" as any,
    coverage: {
      personalAccident: { limit: 300000000, disabled: false },
      propertyDamage: { limit: 0, disabled: true },
      medicalExpenses: { limit: 200000000, disabled: false },
      thirdPartyLiability: { limit: 0, disabled: true },
      death: { limit: 0, disabled: true },
      disability: { limit: 0, disabled: true },
      hospitalization: { limit: 50000000, disabled: false },
      surgery: { limit: 30000000, disabled: false },
      criticalIllness: { limit: 0, disabled: true },
      lossOfIncome: { limit: 0, disabled: true },
    },
    pricing: {
      basePremium: 3000000,
      feeType: FeeType.PERCENTAGE,
      taxRate: 10,
      taxAmount: 300000,
      totalPremium: 3300000,
      currency: "VND",
      coveragePeriod: CoveragePeriod.MONTHLY,
    },
    deductibles: {
      standardDeductible: 200000,
      voluntaryDeductibleOptions: [],
      deductibleType: "fixed",
    },
    exclusions: [],
    waitingPeriods: {
      general: 30,
    },
    eligibility: {
      ageRange: { min: 1, max: 65 },
    },
    features: ["Medical hotline", "Legal support"],
    benefits: ["Cashless hospitalization"],
    additionalServices: {
      roadsideAssistance: false,
      medicalHotline: true,
      legalSupport: true,
      homeVisit: true,
      worldwideCoverage: false,
    },
    claims: {
      processDescription: "Simple process",
      requiredDocuments: ["Medical records"],
      processingTime: 5,
      approvalRate: 90,
      averageClaimTime: 7,
      claimMethods: ["online", "branch"],
      contactInfo: {
        hotline: "1900-5678",
        email: "claims@example.com",
      },
    },
    availability: {
      provinces: [],
      nationalAvailability: true,
      exclusions: [],
    },
    paymentOptions: {
      methods: ["mobile_banking", "ewallet"],
      installmentAvailable: false,
    },
    renewal: {
      autoRenewal: false,
      renewalReminderDays: 15,
      gracePeriod: 30,
      noClaimBonus: {
        maxYears: 3,
        maxDiscount: 30,
      },
    },
    image: "/test-image-2.jpg",
    imageAlt: "Test Insurance 2",
    applyLink: "#",
    applyLinkType: "affiliate",
    rating: 4,
    reviewCount: 50,
    tags: ["basic", "affordable"],
    lastUpdated: new Date(),
    publishedAt: new Date(),
  },
];

describe("InsuranceComparison", () => {
  it("renders correctly with products", () => {
    const mockOnRemove = jest.fn();
    const mockOnClear = jest.fn();

    render(
      <InsuranceComparison
        products={mockProducts}
        onRemove={mockOnRemove}
        onClear={mockOnClear}
      />
    );

    // Check if products are displayed
    expect(screen.getByText("Bảo hiểm xe ô tô A")).toBeInTheDocument();
    expect(screen.getByText("Bảo hiểm sức khỏe B")).toBeInTheDocument();
    expect(screen.getByText("Công ty ABC")).toBeInTheDocument();
    expect(screen.getByText("Công ty XYZ")).toBeInTheDocument();

    // Check coverage limits
    expect(screen.getByText("500.000.000 ₫")).toBeInTheDocument();
    expect(screen.getByText("300.000.000 ₫")).toBeInTheDocument();

    // Check pricing
    expect(screen.getByText("5.500.000 ₫")).toBeInTheDocument();
    expect(screen.getByText("3.300.000 ₫")).toBeInTheDocument();

    // Check features
    expect(screen.getByText("Đề xuất")).toBeInTheDocument();
  });

  it("calls onRemove when remove button is clicked", () => {
    const mockOnRemove = jest.fn();
    const mockOnClear = jest.fn();

    render(
      <InsuranceComparison
        products={mockProducts}
        onRemove={mockOnRemove}
        onClear={mockOnClear}
      />
    );

    const removeButtons = screen.getAllByRole("button").filter(
      button => button.querySelector("svg")
    );

    fireEvent.click(removeButtons[1]); // Click first remove button
    expect(mockOnRemove).toHaveBeenCalledWith("1");
  });

  it("calls onClear when clear all button is clicked", () => {
    const mockOnRemove = jest.fn();
    const mockOnClear = jest.fn();

    render(
      <InsuranceComparison
        products={mockProducts}
        onRemove={mockOnRemove}
        onClear={mockOnClear}
      />
    );

    const clearButton = screen.getByText("Xóa tất cả");
    fireEvent.click(clearButton);
    expect(mockOnClear).toHaveBeenCalled();
  });

  it("renders null when no products", () => {
    const mockOnRemove = jest.fn();
    const mockOnClear = jest.fn();

    const { container } = render(
      <InsuranceComparison
        products={[]}
        onRemove={mockOnRemove}
        onClear={mockOnClear}
      />
    );

    expect(container.firstChild).toBeNull();
  });

  it("shows best value indicators correctly", () => {
    const mockOnRemove = jest.fn();
    const mockOnClear = jest.fn();

    render(
      <InsuranceComparison
        products={mockProducts}
        onRemove={mockOnRemove}
        onClear={mockOnClear}
      />
    );

    // Check for "Thấp nhất" indicator for lowest premium
    expect(screen.getByText("Thấp nhất")).toBeInTheDocument();

    // Check for "Cao nhất" indicator for highest rating
    expect(screen.getAllByText("Cao nhất")).toHaveLength(2); // Rating and approval rate
  });
});