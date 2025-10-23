import type { components } from "@/lib/api/v1.d.ts";

// API Types
type ApiFlowDetail = components["schemas"]["FlowDetail"];
type ApiStep = components["schemas"]["Step"];

// Mapped Types for Frontend
export interface MappedStep extends Omit<ApiStep, "created_at" | "updated_at"> {
  createdAt: Date;
  updatedAt: Date;
}

export interface MappedFlow {
  id: string;
  name: string;
  description: string;
  status: "Active" | "Inactive";
  steps: MappedStep[];
  createdAt: Date;
  updatedAt: Date;
}

// Mapper for a single Step
export function mapApiStepToStep(apiStep: ApiStep): MappedStep {
  const { created_at, updated_at, ...rest } = apiStep;
  return {
    ...rest,
    createdAt: new Date(created_at),
    updatedAt: new Date(updated_at),
  };
}

// Mapper for the entire Flow
export function mapApiFlowToFlow(apiFlow: ApiFlowDetail): MappedFlow {
  return {
    id: apiFlow.id,
    name: apiFlow.name,
    description: apiFlow.description,
    status:
      apiFlow.flow_status === "FLOW_STATUS_ACTIVE" ? "Active" : "Inactive",
    steps: apiFlow.steps.map(mapApiStepToStep),
    createdAt: new Date(apiFlow.created_at),
    updatedAt: new Date(apiFlow.updated_at),
  };
}
