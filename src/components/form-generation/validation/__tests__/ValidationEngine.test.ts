import { describe, it, expect, vi } from "vitest";
import { ValidationEngine } from "../ValidationEngine";
import { AnyValidationRule, ValidationRuleType } from "../../types";

describe("ValidationEngine", () => {
  describe("required validation", () => {
    it("should validate required fields correctly", async () => {
      const rule: AnyValidationRule = {
        type: ValidationRuleType.REQUIRED,
        message: "Required",
      };

      expect(await ValidationEngine.validateField("valid", [rule])).toEqual({
        valid: true,
      });
      expect(await ValidationEngine.validateField("  ", [rule])).toEqual({
        valid: false,
        error: "Required",
      });
      expect(await ValidationEngine.validateField(null, [rule])).toEqual({
        valid: false,
        error: "Required",
      });
      expect(await ValidationEngine.validateField(undefined, [rule])).toEqual({
        valid: false,
        error: "Required",
      });
      expect(await ValidationEngine.validateField([], [rule])).toEqual({
        valid: false,
        error: "Required",
      });
      expect(await ValidationEngine.validateField(["a"], [rule])).toEqual({
        valid: true,
      });
    });
  });

  describe("length validation", () => {
    it("should validate minLength", async () => {
      const rule: AnyValidationRule = {
        type: ValidationRuleType.MIN_LENGTH,
        value: 3,
        message: "Too short",
      };

      expect(await ValidationEngine.validateField("abc", [rule])).toEqual({
        valid: true,
      });
      expect(await ValidationEngine.validateField("ab", [rule])).toEqual({
        valid: false,
        error: "Too short",
      });
      expect(
        await ValidationEngine.validateField(["a", "b", "c"], [rule]),
      ).toEqual({ valid: true });
      expect(await ValidationEngine.validateField(["a", "b"], [rule])).toEqual({
        valid: false,
        error: "Too short",
      });
    });

    it("should validate maxLength", async () => {
      const rule: AnyValidationRule = {
        type: ValidationRuleType.MAX_LENGTH,
        value: 3,
        message: "Too long",
      };

      expect(await ValidationEngine.validateField("abc", [rule])).toEqual({
        valid: true,
      });
      expect(await ValidationEngine.validateField("abcd", [rule])).toEqual({
        valid: false,
        error: "Too long",
      });
      expect(
        await ValidationEngine.validateField(["a", "b", "c"], [rule]),
      ).toEqual({ valid: true });
      expect(
        await ValidationEngine.validateField(["a", "b", "c", "d"], [rule]),
      ).toEqual({ valid: false, error: "Too long" });
    });
  });

  describe("numeric validation", () => {
    it("should validate min", async () => {
      const rule: AnyValidationRule = {
        type: ValidationRuleType.MIN,
        value: 5,
        message: "Too small",
      };

      expect(await ValidationEngine.validateField(5, [rule])).toEqual({
        valid: true,
      });
      expect(await ValidationEngine.validateField(6, [rule])).toEqual({
        valid: true,
      });
      expect(await ValidationEngine.validateField(4, [rule])).toEqual({
        valid: false,
        error: "Too small",
      });
      expect(await ValidationEngine.validateField("5", [rule])).toEqual({
        valid: true,
      }); // String number handling
      expect(await ValidationEngine.validateField("4", [rule])).toEqual({
        valid: false,
        error: "Too small",
      });
    });

    it("should validate max", async () => {
      const rule: AnyValidationRule = {
        type: ValidationRuleType.MAX,
        value: 5,
        message: "Too big",
      };

      expect(await ValidationEngine.validateField(5, [rule])).toEqual({
        valid: true,
      });
      expect(await ValidationEngine.validateField(4, [rule])).toEqual({
        valid: true,
      });
      expect(await ValidationEngine.validateField(6, [rule])).toEqual({
        valid: false,
        error: "Too big",
      });
    });
  });

  describe("pattern validation", () => {
    it("should validate regex patterns", async () => {
      const rule: AnyValidationRule = {
        type: ValidationRuleType.PATTERN,
        value: "^[0-9]+$",
        message: "Digits only",
      };

      expect(await ValidationEngine.validateField("123", [rule])).toEqual({
        valid: true,
      });
      expect(await ValidationEngine.validateField("12a", [rule])).toEqual({
        valid: false,
        error: "Digits only",
      });
    });
  });

  describe("custom validation", () => {
    it("should execute custom validator function", async () => {
      const customFn = vi.fn().mockImplementation((val) => val === "pass");
      const rule: AnyValidationRule = {
        type: ValidationRuleType.CUSTOM,
        validator: customFn,
        message: "Custom failed",
      };

      expect(await ValidationEngine.validateField("pass", [rule])).toEqual({
        valid: true,
      });
      expect(customFn).toHaveBeenCalledWith("pass");

      expect(await ValidationEngine.validateField("fail", [rule])).toEqual({
        valid: false,
        error: "Custom failed",
      });
    });

    it("should handle async custom validators", async () => {
      const customFn = vi
        .fn()
        .mockImplementation(async (val) => val === "pass");
      const rule: AnyValidationRule = {
        type: ValidationRuleType.CUSTOM,
        validator: customFn,
        message: "Custom failed",
      };

      expect(await ValidationEngine.validateField("pass", [rule])).toEqual({
        valid: true,
      });
      expect(await ValidationEngine.validateField("fail", [rule])).toEqual({
        valid: false,
        error: "Custom failed",
      });
    });
  });

  describe("email validation helper", () => {
    it("should validate email format", () => {
      expect(ValidationEngine.isValidEmail("test@example.com")).toBe(true);
      expect(ValidationEngine.isValidEmail("test.name@example.co.uk")).toBe(
        true,
      );
      expect(ValidationEngine.isValidEmail("invalid")).toBe(false);
      expect(ValidationEngine.isValidEmail("test@")).toBe(false);
      expect(ValidationEngine.isValidEmail("@example.com")).toBe(false);
    });
  });
});
