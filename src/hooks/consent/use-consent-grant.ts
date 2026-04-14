import { useState } from "react";
import { consentClient } from "@/lib/api/services";
import { useConsentStore } from "@/store/use-consent-store";

interface GrantConsentParams {
  userId?: string;
  consentVersionId: string;
  sessionId?: string | null;
  tenantId?: string;
}

interface GrantConsentResult {
  consentId: string;
}

interface UseConsentGrantReturn {
  grantConsent: (
    params: GrantConsentParams,
  ) => Promise<GrantConsentResult | null>;
  isSubmitting: boolean;
  error: string | null;
}

/**
 * Hook for granting consent - encapsulates business logic
 */
export function useConsentGrant(): UseConsentGrantReturn {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    setConsentId,
    setConsentStatus,
    setConsentData,
    setError: setStoreError,
  } = useConsentStore();

  const grantConsent = async ({
    userId,
    consentVersionId,
    sessionId,
    tenantId = "00000000-0000-0000-0000-000000000000",
  }: GrantConsentParams): Promise<GrantConsentResult | null> => {
    setIsSubmitting(true);
    setError(null);

    try {
      const result = await consentClient.POST("/consent", {
        body: {
          tenant_id: tenantId,
          lead_id: userId,
          consent_version_id: consentVersionId,
          session_id: sessionId,
          source: "web",
        },
      });

      if (!result.data?.id) {
        throw new Error("No consent ID returned");
      }

      const newConsentId = result.data.id;

      // Log the GRANT action
      await consentClient.POST("/consent-log", {
        body: {
          tenant_id: tenantId,
          consent_id: newConsentId,
          action: "grant",
          action_by: "user",
          source: "web",
        },
      });

      // Update store
      setConsentId(newConsentId);
      setConsentStatus("agreed");
      setConsentData({
        id: newConsentId,
        lead_id: userId || "",
        consent_version_id: consentVersionId,
        source: "web",
        action: "grant",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      return { consentId: newConsentId };
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to grant consent";
      setError(errorMessage);
      setStoreError(errorMessage);
      return null;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    grantConsent,
    isSubmitting,
    error,
  };
}
