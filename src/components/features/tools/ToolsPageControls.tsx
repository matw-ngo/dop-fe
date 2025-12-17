"use client";

import {
  ChevronDown,
  Filter,
  Grid3X3,
  LayoutGrid,
  List,
  Search,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ToolsThemeToggle } from "./ToolsThemeToggle";

interface ToolsPageControlsProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCategory: string;
  selectedStatus: string;
  selectedComplexity: string;
  onCategoryChange: (category: string) => void;
  onStatusChange: (status: string) => void;
  onComplexityChange: (complexity: string) => void;
  activeFiltersCount: number;
  onClearFilters: () => void;
  viewMode: "grid" | "list" | "compact";
  onViewModeChange: (mode: "grid" | "list" | "compact") => void;
  toolsCount: number;
}

export default function ToolsPageControls({
  searchQuery,
  onSearchChange,
  selectedCategory,
  selectedStatus,
  selectedComplexity,
  onCategoryChange,
  onStatusChange,
  onComplexityChange,
  activeFiltersCount,
  onClearFilters,
  viewMode,
  onViewModeChange,
  toolsCount,
}: ToolsPageControlsProps) {
  const t = useTranslations("features.tools.list");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const categoryOptions = [
    { value: "calculators", label: t("filters.categories.calculators") },
    { value: "converters", label: t("filters.categories.converters") },
    { value: "analyzers", label: t("filters.categories.analyzers") },
  ];

  const statusOptions = [
    { value: "available", label: t("filters.status.available") },
    { value: "coming-soon", label: t("filters.status.comingSoon") },
  ];

  const complexityOptions = [
    { value: "basic", label: t("filters.complexity.basic") },
    { value: "advanced", label: t("filters.complexity.advanced") },
  ];

  const viewModeOptions = [
    { value: "grid", label: t("viewMode.grid"), icon: Grid3X3 },
    { value: "compact", label: t("viewMode.compact"), icon: LayoutGrid },
    { value: "list", label: t("viewMode.list"), icon: List },
  ];

  return (
    <div className="bg-card border-b sticky top-16 z-40">
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          {/* Search Bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder={t("search.placeholder")}
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2">
            {/* Quick Filters */}
            <div className="hidden md:flex items-center gap-2">
              <Select value={selectedCategory} onValueChange={onCategoryChange}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder={t("filters.categories.title")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("filters.all")}</SelectItem>
                  {categoryOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedStatus} onValueChange={onStatusChange}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder={t("filters.status.title")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("filters.all")}</SelectItem>
                  {statusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Filter Dropdown (Mobile) */}
            <DropdownMenu open={isFilterOpen} onOpenChange={setIsFilterOpen}>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="md:hidden">
                  <Filter className="w-4 h-4 mr-2" />
                  {t("filters.title")}
                  {activeFiltersCount > 0 && (
                    <Badge variant="secondary" className="ml-2 text-xs">
                      {activeFiltersCount}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="p-2 space-y-3">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">
                      {t("filters.categories.title")}
                    </label>
                    <Select
                      value={selectedCategory}
                      onValueChange={onCategoryChange}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue
                          placeholder={t("filters.categories.title")}
                        />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">{t("filters.all")}</SelectItem>
                        {categoryOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-muted-foreground">
                      {t("filters.status.title")}
                    </label>
                    <Select
                      value={selectedStatus}
                      onValueChange={onStatusChange}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder={t("filters.status.title")} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">{t("filters.all")}</SelectItem>
                        {statusOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-muted-foreground">
                      {t("filters.complexity.title")}
                    </label>
                    <Select
                      value={selectedComplexity}
                      onValueChange={onComplexityChange}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue
                          placeholder={t("filters.complexity.title")}
                        />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">{t("filters.all")}</SelectItem>
                        {complexityOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {activeFiltersCount > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={onClearFilters}
                      className="w-full"
                    >
                      {t("filters.clearAll")}
                    </Button>
                  )}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* View Mode Toggle */}
            <div className="hidden md:flex items-center border rounded-md">
              {viewModeOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <Button
                    key={option.value}
                    variant={viewMode === option.value ? "default" : "ghost"}
                    size="sm"
                    onClick={() => onViewModeChange(option.value as any)}
                    className="rounded-none border-0"
                  >
                    <Icon className="w-4 h-4" />
                    <span className="ml-2 hidden lg:inline">
                      {option.label}
                    </span>
                  </Button>
                );
              })}
            </div>

            {/* Theme Toggle */}
            <div className="flex items-center">
              <ToolsThemeToggle />
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mt-2 text-sm text-muted-foreground">
          {searchQuery || activeFiltersCount > 0 ? (
            <>
              {t("results.filtered", { count: toolsCount })}
              {searchQuery && (
                <span>
                  {" "}
                  {t("results.for")} "{searchQuery}"
                </span>
              )}
              {activeFiltersCount > 0 && (
                <Button
                  variant="link"
                  onClick={onClearFilters}
                  className="ml-2 h-auto p-0 text-sm"
                >
                  {t("filters.clearAll")}
                </Button>
              )}
            </>
          ) : (
            t("results.all", { count: toolsCount })
          )}
        </div>
      </div>
    </div>
  );
}
