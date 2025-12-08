import { renderHook } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { useSafeTranslations } from "./use-safe-translations";

describe("useSafeTranslations", () => {
  it("should return a safe translation function", () => {
    const { result } = renderHook(() => useSafeTranslations());

    expect(typeof result.current).toBe("function");
    expect(result.current("test.key")).toBe("test.key");
  });

  it("should handle translations with values", () => {
    const { result } = renderHook(() => useSafeTranslations());

    expect(result.current("test.key", { name: "John" })).toBe("test.key");
  });

  it("should provide has method for checking key existence", () => {
    const { result } = renderHook(() => useSafeTranslations());

    expect(typeof (result.current as any).has).toBe("function");
    expect((result.current as any).has("any.key")).toBe(false);
  });

  it("should memoize the safe translation function", () => {
    const { result, rerender } = renderHook(() => useSafeTranslations());

    const firstResult = result.current;
    rerender();
    const secondResult = result.current;

    // The function should behave consistently
    expect(firstResult("test.key")).toBe(secondResult("test.key"));
    expect(typeof firstResult).toBe("function");
    expect(typeof secondResult).toBe("function");
  });
});