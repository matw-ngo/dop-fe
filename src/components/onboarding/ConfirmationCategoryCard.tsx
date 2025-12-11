"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ConfirmationFieldRenderer } from "./ConfirmationFieldRenderer";
import {
  FieldType,
  FieldCategory,
} from "@/components/user-onboarding/constants/field-types";
import { GroupedField } from "@/utils/confirmationFieldGrouper";
import { useTranslations } from "next-intl";

interface ConfirmationCategoryCardProps {
  category: FieldCategory;
  fields: GroupedField[];
  onEditField?: (fieldType: FieldType, currentValue: any) => void;
  showEditButtons?: boolean;
}

// Category configuration with icons
const CATEGORY_CONFIG = {
  [FieldCategory.PERSONAL]: {
    icon: "👤",
  },
  [FieldCategory.IDENTITY]: {
    icon: "🆔",
  },
  [FieldCategory.FINANCIAL]: {
    icon: "💰",
  },
  [FieldCategory.LOAN]: {
    icon: "📋",
  },
  [FieldCategory.VERIFICATION]: {
    icon: "✓",
  },
};

export function ConfirmationCategoryCard({
  category,
  fields,
  onEditField,
  showEditButtons = true,
}: ConfirmationCategoryCardProps) {
  const t = useTranslations("onboarding.confirm");
  const config = CATEGORY_CONFIG[category];

  if (fields.length === 0) return null;

  const containerVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.3,
      },
    },
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible">
      <Card className="overflow-hidden border shadow-lg">
        {/* Header */}
        <CardHeader className="bg-muted border-b">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{config.icon}</span>
              <div>
                <h3 className="text-xl font-bold">
                  {t(`category.${category}`)}
                </h3>
                <p className="text-xs text-muted-foreground font-normal">
                  {fields.length} {t("fields")}
                </p>
              </div>
            </div>
            <Badge variant="secondary">{fields.length}</Badge>
          </CardTitle>
        </CardHeader>

        {/* Content */}
        <CardContent className="p-6">
          {fields.length === 1 ? (
            // Single field - full width
            <motion.div variants={itemVariants}>
              <ConfirmationFieldRenderer
                fieldType={fields[0].type}
                value={fields[0].value}
                label={fields[0].label}
                onEdit={
                  showEditButtons
                    ? () => onEditField?.(fields[0].type, fields[0].value)
                    : undefined
                }
                editable={showEditButtons}
              />
            </motion.div>
          ) : (
            // Multiple fields - grid layout
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {fields.map((field) => (
                <motion.div
                  key={field.type}
                  variants={itemVariants}
                  layout="position"
                >
                  <ConfirmationFieldRenderer
                    fieldType={field.type}
                    value={field.value}
                    label={field.label}
                    onEdit={
                      showEditButtons
                        ? () => onEditField?.(field.type, field.value)
                        : undefined
                    }
                    editable={showEditButtons}
                  />
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
