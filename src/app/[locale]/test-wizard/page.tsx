"use client";

import {
  FieldType,
  StepWizard,
  ValidationRuleType,
} from "@/components/form-generation";
import type { DynamicFormConfig } from "@/components/form-generation";
import { useState } from "react";

export default function WizardTestPage() {
  const [submittedData, setSubmittedData] = useState<Record<
    string,
    any
  > | null>(null);

  const wizardConfig: DynamicFormConfig = {
    id: "onboarding-wizard",
    steps: [
      {
        id: "personal-info",
        fields: [
          {
            id: "firstName",
            name: "firstName",
            type: FieldType.TEXT,
            label: "First Name",
            placeholder: "John",
            validation: [
              {
                type: ValidationRuleType.REQUIRED,
                message: "First name is required",
              },
            ],
          },
          {
            id: "lastName",
            name: "lastName",
            type: FieldType.TEXT,
            label: "Last Name",
            placeholder: "Doe",
            validation: [
              {
                type: ValidationRuleType.REQUIRED,
                message: "Last name is required",
              },
            ],
          },
          {
            id: "email",
            name: "email",
            type: FieldType.EMAIL,
            label: "Email",
            placeholder: "john@example.com",
            validation: [
              {
                type: ValidationRuleType.REQUIRED,
                message: "Email is required",
              },
            ],
          },
        ],
      },
      {
        id: "preferences",
        title: "Preferences",
        description: "Customize your experience",
        fields: [
          {
            id: "newsletter",
            name: "newsletter",
            type: FieldType.SWITCH,
            label: "Subscribe to Newsletter",
          },
          {
            id: "notifications",
            name: "notifications",
            type: FieldType.SWITCH,
            label: "Enable Notifications",
          },
        ],
        optional: true,
      },
      {
        id: "confirmation",
        title: "Review & Confirm",
        description: "Please review your information",
        type: "review",
        fields: [],
      },
    ],
    navigation: {
      showProgress: true,
      progressType: "bar",
      showStepNumbers: true,
      showStepTitles: true,
    },
  };

  const handleComplete = (data: Record<string, any>) => {
    console.log("Wizard completed:", data);
    setSubmittedData(data);
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold">Multi-Step Wizard Test</h1>
          <p className="text-muted-foreground">
            Testing P5.1 Foundation - StepWizard with Zustand state management
          </p>
        </div>

        <div className="rounded-lg border bg-card p-8">
          <StepWizard config={wizardConfig} onComplete={handleComplete} />
        </div>

        {submittedData && (
          <div className="rounded-lg border bg-muted p-6">
            <h3 className="font-semibold mb-4">✅ Wizard Completed!</h3>
            <pre className="text-xs overflow-auto">
              {JSON.stringify(submittedData, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
