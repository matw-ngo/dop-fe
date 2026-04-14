/**
 * Form Generation Library - Usage Example
 *
 * This file demonstrates how to use the form generation library
 */

import { type ApiFormConfig, DynamicForm, FormConfigMapper } from "./index";

// ============================================================================
// Example 1: Simple Contact Form
// ============================================================================

export const contactFormApiResponse: ApiFormConfig = {
  id: "contact-form",
  i18n: {
    namespace: "contact",
  },
  fields: [
    {
      id: "full_name",
      name: "fullName",
      type: "text",
      label: "Full Name",
      placeholder: "John Doe",
      validation: [
        { type: "required", message: "Name is required" },
        {
          type: "minLength",
          value: 2,
          message: "Name must be at least 2 characters",
        },
      ],
    },
    {
      id: "email",
      name: "email",
      type: "email",
      label: "Email",
      placeholder: "john@example.com",
      validation: [{ type: "required" }, { type: "email" }],
    },
    {
      id: "message",
      name: "message",
      type: "textarea",
      label: "Message",
      placeholder: "Your message here...",
      options: {
        rows: 5,
        maxLength: 500,
        showCount: true,
      },
      validation: [{ type: "required" }, { type: "maxLength", value: 500 }],
    },
  ],
  layout: {
    type: "stack",
    gap: "md",
  },
  submitButton: {
    label: "Send Message",
    position: "right",
  },
};

// ============================================================================
// Example 2: Loan Application Form with Sections
// ============================================================================

export const loanFormApiResponse: ApiFormConfig = {
  id: "loan-application",
  i18n: {
    namespace: "loan",
  },
  sections: [
    {
      id: "personal-info",
      title: "Personal Information",
      description: "Tell us about yourself",
      layout: "grid",
      columns: 2,
      fields: [
        {
          id: "first_name",
          name: "firstName",
          type: "text",
          label: "First Name",
          validation: [{ type: "required" }],
        },
        {
          id: "last_name",
          name: "lastName",
          type: "text",
          label: "Last Name",
          validation: [{ type: "required" }],
        },
        {
          id: "email",
          name: "email",
          type: "email",
          label: "Email",
          validation: [{ type: "required" }, { type: "email" }],
        },
        {
          id: "phone",
          name: "phone",
          type: "tel",
          label: "Phone Number",
          validation: [{ type: "required" }, { type: "phone" }],
        },
      ],
    },
    {
      id: "loan-details",
      title: "Loan Details",
      layout: "grid",
      columns: 2,
      fields: [
        {
          id: "loan_amount",
          name: "loanAmount",
          type: "currency",
          label: "Loan Amount",
          options: {
            currency: "VND",
            showSymbol: true,
          },
          validation: [
            { type: "required" },
            { type: "min", value: 10000000, message: "Minimum 10,000,000 VND" },
            {
              type: "max",
              value: 500000000,
              message: "Maximum 500,000,000 VND",
            },
          ],
        },
        {
          id: "loan_term",
          name: "loanTerm",
          type: "select",
          label: "Loan Term",
          options: {
            choices: [
              { label: "6 months", value: 6 },
              { label: "12 months", value: 12 },
              { label: "24 months", value: 24 },
              { label: "36 months", value: 36 },
            ],
          },
          validation: [{ type: "required" }],
        },
        {
          id: "loan_purpose",
          name: "loanPurpose",
          type: "textarea",
          label: "Purpose",
          placeholder: "Why do you need this loan?",
          options: {
            rows: 3,
          },
          layout: {
            colSpan: 2, // Spans full width
          },
        },
      ],
    },
  ],
};

// ============================================================================
// Example 3: Form with Conditional Fields
// ============================================================================

export const surveyFormApiResponse: ApiFormConfig = {
  id: "survey-form",
  fields: [
    {
      id: "has_job",
      name: "hasJob",
      type: "radio",
      label: "Are you currently employed?",
      options: {
        choices: [
          { label: "Yes", value: "yes" },
          { label: "No", value: "no" },
        ],
        layout: "horizontal",
      },
      validation: [{ type: "required" }],
    },
    {
      id: "company",
      name: "company",
      type: "text",
      label: "Company Name",
      dependencies: [
        {
          conditions: [
            {
              fieldId: "hasJob",
              operator: "equals",
              value: "yes",
            },
          ],
          action: "show",
          logic: "and",
        },
      ],
      validation: [{ type: "required" }],
    },
    {
      id: "monthly_income",
      name: "monthlyIncome",
      type: "currency",
      label: "Monthly Income",
      options: {
        currency: "VND",
        showSymbol: true,
      },
      dependencies: [
        {
          conditions: [
            {
              fieldId: "hasJob",
              operator: "equals",
              value: "yes",
            },
          ],
          action: "show",
        },
      ],
      validation: [{ type: "required" }],
    },
  ],
};

// ============================================================================
// Example 4: Multi-step Form (using sections)
// ============================================================================

export const registrationFormApiResponse: ApiFormConfig = {
  id: "registration",
  sections: [
    {
      id: "step-1",
      title: "Step 1: Account Information",
      collapsible: true,
      fields: [
        {
          id: "username",
          name: "username",
          type: "text",
          label: "Username",
          validation: [{ type: "required" }, { type: "minLength", value: 3 }],
        },
        {
          id: "email",
          name: "email",
          type: "email",
          label: "Email",
          validation: [{ type: "required" }, { type: "email" }],
        },
        {
          id: "password",
          name: "password",
          type: "password",
          label: "Password",
          validation: [{ type: "required" }, { type: "minLength", value: 8 }],
        },
      ],
    },
    {
      id: "step-2",
      title: "Step 2: Personal Details",
      collapsible: true,
      defaultCollapsed: true,
      fields: [
        {
          id: "full_name",
          name: "fullName",
          type: "text",
          label: "Full Name",
          validation: [{ type: "required" }],
        },
        {
          id: "date_of_birth",
          name: "dateOfBirth",
          type: "date",
          label: "Date of Birth",
          options: {
            maxDate: new Date().toISOString(),
          },
        },
      ],
    },
  ],
};

// ============================================================================
// Usage in React Component
// ============================================================================

/**
 * Example React Component
 */
export function ContactFormExample() {
  const config = FormConfigMapper.mapApiToFormConfig(contactFormApiResponse);

  const handleSubmit = async (data: Record<string, any>) => {
    console.log("Form submitted:", data);

    // Send to API
    const response = await fetch("/api/contact", {
      method: "POST",
      body: JSON.stringify(data),
    });

    if (response.ok) {
      alert("Thank you for contacting us!");
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Contact Us</h1>
      <DynamicForm config={config} onSubmit={handleSubmit} />
    </div>
  );
}

/**
 * Example with custom field component
 */
export function LoanFormExample() {
  // Register custom currency component if not already registered
  // registerComponent('currency-input', MyCurrencyComponent);

  const config = FormConfigMapper.mapApiToFormConfig(loanFormApiResponse);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Loan Application</h1>
      <DynamicForm
        config={config}
        onSubmit={async (data) => {
          console.log("Loan application:", data);
        }}
        onChange={(fieldName, value, _formData) => {
          console.log(`Field ${fieldName} changed:`, value);
        }}
      />
    </div>
  );
}
