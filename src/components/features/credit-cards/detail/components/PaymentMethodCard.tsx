import { CreditCard, Smartphone, Wallet } from "lucide-react";
import { useTranslations } from "next-intl";
import type React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DetailedCreditCardInfo } from "@/types/credit-card";

interface PaymentMethodCardProps {
  card: DetailedCreditCardInfo;
}

export const PaymentMethodCard: React.FC<PaymentMethodCardProps> = ({
  card,
}) => {
  const t = useTranslations("features.credit-cards.detail");

  const paymentMethods = [
    { icon: CreditCard, label: t("paymentMethods.card"), available: true },
    {
      icon: Wallet,
      label: t("paymentMethods.wallet"),
      available: card.walletSupported,
    },
    {
      icon: Smartphone,
      label: t("paymentMethods.mobile"),
      available: card.mobilePaymentSupported,
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{t("paymentMethods.title")}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4">
          {paymentMethods.map((method, index) => {
            const Icon = method.icon;
            return (
              <div
                key={index}
                className={`flex flex-col items-center gap-2 p-3 rounded-lg border ${
                  method.available
                    ? "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950"
                    : "border-muted bg-muted/30 opacity-50"
                }`}
              >
                <Icon
                  className={`w-6 h-6 ${
                    method.available
                      ? "text-green-600 dark:text-green-400"
                      : "text-muted-foreground"
                  }`}
                />
                <span className="text-sm text-center">{method.label}</span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default PaymentMethodCard;
