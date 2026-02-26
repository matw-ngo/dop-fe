/**
 * Consent Flow Test Suite
 *
 * Unit tests for consent modal interactions
 * Run with: pnpm test
 */

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ConsentModal } from "./ConsentModal";

const { mockPost, mockPatch } = vi.hoisted(() => ({
  mockPost: vi.fn(),
  mockPatch: vi.fn(),
}));

vi.mock("@/lib/api/services", () => ({
  consentClient: {
    POST: mockPost,
    PATCH: mockPatch,
    GET: vi.fn(),
  },
}));

vi.mock("@/hooks/consent/use-consent-purpose", () => ({
  useConsentPurpose: () => ({
    data: {
      id: "660e8400-e29b-41d4-a716-446655440006",
      latest_version_id: "version-1",
      latest_version: 1,
      latest_content: "Mock consent content",
    },
    isLoading: false,
  }),
}));

vi.mock("@/hooks/consent/use-user-consent", () => ({
  useUserConsent: () => ({
    data: null,
    isLoading: false,
  }),
}));

vi.mock("@/hooks/consent/use-data-categories", () => ({
  useDataCategories: () => ({
    data: [],
    isLoading: false,
  }),
}));

vi.mock("@/hooks/consent/use-consent-logs", () => ({
  useConsentLogs: () => ({
    data: { consent_logs: [] },
    isLoading: false,
  }),
}));

vi.mock("@/hooks/consent/use-consent-session", () => ({
  useConsentSession: () => "session-test-123",
}));

vi.mock("@/store/use-auth-store", () => ({
  useAuthStore: () => ({
    user: { id: "lead-1" },
  }),
}));

describe("Consent Flow", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockPost.mockImplementation((path: string) => {
      if (path === "/consent") {
        return Promise.resolve({ data: { id: "consent-1" } });
      }

      return Promise.resolve({ data: { id: "log-1" } });
    });

    mockPatch.mockResolvedValue({ data: {} });
  });

  const renderWithProviders = (component: React.ReactElement) => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    return render(
      <QueryClientProvider client={queryClient}>
        {component}
      </QueryClientProvider>
    );
  };

  it("shows consent modal when no consent exists", async () => {
    renderWithProviders(
      <ConsentModal
        open={true}
        setOpen={() => {}}
        onSuccess={() => {}}
        stepData={{
          consent_purpose_id: "660e8400-e29b-41d4-a716-446655440006",
          page: "/index",
        }}
      />
    );

    await waitFor(() => {
      expect(screen.getByText("modal.title")).toBeInTheDocument();
      expect(screen.getByText("form.title")).toBeInTheDocument();
    });
  });

  it("handles consent grant successfully", async () => {
    const onSuccess = vi.fn();

    renderWithProviders(
      <ConsentModal
        open={true}
        setOpen={() => {}}
        onSuccess={onSuccess}
        stepData={{
          consent_purpose_id: "660e8400-e29b-41d4-a716-446655440006",
          page: "/index",
        }}
      />
    );

    const agreeButton = await screen.findByRole("button", {
      name: "form.grant.button",
    });
    fireEvent.click(agreeButton);

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalledWith("consent-1");
    });
  });

  it("handles consent rejection", async () => {
    const setOpen = vi.fn();

    renderWithProviders(
      <ConsentModal
        open={true}
        setOpen={setOpen}
        onSuccess={() => {}}
        stepData={{
          consent_purpose_id: "660e8400-e29b-41d4-a716-446655440006",
          page: "/index",
        }}
      />
    );

    const rejectButton = await screen.findByRole("button", {
      name: "form.reject.button",
    });
    fireEvent.click(rejectButton);

    expect(setOpen).toHaveBeenCalledWith(false);
  });
});
