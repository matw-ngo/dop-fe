"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  Loader2,
  Filter,
  Search,
  ArrowUpDown,
  AlertCircle,
} from "lucide-react";
import { SortOption } from "@/types/insurance";
import SortDropdown from "./SortDropdown";

interface ResultsHeaderProps {
  total: number;
  currentPage: number;
  itemsPerPage: number;
  loading?: boolean;
  hasFilters?: boolean;
  searchQuery?: string;
  sortOption: SortOption;
  onSortChange: (option: SortOption) => void;
  className?: string;
}

const ResultsHeader: React.FC<ResultsHeaderProps> = ({
  total,
  currentPage,
  itemsPerPage,
  loading = false,
  hasFilters = false,
  searchQuery,
  sortOption,
  onSortChange,
  className,
}) => {
  const t = useTranslations("pages.insurance");

  // Calculate current range
  const startItem = total === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, total);

  // Get message based on state
  const getMessage = () => {
    if (loading) {
      return t("loadingProducts");
    }

    if (total === 0) {
      if (searchQuery) {
        return t("noSearchResults");
      }
      return t("noProductsFound");
    }

    if (searchQuery && hasFilters) {
      return t("searchAndFilterResults", {
        query: searchQuery,
        count: total,
      });
    }

    if (searchQuery) {
      return t("searchResultsFor", { query: searchQuery });
    }

    if (hasFilters) {
      return t("filterResults", { count: total });
    }

    return `Tìm thấy ${total} sản phẩm bảo hiểm`;
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Main results header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {/* Results count and message */}
        <div className="flex-1 min-w-0">
          {loading ? (
            <div className="space-y-2">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-64" />
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold text-foreground">
                  {total > 0 ? (
                    <>
                      Hiển thị {startItem}-{endItem} của {total} kết quả
                    </>
                  ) : (
                    t("noProductsFound")
                  )}
                </h2>
                {hasFilters && !loading && total > 0 && (
                  <Badge variant="secondary" className="shrink-0">
                    <Filter className="h-3 w-3 mr-1" />
                    Đã lọc
                  </Badge>
                )}
              </div>

              {/* Status message */}
              <p className="text-sm text-muted-foreground mt-1">
                {getMessage()}
              </p>

              {/* Search query indicator */}
              {searchQuery && !loading && (
                <div className="flex items-center gap-1 mt-1">
                  <Search className="h-3 w-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">
                    Đang tìm kiếm: "{searchQuery}"
                  </span>
                </div>
              )}
            </>
          )}
        </div>

        {/* Sort dropdown */}
        <div className="shrink-0">
          <SortDropdown
            value={sortOption}
            onChange={onSortChange}
            variant="dropdown"
            size="sm"
            className="w-full sm:w-48"
          />
        </div>
      </div>

      {/* Loading state indicator */}
      {loading && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Đang tải...</span>
        </div>
      )}

      {/* Empty state with helpful message */}
      {!loading && total === 0 && (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
            <AlertCircle className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">
            {searchQuery ? "Không tìm thấy kết quả" : "Không tìm thấy sản phẩm nào"}
          </h3>
          <p className="text-muted-foreground mb-4 max-w-md">
            {searchQuery
              ? `Không tìm thấy sản phẩm nào phù hợp với tìm kiếm "${searchQuery}". Thử tìm kiếm với từ khóa khác.`
              : "Không tìm thấy sản phẩm nào phù hợp với bộ lọc. Thử điều chỉnh lại bộ lọc."}
          </p>
        </div>
      )}

      {/* Results summary when there are results */}
      {!loading && total > 0 && (
        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          {/* Filter indicator */}
          {hasFilters && (
            <div className="flex items-center gap-1">
              <Filter className="h-4 w-4" />
              <span>Đang áp dụng bộ lọc</span>
            </div>
          )}

          {/* Sort indicator */}
          <div className="flex items-center gap-1">
            <ArrowUpDown className="h-4 w-4" />
            <span>
              Đang sắp xếp theo:{" "}
              {(() => {
                const sortLabels = {
                  [SortOption.FEATURED]: "Nổi bật",
                  [SortOption.RATING_DESC]: "Đánh giá cao",
                  [SortOption.RATING_ASC]: "Đánh giá thấp",
                  [SortOption.PREMIUM_ASC]: "Phí thấp đến cao",
                  [SortOption.PREMIUM_DESC]: "Phí cao đến thấp",
                  [SortOption.COVERAGE_ASC]: "Mức bảo hiểm thấp",
                  [SortOption.COVERAGE_DESC]: "Mức bảo hiểm cao",
                  [SortOption.CLAIMS_APPROVED_DESC]: "Tỷ lệ duyệt bồi thường",
                  [SortOption.CLAIMS_TIME_ASC]: "Thời gian xử lý nhanh",
                  [SortOption.NEWEST]: "Mới nhất",
                  [SortOption.NAME_ASC]: "Tên A-Z",
                  [SortOption.NAME_DESC]: "Tên Z-A",
                };
                return sortLabels[sortOption] || "Mặc định";
              })()}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

ResultsHeader.displayName = "ResultsHeader";

export default ResultsHeader;