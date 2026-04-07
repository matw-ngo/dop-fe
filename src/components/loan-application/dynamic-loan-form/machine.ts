import type { components } from "@/lib/api/v1/dop";

type LeadId = components["schemas"]["uuid"];

export type SubmitLeadInfoRequestBody =
  components["schemas"]["SubmitLeadInfoRequestBody"];

export type AfterOtpAction =
  | {
      type: "createLead";
    }
  | {
      type: "submitInfo";
      leadId: LeadId;
      payload: SubmitLeadInfoRequestBody;
    };

export type MachineState =
  | { status: "idle" }
  | { status: "collecting_phone" }
  | { status: "awaiting_otp"; afterOtpAction: AfterOtpAction }
  | { status: "submitting"; afterOtpAction: AfterOtpAction };

export type MachineEvent =
  | { type: "NEED_PHONE" }
  | { type: "HAVE_PHONE"; afterOtpAction: AfterOtpAction }
  | { type: "OTP_SUBMIT" }
  | { type: "OTP_SUCCESS" }
  | { type: "OTP_FAILURE" }
  | { type: "OTP_EXPIRED" }
  | { type: "CLOSE_PHONE" }
  | { type: "CLOSE_OTP" }
  | { type: "RESET" };

export const initialMachineState: MachineState = { status: "idle" };

export function dynamicLoanFormReducer(
  state: MachineState,
  event: MachineEvent,
): MachineState {
  switch (event.type) {
    case "RESET":
      return initialMachineState;

    case "NEED_PHONE":
      return { status: "collecting_phone" };

    case "HAVE_PHONE":
      return { status: "awaiting_otp", afterOtpAction: event.afterOtpAction };

    case "OTP_SUBMIT":
      if (state.status !== "awaiting_otp") return state;
      return { status: "submitting", afterOtpAction: state.afterOtpAction };

    case "OTP_SUCCESS":
    case "OTP_FAILURE":
    case "OTP_EXPIRED":
    case "CLOSE_OTP":
      return initialMachineState;

    case "CLOSE_PHONE":
      return initialMachineState;

    default:
      return state;
  }
}
