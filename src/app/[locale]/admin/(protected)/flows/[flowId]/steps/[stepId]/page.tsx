"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeftIcon, SaveIcon, EditIcon, Trash2Icon } from "lucide-react";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { FieldVisibilityToggleComponent, FieldRequirementToggle } from "@/components/admin/field-visibility-toggle";
import { AdminBreadcrumb } from "@/components/admin/breadcrumb";
import { StepDetailSkeleton } from "@/components/admin/loading-states";
import { ErrorState, EmptyState } from "@/components/admin/error-states";
import { useStep, useUpdateStep, useBulkUpdateFields } from "@/hooks/admin/use-admin-flows";
import { useAdminFlowStore } from "@/store/use-admin-flow-store";
import { type ColumnDef } from "@tanstack/react-table";
import type { StepDetail, FieldListItem } from "@/types/admin";
import { useLocalizedPath } from "@/lib/client-utils";
import { useTranslations } from "next-intl";

// Mock data for demonstration
const mockStepDetail: StepDetail = {
  id: "1",
  stepOrder: 1,
  name: "Personal Information",
  description: "Collect basic personal information from the user",
  hasEkyc: false,
  hasOtp: false,
  status: "active",
  flowId: "1",
  fields: [
    {
      id: "1",
      name: "firstName",
      type: "text",
      visible: true,
      required: true,
      label: "First Name",
      placeholder: "Enter your first name",
    },
    {
      id: "2",
      name: "lastName",
      type: "text",
      visible: true,
      required: true,
      label: "Last Name",
      placeholder: "Enter your last name",
    },
    {
      id: "3",
      name: "email",
      type: "email",
      visible: true,
      required: true,
      label: "Email Address",
      placeholder: "Enter your email address",
    },
    {
      id: "4",
      name: "phone",
      type: "text",
      visible: true,
      required: true,
      label: "Phone Number",
      placeholder: "Enter your phone number",
    },
    {
      id: "5",
      name: "dateOfBirth",
      type: "date",
      visible: false,
      required: false,
      label: "Date of Birth",
      placeholder: "",
    },
    {
      id: "6",
      name: "gender",
      type: "select",
      visible: true,
      required: false,
      label: "Gender",
      placeholder: "Select gender",
    },
  ],
};

export default function StepDetailPage() {
  const params = useParams();
  const router = useRouter();
  const getLocalizedPath = useLocalizedPath();
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  
  const flowId = params.flowId as string;
  const stepId = params.stepId as string;
  const t = useTranslations("admin.stepDetail");

  // Hooks for data fetching and mutations
  const { data: step, isLoading, error } = useStep(stepId);
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

  // Handle save with confirmation dialog
  const handleSave = async () => {
    if (!step) return;
    
    try {
      setSaving(true);
      
      // Get all modified fields for this step
      const modifiedFields = getModifiedFields(stepId);
      
      // Update fields if there are changes
      if (modifiedFields.length > 0) {
        const fieldUpdates = modifiedFields.map(({ fieldId, changes }) => ({
          fieldId,
          data: changes,
        }));
        
        await bulkUpdateFieldsMutation.mutateAsync({
          stepId,
          updates: fieldUpdates,
        });
      }
      
      // Get step changes
      const modifiedSteps = getModifiedSteps();
      const stepChange = modifiedSteps.find(ms => ms.stepId === stepId);
      
      // Update step if there are changes
      if (stepChange?.changes) {
        await updateStepMutation.mutateAsync({
          id: stepId,
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

  // Navigate back with unsaved changes warning
  const handleBack = () => {
    if (hasUnsavedChanges()) {
      if (confirm(t("dialogs.unsavedChanges.description"))) {
        resetChanges();
        router.push(getLocalizedPath(`/admin/flows/${flowId}`));
      }
    } else {
      router.push(getLocalizedPath(`/admin/flows/${flowId}`));
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

  // Show loading skeleton while data is loading
  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <StepDetailSkeleton />
      </div>
    );
  }

  // Show error state
  if (error || !step) {
    return (
      <div className="container mx-auto p-6">
        <AdminBreadcrumb />
        <ErrorState
          title={t("errorState.title")}
          message={error instanceof Error ? error.message : t("errorState.message")}
          onRetry={() => window.location.reload()}
        />
      </div>
    );
  }

  const columns: ColumnDef<FieldListItem>[] = [
    {
      accessorKey: "name",
      header: t("fields.table.headers.name"),
      cell: ({ row }) => (
        <div className="font-medium">
          {row.getValue("name")}
        </div>
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
          stepId={stepId}
        />
      ),
    },
    {
      accessorKey: "required",
      header: t("fields.table.headers.required"),
      cell: ({ row }) => (
        <FieldRequirementToggle
          field={row.original}
          stepId={stepId}
        />
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
    <div className="space-y-6">
      <AdminBreadcrumb />
      
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={handleBack}>
          <ArrowLeftIcon className="h-4 w-4" />
          <span className="sr-only">{t("backToFlow")}</span>
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">{step.name}</h1>
          <p className="text-muted-foreground">{step.description}</p>
        </div>
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
              <AlertDialogTitle>{t("dialogs.saveChanges.title")}</AlertDialogTitle>
              <AlertDialogDescription>
                {t("dialogs.saveChanges.description")}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t("dialogs.saveChanges.cancel")}</AlertDialogCancel>
              <AlertDialogAction onClick={handleSave}>
                {t("dialogs.saveChanges.confirm")}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{t("cards.status")}</CardTitle>
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
            <CardTitle className="text-sm font-medium">{t("cards.stepOrder")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{step.stepOrder}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{t("cards.ekyc")}</CardTitle>
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
            <CardTitle className="text-sm font-medium">{t("cards.otp")}</CardTitle>
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
              <CardDescription>
                {t("fields.subtitle")}
              </CardDescription>
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
  );
}