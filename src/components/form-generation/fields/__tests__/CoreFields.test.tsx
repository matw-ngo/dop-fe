import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { CheckboxField } from "../../fields/CheckboxField";
import { SelectField } from "../../fields/SelectField";
import { TextField } from "../../fields/TextField";
import { FieldType, type FormField } from "../../types";

// Mock UI components to isolate field logic
vi.mock("@/components/ui/input", () => ({
  Input: (props: any) => <input data-testid="input" {...props} />,
}));

vi.mock("@/components/ui/select", () => ({
  Select: ({ onValueChange, children }: any) => (
    <div onClick={() => onValueChange("option1")}>{children}</div>
  ),
  SelectTrigger: ({ children }: any) => <button>{children}</button>,
  SelectValue: () => <span>Select Value</span>,
  SelectContent: ({ children }: any) => <div>{children}</div>,
  SelectItem: ({ value, children }: any) => (
    <div data-value={value}>{children}</div>
  ),
}));

vi.mock("@/components/ui/checkbox", () => ({
  Checkbox: ({ checked, onCheckedChange }: any) => (
    <input
      type="checkbox"
      checked={checked}
      onChange={(e) => onCheckedChange(e.target.checked)}
    />
  ),
}));

describe("Core Field Components", () => {
  const baseField: FormField = {
    id: "test-field",
    name: "testField",
    type: FieldType.TEXT,
    label: "Test Field",
  };

  describe("TextField", () => {
    it("renders correctly with value", () => {
      render(
        <TextField
          field={baseField}
          value="Initial Value"
          onChange={() => {}}
        />,
      );
      expect(screen.getByTestId("input")).toHaveValue("Initial Value");
    });

    it("calls onChange when typing", () => {
      const handleChange = vi.fn();
      render(<TextField field={baseField} value="" onChange={handleChange} />);

      fireEvent.change(screen.getByTestId("input"), {
        target: { value: "New Value" },
      });
      expect(handleChange).toHaveBeenCalledWith("New Value");
    });
  });

  describe("SelectField", () => {
    const selectField: FormField = {
      ...baseField,
      type: FieldType.SELECT,
      options: {
        items: [
          { label: "Option 1", value: "option1" },
          { label: "Option 2", value: "option2" },
        ],
      },
    };

    it("renders options correctly", () => {
      render(<SelectField field={selectField} value="" onChange={() => {}} />);
      expect(screen.getByText("Select Value")).toBeInTheDocument();
    });

    // Simple click test assuming mock behavior
    it("calls onChange when selection changes", () => {
      const handleChange = vi.fn();
      const { container } = render(
        <SelectField field={selectField} value="" onChange={handleChange} />,
      );

      // Trigger mock selection
      fireEvent.click(container.firstChild as Element);
      expect(handleChange).toHaveBeenCalledWith("option1");
    });
  });

  describe("CheckboxField", () => {
    const checkboxField: FormField = { ...baseField, type: FieldType.CHECKBOX };

    it("toggles value on click", () => {
      const handleChange = vi.fn();
      render(
        <CheckboxField
          field={checkboxField}
          value={false}
          onChange={handleChange}
        />,
      );

      const checkbox = screen.getByRole("checkbox");
      fireEvent.click(checkbox);
      expect(handleChange).toHaveBeenCalledWith(true);
    });
  });
});
