import { useTranslations } from "next-intl";
import { CreditCard as CreditCardIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { CreditCard } from "@/types/credit-card";

interface CreditCardsPageHeroProps {
  titleKey: string;
  descriptionKey: string;
  comparisonCards: CreditCard[];
  locale: string;
}

export default function CreditCardsPageHero({
  titleKey,
  descriptionKey,
  comparisonCards,
  locale,
}: CreditCardsPageHeroProps) {
  const t = useTranslations("pages.creditCard");

  return (
    <section className="bg-muted border-b">
      <div className="container mx-auto px-4 py-12 sm:py-16">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-background rounded-full">
              <CreditCardIcon className="w-12 h-12 text-primary" />
            </div>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-6">
            {t(titleKey)}
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-8">
            {t(descriptionKey)}
          </p>
          <div className="flex items-center justify-center space-x-2">
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
    </section>
  );
}
