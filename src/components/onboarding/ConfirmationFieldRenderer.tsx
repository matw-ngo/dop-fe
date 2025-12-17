"use client";

import { motion } from "framer-motion";
import { Edit2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { FieldType } from "@/components/user-onboarding/constants/field-types";
import { getFieldDisplayValue } from "@/utils/fieldLabelMapper";

interface ConfirmationFieldRendererProps {
  fieldType: FieldType;
  value: any;
  label: string;
  onEdit?: () => void;
  editable?: boolean;
  showTypeBadge?: boolean;
}

export function ConfirmationFieldRenderer({
  fieldType,
  value,
  label,
  onEdit,
  editable = true,
  showTypeBadge = false,
}: ConfirmationFieldRendererProps) {
  const t = useTranslations();
  const { display, icon: Icon } = getFieldDisplayValue(fieldType, value, t);

  return (
    <motion.div
      className="group relative overflow-hidden rounded-xl bg-card p-4 shadow-sm hover:shadow-md transition-all duration-300 border"
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.3,
        ease: "easeOut",
      }}
    >
      <div className="relative flex items-center justify-between">
        {/* Field info */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {/* Icon */}
          <div className="flex-shrink-0 p-2 rounded-lg bg-primary/10">
            <Icon className="w-4 h-4 text-primary" />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Label with optional type badge */}
            <div className="flex items-center gap-2 mb-1">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                {label}
              </label>
              {showTypeBadge && (
                <Badge variant="secondary" className="text-xs px-1.5 py-0.5">
                  {fieldType}
                </Badge>
              )}
            </div>

            {/* Value */}
            <p className="font-semibold text-foreground text-sm truncate">
              {display}
            </p>
          </div>
        </div>

        {/* Edit button */}
        {editable && onEdit && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onEdit}
            className="opacity-0 group-hover:opacity-100 transition-all duration-200 -mr-2 hover:bg-primary/10"
          >
            <Edit2 className="w-4 h-4" />
          </Button>
        )}
      </div>
    </motion.div>
  );
}
