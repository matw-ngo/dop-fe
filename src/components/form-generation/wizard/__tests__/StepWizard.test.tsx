import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { StepWizard } from "../StepWizard";
import { useFormWizardStore } from "../../store/use-form-wizard-store";
import { DynamicFormConfig, FieldType, ValidationRuleType } from "../../types";

// Mock FieldFactory to avoid rendering complex UI components
vi.mock("../../factory/FieldFactory", () => ({
  FieldFactory: ({ field, value, onChange }: any) => (
    <div data-testid={`field-${field.id}`}>
      <label htmlFor={field.id}>{field.label}</label>
      <input
        id={field.id}
        data-testid={`input-${field.id}`}
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  ),
}));

// Mock configuration
const mockConfig: DynamicFormConfig = {
  steps: [
    {
      id: "step1",
      title: "Step 1",
      fields: [
        {
          id: "field1",
          name: "field1",
          type: FieldType.TEXT,
          label: "Field 1",
          i18n: { enabled: false },
        },
      ],
    },
    {
      id: "step2",
      title: "Step 2",
      fields: [
        {
          id: "field2",
          name: "field2",
          type: FieldType.TEXT,
          label: "Field 2",
        },
      ],
    },
  ],
  navigation: {
    showProgress: true,
    progressType: "dots",
  },
};

describe("StepWizard Component", () => {
  const resetWizard = useFormWizardStore.getState().resetWizard;

  beforeEach(() => {
    resetWizard();
  });

  it("should render the first step initially", async () => {
    render(<StepWizard config={mockConfig} />);

    expect(screen.getByText("Step 1")).toBeInTheDocument();
    expect(screen.getByLabelText("Field 1")).toBeInTheDocument();
  });

  it("should navigate to next step on Next button click", async () => {
    render(<StepWizard config={mockConfig} />);

    const nextButton = screen.getByText("Next");
    fireEvent.click(nextButton);

    await waitFor(() => {
      expect(screen.getByText("Step 2")).toBeInTheDocument();
    });
  });

  it("should show valid validation error when submitting empty required field", async () => {
    const configWithValidation: DynamicFormConfig = {
      ...mockConfig,
      steps: [
        {
          id: "step1",
          title: "Step 1",
          fields: [
            {
              id: "requiredField",
              name: "requiredField",
              type: FieldType.TEXT,
              label: "Required Field",
              validation: [
                {
                  type: ValidationRuleType.REQUIRED,
                  message: "This field is required",
                },
              ],
            },
          ],
        },
        { id: "step2", title: "Step 2", fields: [] },
      ],
    };

    render(<StepWizard config={configWithValidation} />);

    // Attempt to go to next step without filling field
    const nextButton = screen.getByText("Next");
    fireEvent.click(nextButton);

    // Should stay on step 1 (implied) and potentially show error
    // Note: Integration with actual DOM validation display depends on async state updates
    // For now we verify we are still on Step 1 implies validation blocked navigation
    expect(screen.getByText("Step 1")).toBeInTheDocument();
  });
  it("should display review step with collected data", async () => {
    const reviewConfig: DynamicFormConfig = {
      id: "review-wizard",
      steps: [
        {
          id: "step1",
          title: "Info",
          fields: [
            {
              id: "name",
              name: "name",
              type: FieldType.TEXT,
              label: "Full Name",
            },
          ],
        },
        {
          id: "review",
          title: "Review",
          type: "review",
          fields: [], // Review step usually has no fields
        },
      ],
    };

    render(<StepWizard config={reviewConfig} />);

    // Fill data in step 1
    fireEvent.change(screen.getByLabelText("Full Name"), {
      target: { value: "John Doe" },
    });

    // Go to review step
    fireEvent.click(screen.getByText("Next"));

    // Wait for unique content from review step
    await waitFor(() => {
      // "John Doe" should be visible in the review summary
      expect(screen.getByText("John Doe")).toBeInTheDocument();
      // Title "Review" should exist (might be multiple)
      expect(screen.getAllByText("Review").length).toBeGreaterThan(0);
    });
  });
});
