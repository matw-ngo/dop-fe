import { useQuery } from "@tanstack/react-query";
import { mapApiFlowToFlow } from "@/mappers/flowMapper";
import type { components } from "@/lib/api/v1.d.ts";
import type { MappedFlow } from "@/mappers/flowMapper";
import apiClient from "@/lib/api/client";

const shouldMockFlow =
  process.env.NEXT_PUBLIC_USE_FLOW_MOCK === "true" ||
  process.env.STORYBOOK === "true";

const mockTimestamp = "2024-11-12T00:00:00.000Z";

const mockFlows: Record<string, components["schemas"]["FlowDetail"]> = {
  "localhost:3000": {
    id: "mock-flow-localhost",
    name: "Localhost Mock Flow",
    description: "Mock flow for local development",
    flow_status: "FLOW_STATUS_ACTIVE",
    steps: [
      {
        id: "mock-step-1",
        use_ekyc: false,
        send_otp: false,
        have_purpose: true,
        required_purpose: true,
        have_phone_number: true,
        required_phone_number: false,
        have_email: true,
        required_email: true,
        have_full_name: true,
        required_full_name: true,
        have_national_id: true,
        required_national_id: false,
        have_second_national_id: false,
        required_second_national_id: false,
        have_gender: true,
        required_gender: true,
        have_location: false,
        required_location: false,
        have_birthday: true,
        required_birthday: false,
        have_income_type: false,
        required_income_type: false,
        have_income: false,
        required_income: false,
        have_having_loan: false,
        required_having_loan: false,
        have_career_status: false,
        required_career_status: false,
        have_career_type: false,
        required_career_type: false,
        have_credit_status: false,
        required_credit_status: false,
        created_at: mockTimestamp,
        updated_at: mockTimestamp,
      },
      {
        id: "mock-step-2",
        use_ekyc: true,
        send_otp: false,
        have_purpose: false,
        required_purpose: false,
        have_phone_number: false,
        required_phone_number: false,
        have_email: false,
        required_email: false,
        have_full_name: false,
        required_full_name: false,
        have_national_id: false,
        required_national_id: false,
        have_second_national_id: false,
        required_second_national_id: false,
        have_gender: false,
        required_gender: false,
        have_location: false,
        required_location: false,
        have_birthday: false,
        required_birthday: false,
        have_income_type: false,
        required_income_type: false,
        have_income: false,
        required_income: false,
        have_having_loan: false,
        required_having_loan: false,
        have_career_status: false,
        required_career_status: false,
        have_career_type: false,
        required_career_type: false,
        have_credit_status: false,
        required_credit_status: false,
        created_at: mockTimestamp,
        updated_at: mockTimestamp,
      },
    ],
    created_at: mockTimestamp,
    updated_at: mockTimestamp,
  },
  "all-fields": {
    id: "mock-flow-all-fields",
    name: "All Fields Mock Flow",
    description: "Mock flow with every field enabled",
    flow_status: "FLOW_STATUS_ACTIVE",
    steps: [
      {
        id: "mock-step-all",
        use_ekyc: false,
        send_otp: true,
        have_purpose: true,
        required_purpose: true,
        have_phone_number: true,
        required_phone_number: true,
        have_email: true,
        required_email: true,
        have_full_name: true,
        required_full_name: true,
        have_national_id: true,
        required_national_id: true,
        have_second_national_id: true,
        required_second_national_id: true,
        have_gender: true,
        required_gender: true,
        have_location: true,
        required_location: true,
        have_birthday: true,
        required_birthday: true,
        have_income_type: true,
        required_income_type: true,
        have_income: true,
        required_income: true,
        have_having_loan: true,
        required_having_loan: true,
        have_career_status: true,
        required_career_status: true,
        have_career_type: true,
        required_career_type: true,
        have_credit_status: true,
        required_credit_status: true,
        created_at: mockTimestamp,
        updated_at: mockTimestamp,
      },
      {
        id: "mock-step-ekyc",
        use_ekyc: true,
        send_otp: false,
        have_purpose: false,
        required_purpose: false,
        have_phone_number: false,
        required_phone_number: false,
        have_email: false,
        required_email: false,
        have_full_name: false,
        required_full_name: false,
        have_national_id: false,
        required_national_id: false,
        have_second_national_id: false,
        required_second_national_id: false,
        have_gender: false,
        required_gender: false,
        have_location: false,
        required_location: false,
        have_birthday: false,
        required_birthday: false,
        have_income_type: false,
        required_income_type: false,
        have_income: false,
        required_income: false,
        have_having_loan: false,
        required_having_loan: false,
        have_career_status: false,
        required_career_status: false,
        have_career_type: false,
        required_career_type: false,
        have_credit_status: false,
        required_credit_status: false,
        created_at: mockTimestamp,
        updated_at: mockTimestamp,
      },
    ],
    created_at: mockTimestamp,
    updated_at: mockTimestamp,
  },
};

const fallbackMockFlow = mockFlows["localhost:3000"];

async function getFlowByDomain(domain: string) {
  if (shouldMockFlow) {
    return mockFlows[domain] ?? fallbackMockFlow;
  }

  const { data, error, response } = await apiClient.GET("/flows/{domain}", {
    params: {
      path: { domain },
    },
  });

  if (error) {
    throw new Error(
      `API request failed: ${response.status} ${response.statusText}`,
    );
  }

  return data;
}

export function useFlow(domain: string) {
  const queryFn = async () => {
    const data = await getFlowByDomain(domain);
    if (!data) {
      throw new Error("No data returned from API");
    }
    return data;
  };

  return useQuery<components["schemas"]["FlowDetail"], Error, MappedFlow>({
    queryKey: ["flow", domain],
    queryFn: queryFn,
    select: mapApiFlowToFlow,
    enabled: !!domain,
  });
}
