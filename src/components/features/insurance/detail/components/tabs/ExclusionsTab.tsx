import React from "react";
import { Badge } from "@/components/ui/badge";
import {
  Ban,
  X,
  Clock,
  Timer,
  Calendar,
  AlertTriangle,
  FileText,
  ChevronRight,
  Check,
} from "lucide-react";

interface ExclusionsTabProps {
  product: any;
  t: any;
}

export const ExclusionsTab: React.FC<ExclusionsTabProps> = ({ product, t }) => {
  return (
    <div className="mt-6 space-y-6">
      {/* Exclusions List */}
      <div className="bg-destructive/5 p-6 rounded-xl">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Ban className="w-5 h-5 text-destructive" />
          {t("tabs.exclusions.list.title")}
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          {t("tabs.exclusions.list.description")}
        </p>
        <div className="grid gap-3">
          {product.exclusions.map((exclusion: string, index: number) => (
            <div
              key={index}
              className="flex items-start gap-3 p-3 bg-card rounded-lg border border-destructive/20"
            >
              <X className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
              <span className="text-sm">{exclusion}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Waiting Periods */}
      {(product.waitingPeriods.general > 0 ||
        product.waitingPeriods.specific) && (
        <div className="bg-primary/5 border border-primary/20 p-6 rounded-xl">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            {t("tabs.exclusions.waitingPeriods.title")}
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            {t("tabs.exclusions.waitingPeriods.description")}
          </p>

          {product.waitingPeriods.general > 0 && (
            <div className="mb-4 p-4 bg-card rounded-lg border">
              <div className="flex items-center gap-2 mb-2">
                <Timer className="w-4 h-4 text-primary" />
                <span className="font-medium">
                  {t("tabs.exclusions.waitingPeriods.general")}
                </span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-2xl font-bold text-primary">
                  {product.waitingPeriods.general}
                </span>
                <span className="text-muted-foreground">{t("units.days")}</span>
              </div>
            </div>
          )}

          {product.waitingPeriods.specific && (
            <div>
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-primary" />
                {t("tabs.exclusions.waitingPeriods.specific")}
              </h4>
              <div className="grid gap-3">
                {Object.entries(product.waitingPeriods.specific).map(
                  ([condition, days]: [string, any]) => (
                    <div
                      key={condition}
                      className="flex justify-between items-center p-3 bg-card rounded-lg border"
                    >
                      <span className="text-sm font-medium">{condition}</span>
                      <Badge
                        variant="outline"
                        className="text-primary border-primary/20"
                      >
                        {days} {t("units.days")}
                      </Badge>
                    </div>
                  ),
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Pre-existing Conditions */}
      {product.eligibility.preExistingConditions && (
        <div className="bg-muted/30 border border-border p-6 rounded-xl">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-muted-foreground" />
            {t("tabs.exclusions.preExistingConditions.title")}
          </h3>

          {product.eligibility.preExistingConditions.allowed.length > 0 && (
            <div className="mb-4">
              <h4 className="font-medium mb-2 text-foreground">
                {t("tabs.exclusions.preExistingConditions.allowed")}
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {product.eligibility.preExistingConditions.allowed.map(
                  (condition: string, index: number) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="bg-primary/10 text-primary"
                    >
                      <Check className="w-3 h-3 mr-1" />
                      {condition}
                    </Badge>
                  ),
                )}
              </div>
            </div>
          )}

          {product.eligibility.preExistingConditions.notAllowed.length > 0 && (
            <div className="mb-4">
              <h4 className="font-medium mb-2 text-destructive">
                {t("tabs.exclusions.preExistingConditions.notAllowed")}
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {product.eligibility.preExistingConditions.notAllowed.map(
                  (condition: string, index: number) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="bg-destructive/10 text-destructive"
                    >
                      <X className="w-3 h-3 mr-1" />
                      {condition}
                    </Badge>
                  ),
                )}
              </div>
            </div>
          )}

          {product.eligibility.preExistingConditions.loading &&
            product.eligibility.preExistingConditions.loading.length > 0 && (
              <div>
                <h4 className="font-medium mb-2 text-foreground">
                  {t("tabs.exclusions.preExistingConditions.loading")}
                </h4>
                <div className="space-y-2">
                  {product.eligibility.preExistingConditions.loading.map(
                    (item: any, index: number) => (
                      <div
                        key={index}
                        className="flex justify-between items-center p-2 bg-card rounded border"
                      >
                        <span className="text-sm">{item.condition}</span>
                        <Badge
                          variant="outline"
                          className="text-muted-foreground"
                        >
                          +{item.increase}%
                        </Badge>
                      </div>
                    ),
                  )}
                </div>
              </div>
            )}
        </div>
      )}

      {/* Special Terms */}
      <div className="bg-muted/30 border border-border p-6 rounded-xl">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5 text-muted-foreground" />
          {t("tabs.exclusions.specialTerms.title")}
        </h3>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li className="flex items-start gap-2">
            <ChevronRight className="w-4 h-4 mt-0.5 flex-shrink-0 text-muted-foreground" />
            <span>{t("tabs.exclusions.specialTerms.term1")}</span>
          </li>
          <li className="flex items-start gap-2">
            <ChevronRight className="w-4 h-4 mt-0.5 flex-shrink-0 text-muted-foreground" />
            <span>{t("tabs.exclusions.specialTerms.term2")}</span>
          </li>
          <li className="flex items-start gap-2">
            <ChevronRight className="w-4 h-4 mt-0.5 flex-shrink-0 text-muted-foreground" />
            <span>{t("tabs.exclusions.specialTerms.term3")}</span>
          </li>
          <li className="flex items-start gap-2">
            <ChevronRight className="w-4 h-4 mt-0.5 flex-shrink-0 text-muted-foreground" />
            <span>{t("tabs.exclusions.specialTerms.term4")}</span>
          </li>
        </ul>
      </div>
    </div>
  );
};
