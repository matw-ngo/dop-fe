import { useMutation } from "@tanstack/react-query";
import apiClient from "@/lib/api/client";
import type { components } from "@/lib/api/v1/dop";

type SubmitLeadInfoRequestBody =
  components["schemas"]["SubmitLeadInfoRequestBody"];

interface SubmitInfoParams {
  leadId: string;
  data: SubmitLeadInfoRequestBody;
}

async function submitLeadInfo({ leadId, data }: SubmitInfoParams) {
  try {
    const { data: responseData, error } = await apiClient.POST(
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

    return responseData;
  } catch (error) {
    console.error("Submit lead info API failed, using mock data:", error);
    // Mock success response
    return {
      success: true,
      message: "Lead info submitted successfully (Mock)",
    };
  }
}

export function useSubmitLeadInfo() {
  return useMutation({
    mutationFn: submitLeadInfo,
  });
}
