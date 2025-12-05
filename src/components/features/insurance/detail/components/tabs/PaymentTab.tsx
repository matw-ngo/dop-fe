import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CreditCard,
  Calculator,
  RotateCcw,
  Check,
  X,
  Clock,
  Trophy,
  FileX,
  Info,
} from "lucide-react";
import { PaymentMethodCard } from "../PaymentMethodCard";
import { formatCurrency } from "@/lib/utils";

interface PaymentTabProps {
  product: any;
  t: any;
}

export const PaymentTab: React.FC<PaymentTabProps> = ({ product, t }) => {
  const noClaimBonusYears = Array.from(
    { length: product.renewal.noClaimBonus.maxYears },
    (_, i) => i + 1,
  );

  const calculateNoClaimBonus = (
    year: number,
    maxYears: number,
    maxDiscount: number,
  ) => {
    return Math.min((year / maxYears) * maxDiscount, maxDiscount);
  };

  const calculateMonthlyPayment = (totalPremium: number, months: number) => {
    return Math.ceil(totalPremium / months);
  };

  return (
    <div className="mt-6 space-y-6">
      {/* Payment Methods */}
      <div className="bg-muted/30 p-6 rounded-xl">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-primary" />
          {t("tabs.payment.methods.title")}
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {product.paymentOptions.methods.map(
            (method: string, index: number) => (
              <PaymentMethodCard key={index} method={method} />
            ),
          )}
        </div>
      </div>

      {/* Installment Options */}
      {product.paymentOptions.installmentAvailable &&
        product.paymentOptions.installmentPlans && (
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Calculator className="w-5 h-5 text-primary" />
              {t("tabs.payment.installment.title")}
            </h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {product.paymentOptions.installmentPlans.map(
                (plan: any, index: number) => (
                  <div key={index} className="bg-card p-4 rounded-lg border">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium">
                        {plan.months} {t("units.months")}
                      </h4>
                      {plan.interestRate === 0 && (
                        <Badge
                          variant="secondary"
                          className="bg-primary/10 text-primary"
                        >
                          {t("tabs.payment.installment.zeroInterest")}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {plan.interestRate
                        ? t("tabs.payment.installment.interestRate", {
                            rate: plan.interestRate,
                          })
                        : t("tabs.payment.installment.interestFree")}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {t("tabs.payment.installment.monthlyPayment", {
                        amount: formatCurrency(
                          calculateMonthlyPayment(
                            product.pricing.totalPremium,
                            plan.months,
                          ),
                        ),
                      })}
                    </p>
                  </div>
                ),
              )}
            </div>
          </div>
        )}

      {/* Auto-renewal Details */}
      <div
        className={`${
          product.renewal.autoRenewal
            ? "bg-primary/5 border border-primary/20"
            : "bg-muted/30 border border-border"
        } p-6 rounded-xl`}
      >
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <RotateCcw className="w-5 h-6 text-primary" />
          {t("tabs.payment.autoRenewal.title")}
        </h3>

        {product.renewal.autoRenewal ? (
          <div>
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div className="flex items-center gap-3">
                <Check className="w-5 h-5 text-primary" />
                <div>
                  <p className="font-medium">
                    {t("tabs.payment.autoRenewal.enabled")}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {t("tabs.payment.autoRenewal.enabledDesc")}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-primary" />
                <div>
                  <p className="font-medium">
                    {t("tabs.payment.autoRenewal.reminder")}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {t("tabs.payment.autoRenewal.reminderDesc", {
                      days: product.renewal.renewalReminderDays,
                    })}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-card p-4 rounded-lg border">
              <p className="text-sm text-foreground mb-2">
                <strong>{t("tabs.payment.autoRenewal.benefits.title")}:</strong>
              </p>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• {t("tabs.payment.autoRenewal.benefits.benefit1")}</li>
                <li>• {t("tabs.payment.autoRenewal.benefits.benefit2")}</li>
                <li>• {t("tabs.payment.autoRenewal.benefits.benefit3")}</li>
                <li>• {t("tabs.payment.autoRenewal.benefits.benefit4")}</li>
              </ul>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <X className="w-5 h-5 text-muted-foreground" />
            <div>
              <p className="font-medium">
                {t("tabs.payment.autoRenewal.notSupported")}
              </p>
              <p className="text-sm text-muted-foreground">
                {t("tabs.payment.autoRenewal.notSupportedDesc")}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* No Claim Bonus */}
      <div className="bg-muted/30 p-6 rounded-xl">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Trophy className="w-5 h-5 text-primary" />
          {t("tabs.payment.noClaimBonus.title")}
        </h3>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium mb-3">
              {t("tabs.payment.noClaimBonus.accumulationRules")}
            </h4>
            <div className="space-y-2">
              {noClaimBonusYears.map((year) => {
                const discount = calculateNoClaimBonus(
                  year,
                  product.renewal.noClaimBonus.maxYears,
                  product.renewal.noClaimBonus.maxDiscount,
                );
                return (
                  <div
                    key={year}
                    className="flex justify-between items-center p-2 bg-card rounded border"
                  >
                    <span className="text-sm">
                      {t("tabs.payment.noClaimBonus.yearsWithoutClaim", {
                        years: year,
                      })}
                    </span>
                    <Badge variant="outline" className="text-primary">
                      -{Math.round(discount)}%
                    </Badge>
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <h4 className="font-medium mb-3">
              {t("tabs.payment.noClaimBonus.importantNotes")}
            </h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <Info className="w-4 h-4 mt-0.5 text-yellow-600 flex-shrink-0" />
                <span>{t("tabs.payment.noClaimBonus.note1")}</span>
              </li>
              <li className="flex items-start gap-2">
                <Info className="w-4 h-4 mt-0.5 text-yellow-600 flex-shrink-0" />
                <span>{t("tabs.payment.noClaimBonus.note2")}</span>
              </li>
              <li className="flex items-start gap-2">
                <Info className="w-4 h-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                <span>
                  {t("tabs.payment.noClaimBonus.note3", {
                    maxDiscount: product.renewal.noClaimBonus.maxDiscount,
                  })}
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Cancellation Policy */}
      <div className="bg-muted/30 border border-border p-6 rounded-xl">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <FileX className="w-5 h-5 text-muted-foreground" />
          {t("tabs.payment.cancellation.title")}
        </h3>

        <div className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">
              {t("tabs.payment.cancellation.considerationPeriod")}
            </h4>
            <p className="text-sm text-gray-700">
              {t("tabs.payment.cancellation.considerationPeriodDesc", {
                days: product.renewal.gracePeriod,
              })}
            </p>
          </div>

          <div>
            <h4 className="font-medium mb-2">
              {t("tabs.payment.cancellation.afterConsideration")}
            </h4>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>• {t("tabs.payment.cancellation.beforeExpiry")}</li>
              <li>• {t("tabs.payment.cancellation.cancellationFee")}</li>
              <li>• {t("tabs.payment.cancellation.procedure")}</li>
            </ul>
          </div>

          <div className="bg-card p-4 rounded-lg border">
            <p className="text-xs text-muted-foreground">
              <strong>{t("tabs.payment.cancellation.note")}:</strong>{" "}
              {t("tabs.payment.cancellation.termination", {
                days: product.renewal.gracePeriod,
              })}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
