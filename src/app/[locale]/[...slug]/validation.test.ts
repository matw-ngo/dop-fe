import { describe, it, expect } from "vitest";
import {
  normalizePageIdentifier,
  isFlowPage,
  validateStep,
} from "./validation";
import type { MappedFlow } from "@/mappers/flowMapper";

describe("Navigation Validation", () => {
  const mockFlowData = {
    id: "test-flow",
    name: "Test Flow",
    steps: [
      {
        page: "/",
        id: "step-1",
        sendOtp: false,
        useEkyc: false,
        fields: {} as any,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        page: "/consent",
        id: "step-2",
        sendOtp: false,
        useEkyc: false,
        fields: {} as any,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        page: "/otp",
        id: "step-3",
        sendOtp: true,
        useEkyc: false,
        fields: {} as any,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        page: "/loan-info",
        id: "step-4",
        sendOtp: false,
        useEkyc: false,
        fields: {} as any,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ],
  } as MappedFlow;

  describe("normalizePageIdentifier", () => {
    it("should normalize paths correctly", () => {
      expect(normalizePageIdentifier("consent")).toBe("/consent");
      expect(normalizePageIdentifier("/consent")).toBe("/consent");
      expect(normalizePageIdentifier("/index")).toBe("/");
      expect(normalizePageIdentifier("index")).toBe("/");
    });
  });

  describe("isFlowPage", () => {
    it("should return true for flow pages", () => {
      expect(isFlowPage("/", mockFlowData)).toBe(true);
      expect(isFlowPage("/consent", mockFlowData)).toBe(true);
      expect(isFlowPage("/otp", mockFlowData)).toBe(true);
      expect(isFlowPage("/loan-info", mockFlowData)).toBe(true);
    });

    it("should return false for non-flow pages", () => {
      expect(isFlowPage("/products", mockFlowData)).toBe(false);
      expect(isFlowPage("/credit-cards", mockFlowData)).toBe(false);
      expect(isFlowPage("/insurance", mockFlowData)).toBe(false);
      expect(isFlowPage("/tools/loan-calculator", mockFlowData)).toBe(false);
      expect(isFlowPage("/about", mockFlowData)).toBe(false);
    });

    it("should handle normalized paths", () => {
      expect(isFlowPage("consent", mockFlowData)).toBe(true);
      expect(isFlowPage("index", mockFlowData)).toBe(true);
    });
  });

  describe("validateStep with flow pages only", () => {
    it("should allow access to first step without form data", () => {
      const result = validateStep("/", mockFlowData, {
        formData: {},
        currentStep: 0,
        completedSteps: [],
      });

      expect(result.isValid).toBe(true);
      expect(result.redirectTo).toBeUndefined();
    });

    it("should block access to later steps without form data", () => {
      const result = validateStep("/consent", mockFlowData, {
        formData: {},
        currentStep: 0,
        completedSteps: [],
      });

      expect(result.isValid).toBe(false);
      expect(result.messageKey).toBe("sharedLink.noSession");
    });

    it("should allow access with form data", () => {
      const result = validateStep("/consent", mockFlowData, {
        formData: { someField: "value" },
        currentStep: 0,
        completedSteps: [],
      });

      expect(result.isValid).toBe(true);
    });
  });
});
