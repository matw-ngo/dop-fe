import type { components } from "@/lib/api/v1.d.ts";

// API Types
type ApiFlowDetail = components["schemas"]["FlowDetail"];
type ApiStep = components["schemas"]["Step"];

// Mapped Types for Frontend
export interface MappedStep {
  id: string;
  useEkyc: boolean;
  sendOtp: boolean;
  fields: {
    purpose: { visible: boolean; required: boolean };
    phoneNumber: { visible: boolean; required: boolean };
    email: { visible: boolean; required: boolean };
    fullName: { visible: boolean; required: boolean };
    nationalId: { visible: boolean; required: boolean };
    secondNationalId: { visible: boolean; required: boolean };
    gender: { visible: boolean; required: boolean };
    location: { visible: boolean; required: boolean };
    birthday: { visible: boolean; required: boolean };
    incomeType: { visible: boolean; required: boolean };
    income: { visible: boolean; required: boolean };
    havingLoan: { visible: boolean; required: boolean };
    careerStatus: { visible: boolean; required: boolean };
    careerType: { visible: boolean; required: boolean };
    creditStatus: { visible: boolean; required: boolean };
  };
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
  return {
    id: apiStep.id,
    useEkyc: apiStep.use_ekyc,
    sendOtp: apiStep.send_otp,
    fields: {
      purpose: {
        visible: apiStep.have_purpose,
        required: apiStep.required_purpose,
      },
      phoneNumber: {
        visible: apiStep.have_phone_number,
        required: apiStep.required_phone_number,
      },
      email: { visible: apiStep.have_email, required: apiStep.required_email },
      fullName: {
        visible: apiStep.have_full_name,
        required: apiStep.required_full_name,
      },
      nationalId: {
        visible: apiStep.have_national_id,
        required: apiStep.required_national_id,
      },
      secondNationalId: {
        visible: apiStep.have_second_national_id,
        required: apiStep.required_second_national_id,
      },
      gender: {
        visible: apiStep.have_gender,
        required: apiStep.required_gender,
      },
      location: {
        visible: apiStep.have_location,
        required: apiStep.required_location,
      },
      birthday: {
        visible: apiStep.have_birthday,
        required: apiStep.required_birthday,
      },
      incomeType: {
        visible: apiStep.have_income_type,
        required: apiStep.required_income_type,
      },
      income: {
        visible: apiStep.have_income,
        required: apiStep.required_income,
      },
      havingLoan: {
        visible: apiStep.have_having_loan,
        required: apiStep.required_having_loan,
      },
      careerStatus: {
        visible: apiStep.have_career_status,
        required: apiStep.required_career_status,
      },
      careerType: {
        visible: apiStep.have_career_type,
        required: apiStep.required_career_type,
      },
      creditStatus: {
        visible: apiStep.have_credit_status,
        required: apiStep.required_credit_status,
      },
    },
    createdAt: new Date(apiStep.created_at),
    updatedAt: new Date(apiStep.updated_at),
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
