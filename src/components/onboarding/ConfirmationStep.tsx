"use client";

import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, Edit3, Loader2, ShieldCheck } from "lucide-react";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import type {
  FieldCategory,
  FieldType,
} from "@/components/user-onboarding/constants/field-types";
import type { GeneratedStepConfig } from "@/components/user-onboarding/types/field-config";
import { useConfirmationFields } from "@/hooks/form/use-confirmation-fields";
import apiClient from "@/lib/api/client";
import type { components } from "@/lib/api/v1/dop";
import type { MappedFlow } from "@/mappers/flowMapper";
import { toCreateLeadRequest } from "@/mappers/onboardingMapper";
import { ConfirmationCategoryCard } from "./ConfirmationCategoryCard";

type CreateLeadResponseBody = components["schemas"]["CreateLeadResponseBody"];

interface ConfirmationStepProps {
  formData: Record<string, any>;
  flowId: string;
  stepId: string;
  domain?: string;
  onSuccess?: () => void;
  isSubmitting?: boolean;
  // NEW: Optional field configuration for dynamic rendering
  fieldConfig?: GeneratedStepConfig[];
  flowData?: MappedFlow;
  // NEW: Allow editing fields
  onEditField?: (fieldType: FieldType | null, currentValue: any) => void;
  showEditButtons?: boolean;
}

export function ConfirmationStep({
  formData,
  flowId,
  stepId,
  domain = "",
  onSuccess,
  isSubmitting = false,
  fieldConfig,
  flowData,
  onEditField,
  showEditButtons = false,
}: ConfirmationStepProps) {
  const [submitting, setSubmitting] = useState(isSubmitting);
  const [editingField, setEditingField] = useState<FieldType | null>(null);
  const t = useTranslations("onboarding.confirm");

  // Use our new dynamic field hook
  const {
    fieldGroups,
    completionPercentage,
    totalFields,
    filledFields,
    hasFields,
    emptyCategories,
  } = useConfirmationFields({
    formData,
    fieldConfig,
    flowData,
  });

  // Handle form submission
  const handleSubmit = async () => {
    if (!flowId || !stepId) {
      toast.error(t("errors.missingInfo"));
      return;
    }

    try {
      setSubmitting(true);

      const payload = toCreateLeadRequest(formData, flowId, stepId, domain);

      // Make API call to create lead
      const { data, error } = await apiClient.POST("/leads", {
        body: payload,
      });

      if (error) {
        toast.error(t("errors.submitError"));
        return;
      }

      if (data) {
        toast.success(t("success.submitSuccess"));

        // Call onSuccess callback if provided
        if (onSuccess) {
          onSuccess();
        }
      }
    } catch (err) {
      console.error("Submit error:", err);
      toast.error(t("errors.submitError"));
    } finally {
      setSubmitting(false);
    }
  };

  // Handle field editing
  const handleEditField = (fieldType: FieldType, currentValue: any) => {
    setEditingField(fieldType);
    onEditField?.(fieldType, currentValue);
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
      },
    },
  };

  // Get eKYC verification status
  const ekycVerification = formData.ekycVerification;

  return (
    <motion.div
      className="space-y-8 max-w-5xl mx-auto"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header with Progress */}
      <motion.div variants={itemVariants} className="text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary mb-6 shadow-xl">
          <CheckCircle2 className="w-10 h-10 text-primary-foreground" />
        </div>

        <h2 className="text-3xl md:text-4xl font-bold mb-3">{t("title")}</h2>

        <p className="text-lg text-muted-foreground mb-6 max-w-2xl mx-auto">
          {t("description")}
        </p>

        {/* Progress Section */}
        <div className="w-full max-w-md mx-auto space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground font-medium">
              {t("progress.completion")}
            </span>
            <span className="font-bold text-primary">
              {filledFields} / {totalFields} {t("progress.fields")}
            </span>
          </div>

          <Progress value={completionPercentage} className="h-3" />

          <div className="flex justify-center">
            <Badge
              variant={completionPercentage === 100 ? "default" : "secondary"}
              className="text-sm px-3 py-1"
            >
              {completionPercentage}% {t("progress.complete")}
            </Badge>
          </div>
        </div>
      </motion.div>

      {/* Dynamic Field Categories */}
      {hasFields && (
        <div className="space-y-6">
          {(
            Object.entries(fieldGroups) as [
              FieldCategory,
              (typeof fieldGroups)[FieldCategory],
            ][]
          )
            .filter(([_, fields]) => fields.length > 0)
            .map(([category, fields]) => (
              <ConfirmationCategoryCard
                key={category}
                category={category}
                fields={fields}
                onEditField={handleEditField}
                showEditButtons={showEditButtons}
              />
            ))}
        </div>
      )}

      {/* eKYC Verification Status */}
      {ekycVerification && (
        <motion.div variants={itemVariants}>
          <div className="bg-card border rounded-xl p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-primary shadow-lg">
                <ShieldCheck className="w-6 h-6 text-primary-foreground" />
              </div>

              <div className="flex-1">
                <h3 className="text-lg font-semibold mb-1">
                  {t("ekyc.title")}
                </h3>
                <div className="flex items-center gap-3">
                  {ekycVerification.completed ? (
                    <>
                      <Badge variant="default">✓ {t("ekyc.verified")}</Badge>
                      {ekycVerification.sessionId && (
                        <span className="text-sm text-muted-foreground font-mono">
                          ID: {ekycVerification.sessionId}
                        </span>
                      )}
                    </>
                  ) : (
                    <Badge variant="destructive">
                      ✗ {t("ekyc.notVerified")}
                    </Badge>
                  )}
                </div>

                {ekycVerification.timestamp && (
                  <p className="text-sm text-muted-foreground mt-2">
                    {t("ekyc.verifiedAt")}:{" "}
                    {new Date(ekycVerification.timestamp).toLocaleString(
                      "vi-VN",
                    )}
                  </p>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Action Buttons */}
      <motion.div
        variants={itemVariants}
        className="flex flex-col sm:flex-row gap-4 justify-center pt-4"
      >
        <Button
          onClick={handleSubmit}
          disabled={submitting || !hasFields}
          size="lg"
          className="px-8 py-4 text-lg font-semibold min-w-[200px]"
        >
          <AnimatePresence mode="wait">
            {submitting ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex items-center gap-2"
              >
                <Loader2 className="w-5 h-5 animate-spin" />
                {t("submitting")}
              </motion.div>
            ) : (
              <motion.div
                key="submit"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
              >
                {t("submit")}
              </motion.div>
            )}
          </AnimatePresence>
        </Button>

        {showEditButtons && onEditField && (
          <Button
            variant="outline"
            size="lg"
            onClick={() => onEditField(null, null)}
            className="px-8 py-4 text-lg font-semibold"
          >
            <Edit3 className="w-5 h-5 mr-2" />
            {t("editForm")}
          </Button>
        )}
      </motion.div>

      {/* Empty State */}
      {!hasFields && (
        <motion.div variants={itemVariants} className="text-center py-12">
          <div className="text-muted-foreground text-lg">{t("noData")}</div>
        </motion.div>
      )}
    </motion.div>
  );
}
