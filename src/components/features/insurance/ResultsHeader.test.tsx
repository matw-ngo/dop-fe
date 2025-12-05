import React from "react";
import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import ResultsHeader from "./ResultsHeader";
import { SortOption } from "@/types/insurance";

// Mock translations
const messages = {
  "pages.insurance": {
    noProductsFound: "Không tìm thấy sản phẩm bảo hiểm nào",
    loadingProducts: "Đang tải sản phẩm bảo hiểm...",
    noSearchResults: "Không tìm thấy sản phẩm nào khớp với tìm kiếm của bạn",
    searchAndFilterResults: "Tìm thấy {count} sản phẩm cho '{query}' với bộ lọc",
    searchResultsFor: "Kết quả tìm kiếm cho '{query}'",
    filterResults: "Tìm thấy {count} sản phẩm với bộ lọc",
  },
};

const renderWithTranslations = (component: React.ReactElement) => {
  return render(
    <NextIntlClientProvider messages={messages} locale="vi">
      {component}
    </NextIntlClientProvider>
  );
};

describe("ResultsHeader", () => {
  const defaultProps = {
    total: 48,
    currentPage: 1,
    itemsPerPage: 12,
    sortOption: SortOption.FEATURED,
    onSortChange: jest.fn(),
  };

  it("renders results count correctly", () => {
    renderWithTranslations(<ResultsHeader {...defaultProps} />);

    expect(screen.getByText("Hiển thị 1-12 của 48 kết quả")).toBeInTheDocument();
    expect(screen.getByText("Tìm thấy 48 sản phẩm bảo hiểm")).toBeInTheDocument();
  });

  it("shows loading state", () => {
    renderWithTranslations(<ResultsHeader {...defaultProps} loading={true} />);

    expect(screen.getByText("Đang tải sản phẩm bảo hiểm...")).toBeInTheDocument();
    expect(screen.getByText("Đang tải...")).toBeInTheDocument();
  });

  it("shows filter badge when filters are applied", () => {
    renderWithTranslations(<ResultsHeader {...defaultProps} hasFilters={true} />);

    expect(screen.getByText("Đã lọc")).toBeInTheDocument();
    expect(screen.getByText("Đang áp dụng bộ lọc")).toBeInTheDocument();
    expect(screen.getByText("Tìm thấy 48 sản phẩm với bộ lọc")).toBeInTheDocument();
  });

  it("shows search query indicator", () => {
    renderWithTranslations(
      <ResultsHeader {...defaultProps} searchQuery="bảo hiểm xe" />
    );

    expect(screen.getByText('Đang tìm kiếm: "bảo hiểm xe"')).toBeInTheDocument();
    expect(screen.getByText("Kết quả tìm kiếm cho 'bảo hiểm xe'")).toBeInTheDocument();
  });

  it("shows empty state when no results", () => {
    renderWithTranslations(<ResultsHeader {...defaultProps} total={0} />);

    expect(screen.getByText("Không tìm thấy sản phẩm nào")).toBeInTheDocument();
    expect(screen.getByText("Không tìm thấy sản phẩm nào")).toBeInTheDocument();
  });

  it("shows search + filter combined message", () => {
    renderWithTranslations(
      <ResultsHeader
        {...defaultProps}
        searchQuery="bảo hiểm sức khỏe"
        hasFilters={true}
      />
    );

    expect(screen.getByText('Đang tìm kiếm: "bảo hiểm sức khỏe"')).toBeInTheDocument();
    expect(screen.getByText("Tìm thấy 48 sản phẩm cho 'bảo hiểm sức khỏe' với bộ lọc")).toBeInTheDocument();
  });

  it("shows empty search state", () => {
    renderWithTranslations(
      <ResultsHeader
        {...defaultProps}
        total={0}
        searchQuery="not found"
      />
    );

    expect(screen.getByText("Không tìm thấy kết quả")).toBeInTheDocument();
    expect(screen.getByText("Không tìm thấy sản phẩm nào phù hợp với tìm kiếm \"not found\". Thử tìm kiếm với từ khóa khác.")).toBeInTheDocument();
  });

  it("displays current sort option", () => {
    renderWithTranslations(
      <ResultsHeader {...defaultProps} sortOption={SortOption.PREMIUM_ASC} />
    );

    expect(screen.getByText("Đang sắp xếp theo: Phí thấp đến cao")).toBeInTheDocument();
  });

  it("handles pagination correctly", () => {
    renderWithTranslations(
      <ResultsHeader
        {...defaultProps}
        currentPage={2}
        total={48}
      />
    );

    expect(screen.getByText("Hiển thị 13-24 của 48 kết quả")).toBeInTheDocument();
  });
});