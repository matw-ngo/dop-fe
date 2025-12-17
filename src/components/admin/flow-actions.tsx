import {
  Copy,
  Edit,
  Eye,
  Loader2,
  MoreHorizontal,
  Pause,
  Play,
  Settings,
  Trash2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  useDeleteFlow,
  useDuplicateFlow,
  useToggleFlowStatus,
} from "@/hooks/admin/use-admin-flows";
import { useLocalizedPath } from "@/lib/client-utils";
import type { FlowListItem } from "@/types/admin";

interface FlowActionsProps {
  flow: FlowListItem;
  onEdit?: (flow: FlowListItem) => void;
  onDelete?: (flow: FlowListItem) => void;
  onView?: (flow: FlowListItem) => void;
  onDuplicate?: (flow: FlowListItem) => void;
  onToggleStatus?: (flow: FlowListItem) => void;
  onManageSteps?: (flow: FlowListItem) => void;
  disabled?: boolean;
}

export function FlowActions({
  flow,
  onEdit,
  onDelete,
  onView,
  onDuplicate,
  onToggleStatus,
  onManageSteps,
  disabled = false,
}: FlowActionsProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editForm, setEditForm] = useState({
    name: flow.name,
    description: "",
  });
  const router = useRouter();
  const getLocalizedPath = useLocalizedPath();
  const t = useTranslations("admin.flows");

  // Mutations
  const deleteFlowMutation = useDeleteFlow();
  const duplicateFlowMutation = useDuplicateFlow();
  const toggleFlowStatusMutation = useToggleFlowStatus();

  const handleView = () => {
    // Navigate to flow detail page with locale
    router.push(getLocalizedPath(`/admin/flows/${flow.id}`));
  };

  const handleEdit = () => {
    // Set initial form values
    setEditForm({ name: flow.name, description: "" });
    setShowEditDialog(true);
  };

  const handleEditSubmit = () => {
    setShowEditDialog(false);
    if (onEdit) onEdit(flow);
    // For now, just close dialog - in real implementation this would call updateFlow mutation
  };

  const handleDeleteClick = () => {
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = () => {
    setShowDeleteDialog(false);
    deleteFlowMutation.mutate(flow.id);
  };

  const handleStatusClick = () => {
    setShowStatusDialog(true);
  };

  const handleStatusConfirm = () => {
    setShowStatusDialog(false);
    toggleFlowStatusMutation.mutate(flow.id);
  };

  const handleDuplicate = () => {
    duplicateFlowMutation.mutate({
      id: flow.id,
      name: `${flow.name} (Copy)`,
    });
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon-sm"
            disabled={disabled}
            className="h-8 w-8"
          >
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={handleView}>
            <Eye className="mr-2 h-4 w-4" />
            {t("viewDetails")}
          </DropdownMenuItem>
          {onManageSteps && (
            <DropdownMenuItem onClick={() => onManageSteps(flow)}>
              <Settings className="mr-2 h-4 w-4" />
              {t("manageSteps")}
            </DropdownMenuItem>
          )}
          <DropdownMenuItem onClick={handleEdit}>
            <Edit className="mr-2 h-4 w-4" />
            {t("edit")}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={handleStatusClick}
            disabled={toggleFlowStatusMutation.isPending}
          >
            {toggleFlowStatusMutation.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : flow.status === "active" ? (
              <Pause className="mr-2 h-4 w-4" />
            ) : (
              <Play className="mr-2 h-4 w-4" />
            )}
            {flow.status === "active" ? t("deactivate") : t("activate")}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={handleDuplicate}
            disabled={duplicateFlowMutation.isPending}
          >
            {duplicateFlowMutation.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Copy className="mr-2 h-4 w-4" />
            )}
            {t("duplicate")}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={handleDeleteClick}
            className="text-destructive focus:text-destructive"
            disabled={deleteFlowMutation.isPending}
          >
            {deleteFlowMutation.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="mr-2 h-4 w-4" />
            )}
            {t("delete")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Flow</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{flow.name}"? This action cannot
              be undone and will permanently remove the flow and all its
              associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Flow
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Status Change Confirmation Dialog */}
      <AlertDialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {flow.status === "active" ? "Deactivate Flow" : "Activate Flow"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to{" "}
              {flow.status === "active" ? "deactivate" : "activate"} "
              {flow.name}"?
              {flow.status === "active"
                ? " This will make the flow unavailable to users."
                : " This will make the flow available to users."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleStatusConfirm}>
              {flow.status === "active" ? "Deactivate" : "Activate"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Flow Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent size="md" className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Flow</DialogTitle>
            <DialogDescription>
              Make changes to your flow here. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={editForm.name}
                onChange={(e) =>
                  setEditForm({ ...editForm, name: e.target.value })
                }
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Description
              </Label>
              <Input
                id="description"
                value={editForm.description}
                onChange={(e) =>
                  setEditForm({ ...editForm, description: e.target.value })
                }
                className="col-span-3"
                placeholder="Enter flow description"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditSubmit}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
