"use client";

import {
  DynamicForm,
  FieldType,
  ValidationRuleType,
  LayoutType,
} from "@/components/form-generation";
import type { DynamicFormConfig } from "@/components/form-generation";
import { useState } from "react";

export default function FormGenerationTestPage() {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [submittedData, setSubmittedData] = useState<Record<
    string,
    any
  > | null>(null);

  const testFormConfig: DynamicFormConfig = {
    fields: [
      // TextField
      // TextField
      {
        id: "username",
        name: "username",
        type: FieldType.TEXT,
        label: "Username",
        placeholder: "Enter your username",
        validation: [
          {
            type: ValidationRuleType.REQUIRED,
            message: "Username is required",
          },
          {
            type: ValidationRuleType.MIN_LENGTH,
            value: 3,
            message: "At least 3 characters",
          },
        ],
      },

      // Email Field
      {
        id: "email",
        name: "email",
        type: FieldType.EMAIL,
        label: "Email Address",
        placeholder: "you@example.com",
        validation: [
          { type: ValidationRuleType.REQUIRED, message: "Email is required" },
          {
            type: ValidationRuleType.PATTERN,
            value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            message: "Invalid email",
          },
        ],
      },

      // NumberField
      {
        id: "age",
        name: "age",
        type: FieldType.NUMBER,
        label: "Age",
        placeholder: "Enter your age",
        options: { min: 18, max: 100 },
        validation: [
          { type: ValidationRuleType.REQUIRED, message: "Age is required" },
          {
            type: ValidationRuleType.MIN,
            value: 18,
            message: "Must be 18 or older",
          },
        ],
      },

      // TextAreaField
      {
        id: "bio",
        name: "bio",
        type: FieldType.TEXTAREA,
        label: "Biography",
        placeholder: "Tell us about yourself...",
        options: {
          rows: 4,
          maxLength: 500,
          showCount: true,
        },
      },

      // SelectField
      {
        id: "country",
        name: "country",
        type: FieldType.SELECT,
        label: "Country",
        placeholder: "Select your country",
        options: {
          choices: [
            { value: "vn", label: "Vietnam" },
            { value: "us", label: "United States" },
            { value: "uk", label: "United Kingdom" },
            { value: "jp", label: "Japan" },
            { value: "sg", label: "Singapore" },
          ],
        },
        validation: [
          {
            type: ValidationRuleType.REQUIRED,
            message: "Please select a country",
          },
        ],
      },

      // SelectField with Groups
      {
        id: "category",
        name: "category",
        type: FieldType.SELECT,
        label: "Product Category",
        placeholder: "Select category",
        options: {
          choices: [
            { value: "laptop", label: "Laptop", group: "Electronics" },
            { value: "phone", label: "Smartphone", group: "Electronics" },
            { value: "tablet", label: "Tablet", group: "Electronics" },
            { value: "shirt", label: "T-Shirt", group: "Clothing" },
            { value: "jeans", label: "Jeans", group: "Clothing" },
            { value: "shoes", label: "Shoes", group: "Clothing" },
          ],
        },
      },

      // RadioField
      {
        id: "gender",
        name: "gender",
        type: FieldType.RADIO,
        label: "Gender",
        options: {
          choices: [
            { value: "male", label: "Male" },
            { value: "female", label: "Female" },
            { value: "other", label: "Other" },
          ],
          layout: "horizontal",
        },
        validation: [
          {
            type: ValidationRuleType.REQUIRED,
            message: "Please select gender",
          },
        ],
      },

      // CheckboxField (Single)
      {
        id: "terms",
        name: "terms",
        type: FieldType.CHECKBOX,
        label: "Terms and Conditions",
        options: {
          checkboxLabel: "I agree to the terms and conditions",
        },
        validation: [
          {
            type: ValidationRuleType.CUSTOM,
            validator: (value: any) => value === true,
            message: "You must accept the terms",
          },
        ],
      },

      // CheckboxField (Group)
      {
        id: "interests",
        name: "interests",
        type: FieldType.CHECKBOX_GROUP,
        label: "Interests",
        options: {
          choices: [
            { value: "coding", label: "Coding" },
            { value: "design", label: "Design" },
            { value: "music", label: "Music" },
            { value: "sports", label: "Sports" },
            { value: "reading", label: "Reading" },
          ],
        },
      },

      // SwitchField
      {
        id: "notifications",
        name: "notifications",
        type: FieldType.SWITCH,
        label: "Enable Notifications",
      },

      // SwitchField 2
      {
        id: "newsletter",
        name: "newsletter",
        type: FieldType.SWITCH,
        label: "Subscribe to Newsletter",
      },

      // DateField
      {
        id: "birthdate",
        name: "birthdate",
        type: FieldType.DATE,
        label: "Birth Date",
        options: {
          maxDate: new Date(),
        },
        validation: [
          {
            type: ValidationRuleType.REQUIRED,
            message: "Birth date is required",
          },
        ],
      },

      // DateTime Field
      {
        id: "appointment",
        name: "appointment",
        type: FieldType.DATETIME,
        label: "Appointment",
        placeholder: "Select date and time",
        options: {
          minDate: new Date(),
        },
      },

      // Time Field
      {
        id: "meeting_time",
        name: "meeting_time",
        type: FieldType.TIME,
        label: "Meeting Time",
      },
    ],
    layout: {
      type: LayoutType.STACK,
      columns: 1,
    },
    submitButton: {
      label: "Submit Form",
      position: "right",
    },
  };

  const handleSubmit = (data: Record<string, any>) => {
    console.log("Form submitted:", data);
    setSubmittedData(data);
  };

  const handleChange = (
    fieldName: string,
    value: any,
    formData: Record<string, any>,
  ) => {
    setFormData(formData);
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold">Form Generation Test Page</h1>
          <p className="text-muted-foreground">
            Testing all refactored field components with shadcn/ui and Radix UI
          </p>
        </div>

        {/* Form */}
        <div className="rounded-lg border bg-card p-8">
          <DynamicForm
            config={testFormConfig}
            onSubmit={handleSubmit}
            onChange={handleChange}
          />
        </div>

        {/* Debug Panel */}
        <div className="grid grid-cols-2 gap-4">
          {/* Current Form Data */}
          <div className="rounded-lg border bg-muted p-4">
            <h3 className="font-semibold mb-2">Current Form Data</h3>
            <pre className="text-xs overflow-auto max-h-96">
              {JSON.stringify(formData, null, 2)}
            </pre>
          </div>

          {/* Submitted Data */}
          <div className="rounded-lg border bg-muted p-4">
            <h3 className="font-semibold mb-2">Submitted Data</h3>
            {submittedData ? (
              <pre className="text-xs overflow-auto max-h-96">
                {JSON.stringify(submittedData, null, 2)}
              </pre>
            ) : (
              <p className="text-sm text-muted-foreground">
                No data submitted yet
              </p>
            )}
          </div>
        </div>

        {/* Test Checklist */}
        <div className="rounded-lg border bg-card p-6">
          <h3 className="font-semibold mb-4">Testing Checklist</h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <input type="checkbox" id="test-light" className="rounded" />
              <label htmlFor="test-light">Test all fields in light mode</label>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="test-dark" className="rounded" />
              <label htmlFor="test-dark">Test all fields in dark mode</label>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="test-focus" className="rounded" />
              <label htmlFor="test-focus">Verify focus states</label>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="test-errors" className="rounded" />
              <label htmlFor="test-errors">Test validation errors</label>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="test-keyboard" className="rounded" />
              <label htmlFor="test-keyboard">Test keyboard navigation</label>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="test-disabled" className="rounded" />
              <label htmlFor="test-disabled">Check disabled states</label>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="test-submit" className="rounded" />
              <label htmlFor="test-submit">Submit form successfully</label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
