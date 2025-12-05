// Legacy exports
export { default as InsuranceProduct } from "./InsuranceProduct";
export { default as InsuranceSkeleton } from "./InsuranceSkeleton";
export { default as InsuranceFilterPanel } from "./InsuranceFilterPanel";
export { default as InsuranceGrid } from "./InsuranceGrid";
export { default as InsuranceQuotation } from "./InsuranceQuotation";
export { default as InsuranceSearchBar } from "./InsuranceSearchBar";
export { default as InsurancePagination } from "./InsurancePagination";
export { InsuranceDetails } from "./InsuranceDetails";
export { default as RelatedProducts } from "./RelatedProducts";
export type { SearchBarProps } from "./InsuranceSearchBar";

// Sub-components
export {
  CoverageItem,
  ServiceCard,
  PaymentMethodCard,
  ClaimMethodCard,
  ProductOverviewCard,
} from "./detail/components";

// Hooks
export { useInsuranceComparison } from "./detail/hooks/useInsuranceComparison";

// Utilities
export * from "./detail/utils";

// Constants
export * from "./detail/constants";

// Types
export * from "./detail/types";
