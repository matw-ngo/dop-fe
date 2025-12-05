import React from "react";
import { useTranslations } from "next-intl";
import { CreditCard as CreditCardIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { DetailedCreditCardInfo } from "@/types/credit-card";

interface ProductOverviewCardProps {
  card: DetailedCreditCardInfo;
}

export const ProductOverviewCard: React.FC<ProductOverviewCardProps> = ({
  card,
}) => {
  const t = useTranslations("pages.creditCard");

  return (
    <Card className="shadow-md">
      <CardContent className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
            <CreditCardIcon className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground">{card.name}</h2>
            <p className="text-muted-foreground">{card.bank}</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <div className="bg-muted/30 p-4 rounded-lg">
            <p className="text-sm text-muted-foreground">{t("annualFee")}</p>
            <p className="text-xl font-semibold">{card.annualFee}</p>
          </div>
          <div className="bg-muted/30 p-4 rounded-lg">
            <p className="text-sm text-muted-foreground">{t("interestRate")}</p>
            <p className="text-xl font-semibold">{card.interestRate}</p>
          </div>
        </div>

        {card.description && (
          <div className="border-t pt-4">
            <h3 className="font-semibold mb-2">{t("description")}</h3>
            <p className="text-muted-foreground">{card.description}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProductOverviewCard;
