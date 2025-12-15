import { describe, it, expect, beforeEach, vi } from "vitest";
import { act } from "@testing-library/react";
import { useFormWizardStore } from "../use-form-wizard-store";
import {
  FormStep,
  FieldType,
  ValidationRuleType,
} from "@/components/form-generation/types";

// Mock step configuration
const mockSteps: FormStep[] = [
  {
    id: "step1",
    title: "Step 1",
    fields: [
      {
        id: "field1",
        name: "field1",
        type: FieldType.TEXT,
        label: "Field 1",
        validation: [
          { type: ValidationRuleType.REQUIRED, message: "Required" },
        ],
      },
    ],
  },
  {
    id: "step2",
    title: "Step 2",
    fields: [
      {
        id: "field2",
        name: "field2",
        type: FieldType.NUMBER,
        label: "Field 2",
      },
    ],
  },
];

describe("useFormWizardStore", () => {
  const store = useFormWizardStore;

  // Reset store before each test
  beforeEach(() => {
    act(() => {
      store.getState().resetWizard();
    });
  });

  it("should initialize wizard correctly", () => {
    act(() => {
      store.getState().initWizard("test-wizard", mockSteps);
    });

    const state = store.getState();
    expect(state.wizardId).toBe("test-wizard");
    expect(state.steps).toHaveLength(2);
    expect(state.currentStep).toBe(0);
    expect(state.stepMeta["step1"]).toBeDefined();
    expect(state.stepMeta["step1"].completionStatus).toBe("current");
  });

  it("should update form data and step data", () => {
    act(() => {
      store.getState().initWizard("test-wizard", mockSteps);
      store.getState().updateFieldValue("step1", "field1", "test value");
    });

    const state = store.getState();
    expect(state.formData["field1"]).toBe("test value");
    expect(state.stepData["step1"]["field1"]).toBe("test value");
    expect(state.stepMeta["step1"].touched).toBe(true);
  });

  it("should handle navigation between steps", () => {
    act(() => {
      store.getState().initWizard("test-wizard", mockSteps);
    });

    // Mock validation to always pass for navigation test
    // In a real scenario, nextStep calls validateStep which calls validation logic

    // For direct navigation test skipping validation
    act(() => {
      store.getState().goToStep(1);
    });

    const state = store.getState();
    expect(state.currentStep).toBe(1);
    expect(state.visitedSteps).toContain(1);
    expect(state.stepMeta["step2"].completionStatus).toBe("current");
  });

  it("should calculate progress correctly", () => {
    act(() => {
      store.getState().initWizard("test-wizard", mockSteps);
    });

    let progress = store.getState().getProgress();
    expect(progress.current).toBe(1);
    expect(progress.total).toBe(2);
    expect(progress.percentage).toBe(50);

    act(() => {
      store.getState().goToStep(1);
    });

    progress = store.getState().getProgress();
    expect(progress.current).toBe(2);
    expect(progress.percentage).toBe(100);
  });
});
