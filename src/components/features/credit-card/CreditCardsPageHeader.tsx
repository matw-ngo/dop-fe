/**
 * Header component for the Credit Cards page
 * Contains title, description, and comparison controls
 */

import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { CreditCard } from "@/types/credit-card";

interface CreditCardsPageHeaderProps {
  comparisonCards: CreditCard[];
  locale: string;
}

export function CreditCardsPageHeader({
  comparisonCards,
  locale,
}: CreditCardsPageHeaderProps) {
  const t = useTranslations("features.credit-cards.listing");

  return (
    <div className="border-b bg-card">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {t("creditCards")}
            </h1>
            <p className="text-muted-foreground mt-1">
              {t("creditCardsDescription")}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            {comparisonCards.length > 0 && (
              <Badge variant="secondary" className="px-3 py-1">
                {comparisonCards.length}/3 {t("cardsSelected")}
              </Badge>
            )}
            {comparisonCards.length > 0 && (
              <Button variant="outline" asChild size="sm">
                <a
                  href={`/${locale}/credit-cards/compare?cards=${comparisonCards.map((c) => c.id).join(",")}`}
                >
                  {t("compareCards")} ({comparisonCards.length})
                </a>
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
