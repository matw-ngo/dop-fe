/**
 * Tests for the InsuranceActiveFilters component
 */

import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NextIntlClientProvider } from "next-intl";
import InsuranceActiveFilters from "./ActiveFilters";
import { InsuranceFilters, InsuranceCategory, InsuranceType } from "@/types/insurance";
import { DEFAULT_FILTERS } from "@/constants/insurance";

// Mock next-intl
const mockTranslations = {
  pages: {
    insurance: {
      category: "Loại bảo hiểm",
      type: "Loại hình",
      clearAll: "Xóa tất cả",
    },
  },
};

// Mock constants
jest.mock("@/constants/insurance", () => ({
  DEFAULT_FILTERS: {
    categories: [],
    types: [],
    issuers: [],
    coverageRange: {
      personalAccident: { min: 0, max: 2000000000 },
      propertyDamage: { min: 0, max: 2000000000 },
      medicalExpenses: { min: 0, max: 1000000000 },
    },
    specificCoverages: [],
    premiumRange: { min: 0, max: 50000000 },
    feeTypes: [],
    coveragePeriods: [],
    ageRange: { min: 18, max: 80 },
    includePreExistingConditions: false,
    hasRoadsideAssistance: false,
    hasWorldwideCoverage: false,
    hasMedicalHotline: false,
    hasLegalSupport: false,
    minApprovalRate: 0,
    maxProcessingTime: 30,
    provinces: [],
    nationalAvailability: false,
    isNew: false,
    isRecommended: false,
    isExclusive: false,
    hasAutoRenewal: false,
    hasInstallments: false,
    minRating: 0,
  },
  INSURANCE_CATEGORIES: {
    [InsuranceCategory.VEHICLE]: {
      id: InsuranceCategory.VEHICLE,
      name: "Bảo hiểm xe",
      description: "Bảo hiểm xe cơ giới",
      icon: "car",
      color: "#3B82F6",
      mandatory: [],
      voluntary: [],
    },
    [InsuranceCategory.HEALTH]: {
      id: InsuranceCategory.HEALTH,
      name: "Bảo hiểm sức khỏe",
      description: "Bảo hiểm sức khỏe",
      icon: "heart",
      color: "#EF4444",
      mandatory: [],
      voluntary: [],
    },
  },
  INSURANCE_TYPES: {
    [InsuranceType.COMPULSORY]: {
      id: InsuranceType.COMPULSORY,
      name: "Bắt buộc",
      description: "Bảo hiểm bắt buộc",
      color: "#DC2626",
    },
    [InsuranceType.VOLUNTARY]: {
      id: InsuranceType.VOLUNTARY,
      name: "Tự nguyện",
      description: "Bảo hiểm tự nguyện",
      color: "#059669",
    },
  },
  PREMIUM_RANGES: [
    { value: { min: 0, max: 1000000 }, label: "< 1 triệu/năm" },
    { value: { min: 1000000, max: 3000000 }, label: "1 - 3 triệu/năm" },
    { value: { min: 3000000, max: 5000000 }, label: "3 - 5 triệu/năm" },
  ],
  PERSONAL_ACCIDENT_COVERAGE_RANGES: [
    { value: { min: 0, max: 100000000 }, label: "< 100 triệu VNĐ" },
    { value: { min: 100000000, max: 300000000 }, label: "100 - 300 triệu VNĐ" },
  ],
  PROPERTY_DAMAGE_COVERAGE_RANGES: [
    { value: { min: 0, max: 50000000 }, label: "< 50 triệu VNĐ" },
    { value: { min: 50000000, max: 100000000 }, label: "50 - 100 triệu VNĐ" },
  ],
  MEDICAL_EXPENSES_COVERAGE_RANGES: [
    { value: { min: 0, max: 10000000 }, label: "< 10 triệu VNĐ" },
    { value: { min: 10000000, max: 20000000 }, label: "10 - 20 triệu VNĐ" },
  ],
  VEHICLE_TYPES: {
    car: {
      id: "car",
      name: "Ô tô",
      description: "Xe ô tô",
      icon: "car",
    },
    motorcycle: {
      id: "motorcycle",
      name: "Xe máy",
      description: "Xe máy",
      icon: "motorcycle",
    },
  },
}));

const mockFilters: InsuranceFilters = {
  categories: [InsuranceCategory.VEHICLE, InsuranceCategory.HEALTH],
  types: [InsuranceType.COMPULSORY],
  issuers: ["Bảo Việt", "Bảo Minh"],
  coverageRange: {
    personalAccident: { min: 100000000, max: 300000000 },
    propertyDamage: { min: 0, max: 2000000000 },
    medicalExpenses: { min: 0, max: 1000000000 },
  },
  specificCoverages: ["car", "motorcycle"],
  premiumRange: { min: 1000000, max: 3000000 },
  feeTypes: [],
  coveragePeriods: [],
  ageRange: { min: 18, max: 80 },
  includePreExistingConditions: false,
  hasRoadsideAssistance: true,
  hasWorldwideCoverage: true,
  hasMedicalHotline: false,
  hasLegalSupport: true,
  minApprovalRate: 0,
  maxProcessingTime: 30,
  provinces: ["Hà Nội", "TP. Hồ Chí Minh", "Đà Nẵng", "Hải Phòng"],
  nationalAvailability: false,
  isNew: true,
  isRecommended: false,
  isExclusive: false,
  hasAutoRenewal: false,
  hasInstallments: true,
  minRating: 0,
};

const renderWithIntl = (component: React.ReactElement) => {
  return render(
    <NextIntlClientProvider locale="vi" messages={mockTranslations}>
      {component}
    </NextIntlClientProvider>
  );
};

describe("InsuranceActiveFilters", () => {
  const mockOnFiltersChange = jest.fn();
  const mockOnClearAll = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders nothing when no filters are active", () => {
    renderWithIntl(
      <InsuranceActiveFilters
        filters={DEFAULT_FILTERS}
        onFiltersChange={mockOnFiltersChange}
        onClearAll={mockOnClearAll}
      />
    );

    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("renders active filter pills correctly", () => {
    renderWithIntl(
      <InsuranceActiveFilters
        filters={mockFilters}
        onFiltersChange={mockOnFiltersChange}
        onClearAll={mockOnClearAll}
        maxDisplay={5}
      />
    );

    // Check category filters
    expect(screen.getByText("Bảo hiểm xe")).toBeInTheDocument();
    expect(screen.getByText("Bảo hiểm sức khỏe")).toBeInTheDocument();

    // Check type filter
    expect(screen.getByText("Bắt buộc")).toBeInTheDocument();

    // Check issuer filters
    expect(screen.getByText("Bảo Việt")).toBeInTheDocument();
    expect(screen.getByText("Bảo Minh")).toBeInTheDocument();

    // Check feature filters
    expect(screen.getByText("Cứu hộ 24/7")).toBeInTheDocument();
    expect(screen.getByText("Bảo hiểm toàn cầu")).toBeInTheDocument();
    expect(screen.getByText("Hỗ trợ pháp lý")).toBeInTheDocument();
    expect(screen.getByText("Sản phẩm mới")).toBeInTheDocument();
    expect(screen.getByText("Trả góp")).toBeInTheDocument();
  });

  it("removes single filter when clicking on pill", async () => {
    const user = userEvent.setup();

    renderWithIntl(
      <InsuranceActiveFilters
        filters={mockFilters}
        onFiltersChange={mockOnFiltersChange}
        onClearAll={mockOnClearAll}
      />
    );

    const categoryFilter = screen.getByText("Bảo hiểm xe");
    await user.click(categoryFilter);

    expect(mockOnFiltersChange).toHaveBeenCalledWith({
      categories: [InsuranceCategory.HEALTH],
    });
  });

  it("clears all filters when clicking clear all button", async () => {
    const user = userEvent.setup();

    renderWithIntl(
      <InsuranceActiveFilters
        filters={mockFilters}
        onFiltersChange={mockOnFiltersChange}
        onClearAll={mockOnClearAll}
      />
    );

    const clearAllButton = screen.getByText("Xóa tất cả");
    await user.click(clearAllButton);

    expect(mockOnClearAll).toHaveBeenCalledTimes(1);
  });

  it("limits displayed filters with maxDisplay prop", () => {
    renderWithIntl(
      <InsuranceActiveFilters
        filters={mockFilters}
        onFiltersChange={mockOnFiltersChange}
        onClearAll={mockOnClearAll}
        maxDisplay={3}
      />
    );

    // Should show only 3 filter pills plus the "more" indicator
    const filterPills = screen.getAllByRole("button");
    expect(filterPills.length).toBeGreaterThanOrEqual(4); // 3 filters + more indicator
    expect(screen.getByText(/\+\d+/)).toBeInTheDocument(); // More indicator
  });

  it("displays premium range filter correctly", () => {
    const filtersWithPremium = {
      ...DEFAULT_FILTERS,
      premiumRange: { min: 1000000, max: 3000000 },
    };

    renderWithIntl(
      <InsuranceActiveFilters
        filters={filtersWithPremium}
        onFiltersChange={mockOnFiltersChange}
        onClearAll={mockOnClearAll}
      />
    );

    expect(screen.getByText("1 - 3 triệu/năm")).toBeInTheDocument();
  });

  it("displays coverage range filters correctly", () => {
    const filtersWithCoverage = {
      ...DEFAULT_FILTERS,
      coverageRange: {
        personalAccident: { min: 100000000, max: 300000000 },
        propertyDamage: { min: 50000000, max: 100000000 },
        medicalExpenses: { min: 10000000, max: 20000000 },
      },
    };

    renderWithIntl(
      <InsuranceActiveFilters
        filters={filtersWithCoverage}
        onFiltersChange={mockOnFiltersChange}
        onClearAll={mockOnClearAll}
      />
    );

    expect(screen.getByText(/TN cá nhân:/)).toBeInTheDocument();
    expect(screen.getByText(/Tài sản:/)).toBeInTheDocument();
    expect(screen.getByText(/Y tế:/)).toBeInTheDocument();
  });

  it("displays province filters with overflow handling", () => {
    const filtersWithManyProvinces = {
      ...DEFAULT_FILTERS,
      provinces: [
        "Hà Nội",
        "TP. Hồ Chí Minh",
        "Đà Nẵng",
        "Hải Phòng",
        "Cần Thơ",
        "Huế",
      ],
    };

    renderWithIntl(
      <InsuranceActiveFilters
        filters={filtersWithManyProvinces}
        onFiltersChange={mockOnFiltersChange}
        onClearAll={mockOnClearAll}
      />
    );

    // Should show first 3 provinces plus "+X more" indicator
    expect(screen.getByText("Hà Nội")).toBeInTheDocument();
    expect(screen.getByText("TP. Hồ Chí Minh")).toBeInTheDocument();
    expect(screen.getByText("Đà Nẵng")).toBeInTheDocument();
    expect(screen.getByText("+3 tỉnh/thành khác")).toBeInTheDocument();
  });

  it("shows filter groups summary when multiple groups exist", () => {
    renderWithIntl(
      <InsuranceActiveFilters
        filters={mockFilters}
        onFiltersChange={mockOnFiltersChange}
        onClearAll={mockOnClearAll}
      />
    );

    // Check for group summary section
    expect(screen.getByText("Loại bảo hiểm:")).toBeInTheDocument();
    expect(screen.getByText("Loại hình:")).toBeInTheDocument();
    expect(screen.getByText("Nhà cung cấp:")).toBeInTheDocument();
    expect(screen.getByText("Phí bảo hiểm:")).toBeInTheDocument();
    expect(screen.getByText("Mức bảo hiểm:")).toBeInTheDocument();
  });

  it("applies custom className correctly", () => {
    const { container } = renderWithIntl(
      <InsuranceActiveFilters
        filters={mockFilters}
        onFiltersChange={mockOnFiltersChange}
        onClearAll={mockOnClearAll}
        className="custom-test-class"
      />
    );

    expect(container.querySelector(".custom-test-class")).toBeInTheDocument();
  });

  it("handles filter removal with complex nested objects", async () => {
    const user = userEvent.setup();

    renderWithIntl(
      <InsuranceActiveFilters
        filters={mockFilters}
        onFiltersChange={mockOnFiltersChange}
        onClearAll={mockOnClearAll}
      />
    );

    // Remove personal accident coverage filter
    const paFilter = screen.getByText(/TN cá nhân:/);
    await user.click(paFilter);

    expect(mockOnFiltersChange).toHaveBeenCalledWith({
      coverageRange: {
        ...mockFilters.coverageRange,
        personalAccident: DEFAULT_FILTERS.coverageRange.personalAccident,
      },
    });
  });

  it("shows tooltip for more indicator when filters are hidden", async () => {
    renderWithIntl(
      <InsuranceActiveFilters
        filters={mockFilters}
        onFiltersChange={mockOnFiltersChange}
        onClearAll={mockOnClearAll}
        maxDisplay={2}
      />
    );

    const moreIndicator = screen.getByText(/\+\d+/);

    // Hover over more indicator to show tooltip
    await fireEvent.mouseEnter(moreIndicator);

    await waitFor(() => {
      expect(screen.getByText("Bộ lọc bổ sung:")).toBeInTheDocument();
    });
  });
});