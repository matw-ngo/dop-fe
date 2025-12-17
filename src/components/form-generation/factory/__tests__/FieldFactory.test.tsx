import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { FieldType, type FormField } from "../../types";
import { FieldFactory } from "../FieldFactory";

// Mock dependent components and hooks
vi.mock("../../fields/TextField", () => ({
  TextField: () => <div data-testid="mock-text-field">TextField Component</div>,
}));

vi.mock("../../components/FieldWrapper", () => ({
  FieldWrapper: ({ children, label }: any) => (
    <div data-testid="field-wrapper">
      <label>{label}</label>
      {children}
    </div>
  ),
}));

vi.mock("../../components/FieldErrorBoundary", () => ({
  FieldErrorBoundary: ({ children }: any) => (
    <div data-testid="error-boundary">{children}</div>
  ),
}));

vi.mock("../../i18n/useFormTranslations", () => ({
  useFormTranslations: () => ({
    getLabel: (_: string, defaultLabel: string) => defaultLabel,
    getPlaceholder: (_: string, defaultPlaceholder: string) =>
      defaultPlaceholder,
    getHelp: (_: string, defaultHelp: string) => defaultHelp,
  }),
}));

describe("FieldFactory", () => {
  const baseField: FormField = {
    id: "test-field",
    name: "testField",
    type: FieldType.TEXT,
    label: "Test Label",
  };

  it("renders the correct component based on field type", () => {
    render(<FieldFactory field={baseField} value="" onChange={() => {}} />);

    expect(screen.getByTestId("mock-text-field")).toBeInTheDocument();
  });

  it("renders field wrapper and label correctly", () => {
    render(<FieldFactory field={baseField} value="" onChange={() => {}} />);

    expect(screen.getByTestId("field-wrapper")).toBeInTheDocument();
    expect(screen.getByText("Test Label")).toBeInTheDocument();
  });

  it("renders error message for unsupported field types", () => {
    const unsupportedField: FormField = {
      ...baseField,
      type: "unsupported-type" as any,
    };

    render(
      <FieldFactory field={unsupportedField} value="" onChange={() => {}} />,
    );

    expect(
      screen.getByText(/Field type "unsupported-type" not supported/i),
    ).toBeInTheDocument();
  });

  it("renders without wrapper when showWrapper is false", () => {
    render(
      <FieldFactory
        field={baseField}
        value=""
        onChange={() => {}}
        showWrapper={false}
      />,
    );

    expect(screen.queryByTestId("field-wrapper")).not.toBeInTheDocument();
    expect(screen.getByTestId("mock-text-field")).toBeInTheDocument();
  });
});
