import { useMutation } from "@tanstack/react-query";
import { dopClient } from "@/lib/api/services/dop";
import type { components } from "@/lib/api/v1/dop";

type SubmitOTPRequestBody = components["schemas"]["SubmitOTPRequestBody"];

interface SubmitOTPParams {
  leadId: string;
  token: string;
  otp: string;
}

async function submitOTP({ leadId, token, otp }: SubmitOTPParams) {
  const { data, error } = await dopClient.POST("/leads/{id}/submit-otp", {
    params: {
      path: {
        id: leadId,
      },
    },
    // FIXME: Temporary fix - BE spec is incorrect, token should be in header
    headers: {
      authorization: `Bearer ${token}`,
    },
    body: {
      token: token,
      otp: otp,
    },
  });

  if (error) {
    throw new Error((error as any).message || "Failed to submit OTP");
  }

  // if (!data) {
  //   throw new Error("No data returned from submit OTP API");
  // }

  return data;
}

export function useSubmitOTP() {
  return useMutation({
    mutationFn: submitOTP,
  });
}
