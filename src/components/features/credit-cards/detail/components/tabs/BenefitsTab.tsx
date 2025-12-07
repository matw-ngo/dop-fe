import React from "react";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Gift, Plane, Coffee } from "lucide-react";
import { DetailedCreditCardInfo } from "@/types/credit-card";

interface BenefitsTabProps {
  card: DetailedCreditCardInfo;
}

export const BenefitsTab: React.FC<BenefitsTabProps> = ({ card }) => {
  const t = useTranslations("features.credit-cards.detail");

  const benefitCategories = [
    {
      icon: Gift,
      title: t("benefits.welcome"),
      items: card.welcomeOffers || [],
    },
    {
      icon: Plane,
      title: t("benefits.travel"),
      items: card.travelBenefits || [],
    },
    {
      icon: Coffee,
      title: t("benefits.lifestyle"),
      items: card.lifestyleBenefits || [],
    },
  ].filter((category) => category.items.length > 0);

  return (
    <div className="space-y-6">
      {benefitCategories.map((category, index) => {
        const Icon = category.icon;
        return (
          <Card key={index}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon className="w-5 h-5" />
                {category.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                {category.items.map((benefit, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm">{benefit}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        );
      })}

      {card.specialPromotions && card.specialPromotions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{t("benefits.specialPromotions")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {card.specialPromotions.map((promo, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div>
                    <p className="font-medium text-sm">{promo.title}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {promo.description}
                    </p>
                  </div>
                  <Badge variant="secondary">{promo.validUntil}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default BenefitsTab;
