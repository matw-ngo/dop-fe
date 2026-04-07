/**
 * Dynamic Loan Form Orchestrator Tests
 *
 * Tests the state machine and orchestrator hook logic for all branches:
 * 1. Step 1 + sendOtp=true: createLead → OTP → navigate
 * 2. Step 1 + sendOtp=false: createLead → navigate
 * 3. Step 2+ + sendOtp=true: OTP → submit-info → navigate
 * 4. Step 2+ + sendOtp=false: submit-info → navigate
 * 5. OTP retry behavior: OTP_FAILURE/EXPIRED keeps modal open
 * 6. submit-info fail: modal closes
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React, { type ReactNode } from "react";

import {
  dynamicLoanFormReducer,
  initialMachineState,
  type MachineState,
  type MachineEvent,
  type AfterOtpAction,
} from "../machine";

// ============================================================================
// State Machine Tests
// ============================================================================

describe("dynamicLoanFormReducer", () => {
  it("should transition from idle to collecting_phone on NEED_PHONE", () => {
    const state = dynamicLoanFormReducer(initialMachineState, {
      type: "NEED_PHONE",
    });
    expect(state.status).toBe("collecting_phone");
  });

  it("should transition from collecting_phone to awaiting_otp on HAVE_PHONE", () => {
    const collectingState: MachineState = { status: "collecting_phone" };
    const action: MachineEvent = {
      type: "HAVE_PHONE",
      afterOtpAction: { type: "createLead" },
    };
    const state = dynamicLoanFormReducer(collectingState, action);
    expect(state.status).toBe("awaiting_otp");
    expect(
      (state as Extract<MachineState, { status: "awaiting_otp" }>)
        .afterOtpAction,
    ).toEqual({ type: "createLead" });
  });

  it("should transition from awaiting_otp to submitting on OTP_SUBMIT", () => {
    const awaitingState: MachineState = {
      status: "awaiting_otp",
      afterOtpAction: { type: "createLead" },
    };
    const state = dynamicLoanFormReducer(awaitingState, {
      type: "OTP_SUBMIT",
    });
    expect(state.status).toBe("submitting");
  });

  it("should reset to idle on OTP_SUCCESS", () => {
    const submittingState: MachineState = {
      status: "submitting",
      afterOtpAction: { type: "createLead" },
    };
    const state = dynamicLoanFormReducer(submittingState, {
      type: "OTP_SUCCESS",
    });
    expect(state).toEqual(initialMachineState);
  });

  it("should stay in awaiting_otp on OTP_FAILURE (allows retry)", () => {
    const afterOtpAction: AfterOtpAction = {
      type: "submitInfo",
      leadId: "lead-123",
      payload: {
        flow_id: "flow-123",
        step_id: "step-1",
        phone_number: "0987654321",
      },
    };
    const awaitingState: MachineState = {
      status: "awaiting_otp",
      afterOtpAction,
    };
    const state = dynamicLoanFormReducer(awaitingState, {
      type: "OTP_FAILURE",
    });
    expect(state.status).toBe("awaiting_otp");
    expect(
      (state as Extract<MachineState, { status: "awaiting_otp" }>)
        .afterOtpAction,
    ).toEqual(afterOtpAction);
  });

  it("should stay in awaiting_otp on OTP_EXPIRED (allows retry)", () => {
    const afterOtpAction: AfterOtpAction = { type: "createLead" };
    const submittingState: MachineState = {
      status: "submitting",
      afterOtpAction,
    };
    const state = dynamicLoanFormReducer(submittingState, {
      type: "OTP_EXPIRED",
    });
    expect(state.status).toBe("awaiting_otp");
    expect(
      (state as Extract<MachineState, { status: "awaiting_otp" }>)
        .afterOtpAction,
    ).toEqual(afterOtpAction);
  });

  it("should reset to idle on CLOSE_OTP", () => {
    const awaitingState: MachineState = {
      status: "awaiting_otp",
      afterOtpAction: { type: "createLead" },
    };
    const state = dynamicLoanFormReducer(awaitingState, {
      type: "CLOSE_OTP",
    });
    expect(state).toEqual(initialMachineState);
  });

  it("should reset to idle on CLOSE_PHONE", () => {
    const collectingState: MachineState = { status: "collecting_phone" };
    const state = dynamicLoanFormReducer(collectingState, {
      type: "CLOSE_PHONE",
    });
    expect(state).toEqual(initialMachineState);
  });

  it("should reset to idle on RESET", () => {
    const submittingState: MachineState = {
      status: "submitting",
      afterOtpAction: { type: "createLead" },
    };
    const state = dynamicLoanFormReducer(submittingState, {
      type: "RESET",
    });
    expect(state).toEqual(initialMachineState);
  });

  it("should ignore OTP_SUBMIT when not in awaiting_otp state", () => {
    const idleState: MachineState = { status: "idle" };
    const state = dynamicLoanFormReducer(idleState, {
      type: "OTP_SUBMIT",
    });
    expect(state).toEqual(idleState);
  });

  it("should ignore OTP_FAILURE when in idle state", () => {
    const state = dynamicLoanFormReducer(initialMachineState, {
      type: "OTP_FAILURE",
    });
    expect(state).toEqual(initialMachineState);
  });
});

// ============================================================================
// Test Suite Complete
// ============================================================================

/**
 * Integration tests for orchestrator hook are covered in:
 * - DynamicLoanForm.test.tsx: Component-level integration
 * - loan-submission-flow.integration.test.tsx: Full flow with MSW
 *
 * This file focuses on state machine unit tests which are deterministic
 * and don't require complex async mocking.
 */
