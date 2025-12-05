import { render, screen } from "@testing-library/react";
import InsurancePageHero from "../InsurancePageHero";
import { ThemeProvider } from "@/lib/theme/context";
import { NextIntlClientProvider } from "next-intl";

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <ThemeProvider defaultUserGroup="healthcare">
      <NextIntlClientProvider locale="en" messages={{}}>
        {component}
      </NextIntlClientProvider>
    </ThemeProvider>,
  );
};

// Mock next-intl
jest.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
  NextIntlClientProvider: ({ children }: { children: React.ReactNode }) =>
    children,
}));

describe("InsurancePageHero", () => {
  it("should render with theme classes", () => {
    renderWithProviders(
      <InsurancePageHero
        titleKey="pageTitle"
        descriptionKey="pageDescription"
      />,
    );

    const heroSection = screen.getByRole("heading", { level: 1 }).parentElement
      ?.parentElement?.parentElement;
    expect(heroSection).toHaveClass("bg-muted");

    const title = screen.getByRole("heading", { level: 1 });
    expect(title).toHaveClass("text-foreground");

    const description = screen.getByText("pageDescription");
    expect(description).toHaveClass("text-muted-foreground");
  });

  it("should display shield icon with primary color", () => {
    renderWithProviders(
      <InsurancePageHero
        titleKey="pageTitle"
        descriptionKey="pageDescription"
      />,
    );

    const icon = document.querySelector(".lucide-shield");
    expect(icon?.parentElement).toHaveClass("text-primary");
  });

  it("should have responsive padding and text sizes", () => {
    renderWithProviders(
      <InsurancePageHero
        titleKey="pageTitle"
        descriptionKey="pageDescription"
      />,
    );

    const container = screen.getByRole("heading", { level: 1 }).parentElement
      ?.parentElement;
    expect(container).toHaveClass("py-12", "sm:py-16");

    const title = screen.getByRole("heading", { level: 1 });
    expect(title).toHaveClass("text-4xl", "sm:text-5xl");

    const description = screen.getByText("pageDescription");
    expect(description).toHaveClass("text-lg", "sm:text-xl");
  });
});
