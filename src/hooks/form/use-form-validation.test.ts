import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { z } from "zod";
import type { FieldConfig } from "@/components/renderer/types/data-driven-ui";
import { useFormValidation } from "./use-form-validation";

// Mock dependencies
vi.mock("@hookform/resolvers/zod", () => ({
  zodResolver: vi.fn(),
}));

vi.mock("@/components/renderer/builders/zod-generator", () => ({
  generateZodSchema: vi.fn(),
}));

vi.mock("@/components/renderer/types/field-conditions", () => ({
  evaluateCondition: vi.fn(),
}));

describe("useFormValidation", () => {
  const mockZodResolver = vi.mocked(
    require("@hookform/resolvers/zod").zodResolver,
  );
  const mockGenerateZodSchema = vi.mocked(
    require("@/components/renderer/builders/zod-generator").generateZodSchema,
  );
  const mockEvaluateCondition = vi.mocked(
    require("@/components/renderer/types/field-conditions").evaluateCondition,
  );

  const mockFields: FieldConfig[] = [
    {
      fieldName: "firstName",
      component: "Input",
      props: {
        label: "First Name",
        validations: [{ type: "required" }],
      },
    },
    {
      fieldName: "email",
      component: "Input",
      props: {
        label: "Email",
        validations: [
          { type: "required" },
          { type: "pattern", value: "email", message: "Invalid email" },
        ],
      },
    },
    {
      fieldName: "age",
      component: "Input",
      props: {
        label: "Age",
        condition: {
          type: "field",
          field: "showAge",
          operator: "equals",
          value: "yes",
        },
        validations: [{ type: "min", value: 18 }],
      },
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    mockGenerateZodSchema.mockReturnValue({} as z.ZodSchema);
    mockZodResolver.mockReturnValue(async (values: any) => ({
      values,
      errors: {},
    }));
  });

  it("should create resolver with validation mode", () => {
    const { result } = renderHook(() =>
      useFormValidation(mockFields, vi.fn(), {
        validateOnChange: true,
      }),
    );

    expect(result.current.mode).toBe("onChange");
    expect(typeof result.current.resolver).toBe("function");
    expect(mockGenerateZodSchema).toHaveBeenCalledWith(
      mockFields,
      expect.any(Function),
    );
  });

  it("should set mode to onBlur when validateOnBlur is true", () => {
    const { result } = renderHook(() =>
      useFormValidation(mockFields, vi.fn(), {
        validateOnChange: false,
        validateOnBlur: true,
      }),
    );

    expect(result.current.mode).toBe("onBlur");
  });

  it("should set mode to onSubmit when both validateOnChange and validateOnBlur are false", () => {
    const { result } = renderHook(() =>
      useFormValidation(mockFields, vi.fn(), {
        validateOnChange: false,
        validateOnBlur: false,
      }),
    );

    expect(result.current.mode).toBe("onSubmit");
  });

  it("should generate form schema", () => {
    const mockSchema = {} as z.ZodSchema;
    mockGenerateZodSchema.mockReturnValue(mockSchema);

    const { result } = renderHook(() => useFormValidation(mockFields, vi.fn()));

    expect(result.current.formSchema).toBe(mockSchema);
  });

  it("should create resolver that filters visible fields", async () => {
    const mockValues = { firstName: "John", email: "", showAge: "no" };
    mockEvaluateCondition.mockImplementation((condition, values) => {
      if (condition.field === "showAge") {
        return values.showAge === "yes";
      }
      return true;
    });

    const mockResolver = vi
      .fn()
      .mockResolvedValue({ values: mockValues, errors: {} });
    mockZodResolver.mockReturnValue(mockResolver);

    const { result } = renderHook(() => useFormValidation(mockFields, vi.fn()));

    // Call the resolver
    await result.current.resolver(mockValues, {}, {});

    // Should evaluate conditions for all fields
    expect(mockEvaluateCondition).toHaveBeenCalledTimes(mockFields.length);

    // Should only validate visible fields (firstName and email, not age)
    expect(mockGenerateZodSchema).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ fieldName: "firstName" }),
        expect.objectContaining({ fieldName: "email" }),
      ]),
      expect.any(Function),
    );
  });

  it("should include fields without conditions", async () => {
    const mockValues = { firstName: "John", email: "john@example.com" };
    mockEvaluateCondition.mockReturnValue(true);

    const mockResolver = vi
      .fn()
      .mockResolvedValue({ values: mockValues, errors: {} });
    mockZodResolver.mockReturnValue(mockResolver);

    const { result } = renderHook(() => useFormValidation(mockFields, vi.fn()));

    await result.current.resolver(mockValues, {}, {});

    // Should include fields without conditions
    const visibleFields = mockGenerateZodSchema.mock
      .calls[1][0] as FieldConfig[];
    expect(visibleFields).toHaveLength(3);
  });

  it("should handle condition evaluation errors gracefully", async () => {
    const mockValues = { firstName: "John" };
    mockEvaluateCondition.mockImplementation(() => {
      throw new Error("Condition evaluation failed");
    });

    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const mockResolver = vi
      .fn()
      .mockResolvedValue({ values: mockValues, errors: {} });
    mockZodResolver.mockReturnValue(mockResolver);

    const { result } = renderHook(() => useFormValidation(mockFields, vi.fn()));

    await result.current.resolver(mockValues, {}, {});

    // Should still include fields even if condition evaluation fails
    expect(mockGenerateZodSchema).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ fieldName: "firstName" }),
        expect.objectContaining({ fieldName: "email" }),
        expect.objectContaining({ fieldName: "age" }),
      ]),
      expect.any(Function),
    );

    consoleSpy.mockRestore();
  });

  it("should use default options", () => {
    const { result } = renderHook(() => useFormValidation(mockFields, vi.fn()));

    expect(result.current.mode).toBe("onBlur");
  });

  it("should memoize resolver", () => {
    const { result, rerender } = renderHook(() =>
      useFormValidation(mockFields, vi.fn()),
    );

    const firstResolver = result.current.resolver;
    rerender();
    const secondResolver = result.current.resolver;

    expect(firstResolver).toBe(secondResolver);
  });

  it("should memoize form schema", () => {
    const { result, rerender } = renderHook(() =>
      useFormValidation(mockFields, vi.fn()),
    );

    const firstSchema = result.current.formSchema;
    rerender();
    const secondSchema = result.current.formSchema;

    expect(firstSchema).toBe(secondSchema);
  });

  it("should pass translation function to schema generation", () => {
    const mockT = vi.fn((key: string) => `Translated: ${key}`);
    const mockSchema = {} as z.ZodSchema;
    mockGenerateZodSchema.mockReturnValue(mockSchema);

    renderHook(() => useFormValidation(mockFields, mockT));

    expect(mockGenerateZodSchema).toHaveBeenCalledWith(mockFields, mockT);
  });
});
