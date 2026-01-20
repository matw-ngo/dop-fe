import { useMutation } from "@tanstack/react-query";
import apiClient from "@/lib/api/client";
import type { components } from "@/lib/api/v1.d.ts";

type ResendOTPRequestBody = components["schemas"]["ResendOTPRequestBody"];

interface ResendOTPParams {
  leadId: string;
  target: string; // phone number or email
}

async function resendOTP({ leadId, target }: ResendOTPParams) {
  try {
    const { data, error } = await apiClient.POST("/leads/{id}/resend-otp", {
      params: {
        path: {
          id: leadId,
        },
      },
      body: {
        target: target,
      },
    });

    if (error) {
      throw new Error((error as any).message || "Failed to resend OTP");
    }

    if (!data) {
      throw new Error("No data returned from resend OTP API");
    }

    return data;
  } catch (error) {
    throw error;
  }
}

export function useResendOTP() {
  return useMutation({
    mutationFn: resendOTP,
  });
}
