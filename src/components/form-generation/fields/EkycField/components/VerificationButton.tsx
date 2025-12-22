/**
 * Verification Button Component
 *
 * Renders the verification button with appropriate states and styling.
 */

import React from "react";
import type { EkycFieldConfig } from "@/components/form-generation/types";
import type { VerificationResult } from "@/lib/verification/types";

interface VerificationButtonProps {
  onStart: () => void;
  isVerifying: boolean;
  result: VerificationResult | null;
  disabled?: boolean;
  config: EkycFieldConfig;
  compact?: boolean;
}

export function VerificationButton({
  onStart,
  isVerifying,
  result,
  disabled,
  config,
  compact,
}: VerificationButtonProps) {
  // Don't show button if already verified
  if (result && result.success) {
    if (compact) {
      return null;
    }

    return (
      <div className="flex items-center space-x-2 p-3 bg-green-50 border border-green-200 rounded-lg">
        <svg
          className="w-5 h-5 text-green-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <span className="text-green-800 font-medium">Identity Verified</span>
        <span className="text-green-600 text-sm">
          (Confidence: {result.verificationData.confidence}%)
        </span>
      </div>
    );
  }

  const buttonText = config.verification?.buttonText || "Verify Identity";
  const isDisabled = disabled || isVerifying;

  return (
    <>
      {/* Screen reader announcement for accessibility */}
      {isVerifying && (
        <div role="status" aria-live="polite" className="sr-only">
          Verifying identity, please wait
        </div>
      )}

      <button
        type="button"
        onClick={onStart}
        disabled={isDisabled}
        className={`
          inline-flex items-center justify-center border border-transparent
          text-sm font-medium rounded-md shadow-sm focus:outline-none focus:ring-2
          focus:ring-offset-2 transition-colors duration-200
          ${compact ? "px-3 py-1.5 text-xs" : "px-4 py-2"}
          ${
            isDisabled
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500"
          }
        `}
      >
        {isVerifying ? (
          <>
            <svg
              className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth={4}
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Verifying...
          </>
        ) : (
          <>
            <svg
              className="mr-2 h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4"
              />
            </svg>
            {buttonText}
          </>
        )}
      </button>
    </>
  );
}
