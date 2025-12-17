"use client";

import { AlertTriangleIcon, RefreshCwIcon } from "lucide-react";
import React, { Component, type ErrorInfo, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface RetryableErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  maxRetries?: number;
  retryDelay?: number;
}

interface RetryableErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  retryCount: number;
}

export class RetryableErrorBoundary extends Component<
  RetryableErrorBoundaryProps,
  RetryableErrorBoundaryState
> {
  private retryTimeoutId: NodeJS.Timeout | null = null;

  constructor(props: RetryableErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0,
    };
  }

  static getDerivedStateFromError(
    error: Error,
  ): Partial<RetryableErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    });

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Log error to console for debugging
    console.error("RetryableErrorBoundary caught an error:", error, errorInfo);
  }

  handleRetry = () => {
    const { maxRetries = 3, retryDelay = 1000 } = this.props;
    const { retryCount } = this.state;

    if (retryCount < maxRetries) {
      // Clear any existing retry timeout
      if (this.retryTimeoutId) {
        clearTimeout(this.retryTimeoutId);
      }

      // Add delay before retry to prevent rapid retries
      this.retryTimeoutId = setTimeout(() => {
        this.setState({
          hasError: false,
          error: null,
          errorInfo: null,
          retryCount: retryCount + 1,
        });
      }, retryDelay);
    }
  };

  handleReset = () => {
    // Clear any existing retry timeout
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId);
    }

    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0,
    });
  };

  componentWillUnmount() {
    // Clear retry timeout on unmount
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId);
    }
  }

  render() {
    const { hasError, error, errorInfo, retryCount } = this.state;
    const { children, fallback, maxRetries = 3 } = this.props;

    if (hasError && error) {
      // Use custom fallback if provided
      if (fallback) {
        return fallback;
      }

      const canRetry = retryCount < maxRetries;
      const isLastRetry = retryCount >= maxRetries - 1;

      return (
        <Card className="mx-auto max-w-lg">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <AlertTriangleIcon className="h-12 w-12 text-destructive mb-4" />

            <h3 className="text-lg font-semibold mb-2">Something went wrong</h3>

            <p className="text-sm text-muted-foreground mb-6">
              {error.message || "An unexpected error occurred"}
            </p>

            {process.env.NODE_ENV === "development" && errorInfo && (
              <details className="text-left text-xs text-muted-foreground mb-4 p-4 bg-muted rounded">
                <summary className="cursor-pointer font-medium mb-2">
                  Error Details (Development Only)
                </summary>
                <pre className="whitespace-pre-wrap">
                  <code>{errorInfo.componentStack}</code>
                </pre>
              </details>
            )}

            <div className="flex gap-2">
              {canRetry && (
                <Button onClick={this.handleRetry}>
                  <RefreshCwIcon className="mr-2 h-4 w-4" />
                  {isLastRetry
                    ? "Last Retry"
                    : `Retry (${retryCount + 1}/${maxRetries})`}
                </Button>
              )}

              <Button variant="outline" onClick={this.handleReset}>
                Reset
              </Button>
            </div>

            {retryCount > 0 && (
              <p className="text-xs text-muted-foreground mt-4">
                Retry attempt {retryCount} of {maxRetries}
              </p>
            )}
          </CardContent>
        </Card>
      );
    }

    return children;
  }
}

// Higher-order component for easier usage
export function withRetryableErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<RetryableErrorBoundaryProps, "children">,
) {
  const WrappedComponent = (props: P) => (
    <RetryableErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </RetryableErrorBoundary>
  );

  WrappedComponent.displayName = `withRetryableErrorBoundary(${
    Component.displayName || Component.name || "Component"
  })`;

  return WrappedComponent;
}

// Hook for programmatic retry
export function useRetryableError() {
  const [retryState, setRetryState] = React.useState({
    hasError: false,
    error: null as Error | null,
    retryCount: 0,
  });

  const retry = React.useCallback(() => {
    setRetryState((prev) => ({
      ...prev,
      hasError: false,
      error: null,
      retryCount: prev.retryCount + 1,
    }));
  }, []);

  const reset = React.useCallback(() => {
    setRetryState({
      hasError: false,
      error: null,
      retryCount: 0,
    });
  }, []);

  const setError = React.useCallback((error: Error) => {
    setRetryState((prev) => ({
      ...prev,
      hasError: true,
      error,
    }));
  }, []);

  return {
    ...retryState,
    retry,
    reset,
    setError,
  };
}
