import React from "react";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DollarSign, Percent, AlertTriangle } from "lucide-react";
import { DetailedCreditCardInfo } from "@/types/credit-card";

interface FeesTabProps {
  card: DetailedCreditCardInfo;
}

export const FeesTab: React.FC<FeesTabProps> = ({ card }) => {
  const t = useTranslations("features.credit-cards.detail");

  return (
    <div className="space-y-6">
      {/* Primary Fees */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            {t("fees.primary")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
            <span className="font-medium">{t("annualFee")}</span>
            <span className="font-semibold">{card.annualFee}</span>
          </div>

          {card.supplementaryFee && (
            <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
              <span className="font-medium">{t("fees.supplementary")}</span>
              <span className="font-semibold">{card.supplementaryFee}</span>
            </div>
          )}

          {card.replacementFee && (
            <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
              <span className="font-medium">{t("fees.replacement")}</span>
              <span className="font-semibold">{card.replacementFee}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Interest Rates */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Percent className="w-5 h-5" />
            {t("fees.interestRates")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
            <span className="font-medium">{t("interestRate")}</span>
            <span className="font-semibold">{card.interestRate}</span>
          </div>

          {card.cashAdvanceRate && (
            <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
              <span className="font-medium">{t("fees.cashAdvance")}</span>
              <span className="font-semibold">{card.cashAdvanceRate}</span>
            </div>
          )}

          {card.overdueRate && (
            <div className="flex justify-between items-center p-3 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg">
              <span className="font-medium text-red-700 dark:text-red-300">
                {t("fees.overdue")}
              </span>
              <span className="font-semibold text-red-700 dark:text-red-300">
                {card.overdueRate}
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Transaction Fees */}
      {card.transactionFees && card.transactionFees.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{t("fees.transaction")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {card.transactionFees.map((fee, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center p-3 border rounded-lg"
                >
                  <div>
                    <p className="font-medium text-sm">{fee.type}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {fee.description}
                    </p>
                  </div>
                  <Badge variant={fee.isWaived ? "secondary" : "outline"}>
                    {fee.isWaived ? t("fees.waived") : fee.amount}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Penalty Fees Warning */}
      <Card className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-amber-700 dark:text-amber-300">
            <AlertTriangle className="w-5 h-5" />
            {t("fees.penaltyWarning")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-amber-700 dark:text-amber-300">
            {t("fees.penaltyWarningDesc")}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default FeesTab;
