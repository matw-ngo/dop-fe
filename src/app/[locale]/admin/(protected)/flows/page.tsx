"use client";

import { Suspense, useState, useMemo, useCallback } from "react";
import { PlusIcon } from "lucide-react";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FlowStatusBadge } from "@/components/admin/flow-status-badge";
import { FlowActions } from "@/components/admin/flow-actions";
import { AdminBreadcrumb } from "@/components/admin/breadcrumb";
import { FlowFilters } from "@/components/admin/flow-filters";
import { FlowListSkeleton } from "@/components/admin/loading-states";
import { ErrorState, EmptyState } from "@/components/admin/error-states";
import { type ColumnDef } from "@tanstack/react-table";
import { type FlowListItem, type FlowStatus } from "@/types/admin";
import { useFlows } from "@/hooks/admin/use-admin-flows";
import AdminErrorBoundary from "@/components/admin/admin-error-boundary";
import Link from "next/link";
import { useLocalizedPath } from "@/lib/client-utils";
import { Badge } from "@/components/ui/badge";
import { PlayIcon, PauseIcon, Trash2Icon } from "lucide-react";
import { useTranslations } from "next-intl";

// FlowsPage component that uses mock API to prevent CORS issues when BE is not ready
function FlowsPage() {
  const { data: flows, isLoading, error } = useFlows();
  const [searchValue, setSearchValue] = useState("");
  const [statusFilters, setStatusFilters] = useState<FlowStatus[]>([]);
  const [selectedFlows, setSelectedFlows] = useState<FlowListItem[]>([]);
  const t = useTranslations("admin.flows");

  // Filter flows based on search and status filters
  const filteredFlows = useMemo(() => {
    if (!flows) return [];

    let filtered = flows;

    // Apply search filter
    if (searchValue) {
      filtered = filtered.filter(flow =>
        flow.name.toLowerCase().includes(searchValue.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilters.length > 0) {
      filtered = filtered.filter(flow =>
        statusFilters.includes(flow.status)
      );
    }

    return filtered;
  }, [flows, searchValue, statusFilters]);

  // Bulk action handlers
  const handleBulkActivate = useCallback(async () => {
    console.log("Bulk activate flows:", selectedFlows);
    // TODO: Implement bulk activate API call
  }, [selectedFlows]);

  const handleBulkDeactivate = useCallback(async () => {
    console.log("Bulk deactivate flows:", selectedFlows);
    // TODO: Implement bulk deactivate API call
  }, [selectedFlows]);

  const handleBulkDelete = useCallback(async () => {
    const message = t("bulkActions.selected", {
      count: selectedFlows.length,
      plural: selectedFlows.length > 1 ? "s" : ""
    });
    if (confirm(`Are you sure you want to delete ${selectedFlows.length} flow(s)? This action cannot be undone.`)) {
      console.log("Bulk delete flows:", selectedFlows);
      // TODO: Implement bulk delete API call
      setSelectedFlows([]);
    }
  }, [selectedFlows, t]);

  const columns: ColumnDef<FlowListItem>[] = [
    {
      accessorKey: "name",
      header: t("table.headers.name"),
      cell: ({ row }) => (
        <div className="font-medium">{row.original.name}</div>
      ),
    },
    {
      accessorKey: "status",
      header: t("table.headers.status"),
      cell: ({ row }) => <FlowStatusBadge status={row.original.status} />,
    },
    {
      accessorKey: "stepCount",
      header: t("table.headers.steps"),
      cell: ({ row }) => (
        <span className="text-sm text-gray-600">{row.original.stepCount}</span>
      ),
    },
    {
      accessorKey: "createdAt",
      header: t("table.headers.created"),
      cell: ({ row }) => (
        <span className="text-sm text-gray-600">
          {new Date(row.original.createdAt).toLocaleDateString()}
        </span>
      ),
    },
    {
      accessorKey: "updatedAt",
      header: t("table.headers.updated"),
      cell: ({ row }) => (
        <span className="text-sm text-gray-600">
          {new Date(row.original.updatedAt).toLocaleDateString()}
        </span>
      ),
    },
    {
      accessorKey: "actions",
      header: t("table.headers.actions"),
      cell: ({ row }) => (
        <FlowActions
          flow={row.original}
          onView={(flow) => console.log("View flow:", flow)}
          onEdit={(flow) => console.log("Edit flow:", flow)}
          onDelete={(flow) => console.log("Delete flow:", flow)}
          onDuplicate={(flow) => console.log("Duplicate flow:", flow)}
          onToggleStatus={(flow) => console.log("Toggle status:", flow)}
        />
      ),
    },
  ];

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <AdminBreadcrumb />
        <ErrorState
          title={t("errorState.title")}
          message={error.message || t("errorState.message")}
          onRetry={() => window.location.reload()}
        />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <FlowListSkeleton />
      </div>
    );
  }

  if (!flows || flows.length === 0) {
    return (
      <div className="container mx-auto p-6">
        <AdminBreadcrumb />
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold">{t("title")}</h1>
            <p className="text-muted-foreground">{t("subtitle")}</p>
          </div>
          <Button>
            <PlusIcon className="mr-2 h-4 w-4" />
            {t("newFlow")}
          </Button>
        </div>
        <EmptyState
          title={t("emptyState.title")}
          message={t("emptyState.message")}
          action={{
            label: t("emptyState.action"),
            onClick: () => console.log("Create new flow"),
          }}
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <AdminBreadcrumb />
      
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">{t("title")}</h1>
          <p className="text-muted-foreground">{t("subtitle")}</p>
        </div>
        <Button>
          <PlusIcon className="mr-2 h-4 w-4" />
          {t("newFlow")}
        </Button>
      </div>

      {/* Filters */}
      <FlowFilters
        onSearchChange={setSearchValue}
        onStatusFilterChange={setStatusFilters}
        searchValue={searchValue}
        statusFilters={statusFilters}
      />

      {/* Results Summary */}
      {(searchValue || statusFilters.length > 0) && (
        <div className="text-sm text-muted-foreground">
          {t("table.results", {
            filtered: filteredFlows.length,
            total: flows?.length || 0
          })}
        </div>
      )}

      <DataTable
        columns={columns}
        data={filteredFlows}
        isLoading={isLoading}
        searchPlaceholder={t("table.searchPlaceholder")}
        enableRowSelection={true}
        onSelectRows={setSelectedFlows}
        selectedRows={selectedFlows}
        emptyState={
          searchValue || statusFilters.length > 0
            ? t("table.emptyStateWithFilters")
            : t("table.emptyState")
        }
      />

      {/* Bulk Actions */}
      {selectedFlows.length > 0 && (
        <div className="flex items-center gap-2 p-4 bg-muted/50 rounded-md">
          <span className="text-sm text-muted-foreground">
            {t("bulkActions.selected", {
              count: selectedFlows.length,
              plural: selectedFlows.length > 1 ? "s" : ""
            })}
          </span>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleBulkActivate}
            disabled={selectedFlows.every(flow => flow.status === 'active')}
          >
            <PlayIcon className="mr-2 h-4 w-4" />
            {t("bulkActions.activate")}
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleBulkDeactivate}
            disabled={selectedFlows.every(flow => flow.status === 'inactive')}
          >
            <PauseIcon className="mr-2 h-4 w-4" />
            {t("bulkActions.deactivate")}
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleBulkDelete}
            className="text-destructive hover:text-destructive"
          >
            <Trash2Icon className="mr-2 h-4 w-4" />
            {t("bulkActions.delete")}
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedFlows([])}
          >
            {t("bulkActions.clearSelection")}
          </Button>
        </div>
      )}
    </div>
  );
}

export default function FlowsPageWrapper() {
  const t = useTranslations("admin.components.loadingStates");
  
  return (
    <AdminErrorBoundary>
      <Suspense fallback={<div>{t("loading")}</div>}>
        <FlowsPage />
      </Suspense>
    </AdminErrorBoundary>
  );
}