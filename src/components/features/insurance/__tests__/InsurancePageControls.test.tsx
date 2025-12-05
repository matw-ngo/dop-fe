import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import InsurancePageControls from "../InsurancePageControls";
import { ThemeProvider } from "@/lib/theme/context";
import { NextIntlClientProvider } from "next-intl";
import type { InsuranceFilters } from "@/types/insurance";

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <ThemeProvider defaultUserGroup="healthcare">
      <NextIntlClientProvider locale="en" messages={{}}>
        {component}
      </NextIntlClientProvider>
    </ThemeProvider>,
  );
};

// Mock next-intl
jest.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
  NextIntlClientProvider: ({ children }: { children: React.ReactNode }) =>
    children,
}));

// Mock child components
jest.mock("@/components/features/insurance/SearchBar", () => ({
  __esModule: true,
  default: ({ value, onChange, placeholder }: any) => (
    <input
      data-testid="search-bar"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
    />
  ),
}));

jest.mock("@/components/features/insurance/SortDropdown", () => ({
  __esModule: true,
  default: ({ value, onChange }: any) => (
    <select
      data-testid="sort-dropdown"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      <option value="name">Name</option>
      <option value="price">Price</option>
    </select>
  ),
}));

jest.mock("@/components/features/insurance/FilterPanel", () => ({
  __esModule: true,
  default: ({ filters, onFiltersChange }: any) => (
    <div data-testid="filter-panel">Filter Panel</div>
  ),
}));

describe("InsurancePageControls", () => {
  const defaultProps = {
    searchQuery: "",
    onSearch: jest.fn(),
    sortOption: "name",
    onSortChange: jest.fn(),
    viewMode: "grid" as const,
    onViewModeChange: jest.fn(),
    filters: {} as InsuranceFilters,
    onFiltersChange: jest.fn(),
    onClearFilters: jest.fn(),
    isLoading: false,
    totalProducts: 100,
    filteredProductsCount: 50,
    activeFiltersCount: 0,
    mobileFiltersOpen: false,
    onMobileFiltersChange: jest.fn(),
  };

  it("should render with theme classes", () => {
    renderWithProviders(<InsurancePageControls {...defaultProps} />);

    const controlsContainer = document.querySelector(".bg-card");
    expect(controlsContainer).toBeInTheDocument();

    const resultsText = screen.getByText(/showingResults/);
    expect(resultsText).toHaveClass("text-muted-foreground");
  });

  it("should handle search input", async () => {
    const user = userEvent.setup();
    renderWithProviders(<InsurancePageControls {...defaultProps} />);

    const searchInput = screen.getByTestId("search-bar");
    await user.type(searchInput, "health insurance");
    expect(defaultProps.onSearch).toHaveBeenCalledWith("health insurance");
  });

  it("should handle view mode toggle", async () => {
    const user = userEvent.setup();
    renderWithProviders(<InsurancePageControls {...defaultProps} />);

    const listViewButton = screen.getByRole("button", { name: "" });
    await user.click(listViewButton);
    expect(defaultProps.onViewModeChange).toHaveBeenCalledWith("list");
  });

  it("should display active filters badge", () => {
    renderWithProviders(
      <InsurancePageControls {...defaultProps} activeFiltersCount={3} />,
    );

    const badge = screen.getByText("3");
    expect(badge).toBeInTheDocument();
  });

  it("should show loading state", () => {
    renderWithProviders(
      <InsurancePageControls {...defaultProps} isLoading={true} />,
    );

    const loader = document.querySelector(".animate-spin");
    expect(loader).toBeInTheDocument();
  });
});
