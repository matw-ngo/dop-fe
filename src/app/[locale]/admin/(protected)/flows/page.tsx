"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { PauseIcon, PlayIcon, PlusIcon, Trash2Icon } from "lucide-react";
import { useTranslations } from "next-intl";
import { Suspense, useCallback, useMemo, useState } from "react";
import AdminErrorBoundary from "@/components/admin/admin-error-boundary";
import { AdminBreadcrumb } from "@/components/admin/breadcrumb";
import { EmptyState, ErrorState } from "@/components/admin/error-states";
import { FlowActions } from "@/components/admin/flow-actions";
import { FlowFilters } from "@/components/admin/flow-filters";
import { FlowStatusBadge } from "@/components/admin/flow-status-badge";
import { FlowListSkeleton } from "@/components/admin/loading-states";
import { StepManagementDialog } from "@/components/admin/step-management-dialog";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import {
  useDeleteFlow,
  useDuplicateFlow,
  useFlows,
  usePrefetchFlows,
  useToggleFlowStatus,
} from "@/hooks/admin/use-admin-flows";
import type { FlowListItem, FlowStatus } from "@/types/admin";

// FlowsPage component that uses mock API to prevent CORS issues when BE is not ready
function FlowsPage() {
  const { data: flows, isLoading, error } = useFlows();
  const [searchValue, setSearchValue] = useState("");
  const [statusFilters, setStatusFilters] = useState<FlowStatus[]>([]);
  const [selectedFlows, setSelectedFlows] = useState<FlowListItem[]>([]);
  const [showStepManagementDialog, setShowStepManagementDialog] =
    useState(false);
  const [selectedFlowId, setSelectedFlowId] = useState<string | undefined>(
    undefined,
  );
  const t = useTranslations("admin.flows");

  // Prefetch flows for better UX
  const _prefetchFlows = usePrefetchFlows();

  // Mutations for bulk actions
  const deleteFlowMutation = useDeleteFlow();
  const _duplicateFlowMutation = useDuplicateFlow();
  const toggleFlowStatusMutation = useToggleFlowStatus();

  // Filter flows based on search and status filters (now handled by DataTable)
  const filteredFlows = useMemo(() => {
    // Return flows as-is since DataTable will handle filtering
    return flows || [];
  }, [flows]);

  // Bulk action handlers
  const handleBulkActivate = useCallback(async () => {
    const inactiveFlows = selectedFlows.filter(
      (flow) => flow.status !== "active",
    );
    const promises = inactiveFlows.map((flow) =>
      toggleFlowStatusMutation.mutateAsync(flow.id),
    );

    try {
      await Promise.all(promises);
      setSelectedFlows([]);
    } catch (_error) {
      // Error handling is done in the mutation
    }
  }, [selectedFlows, toggleFlowStatusMutation]);

  const handleBulkDeactivate = useCallback(async () => {
    const activeFlows = selectedFlows.filter(
      (flow) => flow.status === "active",
    );
    const promises = activeFlows.map((flow) =>
      toggleFlowStatusMutation.mutateAsync(flow.id),
    );

    try {
      await Promise.all(promises);
      setSelectedFlows([]);
    } catch (_error) {
      // Error handling is done in the mutation
    }
  }, [selectedFlows, toggleFlowStatusMutation]);

  const handleBulkDelete = useCallback(async () => {
    const _message = t("bulkActions.selected", {
      count: selectedFlows.length,
      plural: selectedFlows.length > 1 ? "s" : "",
    });
    if (
      confirm(
        `Are you sure you want to delete ${selectedFlows.length} flow(s)? This action cannot be undone.`,
      )
    ) {
      const promises = selectedFlows.map((flow) =>
        deleteFlowMutation.mutateAsync(flow.id),
      );

      try {
        await Promise.all(promises);
        setSelectedFlows([]);
      } catch (_error) {
        // Error handling is done in the mutation
      }
    }
  }, [selectedFlows, t, deleteFlowMutation]);

  const handleManageSteps = (flow: FlowListItem) => {
    setSelectedFlowId(flow.id);
    setShowStepManagementDialog(true);
  };

  const columns: ColumnDef<FlowListItem>[] = [
    {
      accessorKey: "name",
      header: t("table.headers.name"),
      cell: ({ row }) => <div className="font-medium">{row.original.name}</div>,
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
      accessorKey: "actions",
      header: t("table.headers.actions"),
      cell: ({ row }) => (
        <FlowActions flow={row.original} onManageSteps={handleManageSteps} />
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
            total: flows?.length || 0,
          })}
        </div>
      )}

      <DataTable
        columns={columns}
        data={filteredFlows}
        isLoading={isLoading}
        searchPlaceholder={t("table.searchPlaceholder")}
        searchColumn="name"
        enableRowSelection={true}
        onSelectRows={setSelectedFlows}
        selectedRows={selectedFlows}
        enableColumnVisibility={true}
        enableExport={true}
        enableFilters={true}
        onRowClick={(row) => {
          // Handle row click if needed
          console.log("Row clicked:", row);
        }}
        emptyState={
          searchValue || statusFilters.length > 0
            ? t("table.emptyStateWithFilters")
            : t("table.emptyState")
        }
        initialPageSize={10}
        initialSorting={[{ id: "createdAt", desc: true }]}
        initialColumnVisibility={{
          name: true,
          status: true,
          stepCount: true,
          createdAt: true,
          actions: true,
        }}
      />

      {/* Bulk Actions */}
      {selectedFlows.length > 0 && (
        <div className="flex items-center gap-2 p-4 bg-muted/50 rounded-md">
          <span className="text-sm text-muted-foreground">
            {t("bulkActions.selected", {
              count: selectedFlows.length,
              plural: selectedFlows.length > 1 ? "s" : "",
            })}
          </span>

          <Button
            variant="outline"
            size="sm"
            onClick={handleBulkActivate}
            disabled={
              selectedFlows.every((flow) => flow.status === "active") ||
              toggleFlowStatusMutation.isPending
            }
          >
            {toggleFlowStatusMutation.isPending ? (
              <PlayIcon className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <PlayIcon className="mr-2 h-4 w-4" />
            )}
            {t("bulkActions.activate")}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleBulkDeactivate}
            disabled={
              selectedFlows.every((flow) => flow.status === "inactive") ||
              toggleFlowStatusMutation.isPending
            }
          >
            {toggleFlowStatusMutation.isPending ? (
              <PauseIcon className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <PauseIcon className="mr-2 h-4 w-4" />
            )}
            {t("bulkActions.deactivate")}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleBulkDelete}
            className="text-destructive hover:text-destructive"
            disabled={deleteFlowMutation.isPending}
          >
            {deleteFlowMutation.isPending ? (
              <Trash2Icon className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Trash2Icon className="mr-2 h-4 w-4" />
            )}
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

      {/* Step Management Dialog */}
      <StepManagementDialog
        flowId={selectedFlowId || ""}
        open={showStepManagementDialog}
        onOpenChange={setShowStepManagementDialog}
      />
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
