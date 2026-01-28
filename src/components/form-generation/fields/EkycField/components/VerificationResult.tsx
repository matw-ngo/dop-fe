/**
 * Verification Result Component
 *
 * Displays the verification result with confidence scores and extracted data.
 */

import { useState } from "react";
import type { VerificationResult } from "@/lib/verification/types";

interface VerificationResultProps {
  result: VerificationResult;
  showDetails?: boolean;
  onEdit?: () => void;
  variant?: "full" | "compact";
}

export function VerificationResult({
  result,
  showDetails = false,
  onEdit,
  variant = "full",
}: VerificationResultProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!result.success) {
    if (variant === "compact") {
      return (
        <div className="flex items-center text-red-600 text-sm truncate">
          <svg
            className="w-4 h-4 mr-1.5 flex-shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span className="truncate">Verification Failed</span>
        </div>
      );
    }

    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <div className="flex items-start">
          <svg
            className="w-5 h-5 text-red-600 mt-0.5"
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
          <div className="ml-3 flex-1">
            <h3 className="text-sm font-medium text-red-800">
              Verification Failed
            </h3>
            <p className="mt-1 text-sm text-red-700">
              {result.error?.message ||
                "Unable to verify identity. Please try again."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const { personalData, verificationData } = result;

  if (variant === "compact") {
    return (
      <div className="flex items-center justify-between w-full pr-2">
        <div className="flex items-center text-green-600 text-sm truncate">
          <svg
            className="w-4 h-4 mr-1.5 flex-shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
          <span className="truncate">
            {personalData.fullName || "Verified"}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-4 bg-green-50 border-b border-green-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
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
            <span className="ml-2 text-green-800 font-medium">
              Identity Verified Successfully
            </span>
          </div>
          {onEdit && (
            <button
              onClick={onEdit}
              className="text-sm text-green-600 hover:text-green-700 font-medium"
            >
              Edit
            </button>
          )}
        </div>

        {/* Confidence Score */}
        <div className="mt-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Confidence Score</span>
            <span className="font-medium text-gray-900">
              {verificationData.confidence}%
            </span>
          </div>
          <div className="mt-1 w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-300 ${
                verificationData.confidence >= 90
                  ? "bg-green-600"
                  : verificationData.confidence >= 70
                    ? "bg-yellow-500"
                    : "bg-red-500"
              }`}
              style={{ width: `${verificationData.confidence}%` }}
            />
          </div>
        </div>
      </div>

      {/* Extracted Data */}
      <div className="p-4">
        <h4 className="text-sm font-medium text-gray-900 mb-3">
          Verified Information
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {personalData.fullName && (
            <div>
              <label className="text-xs text-gray-500">Full Name</label>
              <p className="text-sm font-medium text-gray-900">
                {personalData.fullName}
              </p>
            </div>
          )}

          {personalData.idNumber && (
            <div>
              <label className="text-xs text-gray-500">ID Number</label>
              <p className="text-sm font-medium text-gray-900">
                {personalData.idNumber}
              </p>
            </div>
          )}

          {personalData.dateOfBirth && (
            <div>
              <label className="text-xs text-gray-500">Date of Birth</label>
              <p className="text-sm font-medium text-gray-900">
                {personalData.dateOfBirth}
              </p>
            </div>
          )}

          {personalData.gender && (
            <div>
              <label className="text-xs text-gray-500">Gender</label>
              <p className="text-sm font-medium text-gray-900 capitalize">
                {personalData.gender}
              </p>
            </div>
          )}

          {personalData.address?.fullAddress && (
            <div className="md:col-span-2">
              <label className="text-xs text-gray-500">Address</label>
              <p className="text-sm font-medium text-gray-900">
                {personalData.address.fullAddress}
              </p>
            </div>
          )}

          {personalData.documentType && (
            <div>
              <label className="text-xs text-gray-500">Document Type</label>
              <p className="text-sm font-medium text-gray-900">
                {personalData.documentType}
              </p>
            </div>
          )}

          {personalData.issuedDate && (
            <div>
              <label className="text-xs text-gray-500">Issue Date</label>
              <p className="text-sm font-medium text-gray-900">
                {personalData.issuedDate}
              </p>
            </div>
          )}
        </div>

        {/* Show Details Toggle */}
        {showDetails && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="mt-4 text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            {isExpanded ? "Hide" : "Show"} Technical Details
          </button>
        )}

        {/* Technical Details */}
        {showDetails && isExpanded && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <h5 className="text-sm font-medium text-gray-900 mb-3">
              Verification Details
            </h5>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              {verificationData.livenessScore !== undefined && (
                <div>
                  <label className="text-xs text-gray-500">
                    Liveness Score
                  </label>
                  <div className="flex items-center mt-1">
                    <div className="flex-1 bg-gray-200 rounded-full h-1.5 mr-2">
                      <div
                        className="bg-blue-600 h-1.5 rounded-full"
                        style={{ width: `${verificationData.livenessScore}%` }}
                      />
                    </div>
                    <span className="text-gray-900">
                      {verificationData.livenessScore}%
                    </span>
                  </div>
                </div>
              )}

              {verificationData.faceMatchScore !== undefined && (
                <div>
                  <label className="text-xs text-gray-500">
                    Face Match Score
                  </label>
                  <div className="flex items-center mt-1">
                    <div className="flex-1 bg-gray-200 rounded-full h-1.5 mr-2">
                      <div
                        className="bg-purple-600 h-1.5 rounded-full"
                        style={{ width: `${verificationData.faceMatchScore}%` }}
                      />
                    </div>
                    <span className="text-gray-900">
                      {verificationData.faceMatchScore}%
                    </span>
                  </div>
                </div>
              )}

              {verificationData.documentQuality !== undefined && (
                <div>
                  <label className="text-xs text-gray-500">
                    Document Quality
                  </label>
                  <div className="flex items-center mt-1">
                    <div className="flex-1 bg-gray-200 rounded-full h-1.5 mr-2">
                      <div
                        className="bg-green-600 h-1.5 rounded-full"
                        style={{
                          width: `${verificationData.documentQuality}%`,
                        }}
                      />
                    </div>
                    <span className="text-gray-900">
                      {verificationData.documentQuality}%
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Fraud Detection */}
            {verificationData.fraudDetection && (
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <label className="text-xs text-gray-500">
                  Authenticity Check
                </label>
                <div className="mt-2 space-y-1">
                  <div className="flex items-center text-sm">
                    <svg
                      className={`w-4 h-4 mr-2 ${
                        verificationData.fraudDetection.isAuthentic
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span
                      className={
                        verificationData.fraudDetection.isAuthentic
                          ? "text-green-800"
                          : "text-red-800"
                      }
                    >
                      Document appears{" "}
                      {verificationData.fraudDetection.isAuthentic
                        ? "authentic"
                        : "suspicious"}
                    </span>
                  </div>

                  {verificationData.fraudDetection.riskScore > 0 && (
                    <div className="flex items-center text-sm">
                      <span className="text-gray-600">Risk Score: </span>
                      <span
                        className={`ml-1 font-medium ${
                          verificationData.fraudDetection.riskScore > 50
                            ? "text-red-600"
                            : "text-yellow-600"
                        }`}
                      >
                        {verificationData.fraudDetection.riskScore}/100
                      </span>
                    </div>
                  )}

                  {verificationData.fraudDetection.warnings.length > 0 && (
                    <div className="mt-2">
                      <p className="text-xs text-gray-500 mb-1">Warnings:</p>
                      <ul className="text-xs text-yellow-700 space-y-0.5">
                        {verificationData.fraudDetection.warnings.map(
                          (warning, index) => (
                            <li key={index} className="flex items-start">
                              <span className="mr-1">•</span>
                              <span>{warning}</span>
                            </li>
                          ),
                        )}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Processing Info */}
            <div className="mt-4 text-xs text-gray-500">
              <p>Session ID: {result.sessionId}</p>
              <p>
                Provider: {result.provider.name} v{result.provider.version}
              </p>
              <p>
                Processing Time:{" "}
                {(result.processing.totalDuration / 1000).toFixed(2)}s
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
