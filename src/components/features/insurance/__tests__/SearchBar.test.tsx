import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { IntlProvider } from "next-intl";
import SearchBar from "../SearchBar";

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: jest.fn((key) => store[key] || null),
    setItem: jest.fn((key, value) => {
      store[key] = value.toString();
    }),
    removeItem: jest.fn((key) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
});

// Mock window.gtag for analytics
Object.defineProperty(window, "gtag", {
  value: jest.fn(),
  writable: true,
});

const renderWithIntl = (component: React.ReactElement) => {
  return render(
    <IntlProvider locale="vi" messages={{}}>
      {component}
    </IntlProvider>,
  );
};

describe("InsuranceSearchBar", () => {
  beforeEach(() => {
    localStorageMock.clear();
    jest.clearAllMocks();
  });

  it("renders search input with placeholder", () => {
    renderWithIntl(<SearchBar onSearch={jest.fn()} />);

    const input = screen.getByPlaceholderText("Tìm kiếm sản phẩm bảo hiểm...");
    expect(input).toBeInTheDocument();
  });

  it("calls onSearch when Enter is pressed", async () => {
    const mockOnSearch = jest.fn();
    renderWithIntl(<SearchBar onSearch={mockOnSearch} />);

    const input = screen.getByPlaceholderText("Tìm kiếm sản phẩm bảo hiểm...");

    fireEvent.change(input, { target: { value: "Bảo hiểm TNDS" } });
    fireEvent.keyDown(input, { key: "Enter" });

    await waitFor(() => {
      expect(mockOnSearch).toHaveBeenCalledWith("Bảo hiểm TNDS");
    });
  });

  it("saves search to localStorage", async () => {
    const mockOnSearch = jest.fn();
    renderWithIntl(<SearchBar onSearch={mockOnSearch} />);

    const input = screen.getByPlaceholderText("Tìm kiếm sản phẩm bảo hiểm...");

    fireEvent.change(input, { target: { value: "Bảo hiểm sức khỏe" } });
    fireEvent.keyDown(input, { key: "Enter" });

    await waitFor(() => {
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        "insurance-recent-searches",
        expect.any(String),
      );
    });
  });

  it("tracks analytics event on search", async () => {
    const mockOnSearch = jest.fn();
    renderWithIntl(<SearchBar onSearch={mockOnSearch} />);

    const input = screen.getByPlaceholderText("Tìm kiếm sản phẩm bảo hiểm...");

    fireEvent.change(input, { target: { value: "Bảo hiểm du lịch" } });
    fireEvent.keyDown(input, { key: "Enter" });

    await waitFor(() => {
      expect(window.gtag).toHaveBeenCalledWith(
        "event",
        "insurance_search_query",
        expect.objectContaining({
          search_term: "Bảo hiểm du lịch",
        }),
      );
    });
  });

  it("shows clear button when has value", () => {
    renderWithIntl(<SearchBar value="test value" onChange={jest.fn()} />);

    const clearButton = screen.getByRole("button", { name: "×" });
    expect(clearButton).toBeInTheDocument();
  });

  it("clears input when clear button is clicked", () => {
    const mockOnChange = jest.fn();
    renderWithIntl(<SearchBar value="test value" onChange={mockOnChange} />);

    const clearButton = screen.getByRole("button", { name: "×" });
    fireEvent.click(clearButton);

    expect(mockOnChange).toHaveBeenCalledWith("");
  });

  it("loads recent searches from localStorage", () => {
    localStorageMock.setItem(
      "insurance-recent-searches",
      '["Search 1","Search 2"]',
    );

    renderWithIntl(<SearchBar onSearch={jest.fn()} />);

    const input = screen.getByPlaceholderText("Tìm kiếm sản phẩm bảo hiểm...");
    fireEvent.click(input);

    // Should show recent searches in dropdown
    expect(screen.getByText("Tìm kiếm gần đây")).toBeInTheDocument();
  });
});
