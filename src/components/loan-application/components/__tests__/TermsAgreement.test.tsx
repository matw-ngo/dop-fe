import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TermsAgreement } from "../TermsAgreement";

// Mock next-intl for components that use it
vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
      "terms.text": "Bằng việc nhấn Gửi, bạn đồng ý với",
      "terms.link": "Điều khoản dịch vụ",
      "terms.agree": "Tôi đồng ý và muốn sử dụng dịch vụ.",
      "terms.disagree":
        "Tôi không đồng ý với toàn bộ hoặc một phần trong Điều khoản dịch vụ.",
    };
    return translations[key] || key;
  },
}));

describe("TermsAgreement", () => {
  const defaultProps = {
    value: "",
    onChange: vi.fn(),
  };

  it("renders terms text and radio buttons", () => {
    render(<TermsAgreement {...defaultProps} />);

    expect(
      screen.getByText(/Bằng việc nhấn Gửi, bạn đồng ý với/),
    ).toBeInTheDocument();
    expect(screen.getByText("Điều khoản dịch vụ")).toBeInTheDocument();
    expect(
      screen.getByRole("radio", {
        name: "Tôi đồng ý và muốn sử dụng dịch vụ.",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("radio", {
        name: "Tôi không đồng ý với toàn bộ hoặc một phần trong Điều khoản dịch vụ.",
      }),
    ).toBeInTheDocument();
  });

  it("calls onChange when agree radio is selected", () => {
    render(<TermsAgreement {...defaultProps} />);

    const agreeRadio = screen.getByRole("radio", {
      name: "Tôi đồng ý và muốn sử dụng dịch vụ.",
    });
    fireEvent.click(agreeRadio);

    expect(defaultProps.onChange).toHaveBeenCalledWith("1");
  });

  it("calls onChange when disagree radio is selected", () => {
    render(<TermsAgreement {...defaultProps} />);

    const disagreeRadio = screen.getByRole("radio", {
      name: "Tôi không đồng ý với toàn bộ hoặc một phần trong Điều khoản dịch vụ.",
    });
    fireEvent.click(disagreeRadio);

    expect(defaultProps.onChange).toHaveBeenCalledWith("0");
  });

  it("shows agree radio as selected when value is '1'", () => {
    render(<TermsAgreement {...defaultProps} value="1" />);

    const agreeRadio = screen.getByRole("radio", {
      name: "Tôi đồng ý và muốn sử dụng dịch vụ.",
    });
    const disagreeRadio = screen.getByRole("radio", {
      name: "Tôi không đồng ý với toàn bộ hoặc một phần trong Điều khoản dịch vụ.",
    });

    expect(agreeRadio).toBeChecked();
    expect(disagreeRadio).not.toBeChecked();
  });

  it("shows disagree radio as selected when value is '0'", () => {
    render(<TermsAgreement {...defaultProps} value="0" />);

    const agreeRadio = screen.getByRole("radio", {
      name: "Tôi đồng ý và muốn sử dụng dịch vụ.",
    });
    const disagreeRadio = screen.getByRole("radio", {
      name: "Tôi không đồng ý với toàn bộ hoặc một phần trong Điều khoản dịch vụ.",
    });

    expect(agreeRadio).not.toBeChecked();
    expect(disagreeRadio).toBeChecked();
  });

  it("displays error message when provided", () => {
    render(
      <TermsAgreement {...defaultProps} error="You must agree to terms" />,
    );

    expect(screen.getByText("You must agree to terms")).toBeInTheDocument();
    expect(screen.getByText("You must agree to terms")).toHaveClass(
      "text-red-500",
    );
  });

  it("uses custom terms text and link", () => {
    render(
      <TermsAgreement
        {...defaultProps}
        termsText="Custom terms text"
        termsLink="/custom-terms"
      />,
    );

    expect(screen.getByText(/Custom terms text/i)).toBeInTheDocument();
    expect(screen.getByRole("link")).toHaveAttribute("href", "/custom-terms");
  });
});
