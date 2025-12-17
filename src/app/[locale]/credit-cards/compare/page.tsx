"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import React, { useEffect, useState } from "react";
import { useShallow } from "zustand/shallow";
import { CreditCardComparison } from "@/components/features/credit-card/CreditCardComparison";
import { CreditCardsThemeProvider } from "@/components/features/credit-card/CreditCardsThemeProvider";
import { CreditCardComparisonPanel } from "@/components/features/credit-cards/compare";
import Footer from "@/components/layout/footer";
import Header from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { useCreditCardsNavbarTheme } from "@/hooks/features/credit-card/useCreditCardsNavbarTheme";
import { useCurrentLocale } from "@/lib/client-utils";
import {
  useCreditCardComparison,
  useCreditCardsStore,
} from "@/store/use-credit-cards-store";
import type { CreditCard } from "@/types/credit-card";

export default function ComparePage() {
  const t = useTranslations("pages.creditCard");
  const locale = useTranslations("common");
  const searchParams = useSearchParams();
  const currentLocale = useCurrentLocale();

  // Get comparison state from store
  const { comparisonCards, canAddMore } = useCreditCardComparison() as {
    comparisonCards: CreditCard[];
    canAddMore: boolean;
  };
  const { removeFromComparison, clearComparison, addToComparison } =
    useCreditCardsStore(
      useShallow((state) => ({
        removeFromComparison: state.removeFromComparison,
        clearComparison: state.clearComparison,
        addToComparison: state.addToComparison,
      })),
    );

  // Configuration - use theme-aware navbar config
  const creditCardsNavbarConfig = useCreditCardsNavbarTheme();

  useEffect(() => {
    const cards = searchParams.get("compare");
    const ids = cards ? cards.split(",") : [];

    // Add cards from URL to comparison store
    ids.forEach((id) => {
      if (id && !comparisonCards.some((card) => card.id === id)) {
        addToComparison(id);
      }
    });
  }, [searchParams, addToComparison, comparisonCards]);

  // Handle add more cards - redirect to main page
  const handleAddMore = () => {
    window.location.href = `/${currentLocale}/credit-cards`;
  };

  return (
    <CreditCardsThemeProvider>
      <div className="flex flex-col min-h-screen bg-background">
        <Header configOverride={creditCardsNavbarConfig} />

        {/* Header */}
        <div className="border-b bg-card">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center gap-4">
              <Link href={`/${currentLocale}/credit-cards`}>
                <Button variant="outline" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  {locale("back")}
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">
                  {t("compareCards") || "So sánh thẻ tín dụng"}
                </h1>
                <p className="text-muted-foreground">
                  {t("compareDescription") ||
                    "So sánh chi tiết các thẻ tín dụng đã chọn"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <main className="flex-grow">
          <div className="container mx-auto px-4 py-8">
            {comparisonCards?.length > 0 ? (
              <div className="space-y-8">
                <CreditCardComparisonPanel
                  cards={comparisonCards}
                  onRemove={removeFromComparison}
                  onClear={clearComparison}
                  onAdd={canAddMore ? handleAddMore : undefined}
                  isSticky={false}
                  className="mb-8"
                />

                {/* Detailed comparison table */}
                <CreditCardComparison
                  cardIds={comparisonCards.map((card) => card.id)}
                />
              </div>
            ) : (
              <div className="text-center py-16">
                <h2 className="text-2xl font-semibold mb-4">
                  {t("noCardsToCompare") || "Chưa có thẻ nào để so sánh"}
                </h2>
                <p className="text-muted-foreground mb-8">
                  {t("selectAtLeastTwo") ||
                    "Vui lòng chọn ít nhất 2 thẻ để so sánh"}
                </p>
                <Link href={`/${currentLocale}/credit-cards`}>
                  <Button>
                    {t("selectCardsToCompare") || "Chọn thẻ để so sánh"}
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </main>

        <Footer company="finzone" />
      </div>
    </CreditCardsThemeProvider>
  );
}
