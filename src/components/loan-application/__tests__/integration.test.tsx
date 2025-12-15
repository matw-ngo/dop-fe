import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { Form } from "@/components/ui";
import { AmountField } from "../components/AmountField";
import { OtpVerificationModal } from "../components/OtpVerificationModal";
import { PeriodField } from "../components/PeriodField";
import { PhoneVerificationModal } from "../components/PhoneVerificationModal";
import { PurposeField } from "../components/PurposeField";
import { SubmitButton } from "../components/SubmitButton";
import { TermsAgreement } from "../components/TermsAgreement";

// Mock next-intl for components that use it
vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
      // Phone verification
      "otp.title": "Xác thực số điện thoại",
      "otp.description": "Vui lòng nhập số điện thoại để tiếp tục",
      "otp.placeholder": "Số điện thoại",
      "otp.continue": "Tiếp tục",
      "errors.phoneRequired": "Số điện thoại không được để trống",
      "errors.phoneInvalid": "Số điện thoại không hợp lệ",

      // Loan form fields
      "expectedAmount.placeholder": "Nhập số tiền",
      "expectedAmount.currency": "đồng",
      "loanPeriod.placeholder": "Chọn thời gian vay",
      "loanPeriod.unit": "tháng",

      // Terms
      "terms.text": "Bằng việc nhấn Gửi, bạn đồng ý với",
      "terms.link": "Điều khoản dịch vụ",
      "terms.agree": "Tôi đồng ý và muốn sử dụng dịch vụ.",
      "terms.disagree":
        "Tôi không đồng ý với toàn bộ hoặc một phần trong Điều khoản dịch vụ.",

      // Submit button
      "submit.button": "Bắt đầu tìm kiếm khoản vay",
      "submit.processing": "Đang xử lý...",
    };
    return translations[key] || key;
  },
}));

// Mock Form component
vi.mock("@/components/ui", () => ({
  Form: ({ children }: { children: React.ReactNode }) => (
    <form>{children}</form>
  ),
  Slider: ({ value, onChange, ...props }: any) => (
    <input
      type="range"
      value={value}
      onChange={(e) => onChange?.([parseInt(e.target.value)])}
      {...props}
    />
  ),
  TextInput: ({ value, onChange, error, errorMessage, ...props }: any) => (
    <div>
      <input value={value || ""} onChange={onChange} {...props} />
      {error && errorMessage && (
        <span className="text-red-500">{errorMessage}</span>
      )}
    </div>
  ),
  Button: ({ children, ...props }: any) => (
    <button {...props}>{children}</button>
  ),
  Modal: ({ open, children }: any) =>
    open ? <div role="dialog">{children}</div> : null,
  OtpContainer: ({ phoneNumber }: any) => <div>OTP for {phoneNumber}</div>,
  SelectGroup: ({
    value,
    onChange,
    options,
    placeholder,
    label,
    ...props
  }: any) => (
    <div>
      {label && <label>{label}:</label>}
      <select
        value={value || ""}
        onChange={(e) => onChange?.(e.target.value)}
        {...props}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((option: any) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  ),
}));

describe("Loan Application Form Integration", () => {
  const mockLoanPurposes = [
    { value: "debt-consolidation", label: "Debt Consolidation" },
    { value: "home-improvement", label: "Home Improvement" },
    { value: "business", label: "Business" },
  ];

  const defaultProps = {
    amount: 20,
    period: 12,
    purpose: "debt-consolidation",
    agreeStatus: "1",
  };

  const renderForm = (props = {}) => {
    const allProps = { ...defaultProps, ...props };

    return render(
      <Form>
        <AmountField
          value={allProps.amount}
          onChange={vi.fn()}
          label="Expected Amount"
        />
        <PeriodField
          value={allProps.period}
          onChange={vi.fn()}
          label="Loan Period"
        />
        <PurposeField
          value={allProps.purpose}
          onChange={vi.fn()}
          options={mockLoanPurposes}
          label="Loan Purpose"
        />
        <TermsAgreement value={allProps.agreeStatus} onChange={vi.fn()} />
        <SubmitButton isSubmitting={false} />
        <PhoneVerificationModal
          open={false}
          onClose={vi.fn()}
          onVerify={vi.fn()}
        />
        <OtpVerificationModal
          open={false}
          onClose={vi.fn()}
          phoneNumber="0912345678"
          onSuccess={vi.fn()}
          onFailure={vi.fn()}
          onExpired={vi.fn()}
        />
      </Form>,
    );
  };

  it("renders all form fields correctly", () => {
    renderForm();

    expect(screen.getByText("Expected Amount:")).toBeInTheDocument();
    expect(screen.getByText("Loan Period:")).toBeInTheDocument();
    expect(screen.getByText("Loan Purpose:")).toBeInTheDocument();
    expect(
      screen.getByText((content, element) => {
        return content.includes("Bằng việc nhấn Gửi, bạn đồng ý với");
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Bắt đầu tìm kiếm khoản vay" }),
    ).toBeInTheDocument();
  });

  it("displays correct values for each field", () => {
    renderForm();

    // Check amount display
    expect(screen.getByText("20.000.000")).toBeInTheDocument();
    expect(screen.getByText("đồng")).toBeInTheDocument();

    // Check period display
    expect(screen.getByText("12")).toBeInTheDocument();
    expect(screen.getByText("tháng")).toBeInTheDocument();

    // Check purpose selection
    const purposeSelect = screen.getByDisplayValue("Debt Consolidation");
    expect(purposeSelect).toBeInTheDocument();
  });

  it("shows agree radio as selected when agreeStatus is '1'", () => {
    renderForm({ agreeStatus: "1" });

    const agreeRadio = screen.getByRole("radio", {
      name: "Tôi đồng ý và muốn sử dụng dịch vụ.",
    });
    const disagreeRadio = screen.getByRole("radio", {
      name: "Tôi không đồng ý với toàn bộ hoặc một phần trong Điều khoản dịch vụ.",
    });

    expect(agreeRadio).toBeChecked();
    expect(disagreeRadio).not.toBeChecked();
  });

  it("shows disagree radio as selected when agreeStatus is '0'", () => {
    renderForm({ agreeStatus: "0" });

    const agreeRadio = screen.getByRole("radio", {
      name: "Tôi đồng ý và muốn sử dụng dịch vụ.",
    });
    const disagreeRadio = screen.getByRole("radio", {
      name: "Tôi không đồng ý với toàn bộ hoặc một phần trong Điều khoản dịch vụ.",
    });

    expect(agreeRadio).not.toBeChecked();
    expect(disagreeRadio).toBeChecked();
  });

  it("displays placeholder when amount is 0", () => {
    renderForm({ amount: 0 });

    expect(screen.getByText("Nhập số tiền")).toBeInTheDocument();
  });

  it("displays placeholder when period is 0", () => {
    renderForm({ period: 0 });

    expect(screen.getByText("Chọn thời gian vay")).toBeInTheDocument();
  });

  it("shows phone verification modal when open", () => {
    render(
      <PhoneVerificationModal
        open={true}
        onClose={vi.fn()}
        onVerify={vi.fn()}
      />,
    );

    expect(screen.getByText("Xác thực số điện thoại")).toBeInTheDocument();
    expect(
      screen.getByText("Vui lòng nhập số điện thoại để tiếp tục"),
    ).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Số điện thoại")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Tiếp tục" }),
    ).toBeInTheDocument();
  });

  it("shows OTP verification modal when open", () => {
    render(
      <OtpVerificationModal
        open={true}
        onClose={vi.fn()}
        phoneNumber="0912345678"
        onSuccess={vi.fn()}
        onFailure={vi.fn()}
        onExpired={vi.fn()}
      />,
    );

    // OtpContainer should render - we can't see inside it but it should be there
    const modal = screen.getByRole("dialog");
    expect(modal).toBeInTheDocument();
  });

  it("disables submit button when submitting", () => {
    renderForm();

    // Rerender with isSubmitting true
    render(
      <Form>
        <SubmitButton isSubmitting={true} />
      </Form>,
    );

    const submitButton = screen.getByRole("button", { name: "Đang xử lý..." });
    expect(submitButton).toBeDisabled();
  });

  it("validates required fields are displayed", () => {
    renderForm();

    // All fields should be present
    expect(screen.getByText("Expected Amount:")).toBeInTheDocument();
    expect(screen.getByText("Loan Period:")).toBeInTheDocument();
    expect(screen.getByText("Loan Purpose:")).toBeInTheDocument();
    expect(
      screen.getByRole("radio", {
        name: "Tôi đồng ý và muốn sử dụng dịch vụ.",
      }),
    ).toBeInTheDocument();
  });

  it("terms link has correct attributes", () => {
    renderForm();

    const termsLink = screen.getByRole("link", {
      name: "Điều khoản dịch vụ",
    });
    expect(termsLink).toHaveAttribute("href", "/dieu-khoan-su-dung");
    expect(termsLink).toHaveAttribute("target", "_blank");
    expect(termsLink).toHaveAttribute("rel", "noopener noreferrer");
  });
});
