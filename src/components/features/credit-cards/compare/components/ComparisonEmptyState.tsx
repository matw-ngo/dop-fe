import { CreditCard as CreditCardIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import type React from "react";

export const ComparisonEmptyState: React.FC = () => {
  const t = useTranslations("features.credit-cards.comparison");

  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <CreditCardIcon className="w-12 h-12 text-muted-foreground mb-4" />
      <h3 className="text-lg font-semibold mb-2">
        {t("comparison.emptyState.title")}
      </h3>
      <p className="text-muted-foreground max-w-md">
        {t("comparison.emptyState.description")}
      </p>
    </div>
  );
};

export default ComparisonEmptyState;
