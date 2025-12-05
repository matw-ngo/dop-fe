import { useCallback } from "react";
import type { InsuranceFilters, SortOption } from "@/types/insurance";
import type { UseInsurancePageStateReturn } from "./useInsurancePageState";

/**
 * Custom hook to handle insurance page events
 */
export function useInsurancePageHandlers(
  {
    setSearchQuery,
    setSortOption,
    setFilters,
    clearFilters,
    setPagination,
    setItemsPerPage,
  }: {
    setSearchQuery: (query: string) => void;
    setSortOption: (sort: SortOption) => void;
    setFilters: (filters: Partial<InsuranceFilters>) => void;
    clearFilters: () => void;
    setPagination: (pagination: { page: number }) => void;
    setItemsPerPage: (itemsPerPage: number) => void;
  },
  {
    setFiltersState,
    itemsPerPage,
  }: Pick<UseInsurancePageStateReturn, "setFiltersState" | "itemsPerPage">,
) {
  const handleSearch = useCallback(
    (query: string) => {
      setSearchQuery(query);
      setPagination({ page: 1 });
    },
    [setSearchQuery, setPagination],
  );

  const handleSortChange = useCallback(
    (sort: SortOption) => {
      setSortOption(sort);
      setPagination({ page: 1 });
    },
    [setSortOption, setPagination],
  );

  const handleFiltersChange = useCallback(
    (newFilters: Partial<InsuranceFilters>) => {
      setFilters(newFilters);
      setFiltersState(newFilters);
      setPagination({ page: 1 });
    },
    [setFilters, setFiltersState, setPagination],
  );

  const handleClearFilters = useCallback(() => {
    clearFilters();
    setFiltersState({});
    setPagination({ page: 1 });
  }, [clearFilters, setFiltersState, setPagination]);

  const handlePageChange = useCallback(
    (page: number) => {
      setPagination({ page });
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [setPagination],
  );

  const handleItemsPerPageChange = useCallback(
    (newItemsPerPage: number) => {
      setItemsPerPage(newItemsPerPage);
      setPagination({ page: 1 });
    },
    [setItemsPerPage, setPagination],
  );

  const handleViewModeChange = useCallback(
    (mode: "grid" | "list" | "compact") => {
      // TODO: Implement view mode change when available
      console.log("View mode change:", mode);
    },
    [],
  );

  const handleCompareToggle = useCallback((productId: string) => {
    // TODO: Implement comparison functionality
    console.log("Toggle compare for product:", productId);
  }, []);

  return {
    handleSearch,
    handleSortChange,
    handleFiltersChange,
    handleClearFilters,
    handlePageChange,
    handleItemsPerPageChange,
    handleViewModeChange,
    handleCompareToggle,
  };
}
