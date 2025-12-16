/**
 * Verification Inline Component
 *
 * Inline verification component embedded directly in the form.
 */

import React from "react";
import type { EkycFieldConfig } from "@/components/form-generation/types";
import type {
  VerificationResult,
  VerificationStatus,
} from "@/lib/verification/types";

interface VerificationInlineProps {
  onStart: () => void;
  onRetry: () => void;
  onCancel: () => void;
  isVerifying: boolean;
  status: VerificationStatus;
  result: VerificationResult | null;
  error: string | null;
  disabled?: boolean;
  config: EkycFieldConfig;
}

export function VerificationInline({
  onStart,
  onRetry,
  onCancel,
  isVerifying,
  status,
  result,
  error,
  disabled,
  config,
}: VerificationInlineProps) {
  // If already verified, show result
  if (result && result.success) {
    return (
      <div className="border border-green-200 bg-green-50 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <svg
              className="w-5 h-5 text-green-600 mr-2"
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
            <span className="text-green-800 font-medium">
              Identity Verified
            </span>
            <span className="text-green-600 ml-2 text-sm">
              ({result.verificationData.confidence}% confidence)
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error || (result && !result.success)) {
    return (
      <div className="border border-red-200 bg-red-50 rounded-lg p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start">
            <svg
              className="w-5 h-5 text-red-600 mt-0.5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div>
              <p className="text-red-800 font-medium">Verification Failed</p>
              <p className="text-red-700 text-sm mt-1">
                {error || result?.error?.message || "Unable to verify identity"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onRetry}
            disabled={disabled}
            className="text-sm text-red-600 hover:text-red-700 font-medium disabled:opacity-50"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Show verifying state
  if (isVerifying) {
    return (
      <div className="border border-blue-200 bg-blue-50 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-3"></div>
            <div>
              <p className="text-blue-800 font-medium">Verifying Identity</p>
              <p className="text-blue-700 text-sm mt-1">
                {status === "initializing" && "Initializing verification..."}
                {status === "processing" && "Processing documents..."}
                {status === "processing" &&
                  config.verification?.uiConfig?.showProgress && (
                    <span className="ml-2">
                      Please follow the instructions on your screen
                    </span>
                  )}
              </p>
            </div>
          </div>
          {config.verification?.uiConfig?.allowRetry && (
            <button
              type="button"
              onClick={onCancel}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Cancel
            </button>
          )}
        </div>

        {/* Progress Steps (Optional) */}
        {config.verification?.uiConfig?.showProgress && (
          <div className="mt-4">
            <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
              <span>Upload Document</span>
              <span>Face Capture</span>
              <span>Verification</span>
            </div>
            <div className="w-full bg-blue-100 rounded-full h-1.5">
              <div
                className="bg-blue-600 h-1.5 rounded-full transition-all duration-500"
                style={{
                  width:
                    status === "initializing"
                      ? "33%"
                      : status === "processing"
                        ? "66%"
                        : "100%",
                }}
              />
            </div>
          </div>
        )}
      </div>
    );
  }

  // Show initial/start state
  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mr-3">
            <svg
              className="w-6 h-6 text-gray-600"
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
          </div>
          <div>
            <p className="font-medium text-gray-900">Verify Your Identity</p>
            <p className="text-sm text-gray-500 mt-0.5">
              Quick and secure verification using your ID document
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onStart}
          disabled={disabled}
          className={`
            px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200
            ${
              disabled
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            }
          `}
        >
          Start Verification
        </button>
      </div>

      {/* Document Type Info */}
      {config.verification?.providerOptions?.documentType && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <p className="text-xs text-gray-500">
            Document type:{" "}
            <span className="font-medium text-gray-700">
              {config.verification.providerOptions.documentType}
            </span>
          </p>
          {config.verification?.providerOptions?.flowType && (
            <p className="text-xs text-gray-500 mt-1">
              Verification flow:{" "}
              <span className="font-medium text-gray-700">
                {config.verification.providerOptions.flowType.replace(
                  /_/g,
                  " ",
                )}
              </span>
            </p>
          )}
        </div>
      )}

      {/* Security Badge */}
      <div className="mt-3 flex items-center text-xs text-gray-500">
        <svg
          className="w-3 h-3 text-green-500 mr-1"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
            clipRule="evenodd"
          />
        </svg>
        <span>Secured with AES-256 encryption</span>
      </div>
    </div>
  );
}
