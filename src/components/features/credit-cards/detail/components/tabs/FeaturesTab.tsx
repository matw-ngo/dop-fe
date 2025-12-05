import React from "react";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, CreditCard, Shield, Smartphone, Globe } from "lucide-react";
import { DetailedCreditCardInfo } from "@/types/credit-card";

interface FeaturesTabProps {
  card: DetailedCreditCardInfo;
}

export const FeaturesTab: React.FC<FeaturesTabProps> = ({ card }) => {
  const t = useTranslations("pages.creditCard");

  const featureCategories = [
    {
      icon: CreditCard,
      title: t("features.cardFeatures"),
      items: card.cardFeatures || [],
    },
    {
      icon: Shield,
      title: t("features.security"),
      items: card.securityFeatures || [],
    },
    {
      icon: Smartphone,
      title: t("features.digital"),
      items: card.digitalFeatures || [],
    },
    {
      icon: Globe,
      title: t("features.global"),
      items: card.globalFeatures || [],
    },
  ].filter((category) => category.items.length > 0);

  return (
    <div className="space-y-6">
      {/* Core Features */}
      <Card>
        <CardHeader>
          <CardTitle>{t("features.core")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            {card.features.map((feature, index) => (
              <div key={index} className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-sm">{feature}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Categorized Features */}
      {featureCategories.map((category, index) => {
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
                {category.items.map((feature, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        );
      })}

      {/* Requirements */}
      {card.requirements && card.requirements.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{t("requirements")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {card.requirements.map((req, index) => (
                <div key={index} className="flex items-start gap-2">
                  <div className="w-5 h-5 border-2 border-primary rounded-full mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{req}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Additional Information */}
      {card.additionalInfo && (
        <Card>
          <CardHeader>
            <CardTitle>{t("additionalInfo")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {card.additionalInfo.map((info, index) => (
                <div key={index} className="flex items-start gap-2">
                  <Badge variant="outline" className="mt-0.5">
                    {info.label}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {info.value}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default FeaturesTab;
