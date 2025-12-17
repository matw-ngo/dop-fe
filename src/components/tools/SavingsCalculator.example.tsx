import type React from "react";
import { SavingsCalculator } from "./SavingsCalculator";

/**
 * Example usage of the SavingsCalculator component
 *
 * This example demonstrates how to integrate the savings calculator
 * into a page or layout component.
 */
export const SavingsCalculatorExample: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Financial Tools</h1>
        <p className="mt-2 text-muted-foreground">
          Compare savings rates and find the best options for your money
        </p>
      </div>

      <SavingsCalculator />
    </div>
  );
};

export default SavingsCalculatorExample;
