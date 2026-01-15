import { useTranslations } from "next-intl";
import { useMemo } from "react";
import {
  type FieldCategory,
  FieldType,
} from "@/components/user-onboarding/constants/field-types";
import type { GeneratedStepConfig } from "@/components/user-onboarding/types/field-config";
import type { MappedFlow } from "@/mappers/flowMapper";
import {
  calculateCompletionPercentage,
  groupFieldsByCategory,
} from "@/utils/confirmationFieldGrouper";

interface UseConfirmationFieldsProps {
  formData: Record<string, any>;
  fieldConfig?: GeneratedStepConfig[];
  flowData?: MappedFlow;
}

interface UseConfirmationFieldsReturn {
  fieldGroups: Record<
    FieldCategory,
    Array<{
      type: FieldType;
      value: any;
      label: string;
      category: FieldCategory;
      order: number;
    }>
  >;
  completionPercentage: number;
  totalFields: number;
  filledFields: number;
  hasFields: boolean;
  emptyCategories: FieldCategory[];
}

/**
 * Hook for managing confirmation fields with dynamic grouping and progress tracking
 * Supports all 14 field types and provides intelligent categorization
 */
export function useConfirmationFields({
  formData,
  fieldConfig,
  flowData,
}: UseConfirmationFieldsProps): UseConfirmationFieldsReturn {
  const t = useTranslations();

  // Memoize field grouping to avoid unnecessary recalculations
  const fieldGroups = useMemo(() => {
    return groupFieldsByCategory(formData, fieldConfig, flowData, t);
  }, [formData, fieldConfig, flowData, t]);

  // Calculate completion percentage
  const completionPercentage = useMemo(() => {
    return calculateCompletionPercentage(formData, fieldConfig, flowData);
  }, [formData, fieldConfig, flowData]);

  // Calculate field statistics
  const fieldStats = useMemo(() => {
    let totalFields = 0;
    let filledFields = 0;

    Object.values(fieldGroups).forEach((fields) => {
      totalFields += fields.length;
      filledFields += fields.filter(
        (field) =>
          field.value !== undefined &&
          field.value !== null &&
          field.value !== "",
      ).length;
    });

    return { totalFields, filledFields };
  }, [fieldGroups]);

  // Determine which categories are empty
  const emptyCategories = useMemo(() => {
    return (Object.keys(fieldGroups) as FieldCategory[]).filter(
      (category) => fieldGroups[category].length === 0,
    );
  }, [fieldGroups]);

  return {
    fieldGroups,
    completionPercentage,
    totalFields: fieldStats.totalFields,
    filledFields: fieldStats.filledFields,
    hasFields: fieldStats.totalFields > 0,
    emptyCategories,
  };
}

/**
 * Helper hook to get field statistics for analytics
 */
export function useConfirmationFieldStats(formData: Record<string, any>) {
  return useMemo(() => {
    const allFieldTypes = Object.values(FieldType);
    const filledFields = allFieldTypes.filter((fieldType) => {
      const value = formData[fieldType];
      return value !== undefined && value !== null && value !== "";
    });

    return {
      totalPossible: allFieldTypes.length,
      filled: filledFields.length,
      percentage: Math.round(
        (filledFields.length / allFieldTypes.length) * 100,
      ),
      missing: allFieldTypes.filter(
        (fieldType) => !filledFields.includes(fieldType),
      ),
    };
  }, [formData]);
}
