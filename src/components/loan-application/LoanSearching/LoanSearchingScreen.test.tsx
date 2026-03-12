import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { LoanSearchingScreen } from "./LoanSearchingScreen";
import { FormThemeProvider } from "@/components/form-generation/themes/ThemeProvider";
import { defaultTheme } from "@/components/form-generation/themes/default";

// Mock next-intl
vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
      message:
        "Vui lòng đợi trong giây lát, chúng tôi đang tìm kiếm các khoản vay phù hợp với bạn",
    };
    return translations[key] || key;
  },
}));

const renderWithTheme = (ui: React.ReactElement) => {
  return render(
    <FormThemeProvider theme={defaultTheme}>{ui}</FormThemeProvider>
  );
};

describe("LoanSearchingScreen", () => {
  it("renders without crashing", () => {
    renderWithTheme(<LoanSearchingScreen />);
    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("displays default message from translations", () => {
    renderWithTheme(<LoanSearchingScreen />);
    expect(
      screen.getByText(/Vui lòng đợi trong giây lát/i)
    ).toBeInTheDocument();
  });

  it("displays custom message when provided", () => {
    const customMessage = "Custom loading message";
    renderWithTheme(<LoanSearchingScreen message={customMessage} />);
    expect(screen.getByText(customMessage)).toBeInTheDocument();
  });

  it("applies custom className", () => {
    const { container } = renderWithTheme(
      <LoanSearchingScreen className="custom-class" />
    );
    expect(container.firstChild).toHaveClass("custom-class");
  });

  it("renders spinner with correct accessibility attributes", () => {
    renderWithTheme(<LoanSearchingScreen />);
    const spinner = screen.getByRole("status");
    expect(spinner).toHaveAttribute("aria-label", "Loading");
  });

  it("applies theme colors to spinner", () => {
    renderWithTheme(<LoanSearchingScreen />);
    const spinner = screen.getByRole("status");
    expect(spinner).toHaveStyle({ color: defaultTheme.colors.primary });
  });

  it("has proper responsive layout classes", () => {
    const { container } = renderWithTheme(<LoanSearchingScreen />);
    const mainDiv = container.firstChild as HTMLElement;
    expect(mainDiv).toHaveClass("flex", "min-h-screen", "items-center");
  });

  it("centers content properly", () => {
    const { container } = renderWithTheme(<LoanSearchingScreen />);
    const mainDiv = container.firstChild as HTMLElement;
    expect(mainDiv).toHaveClass("justify-center");
  });

  it("has max-width constraint for content", () => {
    renderWithTheme(<LoanSearchingScreen />);
    const contentDiv = screen
      .getByRole("status")
      .closest(".max-w-md") as HTMLElement;
    expect(contentDiv).toBeInTheDocument();
  });
});
