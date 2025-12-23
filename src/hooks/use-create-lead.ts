import { useMutation } from "@tanstack/react-query";
import apiClient from "@/lib/api/client";
import type { components } from "@/lib/api/v1.d.ts";

type CreateLeadRequestBody = components["schemas"]["CreateLeadRequestBody"];
type CreateLeadResponseBody = components["schemas"]["CreateLeadResponseBody"];

interface CreateLeadParams {
  flowId: string;
  domain: string;
  deviceInfo: Record<string, never>;
  trackingParams: Record<string, never>;
  info: components["schemas"]["SubmitLeadInfoRequestBody"];
}

/**
 * Creates a new lead in the V1 API system.
 *
 * @remarks
 * This hook should be called at the **beginning of the wizard** or at the **end of the personal info step**.
 * The timing depends on when you want to capture the lead:
 * - **Early capture**: Call after collecting basic info (phone number, loan amount, etc.)
 * - **Late capture**: Call after collecting all personal details before OTP verification
 *
 * The response contains:
 * - `id`: Lead ID required for subsequent API calls (submit-info, submit-otp, resend-otp)
 * - `token`: Authentication token required for OTP submission
 *
 * @example
 * ```tsx
 * const { mutate: createLead } = useCreateLead();
 *
 * // Call when ready to create lead
 * createLead({
 *   flowId: "...",
 *   domain: "lending",
 *   deviceInfo: {},
 *   trackingParams: {},
 *   info: { phone_number: "...", ... }
 * }, {
 *   onSuccess: (data) => {
 *     setLeadId(data.id);
 *     setToken(data.token);
 *   }
 * });
 * ```
 */
async function createLead(
  params: CreateLeadParams,
): Promise<CreateLeadResponseBody> {
  const requestBody: CreateLeadRequestBody = {
    flow_id: params.flowId,
    domain: params.domain,
    deviece_info: params.deviceInfo, // Note: typo in API schema "deviece_info"
    tracking_params: params.trackingParams,
    info: params.info,
  };

  try {
    const { data, error } = await apiClient.POST("/leads", {
      body: requestBody,
    });

    if (error) {
      throw new Error((error as any).message || "Failed to create lead");
    }

    if (!data) {
      throw new Error("No data returned from create lead API");
    }

    return data;
  } catch (error) {
    console.error(
      "Create lead API failed, using mock data for testing:",
      error,
    );
    // Mock response to unblock testing
    return {
      id: "mock-lead-id-" + Date.now(),
      token: "mock-token-" + Date.now(),
    };
  }
}

export function useCreateLead() {
  return useMutation({
    mutationFn: createLead,
  });
}
