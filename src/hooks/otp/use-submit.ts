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
  try {
    const { data, error } = await apiClient.POST("/leads/{id}/submit-otp", {
      params: {
        path: {
          id: leadId,
        },
      },
      body: {
        token: token,
        otp: otp,
      },
    });

    if (error) {
      throw new Error((error as any).message || "Failed to submit OTP");
    }

    if (!data) {
      throw new Error("No data returned from submit OTP API");
    }

    return data;
  } catch (error) {
    throw error;
  }
}

export function useSubmitOTP() {
  return useMutation({
    mutationFn: submitOTP,
  });
}
