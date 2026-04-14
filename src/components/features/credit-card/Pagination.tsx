"use client";

import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import { useTranslations } from "next-intl";
import React from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ITEMS_PER_PAGE_OPTIONS } from "@/constants/credit-cards";
import { cn } from "@/lib/utils";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange?: (itemsPerPage: number) => void;
  showItemsPerPageSelector?: boolean;
  showPageNumbers?: boolean;
  maxVisiblePages?: number;
  className?: string;
  variant?: "default" | "compact" | "minimal";
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
  showItemsPerPageSelector = true,
  showPageNumbers = true,
  maxVisiblePages = 5,
  className,
  variant = "default",
}) => {
  const t = useTranslations("features.credit-cards.listing");

  // Calculate the range of items being displayed
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  // Generate page numbers to show
  const getVisiblePages = () => {
    const pages: number[] = [];
    const halfVisible = Math.floor(maxVisiblePages / 2);

    if (totalPages <= maxVisiblePages) {
      // Show all pages if total pages is less than max visible
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      // Calculate range around current page
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

  const handlePageSelect = (page: number) => {
    if (page !== currentPage && page >= 1 && page <= totalPages) {
      onPageChange(page);
    }
  };

  // Compact variant
  if (variant === "compact") {
    return (
      <div className={cn("flex items-center justify-between", className)}>
        <p className="text-sm text-muted-foreground">
          {t("showingItems", {
            start: startItem,
            end: endItem,
            total: totalItems,
          })}
        </p>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrevious}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm">
            {t("pageOf", { current: currentPage, total: totalPages })}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={handleNext}
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  // Minimal variant
  if (variant === "minimal") {
    return (
      <div className={cn("flex items-center justify-between", className)}>
        <p className="text-sm text-muted-foreground">
          {totalItems} {t("items")}
        </p>
        <div className="flex items-center space-x-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={handlePrevious}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm px-2">
            {currentPage} / {totalPages}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleNext}
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  // Default variant
  return (
    <div className={cn("flex flex-col space-y-4", className)}>
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Items info */}
        <p className="text-sm text-muted-foreground">
          {t("showingItems", {
            start: startItem,
            end: endItem,
            total: totalItems,
          })}
        </p>

        {/* Items per page selector */}
        {showItemsPerPageSelector && onItemsPerPageChange && (
          <div className="flex items-center space-x-2">
            <span className="text-sm text-muted-foreground">
              {t("itemsPerPage")}:
            </span>
            <Select
              value={itemsPerPage.toString()}
              onValueChange={(value) =>
                onItemsPerPageChange(parseInt(value, 10))
              }
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
        <nav className="flex items-center space-x-1">
          {/* Previous button */}
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrevious}
            disabled={currentPage === 1}
            className="h-9"
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">{t("previous")}</span>
          </Button>

          {/* Page numbers */}
          {showPageNumbers &&
            visiblePages.length > 0 &&
            visiblePages.map((page, index) => {
              // Check if we need to show ellipsis
              if (
                index > 0 &&
                visiblePages[index - 1] &&
                page - visiblePages[index - 1] > 1
              ) {
                return (
                  <React.Fragment key={`ellipsis-${page}`}>
                    <div className="flex items-center justify-center w-9 h-9">
                      <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <Button
                      variant={page === currentPage ? "default" : "outline"}
                      size="sm"
                      onClick={() => handlePageSelect(page)}
                      className="h-9 w-9"
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
                  className="h-9 w-9"
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
          >
            <span className="sr-only">{t("next")}</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </nav>
      </div>

      {/* Mobile pagination info */}
      <div className="sm:hidden text-center">
        <p className="text-sm text-muted-foreground">
          {t("pageOf", { current: currentPage, total: totalPages })}
        </p>
      </div>
    </div>
  );
};

export default Pagination;
