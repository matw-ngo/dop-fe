import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { MoreHorizontal, Edit, Trash2, Eye, Copy, Play, Pause } from "lucide-react";
import type { FlowListItem } from "@/types/admin";
import { useTranslations } from "next-intl";

interface FlowActionsProps {
  flow: FlowListItem;
  onEdit?: (flow: FlowListItem) => void;
  onDelete?: (flow: FlowListItem) => void;
  onView?: (flow: FlowListItem) => void;
  onDuplicate?: (flow: FlowListItem) => void;
  onToggleStatus?: (flow: FlowListItem) => void;
  disabled?: boolean;
}

export function FlowActions({
  flow,
  onEdit,
  onDelete,
  onView,
  onDuplicate,
  onToggleStatus,
  disabled = false,
}: FlowActionsProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const t = useTranslations("admin.flows.actions");

  const handleDeleteClick = () => {
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = () => {
    setShowDeleteDialog(false);
    if (onDelete) onDelete(flow);
  };

  const handleStatusClick = () => {
    setShowStatusDialog(true);
  };

  const handleStatusConfirm = () => {
    setShowStatusDialog(false);
    if (onToggleStatus) onToggleStatus(flow);
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
          {onView && (
            <DropdownMenuItem onClick={() => onView(flow)}>
              <Eye className="mr-2 h-4 w-4" />
              {t("viewDetails")}
            </DropdownMenuItem>
          )}
          {onEdit && (
            <DropdownMenuItem onClick={() => onEdit(flow)}>
              <Edit className="mr-2 h-4 w-4" />
              {t("edit")}
            </DropdownMenuItem>
          )}
          {onToggleStatus && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleStatusClick}>
                {flow.status === 'active' ? (
                  <>
                    <Pause className="mr-2 h-4 w-4" />
                    {t("deactivate")}
                  </>
                ) : (
                  <>
                    <Play className="mr-2 h-4 w-4" />
                    {t("activate")}
                  </>
                )}
              </DropdownMenuItem>
            </>
          )}
          {onDuplicate && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onDuplicate(flow)}>
                <Copy className="mr-2 h-4 w-4" />
                {t("duplicate")}
              </DropdownMenuItem>
            </>
          )}
          {onDelete && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleDeleteClick}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                {t("delete")}
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Flow</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{flow.name}"? This action cannot be undone
              and will permanently remove the flow and all its associated data.
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
              {flow.status === 'active' ? 'Deactivate Flow' : 'Activate Flow'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to {flow.status === 'active' ? 'deactivate' : 'activate'} "{flow.name}"?
              {flow.status === 'active'
                ? ' This will make the flow unavailable to users.'
                : ' This will make the flow available to users.'
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleStatusConfirm}>
              {flow.status === 'active' ? 'Deactivate' : 'Activate'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}