// Legacy exports

// Sub-components
export {
  ClaimMethodCard,
  CoverageItem,
  PaymentMethodCard,
  ProductOverviewCard,
  ServiceCard,
} from "./detail/components";
// Constants
export * from "./detail/constants";
// Hooks
export { useInsuranceComparison } from "./detail/hooks/useInsuranceComparison";
// Types
export * from "./detail/types";
// Utilities
export * from "./detail/utils";
export { InsuranceDetails } from "./InsuranceDetails";
export { default as InsuranceFilterPanel } from "./InsuranceFilterPanel";
export { default as InsuranceGrid } from "./InsuranceGrid";
export { default as InsurancePagination } from "./InsurancePagination";
export { default as InsuranceProduct } from "./InsuranceProduct";
export { default as InsuranceQuotation } from "./InsuranceQuotation";
export type { InsuranceSearchBarProps as SearchBarProps } from "./InsuranceSearchBar";
export { default as InsuranceSearchBar } from "./InsuranceSearchBar";
export { default as InsuranceSkeleton } from "./InsuranceSkeleton";
export { default as RelatedProducts } from "./RelatedProducts";
