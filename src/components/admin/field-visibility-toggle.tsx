import { useTranslations } from "next-intl";
import { useCallback, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useUpdateField } from "@/hooks/admin/use-admin-flows";
import { cn } from "@/lib/utils";
import { useAdminFlowStore } from "@/store/use-admin-flow-store";
import type { FieldListItem } from "@/types/admin";

interface FieldVisibilityToggleProps {
  field: FieldListItem;
  stepId: string;
  label?: string;
  disabled?: boolean;
  className?: string;
  type?: "visibility" | "requirement";
}

export function FieldVisibilityToggle({
  field,
  stepId,
  label,
  disabled = false,
  className,
  type = "visibility",
}: FieldVisibilityToggleProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const updateFieldMutation = useUpdateField();
  const t = useTranslations("admin.stepDetail.fields.toggle");

  // Get pending changes from store
  const getModifiedFields = useAdminFlowStore(
    (state) => state.getModifiedFields,
  );
  const _isEditing = useAdminFlowStore((state) => state.isEditing);

  const modifiedFields = getModifiedFields(stepId);
  const fieldChange = modifiedFields.find((fc) => fc.fieldId === field.id);

  // Determine current state based on pending changes
  const currentState =
    type === "visibility"
      ? (fieldChange?.changes.visible ?? field.visible)
      : (fieldChange?.changes.required ?? field.required);

  // Check if this field has unsaved changes
  const hasUnsavedChanges =
    !!fieldChange &&
    ((type === "visibility" && fieldChange.changes.visible !== undefined) ||
      (type === "requirement" && fieldChange.changes.required !== undefined));

  const handleToggle = useCallback(
    async (checked: boolean) => {
      if (isUpdating || disabled) return;

      setIsUpdating(true);

      try {
        // Update store optimistically
        if (type === "visibility") {
          useAdminFlowStore.getState().updateFieldVisibility(field.id, checked);
        } else {
          useAdminFlowStore
            .getState()
            .updateFieldRequirement(field.id, checked);
        }

        // Call API to update field
        await updateFieldMutation.mutateAsync({
          stepId,
          fieldId: field.id,
          data:
            type === "visibility"
              ? { visible: checked }
              : { required: checked },
        });

        // Store will be reset by the mutation's success handler
      } catch (error) {
        // Error is handled by the mutation hook
        console.error("Failed to update field:", error);
      } finally {
        setIsUpdating(false);
      }
    },
    [isUpdating, disabled, field.id, stepId, type, updateFieldMutation],
  );

  const defaultLabel = type === "visibility" ? t("visible") : t("required");
  const displayLabel = label || defaultLabel;

  return (
    <div className={cn("flex items-center space-x-2", className)}>
      <div className="flex items-center space-x-2">
        <Switch
          id={`${type}-${field.id}`}
          checked={currentState}
          onCheckedChange={handleToggle}
          disabled={disabled || isUpdating}
        />
        <Label
          htmlFor={`${type}-${field.id}`}
          className={cn(
            "text-sm font-medium cursor-pointer",
            isUpdating && "opacity-60",
          )}
        >
          {displayLabel}
        </Label>

        {/* Indicator for unsaved changes */}
        {hasUnsavedChanges && (
          <Badge variant="secondary" className="text-xs">
            {t("modified")}
          </Badge>
        )}

        {/* Loading indicator */}
        {isUpdating && (
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
        )}
      </div>
    </div>
  );
}

// Convenience components for specific use cases
export function FieldVisibilityToggleComponent(
  props: Omit<FieldVisibilityToggleProps, "type">,
) {
  return <FieldVisibilityToggle {...props} type="visibility" />;
}

export function FieldRequirementToggle(
  props: Omit<FieldVisibilityToggleProps, "type">,
) {
  return <FieldVisibilityToggle {...props} type="requirement" />;
}
