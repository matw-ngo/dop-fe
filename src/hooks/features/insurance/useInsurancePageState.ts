import { useState } from "react";
import { DEFAULT_PAGE_SIZE } from "@/constants/insurance";
import type { InsuranceFilters } from "@/types/insurance";

export interface UseInsurancePageStateReturn {
  mobileFiltersOpen: boolean;
  setMobileFiltersOpen: (open: boolean) => void;
  itemsPerPage: number;
  setItemsPerPage: (items: number) => void;
  filtersState: Partial<InsuranceFilters>;
  setFiltersState: (filters: Partial<InsuranceFilters>) => void;
}

/**
 * Custom hook to manage insurance page state
 */
export function useInsurancePageState(): UseInsurancePageStateReturn {
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [itemsPerPage, setItemsPerPage] = useState(DEFAULT_PAGE_SIZE);
  const [filtersState, setFiltersState] = useState<Partial<InsuranceFilters>>(
    {},
  );

  return {
    mobileFiltersOpen,
    setMobileFiltersOpen,
    itemsPerPage,
    setItemsPerPage,
    filtersState,
    setFiltersState,
  };
}
