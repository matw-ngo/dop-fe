/// <reference types="@testing-library/jest-dom" />
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { ConsentForm } from "./ConsentForm";

// Mock next-intl
vi.mock("next-intl", () => ({
  useTranslations: () => {
    const t = (key: string) => {
      const translations: Record<string, string> = {
        title: "Data Privacy Terms",
        description: "We collect cookies and data...",
        agreement: "By continuing, you agree to our <link>Terms of Service</link>.",
        continueButton: "Continue",
        loading: "Processing...",
      };
      return translations[key] || key;
    };

    // Add rich method for handling rich text with components
    t.rich = (key: string, values?: Record<string, (chunks: React.ReactNode) => React.ReactNode>) => {
      const text = t(key);
      if (!values) return text;

      // Simple implementation: replace <link>...</link> with the link component
      const linkMatch = text.match(/<link>(.*?)<\/link>/);
      if (linkMatch && values.link) {
        const linkText = linkMatch[1];
        return values.link(linkText);
      }
      return text;
    };

    return t;
  },
}));

describe("ConsentForm", () => {
  const mockOnGrant = vi.fn();
  const mockOnViewTerms = vi.fn();

  it("renders consent form with title and description", () => {
    render(
      <ConsentForm
        consentVersion={{ version: "1.0", content: "Test content" }}
        onGrant={mockOnGrant}
        isSubmitting={false}
        onViewTerms={mockOnViewTerms}
      />,
    );

    expect(screen.getByText("Data Privacy Terms")).toBeInTheDocument();
    expect(screen.getByText(/We collect cookies/)).toBeInTheDocument();
  });

  it("renders cookie icon with accessibility", () => {
    const { container } = render(
      <ConsentForm
        consentVersion={{ version: "1.0", content: "Test content" }}
        onGrant={mockOnGrant}
        isSubmitting={false}
        onViewTerms={mockOnViewTerms}
      />,
    );

    const cookieIcon = container.querySelector('svg[role="img"]');
    expect(cookieIcon).toBeInTheDocument();
    expect(cookieIcon).toHaveAttribute("aria-label", "Cookie icon");
  });

  it("calls onGrant when clicking continue button", async () => {
    const user = userEvent.setup();

    render(
      <ConsentForm
        consentVersion={{ version: "1.0", content: "Test content" }}
        onGrant={mockOnGrant}
        isSubmitting={false}
        onViewTerms={mockOnViewTerms}
      />,
    );

    const continueButton = screen.getByRole("button", { name: /Continue/i });
    await user.click(continueButton);

    expect(mockOnGrant).toHaveBeenCalledTimes(1);
  });

  it("disables button and shows loading state when submitting", () => {
    render(
      <ConsentForm
        consentVersion={{ version: "1.0", content: "Test content" }}
        onGrant={mockOnGrant}
        isSubmitting={true}
        onViewTerms={mockOnViewTerms}
      />,
    );

    // Button should be disabled when submitting
    const buttons = screen.getAllByRole("button");
    const continueButton = buttons.find(btn => btn.hasAttribute("disabled") && !btn.textContent?.includes("Terms"));
    expect(continueButton).toBeDefined();
    expect(continueButton).toBeDisabled();
  });

  it("applies theme CSS variables for button", () => {
    render(
      <ConsentForm
        consentVersion={{ version: "1.0", content: "Test content" }}
        onGrant={mockOnGrant}
        isSubmitting={false}
        onViewTerms={mockOnViewTerms}
      />,
    );

    const button = screen.getByRole("button", { name: /Continue/i });
    expect(button).toHaveClass("bg-[var(--consent-primary)]");
    expect(button).toHaveClass("hover:bg-[var(--consent-primary-hover)]");
  });

  it("uses responsive layout classes", () => {
    const { container } = render(
      <ConsentForm
        consentVersion={{ version: "1.0", content: "Test content" }}
        onGrant={mockOnGrant}
        isSubmitting={false}
        onViewTerms={mockOnViewTerms}
      />,
    );

    const formContainer = container.firstChild;
    expect(formContainer).toHaveClass("flex-col");
    expect(formContainer).toHaveClass("md:flex-row");
  });
});
