import { useMutation } from "@tanstack/react-query";
import apiClient from "@/lib/api/client";
import type { components } from "@/lib/api/v1.d.ts";

type ResendOTPRequestBody = components["schemas"]["ResendOTPRequestBody"];

interface ResendOTPParams {
  leadId: string;
  target: string; // phone number or email
}

async function resendOTP({ leadId, target }: ResendOTPParams) {
  const { data, error } = await apiClient.POST("/leads/{id}/resend-otp", {
    params: {
      path: { id: leadId },
    },
    body: {
      target,
    },
  });

  if (error) {
    throw new Error((error as any).message || "Failed to resend OTP");
  }

  return data;
}

export function useResendOTP() {
  return useMutation({
    mutationFn: resendOTP,
  });
}
