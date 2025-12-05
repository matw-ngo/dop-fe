"use client";

import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import FilterSidebar from "./FilterSidebar";
import { DEFAULT_FILTERS } from "@/constants/insurance";
import type { InsuranceFilters } from "@/types/insurance";
import { InsuranceCategory, InsuranceType } from "@/types/insurance";

// Mock next-intl
jest.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

const mockFilters: InsuranceFilters = {
  ...DEFAULT_FILTERS,
  categories: [InsuranceCategory.VEHICLE],
  types: [InsuranceType.VOLUNTARY],
  issuers: ["Bảo Việt"],
  premiumRange: { min: 1000000, max: 10000000 },
};

const mockAvailableOptions = {
  issuers: ["Bảo Việt", "Bảo Minh", "PVI"],
  vehicleTypes: ["car", "motorcycle"],
  features: ["roadside-assistance"],
};

describe("FilterSidebar", () => {
  const mockOnFiltersChange = jest.fn();
  const mockOnClearFilters = jest.fn();
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Desktop Layout", () => {
    it("renders correctly in desktop mode", () => {
      render(
        <FilterSidebar
          filters={mockFilters}
          onFiltersChange={mockOnFiltersChange}
          onClearFilters={mockOnClearFilters}
          availableOptions={mockAvailableOptions}
          isMobile={false}
        />
      );

      // Check header elements
      expect(screen.getByText("filters")).toBeInTheDocument();
      expect(screen.getByText("filterDescription")).toBeInTheDocument();
      expect(screen.getByText("clearAll")).toBeInTheDocument();

      // Check active filters badge
      expect(screen.getByText("2")).toBeInTheDocument(); // categories and types

      // Check that FilterPanel is rendered
      expect(screen.getByRole("complementary")).toBeInTheDocument();
    });

    it("calls onClearFilters when clear button is clicked", async () => {
      const user = userEvent.setup();

      render(
        <FilterSidebar
          filters={mockFilters}
          onFiltersChange={mockOnFiltersChange}
          onClearFilters={mockOnClearFilters}
          isMobile={false}
        />
      );

      const clearButton = screen.getByText("clearAll");
      await user.click(clearButton);

      expect(mockOnClearFilters).toHaveBeenCalledTimes(1);
    });

    it("displays active filters count badge", () => {
      render(
        <FilterSidebar
          filters={mockFilters}
          onFiltersChange={mockOnFiltersChange}
          onClearFilters={mockOnClearFilters}
          isMobile={false}
        />
      );

      const badge = screen.getByText("2");
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveClass("badge");
    });

    it("shows active filters summary in footer", () => {
      render(
        <FilterSidebar
          filters={mockFilters}
          onFiltersChange={mockOnFiltersChange}
          onClearFilters={mockOnClearFilters}
          isMobile={false}
        />
      );

      expect(screen.getByText(/activeFiltersCount/)).toBeInTheDocument();
    });

    it("hides footer when no active filters", () => {
      render(
        <FilterSidebar
          filters={DEFAULT_FILTERS}
          onFiltersChange={mockOnFiltersChange}
          onClearFilters={mockOnClearFilters}
          isMobile={false}
        />
      );

      expect(screen.queryByText(/activeFiltersCount/)).not.toBeInTheDocument();
    });
  });

  describe("Mobile Layout", () => {
    it("renders as sheet/drawer in mobile mode", () => {
      render(
        <FilterSidebar
          filters={mockFilters}
          onFiltersChange={mockOnFiltersChange}
          onClearFilters={mockOnClearFilters}
          availableOptions={mockAvailableOptions}
          isMobile={true}
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      // Check for mobile-specific elements
      expect(screen.getByText("filters")).toBeInTheDocument();
      expect(screen.getByText("filterDescription")).toBeInTheDocument();

      // Check that close button is present
      const closeButton = screen.getByLabelText("close");
      expect(closeButton).toBeInTheDocument();
    });

    it("calls onClose when close button is clicked", async () => {
      const user = userEvent.setup();

      render(
        <FilterSidebar
          filters={mockFilters}
          onFiltersChange={mockOnFiltersChange}
          onClearFilters={mockOnClearFilters}
          isMobile={true}
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      const closeButton = screen.getByLabelText("close");
      await user.click(closeButton);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it("does not render when closed", () => {
      render(
        <FilterSidebar
          filters={mockFilters}
          onFiltersChange={mockOnFiltersChange}
          onClearFilters={mockOnClearFilters}
          isMobile={true}
          isOpen={false}
          onClose={mockOnClose}
        />
      );

      // Sheet content should not be visible when closed
      expect(screen.queryByRole("complementary")).not.toBeInTheDocument();
    });

    it("passes isMobile prop to FilterPanel", () => {
      const { container } = render(
        <FilterSidebar
          filters={mockFilters}
          onFiltersChange={mockOnFiltersChange}
          onClearFilters={mockOnClearFilters}
          isMobile={true}
          isOpen={true}
        />
      );

      // The FilterPanel should receive isMobile=true and render in mobile mode
      // This is indirectly tested by checking for mobile-specific elements
      expect(screen.getByText("apply")).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("has proper ARIA labels", () => {
      render(
        <FilterSidebar
          filters={mockFilters}
          onFiltersChange={mockOnFiltersChange}
          onClearFilters={mockOnClearFilters}
          isMobile={false}
        />
      );

      // Check for ARIA labels
      const sidebar = screen.getByRole("complementary");
      expect(sidebar).toHaveAttribute("aria-label", "filterSidebar");
    });

    it("has proper descriptions for screen readers", () => {
      render(
        <FilterSidebar
          filters={mockFilters}
          onFiltersChange={mockOnFiltersChange}
          onClearFilters={mockOnClearFilters}
          isMobile={true}
          isOpen={true}
        />
      );

      // Check for description
      expect(screen.getByText("filterDescription")).toBeInTheDocument();
    });

    it("clear button has proper accessibility label", () => {
      render(
        <FilterSidebar
          filters={mockFilters}
          onFiltersChange={mockOnFiltersChange}
          onClearFilters={mockOnClearFilters}
          isMobile={false}
        />
      );

      const clearButton = screen.getByText("clearAll");
      expect(clearButton).toHaveAttribute("aria-label", "clearAllFilters");
    });
  });

  describe("Props Handling", () => {
    it("passes availableOptions to FilterPanel", () => {
      render(
        <FilterSidebar
          filters={mockFilters}
          onFiltersChange={mockOnFiltersChange}
          onClearFilters={mockOnClearFilters}
          availableOptions={mockAvailableOptions}
          isMobile={false}
        />
      );

      // The available options should be passed down and visible in the filter panel
      expect(screen.getByText("Bảo Việt")).toBeInTheDocument();
      expect(screen.getByText("Bảo Minh")).toBeInTheDocument();
    });

    it("applies custom className", () => {
      const customClass = "custom-sidebar-class";

      render(
        <FilterSidebar
          filters={mockFilters}
          onFiltersChange={mockOnFiltersChange}
          onClearFilters={mockOnClearFilters}
          isMobile={false}
          className={customClass}
        />
      );

      const sidebar = screen.getByRole("complementary");
      expect(sidebar).toHaveClass(customClass);
    });

    it("calculates active filters correctly", () => {
      const complexFilters: InsuranceFilters = {
        ...DEFAULT_FILTERS,
        categories: [InsuranceCategory.VEHICLE, InsuranceCategory.HEALTH],
        types: [InsuranceType.VOLUNTARY],
        issuers: ["Bảo Việt"],
        hasRoadsideAssistance: true,
        hasWorldwideCoverage: true,
        isNew: true,
        isRecommended: true,
        premiumRange: { min: 1000000, max: 10000000 },
      };

      render(
        <FilterSidebar
          filters={complexFilters}
          onFiltersChange={mockOnFiltersChange}
          onClearFilters={mockOnClearFilters}
          isMobile={false}
        />
      );

      // Should count: categories(1) + types(1) + issuers(1) + features(2) + special(2) + premium(1) = 8
      expect(screen.getByText("8")).toBeInTheDocument();
    });
  });
});