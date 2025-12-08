import { renderHook } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useFormProcessing } from "./use-form-processing";
import type { RawFieldConfig, FieldConfig } from "@/components/renderer/types/data-driven-ui";

describe("useFormProcessing", () => {
  let mockIsRegisteredComponent: ReturnType<typeof vi.fn>;
  let mockMergeWithDefaults: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockIsRegisteredComponent = vi.fn();
    mockMergeWithDefaults = vi.fn();

    vi.mocked(require("@/components/renderer/ComponentRegistry")).isRegisteredComponent = mockIsRegisteredComponent;
    vi.mocked(require("@/configs/DefaultFieldConfig")).mergeWithDefaults = mockMergeWithDefaults;
  });

  it("should process fields with registered components", () => {
    const mockFields: RawFieldConfig[] = [
      {
        fieldName: "firstName",
        component: "Input",
        props: { label: "First Name" },
      },
      {
        fieldName: "email",
        component: "Input",
        props: { label: "Email", type: "email" },
      },
    ];

    mockIsRegisteredComponent.mockReturnValue(true);
    mockMergeWithDefaults.mockImplementation((_component: any, props: any) => ({
      ...props,
      placeholder: `Enter ${props.label}`,
    }));

    const { result } = renderHook(() => useFormProcessing(mockFields));

    expect(result.current.processedFields).toHaveLength(2);
    expect(mockIsRegisteredComponent).toHaveBeenCalledTimes(2);
    expect(mockMergeWithDefaults).toHaveBeenCalledTimes(2);
  });

  it("should filter out fields with unregistered components", () => {
    const mockFields: RawFieldConfig[] = [
      {
        fieldName: "firstName",
        component: "Input",
        props: { label: "First Name" },
      },
      {
        fieldName: "customField",
        component: "CustomComponent",
        props: { label: "Custom" },
      },
    ];

    mockIsRegisteredComponent.mockImplementation((component: any) => component === "Input");

    const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    const { result } = renderHook(() => useFormProcessing(mockFields));

    expect(result.current.processedFields).toHaveLength(1);
    expect(result.current.processedFields[0].fieldName).toBe("firstName");
    expect(consoleSpy).toHaveBeenCalledWith(
      'Component "CustomComponent" is not registered, skipping field "customField"'
    );

    consoleSpy.mockRestore();
  });

  it("should compute default values for fields", () => {
    const mockFields: RawFieldConfig[] = [
      {
        fieldName: "firstName",
        component: "Input",
        props: { label: "First Name" },
      },
      {
        fieldName: "agreeToTerms",
        component: "Checkbox",
        props: { label: "Agree to Terms" },
      },
      {
        fieldName: "age",
        component: "Slider",
        props: { label: "Age", defaultValue: 25 },
      },
      {
        fieldName: "requiredField",
        component: "Input",
        props: { label: "Required", validations: [{ type: "required" }] },
      },
    ];

    mockIsRegisteredComponent.mockReturnValue(true);
    mockMergeWithDefaults.mockImplementation((_component: any, props: any) => props);

    const { result } = renderHook(() => useFormProcessing(mockFields));

    expect(result.current.computedDefaultValues).toEqual({
      firstName: "",
      agreeToTerms: false,
      age: 25,
      requiredField: undefined,
    });
  });

  it("should use provided default values", () => {
    const mockFields: RawFieldConfig[] = [
      {
        fieldName: "firstName",
        component: "Input",
        props: { label: "First Name" },
      },
      {
        fieldName: "email",
        component: "Input",
        props: { label: "Email" },
      },
    ];

    mockIsRegisteredComponent.mockReturnValue(true);
    mockMergeWithDefaults.mockImplementation((_component: any, props: any) => props);

    const { result } = renderHook(() =>
      useFormProcessing(mockFields, {
        defaultValues: {
          firstName: "John",
          email: "john@example.com",
        },
      })
    );

    expect(result.current.computedDefaultValues).toEqual({
      firstName: "John",
      email: "john@example.com",
    });
  });

  it("should merge provided default values with computed defaults", () => {
    const mockFields: RawFieldConfig[] = [
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
        fieldName: "agreeToTerms",
        component: "Checkbox",
        props: { label: "Agree to Terms" },
      },
    ];

    mockIsRegisteredComponent.mockReturnValue(true);
    mockMergeWithDefaults.mockImplementation((_component: any, props: any) => props);

    const { result } = renderHook(() =>
      useFormProcessing(mockFields, {
        defaultValues: {
          firstName: "John",
        },
      })
    );

    expect(result.current.computedDefaultValues).toEqual({
      firstName: "John",
      lastName: "",
      agreeToTerms: false,
    });
  });

  it("should handle empty fields array", () => {
    const { result } = renderHook(() => useFormProcessing([]));

    expect(result.current.processedFields).toEqual([]);
    expect(result.current.computedDefaultValues).toEqual({});
  });

  it("should memoize processed fields", () => {
    const mockFields: RawFieldConfig[] = [
      {
        fieldName: "firstName",
        component: "Input",
        props: { label: "First Name" },
      },
    ];

    mockIsRegisteredComponent.mockReturnValue(true);
    mockMergeWithDefaults.mockImplementation((_component: any, props: any) => props);

    const { result, rerender } = renderHook(() => useFormProcessing(mockFields));

    const firstResult = result.current.processedFields;
    rerender();
    const secondResult = result.current.processedFields;

    expect(firstResult).toBe(secondResult);
  });

  it("should handle Switch component similar to Checkbox", () => {
    const mockFields: RawFieldConfig[] = [
      {
        fieldName: "notifications",
        component: "Switch",
        props: { label: "Enable Notifications" },
      },
    ];

    mockIsRegisteredComponent.mockReturnValue(true);
    mockMergeWithDefaults.mockImplementation((_component: any, props: any) => props);

    const { result } = renderHook(() => useFormProcessing(mockFields));

    expect(result.current.computedDefaultValues.notifications).toBe(false);
  });

  it("should preserve field properties after merging", () => {
    const mockFields: RawFieldConfig[] = [
      {
        fieldName: "email",
        component: "Input",
        props: { label: "Email", type: "email", required: true },
      },
    ];

    mockIsRegisteredComponent.mockReturnValue(true);
    mockMergeWithDefaults.mockImplementation((_component: any, props: any) => ({
      ...props,
      placeholder: `Enter ${props.label}`,
      customProp: "added",
    }));

    const { result } = renderHook(() => useFormProcessing(mockFields));

    const processedField = result.current.processedFields[0];
    expect(processedField).toEqual({
      fieldName: "email",
      component: "Input",
      props: {
        label: "Email",
        type: "email",
        required: true,
        placeholder: "Enter Email",
        customProp: "added",
      },
    });
  });
});