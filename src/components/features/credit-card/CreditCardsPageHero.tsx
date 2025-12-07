import { useTranslations } from "next-intl";
import { CreditCard as CreditCardIcon, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTheme } from "@/lib/theme/context";
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
  const t = useTranslations("features.credit-cards.listing");
  const tMain = useTranslations("features.credit-cards.main");
  const { themeConfig } = useTheme();

  const isCorporateTheme = themeConfig?.id === "corporate";

  return (
    <section
      className={`relative bg-muted border-b overflow-hidden ${isCorporateTheme ? "shadow-sm" : ""}`}
    >
      {/* Subtle background pattern for corporate theme */}
      {isCorporateTheme && (
        <div className="absolute inset-0 opacity-3">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%231e40af' fill-opacity='0.03'%3E%3Cpath d='M0 0h40v40H0V0zm40 40h40v40H40V40zm0-40h80v80H40V0z'/%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />
        </div>
      )}

      <div className="relative container mx-auto px-4 py-12 sm:py-16">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex justify-center mb-6">
            <div
              className={`p-4 bg-background rounded-full ${isCorporateTheme ? "shadow-sm border" : ""}`}
            >
              <div className="relative">
                <CreditCardIcon className="w-12 h-12 text-primary" />
                {isCorporateTheme && (
                  <TrendingUp className="w-4 h-4 text-primary absolute -bottom-1 -right-1 bg-background rounded-full p-0.5" />
                )}
              </div>
            </div>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-6 leading-tight">
            {tMain(titleKey)}
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-8">
            {tMain(descriptionKey)}
          </p>
          <div className="flex items-center justify-center space-x-2">
            {comparisonCards.length > 0 && (
              <Badge
                variant="secondary"
                className={`px-3 py-1 ${isCorporateTheme ? "border border-primary/20 bg-primary/5" : ""}`}
              >
                {comparisonCards.length}/3 {t("cardsSelected")}
              </Badge>
            )}
            {comparisonCards.length > 0 && (
              <Button
                variant="outline"
                asChild
                size="sm"
                className={
                  isCorporateTheme
                    ? "border-primary/20 hover:bg-primary/10"
                    : ""
                }
              >
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
