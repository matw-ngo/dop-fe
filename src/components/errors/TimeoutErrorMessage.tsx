/**
 * Timeout Error Message Component
 *
 * Displays user-friendly timeout error messages with retry functionality.
 * Supports localization and provides context-specific error information.
 *
 * @feature 002-configurable-api-timeout
 * @module TimeoutErrorMessage
 */

import React from "react";
import { AlertCircle, RefreshCw, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import type { TimeoutError } from "@/lib/api/timeouts/types";
import {
  formatErrorDetails,
  isRetryableTimeoutError,
} from "@/lib/api/timeouts/error-handler";
import { formatDuration } from "@/lib/api/timeouts/utils";

export interface TimeoutErrorMessageProps {
  /** The timeout error to display */
  error: TimeoutError;

  /** Locale for messages ('en' or 'vi') */
  locale?: "en" | "vi";

  /** Callback for retry action */
  onRetry?: () => void;

  /** Callback for dismiss action */
  onDismiss?: () => void;

  /** Whether to show detailed error information */
  showDetails?: boolean;

  /** Additional CSS class names */
  className?: string;
}

/**
 * TimeoutErrorMessage Component
 *
 * Displays a user-friendly error message when a timeout occurs.
 * Includes retry button if the error is retryable.
 *
 * @example
 * ```tsx
 * <TimeoutErrorMessage
 *   error={timeoutError}
 *   locale="en"
 *   onRetry={() => retryRequest()}
 *   onDismiss={() => setError(null)}
 *   showDetails={true}
 * />
 * ```
 */
export function TimeoutErrorMessage({
  error,
  locale = "en",
  onRetry,
  onDismiss,
  showDetails = false,
  className = "",
}: TimeoutErrorMessageProps) {
  const details = formatErrorDetails(error, locale);
  const canRetry = isRetryableTimeoutError(error) && onRetry;

  // Load localized messages
  const messages = getLocalizedMessages(locale);

  return (
    <Alert variant="destructive" className={`relative ${className}`}>
      <AlertCircle className="h-4 w-4" />

      <div className="flex-1">
        <AlertTitle>{details.title}</AlertTitle>
        <AlertDescription className="mt-2">
          <div className="flex flex-col gap-2">
            <p>{details.message}</p>

            {canRetry && (
              <div className="flex gap-2 mt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onRetry}
                  className="bg-background"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  {messages.retry}
                </Button>
              </div>
            )}

            {showDetails && (
              <div className="mt-4 p-3 bg-muted rounded-md">
                <p className="text-sm font-medium mb-2">{messages.details}:</p>
                <ul className="text-xs space-y-1 text-muted-foreground">
                  <li>
                    {messages.endpointTimeout
                      .replace("{endpoint}", details.endpoint)
                      .replace(
                        "{duration}",
                        formatDuration(details.timeoutDuration),
                      )}
                  </li>
                  <li>
                    {messages.detailsElapsed.replace(
                      "{elapsed}",
                      formatDuration(details.elapsedTime),
                    )}
                  </li>
                  <li>
                    {messages.detailsMethod.replace(
                      "{method}",
                      details.endpoint,
                    )}
                  </li>
                </ul>
              </div>
            )}

            <p className="text-xs text-muted-foreground mt-2">
              {messages.contactSupport}
            </p>
          </div>
        </AlertDescription>
      </div>

      {onDismiss && (
        <Button
          variant="ghost"
          size="sm"
          className="absolute top-2 right-2 h-6 w-6 p-0"
          onClick={onDismiss}
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </Alert>
  );
}

/**
 * Simple timeout message variant without actions
 *
 * @example
 * ```tsx
 * <TimeoutErrorMessage.Simple error={timeoutError} locale="vi" />
 * ```
 */
TimeoutErrorMessage.Simple = function SimpleTimeoutErrorMessage({
  error,
  locale = "en",
  className = "",
}: Pick<TimeoutErrorMessageProps, "error" | "locale" | "className">) {
  const details = formatErrorDetails(error, locale);
  const messages = getLocalizedMessages(locale);

  return (
    <Alert variant="destructive" className={className}>
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>{details.title}</AlertTitle>
      <AlertDescription>{details.message}</AlertDescription>
    </Alert>
  );
};

/**
 * Compact inline timeout message
 *
 * @example
 * ```tsx
 * <TimeoutErrorMessage.Inline error={timeoutError} onRetry={retry} />
 * ```
 */
TimeoutErrorMessage.Inline = function InlineTimeoutErrorMessage({
  error,
  locale = "en",
  onRetry,
  className = "",
}: Pick<
  TimeoutErrorMessageProps,
  "error" | "locale" | "onRetry" | "className"
>) {
  const details = formatErrorDetails(error, locale);
  const canRetry = isRetryableTimeoutError(error) && onRetry;
  const messages = getLocalizedMessages(locale);

  return (
    <div
      className={`flex items-center gap-2 text-sm text-destructive ${className}`}
    >
      <AlertCircle className="h-4 w-4 flex-shrink-0" />
      <span className="flex-1">{details.message}</span>
      {canRetry && (
        <Button
          variant="link"
          size="sm"
          className="h-auto p-0 text-destructive"
          onClick={onRetry}
        >
          {messages.retry}
        </Button>
      )}
    </div>
  );
};

/**
 * Gets localized messages for the timeout error
 */
function getLocalizedMessages(locale: "en" | "vi") {
  if (locale === "vi") {
    return {
      retry: "Thử lại",
      details: "Chi tiết",
      contactSupport: "Nếu vấn đề vẫn tiếp diễn, vui lòng liên hệ hỗ trợ.",
      endpointTimeout: "Yêu cầu tới {endpoint} hết thời gian sau {duration}",
      detailsElapsed: "Thời gian đã trôi qua: {elapsed}",
      detailsMethod: "Phương thức: {method}",
    };
  }

  return {
    retry: "Retry",
    details: "Details",
    contactSupport: "If the problem persists, please contact support.",
    endpointTimeout: "Request to {endpoint} timed out after {duration}",
    detailsElapsed: "Time elapsed: {elapsed}",
    detailsMethod: "Method: {method}",
  };
}

export default TimeoutErrorMessage;
