import { describe, it, expect } from "@jest/globals";
import { render, screen } from "@testing-library/react";
import InsuranceSkeleton from "./InsuranceSkeleton";

describe("InsuranceSkeleton", () => {
  it("renders skeleton loader for grid view", () => {
    render(<InsuranceSkeleton viewMode="grid" count={1} />);

    // Should render skeleton elements
    expect(screen.getAllByRole("generic").length).toBeGreaterThan(0);
  });

  it("renders skeleton loader for list view", () => {
    render(<InsuranceSkeleton viewMode="list" count={1} />);

    // Should render skeleton elements
    expect(screen.getAllByRole("generic").length).toBeGreaterThan(0);
  });

  it("renders skeleton loader for compact view", () => {
    render(<InsuranceSkeleton viewMode="compact" count={1} />);

    // Should render skeleton elements
    expect(screen.getAllByRole("generic").length).toBeGreaterThan(0);
  });

  it("renders correct number of skeletons", () => {
    render(<InsuranceSkeleton viewMode="grid" count={3} />);

    // Should have 3 skeleton cards
    const skeletonElements = document.querySelectorAll(".animate-pulse");
    expect(skeletonElements.length).toBe(3);
  });

  it("applies custom className", () => {
    const customClass = "custom-skeleton-class";
    render(<InsuranceSkeleton className={customClass} />);

    const container = document.querySelector(".custom-skeleton-class");
    expect(container).toBeInTheDocument();
  });

  it("hides compare button when showCompareButton is false", () => {
    render(<InsuranceSkeleton showCompareButton={false} viewMode="grid" />);

    // Should not find any compare button placeholders
    const compareButtons = document.querySelectorAll(".h-8.w-8.bg-gray-200");
    expect(compareButtons.length).toBe(0);
  });
});
