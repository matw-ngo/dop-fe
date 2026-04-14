import { toast } from "sonner";
import type { FieldListItem, FlowListItem, StepListItem } from "@/types/admin";

// Base toast options for admin actions
const adminToastOptions = {
  duration: 5000,
  position: "top-right" as const,
  action: {
    label: "Dismiss",
    onClick: () => {},
  },
};

/**
 * Success toast for flow actions
 */
export const flowSuccessToast = {
  created: (flow: FlowListItem) =>
    toast.success("Flow created successfully", {
      description: `"${flow.name}" has been created.`,
      ...adminToastOptions,
    }),

  updated: (flow: FlowListItem) =>
    toast.success("Flow updated successfully", {
      description: `"${flow.name}" has been updated.`,
      ...adminToastOptions,
    }),

  deleted: (flow: FlowListItem) =>
    toast.success("Flow deleted successfully", {
      description: `"${flow.name}" has been deleted.`,
      ...adminToastOptions,
    }),

  statusChanged: (flow: FlowListItem, newStatus: string) =>
    toast.success("Flow status updated", {
      description: `"${flow.name}" status changed to ${newStatus}.`,
      ...adminToastOptions,
    }),

  duplicated: (flow: FlowListItem) =>
    toast.success("Flow duplicated successfully", {
      description: `"${flow.name}" has been duplicated.`,
      ...adminToastOptions,
    }),
};

/**
 * Error toast for flow actions
 */
export const flowErrorToast = {
  createFailed: (error?: string) =>
    toast.error("Failed to create flow", {
      description: error || "An error occurred while creating the flow.",
      ...adminToastOptions,
    }),

  updateFailed: (flow: FlowListItem, error?: string) =>
    toast.error("Failed to update flow", {
      description:
        error || `Failed to update "${flow.name}". Please try again.`,
      ...adminToastOptions,
    }),

  deleteFailed: (flow: FlowListItem, error?: string) =>
    toast.error("Failed to delete flow", {
      description:
        error || `Failed to delete "${flow.name}". Please try again.`,
      ...adminToastOptions,
    }),

  loadFailed: (flowId: string, error?: string) =>
    toast.error("Failed to load flow", {
      description: error || `Unable to load flow details for ID: ${flowId}`,
      ...adminToastOptions,
    }),

  duplicateFailed: (flow: FlowListItem, error?: string) =>
    toast.error("Failed to duplicate flow", {
      description:
        error || `Failed to duplicate "${flow.name}". Please try again.`,
      ...adminToastOptions,
    }),
};

/**
 * Success toast for step actions
 */
export const stepSuccessToast = {
  created: (step: StepListItem) =>
    toast.success("Step created successfully", {
      description: `"${step.name}" has been created.`,
      ...adminToastOptions,
    }),

  updated: (step: StepListItem) =>
    toast.success("Step updated successfully", {
      description: `"${step.name}" has been updated.`,
      ...adminToastOptions,
    }),

  deleted: (step: StepListItem) =>
    toast.success("Step deleted successfully", {
      description: `"${step.name}" has been deleted.`,
      ...adminToastOptions,
    }),

  statusChanged: (step: StepListItem, newStatus: string) =>
    toast.success("Step status updated", {
      description: `"${step.name}" status changed to ${newStatus}.`,
      ...adminToastOptions,
    }),

  reordered: (stepCount: number) =>
    toast.success("Steps reordered successfully", {
      description: `${stepCount} step(s) have been reordered.`,
      ...adminToastOptions,
    }),

  duplicated: (step: StepListItem) =>
    toast.success("Step duplicated successfully", {
      description: `"${step.name}" has been duplicated.`,
      ...adminToastOptions,
    }),
};

/**
 * Error toast for step actions
 */
export const stepErrorToast = {
  createFailed: (error?: string) =>
    toast.error("Failed to create step", {
      description: error || "An error occurred while creating the step.",
      ...adminToastOptions,
    }),

  updateFailed: (step: StepListItem, error?: string) =>
    toast.error("Failed to update step", {
      description:
        error || `Failed to update "${step.name}". Please try again.`,
      ...adminToastOptions,
    }),

  deleteFailed: (step: StepListItem, error?: string) =>
    toast.error("Failed to delete step", {
      description:
        error || `Failed to delete "${step.name}". Please try again.`,
      ...adminToastOptions,
    }),

  loadFailed: (stepId: string, error?: string) =>
    toast.error("Failed to load step", {
      description: error || `Unable to load step details for ID: ${stepId}`,
      ...adminToastOptions,
    }),

  reorderFailed: (error?: string) =>
    toast.error("Failed to reorder steps", {
      description: error || "An error occurred while reordering the steps.",
      ...adminToastOptions,
    }),

  duplicateFailed: (step: StepListItem, error?: string) =>
    toast.error("Failed to duplicate step", {
      description:
        error || `Failed to duplicate "${step.name}". Please try again.`,
      ...adminToastOptions,
    }),
};

/**
 * Success toast for field actions
 */
export const fieldSuccessToast = {
  created: (field: FieldListItem) =>
    toast.success("Field created successfully", {
      description: `"${field.label || field.name}" has been created.`,
      ...adminToastOptions,
    }),

  updated: (field: FieldListItem) =>
    toast.success("Field updated successfully", {
      description: `"${field.label || field.name}" has been updated.`,
      ...adminToastOptions,
    }),

  deleted: (field: FieldListItem) =>
    toast.success("Field deleted successfully", {
      description: `"${field.label || field.name}" has been deleted.`,
      ...adminToastOptions,
    }),

  bulkUpdated: (fieldCount: number) =>
    toast.success("Fields updated successfully", {
      description: `${fieldCount} field(s) have been updated.`,
      ...adminToastOptions,
    }),

  visibilityToggled: (field: FieldListItem, visible: boolean) =>
    toast.success("Field visibility updated", {
      description: `"${field.label || field.name}" is now ${visible ? "visible" : "hidden"}.`,
      ...adminToastOptions,
    }),

  requirementToggled: (field: FieldListItem, required: boolean) =>
    toast.success("Field requirement updated", {
      description: `"${field.label || field.name}" is now ${required ? "required" : "optional"}.`,
      ...adminToastOptions,
    }),
};

/**
 * Error toast for field actions
 */
export const fieldErrorToast = {
  createFailed: (field: FieldListItem, error?: string) =>
    toast.error("Failed to create field", {
      description:
        error ||
        `Failed to create "${field.label || field.name}". Please try again.`,
      ...adminToastOptions,
    }),

  updateFailed: (field: FieldListItem, error?: string) =>
    toast.error("Failed to update field", {
      description:
        error ||
        `Failed to update "${field.label || field.name}". Please try again.`,
      ...adminToastOptions,
    }),

  deleteFailed: (field: FieldListItem, error?: string) =>
    toast.error("Failed to delete field", {
      description:
        error ||
        `Failed to delete "${field.label || field.name}". Please try again.`,
      ...adminToastOptions,
    }),

  bulkUpdateFailed: (fieldCount: number, error?: string) =>
    toast.error("Failed to update fields", {
      description:
        error || `Failed to update ${fieldCount} field(s). Please try again.`,
      ...adminToastOptions,
    }),

  validationFailed: (fieldName: string, errors: string[]) =>
    toast.error("Field validation failed", {
      description: `"${fieldName}": ${errors.join(", ")}`,
      ...adminToastOptions,
    }),
};

/**
 * Success toast for save actions
 */
export const saveSuccessToast = {
  changesSaved: (itemType: string, itemName?: string) =>
    toast.success("Changes saved successfully", {
      description: itemName
        ? `${itemType} "${itemName}" has been saved.`
        : `All ${itemType.toLowerCase()} changes have been saved.`,
      ...adminToastOptions,
    }),

  draftSaved: (itemType: string, itemName?: string) =>
    toast.success("Draft saved", {
      description: itemName
        ? `${itemType} "${itemName}" has been saved as draft.`
        : `All ${itemType.toLowerCase()} changes have been saved as draft.`,
      ...adminToastOptions,
    }),
};

/**
 * Error toast for save actions
 */
export const saveErrorToast = {
  saveFailed: (itemType: string, error?: string) =>
    toast.error("Failed to save changes", {
      description:
        error ||
        `Failed to save ${itemType.toLowerCase()} changes. Please try again.`,
      ...adminToastOptions,
    }),

  networkError: () =>
    toast.error("Network error", {
      description:
        "Unable to save changes due to network issues. Please check your connection and try again.",
      ...adminToastOptions,
    }),

  validationError: (itemType: string) =>
    toast.error("Validation error", {
      description: `Please fix validation errors before saving the ${itemType.toLowerCase()}.`,
      ...adminToastOptions,
    }),
};

/**
 * Warning toast for admin actions
 */
export const adminWarningToast = {
  unsavedChanges: () =>
    toast.warning("Unsaved changes", {
      description: "You have unsaved changes. Please save before leaving.",
      ...adminToastOptions,
    }),

  deleteConfirmation: (itemType: string, itemName: string) =>
    toast.warning("Delete confirmation", {
      description: `Are you sure you want to delete this ${itemType.toLowerCase()} "${itemName}"? This action cannot be undone.`,
      ...adminToastOptions,
    }),

  statusChangeWarning: (
    _itemType: string,
    itemName: string,
    newStatus: string,
  ) =>
    toast.warning("Status change warning", {
      description: `Changing "${itemName}" status to ${newStatus} may affect active users.`,
      ...adminToastOptions,
    }),

  bulkActionWarning: (itemCount: number, action: string) =>
    toast.warning("Bulk action warning", {
      description: `You are about to ${action.toLowerCase()} ${itemCount} items. This action cannot be undone.`,
      ...adminToastOptions,
    }),
};

/**
 * Info toast for admin actions
 */
export const adminInfoToast = {
  loading: (itemType: string) =>
    toast.info(`Loading ${itemType.toLowerCase()}...`, {
      description: `Please wait while we load the ${itemType.toLowerCase()}.`,
      ...adminToastOptions,
    }),

  processing: (action: string) =>
    toast.info(`Processing ${action.toLowerCase()}...`, {
      description: `Please wait while we process your request.`,
      ...adminToastOptions,
    }),

  noChanges: () =>
    toast.info("No changes to save", {
      description: "No changes have been made since the last save.",
      ...adminToastOptions,
    }),

  lastSaved: (timestamp: string) =>
    toast.info("Last saved", {
      description: `Changes were last saved at ${new Date(timestamp).toLocaleString()}.`,
      ...adminToastOptions,
    }),
};

// Generic success toast
export const successToast = (message: string, description?: string) =>
  toast.success(message, {
    description,
    ...adminToastOptions,
  });

// Generic error toast
export const errorToast = (message: string, description?: string) =>
  toast.error(message, {
    description,
    ...adminToastOptions,
  });

// Generic warning toast
export const warningToast = (message: string, description?: string) =>
  toast.warning(message, {
    description,
    ...adminToastOptions,
  });

// Generic info toast
export const infoToast = (message: string, description?: string) =>
  toast.info(message, {
    description,
    ...adminToastOptions,
  });
