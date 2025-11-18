import React from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
  retryCount: number;
}

interface AdminErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error; retry: () => void; retryCount: number }>;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

class AdminErrorBoundary extends React.Component<AdminErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: AdminErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    });

    // Log error to monitoring service
    console.error("Admin Error Boundary caught an error:", error, errorInfo);

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Log error to external service in production
    if (process.env.NODE_ENV === 'production') {
      // You can integrate with error logging services like Sentry, LogRocket, etc.
      // Example: window.Sentry?.captureException(error, { contexts: { react: { componentStack: errorInfo.componentStack } } });
    }
  }

  handleRetry = () => {
    this.setState(prevState => ({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: prevState.retryCount + 1,
    }));
  };

  render() {
    if (this.state.hasError && this.state.error) {
      // If custom fallback is provided, use it
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return (
          <FallbackComponent 
            error={this.state.error} 
            retry={this.handleRetry}
            retryCount={this.state.retryCount}
          />
        );
      }

      // Default error UI
      return (
        <div className="min-h-[400px] flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <CardTitle className="text-red-800">Something went wrong</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert variant="destructive">
                <AlertTitle>Admin Panel Error</AlertTitle>
                <AlertDescription>
                  {this.state.error.message || "An unexpected error occurred in the admin panel"}
                </AlertDescription>
              </Alert>
              
              {this.state.errorInfo && (
                <div className="mt-4 p-3 bg-gray-50 rounded text-sm">
                  <h4 className="font-medium text-gray-800 mb-2">Error Details:</h4>
                  <div className="space-y-1 text-gray-600">
                    <p><strong>Component:</strong> {this.state.errorInfo.componentStack}</p>
                    <p><strong>Location:</strong> {this.state.error.componentStack || 'Unknown'}</p>
                    {this.state.retryCount > 0 && (
                      <p><strong>Retry attempts:</strong> {this.state.retryCount}</p>
                    )}
                  </div>
                </div>
              )}
              
              <div className="flex flex-col gap-2 mt-6">
                <Button
                  onClick={this.handleRetry}
                  className="w-full"
                  variant="outline"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Try Again
                </Button>
                
                <Button 
                  onClick={() => window.location.href = '/admin'}
                  variant="ghost"
                  className="w-full"
                >
                  Go to Admin Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

// Hook for using the error boundary
export const useAdminErrorBoundary = () => {
  const handleError = React.useCallback((error: Error, errorInfo: React.ErrorInfo) => {
    // Log to your error monitoring service
    console.error("Admin Error:", error, errorInfo);
    
    // You can add custom error handling here
    // For example, send to analytics, error tracking, etc.
  }, []);

  return { handleError };
};

// HOC for wrapping admin components
export const withAdminErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>
) => {
  const WrappedComponent = (props: P) => (
    <AdminErrorBoundary>
      <Component {...props} />
    </AdminErrorBoundary>
  );

  WrappedComponent.displayName = `withAdminErrorBoundary(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
};

export default AdminErrorBoundary;