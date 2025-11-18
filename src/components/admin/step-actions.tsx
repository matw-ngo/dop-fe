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
import { MoreHorizontal, Edit, Trash2, Eye, Copy } from "lucide-react";
import type { StepListItem } from "@/types/admin";
import { useTranslations } from "next-intl";

interface StepActionsProps {
  step: StepListItem;
  onEdit?: (step: StepListItem) => void;
  onDelete?: (step: StepListItem) => void;
  onView?: (step: StepListItem) => void;
  onDuplicate?: (step: StepListItem) => void;
  disabled?: boolean;
}

export function StepActions({
  step,
  onEdit,
  onDelete,
  onView,
  onDuplicate,
  disabled = false,
}: StepActionsProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const t = useTranslations("admin.flowDetail.steps.actions");

  const handleDeleteClick = () => {
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = () => {
    setShowDeleteDialog(false);
    if (onDelete) onDelete(step);
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
            <DropdownMenuItem onClick={() => onView(step)}>
              <Eye className="mr-2 h-4 w-4" />
              {t("view")}
            </DropdownMenuItem>
          )}
          {onEdit && (
            <DropdownMenuItem onClick={() => onEdit(step)}>
              <Edit className="mr-2 h-4 w-4" />
              {t("edit")}
            </DropdownMenuItem>
          )}
          {onDuplicate && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onDuplicate(step)}>
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
            <AlertDialogTitle>Delete Step</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{step.name}"? This action cannot be undone
              and will permanently remove the step and all its associated fields.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Step
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}