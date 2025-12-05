import { useState } from "react";

export interface UseCreditCardsPageStateReturn {
  mobileFiltersOpen: boolean;
  setMobileFiltersOpen: (open: boolean) => void;
}

/**
 * Custom hook to manage credit cards page UI state
 */
export function useCreditCardsPageState(): UseCreditCardsPageStateReturn {
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  return {
    mobileFiltersOpen,
    setMobileFiltersOpen,
  };
}
