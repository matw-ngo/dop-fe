import type { components } from "@/lib/api/v1/dop";

type LeadId = components["schemas"]["uuid"];

type LeadToken = string;

export function resolveLeadIdentity(input: {
  data: Record<string, unknown>;
  createdLeadId?: LeadId;
  createdLeadToken?: LeadToken;
}): { leadId?: LeadId; token?: LeadToken } {
  const leadId =
    (input.data.leadId as LeadId | undefined) ?? input.createdLeadId;
  const token =
    (input.data.token as LeadToken | undefined) ?? input.createdLeadToken;

  return { leadId, token };
}
