import { useMutation } from "@tanstack/react-query";
import apiClient from "@/lib/api/client";
import type { components } from "@/lib/api/v1.d.ts";

type SubmitOTPRequestBody = components["schemas"]["SubmitOTPRequestBody"];

interface SubmitOTPParams {
  leadId: string;
  token: string;
  otp: string;
}

async function submitOTP({ leadId, token, otp }: SubmitOTPParams) {
  const { data, error } = await apiClient.POST("/leads/{id}/submit-otp", {
    params: {
      path: { id: leadId },
    },
    body: {
      token,
      otp,
    },
  });

  if (error) {
    throw new Error((error as any).message || "Failed to verify OTP");
  }

  return data;
}

export function useSubmitOTP() {
  return useMutation({
    mutationFn: submitOTP,
  });
}
