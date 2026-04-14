"use client";

import { cn } from "@/lib/utils";
import {
  useMatchedProducts,
  useForwardStatus,
  useLoanSearchResult,
} from "@/store/use-loan-search-store";
import type { components } from "@/lib/api/v1/dop";
import { ProductListView } from "./LoanResult/views/ProductListView";
import { SuccessView } from "./LoanResult/views/SuccessView";
import { EmptyState } from "./LoanResult/views/EmptyState";

type MatchedProduct = components["schemas"]["matched_product"];
type ForwardResult = components["schemas"]["ForwardResult"];

interface LoanResultScreenProps {
  onSelectProduct?: (product: MatchedProduct) => void;
  onViewMore?: () => void;
  className?: string;
}

export function LoanResultScreen({
  onSelectProduct,
  onViewMore,
  className,
}: LoanResultScreenProps) {
  const matchedProducts = useMatchedProducts();
  const forwardStatus = useForwardStatus();
  const forwardResult = useLoanSearchResult<ForwardResult>();

  const isForwarded = forwardStatus === "forwarded";
  const isTerminalError =
    forwardStatus === "rejected" || forwardStatus === "exhausted";

  if (isForwarded && forwardResult) {
    return (
      <div
        className={cn(
          "flex min-h-[400px] items-center justify-center px-4 py-8",
          className,
        )}
      >
        <div className="w-full max-w-md">
          <SuccessView forwardResult={forwardResult} />
        </div>
      </div>
    );
  }

  if (matchedProducts.length === 0 || isTerminalError) {
    return (
      <div className={cn("px-4 py-8", className)}>
        <EmptyState />
      </div>
    );
  }

  return (
    <div className={cn("px-4 py-8", className)}>
      <ProductListView
        products={matchedProducts}
        onSelectProduct={onSelectProduct}
        onViewMore={onViewMore}
      />
    </div>
  );
}

export default LoanResultScreen;
