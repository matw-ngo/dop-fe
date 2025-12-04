"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { ITEMS_PER_PAGE_OPTIONS } from "@/constants/insurance";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  itemsPerPage?: number;
  onItemsPerPageChange?: (itemsPerPage: number) => void;
  totalItems?: number;
  showItemsPerPageSelector?: boolean;
  className?: string;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  itemsPerPage = 12,
  onItemsPerPageChange,
  totalItems = 0,
  showItemsPerPageSelector = true,
  className,
}) => {
  const t = useTranslations("pages.insurance");

  // Validate props
  if (totalItems < 0) {
    console.warn("Pagination: totalItems must be a non-negative number");
  }
  if (currentPage < 1) {
    console.warn("Pagination: currentPage must be a positive number");
  }
  if (totalPages < 1) {
    console.warn("Pagination: totalPages must be a positive number");
  }

  // Don't render pagination if there's only one page
  if (totalPages <= 1) {
    return null;
  }

  // Calculate the range of items being displayed
  const validatedTotalItems = Math.max(0, totalItems);
  const startItem =
    validatedTotalItems > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0;
  const endItem = Math.min(currentPage * itemsPerPage, validatedTotalItems);

  // Generate page numbers to show (max 5 pages)
  const getVisiblePages = () => {
    const pages: number[] = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      // Show all pages if total pages is less than max visible
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      // Calculate range around current page
      const halfVisible = Math.floor(maxVisiblePages / 2);
      let start = Math.max(2, currentPage - halfVisible);
      let end = Math.min(totalPages - 1, currentPage + halfVisible);

      // Adjust if we're near the beginning
      if (currentPage <= halfVisible) {
        end = maxVisiblePages - 1;
      }

      // Adjust if we're near the end
      if (currentPage > totalPages - halfVisible) {
        start = totalPages - maxVisiblePages + 2;
      }

      // Add middle pages
      for (let i = start; i <= end; i++) {
        if (i > 1 && i < totalPages) {
          pages.push(i);
        }
      }

      // Always show last page
      if (totalPages > 1) {
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const visiblePages = getVisiblePages();

  // Handle page navigation
  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  const handleFirst = () => {
    if (currentPage > 1) {
      onPageChange(1);
    }
  };

  const handleLast = () => {
    if (currentPage < totalPages) {
      onPageChange(totalPages);
    }
  };

  const handlePageSelect = (page: number) => {
    if (page !== currentPage && page >= 1 && page <= totalPages) {
      onPageChange(page);
    }
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case "ArrowLeft":
        handlePrevious();
        break;
      case "ArrowRight":
        handleNext();
        break;
      case "Home":
        handleFirst();
        break;
      case "End":
        handleLast();
        break;
    }
  };

  return (
    <div className={cn("flex flex-col space-y-4", className)}>
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Items info */}
        {validatedTotalItems > 0 && (
          <p className="text-sm text-muted-foreground">
            {t("showingItems", {
              start: startItem,
              end: endItem,
              total: validatedTotalItems,
            })}
          </p>
        )}

        {/* Items per page selector */}
        {showItemsPerPageSelector && onItemsPerPageChange && (
          <div className="flex items-center space-x-2">
            <span className="text-sm text-muted-foreground">
              {t("itemsPerPage")}:
            </span>
            <Select
              value={itemsPerPage.toString()}
              onValueChange={(value) => onItemsPerPageChange(parseInt(value))}
            >
              <SelectTrigger className="w-20 h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ITEMS_PER_PAGE_OPTIONS.map((option) => (
                  <SelectItem
                    key={option.value}
                    value={option.value.toString()}
                  >
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {/* Page navigation */}
      <div className="flex items-center justify-center">
        <nav
          className="flex items-center space-x-1"
          role="navigation"
          aria-label={t("paginationNavigation")}
          onKeyDown={handleKeyDown}
          tabIndex={0}
        >
          {/* First page button */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleFirst}
            disabled={currentPage === 1}
            className="h-9 px-3"
            aria-label={t("firstPage")}
          >
            <span className="hidden sm:inline">{t("first")}</span>
            <ChevronLeft className="h-4 w-4 sm:ml-1 sm:mr-0" />
            <ChevronLeft className="h-4 w-4 -ml-3 sm:ml-0" />
          </Button>

          {/* Previous button */}
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrevious}
            disabled={currentPage === 1}
            className="h-9"
            aria-label={t("previousPage")}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          {/* Page numbers */}
          {visiblePages.map((page, index) => {
            // Check if we need to show ellipsis
            if (
              index > 0 &&
              visiblePages[index - 1] &&
              page - visiblePages[index - 1] > 1
            ) {
              return (
                <React.Fragment key={`ellipsis-${page}`}>
                  <div
                    className="flex items-center justify-center w-9 h-9 text-muted-foreground"
                    aria-hidden="true"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </div>
                  <Button
                    variant={page === currentPage ? "default" : "outline"}
                    size="sm"
                    onClick={() => handlePageSelect(page)}
                    className="h-9 w-9"
                    aria-current={page === currentPage ? "page" : undefined}
                  >
                    {page}
                  </Button>
                </React.Fragment>
              );
            }

            return (
              <Button
                key={page}
                variant={page === currentPage ? "default" : "outline"}
                size="sm"
                onClick={() => handlePageSelect(page)}
                className="h-9 w-9 transition-all duration-200"
                aria-current={page === currentPage ? "page" : undefined}
              >
                {page}
              </Button>
            );
          })}

          {/* Next button */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleNext}
            disabled={currentPage === totalPages}
            className="h-9"
            aria-label={t("nextPage")}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>

          {/* Last page button */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleLast}
            disabled={currentPage === totalPages}
            className="h-9 px-3"
            aria-label={t("lastPage")}
          >
            <ChevronRight className="h-4 w-4 sm:mr-1 sm:ml-0" />
            <ChevronRight className="h-4 w-4 -mr-3 sm:ml-0" />
            <span className="hidden sm:inline">{t("last")}</span>
          </Button>
        </nav>
      </div>

      {/* Mobile pagination info */}
      <div className="sm:hidden text-center">
        <p className="text-sm text-muted-foreground">
          {t("pageOf", { current: currentPage, total: totalPages })}
        </p>
      </div>

      {/* Desktop page info */}
      <div className="hidden sm:flex items-center justify-center text-sm text-muted-foreground">
        {t("pageOf", { current: currentPage, total: totalPages })}
      </div>
    </div>
  );
};

export default Pagination;
