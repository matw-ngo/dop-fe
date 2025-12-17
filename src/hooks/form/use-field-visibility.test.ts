import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { FieldConfig } from "@/components/renderer/types/data-driven-ui";
import { useFieldVisibility } from "./use-field-visibility";

// Mock dependencies
vi.mock("@/components/renderer/types/field-conditions", () => ({
  evaluateCondition: vi.fn(),
}));

describe("useFieldVisibility", () => {
  const mockEvaluateCondition = vi.mocked(
    require("@/components/renderer/types/field-conditions").evaluateCondition,
  );

  const mockFields: FieldConfig[] = [
    {
      fieldName: "firstName",
      component: "Input",
      props: { label: "First Name" },
    },
    {
      fieldName: "lastName",
      component: "Input",
      props: { label: "Last Name" },
    },
    {
      fieldName: "company",
      component: "Input",
      props: { label: "Company" },
      condition: {
        type: "field",
        field: "hasCompany",
        operator: "equals",
        value: "yes",
      },
    },
    {
      fieldName: "companyEmail",
      component: "Input",
      props: { label: "Company Email" },
      condition: {
        type: "and",
        conditions: [
          {
            type: "field",
            field: "hasCompany",
            operator: "equals",
            value: "yes",
          },
          {
            type: "field",
            field: "company",
            operator: "notEmpty",
            value: null,
          },
        ],
      },
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return visible field names based on conditions", () => {
    const watchedValues = {
      firstName: "John",
      lastName: "Doe",
      hasCompany: "yes",
      company: "Acme",
    };

    mockEvaluateCondition.mockImplementation((condition, values) => {
      if (condition.field === "hasCompany") {
        return values.hasCompany === "yes";
      }
      if (condition.field === "company") {
        return !!values.company;
      }
      if (condition.type === "and") {
        return condition.conditions.every((cond: any) => {
          if (cond.field === "hasCompany") return values.hasCompany === "yes";
          if (cond.field === "company") return !!values.company;
          return true;
        });
      }
      return true;
    });

    const { result } = renderHook(() =>
      useFieldVisibility(mockFields, watchedValues),
    );

    expect(result.current.visibleFieldNames).toEqual(
      new Set(["firstName", "lastName", "company", "companyEmail"]),
    );
  });

  it("should hide fields when conditions are not met", () => {
    const watchedValues = {
      firstName: "John",
      lastName: "Doe",
      hasCompany: "no",
    };

    mockEvaluateCondition.mockImplementation((condition, values) => {
      if (condition.field === "hasCompany") {
        return values.hasCompany === "yes";
      }
      if (condition.type === "and") {
        return condition.conditions.every((cond: any) => {
          if (cond.field === "hasCompany") return values.hasCompany === "yes";
          return true;
        });
      }
      return true;
    });

    const { result } = renderHook(() =>
      useFieldVisibility(mockFields, watchedValues),
    );

    expect(result.current.visibleFieldNames).toEqual(
      new Set(["firstName", "lastName"]),
    );
  });

  it("should return visible fields array", () => {
    const watchedValues = {
      hasCompany: "yes",
      company: "Acme",
    };

    mockEvaluateCondition.mockImplementation((condition, values) => {
      if (condition.field === "hasCompany") {
        return values.hasCompany === "yes";
      }
      if (condition.field === "company") {
        return !!values.company;
      }
      if (condition.type === "and") {
        return condition.conditions.every((cond: any) => {
          if (cond.field === "hasCompany") return values.hasCompany === "yes";
          if (cond.field === "company") return !!values.company;
          return true;
        });
      }
      return true;
    });

    const { result } = renderHook(() =>
      useFieldVisibility(mockFields, watchedValues),
    );

    expect(result.current.visibleFields).toHaveLength(2);
    expect(result.current.visibleFields.map((f) => f.fieldName)).toEqual([
      "company",
      "companyEmail",
    ]);
  });

  it("should provide shouldRenderField utility function", () => {
    const watchedValues = { hasCompany: "yes" };
    const fieldWithCondition = mockFields[2]; // company field

    mockEvaluateCondition.mockImplementation((condition, values) => {
      return values.hasCompany === "yes";
    });

    const { result } = renderHook(() =>
      useFieldVisibility(mockFields, watchedValues),
    );

    expect(result.current.shouldRenderField(fieldWithCondition)).toBe(true);
    expect(mockEvaluateCondition).toHaveBeenCalledWith(
      fieldWithCondition.condition,
      watchedValues,
    );
  });

  it("should return true for fields without conditions", () => {
    const watchedValues = {};
    const fieldWithoutCondition = mockFields[0]; // firstName field

    const { result } = renderHook(() =>
      useFieldVisibility(mockFields, watchedValues),
    );

    expect(result.current.shouldRenderField(fieldWithoutCondition)).toBe(true);
    expect(mockEvaluateCondition).not.toHaveBeenCalled();
  });

  it("should handle condition evaluation errors gracefully", () => {
    const watchedValues = { hasCompany: "yes" };
    const fieldWithCondition = mockFields[2]; // company field

    mockEvaluateCondition.mockImplementation(() => {
      throw new Error("Condition evaluation failed");
    });

    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const { result } = renderHook(() =>
      useFieldVisibility(mockFields, watchedValues),
    );

    // Should return true (show field) when evaluation fails
    expect(result.current.shouldRenderField(fieldWithCondition)).toBe(true);
    expect(consoleSpy).toHaveBeenCalledWith(
      "Error evaluating field condition:",
      expect.any(Error),
    );

    consoleSpy.mockRestore();
  });

  it("should update visibility when watched values change", () => {
    const initialValues = { hasCompany: "no" };
    const updatedValues = { hasCompany: "yes" };

    mockEvaluateCondition.mockImplementation((condition, values) => {
      if (condition.field === "hasCompany") {
        return values.hasCompany === "yes";
      }
      return true;
    });

    const { result, rerender } = renderHook(
      ({ values }) => useFieldVisibility(mockFields, values),
      {
        initialProps: { values: initialValues },
      },
    );

    expect(result.current.visibleFieldNames).toEqual(
      new Set(["firstName", "lastName"]),
    );

    rerender({ values: updatedValues });

    expect(result.current.visibleFieldNames).toEqual(
      new Set(["firstName", "lastName", "company"]),
    );
  });

  it("should handle empty fields array", () => {
    const { result } = renderHook(() => useFieldVisibility([], {}));

    expect(result.current.visibleFieldNames).toEqual(new Set());
    expect(result.current.visibleFields).toEqual([]);
    expect(typeof result.current.shouldRenderField).toBe("function");
  });

  it("should memoize visible fields when values and fields unchanged", () => {
    const watchedValues = { hasCompany: "yes" };
    mockEvaluateCondition.mockReturnValue(true);

    const { result, rerender } = renderHook(() =>
      useFieldVisibility(mockFields, watchedValues),
    );

    const firstVisibleFields = result.current.visibleFields;
    rerender();
    const secondVisibleFields = result.current.visibleFields;

    expect(firstVisibleFields).toBe(secondVisibleFields);
  });

  it("should memoize shouldRenderField function", () => {
    const watchedValues = { hasCompany: "yes" };
    mockEvaluateCondition.mockReturnValue(true);

    const { result, rerender } = renderHook(() =>
      useFieldVisibility(mockFields, watchedValues),
    );

    const firstShouldRender = result.current.shouldRenderField;
    rerender();
    const secondShouldRender = result.current.shouldRenderField;

    expect(firstShouldRender).toBe(secondShouldRender);
  });
});
