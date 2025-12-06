import React from "react";
import { useTranslations } from "next-intl";
import {
  useCreditCardsStore,
  useCreditCardComparison,
} from "@/store/use-credit-cards-store";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Share2, Bookmark, Plus } from "lucide-react";
import { DetailedCreditCardInfo } from "@/types/credit-card";

interface ProductHeaderProps {
  card: DetailedCreditCardInfo;
  onBack?: () => void;
}

export const ProductHeader: React.FC<ProductHeaderProps> = ({
  card,
  onBack,
}) => {
  const t = useTranslations("pages.creditCard");
  const { comparisonCards } = useCreditCardComparison();
  const { addToComparison, removeFromComparison } = useCreditCardsStore();

  const isComparing = comparisonCards.some((c) => c.id === card.id);

  const handleToggleComparison = () => {
    if (isComparing) {
      removeFromComparison(card.id);
    } else {
      addToComparison(card.id);
    }
  };

  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-4">
        {onBack && (
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
        )}
        <div>
          <h1 className="text-2xl font-bold">{card.name}</h1>
          <p className="text-muted-foreground">{card.cardType}</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm">
          <Bookmark className="w-4 h-4 mr-2" />
          {t("actions.save")}
        </Button>
        <Button variant="outline" size="sm">
          <Share2 className="w-4 h-4 mr-2" />
          {t("actions.share")}
        </Button>
        <Button
          variant={isComparing ? "default" : "outline"}
          size="sm"
          onClick={handleToggleComparison}
        >
          <Plus className="w-4 h-4 mr-2" />
          {isComparing ? t("actions.comparing") : t("actions.compare")}
        </Button>
      </div>
    </div>
  );
};

export default ProductHeader;
