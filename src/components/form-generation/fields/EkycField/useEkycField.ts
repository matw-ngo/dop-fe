import { useCallback, useEffect, useMemo, useState } from "react";
import { useFormContext } from "../../context/FormContext";
import type { EkycFieldConfig, EkycFieldProps } from "../../types";
import { verificationManager } from "@/lib/verification/manager";
import { VNPTVerificationProvider } from "@/lib/verification/providers/vnpt-provider";
import {
  type EkycRenderProps,
  type VerificationResult,
  VerificationStatus,
} from "@/lib/verification/types";

export function useEkycField({
  field,
  value,
  onChange,
  disabled,
}: EkycFieldProps) {
  const ekycField = field as EkycFieldConfig;

  // Form context is optional - only needed for autofill functionality
  let setFieldValue: ((fieldId: string, value: any) => void) | undefined;

  try {
    const context = useFormContext();
    setFieldValue = context.setFieldValue;
  } catch (e) {
    // FormContext not available
  }

  // Component state
  const [isVerifying, setIsVerifying] = useState(false);
  const [status, setStatus] = useState<VerificationStatus>(
    VerificationStatus.IDLE,
  );
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [currentError, setCurrentError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [showModal, setShowModal] = useState(false);

  // Initialize provider on mount
  useEffect(() => {
    const initializeProvider = async () => {
      try {
        const provider = new VNPTVerificationProvider();
        await verificationManager.registerProvider(
          ekycField.verification?.provider || "vnpt",
          provider,
          {
            environment: "production",
            language: "vi",
          },
          true,
        );
      } catch (error) {
        console.error("Failed to initialize eKYC provider:", error);
        setCurrentError(
          error instanceof Error
            ? error.message
            : "Provider initialization failed",
        );
      }
    };

    initializeProvider();
  }, [ekycField.verification?.provider]);

  // Restore result from form value if exists
  useEffect(() => {
    if (value && value.sessionId && !result) {
      // Try to restore result from verification manager
      verificationManager
        .getResult(value.sessionId)
        .then(setResult)
        .catch(() => {
          // Result not found or expired
          if (onChange) {
            onChange(null);
          }
        });
    }
  }, [value, result, onChange]);

  // Trigger autofill for mapped fields
  const triggerAutofill = useCallback(
    (verificationResult: VerificationResult) => {
      if (!ekycField.verification?.autofillMapping) return;

      const mapping = ekycField.verification.autofillMapping;

      for (const [targetFieldId, sourcePath] of Object.entries(mapping)) {
        let value: any;

        // Extract value from verification result using the path
        if (typeof sourcePath === "string") {
          // Handle nested paths like "address.city"
          const pathParts = sourcePath.split(".");
          let current: any = verificationResult.personalData;

          for (const part of pathParts) {
            if (current && typeof current === "object" && part in current) {
              current = current[part];
            } else {
              current = undefined;
              break;
            }
          }

          value = current;
        } else {
          // Direct key access
          value = (verificationResult.personalData as any)[sourcePath];
        }

        // Update form field
        if (value !== undefined && setFieldValue) {
          setFieldValue(targetFieldId, value);
        }
      }
    },
    [ekycField.verification?.autofillMapping, setFieldValue],
  );

  // Handle verification start
  const handleVerify = useCallback(async () => {
    if (!ekycField.verification || isVerifying || disabled) {
      return;
    }

    setIsVerifying(true);
    setStatus(VerificationStatus.INITIALIZING);
    setCurrentError(null);

    try {
      // Open modal if using modal mode
      if (ekycField.renderMode === "modal") {
        setShowModal(true);
      }

      // Start verification
      const session = await verificationManager.verify(
        ekycField.verification.provider,
        ekycField.verification.providerOptions || {},
      );

      setStatus(VerificationStatus.PROCESSING);

      // Wait for result
      const verificationResult = await verificationManager.getResult(
        session.id,
      );

      // Update state
      setResult(verificationResult);
      setStatus(
        verificationResult.success
          ? VerificationStatus.SUCCESS
          : VerificationStatus.ERROR,
      );

      // Check confidence threshold
      const confidenceThreshold =
        ekycField.verification.confidenceThreshold || 70;
      if (
        verificationResult.verificationData.confidence < confidenceThreshold
      ) {
        setCurrentError(
          `Low confidence score: ${verificationResult.verificationData.confidence}%. Please try again.`,
        );
        setStatus(VerificationStatus.ERROR);
        return;
      }

      // Update field value
      if (onChange) {
        onChange({
          verified: verificationResult.success,
          sessionId: verificationResult.sessionId,
          confidence: verificationResult.verificationData.confidence,
          verifiedAt: verificationResult.completedAt,
        });
      }

      // Trigger autofill
      if (
        verificationResult.success &&
        ekycField.verification.autofillMapping
      ) {
        triggerAutofill(verificationResult);
      }

      // Call success callback
      ekycField.verification.onVerified?.(verificationResult);

      // Close modal if open
      if (ekycField.renderMode === "modal") {
        setTimeout(() => setShowModal(false), 2000); // Keep open briefly to show result
      }
    } catch (error) {
      console.error("Verification failed:", error);
      setStatus(VerificationStatus.ERROR);
      setCurrentError(
        error instanceof Error ? error.message : "Verification failed",
      );
      ekycField.verification.onError?.(
        error instanceof Error ? error : new Error("Verification failed"),
      );
    } finally {
      setIsVerifying(false);
    }
  }, [
    field,
    isVerifying,
    disabled,
    onChange,
    ekycField.renderMode,
    ekycField.verification,
    triggerAutofill,
  ]);

  // Handle retry
  const handleRetry = useCallback(() => {
    setRetryCount((prev) => prev + 1);
    setCurrentError(null);
    setResult(null);
    handleVerify();
  }, [handleVerify]);

  // Handle cancel
  const handleCancel = useCallback(async () => {
    if (isVerifying && value?.sessionId) {
      try {
        await verificationManager.cancel(value.sessionId);
        setIsVerifying(false);
        setStatus(VerificationStatus.CANCELLED);
      } catch (error) {
        console.error("Failed to cancel verification:", error);
      }
    }
  }, [isVerifying, value?.sessionId]);

  // Prepare render props for custom mode
  const renderProps: EkycRenderProps = useMemo(
    () => ({
      startVerification: handleVerify,
      status,
      result,
      isVerifying,
      error: currentError,
      retryCount,
      provider: ekycField.verification?.provider || "vnpt",
      triggerAutofill: () => result && triggerAutofill(result),
    }),
    [
      handleVerify,
      status,
      result,
      isVerifying,
      currentError,
      retryCount,
      ekycField.verification?.provider,
      triggerAutofill,
    ],
  );

  return {
    isVerifying,
    status,
    result,
    currentError,
    retryCount,
    showModal,
    setShowModal,
    handleVerify,
    handleRetry,
    handleCancel,
    renderProps,
  };
}
