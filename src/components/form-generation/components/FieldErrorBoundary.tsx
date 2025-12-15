/**
 * Form Generation Library - Field Error Boundary
 *
 * Error boundary to catch and handle field rendering errors
 */

"use client";

import React, { Component, type ReactNode } from "react";
import { AlertTriangle } from "lucide-react";

interface Props {
  /**
   * Field content to render
   */
  children: ReactNode;

  /**
   * Field ID for error tracking
   */
  fieldId: string;

  /**
   * Custom fallback UI
   */
  fallback?: ReactNode;

  /**
   * Callback when error occurs
   */
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
}

/**
 * Error boundary for field components
 *
 * Prevents individual field errors from crashing the entire form
 */
export class FieldErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error for monitoring
    console.error("[FieldErrorBoundary] Field rendering error:", {
      fieldId: this.props.fieldId,
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
    });

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="p-4 border border-destructive rounded-md bg-destructive/10">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-destructive">
                Failed to render field
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Field ID: {this.props.fieldId}
              </p>
              {this.state.error && (
                <details className="mt-2">
                  <summary className="text-xs text-muted-foreground cursor-pointer">
                    Error details
                  </summary>
                  <pre className="text-xs mt-1 p-2 bg-muted rounded overflow-auto">
                    {this.state.error.message}
                  </pre>
                </details>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
