import React, { useState } from "react";
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

const PaginationExample: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);
  const totalItems = 127;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const handlePageChange = (page: number) => {
    console.log(`Changed to page: ${page}`);
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    console.log(`Changed items per page to: ${newItemsPerPage}`);
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  return (
    <NextIntlClientProvider locale="vi" messages={mockMessages}>
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <h1 className="text-2xl font-bold">Pagination Component Examples</h1>

        {/* Basic Pagination */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Basic Pagination</h2>
          <div className="border rounded-lg p-4">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              totalItems={totalItems}
              itemsPerPage={itemsPerPage}
            />
          </div>
        </div>

        {/* Pagination with Items Per Page Selector */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">
            With Items Per Page Selector
          </h2>
          <div className="border rounded-lg p-4">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              itemsPerPage={itemsPerPage}
              onItemsPerPageChange={handleItemsPerPageChange}
              totalItems={totalItems}
              showItemsPerPageSelector
            />
          </div>
        </div>

        {/* Pagination on First Page */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">On First Page</h2>
          <div className="border rounded-lg p-4">
            <Pagination
              currentPage={1}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              totalItems={totalItems}
              itemsPerPage={itemsPerPage}
            />
          </div>
        </div>

        {/* Pagination on Last Page */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">On Last Page</h2>
          <div className="border rounded-lg p-4">
            <Pagination
              currentPage={totalPages}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              totalItems={totalItems}
              itemsPerPage={itemsPerPage}
            />
          </div>
        </div>

        {/* Pagination with Many Pages */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">
            With Many Pages (showing ellipsis)
          </h2>
          <div className="border rounded-lg p-4">
            <Pagination
              currentPage={15}
              totalPages={50}
              onPageChange={handlePageChange}
              totalItems={600}
              itemsPerPage={12}
            />
          </div>
        </div>

        {/* Single Page (should not render) */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Single Page (Hidden)</h2>
          <div className="border rounded-lg p-4 bg-gray-50">
            <p className="text-sm text-gray-600 mb-2">
              Pagination should not appear when there's only one page:
            </p>
            <Pagination
              currentPage={1}
              totalPages={1}
              onPageChange={handlePageChange}
              totalItems={5}
              itemsPerPage={10}
            />
          </div>
        </div>

        {/* Without Items Per Page Selector */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">
            Without Items Per Page Selector
          </h2>
          <div className="border rounded-lg p-4">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              totalItems={totalItems}
              itemsPerPage={itemsPerPage}
              showItemsPerPageSelector={false}
            />
          </div>
        </div>

        {/* Custom Styling */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">With Custom Styling</h2>
          <div className="border rounded-lg p-4 bg-gradient-to-r from-blue-50 to-indigo-50">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              totalItems={totalItems}
              itemsPerPage={itemsPerPage}
              className="bg-white bg-opacity-50 rounded-lg p-4"
            />
          </div>
        </div>

        {/* Keyboard Navigation Info */}
        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-semibold mb-2">Keyboard Navigation:</h3>
          <ul className="text-sm space-y-1 text-gray-700">
            <li>
              <kbd>←</kbd> - Go to previous page
            </li>
            <li>
              <kbd>→</kbd> - Go to next page
            </li>
            <li>
              <kbd>Home</kbd> - Go to first page
            </li>
            <li>
              <kbd>End</kbd> - Go to last page
            </li>
          </ul>
        </div>
      </div>
    </NextIntlClientProvider>
  );
};

export default PaginationExample;
