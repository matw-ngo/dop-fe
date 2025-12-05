import { useCallback } from "react";
import { toast } from "sonner";
import {
  useInsuranceStore,
  useInsuranceComparison as useInsuranceComparisonStore,
  useInsuranceActions,
} from "@/store/use-insurance-store";

export function useInsuranceComparison(productId: string, t: (key: string) => string) {
  const { isInComparison } = useInsuranceStore();
  const { comparison } = useInsuranceComparisonStore();
  const { addToComparison, removeFromComparison } = useInsuranceActions();

  const isInComparisonList = isInComparison(productId);
  const comparisonCount = comparison.selectedProducts.length;
  const canAddMore = comparisonCount < comparison.maxProducts;

  const handleCompareAction = useCallback(() => {
    if (isInComparisonList) {
      removeFromComparison(productId);
      toast.success(t("removedFromComparison"));
    } else {
      if (canAddMore) {
        addToComparison(productId);
        toast.success(t("addedToComparison"));
      } else {
        toast.error(t("comparisonLimitReached"));
      }
    }
  }, [isInComparisonList, productId, canAddMore, addToComparison, removeFromComparison, t]);

  return {
    isInComparisonList,
    comparisonCount,
    canAddMore,
    handleCompareAction,
  };
}