"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  CalculatorAsyncErrorHandler,
  CalculatorErrorBoundary,
  useCalculatorErrorHandler,
} from "./ErrorBoundary";

// Demo component that can throw errors
const FaultyCalculator = ({ shouldThrow }: { shouldThrow: boolean }) => {
  const { error, handleError, clearError } =
    useCalculatorErrorHandler("Demo Calculator");

  if (shouldThrow) {
    throw new Error("Simulated calculator error!");
  }

  return (
    <div>
      <p>This calculator is working properly!</p>

      {/* Simulate async error */}
      <Button
        onClick={() => {
          try {
            // Simulate an async operation that might fail
            throw new Error("Async calculation failed!");
          } catch (err) {
            handleError(
              err instanceof Error ? err : new Error("Unknown error"),
            );
          }
        }}
        className="mt-4"
      >
        Trigger Async Error
      </Button>

      <CalculatorAsyncErrorHandler
        error={error}
        onRetry={() => clearError()}
        onDismiss={clearError}
        calculatorName="Demo Calculator"
      />
    </div>
  );
};

// Demo component showing error boundary in action
export const ErrorBoundaryDemo = () => {
  const [shouldThrow, setShouldThrow] = useState(false);

  return (
    <div className="p-8 space-y-8">
      <h1 className="text-2xl font-bold">Error Boundary Demo</h1>

      <Card>
        <CardHeader>
          <CardTitle>Error Boundary Protection</CardTitle>
          <CardDescription>
            This demonstrates how the error boundary protects the app from
            crashing.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={() => setShouldThrow(!shouldThrow)}
            variant={shouldThrow ? "destructive" : "default"}
          >
            {shouldThrow ? "Fix Calculator" : "Break Calculator"}
          </Button>

          <CalculatorErrorBoundary calculatorName="Demo Calculator">
            <FaultyCalculator shouldThrow={shouldThrow} />
          </CalculatorErrorBoundary>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Other Content</CardTitle>
          <CardDescription>
            This content remains unaffected by errors in the calculator above.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>
            The error boundary isolates errors to specific components,
            preventing them from crashing the entire application.
          </p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Errors are caught and displayed gracefully</li>
            <li>Error logging captures details for debugging</li>
            <li>Users can retry or recover from errors</li>
            <li>The rest of the app continues to work</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default ErrorBoundaryDemo;
