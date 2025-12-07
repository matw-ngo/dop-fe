import React from "react";
import { useTranslations } from "next-intl";
import { Shield, Phone, Globe, Headphones } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DetailedCreditCardInfo } from "@/types/credit-card";

interface ServiceCardProps {
  card: DetailedCreditCardInfo;
}

export const ServiceCard: React.FC<ServiceCardProps> = ({ card }) => {
  const t = useTranslations("features.credit-cards.detail");

  const services = [
    {
      icon: Shield,
      title: t("services.fraudProtection"),
      description: t("services.fraudProtectionDesc"),
      available: card.fraudProtection,
    },
    {
      icon: Phone,
      title: t("services.emergencySupport"),
      description: t("services.emergencySupportDesc"),
      available: card.emergencySupport,
    },
    {
      icon: Globe,
      title: t("services.globalAcceptance"),
      description: t("services.globalAcceptanceDesc"),
      available: card.globalAcceptance,
    },
    {
      icon: Headphones,
      title: t("services.customerSupport"),
      description: t("services.customerSupportDesc"),
      available: card.customerSupport247,
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{t("services.title")}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-2 gap-4">
          {services.map((service, index) => {
            const Icon = service.icon;
            return (
              <div
                key={index}
                className={`flex items-start gap-3 p-3 rounded-lg border ${
                  service.available
                    ? "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950"
                    : "border-muted bg-muted/30 opacity-50"
                }`}
              >
                <Icon
                  className={`w-5 h-5 mt-0.5 ${
                    service.available
                      ? "text-green-600 dark:text-green-400"
                      : "text-muted-foreground"
                  }`}
                />
                <div className="flex-1">
                  <h4 className="font-medium text-sm">{service.title}</h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    {service.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default ServiceCard;
