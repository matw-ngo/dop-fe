import React from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { CreditCard as CreditCardIcon, Check } from "lucide-react";
import { vietnameseCreditCards } from "@/data/credit-cards";

interface CreditCardComparisonProps {
  cardIds: string[];
}

export const CreditCardComparison: React.FC<CreditCardComparisonProps> = ({
  cardIds,
}) => {
  const t = useTranslations("pages.creditCard");
  const cardsToCompare = cardIds
    .map((id) => vietnameseCreditCards.find((card) => card.id === id))
    .filter(Boolean);

  if (cardsToCompare.length === 0) {
    return null;
  }

  return (
    <div className="bg-card rounded-lg border shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-muted/50">
              <th className="text-left p-4 border-b font-medium">
                {t("criteria")}
              </th>
              {cardsToCompare.map((card, index) => (
                <th key={index} className="text-center p-4 border-b">
                  <div className="space-y-2">
                    <div className="w-12 h-8 bg-primary/10 rounded mx-auto flex items-center justify-center">
                      <CreditCardIcon className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold">{card!.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {card!.issuer}
                      </p>
                    </div>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="p-4 border-b font-medium">
                {t("annualFee")}
              </td>
              {cardsToCompare.map((card, index) => (
                <td key={index} className="text-center p-4 border-b">
                  {card!.annualFee}
                </td>
              ))}
            </tr>
            <tr className="bg-muted/30">
              <td className="p-4 border-b font-medium">
                {t("interestRate")}
              </td>
              {cardsToCompare.map((card, index) => (
                <td key={index} className="text-center p-4 border-b">
                  {card!.interestRate}
                </td>
              ))}
            </tr>
            {cardsToCompare.some(
              (card) => card!.rewardsProgram?.type === "cashback",
            ) && (
                <tr>
                  <td className="p-4 border-b font-medium">
                    {t("cashback")}
                  </td>
                  {cardsToCompare.map((card, index) => (
                    <td key={index} className="text-center p-4 border-b">
                      {card!.rewardsProgram?.type === "cashback"
                        ? `${card!.rewardsProgram.earnRate}/1000 VND`
                        : "N/A"}
                    </td>
                  ))}
                </tr>
              )}
            <tr className="bg-muted/30">
              <td className="p-4 border-b font-medium">
                {t("keyFeatures")}
              </td>
              {cardsToCompare.map((card, index) => (
                <td key={index} className="text-center p-4 border-b">
                  <ul className="text-sm space-y-1">
                    {card!.features.map((feature: string, idx: number) => (
                      <li
                        key={idx}
                        className="flex items-center justify-start gap-1"
                      >
                        <Check className="w-3 h-3 text-green-600 dark:text-green-500 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
      <div className="p-4 border-t bg-muted/30">
        <div className="flex justify-center gap-4">
          <Button className="bg-green-600 hover:bg-green-700 text-white">
            {t("applyForBestCard")}
          </Button>
          <Button variant="outline">{t("learnMore")}</Button>
        </div>
      </div>
    </div>
  );
};

export default CreditCardComparison;
