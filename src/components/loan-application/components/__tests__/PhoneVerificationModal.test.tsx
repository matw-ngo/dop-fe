import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { PhoneVerificationModal } from "../PhoneVerificationModal";

// Mock next-intl
vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
      "otp.title": "Xác thực số điện thoại",
      "otp.description": "Vui lòng nhập số điện thoại để tiếp tục",
      "otp.placeholder": "Số điện thoại",
      "otp.continue": "Tiếp tục",
      "errors.phoneRequired": "Số điện thoại không được để trống",
      "errors.phoneInvalid": "Số điện thoại không hợp lệ",
    };

    return translations[key] || key;
  },
}));

describe("PhoneVerificationModal", () => {
  const createDefaultProps = () => ({
    open: true,
    onClose: vi.fn(),
    onVerify: vi.fn(),
  });

  it("renders modal with default title and description", () => {
    const defaultProps = createDefaultProps();
    render(<PhoneVerificationModal {...defaultProps} />);

    expect(screen.getByText("Xác thực số điện thoại")).toBeInTheDocument();
    expect(
      screen.getByText("Vui lòng nhập số điện thoại để tiếp tục"),
    ).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Số điện thoại")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Tiếp tục" }),
    ).toBeInTheDocument();
  });

  it("renders with custom title and description", () => {
    const defaultProps = createDefaultProps();
    render(
      <PhoneVerificationModal
        {...defaultProps}
        title="Custom Title"
        description="Custom description"
      />,
    );

    expect(screen.getByText("Custom Title")).toBeInTheDocument();
    expect(screen.getByText("Custom description")).toBeInTheDocument();
  });

  it("calls onVerify with phone number when Continue is clicked", () => {
    const defaultProps = createDefaultProps();
    render(<PhoneVerificationModal {...defaultProps} />);

    const phoneInput = screen.getByPlaceholderText("Số điện thoại");
    fireEvent.change(phoneInput, { target: { value: "0912345678" } });

    const continueButton = screen.getByRole("button", { name: "Tiếp tục" });
    fireEvent.click(continueButton);

    expect(defaultProps.onVerify).toHaveBeenCalledWith("0912345678");
  });

  it("shows error for empty phone number", () => {
    const defaultProps = createDefaultProps();
    render(<PhoneVerificationModal {...defaultProps} />);

    const continueButton = screen.getByRole("button", { name: "Tiếp tục" });
    fireEvent.click(continueButton);

    expect(
      screen.getByText("Số điện thoại không được để trống"),
    ).toBeInTheDocument();
    expect(defaultProps.onVerify).not.toHaveBeenCalled();
  });

  it("shows error for invalid phone number", () => {
    const defaultProps = createDefaultProps();
    render(<PhoneVerificationModal {...defaultProps} />);

    const phoneInput = screen.getByPlaceholderText("Số điện thoại");
    fireEvent.change(phoneInput, { target: { value: "123" } });

    const continueButton = screen.getByRole("button", { name: "Tiếp tục" });
    fireEvent.click(continueButton);

    expect(screen.getByText("Số điện thoại không hợp lệ")).toBeInTheDocument();
    expect(defaultProps.onVerify).not.toHaveBeenCalled();
  });

  it("clears error when user starts typing", () => {
    const defaultProps = createDefaultProps();
    render(<PhoneVerificationModal {...defaultProps} />);

    // First, trigger error
    const continueButton = screen.getByRole("button", { name: "Tiếp tục" });
    fireEvent.click(continueButton);

    expect(
      screen.getByText("Số điện thoại không được để trống"),
    ).toBeInTheDocument();

    // Then start typing
    const phoneInput = screen.getByPlaceholderText("Số điện thoại");
    fireEvent.change(phoneInput, { target: { value: "09" } });

    expect(
      screen.queryByText("Số điện thoại không được để trống"),
    ).not.toBeInTheDocument();
  });

  it("enables continue button when phone number is empty", () => {
    const defaultProps = createDefaultProps();
    render(<PhoneVerificationModal {...defaultProps} />);

    const continueButton = screen.getByRole("button", { name: "Tiếp tục" });
    expect(continueButton).not.toBeDisabled();
  });

  it("disables continue button when there is a validation error", () => {
    const defaultProps = createDefaultProps();
    render(<PhoneVerificationModal {...defaultProps} />);

    const phoneInput = screen.getByPlaceholderText("Số điện thoại");
    fireEvent.change(phoneInput, { target: { value: "123" } });

    const continueButton = screen.getByRole("button", { name: "Tiếp tục" });
    expect(continueButton).toBeDisabled();
  });

  it("calls onClose when modal is closed", () => {
    const defaultProps = createDefaultProps();
    render(<PhoneVerificationModal {...defaultProps} />);

    // Test the close button functionality
    const closeButton = screen.getByRole("button", { name: "Close" });
    fireEvent.click(closeButton);
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it("resets state when modal closes", () => {
    const defaultProps = createDefaultProps();
    const { rerender } = render(<PhoneVerificationModal {...defaultProps} />);

    // Enter a phone number
    const phoneInput = screen.getByPlaceholderText("Số điện thoại");
    fireEvent.change(phoneInput, { target: { value: "0912345678" } });

    // Close modal
    rerender(<PhoneVerificationModal {...defaultProps} open={false} />);

    // Reopen modal
    rerender(<PhoneVerificationModal {...defaultProps} open={true} />);

    // Check that input is empty
    expect(screen.getByPlaceholderText("Số điện thoại")).toHaveValue("");
  });
});
