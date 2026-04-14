import type { components } from "@/lib/api/v1/dop";

type LeadId = components["schemas"]["uuid"];

type LeadToken = string;

export function buildLoanInfoRedirect(leadId: LeadId, token: LeadToken) {
  return `/loan-info?leadId=${leadId}&token=${token}`;
}
