import { X } from "lucide-react";
import { useTranslations } from "next-intl";
import type React from "react";
import { useCallback, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { DEFAULT_FILTERS } from "@/constants/credit-cards";
import { vietnameseCreditCards } from "@/data/credit-cards";
import { cn } from "@/lib/utils";
import type {
  CreditCard,
  CreditCardFilters,
  SortOption,
} from "@/types/credit-card";
import CreditCardGrid from "../credit-card/CreditCardGrid";
import CreditCardFilterPanel from "./CreditCardFilterPanel";
import CreditCardPageControls from "./CreditCardPageControls";
import CreditCardPagination from "./CreditCardPagination";
import CreditCardResultsHeader from "./CreditCardResultsHeader";
import CreditCardComparisonSnackbar from "./compare/CreditCardComparisonSnackbar";

export type ViewMode = "grid" | "list" | "compact";

interface CreditCardPageContentProps {
  className?: string;
  initialFilters?: Partial<CreditCardFilters>;
  initialSearch?: string;
  initialSort?: SortOption;
  initialViewMode?: ViewMode;
  itemsPerPage?: number;
  showBreadcrumb?: boolean;
  breadcrumbItems?: Array<{
    label: string;
    href?: string;
  }>;
  onFilterChange?: (filters: CreditCardFilters) => void;
  onSearchChange?: (query: string) => void;
  onSortChange?: (sort: SortOption) => void;
  onViewModeChange?: (mode: ViewMode) => void;
  onCardClick?: (card: CreditCard) => void;
}

export const CreditCardPageContent: React.FC<CreditCardPageContentProps> = ({
  className,
  initialFilters,
  initialSearch = "",
  initialSort = "featured" as SortOption,
  initialViewMode = "grid",
  itemsPerPage = 12,
  showBreadcrumb = true,
  breadcrumbItems,
  onFilterChange,
  onSearchChange,
  onSortChange,
  onViewModeChange,
  onCardClick,
}) => {
  const t = useTranslations("features.credit-cards.listing");

  // State management
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [filters, setFilters] = useState<CreditCardFilters>(
    initialFilters
      ? { ...DEFAULT_FILTERS, ...initialFilters }
      : DEFAULT_FILTERS,
  );
  const [sortOption, setSortOption] = useState(initialSort);
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<ViewMode>(initialViewMode);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Filter and sort cards based on current filters and search
  const filteredCards = useMemo(() => {
    return vietnameseCreditCards.filter((card) => {
      // Search filter
      if (searchQuery) {
        const searchLower = searchQuery.toLowerCase();
        const cardText =
          `${card.name} ${card.issuer} ${card.cardType} ${card.features.join(" ")} ${card.benefits.join(" ")}`.toLowerCase();
        if (!cardText.includes(searchLower)) {
          return false;
        }
      }

      // Category filter
      if (
        filters.categories.length > 0 &&
        !filters.categories.includes(card.category as any)
      ) {
        return false;
      }

      // Network filter
      if (
        filters.networks.length > 0 &&
        !filters.networks.includes(card.cardType as any)
      ) {
        return false;
      }

      // Annual fee filter
      if (
        card.annualFee > filters.annualFeeRange.max ||
        card.annualFee < filters.annualFeeRange.min
      ) {
        return false;
      }

      // Credit limit filter
      if (
        card.creditLimitMax < filters.creditLimitRange.min ||
        card.creditLimitMin > filters.creditLimitRange.max
      ) {
        return false;
      }

      // Income requirement filter
      if (
        filters.incomeRange.min > 0 &&
        card.incomeRequiredMin < filters.incomeRange.min
      ) {
        return false;
      }

      // Age filter
      if (
        filters.ageRange.min > card.ageRequiredMin ||
        (card.ageRequiredMax && filters.ageRange.max < card.ageRequiredMax)
      ) {
        return false;
      }

      // Special filters
      if (filters.isNew && !card.isNew) return false;
      if (filters.isRecommended && !card.isRecommended) return false;
      if (filters.isExclusive && !card.isExclusive) return false;

      // Rating filter
      if (filters.minRating > 0 && card.rating < filters.minRating)
        return false;

      // Has welcome offer filter
      if (filters.hasWelcomeOffer && !card.welcomeOffer) return false;

      // Has insurance filter
      if (filters.hasInsurance && !card.insurance) return false;

      // Has installment plans filter
      if (
        filters.hasInstallmentPlans &&
        (!card.installmentPlans || card.installmentPlans.length === 0)
      )
        return false;

      return true;
    });
  }, [searchQuery, filters]);

  // Sort cards
  const sortedCards = useMemo(() => {
    const cards = [...filteredCards];

    switch (sortOption) {
      case "featured":
        return cards.sort((a, b) => {
          if (a.isRecommended !== b.isRecommended)
            return b.isRecommended ? 1 : -1;
          return b.rating - a.rating;
        });

      case "rating-desc":
        return cards.sort((a, b) => b.rating - a.rating);

      case "rating-asc":
        return cards.sort((a, b) => a.rating - b.rating);

      case "fee-asc":
        return cards.sort((a, b) => a.annualFee - b.annualFee);

      case "fee-desc":
        return cards.sort((a, b) => b.annualFee - a.annualFee);

      case "rate-asc":
        return cards.sort((a, b) => a.interestRate - b.interestRate);

      case "rate-desc":
        return cards.sort((a, b) => b.interestRate - a.interestRate);

      case "limit-desc":
        return cards.sort((a, b) => b.creditLimitMax - a.creditLimitMax);

      case "limit-asc":
        return cards.sort((a, b) => a.creditLimitMin - b.creditLimitMin);

      case "income-asc":
        return cards.sort((a, b) => a.incomeRequiredMin - b.incomeRequiredMin);

      case "income-desc":
        return cards.sort((a, b) => b.incomeRequiredMin - a.incomeRequiredMin);

      case "rewards-desc":
        return cards.sort((a, b) => {
          const aRate = a.rewardsProgram?.earnRate || 0;
          const bRate = b.rewardsProgram?.earnRate || 0;
          return bRate - aRate;
        });

      case "bonus-desc":
        return cards.sort((a, b) => {
          if (!a.welcomeOffer && !b.welcomeOffer) return 0;
          if (!a.welcomeOffer) return 1;
          if (!b.welcomeOffer) return -1;
          return b.welcomeOffer.localeCompare(a.welcomeOffer);
        });

      case "reviews-desc":
        return cards.sort((a, b) => b.reviewCount - a.reviewCount);

      case "newest":
        return cards.sort((a, b) => {
          if (a.isNew !== b.isNew) return b.isNew ? 1 : -1;
          return (
            new Date(b.publishedAt).getTime() -
            new Date(a.publishedAt).getTime()
          );
        });

      case "name-asc":
        return cards.sort((a, b) => a.name.localeCompare(b.name, "vi"));

      case "name-desc":
        return cards.sort((a, b) => b.name.localeCompare(a.name, "vi"));

      default:
        return cards;
    }
  }, [filteredCards, sortOption]);

  // Pagination
  const totalResults = sortedCards.length;
  const totalPages = Math.ceil(totalResults / itemsPerPage);
  const paginatedCards = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return sortedCards.slice(start, start + itemsPerPage);
  }, [sortedCards, currentPage, itemsPerPage]);

  // Event handlers
  const handleFilterChange = useCallback(
    (newFilters: Partial<CreditCardFilters>) => {
      setIsLoading(true);
      const updatedFilters = { ...filters, ...newFilters };
      setFilters(updatedFilters);
      onFilterChange?.(updatedFilters);
      setCurrentPage(1);

      // Simulate loading
      setTimeout(() => setIsLoading(false), 300);
    },
    [filters, onFilterChange],
  );

  const handleClearFilter = useCallback(
    (filterType: string, value?: string) => {
      const newFilters = { ...filters };

      // Handle array filters with proper type casting
      if (
        filterType === "categories" ||
        filterType === "networks" ||
        filterType === "issuers" ||
        filterType === "annualFeeType" ||
        filterType === "rewardsTypes" ||
        filterType === "provinces" ||
        filterType === "employmentTypes" ||
        filterType === "digitalFeatures"
      ) {
        // These are all array types
        (newFilters as any)[filterType] = (newFilters as any)[
          filterType
        ]?.filter((v: any) => v !== value);
      } else {
        // Reset filter to default
        switch (filterType) {
          case "annualFeeRange":
          case "incomeRange":
          case "creditLimitRange":
          case "ageRange":
            newFilters[filterType] = DEFAULT_FILTERS[filterType];
            break;
          default:
            (newFilters as any)[filterType] =
              DEFAULT_FILTERS[filterType as keyof CreditCardFilters];
        }
      }

      setFilters(newFilters);
      setCurrentPage(1);
    },
    [filters],
  );

  const handleClearAllFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
    setCurrentPage(1);
  }, []);

  const handleSearch = useCallback(
    (query: string) => {
      setIsLoading(true);
      setSearchQuery(query);
      onSearchChange?.(query);
      setCurrentPage(1);

      // Simulate loading
      setTimeout(() => setIsLoading(false), 300);
    },
    [onSearchChange],
  );

  const handleSort = useCallback(
    (sort: SortOption) => {
      setIsLoading(true);
      setSortOption(sort);
      onSortChange?.(sort);

      // Simulate loading
      setTimeout(() => setIsLoading(false), 300);
    },
    [onSortChange],
  );

  const handleViewModeChange = useCallback(
    (mode: ViewMode) => {
      setViewMode(mode);
      onViewModeChange?.(mode);
    },
    [onViewModeChange],
  );

  const handleItemsPerPageChange = useCallback((_newItemsPerPage: number) => {
    setCurrentPage(1);
    // Note: In a real app, you'd update the itemsPerPage state here
  }, []);

  const handleCardClick = useCallback(
    (card: CreditCard) => {
      onCardClick?.(card);
    },
    [onCardClick],
  );

  return (
    <div className={cn("w-full", className)}>
      {/* Page Controls */}
      <div className="mb-6">
        <CreditCardPageControls
          filters={filters}
          onFiltersChange={handleFilterChange}
          sortOption={sortOption}
          onSortChange={handleSort}
          totalResults={totalResults}
          viewMode={viewMode}
          onViewModeChange={handleViewModeChange}
          searchQuery={searchQuery}
          onSearchChange={handleSearch}
          onMobileFiltersToggle={() => setMobileFiltersOpen(true)}
        />
      </div>

      <div className="flex gap-6">
        {/* Filters Sidebar - Desktop */}
        <div className="hidden lg:block w-80 flex-shrink-0">
          <CreditCardFilterPanel
            filters={filters}
            onFiltersChange={handleFilterChange}
            onClearFilters={handleClearAllFilters}
          />
        </div>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {/* Results Header */}
          <CreditCardResultsHeader
            totalResults={totalResults}
            currentPage={currentPage}
            itemsPerPage={itemsPerPage}
            viewMode={viewMode}
            onViewModeChange={handleViewModeChange}
            filters={filters}
            onClearFilter={handleClearFilter}
            onClearAllFilters={handleClearAllFilters}
            onShowFilters={() => setMobileFiltersOpen(true)}
            onItemsPerPageChange={handleItemsPerPageChange}
            showBreadcrumb={showBreadcrumb}
            breadcrumbItems={breadcrumbItems}
            className="mb-6"
          />

          {/* Cards Grid */}
          {paginatedCards.length > 0 ? (
            <CreditCardGrid
              cards={paginatedCards}
              loading={isLoading}
              viewMode={viewMode}
              onCardClick={handleCardClick}
              currentPage={currentPage}
              pageSize={itemsPerPage}
            />
          ) : (
            <div className="text-center py-12">
              <div className="max-w-md mx-auto">
                <div className="w-24 h-24 mx-auto bg-muted rounded-full flex items-center justify-center mb-4">
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
                <h3 className="text-lg font-semibold mb-2">
                  {t("results.noResultsTitle")}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {t("results.noResultsDescription")}
                </p>
                <Button onClick={handleClearAllFilters} variant="outline">
                  {t("results.clearAllFilters")}
                </Button>
              </div>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <CreditCardPagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              itemsPerPage={itemsPerPage}
              totalItems={totalResults}
              className="mt-8"
            />
          )}
        </div>
      </div>

      {/* Mobile Filters Sheet */}
      <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
        <SheetContent side="left" className="w-full sm:w-80 overflow-y-auto">
          <SheetHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <SheetTitle>{t("filters.title")}</SheetTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMobileFiltersOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </SheetHeader>
          <CreditCardFilterPanel
            filters={filters}
            onFiltersChange={handleFilterChange}
            onClearFilters={handleClearAllFilters}
          />
        </SheetContent>
      </Sheet>

      {/* Comparison Snackbar */}
      <CreditCardComparisonSnackbar />
    </div>
  );
};

export default CreditCardPageContent;
