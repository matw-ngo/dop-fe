/**
 * Unit tests for loan-form-config-builder
 */

import { describe, expect, it, vi } from "vitest";
import type { MappedStep } from "@/mappers";
import { buildLoanFormConfigFromStep } from "../loan-form-config-builder";

// Mock the useLoanPurposes hook
vi.mock("@/hooks/i18n/use-loan-purposes", () => ({
  useLoanPurposes: vi.fn(() => [
    { label: "Mua nhà", value: "buy_house" },
    { label: "Mua xe", value: "buy_car" },
    { label: "Tiêu dùng", value: "consumption" },
  ]),
}));

describe("loan-form-config-builder", () => {
  describe("i18n namespace", () => {
    it("should use correct namespace matching translation file location", () => {
      const mockStep: MappedStep = {
        id: "step-1",
        page: "/",
        useEkyc: false,
        sendOtp: false,
        fields: {
          purpose: { visible: true, required: true },
          phoneNumber: { visible: false, required: false },
          email: { visible: false, required: false },
          fullName: { visible: false, required: false },
          nationalId: { visible: false, required: false },
          secondNationalId: { visible: false, required: false },
          gender: { visible: false, required: false },
          location: { visible: false, required: false },
          birthday: { visible: false, required: false },
          incomeType: { visible: false, required: false },
          income: { visible: false, required: false },
          havingLoan: { visible: false, required: false },
          careerStatus: { visible: false, required: false },
          careerType: { visible: false, required: false },
          creditStatus: { visible: false, required: false },
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const config = buildLoanFormConfigFromStep(mockStep, [
        { label: "Mua nhà", value: "buy_house" },
      ] as ISelectBoxOption[]);

      // The namespace should be "loan-application" to match the translation file:
      // messages/{locale}/forms/loan-application.json
      expect(config.id).toBe("loan-application");
    });
  });
});
