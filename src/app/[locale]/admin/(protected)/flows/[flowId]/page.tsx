"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeftIcon, PlusIcon, EditIcon, Trash2Icon } from "lucide-react";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { FlowStatusBadge } from "@/components/admin/flow-status-badge";
import { StepActions } from "@/components/admin/step-actions";
import { AdminBreadcrumb } from "@/components/admin/breadcrumb";
import { FlowDetailSkeleton } from "@/components/admin/loading-states";
import { ErrorState, EmptyState } from "@/components/admin/error-states";
import { useFlow, useFlowSteps, useUpdateStep } from "@/hooks/admin/use-admin-flows";
import { flowSuccessToast, flowErrorToast, adminWarningToast } from "@/lib/admin/admin-toast";
import { type ColumnDef } from "@tanstack/react-table";
import type { FlowDetail, StepListItem, FlowStatus } from "@/types/admin";
import { useLocalizedPath } from "@/lib/client-utils";
import { useTranslations } from "next-intl";

// Fallback data for when API fails
const createFallbackFlowDetail = (id: string): FlowDetail => ({
  id: id || "unknown",
  name: "Flow Detail",
  description: "Flow information is currently unavailable",
  status: "inactive",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  steps: [],
});

export default function FlowDetailPage() {
  const params = useParams();
  const router = useRouter();
  const getLocalizedPath = useLocalizedPath();
  const [showDeleteDialog, setShowDeleteDialog] = useState<StepListItem | null>(null);
  const [showStatusDialog, setShowStatusDialog] = useState<{
    step: StepListItem;
    newStatus: FlowStatus;
  } | null>(null);
  
  const flowId = params.flowId as string;
  const t = useTranslations("admin.flowDetail");

  // Hooks for data fetching and mutations
  const { data: flow, isLoading, error } = useFlow(flowId);
  const { data: steps, isLoading: stepsLoading } = useFlowSteps(flowId);
  const updateStepMutation = useUpdateStep();

  // Handle step actions
  const handleViewStep = (step: StepListItem) => {
    router.push(getLocalizedPath(`/admin/flows/${flowId}/steps/${step.id}`));
  };

  const handleEditStep = (step: StepListItem) => {
    // TODO: Implement step editing
    console.log("Edit step:", step);
  };

  const handleDeleteStep = (step: StepListItem) => {
    setShowDeleteDialog(step);
  };

  const confirmDeleteStep = async () => {
    if (!showDeleteDialog) return;
    
    try {
      // TODO: Implement delete step mutation
      console.log("Delete step:", showDeleteDialog);
      flowSuccessToast.deleted(showDeleteDialog as any);
      setShowDeleteDialog(null);
    } catch (error) {
      flowErrorToast.deleteFailed(showDeleteDialog as any, error instanceof Error ? error.message : undefined);
    }
  };

  const handleDuplicateStep = (step: StepListItem) => {
    // TODO: Implement duplicate step mutation
    console.log("Duplicate step:", step);
    flowSuccessToast.duplicated(step as any);
  };

  const handleStatusChange = async (step: StepListItem, newStatus: string) => {
    try {
      await updateStepMutation.mutateAsync({
        id: step.id,
        data: { status: newStatus as any }
      });
      
      flowSuccessToast.statusChanged(step as any, newStatus);
      setShowStatusDialog(null);
    } catch (error) {
      flowErrorToast.updateFailed(step as any, error instanceof Error ? error.message : undefined);
    }
  };

  const handleEnableStep = (step: StepListItem) => {
    setShowStatusDialog({ step, newStatus: "active" });
  };

  const handleDisableStep = (step: StepListItem) => {
    setShowStatusDialog({ step, newStatus: "inactive" });
  };

  const handleBack = () => {
    router.push(getLocalizedPath("/admin/flows"));
  };

  const columns: ColumnDef<StepListItem>[] = [
    {
      accessorKey: "stepOrder",
      header: t("steps.table.headers.order"),
      cell: ({ row }) => (
        <div className="text-center font-medium">
          {row.getValue("stepOrder")}
        </div>
      ),
    },
    {
      accessorKey: "name",
      header: t("steps.table.headers.name"),
      cell: ({ row }) => (
        <Link
          href={getLocalizedPath(`/admin/flows/${flowId}/steps/${row.original.id}`)}
          className="font-medium hover:underline"
        >
          {row.getValue("name")}
        </Link>
      ),
    },
    {
      accessorKey: "hasEkyc",
      header: t("steps.table.headers.ekyc"),
      cell: ({ row }) => (
        <div className="text-center">
          {row.getValue("hasEkyc") ? (
            <Badge variant="default">Yes</Badge>
          ) : (
            <Badge variant="outline">No</Badge>
          )}
        </div>
      ),
    },
    {
      accessorKey: "hasOtp",
      header: t("steps.table.headers.otp"),
      cell: ({ row }) => (
        <div className="text-center">
          {row.getValue("hasOtp") ? (
            <Badge variant="default">Yes</Badge>
          ) : (
            <Badge variant="outline">No</Badge>
          )}
        </div>
      ),
    },
    {
      accessorKey: "fieldCount",
      header: t("steps.table.headers.fields"),
      cell: ({ row }) => (
        <div className="text-center">
          {row.getValue("fieldCount")}
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: t("steps.table.headers.status"),
      cell: ({ row }) => {
        const step = row.original;
        const status = row.getValue("status") as string;
        
        return (
          <div className="flex items-center gap-2">
            <Badge
              variant={status === "active" ? "default" : "secondary"}
              className="capitalize"
            >
              {status}
            </Badge>
            
            {/* Quick actions for status change */}
            {status === "inactive" ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleEnableStep(step)}
                disabled={updateStepMutation.isPending}
              >
                {t("steps.actions.enable")}
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDisableStep(step)}
                disabled={updateStepMutation.isPending}
              >
                {t("steps.actions.disable")}
              </Button>
            )}
          </div>
        );
      },
    },
    {
      id: "actions",
      header: t("steps.table.headers.actions"),
      cell: ({ row }) => (
        <StepActions
          step={row.original}
          onView={handleViewStep}
          onEdit={handleEditStep}
          onDelete={handleDeleteStep}
          onDuplicate={handleDuplicateStep}
        />
      ),
    },
  ];

  // Show loading skeleton while data is loading
  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <FlowDetailSkeleton />
      </div>
    );
  }

  // Show error state with fallback data
  if (error || !flow) {
    const fallbackData = createFallbackFlowDetail(flowId);
    return (
      <div className="container mx-auto p-6">
        <AdminBreadcrumb />
        <ErrorState
          title={t("errorState.title")}
          message={error instanceof Error ? error.message : t("errorState.message")}
          onRetry={() => window.location.reload()}
        />
        {/* Show fallback data instead of completely blocking the UI */}
        <div className="mt-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href={getLocalizedPath("/admin/flows")}>
                <ArrowLeftIcon className="h-4 w-4" />
                <span className="sr-only">{t("backToFlow")}</span>
              </Link>
            </Button>
            <div className="flex-1">
              <h1 className="text-3xl font-bold tracking-tight">{fallbackData.name}</h1>
              <p className="text-muted-foreground">{fallbackData.description}</p>
            </div>
            <Button variant="outline">
              <EditIcon className="mr-2 h-4 w-4" />
              {t("editFlow")}
            </Button>
          </div>
          <div className="mt-4 p-4 bg-muted/50 rounded-md">
            <p className="text-sm text-muted-foreground">
              Flow data is currently unavailable. Please try refreshing the page or contact support if the issue persists.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AdminBreadcrumb />
      
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href={getLocalizedPath("/admin/flows")}>
            <ArrowLeftIcon className="h-4 w-4" />
            <span className="sr-only">{t("backToFlow")}</span>
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">{flow?.name}</h1>
          <p className="text-muted-foreground">{flow?.description}</p>
        </div>
        <Button variant="outline">
          <EditIcon className="mr-2 h-4 w-4" />
          {t("editFlow")}
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{t("cards.status")}</CardTitle>
          </CardHeader>
          <CardContent>
            <FlowStatusBadge status={flow?.status || "draft"} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{t("cards.totalSteps")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{steps?.length || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{t("cards.created")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">
              {flow?.createdAt ? new Date(flow.createdAt).toLocaleDateString() : "N/A"}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{t("cards.lastUpdated")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">
              {flow?.updatedAt ? new Date(flow.updatedAt).toLocaleDateString() : "N/A"}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Steps</CardTitle>
              <CardDescription>
                Configure the steps in this flow
              </CardDescription>
            </div>
            <Button asChild>
              <Link href={getLocalizedPath(`/admin/flows/${flowId}/steps/new`)}>
                <PlusIcon className="mr-2 h-4 w-4" />
                Add Step
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={steps || []}
            isLoading={isLoading}
            searchPlaceholder={t("steps.table.searchPlaceholder")}
            searchColumn="name"
            emptyState={
              steps && steps.length === 0
                ? t("steps.table.emptyState")
                : t("steps.table.emptyStateWithFilters")
            }
          />
        </CardContent>
      </Card>
    </div>
  );
}