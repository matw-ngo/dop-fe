import { ArrowRight, CreditCard, Filter, Search } from "lucide-react";
import { useTranslations } from "next-intl";
import type React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  type: "no-results" | "no-comparison" | "no-filters" | "error";
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  type,
  onAction,
  className,
}) => {
  const t = useTranslations("features.credit-cards.listing");

  const getEmptyStateContent = () => {
    switch (type) {
      case "no-results":
        return {
          icon: <Search className="w-16 h-16 text-muted-foreground/50" />,
          title: t("noResults.title"),
          description: t("noResults.description"),
          action: onAction ? (
            <Button onClick={onAction} className="gap-2">
              {t("noResults.action")}
              <ArrowRight className="w-4 h-4" />
            </Button>
          ) : null,
        };

      case "no-comparison":
        return {
          icon: <CreditCard className="w-16 h-16 text-muted-foreground/50" />,
          title: t("noComparison.title"),
          description: t("noComparison.description"),
          action: onAction ? (
            <Button onClick={onAction} className="gap-2">
              {t("noComparison.action")}
              <ArrowRight className="w-4 h-4" />
            </Button>
          ) : null,
        };

      case "no-filters":
        return {
          icon: <Filter className="w-16 h-16 text-muted-foreground/50" />,
          title: t("noFilters.title"),
          description: t("noFilters.description"),
          action: onAction ? (
            <Button onClick={onAction} className="gap-2">
              {t("noFilters.action")}
              <ArrowRight className="w-4 h-4" />
            </Button>
          ) : null,
        };

      case "error":
        return {
          icon: <Search className="w-16 h-16 text-destructive/50" />,
          title: t("error.title"),
          description: t("error.description"),
          action: onAction ? (
            <Button onClick={onAction} variant="outline">
              {t("error.action")}
            </Button>
          ) : null,
        };

      default:
        return {
          icon: <Search className="w-16 h-16 text-muted-foreground/50" />,
          title: t("generic.title"),
          description: t("generic.description"),
          action: null,
        };
    }
  };

  const content = getEmptyStateContent();

  return (
    <Card className={cn("border-dashed", className)}>
      <CardContent className="flex flex-col items-center justify-center text-center py-16">
        <div className="mb-4">{content.icon}</div>
        <h3 className="text-xl font-semibold mb-2">{content.title}</h3>
        <p className="text-muted-foreground mb-6 max-w-md">
          {content.description}
        </p>
        {content.action}
      </CardContent>
    </Card>
  );
};

export default EmptyState;
