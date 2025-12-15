import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useModal } from "../useModal";

describe("useModal", () => {
  it("initializes with default state", () => {
    const { result } = renderHook(() => useModal());

    expect(result.current.modals).toEqual({
      phone: false,
      otp: false,
    });
  });

  it("initializes with custom initial state", () => {
    const { result } = renderHook(() => useModal({ phone: true, otp: false }));

    expect(result.current.modals).toEqual({
      phone: true,
      otp: false,
    });
  });

  it("shows phone modal", () => {
    const { result } = renderHook(() => useModal());

    act(() => {
      result.current.actions.showPhoneModal();
    });

    expect(result.current.modals).toEqual({
      phone: true,
      otp: false,
    });
  });

  it("hides phone modal", () => {
    const { result } = renderHook(() => useModal({ phone: true, otp: false }));

    act(() => {
      result.current.actions.hidePhoneModal();
    });

    expect(result.current.modals).toEqual({
      phone: false,
      otp: false,
    });
  });

  it("shows OTP modal", () => {
    const { result } = renderHook(() => useModal());

    act(() => {
      result.current.actions.showOtpModal();
    });

    expect(result.current.modals).toEqual({
      phone: false,
      otp: true,
    });
  });

  it("hides OTP modal", () => {
    const { result } = renderHook(() => useModal({ phone: false, otp: true }));

    act(() => {
      result.current.actions.hideOtpModal();
    });

    expect(result.current.modals).toEqual({
      phone: false,
      otp: false,
    });
  });

  it("closes all modals", () => {
    const { result } = renderHook(() => useModal({ phone: true, otp: true }));

    act(() => {
      result.current.actions.hideAllModals();
    });

    expect(result.current.modals).toEqual({
      phone: false,
      otp: false,
    });
  });

  it("shows phone modal closes OTP modal", () => {
    const { result } = renderHook(() => useModal({ phone: false, otp: true }));

    act(() => {
      result.current.actions.showPhoneModal();
    });

    expect(result.current.modals).toEqual({
      phone: true,
      otp: false,
    });
  });

  it("shows OTP modal closes phone modal", () => {
    const { result } = renderHook(() => useModal({ phone: true, otp: false }));

    act(() => {
      result.current.actions.showOtpModal();
    });

    expect(result.current.modals).toEqual({
      phone: false,
      otp: true,
    });
  });

  it("actions object is stable across renders", () => {
    const { result, rerender } = renderHook(() => useModal());

    const actions1 = result.current.actions;
    rerender();
    const actions2 = result.current.actions;

    expect(actions1).toBe(actions2);
  });
});
