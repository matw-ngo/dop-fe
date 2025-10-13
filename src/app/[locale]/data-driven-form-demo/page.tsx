"use client";

// Complete Data-Driven UI Demo
// Demonstrates all features: basic forms, multi-step forms, conditional fields, async options

import React, { useState } from "react";
import { FormRenderer } from "@/components/renderer/FormRenderer";
import { MultiStepFormRenderer } from "@/components/renderer/MultiStepFormRenderer";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { RawFieldConfig } from "@/types/data-driven-ui";
import { toast } from "sonner";
import {
  createInputField,
  createTextareaField,
  createSelectField,
  createRadioGroupField,
  createCheckboxField,
  createDatePickerField,
  createDateRangePickerField,
  createToggleGroupField,
  createInputOTPField,
  createEkycField,
} from "@/lib/field-builder";
import { multiStepForm } from "@/lib/multi-step-form-builder";
import {
  User,
  Briefcase,
  MapPin,
  FileText,
  CheckCircle,
  Shield,
} from "lucide-react";

export default function DataDrivenFormDemo() {
  const [activeTab, setActiveTab] = useState("basic");

  // ==================== BASIC FORM ====================
  // Mock data simulating backend API response
  const basicFormFields: RawFieldConfig[] = [
    createInputField("fullName", {
      labelKey: "form.field.fullName.label",
      placeholderKey: "form.field.fullName.placeholder",
      descriptionKey: "form.field.fullName.description",
      validations: [
        {
          type: "required",
          messageKey: "form.error.required",
        },
        {
          type: "minLength",
          value: 3,
          messageKey: "form.error.minLength",
        },
      ],
    }),

    createInputField("email", {
      type: "email",
      labelKey: "form.field.email.label",
      placeholderKey: "form.field.email.placeholder",
      validations: [
        {
          type: "required",
          messageKey: "form.error.required",
        },
        {
          type: "email",
          messageKey: "form.error.email.invalid",
        },
      ],
    }),

    createInputField("password", {
      type: "password",
      labelKey: "form.field.password.label",
      placeholderKey: "form.field.password.placeholder",
      validations: [
        {
          type: "required",
          messageKey: "form.error.required",
        },
        {
          type: "minLength",
          value: 8,
          messageKey: "form.error.password.minLength",
        },
      ],
    }),

    createInputField("age", {
      type: "number",
      label: "Age",
      placeholder: "Enter your age",
      validations: [
        {
          type: "required",
          messageKey: "form.error.required",
        },
        {
          type: "min",
          value: 18,
          messageKey: "form.error.min",
        },
        {
          type: "max",
          value: 120,
          messageKey: "form.error.max",
        },
      ],
    }),

    createSelectField("country", {
      label: "Country",
      placeholderKey: "form.field.select.placeholder",
      options: [
        { value: "us", label: "United States" },
        { value: "uk", label: "United Kingdom" },
        { value: "vn", label: "Vietnam" },
        { value: "jp", label: "Japan" },
      ],
      validations: [
        {
          type: "required",
          messageKey: "form.error.required",
        },
      ],
    }),

    createRadioGroupField("gender", {
      label: "Gender",
      options: [
        { value: "male", label: "Male" },
        { value: "female", label: "Female" },
        { value: "other", label: "Other" },
      ],
      direction: "horizontal",
      validations: [
        {
          type: "required",
          messageKey: "form.error.required",
        },
      ],
    }),

    createInputField("website", {
      type: "url",
      label: "Website",
      placeholder: "https://example.com",
      validations: [
        {
          type: "url",
          messageKey: "form.error.url.invalid",
        },
      ],
    }),

    createTextareaField("bio", {
      label: "Biography",
      placeholderKey: "form.field.textarea.placeholder",
      rows: 4,
      validations: [
        {
          type: "minLength",
          value: 10,
          messageKey: "form.error.minLength",
        },
        {
          type: "maxLength",
          value: 500,
          messageKey: "form.error.maxLength",
        },
      ],
    }),

    createDatePickerField("birthDate", {
      label: "Birth Date",
      placeholder: "Select your birth date",
      validations: [
        {
          type: "required",
          messageKey: "form.error.required",
        },
      ],
    }),

    createDateRangePickerField("vacationPeriod", {
      label: "Vacation Period",
      placeholder: "Select vacation dates",
      description: "Choose your preferred vacation dates",
    }),

    createDatePickerField("appointmentDate", {
      label: "Appointment Date",
      placeholder: "Pick an appointment date",
      dateFormat: "PPP",
    }),

    // Example: Async select with API call
    createSelectField("asyncCountry", {
      label: "Country (Async)",
      placeholder: "Select country",
      options: [], // Will be populated by optionsFetcher
      optionsFetcher: {
        fetcher: async () => {
          // Simulate API call
          await new Promise((resolve) => setTimeout(resolve, 1000));
          return [
            { id: "us", name: "United States" },
            { id: "uk", name: "United Kingdom" },
            { id: "vn", name: "Vietnam" },
          ];
        },
        transform: (data: any[]) =>
          data.map((item) => ({
            value: item.id,
            label: item.name,
          })),
        cacheKey: "countries",
        cacheDuration: 5 * 60 * 1000, // 5 minutes
      },
    }),

    // Example: Cascading select (depends on country)
    createSelectField("asyncCity", {
      label: "City (Depends on Country)",
      placeholder: "Select city",
      options: [],
      optionsFetcher: {
        fetcher: async (formData: any) => {
          const countryId = formData.asyncCountry;
          if (!countryId) return [];

          // Simulate API call
          await new Promise((resolve) => setTimeout(resolve, 800));

          const cities: Record<string, any[]> = {
            us: [
              { id: "nyc", name: "New York" },
              { id: "la", name: "Los Angeles" },
            ],
            uk: [
              { id: "lon", name: "London" },
              { id: "man", name: "Manchester" },
            ],
            vn: [
              { id: "hn", name: "Hà Nội" },
              { id: "hcm", name: "TP.HCM" },
            ],
          };

          return cities[countryId] || [];
        },
        transform: (data: any[]) =>
          data.map((item) => ({
            value: item.id,
            label: item.name,
          })),
        dependsOn: ["asyncCountry"], // This field depends on asyncCountry
      },
    }),

    createToggleGroupField("preferredContactMethod", {
      label: "Preferred Contact Method",
      options: [
        { value: "email", label: "Email" },
        { value: "phone", label: "Phone" },
        { value: "sms", label: "SMS" },
      ],
      type: "single",
      variant: "outline",
      validations: [
        {
          type: "required",
          messageKey: "form.error.required",
        },
      ],
    }),

    createInputOTPField("verificationCode", {
      label: "Verification Code",
      placeholder: "Enter 6-digit code",
      maxLength: 6,
      groupSize: 3,
      validations: [
        {
          type: "required",
          messageKey: "form.error.required",
        },
      ],
    }),

    createCheckboxField("terms", {
      label: "I agree to the terms and conditions",
      validations: [
        {
          type: "required",
          messageKey: "form.error.required",
        },
      ],
    }),
  ];

  // ==================== CONDITIONAL FIELDS FORM ====================
  const conditionalFormFields: RawFieldConfig[] = [
    createSelectField("accountType", {
      label: "Account Type",
      placeholder: "Select account type",
      options: [
        { value: "personal", label: "Personal" },
        { value: "business", label: "Business" },
        { value: "enterprise", label: "Enterprise" },
      ],
      validations: [{ type: "required", messageKey: "form.error.required" }],
    }),

    // Show only if accountType is 'business' or 'enterprise'
    createInputField(
      "companyName",
      {
        label: "Company Name",
        placeholder: "Enter company name",
        validations: [{ type: "required", messageKey: "form.error.required" }],
      },
      {
        fieldName: "accountType",
        operator: "in",
        value: ["business", "enterprise"],
      },
    ),

    // Show only if accountType is 'enterprise'
    createInputField(
      "employeeCount",
      {
        type: "number",
        label: "Number of Employees",
        placeholder: "Enter employee count",
        validations: [
          { type: "required", messageKey: "form.error.required" },
          { type: "min", value: 1, messageKey: "form.error.min" },
        ],
      },
      {
        fieldName: "accountType",
        operator: "equals",
        value: "enterprise",
      },
    ),

    createRadioGroupField("hasExperience", {
      label: "Do you have prior experience with our products?",
      options: [
        { value: "yes", label: "Yes" },
        { value: "no", label: "No" },
      ],
      direction: "horizontal",
      validations: [{ type: "required", messageKey: "form.error.required" }],
    }),

    // Show only if hasExperience is 'yes'
    createInputField(
      "yearsExperience",
      {
        type: "number",
        label: "Years of Experience",
        placeholder: "How many years?",
        validations: [
          { type: "required", messageKey: "form.error.required" },
          { type: "min", value: 0, messageKey: "form.error.min" },
        ],
      },
      {
        fieldName: "hasExperience",
        operator: "equals",
        value: "yes",
      },
    ),

    createCheckboxField("needsSupport", {
      label: "I need technical support",
    }),

    // Show only if needsSupport is checked
    createSelectField(
      "supportType",
      {
        label: "Type of Support Needed",
        placeholder: "Select support type",
        options: [
          { value: "installation", label: "Installation Help" },
          { value: "configuration", label: "Configuration" },
          { value: "troubleshooting", label: "Troubleshooting" },
          { value: "training", label: "Training" },
        ],
        validations: [{ type: "required", messageKey: "form.error.required" }],
      },
      {
        fieldName: "needsSupport",
        operator: "isTrue",
      },
    ),

    // Complex condition: Show only if accountType is 'enterprise' AND hasExperience is 'yes'
    createTextareaField(
      "migrationPlan",
      {
        label: "Migration Plan Details",
        placeholder: "Describe your migration plan...",
        rows: 4,
      },
      {
        logic: "AND",
        rules: [
          { fieldName: "accountType", operator: "equals", value: "enterprise" },
          { fieldName: "hasExperience", operator: "equals", value: "yes" },
        ],
      },
    ),

    createInputField("budget", {
      type: "number",
      label: "Monthly Budget (USD)",
      placeholder: "Enter your budget",
      validations: [
        { type: "required", messageKey: "form.error.required" },
        { type: "min", value: 0, messageKey: "form.error.min" },
      ],
    }),

    // Show only if budget > 10000
    createCheckboxField(
      "dedicatedManager",
      {
        label: "I want a dedicated account manager",
      },
      {
        fieldName: "budget",
        operator: "greaterThan",
        value: 10000,
      },
    ),

    // Complex OR condition: Show if accountType is 'enterprise' OR budget > 5000
    createTextareaField(
      "customRequirements",
      {
        label: "Custom Requirements",
        placeholder: "Tell us about your specific needs...",
        rows: 3,
      },
      {
        logic: "OR",
        rules: [
          { fieldName: "accountType", operator: "equals", value: "enterprise" },
          { fieldName: "budget", operator: "greaterThan", value: 5000 },
        ],
      },
    ),
  ];

  // ==================== MULTI-STEP FORM ====================
  const registrationForm = multiStepForm()
    .addStep(
      "personal-info",
      "Personal Information",
      [
        createInputField("firstName", {
          label: "First Name",
          placeholder: "Enter your first name",
          validations: [
            { type: "required", messageKey: "form.error.required" },
            { type: "minLength", value: 2, messageKey: "form.error.minLength" },
          ],
        }),
        createInputField("lastName", {
          label: "Last Name",
          placeholder: "Enter your last name",
          validations: [
            { type: "required", messageKey: "form.error.required" },
            { type: "minLength", value: 2, messageKey: "form.error.minLength" },
          ],
        }),
        createInputField("email", {
          type: "email",
          label: "Email Address",
          placeholder: "your.email@example.com",
          validations: [
            { type: "required", messageKey: "form.error.required" },
            { type: "email", messageKey: "form.error.email.invalid" },
          ],
        }),
        createInputField("phone", {
          type: "tel",
          label: "Phone Number",
          placeholder: "+1 (555) 123-4567",
          validations: [
            { type: "required", messageKey: "form.error.required" },
          ],
        }),
        createDatePickerField("dateOfBirth", {
          label: "Date of Birth",
          placeholder: "Select your birth date",
          validations: [
            { type: "required", messageKey: "form.error.required" },
          ],
        }),
      ],
      {
        description: "Let's start with your basic information",
        icon: <User className="h-5 w-5" />,
      },
    )
    .addStep(
      "professional-info",
      "Professional Details",
      [
        createInputField("jobTitle", {
          label: "Job Title",
          placeholder: "e.g., Software Engineer",
          validations: [
            { type: "required", messageKey: "form.error.required" },
          ],
        }),
        createInputField("company", {
          label: "Company Name",
          placeholder: "Enter your company name",
        }),
        createSelectField("industry", {
          label: "Industry",
          placeholder: "Select your industry",
          options: [
            { value: "tech", label: "Technology" },
            { value: "finance", label: "Finance" },
            { value: "healthcare", label: "Healthcare" },
            { value: "education", label: "Education" },
            { value: "retail", label: "Retail" },
            { value: "other", label: "Other" },
          ],
          validations: [
            { type: "required", messageKey: "form.error.required" },
          ],
        }),
        createInputField("experience", {
          type: "number",
          label: "Years of Experience",
          placeholder: "Enter years of experience",
          validations: [
            { type: "required", messageKey: "form.error.required" },
            { type: "min", value: 0, messageKey: "form.error.min" },
          ],
        }),
      ],
      {
        description: "Tell us about your professional background",
        icon: <Briefcase className="h-5 w-5" />,
      },
    )
    .addStep(
      "location-preferences",
      "Location & Preferences",
      [
        // Async select with API call
        createSelectField("country", {
          label: "Country (with Async Options)",
          placeholder: "Select your country",
          options: [],
          optionsFetcher: {
            fetcher: async () => {
              // Simulate API call
              await new Promise((resolve) => setTimeout(resolve, 800));
              return [
                { id: "us", name: "United States" },
                { id: "uk", name: "United Kingdom" },
                { id: "ca", name: "Canada" },
                { id: "au", name: "Australia" },
                { id: "vn", name: "Vietnam" },
              ];
            },
            transform: (data: any[]) =>
              data.map((item) => ({
                value: item.id,
                label: item.name,
              })),
            cacheKey: "countries-multistep",
          },
          validations: [
            { type: "required", messageKey: "form.error.required" },
          ],
        }),

        // Cascading select based on country
        createSelectField("city", {
          label: "City (Depends on Country)",
          placeholder: "Select your city",
          options: [],
          optionsFetcher: {
            fetcher: async (formData: any) => {
              const countryId = formData.country;
              if (!countryId) return [];

              await new Promise((resolve) => setTimeout(resolve, 600));

              const cities: Record<string, any[]> = {
                us: [
                  { id: "nyc", name: "New York" },
                  { id: "sf", name: "San Francisco" },
                  { id: "la", name: "Los Angeles" },
                ],
                uk: [
                  { id: "lon", name: "London" },
                  { id: "man", name: "Manchester" },
                  { id: "bir", name: "Birmingham" },
                ],
                ca: [
                  { id: "tor", name: "Toronto" },
                  { id: "van", name: "Vancouver" },
                  { id: "mon", name: "Montreal" },
                ],
                au: [
                  { id: "syd", name: "Sydney" },
                  { id: "mel", name: "Melbourne" },
                  { id: "bri", name: "Brisbane" },
                ],
                vn: [
                  { id: "hn", name: "Hà Nội" },
                  { id: "hcm", name: "TP.HCM" },
                  { id: "dn", name: "Đà Nẵng" },
                ],
              };

              return cities[countryId] || [];
            },
            transform: (data: any[]) =>
              data.map((item) => ({
                value: item.id,
                label: item.name,
              })),
            dependsOn: ["country"],
          },
          validations: [
            { type: "required", messageKey: "form.error.required" },
          ],
        }),

        createRadioGroupField("workMode", {
          label: "Preferred Work Mode",
          options: [
            { value: "remote", label: "Remote" },
            { value: "hybrid", label: "Hybrid" },
            { value: "onsite", label: "On-site" },
          ],
          direction: "horizontal",
          validations: [
            { type: "required", messageKey: "form.error.required" },
          ],
        }),

        // Conditional field: Show only for on-site workers
        createInputField(
          "officeAddress",
          {
            label: "Office Address",
            placeholder: "Enter office address",
            validations: [
              { type: "required", messageKey: "form.error.required" },
            ],
          },
          {
            fieldName: "workMode",
            operator: "equals",
            value: "onsite",
          },
        ),

        // Conditional field: Show only for remote/hybrid workers
        createCheckboxField(
          "hasHomeOffice",
          {
            label: "I have a dedicated home office",
          },
          {
            fieldName: "workMode",
            operator: "in",
            value: ["remote", "hybrid"],
          },
        ),

        createToggleGroupField("skills", {
          label: "Primary Skills (Optional)",
          options: [
            { value: "frontend", label: "Frontend" },
            { value: "backend", label: "Backend" },
            { value: "devops", label: "DevOps" },
            { value: "design", label: "Design" },
          ],
          type: "multiple",
          variant: "outline",
        }),
      ],
      {
        description:
          "Where are you located and what do you prefer? (with Async & Conditional)",
        icon: <MapPin className="h-5 w-5" />,
        optional: true,
      },
    )
    .addStep(
      "ekyc-verification",
      "eKYC Verification",
      [
        createEkycField("ekycVerification", {
          flowType: "FACE",
          language: "vi",
          height: 600,
          validations: [
            { type: "required", messageKey: "form.error.required" },
          ],
        }),
      ],
      {
        description: "Verify your identity with facial recognition",
        icon: <Shield className="h-5 w-5" />,
      },
    )
    .addStep(
      "additional-info",
      "Additional Information",
      [
        createTextareaField("bio", {
          label: "Short Bio",
          placeholder: "Tell us a bit about yourself...",
          rows: 5,
          validations: [
            {
              type: "minLength",
              value: 50,
              messageKey: "form.error.minLength",
            },
            {
              type: "maxLength",
              value: 500,
              messageKey: "form.error.maxLength",
            },
          ],
        }),
        createInputField("linkedin", {
          type: "url",
          label: "LinkedIn Profile",
          placeholder: "https://linkedin.com/in/yourprofile",
          validations: [{ type: "url", messageKey: "form.error.url.invalid" }],
        }),
        createInputField("portfolio", {
          type: "url",
          label: "Portfolio Website",
          placeholder: "https://yourportfolio.com",
          validations: [{ type: "url", messageKey: "form.error.url.invalid" }],
        }),
      ],
      {
        description: "Add more details about yourself (Optional)",
        icon: <FileText className="h-5 w-5" />,
        optional: true,
      },
    )
    .addStep(
      "review-submit",
      "Review & Submit",
      [
        createCheckboxField("terms", {
          label: "I agree to the terms and conditions",
          validations: [
            { type: "required", messageKey: "form.error.required" },
          ],
        }),
        createCheckboxField("newsletter", {
          label: "Subscribe to our newsletter",
        }),
      ],
      {
        description: "Review your information and submit",
        icon: <CheckCircle className="h-5 w-5" />,
      },
    )
    .persistData(true, "registration-form-data")
    .allowBackNavigation(true)
    .setProgressStyle("steps")
    .onStepComplete(async (stepId, stepData) => {
      console.log(`Step ${stepId} completed with data:`, stepData);
      await new Promise((resolve) => setTimeout(resolve, 500));
      toast.success(`Step completed!`, {
        description: `Your ${stepId.replace(/-/g, " ")} has been saved.`,
      });
    })
    .onComplete(async (allData) => {
      console.log("Form completed with all data:", allData);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success("Registration completed!", {
        description: "Your profile has been successfully created.",
        duration: 5000,
      });
    })
    .onStepChange((fromStep, toStep) => {
      console.log(`Navigating from step ${fromStep} to step ${toStep}`);
    })
    .build();

  // ==================== HANDLERS ====================
  const handleBasicSubmit = async (data: Record<string, any>) => {
    console.log("Basic form submitted:", data);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    toast.success("Form submitted successfully!", {
      description: JSON.stringify(data, null, 2),
    });
  };

  const handleConditionalSubmit = async (data: Record<string, any>) => {
    console.log("Conditional form submitted:", data);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    toast.success("Conditional form submitted!", {
      description: "All conditional logic validated successfully!",
    });
  };

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="basic">Basic Form</TabsTrigger>
            <TabsTrigger value="conditional">Conditional Fields</TabsTrigger>
            <TabsTrigger value="multistep">Multi-Step Form</TabsTrigger>
          </TabsList>

          {/* ==================== BASIC FORM TAB ==================== */}
          <TabsContent value="basic" className="space-y-4">
            <Card>
              <CardContent>
                <FormRenderer
                  fields={basicFormFields}
                  onSubmit={handleBasicSubmit}
                  formActions={
                    <>
                      <Button type="button" variant="outline">
                        Cancel
                      </Button>
                      <Button type="submit">Submit</Button>
                    </>
                  }
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* ==================== CONDITIONAL FIELDS TAB ==================== */}
          <TabsContent value="conditional" className="space-y-4">
            <Card>
              <CardContent>
                <FormRenderer
                  fields={conditionalFormFields}
                  onSubmit={handleConditionalSubmit}
                  formActions={
                    <>
                      <Button type="button" variant="outline">
                        Reset
                      </Button>
                      <Button type="submit">Submit Conditional Form</Button>
                    </>
                  }
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* ==================== MULTI-STEP FORM TAB ==================== */}
          <TabsContent value="multistep" className="space-y-4">
            <Card>
              <CardContent>
                <MultiStepFormRenderer config={registrationForm} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
