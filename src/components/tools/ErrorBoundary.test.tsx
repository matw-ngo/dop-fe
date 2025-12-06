import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { CalculatorErrorBoundary } from "./ErrorBoundary";

// Mock fetch API
global.fetch = vi.fn().mockResolvedValue({ ok: true });

// Mock console.error to prevent test output pollution
const originalError = console.error;
beforeAll(() => {
  console.error = vi.fn();
});

afterAll(() => {
  console.error = originalError;
});

describe("CalculatorErrorBoundary", () => {
  it("renders children when there is no error", () => {
    const ChildComponent = () => <div>Test Content</div>;

    render(
      <CalculatorErrorBoundary>
        <ChildComponent />
      </CalculatorErrorBoundary>,
    );

    expect(screen.getByText("Test Content")).toBeInTheDocument();
  });

  it("catches errors and displays error UI", () => {
    const ThrowError = () => {
      throw new Error("Test error");
    };

    render(
      <CalculatorErrorBoundary>
        <ThrowError />
      </CalculatorErrorBoundary>,
    );

    expect(screen.getByText("Calculator Error")).toBeInTheDocument();
    expect(
      screen.getByText(/This calculator encountered an error/),
    ).toBeInTheDocument();
  });

  it("displays calculator name in error message", () => {
    const ThrowError = () => {
      throw new Error("Test error");
    };

    render(
      <CalculatorErrorBoundary calculatorName="Test Calculator">
        <ThrowError />
      </CalculatorErrorBoundary>,
    );

    expect(
      screen.getByText(/The Test Calculator encountered an error/),
    ).toBeInTheDocument();
  });

  it("displays error details in development mode", () => {
    const originalEnv = process.env.NODE_ENV;
    (process.env as any).NODE_ENV = "development";

    const ThrowError = () => {
      throw new Error("Test error");
    };

    render(
      <CalculatorErrorBoundary>
        <ThrowError />
      </CalculatorErrorBoundary>,
    );

    expect(screen.getByText("Error:")).toBeInTheDocument();
    expect(screen.getByText("Test error")).toBeInTheDocument();

    (process.env as any).NODE_ENV = originalEnv;
  });

  it("hides error details in production mode", () => {
    const originalEnv = process.env.NODE_ENV;
    (process.env as any).NODE_ENV = "production";

    const ThrowError = () => {
      throw new Error("Test error");
    };

    render(
      <CalculatorErrorBoundary>
        <ThrowError />
      </CalculatorErrorBoundary>,
    );

    expect(screen.queryByText("Error:")).not.toBeInTheDocument();
    expect(screen.queryByText("Test error")).not.toBeInTheDocument();

    (process.env as any).NODE_ENV = originalEnv;
  });

  it("resets error when Try Again button is clicked", async () => {
    const user = userEvent.setup();
    let shouldThrow = true;

    const ThrowError = () => {
      if (shouldThrow) {
        throw new Error("Test error");
      }
      return <div>Recovered Content</div>;
    };

    const { rerender } = render(
      <CalculatorErrorBoundary>
        <ThrowError />
      </CalculatorErrorBoundary>,
    );

    expect(screen.getByText("Calculator Error")).toBeInTheDocument();

    // Click Try Again button
    const tryAgainButton = screen.getByRole("button", { name: /try again/i });
    await user.click(tryAgainButton);

    // Simulate component recovery
    shouldThrow = false;
    rerender(
      <CalculatorErrorBoundary>
        <ThrowError />
      </CalculatorErrorBoundary>,
    );

    expect(screen.getByText("Recovered Content")).toBeInTheDocument();
  });

  it("calls custom error handler when provided", () => {
    const onError = vi.fn();
    const ThrowError = () => {
      throw new Error("Test error");
    };

    render(
      <CalculatorErrorBoundary onError={onError}>
        <ThrowError />
      </CalculatorErrorBoundary>,
    );

    expect(onError).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({
        componentStack: expect.any(String),
      }),
    );
  });

  it("displays custom fallback when provided", () => {
    const ThrowError = () => {
      throw new Error("Test error");
    };

    const CustomFallback = <div>Custom Error Message</div>;

    render(
      <CalculatorErrorBoundary fallback={CustomFallback}>
        <ThrowError />
      </CalculatorErrorBoundary>,
    );

    expect(screen.getByText("Custom Error Message")).toBeInTheDocument();
    expect(screen.queryByText("Calculator Error")).not.toBeInTheDocument();
  });

  it("generates unique error ID", () => {
    const ThrowError = () => {
      throw new Error("Test error");
    };

    render(
      <CalculatorErrorBoundary>
        <ThrowError />
      </CalculatorErrorBoundary>,
    );

    const errorIdPattern = /\$\d+/;
    const errorIdText = screen.getByText(errorIdPattern);
    expect(errorIdText).toBeInTheDocument();
  });
});
