import { useMutation } from "@tanstack/react-query";
import { dopClient } from "@/lib/api/services/dop";
import type { components } from "@/lib/api/v1/dop";

type SubmitLeadInfoRequestBody =
  components["schemas"]["SubmitLeadInfoRequestBody"];

interface SubmitInfoParams {
  leadId: string;
  data: SubmitLeadInfoRequestBody;
}

async function submitLeadInfo({ leadId, data }: SubmitInfoParams) {
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
    console.error("Submit lead info API failed:", error);
    throw new Error((error as any).message || "Failed to submit lead info");
  }

  if (!responseData) {
    const errorMessage = "No data returned from submit lead info API";
    console.error(errorMessage);
    throw new Error(errorMessage);
  }

  return responseData;
}

export function useSubmitLeadInfo() {
  return useMutation({
    mutationFn: submitLeadInfo,
  });
}
