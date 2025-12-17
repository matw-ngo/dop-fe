import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { FormRenderer } from "./FormRenderer";
import type { RawFieldConfig } from "./types/data-driven-ui";

// This test file uses actual implementations for more realistic integration testing
// Only external dependencies are mocked

// Mock external dependencies
vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

vi.mock("@tanstack/react-query", () => ({
  useQueries: vi.fn(),
}));

describe("FormRenderer Integration Tests", () => {
  const mockFields: RawFieldConfig[] = [
    {
      fieldName: "fullName",
      component: "Input",
      props: {
        label: "Full Name",
        type: "text",
        validations: [{ type: "required" }],
      },
    },
    {
      fieldName: "userType",
      component: "Select",
      props: {
        label: "User Type",
        options: [
          { value: "individual", label: "Individual" },
          { value: "business", label: "Business" },
        ],
      },
    },
    {
      fieldName: "companyName",
      component: "Input",
      props: {
        label: "Company Name",
        type: "text",
      },
      condition: {
        field: "userType",
        operator: "equals",
        value: "business",
      },
    },
    {
      fieldName: "agreeToTerms",
      component: "Checkbox",
      props: {
        label: "I agree to the terms and conditions",
      },
    },
  ];

  it("should handle conditional field visibility", async () => {
    // This test would need actual component implementations
    // For now, we'll test the integration concept with mocked components

    const { result } = render(
      <FormRenderer fields={mockFields} onSubmit={vi.fn()} />,
    );

    // Initially, company name should not be visible
    expect(screen.queryByLabelText(/Company Name/)).not.toBeInTheDocument();

    // Select 'business' as user type
    const userTypeSelect = screen.getByLabelText(/User Type/);
    await userEvent.selectOptions(userTypeSelect, "business");

    // Company name should now be visible
    await waitFor(() => {
      expect(screen.getByLabelText(/Company Name/)).toBeInTheDocument();
    });

    // Select 'individual' as user type
    await userEvent.selectOptions(userTypeSelect, "individual");

    // Company name should be hidden again
    await waitFor(() => {
      expect(screen.queryByLabelText(/Company Name/)).not.toBeInTheDocument();
    });
  });

  it("should validate required fields", async () => {
    const onSubmit = vi.fn();

    render(<FormRenderer fields={mockFields} onSubmit={onSubmit} />);

    // Try to submit without required fields
    const submitButton = screen.getByRole("button", { name: /submit/i });
    await userEvent.click(submitButton);

    // Should show validation errors
    await waitFor(() => {
      expect(screen.getByText(/Full Name is required/)).toBeInTheDocument();
    });

    // Form should not have been submitted
    expect(onSubmit).not.toHaveBeenCalled();

    // Fill in required fields
    await userEvent.type(screen.getByLabelText(/Full Name/), "John Doe");
    await userEvent.click(screen.getByLabelText(/I agree to the terms/));

    // Submit again
    await userEvent.click(submitButton);

    // Form should now be submitted
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          fullName: "John Doe",
          agreeToTerms: true,
        }),
      );
    });
  });

  it("should handle async options loading", async () => {
    const fieldsWithAsyncOptions: RawFieldConfig[] = [
      {
        fieldName: "country",
        component: "Select",
        props: {
          label: "Country",
          optionsFetcher: {
            fetcher: async () => [
              { value: "us", label: "United States" },
              { value: "ca", label: "Canada" },
            ],
            cacheKey: "countries",
            cacheDuration: 300000,
          },
        },
      },
      {
        fieldName: "state",
        component: "Select",
        props: {
          label: "State",
          optionsFetcher: {
            fetcher: async (values: any) => {
              if (!values.country) return [];
              if (values.country === "us") {
                return [
                  { value: "ca", label: "California" },
                  { value: "ny", label: "New York" },
                ];
              }
              return [];
            },
            dependsOn: ["country"],
          },
        },
      },
    ];

    render(<FormRenderer fields={fieldsWithAsyncOptions} onSubmit={vi.fn()} />);

    // Should show loading state initially
    expect(screen.getByText(/Loading.../)).toBeInTheDocument();

    // Wait for countries to load
    await waitFor(() => {
      expect(screen.getByText(/United States/)).toBeInTheDocument();
    });

    // Select a country
    await userEvent.selectOptions(screen.getByLabelText(/Country/), "us");

    // States should load based on selected country
    await waitFor(() => {
      expect(screen.getByText(/California/)).toBeInTheDocument();
    });
  });

  it("should handle complex form submission with all data types", async () => {
    const complexFields: RawFieldConfig[] = [
      {
        fieldName: "name",
        component: "Input",
        props: {
          label: "Name",
          type: "text",
          validations: [{ type: "required" }],
        },
      },
      {
        fieldName: "age",
        component: "Input",
        props: {
          label: "Age",
          type: "number",
          validations: [{ type: "min", value: 18 }],
        },
      },
      {
        fieldName: "interests",
        component: "Checkbox",
        props: {
          label: "Sports",
        },
      },
      {
        fieldName: "newsletter",
        component: "Switch",
        props: {
          label: "Subscribe to newsletter",
        },
      },
    ];

    const onSubmit = vi.fn();

    render(<FormRenderer fields={complexFields} onSubmit={onSubmit} />);

    // Fill form with different data types
    await userEvent.type(screen.getByLabelText(/Name/), "Jane Smith");
    await userEvent.type(screen.getByLabelText(/Age/), "25");
    await userEvent.click(screen.getByLabelText(/Sports/));
    await userEvent.click(screen.getByLabelText(/Subscribe to newsletter/));

    // Submit form
    const submitButton = screen.getByRole("button", { name: /submit/i });
    await userEvent.click(submitButton);

    // Verify all data types are correctly captured
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        name: "Jane Smith",
        age: 25,
        interests: true,
        newsletter: true,
      });
    });
  });

  it("should handle form reset", async () => {
    const resetFields: RawFieldConfig[] = [
      {
        fieldName: "title",
        component: "Input",
        props: {
          label: "Title",
          type: "text",
        },
      },
      {
        fieldName: "description",
        component: "Textarea",
        props: {
          label: "Description",
        },
      },
    ];

    render(
      <FormRenderer
        fields={resetFields}
        onSubmit={vi.fn()}
        formActions={<button type="button">Reset</button>}
      />,
    );

    // Fill form
    await userEvent.type(screen.getByLabelText(/Title/), "Test Title");
    await userEvent.type(
      screen.getByLabelText(/Description/),
      "Test Description",
    );

    // Reset form
    await userEvent.click(screen.getByText("Reset"));

    // Fields should be empty
    await waitFor(() => {
      expect(screen.getByLabelText(/Title/)).toHaveValue("");
      expect(screen.getByLabelText(/Description/)).toHaveValue("");
    });
  });

  it("should handle dynamic field addition/removal", async () => {
    // This test demonstrates how the renderer handles dynamic forms
    const dynamicFields: RawFieldConfig[] = [
      {
        fieldName: "hasChildren",
        component: "Checkbox",
        props: {
          label: "Do you have children?",
        },
      },
      {
        fieldName: "numberOfChildren",
        component: "Input",
        props: {
          label: "Number of children",
          type: "number",
        },
        condition: {
          field: "hasChildren",
          operator: "equals",
          value: true,
        },
      },
    ];

    render(<FormRenderer fields={dynamicFields} onSubmit={vi.fn()} />);

    // Initially, number of children should not be visible
    expect(
      screen.queryByLabelText(/Number of children/),
    ).not.toBeInTheDocument();

    // Check the hasChildren checkbox
    await userEvent.click(screen.getByLabelText(/Do you have children\?/));

    // Number of children should now be visible
    await waitFor(() => {
      expect(screen.getByLabelText(/Number of children/)).toBeInTheDocument();
    });

    // Uncheck the hasChildren checkbox
    await userEvent.click(screen.getByLabelText(/Do you have children\?/));

    // Number of children should be hidden again
    await waitFor(() => {
      expect(
        screen.queryByLabelText(/Number of children/),
      ).not.toBeInTheDocument();
    });
  });
});
