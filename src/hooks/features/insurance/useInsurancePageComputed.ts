import { useMemo } from "react";

/**
 * Custom hook to compute derived values for insurance page
 */
export function useInsurancePageComputed(
  filteredProducts: any[],
  pagination: { page: number },
  itemsPerPage: number,
  totalProducts: number,
) {
  const totalPages = useMemo(() => {
    return Math.ceil(totalProducts / itemsPerPage);
  }, [totalProducts, itemsPerPage]);

  const paginatedProducts = useMemo(() => {
    return filteredProducts.slice(
      (pagination.page - 1) * itemsPerPage,
      pagination.page * itemsPerPage,
    );
  }, [filteredProducts, pagination.page, itemsPerPage]);

  const hasProducts = paginatedProducts.length > 0;
  const hasMultiplePages = totalPages > 1;
  const canPaginate = totalProducts > itemsPerPage;

  return {
    totalPages,
    paginatedProducts,
    hasProducts,
    hasMultiplePages,
    canPaginate,
  };
}
