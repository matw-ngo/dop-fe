import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AmountField } from "../AmountField";

// Mock next-intl for components that use it
vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
      "expectedAmount.currency": "đồng",
      "expectedAmount.placeholder": "Nhập số tiền",
    };
    return translations[key] || key;
  },
}));

// Mock Slider component
vi.mock("@/components/ui", () => ({
  Slider: ({
    value,
    onChange,
    onValueChange,
    min,
    max,
    step,
    disabled = false,
    ...props
  }: any) => (
    <input
      type="range"
      value={value}
      min={min}
      max={max}
      step={step}
      disabled={disabled}
      onChange={(e) => {
        const newValue = parseInt(e.target.value, 10);
        onChange?.(newValue);
        onValueChange?.([newValue]);
      }}
      {...props}
    />
  ),
}));

describe("AmountField", () => {
  const defaultProps = {
    value: 10,
    onChange: vi.fn(),
    label: "Loan Amount",
  };

  it("renders correctly with default props", () => {
    render(<AmountField {...defaultProps} />);

    expect(screen.getByText("Loan Amount:")).toBeInTheDocument();
    expect(screen.getByText("10.000.000")).toBeInTheDocument();
    expect(screen.getByText("đồng")).toBeInTheDocument();
  });

  it("renders placeholder when value is 0", () => {
    render(<AmountField {...defaultProps} value={0} />);

    expect(screen.getByText("Nhập số tiền")).toBeInTheDocument();
  });

  it("calls onChange when slider value changes", () => {
    render(<AmountField {...defaultProps} />);

    const slider = screen.getByRole("slider");
    fireEvent.change(slider, { target: { value: "20" } });

    expect(defaultProps.onChange).toHaveBeenCalledWith(20);
  });

  it("displays error message when provided", () => {
    render(<AmountField {...defaultProps} error="Amount is required" />);

    expect(screen.getByText("(Amount is required)")).toBeInTheDocument();
    expect(
      screen.getByText("Amount is required", { exact: false }),
    ).toHaveClass("text-red-500");
  });

  it("disables slider when disabled prop is true", () => {
    render(<AmountField {...defaultProps} disabled={true} />);

    const slider = screen.getByRole("slider");
    expect(slider).toBeDisabled();
  });

  it("uses custom min, max, and step values", () => {
    render(<AmountField {...defaultProps} min={1} max={100} step={10} />);

    const slider = screen.getByRole("slider") as HTMLInputElement;
    expect(slider).toHaveAttribute("min", "1");
    expect(slider).toHaveAttribute("max", "100");
    expect(slider).toHaveAttribute("step", "10");
  });
});
