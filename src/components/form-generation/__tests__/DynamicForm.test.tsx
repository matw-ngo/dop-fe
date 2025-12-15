import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { DynamicForm } from "../DynamicForm";
import {
  DynamicFormConfig,
  FieldType,
  LayoutType,
  ValidationRuleType,
} from "../types";

// Mock child components to simplify integration test
vi.mock("../factory/FieldFactory", () => ({
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

describe("DynamicForm Integration", () => {
  const mockConfig: DynamicFormConfig = {
    id: "test-form",

    fields: [
      {
        id: "name",
        name: "name",
        type: FieldType.TEXT,
        label: "Full Name",
        validation: [
          { type: ValidationRuleType.REQUIRED, message: "Name is required" },
        ],
      },
      {
        id: "email",
        name: "email",
        type: FieldType.EMAIL,
        label: "Email Address",
      },
    ],
    layout: {
      type: LayoutType.STACK,
      gap: "md",
    },
  };

  it("renders fields from config", () => {
    render(<DynamicForm config={mockConfig} />);

    expect(screen.getByLabelText("Full Name")).toBeInTheDocument();
    expect(screen.getByLabelText("Email Address")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Submit" })).toBeInTheDocument();
  });

  it("manages form state updates correctly", async () => {
    const handleChange = vi.fn();
    render(<DynamicForm config={mockConfig} onChange={handleChange} />);

    const nameInput = screen.getByLabelText("Full Name");
    fireEvent.change(nameInput, { target: { value: "John Doe" } });

    expect(handleChange).toHaveBeenCalledWith(
      "name",
      "John Doe",
      expect.objectContaining({
        name: "John Doe",
      }),
    );
  });

  it("calls onSubmit with form data", async () => {
    const handleSubmit = vi.fn();
    render(<DynamicForm config={mockConfig} onSubmit={handleSubmit} />);

    // Fill data
    fireEvent.change(screen.getByLabelText("Full Name"), {
      target: { value: "Jane Doe" },
    });
    fireEvent.change(screen.getByLabelText("Email Address"), {
      target: { value: "jane@example.com" },
    });

    // Click submit
    const submitBtn = screen.getByRole("button", { name: "Submit" });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(handleSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          name: "Jane Doe",
          email: "jane@example.com",
        }),
      );
    });
  });
});
