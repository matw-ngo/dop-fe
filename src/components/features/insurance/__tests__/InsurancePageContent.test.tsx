import { render, screen } from "@testing-library/react";
import InsurancePageContent from "../InsurancePageContent";
import { ThemeProvider } from "@/lib/theme/context";
import { NextIntlClientProvider } from "next-intl";
import type { InsuranceProduct } from "@/types/insurance";

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
jest.mock("@/components/features/insurance/InsuranceGrid", () => ({
  __esModule: true,
  default: ({ products }: any) => (
    <div data-testid="insurance-grid">
      {products.map((p: any) => (
        <div key={p.id} data-testid={`product-${p.id}`}>
          {p.name}
        </div>
      ))}
    </div>
  ),
}));

jest.mock("@/components/features/insurance/FilterPanel", () => ({
  __esModule: true,
  default: () => <div data-testid="filter-panel">Filter Panel</div>,
}));

jest.mock("@/components/features/insurance/Pagination", () => ({
  __esModule: true,
  default: (props: any) => <div data-testid="pagination">Pagination</div>,
}));

describe("InsurancePageContent", () => {
  const mockProduct: InsuranceProduct = {
    id: "1",
    name: "Test Insurance",
    provider: "Test Provider",
    type: "health",
    coverage: "Full coverage",
    premium: 100,
    deductible: 500,
  } as any;

  const defaultProps = {
    isLoading: false,
    paginatedProducts: [mockProduct],
    filters: {},
    onFiltersChange: jest.fn(),
    onClearFilters: jest.fn(),
    onProductClick: jest.fn(),
    onCompareToggle: jest.fn(),
    totalPages: 1,
    currentPage: 1,
    totalItems: 1,
    itemsPerPage: 10,
    onPageChange: jest.fn(),
    onItemsPerPageChange: jest.fn(),
    hasMultiplePages: false,
    searchQuery: "",
    activeFiltersCount: 0,
    onSearchClear: jest.fn(),
  };

  it("should render with theme classes", () => {
    renderWithProviders(<InsurancePageContent {...defaultProps} />);

    const container = document.querySelector(".container");
    expect(container).toBeInTheDocument();

    const grid = screen.getByTestId("insurance-grid");
    expect(grid).toBeInTheDocument();
  });

  it("should render loading state with theme colors", () => {
    renderWithProviders(
      <InsurancePageContent {...defaultProps} isLoading={true} />,
    );

    const loader = document.querySelector(".animate-spin");
    expect(loader).toHaveClass("text-primary");
  });

  it("should render no results state with theme colors", () => {
    renderWithProviders(
      <InsurancePageContent {...defaultProps} paginatedProducts={[]} />,
    );

    const shieldIcon = document.querySelector(".lucide-shield");
    expect(shieldIcon).toHaveClass("text-muted-foreground");

    const title = screen.getByRole("heading", { level: 3 });
    expect(title).toHaveClass("text-foreground");
  });

  it("should render products when available", () => {
    renderWithProviders(<InsurancePageContent {...defaultProps} />);

    const product = screen.getByTestId("product-1");
    expect(product).toBeInTheDocument();
    expect(product).toHaveTextContent("Test Insurance");
  });

  it("should show pagination when multiple pages", () => {
    renderWithProviders(
      <InsurancePageContent {...defaultProps} hasMultiplePages={true} />,
    );

    const pagination = screen.getByTestId("pagination");
    expect(pagination).toBeInTheDocument();
  });
});
