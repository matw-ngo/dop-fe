import { Check, CreditCard as CreditCardIcon, X } from "lucide-react";
import { useTranslations } from "next-intl";
import type React from "react";
import { Button } from "@/components/ui/button";
import { getDetailedCardInfo } from "@/data/mock-credit-cards";

interface CreditCardDetailsProps {
  cardSlug: string;
}

export const CreditCardDetails: React.FC<CreditCardDetailsProps> = ({
  cardSlug,
}) => {
  const t = useTranslations("features.credit-cards.detail");
  const card = getDetailedCardInfo(cardSlug);

  return (
    <div className="grid lg:grid-cols-3 gap-8">
      {/* Main Card Info */}
      <div className="lg:col-span-2 space-y-6">
        {/* Card Overview */}
        <div className="bg-card rounded-lg shadow-md p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <CreditCardIcon className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground">
                {card.name}
              </h2>
              <p className="text-muted-foreground">{card.bank}</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <div className="bg-muted/30 p-4 rounded-lg">
              <p className="text-sm text-muted-foreground">{t("annualFee")}</p>
              <p className="text-xl font-semibold">{card.annualFee}</p>
            </div>
            <div className="bg-muted/30 p-4 rounded-lg">
              <p className="text-sm text-muted-foreground">
                {t("interestRate")}
              </p>
              <p className="text-xl font-semibold">{card.interestRate}</p>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="bg-card rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold mb-4">{t("features")}</h3>
          <ul className="space-y-2">
            {card.features.map((feature: string, index: number) => (
              <li key={index} className="flex items-start gap-2">
                <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Requirements */}
        {card.requirements && card.requirements.length > 0 && (
          <div className="bg-card rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold mb-4">{t("requirements")}</h3>
            <ul className="space-y-2">
              {card.requirements.map((req: string, index: number) => (
                <li key={index} className="flex items-start gap-2">
                  <div className="w-5 h-5 border-2 border-primary rounded-full mt-0.5 flex-shrink-0" />
                  <span>{req}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Sidebar */}
      <div className="space-y-6">
        {/* Pros & Cons */}
        {card.pros && card.cons && (
          <div className="bg-card rounded-lg shadow-md p-6">
            <div className="mb-4">
              <h4 className="font-semibold text-green-600 mb-2">{t("pros")}</h4>
              <ul className="space-y-1">
                {card.pros.map((pro: string, index: number) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>{pro}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-destructive mb-2">
                {t("cons")}
              </h4>
              <ul className="space-y-1">
                {card.cons.map((con: string, index: number) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <X className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
                    <span>{con}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* CTA Buttons */}
        <div className="bg-card rounded-lg shadow-md p-6">
          <Button className="w-full mb-3" size="lg">
            {t("applyNow")}
          </Button>
          <Button variant="outline" className="w-full">
            {t("learnMore")}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CreditCardDetails;
