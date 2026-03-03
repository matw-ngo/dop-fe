import { type UseQueryResult, useQuery } from "@tanstack/react-query";
import { consentClient } from "@/lib/api/services";

interface UseTermsContentParams {
  consentPurposeId?: string;
  enabled?: boolean;
}

interface TermsContentData {
  version?: string | number | null;
  content?: string | null;
}

/**
 * Hook to fetch terms/privacy content from consent API
 * Can be used for Terms of Service, Privacy Policy, etc.
 */
export function useTermsContent({
  consentPurposeId,
  enabled = true,
}: UseTermsContentParams): UseQueryResult<TermsContentData, Error> {
  return useQuery({
    queryKey: ["terms-content", consentPurposeId],
    queryFn: async (): Promise<TermsContentData> => {
      if (!consentPurposeId) {
        throw new Error("Consent purpose ID is required");
      }

      const response = await consentClient.GET("/consent-purpose/{id}", {
        params: {
          path: { id: consentPurposeId },
        },
      });

      if (!response.data) {
        throw new Error("Failed to fetch terms content");
      }

      return {
        version: response.data.latest_version,
        content: response.data.latest_content,
      };
    },
    enabled: enabled && !!consentPurposeId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
