"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { CreditCardComparison } from "@/components/features/credit-card/CreditCardComparison";

export default function ComparePage() {
  const t = useTranslations();
  const searchParams = useSearchParams();
  const [cardIds, setCardIds] = useState<string[]>([]);

  useEffect(() => {
    const cards = searchParams.get("cards");
    setCardIds(cards ? cards.split(",") : []);
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <Link href="/vi/credit-cards">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                {t("common.back") || "Quay lại"}
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                {t("pages.creditCard.compareCards") || "So sánh thẻ tín dụng"}
              </h1>
              <p className="text-muted-foreground">
                {t("pages.creditCard.compareDescription") ||
                  "So sánh chi tiết các thẻ tín dụng đã chọn"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {cardIds.length > 0 ? (
          <CreditCardComparison cardIds={cardIds} />
        ) : (
          <div className="text-center py-16">
            <h2 className="text-2xl font-semibold mb-4">
              {t("pages.creditCard.noCardsToCompare") ||
                "Chưa có thẻ nào để so sánh"}
            </h2>
            <p className="text-muted-foreground mb-8">
              {t("pages.creditCard.selectAtLeastTwo") ||
                "Vui lòng chọn ít nhất 2 thẻ để so sánh"}
            </p>
            <Link href="/vi/credit-cards">
              <Button>
                {t("pages.creditCard.selectCardsToCompare") ||
                  "Chọn thẻ để so sánh"}
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
