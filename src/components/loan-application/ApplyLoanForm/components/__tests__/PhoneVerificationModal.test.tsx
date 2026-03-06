/**
 * PhoneVerificationModal Tests
 *
 * Tests for phone number validation in the verification modal
 */

import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { PhoneVerificationModal } from "../PhoneVerificationModal";
import { FormThemeProvider } from "@/components/form-generation/themes";
import { defaultTheme } from "@/components/form-generation/themes/default";

// Mock next-intl with translations
vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
      "otp.title": "Phone Verification",
      "otp.description": "Please enter your phone number",
      "otp.placeholder": "Phone number",
      "otp.continue": "Continue",
      "errors.phoneRequired": "Phone number is required",
      "errors.phoneInvalid": "Invalid phone number",
    };
    return translations[key] || key;
  },
}));

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <FormThemeProvider theme={defaultTheme}>
    {children}
  </FormThemeProvider>
);

describe("PhoneVerificationModal", () => {
  const mockOnClose = vi.fn();
  const mockOnVerify = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Rendering", () => {
    it("should render when open", () => {
      render(
        <TestWrapper>
          <PhoneVerificationModal
            open={true}
            onClose={mockOnClose}
            onVerify={mockOnVerify}
          />
        </TestWrapper>
      );

      expect(screen.getByText("Phone Verification")).toBeInTheDocument();
      expect(screen.getByPlaceholderText("Phone number")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /continue/i })).toBeInTheDocument();
    });

    it("should not render when closed", () => {
      render(
        <TestWrapper>
          <PhoneVerificationModal
            open={false}
            onClose={mockOnClose}
            onVerify={mockOnVerify}
          />
        </TestWrapper>
      );

      expect(screen.queryByText("Phone Verification")).not.toBeInTheDocument();
    });

    it("should render custom title and description", () => {
      render(
        <TestWrapper>
          <PhoneVerificationModal
            open={true}
            onClose={mockOnClose}
            onVerify={mockOnVerify}
            title="Custom Title"
            description="Custom Description"
          />
        </TestWrapper>
      );

      expect(screen.getByText("Custom Title")).toBeInTheDocument();
      expect(screen.getByText("Custom Description")).toBeInTheDocument();
    });
  });

  describe("Validation", () => {
    it("should show error when submitting empty phone", async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <PhoneVerificationModal
            open={true}
            onClose={mockOnClose}
            onVerify={mockOnVerify}
          />
        </TestWrapper>
      );

      // Button should be disabled when phone is empty
      const submitButton = screen.getByText("Continue");
      expect(submitButton).toBeDisabled();
      
      // Verify onVerify is not called
      expect(mockOnVerify).not.toHaveBeenCalled();
    });

    it("should show error when submitting whitespace only", async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <PhoneVerificationModal
            open={true}
            onClose={mockOnClose}
            onVerify={mockOnVerify}
          />
        </TestWrapper>
      );

      const input = screen.getByPlaceholderText("Phone number");
      await user.type(input, "   ");

      // Button should still be disabled for whitespace-only input
      const submitButton = screen.getByText("Continue");
      expect(submitButton).toBeDisabled();
      
      // Verify onVerify is not called
      expect(mockOnVerify).not.toHaveBeenCalled();
    });

    it("should show error for invalid phone format (too short)", async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <PhoneVerificationModal
            open={true}
            onClose={mockOnClose}
            onVerify={mockOnVerify}
          />
        </TestWrapper>
      );

      const input = screen.getByPlaceholderText("Phone number");
      await user.type(input, "12345");

      const submitButton = screen.getByRole("button", { name: /continue/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText("Invalid phone number")).toBeInTheDocument();
      });

      expect(mockOnVerify).not.toHaveBeenCalled();
    });

    it("should show error for invalid phone format (too long)", async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <PhoneVerificationModal
            open={true}
            onClose={mockOnClose}
            onVerify={mockOnVerify}
          />
        </TestWrapper>
      );

      const input = screen.getByPlaceholderText("Phone number");
      await user.type(input, "123456789012");

      const submitButton = screen.getByRole("button", { name: /continue/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText("Invalid phone number")).toBeInTheDocument();
      });

      expect(mockOnVerify).not.toHaveBeenCalled();
    });

    it("should show error for non-numeric phone", async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <PhoneVerificationModal
            open={true}
            onClose={mockOnClose}
            onVerify={mockOnVerify}
          />
        </TestWrapper>
      );

      const input = screen.getByPlaceholderText("Phone number");
      await user.type(input, "abc123def");

      const submitButton = screen.getByRole("button", { name: /continue/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText("Invalid phone number")).toBeInTheDocument();
      });

      expect(mockOnVerify).not.toHaveBeenCalled();
    });

    it("should accept valid 10-digit phone", async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <PhoneVerificationModal
            open={true}
            onClose={mockOnClose}
            onVerify={mockOnVerify}
          />
        </TestWrapper>
      );

      const input = screen.getByPlaceholderText("Phone number");
      await user.type(input, "0901234567");

      const submitButton = screen.getByRole("button", { name: /continue/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockOnVerify).toHaveBeenCalledWith("0901234567");
      });
    });

    it("should accept valid 11-digit phone", async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <PhoneVerificationModal
            open={true}
            onClose={mockOnClose}
            onVerify={mockOnVerify}
          />
        </TestWrapper>
      );

      const input = screen.getByPlaceholderText("Phone number");
      await user.type(input, "09012345678");

      const submitButton = screen.getByRole("button", { name: /continue/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockOnVerify).toHaveBeenCalledWith("09012345678");
      });
    });

    it("should trim whitespace before validation", async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <PhoneVerificationModal
            open={true}
            onClose={mockOnClose}
            onVerify={mockOnVerify}
          />
        </TestWrapper>
      );

      const input = screen.getByPlaceholderText("Phone number");
      await user.type(input, "  0901234567  ");

      const submitButton = screen.getByRole("button", { name: /continue/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockOnVerify).toHaveBeenCalledWith("0901234567");
      });
    });
  });

  describe("Error Handling", () => {
    it("should clear error when user starts typing", async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <PhoneVerificationModal
            open={true}
            onClose={mockOnClose}
            onVerify={mockOnVerify}
          />
        </TestWrapper>
      );

      // Type invalid phone to trigger error
      const input = screen.getByPlaceholderText("Phone number");
      await user.type(input, "123"); // Too short

      const submitButton = screen.getByText("Continue");
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText("Invalid phone number")).toBeInTheDocument();
      });

      // Start typing - error should be cleared
      await user.type(input, "4");

      await waitFor(() => {
        expect(screen.queryByText("Invalid phone number")).not.toBeInTheDocument();
      });
    });

    it("should clear error and input when modal reopens", async () => {
      const { rerender } = render(
        <TestWrapper>
          <PhoneVerificationModal
            open={true}
            onClose={mockOnClose}
            onVerify={mockOnVerify}
          />
        </TestWrapper>
      );

      const user = userEvent.setup();
      const input = screen.getByPlaceholderText("Phone number");
      await user.type(input, "invalid");

      const submitButton = screen.getByRole("button", { name: /continue/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText("Invalid phone number")).toBeInTheDocument();
      });

      // Close modal
      rerender(
        <TestWrapper>
          <PhoneVerificationModal
            open={false}
            onClose={mockOnClose}
            onVerify={mockOnVerify}
          />
        </TestWrapper>
      );

      // Reopen modal
      rerender(
        <TestWrapper>
          <PhoneVerificationModal
            open={true}
            onClose={mockOnClose}
            onVerify={mockOnVerify}
          />
        </TestWrapper>
      );

      // Input and error should be cleared
      const newInput = screen.getByPlaceholderText("Phone number");
      expect(newInput).toHaveValue("");
      expect(screen.queryByText("Invalid phone number")).not.toBeInTheDocument();
    });
  });

  describe("Button State", () => {
    it("should disable button when phone is empty", () => {
      render(
        <TestWrapper>
          <PhoneVerificationModal
            open={true}
            onClose={mockOnClose}
            onVerify={mockOnVerify}
          />
        </TestWrapper>
      );

      const submitButton = screen.getByText("Continue");
      expect(submitButton).toBeDisabled();
    });

    it("should enable button when phone has value", async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <PhoneVerificationModal
            open={true}
            onClose={mockOnClose}
            onVerify={mockOnVerify}
          />
        </TestWrapper>
      );

      const input = screen.getByPlaceholderText("Phone number");
      await user.type(input, "0901234567");

      const submitButton = screen.getByText("Continue");
      expect(submitButton).not.toBeDisabled();
    });

    it("should disable button when isSubmitting is true", () => {
      render(
        <TestWrapper>
          <PhoneVerificationModal
            open={true}
            onClose={mockOnClose}
            onVerify={mockOnVerify}
            isSubmitting={true}
          />
        </TestWrapper>
      );

      // When submitting, button shows spinner instead of text
      const buttons = screen.getAllByRole("button");
      const submitButton = buttons.find(btn => btn.getAttribute("data-slot") === "button");
      expect(submitButton).toBeDisabled();
    });

    it("should disable input when isSubmitting is true", () => {
      render(
        <TestWrapper>
          <PhoneVerificationModal
            open={true}
            onClose={mockOnClose}
            onVerify={mockOnVerify}
            isSubmitting={true}
          />
        </TestWrapper>
      );

      const input = screen.getByPlaceholderText("Phone number");
      expect(input).toBeDisabled();
    });
  });

  describe("Accessibility", () => {
    it("should have proper ARIA attributes for error", async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <PhoneVerificationModal
            open={true}
            onClose={mockOnClose}
            onVerify={mockOnVerify}
          />
        </TestWrapper>
      );

      // Type invalid phone to trigger error
      const input = screen.getByPlaceholderText("Phone number");
      await user.type(input, "123"); // Too short

      const submitButton = screen.getByText("Continue");
      await user.click(submitButton);

      await waitFor(() => {
        const errorMessage = screen.getByRole("alert");
        expect(errorMessage).toBeInTheDocument();
        expect(errorMessage).toHaveTextContent("Invalid phone number");
      });
    });
  });
});
