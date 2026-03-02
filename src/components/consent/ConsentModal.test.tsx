/// <reference types="@testing-library/jest-dom" />
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { ConsentModal } from "./ConsentModal";

// Mock next-intl
vi.mock("next-intl", () => ({
  useTranslations: () => {
    const t = (key: string) => {
      const translations: Record<string, string> = {
        "common.loading": "Loading...",
        "form.title": "Data Privacy Terms",
        "form.description": "We collect cookies and data...",
        "form.agreement": "By continuing, you agree to our <link>Terms of Service</link>.",
        "form.continueButton": "Continue",
        "form.loading": "Processing...",
        "form.termsModal.title": "Data Privacy Terms",
        "form.termsModal.description": "Please review our terms carefully.",
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

// Mock hooks
vi.mock("@/hooks/consent/use-consent-purpose", () => ({
  useConsentPurpose: vi.fn(() => ({
    data: {
      id: "test-purpose-id",
      latest_version: "1.0",
      latest_version_id: "version-id-123",
      latest_content: "This is a mock consent version content.",
    },
    isLoading: false,
  })),
}));

vi.mock("@/hooks/consent/use-consent-session", () => ({
  useConsentSession: vi.fn(() => "test-session-id"),
}));

vi.mock("@/hooks/consent/use-user-consent", () => ({
  useUserConsent: vi.fn(() => ({
    data: null,
    isLoading: false,
  })),
}));

vi.mock("@/store/use-auth-store", () => ({
  useAuthStore: vi.fn(() => ({
    user: { id: "test-user-id" },
  })),
}));

vi.mock("@/store/use-consent-store", () => ({
  useConsentStore: vi.fn(() => ({
    setConsentId: vi.fn(),
    setConsentStatus: vi.fn(),
    setConsentData: vi.fn(),
    setError: vi.fn(),
    clearError: vi.fn(),
  })),
}));

vi.mock("@/lib/api/services", () => ({
  consentClient: {
    POST: vi.fn(() =>
      Promise.resolve({
        data: { id: "new-consent-id" },
      }),
    ),
  },
}));

describe("ConsentModal", () => {
  const mockSetOpen = vi.fn();
  const mockOnSuccess = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders main consent form when open", () => {
    render(
      <ConsentModal
        open={true}
        setOpen={mockSetOpen}
        onSuccess={mockOnSuccess}
        stepData={{ consent_purpose_id: "test-purpose" }}
      />,
    );

    expect(screen.getByRole("button", { name: /Continue/i })).toBeInTheDocument();
  });

  it("does not render when closed", () => {
    render(
      <ConsentModal
        open={false}
        setOpen={mockSetOpen}
        onSuccess={mockOnSuccess}
        stepData={{ consent_purpose_id: "test-purpose" }}
      />,
    );

    expect(screen.queryByText("DATA PRIVACY TERMS")).not.toBeInTheDocument();
  });

  it("grants consent when clicking continue button", async () => {
    const user = userEvent.setup();
    // Get the mocked module - no need for dynamic import since it's mocked at the top
    const { consentClient } = require("@/lib/api/services");

    render(
      <ConsentModal
        open={true}
        setOpen={mockSetOpen}
        onSuccess={mockOnSuccess}
        stepData={{ consent_purpose_id: "test-purpose" }}
      />,
    );

    const continueButton = screen.getByRole("button", { name: /Continue/i });
    await user.click(continueButton);

    await waitFor(() => {
      expect(consentClient.POST).toHaveBeenCalledWith("/consent", {
        body: expect.objectContaining({
          consent_version_id: "version-id-123",
          session_id: "test-session-id",
          source: "web",
        }),
      });
    });

    expect(mockOnSuccess).toHaveBeenCalledWith("new-consent-id");
    expect(mockSetOpen).toHaveBeenCalledWith(false);
  });

  it("shows loading state while submitting", async () => {
    const user = userEvent.setup();
    // Get the mocked module - no need for dynamic import since it's mocked at the top
    const { consentClient } = require("@/lib/api/services");

    vi.mocked(consentClient.POST).mockImplementation(
      () =>
        new Promise((resolve) =>
          setTimeout(() => resolve({ data: { id: "new-id" } }), 100),
        ),
    );

    render(
      <ConsentModal
        open={true}
        setOpen={mockSetOpen}
        onSuccess={mockOnSuccess}
        stepData={{ consent_purpose_id: "test-purpose" }}
      />,
    );

    const continueButton = screen.getByRole("button", { name: /Continue/i });
    await user.click(continueButton);

    // Button should be disabled while submitting
    await waitFor(() => {
      const buttons = screen.getAllByRole("button");
      const submitButton = buttons.find(btn => btn.hasAttribute("disabled"));
      expect(submitButton).toBeDefined();
    });

    await waitFor(() => {
      expect(mockSetOpen).toHaveBeenCalledWith(false);
    });
  });

  it("closes modal when pressing ESC", async () => {
    const user = userEvent.setup();

    render(
      <ConsentModal
        open={true}
        setOpen={mockSetOpen}
        onSuccess={mockOnSuccess}
        stepData={{ consent_purpose_id: "test-purpose" }}
      />,
    );

    await user.keyboard("{Escape}");

    await waitFor(() => {
      expect(mockSetOpen).toHaveBeenCalledWith(false);
    });
  });
});
