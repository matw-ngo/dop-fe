"use client";

import { useMemo } from "react";
import { multiStepForm } from "@/lib/builders/multi-step-form-builder";
import {
  createInputField,
  createSelectField,
  createDatePickerField,
  createEkycField,
  createConfirmationField,
} from "@/lib/builders/field-builder";
import { User, Shield, CheckCircle } from "lucide-react";
import type { MappedFlow, MappedStep } from "@/mappers/flowMapper";

// This function generates the field builder map using translations
const getFieldBuilderMap = (
  t: (key: string) => string,
): Record<string, any> => ({
  fullName: (config: any) =>
    createInputField("fullName", {
      label: t("fields.fullName.label"),
      ...config,
    }),
  email: (config: any) =>
    createInputField("email", {
      type: "email",
      label: t("fields.email.label"),
      ...config,
    }),
  phoneNumber: (config: any) =>
    createInputField("phoneNumber", {
      type: "tel",
      label: t("fields.phoneNumber.label"),
      ...config,
    }),
  dateOfBirth: (config: any) =>
    createDatePickerField("dateOfBirth", {
      label: t("fields.dateOfBirth.label"),
      ...config,
    }),
  gender: (config: any) =>
    createSelectField("gender", {
      label: t("fields.gender.label"),
      options: [
        { value: "male", label: t("fields.gender.options.male") },
        { value: "female", label: t("fields.gender.options.female") },
        { value: "other", label: t("fields.gender.options.other") },
      ],
      ...config,
    }),
});

function generateFieldsForStep(
  step: MappedStep,
  fieldBuilderMap: Record<string, any>,
): any[] {
  const fields: any[] = [];

  for (const [fieldName, config] of Object.entries(step.fields)) {
    if (config.visible) {
      const builder = fieldBuilderMap[fieldName];
      if (builder) {
        const validations = config.required
          ? [{ type: "required", messageKey: "form.errors.required" }]
          : [];
        fields.push(builder({ validations }));
      }
    }
  }
  return fields;
}

export const useOnboardingFormConfig = (
  flowData: MappedFlow | undefined,
  t: (key: string) => string,
) => {
  const fieldBuilderMap = getFieldBuilderMap(t);

  const formConfig = useMemo(() => {
    if (!flowData) return null;

    const builder = multiStepForm();

    flowData.steps.forEach((step, index) => {
      const stepFields = generateFieldsForStep(step, fieldBuilderMap);

      if (step.useEkyc) {
        builder.addStep(
          `ekyc-verification-${index}`,
          t("steps.ekyc.title"),
          [
            createEkycField("ekycVerification", {
              label: t("steps.ekyc.label"),
              mode: "inline",
              validations: [
                { type: "required", messageKey: "form.errors.required" },
              ],
            }),
          ],
          {
            description: t("steps.ekyc.description"),
            icon: <Shield className="h-5 w-5" />,
          },
        );
      } else if (stepFields.length > 0) {
        builder.addStep(`step-${step.id}`, `Step ${index + 1}`, stepFields, {
          icon: <User className="h-5 w-5" />,
        });
      }
    });

    builder.addStep(
      "confirmation",
      t("steps.confirmation.title"),
      [createConfirmationField("review")],
      {
        description: t("steps.confirmation.description"),
        icon: <CheckCircle className="h-5 w-5" />,
      },
    );

    builder
      .persistData(true, "user-onboarding-data")
      .allowBackNavigation(true)
      .setProgressStyle("steps")
      .onComplete(async (allData) => {
        console.log("🎉 Onboarding completed! All data:", allData);
        localStorage.removeItem("user-onboarding-data");
        alert(t("successAlert"));
      });

    return builder.build();
  }, [flowData, t, fieldBuilderMap]);

  return formConfig;
};
