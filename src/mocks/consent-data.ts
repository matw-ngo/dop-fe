/**
 * Consent Flow Mock Data
 *
 * Mock data for testing consent flow without MSW Service Worker
 * Use this in development when MSW is disabled
 */

export const mockConsentData = {
  // Mock tenant flow with consent purpose
  tenantFlow: {
    id: "110e8400-e29b-41d4-a716-446655440001",
    steps: [
      {
        page: "/index",
        consent_purpose_id: "660e8400-e29b-41d4-a716-446655440006",
        have_purpose: true,
        required_purpose: true,
      },
    ],
  },

  // Mock consent version
  consentVersion: {
    consent_versions: [
      {
        id: "110e8400-e29b-41d4-a716-446655440001",
        consent_purpose_id: "660e8400-e29b-41d4-a716-446655440006",
        version: 1,
        content:
          "By using this website, you consent to our terms and conditions for data processing.",
        document_url: "https://example.com/consent/v1.pdf",
        effective_date: "2024-01-01T00:00:00Z",
      },
    ],
  },

  // Mock user consent (initially null for testing modal)
  userConsent: null, // Set to consent object when user agrees

  // Mock session ID
  sessionId: "session-test-123",
};

// Helper functions for testing different scenarios
export const createMockConsentRecord = (
  action: "grant" | "revoke" = "grant",
) => ({
  id: "consent-test-123",
  session_id: mockConsentData.sessionId,
  consent_version_id: mockConsentData.consentVersion.consent_versions[0].id,
  action,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
});
