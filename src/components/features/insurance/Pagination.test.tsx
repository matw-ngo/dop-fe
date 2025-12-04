import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import Pagination from "./Pagination";

const mockMessages = {
  pages: {
    insurance: {
      showingItems: "Hiển thị {start}-{end} của {total} kết quả",
      itemsPerPage: "Số mục mỗi trang",
      items: "sản phẩm",
      previous: "Trước",
      next: "Tiếp theo",
      pageOf: "Trang {current} của {total}",
      first: "Đầu",
      last: "Cuối",
      firstPage: "Trang đầu tiên",
      lastPage: "Trang cuối cùng",
      previousPage: "Trang trước",
      nextPage: "Trang tiếp theo",
      paginationNavigation: "Điều hướng phân trang",
    },
  },
};

const renderWithIntl = (component: React.ReactElement) => {
  return render(
    <NextIntlClientProvider locale="vi" messages={mockMessages}>
      {component}
    </NextIntlClientProvider>,
  );
};

describe("Pagination", () => {
  const defaultProps = {
    currentPage: 1,
    totalPages: 5,
    onPageChange: jest.fn(),
    itemsPerPage: 12,
    totalItems: 60,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders pagination controls correctly", () => {
    renderWithIntl(<Pagination {...defaultProps} />);

    expect(screen.getByText("Trang đầu tiên")).toBeInTheDocument();
    expect(screen.getByText("Trang trước")).toBeInTheDocument();
    expect(screen.getByText("Trang tiếp theo")).toBeInTheDocument();
    expect(screen.getByText("Trang cuối cùng")).toBeInTheDocument();
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText("4")).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument();
  });

  it("displays correct items info", () => {
    renderWithIntl(<Pagination {...defaultProps} />);

    expect(
      screen.getByText("Hiển thị 1-12 của 60 kết quả"),
    ).toBeInTheDocument();
    expect(screen.getByText("Trang 1 của 5")).toBeInTheDocument();
  });

  it("calls onPageChange when page is clicked", () => {
    const mockOnPageChange = jest.fn();
    renderWithIntl(
      <Pagination {...defaultProps} onPageChange={mockOnPageChange} />,
    );

    fireEvent.click(screen.getByText("3"));
    expect(mockOnPageChange).toHaveBeenCalledWith(3);
  });

  it("disables previous/first buttons on first page", () => {
    renderWithIntl(<Pagination {...defaultProps} currentPage={1} />);

    const firstButton = screen.getByLabelText("Trang đầu tiên");
    const prevButton = screen.getByLabelText("Trang trước");

    expect(firstButton).toBeDisabled();
    expect(prevButton).toBeDisabled();
  });

  it("disables next/last buttons on last page", () => {
    renderWithIntl(<Pagination {...defaultProps} currentPage={5} />);

    const lastButton = screen.getByLabelText("Trang cuối cùng");
    const nextButton = screen.getByLabelText("Trang tiếp theo");

    expect(lastButton).toBeDisabled();
    expect(nextButton).toBeDisabled();
  });

  it("shows ellipsis for many pages", () => {
    renderWithIntl(
      <Pagination {...defaultProps} currentPage={7} totalPages={20} />,
    );

    // Should show first page, ellipsis, pages around current, ellipsis, and last page
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("7")).toBeInTheDocument();
    expect(screen.getByText("20")).toBeInTheDocument();
  });

  it("shows items per page selector when enabled", () => {
    const mockOnItemsPerPageChange = jest.fn();
    renderWithIntl(
      <Pagination
        {...defaultProps}
        onItemsPerPageChange={mockOnItemsPerPageChange}
      />,
    );

    expect(screen.getByText("Số mục mỗi trang:")).toBeInTheDocument();
    expect(screen.getByDisplayValue("12")).toBeInTheDocument();
  });

  it("does not render when totalPages is 1", () => {
    const { container } = renderWithIntl(
      <Pagination {...defaultProps} totalPages={1} />,
    );

    expect(container.firstChild).toBeNull();
  });

  it("supports keyboard navigation", () => {
    const mockOnPageChange = jest.fn();
    const { container } = renderWithIntl(
      <Pagination {...defaultProps} onPageChange={mockOnPageChange} />,
    );

    // Focus on the pagination container
    container.focus();

    // Test arrow keys
    fireEvent.keyDown(container, { key: "ArrowRight" });
    expect(mockOnPageChange).toHaveBeenCalledWith(2);

    fireEvent.keyDown(container, { key: "ArrowLeft" });
    expect(mockOnPageChange).toHaveBeenCalledWith(1);

    fireEvent.keyDown(container, { key: "Home" });
    expect(mockOnPageChange).toHaveBeenCalledWith(1);

    fireEvent.keyDown(container, { key: "End" });
    expect(mockOnPageChange).toHaveBeenCalledWith(5);
  });
});
