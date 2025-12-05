"use client";

import React, { useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  X,
  ArrowRight,
  Shield,
  Trash2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useInsuranceStore } from "@/store/use-insurance-store";
import { useLocale } from "next-intl";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface InsuranceComparisonSnackbarProps {
  onClose?: () => void;
}

export default function InsuranceComparisonSnackbar({
  onClose,
}: InsuranceComparisonSnackbarProps) {
  const t = useTranslations("pages.insurance");
  const locale = useLocale();
  const [isVisible, setIsVisible] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);

  // Get comparison state from store - ALL hooks must be declared before any conditional returns
  const comparisonProducts = useInsuranceStore(
    (state: any) => state.comparison.selectedProducts,
  );
  const maxProducts = useInsuranceStore(
    (state: any) => state.comparison.maxProducts,
  );
  const { removeFromComparison, clearComparison } = useInsuranceStore(
    (state: any) => state,
  );

  const handleClose = useCallback(() => {
    setIsVisible(false);
    onClose?.();
  }, [onClose]);

  const handleRemoveProduct = useCallback(
    (productId: string) => {
      removeFromComparison(productId);
    },
    [removeFromComparison],
  );

  const handleClearAll = useCallback(() => {
    clearComparison();
    setIsVisible(false);
    onClose?.();
  }, [clearComparison, onClose]);

  // Get product names for display
  const getProductNames = useCallback(() => {
    const store = useInsuranceStore.getState();
    return comparisonProducts.map((id: string) => {
      const product = store.getProductById?.(id);
      return product ? product.name : `Product ${id}`;
    });
  }, [comparisonProducts]);

  // Don't show if no products selected - This must be AFTER all hooks are declared
  if (comparisonProducts.length === 0 || !isVisible) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-t border-border shadow-lg transition-all duration-300">
      <div className="container mx-auto px-4 py-3">
        {/* Main bar */}
        <div className="flex items-center justify-between">
          {/* Left: Status message */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <Shield className="h-5 w-5 text-primary flex-shrink-0" />
            <div className="flex items-center gap-2 min-w-0">
              <Badge variant="secondary" className="text-xs flex-shrink-0">
                {comparisonProducts.length}/{maxProducts}
              </Badge>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Product dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-3 gap-1 hover:bg-accent transition-colors"
                >
                  <span className="text-sm font-small truncate">
                    {t("comparisonSnackbar.selected", {
                      count: comparisonProducts.length,
                    }) ||
                      `Đã chọn ${comparisonProducts.length} sản phẩm để so sánh`}
                  </span>
                  {isExpanded ? (
                    <ChevronDown className="h-3 w-3" />
                  ) : (
                    <ChevronUp className="h-3 w-3" />
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <div className="p-2">
                  <div className="space-y-1">
                    {getProductNames().map((name, index) => {
                      const productId = comparisonProducts[index];
                      return (
                        <div
                          key={productId}
                          className="flex items-center justify-between py-1 px-2 hover:bg-accent rounded transition-colors"
                        >
                          <span className="text-sm truncate flex-1">
                            {name}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 hover:bg-destructive hover:text-destructive-foreground transition-colors"
                            onClick={() => handleRemoveProduct(productId)}
                            aria-label={`Remove ${name} from comparison`}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                </div>
                {comparisonProducts.length > 1 && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-red-600 hover:bg-red-50 focus:bg-red-50 cursor-pointer"
                      onClick={handleClearAll}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      {t("comparisonSnackbar.clearAll")}
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Compare button */}
            <Link href={`/${locale}/insurance/compare`}>
              <Button
                size="sm"
                className="gap-2 bg-primary hover:bg-primary/90 transition-colors"
              >
                {t("comparisonSnackbar.viewComparison")}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>

            {/* Close button */}
            {/* <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="h-8 w-8 p-0 hover:bg-accent transition-colors"
              aria-label={t("common.close")}
            >
              <X className="h-4 w-4" />
            </Button> */}
          </div>
        </div>

        {/* Quick preview when expanded */}
        {isExpanded && (
          <div className="mt-2 pt-2 border-t border-border">
            <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
              {getProductNames()
                .slice(0, 3)
                .map((name, index) => (
                  <span key={index} className="truncate max-w-[150px]">
                    {index > 0 && "• "}
                    {name}
                  </span>
                ))}
              {getProductNames().length > 3 && (
                <span>+{getProductNames().length - 3} more</span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
