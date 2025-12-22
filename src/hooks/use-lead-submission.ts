import { useMutation } from "@tanstack/react-query";
import apiClient from "@/lib/api/client";
import type { components } from "@/lib/api/v1.d.ts";

type SubmitLeadInfoRequestBody =
  components["schemas"]["SubmitLeadInfoRequestBody"];

interface SubmitInfoParams {
  leadId: string;
  data: SubmitLeadInfoRequestBody;
}

async function submitLeadInfo({ leadId, data }: SubmitInfoParams) {
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

  return responseData;
}

export function useSubmitLeadInfo() {
  return useMutation({
    mutationFn: submitLeadInfo,
  });
}
