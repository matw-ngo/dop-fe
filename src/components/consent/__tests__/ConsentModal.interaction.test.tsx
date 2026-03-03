/// <reference types="@testing-library/jest-dom" />
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { ConsentModal } from "../ConsentModal";

// Mock dependencies
vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
      "form.title": "Cookie Consent",
      "form.description": "We use cookies",
      "form.agreement": "By continuing, you agree to our {link}",
      "form.continueButton": "Continue",
      "form.loading": "Loading...",
      "form.termsModal.title": "Terms and Conditions",
      "form.termsModal.description": "Please read our terms",
      "common.loading": "Loading...",
    };
    return translations[key] || key;
  },
}));

vi.mock("@/components/form-generation/themes", () => ({
  useFormTheme: () => ({
    theme: {
      colors: {
        primary: "#000",
        background: "#fff",
        border: "#ccc",
        textPrimary: "#000",
        textSecondary: "#666",
        error: "#f00",
        readOnly: "#f5f5f5",
      },
    },
  }),
}));

vi.mock("@/hooks/consent/use-consent-purpose", () => ({
  useConsentPurpose: () => ({
    data: {
      latest_version_id: "version-123",
      latest_version: "1.0",
      latest_content: "Terms content here",
    },
    isLoading: false,
  }),
}));

vi.mock("@/hooks/consent/use-consent-session", () => ({
  useConsentSession: () => "test-session-id",
}));

vi.mock("@/hooks/consent/use-user-consent", () => ({
  useUserConsent: () => ({
    data: null,
    isLoading: false,
  }),
}));

vi.mock("@/hooks/consent/use-consent-grant", () => ({
  useConsentGrant: () => ({
    grantConsent: vi.fn().mockResolvedValue({ consentId: "consent-123" }),
    isSubmitting: false,
    error: null,
  }),
}));

vi.mock("@/store/use-auth-store", () => ({
  useAuthStore: () => ({
    user: { id: "user-123" },
  }),
}));

vi.mock("@/store/use-consent-store", () => ({
  useConsentStore: () => ({
    setConsentData: vi.fn(),
    setError: vi.fn(),
  }),
}));

describe("ConsentModal - User Interaction Flow", () => {
  const mockSetOpen = vi.fn();
  const mockOnSuccess = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Modal Closing Restrictions", () => {
    it("should NOT close main modal when clicking outside", async () => {
      const user = userEvent.setup();

      render(
        <ConsentModal
          open={true}
          setOpen={mockSetOpen}
          onSuccess={mockOnSuccess}
          stepData={{ consent_purpose_id: "purpose-123" }}
        />,
      );

      // Try to click outside (on overlay)
      const overlay = document.querySelector('[data-radix-dialog-overlay]');
      if (overlay) {
        await user.click(overlay);
      }

      // Modal should still be open (setOpen not called with false)
      expect(mockSetOpen).not.toHaveBeenCalledWith(false);
    });

    it("should NOT close main modal when pressing Escape", async () => {
      const user = userEvent.setup();

      render(
        <ConsentModal
          open={true}
          setOpen={mockSetOpen}
          onSuccess={mockOnSuccess}
          stepData={{ consent_purpose_id: "purpose-123" }}
        />,
      );

      // Try to press Escape
      await user.keyboard("{Escape}");

      // Modal should still be open
      expect(mockSetOpen).not.toHaveBeenCalledWith(false);
    });

    it("should close main modal ONLY when user clicks Continue button", async () => {
      const user = userEvent.setup();

      render(
        <ConsentModal
          open={true}
          setOpen={mockSetOpen}
          onSuccess={mockOnSuccess}
          stepData={{ consent_purpose_id: "purpose-123" }}
        />,
      );

      await waitFor(() => {
        expect(screen.getByText("Continue")).toBeInTheDocument();
      });

      // Click Continue button
      const continueButton = screen.getByText("Continue");
      await user.click(continueButton);

      // Modal should close after successful consent
      await waitFor(() => {
        expect(mockSetOpen).toHaveBeenCalledWith(false);
        expect(mockOnSuccess).toHaveBeenCalledWith("consent-123");
      });
    });
  });

  describe("Terms Modal Flow", () => {
    it("should open Terms modal when user clicks terms link", async () => {
      const user = userEvent.setup();

      render(
        <ConsentModal
          open={true}
          setOpen={mockSetOpen}
          onSuccess={mockOnSuccess}
          stepData={{ consent_purpose_id: "purpose-123" }}
        />,
      );

      await waitFor(() => {
        expect(screen.getByText("Continue")).toBeInTheDocument();
      });

      // Find and click terms link (button with underline)
      const termsLink = screen.getByRole("button", { name: /link/i });
      await user.click(termsLink);

      // Terms modal should open
      await waitFor(() => {
        expect(screen.getByText("Terms and Conditions")).toBeInTheDocument();
      });
    });

    it("should NOT show close button (X) in Terms modal", async () => {
      const user = userEvent.setup();

      render(
        <ConsentModal
          open={true}
          setOpen={mockSetOpen}
          onSuccess={mockOnSuccess}
          stepData={{ consent_purpose_id: "purpose-123" }}
        />,
      );

      await waitFor(() => {
        expect(screen.getByText("Continue")).toBeInTheDocument();
      });

      // Open terms modal
      const termsLink = screen.getByRole("button", { name: /link/i });
      await user.click(termsLink);

      await waitFor(() => {
        expect(screen.getByText("Terms and Conditions")).toBeInTheDocument();
      });

      // Close button should NOT exist
      const closeButton = screen.queryByRole("button", { name: /close/i });
      expect(closeButton).not.toBeInTheDocument();
    });

    it("should NOT close Terms modal when clicking outside", async () => {
      const user = userEvent.setup();

      render(
        <ConsentModal
          open={true}
          setOpen={mockSetOpen}
          onSuccess={mockOnSuccess}
          stepData={{ consent_purpose_id: "purpose-123" }}
        />,
      );

      await waitFor(() => {
        expect(screen.getByText("Continue")).toBeInTheDocument();
      });

      // Open terms modal
      const termsLink = screen.getByRole("button", { name: /link/i });
      await user.click(termsLink);

      await waitFor(() => {
        expect(screen.getByText("Terms and Conditions")).toBeInTheDocument();
      });

      // Try to click outside
      const overlay = document.querySelector('[data-radix-dialog-overlay]');
      if (overlay) {
        await user.click(overlay);
      }

      // Terms modal should still be visible
      expect(screen.getByText("Terms and Conditions")).toBeInTheDocument();
    });

    it("should close both modals when user clicks Continue in Terms modal", async () => {
      const user = userEvent.setup();

      render(
        <ConsentModal
          open={true}
          setOpen={mockSetOpen}
          onSuccess={mockOnSuccess}
          stepData={{ consent_purpose_id: "purpose-123" }}
        />,
      );

      await waitFor(() => {
        expect(screen.getByText("Continue")).toBeInTheDocument();
      });

      // Open terms modal
      const termsLink = screen.getByRole("button", { name: /link/i });
      await user.click(termsLink);

      await waitFor(() => {
        expect(screen.getByText("Terms and Conditions")).toBeInTheDocument();
      });

      // Click Continue in terms modal
      const continueButtons = screen.getAllByText("Continue");
      const termsModalContinue = continueButtons[continueButtons.length - 1];
      await user.click(termsModalContinue);

      // Both modals should close
      await waitFor(() => {
        expect(mockSetOpen).toHaveBeenCalledWith(false);
        expect(mockOnSuccess).toHaveBeenCalledWith("consent-123");
      });
    });
  });
});
