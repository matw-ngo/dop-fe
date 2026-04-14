"use client";

import { XIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCallback, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { FlowStatus } from "@/types/admin";

interface FlowFiltersProps {
  onSearchChange: (search: string) => void;
  onStatusFilterChange: (statuses: FlowStatus[]) => void;
  searchValue?: string;
  statusFilters?: FlowStatus[];
  className?: string;
}

export function FlowFilters({
  onSearchChange,
  onStatusFilterChange,
  searchValue = "",
  statusFilters = [],
  className,
}: FlowFiltersProps) {
  const [localSearch, setLocalSearch] = useState(searchValue);
  const t = useTranslations("admin.flows.filters");

  const statusOptions: { value: FlowStatus; label: string; color: string }[] = [
    {
      value: "active",
      label: t("statusOptions.active"),
      color: "bg-green-100 text-green-800",
    },
    {
      value: "inactive",
      label: t("statusOptions.inactive"),
      color: "bg-gray-100 text-gray-800",
    },
    {
      value: "draft",
      label: t("statusOptions.draft"),
      color: "bg-yellow-100 text-yellow-800",
    },
    {
      value: "archived",
      label: t("statusOptions.archived"),
      color: "bg-red-100 text-red-800",
    },
  ];

  const _handleSearchSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      onSearchChange(localSearch);
    },
    [localSearch, onSearchChange],
  );

  const handleStatusToggle = useCallback(
    (status: FlowStatus) => {
      const newFilters = statusFilters.includes(status)
        ? statusFilters.filter((s) => s !== status)
        : [...statusFilters, status];

      onStatusFilterChange(newFilters);
    },
    [statusFilters, onStatusFilterChange],
  );

  const clearAllFilters = useCallback(() => {
    setLocalSearch("");
    onSearchChange("");
    onStatusFilterChange([]);
  }, [onSearchChange, onStatusFilterChange]);

  const hasActiveFilters = useMemo(
    () => searchValue || statusFilters.length > 0,
    [searchValue, statusFilters.length],
  );

  return (
    <div
      className={`flex flex-col gap-4 sm:flex-row sm:items-center ${className}`}
    >
      {/* Search */}
      {/* <form onSubmit={handleSearchSubmit} className="flex-1 sm:max-w-sm">
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t("searchPlaceholder")}
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className="pl-10 w-full"
          />
        </div>
      </form> */}

      {/* Status Filter */}
      {/* <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="gap-2">
            <FilterIcon className="h-4 w-4" />
            {t("status")}
            {statusFilters.length > 0 && (
              <Badge variant="secondary" className="ml-1">
                {statusFilters.length}
              </Badge>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          {statusOptions.map((option) => (
            <DropdownMenuItem
              key={option.value}
              onClick={() => handleStatusToggle(option.value)}
              className="flex items-center justify-between"
            >
              <span>{option.label}</span>
              {statusFilters.includes(option.value) && (
                <div className="h-2 w-2 rounded-full bg-primary" />
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu> */}

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2 sm:flex-nowrap">
          {/* Search Filter Badge */}
          {searchValue && (
            <Badge variant="secondary" className="gap-1">
              {t("activeFilters.search", { value: searchValue })}
              <button
                onClick={() => {
                  setLocalSearch("");
                  onSearchChange("");
                }}
                className="ml-1 hover:bg-secondary-foreground/20 rounded-full p-0.5"
              >
                <XIcon className="h-3 w-3" />
              </button>
            </Badge>
          )}

          {/* Status Filter Badges */}
          {statusFilters.map((status) => {
            const statusOption = statusOptions.find(
              (opt) => opt.value === status,
            );
            return (
              <Badge
                key={status}
                variant="secondary"
                className={`gap-1 ${statusOption?.color}`}
              >
                {statusOption?.label}
                <button
                  onClick={() => handleStatusToggle(status)}
                  className="ml-1 hover:bg-secondary-foreground/20 rounded-full p-0.5"
                >
                  <XIcon className="h-3 w-3" />
                </button>
              </Badge>
            );
          })}

          {/* Clear All */}
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            className="text-muted-foreground hover:text-foreground"
          >
            {t("activeFilters.clearAll")}
          </Button>
        </div>
      )}
    </div>
  );
}
