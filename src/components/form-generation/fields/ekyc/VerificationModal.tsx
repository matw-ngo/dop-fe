/**
 * Verification Modal Component
 *
 * Modal wrapper for eKYC verification process using Radix UI Dialog.
 */

import React, { useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogHeader,
} from "@/components/ui/dialog";
import type { EkycFieldConfig } from "@/components/form-generation/types";
import type { VerificationResult } from "@/lib/verification/types";

interface VerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerify: () => void;
  isVerifying: boolean;
  result: VerificationResult | null;
  error: string | null;
  onRetry: () => void;
  config: EkycFieldConfig;
}

export function VerificationModal({
  isOpen,
  onClose,
  onVerify,
  isVerifying,
  result,
  error,
  onRetry,
  config,
}: VerificationModalProps) {
  // Start verification when modal opens
  useEffect(() => {
    if (isOpen && !isVerifying && !result && !error) {
      onVerify();
    }
  }, [isOpen, isVerifying, result, error, onVerify]);

  const modalSize = config.verification?.modalConfig?.size || "md";
  const closeOnOverlayClick =
    config.verification?.modalConfig?.closeOnOverlayClick ?? true;

  const sizeMapping = {
    sm: "sm" as const,
    md: "lg" as const,
    lg: "xl" as const,
    xl: "full" as const,
  };

  const dialogSize = sizeMapping[modalSize] || "md";

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open && !isVerifying && closeOnOverlayClick) {
          onClose();
        }
      }}
    >
      <DialogContent
        size={dialogSize}
        showCloseButton={!isVerifying}
        onPointerDownOutside={(e) => {
          if (isVerifying || !closeOnOverlayClick) {
            e.preventDefault();
          }
        }}
        onEscapeKeyDown={(e) => {
          if (isVerifying) {
            e.preventDefault();
          }
        }}
        className="p-0"
      >
        {/* Header */}
        <DialogHeader className="border-b border-gray-200 px-6 py-4">
          <DialogTitle className="text-lg font-semibold text-gray-900">
            {config.verification?.modalConfig?.title || "Identity Verification"}
          </DialogTitle>
        </DialogHeader>

        {/* Content */}
        <div className="px-6 py-4">
          {/* Instructions */}
          {!isVerifying && !result && !error && (
            <div className="text-center py-8">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 mb-4">
                <svg
                  className="h-6 w-6 text-blue-600"
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
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Verifying your identity
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                Please prepare your ID document and ensure you're in a well-lit
                area
              </p>
              <div className="space-y-2 text-left text-sm text-gray-600 max-w-sm mx-auto">
                <div className="flex items-center">
                  <svg
                    className="h-4 w-4 text-green-500 mr-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Valid government-issued ID
                </div>
                <div className="flex items-center">
                  <svg
                    className="h-4 w-4 text-green-500 mr-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Good lighting conditions
                </div>
                <div className="flex items-center">
                  <svg
                    className="h-4 w-4 text-green-500 mr-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Stable internet connection
                </div>
              </div>
            </div>
          )}

          {/* Loading State */}
          {isVerifying && (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                <svg
                  className="animate-spin h-8 w-8 text-blue-600"
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
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Verification in progress
              </h3>
              <p className="text-sm text-gray-500">
                Please follow the instructions on your screen
              </p>
            </div>
          )}

          {/* Success State */}
          {result && result.success && (
            <div className="text-center py-8">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                <svg
                  className="h-6 w-6 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Verification Successful!
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                Your identity has been verified with{" "}
                {result.verificationData.confidence}% confidence
              </p>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Continue
              </button>
            </div>
          )}

          {/* Error State */}
          {(error || (result && !result.success)) && (
            <div className="text-center py-8">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <svg
                  className="h-6 w-6 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Verification Failed
              </h3>
              <p className="text-sm text-gray-500 mb-6">
                {error ||
                  result?.error?.message ||
                  "Unable to verify identity. Please try again."}
              </p>
              <div className="flex justify-center space-x-3">
                <button
                  type="button"
                  onClick={onRetry}
                  className="px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Try Again
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 bg-gray-200 text-gray-800 font-medium rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
