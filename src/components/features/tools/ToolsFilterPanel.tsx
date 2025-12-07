"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronUp, Filter } from "lucide-react";

interface ToolCategory {
  id: string;
  label: string;
  count: number;
}

interface ToolsFilterPanelProps {
  selectedCategory?: string;
  selectedStatus?: string;
  selectedComplexity?: string;
  onCategoryChange: (category: string) => void;
  onStatusChange: (status: string) => void;
  onComplexityChange: (complexity: string) => void;
  onClearAll: () => void;
}

export default function ToolsFilterPanel({
  selectedCategory,
  selectedStatus,
  selectedComplexity,
  onCategoryChange,
  onStatusChange,
  onComplexityChange,
  onClearAll,
}: ToolsFilterPanelProps) {
  const t = useTranslations("features.tools.list");
  const [isCategoryOpen, setIsCategoryOpen] = useState(true);
  const [isStatusOpen, setIsStatusOpen] = useState(true);
  const [isComplexityOpen, setIsComplexityOpen] = useState(true);

  const categories: ToolCategory[] = [
    { id: "calculators", label: t("filters.categories.calculators"), count: 3 },
    { id: "converters", label: t("filters.categories.converters"), count: 2 },
    { id: "analyzers", label: t("filters.categories.analyzers"), count: 0 },
  ];

  const statuses = [
    { id: "available", label: t("filters.status.available"), count: 4 },
    { id: "coming-soon", label: t("filters.status.comingSoon"), count: 2 },
  ];

  const complexities = [
    { id: "basic", label: t("filters.complexity.basic"), count: 2 },
    { id: "advanced", label: t("filters.complexity.advanced"), count: 2 },
  ];

  const activeFiltersCount = [
    selectedCategory,
    selectedStatus,
    selectedComplexity,
  ].filter(Boolean).length;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4" />
          <h3 className="font-semibold">{t("filters.title")}</h3>
          {activeFiltersCount > 0 && (
            <Badge variant="secondary" className="text-xs">
              {activeFiltersCount}
            </Badge>
          )}
        </div>
        {activeFiltersCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearAll}
            className="text-xs"
          >
            {t("filters.clearAll")}
          </Button>
        )}
      </div>

      {/* Category Filter */}
      <Collapsible open={isCategoryOpen} onOpenChange={setIsCategoryOpen}>
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            className="w-full justify-between font-normal"
          >
            {t("filters.categories.title")}
            {isCategoryOpen ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-2 mt-2">
          {categories.map((category) => (
            <div
              key={category.id}
              className="flex items-center justify-between cursor-pointer hover:bg-muted/50 rounded p-2 transition-colors"
              onClick={() =>
                onCategoryChange(
                  selectedCategory === category.id ? "" : category.id,
                )
              }
            >
              <span className="text-sm">{category.label}</span>
              <div className="flex items-center gap-2">
                <Badge
                  variant={
                    selectedCategory === category.id ? "default" : "secondary"
                  }
                  className="text-xs"
                >
                  {category.count}
                </Badge>
                {selectedCategory === category.id && (
                  <div className="w-2 h-2 bg-primary rounded-full" />
                )}
              </div>
            </div>
          ))}
        </CollapsibleContent>
      </Collapsible>

      {/* Status Filter */}
      <Collapsible open={isStatusOpen} onOpenChange={setIsStatusOpen}>
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            className="w-full justify-between font-normal"
          >
            {t("filters.status.title")}
            {isStatusOpen ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-2 mt-2">
          {statuses.map((status) => (
            <div
              key={status.id}
              className="flex items-center justify-between cursor-pointer hover:bg-muted/50 rounded p-2 transition-colors"
              onClick={() =>
                onStatusChange(selectedStatus === status.id ? "" : status.id)
              }
            >
              <span className="text-sm">{status.label}</span>
              <div className="flex items-center gap-2">
                <Badge
                  variant={
                    selectedStatus === status.id ? "default" : "secondary"
                  }
                  className="text-xs"
                >
                  {status.count}
                </Badge>
                {selectedStatus === status.id && (
                  <div className="w-2 h-2 bg-primary rounded-full" />
                )}
              </div>
            </div>
          ))}
        </CollapsibleContent>
      </Collapsible>

      {/* Complexity Filter */}
      <Collapsible open={isComplexityOpen} onOpenChange={setIsComplexityOpen}>
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            className="w-full justify-between font-normal"
          >
            {t("filters.complexity.title")}
            {isComplexityOpen ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-2 mt-2">
          {complexities.map((complexity) => (
            <div
              key={complexity.id}
              className="flex items-center justify-between cursor-pointer hover:bg-muted/50 rounded p-2 transition-colors"
              onClick={() =>
                onComplexityChange(
                  selectedComplexity === complexity.id ? "" : complexity.id,
                )
              }
            >
              <span className="text-sm">{complexity.label}</span>
              <div className="flex items-center gap-2">
                <Badge
                  variant={
                    selectedComplexity === complexity.id
                      ? "default"
                      : "secondary"
                  }
                  className="text-xs"
                >
                  {complexity.count}
                </Badge>
                {selectedComplexity === complexity.id && (
                  <div className="w-2 h-2 bg-primary rounded-full" />
                )}
              </div>
            </div>
          ))}
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
