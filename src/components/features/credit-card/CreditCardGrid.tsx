"use client";

import React, { useMemo } from "react";
import { useTranslations } from "next-intl";
import CreditCard from "./CreditCard";
import { CreditCard as CreditCardType } from "@/types/credit-card";
import { cn } from "@/lib/utils";
import { DEFAULT_PAGE_SIZE } from "@/constants/credit-cards";

interface CreditCardGridProps {
  cards: CreditCardType[];
  loading?: boolean;
  viewMode?: "grid" | "list" | "compact";
  showCompareButton?: boolean;
  selectedCards?: string[];
  onCardClick?: (card: CreditCardType) => void;
  onCompare?: (cardId: string) => void;
  pageSize?: number;
  currentPage?: number;
  className?: string;
  emptyStateMessage?: string;
}

const CreditCardGrid: React.FC<CreditCardGridProps> = ({
  cards,
  loading = false,
  viewMode = "grid",
  showCompareButton = true,
  selectedCards = [],
  onCardClick,
  onCompare,
  pageSize = DEFAULT_PAGE_SIZE,
  currentPage = 1,
  className,
  emptyStateMessage,
}) => {
  const t = useTranslations("pages.creditCard");

  // Calculate paginated cards
  const paginatedCards = useMemo(() => {
    if (viewMode === "compact") {
      // In compact mode (comparison), don't paginate
      return cards;
    }

    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return cards.slice(startIndex, endIndex);
  }, [cards, currentPage, pageSize, viewMode]);

  // Get grid columns based on view mode (memoized for performance)
  const gridColsClass = useMemo(() => {
    switch (viewMode) {
      case "list":
        return "grid-cols-1";
      case "compact":
        return "grid-cols-1";
      case "grid":
      default:
        return "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4";
    }
  }, [viewMode]);

  // Loading skeleton
  if (loading) {
    return (
      <div className={cn("space-y-4", className)}>
        <div className={cn("grid gap-6", gridColsClass)}>
          {Array.from({ length: pageSize }, (_, i) => (
            <div
              key={i}
              className={cn(
                "animate-pulse",
                viewMode === "compact" && "p-4 border rounded-lg",
              )}
            >
              {viewMode === "compact" ? (
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-16 bg-muted rounded"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <div className="h-6 bg-muted rounded w-2/3"></div>
                      <div className="h-4 bg-muted rounded w-1/2"></div>
                      <div className="flex space-x-1">
                        <div className="h-4 w-4 bg-muted rounded"></div>
                        <div className="h-4 w-4 bg-muted rounded"></div>
                        <div className="h-4 w-4 bg-muted rounded"></div>
                        <div className="h-4 w-4 bg-muted rounded"></div>
                        <div className="h-4 w-4 bg-muted rounded"></div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-8 w-16 bg-muted rounded"></div>
                      <div className="h-8 w-8 bg-muted rounded"></div>
                    </div>
                  </div>
                  <div className="h-32 bg-muted rounded"></div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="h-10 bg-muted rounded"></div>
                    <div className="h-10 bg-muted rounded"></div>
                    <div className="h-10 bg-muted rounded"></div>
                    <div className="h-10 bg-muted rounded"></div>
                  </div>
                  <div className="h-10 bg-muted rounded w-full"></div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Empty state
  if (cards.length === 0) {
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center py-12",
          className,
        )}
      >
        <div className="text-center space-y-4 max-w-md">
          <div className="w-24 h-24 mx-auto bg-muted rounded-full flex items-center justify-center">
            <svg
              className="w-12 h-12 text-muted-foreground"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-foreground">
            {t("noCardsFound")}
          </h3>
          <p className="text-muted-foreground">
            {emptyStateMessage || t("tryAdjustingFilters")}
          </p>
        </div>
      </div>
    );
  }

  // Grid of cards
  return (
    <div className={cn("space-y-4", className)}>
      <div className={cn("grid gap-6", gridColsClass)}>
        {paginatedCards.map((card) => (
          <CreditCard
            key={card.id}
            card={card}
            viewMode={viewMode}
            showCompareButton={showCompareButton && viewMode !== "compact"}
            onCardClick={onCardClick}
            onCompare={onCompare}
            isSelected={selectedCards.includes(card.id)}
            isInComparison={selectedCards.includes(card.id)}
          />
        ))}
      </div>

      {/* Show results count for non-compact views */}
      {viewMode !== "compact" && (
        <div className="mt-6 text-sm text-muted-foreground text-center">
          {t("showingResults", {
            count: paginatedCards.length,
            total: cards.length,
          })}
        </div>
      )}
    </div>
  );
};

export default CreditCardGrid;
