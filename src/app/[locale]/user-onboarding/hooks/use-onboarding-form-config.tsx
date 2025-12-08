"use client";

import { useMemo } from "react";
import { multiStepForm } from "@/components/renderer/builders/multi-step-form-builder";
import {
  createInputField,
  createSelectField,
  createDatePickerField,
  createEkycField,
  createConfirmationField,
} from "@/components/renderer/builders/field-builder";
import {
  User,
  Shield,
  CheckCircle,
  UserCircle,
  FileText,
  CreditCard,
  MapPin,
  Calendar,
  DollarSign,
  Briefcase,
  Heart,
} from "lucide-react";
import type { MappedFlow, MappedStep } from "@/mappers/flowMapper";
import type {
  ComponentVariant,
  AnimationVariant,
} from "@/components/renderer/types/ui-theme";

// UI Customization helpers
const createFieldVariant = (
  size: ComponentVariant["size"] = "md",
  color: ComponentVariant["color"] = "primary",
  variant: ComponentVariant["variant"] = "outline",
): ComponentVariant => ({
  size,
  color,
  variant,
});

const createFieldAnimation = (
  type: AnimationVariant["type"] = "fade",
  direction: AnimationVariant["direction"] = "up",
  duration: AnimationVariant["duration"] = 300,
): AnimationVariant => ({
  type,
  direction,
  duration,
  easing: "out",
});

// Field type to icon mapping
const getFieldIcon = (fieldType: string) => {
  const iconMap: Record<string, any> = {
    fullName: UserCircle,
    email: FileText,
    phoneNumber: CreditCard,
    nationalId: CreditCard,
    secondNationalId: CreditCard,
    location: MapPin,
    dateOfBirth: Calendar,
    income: DollarSign,
    incomeType: DollarSign,
    havingLoan: DollarSign,
    careerStatus: Briefcase,
    careerType: Briefcase,
    purpose: Heart,
    creditStatus: CreditCard,
  };
  return iconMap[fieldType] || User;
};

// This function generates the field builder map using translations
const getFieldBuilderMap = (
  t: (key: string) => string,
): Record<string, any> => ({
  fullName: (config: any) => {
    const fieldConfig = createInputField("fullName", {
      label: t("fields.fullName.label"),
      placeholder: t("fields.fullName.placeholder"),
      leftIcon: getFieldIcon("fullName"),
      variant: createFieldVariant("sm", "primary", "outline"),
      animation: createFieldAnimation("fade", "up", 150),
      layout: {
        display: "block",
        padding: "p-2",
      },
      className: "col-span-1 md:col-span-2",
      ...config,
    });
    return fieldConfig;
  },
  email: (config: any) => {
    const fieldConfig = createInputField("email", {
      type: "email",
      label: t("fields.email.label"),
      placeholder: t("fields.email.placeholder"),
      leftIcon: getFieldIcon("email"),
      variant: createFieldVariant("sm", "primary", "outline"),
      animation: createFieldAnimation("fade", "up", 150),
      layout: { display: "block", padding: "p-2" },
      className: "col-span-1",
      ...config,
    });
    return fieldConfig;
  },
  phoneNumber: (config: any) => {
    const fieldConfig = createInputField("phoneNumber", {
      type: "tel",
      label: t("fields.phoneNumber.label"),
      placeholder: t("fields.phoneNumber.placeholder"),
      leftIcon: getFieldIcon("phoneNumber"),
      variant: createFieldVariant("sm", "primary", "outline"),
      animation: createFieldAnimation("fade", "up", 150),
      layout: { display: "block", padding: "p-2" },
      className: "col-span-1",
      ...config,
    });
    return fieldConfig;
  },
  dateOfBirth: (config: any) => {
    const fieldConfig = createDatePickerField("dateOfBirth", {
      label: t("fields.dateOfBirth.label"),
      leftIcon: getFieldIcon("dateOfBirth"),
      variant: createFieldVariant("sm", "primary", "outline"),
      animation: createFieldAnimation("fade", "up", 150),
      layout: { display: "block", padding: "p-2" },
      className: "col-span-1",
      ...config,
    });
    return fieldConfig;
  },
  gender: (config: any) => {
    const fieldConfig = createSelectField("gender", {
      label: t("fields.gender.label"),
      leftIcon: User,
      options: [
        { value: "male", label: t("fields.gender.options.male") },
        { value: "female", label: t("fields.gender.options.female") },
        { value: "other", label: t("fields.gender.options.other") },
      ],
      variant: createFieldVariant("sm", "primary", "outline"),
      animation: createFieldAnimation("fade", "up", 150),
      layout: { display: "block", padding: "p-2" },
      className: "col-span-1",
      ...config,
    });
    return fieldConfig;
  },
  nationalId: (config: any) => {
    const fieldConfig = createInputField("nationalId", {
      label: t("fields.nationalId.label"),
      placeholder: t("fields.nationalId.placeholder"),
      leftIcon: getFieldIcon("nationalId"),
      variant: createFieldVariant("sm", "primary", "outline"),
      animation: createFieldAnimation("fade", "up", 150),
      layout: { display: "block", padding: "p-2" },
      className: "col-span-1",
      ...config,
    });
    return fieldConfig;
  },
  secondNationalId: (config: any) => {
    const fieldConfig = createInputField("secondNationalId", {
      label: t("fields.secondNationalId.label"),
      placeholder: t("fields.secondNationalId.placeholder"),
      leftIcon: getFieldIcon("secondNationalId"),
      variant: createFieldVariant("sm", "primary", "outline"),
      animation: createFieldAnimation("fade", "up", 150),
      layout: { display: "block", padding: "p-2" },
      className: "col-span-1",
      ...config,
    });
    return fieldConfig;
  },
  location: (config: any) => {
    const fieldConfig = createInputField("location", {
      label: t("fields.location.label"),
      placeholder: t("fields.location.placeholder"),
      leftIcon: getFieldIcon("location"),
      variant: createFieldVariant("sm", "primary", "outline"),
      animation: createFieldAnimation("fade", "up", 150),
      layout: { display: "block", padding: "p-2" },
      className: "col-span-1",
      ...config,
    });
    return fieldConfig;
  },
  incomeType: (config: any) => {
    const fieldConfig = createSelectField("incomeType", {
      label: t("fields.incomeType.label"),
      leftIcon: getFieldIcon("incomeType"),
      options: [], // TODO: Add options
      variant: createFieldVariant("sm", "primary", "outline"),
      animation: createFieldAnimation("fade", "up", 150),
      layout: { display: "block", padding: "p-2" },
      className: "col-span-1",
      ...config,
    });
    return fieldConfig;
  },
  income: (config: any) => {
    const fieldConfig = createInputField("income", {
      type: "number",
      label: t("fields.income.label"),
      placeholder: t("fields.income.placeholder"),
      leftIcon: getFieldIcon("income"),
      variant: createFieldVariant("sm", "primary", "outline"),
      animation: createFieldAnimation("fade", "up", 150),
      layout: { display: "block", padding: "p-2" },
      className: "col-span-1",
      ...config,
    });
    return fieldConfig;
  },
  havingLoan: (config: any) => {
    const fieldConfig = createSelectField("havingLoan", {
      label: t("fields.havingLoan.label"),
      leftIcon: getFieldIcon("havingLoan"),
      options: [
        { value: "true", label: t("common.yes") },
        { value: "false", label: t("common.no") },
      ],
      variant: createFieldVariant("sm", "warning", "outline"),
      animation: createFieldAnimation("fade", "up", 150),
      layout: { display: "block", padding: "p-2" },
      className: "col-span-1",
      ...config,
    });
    return fieldConfig;
  },
  careerStatus: (config: any) => {
    const fieldConfig = createSelectField("careerStatus", {
      label: t("fields.careerStatus.label"),
      leftIcon: getFieldIcon("careerStatus"),
      options: [], // TODO: Add options
      variant: createFieldVariant("sm", "primary", "outline"),
      animation: createFieldAnimation("fade", "up", 150),
      layout: { display: "block", padding: "p-2" },
      className: "col-span-1",
      ...config,
    });
    return fieldConfig;
  },
  careerType: (config: any) => {
    const fieldConfig = createSelectField("careerType", {
      label: t("fields.careerType.label"),
      leftIcon: getFieldIcon("careerType"),
      options: [], // TODO: Add options
      variant: createFieldVariant("sm", "primary", "outline"),
      animation: createFieldAnimation("fade", "up", 150),
      layout: { display: "block", padding: "p-2" },
      className: "col-span-1",
      ...config,
    });
    return fieldConfig;
  },
  creditStatus: (config: any) => {
    const fieldConfig = createSelectField("creditStatus", {
      label: t("fields.creditStatus.label"),
      leftIcon: getFieldIcon("creditStatus"),
      options: [], // TODO: Add options
      variant: createFieldVariant("sm", "primary", "outline"),
      animation: createFieldAnimation("fade", "up", 150),
      layout: { display: "block", padding: "p-2" },
      className: "col-span-1",
      ...config,
    });
    return fieldConfig;
  },
  purpose: (config: any) => {
    const fieldConfig = createInputField("purpose", {
      label: t("fields.purpose.label"),
      placeholder: t("fields.purpose.placeholder"),
      leftIcon: getFieldIcon("purpose"),
      variant: createFieldVariant("sm", "primary", "outline"),
      animation: createFieldAnimation("fade", "up", 150),
      layout: { display: "block", padding: "p-2" },
      className: "col-span-1",
      ...config,
    });
    return fieldConfig;
  },
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

        // Pass config directly to builder
        fields.push(builder({ validations }));
      }
    }
  }
  return fields;
}

// Helper functions for enhanced step configuration
function getStepTitle(step: MappedStep, t: (key: string) => string): string {
  const fieldNames = Object.keys(step.fields).filter(
    (name) => (step.fields as any)[name]?.visible,
  );

  // Check for common field patterns
  if (
    fieldNames.includes("fullName") ||
    fieldNames.includes("email") ||
    fieldNames.includes("phoneNumber")
  ) {
    return t("steps.personalInfo.title");
  }
  if (
    fieldNames.includes("nationalId") ||
    fieldNames.includes("secondNationalId") ||
    fieldNames.includes("dateOfBirth")
  ) {
    return t("steps.identity.title");
  }
  if (
    fieldNames.includes("income") ||
    fieldNames.includes("incomeType") ||
    fieldNames.includes("careerStatus")
  ) {
    return t("steps.financial.title");
  }
  if (
    fieldNames.includes("purpose") ||
    fieldNames.includes("havingLoan") ||
    fieldNames.includes("creditStatus")
  ) {
    return t("steps.loan.title");
  }

  return t("steps.default.title");
}

function getStepDescription(
  step: MappedStep,
  t: (key: string) => string,
): string {
  const fieldNames = Object.keys(step.fields).filter(
    (name) => (step.fields as any)[name]?.visible,
  );

  if (
    fieldNames.includes("fullName") ||
    fieldNames.includes("email") ||
    fieldNames.includes("phoneNumber")
  ) {
    return t("steps.personalInfo.description");
  }
  if (fieldNames.includes("nationalId") || fieldNames.includes("dateOfBirth")) {
    return t("steps.identity.description");
  }
  if (fieldNames.includes("income") || fieldNames.includes("careerStatus")) {
    return t("steps.financial.description");
  }

  return "";
}

function getStepIcon(step: MappedStep): any {
  const fieldNames = Object.keys(step.fields).filter(
    (name) => (step.fields as any)[name]?.visible,
  );

  if (fieldNames.includes("fullName") || fieldNames.includes("email")) {
    return <UserCircle className="h-5 w-5" />;
  }
  if (fieldNames.includes("nationalId") || fieldNames.includes("creditCard")) {
    return <CreditCard className="h-5 w-5" />;
  }
  if (fieldNames.includes("income") || fieldNames.includes("havingLoan")) {
    return <DollarSign className="h-5 w-5" />;
  }
  if (
    fieldNames.includes("careerStatus") ||
    fieldNames.includes("careerType")
  ) {
    return <Briefcase className="h-5 w-5" />;
  }

  return <User className="h-5 w-5" />;
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
        // Determine step title based on field types
        const stepTitle = getStepTitle(step, t);
        const stepIcon = getStepIcon(step);

        builder.addStep(`step-${step.id}`, stepTitle, stepFields, {
          description: getStepDescription(step, t),
          icon: stepIcon,
          // Step-level UI customization
          variant: {
            size: "md",
            color: "primary",
            variant: "ghost",
          },
          animation: {
            type: "fade",
            direction: "up",
            duration: (200 + Math.min(index * 50, 500)) as
              | 300
              | 500
              | 700
              | 1000, // Faster staggered animation
            easing: "out",
          },
          responsive: {
            container: {
              initial: "w-full",
              md: "w-full",
              lg: "w-full",
            },
          },
          layout: {
            display: "grid",
            direction: "row",
            align: "start",
            gap: 4 as 4, // Theme spacing value
          },
          className: "step-content",
        });
      }
    });

    builder.addStep(
      "confirmation",
      t("steps.confirmation.title"),
      [
        createConfirmationField("review", {
          flowId: flowData?.id,
          stepId: "confirmation",
          domain: window.location.hostname,
        }),
      ],
      {
        description: t("steps.confirmation.description"),
        icon: <CheckCircle className="h-5 w-5 text-green-600" />,
      },
    );

    builder
      .persistData(true, "user-onboarding-data")
      .allowBackNavigation(true)
      .setProgressStyle("steps")
      .setFormVariant({
        size: "md",
        variant: "ghost",
        color: "primary",
      })
      .setStepTransitionAnimation({
        type: "fade",
        direction: "up",
        duration: 200,
      })
      .setResponsiveConfig({
        form: {
          initial: "w-full px-4",
          md: "max-w-5xl mx-auto px-6",
          lg: "max-w-6xl mx-auto px-8",
        },
        progress: {
          initial: "mb-4",
          md: "mb-6",
          lg: "mb-8",
        },
      })
      .setLayout({
        display: "grid",
        align: "start",
        gap: "8",
      })
      .onComplete(async (allData: any) => {
        console.log("🎉 Onboarding completed! All data:", allData);
        // Note: The actual API call is now handled in ConfirmationStep component
        // This onComplete is only called when the form is completed without using the confirmation button
        localStorage.removeItem("user-onboarding-data");
        alert(t("successAlert"));
      });

    return builder.build();
  }, [flowData, t, fieldBuilderMap]);

  return formConfig;
};
