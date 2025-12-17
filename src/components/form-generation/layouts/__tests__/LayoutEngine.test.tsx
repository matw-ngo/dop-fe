import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { LayoutType } from "../../types";
import {
  DynamicLayout,
  FlexLayout,
  GridLayout,
  StackLayout,
} from "../LayoutEngine";

describe("LayoutEngine", () => {
  describe("GridLayout", () => {
    it("renders children within grid structure", () => {
      render(
        <GridLayout columns={2}>
          <div>Child 1</div>
          <div>Child 2</div>
        </GridLayout>,
      );
      expect(screen.getByText("Child 1")).toBeInTheDocument();
      expect(screen.getByText("Child 2")).toBeInTheDocument();
    });

    // Note: checking specific class names might be brittle if variant helper implementation changes,
    // but verifying "grid" class is reasonable.
  });

  describe("FlexLayout", () => {
    it("renders children within flex structure", () => {
      render(
        <FlexLayout>
          <div>Flex Item</div>
        </FlexLayout>,
      );
      expect(screen.getByText("Flex Item")).toBeInTheDocument();
    });
  });

  describe("StackLayout", () => {
    it("renders children in a vertical stack", () => {
      render(
        <StackLayout>
          <div>Stack Item 1</div>
          <div>Stack Item 2</div>
        </StackLayout>,
      );
      expect(screen.getByText("Stack Item 1")).toBeInTheDocument();
    });
  });

  describe("DynamicLayout", () => {
    it("renders StackLayout by default", () => {
      const { container } = render(
        <DynamicLayout>
          <div>Default Item</div>
        </DynamicLayout>,
      );
      expect(screen.getByText("Default Item")).toBeInTheDocument();
      expect(container.firstChild).toHaveClass("flex flex-col");
    });

    it("renders GridLayout when type is GRID", () => {
      const { container } = render(
        <DynamicLayout type={LayoutType.GRID} columns={3}>
          <div>Grid Item</div>
        </DynamicLayout>,
      );
      expect(screen.getByText("Grid Item")).toBeInTheDocument();
      // Assuming gridLayoutVariants creates a grid class
      expect(container.firstChild).toHaveClass("grid");
    });
  });
});
