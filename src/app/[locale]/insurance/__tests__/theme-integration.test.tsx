import { render, screen } from "@testing-library/react";
import { ThemeProvider } from "@/lib/theme/context";
import InsurancePage from "@/app/[locale]/insurance/page";
import { useInsuranceStore } from "@/store/use-insurance-store";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { NextIntlClientProvider } from "next-intl";

// Mock the store
jest.mock("@/store/use-insurance-store");
jest.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
  NextIntlClientProvider: ({ children }: { children: React.ReactNode }) =>
    children,
}));

// Mock Header and Footer components
jest.mock("@/components/layout/header", () => ({
  __esModule: true,
  default: ({ configOverride }: any) => <div data-testid="header">Header</div>,
}));

jest.mock("@/components/layout/footer", () => ({
  __esModule: true,
  default: ({ company }: any) => <div data-testid="footer">Footer</div>,
}));

// Mock insurance components
jest.mock("@/components/features/insurance/InsurancePageHero", () => ({
  __esModule: true,
  default: ({ titleKey, descriptionKey }: any) => (
    <div data-testid="insurance-hero">
      <h1>{titleKey}</h1>
      <p>{descriptionKey}</p>
    </div>
  ),
}));

jest.mock("@/components/features/insurance/InsurancePageControls", () => ({
  __esModule: true,
  default: (props: any) => <div data-testid="insurance-controls">Controls</div>,
}));

jest.mock("@/components/features/insurance/InsurancePageContent", () => ({
  __esModule: true,
  default: (props: any) => <div data-testid="insurance-content">Content</div>,
}));

// Mock hooks
jest.mock("@/hooks/features/insurance/useInsurancePageState", () => ({
  useInsurancePageState: () => ({
    mobileFiltersOpen: false,
    setMobileFiltersOpen: jest.fn(),
    itemsPerPage: 10,
    setItemsPerPage: jest.fn(),
    setFiltersState: jest.fn(),
  }),
  __esModule: true,
}));

jest.mock("@/hooks/features/insurance/useInsurancePageHandlers", () => ({
  useInsurancePageHandlers: () => ({}),
  __esModule: true,
}));

jest.mock("@/hooks/features/insurance/useInsurancePageComputed", () => ({
  useInsurancePageComputed: () => ({
    totalPages: 1,
    paginatedProducts: [],
    hasProducts: false,
    hasMultiplePages: false,
    canPaginate: false,
  }),
  __esModule: true,
}));

jest.mock("@/hooks/features/insurance/use-insurance-url-sync", () => ({
  useInsuranceUrlSyncFull: () => null,
  __esModule: true,
}));

jest.mock("@/configs/insurance-navbar-config", () => ({
  getInsuranceNavbarConfig: () => ({ theme: "medical" }),
}));

const mockUseInsuranceStore = useInsuranceStore as jest.MockedFunction<
  typeof useInsuranceStore
>;

describe("Insurance Page Theme Integration", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    mockUseInsuranceStore.mockReturnValue({
      filteredProducts: [],
      searchQuery: "",
      sortOption: "name",
      viewMode: "grid",
      pagination: { page: 1, limit: 10 },
      totalProducts: 0,
      isLoading: false,
      setSearchQuery: jest.fn(),
      setSortOption: jest.fn(),
      setViewMode: jest.fn(),
      setFilters: jest.fn(),
      clearFilters: jest.fn(),
      setPagination: jest.fn(),
    } as any);
  });

  it("should render with ThemeProvider and healthcare user group", () => {
    const Wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>
        <ThemeProvider defaultUserGroup="healthcare">
          <NextIntlClientProvider locale="en" messages={{}}>
            {children}
          </NextIntlClientProvider>
        </ThemeProvider>
      </QueryClientProvider>
    );

    render(<InsurancePage />, { wrapper: Wrapper });

    // Verify the page structure
    expect(screen.getByTestId("header")).toBeInTheDocument();
    expect(screen.getByTestId("insurance-hero")).toBeInTheDocument();
    expect(screen.getByTestId("insurance-controls")).toBeInTheDocument();
    expect(screen.getByTestId("insurance-content")).toBeInTheDocument();
    expect(screen.getByTestId("footer")).toBeInTheDocument();
  });

  it("should have healthcare-specific theme classes applied", () => {
    const Wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>
        <ThemeProvider defaultUserGroup="healthcare">
          <NextIntlClientProvider locale="en" messages={{}}>
            {children}
          </NextIntlClientProvider>
        </ThemeProvider>
      </QueryClientProvider>
    );

    render(<InsurancePage />, { wrapper: Wrapper });

    // Check if the main container has theme classes
    const mainContainer = document.querySelector(".bg-background");
    expect(mainContainer).toBeInTheDocument();
  });
});
