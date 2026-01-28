"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { EditIcon, SaveIcon, SettingsIcon, Trash2Icon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { ErrorState } from "@/components/admin/error-states";
import {
  FieldRequirementToggle,
  FieldVisibilityToggleComponent,
} from "@/components/admin/field-visibility-toggle";
import { StepDetailSkeleton } from "@/components/admin/loading-states";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  useBulkUpdateFields,
  useFlowSteps,
  useStep,
  useUpdateStep,
} from "@/hooks/admin/use-admin-flows";
import { useAdminFlowStore } from "@/store/use-admin-flow-store";
import type { FieldListItem, StepListItem } from "@/types/admin";

interface StepManagementDialogProps {
  flowId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialStepId?: string;
}

export function StepManagementDialog({
  flowId,
  open,
  onOpenChange,
  initialStepId,
}: StepManagementDialogProps) {
  const [selectedStepId, setSelectedStepId] = useState<string | null>(
    initialStepId || null,
  );
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [_isCreatingNew, setIsCreatingNew] = useState(false);

  const t = useTranslations("admin.stepDetail");

  // Hooks for data fetching and mutations
  const { data: step, isLoading, error } = useStep(selectedStepId || "");
  const { data: steps } = useFlowSteps(flowId);
  const updateStepMutation = useUpdateStep();
  const bulkUpdateFieldsMutation = useBulkUpdateFields();

  // Store state
  const {
    hasUnsavedChanges,
    resetChanges,
    getModifiedFields,
    getModifiedSteps,
    setSaving,
  } = useAdminFlowStore();

  // Reset selected step when dialog opens/closes
  useEffect(() => {
    if (open) {
      setSelectedStepId(initialStepId || null);
      setIsCreatingNew(!initialStepId);
    } else {
      resetChanges();
    }
  }, [open, initialStepId, resetChanges]);

  // Handle save with confirmation dialog
  const handleSave = async () => {
    if (!step || !selectedStepId) return;

    try {
      setSaving(true);

      // Get all modified fields for this step
      const modifiedFields = getModifiedFields(selectedStepId);

      // Update fields if there are changes
      if (modifiedFields.length > 0) {
        const fieldUpdates = modifiedFields.map(({ fieldId, changes }) => ({
          fieldId,
          data: changes,
        }));

        await bulkUpdateFieldsMutation.mutateAsync({
          stepId: selectedStepId,
          updates: fieldUpdates,
        });
      }

      // Get step changes
      const modifiedSteps = getModifiedSteps();
      const stepChange = modifiedSteps.find(
        (ms) => ms.stepId === selectedStepId,
      );

      // Update step if there are changes
      if (stepChange?.changes) {
        await updateStepMutation.mutateAsync({
          id: selectedStepId,
          data: stepChange.changes,
        });
      }

      setShowSaveDialog(false);
    } catch (error) {
      console.error("Failed to save changes:", error);
    } finally {
      setSaving(false);
    }
  };

  // Handle dialog close with unsaved changes warning
  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen && hasUnsavedChanges()) {
      if (confirm(t("dialogs.unsavedChanges.description"))) {
        resetChanges();
        onOpenChange(newOpen);
      }
    } else {
      onOpenChange(newOpen);
    }
  };

  const handleEditField = (field: FieldListItem) => {
    // TODO: Implement field editing
    console.log("Edit field:", field);
  };

  const handleDeleteField = (field: FieldListItem) => {
    // TODO: Implement field deletion with confirmation
    console.log("Delete field:", field);
  };

  const handleStepSelect = (stepId: string) => {
    if (hasUnsavedChanges()) {
      if (confirm(t("dialogs.unsavedChanges.description"))) {
        resetChanges();
        setSelectedStepId(stepId);
        setIsCreatingNew(false);
      }
    } else {
      setSelectedStepId(stepId);
      setIsCreatingNew(false);
    }
  };

  // Show loading skeleton while data is loading
  if (isLoading && selectedStepId) {
    return (
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent size="xl">
          <StepDetailSkeleton />
        </DialogContent>
      </Dialog>
    );
  }

  // Show step selection when no step is selected
  if (!selectedStepId) {
    const stepsColumns: ColumnDef<StepListItem>[] = [
      {
        accessorKey: "stepOrder",
        header: "Order",
        cell: ({ row }) => (
          <div className="text-center font-medium">
            {row.getValue("stepOrder")}
          </div>
        ),
      },
      {
        accessorKey: "name",
        header: "Step Name",
        cell: ({ row }) => (
          <Button
            variant="ghost"
            className="justify-start h-auto p-2 font-medium"
            onClick={() => handleStepSelect(row.original.id)}
          >
            {row.getValue("name")}
          </Button>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
          <Badge
            variant={
              row.getValue("status") === "active" ? "default" : "secondary"
            }
            className="capitalize"
          >
            {row.getValue("status")}
          </Badge>
        ),
      },
      {
        accessorKey: "fieldCount",
        header: "Fields",
        cell: ({ row }) => (
          <div className="text-center">{row.getValue("fieldCount")}</div>
        ),
      },
    ];

    return (
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent size="xl">
          <DialogHeader>
            <DialogTitle>Step Management</DialogTitle>
            <DialogDescription>
              Select a step to manage its fields and configuration
            </DialogDescription>
          </DialogHeader>

          <Card>
            <CardHeader>
              <CardTitle>Steps</CardTitle>
              <CardDescription>
                Choose a step to manage its fields and settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={stepsColumns}
                data={steps || []}
                searchPlaceholder="Search steps..."
                searchColumn="name"
                emptyState="No steps found"
              />
            </CardContent>
          </Card>
        </DialogContent>
      </Dialog>
    );
  }

  // Show error state
  if (error || !step) {
    return (
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent size="xl">
          <ErrorState
            title={t("errorState.title")}
            message={
              error instanceof Error ? error.message : t("errorState.message")
            }
            onRetry={() => window.location.reload()}
          />
        </DialogContent>
      </Dialog>
    );
  }

  const columns: ColumnDef<FieldListItem>[] = [
    {
      accessorKey: "name",
      header: t("fields.table.headers.name"),
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue("name")}</div>
      ),
    },
    {
      accessorKey: "type",
      header: t("fields.table.headers.type"),
      cell: ({ row }) => (
        <Badge variant="outline" className="capitalize">
          {row.getValue("type")}
        </Badge>
      ),
    },
    {
      accessorKey: "visible",
      header: t("fields.table.headers.visible"),
      cell: ({ row }) => (
        <FieldVisibilityToggleComponent
          field={row.original}
          stepId={selectedStepId}
        />
      ),
    },
    {
      accessorKey: "required",
      header: t("fields.table.headers.required"),
      cell: ({ row }) => (
        <FieldRequirementToggle field={row.original} stepId={selectedStepId} />
      ),
    },
    {
      id: "actions",
      header: t("fields.table.headers.actions"),
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => handleEditField(row.original)}
          >
            <EditIcon className="h-4 w-4" />
            <span className="sr-only">{t("fields.actions.editField")}</span>
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => handleDeleteField(row.original)}
            className="text-destructive hover:text-destructive"
          >
            <Trash2Icon className="h-4 w-4" />
            <span className="sr-only">{t("fields.actions.deleteField")}</span>
          </Button>
        </div>
      ),
    },
  ];

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent size="full">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <DialogTitle>{step.name}</DialogTitle>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setSelectedStepId(null)}
              className="ml-auto"
            >
              <SettingsIcon className="h-4 w-4" />
              <span className="sr-only">Back to steps</span>
            </Button>
          </div>
          <DialogDescription>{step.description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  {t("cards.status")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Badge
                  variant={step.status === "active" ? "default" : "secondary"}
                  className="capitalize"
                >
                  {step.status}
                </Badge>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  {t("cards.stepOrder")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{step.stepOrder}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  {t("cards.ekyc")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {step.hasEkyc ? (
                  <Badge variant="default">Enabled</Badge>
                ) : (
                  <Badge variant="outline">Disabled</Badge>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  {t("cards.otp")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {step.hasOtp ? (
                  <Badge variant="default">Enabled</Badge>
                ) : (
                  <Badge variant="outline">Disabled</Badge>
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{t("fields.title")}</CardTitle>
                  <CardDescription>{t("fields.subtitle")}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={columns}
                data={step.fields}
                isLoading={isLoading}
                searchPlaceholder={t("fields.table.searchPlaceholder")}
                searchColumn="name"
                emptyState={
                  step.fields && step.fields.length === 0
                    ? t("fields.table.emptyState")
                    : t("fields.table.emptyStateWithFilters")
                }
              />
            </CardContent>
          </Card>
        </div>

        <DialogFooter className="flex justify-between">
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setSelectedStepId(null)}>
              Back to Steps
            </Button>
          </div>
          <div className="flex gap-2">
            <AlertDialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
              <AlertDialogTrigger asChild>
                <Button disabled={!hasUnsavedChanges()}>
                  <SaveIcon className="mr-2 h-4 w-4" />
                  {t("saveChanges")}
                  {hasUnsavedChanges() && (
                    <Badge variant="secondary" className="ml-2 text-xs">
                      {t("modified")}
                    </Badge>
                  )}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    {t("dialogs.saveChanges.title")}
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    {t("dialogs.saveChanges.description")}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>
                    {t("dialogs.saveChanges.cancel")}
                  </AlertDialogCancel>
                  <AlertDialogAction onClick={handleSave}>
                    {t("dialogs.saveChanges.confirm")}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
