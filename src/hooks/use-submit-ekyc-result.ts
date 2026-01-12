import { useMutation } from "@tanstack/react-query";
import apiClient from "@/lib/api/client";
import type { components } from "@/lib/api/v1.d.ts";

type VnptEkycRequestBody = components["schemas"]["VnptEkycRequestBody"];

interface SubmitEkycParams {
  leadId: string;
  ekycData: VnptEkycRequestBody;
}

async function submitEkycResult({ leadId, ekycData }: SubmitEkycParams) {
  const { data, error } = await apiClient.POST("/leads/{id}/ekyc/vnpt", {
    params: { path: { id: leadId } },
    body: ekycData,
  });

  if (error) {
    throw new Error((error as any).message || "Failed to submit eKYC result");
  }

  if (!data) {
    throw new Error("No data returned from submit eKYC result API");
  }

  return data;
}

export function useSubmitEkycResult() {
  return useMutation({
    mutationFn: submitEkycResult,
  });
}
