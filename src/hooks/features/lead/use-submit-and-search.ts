import { useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { dopClient } from "@/lib/api/services/dop";
import type { components } from "@/lib/api/v1/dop";
import { useLoanSearchStore } from "@/store/use-loan-search-store";

type SubmitLeadInfoRequestBody =
  components["schemas"]["SubmitLeadInfoRequestBody"];
type SubmitLeadInfoResponseBody =
  components["schemas"]["SubmitLeadInfoResponseBody"];

interface UseSubmitAndSearchParams {
  leadId: string;
  flowId: string;
  stepId: string;
  formData: Record<string, unknown>;
  token?: string;
}

/**
 * Hook to submit lead info and track forwarding status
 *
 * This hook:
 * 1. Submits lead info to API
 * 2. Receives forward_result from response
 * 3. Updates loan search store with result
 * 4. Handles error states
 */
export function useSubmitAndSearch() {
  const loanSearchStore = useLoanSearchStore();

  const mutation = useMutation({
    mutationFn: async ({
      leadId,
      data,
    }: {
      leadId: string;
      data: SubmitLeadInfoRequestBody;
    }) => {
      const { data: responseData, error } = await dopClient.POST(
        "/leads/{id}/submit-info",
        {
          params: {
            path: { id: leadId },
          },
          body: data,
        },
      );

      if (error) {
        throw new Error((error as any).message || "Failed to submit lead info");
      }

      if (!responseData) {
        throw new Error("No data returned from submit lead info API");
      }

      return responseData as SubmitLeadInfoResponseBody;
    },
    onSuccess: (data) => {
      // Save result to store
      if (data.forward_result) {
        loanSearchStore.setResult(data.forward_result);
        loanSearchStore.setForwardStatus(data.forward_result.status);
      } else {
        // No forwarding configured or no result
        loanSearchStore.setForwardStatus("forwarded"); // Consider as success
      }
    },
    onError: (error) => {
      loanSearchStore.setError(error.message);
    },
  });

  const submitAndSearch = (params: UseSubmitAndSearchParams) => {
    const { leadId, flowId, stepId, formData, token } = params;

    const submitData: SubmitLeadInfoRequestBody = {
      flow_id: flowId,
      step_id: stepId,
      phone_number: formData.phone_number as string | undefined,
      // Add other form fields as needed
      ...(formData as Record<string, unknown>),
    };

    mutation.mutate({ leadId, data: submitData });
  };

  return {
    submitAndSearch,
    isPending: mutation.isPending,
    isSuccess: mutation.isSuccess,
    isError: mutation.isError,
    data: mutation.data,
    error: mutation.error,
  };
}
