import { beforeEach, describe, expect, it, vi } from "vitest";
import type {
  ComponentVariant,
  LayoutProps,
  ResponsiveValue,
} from "../types/ui-theme";
import { useFormClassNames } from "./form-class-names";

// Mock dependencies
vi.mock("@/components/renderer/constants/responsive-classnames", () => ({
  getResponsiveClasses: vi.fn(),
}));

describe("useFormClassNames", () => {
  const mockGetResponsiveClasses = vi.mocked(
    require("@/components/renderer/constants/responsive-classnames")
      .getResponsiveClasses,
  );

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return default form classes for grid layout", () => {
    const result = useFormClassNames({
      layout: "grid",
    });

    expect(result.formClasses).toContain("grid gap-4 w-full grid-cols-1");
    expect(result.formClasses).toContain("md:grid-cols-2");
    expect(result.formClasses).toContain("lg:grid-cols-3");
    expect(result.formClasses).not.toContain("space-y-6");
  });

  it("should return space-y classes for non-grid layouts", () => {
    const result = useFormClassNames({
      layout: "block",
    });

    expect(result.formClasses).toContain("space-y-6");
    expect(result.formClasses).not.toContain("grid");
  });

  it("should apply custom className", () => {
    const result = useFormClassNames({
      className: "custom-form-class",
      layout: "flex",
    });

    expect(result.formClasses).toContain("custom-form-class");
    expect(result.formClasses).toContain("space-y-6");
  });

  it("should apply responsive form classes", () => {
    mockGetResponsiveClasses.mockReturnValue("md:w-full lg:w-1/2");

    const result = useFormClassNames({
      responsive: {
        form: {
          base: "w-full",
          md: "w-1/2",
          lg: "w-1/3",
        } as ResponsiveValue<string>,
      },
    });

    expect(result.formResponsiveClasses).toBe("md:w-full lg:w-1/2");
    expect(result.formClasses).toContain("md:w-full lg:w-1/2");
    expect(mockGetResponsiveClasses).toHaveBeenCalledWith(
      { base: "w-full", md: "w-1/2", lg: "w-1/3" },
      expect.any(Function),
    );
  });

  it("should handle responsive fields classes", () => {
    mockGetResponsiveClasses.mockReturnValue("md:grid-cols-2 lg:grid-cols-4");

    const _result = useFormClassNames({
      responsive: {
        fields: { base: 1, md: 2, lg: 4 } as ResponsiveValue<number>,
      },
    });

    expect(mockGetResponsiveClasses).toHaveBeenCalledWith(
      { base: 1, md: 2, lg: 4 },
      expect.any(Function),
    );
  });

  it("should apply variant classes", () => {
    const variant: ComponentVariant = {
      size: "lg",
      color: "primary",
      variant: "outlined",
    };

    const result = useFormClassNames({
      variant,
      layout: "flex",
    });

    expect(result.formVariantClasses).toBe(
      "form-lg form-primary form-outlined",
    );
    expect(result.formClasses).toContain("form-lg");
    expect(result.formClasses).toContain("form-primary");
    expect(result.formClasses).toContain("form-outlined");
  });

  it("should apply layout classes as string", () => {
    const result = useFormClassNames({
      layout: "flex flex-col gap-4",
    });

    expect(result.formLayoutClasses).toBe("flex flex-col gap-4");
    expect(result.formClasses).toContain("flex flex-col gap-4");
  });

  it("should apply layout classes as object", () => {
    const layout: LayoutProps = {
      display: "flex",
      direction: "col",
      justify: "center",
      align: "start",
      gap: 4,
      padding: "p-4",
      margin: "m-2",
    };

    const result = useFormClassNames({
      layout,
    });

    expect(result.formLayoutClasses).toBe(
      "flex justify-center items-start flex-col gap-4 p-4 m-2",
    );
    expect(result.formClasses).toContain("flex");
    expect(result.formClasses).toContain("justify-center");
    expect(result.formClasses).toContain("items-start");
    expect(result.formClasses).toContain("flex-col");
    expect(result.formClasses).toContain("gap-4");
    expect(result.formClasses).toContain("p-4");
    expect(result.formClasses).toContain("m-2");
  });

  it("should handle partial layout object", () => {
    const layout: LayoutProps = {
      display: "grid",
      gap: 6,
    };

    const result = useFormClassNames({
      layout,
    });

    expect(result.formLayoutClasses).toBe("grid gap-6");
    expect(result.formClasses).toContain("grid gap-6");
  });

  it("should combine all classes correctly", () => {
    mockGetResponsiveClasses.mockReturnValue("md:w-1/2");

    const options = {
      className: "my-form",
      variant: { size: "sm", color: "secondary" } as ComponentVariant,
      responsive: {
        form: { base: "w-full", md: "w-1/2" } as ResponsiveValue<string>,
      },
      layout: {
        display: "flex",
        gap: 4,
      } as LayoutProps,
    };

    const result = useFormClassNames(options);

    expect(result.formClasses).toContain("space-y-6"); // Default for non-grid
    expect(result.formClasses).toContain("md:w-1/2"); // Responsive
    expect(result.formClasses).toContain("flex"); // Layout display
    expect(result.formClasses).toContain("gap-4"); // Layout gap
    expect(result.formClasses).toContain("form-sm"); // Variant size
    expect(result.formClasses).toContain("form-secondary"); // Variant color
    expect(result.formClasses).toContain("my-form"); // Custom className
  });

  it("should return individual class properties", () => {
    mockGetResponsiveClasses.mockReturnValue("responsive-class");
    const variant = { size: "lg" } as ComponentVariant;
    const layout = { display: "flex" } as LayoutProps;

    const result = useFormClassNames({
      className: "custom",
      variant,
      responsive: { form: { base: "base-class" } as ResponsiveValue<string> },
      layout,
    });

    expect(result.formClasses).toBeDefined();
    expect(result.formResponsiveClasses).toBe("responsive-class");
    expect(result.formLayoutClasses).toBe("flex");
    expect(result.formVariantClasses).toBe("form-lg");
  });

  it("should handle empty options", () => {
    const result = useFormClassNames({});

    expect(result.formClasses).toContain("space-y-6");
    expect(result.formResponsiveClasses).toBe("");
    expect(result.formLayoutClasses).toBe("");
    expect(result.formVariantClasses).toBe("");
  });

  it("should not apply grid classes when layout is not 'grid'", () => {
    const result = useFormClassNames({
      layout: { display: "grid" } as LayoutProps,
    });

    expect(result.formClasses).toContain("space-y-6");
    expect(result.formClasses).toContain("grid");
    expect(result.formClasses).not.toContain("grid-cols-1");
    expect(result.formClasses).not.toContain("md:grid-cols-2");
    expect(result.formClasses).not.toContain("lg:grid-cols-3");
  });
});
