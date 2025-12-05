import React from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, X, TrendingUp, AlertCircle } from "lucide-react";
import { DetailedCreditCardInfo } from "@/types/credit-card";
import { PaymentMethodCard } from "./PaymentMethodCard";
import { ServiceCard } from "./ServiceCard";

interface ProductSidebarProps {
  card: DetailedCreditCardInfo;
}

export const ProductSidebar: React.FC<ProductSidebarProps> = ({ card }) => {
  const t = useTranslations("pages.creditCard");

  return (
    <div className="space-y-6">
      {/* CTA Buttons */}
      <Card>
        <CardContent className="p-6">
          <Button className="w-full mb-3" size="lg">
            {t("applyNow")}
          </Button>
          <Button variant="outline" className="w-full">
            {t("learnMore")}
          </Button>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t("quickStats")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">
              {t("approvalRate")}
            </span>
            <span className="font-semibold">{card.approvalRate || "85%"}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">
              {t("processingTime")}
            </span>
            <span className="font-semibold">
              {card.processingTime || "3-5 days"}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">
              {t("minIncome")}
            </span>
            <span className="font-semibold">{card.minIncome || "10M VND"}</span>
          </div>
        </CardContent>
      </Card>

      {/* Pros & Cons */}
      {card.pros && card.cons && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t("prosAndCons")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <h4 className="font-semibold text-green-600 mb-2 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                {t("pros")}
              </h4>
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
              <h4 className="font-semibold text-destructive mb-2 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
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
          </CardContent>
        </Card>
      )}

      {/* Payment Methods */}
      <PaymentMethodCard card={card} />

      {/* Services */}
      <ServiceCard card={card} />
    </div>
  );
};

export default ProductSidebar;
