/**
 * eKYC Field Component
 *
 * Electronic Know Your Customer (eKYC) verification field that supports multiple
 * rendering modes and integrates with verification providers. Handles the complete
 * verification workflow including initialization, processing, result handling, and
 * autofill of form fields based on verification data.
 *
 * **Features:**
 * - Multiple render modes: button, modal, inline, custom
 * - Integration with verification providers (VNPT, etc.)
 * - Autofill support for mapped form fields
 * - Confidence threshold validation
 * - Retry mechanism with configurable limits
 * - Progress indication and status tracking
 * - Error handling with user feedback
 *
 * **Render Modes:**
 * - **button**: Shows a verification button (default)
 * - **modal**: Opens modal interface for verification
 * - **inline**: Shows inline verification interface
 * - **custom**: Uses custom render function
 *
 * @example
 * ```tsx
 * // Basic eKYC field with button mode
 * <EkycField
 *   field={{
 *     id: 'ekyc',
 *     name: 'ekyc',
 *     type: 'ekyc',
 *     label: 'Identity Verification',
 *     verification: {
 *       provider: 'vnpt',
 *       confidenceThreshold: 70,
 *       autofillMapping: {
 *         'fullName': 'fullName',
 *         'idNumber': 'idCard.number',
 *         'address': 'address.full'
 *       },
 *       showResultPreview: true,
 *       allowManualOverride: false,
 *       uiConfig: {
 *         maxRetries: 3,
 *         showProgress: true
 *       }
 *     }
 *   }}
 *   value={ekycData}
 *   onChange={setEkycData}
 * />
 *
 * // Modal mode with custom configuration
 * <EkycField
 *   field={{
 *     id: 'ekyc-modal',
 *     name: 'ekyc',
 *     type: 'ekyc',
 *     label: 'Verify Identity',
 *     renderMode: 'modal',
 *     verification: {
 *       provider: 'vnpt',
 *       providerOptions: {
 *         environment: 'production'
 *       }
 *     }
 *   }}
 *   value={ekycData}
 *   onChange={setEkycData}
 * />
 *
 * // Custom render mode
 * <EkycField
 *   field={{
 *     id: 'custom-ekyc',
 *     name: 'ekyc',
 *     type: 'ekyc',
 *     renderMode: 'custom',
 *     customRender: ({ status, result, startVerification }) => (
 *       <div className="custom-ekyc">
 *         {status === 'success' ? (
 *           <p>Verified! Confidence: {result?.confidence}%</p>
 *         ) : (
 *           <button onClick={startVerification}>Start Verification</button>
 *         )}
 *       </div>
 *     )
 *   }}
 *   value={ekycData}
 *   onChange={setEkycData}
 * />
 * ```
 */

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useFormContext } from "@/components/form-generation/context/FormContext";
import { useFormTheme } from "@/components/form-generation/themes/ThemeProvider";
import type {
  EkycFieldConfig,
  FieldComponentProps,
} from "@/components/form-generation/types";
import { verificationManager } from "@/lib/verification/manager";
import { VNPTVerificationProvider } from "@/lib/verification/providers/vnpt-provider";
import {
  type EkycRenderProps,
  type VerificationResult,
  VerificationStatus,
} from "@/lib/verification/types";
import { cn } from "@/components/form-generation/utils/helpers";

// Import sub-components
import { VerificationButton } from "./ekyc/VerificationButton";
import { VerificationInline } from "./ekyc/VerificationInline";
import { VerificationModal } from "./ekyc/VerificationModal";
import { VerificationResult as ResultDisplay } from "./ekyc/VerificationResult";

// ============================================================================
// Main EkycField Component
// ============================================================================

// EkycField uses standard FieldComponentProps
export type EkycFieldProps = FieldComponentProps<any>;

// TODO: Improve UI consistency and theme integration to match TextField/SelectField implementation
export function EkycField({
  field,
  value,
  onChange,
  error,
  disabled,
}: EkycFieldProps) {
  // Form context is optional - only needed for autofill functionality
  let formData: Record<string, any> = {};
  let setFieldValue: ((fieldId: string, value: any) => void) | undefined;

  try {
    const context = useFormContext();
    formData = context.formData;
    setFieldValue = context.setFieldValue;
  } catch (e) {
    // FormContext not available - autofill won't work but field will still function
  }

  const { theme } = useFormTheme();
  const ekycField = field as EkycFieldConfig;
  const internalLabel = theme.fieldOptions?.internalLabel;

  // Component state
  const [isVerifying, setIsVerifying] = useState(false);
  const [status, setStatus] = useState<VerificationStatus>(
    VerificationStatus.IDLE,
  );
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [currentError, setCurrentError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [showModal, setShowModal] = useState(false);

  // Get variant (default to 'button')
  const variant = ekycField.variant || "button";

  // Base wrapper styles - consistent across all variants
  const baseWrapperStyles = ["w-full", "transition-all", "duration-200"];

  // Theme-specific wrapper styles
  const themeWrapperStyles = [
    `border-[${theme.colors.border}]`,
    `bg-[${theme.colors.background}]`,
    // Focus within (for wrapper)
    `focus-within:border-[${theme.colors.borderFocus}]`,
    "focus-within:ring-2",
    theme.focusRing
      ? `focus-within:ring-[${theme.focusRing.color}]/${theme.focusRing.opacity}`
      : `focus-within:ring-[${theme.colors.primary}]/20`,
    // Error state
    error && `border-[${theme.colors.error}]`,
    error && `focus-within:ring-[${theme.colors.error}]/20`,
    // Disabled state
    disabled && `!bg-[${theme.colors.disabled}]`,
  ].filter(Boolean);

  // Variant-specific styles
  const variantStyles = {
    button: [
      "border",
      "rounded-[8px]",
      internalLabel ? "min-h-[60px]" : "h-[60px]",
      "px-4",
      internalLabel ? "py-3" : "py-0",
    ],
    compact: ["border", "rounded-md", "h-10", "px-3"],
    card: ["border-2", "rounded-lg", "p-4", "shadow-sm", "hover:shadow-md"],
    "inline-status": ["border-0", "h-auto", "p-0"],
  };

  // Combined wrapper classes
  const wrapperClassName = cn(
    ...baseWrapperStyles,
    ...themeWrapperStyles,
    ...variantStyles[variant],
  );

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
  }, [field, isVerifying, disabled, onChange]);

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

  // Render based on mode
  if (ekycField.renderMode === "custom" && ekycField.customRender) {
    return (
      <div className="ekyc-field-custom">
        {ekycField.customRender(renderProps)}
      </div>
    );
  }

  // Render modal mode
  if (ekycField.renderMode === "modal") {
    return (
      <div className={cn("ekyc-field-modal", error && "space-y-2")}>
        <VerificationButton
          onStart={handleVerify}
          isVerifying={isVerifying}
          result={result}
          disabled={disabled}
          config={ekycField}
        />

        <VerificationModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          onVerify={handleVerify}
          isVerifying={isVerifying}
          result={result}
          error={currentError}
          onRetry={handleRetry}
          config={ekycField}
        />
      </div>
    );
  }

  // Render inline mode
  if (ekycField.renderMode === "inline") {
    return (
      <div className={cn("ekyc-field-inline", error && "space-y-2")}>
        <VerificationInline
          onStart={handleVerify}
          onRetry={handleRetry}
          onCancel={handleCancel}
          isVerifying={isVerifying}
          status={status}
          result={result}
          error={currentError}
          disabled={disabled}
          config={ekycField}
        />
      </div>
    );
  }

  // Default: button mode
  if (internalLabel && field.label) {
    return (
      <div className={cn("relative w-full", error && "space-y-2")}>
        {/* Internal Label */}
        <label
          htmlFor={field.id}
          className={cn(
            "absolute top-2 left-4 text-xs font-medium pointer-events-none z-10",
            `text-[${theme.colors.primary}]`,
          )}
        >
          {field.label}
        </label>
        <div className="pt-8">
          <VerificationButton
            onStart={handleVerify}
            isVerifying={isVerifying}
            result={result}
            disabled={disabled}
            config={ekycField}
          />

          {/* Show result preview if enabled */}
          {result && ekycField.verification?.showResultPreview && (
            <ResultDisplay
              result={result}
              showDetails={ekycField.verification?.showResultPreview}
              onEdit={
                ekycField.verification?.allowManualOverride
                  ? () => {}
                  : undefined
              }
            />
          )}

          {/* Show error */}
          {currentError && (
            <div
              className={cn(
                "flex items-start gap-2 text-sm mt-1.5",
                `text-[${theme.colors.error}]`,
              )}
            >
              {currentError}
              {retryCount <
                (ekycField.verification?.uiConfig?.maxRetries || 3) && (
                <button
                  type="button"
                  onClick={handleRetry}
                  className={cn(
                    "underline ml-2",
                    "hover:opacity-80",
                    "focus:outline-none focus:ring-2 focus:ring-offset-2 rounded",
                    theme.focusRing
                      ? `focus:ring-[${theme.focusRing.color}]/${theme.focusRing.opacity}`
                      : `focus:ring-[${theme.colors.primary}]/20`,
                  )}
                  disabled={isVerifying}
                >
                  Retry
                </button>
              )}
            </div>
          )}

          {/* Show status indicator */}
          {isVerifying && ekycField.verification?.uiConfig?.showProgress && (
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <div
                className={cn(
                  "animate-spin rounded-full h-4 w-4 border-b-2",
                  `border-[${theme.colors.primary}]`,
                )}
              ></div>
              <span>Verifying identity...</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Default: button mode without internal label
  return (
    <div className={cn("ekyc-field-button", error && "space-y-2")}>
      <VerificationButton
        onStart={handleVerify}
        isVerifying={isVerifying}
        result={result}
        disabled={disabled}
        config={ekycField}
      />

      {/* Show result preview if enabled */}
      {result && ekycField.verification?.showResultPreview && (
        <ResultDisplay
          result={result}
          showDetails={ekycField.verification?.showResultPreview}
          onEdit={
            ekycField.verification?.allowManualOverride ? () => {} : undefined
          }
        />
      )}

      {/* Show error */}
      {currentError && (
        <div
          className={cn(
            "flex items-start gap-2 text-sm mt-1.5",
            `text-[${theme.colors.error}]`,
          )}
        >
          {currentError}
          {retryCount < (ekycField.verification?.uiConfig?.maxRetries || 3) && (
            <button
              type="button"
              onClick={handleRetry}
              className={cn(
                "underline ml-2",
                "hover:opacity-80",
                "focus:outline-none focus:ring-2 focus:ring-offset-2 rounded",
                theme.focusRing
                  ? `focus:ring-[${theme.focusRing.color}]/${theme.focusRing.opacity}`
                  : `focus:ring-[${theme.colors.primary}]/20`,
              )}
              disabled={isVerifying}
            >
              Retry
            </button>
          )}
        </div>
      )}

      {/* Show status indicator */}
      {isVerifying && ekycField.verification?.uiConfig?.showProgress && (
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <div
            className={cn(
              "animate-spin rounded-full h-4 w-4 border-b-2",
              `border-[${theme.colors.primary}]`,
            )}
          ></div>
          <span>Verifying identity...</span>
        </div>
      )}
    </div>
  );
}

// Export as default
export default EkycField;
