import {
  Calculator,
  Check,
  CreditCard as CreditCardIcon,
  Crown,
  Percent,
  Shield,
  Star,
  TrendingDown,
  TrendingUp,
  X,
  Zap,
} from "lucide-react";
import { useTranslations } from "next-intl";
import type React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useComparisonData } from "../hooks";

interface ComparisonContentProps {
  cardIds: string[];
  onRemoveCard?: (cardId: string) => void;
}

export const ComparisonContent: React.FC<ComparisonContentProps> = ({
  cardIds,
  onRemoveCard,
}) => {
  const t = useTranslations("pages.creditCard");

  // Use the comparison data hook
  const {
    cards: cardsToCompare,
    features,
    bestValues,
    cardScores,
    getBestCard,
    getApprovalOdds,
    formatCurrency,
  } = useComparisonData(cardIds);

  // Get the best card ID for crown display
  const bestCardId = getBestCard();

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="bg-muted/50">
            <th className="text-left p-4 border-b font-medium">
              {t("criteria")}
            </th>
            {cardsToCompare.map((card, _index) => (
              <th key={card.id} className="text-center p-4 border-b">
                <div className="space-y-2">
                  <div className="relative">
                    <div className="w-12 h-8 bg-primary/10 rounded mx-auto flex items-center justify-center">
                      <CreditCardIcon className="w-6 h-6 text-primary" />
                    </div>
                    {card.id === bestCardId && (
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-500 text-white rounded-full flex items-center justify-center">
                        <Crown className="w-4 h-4" />
                      </div>
                    )}
                    {onRemoveCard && (
                      <button
                        type="button"
                        onClick={() => onRemoveCard(card.id)}
                        className="absolute -bottom-1 -right-1 w-4 h-4 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center hover:bg-destructive/80"
                        aria-label={t("removeCardAriaLabel", {
                          cardName: card.name,
                        })}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{card.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {card.issuer}
                    </p>
                    {/* Overall Score */}
                    <div className="mt-1 flex items-center justify-center gap-1">
                      <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                      <span className="text-xs font-semibold text-yellow-600 dark:text-yellow-400">
                        {cardScores[card.id] || 0}/100
                      </span>
                    </div>
                  </div>
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {/* Financial Metrics Section */}
          <tr className="bg-muted/20">
            <td
              colSpan={cardsToCompare.length + 1}
              className="p-3 border-b font-semibold text-sm"
            >
              <Calculator className="w-4 h-4 inline mr-2" />
              {t("financialMetrics")}
            </td>
          </tr>

          <tr>
            <td className="p-4 border-b font-medium">
              <div className="flex items-center gap-2">
                <TrendingDown className="w-4 h-4 text-green-600" />
                {t("annualFee")}
              </div>
            </td>
            {cardsToCompare.map((card) => (
              <td
                key={card.id}
                className={`text-center p-4 border-b font-semibold ${
                  card.id === bestValues.lowestAnnualFee
                    ? "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                    : ""
                }`}
              >
                <div className="space-y-1">
                  <span>{formatCurrency(card.annualFee)}</span>
                  {card.id === bestValues.lowestAnnualFee && (
                    <div className="text-xs">
                      <Badge
                        variant="secondary"
                        className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                      >
                        {t("lowest")}
                      </Badge>
                    </div>
                  )}
                  {card.annualFeeType === "free" && (
                    <div className="text-xs text-green-600 font-medium">
                      {t("free")}
                    </div>
                  )}
                </div>
              </td>
            ))}
          </tr>

          <tr className="bg-muted/30">
            <td className="p-4 border-b font-medium">
              <div className="flex items-center gap-2">
                <Percent className="w-4 h-4 text-orange-600" />
                {t("interestRate")}
              </div>
            </td>
            {cardsToCompare.map((card) => (
              <td
                key={card.id}
                className={`text-center p-4 border-b font-semibold ${
                  card.id === bestValues.lowestInterestRate
                    ? "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                    : ""
                }`}
              >
                <div className="space-y-1">
                  <span>{card.interestRate}%</span>
                  {card.id === bestValues.lowestInterestRate && (
                    <div className="text-xs">
                      <Badge
                        variant="secondary"
                        className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                      >
                        {t("lowest")}
                      </Badge>
                    </div>
                  )}
                </div>
              </td>
            ))}
          </tr>

          <tr>
            <td className="p-4 border-b font-medium">{t("creditLimit")}</td>
            {cardsToCompare.map((card) => (
              <td
                key={card.id}
                className={`text-center p-4 border-b ${
                  card.id === bestValues.highestCreditLimit
                    ? "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400 font-semibold"
                    : ""
                }`}
              >
                <div className="space-y-1">
                  <span className="text-sm">
                    {formatCurrency(card.creditLimitMin)} -{" "}
                    {formatCurrency(card.creditLimitMax)}
                  </span>
                  <div className="text-xs text-muted-foreground">
                    {t(`creditLimitTiers.${card.creditLimitTier}`)}
                  </div>
                  {card.id === bestValues.highestCreditLimit && (
                    <div className="text-xs">
                      <Badge
                        variant="secondary"
                        className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                      >
                        {t("highest")}
                      </Badge>
                    </div>
                  )}
                </div>
              </td>
            ))}
          </tr>

          {/* Rewards Section */}
          <tr className="bg-muted/20">
            <td
              colSpan={cardsToCompare.length + 1}
              className="p-3 border-b font-semibold text-sm"
            >
              <TrendingUp className="w-4 h-4 inline mr-2" />
              {t("rewardsAndBenefits")}
            </td>
          </tr>

          <tr className="bg-muted/30">
            <td className="p-4 border-b font-medium">{t("rewardsProgram")}</td>
            {cardsToCompare.map((card) => (
              <td
                key={card.id}
                className={`text-center p-4 border-b text-sm ${
                  card.id === bestValues.highestRewardsRate
                    ? "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                    : ""
                }`}
              >
                {card.rewardsProgram ? (
                  <div className="space-y-1">
                    <p className="font-medium">{card.rewardsProgram.type}</p>
                    <p className="text-muted-foreground">
                      {card.rewardsProgram.earnRate}/1000 VND
                    </p>
                    {card.id === bestValues.highestRewardsRate && (
                      <div className="text-xs">
                        <Badge
                          variant="secondary"
                          className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                        >
                          {t("highestRate")}
                        </Badge>
                      </div>
                    )}
                  </div>
                ) : (
                  <span className="text-muted-foreground">N/A</span>
                )}
              </td>
            ))}
          </tr>

          <tr>
            <td className="p-4 border-b font-medium">{t("welcomeOffer")}</td>
            {cardsToCompare.map((card) => (
              <td key={card.id} className="text-center p-4 border-b">
                {card.welcomeOffer ? (
                  <div className="text-sm space-y-1">
                    <p className="font-medium">{card.welcomeOffer}</p>
                    {card.welcomeOfferExpiry && (
                      <p className="text-xs text-muted-foreground">
                        {t("expires")}: {card.welcomeOfferExpiry}
                      </p>
                    )}
                  </div>
                ) : (
                  <span className="text-muted-foreground text-sm">N/A</span>
                )}
              </td>
            ))}
          </tr>

          {/* Fees Section */}
          <tr className="bg-muted/20">
            <td
              colSpan={cardsToCompare.length + 1}
              className="p-3 border-b font-semibold text-sm"
            >
              <Shield className="w-4 h-4 inline mr-2" />
              {t("feesAndCharges")}
            </td>
          </tr>

          <tr className="bg-muted/30">
            <td className="p-4 border-b font-medium text-sm">
              {t("withdrawalFee")}
            </td>
            {cardsToCompare.map((card) => (
              <td
                key={card.id}
                className={`text-center p-4 border-b text-sm ${
                  card.id === bestValues.lowestWithdrawalFee
                    ? "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                    : ""
                }`}
              >
                <div className="space-y-1">
                  <span>{card.withdrawalFee}%</span>
                  {card.withdrawalFeeMin && (
                    <div className="text-xs text-muted-foreground">
                      {t("min")}: {formatCurrency(card.withdrawalFeeMin)}
                    </div>
                  )}
                  {card.id === bestValues.lowestWithdrawalFee && (
                    <div className="text-xs">
                      <Badge
                        variant="secondary"
                        className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                      >
                        {t("lowest")}
                      </Badge>
                    </div>
                  )}
                </div>
              </td>
            ))}
          </tr>

          <tr>
            <td className="p-4 border-b font-medium text-sm">
              {t("foreignExchangeFee")}
            </td>
            {cardsToCompare.map((card) => (
              <td
                key={card.id}
                className={`text-center p-4 border-b text-sm ${
                  card.id === bestValues.lowestForeignExchangeFee
                    ? "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                    : ""
                }`}
              >
                <div className="space-y-1">
                  <span>{card.foreignExchangeFee}%</span>
                  {card.id === bestValues.lowestForeignExchangeFee && (
                    <div className="text-xs">
                      <Badge
                        variant="secondary"
                        className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                      >
                        {t("lowest")}
                      </Badge>
                    </div>
                  )}
                </div>
              </td>
            ))}
          </tr>
          {/* Requirements Section */}
          <tr className="bg-muted/20">
            <td
              colSpan={cardsToCompare.length + 1}
              className="p-3 border-b font-semibold text-sm"
            >
              <Zap className="w-4 h-4 inline mr-2" />
              {t("requirementsAndApplication")}
            </td>
          </tr>

          <tr className="bg-muted/30">
            <td className="p-4 border-b font-medium text-sm">
              {t("minimumIncome")}
            </td>
            {cardsToCompare.map((card) => (
              <td key={card.id} className="text-center p-4 border-b text-sm">
                {formatCurrency(card.incomeRequiredMin)}/tháng
                {card.incomeRequiredMax && (
                  <div className="text-xs text-muted-foreground">
                    {t("upTo")}: {formatCurrency(card.incomeRequiredMax)}
                  </div>
                )}
              </td>
            ))}
          </tr>

          <tr>
            <td className="p-4 border-b font-medium text-sm">
              {t("ageRequirement")}
            </td>
            {cardsToCompare.map((card) => (
              <td key={card.id} className="text-center p-4 border-b text-sm">
                {card.ageRequiredMin}{" "}
                {card.ageRequiredMax ? `- ${card.ageRequiredMax}` : "+"}
              </td>
            ))}
          </tr>

          <tr className="bg-muted/30">
            <td className="p-4 border-b font-medium text-sm">
              {t("approvalOdds")}
            </td>
            {cardsToCompare.map((card) => {
              const odds = getApprovalOdds(card);
              const color =
                odds >= 80
                  ? "text-green-600"
                  : odds >= 60
                    ? "text-yellow-600"
                    : "text-red-600";
              return (
                <td key={card.id} className="text-center p-4 border-b text-sm">
                  <div className="space-y-1">
                    <span className={`font-semibold ${color}`}>{odds}%</span>
                    <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                      <div
                        className={`h-2 rounded-full ${
                          odds >= 80
                            ? "bg-green-600"
                            : odds >= 60
                              ? "bg-yellow-600"
                              : "bg-red-600"
                        }`}
                        style={{ width: `${odds}%` }}
                      />
                    </div>
                  </div>
                </td>
              );
            })}
          </tr>

          {/* Features Section */}
          <tr>
            <td className="p-4 border-b align-top font-medium">
              {t("keyFeatures")}
            </td>
            {cardsToCompare.map((card) => (
              <td key={card.id} className="text-center p-4 border-b">
                <ul className="text-sm space-y-1">
                  {features.map((feature) => {
                    const hasFeature = card.features.includes(feature);
                    return (
                      <li
                        key={feature}
                        className={`flex items-center justify-start gap-1 ${
                          hasFeature
                            ? "text-foreground"
                            : "text-muted-foreground"
                        }`}
                      >
                        {hasFeature ? (
                          <Check className="w-3 h-3 text-green-600 dark:text-green-500 flex-shrink-0" />
                        ) : (
                          <X className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                        )}
                        <span className={hasFeature ? "" : "line-through"}>
                          {feature}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </td>
            ))}
          </tr>
        </tbody>
      </table>
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

export default ComparisonContent;
