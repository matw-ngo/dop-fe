import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { nextIntlProviderWrapper } from "@/test-utils";
import InsuranceFilterPanel from "./FilterPanel";
import {
  InsuranceFilters,
  InsuranceCategory,
  InsuranceType,
} from "@/types/insurance";
import { DEFAULT_FILTERS } from "@/constants/insurance";

const mockFilters: InsuranceFilters = {
  ...DEFAULT_FILTERS,
  categories: [InsuranceCategory.VEHICLE],
  issuers: ["Bảo Việt", "PTI"],
  provinces: ["Hà Nội", "TP Hồ Chí Minh"],
  hasRoadsideAssistance: true,
  isRecommended: true,
};

const mockAvailableOptions = {
  issuers: ["Bảo Việt", "PTI", "Bảo Minh", "PVI"],
  vehicleTypes: ["car", "motorcycle"],
  features: ["Cứu hộ 24/7", "Bảo hiểm toàn cầu"],
};

const renderWithProvider = (component: React.ReactElement) => {
  return render(nextIntlProviderWrapper(component));
};

describe("InsuranceFilterPanel", () => {
  const mockOnFiltersChange = jest.fn();
  const mockOnClearFilters = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders filter panel with all sections", () => {
    renderWithProvider(
      <InsuranceFilterPanel
        filters={mockFilters}
        onFiltersChange={mockOnFiltersChange}
        onClearFilters={mockOnClearFilters}
        availableOptions={mockAvailableOptions}
      />,
    );

    // Check header
    expect(screen.getByText("Bộ lọc")).toBeInTheDocument();

    // Check filter sections
    expect(screen.getByText("Loại bảo hiểm")).toBeInTheDocument();
    expect(screen.getByText("Loại hình")).toBeInTheDocument();
    expect(screen.getByText("Nhà cung cấp")).toBeInTheDocument();
    expect(screen.getByText("Phí bảo hiểm")).toBeInTheDocument();
    expect(screen.getByText("Mức bảo hiểm")).toBeInTheDocument();
    expect(screen.getByText("Khu vực")).toBeInTheDocument();
    expect(screen.getByText("Tính năng")).toBeInTheDocument();
    expect(screen.getByText("Bộ lọc nhanh")).toBeInTheDocument();
  });

  it("displays active filters count", () => {
    renderWithProvider(
      <InsuranceFilterPanel
        filters={mockFilters}
        onFiltersChange={mockOnFiltersChange}
        onClearFilters={mockOnClearFilters}
        availableOptions={mockAvailableOptions}
      />,
    );

    const activeFiltersBadge = screen.getByText("4"); // 4 active filters
    expect(activeFiltersBadge).toBeInTheDocument();
  });

  it("calls onClearFilters when clear button is clicked", () => {
    renderWithProvider(
      <InsuranceFilterPanel
        filters={mockFilters}
        onFiltersChange={mockOnFiltersChange}
        onClearFilters={mockOnClearFilters}
        availableOptions={mockAvailableOptions}
      />,
    );

    const clearButton = screen.getByText("Xóa tất cả");
    fireEvent.click(clearButton);

    expect(mockOnClearFilters).toHaveBeenCalledTimes(1);
  });

  it("renders insurance categories with icons", () => {
    renderWithProvider(
      <InsuranceFilterPanel
        filters={mockFilters}
        onFiltersChange={mockOnFiltersChange}
        onClearFilters={mockOnClearFilters}
        availableOptions={mockAvailableOptions}
      />,
    );

    // Check specific categories
    expect(screen.getByText("Bảo hiểm xe")).toBeInTheDocument();
    expect(screen.getByText("Bảo hiểm sức khỏe")).toBeInTheDocument();
    expect(screen.getByText("Bảo hiểm nhân thọ")).toBeInTheDocument();
    expect(screen.getByText("Bảo hiểm du lịch")).toBeInTheDocument();
    expect(screen.getByText("Bảo hiểm tài sản")).toBeInTheDocument();
  });

  it("handles checkbox changes for categories", () => {
    renderWithProvider(
      <InsuranceFilterPanel
        filters={DEFAULT_FILTERS}
        onFiltersChange={mockOnFiltersChange}
        onClearFilters={mockOnClearFilters}
        availableOptions={mockAvailableOptions}
      />,
    );

    const healthCheckbox = screen.getByLabelText(/Bảo hiểm sức khỏe/i);
    fireEvent.click(healthCheckbox);

    expect(mockOnFiltersChange).toHaveBeenCalledWith({
      categories: ["health"],
    });
  });

  it("handles boolean filter changes", () => {
    renderWithProvider(
      <InsuranceFilterPanel
        filters={DEFAULT_FILTERS}
        onFiltersChange={mockOnFiltersChange}
        onClearFilters={mockOnClearFilters}
        availableOptions={mockAvailableOptions}
      />,
    );

    const roadsideAssistanceCheckbox = screen.getByLabelText(
      /Cứu hộ đường bộ 24\/7/i,
    );
    fireEvent.click(roadsideAssistanceCheckbox);

    expect(mockOnFiltersChange).toHaveBeenCalledWith({
      hasRoadsideAssistance: true,
    });
  });

  it("handles radio button changes for insurance types", () => {
    renderWithProvider(
      <InsuranceFilterPanel
        filters={DEFAULT_FILTERS}
        onFiltersChange={mockOnFiltersChange}
        onClearFilters={mockOnClearFilters}
        availableOptions={mockAvailableOptions}
      />,
    );

    const compulsoryRadio = screen.getByLabelText(/Bắt buộc/i);
    fireEvent.click(compulsoryRadio);

    expect(mockOnFiltersChange).toHaveBeenCalledWith({
      types: ["compulsory"],
    });
  });

  it("renders issuers from available options", () => {
    renderWithProvider(
      <InsuranceFilterPanel
        filters={DEFAULT_FILTERS}
        onFiltersChange={mockOnFiltersChange}
        onClearFilters={mockOnClearFilters}
        availableOptions={mockAvailableOptions}
      />,
    );

    mockAvailableOptions.issuers?.forEach((issuer) => {
      expect(screen.getByText(issuer)).toBeInTheDocument();
    });
  });

  it("renders mobile layout with accordion when isMobile is true", () => {
    renderWithProvider(
      <InsuranceFilterPanel
        filters={mockFilters}
        onFiltersChange={mockOnFiltersChange}
        onClearFilters={mockOnClearFilters}
        availableOptions={mockAvailableOptions}
        isMobile={true}
      />,
    );

    // Check for apply button specific to mobile
    expect(screen.getByText("Áp dụng bộ lọc")).toBeInTheDocument();
  });

  it("displays province groups correctly", () => {
    renderWithProvider(
      <InsuranceFilterPanel
        filters={DEFAULT_FILTERS}
        onFiltersChange={mockOnFiltersChange}
        onClearFilters={mockOnClearFilters}
        availableOptions={mockAvailableOptions}
      />,
    );

    expect(screen.getByText("Toàn quốc")).toBeInTheDocument();
    expect(screen.getByText("Miền Bắc")).toBeInTheDocument();
    expect(screen.getByText("Miền Trung")).toBeInTheDocument();
    expect(screen.getByText("Miền Nam")).toBeInTheDocument();
  });

  it("handles range slider changes for premium", () => {
    renderWithProvider(
      <InsuranceFilterPanel
        filters={DEFAULT_FILTERS}
        onFiltersChange={mockOnFiltersChange}
        onClearFilters={mockOnClearFilters}
        availableOptions={mockAvailableOptions}
      />,
    );

    // Find the premium range slider
    const sliders = screen.getAllByRole("slider");
    const premiumSlider = sliders.find((slider) =>
      slider.closest(".space-y-4")?.textContent?.includes("Phí bảo hiểm"),
    );

    if (premiumSlider) {
      fireEvent.change(premiumSlider, {
        target: { value: ["1000000", "10000000"] },
      });

      // Check if the change was called (implementation may vary based on Slider component)
      expect(mockOnFiltersChange).toHaveBeenCalled();
    }
  });

  it("displays special filter badges", () => {
    renderWithProvider(
      <InsuranceFilterPanel
        filters={DEFAULT_FILTERS}
        onFiltersChange={mockOnFiltersChange}
        onClearFilters={mockOnClearFilters}
        availableOptions={mockAvailableOptions}
      />,
    );

    expect(screen.getByText("Mới")).toBeInTheDocument();
    expect(screen.getByText("Đề xuất")).toBeInTheDocument();
    expect(screen.getByText("Độc quyền")).toBeInTheDocument();
  });

  it("toggles special filters when clicked", () => {
    renderWithProvider(
      <InsuranceFilterPanel
        filters={DEFAULT_FILTERS}
        onFiltersChange={mockOnFiltersChange}
        onClearFilters={mockOnClearFilters}
        availableOptions={mockAvailableOptions}
      />,
    );

    const newBadge = screen.getByText("Mới");
    fireEvent.click(newBadge);

    expect(mockOnFiltersChange).toHaveBeenCalledWith({
      isNew: true,
    });
  });
});
