import React from "react";
import { Progress } from "@/components/ui/progress";
import { formatCurrency } from "@/lib/utils";
import type { CoverageItemProps } from "../types";
import { getCoverageProgress, getColorClass, getProgressColorClass } from "../utils";

export const CoverageItem = React.memo(function CoverageItem({
  title,
  limit,
  maxLimit,
  icon,
  color,
  t,
}: CoverageItemProps) {
  const progress = getCoverageProgress(limit, maxLimit);

  return (
    <div className="p-4 bg-white rounded-lg border shadow-sm">
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-2">
          <div className={`p-2 rounded-full ${getColorClass(color)}`}>
            {icon}
          </div>
          <span className="font-medium">{title}</span>
        </div>
        <span className="font-bold text-lg">{formatCurrency(limit)}</span>
      </div>
      <div className="mt-2">
        <div className="flex justify-between text-xs text-muted-foreground mb-1">
          <span>{t("coverageLevel")}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <Progress
          value={progress}
          className="h-2"
          indicatorClassName={getProgressColorClass(color)}
        />
      </div>
    </div>
  );
});