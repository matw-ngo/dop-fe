"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AlertTriangle, RefreshCw, Calculator } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  calculatorName?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class CalculatorErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to console in development
    console.error(
      `Calculator Error Boundary caught an error in ${this.props.calculatorName || "calculator"}:`,
      error,
      errorInfo,
    );

    // Log to monitoring service in production
    if (process.env.NODE_ENV === "production") {
      this.logErrorToService(error, errorInfo);
    }

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);

    this.setState({
      error,
      errorInfo,
    });
  }

  logErrorToService(error: Error, errorInfo: ErrorInfo) {
    // In production, send to error monitoring service
    try {
      const errorData = {
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        calculatorName: this.props.calculatorName || "unknown",
        timestamp: new Date().toISOString(),
        userAgent:
          typeof navigator !== "undefined" ? navigator.userAgent : "server",
        url: typeof window !== "undefined" ? window.location.href : "server",
      };

      // Send to monitoring service
      fetch("/api/v1/errors/log", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(errorData),
      }).catch((loggingError) => {
        console.error("Failed to log calculator error:", loggingError);
      });
    } catch (loggingError) {
      console.error("Error logging service failed:", loggingError);
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  handleReload = () => {
    if (typeof window !== "undefined") {
      window.location.reload();
    }
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default calculator error UI
      return (
        <div className="min-h-[400px] flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-4">
                <Calculator className="w-6 h-6 text-orange-600" />
              </div>
              <CardTitle className="text-orange-900">
                Calculator Error
              </CardTitle>
              <CardDescription>
                {this.props.calculatorName
                  ? `The ${this.props.calculatorName} encountered an error.`
                  : "This calculator encountered an error."}
                Please try again or contact support if the problem persists.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Show error details in development */}
              {process.env.NODE_ENV === "development" && this.state.error && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="mt-2">
                      <strong>Error:</strong> {this.state.error.message}
                    </div>
                    {this.state.error.stack && (
                      <details className="mt-2">
                        <summary className="cursor-pointer">
                          Stack trace
                        </summary>
                        <pre className="mt-2 text-xs overflow-auto max-h-32 bg-red-50 p-2 rounded">
                          {this.state.error.stack}
                        </pre>
                      </details>
                    )}
                  </AlertDescription>
                </Alert>
              )}

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={this.handleReset}
                  className="flex-1"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Try Again
                </Button>
                <Button onClick={this.handleReload} className="flex-1">
                  Reload Page
                </Button>
              </div>

              <div className="text-center text-sm text-muted-foreground">
                <p>Error ID: ${Date.now()}</p>
                <p className="mt-1">
                  Contact support with this error ID if the problem continues.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * HOC to wrap calculator components with error boundary
 */
export const withCalculatorErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  calculatorName?: string,
  errorBoundaryProps?: Omit<Props, "children" | "calculatorName">,
) => {
  const WrappedComponent = (props: P) => (
    <CalculatorErrorBoundary
      calculatorName={calculatorName}
      {...errorBoundaryProps}
    >
      <Component {...props} />
    </CalculatorErrorBoundary>
  );

  WrappedComponent.displayName = `withCalculatorErrorBoundary(${Component.displayName || Component.name})`;

  return WrappedComponent;
};

/**
 * Hook for handling async errors in calculator components
 */
export const useCalculatorErrorHandler = (calculatorName?: string) => {
  const [error, setError] = React.useState<Error | null>(null);

  const handleError = React.useCallback(
    (error: Error) => {
      console.error(`Async error in ${calculatorName || "calculator"}:`, error);
      setError(error);

      // Log to monitoring service in production
      if (process.env.NODE_ENV === "production") {
        const errorData = {
          message: error.message,
          stack: error.stack,
          calculatorName,
          timestamp: new Date().toISOString(),
          userAgent:
            typeof navigator !== "undefined" ? navigator.userAgent : "server",
          url: typeof window !== "undefined" ? window.location.href : "server",
        };

        fetch("/api/v1/errors/log", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(errorData),
        }).catch((loggingError) => {
          console.error("Failed to log async calculator error:", loggingError);
        });
      }
    },
    [calculatorName],
  );

  const clearError = React.useCallback(() => {
    setError(null);
  }, []);

  return {
    error,
    handleError,
    clearError,
  };
};

/**
 * Component to handle async operation errors in calculators
 */
export const CalculatorAsyncErrorHandler: React.FC<{
  error: Error | null;
  onRetry?: () => void;
  onDismiss?: () => void;
  calculatorName?: string;
}> = ({ error, onRetry, onDismiss, calculatorName }) => {
  if (!error) return null;

  return (
    <Alert variant="destructive" className="mb-4">
      <AlertTriangle className="h-4 w-4" />
      <AlertDescription>
        <div className="flex items-center justify-between">
          <span>
            {calculatorName && `${calculatorName}: `}
            {error.message}
          </span>
          <div className="flex gap-2 ml-4">
            {onRetry && (
              <Button variant="outline" size="sm" onClick={onRetry}>
                Retry
              </Button>
            )}
            {onDismiss && (
              <Button variant="outline" size="sm" onClick={onDismiss}>
                Dismiss
              </Button>
            )}
          </div>
        </div>
      </AlertDescription>
    </Alert>
  );
};
