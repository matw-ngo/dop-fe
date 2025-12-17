import { Download, X } from "lucide-react";
import { useTranslations } from "next-intl";
import type React from "react";
import { Button } from "@/components/ui/button";

interface ComparisonHeaderProps {
  cardCount: number;
  onClose?: () => void;
  onExport?: () => void;
}

export const ComparisonHeader: React.FC<ComparisonHeaderProps> = ({
  cardCount,
  onClose,
  onExport,
}) => {
  const t = useTranslations("features.credit-cards.comparison");

  return (
    <div className="flex items-center justify-between p-4 border-b bg-muted/30">
      <div>
        <h2 className="text-lg font-semibold">
          {t("comparison.title")} ({cardCount})
        </h2>
        <p className="text-sm text-muted-foreground">
          {t("comparison.subtitle")}
        </p>
      </div>
      <div className="flex items-center gap-2">
        {onExport && (
          <Button variant="outline" size="sm" onClick={onExport}>
            <Download className="w-4 h-4 mr-2" />
            {t("comparison.export")}
          </Button>
        )}
        {onClose && (
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );
};

export default ComparisonHeader;
